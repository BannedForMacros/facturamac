<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function edit(): Response
    {
        $tenant = Auth::user()->tenant;

        return Inertia::render('Configuracion/Tenant', [
            'tenant' => [
                'id' => $tenant->id,
                'razon_social' => $tenant->razon_social,
                'ruc' => $tenant->ruc,
                'direccion' => $tenant->direccion,
                'ubigeo' => $tenant->ubigeo,
                'departamento' => $tenant->departamento,
                'provincia' => $tenant->provincia,
                'distrito' => $tenant->distrito,
                'email' => $tenant->email,
                'telefono' => $tenant->telefono,
                'clave_sol_usuario' => $tenant->clave_sol_usuario,
                'sunat_beta' => $tenant->sunat_beta,
                'tiene_certificado' => (bool) $tenant->certificado_pfx,
                'logo' => $tenant->logo,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $tenant = Auth::user()->tenant;

        $rules = [
            'razon_social' => 'required|string|max:255',
            'ruc' => 'required|string|size:11|regex:/^\d{11}$/',
            'direccion' => 'required|string|max:500',
            'ubigeo' => 'nullable|string|size:6',
            'departamento' => 'nullable|string|max:100',
            'provincia' => 'nullable|string|max:100',
            'distrito' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'clave_sol_usuario' => 'nullable|string|max:50',
            'clave_sol_password' => 'nullable|string|max:100',
            'certificado_pfx' => 'nullable|file|mimes:pfx,p12|max:2048',
            'certificado_password' => 'nullable|string|max:255',
            'sunat_beta' => 'boolean',
            'logo' => 'nullable|image|max:2048',
        ];

        $validated = $request->validate($rules);

        $updateData = [
            'razon_social' => $validated['razon_social'],
            'ruc' => $validated['ruc'],
            'direccion' => $validated['direccion'],
            'ubigeo' => $validated['ubigeo'] ?? null,
            'departamento' => $validated['departamento'] ?? null,
            'provincia' => $validated['provincia'] ?? null,
            'distrito' => $validated['distrito'] ?? null,
            'email' => $validated['email'] ?? null,
            'telefono' => $validated['telefono'] ?? null,
            'sunat_beta' => $request->boolean('sunat_beta', true),
        ];

        if (!empty($validated['clave_sol_usuario'])) {
            $updateData['clave_sol_usuario'] = $validated['clave_sol_usuario'];
        }
        if (!empty($validated['clave_sol_password'])) {
            $updateData['clave_sol_password'] = $validated['clave_sol_password'];
        }

        // Subir certificado .pfx
        if ($request->hasFile('certificado_pfx')) {
            $certDir = config('sunat.cert_path') . '/' . $tenant->id;
            $path = $request->file('certificado_pfx')->storeAs(
                $certDir,
                'certificado.pfx',
                'local_private'
            );
            $updateData['certificado_pfx'] = $path;
        }

        if (!empty($validated['certificado_password'])) {
            $updateData['certificado_password'] = $validated['certificado_password'];
        }

        // Subir logo
        if ($request->hasFile('logo')) {
            if ($tenant->logo) {
                Storage::disk('public')->delete($tenant->logo);
            }
            $updateData['logo'] = $request->file('logo')->store('logos', 'public');
        }

        $tenant->update($updateData);

        return redirect()->route('configuracion.tenant')
            ->with('success', 'Configuración guardada correctamente.');
    }

    public function setupBeta()
    {
        $tenant = Auth::user()->tenant;

        // Generar certificado auto-firmado con openssl
        $privateKey = openssl_pkey_new([
            'digest_alg'       => 'sha256',
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        $dn = [
            'CN' => 'CERT BETA ' . $tenant->ruc,
            'O'  => $tenant->razon_social,
            'C'  => 'PE',
        ];

        $csr  = openssl_csr_new($dn, $privateKey, ['digest_alg' => 'sha256']);
        $cert = openssl_csr_sign($csr, null, $privateKey, 3650, ['digest_alg' => 'sha256']);

        $pfxContent = '';
        $password   = 'beta123';
        openssl_pkcs12_export($cert, $pfxContent, $privateKey, $password);

        // Guardar el PFX en storage privado
        $certDir  = config('sunat.cert_path') . '/' . $tenant->id;
        $certPath = $certDir . '/certificado.pfx';
        Storage::disk('local_private')->put($certPath, $pfxContent);

        $tenant->update([
            'certificado_pfx'      => $certPath,
            'certificado_password' => $password,
            'sunat_beta'           => true,
        ]);

        return redirect()->route('configuracion.tenant')
            ->with('success', 'Certificado de prueba generado y modo beta activado. Ahora ingresa tu usuario y clave SOL reales (los que usas en sunat.gob.pe) para poder emitir.');
    }
}
