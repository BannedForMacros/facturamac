<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('razon_social');
            $table->string('ruc', 11)->unique();
            $table->string('direccion');
            $table->string('ubigeo', 6)->nullable();
            $table->string('departamento')->nullable();
            $table->string('provincia')->nullable();
            $table->string('distrito')->nullable();
            $table->string('email')->nullable();
            $table->string('telefono')->nullable();

            // Credenciales SUNAT (encriptadas)
            $table->text('clave_sol_usuario')->nullable();
            $table->text('clave_sol_password')->nullable();

            // Certificado digital
            $table->string('certificado_pfx')->nullable(); // ruta al archivo
            $table->text('certificado_password')->nullable(); // encriptado

            // Configuración SUNAT
            $table->boolean('sunat_beta')->default(true); // true=pruebas

            // Logo
            $table->string('logo')->nullable();

            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
