import { useState, useEffect, useRef } from 'react';
import Modal from '@/Components/Modal';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import { useNotify } from '@/hooks/useNotify';
import { Cliente } from '@/types';
import { CheckCircle, AlertTriangle, Loader2, Search } from 'lucide-react';
import axios from 'axios';

const TIPO_DOC_OPTIONS = [
    { value: '6', label: 'RUC (Persona Jurídica)' },
    { value: '1', label: 'DNI (Persona Natural)' },
    { value: '4', label: 'Carné de Extranjería' },
    { value: '7', label: 'Pasaporte' },
];

// Longitudes exactas para consulta automática
const DOC_LENGTH: Record<string, number> = { '6': 11, '1': 8 };

interface ClienteModalProps {
    show: boolean;
    onClose: () => void;
    onCreated: (cliente: Cliente) => void;
}

const emptyForm = {
    tipo_documento: '6',
    numero_documento: '',
    razon_social: '',
    direccion: '',
    email: '',
    telefono: '',
};

type ConsultaEstado = 'idle' | 'loading' | 'ok' | 'warn' | 'error';

export default function ClienteModal({ show, onClose, onCreated }: ClienteModalProps) {
    const notify = useNotify();
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    // Estado de la consulta RUC/DNI
    const [consultaEstado, setConsultaEstado] = useState<ConsultaEstado>('idle');
    const [consultaMsg, setConsultaMsg] = useState('');
    const [advertencia, setAdvertencia] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const set = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleClose = () => {
        setForm(emptyForm);
        setErrors({});
        setConsultaEstado('idle');
        setConsultaMsg('');
        setAdvertencia('');
        onClose();
    };

    // Resetear consulta al cambiar tipo de documento
    const handleTipoChange = (tipo: string) => {
        setForm({ ...emptyForm, tipo_documento: tipo });
        setErrors({});
        setConsultaEstado('idle');
        setConsultaMsg('');
        setAdvertencia('');
    };

    // Consulta automática al completar el número
    useEffect(() => {
        const longitud = DOC_LENGTH[form.tipo_documento];
        if (!longitud || form.numero_documento.length !== longitud) {
            // Si el número está incompleto, resetear estado de consulta
            if (consultaEstado !== 'idle') {
                setConsultaEstado('idle');
                setConsultaMsg('');
                setAdvertencia('');
            }
            return;
        }

        // Debounce para no disparar en cada tecla cuando se pega el número
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            consultarDocumento(form.tipo_documento, form.numero_documento);
        }, 400);

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [form.numero_documento, form.tipo_documento]);

    const consultarDocumento = async (tipo: string, numero: string) => {
        setConsultaEstado('loading');
        setConsultaMsg('');
        setAdvertencia('');

        try {
            const resp = await axios.get(route('clientes.consultarDocumento'), {
                params: { tipo, numero },
            });

            const data = resp.data;

            set('razon_social', data.razon_social ?? '');
            set('direccion', data.direccion ?? '');

            if (data.advertencia) {
                setAdvertencia(data.advertencia);
                setConsultaEstado('warn');
            } else {
                setConsultaEstado('ok');
                setConsultaMsg(tipo === '6' ? 'RUC verificado en SUNAT' : 'DNI verificado en RENIEC');
            }
        } catch (err: any) {
            const msg = err.response?.data?.error ?? 'No se pudo consultar el documento.';
            setConsultaMsg(msg);
            setConsultaEstado('error');
            // Limpiar campos automáticos para que el usuario los ingrese manualmente
            set('razon_social', '');
            set('direccion', '');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await axios.post(route('clientes.storeModal'), form);
            const nuevoCliente: Cliente = response.data;

            notify.success(`Cliente ${nuevoCliente.razon_social} creado correctamente.`);
            setForm(emptyForm);
            setConsultaEstado('idle');
            setConsultaMsg('');
            setAdvertencia('');
            onCreated(nuevoCliente);
            onClose();
        } catch (err: any) {
            if (err.response?.status === 422) {
                const laravelErrors = err.response.data.errors as Record<string, string[]>;
                const mapped: Record<string, string> = {};
                Object.entries(laravelErrors).forEach(([key, msgs]) => {
                    mapped[key] = msgs[0];
                });
                setErrors(mapped);
            } else {
                notify.error('Error al crear el cliente. Intenta nuevamente.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const longitud = DOC_LENGTH[form.tipo_documento];
    const puedeConsultar = !!longitud;
    const maxLen = form.tipo_documento === '6' ? 11 : form.tipo_documento === '1' ? 8 : 20;
    const docLabel = form.tipo_documento === '6'
        ? 'RUC (11 dígitos)'
        : form.tipo_documento === '1'
            ? 'DNI (8 dígitos)'
            : 'Nro. Documento';

    return (
        <Modal
            show={show}
            onClose={handleClose}
            title="Nuevo Cliente"
            subtitle="El RUC y DNI se consultan automáticamente"
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo + Número */}
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Tipo de Documento"
                        required
                        options={TIPO_DOC_OPTIONS}
                        value={form.tipo_documento}
                        onChange={(e) => handleTipoChange(e.target.value)}
                        error={errors.tipo_documento}
                    />
                    <div className="relative">
                        <Input
                            label={docLabel}
                            required
                            value={form.numero_documento}
                            onChange={(e) => set('numero_documento', e.target.value.replace(/\D/g, ''))}
                            maxLength={maxLen}
                            placeholder={form.tipo_documento === '6' ? '20xxxxxxxxx' : form.tipo_documento === '1' ? '12345678' : ''}
                            className="font-mono pr-8"
                            error={errors.numero_documento}
                        />
                        {/* Indicador de estado de consulta */}
                        {puedeConsultar && form.numero_documento.length === longitud && (
                            <div className="absolute right-2 top-[34px]">
                                {consultaEstado === 'loading' && (
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                )}
                                {consultaEstado === 'ok' && (
                                    <CheckCircle size={16} className="text-green-500" />
                                )}
                                {consultaEstado === 'warn' && (
                                    <AlertTriangle size={16} className="text-amber-500" />
                                )}
                                {consultaEstado === 'error' && (
                                    <button
                                        type="button"
                                        title="Reintentar consulta"
                                        onClick={() => consultarDocumento(form.tipo_documento, form.numero_documento)}
                                        className="text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Search size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Resultado de consulta OK */}
                {consultaEstado === 'ok' && consultaMsg && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                        <CheckCircle size={15} className="text-green-600 shrink-0" />
                        <p className="text-xs text-green-800 font-medium">{consultaMsg}</p>
                    </div>
                )}

                {/* Advertencia de estado/condición irregular en SUNAT */}
                {consultaEstado === 'warn' && advertencia && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                        <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">{advertencia}</p>
                    </div>
                )}

                {/* Error de consulta — permite edición manual */}
                {consultaEstado === 'error' && consultaMsg && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                        <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-red-800">{consultaMsg}</p>
                            <p className="text-xs text-red-700 mt-0.5">
                                Puedes ingresar los datos manualmente, pero asegúrate de que el nombre del cliente sea el correcto.
                            </p>
                        </div>
                    </div>
                )}

                {/* Razón social */}
                <Input
                    label="Razón Social / Nombre Completo"
                    required
                    value={form.razon_social}
                    onChange={(e) => set('razon_social', e.target.value.toUpperCase())}
                    placeholder={
                        consultaEstado === 'loading'
                            ? 'Consultando...'
                            : consultaEstado === 'error'
                                ? 'Ingresa el nombre manualmente...'
                                : 'EMPRESA SAC / JUAN GARCIA'
                    }
                    disabled={consultaEstado === 'loading'}
                    error={errors.razon_social}
                />

                {/* Dirección */}
                <Input
                    label="Dirección"
                    value={form.direccion}
                    onChange={(e) => set('direccion', e.target.value)}
                    disabled={consultaEstado === 'loading'}
                    error={errors.direccion}
                />

                {/* Email y Teléfono */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        error={errors.email}
                    />
                    <Input
                        label="Teléfono"
                        value={form.telefono}
                        onChange={(e) => set('telefono', e.target.value)}
                        error={errors.telefono}
                    />
                </div>

                <Modal.Footer className="-mx-6 -mb-4 mt-2">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        loading={processing}
                        disabled={consultaEstado === 'loading' || !form.razon_social}
                    >
                        Guardar Cliente
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}
