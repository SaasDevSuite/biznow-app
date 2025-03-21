'use client'
import {CheckCircle, CircleAlert, LoaderCircle} from "lucide-react"
import {Card, CardContent, CardFooter} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {useParams} from "next/navigation"
import {useCallback, useEffect, useState} from "react";
import Link from "next/link";

export default function PaymentSuccess() {
    const {invoiceId} = useParams()
    const [invoice, setInvoice] = useState<any>()

    const getInvoice = useCallback(async () => {
        const res = await fetch(`/api/invoice/${invoiceId}`, {
            method: 'GET',
        })
        const data = await res.json()
        console.log(data)
        setInvoice(data)
    }, [invoiceId])

    useEffect(() => {
        getInvoice()
    }, [getInvoice, invoiceId])

    if (!invoice) {
        return (
            <div className="flex justify-center items-center min-h-[400px] p-4">
                <Card className="w-full max-w-md border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <LoaderCircle className="h-8 w-8 text-yellow-600"/>
                            </div>
                            <h2 className="text-2xl font-semibold tracking-tight">Loading...</h2>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-[400px] p-4">
            <Card className="w-full max-w-md border-0 shadow-lg">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="rounded-full bg-green-100 p-3">
                            {invoice.status === "PAID" && <CheckCircle className="h-8 w-8 text-green-600"/>}
                            {invoice.status === "PENDING" && <LoaderCircle className="h-8 w-8 text-yellow-600"/>}
                            {invoice.status === "FAILED" && <CircleAlert className="h-8 w-8 text-red-600"/>}
                        </div>

                        <h2 className="text-2xl font-semibold tracking-tight">Payment
                            {invoice.status === "PAID" && " Success"}
                            {invoice.status === "PENDING" && " Pending"}
                            {invoice.status === "FAILED" && " Failed"}
                        </h2>

                        <p className="text-muted-foreground">

                            {invoice.status === "PAID" && "Your payment has been successfully processed."}
                            {invoice.status === "PENDING" && "Your payment is currently being processed."}
                            {invoice.status === "FAILED" && "Your payment has failed. Please try again."}

                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <Link href={"/app"}>
                        <Button className="w-full max-w-[200px]">Return to Dashboard</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}

