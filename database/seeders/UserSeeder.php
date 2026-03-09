<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('ruc', '20614911051')->first();

        User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Administrador MacSoft',
            'email' => 'admin@macsoft.pe',
            'password' => Hash::make('password'),
            'rol' => 'admin',
            'activo' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Operador MacSoft',
            'email' => 'operador@macsoft.pe',
            'password' => Hash::make('password'),
            'rol' => 'operador',
            'activo' => true,
            'email_verified_at' => now(),
        ]);
    }
}
