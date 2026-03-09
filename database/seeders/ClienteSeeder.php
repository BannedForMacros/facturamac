<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('ruc', '20614911051')->first();

        $clientes = [
            [
                'tipo_documento' => '6',
                'numero_documento' => '20100070970',
                'razon_social' => 'SUNAT - SUPERINTENDENCIA NACIONAL DE ADUANAS Y DE ADMINISTRACIÓN TRIBUTARIA',
                'direccion' => 'Av. Garcilazo de la Vega 1472, Lima',
                'email' => 'contacto@sunat.gob.pe',
            ],
            [
                'tipo_documento' => '6',
                'numero_documento' => '20131312955',
                'razon_social' => 'BANCO DE CREDITO DEL PERU',
                'direccion' => 'Calle Centenario 156, La Molina, Lima',
                'email' => 'info@bcp.com.pe',
            ],
            [
                'tipo_documento' => '1',
                'numero_documento' => '43210987',
                'razon_social' => 'JUAN CARLOS GARCIA LOPEZ',
                'direccion' => 'Av. Balta 123, Chiclayo',
                'email' => 'jcgarcia@gmail.com',
            ],
            [
                'tipo_documento' => '6',
                'numero_documento' => '20524760430',
                'razon_social' => 'CLARO PERU S.A.C.',
                'direccion' => 'Av. Benavides 1555, Miraflores, Lima',
            ],
        ];

        foreach ($clientes as $cliente) {
            Cliente::create([
                'tenant_id' => $tenant->id,
                ...$cliente,
                'activo' => true,
            ]);
        }
    }
}
