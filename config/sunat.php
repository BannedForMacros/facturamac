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

    // IGV vigente en Perú
    'igv_porcentaje' => 18,

    // Tipos de comprobante
    'tipos' => [
        '01' => 'Factura',
        '03' => 'Boleta de Venta',
        '07' => 'Nota de Crédito',
        '08' => 'Nota de Débito',
        '09' => 'Guía de Remisión Remitente',
    ],

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
