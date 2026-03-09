<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class Tenant extends Model
{
    protected $fillable = [
        'razon_social',
        'ruc',
        'direccion',
        'ubigeo',
        'departamento',
        'provincia',
        'distrito',
        'email',
        'telefono',
        'clave_sol_usuario',
        'clave_sol_password',
        'certificado_pfx',
        'certificado_password',
        'sunat_beta',
        'logo',
        'formato_impresion_factura',
        'formato_impresion_boleta',
        'activo',
    ];

    protected $casts = [
        'sunat_beta' => 'boolean',
        'activo' => 'boolean',
    ];

    // Encriptar clave SOL al guardar
    public function setClaveSolUsuarioAttribute(string $value): void
    {
        $this->attributes['clave_sol_usuario'] = Crypt::encryptString($value);
    }

    public function getClaveSolUsuarioAttribute(string $value): string
    {
        try {
            return Crypt::decryptString($value);
        } catch (\Exception) {
            return $value;
        }
    }

    public function setClaveSolPasswordAttribute(string $value): void
    {
        $this->attributes['clave_sol_password'] = Crypt::encryptString($value);
    }

    public function getClaveSolPasswordAttribute(string $value): string
    {
        try {
            return Crypt::decryptString($value);
        } catch (\Exception) {
            return $value;
        }
    }

    public function setCertificadoPasswordAttribute(string $value): void
    {
        $this->attributes['certificado_password'] = Crypt::encryptString($value);
    }

    public function getCertificadoPasswordAttribute(?string $value): ?string
    {
        if (is_null($value)) return null;
        try {
            return Crypt::decryptString($value);
        } catch (\Exception) {
            return $value;
        }
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function clientes(): HasMany
    {
        return $this->hasMany(Cliente::class);
    }

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class);
    }

    public function comprobantes(): HasMany
    {
        return $this->hasMany(Comprobante::class);
    }

    public function series(): HasMany
    {
        return $this->hasMany(Serie::class);
    }

    public function getSunatWsdlAttribute(): string
    {
        return $this->sunat_beta
            ? config('sunat.wsdl_beta')
            : config('sunat.wsdl_prod');
    }
}
