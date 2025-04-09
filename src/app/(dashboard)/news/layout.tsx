"use client";

import React, { useState } from "react";
import { Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NewsProvider, useNewsContext } from "@/contexts/news-context";
import { usePathname, useRouter } from "next/navigation";

function NewsHeader() {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { exportReport, isExporting } = useNewsContext();
    const router = useRouter();
    const pathname = usePathname();

    // Check if we're on the news summary page
    const isOnSummaryPage = pathname === '/news/summary';

    const handleToggleView = () => {
        // Navigate to summary page if not there, otherwise back to main news dashboard
        if (isOnSummaryPage) {
            router.push('/news');
        } else {
            router.push('/news/summary');
        }
    };

    return (
        <header className="border-b border-border bg-background sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="relative h-10 w-24">
                        <Image
                            src="/biznow-logo.webp"
                            alt="Biznow Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <ThemeToggle/>
                    <Button
                        className="gap-2"
                        variant="outline"
                        onClick={exportReport}
                        disabled={isExporting}
                    >
                        <Download className="h-4 w-4"/>
                        {isExporting ? "Exporting..." : "Export"}
                    </Button>
                    <Button
                        className="gap-2"
                        variant="outline"
                        onClick={handleToggleView}
                    >
                        <Settings className="h-4 w-4"/>
                        {isOnSummaryPage ? "News Report" : "News Summary"}
                    </Button>
                </div>
            </div>
        </header>
    );
}

function NewsLayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <NewsHeader/>
            <main className="flex-1">{children}</main>
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