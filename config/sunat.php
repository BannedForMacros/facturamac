<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SUNAT - Configuración de Facturación Electrónica
    |--------------------------------------------------------------------------
    */

    'beta' => env('SUNAT_BETA', true),

    // Endpoints Beta (Pruebas)
    'wsdl_beta' => env('SUNAT_WSDL_BETA', 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService'),
    'wsdl_beta_boleta' => env('SUNAT_WSDL_BETA_BOLETA', 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService'),
    'wsdl_beta_consulta' => env('SUNAT_WSDL_BETA_CONSULTA', 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService'),

    // Endpoints Producción
    'wsdl_prod' => env('SUNAT_WSDL_PROD', 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService'),
    'wsdl_prod_boleta' => env('SUNAT_WSDL_PROD_BOLETA', 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService'),

    // Ruta de certificados (dentro de storage/app/private/)
    'cert_path' => env('SUNAT_CERT_PATH', 'certificados'),

    // IGV vigente en Perú (Decreto Legislativo 821)
    'igv_porcentaje' => 18,

    // Catálogo 01 - Tipos de comprobante
    'tipos' => [
        '01' => 'Factura',
        '03' => 'Boleta de Venta',
        '07' => 'Nota de Crédito',
        '08' => 'Nota de Débito',
        '09' => 'Guía de Remisión Remitente',
    ],

    // Catálogo 09 - Motivos de Nota de Crédito
    'motivos_nota_credito' => [
        '01' => 'Anulación de la operación',
        '02' => 'Anulación por error en el RUC',
        '03' => 'Corrección por error en la descripción',
        '04' => 'Descuento global',
        '05' => 'Descuento por ítem',
        '06' => 'Devolución total',
        '07' => 'Devolución por ítem',
        '08' => 'Bonificación',
        '09' => 'Disminución en el valor',
        '10' => 'Otros conceptos',
        '11' => 'Ajustes de operaciones de exportación',
        '12' => 'Ajuste por diferencia de cambio',
        '13' => 'Corrección por error en el monto',
    ],

    // Catálogo 51 - Tipos de operación (facturas/boletas)
    'tipos_operacion' => [
        '0101' => 'Venta interna',
        '0200' => 'Exportación de Bienes',
        '0201' => 'Exportación de Servicios',
        '1001' => 'Operación Sujeta a Detracción',
        '2001' => 'Operación Sujeta a Percepción',
    ],

    // Tipo de operación por defecto (venta interna)
    'tipo_operacion_default' => '0101',

    // Prefijos de serie para Nota de Crédito según tipo del comprobante referenciado
    // Catálogo 10 SUNAT: FC = NC de factura, BC = NC de boleta
    'serie_prefijos_nc' => [
        '01' => 'FC',
        '03' => 'BC',
    ],

    // Códigos CDR de SUNAT que significan "aceptado" (coincidencia exacta)
    'cdr_codigos_aceptado' => ['0', ''],

    // Prefijos de código CDR que significan "aceptado con observaciones" (aún válido)
    'cdr_prefijos_observado' => ['2'],

    // Catálogo de unidades de medida (parcial)
    'unidades_medida' => [
        'NIU' => 'Unidad (bienes)',
        'ZZ'  => 'Unidad (servicios)',
        'KGM' => 'Kilogramo',
        'MTR' => 'Metro',
        'LTR' => 'Litro',
        'GLL' => 'Galón',
        'TNE' => 'Tonelada métrica',
        'BX'  => 'Caja',
        'BG'  => 'Bolsa',
        'SET' => 'Juego',
        'DZN' => 'Docena',
        'HUR' => 'Hora',
        'DAY' => 'Día',
        'MON' => 'Mes',
    ],

    // Tipos de afectación IGV (Catálogo 7 SUNAT)
    'tipos_afectacion_igv' => [
        '10' => 'Gravado – Operación Onerosa',
        '11' => 'Gravado – Retiro por premio',
        '12' => 'Gravado – Retiro por donación',
        '13' => 'Gravado – Retiro',
        '14' => 'Gravado – Retiro por publicidad',
        '15' => 'Gravado – Bonificaciones',
        '16' => 'Gravado – Retiro por entrega a trabajadores',
        '17' => 'Gravado – IVAP',
        '20' => 'Exonerado – Operación Onerosa',
        '21' => 'Exonerado – Transferencia Gratuita',
        '30' => 'Inafecto – Operación Onerosa',
        '31' => 'Inafecto – Retiro por Bonificación',
        '32' => 'Inafecto – Retiro',
        '33' => 'Inafecto – Retiro por Muestras Médicas',
        '34' => 'Inafecto – Retiro por Convenio Colectivo',
        '35' => 'Inafecto – Retiro por premio',
        '36' => 'Inafecto – Retiro por publicidad',
        '40' => 'Exportación de Bienes o Servicios',
    ],
];
