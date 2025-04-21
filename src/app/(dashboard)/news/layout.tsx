"use client";

import React from "react";
import { NewsProvider } from "@/contexts/news-context";
import { TopNav } from "@/components/app/top-nav";

function NewsLayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <TopNav />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

export default function NewsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <NewsProvider>
            <NewsLayoutContent>{children}</NewsLayoutContent>
        </NewsProvider>
    );
}