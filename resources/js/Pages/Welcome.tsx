import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileText, Receipt, CreditCard, Send } from 'lucide-react';

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="FACTURAMAC - Facturación Electrónica" />
            <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>

                {/* Navbar */}
                <nav style={{ backgroundColor: '#065F46' }} className="px-6 py-4 shadow-md">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: '#34D399' }}
                            >
                                <FileText size={18} style={{ color: '#065F46' }} />
                            </div>
                            <span className="text-white font-bold text-xl tracking-widest">
                                FACTURAMAC
                            </span>
                        </div>

                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#34D399', color: '#065F46' }}
                            >
                                Ir al Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="px-5 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#34D399', color: '#065F46' }}
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Hero */}
                <section
                    className="py-28 px-6 text-center"
                    style={{ background: 'linear-gradient(160deg, #065F46 0%, #059669 60%, #34D399 100%)' }}
                >
                    <div className="max-w-3xl mx-auto">
                        <span
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-8"
                            style={{ backgroundColor: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#34D399' }} />
                            Integración directa con SUNAT
                        </span>

                        <h1 className="text-6xl font-extrabold text-white tracking-tight mb-6">
                            FACTURAMAC
                        </h1>

                        <p className="text-lg mb-10 leading-relaxed" style={{ color: '#A7F3D0' }}>
                            Emite facturas, boletas y notas de crédito electrónicas<br />
                            de forma rápida, segura y conforme a SUNAT.
                        </p>

                        {!auth.user && (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 shadow-lg"
                                style={{ backgroundColor: '#34D399', color: '#065F46' }}
                            >
                                Iniciar Sesión
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </section>

                {/* Features */}
                <section className="py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-center text-2xl font-bold mb-3" style={{ color: '#065F46' }}>
                            Todo lo que necesitas para facturar
                        </h2>
                        <p className="text-center text-sm mb-12" style={{ color: '#64748B' }}>
                            Una plataforma completa para la gestión de comprobantes electrónicos
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: FileText,
                                    title: 'Facturas Electrónicas',
                                    desc: 'Emite facturas electrónicas con envío automático a SUNAT.',
                                },
                                {
                                    icon: Receipt,
                                    title: 'Boletas de Venta',
                                    desc: 'Genera boletas electrónicas para consumidores finales.',
                                },
                                {
                                    icon: CreditCard,
                                    title: 'Notas de Crédito',
                                    desc: 'Anula o modifica comprobantes emitidos con facilidad.',
                                },
                                {
                                    icon: Send,
                                    title: 'Envío a SUNAT',
                                    desc: 'Integración directa con los servicios web de SUNAT.',
                                },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div
                                    key={title}
                                    className="rounded-2xl p-6 shadow-sm border transition-shadow hover:shadow-md"
                                    style={{ backgroundColor: '#fff', borderColor: '#E2E8F0' }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: '#ECFDF5' }}
                                    >
                                        <Icon size={22} style={{ color: '#059669' }} />
                                    </div>
                                    <h3 className="font-semibold mb-2" style={{ color: '#0F172A' }}>
                                        {title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                                        {desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                {!auth.user && (
                    <section
                        className="py-16 px-6 text-center"
                        style={{ backgroundColor: '#065F46' }}
                    >
                        <h3 className="text-2xl font-bold text-white mb-4">
                            ¿Listo para empezar?
                        </h3>
                        <p className="mb-8 text-sm" style={{ color: '#A7F3D0' }}>
                            Accede al sistema e inicia tu gestión de comprobantes electrónicos hoy.
                        </p>
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                            style={{ backgroundColor: '#34D399', color: '#065F46' }}
                        >
                            Iniciar Sesión
                        </Link>
                    </section>
                )}

                {/* Footer */}
                <footer
                    className="py-6 text-center text-xs"
                    style={{ color: '#64748B', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}
                >
                    © {new Date().getFullYear()} FACTURAMAC · Sistema de Facturación Electrónica
                </footer>
            </div>
        </>
    );
}
