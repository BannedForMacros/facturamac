import { ReactNode } from 'react';
import Spinner from './Spinner';

export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    emptyAction?: ReactNode;
    keyExtractor?: (row: T) => string | number;
}

export default function Table<T extends Record<string, unknown>>({
    columns,
    data,
    loading = false,
    emptyMessage = 'No hay registros.',
    emptyAction,
    keyExtractor,
}: TableProps<T>) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${col.headerClassName ?? ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {loading && (
                        <tr>
                            <td colSpan={columns.length} className="py-12 text-center">
                                <Spinner label="Cargando..." />
                            </td>
                        </tr>
                    )}
                    {!loading && data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="py-12 text-center">
                                <p className="text-sm text-gray-500">{emptyMessage}</p>
                                {emptyAction && <div className="mt-3">{emptyAction}</div>}
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        data.map((row, idx) => (
                            <tr
                                key={keyExtractor ? keyExtractor(row) : idx}
                                className="hover:bg-gray-50"
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className={`px-4 py-3 text-sm ${col.className ?? ''}`}>
                                        {col.render ? col.render(row) : String(row[col.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
