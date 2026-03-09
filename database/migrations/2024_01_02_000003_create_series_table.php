<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('tipo_comprobante', 2); // 01=Factura, 03=Boleta, 07=NC, 08=ND
            $table->string('serie', 4); // F001, B001, FC01, BC01
            $table->integer('correlativo_actual')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['tenant_id', 'tipo_comprobante', 'serie']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series');
    }
};
