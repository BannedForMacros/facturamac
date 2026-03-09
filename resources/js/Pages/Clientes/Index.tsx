import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Cliente, PaginatedData } from '@/types';
import { useState } from 'react';

interface Props extends PageProps {
    clientes: PaginatedData<Cliente>;
    filters: { search?: string; tipo?: string };
}

export default function ClientesIndex({ clientes, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('clientes.index'), { search }, { preserveState: true });
    };

    const tipoLabel = (tipo: string) => {
        const map: Record<string, string> = { '6': 'RUC', '1': 'DNI', '4': 'C.E.', '7': 'Pasaporte' };
        return map[tipo] ?? tipo;
    };

    return (
        <AuthenticatedLayout header={<h1 className="text-xl font-semibold text-gray-900">Clientes</h1>}>
            <Head title="Clientes - FacturaMac" />

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por RUC, DNI o razón social..."
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-72"
                        />
                        <button type="submit" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                            Buscar
                        </button>
                        {filters.search && (
                            <Link href={route('clientes.index')} className="rounded-md px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                                Limpiar
                            </Link>
                        )}
                    </form>
                    <Link
                        href={route('clientes.create')}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Nuevo Cliente
                    </Link>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo Doc.</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nro. Documento</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Razón Social</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Teléfono</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {clientes.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        No se encontraron clientes.
                                    </td>
                                </tr>
                            )}
                            {clientes.data.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                            {tipoLabel(c.tipo_documento)}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-900">{c.numero_documento}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">{c.razon_social}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{c.email ?? '-'}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{c.telefono ?? '-'}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                href={route('clientes.edit', c.id)}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                Editar
                                            </Link>
                                            <Link
                                                href={route('comprobantes.create', { cliente_id: c.id })}
                                                className="text-sm text-green-600 hover:underline"
                                            >
                                                Facturar
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {clientes.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                        <p className="text-sm text-gray-500">
                            Mostrando {(clientes.current_page - 1) * clientes.per_page + 1} - {Math.min(clientes.current_page * clientes.per_page, clientes.total)} de {clientes.total}
                        </p>
                        <div className="flex gap-1">
                            {clientes.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
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
