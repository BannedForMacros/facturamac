import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
};

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'md' }: ModalProps) {
    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Dialog */}
            <div className={`relative w-full ${maxWidthClasses[maxWidth]} rounded-lg bg-white shadow-xl`}>
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
                {/* Body */}
                <div className="px-6 py-5">{children}</div>
                {/* Footer */}
                {footer && (
                    <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
