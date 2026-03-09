<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Comprobante;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = Auth::user()->tenant;

        $totalFacturas = Comprobante::where('tipo_comprobante', '01')
            ->whereIn('estado', ['aceptado', 'enviado'])
            ->count();

        $totalBoletas = Comprobante::where('tipo_comprobante', '03')
            ->whereIn('estado', ['aceptado', 'enviado'])
            ->count();

        $ventasMes = Comprobante::whereIn('estado', ['aceptado', 'enviado'])
            ->whereMonth('fecha_emision', now()->month)
            ->whereYear('fecha_emision', now()->year)
            ->sum('total');

        $ventasMesAnterior = Comprobante::whereIn('estado', ['aceptado', 'enviado'])
            ->whereMonth('fecha_emision', now()->subMonth()->month)
            ->whereYear('fecha_emision', now()->subMonth()->year)
            ->sum('total');

        $ultimosComprobantes = Comprobante::with('cliente')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'numero' => $c->numero,
                'tipo_label' => $c->tipo_label,
                'cliente' => $c->cliente_razon_social,
                'total' => $c->total,
                'estado' => $c->estado,
                'estado_color' => $c->estado_color,
                'fecha' => $c->fecha_emision->format('d/m/Y'),
            ]);

        $comprobantesRechazados = Comprobante::where('estado', 'rechazado')
            ->count();

        return Inertia::render('Dashboard', [
            'metricas' => [
                'total_facturas' => $totalFacturas,
                'total_boletas' => $totalBoletas,
                'ventas_mes' => number_format($ventasMes, 2),
                'ventas_mes_anterior' => number_format($ventasMesAnterior, 2),
                'total_clientes' => Cliente::count(),
                'total_productos' => Producto::count(),
                'comprobantes_rechazados' => $comprobantesRechazados,
            ],
            'ultimos_comprobantes' => $ultimosComprobantes,
            'tenant' => [
                'razon_social' => $tenant->razon_social,
                'ruc' => $tenant->ruc,
                'sunat_beta' => $tenant->sunat_beta,
            ],
        ]);
    }
}
