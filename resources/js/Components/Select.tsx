import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    options: Option[];
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export default function Select({
    options,
    value,
    onChange,
    label,
    placeholder = 'Seleccionar...',
    error,
    hint,
    required,
    disabled,
    className,
    id,
}: SelectProps) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerId = id ?? label?.toLowerCase().replace(/\s+/g, '-') ?? 'select';

    const selected = useMemo(
        () => options.find(o => String(o.value) === String(value ?? '')),
        [options, value]
    );

    const updateCoords = () => {
        const el = containerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setCoords({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
    };

    const handleSelect = (opt: Option) => {
        onChange?.({ target: { value: String(opt.value) } } as React.ChangeEvent<HTMLSelectElement>);
        setOpen(false);
    };

    useEffect(() => {
        if (!open) return;
        updateCoords();
        const close = (e: MouseEvent) => {
            const dropdown = document.getElementById(`dd-${triggerId}`);
            if (!containerRef.current?.contains(e.target as Node) && !dropdown?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const reposition = () => { if (open) updateCoords(); };
        document.addEventListener('mousedown', close);
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            document.removeEventListener('mousedown', close);
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [open]);

    const dropdown = (
        <div
            id={`dd-${triggerId}`}
            style={{ top: coords.top, left: coords.left, width: coords.width }}
            className="absolute z-[9999] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl shadow-black/10"
        >
            <ul className="max-h-60 overflow-auto px-1 py-0.5">
                {options.map(opt => {
                    const isSelected = String(opt.value) === String(value ?? '');
                    return (
                        <li
                            key={opt.value}
                            onClick={() => handleSelect(opt)}
                            className={cn(
                                'flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                                isSelected
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            <span>{opt.label}</span>
                            {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
            )}
            <div ref={containerRef} className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => { if (!disabled) { updateCoords(); setOpen(o => !o); } }}
                    className={cn(
                        'flex w-full items-center justify-between rounded-xl border-2 bg-white px-3 py-2 text-sm transition-all duration-200',
                        'focus:outline-none',
                        open
                            ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                            : error
                                ? 'border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                                : 'border-gray-200 hover:border-gray-300 shadow-sm',
                        disabled && 'cursor-not-allowed opacity-50'
                    )}
                >
                    <span className={cn('truncate', selected ? 'text-gray-900' : 'text-gray-400')}>
                        {selected?.label ?? placeholder}
                    </span>
                    <ChevronDown
                        size={16}
                        className={cn('shrink-0 text-gray-400 transition-transform duration-200', open && 'rotate-180')}
                    />
                </button>
                {open && createPortal(dropdown, document.body)}
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
        </div>
    );
}
