
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
   Column, // Import Column type
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
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
import { cn } from "@/lib/utils"; // Import cn utility


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnId?: string; // ID of the column to filter by search input
  onRowClick?: (row: TData) => void;
  actionMenuItems?: (row: TData) => React.ReactNode; // Function to generate dropdown items
  columnVisibility?: VisibilityState; // Optional: Control visibility state externally
  setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>; // Optional: Setter for external control
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchColumnId, // e.g., "firstName" or "email"
  onRowClick,
  actionMenuItems,
  columnVisibility: controlledColumnVisibility, // Rename for clarity
  setColumnVisibility: controlledSetColumnVisibility, // Rename for clarity
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Determine if visibility is controlled externally
  const isVisibilityControlled = controlledColumnVisibility !== undefined && controlledSetColumnVisibility !== undefined;

  // Use controlled state if provided, otherwise use internal state
  const columnVisibility = isVisibilityControlled ? controlledColumnVisibility : internalColumnVisibility;
  const setColumnVisibility = isVisibilityControlled ? controlledSetColumnVisibility : setInternalColumnVisibility;


  // Add action column if actionMenuItems are provided
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
  }, [columns, actionMenuItems]); // Removed onRowClick from dependency array as it's not used here


  const table = useReactTable({
    data,
    columns: tableColumns, // Use potentially modified columns
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility, // Use the determined setter
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility, // Use the determined visibility state
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center py-4 gap-2 flex-wrap">
        {searchColumnId && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        {/* Filter components rendered within headers now */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {/* Improve label generation for camelCase IDs */}
                    {column.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
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
                        // Prevent triggering row click if the click is inside an action button/menu
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-radix-dropdown-menu-content]') || target.closest('button')) {
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
         <ScrollBar orientation="horizontal" />
       </ScrollArea>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {/* Row selection display removed for simplicity, enable if needed */}
          {/* {table.getFilteredSelectedRowModel().rows.length} of{" "} */}
          Total {table.getFilteredRowModel().rows.length} row(s).
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


// Helper function for creating sortable table headers
// The `column` prop here is the TanStack Table Column object,
// which contains methods like `toggleSorting`, `getIsSorted`, etc.
// Usage: header: ({ column }) => <DataTableColumnHeader column={column} title="Column Title" />
export const DataTableColumnHeader = <TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>; // Accept the full Column object
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
          <ArrowUpDown className="ml-2 h-4 w-4" /> // Could use ArrowDownIcon
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpDown className="ml-2 h-4 w-4" /> // Could use ArrowUpIcon
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    </div>
  );
};


// Helper for filterable dropdown header
// Usage: header: ({ column }) => <DataTableFilterableColumnHeader column={column} title="Status" options={...} />
export function DataTableFilterableColumnHeader<TData>({
  column, // Expect the column object directly
  title,
  options,
  className,
}: {
  column: Column<TData, unknown>; // Use the column object
  title: string;
  options: { label: string; value: string }[];
  className?: string;
}) {
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
            <span>{title}</span>
            {selectedValues?.size > 0 && (
              <span className="ml-2 rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {selectedValues.size}
              </span>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {options.map((option) => {
            const isSelected = selectedValues?.has(option.value);
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={isSelected}
                onCheckedChange={() => {
                  const newSelectedValues = new Set(selectedValues); // Clone the set
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
                Clear filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

