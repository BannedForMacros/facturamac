import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
    value: string | number;
    label: string;
}

interface SearchableSelectProps {
    id?: string;
    value?: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options?: SearchableOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    label?: string;
    required?: boolean;
    hint?: string;
}

export default function SearchableSelect({
    id,
    value,
    onChange,
    options = [],
    placeholder = "Seleccionar...",
    searchPlaceholder = "Buscar...",
    error,
    disabled = false,
    className = "",
    label,
    required,
    hint,
}: SearchableSelectProps) {
    const safeId = id || "select";
    const dropdownId = `dropdown-${safeId}`;

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filteredOptions = useMemo(() => {
        const s = search.trim().toLowerCase();
        if (!s) return options;
        return options.filter((o) => (o.label || "").toLowerCase().includes(s));
    }, [options, search]);

    const selectedOption = useMemo(
        () => options.find((opt) => String(opt.value) === String(value ?? "")),
        [options, value]
    );

    const updatePosition = () => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setCoords({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
    };

    const closeDropdown = () => { setIsOpen(false); setSearch(""); setActiveIndex(-1); };
    const openDropdown = () => { if (disabled) return; updatePosition(); setIsOpen(true); setActiveIndex(-1); };

    const handleSelect = (optionValue: string | number) => {
        onChange({ target: { value: String(optionValue) } } as React.ChangeEvent<HTMLSelectElement>);
        closeDropdown();
        requestAnimationFrame(() => triggerRef.current?.focus());
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange({ target: { value: "" } } as React.ChangeEvent<HTMLSelectElement>);
        requestAnimationFrame(() => triggerRef.current?.focus());
    };

    useEffect(() => {
        if (!isOpen) return;
        updatePosition();
        requestAnimationFrame(() => { searchInputRef.current?.focus(); setActiveIndex(-1); });
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const dropdown = document.getElementById(dropdownId);
            if (!containerRef.current?.contains(e.target as Node) && !dropdown?.contains(e.target as Node)) closeDropdown();
        };
        const handleScrollOrResize = () => { if (isOpen) updatePosition(); };
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScrollOrResize, true);
            window.removeEventListener("resize", handleScrollOrResize);
        };
    }, [isOpen, dropdownId]);

    const clampIndex = (idx: number) => Math.max(0, Math.min(idx, filteredOptions.length - 1));
    const focusSearch = () => { setActiveIndex(-1); requestAnimationFrame(() => searchInputRef.current?.focus()); };
    const focusItem = (idx: number) => {
        const next = clampIndex(idx);
        setActiveIndex(next);
        requestAnimationFrame(() => document.getElementById(`${dropdownId}-opt-${next}`)?.focus());
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (["ArrowDown", "Enter", " "].includes(e.key)) { e.preventDefault(); isOpen ? focusSearch() : openDropdown(); return; }
        if (e.key === "Escape" && isOpen) { e.preventDefault(); closeDropdown(); }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") { e.preventDefault(); if (filteredOptions.length > 0) focusItem(0); return; }
        if (e.key === "Escape") { e.preventDefault(); closeDropdown(); requestAnimationFrame(() => triggerRef.current?.focus()); return; }
        if (e.key === "Enter" && filteredOptions.length > 0) { e.preventDefault(); handleSelect(filteredOptions[0].value); }
    };

    const handleItemKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === "ArrowDown") { e.preventDefault(); focusItem(idx + 1); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); idx <= 0 ? focusSearch() : focusItem(idx - 1); return; }
        if (e.key === "Enter") { e.preventDefault(); const opt = filteredOptions[idx]; if (opt) handleSelect(opt.value); return; }
        if (e.key === "Escape") { e.preventDefault(); closeDropdown(); requestAnimationFrame(() => triggerRef.current?.focus()); }
    };

    const labelId = label?.toLowerCase().replace(/\s+/g, "-") ?? safeId;

    const dropdownContent = (
        <div
            id={dropdownId}
            className="absolute z-[9999] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/10"
            style={{ top: coords.top, left: coords.left, width: coords.width }}
            role="listbox"
        >
            {/* Buscador */}
            <div className="p-2 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setActiveIndex(-1); }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                </div>
            </div>

            {/* Opciones */}
            <ul ref={listRef} className="max-h-56 overflow-auto px-1 py-1">
                {filteredOptions.length === 0 ? (
                    <li className="px-3 py-3 text-center text-sm text-gray-400">Sin resultados</li>
                ) : (
                    filteredOptions.map((option, idx) => {
                        const isSelected = String(option.value) === String(value ?? "");
                        const isActive = idx === activeIndex;
                        return (
                            <li
                                key={option.value}
                                id={`${dropdownId}-opt-${idx}`}
                                role="option"
                                aria-selected={isSelected}
                                tabIndex={isActive ? 0 : -1}
                                onKeyDown={(e) => handleItemKeyDown(e, idx)}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                                    isSelected
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-700 hover:bg-gray-100",
                                    isActive && !isSelected && "bg-gray-100"
                                )}
                            >
                                <span className="truncate">{option.label}</span>
                                {isSelected && <Check size={14} className="shrink-0 text-blue-600" />}
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );

    return (
        <div className={cn("w-full", className)}>
            {label && (
                <label htmlFor={labelId} className="mb-1.5 block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
            )}
            <div ref={containerRef} className="relative">
                <div
                    id={labelId}
                    ref={triggerRef}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && (isOpen ? (closeDropdown(), requestAnimationFrame(() => triggerRef.current?.focus())) : openDropdown())}
                    onKeyDown={handleTriggerKeyDown}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-xl border-2 bg-white px-3 py-2 text-sm transition-all duration-200",
                        "focus:outline-none",
                        isOpen
                            ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                            : error
                                ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                                : "border-gray-200 hover:border-gray-300 shadow-sm",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    <span className={cn("truncate", selectedOption ? "text-gray-900" : "text-gray-400")}>
                        {selectedOption?.label ?? placeholder}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                        {value !== undefined && value !== "" && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                tabIndex={-1}
                                className="flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
                    </div>
                </div>
                {isOpen && createPortal(dropdownContent, document.body)}
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
        </div>
    );
}
