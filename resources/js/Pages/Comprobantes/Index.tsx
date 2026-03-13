import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, PaginatedData } from '@/types';
import { useState, useEffect } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { Plus, Eye, Send, X } from 'lucide-react';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import Select from '@/Components/Select';
import Table from '@/Components/Table';

interface ComprobanteRow {
    id: number;
    numero: string;
    tipo_label: string;
    tipo_comprobante: string;
    cliente: string;
    cliente_num_doc: string;
    total: number;
    moneda: string;
    estado: string;
    estado_color: string;
    fecha: string;
}

interface Props extends PageProps {
    comprobantes: PaginatedData<ComprobanteRow>;
    filters: Record<string, string>;
}

const estadoVariant = (color: string): 'success' | 'info' | 'danger' | 'warning' | 'neutral' => {
    const map: Record<string, 'success' | 'info' | 'danger' | 'warning' | 'neutral'> = {
        green: 'success', blue: 'info', red: 'danger', orange: 'warning', gray: 'neutral',
    };
    return map[color] ?? 'neutral';
};

const TIPOS = [
    { value: '', label: 'Todos los tipos' },
    { value: '01', label: 'Factura' },
    { value: '03', label: 'Boleta de Venta' },
    { value: '07', label: 'Nota de Crédito' },
    { value: '08', label: 'Nota de Débito' },
];

const ESTADOS = [
    { value: '', label: 'Todos los estados' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'aceptado', label: 'Aceptado' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'anulado', label: 'Anulado' },
];

export default function ComprobantesIndex({ comprobantes, filters, flash }: Props) {
    const notify = useNotify();
    const [tipo, setTipo] = useState(filters.tipo ?? '');
    const [estado, setEstado] = useState(filters.estado ?? '');

    useEffect(() => {
        if (flash?.success) notify.success(flash.success);
        if (flash?.error) notify.error(flash.error);
    }, []);

    const applyFilter = (overrides: Record<string, string>) => {
        router.get(route('comprobantes.index'), { tipo, estado, ...overrides }, { preserveState: true });
    };

    const clearFilters = () => {
        setTipo(''); setEstado('');
        router.get(route('comprobantes.index'));
    };

    const hasFilters = !!(filters.tipo || filters.estado);

    const columns = [
        {
            key: 'numero',
            label: 'Número',
            sortable: true,
            render: (c: ComprobanteRow) => (
                <Link href={route('comprobantes.show', c.id)} className="font-mono font-semibold text-blue-600 hover:underline">
                    {c.numero}
                </Link>
            ),
        },
        { key: 'tipo_label', label: 'Tipo', sortable: true },
        {
            key: 'cliente',
            label: 'Cliente',
            sortable: true,
            render: (c: ComprobanteRow) => (
                <div>
                    <p className="text-sm font-medium text-gray-900">{c.cliente}</p>
                    <p className="text-xs text-gray-400 font-mono">{c.cliente_num_doc}</p>
                </div>
            ),
        },
        {
            key: 'total',
            label: 'Total',
            sortable: true,
            render: (c: ComprobanteRow) => (
                <span className="font-semibold tabular-nums">
                    {c.moneda === 'USD' ? '$' : 'S/'} {Number(c.total).toFixed(2)}
                </span>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            sortable: true,
            render: (c: ComprobanteRow) => (
                <Badge variant={estadoVariant(c.estado_color)}>{c.estado}</Badge>
            ),
        },
        { key: 'fecha', label: 'Fecha', sortable: true },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (c: ComprobanteRow) => (
                <div className="flex justify-center gap-1">
                    <Link href={route('comprobantes.show', c.id)}>
                        <Button variant="ghost" size="sm" icon={<Eye size={14} />}>Ver</Button>
                    </Link>
                    {c.estado === 'borrador' && (
                        <Link href={route('comprobantes.emitir', c.id)} method="post" as="button">
                            <Button variant="ghost" size="sm" icon={<Send size={14} className="text-green-600" />} className="text-green-700 hover:bg-green-50">
                                Emitir
                            </Button>
                        </Link>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Comprobantes</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{comprobantes.total} documento{comprobantes.total !== 1 ? 's' : ''} en total</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('comprobantes.create', { tipo: '03' })}>
                            <Button variant="secondary" icon={<Plus size={16} />}>Nueva Boleta</Button>
                        </Link>
                        <Link href={route('comprobantes.create', { tipo: '01' })}>
                            <Button icon={<Plus size={16} />}>Nueva Factura</Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Comprobantes - FacturaMac" />

            <div className="space-y-3">
                {/* Filtros server-side */}
                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div className="w-44">
                        <Select
                            label="Tipo"
                            options={TIPOS}
                            value={tipo}
                            onChange={(e) => {
                                setTipo(e.target.value);
                                applyFilter({ tipo: e.target.value });
                            }}
                        />
                    </div>
                    <div className="w-44">
                        <Select
                            label="Estado"
                            options={ESTADOS}
                            value={estado}
                            onChange={(e) => {
                                setEstado(e.target.value);
                                applyFilter({ estado: e.target.value });
                            }}
                        />
                    </div>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                        >
                            <X size={14} />
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Tabla con buscador client-side */}
                <Table
                    data={comprobantes.data}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Buscar por número, cliente, estado..."
                    pagination={false}
                    emptyMessage="No se encontraron comprobantes."
                />

                {/* Paginación server-side */}
                {comprobantes.last_page > 1 && (
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Página <span className="font-medium text-gray-900">{comprobantes.current_page}</span> de{' '}
                            <span className="font-medium text-gray-900">{comprobantes.last_page}</span>
                            {' · '}{comprobantes.total} registros
                        </p>
                        <div className="flex gap-1">
                            {comprobantes.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${link.active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'} ${!link.url ? 'pointer-events-none opacity-30' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
