<?php

namespace App\Http\Requests\Comprobante;

use Illuminate\Foundation\Http\FormRequest;

class StoreComprobanteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_comprobante' => 'required|in:01,03,07,08',
            'serie' => 'required|string|size:4',
            'fecha_emision' => 'required|date',
            'fecha_vencimiento' => 'nullable|date|after_or_equal:fecha_emision',
            'cliente_id' => 'required|exists:clientes,id',
            'cliente_tipo_doc' => 'required|string',
            'cliente_num_doc' => 'required|string',
            'cliente_razon_social' => 'required|string',
            'cliente_direccion' => 'nullable|string',
            'moneda' => 'required|in:PEN,USD',
            'tipo_cambio' => 'required|numeric|min:0.001',
            'observaciones'   => 'nullable|string|max:1000',
            'forma_pago'      => 'nullable|in:Contado,Credito',
            'condicion_pago'  => 'nullable|string|max:100',
            'detalles' => 'required|array|min:1',
            'detalles.*.producto_id' => 'nullable|integer',
            'detalles.*.codigo_producto' => 'nullable|string|max:50',
            'detalles.*.codigo_producto_sunat' => 'nullable|string|max:50',
            'detalles.*.descripcion' => 'required|string|max:500',
            'detalles.*.unidad_medida' => 'required|string|max:10',
            'detalles.*.cantidad' => 'required|numeric|min:0.001',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
            'detalles.*.precio_unitario_con_igv' => 'nullable|numeric|min:0',
            'detalles.*.descuento' => 'nullable|numeric|min:0',
            'detalles.*.subtotal' => 'required|numeric|min:0',
            'detalles.*.igv_item' => 'required|numeric|min:0',
            'detalles.*.total_item' => 'required|numeric|min:0',
            'detalles.*.tipo_afectacion_igv' => 'required|in:10,20,30,40',
        ];
    }

    public function messages(): array
    {
        return [
            'tipo_comprobante.required' => 'Seleccione el tipo de comprobante.',
            'serie.required' => 'Seleccione la serie.',
            'fecha_emision.required' => 'La fecha de emisión es obligatoria.',
            'cliente_id.required' => 'Seleccione un cliente.',
            'detalles.required' => 'Debe agregar al menos un producto o servicio.',
            'detalles.min' => 'Debe agregar al menos un producto o servicio.',
        ];
    }
}
