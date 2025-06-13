'use client';

import {Suspense} from "react"
import {UserTable} from "@/components/admin/user-table"
import {Skeleton} from "@/components/ui/skeleton"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"

export default function AdminPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage user accounts, view details, and control access.</CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<UserTableSkeleton/>}>
                    <UserTable/>
                </Suspense>
            </CardContent>
        </Card>
    )
}

function UserTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[250px]"/>
                <Skeleton className="h-10 w-[200px]"/>
            </div>
            <div className="border rounded-md">
                <Skeleton className="h-[500px] w-full"/>
            </div>
        </div>
    )
}

