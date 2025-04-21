import "../../globals.css";
import type React from "react";
import {auth} from "@/auth";
import NotAuthenticated from "@/components/not-authenticated";
import {TopNav} from "@/components/app/top-nav";


export const metadata = {
    title: "Biznow - Dashboard",
    description: "Business news analytics dashboard",
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) return <NotAuthenticated/>;

    return (
        <div className="min-h-screen flex">
            <div className="flex-1">
                <TopNav/>
                <div className="container mx-auto p-6">
                    <main className="w-full">{children}</main>
                </div>
            </div>
        </div>
    );
}
