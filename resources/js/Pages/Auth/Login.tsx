import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            <h2 className="text-xl font-bold mb-1" style={{ color: '#065F46' }}>
                Bienvenido
            </h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>
                Ingresa tus credenciales para continuar
            </p>

            {status && (
                <div
                    className="mb-4 text-sm font-medium p-3 rounded-lg"
                    style={{ backgroundColor: '#ECFDF5', color: '#059669' }}
                >
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0F172A' }}>
                        Correo electrónico
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Mail size={15} style={{ color: '#64748B' }} />
                        </div>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="username"
                            autoFocus
                            placeholder="usuario@empresa.pe"
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all"
                            style={{
                                borderColor: errors.email ? '#EF4444' : '#E2E8F0',
                                color: '#0F172A',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#059669';
                                e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = errors.email ? '#EF4444' : '#E2E8F0';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0F172A' }}>
                        Contraseña
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Lock size={15} style={{ color: '#64748B' }} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm outline-none transition-all"
                            style={{
                                borderColor: errors.password ? '#EF4444' : '#E2E8F0',
                                color: '#0F172A',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#059669';
                                e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = errors.password ? '#EF4444' : '#E2E8F0';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center"
                            style={{ color: '#64748B' }}
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked as false)}
                            className="rounded"
                            style={{ accentColor: '#059669' }}
                        />
                        <span className="text-sm" style={{ color: '#64748B' }}>
                            Recordarme
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium transition-opacity hover:opacity-75"
                            style={{ color: '#059669' }}
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60"
                    style={{ backgroundColor: '#059669' }}
                    onMouseEnter={(e) => {
                        if (!processing) e.currentTarget.style.backgroundColor = '#065F46';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                    }}
                >
                    {processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>
        </GuestLayout>
    );
}
