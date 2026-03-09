import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, icon, iconPosition = 'left', className = '', id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                        {props.required && <span className="ml-0.5 text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
                            block w-full rounded-md border text-sm shadow-sm
                            focus:outline-none focus:ring-2 focus:ring-offset-0
                            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
                            ${error
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                                : 'border-gray-300 focus:border-blue-400 focus:ring-blue-200'
                            }
                            ${icon && iconPosition === 'left' ? 'pl-9' : 'pl-3'}
                            ${icon && iconPosition === 'right' ? 'pr-9' : 'pr-3'}
                            py-2
                            ${className}
                        `}
                        {...props}
                    />
                    {icon && iconPosition === 'right' && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                            {icon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;
