<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: DejaVu Sans, Arial, sans-serif;
    font-size: 9pt;
    color: #000;
    background: #fff;
}

/* ─── Utilidades ─── */
.bold   { font-weight: bold; }
.small  { font-size: 7.5pt; }
.xsmall { font-size: 7pt; }
.right  { text-align: right; }
.center { text-align: center; }
.upper  { text-transform: uppercase; }

/* ─── Página ─── */
.page { padding: 18mm 15mm 12mm 15mm; }

/* ════════════════════════════════
   CABECERA
════════════════════════════════ */
.header-table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
.header-empresa { vertical-align: top; width: 62%; padding-right: 6mm; }
.header-docbox  { vertical-align: top; width: 38%; }

/* Logo */
.logo { max-height: 18mm; max-width: 50mm; margin-bottom: 2mm; }
.empresa-nombre { font-size: 11pt; font-weight: bold; text-transform: uppercase; line-height: 1.2; }
.empresa-sub    { font-size: 8pt; margin-top: 1mm; line-height: 1.5; color: #222; }

/* Recuadro del documento — borde doble como las facturas reales */
.docbox-outer {
    border: 2.5pt solid #000;
    padding: 2pt;
}
.docbox-inner {
    border: 1pt solid #000;
    padding: 6pt 8pt;
    text-align: center;
}
.docbox-ruc   { font-size: 8pt; font-weight: bold; margin-bottom: 3pt; }
.docbox-tipo  { font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3pt; }
.docbox-serie { font-size: 13pt; font-weight: bold; font-family: "Courier New", monospace; margin: 4pt 0 2pt; }

/* ════════════════════════════════
   CLIENTE / DATOS EMISION
════════════════════════════════ */
.datos-table {
    width: 100%; border-collapse: collapse;
    border: 1pt solid #000;
    margin-bottom: 4mm;
}
.datos-table td { padding: 2.5pt 5pt; font-size: 8.5pt; }
.datos-table .lbl { font-weight: bold; white-space: nowrap; width: 1px; }
.datos-divider { border-left: 1pt solid #000; }
.datos-row-border { border-top: 0.5pt solid #ccc; }

/* ════════════════════════════════
   TABLA DE ITEMS
════════════════════════════════ */
.items-table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
.items-table th, .items-table td { border: 0.5pt solid #000; padding: 3pt 4pt; }

.items-table thead th {
    background: #000;
    color: #fff;
    font-size: 7.5pt;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
}
.items-table thead th:first-child { text-align: left; }

.items-table tbody td { font-size: 8.5pt; vertical-align: top; }
.items-table tbody tr:nth-child(even) td { background: #f7f7f7; }

/* ════════════════════════════════
   TOTALES + OBSERVACIONES
════════════════════════════════ */
.bottom-table { width: 100%; border-collapse: collapse; margin-bottom: 5mm; }
.obs-cell { vertical-align: top; width: 55%; padding-right: 5mm; }
.tot-cell { vertical-align: top; width: 45%; }

.obs-box { border: 0.5pt solid #000; padding: 4pt 6pt; min-height: 18mm; font-size: 8pt; line-height: 1.5; }
.obs-lbl  { font-size: 7pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2pt; }

.tot-table { width: 100%; border-collapse: collapse; border: 0.5pt solid #000; }
.tot-table td { padding: 2.5pt 5pt; font-size: 8.5pt; border-bottom: 0.5pt solid #ddd; }
.tot-table .tot-lbl { }
.tot-table .tot-val { text-align: right; font-weight: bold; border-left: 0.5pt solid #000; }
.tot-table .tot-grand td { border-top: 1.5pt solid #000; border-bottom: none; font-size: 9.5pt; font-weight: bold; }

/* Son: (monto en letras) */
.monto-letras { border: 0.5pt solid #000; padding: 3pt 5pt; font-size: 7.5pt; margin-bottom: 4mm; }
.monto-letras span { font-weight: bold; }

/* ════════════════════════════════
   PIE — QR + LEGAL
════════════════════════════════ */
.footer-table { width: 100%; border-collapse: collapse; border-top: 1pt solid #000; padding-top: 3mm; }
.footer-qr   { vertical-align: middle; width: 32mm; }
.footer-info { vertical-align: middle; padding-left: 5mm; font-size: 7.5pt; line-height: 1.6; color: #333; }
.qr-img      { width: 28mm; height: 28mm; }
.qr-lbl      { font-size: 6pt; text-align: center; margin-top: 1mm; }

/* NC referencia */
.nc-box {
    border: 0.5pt solid #000; border-left: 3pt solid #000;
    padding: 3pt 6pt; margin-bottom: 4mm; font-size: 8pt;
}

/* Anulado: marca de agua */
.watermark {
    position: fixed; top: 42%; left: 8%; width: 84%;
    text-align: center; font-size: 80pt; font-weight: bold;
    color: rgba(0,0,0,0.07); text-transform: uppercase;
    transform: rotate(-35deg); letter-spacing: 8pt; pointer-events: none;
}
</style>
</head>
<body>

@if($comprobante->estado === 'anulado')
<div class="watermark">ANULADO</div>
@endif

<div class="page">

{{-- ══════════════════════════════════
     CABECERA
══════════════════════════════════ --}}
<table class="header-table">
<tr>
    <td class="header-empresa">
        @if($logoUrl)
        <div><img src="{{ $logoUrl }}" class="logo" alt="Logo"></div>
        @endif
        <div class="empresa-nombre">{{ $tenant->razon_social }}</div>
        <div class="empresa-sub">
            RUC: <strong>{{ $tenant->ruc }}</strong><br>
            {{ $tenant->direccion }}
            @if($tenant->departamento)
            <br>{{ $tenant->departamento }}
            @if($tenant->provincia) – {{ $tenant->provincia }}@endif
            @if($tenant->distrito) – {{ $tenant->distrito }}@endif
            @endif
            @if($tenant->email)<br>{{ $tenant->email }}@endif
        </div>
    </td>
    <td class="header-docbox">
        <div class="docbox-outer">
            <div class="docbox-inner">
                <div class="docbox-ruc">R.U.C. {{ $tenant->ruc }}</div>
                <div class="docbox-tipo">{{ $tipoLabel }}</div>
                <div class="docbox-serie">{{ $numero }}</div>
            </div>
        </div>
    </td>
</tr>
</table>

{{-- NC referencia --}}
@if($comprobante->tipo_comprobante === '07' && $comprobante->comprobanteRef)
<div class="nc-box">
    <span class="bold">Nota de Crédito</span> — Motivo: {{ $motivoLabel }}
    &nbsp;·&nbsp; Documento afectado: <span class="bold">{{ $comprobante->comprobanteRef->numero }}</span>
    ({{ $comprobante->comprobanteRef->tipo_label }})
</div>
@endif

{{-- ══════════════════════════════════
     DATOS CLIENTE / COMPROBANTE
══════════════════════════════════ --}}
<table class="datos-table">
    <tr>
        <td class="lbl">Señor(es):</td>
        <td colspan="3"><span class="bold">{{ $comprobante->cliente_razon_social }}</span></td>
        <td class="lbl datos-divider">Fecha emisión:</td>
        <td>{{ $fechaEmision }}</td>
    </tr>
    <tr class="datos-row-border">
        <td class="lbl">{{ $comprobante->cliente_tipo_doc === '6' ? 'R.U.C.' : 'DNI / Doc.' }}:</td>
        <td>{{ $comprobante->cliente_num_doc }}</td>
        <td class="lbl datos-divider">Moneda:</td>
        <td>{{ $comprobante->moneda === 'PEN' ? 'SOLES (PEN)' : 'DÓLARES (USD)' }}</td>
        <td class="lbl datos-divider">Forma de pago:</td>
        <td class="bold">{{ $comprobante->forma_pago ?? 'Contado' }}</td>
    </tr>
    @if($comprobante->cliente_direccion)
    <tr class="datos-row-border">
        <td class="lbl">Dirección:</td>
        <td colspan="3">{{ $comprobante->cliente_direccion }}</td>
        <td class="lbl datos-divider">
            @if($comprobante->forma_pago === 'Credito' && $comprobante->fecha_vencimiento)
            F. Vencimiento:
            @elseif($comprobante->moneda !== 'PEN')
            Tipo cambio:
            @endif
        </td>
        <td>
            @if($comprobante->forma_pago === 'Credito' && $comprobante->fecha_vencimiento)
            {{ $comprobante->fecha_vencimiento->format('d/m/Y') }}
            @elseif($comprobante->moneda !== 'PEN')
            {{ number_format($comprobante->tipo_cambio, 3) }}
            @endif
        </td>
    </tr>
    @endif
</table>

{{-- ══════════════════════════════════
     TABLA DE ITEMS
══════════════════════════════════ --}}
<table class="items-table">
    <thead>
        <tr>
            <th style="width:3%; text-align:center;">N°</th>
            <th style="width:8%; text-align:left;">Código</th>
            <th style="width:33%; text-align:left;">Descripción</th>
            <th style="width:5%;">U.M.</th>
            <th style="width:7%;">Cant.</th>
            <th style="width:10%;">P. Unit.</th>
            <th style="width:7%;">Afect.</th>
            <th style="width:8%;">Dscto.</th>
            <th style="width:9%;">V. Venta</th>
            <th style="width:10%;">Imp. Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($comprobante->detalles as $i => $item)
        <tr>
            <td class="center">{{ $i + 1 }}</td>
            <td class="xsmall">{{ $item->codigo_producto ?? '—' }}</td>
            <td>{{ $item->descripcion }}</td>
            <td class="center">{{ $item->unidad_medida }}</td>
            <td class="right">{{ number_format($item->cantidad, 2) }}</td>
            <td class="right">{{ number_format($item->precio_unitario, 4) }}</td>
            <td class="center xsmall">
                {{ $item->tipo_afectacion_igv === '10' ? 'Gravado' : 'Exonerado' }}
            </td>
            <td class="right">
                {{ $item->descuento > 0 ? number_format($item->descuento, 2) : '—' }}
            </td>
            <td class="right">{{ number_format($item->subtotal, 2) }}</td>
            <td class="right bold">{{ number_format($item->total_item, 2) }}</td>
        </tr>
        @endforeach
        {{-- filas vacías para rellenar (mínimo visual) --}}
        @for($r = count($comprobante->detalles); $r < 5; $r++)
        <tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        @endfor
    </tbody>
</table>

{{-- ══════════════════════════════════
     MONTO EN LETRAS
══════════════════════════════════ --}}
<div class="monto-letras">
    Son: <span>{{ $montoLetras }}</span>
</div>

{{-- ══════════════════════════════════
     OBSERVACIONES + TOTALES
══════════════════════════════════ --}}
<table class="bottom-table">
<tr>
    <td class="obs-cell">
        <div class="obs-box">
            <div class="obs-lbl">Observaciones / Condiciones:</div>
            {{ $comprobante->observaciones ?? '' }}
        </div>
    </td>
    <td class="tot-cell">
        <table class="tot-table">
            @if($comprobante->op_gravadas > 0)
            <tr>
                <td class="tot-lbl">Op. Gravadas:</td>
                <td class="tot-val">{{ $monedaSimbolo }} {{ number_format($comprobante->op_gravadas, 2) }}</td>
            </tr>
            @endif
            @if($comprobante->op_exoneradas > 0)
            <tr>
                <td class="tot-lbl">Op. Exoneradas:</td>
                <td class="tot-val">{{ $monedaSimbolo }} {{ number_format($comprobante->op_exoneradas, 2) }}</td>
            </tr>
            @endif
            @if($comprobante->op_inafectas > 0)
            <tr>
                <td class="tot-lbl">Op. Inafectas:</td>
                <td class="tot-val">{{ $monedaSimbolo }} {{ number_format($comprobante->op_inafectas, 2) }}</td>
            </tr>
            @endif
            @if($comprobante->descuento_global > 0)
            <tr>
                <td class="tot-lbl">Dscto. Global:</td>
                <td class="tot-val">– {{ $monedaSimbolo }} {{ number_format($comprobante->descuento_global, 2) }}</td>
            </tr>
            @endif
            <tr>
                <td class="tot-lbl">I.G.V. (18%):</td>
                <td class="tot-val">{{ $monedaSimbolo }} {{ number_format($comprobante->igv, 2) }}</td>
            </tr>
            <tr class="tot-grand">
                <td class="tot-lbl">IMPORTE TOTAL:</td>
                <td class="tot-val">{{ $monedaSimbolo }} {{ number_format($comprobante->total, 2) }}</td>
            </tr>
        </table>
    </td>
</tr>
</table>

{{-- ══════════════════════════════════
     PIE: QR + TEXTO LEGAL
══════════════════════════════════ --}}
<table class="footer-table">
<tr>
    <td class="footer-qr">
        @if($qrBase64)
        <img src="{{ $qrBase64 }}" class="qr-img" alt="QR SUNAT">
        <div class="qr-lbl">Representación Impresa del CPE</div>
        @endif
    </td>
    <td class="footer-info">
        Este documento es la representación impresa de un Comprobante de Pago Electrónico.<br>
        Su validez puede ser verificada en el portal de SUNAT:<br>
        <strong>https://e-consulta.sunat.gob.pe</strong><br><br>
        Comprobante autorizado mediante Resolución de Superintendencia N° 097-2012/SUNAT<br>
        y modificatorias.
    </td>
</tr>
</table>

</div>
</body>
</html>
