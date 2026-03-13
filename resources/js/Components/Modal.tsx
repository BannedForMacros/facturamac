import { Fragment } from 'react';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    children?: React.ReactNode;
    show?: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
    closeable?: boolean;
    onClose?: () => void;
    title?: string;
    subtitle?: string;
    className?: string;
}

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    title = '',
    subtitle = '',
    className = '',
}: ModalProps) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
        full: 'sm:max-w-[calc(100%-2rem)]',
    }[maxWidth];

    return (
        <Transition show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={close}>
                {/* Backdrop */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                {/* Modal Container */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel
                                className={cn(
                                    'w-full transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all',
                                    'border border-gray-100',
                                    maxWidthClass,
                                    className
                                )}
                            >
                                {/* Header */}
                                {(title || closeable) && (
                                    <div className="relative px-6 pt-6 pb-4">
                                        {closeable && (
                                            <button
                                                type="button"
                                                onClick={close}
                                                className={cn(
                                                    'absolute right-4 top-4 rounded-full p-2',
                                                    'text-gray-400 hover:text-gray-600',
                                                    'hover:bg-gray-100 active:bg-gray-200',
                                                    'transition-all duration-200',
                                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                                                )}
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        )}
                                        {title && (
                                            <div className="pr-8">
                                                <DialogTitle className="text-xl font-semibold text-gray-900">
                                                    {title}
                                                </DialogTitle>
                                                {subtitle && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content */}
                                <div className="px-6 py-4">
                                    {children}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

Modal.Body = function ModalBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('px-6 py-4', className)}>
            {children}
        </div>
    );
};

Modal.Footer = function ModalFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-3 px-6 py-4',
                'bg-gray-50/80 border-t border-gray-100',
                className
            )}
        >
            {children}
        </div>
    );
};

Modal.Divider = function ModalDivider({ className = '' }: { className?: string }) {
    return <div className={cn('border-t border-gray-100 my-4 mx-6', className)} />;
};
