<?php

namespace App\Services;

use App\Models\Comprobante;
use App\Models\Tenant;
use Greenter\Model\Client\Client;
use Greenter\Model\Company\Address;
use Greenter\Model\Company\Company;
use Greenter\Model\Sale\FormaPagos\FormaPagoContado;
use Greenter\Model\Sale\FormaPagos\FormaPagoCredito;
use Greenter\Model\Sale\Cuota;
use Greenter\Model\Sale\Invoice;
use Greenter\Model\Sale\Legend;
use Greenter\Model\Sale\Note;
use Greenter\Model\Sale\SaleDetail;
use Greenter\Model\Summary\Summary;
use Greenter\Model\Summary\SummaryDetail;
use Greenter\Report\XmlUtils;
use Illuminate\Support\Facades\Log;
use Greenter\See;
use Greenter\Ws\Services\ConsultCdrService;
use Greenter\Ws\Services\SoapClient as GreenterSoapClient;
use Greenter\Ws\Services\SunatEndpoints;
use Greenter\Ws\Services\WsdlProvider;

class SunatService
{
    private Tenant $tenant;
    private See $see;

    public function __construct(Tenant $tenant)
    {
        // OpenSSL 3.x bloquea SHA1 por defecto; esta config lo habilita para firma SUNAT
        putenv('OPENSSL_CONF=' . storage_path('app/openssl-sunat.cnf'));

        $this->tenant = $tenant;
        $this->see = $this->buildSee();
    }

    private function buildSee(): See
    {
        $see = new See();

        // Configurar certificado digital
        $certPath = storage_path(
            'app/private/' . config('sunat.cert_path') . '/' . $this->tenant->id . '/' . basename($this->tenant->certificado_pfx ?? '')
        );

        if ($this->tenant->certificado_pfx && file_exists($certPath)) {
            $see->setCertificate(
                $this->getCertificateFromPfx($certPath, $this->tenant->certificado_password)
            );
        }

        // Configurar credenciales SUNAT
        $see->setService($this->getEndpoint());
        $see->setCredentials(
            $this->tenant->ruc . $this->tenant->clave_sol_usuario,
            $this->tenant->clave_sol_password
        );

        return $see;
    }

    private function getCertificateFromPfx(string $pfxPath, ?string $password): string
    {
        $cnfPath = storage_path('app/openssl-sunat.cnf');

        // Escribir password en archivo temporal para no exponerla en CLI
        $tmpPass = tempnam(sys_get_temp_dir(), 'pfxpass_');
        file_put_contents($tmpPass, $password ?? '');

        $pfxEsc  = escapeshellarg($pfxPath);
        $tmpEsc  = escapeshellarg($tmpPass);
        $cnfEsc  = escapeshellarg($cnfPath);

        $certRaw = shell_exec("OPENSSL_CONF={$cnfEsc} openssl pkcs12 -in {$pfxEsc} -nokeys -legacy -passin file:{$tmpEsc} 2>/dev/null");
        $pkeyRaw = shell_exec("OPENSSL_CONF={$cnfEsc} openssl pkcs12 -in {$pfxEsc} -nocerts -nodes -legacy -passin file:{$tmpEsc} 2>/dev/null");

        unlink($tmpPass);

        if (empty($certRaw) || empty($pkeyRaw)) {
            throw new \RuntimeException('No se pudo leer el certificado PFX/P12. Verifica la contraseña.');
        }

        // Extraer solo el PRIMER certificado (end-entity), ignorar la cadena CA
        preg_match('/-----BEGIN CERTIFICATE-----.*?-----END CERTIFICATE-----/s', $certRaw, $certMatch);
        // Extraer solo la clave privada limpia
        preg_match('/-----BEGIN (?:ENCRYPTED )?PRIVATE KEY-----.*?-----END (?:ENCRYPTED )?PRIVATE KEY-----/s', $pkeyRaw, $pkeyMatch);

        if (empty($certMatch[0]) || empty($pkeyMatch[0])) {
            throw new \RuntimeException('No se pudo extraer el certificado o clave privada del PFX.');
        }

        return $certMatch[0] . "\n" . $pkeyMatch[0] . "\n";
    }

    private function getEndpoint(): string
    {
        if ($this->tenant->sunat_beta) {
            return SunatEndpoints::FE_BETA;
        }
        return SunatEndpoints::FE_PRODUCCION;
    }

    private function buildCompany(): Company
    {
        $address = (new Address())
            ->setUbigueo($this->tenant->ubigeo ?? '140101')
            ->setDepartamento($this->tenant->departamento ?? 'LAMBAYEQUE')
            ->setProvincia($this->tenant->provincia ?? 'CHICLAYO')
            ->setDistrito($this->tenant->distrito ?? 'CHICLAYO')
            ->setUrbanizacion('-')
            ->setDireccion($this->tenant->direccion);

        return (new Company())
            ->setRuc($this->tenant->ruc)
            ->setRazonSocial($this->tenant->razon_social)
            ->setNombreComercial($this->tenant->razon_social)
            ->setAddress($address);
    }

    private function buildClient(Comprobante $comprobante): Client
    {
        return (new Client())
            ->setTipoDoc($comprobante->cliente_tipo_doc)
            ->setNumDoc($comprobante->cliente_num_doc)
            ->setRznSocial($comprobante->cliente_razon_social);
    }

    public function enviarFactura(Comprobante $comprobante): array
    {
        $invoice = $this->buildInvoice($comprobante);

        // Generar XML y firmar
        $result = $this->see->send($invoice);

        if (!$result->isSuccess()) {
            $errorCode = $result->getError()->getCode();
            $errorMsg  = $result->getError()->getMessage();
            Log::error('SUNAT rechazó el envío', [
                'comprobante' => $comprobante->numero,
                'codigo'      => $errorCode,
                'descripcion' => $errorMsg,
            ]);
            return [
                'success'     => false,
                'codigo'      => $errorCode,
                'descripcion' => $errorMsg,
                'xml'         => $this->see->getXmlSigned($invoice),
            ];
        }

        $cdr = $result->getCdrResponse();
        $xmlFirmado = $this->see->getXmlSigned($invoice);

        Log::info('SUNAT respuesta CDR', [
            'comprobante' => $comprobante->numero,
            'codigo'      => $cdr->getCode(),
            'descripcion' => $cdr->getDescription(),
            'notas'       => $cdr->getNotes(),
        ]);

        return [
            'success'     => true,
            'codigo'      => $cdr->getCode(),
            'descripcion' => $cdr->getDescription(),
            'notas'       => $cdr->getNotes() ?? [],
            'xml'         => $xmlFirmado,
            'cdr'         => $result->getCdrZip(),
            'hash'        => (new XmlUtils())->getHashSign($xmlFirmado ?? ''),
        ];
    }

    public function enviarBoleta(Comprobante $comprobante): array
    {
        // Las boletas individuales pueden enviarse como invoice también
        return $this->enviarFactura($comprobante);
    }

    public function enviarNotaCredito(Comprobante $nc): array
    {
        $nc->load('comprobanteRef');
        $note = $this->buildNote($nc);

        $result = $this->see->send($note);

        if (!$result->isSuccess()) {
            $errorCode = $result->getError()->getCode();
            $errorMsg  = $result->getError()->getMessage();
            Log::error('SUNAT rechazó NC', [
                'comprobante' => $nc->numero,
                'codigo'      => $errorCode,
                'descripcion' => $errorMsg,
            ]);
            return [
                'success'     => false,
                'codigo'      => $errorCode,
                'descripcion' => $errorMsg,
                'xml'         => $this->see->getXmlSigned($note),
            ];
        }

        $cdr = $result->getCdrResponse();
        $xmlFirmado = $this->see->getXmlSigned($note);

        Log::info('SUNAT respuesta NC', [
            'comprobante' => $nc->numero,
            'codigo'      => $cdr->getCode(),
            'descripcion' => $cdr->getDescription(),
        ]);

        return [
            'success'     => true,
            'codigo'      => $cdr->getCode(),
            'descripcion' => $cdr->getDescription(),
            'notas'       => $cdr->getNotes() ?? [],
            'xml'         => $xmlFirmado,
            'cdr'         => $result->getCdrZip(),
            'hash'        => (new XmlUtils())->getHashSign($xmlFirmado ?? ''),
        ];
    }

    private function buildFormaPago(Comprobante $comprobante)
    {
        if ($comprobante->forma_pago === 'Credito' && $comprobante->fecha_vencimiento) {
            $cuota = (new Cuota())
                ->setNumeroCuota('Cuota001')
                ->setMonto((float) $comprobante->total)
                ->setFechaPago(new \DateTime($comprobante->fecha_vencimiento->format('Y-m-d')));

            return (new FormaPagoCredito((float) $comprobante->total, $comprobante->moneda))
                ->setCuotas([$cuota]);
        }
        return new FormaPagoContado();
    }

    private function buildNote(Comprobante $nc): Note
    {
        $motivosLabel = [
            '01' => 'Anulación de la operación',
            '02' => 'Anulación por error en RUC',
            '03' => 'Corrección por error en la descripción',
            '04' => 'Descuento global',
            '05' => 'Descuento por ítem',
            '06' => 'Devolución total',
            '07' => 'Devolución por ítem',
            '08' => 'Bonificación',
            '09' => 'Disminución en el valor',
            '10' => 'Otros conceptos',
        ];

        $ref = $nc->comprobanteRef;

        $note = new Note();
        $note
            ->setUblVersion('2.1')
            ->setTipoDoc('07')
            ->setSerie($nc->serie)
            ->setCorrelativo(str_pad($nc->correlativo, 8, '0', STR_PAD_LEFT))
            ->setFechaEmision(new \DateTime($nc->fecha_emision->format('Y-m-d')))
            ->setTipoMoneda($nc->moneda)
            ->setCompany($this->buildCompany())
            ->setClient($this->buildClient($nc))
            ->setCodMotivo($nc->motivo_nota)
            ->setDesMotivo($motivosLabel[$nc->motivo_nota] ?? 'Anulación de la operación')
            ->setTipDocAfectado($ref?->tipo_comprobante ?? '01')
            ->setNumDocfectado($ref?->numero ?? '')
            ->setMtoOperGravadas((float) $nc->op_gravadas)
            ->setMtoOperExoneradas((float) $nc->op_exoneradas)
            ->setMtoOperInafectas((float) $nc->op_inafectas)
            ->setMtoIGV((float) $nc->igv)
            ->setTotalImpuestos((float) $nc->igv)
            ->setMtoImpVenta((float) $nc->total)
            ->setValorVenta((float) ($nc->op_gravadas + $nc->op_exoneradas + $nc->op_inafectas))
            ->setSubTotal((float) $nc->total);

        $details = [];
        foreach ($nc->detalles as $item) {
            $detail = (new SaleDetail())
                ->setCodProducto($item->codigo_producto ?? $item->id)
                ->setCodProdSunat($item->codigo_producto_sunat ?? '')
                ->setUnidad($item->unidad_medida)
                ->setCantidad((float) $item->cantidad)
                ->setMtoValorUnitario((float) $item->precio_unitario)
                ->setDescripcion($item->descripcion)
                ->setMtoBaseIgv((float) $item->subtotal)
                ->setPorcentajeIgv(18.00)
                ->setIgv((float) $item->igv_item)
                ->setTipAfeIgv($item->tipo_afectacion_igv)
                ->setTotalImpuestos((float) $item->igv_item)
                ->setMtoValorVenta((float) $item->subtotal)
                ->setMtoPrecioUnitario((float) $item->precio_unitario_con_igv);

            $details[] = $detail;
        }

        $note->setDetails($details);
        $note->setLegends([
            (new Legend())
                ->setCode('1000')
                ->setValue($this->numeroALetras((float) $nc->total, $nc->moneda))
        ]);

        return $note;
    }

    private function buildInvoice(Comprobante $comprobante): Invoice
    {
        $invoice = new Invoice();
        $invoice
            ->setUblVersion('2.1')
            ->setTipoOperacion('0101') // Venta interna
            ->setTipoDoc($comprobante->tipo_comprobante)
            ->setSerie($comprobante->serie)
            ->setCorrelativo(str_pad($comprobante->correlativo, 8, '0', STR_PAD_LEFT))
            ->setFechaEmision(new \DateTime($comprobante->fecha_emision->format('Y-m-d')))
            ->setTipoMoneda($comprobante->moneda)
            ->setCompany($this->buildCompany())
            ->setClient($this->buildClient($comprobante));

        // Totales
        $invoice
            ->setMtoOperGravadas((float) $comprobante->op_gravadas)
            ->setMtoOperExoneradas((float) $comprobante->op_exoneradas)
            ->setMtoOperInafectas((float) $comprobante->op_inafectas)
            ->setMtoIGV((float) $comprobante->igv)
            ->setTotalImpuestos((float) $comprobante->igv)
            ->setMtoImpVenta((float) $comprobante->total)
            ->setValorVenta((float) ($comprobante->op_gravadas + $comprobante->op_exoneradas + $comprobante->op_inafectas))
            ->setSubTotal((float) $comprobante->total)
            ->setFormaPago($this->buildFormaPago($comprobante))
            ->setDescuentos([]);

        // Detalles
        $details = [];
        foreach ($comprobante->detalles as $item) {
            $detail = (new SaleDetail())
                ->setCodProducto($item->codigo_producto ?? $item->id)
                ->setCodProdSunat($item->codigo_producto_sunat ?? '')
                ->setUnidad($item->unidad_medida)
                ->setCantidad((float) $item->cantidad)
                ->setMtoValorUnitario((float) $item->precio_unitario)
                ->setDescripcion($item->descripcion)
                ->setMtoBaseIgv((float) $item->subtotal)
                ->setPorcentajeIgv(18.00)
                ->setIgv((float) $item->igv_item)
                ->setTipAfeIgv($item->tipo_afectacion_igv)
                ->setTotalImpuestos((float) $item->igv_item)
                ->setMtoValorVenta((float) $item->subtotal)
                ->setMtoPrecioUnitario((float) $item->precio_unitario_con_igv);

            if ($item->descuento > 0) {
                $detail->setDescuento((float) $item->descuento);
            }

            $details[] = $detail;
        }

        $invoice->setDetails($details);

        // Leyenda (monto en letras)
        $invoice->setLegends([
            (new Legend())
                ->setCode('1000')
                ->setValue($this->numeroALetras((float) $comprobante->total, $comprobante->moneda))
        ]);

        return $invoice;
    }

    private function numeroALetras(float $numero, string $moneda = 'PEN'): string
    {
        $monedaLabel = $moneda === 'PEN' ? 'SOLES' : 'DÓLARES AMERICANOS';
        $entero = (int) $numero;
        $centavos = round(($numero - $entero) * 100);

        return "SON {$entero} CON {$centavos}/100 {$monedaLabel}";
    }

    public function generarXml(Comprobante $comprobante): string
    {
        if ($comprobante->tipo_comprobante === '07') {
            $comprobante->load('comprobanteRef');
            $note = $this->buildNote($comprobante);
            return $this->see->getXmlSigned($note) ?? '';
        }
        $invoice = $this->buildInvoice($comprobante);
        return $this->see->getXmlSigned($invoice) ?? '';
    }

    public function consultarCdr(Comprobante $comprobante): array
    {
        // En beta, el endpoint de consulta también es diferente al de producción
        $consultaEndpoint = $this->tenant->sunat_beta
            ? 'https://e-beta.sunat.gob.pe/ol-it-wsconscpegem/billConsultService'
            : SunatEndpoints::FE_CONSULTA_CDR;

        $client = new GreenterSoapClient(WsdlProvider::getConsultPath());
        $client->setCredentials(
            $this->tenant->ruc . $this->tenant->clave_sol_usuario,
            $this->tenant->clave_sol_password
        );
        $client->setService($consultaEndpoint);

        $service = new ConsultCdrService();
        $service->setClient($client);

        $result = $service->getStatusCdr(
            $this->tenant->ruc,
            $comprobante->tipo_comprobante,
            $comprobante->serie,
            (int) $comprobante->correlativo
        );

        if (!$result->isSuccess()) {
            return [
                'success' => false,
                'codigo' => $result->getError()->getCode(),
                'descripcion' => $result->getError()->getMessage(),
            ];
        }

        $cdr = $result->getCdrResponse();

        return [
            'success' => true,
            'codigo'     => $cdr ? $cdr->getCode()        : $result->getCode(),
            'descripcion'=> $cdr ? $cdr->getDescription() : $result->getMessage(),
            'notas'      => $cdr ? ($cdr->getNotes() ?? []) : [],
            'estado_sunat' => $result->getCode(), // código de estado de SUNAT (98=pendiente, 0=aceptado)
        ];
    }

    public function consultarTicket(string $ticket): array
    {
        $result = $this->see->getStatus($ticket);

        if (!$result->isSuccess()) {
            return [
                'success' => false,
                'codigo' => $result->getError()->getCode(),
                'descripcion' => $result->getError()->getMessage(),
            ];
        }

        $cdr = $result->getCdrResponse();

        return [
            'success' => true,
            'codigo' => $cdr->getCode(),
            'descripcion' => $cdr->getDescription(),
            'cdr' => $result->getCdrZip(),
        ];
    }
}
