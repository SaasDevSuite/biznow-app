'use server'
import {notFound} from "next/navigation"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ArrowLeft, Mail, User} from "lucide-react"
import {UserAccounts} from "@/components/admin/user-accounts"
import {UserSessions} from "@/components/admin/user-sessions"
import {getUserById} from "@/actions/user/query";
import Image from "next/image";

export default async function UserDetailsPage({
                                                  params,
                                              }: {
    params: Promise<{ id: string }>
}) {
    const {id} = await params
    const user = await getUserById(id)

    if (!user) {
        notFound()
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <Button variant="outline" asChild role={"button"}>
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to Users
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl">User Profile</CardTitle>
                            <Badge
                                role={"option"}
                                variant={user.isActive ? "default" : "destructive"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                        </div>
                        <CardDescription>Detailed information about {user.username}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-muted-foreground"/>
                                    <div>
                                        <p className="text-sm font-medium leading-none">Username</p>
                                        <p className="text-sm text-muted-foreground">{user.username}</p>
                                    </div>
                                </div>
                                {user.name && (
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium leading-none">Name</p>
                                            <p className="text-sm text-muted-foreground">{user.name}</p>
                                        </div>
                                    </div>
                                )}
                                {user.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-muted-foreground"/>
                                        <div>
                                            <p className="text-sm font-medium leading-none">Email</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                {user.image ? (
                                    <div className="aspect-square w-32 overflow-hidden rounded-md">
                                        <Image
                                            src={user.image || "/placeholder.svg"}
                                            alt={user.name || user.username}
                                            fill
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-32 w-32 items-center justify-center rounded-md bg-muted">
                                        <User className="h-12 w-12 text-muted-foreground"/>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="accounts">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="accounts">Accounts</TabsTrigger>
                        <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="accounts">
                        <Card>
                            <CardHeader>
                                <CardTitle>Linked Accounts</CardTitle>
                                <CardDescription>External accounts linked to this user</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UserAccounts userId={user.id}/>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="sessions">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                                <CardDescription>Currently active user sessions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UserSessions userId={user.id}/>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

