import "../../globals.css";
import {Sidebar} from "@/components/admin/sidebar";
import {TopNav} from "@/components/admin/top-nav";
import type React from "react";
import {auth} from "@/auth";
import NotAuthenticated from "@/components/not-authenticated";
import {Role} from "@prisma/client";


export const metadata = {
    title: "SaaSDevSuite Dashboard",
    description: "A modern, powerful and user-friendly dashboard for your SaaS/MicrosSaaS project.",
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) return <NotAuthenticated/>;
    if (!(session.user as any).role || (session.user as any).role !== Role.ADMIN) return <NotAuthenticated/>

    return (
        <div className="min-h-screen flex">
            <Sidebar/>
            <div className="flex-1">
                <TopNav/>
                <div className="container mx-auto p-6">
                    <main className="w-full">{children}</main>
                </div>
            </div>
        </div>
    );
}
