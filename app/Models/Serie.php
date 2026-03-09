<?php

namespace App\Models;

use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Serie extends Model
{
    protected $fillable = [
        'tenant_id',
        'tipo_comprobante',
        'serie',
        'correlativo_actual',
        'activo',
    ];

    protected $casts = [
        'correlativo_actual' => 'integer',
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

    public function getTipoLabelAttribute(): string
    {
        return match($this->tipo_comprobante) {
            '01' => 'Factura',
            '03' => 'Boleta de Venta',
            '07' => 'Nota de Crédito',
            '08' => 'Nota de Débito',
            default => 'Comprobante',
        };
    }

    public function siguienteCorrelativo(): int
    {
        $this->increment('correlativo_actual');
        return $this->correlativo_actual;
    }
}
