<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cliente\StoreClienteRequest;
use App\Http\Requests\Cliente\UpdateClienteRequest;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    public function index(Request $request): Response
    {
        $clientes = Cliente::query()
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('razon_social', 'ilike', "%{$s}%")
                    ->orWhere('numero_documento', 'ilike', "%{$s}%");
            }))
            ->when($request->tipo, fn($q, $t) => $q->where('tipo_documento', $t))
            ->orderBy('razon_social')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Clientes/Index', [
            'clientes' => $clientes,
            'filters' => $request->only(['search', 'tipo']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Clientes/Create');
    }

    public function store(StoreClienteRequest $request)
    {
        $data = $request->validated();
        $data['tenant_id'] = Auth::user()->tenant_id;

        $cliente = Cliente::create($data);

        return redirect()->route('clientes.index')
            ->with('success', "Cliente {$cliente->razon_social} creado correctamente.");
    }

    public function edit(Cliente $cliente): Response
    {
        return Inertia::render('Clientes/Edit', [
            'cliente' => $cliente,
        ]);
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente)
    {
        $cliente->update($request->validated());

        return redirect()->route('clientes.index')
            ->with('success', "Cliente {$cliente->razon_social} actualizado.");
    }

    public function destroy(Cliente $cliente)
    {
        $cliente->delete();
        return redirect()->route('clientes.index')
            ->with('success', 'Cliente eliminado.');
    }

    // API: Búsqueda rápida para selector en comprobantes
    public function buscar(Request $request)
    {
        $clientes = Cliente::where('activo', true)
            ->where(function ($q) use ($request) {
                $q->where('razon_social', 'ilike', '%' . $request->q . '%')
                    ->orWhere('numero_documento', 'ilike', '%' . $request->q . '%');
            })
            ->limit(10)
            ->get(['id', 'tipo_documento', 'numero_documento', 'razon_social', 'direccion', 'email']);

        return response()->json($clientes);
    }
}
