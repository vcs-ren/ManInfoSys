"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Column,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Filter, MoreHorizontal } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FilterableColumnHeaderProps {
    columnId: string;
    title: string;
    options: { label: string; value: string }[];
}


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  actionMenuItems?: (row: TData) => React.ReactNode;
  columnVisibility?: VisibilityState;
  setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>;
  filterableColumnHeaders?: FilterableColumnHeaderProps[];
  initialColumnFilters?: ColumnFiltersState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search by ID or Last Name...",
  onRowClick,
  actionMenuItems,
  columnVisibility: controlledColumnVisibility,
  setColumnVisibility: controlledSetColumnVisibility,
  filterableColumnHeaders = [],
  initialColumnFilters,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters || []);
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const isVisibilityControlled = controlledColumnVisibility !== undefined && controlledSetColumnVisibility !== undefined;

  const columnVisibility = isVisibilityControlled ? controlledColumnVisibility : internalColumnVisibility;
  const setColumnVisibility = isVisibilityControlled ? controlledSetColumnVisibility : setInternalColumnVisibility;

  React.useEffect(() => {
    if (initialColumnFilters) {
      setColumnFilters(initialColumnFilters);
    } else {
      setColumnFilters([]);
    }
  }, [initialColumnFilters]);


   const tableColumns = React.useMemo(() => {
    const cols = [...columns];
    if (actionMenuItems) {
      cols.push({
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
               {actionMenuItems(row.original)}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      });
    }
    return cols;
  }, [columns, actionMenuItems]);


  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter, // For controlled global filter input
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter, // Pass the global filter state to the table
    },
    globalFilterFn: "auto", // TanStack Table can use 'auto' if you're providing the globalFilter state and onGlobalFilterChange
    filterFromLeafRows: true,
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center py-4 gap-2 flex-wrap">
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm h-9"
        />

        {filterableColumnHeaders.map(({ columnId, title, options }) => {
             const column = table.getColumn(columnId);
             if (!column) return null;
             return (
                <DataTableFilterableColumnHeader
                    key={columnId}
                    column={column}
                    title={title}
                    options={options}
                 />
             );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-9">
               <Filter className="mr-2 h-4 w-4"/>
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
             <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const formattedLabel = column.id
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/_/g, ' ')
                    .replace(/^./, str => str.toUpperCase());

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {formattedLabel}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
       <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-radix-dropdown-menu-content]') || target.closest('button') || target.closest('a')) {
                            return;
                        }
                        onRowClick && onRowClick(row.original);
                   }}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
         <ScrollBar orientation="horizontal" />
       </Table>
       </ScrollArea>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s) found.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}


export const DataTableColumnHeader = <TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}) => {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    </div>
  );
};

export function DataTableFilterableColumnHeader<TData>({
  column,
  title,
  options,
  className,
}: {
  column: Column<TData, unknown>;
  title: string;
  options: { label: string; value: string }[];
  className?: string;
}) {
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            {title}
            {selectedValues?.size > 0 && (
              <span className="ml-2 rounded-md bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                {selectedValues.size}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
             <DropdownMenuSeparator />
          {options.map((option) => {
            const isSelected = selectedValues?.has(option.value);
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={isSelected}
                onCheckedChange={() => {
                  const newSelectedValues = new Set(selectedValues);
                  if (isSelected) {
                    newSelectedValues.delete(option.value);
                  } else {
                    newSelectedValues.add(option.value);
                  }
                  const filterValues = Array.from(newSelectedValues);
                  column?.setFilterValue(
                    filterValues.length ? filterValues : undefined
                  );
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            );
          })}
          {selectedValues?.size > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => column?.setFilterValue(undefined)}
                className="justify-center text-center"
              >
                Clear filter
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
