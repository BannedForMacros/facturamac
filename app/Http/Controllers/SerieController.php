<?php

namespace App\Http\Controllers;

use App\Models\Serie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SerieController extends Controller
{
    public function index(): Response
    {
        $series = Serie::orderBy('tipo_comprobante')->orderBy('serie')->get();

        return Inertia::render('Configuracion/Series', [
            'series' => $series->map(fn($s) => [
                ...$s->toArray(),
                'tipo_label' => $s->tipo_label,
            ]),
            'tipos_comprobante' => [
                ['codigo' => '01', 'label' => 'Factura Electrónica'],
                ['codigo' => '03', 'label' => 'Boleta de Venta'],
                ['codigo' => '07', 'label' => 'Nota de Crédito'],
                ['codigo' => '08', 'label' => 'Nota de Débito'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo_comprobante' => 'required|in:01,03,07,08',
            'serie' => [
                'required',
                'string',
                'size:4',
                'regex:/^[FBfb]\d{3}$/',
            ],
        ], [
            'serie.regex' => 'La serie debe tener formato F001, B001, etc.',
        ]);

        $serie = Serie::create([
            'tenant_id' => Auth::user()->tenant_id,
            'tipo_comprobante' => $validated['tipo_comprobante'],
            'serie' => strtoupper($validated['serie']),
            'correlativo_actual' => 0,
        ]);

        return redirect()->route('series.index')
            ->with('success', "Serie {$serie->serie} creada.");
    }

    public function update(Request $request, Serie $serie)
    {
        $validated = $request->validate([
            'correlativo_actual' => 'required|integer|min:0',
            'activo' => 'boolean',
        ]);

        $serie->update($validated);

        return redirect()->route('series.index')
            ->with('success', "Serie {$serie->serie} actualizada.");
    }

    public function destroy(Serie $serie)
    {
        $serie->delete();
        return redirect()->route('series.index')
            ->with('success', 'Serie eliminada.');
    }
}
