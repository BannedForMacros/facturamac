<?php

namespace App\Models;

use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comprobante extends Model
{
    protected $fillable = [
        'tenant_id',
        'tipo_comprobante',
        'serie',
        'correlativo',
        'fecha_emision',
        'fecha_vencimiento',
        'cliente_id',
        'cliente_tipo_doc',
        'cliente_num_doc',
        'cliente_razon_social',
        'cliente_direccion',
        'moneda',
        'tipo_cambio',
        'op_gravadas',
        'op_exoneradas',
        'op_inafectas',
        'descuento_global',
        'igv',
        'total',
        'estado',
        'xml_firmado',
        'cdr_respuesta',
        'hash_cpe',
        'sunat_codigo',
        'sunat_descripcion',
        'enlace_pdf',
        'enlace_xml',
        'observaciones',
        'forma_pago',
        'condicion_pago',
        'comprobante_ref_id',
        'motivo_nota',
        'user_id',
    ];

    protected $casts = [
        'fecha_emision' => 'date',
        'fecha_vencimiento' => 'date',
        'tipo_cambio' => 'decimal:3',
        'op_gravadas' => 'decimal:2',
        'op_exoneradas' => 'decimal:2',
        'op_inafectas' => 'decimal:2',
        'descuento_global' => 'decimal:2',
        'igv' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleComprobante::class)->orderBy('orden');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comprobanteRef(): BelongsTo
    {
        return $this->belongsTo(Comprobante::class, 'comprobante_ref_id');
    }

    public function getNumeroAttribute(): string
    {
        return "{$this->serie}-" . str_pad($this->correlativo, 8, '0', STR_PAD_LEFT);
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

    public function getEstadoColorAttribute(): string
    {
        return match($this->estado) {
            'borrador' => 'gray',
            'enviado' => 'blue',
            'aceptado' => 'green',
            'rechazado' => 'red',
            'anulado' => 'orange',
            default => 'gray',
        };
    }

    public function getNombreArchivoAttribute(): string
    {
        return "{$this->serie}-" . str_pad($this->correlativo, 8, '0', STR_PAD_LEFT);
    }
}
