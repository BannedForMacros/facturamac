<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // 'a4' = A4 estándar | 'ticket' = papel térmico 80mm
            $table->string('formato_impresion_factura', 10)->default('a4')->after('logo');
            $table->string('formato_impresion_boleta', 10)->default('a4')->after('formato_impresion_factura');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['formato_impresion_factura', 'formato_impresion_boleta']);
        });
    }
};
