import {Suspense} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import TableSkeleton from "@/components/skelton-table";
import {InvoiceTable} from "@/components/admin/invoice-table";

export default function AdminPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription className={"flex flex-row justify-between"}>
                    Manage Invoice, view details, and control access.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<TableSkeleton/>}>
                    <InvoiceTable/>
                </Suspense>
            </CardContent>
        </Card>
    )
}

