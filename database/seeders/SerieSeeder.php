<?php

namespace Database\Seeders;

use App\Models\Serie;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class SerieSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('ruc', '20614911051')->first();

        $series = [
            ['tipo_comprobante' => '01', 'serie' => 'F001'], // Factura
            ['tipo_comprobante' => '03', 'serie' => 'B001'], // Boleta
            ['tipo_comprobante' => '07', 'serie' => 'FC01'], // Nota de Crédito Factura
            ['tipo_comprobante' => '07', 'serie' => 'BC01'], // Nota de Crédito Boleta
            ['tipo_comprobante' => '08', 'serie' => 'FD01'], // Nota de Débito Factura
            ['tipo_comprobante' => '08', 'serie' => 'BD01'], // Nota de Débito Boleta
        ];

        foreach ($series as $serie) {
            Serie::create([
                'tenant_id' => $tenant->id,
                'tipo_comprobante' => $serie['tipo_comprobante'],
                'serie' => $serie['serie'],
                'correlativo_actual' => 0,
                'activo' => true,
            ]);
        }
    }
}
