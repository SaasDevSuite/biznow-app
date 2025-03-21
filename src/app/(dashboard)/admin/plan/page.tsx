import {Suspense} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import TableSkeleton from "@/components/skelton-table";
import {SubscriptionPlanTable} from "@/components/admin/subscription-plan-table";

export default function AdminPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription className={"flex flex-row justify-between"}>
                        Manage subscription plans, view details, and control access.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<TableSkeleton/>}>
                    <SubscriptionPlanTable/>
                </Suspense>
            </CardContent>
        </Card>
    )
}

