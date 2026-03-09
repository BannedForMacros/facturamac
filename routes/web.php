<?php

use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ComprobanteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SerieController;
use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;

// Redirigir raíz al dashboard o login
Route::get('/', fn() => redirect()->route('dashboard'));

// Rutas protegidas: autenticación + tenant
Route::middleware(['auth', 'verified', 'tenant'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Perfil de usuario
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Clientes
    Route::resource('clientes', ClienteController::class)->except(['show']);
    Route::get('/clientes/buscar', [ClienteController::class, 'buscar'])->name('clientes.buscar');

    // Productos
    Route::resource('productos', ProductoController::class)->except(['show']);
    Route::get('/productos/buscar', [ProductoController::class, 'buscar'])->name('productos.buscar');

    // Comprobantes
    Route::resource('comprobantes', ComprobanteController::class)->except(['edit', 'update', 'destroy']);
    Route::post('/comprobantes/{comprobante}/emitir', [ComprobanteController::class, 'emitir'])->name('comprobantes.emitir');
    Route::post('/comprobantes/{comprobante}/anular', [ComprobanteController::class, 'anular'])->name('comprobantes.anular');
    Route::post('/comprobantes/{comprobante}/nota-credito', [ComprobanteController::class, 'storeNotaCredito'])->name('comprobantes.notaCredito');
    Route::get('/comprobantes/{comprobante}/xml', [ComprobanteController::class, 'verXml'])->name('comprobantes.xml');
    Route::get('/comprobantes/{comprobante}/pdf', [ComprobanteController::class, 'pdf'])->name('comprobantes.pdf');
    Route::post('/comprobantes/{comprobante}/consultar-sunat', [ComprobanteController::class, 'consultarSunat'])->name('comprobantes.consultarSunat');

    // Configuración
    Route::get('/configuracion/empresa', [TenantController::class, 'edit'])->name('configuracion.tenant');
    Route::put('/configuracion/empresa', [TenantController::class, 'update'])->name('configuracion.tenant.update');
    Route::post('/configuracion/setup-beta', [TenantController::class, 'setupBeta'])->name('configuracion.setupBeta');

    // Series
    Route::get('/configuracion/series', [SerieController::class, 'index'])->name('series.index');
    Route::post('/configuracion/series', [SerieController::class, 'store'])->name('series.store');
    Route::put('/configuracion/series/{serie}', [SerieController::class, 'update'])->name('series.update');
    Route::delete('/configuracion/series/{serie}', [SerieController::class, 'destroy'])->name('series.destroy');
});

require __DIR__.'/auth.php';
