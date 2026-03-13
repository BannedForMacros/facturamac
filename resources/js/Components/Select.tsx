import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: Option[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, options, id, className, required, ...props }, ref) => {
        const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        {label}
                        {required && <span className="ml-0.5 text-red-500">*</span>}
                    </label>
                )}

                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        required={required}
                        className={cn(
                            'w-full appearance-none rounded-md border bg-white py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
                            error
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                : 'border-gray-300 hover:border-gray-400',
                            props.disabled && 'cursor-not-allowed bg-gray-50 text-gray-400',
                            className
                        )}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                </div>

                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
export default Select;
