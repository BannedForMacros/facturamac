<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cliente\StoreClienteRequest;
use App\Http\Requests\Cliente\UpdateClienteRequest;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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

    // API: Consulta de RUC (SUNAT) o DNI (RENIEC) vía Decolecta
    public function consultarDocumento(Request $request)
    {
        $tipo   = $request->query('tipo');
        $numero = $request->query('numero', '');
        $token  = env('DECOLECTA_TOKEN');

        if (!$token) {
            return response()->json(['error' => 'Servicio de consulta no configurado.'], 503);
        }

        if ($tipo === '6') {
            // RUC — SUNAT
            if (!preg_match('/^\d{11}$/', $numero)) {
                return response()->json(['error' => 'El RUC debe tener 11 dígitos.'], 422);
            }

            try {
                $resp = Http::timeout(8)
                    ->withToken($token)
                    ->get('https://api.decolecta.com/v1/sunat/ruc', ['numero' => $numero]);

                if ($resp->status() === 422 || $resp->status() === 404) {
                    return response()->json(['error' => 'RUC no encontrado en SUNAT.'], 404);
                }
                if (!$resp->successful()) {
                    return response()->json(['error' => 'Error al consultar SUNAT.'], 502);
                }

                $data = $resp->json();
                $estado    = strtoupper($data['estado'] ?? '');
                $condicion = strtoupper($data['condicion'] ?? '');

                $advertencia = null;
                if ($estado !== 'ACTIVO' || $condicion !== 'HABIDO') {
                    $advertencia = "Este RUC figura como {$estado} / {$condicion} en SUNAT. Verifica que sea el cliente correcto antes de guardar.";
                }

                return response()->json([
                    'razon_social' => $data['razon_social'] ?? '',
                    'direccion'    => $data['direccion'] ?? '',
                    'estado'       => $estado,
                    'condicion'    => $condicion,
                    'advertencia'  => $advertencia,
                ]);
            } catch (\Throwable $e) {
                Log::warning('Decolecta RUC error', ['numero' => $numero, 'error' => $e->getMessage()]);
                return response()->json(['error' => 'No se pudo conectar con el servicio de consulta.'], 503);
            }

        } elseif ($tipo === '1') {
            // DNI — RENIEC
            if (!preg_match('/^\d{8}$/', $numero)) {
                return response()->json(['error' => 'El DNI debe tener 8 dígitos.'], 422);
            }

            try {
                $resp = Http::timeout(8)
                    ->withToken($token)
                    ->get('https://api.decolecta.com/v1/reniec/dni', ['numero' => $numero]);

                if ($resp->status() === 422 || $resp->status() === 404) {
                    return response()->json(['error' => 'DNI no encontrado en RENIEC.'], 404);
                }
                if (!$resp->successful()) {
                    return response()->json(['error' => 'Error al consultar RENIEC.'], 502);
                }

                $data = $resp->json();

                return response()->json([
                    'razon_social' => $data['full_name'] ?? '',
                    'direccion'    => '',
                ]);
            } catch (\Throwable $e) {
                Log::warning('Decolecta DNI error', ['numero' => $numero, 'error' => $e->getMessage()]);
                return response()->json(['error' => 'No se pudo conectar con el servicio de consulta.'], 503);
            }

        } else {
            return response()->json(['error' => 'Consulta automática no disponible para este tipo de documento.'], 422);
        }
    }

    // API: Crear cliente desde modal (retorna JSON para no navegar)
    public function storeModal(StoreClienteRequest $request)
    {
        $data = $request->validated();
        $data['tenant_id'] = Auth::user()->tenant_id;

        $cliente = Cliente::create($data);

        return response()->json([
            'id'               => $cliente->id,
            'tipo_documento'   => $cliente->tipo_documento,
            'numero_documento' => $cliente->numero_documento,
            'razon_social'     => $cliente->razon_social,
            'direccion'        => $cliente->direccion,
            'email'            => $cliente->email,
            'activo'           => $cliente->activo,
        ], 201);
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
