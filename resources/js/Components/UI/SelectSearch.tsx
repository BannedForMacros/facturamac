import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { Search, Loader2, X } from 'lucide-react';

interface SelectSearchProps<T> {
    label?: string;
    placeholder?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    onSearch: (query: string) => Promise<T[]>;
    onSelect: (item: T) => void;
    renderOption: (item: T) => ReactNode;
    getKey: (item: T) => string | number;
    debounceMs?: number;
    emptyText?: string;
    className?: string;
    disabled?: boolean;
}

export default function SelectSearch<T>({
    label,
    placeholder = 'Buscar...',
    error,
    hint,
    required,
    onSearch,
    onSelect,
    renderOption,
    getKey,
    debounceMs = 250,
    emptyText = 'Sin resultados',
    className = '',
    disabled,
}: SelectSearchProps<T>) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const doSearch = useCallback(async (q: string) => {
        setLoading(true);
        try {
            const data = await onSearch(q);
            setResults(data);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [onSearch]);

    // Trigger search on query change with debounce
    useEffect(() => {
        if (!open) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(query), debounceMs);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, open, doSearch, debounceMs]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFocus = () => {
        if (disabled) return;
        setOpen(true);
        // Search immediately with current query on focus
        doSearch(query);
    };

    const handleSelect = (item: T) => {
        onSelect(item);
        setQuery('');
        setResults([]);
        setOpen(false);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        inputRef.current?.focus();
        doSearch('');
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
            )}

            <div className={[
                'flex items-center rounded-md border bg-white shadow-sm transition-colors',
                disabled ? 'bg-gray-50 cursor-not-allowed' : '',
                error
                    ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-200'
                    : open
                        ? 'border-blue-400 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400',
            ].join(' ')}>
                <div className="pl-3 text-gray-400 shrink-0">
                    {loading
                        ? <Loader2 size={15} className="animate-spin text-blue-500" />
                        : <Search size={15} />
                    }
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    disabled={disabled}
                    placeholder={placeholder}
                    className="w-full bg-transparent py-2 pl-2 pr-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="pr-2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                        {loading && results.length === 0 && (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                                <Loader2 size={14} className="animate-spin" />
                                Buscando...
                            </div>
                        )}
                        {!loading && results.length === 0 && (
                            <p className="px-4 py-3 text-sm text-gray-400">{emptyText}</p>
                        )}
                        {results.map((item) => (
                            <button
                                key={getKey(item)}
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="flex w-full items-start px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0"
                            >
                                {renderOption(item)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
    );
}
