<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comprobantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('tipo_comprobante', 2); // 01=Factura, 03=Boleta, 07=NC, 08=ND
            $table->string('serie', 4);
            $table->integer('correlativo');
            $table->date('fecha_emision');
            $table->date('fecha_vencimiento')->nullable();

            // Cliente
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->string('cliente_tipo_doc', 2); // snapshot
            $table->string('cliente_num_doc', 20); // snapshot
            $table->string('cliente_razon_social'); // snapshot
            $table->string('cliente_direccion')->nullable(); // snapshot

            // Moneda
            $table->string('moneda', 3)->default('PEN'); // PEN, USD
            $table->decimal('tipo_cambio', 8, 3)->default(1.000);

            // Totales
            $table->decimal('op_gravadas', 12, 2)->default(0);
            $table->decimal('op_exoneradas', 12, 2)->default(0);
            $table->decimal('op_inafectas', 12, 2)->default(0);
            $table->decimal('descuento_global', 12, 2)->default(0);
            $table->decimal('igv', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);

            // Estado
            $table->string('estado')->default('borrador'); // borrador, enviado, aceptado, rechazado, anulado

            // SUNAT
            $table->text('xml_firmado')->nullable();
            $table->text('cdr_respuesta')->nullable();
            $table->string('hash_cpe')->nullable();
            $table->string('sunat_codigo')->nullable(); // código respuesta SUNAT
            $table->text('sunat_descripcion')->nullable();

            // Archivos
            $table->string('enlace_pdf')->nullable();
            $table->string('enlace_xml')->nullable();

            // Observaciones
            $table->text('observaciones')->nullable();

            // Para notas de crédito/débito: referencia al comprobante original
            $table->foreignId('comprobante_ref_id')->nullable()->constrained('comprobantes')->nullOnDelete();
            $table->string('motivo_nota')->nullable();

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['tenant_id', 'tipo_comprobante', 'serie', 'correlativo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comprobantes');
    }
};
