<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10px; color: #1a1a1a; background: #fff; }

/* ─── Layout ─── */
.page { padding: 20px 24px; }

/* ─── Cabecera ─── */
.header { display: table; width: 100%; border-collapse: collapse; margin-bottom: 14px; }
.header-left  { display: table-cell; vertical-align: middle; width: 60%; padding-right: 16px; }
.header-right { display: table-cell; vertical-align: middle; width: 40%; text-align: center; }

/* Empresa info */
.company-name { font-size: 14px; font-weight: bold; color: #111; text-transform: uppercase; }
.company-ruc  { font-size: 10px; color: #555; margin-top: 2px; }
.company-addr { font-size: 9px; color: #777; margin-top: 2px; line-height: 1.4; }

/* Logo */
.logo-box { text-align: center; }
.logo-box img { max-height: 60px; max-width: 180px; object-fit: contain; }
.logo-placeholder { /* sin logo */ }

/* Recuadro tipo/número */
.doc-box {
    border: 2px solid #1d4ed8;
    border-radius: 6px;
    padding: 10px 14px;
    text-align: center;
    background: #eff6ff;
}
.doc-tipo   { font-size: 11px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px; }
.doc-numero { font-size: 15px; font-weight: bold; color: #1e3a8a; font-family: monospace; margin-top: 4px; }
.doc-fecha  { font-size: 9px; color: #64748b; margin-top: 3px; }

/* ─── Separador ─── */
hr { border: none; border-top: 1px solid #e2e8f0; margin: 10px 0; }

/* ─── Info: cliente + emisión ─── */
.info-grid { display: table; width: 100%; margin-bottom: 12px; }
.info-col  { display: table-cell; width: 50%; vertical-align: top; padding-right: 10px; }
.info-col:last-child { padding-right: 0; padding-left: 10px; }

.section-title {
    font-size: 8px; font-weight: bold; text-transform: uppercase;
    color: #64748b; letter-spacing: 0.8px; margin-bottom: 5px;
    border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;
}
.info-row { display: table; width: 100%; margin-bottom: 3px; }
.info-key { display: table-cell; width: 80px; font-size: 9px; color: #64748b; }
.info-val { display: table-cell; font-size: 9px; font-weight: 600; color: #1a1a1a; }

/* ─── Nota de crédito ref ─── */
.nc-ref {
    background: #fef3c7; border: 1px solid #f59e0b;
    border-radius: 4px; padding: 6px 10px; margin-bottom: 10px;
    font-size: 9px; color: #92400e;
}
.nc-ref strong { color: #78350f; }

/* ─── Tabla de items ─── */
.items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
.items-table thead tr { background: #1d4ed8; color: white; }
.items-table thead th {
    padding: 6px 8px; font-size: 8.5px; font-weight: bold;
    text-transform: uppercase; letter-spacing: 0.4px;
}
.items-table tbody tr { border-bottom: 1px solid #f1f5f9; }
.items-table tbody tr:nth-child(even) { background: #f8fafc; }
.items-table td { padding: 5px 8px; font-size: 9px; vertical-align: top; }
.items-table .right { text-align: right; }
.items-table .center { text-align: center; }
.badge-igv  { background: #dbeafe; color: #1d4ed8; padding: 1px 5px; border-radius: 10px; font-size: 8px; font-weight: 600; }
.badge-exo  { background: #f1f5f9; color: #64748b; padding: 1px 5px; border-radius: 10px; font-size: 8px; }

/* ─── Totales ─── */
.totales-wrap { display: table; width: 100%; }
.obs-col { display: table-cell; vertical-align: top; width: 55%; padding-right: 16px; }
.tot-col { display: table-cell; vertical-align: top; width: 45%; }

.obs-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 10px; font-size: 9px; color: #475569; min-height: 48px; }
.obs-label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; letter-spacing: 0.5px; }

.tot-table { width: 100%; border-collapse: collapse; }
.tot-table tr td { padding: 3px 6px; font-size: 9px; }
.tot-table .tot-key { color: #64748b; }
.tot-table .tot-val { text-align: right; font-weight: 600; color: #1a1a1a; }
.tot-table .tot-final { border-top: 2px solid #1d4ed8; }
.tot-table .tot-final td { padding-top: 5px; font-size: 11px; font-weight: bold; color: #1e3a8a; }

/* ─── Pie ─── */
.footer { margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
.footer-grid { display: table; width: 100%; }
.footer-left  { display: table-cell; width: 60%; font-size: 8px; color: #94a3b8; }
.footer-right { display: table-cell; width: 40%; text-align: right; }
.estado-badge {
    display: inline-block;
    padding: 3px 10px; border-radius: 20px; font-size: 8.5px; font-weight: bold;
    text-transform: uppercase; letter-spacing: 0.5px;
}
.estado-aceptado  { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.estado-borrador  { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }
.estado-rechazado { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.estado-enviado   { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.estado-anulado   { background: #ffedd5; color: #9a3412; border: 1px solid #fdba74; }
.hash-text { font-size: 7px; color: #cbd5e1; margin-top: 3px; font-family: monospace; word-break: break-all; }
</style>
</head>
<body>
<div class="page">

    {{-- ════ CABECERA ════ --}}
    <div class="header">
        @if($logoUrl)
        {{-- Con logo: izquierda empresa, derecha logo + doc-box --}}
        <div class="header-left">
            <div class="company-name">{{ $tenant['razon_social'] }}</div>
            <div class="company-ruc">RUC: {{ $tenant['ruc'] }}</div>
            <div class="company-addr">{{ $tenant['direccion'] }}</div>
            @if($tenant['departamento'])
            <div class="company-addr">{{ $tenant['departamento'] }} - {{ $tenant['provincia'] }} - {{ $tenant['distrito'] }}</div>
            @endif
            @if($tenant['email'])
            <div class="company-addr">{{ $tenant['email'] }}</div>
            @endif
        </div>
        <div class="header-right">
            <div class="logo-box" style="margin-bottom:8px;">
                <img src="{{ $logoUrl }}" alt="Logo">
            </div>
            <div class="doc-box">
                <div class="doc-tipo">{{ $tipoLabel }}</div>
                <div class="doc-numero">{{ $numero }}</div>
                <div class="doc-fecha">{{ $fechaEmision }}</div>
            </div>
        </div>
        @else
        {{-- Sin logo: empresa a la izquierda, doc-box a la derecha --}}
        <div class="header-left">
            <div class="company-name">{{ $tenant['razon_social'] }}</div>
            <div class="company-ruc">RUC: {{ $tenant['ruc'] }}</div>
            <div class="company-addr">{{ $tenant['direccion'] }}</div>
            @if($tenant['departamento'])
            <div class="company-addr">{{ $tenant['departamento'] }} - {{ $tenant['provincia'] }} - {{ $tenant['distrito'] }}</div>
            @endif
            @if($tenant['email'])
            <div class="company-addr">{{ $tenant['email'] }}</div>
            @endif
        </div>
        <div class="header-right">
            <div class="doc-box">
                <div class="doc-tipo">{{ $tipoLabel }}</div>
                <div class="doc-numero">{{ $numero }}</div>
                <div class="doc-fecha">{{ $fechaEmision }}</div>
            </div>
        </div>
        @endif
    </div>

    <hr>

    {{-- ════ REFERENCIA NC ════ --}}
    @if($comprobante->tipo_comprobante === '07' && $comprobante->comprobanteRef)
    <div class="nc-ref">
        <strong>Nota de Crédito</strong> — Motivo: {{ $motivoLabel }}
        · Documento referido: <strong>{{ $comprobante->comprobanteRef->numero }}</strong>
    </div>
    @endif

    {{-- ════ INFO CLIENTE / DATOS EMISIÓN ════ --}}
    <div class="info-grid">
        <div class="info-col">
            <div class="section-title">Datos del Cliente</div>
            <div class="info-row">
                <span class="info-key">{{ $comprobante->cliente_tipo_doc === '6' ? 'RUC' : 'DNI' }}:</span>
                <span class="info-val">{{ $comprobante->cliente_num_doc }}</span>
            </div>
            <div class="info-row">
                <span class="info-key">Cliente:</span>
                <span class="info-val">{{ $comprobante->cliente_razon_social }}</span>
            </div>
            @if($comprobante->cliente_direccion)
            <div class="info-row">
                <span class="info-key">Dirección:</span>
                <span class="info-val">{{ $comprobante->cliente_direccion }}</span>
            </div>
            @endif
        </div>
        <div class="info-col">
            <div class="section-title">Datos de Emisión</div>
            <div class="info-row">
                <span class="info-key">Fecha:</span>
                <span class="info-val">{{ $fechaEmision }}</span>
            </div>
            <div class="info-row">
                <span class="info-key">Moneda:</span>
                <span class="info-val">{{ $comprobante->moneda === 'PEN' ? 'Soles (PEN)' : 'Dólares (USD)' }}</span>
            </div>
            @if($comprobante->fecha_vencimiento)
            <div class="info-row">
                <span class="info-key">Vence:</span>
                <span class="info-val">{{ $comprobante->fecha_vencimiento->format('d/m/Y') }}</span>
            </div>
            @endif
        </div>
    </div>

    {{-- ════ TABLA DE ITEMS ════ --}}
    <table class="items-table">
        <thead>
            <tr>
                <th style="width:40%; text-align:left;">Descripción</th>
                <th class="center" style="width:8%;">Unid.</th>
                <th class="right" style="width:8%;">Cant.</th>
                <th class="right" style="width:13%;">P.Unit (s/IGV)</th>
                <th class="center" style="width:8%;">IGV</th>
                <th class="right" style="width:8%;">Dto.</th>
                <th class="right" style="width:15%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($comprobante->detalles as $item)
            <tr>
                <td>
                    @if($item->codigo_producto)
                    <span style="color:#94a3b8;font-size:8px;">{{ $item->codigo_producto }} · </span>
                    @endif
                    {{ $item->descripcion }}
                </td>
                <td class="center">{{ $item->unidad_medida }}</td>
                <td class="right">{{ number_format($item->cantidad, 2) }}</td>
                <td class="right">{{ $monedaSimbolo }} {{ number_format($item->precio_unitario, 4) }}</td>
                <td class="center">
                    @if($item->tipo_afectacion_igv === '10')
                    <span class="badge-igv">18%</span>
                    @else
                    <span class="badge-exo">EXO</span>
                    @endif
                </td>
                <td class="right">
                    @if($item->descuento > 0)
                    {{ $monedaSimbolo }} {{ number_format($item->descuento, 2) }}
                    @else
                    —
                    @endif
                </td>
                <td class="right" style="font-weight:600;">{{ $monedaSimbolo }} {{ number_format($item->total_item, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- ════ TOTALES + OBSERVACIONES ════ --}}
    <div class="totales-wrap">
        <div class="obs-col">
            @if($comprobante->observaciones)
            <div class="obs-label">Observaciones</div>
            <div class="obs-box">{{ $comprobante->observaciones }}</div>
            @endif
        </div>
        <div class="tot-col">
            <table class="tot-table">
                @if($comprobante->op_gravadas > 0)
                <tr>
                    <td class="tot-key">Op. Gravadas:</td>
                    <td class="tot-val">{{ $monedaSimbolo }} {{ number_format($comprobante->op_gravadas, 2) }}</td>
                </tr>
                @endif
                @if($comprobante->op_exoneradas > 0)
                <tr>
                    <td class="tot-key">Op. Exoneradas:</td>
                    <td class="tot-val">{{ $monedaSimbolo }} {{ number_format($comprobante->op_exoneradas, 2) }}</td>
                </tr>
                @endif
                @if($comprobante->op_inafectas > 0)
                <tr>
                    <td class="tot-key">Op. Inafectas:</td>
                    <td class="tot-val">{{ $monedaSimbolo }} {{ number_format($comprobante->op_inafectas, 2) }}</td>
                </tr>
                @endif
                <tr>
                    <td class="tot-key">IGV (18%):</td>
                    <td class="tot-val">{{ $monedaSimbolo }} {{ number_format($comprobante->igv, 2) }}</td>
                </tr>
                <tr class="tot-final">
                    <td class="tot-key" style="font-size:11px;font-weight:bold;color:#1e3a8a;">TOTAL {{ $comprobante->moneda }}:</td>
                    <td class="tot-val" style="font-size:12px;font-weight:bold;color:#1e3a8a;">{{ $monedaSimbolo }} {{ number_format($comprobante->total, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>

    {{-- ════ PIE ════ --}}
    <div class="footer">
        <div class="footer-grid">
            <div class="footer-left">
                <div>Representación impresa del comprobante electrónico</div>
                @if($comprobante->sunat_codigo)
                <div style="margin-top:2px;">SUNAT: Código {{ $comprobante->sunat_codigo }} · {{ $comprobante->sunat_descripcion }}</div>
                @endif
                @if($comprobante->hash_cpe)
                <div class="hash-text">Hash: {{ $comprobante->hash_cpe }}</div>
                @endif
            </div>
            <div class="footer-right">
                <span class="estado-badge estado-{{ $comprobante->estado }}">
                    {{ strtoupper($comprobante->estado) }}
                </span>
            </div>
        </div>
    </div>

</div>
</body>
</html>
