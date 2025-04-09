"use client";

import React, {useState} from "react";
import {Download, Settings} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ThemeToggle} from "@/components/theme-toggle";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {NewsProvider, useNewsContext} from "@/contexts/news-context";

function NewsHeader() {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const {exportReport, isExporting} = useNewsContext();

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
                    <div className="relative">
                        <Input
                            className={cn("w-full bg-background pl-10 transition-all", {
                                "w-60": !isSearchFocused,
                                "w-80": isSearchFocused,
                            })}
                            placeholder="Search news..."
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-search"
                            >
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.3-4.3"/>
                            </svg>
                        </div>
                    </div>
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
                    <Button className="gap-2" variant="outline">
                        <Settings className="h-4 w-4"/>
                        Settings
                    </Button>
                </div>
            </div>
        </header>
    );
}

function NewsLayoutContent({children}: { children: React.ReactNode }) {
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