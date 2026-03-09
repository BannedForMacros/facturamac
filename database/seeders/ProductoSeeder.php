<?php

namespace Database\Seeders;

use App\Models\Producto;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('ruc', '20614911051')->first();

        $productos = [
            [
                'codigo' => 'SW001',
                'descripcion' => 'Licencia Software ERP - Anual',
                'unidad_medida' => 'ZZ',
                'precio_unitario' => 1500.00,
                'afecto_igv' => true,
            ],
            [
                'codigo' => 'SW002',
                'descripcion' => 'Licencia Software Contabilidad - Mensual',
                'unidad_medida' => 'ZZ',
                'precio_unitario' => 150.00,
                'afecto_igv' => true,
            ],
            [
                'codigo' => 'SV001',
                'descripcion' => 'Servicio de Implementación y Configuración',
                'unidad_medida' => 'HUR',
                'precio_unitario' => 80.00,
                'afecto_igv' => true,
            ],
            [
                'codigo' => 'SV002',
                'descripcion' => 'Servicio de Capacitación (por hora)',
                'unidad_medida' => 'HUR',
                'precio_unitario' => 60.00,
                'afecto_igv' => true,
            ],
            [
                'codigo' => 'MT001',
                'descripcion' => 'Soporte Técnico Mensual',
                'unidad_medida' => 'MON',
                'precio_unitario' => 200.00,
                'afecto_igv' => true,
            ],
            [
                'codigo' => 'MT002',
                'descripcion' => 'Mantenimiento Preventivo de Equipos',
                'unidad_medida' => 'ZZ',
                'precio_unitario' => 120.00,
                'afecto_igv' => true,
            ],
            [
                'codigo' => 'HW001',
                'descripcion' => 'Disco Duro SSD 1TB',
                'unidad_medida' => 'NIU',
                'precio_unitario' => 250.00,
                'afecto_igv' => true,
            ],
            [
                'codigo' => 'HW002',
                'descripcion' => 'Memoria RAM 16GB DDR4',
                'unidad_medida' => 'NIU',
                'precio_unitario' => 180.00,
                'afecto_igv' => true,
            ],
        ];

        foreach ($productos as $prod) {
            Producto::create([
                'tenant_id' => $tenant->id,
                ...$prod,
                'activo' => true,
            ]);
        }
    }
}
