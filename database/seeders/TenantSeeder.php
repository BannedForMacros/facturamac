<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        Tenant::create([
            'razon_social' => 'MACSOFT E.I.R.L.',
            'ruc' => '20614911051',
            'direccion' => 'Cal. Juan Buendia Nro. 341',
            'ubigeo' => '140101',
            'departamento' => 'LAMBAYEQUE',
            'provincia' => 'CHICLAYO',
            'distrito' => 'CHICLAYO',
            'email' => 'info@macsoft.pe',
            'telefono' => '',
            'clave_sol_usuario' => 'MODDATOS',  // Usuario demo SUNAT beta
            'clave_sol_password' => 'moddatos', // Password demo SUNAT beta
            'sunat_beta' => true,
            'activo' => true,
        ]);
    }
}
