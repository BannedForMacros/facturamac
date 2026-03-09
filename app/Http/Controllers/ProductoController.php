<?php

namespace App\Http\Controllers;

use App\Http\Requests\Producto\StoreProductoRequest;
use App\Http\Requests\Producto\UpdateProductoRequest;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    public function index(Request $request): Response
    {
        $productos = Producto::query()
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('descripcion', 'ilike', "%{$s}%")
                    ->orWhere('codigo', 'ilike', "%{$s}%");
            }))
            ->when($request->has('activo'), fn($q) => $q->where('activo', $request->activo))
            ->orderBy('descripcion')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Productos/Create');
    }

    public function store(StoreProductoRequest $request)
    {
        $data = $request->validated();
        $data['tenant_id'] = Auth::user()->tenant_id;

        $producto = Producto::create($data);

        return redirect()->route('productos.index')
            ->with('success', "Producto '{$producto->descripcion}' creado correctamente.");
    }

    public function edit(Producto $producto): Response
    {
        return Inertia::render('Productos/Edit', [
            'producto' => $producto,
        ]);
    }

    public function update(UpdateProductoRequest $request, Producto $producto)
    {
        $producto->update($request->validated());

        return redirect()->route('productos.index')
            ->with('success', "Producto '{$producto->descripcion}' actualizado.");
    }

    public function destroy(Producto $producto)
    {
        $producto->delete();
        return redirect()->route('productos.index')
            ->with('success', 'Producto eliminado.');
    }

    // API: búsqueda para selector en emisión
    public function buscar(Request $request)
    {
        $productos = Producto::where('activo', true)
            ->where(function ($q) use ($request) {
                $q->where('descripcion', 'ilike', '%' . $request->q . '%')
                    ->orWhere('codigo', 'ilike', '%' . $request->q . '%');
            })
            ->limit(10)
            ->get(['id', 'codigo', 'descripcion', 'unidad_medida', 'precio_unitario', 'afecto_igv']);

        return response()->json($productos);
    }
}
