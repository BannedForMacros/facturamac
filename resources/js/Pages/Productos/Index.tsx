import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps, Producto, PaginatedData } from '@/types';
import { useState, useEffect } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Badge from '@/Components/UI/Badge';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';

interface Props extends PageProps {
    productos: PaginatedData<Producto>;
    filters: { search?: string };
}

export default function ProductosIndex({ productos, filters, flash }: Props) {
    const notify = useNotify();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
    const { delete: destroy, processing: deleting } = useForm({});

    useEffect(() => {
        if (flash?.success) notify.success(flash.success);
        if (flash?.error) notify.error(flash.error);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('productos.index'), { search }, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        destroy(route('productos.destroy', deleteTarget.id), {
            onSuccess: () => {
                notify.success(`Producto "${deleteTarget.descripcion}" eliminado.`);
                setDeleteTarget(null);
            },
            onError: () => notify.error('No se pudo eliminar el producto.'),
        });
    };

    const formatMoney = (n: number) => `S/ ${Number(n).toFixed(2)}`;

    return (
        <AuthenticatedLayout header={<h1 className="text-xl font-semibold text-gray-900">Productos y Servicios</h1>}>
            <Head title="Productos - FacturaMac" />

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por código o descripción..."
                            icon={<Search size={16} />}
                            className="w-72"
                        />
                        <Button type="submit" variant="secondary" size="md" icon={<Search size={14} />}>
                            Buscar
                        </Button>
                        {filters.search && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.get(route('productos.index'))}
                            >
                                Limpiar
                            </Button>
                        )}
                    </form>
                    <Link href={route('productos.create')}>
                        <Button icon={<Plus size={16} />}>Nuevo Producto</Button>
                    </Link>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Código</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Descripción</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Unidad</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Precio Unit. (sin IGV)</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">IGV</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {productos.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-gray-500 text-sm">
                                        No se encontraron productos.{' '}
                                        <Link href={route('productos.create')} className="text-blue-600 hover:underline">
                                            Crear el primero.
                                        </Link>
                                    </td>
                                </tr>
                            )}
                            {productos.data.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-700">{p.codigo}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">{p.descripcion}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{p.unidad_medida}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                        {formatMoney(p.precio_unitario)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <Badge variant={p.afecto_igv ? 'info' : 'neutral'}>
                                            {p.afecto_igv ? '18%' : 'Exonerado'}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <Badge variant={p.activo ? 'success' : 'neutral'}>
                                            {p.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Link href={route('productos.edit', p.id)}>
                                                <Button variant="ghost" size="sm" icon={<Pencil size={14} />}>
                                                    Editar
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                icon={<Trash2 size={14} className="text-red-500" />}
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => setDeleteTarget(p)}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {productos.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                        <p className="text-sm text-gray-500">
                            {(productos.current_page - 1) * productos.per_page + 1}–{Math.min(productos.current_page * productos.per_page, productos.total)} de {productos.total} productos
                        </p>
                        <div className="flex gap-1">
                            {productos.links.map((link, i) => (
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

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Eliminar producto"
                message={`¿Estás seguro de eliminar "${deleteTarget?.descripcion}"? Esta acción no se puede deshacer.`}
                confirmLabel="Sí, eliminar"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
