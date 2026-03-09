import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, Cliente } from '@/types';
import { useEffect } from 'react';
import { useNotify } from '@/hooks/useNotify';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Card from '@/Components/UI/Card';

interface Props extends PageProps {
    cliente: Cliente;
}

const tipoDocOptions = [
    { value: '6', label: 'RUC (Persona Jurídica)' },
    { value: '1', label: 'DNI (Persona Natural)' },
    { value: '4', label: 'Carné de Extranjería' },
    { value: '7', label: 'Pasaporte' },
];

export default function ClienteEdit({ cliente, flash }: Props) {
    const notify = useNotify();
    const { data, setData, put, processing, errors } = useForm({
        tipo_documento: cliente.tipo_documento,
        numero_documento: cliente.numero_documento,
        razon_social: cliente.razon_social,
        direccion: cliente.direccion ?? '',
        email: cliente.email ?? '',
        telefono: cliente.telefono ?? '',
        activo: cliente.activo,
    });

    useEffect(() => {
        if (flash?.success) notify.success(flash.success);
        if (flash?.error) notify.error(flash.error);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('clientes.update', cliente.id), {
            onSuccess: () => notify.success('Cliente actualizado correctamente.'),
            onError: () => notify.error('Verifica los campos con error.'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('clientes.index')} className="text-gray-500 hover:text-gray-700">Clientes</Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-medium">Editar Cliente</span>
                </div>
            }
        >
            <Head title="Editar Cliente" />

            <div className="max-w-2xl">
                <Card>
                    <Card.Header title="Editar Cliente" subtitle={cliente.razon_social} />
                    <Card.Body>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Tipo de Documento"
                                    required
                                    options={tipoDocOptions}
                                    value={data.tipo_documento}
                                    onChange={(e) => setData('tipo_documento', e.target.value)}
                                    error={errors.tipo_documento}
                                />
                                <Input
                                    label={`Nro. de Documento ${data.tipo_documento === '6' ? '(11 dígitos)' : data.tipo_documento === '1' ? '(8 dígitos)' : ''}`}
                                    required
                                    value={data.numero_documento}
                                    onChange={(e) => setData('numero_documento', e.target.value.replace(/\D/g, ''))}
                                    maxLength={data.tipo_documento === '6' ? 11 : data.tipo_documento === '1' ? 8 : 20}
                                    className="font-mono"
                                    error={errors.numero_documento}
                                />
                            </div>

                            <Input
                                label="Razón Social / Nombre Completo"
                                required
                                value={data.razon_social}
                                onChange={(e) => setData('razon_social', e.target.value.toUpperCase())}
                                error={errors.razon_social}
                            />

                            <Input
                                label="Dirección"
                                value={data.direccion}
                                onChange={(e) => setData('direccion', e.target.value)}
                                error={errors.direccion}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={errors.email}
                                />
                                <Input
                                    label="Teléfono"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    error={errors.telefono}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="activo"
                                    checked={data.activo}
                                    onChange={(e) => setData('activo', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="activo" className="text-sm text-gray-700">Cliente activo</label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" loading={processing}>
                                    Guardar Cambios
                                </Button>
                                <Link href={route('clientes.index')}>
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
