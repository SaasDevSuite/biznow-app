"use client"

import {useCallback, useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Ban, SquareCheckIcon} from "lucide-react";
import {Column, GenericTable} from "@/components/custom/table";
import {getAllInvoices} from "@/actions/invoice/query";
import {markInvoiceAsPaid} from "@/actions/invoice/operations";
import {InvoiceStatus, User} from "@prisma/client";
import {toast} from "sonner";
import {format} from "date-fns";

export function InvoiceTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [invoices, setInvoices] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 3;

    const fetchInvoices = useCallback(async (search = "") => {
        const response = await getAllInvoices(page, pageSize, search);
        setInvoices(response.invoices);
        setTotalPages(response.totalPages);
    }, [page, pageSize]);

    useEffect(() => {
        fetchInvoices(searchQuery);
    }, [page, searchQuery, pageSize, fetchInvoices]);

    const toggleInvoicePaymentStatus = async (userId: string, status: string) => {
        if (status === InvoiceStatus.PAID) {
            await markInvoiceAsPaid(userId);
            await fetchInvoices(searchQuery);
        } else {
            toast.error("Cannot mark as unpaid");
        }
    };

    const columns: Column<any>[] = [
        {key: "id", label: "Id"},
        {key: "user", label: "User", render: (user: User) => user.username || "—"},
        {
            key: "status", label: "Status", render: (value: string) => (
                <>
                    {value === InvoiceStatus.PAID && <Badge variant="default">Paid</Badge>}
                    {value === InvoiceStatus.PENDING && <Badge variant="destructive">Pending</Badge>}
                    {value === InvoiceStatus.FAILED && <Badge variant="secondary">Failed</Badge>}
                </>
            )
        },
        {key: "paymentMethod", label: "Mode of Payment", render: (value: string) => value || "—"},
        {key: "date", label: "End Date", render: (value: string) => format(value, "dd/MM/yyyy") || "—"},
    ];

    const actions = (invoice: { id: string; status: string }) => [
        {
            label: invoice.status === InvoiceStatus.PAID ? "Mark as Unpaid" : "Mark as Paid",
            icon: invoice.status === InvoiceStatus.PAID ? <Ban/> : <SquareCheckIcon/>,
            onClick: () => toggleInvoicePaymentStatus(invoice.id, invoice.status === InvoiceStatus.PAID ? InvoiceStatus.PENDING : InvoiceStatus.PAID),
        }
    ];

    return (
        <GenericTable
            columns={columns}
            data={invoices}
            actions={actions}
            pageSize={pageSize}
            onSearch={setSearchQuery}
            page={page}
            totalPages={totalPages}
            onChangePage={setPage}
        />
    );
}
