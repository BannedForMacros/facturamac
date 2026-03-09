import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useNotify } from '@/hooks/useNotify';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Card from '@/Components/UI/Card';

const UNIDADES_MEDIDA = [
    { value: 'NIU', label: 'NIU – Unidad (bienes)' },
    { value: 'ZZ',  label: 'ZZ – Unidad (servicios)' },
    { value: 'HUR', label: 'HUR – Hora' },
    { value: 'DAY', label: 'DAY – Día' },
    { value: 'MON', label: 'MON – Mes' },
    { value: 'KGM', label: 'KGM – Kilogramo' },
    { value: 'MTR', label: 'MTR – Metro' },
    { value: 'LTR', label: 'LTR – Litro' },
    { value: 'BX',  label: 'BX – Caja' },
    { value: 'DZN', label: 'DZN – Docena' },
    { value: 'SET', label: 'SET – Juego' },
];

export default function ProductoCreate(_: PageProps) {
    const notify = useNotify();
    const { data, setData, post, processing, errors } = useForm({
        codigo: '',
        descripcion: '',
        unidad_medida: 'NIU',
        precio_unitario: '',
        afecto_igv: true,
        codigo_producto_sunat: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('productos.store'), {
            onSuccess: () => notify.success('Producto creado correctamente.'),
            onError: () => notify.error('Verifica los campos con error.'),
        });
    };

    const precioConIgv = data.afecto_igv && data.precio_unitario
        ? (parseFloat(data.precio_unitario) * 1.18).toFixed(2)
        : data.precio_unitario;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('productos.index')} className="text-gray-500 hover:text-gray-700">Productos</Link>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium text-gray-900">Nuevo Producto</span>
                </div>
            }
        >
            <Head title="Nuevo Producto" />

            <div className="max-w-2xl">
                <Card>
                    <Card.Header title="Nuevo Producto o Servicio" />
                    <Card.Body>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Código interno"
                                    required
                                    value={data.codigo}
                                    onChange={(e) => setData('codigo', e.target.value.toUpperCase())}
                                    placeholder="SW001"
                                    error={errors.codigo}
                                    hint="Identificador único del producto"
                                />
                                <Input
                                    label="Código SUNAT (opcional)"
                                    value={data.codigo_producto_sunat}
                                    onChange={(e) => setData('codigo_producto_sunat', e.target.value)}
                                    placeholder="P001234"
                                    error={errors.codigo_producto_sunat}
                                    hint="Catálogo de productos SUNAT"
                                />
                            </div>

                            <Input
                                label="Descripción"
                                required
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                placeholder="Ej: Licencia de software anual"
                                error={errors.descripcion}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Unidad de Medida"
                                    required
                                    options={UNIDADES_MEDIDA}
                                    value={data.unidad_medida}
                                    onChange={(e) => setData('unidad_medida', e.target.value)}
                                    error={errors.unidad_medida}
                                />
                                <div>
                                    <Input
                                        label="Precio Unitario (sin IGV)"
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.precio_unitario}
                                        onChange={(e) => setData('precio_unitario', e.target.value)}
                                        placeholder="0.00"
                                        error={errors.precio_unitario}
                                    />
                                    {data.afecto_igv && data.precio_unitario && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Precio con IGV: <strong>S/ {precioConIgv}</strong>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Toggle IGV */}
                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                                <button
                                    type="button"
                                    onClick={() => setData('afecto_igv', !data.afecto_igv)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${data.afecto_igv ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${data.afecto_igv ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        {data.afecto_igv ? 'Afecto a IGV (18%)' : 'Exonerado de IGV'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {data.afecto_igv
                                            ? 'Se calculará 18% de IGV sobre la base imponible.'
                                            : 'No aplica IGV en este producto/servicio.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" loading={processing}>
                                    Guardar Producto
                                </Button>
                                <Link href={route('productos.index')}>
                                    <Button type="button" variant="secondary">Cancelar</Button>
                                </Link>
                            </div>
                        </form>
                    </Card.Body>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
