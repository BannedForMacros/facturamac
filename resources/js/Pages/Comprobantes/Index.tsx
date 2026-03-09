import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, PaginatedData } from '@/types';
import { useState, useEffect } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { Plus, Search, Eye, Send } from 'lucide-react';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Badge from '@/Components/UI/Badge';

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
    const [search, setSearch] = useState(filters.search ?? '');
    const [tipo, setTipo] = useState(filters.tipo ?? '');
    const [estado, setEstado] = useState(filters.estado ?? '');

    useEffect(() => {
        if (flash?.success) notify.success(flash.success);
        if (flash?.error) notify.error(flash.error);
    }, []);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('comprobantes.index'), {
            search, tipo, estado, ...overrides,
        }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    return (
        <AuthenticatedLayout header={<h1 className="text-xl font-semibold text-gray-900">Comprobantes Electrónicos</h1>}>
            <Head title="Comprobantes - FacturaMac" />

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Toolbar */}
                <div className="border-b border-gray-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar cliente, número..."
                                    icon={<Search size={16} />}
                                    className="w-56"
                                />
                                <Button type="submit" variant="secondary" size="md">Buscar</Button>
                            </form>
                            <Select
                                options={TIPOS}
                                value={tipo}
                                onChange={(e) => { setTipo(e.target.value); applyFilters({ tipo: e.target.value }); }}
                                className="w-40"
                            />
                            <Select
                                options={ESTADOS}
                                value={estado}
                                onChange={(e) => { setEstado(e.target.value); applyFilters({ estado: e.target.value }); }}
                                className="w-36"
                            />
                            {(filters.search || filters.tipo || filters.estado) && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearch(''); setTipo(''); setEstado('');
                                        router.get(route('comprobantes.index'));
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('comprobantes.create', { tipo: '03' })}>
                                <Button variant="secondary" icon={<Plus size={16} />}>Boleta</Button>
                            </Link>
                            <Link href={route('comprobantes.create', { tipo: '01' })}>
                                <Button icon={<Plus size={16} />}>Factura</Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Número</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cliente</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {comprobantes.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-sm text-gray-500">
                                        No se encontraron comprobantes.
                                    </td>
                                </tr>
                            )}
                            {comprobantes.data.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <Link
                                            href={route('comprobantes.show', c.id)}
                                            className="font-mono text-sm font-semibold text-blue-600 hover:underline"
                                        >
                                            {c.numero}
                                        </Link>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{c.tipo_label}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                                        <div>{c.cliente}</div>
                                        <div className="text-xs text-gray-400 font-mono">{c.cliente_num_doc}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                        {c.moneda === 'USD' ? '$' : 'S/'} {Number(c.total).toFixed(2)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <Badge variant={estadoVariant(c.estado_color)}>
                                            {c.estado}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.fecha}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <div className="flex justify-center gap-1">
                                            <Link href={route('comprobantes.show', c.id)}>
                                                <Button variant="ghost" size="sm" icon={<Eye size={14} />}>Ver</Button>
                                            </Link>
                                            {c.estado === 'borrador' && (
                                                <Link
                                                    href={route('comprobantes.emitir', c.id)}
                                                    method="post"
                                                    as="button"
                                                >
                                                    <Button variant="ghost" size="sm" icon={<Send size={14} className="text-green-600" />} className="text-green-700 hover:bg-green-50">
                                                        Emitir
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {comprobantes.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                        <p className="text-sm text-gray-500">
                            {(comprobantes.current_page - 1) * comprobantes.per_page + 1}–{Math.min(comprobantes.current_page * comprobantes.per_page, comprobantes.total)} de {comprobantes.total}
                        </p>
                        <div className="flex gap-1">
                            {comprobantes.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
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
