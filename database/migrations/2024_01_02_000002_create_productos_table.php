<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('codigo', 50);
            $table->string('descripcion');
            $table->string('unidad_medida', 10)->default('NIU'); // Catálogo SUNAT: NIU=Unidad, ZZ=Servicio
            $table->decimal('precio_unitario', 12, 2)->default(0);
            $table->boolean('afecto_igv')->default(true);
            $table->string('codigo_producto_sunat')->nullable(); // Catálogo SUNAT
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'codigo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
