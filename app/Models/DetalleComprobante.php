<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleComprobante extends Model
{
    protected $table = 'detalle_comprobantes';

    protected $fillable = [
        'comprobante_id',
        'producto_id',
        'codigo_producto',
        'codigo_producto_sunat',
        'descripcion',
        'unidad_medida',
        'cantidad',
        'precio_unitario',
        'precio_unitario_con_igv',
        'descuento',
        'subtotal',
        'igv_item',
        'total_item',
        'tipo_afectacion_igv',
        'porcentaje_igv',
        'orden',
    ];

    protected $casts = [
        'cantidad' => 'decimal:3',
        'precio_unitario' => 'decimal:4',
        'precio_unitario_con_igv' => 'decimal:4',
        'descuento' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'igv_item' => 'decimal:2',
        'total_item' => 'decimal:2',
        'porcentaje_igv' => 'decimal:2',
    ];

    public function comprobante(): BelongsTo
    {
        return $this->belongsTo(Comprobante::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
