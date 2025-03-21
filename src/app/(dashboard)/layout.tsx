import "../globals.css";
import type React from "react";
import {auth} from "@/auth";
import NotAuthenticated from "@/components/not-authenticated";


export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) return <NotAuthenticated/>;

    return (
        <>{children}</>
    );
}
