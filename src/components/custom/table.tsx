import {JSX} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {MoreHorizontal, Search} from "lucide-react";

export interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => JSX.Element | string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    actions?: (row: T) => { label: string; icon: JSX.Element; onClick: () => void }[];
    pageSize?: number;
    onSearch: (query: string) => void;
    searchQuery?: string,
    totalPages?: number,
    page: number
    onChangePage: (page: number) => void
    actionItems?: JSX.Element
}

export function GenericTable<T extends { id: string }>({
                                                           columns,
                                                           data,
                                                           actions,
                                                           onSearch,
                                                           searchQuery,
                                                           totalPages,
                                                           page = 1,
                                                           onChangePage,
                                                           actionItems
                                                       }: TableProps<T>) {

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
                {actionItems}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={String(column.key)}>{column.label}</TableHead>
                            ))}
                            {actions && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                                    No data found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.id}>
                                    {columns.map((column) => (
                                        <TableCell key={String(column.key)}>
                                            {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                                        </TableCell>
                                    ))}
                                    {actions && (
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {actions(row).map((action, index) => (
                                                        <DropdownMenuItem key={index} onClick={action.onClick} role={"button"}>
                                                            {action.icon}
                                                            {action.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-between items-center mt-4">
                <Button disabled={page === 1} onClick={() => onChangePage(page - 1)}>
                    Previous
                </Button>
                <span>Page {page} of {totalPages}</span>
                <Button disabled={page === totalPages} onClick={() => onChangePage(page + 1)}>
                    Next
                </Button>
            </div>
        </div>
    );
}
