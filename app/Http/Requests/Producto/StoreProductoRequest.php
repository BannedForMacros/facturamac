<?php

namespace App\Http\Requests\Producto;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo' => [
                'required',
                'string',
                'max:50',
                Rule::unique('productos')->where(fn($q) => $q->where('tenant_id', Auth::user()->tenant_id)),
            ],
            'descripcion' => 'required|string|max:500',
            'unidad_medida' => 'required|string|max:10',
            'precio_unitario' => 'required|numeric|min:0',
            'afecto_igv' => 'boolean',
            'codigo_producto_sunat' => 'nullable|string|max:50',
        ];
    }
}
