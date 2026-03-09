import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronDown } from "lucide-react";
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

    const selectedOption = useMemo(() => {
        return options.find((opt) => String(opt.value) === String(value ?? ""));
    }, [options, value]);

    const updatePosition = () => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
        });
    };

    const closeDropdown = () => {
        setIsOpen(false);
        setSearch("");
        setActiveIndex(-1);
    };

    const openDropdown = () => {
        if (disabled) return;
        updatePosition();
        setIsOpen(true);
        setActiveIndex(-1);
    };

    const handleSelect = (optionValue: string | number) => {
        const fakeEvent = {
            target: { value: String(optionValue) },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(fakeEvent);
        closeDropdown();
        requestAnimationFrame(() => triggerRef.current?.focus());
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        const fakeEvent = { target: { value: "" } } as React.ChangeEvent<HTMLSelectElement>;
        onChange(fakeEvent);
        requestAnimationFrame(() => triggerRef.current?.focus());
    };

    useEffect(() => {
        if (!isOpen) return;
        updatePosition();
        requestAnimationFrame(() => {
            searchInputRef.current?.focus();
            setActiveIndex(-1);
        });
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const dropdown = document.getElementById(dropdownId);
            const clickedInsideTrigger = containerRef.current?.contains(e.target as Node);
            const clickedInsideDropdown = dropdown?.contains(e.target as Node);
            if (!clickedInsideTrigger && !clickedInsideDropdown) closeDropdown();
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

    const clampIndex = (idx: number) => {
        if (filteredOptions.length === 0) return -1;
        return Math.max(0, Math.min(idx, filteredOptions.length - 1));
    };

    const focusSearch = () => {
        setActiveIndex(-1);
        requestAnimationFrame(() => searchInputRef.current?.focus());
    };

    const focusItem = (idx: number) => {
        const next = clampIndex(idx);
        setActiveIndex(next);
        requestAnimationFrame(() => {
            const el = document.getElementById(`${dropdownId}-opt-${next}`);
            el?.focus();
        });
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isOpen) openDropdown();
            else focusSearch();
            return;
        }
        if (e.key === "Escape" && isOpen) { e.preventDefault(); closeDropdown(); }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (filteredOptions.length > 0) focusItem(0);
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            closeDropdown();
            requestAnimationFrame(() => triggerRef.current?.focus());
            return;
        }
        if (e.key === "Enter" && filteredOptions.length > 0) {
            e.preventDefault();
            handleSelect(filteredOptions[0].value);
        }
    };

    const handleItemKeyDown = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === "ArrowDown") { e.preventDefault(); focusItem(idx + 1); return; }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (idx <= 0) focusSearch();
            else focusItem(idx - 1);
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            const opt = filteredOptions[idx];
            if (opt) handleSelect(opt.value);
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            closeDropdown();
            requestAnimationFrame(() => triggerRef.current?.focus());
        }
    };

    const labelId = label?.toLowerCase().replace(/\s+/g, "-") ?? safeId;

    const dropdownContent = (
        <div
            id={dropdownId}
            className="absolute z-[9999] mt-1 rounded-lg border border-gray-200 bg-white shadow-lg"
            style={{ top: coords.top, left: coords.left, width: coords.width }}
            role="listbox"
        >
            <div className="p-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setActiveIndex(-1); }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                    />
                </div>
            </div>
            <ul ref={listRef} className="max-h-60 overflow-auto py-1">
                {filteredOptions.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-400">Sin resultados</li>
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
                                    "cursor-pointer px-4 py-2 text-sm outline-none",
                                    "hover:bg-blue-50 hover:text-blue-700",
                                    isSelected && "bg-blue-50 text-blue-700 font-medium",
                                    isActive && "ring-1 ring-inset ring-blue-200"
                                )}
                            >
                                {option.label}
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
                <label htmlFor={labelId} className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
            )}
            <div ref={containerRef} className="relative">
                <div
                    id={labelId}
                    ref={triggerRef}
                    onClick={() => !disabled && (isOpen ? (closeDropdown(), requestAnimationFrame(() => triggerRef.current?.focus())) : openDropdown())}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={handleTriggerKeyDown}
                    className={cn(
                        "relative w-full cursor-pointer rounded-md border bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm",
                        "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200",
                        "transition-colors",
                        error ? "border-red-300" : isOpen ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-300 hover:border-gray-400",
                        disabled && "cursor-not-allowed bg-gray-50 text-gray-400"
                    )}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className={cn("block truncate", !selectedOption && "text-gray-400")}>
                        {selectedOption?.label || placeholder}
                    </span>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        {value && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="mr-1 flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-150", isOpen && "rotate-180")} />
                    </div>
                </div>
                {isOpen && createPortal(dropdownContent, document.body)}
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
    );
}
