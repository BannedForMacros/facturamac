<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comprobante\StoreComprobanteRequest;
use App\Models\Comprobante;
use App\Models\DetalleComprobante;
use App\Models\Serie;
use App\Services\SunatService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ComprobanteController extends Controller
{
    public function index(Request $request): Response
    {
        $comprobantes = Comprobante::with('cliente')
            ->when($request->tipo, fn($q, $t) => $q->where('tipo_comprobante', $t))
            ->when($request->estado, fn($q, $e) => $q->where('estado', $e))
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('cliente_razon_social', 'ilike', "%{$s}%")
                    ->orWhere('cliente_num_doc', 'ilike', "%{$s}%")
                    ->orWhere(DB::raw("serie || '-' || lpad(correlativo::text, 8, '0')"), 'ilike', "%{$s}%");
            }))
            ->when($request->fecha_desde, fn($q, $f) => $q->whereDate('fecha_emision', '>=', $f))
            ->when($request->fecha_hasta, fn($q, $f) => $q->whereDate('fecha_emision', '<=', $f))
            ->orderByDesc('fecha_emision')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn($c) => [
                'id' => $c->id,
                'numero' => $c->numero,
                'tipo_label' => $c->tipo_label,
                'tipo_comprobante' => $c->tipo_comprobante,
                'cliente' => $c->cliente_razon_social,
                'cliente_num_doc' => $c->cliente_num_doc,
                'total' => $c->total,
                'moneda' => $c->moneda,
                'estado' => $c->estado,
                'estado_color' => $c->estado_color,
                'fecha' => $c->fecha_emision->format('d/m/Y'),
            ]);

        $series = Serie::where('activo', true)->get(['tipo_comprobante', 'serie', 'correlativo_actual']);

        return Inertia::render('Comprobantes/Index', [
            'comprobantes' => $comprobantes,
            'filters' => $request->only(['tipo', 'estado', 'search', 'fecha_desde', 'fecha_hasta']),
            'series' => $series,
        ]);
    }

    public function create(Request $request): Response
    {
        $tipo = $request->tipo ?? '01'; // Por defecto Factura

        $series = Serie::where('tipo_comprobante', $tipo)
            ->where('activo', true)
            ->get(['id', 'serie', 'correlativo_actual']);

        return Inertia::render('Comprobantes/Create', [
            'tipo_inicial' => $tipo,
            'series' => $series,
            'tipo_comprobantes' => [
                ['codigo' => '01', 'label' => 'Factura Electrónica'],
                ['codigo' => '03', 'label' => 'Boleta de Venta Electrónica'],
            ],
        ]);
    }

    public function store(StoreComprobanteRequest $request)
    {
        $data = $request->validated();

        DB::beginTransaction();
        try {
            $tenantId = Auth::user()->tenant_id;

            // Obtener y avanzar el correlativo
            $serie = Serie::where('tenant_id', $tenantId)
                ->where('tipo_comprobante', $data['tipo_comprobante'])
                ->where('serie', $data['serie'])
                ->lockForUpdate()
                ->firstOrFail();

            $correlativo = $serie->siguienteCorrelativo();

            // Calcular totales
            $totales = $this->calcularTotales($data['detalles']);

            // Crear comprobante
            $comprobante = Comprobante::create([
                'tenant_id' => $tenantId,
                'tipo_comprobante' => $data['tipo_comprobante'],
                'serie' => $data['serie'],
                'correlativo' => $correlativo,
                'fecha_emision' => $data['fecha_emision'],
                'fecha_vencimiento' => $data['fecha_vencimiento'] ?? null,
                'cliente_id' => $data['cliente_id'],
                'cliente_tipo_doc' => $data['cliente_tipo_doc'],
                'cliente_num_doc' => $data['cliente_num_doc'],
                'cliente_razon_social' => $data['cliente_razon_social'],
                'cliente_direccion' => $data['cliente_direccion'] ?? null,
                'moneda' => $data['moneda'] ?? 'PEN',
                'tipo_cambio' => $data['tipo_cambio'] ?? 1,
                'op_gravadas' => $totales['op_gravadas'],
                'op_exoneradas' => $totales['op_exoneradas'],
                'op_inafectas' => $totales['op_inafectas'],
                'igv' => $totales['igv'],
                'total' => $totales['total'],
                'observaciones' => $data['observaciones'] ?? null,
                'estado' => 'borrador',
                'user_id' => Auth::id(),
            ]);

            // Crear detalles
            foreach ($data['detalles'] as $idx => $item) {
                DetalleComprobante::create([
                    'comprobante_id' => $comprobante->id,
                    'producto_id' => $item['producto_id'] ?? null,
                    'codigo_producto' => $item['codigo_producto'] ?? null,
                    'codigo_producto_sunat' => $item['codigo_producto_sunat'] ?? null,
                    'descripcion' => $item['descripcion'],
                    'unidad_medida' => $item['unidad_medida'] ?? 'NIU',
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $item['precio_unitario'],
                    'precio_unitario_con_igv' => $item['precio_unitario_con_igv'] ?? null,
                    'descuento' => $item['descuento'] ?? 0,
                    'subtotal' => $item['subtotal'],
                    'igv_item' => $item['igv_item'],
                    'total_item' => $item['total_item'],
                    'tipo_afectacion_igv' => $item['tipo_afectacion_igv'] ?? '10',
                    'porcentaje_igv' => 18.00,
                    'orden' => $idx,
                ]);
            }

            DB::commit();

            // Si se pide emisión inmediata, enviar a SUNAT
            if ($request->boolean('emitir_ahora')) {
                return $this->enviarSunat($comprobante);
            }

            return redirect()->route('comprobantes.show', $comprobante)
                ->with('success', "Comprobante {$comprobante->numero} creado en borrador.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(Comprobante $comprobante): Response
    {
        $comprobante->load('detalles.producto');

        // Series de NC según tipo del comprobante original
        $prefijo = $comprobante->tipo_comprobante === '01' ? 'FC' : 'BC';
        $seriesNc = Serie::where('tipo_comprobante', '07')
            ->where('activo', true)
            ->where('serie', 'like', $prefijo . '%')
            ->get(['id', 'serie', 'correlativo_actual']);

        return Inertia::render('Comprobantes/Show', [
            'comprobante' => [
                ...$comprobante->toArray(),
                'numero' => $comprobante->numero,
                'tipo_label' => $comprobante->tipo_label,
                'estado_color' => $comprobante->estado_color,
                'fecha_emision_fmt' => $comprobante->fecha_emision->format('d/m/Y'),
            ],
            'series_nc' => $seriesNc,
        ]);
    }

    public function storeNotaCredito(Request $request, Comprobante $comprobante)
    {
        $request->validate([
            'serie'       => 'required|string',
            'motivo'      => 'required|string',
            'emitir_ahora' => 'boolean',
        ]);

        if (!in_array($comprobante->estado, ['aceptado', 'enviado'])) {
            return back()->withErrors(['error' => 'Solo se puede emitir NC para comprobantes aceptados o enviados.']);
        }

        DB::beginTransaction();
        try {
            $tenantId = Auth::user()->tenant_id;

            $serie = Serie::where('tenant_id', $tenantId)
                ->where('tipo_comprobante', '07')
                ->where('serie', $request->serie)
                ->lockForUpdate()
                ->firstOrFail();

            $correlativo = $serie->siguienteCorrelativo();

            $nc = Comprobante::create([
                'tenant_id'            => $tenantId,
                'tipo_comprobante'     => '07',
                'serie'                => $request->serie,
                'correlativo'          => $correlativo,
                'fecha_emision'        => now()->format('Y-m-d'),
                'cliente_id'           => $comprobante->cliente_id,
                'cliente_tipo_doc'     => $comprobante->cliente_tipo_doc,
                'cliente_num_doc'      => $comprobante->cliente_num_doc,
                'cliente_razon_social' => $comprobante->cliente_razon_social,
                'cliente_direccion'    => $comprobante->cliente_direccion,
                'moneda'               => $comprobante->moneda,
                'tipo_cambio'          => $comprobante->tipo_cambio,
                'op_gravadas'          => $comprobante->op_gravadas,
                'op_exoneradas'        => $comprobante->op_exoneradas,
                'op_inafectas'         => $comprobante->op_inafectas,
                'igv'                  => $comprobante->igv,
                'total'                => $comprobante->total,
                'comprobante_ref_id'   => $comprobante->id,
                'motivo_nota'          => $request->motivo,
                'observaciones'        => "NC: {$request->motivo}. Ref: {$comprobante->numero}",
                'estado'               => 'borrador',
                'user_id'              => Auth::id(),
            ]);

            foreach ($comprobante->detalles as $detalle) {
                DetalleComprobante::create([
                    'comprobante_id'        => $nc->id,
                    'producto_id'           => $detalle->producto_id,
                    'codigo_producto'       => $detalle->codigo_producto,
                    'descripcion'           => $detalle->descripcion,
                    'unidad_medida'         => $detalle->unidad_medida,
                    'cantidad'              => $detalle->cantidad,
                    'precio_unitario'       => $detalle->precio_unitario,
                    'precio_unitario_con_igv' => $detalle->precio_unitario_con_igv,
                    'descuento'             => $detalle->descuento,
                    'subtotal'              => $detalle->subtotal,
                    'igv_item'              => $detalle->igv_item,
                    'total_item'            => $detalle->total_item,
                    'tipo_afectacion_igv'   => $detalle->tipo_afectacion_igv,
                    'porcentaje_igv'        => $detalle->porcentaje_igv,
                    'orden'                 => $detalle->orden,
                ]);
            }

            // Marcar el comprobante original como anulado
            $comprobante->update(['estado' => 'anulado']);

            DB::commit();

            if ($request->boolean('emitir_ahora')) {
                return $this->enviarSunat($nc);
            }

            return redirect()->route('comprobantes.show', $nc)
                ->with('success', "NC {$nc->numero} generada. Comprobante {$comprobante->numero} anulado.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function emitir(Comprobante $comprobante)
    {
        if (!in_array($comprobante->estado, ['borrador', 'enviado', 'rechazado'])) {
            return back()->withErrors(['error' => 'Este comprobante ya fue aceptado o anulado.']);
        }

        return $this->enviarSunat($comprobante);
    }

    private function enviarSunat(Comprobante $comprobante)
    {
        $tenant = Auth::user()->tenant;

        // Verificar certificado
        if (!$tenant->certificado_pfx || !$tenant->clave_sol_usuario) {
            $comprobante->update(['estado' => 'enviado']); // Sin SUNAT en beta sin certificado
            return redirect()->route('comprobantes.show', $comprobante)
                ->with('warning', 'Comprobante guardado. Configure el certificado y clave SOL para enviar a SUNAT.');
        }

        try {
            $sunat = new SunatService($tenant);

            $resultado = match($comprobante->tipo_comprobante) {
                '01' => $sunat->enviarFactura($comprobante),
                '03' => $sunat->enviarBoleta($comprobante),
                '07' => $sunat->enviarNotaCredito($comprobante),
                default => throw new \Exception('Tipo de comprobante no soportado'),
            };

            // Código '0' = aceptado, '0004' = aceptado con observaciones, '4xxx' = rechazado
            $codigoCdr = (string) ($resultado['codigo'] ?? '');
            $aceptado  = $resultado['success'] && ($codigoCdr === '0' || str_starts_with($codigoCdr, '2') || $codigoCdr === '');
            $estado    = $aceptado ? 'aceptado' : 'rechazado';

            $comprobante->update([
                'estado'           => $estado,
                'xml_firmado'      => $resultado['xml'] ?? null,
                'hash_cpe'         => $resultado['hash'] ?? null,
                'sunat_codigo'     => $codigoCdr,
                'sunat_descripcion'=> $resultado['descripcion'] ?? null,
            ]);

            $notas   = $resultado['notas'] ?? [];
            $mensaje = $aceptado
                ? "Comprobante {$comprobante->numero} aceptado por SUNAT." . ($notas ? ' Con observaciones.' : '')
                : "SUNAT: [{$codigoCdr}] {$resultado['descripcion']}";

            return redirect()->route('comprobantes.show', $comprobante)
                ->with($resultado['success'] ? 'success' : 'error', $mensaje);
        } catch (\Throwable $e) {
            $comprobante->update([
                'estado'            => 'rechazado',
                'sunat_descripcion' => $e->getMessage(),
            ]);

            return redirect()->route('comprobantes.show', $comprobante)
                ->with('error', 'Error SUNAT: ' . $e->getMessage());
        }
    }

    private function calcularTotales(array $detalles): array
    {
        $opGravadas = 0;
        $opExoneradas = 0;
        $opInafectas = 0;
        $igv = 0;

        foreach ($detalles as $item) {
            $tipoAfectacion = $item['tipo_afectacion_igv'] ?? '10';
            $subtotal = (float) $item['subtotal'];
            $igvItem = (float) $item['igv_item'];

            if ($tipoAfectacion === '10') { // Gravado
                $opGravadas += $subtotal;
                $igv += $igvItem;
            } elseif ($tipoAfectacion === '20') { // Exonerado
                $opExoneradas += $subtotal;
            } else { // Inafecto
                $opInafectas += $subtotal;
            }
        }

        return [
            'op_gravadas' => round($opGravadas, 2),
            'op_exoneradas' => round($opExoneradas, 2),
            'op_inafectas' => round($opInafectas, 2),
            'igv' => round($igv, 2),
            'total' => round($opGravadas + $opExoneradas + $opInafectas + $igv, 2),
        ];
    }

    public function pdf(Comprobante $comprobante)
    {
        $comprobante->load(['detalles', 'comprobanteRef']);
        $tenant = Auth::user()->tenant;

        // Determinar formato según tipo y configuración del tenant
        $esBoleta = $comprobante->tipo_comprobante === '03';
        $esNc     = $comprobante->tipo_comprobante === '07';

        if ($esBoleta) {
            $formato = $tenant->formato_impresion_boleta ?? 'a4';
        } elseif ($esNc) {
            $tipoRef = $comprobante->comprobanteRef?->tipo_comprobante ?? '01';
            $formato = $tipoRef === '03'
                ? ($tenant->formato_impresion_boleta ?? 'a4')
                : ($tenant->formato_impresion_factura ?? 'a4');
        } else {
            $formato = $tenant->formato_impresion_factura ?? 'a4';
        }

        // Logo embebido como base64
        $logoUrl = null;
        if ($tenant->logo && Storage::disk('public')->exists($tenant->logo)) {
            $logoData = base64_encode(Storage::disk('public')->get($tenant->logo));
            $logoMime = Storage::disk('public')->mimeType($tenant->logo) ?: 'image/png';
            $logoUrl  = "data:{$logoMime};base64,{$logoData}";
        }

        // QR con datos estándar SUNAT (formato verificable)
        $qrData = implode('|', [
            $tenant->ruc,
            $comprobante->tipo_comprobante,
            $comprobante->serie,
            str_pad($comprobante->correlativo, 8, '0', STR_PAD_LEFT),
            number_format((float) $comprobante->igv, 2, '.', ''),
            number_format((float) $comprobante->total, 2, '.', ''),
            $comprobante->fecha_emision->format('Y-m-d'),
            $comprobante->cliente_tipo_doc,
            $comprobante->cliente_num_doc,
            $comprobante->hash_cpe ?? '',
        ]);
        $qrBase64 = $this->generarQrBase64($qrData);

        $motivosLabel = [
            '01' => 'Anulación de la operación',    '02' => 'Anulación por error en RUC',
            '03' => 'Corrección en descripción',     '04' => 'Descuento global',
            '05' => 'Descuento por ítem',             '06' => 'Devolución total',
            '07' => 'Devolución por ítem',            '08' => 'Bonificación',
            '09' => 'Disminución en el valor',        '10' => 'Otros conceptos',
        ];

        $viewData = [
            'comprobante'   => $comprobante,
            'tenant'        => $tenant,
            'logoUrl'       => $logoUrl,
            'qrBase64'      => $qrBase64,
            'numero'        => $comprobante->numero,
            'tipoLabel'     => $comprobante->tipo_label,
            'fechaEmision'  => $comprobante->fecha_emision->format('d/m/Y'),
            'monedaSimbolo' => $comprobante->moneda === 'PEN' ? 'S/' : 'US$',
            'motivoLabel'   => $motivosLabel[$comprobante->motivo_nota ?? ''] ?? '',
        ];

        $filename = $comprobante->nombre_archivo . '.pdf';

        if ($formato === 'ticket') {
            // 80mm = 226.77pt. Alto grande para contenido variable.
            $pdf = Pdf::loadView('pdf.comprobante_ticket', $viewData)
                ->setPaper([0, 0, 226.77, 841.89], 'portrait');
        } else {
            $pdf = Pdf::loadView('pdf.comprobante_a4', $viewData)
                ->setPaper('a4', 'portrait');
        }

        return $pdf->download($filename);
    }

    private function generarQrBase64(string $contenido): string
    {
        try {
            $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                new \BaconQrCode\Renderer\RendererStyle\RendererStyle(140),
                new \BaconQrCode\Renderer\Image\GDLibPngImageBackEnd()
            );
            $png = (new \BaconQrCode\Writer($renderer))->writeString($contenido);
            return 'data:image/png;base64,' . base64_encode($png);
        } catch (\Throwable) {
            return '';
        }
    }

    public function verXml(Comprobante $comprobante)
    {
        // Si ya tiene XML firmado guardado, lo retornamos directamente
        if ($comprobante->xml_firmado) {
            return response()->json([
                'xml' => $comprobante->xml_firmado,
                'firmado' => true,
            ]);
        }

        // Generar XML fresco (sin firmar si no hay certificado)
        $tenant = Auth::user()->tenant;
        try {
            $sunat = new SunatService($tenant);
            $xml = $sunat->generarXml($comprobante);
            return response()->json([
                'xml' => $xml,
                'firmado' => false,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function consultarSunat(Comprobante $comprobante)
    {
        $tenant = Auth::user()->tenant;

        if (!$tenant->clave_sol_usuario || !$tenant->clave_sol_password) {
            return response()->json([
                'error' => 'Configure el usuario y clave SOL en Configuración > Empresa para poder consultar SUNAT.',
            ], 422);
        }

        try {
            $sunat = new SunatService($tenant);
            $resultado = $sunat->consultarCdr($comprobante);

            // Actualizar estado según respuesta SUNAT
            // estado_sunat: '0'=CDR disponible, '98'=pendiente, '99'=no registrado
            // codigo: código del CDR ('0'=aceptado, '2xxx'=observado, '4xxx'=rechazado)
            if ($resultado['success']) {
                $estadoSunat = $resultado['estado_sunat'] ?? null;
                $codigoCdr   = $resultado['codigo'] ?? null;

                if ($estadoSunat === '0' && $codigoCdr !== null) {
                    $estado = $codigoCdr === '0' ? 'aceptado' : 'rechazado';
                    $comprobante->update([
                        'estado'           => $estado,
                        'sunat_codigo'     => $codigoCdr,
                        'sunat_descripcion'=> $resultado['descripcion'],
                    ]);
                    $resultado['estado_actualizado'] = $estado;
                } elseif ($estadoSunat === '98') {
                    $resultado['descripcion'] = 'Comprobante en proceso en SUNAT (pendiente de CDR).';
                } elseif ($estadoSunat === '99') {
                    $resultado['descripcion'] = 'Comprobante no encontrado en SUNAT. Puede que no haya sido enviado o esté en beta.';
                }
            }

            return response()->json($resultado);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function anular(Comprobante $comprobante)
    {
        if (!in_array($comprobante->estado, ['aceptado', 'enviado', 'borrador'])) {
            return back()->withErrors(['error' => 'No se puede anular este comprobante.']);
        }

        $comprobante->update(['estado' => 'anulado']);

        return redirect()->route('comprobantes.index')
            ->with('success', "Comprobante {$comprobante->numero} anulado.");
    }
}
