<?php

namespace App\Models;

use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'tenant_id',
        'tipo_documento',
        'numero_documento',
        'razon_social',
        'direccion',
        'email',
        'telefono',
        'activo',
    ];

    protected $casts = [
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

    public function comprobantes(): HasMany
    {
        return $this->hasMany(Comprobante::class);
    }

    public function getTipoDocumentoLabelAttribute(): string
    {
        return match($this->tipo_documento) {
            '6' => 'RUC',
            '1' => 'DNI',
            '4' => 'Carné de Extranjería',
            '7' => 'Pasaporte',
            default => 'Otro',
        };
    }
}
