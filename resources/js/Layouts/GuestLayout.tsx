import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { FileText } from 'lucide-react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ background: 'linear-gradient(160deg, #065F46 0%, #059669 60%, #34D399 100%)' }}
        >
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex flex-col items-center gap-3">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.25)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <FileText size={28} className="text-white" />
                        </div>
                        <span className="text-3xl font-extrabold text-white tracking-widest">
                            FACTURAMAC
                        </span>
                    </Link>
                    <p className="mt-2 text-sm" style={{ color: '#A7F3D0' }}>
                        Sistema de Facturación Electrónica
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl shadow-2xl px-8 py-8" style={{ backgroundColor: '#fff' }}>
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    © {new Date().getFullYear()} FACTURAMAC · Todos los derechos reservados
                </p>
            </div>
        </div>
    );
}
