<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
    font-family: DejaVu Sans, Arial, sans-serif;
    font-size: 8px;
    color: #000;
    background: #fff;
    width: 216pt; /* 76mm aprox imprimible dentro de 80mm */
}
.wrap { padding: 4px 6px; }

/* ─── Cabecera ─── */
.center { text-align: center; }
.logo-ticket { max-width: 120px; max-height: 40px; object-fit: contain; margin-bottom: 4px; }
.empresa-nombre { font-size: 10px; font-weight: bold; text-transform: uppercase; }
.empresa-ruc    { font-size: 8px; margin-top: 1px; }
.empresa-addr   { font-size: 7.5px; color: #333; margin-top: 1px; line-height: 1.4; }

.separator-solid { border: none; border-top: 1px solid #000; margin: 5px 0; }
.separator-dash  { border: none; border-top: 1px dashed #555; margin: 4px 0; }

/* ─── Documento ─── */
.doc-tipo   { font-size: 9px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
.doc-serie  { font-size: 12px; font-weight: bold; font-family: "Courier New", monospace; }
.doc-fecha  { font-size: 7.5px; color: #333; margin-top: 2px; }

/* ─── Cliente ─── */
.cliente-section { margin: 5px 0; font-size: 7.5px; }
.label { font-weight: bold; }

/* ─── Items ─── */
.items-head { display: table; width: 100%; font-size: 7px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 2px; }
.item-row   { display: table; width: 100%; font-size: 7.5px; margin-bottom: 1.5px; }
.col-desc   { display: table-cell; width: 55%; }
.col-cant   { display: table-cell; width: 15%; text-align: center; }
.col-price  { display: table-cell; width: 15%; text-align: right; }
.col-total  { display: table-cell; width: 15%; text-align: right; font-weight: 600; }

/* ─── Totales ─── */
.tot-row { display: table; width: 100%; margin-top: 2px; font-size: 7.5px; }
.tot-k   { display: table-cell; }
.tot-v   { display: table-cell; text-align: right; font-weight: 600; }
.tot-final .tot-k { font-size: 9.5px; font-weight: bold; }
.tot-final .tot-v { font-size: 9.5px; font-weight: bold; }

/* ─── QR ─── */
.qr-section { text-align: center; margin-top: 6px; }
.qr-ticket  { width: 80px; height: 80px; }
.qr-label   { font-size: 6.5px; color: #555; margin-top: 2px; }
.legal-text { font-size: 6.5px; color: #555; text-align: center; line-height: 1.5; margin-top: 4px; }
</style>
</head>
<body>
<div class="wrap">

    {{-- Cabecera --}}
    <div class="center">
        @if($logoUrl)
        <div><img src="{{ $logoUrl }}" class="logo-ticket" alt="Logo"></div>
        @endif
        <div class="empresa-nombre">{{ $tenant->razon_social }}</div>
        <div class="empresa-ruc">RUC: {{ $tenant->ruc }}</div>
        <div class="empresa-addr">{{ $tenant->direccion }}</div>
        @if($tenant->departamento)
        <div class="empresa-addr">{{ $tenant->departamento }}</div>
        @endif
        @if($tenant->email)
        <div class="empresa-addr">{{ $tenant->email }}</div>
        @endif
    </div>

    <hr class="separator-solid">

    <div class="center">
        <div class="doc-tipo">{{ $tipoLabel }}</div>
        <div class="doc-serie">{{ $numero }}</div>
        <div class="doc-fecha">{{ $fechaEmision }}</div>
    </div>

    <hr class="separator-solid">

    {{-- Cliente --}}
    <div class="cliente-section">
        <div>
            <span class="label">{{ $comprobante->cliente_tipo_doc === '6' ? 'RUC' : 'DNI' }}:</span>
            {{ $comprobante->cliente_num_doc }}
        </div>
        <div>
            <span class="label">Cliente:</span>
            {{ $comprobante->cliente_razon_social }}
        </div>
        @if($comprobante->cliente_direccion)
        <div>
            <span class="label">Dir.:</span>
            {{ $comprobante->cliente_direccion }}
        </div>
        @endif
    </div>

    {{-- NC referencia --}}
    @if($comprobante->tipo_comprobante === '07' && $comprobante->comprobanteRef)
    <hr class="separator-dash">
    <div style="font-size:7px; text-align:center;">
        NC - {{ $motivoLabel }}<br>
        Ref: {{ $comprobante->comprobanteRef->numero }}
    </div>
    @endif

    <hr class="separator-dash">

    {{-- Items --}}
    <div class="items-head">
        <span class="col-desc">Descripción</span>
        <span class="col-cant">Cant.</span>
        <span class="col-price">P.Unit</span>
        <span class="col-total">Total</span>
    </div>

    @foreach($comprobante->detalles as $item)
    <div class="item-row">
        <span class="col-desc">{{ $item->descripcion }}</span>
        <span class="col-cant">{{ number_format($item->cantidad, 2) }}</span>
        <span class="col-price">{{ number_format($item->precio_unitario, 2) }}</span>
        <span class="col-total">{{ number_format($item->total_item, 2) }}</span>
    </div>
    @endforeach

    <hr class="separator-dash">

    {{-- Totales --}}
    @if($comprobante->op_gravadas > 0)
    <div class="tot-row">
        <span class="tot-k">Op. Gravadas:</span>
        <span class="tot-v">{{ $monedaSimbolo }} {{ number_format($comprobante->op_gravadas, 2) }}</span>
    </div>
    @endif
    @if($comprobante->op_exoneradas > 0)
    <div class="tot-row">
        <span class="tot-k">Op. Exoneradas:</span>
        <span class="tot-v">{{ $monedaSimbolo }} {{ number_format($comprobante->op_exoneradas, 2) }}</span>
    </div>
    @endif
    <div class="tot-row">
        <span class="tot-k">IGV (18%):</span>
        <span class="tot-v">{{ $monedaSimbolo }} {{ number_format($comprobante->igv, 2) }}</span>
    </div>

    <hr class="separator-solid">

    <div class="tot-row tot-final">
        <span class="tot-k">TOTAL {{ $comprobante->moneda }}:</span>
        <span class="tot-v">{{ $monedaSimbolo }} {{ number_format($comprobante->total, 2) }}</span>
    </div>

    @if($comprobante->observaciones)
    <hr class="separator-dash">
    <div style="font-size:7px; color:#555;">{{ $comprobante->observaciones }}</div>
    @endif

    {{-- QR --}}
    <hr class="separator-solid">
    <div class="qr-section">
        @if($qrBase64)
        <img src="{{ $qrBase64 }}" class="qr-ticket" alt="QR">
        <div class="qr-label">Escanea para verificar en SUNAT</div>
        @endif
        <div class="legal-text">
            Representación impresa del CPE<br>
            Consulta: e-consulta.sunat.gob.pe
        </div>
    </div>

</div>
</body>
</html>
