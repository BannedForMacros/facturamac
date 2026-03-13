import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps, Cliente, Producto, Serie } from '@/types';
import { useState, useCallback, useEffect } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { Trash2, UserPlus } from 'lucide-react';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import SelectSearch from '@/Components/UI/SelectSearch';
import Card from '@/Components/UI/Card';
import ClienteModal from '@/Components/ClienteModal';
import axios from 'axios';

interface DetalleForm {
    producto_id?: number;
    codigo_producto?: string;
    descripcion: string;
    unidad_medida: string;
    cantidad: number;
    precio_unitario: number;
    precio_unitario_con_igv: number;
    descuento: number;
    subtotal: number;
    igv_item: number;
    total_item: number;
    tipo_afectacion_igv: string;
}

interface Props extends PageProps {
    tipo_inicial: string;
    series: Serie[];
    tipo_comprobantes: { codigo: string; label: string }[];
}

const IGV = 0.18;

const calcularDetalle = (item: Partial<DetalleForm>, afectoIgv: boolean): DetalleForm => {
    const cantidad = Number(item.cantidad) || 0;
    const precioUnit = Number(item.precio_unitario) || 0;
    const descuento = Number(item.descuento) || 0;
    const subtotal = Math.round((cantidad * precioUnit - descuento) * 100) / 100;
    const igvItem = afectoIgv ? Math.round(subtotal * IGV * 100) / 100 : 0;
    const totalItem = Math.round((subtotal + igvItem) * 100) / 100;

    return {
        producto_id: item.producto_id,
        codigo_producto: item.codigo_producto ?? '',
        descripcion: item.descripcion ?? '',
        unidad_medida: item.unidad_medida ?? 'NIU',
        cantidad,
        precio_unitario: precioUnit,
        precio_unitario_con_igv: afectoIgv
            ? Math.round(precioUnit * 1.18 * 10000) / 10000
            : precioUnit,
        descuento,
        subtotal,
        igv_item: igvItem,
        total_item: totalItem,
        tipo_afectacion_igv: afectoIgv ? '10' : '20',
    };
};

export default function ComprobanteCreate({ tipo_inicial, series, tipo_comprobantes, flash }: Props) {
    const notify = useNotify();

    // Estado local para cliente seleccionado
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [detalles, setDetalles] = useState<DetalleForm[]>([]);

    const { data, setData, post, processing, errors } = useForm<{
        tipo_comprobante: string;
        serie: string;
        fecha_emision: string;
        moneda: string;
        tipo_cambio: string;
        cliente_id: string;
        cliente_tipo_doc: string;
        cliente_num_doc: string;
        cliente_razon_social: string;
        cliente_direccion: string;
        observaciones: string;
        forma_pago: string;
        fecha_vencimiento: string;
        detalles: DetalleForm[];
        emitir_ahora: boolean;
    }>({
        tipo_comprobante: tipo_inicial,
        serie: series[0]?.serie ?? '',
        fecha_emision: new Date().toISOString().split('T')[0],
        moneda: 'PEN',
        tipo_cambio: '1',
        forma_pago: 'Contado',
        fecha_vencimiento: '',
        cliente_id: '',
        cliente_tipo_doc: '',
        cliente_num_doc: '',
        cliente_razon_social: '',
        cliente_direccion: '',
        observaciones: '',
        detalles: [],
        emitir_ahora: false,
    });

    useEffect(() => {
        if (flash?.success) notify.success(flash.success);
        if (flash?.error) notify.error(flash.error);
        if (flash?.warning) notify.warning(flash.warning);
    }, []);

    // Búsqueda de clientes via API
    const buscarClientes = useCallback(async (q: string): Promise<Cliente[]> => {
        const res = await axios.get(route('clientes.buscar'), { params: { q } });
        return res.data;
    }, []);

    const seleccionarCliente = (c: Cliente) => {
        setClienteSeleccionado(c);
        setData({
            ...data,
            cliente_id: String(c.id),
            cliente_tipo_doc: c.tipo_documento,
            cliente_num_doc: c.numero_documento,
            cliente_razon_social: c.razon_social,
            cliente_direccion: c.direccion ?? '',
        });
    };

    // Búsqueda de productos via API
    const buscarProductos = useCallback(async (q: string): Promise<Producto[]> => {
        const res = await axios.get(route('productos.buscar'), { params: { q } });
        return res.data;
    }, []);

    const agregarProducto = (p: Producto) => {
        const afecto = p.afecto_igv;
        const nuevoDetalle = calcularDetalle({
            producto_id: p.id,
            codigo_producto: p.codigo,
            descripcion: p.descripcion,
            unidad_medida: p.unidad_medida,
            cantidad: 1,
            precio_unitario: Number(p.precio_unitario),
            descuento: 0,
        }, afecto);
        const nuevosDetalles = [...detalles, nuevoDetalle];
        setDetalles(nuevosDetalles);
        setData('detalles', nuevosDetalles);
    };

    const actualizarDetalle = (idx: number, campo: keyof DetalleForm, valor: string | number) => {
        const actualizado = { ...detalles[idx], [campo]: valor };
        const afecto = actualizado.tipo_afectacion_igv === '10';
        const recalculado = calcularDetalle(actualizado, afecto);
        const nuevos = detalles.map((d, i) => i === idx ? recalculado : d);
        setDetalles(nuevos);
        setData('detalles', nuevos);
    };

    const eliminarDetalle = (idx: number) => {
        const nuevos = detalles.filter((_, i) => i !== idx);
        setDetalles(nuevos);
        setData('detalles', nuevos);
    };

    // Totales
    const totales = detalles.reduce(
        (acc, d) => ({
            gravadas: acc.gravadas + (d.tipo_afectacion_igv === '10' ? d.subtotal : 0),
            exoneradas: acc.exoneradas + (d.tipo_afectacion_igv === '20' ? d.subtotal : 0),
            igv: acc.igv + d.igv_item,
            total: acc.total + d.total_item,
        }),
        { gravadas: 0, exoneradas: 0, igv: 0, total: 0 }
    );

    const handleSubmit = (emitir: boolean) => {
        setData('emitir_ahora', emitir);
        post(route('comprobantes.store'), {
            onError: () => notify.error('Hay errores en el formulario. Verifica los datos.'),
        });
    };

    const seriesFiltradas = series.filter(s => {
        // Para facturas solo series F, para boletas solo B
        if (data.tipo_comprobante === '01') return s.serie.startsWith('F');
        if (data.tipo_comprobante === '03') return s.serie.startsWith('B');
        return true;
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('comprobantes.index')} className="text-gray-500 hover:text-gray-700">Comprobantes</Link>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium text-gray-900">Nuevo Comprobante</span>
                </div>
            }
        >
            <Head title="Emitir Comprobante" />

            <div className="space-y-4">
                {/* Cabecera */}
                <Card>
                    <Card.Header title="Datos del Comprobante" />
                    <Card.Body>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:grid-rows-2">
                            <Select
                                label="Tipo de Comprobante"
                                required
                                options={tipo_comprobantes.map(t => ({ value: t.codigo, label: t.label }))}
                                value={data.tipo_comprobante}
                                onChange={(e) => {
                                    setData('tipo_comprobante', e.target.value);
                                    setData('serie', '');
                                }}
                                error={errors.tipo_comprobante}
                            />
                            <Select
                                label="Serie"
                                required
                                options={seriesFiltradas.map(s => ({ value: s.serie, label: `${s.serie} (Nro. actual: ${String(s.correlativo_actual + 1).padStart(8, '0')})` }))}
                                value={data.serie}
                                onChange={(e) => setData('serie', e.target.value)}
                                error={errors.serie}
                                placeholder={seriesFiltradas.length === 0 ? 'Sin series disponibles' : ''}
                            />
                            <Input
                                label="Fecha de Emisión"
                                required
                                type="date"
                                value={data.fecha_emision}
                                onChange={(e) => setData('fecha_emision', e.target.value)}
                                error={errors.fecha_emision}
                            />
                            <Select
                                label="Moneda"
                                required
                                options={[
                                    { value: 'PEN', label: 'PEN – Soles' },
                                    { value: 'USD', label: 'USD – Dólares' },
                                ]}
                                value={data.moneda}
                                onChange={(e) => setData('moneda', e.target.value)}
                            />
                            <Select
                                label="Forma de Pago"
                                required
                                options={[
                                    { value: 'Contado', label: 'Contado' },
                                    { value: 'Credito', label: 'Crédito' },
                                ]}
                                value={data.forma_pago}
                                onChange={(e) => setData('forma_pago', e.target.value)}
                            />
                            {data.forma_pago === 'Credito' && (
                                <Input
                                    label="Fecha de Vencimiento"
                                    type="date"
                                    value={data.fecha_vencimiento}
                                    onChange={(e) => setData('fecha_vencimiento', e.target.value)}
                                    error={errors.fecha_vencimiento}
                                />
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Cliente */}
                <Card>
                    <Card.Header title="Datos del Cliente" />
                    <Card.Body>
                        <ClienteModal
                            show={showClienteModal}
                            onClose={() => setShowClienteModal(false)}
                            onCreated={(nuevoCliente) => {
                                seleccionarCliente(nuevoCliente);
                            }}
                        />
                        {clienteSeleccionado ? (
                            <div className="flex items-start justify-between rounded-lg bg-blue-50 border border-blue-200 p-4">
                                <div>
                                    <p className="font-semibold text-blue-900">{clienteSeleccionado.razon_social}</p>
                                    <p className="text-sm text-blue-700">
                                        {clienteSeleccionado.tipo_documento === '6' ? 'RUC' : 'DNI'}: {clienteSeleccionado.numero_documento}
                                    </p>
                                    {clienteSeleccionado.direccion && (
                                        <p className="text-xs text-blue-600 mt-0.5">{clienteSeleccionado.direccion}</p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setClienteSeleccionado(null);
                                        setData({ ...data, cliente_id: '', cliente_tipo_doc: '', cliente_num_doc: '', cliente_razon_social: '', cliente_direccion: '' });
                                    }}
                                >
                                    Cambiar
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <SelectSearch<Cliente>
                                    label="Buscar cliente"
                                    required
                                    placeholder="Haz clic o escribe RUC, DNI o razón social..."
                                    onSearch={buscarClientes}
                                    onSelect={seleccionarCliente}
                                    getKey={(c) => c.id}
                                    error={errors.cliente_id}
                                    emptyText="No se encontraron clientes"
                                    renderOption={(c) => (
                                        <div className="w-full">
                                            <p className="text-sm font-medium text-gray-900">{c.razon_social}</p>
                                            <p className="text-xs text-gray-500">
                                                {c.tipo_documento === '6' ? 'RUC' : 'DNI'}: {c.numero_documento}
                                                {c.direccion && ` · ${c.direccion}`}
                                            </p>
                                        </div>
                                    )}
                                />
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowClienteModal(true)}
                                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                        <UserPlus size={13} />
                                        Crear nuevo cliente
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Productos / Servicios */}
                <Card>
                    <Card.Header
                        title="Productos / Servicios"
                        action={
                            <SelectSearch<Producto>
                                placeholder="Haz clic o busca producto..."
                                onSearch={buscarProductos}
                                onSelect={agregarProducto}
                                getKey={(p) => p.id}
                                className="w-72"
                                emptyText="No se encontraron productos"
                                renderOption={(p) => (
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{p.descripcion}</p>
                                            <p className="text-xs text-gray-500">{p.codigo} · {p.unidad_medida}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700 shrink-0">
                                            S/ {Number(p.precio_unitario).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            />
                        }
                    />
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-20">Unid.</th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-20">Cant.</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-28">P.Unit (s/IGV)</th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-20">IGV</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-28">Total</th>
                                    <th className="px-3 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {detalles.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                                            Busca y agrega productos para comenzar
                                        </td>
                                    </tr>
                                )}
                                {detalles.map((d, idx) => (
                                    <tr key={idx}>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={d.descripcion}
                                                onChange={(e) => actualizarDetalle(idx, 'descripcion', e.target.value)}
                                                className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={d.unidad_medida}
                                                onChange={(e) => actualizarDetalle(idx, 'unidad_medida', e.target.value)}
                                                className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-center focus:border-blue-400 focus:outline-none"
                                                maxLength={5}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={d.cantidad}
                                                min="0.001"
                                                step="0.001"
                                                onChange={(e) => actualizarDetalle(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                                                className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-center focus:border-blue-400 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={d.precio_unitario}
                                                min="0"
                                                step="0.0001"
                                                onChange={(e) => actualizarDetalle(idx, 'precio_unitario', parseFloat(e.target.value) || 0)}
                                                className="w-full rounded border border-gray-200 px-2 py-1 text-sm text-right focus:border-blue-400 focus:outline-none"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => actualizarDetalle(idx, 'tipo_afectacion_igv', d.tipo_afectacion_igv === '10' ? '20' : '10')}
                                                className={`text-xs rounded-full px-2 py-0.5 font-medium transition-colors ${d.tipo_afectacion_igv === '10' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {d.tipo_afectacion_igv === '10' ? '18%' : 'EXO'}
                                            </button>
                                        </td>
                                        <td className="px-3 py-2 text-right text-sm font-semibold text-gray-900">
                                            S/ {d.total_item.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <button
                                                type="button"
                                                onClick={() => eliminarDetalle(idx)}
                                                className="text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {errors.detalles && (
                        <p className="px-4 py-2 text-xs text-red-600">{errors.detalles}</p>
                    )}
                </Card>

                {/* Totales y acciones */}
                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Observaciones */}
                    <div className="flex-1 max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
                        <textarea
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                            placeholder="Notas o condiciones adicionales..."
                        />
                    </div>

                    {/* Resumen de totales */}
                    <div className="w-full sm:w-64">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Op. Gravadas:</span>
                                <span>S/ {totales.gravadas.toFixed(2)}</span>
                            </div>
                            {totales.exoneradas > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Op. Exoneradas:</span>
                                    <span>S/ {totales.exoneradas.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>IGV (18%):</span>
                                <span>S/ {totales.igv.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-2 flex justify-between text-base font-bold text-gray-900">
                                <span>TOTAL:</span>
                                <span>S/ {totales.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-2">
                            <Button
                                type="button"
                                onClick={() => handleSubmit(true)}
                                loading={processing}
                                disabled={detalles.length === 0 || !data.cliente_id}
                                className="w-full justify-center"
                            >
                                Guardar y Emitir a SUNAT
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleSubmit(false)}
                                loading={processing}
                                disabled={detalles.length === 0 || !data.cliente_id}
                                className="w-full justify-center"
                            >
                                Guardar como Borrador
                            </Button>
                            <Link href={route('comprobantes.index')}>
                                <Button variant="ghost" className="w-full justify-center">Cancelar</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
