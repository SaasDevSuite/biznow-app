import {Suspense} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import TableSkeleton from "@/components/skelton-table";
import {SubscriptionTable} from "@/components/admin/subscription-table";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {SubscriptionStatus} from "@prisma/client";

export default function AdminPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription className={"flex flex-row justify-between"}>
                    Manage subscription plans, view details, and control access.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<TableSkeleton/>}>
                    <Tabs defaultValue="account" className="w-full">
                        <TabsList className="flex flex-row">
                            <TabsTrigger value="account">Active</TabsTrigger>
                            <TabsTrigger value="password">Inactive</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <SubscriptionTable status={SubscriptionStatus.ACTIVE}/>
                        </TabsContent>
                        <TabsContent value="password">
                            <SubscriptionTable status={SubscriptionStatus.DEACTIVATED}/>
                        </TabsContent>
                    </Tabs>
                </Suspense>
            </CardContent>
        </Card>
    )
}

