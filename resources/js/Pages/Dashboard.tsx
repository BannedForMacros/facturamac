import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import Table from '@/Components/Table';
import Badge from '@/Components/UI/Badge';

interface Metrica {
    total_facturas: number;
    total_boletas: number;
    ventas_mes: string;
    ventas_mes_anterior: string;
    total_clientes: number;
    total_productos: number;
    comprobantes_rechazados: number;
}

interface UltimoComprobante {
    id: number;
    numero: string;
    tipo_label: string;
    cliente: string;
    total: number;
    estado: string;
    estado_color: string;
    fecha: string;
}

interface Props extends PageProps {
    metricas: Metrica;
    ultimos_comprobantes: UltimoComprobante[];
    tenant: { razon_social: string; ruc: string; sunat_beta: boolean };
}

const estadoVariant = (color: string): 'success' | 'info' | 'danger' | 'warning' | 'neutral' => {
    const map: Record<string, 'success' | 'info' | 'danger' | 'warning' | 'neutral'> = {
        green: 'success', blue: 'info', red: 'danger', orange: 'warning', gray: 'neutral',
    };
    return map[color] ?? 'neutral';
};

export default function Dashboard({ metricas, ultimos_comprobantes, tenant }: Props) {
    const columns = [
        {
            key: 'numero',
            label: 'Número',
            sortable: true,
            render: (c: UltimoComprobante) => (
                <Link
                    href={route('comprobantes.show', c.id)}
                    className="font-mono font-semibold text-blue-600 hover:underline"
                >
                    {c.numero}
                </Link>
            ),
        },
        { key: 'tipo_label', label: 'Tipo', sortable: true },
        { key: 'cliente', label: 'Cliente', sortable: true },
        {
            key: 'total',
            label: 'Total',
            sortable: true,
            render: (c: UltimoComprobante) => (
                <span className="font-semibold">S/ {Number(c.total).toFixed(2)}</span>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            sortable: true,
            render: (c: UltimoComprobante) => (
                <Badge variant={estadoVariant(c.estado_color)}>{c.estado}</Badge>
            ),
        },
        { key: 'fecha', label: 'Fecha', sortable: true },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">{tenant.razon_social}</h1>
                        <p className="text-sm text-gray-500">RUC: {tenant.ruc}</p>
                    </div>
                    {tenant.sunat_beta && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 border border-yellow-200">
                            Modo BETA / Pruebas SUNAT
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Dashboard - FacturaMac" />

            {/* Métricas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <MetricCard title="Facturas Emitidas" value={metricas.total_facturas.toString()} icon="📄" color="blue" />
                <MetricCard title="Boletas Emitidas" value={metricas.total_boletas.toString()} icon="🧾" color="green" />
                <MetricCard title="Ventas del Mes" value={`S/ ${metricas.ventas_mes}`} icon="💰" color="indigo" />
                <MetricCard title="Clientes Registrados" value={metricas.total_clientes.toString()} icon="👥" color="purple" />
            </div>

            {/* Acciones rápidas */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                    href={route('comprobantes.create', { tipo: '01' })}
                    className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 hover:bg-blue-100 transition-colors"
                >
                    <span className="text-2xl">📋</span>
                    <div>
                        <p className="font-semibold text-blue-900">Nueva Factura</p>
                        <p className="text-xs text-blue-600">Emitir Factura Electrónica</p>
                    </div>
                </Link>
                <Link
                    href={route('comprobantes.create', { tipo: '03' })}
                    className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 hover:bg-green-100 transition-colors"
                >
                    <span className="text-2xl">🧾</span>
                    <div>
                        <p className="font-semibold text-green-900">Nueva Boleta</p>
                        <p className="text-xs text-green-600">Emitir Boleta de Venta</p>
                    </div>
                </Link>
                <Link
                    href={route('clientes.create')}
                    className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 hover:bg-purple-100 transition-colors"
                >
                    <span className="text-2xl">➕</span>
                    <div>
                        <p className="font-semibold text-purple-900">Nuevo Cliente</p>
                        <p className="text-xs text-purple-600">Registrar cliente</p>
                    </div>
                </Link>
            </div>

            {/* Últimos comprobantes */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-900">Últimos Comprobantes</h2>
                    <Link href={route('comprobantes.index')} className="text-sm text-blue-600 hover:underline">
                        Ver todos →
                    </Link>
                </div>
                <Table
                    data={ultimos_comprobantes}
                    columns={columns}
                    searchable={false}
                    pagination={false}
                    emptyMessage="No hay comprobantes aún."
                />
            </div>
        </AuthenticatedLayout>
    );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        indigo: 'bg-indigo-50 border-indigo-200',
        purple: 'bg-purple-50 border-purple-200',
    };
    return (
        <div className={`rounded-lg border p-5 ${colorMap[color] ?? 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{title}</p>
        </div>
    );
}
