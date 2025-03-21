"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {formatCurrency} from "@/lib/utils"
import {Plan} from "@/contexts/data/plan"

interface PlanCardProps {
    plan: Plan,
    handleSubscribe: (planId: string) => Promise<void>
}

export function PlanCard({plan, handleSubscribe}: PlanCardProps) {
    const [isLoading, setIsLoading] = useState(false)

    const onClick = async () => {
        setIsLoading(true)
        await handleSubscribe(plan.id)
        setIsLoading(false)
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">
            {formatCurrency(plan.price, plan.currency)}
          </span>
                    <span className="text-muted-foreground ml-1">
            /{plan.interval === "monthly" ? "mo" : "yr"}
          </span>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={onClick} disabled={isLoading}>
                    {isLoading ? "Processing..." : "Subscribe"}
                </Button>
            </CardFooter>
        </Card>
    )
}
