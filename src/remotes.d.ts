// Types for modules this remote consumes over Module Federation.
// Keep in sync with wp_shared's `exposes`.

declare module 'wp_shared/Card' {
  import type { FC, ReactNode } from 'react';

  export const Card: FC<{ title: string; children?: ReactNode }>;
}

// Mirrors wp_shared/src/components/DataTable/types.ts. Column `meta` typing: tanstack-table.d.ts.
declare module 'wp_shared/DataTable' {
  import type { ColumnDef, SortingState } from '@tanstack/react-table';
  import type { ReactElement } from 'react';

  export type CellValue = string | number;
  export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

  export interface TableAction<T> {
    /** Iconify name, e.g. `lucide:pencil`. */
    icon: string;
    label: string;
    command: (row: T) => void;
    disabled?: boolean;
    tone?: 'default' | 'danger';
  }

  export interface DataTableProps<T> {
    data: T[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<T, any>[];
    getRowActions?: (row: T) => TableAction<T>[];
    getRowId?: (row: T, index: number) => string;
    onRowClick?: (row: T) => void;
    caption: string;
    exportFileName?: string;
    exportFormats?: ExportFormat[];
    searchable?: boolean;
    searchPlaceholder?: string;
    initialSorting?: SortingState;
    onSearchChange?: (query: string) => void;
    onSortingChange?: (sorting: SortingState) => void;
    pageSize?: number;
    virtualized?: boolean;
    scrollClassName?: string;
    estimateRowHeight?: number;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
  }

  export function DataTable<T>(props: DataTableProps<T>): ReactElement;
  export default DataTable;
}

declare module 'wp_shared/http_service' {
  export class ApiError extends Error {
    status: number;
    code: string;
    details?: unknown;
  }
  export const http: {
    get<T>(path: string, init?: RequestInit): Promise<T>;
    post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
    put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
    patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
    delete<T>(path: string, init?: RequestInit): Promise<T>;
  };
  export function request<T>(path: string, init?: RequestInit): Promise<T>;
}
