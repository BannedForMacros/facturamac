import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps, Comprobante, Serie } from '@/types';
import { useState, useEffect } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { Send, Ban, ArrowLeft, CheckCircle, XCircle, RefreshCw, Code, X, Copy, AlertCircle, FileX, Download } from 'lucide-react';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import Card from '@/Components/UI/Card';
import Select from '@/Components/UI/Select';
import ConfirmDialog from '@/Components/UI/ConfirmDialog';
import axios from 'axios';

// Motivos Nota de Crédito - Catálogo SUNAT 09
const MOTIVOS_NC = [
    { value: '01', label: '01 - Anulación de la operación' },
    { value: '02', label: '02 - Anulación por error en RUC' },
    { value: '03', label: '03 - Corrección en descripción' },
    { value: '04', label: '04 - Descuento global' },
    { value: '05', label: '05 - Descuento por ítem' },
    { value: '06', label: '06 - Devolución total' },
    { value: '07', label: '07 - Devolución por ítem' },
    { value: '08', label: '08 - Bonificación' },
    { value: '09', label: '09 - Disminución en el valor' },
    { value: '10', label: '10 - Otros conceptos' },
];

interface Props extends PageProps {
    comprobante: Comprobante & {
        fecha_emision_fmt: string;
        detalles: Array<{
            id: number;
            descripcion: string;
            unidad_medida: string;
            cantidad: number;
            precio_unitario: number;
            igv_item: number;
            total_item: number;
            tipo_afectacion_igv: string;
        }>;
    };
    series_nc: Serie[];
}

const estadoVariant = (color: string): 'success' | 'info' | 'danger' | 'warning' | 'neutral' => {
    const map: Record<string, 'success' | 'info' | 'danger' | 'warning' | 'neutral'> = {
        green: 'success', blue: 'info', red: 'danger', orange: 'warning', gray: 'neutral',
    };
    return map[color] ?? 'neutral';
};

export default function ComprobanteShow({ comprobante, flash, series_nc }: Props) {
    const notify = useNotify();
    const [confirmAnular, setConfirmAnular] = useState(false);

    // Modal Nota de Crédito
    const [showNcModal, setShowNcModal] = useState(false);
    const { data: ncData, setData: setNcData, post: postNc, processing: processingNc, errors: ncErrors, reset: resetNc } = useForm({
        serie: series_nc[0]?.serie ?? '',
        motivo: '01',
        emitir_ahora: false,
    });

    const handleEmitirNc = () => {
        postNc(route('comprobantes.notaCredito', comprobante.id), {
            onSuccess: () => { setShowNcModal(false); resetNc(); },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Error al generar la Nota de Crédito.';
                notify.error(String(msg));
            },
        });
    };

    // Estados para Ver XML
    const [showXmlModal, setShowXmlModal] = useState(false);
    const [xmlContent, setXmlContent] = useState<string>('');
    const [xmlFirmado, setXmlFirmado] = useState(false);
    const [loadingXml, setLoadingXml] = useState(false);

    // Estados para Consultar SUNAT
    const [loadingConsulta, setLoadingConsulta] = useState(false);
    const [consultaResult, setConsultaResult] = useState<{
        success?: boolean;
        codigo?: string;
        descripcion?: string;
        notas?: string[];
        error?: string;
        estado_actualizado?: string;
    } | null>(null);

    useEffect(() => {
        if (flash?.success) notify.success(flash.success);
        if (flash?.error) notify.error(flash.error);
        if (flash?.warning) notify.warning(flash.warning);
    }, []);

    const handleEmitir = () => {
        router.post(route('comprobantes.emitir', comprobante.id), {}, {
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Error al enviar a SUNAT.';
                notify.error(String(msg));
            },
        });
    };

    const handleAnular = () => {
        router.post(route('comprobantes.anular', comprobante.id), {}, {
            onSuccess: () => { notify.success('Comprobante anulado.'); setConfirmAnular(false); },
            onError: () => notify.error('No se pudo anular el comprobante.'),
        });
    };

    const handleVerXml = async () => {
        setLoadingXml(true);
        try {
            const response = await axios.get(route('comprobantes.xml', comprobante.id));
            setXmlContent(response.data.xml ?? '');
            setXmlFirmado(response.data.firmado ?? false);
            setShowXmlModal(true);
        } catch (err: any) {
            const msg = err.response?.data?.error ?? 'Error al obtener el XML.';
            notify.error(msg);
        } finally {
            setLoadingXml(false);
        }
    };

    const handleConsultarSunat = async () => {
        setLoadingConsulta(true);
        setConsultaResult(null);
        try {
            const response = await axios.post(route('comprobantes.consultarSunat', comprobante.id));
            setConsultaResult(response.data);
            if (response.data.estado_actualizado) {
                notify.success(`Estado actualizado a: ${response.data.estado_actualizado}`);
                // Recargar la página para reflejar el nuevo estado
                router.reload({ only: ['comprobante'] });
            }
        } catch (err: any) {
            const msg = err.response?.data?.error ?? 'Error al consultar SUNAT.';
            setConsultaResult({ error: msg });
            notify.error(msg);
        } finally {
            setLoadingConsulta(false);
        }
    };

    const copiarXml = () => {
        navigator.clipboard.writeText(xmlContent);
        notify.success('XML copiado al portapapeles.');
    };

    const esEditable = comprobante.estado === 'borrador';
    const puedeEmitir = ['borrador', 'enviado', 'rechazado'].includes(comprobante.estado);
    // Anulación directa solo para borradores; NC para aceptados/enviados
    const puedeAnularDirecto = comprobante.estado === 'borrador';
    const puedeEmitirNc = ['aceptado', 'enviado'].includes(comprobante.estado) && ['01', '03'].includes(comprobante.tipo_comprobante);
    const puedeConsultarSunat = ['enviado', 'aceptado', 'rechazado'].includes(comprobante.estado);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href={route('comprobantes.index')} className="text-gray-500 hover:text-gray-700">Comprobantes</Link>
                        <span className="text-gray-400">/</span>
                        <span className="font-mono font-semibold text-gray-900">{comprobante.numero}</span>
                        <Badge variant={estadoVariant(comprobante.estado_color)}>
                            {comprobante.estado}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        {puedeEmitir && (
                            <Button
                                icon={<Send size={16} />}
                                onClick={handleEmitir}
                            >
                                Emitir a SUNAT
                            </Button>
                        )}
                        {puedeConsultarSunat && (
                            <Button
                                variant="secondary"
                                icon={<RefreshCw size={16} />}
                                onClick={handleConsultarSunat}
                                loading={loadingConsulta}
                            >
                                Consultar SUNAT
                            </Button>
                        )}
                        <a href={route('comprobantes.pdf', comprobante.id)} target="_blank" rel="noreferrer">
                            <Button variant="secondary" icon={<Download size={16} />}>
                                Descargar PDF
                            </Button>
                        </a>
                        <Button
                            variant="ghost"
                            icon={<Code size={16} />}
                            onClick={handleVerXml}
                            loading={loadingXml}
                        >
                            Ver XML
                        </Button>
                        {puedeEmitirNc && (
                            <Button
                                variant="danger"
                                icon={<FileX size={16} />}
                                onClick={() => setShowNcModal(true)}
                            >
                                Nota de Crédito
                            </Button>
                        )}
                        {puedeAnularDirecto && (
                            <Button
                                variant="danger"
                                icon={<Ban size={16} />}
                                onClick={() => setConfirmAnular(true)}
                            >
                                Anular
                            </Button>
                        )}
                        <Link href={route('comprobantes.index')}>
                            <Button variant="ghost" icon={<ArrowLeft size={16} />}>Volver</Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${comprobante.numero} - FacturaMac`} />

            <div className="space-y-4">
                {/* Estado SUNAT */}
                {comprobante.sunat_codigo && (
                    <div className={`flex items-start gap-3 rounded-lg border p-4 ${comprobante.estado === 'aceptado' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        {comprobante.estado === 'aceptado'
                            ? <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                            : <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                        }
                        <div>
                            <p className={`font-semibold text-sm ${comprobante.estado === 'aceptado' ? 'text-green-900' : 'text-red-900'}`}>
                                SUNAT: Código {comprobante.sunat_codigo}
                            </p>
                            <p className={`text-sm ${comprobante.estado === 'aceptado' ? 'text-green-700' : 'text-red-700'}`}>
                                {comprobante.sunat_descripcion}
                            </p>
                            {comprobante.hash_cpe && (
                                <p className="mt-1 text-xs text-gray-500 font-mono">Hash: {comprobante.hash_cpe}</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Datos del comprobante */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <Card.Header title={`${comprobante.tipo_label}`} subtitle={`${comprobante.numero} · ${comprobante.fecha_emision_fmt}`} />
                            <Card.Body className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium uppercase text-gray-400">Cliente</p>
                                    <p className="font-semibold text-gray-900">{comprobante.cliente_razon_social}</p>
                                    <p className="text-sm text-gray-600">
                                        {comprobante.cliente_tipo_doc === '6' ? 'RUC' : 'DNI'}: {comprobante.cliente_num_doc}
                                    </p>
                                    {comprobante.cliente_direccion && (
                                        <p className="text-sm text-gray-500">{comprobante.cliente_direccion}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-400">Moneda</p>
                                        <p className="text-sm text-gray-900">{comprobante.moneda}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-400">Tipo de Cambio</p>
                                        <p className="text-sm text-gray-900">{comprobante.tipo_cambio}</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Detalles */}
                        <Card>
                            <Card.Header title="Detalle de Items" />
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 w-16">Unid.</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-16">Cant.</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-24">P.Unit</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-20">IGV</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-24">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {comprobante.detalles?.map((d) => (
                                            <tr key={d.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{d.descripcion}</td>
                                                <td className="px-4 py-3 text-center text-xs text-gray-500">{d.unidad_medida}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-700">{Number(d.cantidad).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-700">S/ {Number(d.precio_unitario).toFixed(4)}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-500">
                                                    {d.tipo_afectacion_igv === '10'
                                                        ? `S/ ${Number(d.igv_item).toFixed(2)}`
                                                        : <span className="text-xs text-gray-400">EXO</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">S/ {Number(d.total_item).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Panel lateral totales */}
                    <div>
                        <Card>
                            <Card.Header title="Resumen" />
                            <Card.Body className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Op. Gravadas:</span>
                                    <span>S/ {Number(comprobante.op_gravadas).toFixed(2)}</span>
                                </div>
                                {Number(comprobante.op_exoneradas) > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Op. Exoneradas:</span>
                                        <span>S/ {Number(comprobante.op_exoneradas).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>IGV (18%):</span>
                                    <span>S/ {Number(comprobante.igv).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                                    <span>TOTAL {comprobante.moneda}:</span>
                                    <span className="text-lg">S/ {Number(comprobante.total).toFixed(2)}</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmAnular}
                onClose={() => setConfirmAnular(false)}
                onConfirm={handleAnular}
                title="Anular comprobante"
                message={`¿Anular el comprobante ${comprobante.numero}? Esta acción no se puede deshacer.`}
                confirmLabel="Sí, anular"
            />

            {/* Modal Nota de Crédito */}
            {showNcModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div>
                                <h3 className="font-semibold text-gray-900">Emitir Nota de Crédito</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Referencia: <span className="font-mono font-semibold">{comprobante.numero}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => { setShowNcModal(false); resetNc(); }}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Info explicativa */}
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    La Nota de Crédito anulará el comprobante <strong>{comprobante.numero}</strong> ante SUNAT.
                                    Se copiarán todos los ítems del comprobante original con el mismo importe.
                                </p>
                            </div>

                            <Select
                                label="Motivo"
                                required
                                options={MOTIVOS_NC}
                                value={ncData.motivo}
                                onChange={(e) => setNcData('motivo', e.target.value)}
                                error={ncErrors.motivo}
                            />

                            <Select
                                label="Serie de la Nota de Crédito"
                                required
                                options={series_nc.map(s => ({
                                    value: s.serie,
                                    label: `${s.serie} (Nro. actual: ${String(s.correlativo_actual + 1).padStart(8, '0')})`,
                                }))}
                                value={ncData.serie}
                                onChange={(e) => setNcData('serie', e.target.value)}
                                error={ncErrors.serie}
                                placeholder={series_nc.length === 0 ? 'Sin series NC disponibles' : undefined}
                            />

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ncData.emitir_ahora}
                                    onChange={(e) => setNcData('emitir_ahora', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Enviar a SUNAT inmediatamente</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
                            <Button
                                variant="ghost"
                                onClick={() => { setShowNcModal(false); resetNc(); }}
                                disabled={processingNc}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleEmitirNc}
                                loading={processingNc}
                                disabled={!ncData.serie || series_nc.length === 0}
                            >
                                Generar Nota de Crédito
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ver XML */}
            {showXmlModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-10">
                    <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div>
                                <h3 className="font-semibold text-gray-900">XML del comprobante — {comprobante.numero}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {xmlFirmado ? '✓ XML firmado digitalmente (guardado en BD)' : '⚠ XML generado sin firma (no hay certificado configurado)'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" icon={<Copy size={14} />} onClick={copiarXml}>
                                    Copiar
                                </Button>
                                <button onClick={() => setShowXmlModal(false)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1 p-4">
                            <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-all leading-relaxed bg-gray-50 rounded-lg p-4">
                                {xmlContent}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Panel resultado Consultar SUNAT */}
            {consultaResult && (
                <div className="fixed bottom-6 right-6 z-50 w-96 rounded-xl border shadow-xl bg-white">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-900">Respuesta SUNAT</p>
                        <button onClick={() => setConsultaResult(null)} className="p-1 rounded hover:bg-gray-100 text-gray-400">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="p-4 space-y-2">
                        {consultaResult.error ? (
                            <div className="flex items-start gap-2 text-red-700">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <p className="text-sm">{consultaResult.error}</p>
                            </div>
                        ) : (
                            <>
                                <div className={`flex items-start gap-2 ${consultaResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {consultaResult.success
                                        ? <CheckCircle size={16} className="shrink-0 mt-0.5" />
                                        : <XCircle size={16} className="shrink-0 mt-0.5" />
                                    }
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Código: {consultaResult.codigo ?? '—'}
                                        </p>
                                        <p className="text-sm">{consultaResult.descripcion}</p>
                                    </div>
                                </div>
                                {consultaResult.notas && consultaResult.notas.length > 0 && (
                                    <div className="pt-1 space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase">Observaciones SUNAT:</p>
                                        {consultaResult.notas.map((n, i) => (
                                            <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">{n}</p>
                                        ))}
                                    </div>
                                )}
                                {consultaResult.estado_actualizado && (
                                    <p className="text-xs text-gray-500 pt-1">
                                        Estado actualizado a: <span className="font-semibold">{consultaResult.estado_actualizado}</span>
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
