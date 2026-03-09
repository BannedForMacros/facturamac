import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect, useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Badge from '@/Components/UI/Badge';
import Card from '@/Components/UI/Card';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';

interface Serie {
    id: number;
    tipo_comprobante: string;
    tipo_label: string;
    serie: string;
    correlativo_actual: number;
    activo: boolean;
}

interface Props extends PageProps {
    series: Serie[];
    tipos_comprobante: { codigo: string; label: string }[];
}

export default function ConfiguracionSeries({ series, tipos_comprobante, flash }: Props) {
    const notify = useNotify();
    const [editando, setEditando] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Serie | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        tipo_comprobante: '01',
        serie: '',
    });

    const { data: editData, setData: setEditData, put, processing: saving } = useForm({
        correlativo_actual: 0,
        activo: true,
    });

    const { delete: destroy, processing: deleting } = useForm({});

    useEffect(() => {
        if (flash?.success) notify.success(flash.success);
        if (flash?.error) notify.error(flash.error);
    }, []);

    const handleCrear = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('series.store'), {
            onSuccess: () => { notify.success('Serie creada.'); reset(); },
            onError: () => notify.error('Verifica los datos.'),
        });
    };

    const handleEditar = (serie: Serie) => {
        setEditando(serie.id);
        setEditData({ correlativo_actual: serie.correlativo_actual, activo: serie.activo });
    };

    const handleGuardar = (id: number) => {
        put(route('series.update', id), {
            onSuccess: () => { notify.success('Serie actualizada.'); setEditando(null); },
            onError: () => notify.error('Error al guardar.'),
        });
    };

    const handleEliminar = () => {
        if (!deleteTarget) return;
        destroy(route('series.destroy', deleteTarget.id), {
            onSuccess: () => { notify.success(`Serie ${deleteTarget.serie} eliminada.`); setDeleteTarget(null); },
            onError: () => notify.error('No se pudo eliminar.'),
        });
    };

    const tipoLabel = (tipo: string) => tipos_comprobante.find(t => t.codigo === tipo)?.label ?? tipo;

    return (
        <AuthenticatedLayout header={<h1 className="text-xl font-semibold text-gray-900">Gestión de Series</h1>}>
            <Head title="Series - FacturaMac" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Crear nueva serie */}
                <div>
                    <Card>
                        <Card.Header title="Nueva Serie" subtitle="Registra una serie para emisión" />
                        <Card.Body>
                            <form onSubmit={handleCrear} className="space-y-4">
                                <Select
                                    label="Tipo de Comprobante"
                                    required
                                    options={tipos_comprobante.map(t => ({ value: t.codigo, label: t.label }))}
                                    value={data.tipo_comprobante}
                                    onChange={(e) => setData('tipo_comprobante', e.target.value)}
                                    error={errors.tipo_comprobante}
                                />
                                <Input
                                    label="Serie"
                                    required
                                    value={data.serie}
                                    onChange={(e) => setData('serie', e.target.value.toUpperCase().slice(0, 4))}
                                    placeholder="F001 / B001"
                                    maxLength={4}
                                    hint="Formato: F001 (Facturas), B001 (Boletas)"
                                    error={errors.serie}
                                />
                                <Button type="submit" loading={processing} icon={<Plus size={16} />} className="w-full justify-center">
                                    Crear Serie
                                </Button>
                            </form>
                        </Card.Body>
                    </Card>
                </div>

                {/* Listado de series */}
                <div className="lg:col-span-2">
                    <Card>
                        <Card.Header title="Series Registradas" subtitle={`${series.length} series`} />
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Serie</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Correlativo Actual</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Estado</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {series.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                                                No hay series registradas.
                                            </td>
                                        </tr>
                                    )}
                                    {series.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{tipoLabel(s.tipo_comprobante)}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono font-semibold text-gray-900">{s.serie}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {editando === s.id ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editData.correlativo_actual}
                                                        onChange={(e) => setEditData('correlativo_actual', parseInt(e.target.value) || 0)}
                                                        className="w-28 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-400 focus:outline-none"
                                                    />
                                                ) : (
                                                    <span className="font-mono text-sm text-gray-900">
                                                        {String(s.correlativo_actual + 1).padStart(8, '0')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {editando === s.id ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditData('activo', !editData.activo)}
                                                        className={`text-xs rounded-full px-3 py-1 font-medium ${editData.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                                    >
                                                        {editData.activo ? 'Activo' : 'Inactivo'}
                                                    </button>
                                                ) : (
                                                    <Badge variant={s.activo ? 'success' : 'neutral'}>
                                                        {s.activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-1">
                                                    {editando === s.id ? (
                                                        <>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                icon={<Check size={14} />}
                                                                loading={saving}
                                                                onClick={() => handleGuardar(s.id)}
                                                            >
                                                                Guardar
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setEditando(null)}
                                                            >
                                                                Cancelar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                icon={<Pencil size={14} />}
                                                                onClick={() => handleEditar(s)}
                                                            >
                                                                Editar
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                icon={<Trash2 size={14} className="text-red-500" />}
                                                                className="text-red-600 hover:bg-red-50"
                                                                onClick={() => setDeleteTarget(s)}
                                                            >
                                                                Eliminar
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleEliminar}
                title="Eliminar serie"
                message={`¿Eliminar la serie "${deleteTarget?.serie}"? Solo se puede eliminar si no tiene comprobantes emitidos.`}
                confirmLabel="Sí, eliminar"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
