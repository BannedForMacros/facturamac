<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: DejaVu Sans, Arial, sans-serif; font-size:9.5px; color:#1e293b; background:#fff; }

/* ─── Cabecera ─── */
.header-wrap {
    display: table; width: 100%; border-collapse: collapse;
    border-bottom: 3px solid #1e40af; padding-bottom: 14px; margin-bottom: 14px;
}
.header-empresa { display: table-cell; vertical-align: middle; width: 58%; padding-right: 16px; }
.header-docbox  { display: table-cell; vertical-align: middle; width: 42%; text-align: center; }

.logo-img { max-height: 56px; max-width: 170px; object-fit: contain; margin-bottom: 6px; }
.empresa-nombre {
    font-size: 13.5px; font-weight: bold; color: #0f172a; text-transform: uppercase;
    letter-spacing: 0.3px; line-height: 1.2;
}
.empresa-ruc  { font-size: 10px; color: #334155; margin-top: 3px; }
.empresa-addr { font-size: 8.5px; color: #64748b; margin-top: 2px; line-height: 1.5; }

.doc-box {
    border: 2px solid #1e40af; border-radius: 8px;
    padding: 12px 16px; background: #eff6ff;
}
.doc-tipo   { font-size: 11px; font-weight: bold; color: #1e40af; text-transform: uppercase; letter-spacing: 0.6px; }
.doc-serie  { font-size: 17px; font-weight: bold; color: #0f172a; font-family: "Courier New", monospace; margin: 5px 0 3px; }
.doc-fecha  { font-size: 8.5px; color: #64748b; }
.doc-moneda { font-size: 8.5px; color: #64748b; margin-top: 2px; }

/* NC reference */
.nc-alert {
    display: table; width: 100%; margin-bottom: 12px;
    background: #fef9c3; border: 1px solid #eab308;
    border-radius: 5px; padding: 7px 12px; font-size: 8.5px; color: #713f12;
}

/* ─── Cliente + emisión ─── */
.section-grid { display: table; width: 100%; margin-bottom: 12px; }
.section-col  { display: table-cell; vertical-align: top; }
.section-col-left  { width: 57%; padding-right: 12px; }
.section-col-right { width: 43%; }

.section-box {
    border: 1px solid #e2e8f0; border-radius: 5px; padding: 9px 11px;
    background: #f8fafc;
}
.section-head {
    font-size: 7.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px;
    color: #1e40af; margin-bottom: 6px; padding-bottom: 4px;
    border-bottom: 1px solid #e2e8f0;
}
.kv-row { display: table; width: 100%; margin-bottom: 3.5px; }
.kv-k { display: table-cell; width: 85px; font-size: 8.5px; color: #64748b; }
.kv-v { display: table-cell; font-size: 8.5px; font-weight: 600; color: #0f172a; }

/* ─── Tabla items ─── */
.items-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
.items-table thead tr {
    background: #1e40af; color: #ffffff;
}
.items-table thead th {
    padding: 7px 9px; font-size: 8px; font-weight: bold;
    text-transform: uppercase; letter-spacing: 0.5px;
}
.items-table tbody tr { border-bottom: 1px solid #f1f5f9; }
.items-table tbody tr:nth-child(even) { background: #f8fafc; }
.items-table td { padding: 6px 9px; font-size: 9px; vertical-align: middle; }
.r { text-align: right; }
.c { text-align: center; }

.badge-afecto { background:#dbeafe; color:#1d4ed8; padding:1px 6px; border-radius:10px; font-size:7.5px; font-weight:700; }
.badge-exo    { background:#f1f5f9; color:#64748b; padding:1px 6px; border-radius:10px; font-size:7.5px; }

/* ─── Bloque inferior: obs + totales ─── */
.bottom-wrap { display: table; width: 100%; margin-bottom: 14px; }
.obs-cell  { display: table-cell; vertical-align: top; width: 55%; padding-right: 14px; }
.tot-cell  { display: table-cell; vertical-align: top; width: 45%; }

.obs-box {
    border: 1px solid #e2e8f0; border-radius: 5px; padding: 9px 11px;
    background: #f8fafc; min-height: 58px; font-size: 8.5px; color: #475569;
}
.obs-head { font-size: 7.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 5px; }

.tot-table { width: 100%; border-collapse: collapse; }
.tot-table td { padding: 3.5px 8px; font-size: 9px; }
.tot-label { color: #64748b; }
.tot-value { text-align: right; font-weight: 600; color: #0f172a; }
.tot-divider td { border-top: 1.5px solid #1e40af; padding-top: 6px !important; }
.tot-total .tot-label { font-size: 11px; font-weight: bold; color: #1e40af; }
.tot-total .tot-value { font-size: 12px; font-weight: bold; color: #1e40af; }

/* ─── Pie con QR ─── */
.footer-wrap {
    display: table; width: 100%; border-top: 2px solid #e2e8f0;
    padding-top: 10px;
}
.footer-qr   { display: table-cell; vertical-align: middle; width: 110px; }
.footer-info { display: table-cell; vertical-align: middle; padding-left: 14px; }
.footer-legal { font-size: 7.5px; color: #94a3b8; line-height: 1.6; }
.footer-legal strong { color: #64748b; }
.qr-img { width: 90px; height: 90px; }
.qr-label { font-size: 6.5px; color: #94a3b8; text-align: center; margin-top: 3px; }

/* Watermark anulado */
.watermark {
    position: fixed; top: 40%; left: 10%; width: 80%;
    text-align: center; font-size: 72px; font-weight: bold;
    color: rgba(239,68,68,0.12); text-transform: uppercase;
    transform: rotate(-35deg); pointer-events: none; z-index: 0;
    letter-spacing: 10px;
}
</style>
</head>
<body>

@if($comprobante->estado === 'anulado')
<div class="watermark">ANULADO</div>
@endif

<div style="padding: 22px 28px;">

{{-- ══════ CABECERA ══════ --}}
<div class="header-wrap">
    <div class="header-empresa">
        @if($logoUrl)
            <img src="{{ $logoUrl }}" class="logo-img" alt="Logo">
        @endif
        <div class="empresa-nombre">{{ $tenant->razon_social }}</div>
        <div class="empresa-ruc">RUC: <strong>{{ $tenant->ruc }}</strong></div>
        <div class="empresa-addr">{{ $tenant->direccion }}</div>
        @if($tenant->departamento)
        <div class="empresa-addr">{{ $tenant->departamento }} &mdash; {{ $tenant->provincia }} &mdash; {{ $tenant->distrito }}</div>
        @endif
        @if($tenant->email)
        <div class="empresa-addr">{{ $tenant->email }}</div>
        @endif
    </div>
    <div class="header-docbox">
        <div class="doc-box">
            <div class="doc-tipo">{{ $tipoLabel }}</div>
            <div class="doc-serie">{{ $numero }}</div>
            <div class="doc-fecha">Fecha: {{ $fechaEmision }}</div>
            <div class="doc-moneda">Moneda: {{ $comprobante->moneda === 'PEN' ? 'Soles (PEN)' : 'Dólares (USD)' }}</div>
        </div>
    </div>
</div>

{{-- NC referencia --}}
@if($esNc = ($comprobante->tipo_comprobante === '07' && $comprobante->comprobanteRef))
<div class="nc-alert">
    <strong>Nota de Crédito</strong> &mdash;
    Motivo: {{ $motivoLabel }} &mdash;
    Documento referido: <strong>{{ $comprobante->comprobanteRef->numero }}</strong>
    ({{ $comprobante->comprobanteRef->tipo_label }})
</div>
@endif

{{-- ══════ CLIENTE + DATOS EMISIÓN ══════ --}}
<div class="section-grid">
    <div class="section-col section-col-left">
        <div class="section-box">
            <div class="section-head">Datos del Adquiriente / Cliente</div>
            <div class="kv-row">
                <span class="kv-k">{{ $comprobante->cliente_tipo_doc === '6' ? 'RUC' : 'DNI / Doc.' }}:</span>
                <span class="kv-v">{{ $comprobante->cliente_num_doc }}</span>
            </div>
            <div class="kv-row">
                <span class="kv-k">Razón Social:</span>
                <span class="kv-v">{{ $comprobante->cliente_razon_social }}</span>
            </div>
            @if($comprobante->cliente_direccion)
            <div class="kv-row">
                <span class="kv-k">Dirección:</span>
                <span class="kv-v">{{ $comprobante->cliente_direccion }}</span>
            </div>
            @endif
        </div>
    </div>
    <div class="section-col section-col-right">
        <div class="section-box">
            <div class="section-head">Datos del Comprobante</div>
            <div class="kv-row">
                <span class="kv-k">Fecha Emisión:</span>
                <span class="kv-v">{{ $fechaEmision }}</span>
            </div>
            @if($comprobante->fecha_vencimiento)
            <div class="kv-row">
                <span class="kv-k">F. Vencimiento:</span>
                <span class="kv-v">{{ $comprobante->fecha_vencimiento->format('d/m/Y') }}</span>
            </div>
            @endif
            <div class="kv-row">
                <span class="kv-k">Moneda:</span>
                <span class="kv-v">{{ $comprobante->moneda === 'PEN' ? 'PEN - Soles' : 'USD - Dólares' }}</span>
            </div>
            @if($comprobante->moneda !== 'PEN')
            <div class="kv-row">
                <span class="kv-k">Tipo Cambio:</span>
                <span class="kv-v">{{ number_format($comprobante->tipo_cambio, 3) }}</span>
            </div>
            @endif
        </div>
    </div>
</div>

{{-- ══════ ITEMS ══════ --}}
<table class="items-table">
    <thead>
        <tr>
            <th style="text-align:left; width:38%;">Descripción</th>
            <th class="c" style="width:7%;">Unid.</th>
            <th class="r" style="width:8%;">Cant.</th>
            <th class="r" style="width:12%;">P. Unit.</th>
            <th class="c" style="width:7%;">Afect.</th>
            <th class="r" style="width:10%;">Dcto.</th>
            <th class="r" style="width:9%;">V. Venta</th>
            <th class="r" style="width:9%;">Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($comprobante->detalles as $item)
        <tr>
            <td>
                @if($item->codigo_producto)
                <span style="color:#94a3b8; font-size:7.5px;">{{ $item->codigo_producto }} &middot; </span>
                @endif
                {{ $item->descripcion }}
            </td>
            <td class="c">{{ $item->unidad_medida }}</td>
            <td class="r">{{ number_format($item->cantidad, 2) }}</td>
            <td class="r">{{ $monedaSimbolo }} {{ number_format($item->precio_unitario, 4) }}</td>
            <td class="c">
                @if($item->tipo_afectacion_igv === '10')
                    <span class="badge-afecto">GRAV</span>
                @else
                    <span class="badge-exo">EXON</span>
                @endif
            </td>
            <td class="r">
                @if($item->descuento > 0)
                    {{ $monedaSimbolo }} {{ number_format($item->descuento, 2) }}
                @else
                    &mdash;
                @endif
            </td>
            <td class="r">{{ $monedaSimbolo }} {{ number_format($item->subtotal, 2) }}</td>
            <td class="r" style="font-weight:700;">{{ $monedaSimbolo }} {{ number_format($item->total_item, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- ══════ OBSERVACIONES + TOTALES ══════ --}}
<div class="bottom-wrap">
    <div class="obs-cell">
        @if($comprobante->observaciones)
        <div class="obs-box">
            <div class="obs-head">Observaciones</div>
            {{ $comprobante->observaciones }}
        </div>
        @endif
    </div>
    <div class="tot-cell">
        <table class="tot-table">
            @if($comprobante->op_gravadas > 0)
            <tr>
                <td class="tot-label">Op. Gravadas:</td>
                <td class="tot-value">{{ $monedaSimbolo }} {{ number_format($comprobante->op_gravadas, 2) }}</td>
            </tr>
            @endif
            @if($comprobante->op_exoneradas > 0)
            <tr>
                <td class="tot-label">Op. Exoneradas:</td>
                <td class="tot-value">{{ $monedaSimbolo }} {{ number_format($comprobante->op_exoneradas, 2) }}</td>
            </tr>
            @endif
            @if($comprobante->op_inafectas > 0)
            <tr>
                <td class="tot-label">Op. Inafectas:</td>
                <td class="tot-value">{{ $monedaSimbolo }} {{ number_format($comprobante->op_inafectas, 2) }}</td>
            </tr>
            @endif
            <tr>
                <td class="tot-label">IGV (18%):</td>
                <td class="tot-value">{{ $monedaSimbolo }} {{ number_format($comprobante->igv, 2) }}</td>
            </tr>
            <tr class="tot-divider tot-total">
                <td class="tot-label">IMPORTE TOTAL {{ $comprobante->moneda }}:</td>
                <td class="tot-value">{{ $monedaSimbolo }} {{ number_format($comprobante->total, 2) }}</td>
            </tr>
        </table>
    </div>
</div>

{{-- ══════ PIE CON QR ══════ --}}
<div class="footer-wrap">
    <div class="footer-qr">
        @if($qrBase64)
        <img src="{{ $qrBase64 }}" class="qr-img" alt="QR">
        <div class="qr-label">Escanea para verificar</div>
        @endif
    </div>
    <div class="footer-info">
        <div class="footer-legal">
            <strong>Representación impresa del Comprobante de Pago Electrónico.</strong><br>
            Autorizado mediante Resolución de Superintendencia de SUNAT.<br>
            Para verificar la validez de este documento, escanea el código QR<br>
            o ingresa a <strong>https://e-consulta.sunat.gob.pe</strong><br><br>
            @if($comprobante->hash_cpe)
            <span style="font-size:6.5px; font-family:'Courier New',monospace; color:#cbd5e1; word-break:break-all;">
                Hash: {{ $comprobante->hash_cpe }}
            </span>
            @endif
        </div>
    </div>
</div>

</div>
</body>
</html>
