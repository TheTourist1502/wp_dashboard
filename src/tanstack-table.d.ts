// Column meta read by wp_shared/DataTable. Must be a module file so this augments,
// not replaces, @tanstack/react-table.
import type { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // Type params must match TanStack's declaration for the merge to work.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'left' | 'right';
    exportValue?: (row: TData) => string | number | null | undefined;
    export?: boolean;
  }
}
