/**
 * Select — wrapper sobre SearchableSelect con la misma interfaz
 * que el <select> nativo (onChange recibe un evento con e.target.value).
 * Todos los Select existentes del proyecto funcionan sin cambios.
 */
import { SelectHTMLAttributes, forwardRef } from 'react';
import SearchableSelect from './SearchableSelect';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: Option[];
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, options, placeholder, id, value, onChange, disabled, required, className }, _ref) => {
        const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
        return (
            <SearchableSelect
                id={selectId}
                label={label}
                required={required}
                error={error}
                hint={hint}
                options={options}
                placeholder={placeholder ?? 'Seleccionar...'}
                value={value as string | number}
                onChange={onChange!}
                disabled={disabled}
                className={className}
            />
        );
    }
);

Select.displayName = 'Select';
export default Select;
