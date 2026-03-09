import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect, useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { Upload, CheckCircle, AlertTriangle, Zap, ImageIcon, Trash2 } from 'lucide-react';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Card from '@/Components/UI/Card';

interface TenantData {
    id: number;
    razon_social: string;
    ruc: string;
    direccion: string;
    ubigeo?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    email?: string;
    telefono?: string;
    clave_sol_usuario?: string;
    sunat_beta: boolean;
    tiene_certificado: boolean;
    logo?: string;
    formato_impresion_factura: string;
    formato_impresion_boleta: string;
}

interface Props extends PageProps {
    tenant: TenantData;
}

export default function ConfiguracionTenant({ tenant, flash }: Props) {
    const notify = useNotify();
    const [archivoNombre, setArchivoNombre] = useState<string>('');
    const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo ? `/storage/${tenant.logo}` : null);
    const [setupBetaLoading, setSetupBetaLoading] = useState(false);

    const handleSetupBeta = () => {
        if (!confirm('¿Configurar modo beta automáticamente?\n\nEsto generará un certificado de prueba y establecerá las credenciales MODDATOS/moddatos de SUNAT.\n\nPodrás cambiar a producción cuando estés listo.')) return;
        setSetupBetaLoading(true);
        router.post(route('configuracion.setupBeta'), {}, {
            onSuccess: () => setSetupBetaLoading(false),
            onError: () => { notify.error('Error al configurar modo beta.'); setSetupBetaLoading(false); },
        });
    };

    const { data, setData, post, processing, errors } = useForm<{
        razon_social: string;
        ruc: string;
        direccion: string;
        ubigeo: string;
        departamento: string;
        provincia: string;
        distrito: string;
        email: string;
        telefono: string;
        clave_sol_usuario: string;
        clave_sol_password: string;
        certificado_password: string;
        sunat_beta: boolean;
        formato_impresion_factura: string;
        formato_impresion_boleta: string;
        certificado_pfx: File | null;
        logo: File | null;
        _method: string;
    }>({
        razon_social: tenant.razon_social,
        ruc: tenant.ruc,
        direccion: tenant.direccion,
        ubigeo: tenant.ubigeo ?? '',
        departamento: tenant.departamento ?? '',
        provincia: tenant.provincia ?? '',
        distrito: tenant.distrito ?? '',
        email: tenant.email ?? '',
        telefono: tenant.telefono ?? '',
        clave_sol_usuario: tenant.clave_sol_usuario ?? '',
        clave_sol_password: '',
        certificado_password: '',
        sunat_beta: tenant.sunat_beta,
        formato_impresion_factura: tenant.formato_impresion_factura ?? 'a4',
        formato_impresion_boleta: tenant.formato_impresion_boleta ?? 'a4',
        certificado_pfx: null,
        logo: null,
        _method: 'PUT',
    });

    useEffect(() => {
        if (flash?.success) notify.success(flash.success);
        if (flash?.error) notify.error(flash.error);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('configuracion.tenant.update'), {
            forceFormData: true,
            onSuccess: () => notify.success('Configuración guardada correctamente.'),
            onError: () => notify.error('Verifica los campos con error.'),
        });
    };

    return (
        <AuthenticatedLayout header={<h1 className="text-xl font-semibold text-gray-900">Configuración de Empresa</h1>}>
            <Head title="Configuración - FacturaMac" />

            <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
                {/* Datos de empresa */}
                <Card>
                    <Card.Header title="Datos de la Empresa" />
                    <Card.Body className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="RUC"
                                required
                                value={data.ruc}
                                onChange={(e) => setData('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                maxLength={11}
                                className="font-mono"
                                error={errors.ruc}
                            />
                            <Input
                                label="Razón Social"
                                required
                                value={data.razon_social}
                                onChange={(e) => setData('razon_social', e.target.value)}
                                error={errors.razon_social}
                            />
                        </div>
                        <Input
                            label="Dirección Fiscal"
                            required
                            value={data.direccion}
                            onChange={(e) => setData('direccion', e.target.value)}
                            error={errors.direccion}
                        />
                        <div className="grid grid-cols-3 gap-4">
                            <Input
                                label="Departamento"
                                value={data.departamento}
                                onChange={(e) => setData('departamento', e.target.value.toUpperCase())}
                                error={errors.departamento}
                            />
                            <Input
                                label="Provincia"
                                value={data.provincia}
                                onChange={(e) => setData('provincia', e.target.value.toUpperCase())}
                                error={errors.provincia}
                            />
                            <Input
                                label="Distrito"
                                value={data.distrito}
                                onChange={(e) => setData('distrito', e.target.value.toUpperCase())}
                                error={errors.distrito}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Ubigeo"
                                value={data.ubigeo}
                                onChange={(e) => setData('ubigeo', e.target.value.slice(0, 6))}
                                placeholder="140101"
                                hint="Código de 6 dígitos INEI"
                                error={errors.ubigeo}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />
                        </div>
                    </Card.Body>
                </Card>

                {/* Credenciales SUNAT */}
                <Card>
                    <Card.Header
                        title="Credenciales SUNAT (Clave SOL)"
                        subtitle="Tus credenciales se almacenan cifradas con AES-256"
                    />
                    <Card.Body className="space-y-4">
                        {/* Setup beta rápido — solo visible cuando el modo beta está activo */}
                        {data.sunat_beta && (
                            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <Zap size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-blue-900">Configuración rápida para Beta</p>
                                    <p className="text-xs text-blue-700 mt-0.5">
                                        Genera un certificado de prueba auto-firmado y activa el endpoint beta de SUNAT.
                                        Luego ingresa tu <strong>usuario y clave SOL reales</strong> (los de sunat.gob.pe) — beta usa las mismas credenciales que producción.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    icon={<Zap size={14} />}
                                    onClick={handleSetupBeta}
                                    loading={setupBetaLoading}
                                >
                                    Activar Beta
                                </Button>
                            </div>
                        )}

                        {/* Toggle Beta/Producción */}
                        <div className="flex items-center gap-3 rounded-lg border p-3 bg-yellow-50 border-yellow-200">
                            <button
                                type="button"
                                onClick={() => setData('sunat_beta', !data.sunat_beta)}
                                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${data.sunat_beta ? 'bg-yellow-500' : 'bg-green-500'}`}
                            >
                                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${data.sunat_beta ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {data.sunat_beta ? 'Modo BETA (Pruebas)' : 'Modo PRODUCCIÓN'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {data.sunat_beta
                                        ? 'Los comprobantes se envían a los servidores de prueba de SUNAT.'
                                        : 'ATENCIÓN: Los comprobantes se envían a SUNAT en producción.'}
                                </p>
                            </div>
                            {!data.sunat_beta && (
                                <AlertTriangle size={20} className="text-red-500 ml-auto shrink-0" />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Usuario SOL (RUC + usuario)"
                                value={data.clave_sol_usuario}
                                onChange={(e) => setData('clave_sol_usuario', e.target.value)}
                                placeholder="usuariosol"
                                hint="Usuario secundario SOL (sin RUC, el sistema lo agrega)"
                                error={errors.clave_sol_usuario}
                            />
                            <Input
                                label="Contraseña SOL"
                                type="password"
                                value={data.clave_sol_password}
                                onChange={(e) => setData('clave_sol_password', e.target.value)}
                                placeholder="Dejar vacío para no cambiar"
                                hint="Tu clave SOL de SUNAT"
                                error={errors.clave_sol_password}
                            />
                        </div>
                    </Card.Body>
                </Card>

                {/* Logo de la Empresa */}
                <Card>
                    <Card.Header title="Logo de la Empresa" subtitle="Se mostrará en los comprobantes PDF. Recomendado: PNG transparente, max 2MB." />
                    <Card.Body className="space-y-4">
                        <div className="flex items-start gap-6">
                            {/* Preview */}
                            <div className="shrink-0">
                                {logoPreview ? (
                                    <div className="relative">
                                        <img
                                            src={logoPreview}
                                            alt="Logo empresa"
                                            className="h-24 w-40 rounded-lg border border-gray-200 object-contain bg-gray-50 p-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setLogoPreview(null); setData('logo', null); }}
                                            className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1 text-red-500 hover:bg-red-200"
                                            title="Quitar logo"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex h-24 w-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                                        <div className="text-center">
                                            <ImageIcon size={24} className="mx-auto text-gray-300" />
                                            <p className="mt-1 text-xs text-gray-400">Sin logo</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upload */}
                            <div className="flex-1">
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    <Upload size={20} className="text-gray-400 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            {data.logo ? data.logo.name : 'Clic para seleccionar logo (PNG, JPG, SVG)'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">Máximo 2MB · Se mostrará en todos los PDF</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] ?? null;
                                            setData('logo', f);
                                            if (f) setLogoPreview(URL.createObjectURL(f));
                                        }}
                                    />
                                </label>
                                {errors.logo && <p className="mt-1 text-xs text-red-600">{errors.logo}</p>}
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Certificado Digital */}
                <Card>
                    <Card.Header title="Certificado Digital (.pfx)" subtitle="Para firma digital de los XML según estándar XMLDSig" />
                    <Card.Body className="space-y-4">
                        {tenant.tiene_certificado && (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
                                <CheckCircle size={18} className="text-green-600" />
                                <span className="text-sm text-green-800 font-medium">Certificado digital cargado y activo</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {tenant.tiene_certificado ? 'Reemplazar certificado .pfx' : 'Cargar certificado .pfx'}
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                <Upload size={20} className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    {archivoNombre || 'Clic para seleccionar archivo .pfx'}
                                </span>
                                <input
                                    type="file"
                                    accept=".pfx,.p12"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] ?? null;
                                        setData('certificado_pfx', f);
                                        setArchivoNombre(f?.name ?? '');
                                    }}
                                />
                            </label>
                            {errors.certificado_pfx && <p className="mt-1 text-xs text-red-600">{errors.certificado_pfx}</p>}
                        </div>

                        <Input
                            label="Contraseña del certificado"
                            type="password"
                            value={data.certificado_password}
                            onChange={(e) => setData('certificado_password', e.target.value)}
                            placeholder="Dejar vacío para no cambiar"
                            error={errors.certificado_password}
                        />
                    </Card.Body>
                </Card>

                {/* Formato de Impresión */}
                <Card>
                    <Card.Header
                        title="Formato de Impresión de Comprobantes"
                        subtitle="Configura el tamaño de papel para los PDF generados."
                    />
                    <Card.Body className="space-y-5">
                        {/* Factura */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Factura Electrónica</p>
                            <div className="flex gap-3">
                                {[
                                    { value: 'a4', label: 'A4', desc: 'Hoja carta estándar', icon: '📄' },
                                ].map(opt => (
                                    <label key={opt.value} className={`flex flex-1 cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors ${data.formato_impresion_factura === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="formato_factura" value={opt.value} checked={data.formato_impresion_factura === opt.value} onChange={() => setData('formato_impresion_factura', opt.value)} className="mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{opt.icon} {opt.label}</p>
                                            <p className="text-xs text-gray-500">{opt.desc}</p>
                                        </div>
                                    </label>
                                ))}
                                <div className="flex-1 rounded-lg border-2 border-dashed border-gray-100 p-3 bg-gray-50">
                                    <p className="text-xs text-gray-400">Las facturas siempre se imprimen en A4 por estándar tributario.</p>
                                </div>
                            </div>
                        </div>

                        {/* Boleta */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Boleta de Venta Electrónica</p>
                            <div className="flex gap-3">
                                {[
                                    { value: 'a4', label: 'A4', desc: 'Hoja carta estándar', icon: '📄' },
                                    { value: 'ticket', label: 'Ticket 80mm', desc: 'Impresora térmica (POS)', icon: '🧾' },
                                ].map(opt => (
                                    <label key={opt.value} className={`flex flex-1 cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors ${data.formato_impresion_boleta === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="formato_boleta" value={opt.value} checked={data.formato_impresion_boleta === opt.value} onChange={() => setData('formato_impresion_boleta', opt.value)} className="mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{opt.icon} {opt.label}</p>
                                            <p className="text-xs text-gray-500">{opt.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <div className="flex gap-3">
                    <Button type="submit" loading={processing}>
                        Guardar Configuración
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
