<?php

namespace App\Http\Requests\Cliente;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_documento' => 'required|in:1,4,6,7',
            'numero_documento' => [
                'required',
                'string',
                function ($attr, $value, $fail) {
                    $tipo = $this->tipo_documento;
                    if ($tipo === '6' && !preg_match('/^\d{11}$/', $value)) {
                        $fail('El RUC debe tener exactamente 11 dígitos.');
                    }
                    if ($tipo === '1' && !preg_match('/^\d{8}$/', $value)) {
                        $fail('El DNI debe tener exactamente 8 dígitos.');
                    }
                },
                Rule::unique('clientes')
                    ->ignore($this->route('cliente'))
                    ->where(fn($q) => $q
                        ->where('tenant_id', Auth::user()->tenant_id)
                        ->where('tipo_documento', $this->tipo_documento)
                    ),
            ],
            'razon_social' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:500',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'activo' => 'boolean',
        ];
    }
}
