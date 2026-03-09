<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_comprobantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comprobante_id')->constrained('comprobantes')->cascadeOnDelete();
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();

            // Snapshot del producto al momento de emisión
            $table->string('codigo_producto')->nullable();
            $table->string('codigo_producto_sunat')->nullable(); // Catálogo SUNAT
            $table->string('descripcion');
            $table->string('unidad_medida', 10)->default('NIU');
            $table->decimal('cantidad', 12, 3);
            $table->decimal('precio_unitario', 12, 4); // precio sin IGV
            $table->decimal('precio_unitario_con_igv', 12, 4)->nullable();

            // Descuentos y cargos
            $table->decimal('descuento', 12, 2)->default(0);

            // Importes
            $table->decimal('subtotal', 12, 2); // valor_venta = cantidad * precio_unitario - descuento
            $table->decimal('igv_item', 12, 2)->default(0);
            $table->decimal('total_item', 12, 2);

            // Tipo de afectación SUNAT
            $table->string('tipo_afectacion_igv', 2)->default('10'); // 10=Gravado, 20=Exonerado, 30=Inafecto
            $table->decimal('porcentaje_igv', 5, 2)->default(18.00);

            $table->integer('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_comprobantes');
    }
};
