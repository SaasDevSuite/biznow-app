"use client"

import {useCallback, useEffect, useState} from "react"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {CreditCard, Wallet, Building} from "lucide-react"
import {useParams, useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
// Make the entire props optional with default values
export default function InvoicePage() {
    const route = useRouter()
    const {planId} = useParams()
    const [plan, setPlan] = useState<any>()
    const [paymentMethod, setPaymentMethod] = useState<string>("OTHER")
    const {data: session} = useSession()


    const getPlanData = useCallback(async () => {
        const res = await fetch(`/api/plans/select/${planId}`, {
            method: 'GET',
        })
        const data = await res.json()
        setPlan(data)
    }, [planId])

    useEffect(() => {
        getPlanData()
    }, [getPlanData, planId])

    const handleSubmit = async () => {
        const res = await fetch('/api/invoice/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({planId, userId: session?.user?.id, paymentMethod}),
        })
        const data = await res.json()
        route.push(`/checkout/result/${data.id}`)
    }

    return (
        <div className="mx-auto max-w-md py-10">
            {plan && <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Subscription Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-center py-4">
                        <span className="font-medium">Plan:</span>
                        <span>{plan.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t border-b">
                        <span className="font-bold">Amount:</span>
                        <span className="font-bold">${plan.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t border-b">
                        <span className="font-bold">Duration:</span>
                        <span className="font-bold capitalize">{`${plan.interval}`}</span>
                    </div>

                    <div className="pt-2">
                        <h3 className="font-medium mb-3">Payment Method</h3>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                                <RadioGroupItem value="STRIPE" id="stripe"/>
                                <Label htmlFor="stripe" className="flex items-center cursor-pointer">
                                    <CreditCard className="h-4 w-4 mr-2"/>
                                    <span>Stripe</span>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                                <RadioGroupItem value="PAYPAL" id="paypal"/>
                                <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                                    <Wallet className="h-4 w-4 mr-2"/>
                                    <span>PayPal</span>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                                <RadioGroupItem value="OTHER" id="bank"/>
                                <Label htmlFor="bank" className="flex items-center cursor-pointer">
                                    <Building className="h-4 w-4 mr-2"/>
                                    <span>Bank Transfer / Other</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSubmit}>
                        Pay Now
                    </Button>
                </CardFooter>
            </Card>}
            {!plan && <div>Loading...</div>}
        </div>
    )
}

