import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useNotify } from '@/hooks/useNotify';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Card from '@/Components/UI/Card';

const TIPO_DOC_OPTIONS = [
    { value: '6', label: 'RUC (Persona Jurídica)' },
    { value: '1', label: 'DNI (Persona Natural)' },
    { value: '4', label: 'Carné de Extranjería' },
    { value: '7', label: 'Pasaporte' },
];

export default function ClienteCreate(_: PageProps) {
    const notify = useNotify();
    const { data, setData, post, processing, errors } = useForm({
        tipo_documento: '6',
        numero_documento: '',
        razon_social: '',
        direccion: '',
        email: '',
        telefono: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('clientes.store'), {
            onSuccess: () => notify.success('Cliente creado correctamente.'),
            onError: () => notify.error('Verifica los campos con error.'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('clientes.index')} className="text-gray-500 hover:text-gray-700">Clientes</Link>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium text-gray-900">Nuevo Cliente</span>
                </div>
            }
        >
            <Head title="Nuevo Cliente" />

            <div className="max-w-2xl">
                <Card>
                    <Card.Header title="Nuevo Cliente" />
                    <Card.Body>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Tipo de Documento"
                                    required
                                    options={TIPO_DOC_OPTIONS}
                                    value={data.tipo_documento}
                                    onChange={(e) => setData('tipo_documento', e.target.value)}
                                    error={errors.tipo_documento}
                                />
                                <Input
                                    label={`Nro. Documento ${data.tipo_documento === '6' ? '(11 dígitos)' : data.tipo_documento === '1' ? '(8 dígitos)' : ''}`}
                                    required
                                    value={data.numero_documento}
                                    onChange={(e) => setData('numero_documento', e.target.value.replace(/\D/g, ''))}
                                    maxLength={data.tipo_documento === '6' ? 11 : data.tipo_documento === '1' ? 8 : 20}
                                    placeholder={data.tipo_documento === '6' ? '20xxxxxxxxx' : '12345678'}
                                    className="font-mono"
                                    error={errors.numero_documento}
                                />
                            </div>

                            <Input
                                label="Razón Social / Nombre Completo"
                                required
                                value={data.razon_social}
                                onChange={(e) => setData('razon_social', e.target.value.toUpperCase())}
                                placeholder="EMPRESA SAC / JUAN GARCIA"
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

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" loading={processing}>
                                    Guardar Cliente
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
