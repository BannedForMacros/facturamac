<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && !$request->user()->tenant_id) {
            abort(403, 'Usuario sin empresa asignada.');
        }

        // Inyectar tenant en el request para uso en controladores
        if ($request->user() && $request->user()->tenant_id) {
            $request->merge(['_tenant' => $request->user()->tenant]);
            app()->instance('tenant', $request->user()->tenant);
        }

        return $next($request);
    }
}
