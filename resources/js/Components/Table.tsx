import React, { useState, useMemo } from 'react';
import {
    ChevronDown, ChevronUp, ChevronRight, Search, ChevronsUpDown,
    ChevronLeft, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T = any> {
    key: string;
    label: string;
    sortable?: boolean;
    searchKey?: string;
    render?: (row: T) => React.ReactNode;
}

interface TableProps<T = any> {
    data: T[] | { data: T[] };
    columns: Column<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    sortable?: boolean;
    emptyMessage?: string;
    renderExpandedRow?: ((row: T) => React.ReactNode) | null;
    rowClassName?: string | ((row: T) => string) | null;
    itemsPerPage?: number;
    pagination?: boolean;
}

export default function Table<T extends { id?: number | string }>({
    data,
    columns,
    searchable = true,
    searchPlaceholder = 'Buscar...',
    sortable = true,
    emptyMessage = 'No hay datos disponibles',
    renderExpandedRow = null,
    rowClassName = null,
    itemsPerPage = 20,
    pagination = true,
}: TableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [expandedRows, setExpandedRows] = useState<(string | number)[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const toggleRow = (rowId: string | number) => {
        setExpandedRows(prev =>
            prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
        );
    };

    const items: T[] = Array.isArray(data) ? data : (data?.data || []);

    const filteredData = useMemo(() => {
        if (!search || !items.length) return items;
        const searchLower = search.toLowerCase();
        const getSearchableString = (obj: any): string => {
            if (typeof obj === 'string' || typeof obj === 'number') return String(obj).toLowerCase();
            if (typeof obj === 'object' && obj !== null) {
                return Object.values(obj).map(getSearchableString).join(' ');
            }
            return '';
        };
        return items.filter((row) => {
            return columns.some((column) => {
                let value = (row as any)[column.key];
                if (column.render && column.searchKey) {
                    value = (row as any)[column.searchKey];
                }
                return getSearchableString(value).includes(searchLower);
            });
        });
    }, [items, search, columns]);

    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData;
        return [...filteredData].sort((a, b) => {
            let aVal: any = (a as any)[sortColumn];
            let bVal: any = (b as any)[sortColumn];
            if (typeof aVal === 'object' && aVal !== null) aVal = Object.values(aVal).join(' ');
            if (typeof bVal === 'object' && bVal !== null) bVal = Object.values(bVal).join(' ');
            aVal = String(aVal || '').toLowerCase();
            bVal = String(bVal || '').toLowerCase();
            return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
    }, [filteredData, sortColumn, sortDirection]);

    const totalPages = Math.ceil((sortedData?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = pagination ? (sortedData?.slice(startIndex, endIndex) || []) : (sortedData || []);

    useMemo(() => {
        if (pagination) setCurrentPage(1);
    }, [search, pagination]);

    const handleSort = (column: Column<T>) => {
        if (!sortable || !column.sortable) return;
        if (sortColumn === column.key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column.key);
            setSortDirection('asc');
        }
    };

    const getPageNumbers = (): (number | '...')[] => {
        const pages: (number | '...')[] = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="w-full space-y-4">
            {/* Barra de búsqueda */}
            {searchable && (
                <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {search && (
                        <p className="mt-2 text-xs text-gray-500 ml-1">
                            {sortedData.length} resultado{sortedData.length !== 1 ? 's' : ''} encontrado{sortedData.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            )}

            {/* Tabla */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-900 text-white">
                                {renderExpandedRow && <th className="px-4 py-4 w-10" />}
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        onClick={() => handleSort(column)}
                                        className={cn(
                                            'px-6 py-4 text-left text-xs font-bold uppercase tracking-wider',
                                            column.sortable && sortable && 'cursor-pointer select-none hover:bg-gray-800 transition-colors group'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{column.label}</span>
                                            {column.sortable && sortable && (
                                                <div className="flex flex-col opacity-50 group-hover:opacity-100 transition-opacity">
                                                    {sortColumn === column.key ? (
                                                        sortDirection === 'asc'
                                                            ? <ChevronUp className="h-3 w-3 text-blue-400" />
                                                            : <ChevronDown className="h-3 w-3 text-blue-400" />
                                                    ) : (
                                                        <ChevronsUpDown className="h-3 w-3" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData && paginatedData.length > 0 ? (
                                paginatedData.map((row, index) => {
                                    const rowId = row.id ?? index;
                                    const isExpanded = expandedRows.includes(rowId);
                                    const customRowClass = rowClassName
                                        ? (typeof rowClassName === 'function' ? rowClassName(row) : rowClassName)
                                        : 'bg-white hover:bg-gray-50';

                                    return (
                                        <React.Fragment key={rowId}>
                                            <tr className={cn('transition-colors duration-200', isExpanded ? 'bg-blue-50/30' : customRowClass)}>
                                                {renderExpandedRow && (
                                                    <td className="px-4 py-4 text-center align-middle w-10">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleRow(rowId); }}
                                                            className="p-1.5 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-700 transition-colors"
                                                        >
                                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                        </button>
                                                    </td>
                                                )}
                                                {columns.map((column) => (
                                                    <td key={column.key} className="px-6 py-4 text-sm text-gray-700 align-middle">
                                                        {column.render ? column.render(row) : ((row as any)[column.key] ?? '-')}
                                                    </td>
                                                ))}
                                            </tr>
                                            {isExpanded && renderExpandedRow && (
                                                <tr className="bg-gray-50/50 shadow-inner">
                                                    <td colSpan={columns.length + 1} className="p-0 border-b border-gray-100">
                                                        <div className="p-6 animate-in slide-in-from-top-1 duration-200 ease-out">
                                                            {renderExpandedRow(row)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length + (renderExpandedRow ? 1 : 0)}
                                        className="px-6 py-20 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="rounded-full bg-gray-50 p-4 border border-gray-100">
                                                <Search className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="text-base font-medium text-gray-900">
                                                    {search ? 'No se encontraron resultados' : emptyMessage}
                                                </p>
                                                {search && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Intenta con otros términos de búsqueda
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {pagination && totalPages > 1 && (
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                Mostrando <span className="font-medium text-gray-900">{startIndex + 1}</span> a{' '}
                                <span className="font-medium text-gray-900">{Math.min(endIndex, sortedData.length)}</span> de{' '}
                                <span className="font-medium text-gray-900">{sortedData.length}</span> registros
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                                    className={cn('p-2 rounded-lg border transition-colors', currentPage > 1 ? 'border-gray-300 hover:bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-400 cursor-not-allowed')}>
                                    <ChevronsLeft size={18} />
                                </button>
                                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
                                    className={cn('p-2 rounded-lg border transition-colors', currentPage > 1 ? 'border-gray-300 hover:bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-400 cursor-not-allowed')}>
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="hidden sm:flex items-center gap-1">
                                    {getPageNumbers().map((page, index) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page as number)}
                                                className={cn(
                                                    'min-w-[2.5rem] px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                                                    currentPage === page ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                                                )}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}
                                </div>
                                <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700">
                                    Página {currentPage} de {totalPages}
                                </div>
                                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
                                    className={cn('p-2 rounded-lg border transition-colors', currentPage < totalPages ? 'border-gray-300 hover:bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-400 cursor-not-allowed')}>
                                    <ChevronRight size={18} />
                                </button>
                                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                                    className={cn('p-2 rounded-lg border transition-colors', currentPage < totalPages ? 'border-gray-300 hover:bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-400 cursor-not-allowed')}>
                                    <ChevronsRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
