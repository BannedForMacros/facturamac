<?php

namespace App\Models;

use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    protected $fillable = [
        'tenant_id',
        'codigo',
        'descripcion',
        'unidad_medida',
        'precio_unitario',
        'afecto_igv',
        'codigo_producto_sunat',
        'activo',
    ];

    protected $casts = [
        'precio_unitario' => 'decimal:2',
        'afecto_igv' => 'boolean',
        'activo' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleComprobante::class);
    }

    public function getPrecioConIgvAttribute(): float
    {
        return $this->afecto_igv
            ? round($this->precio_unitario * 1.18, 2)
            : $this->precio_unitario;
    }
}
