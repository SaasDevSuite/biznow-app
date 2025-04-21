import type React from "react"
import {Inter} from "next/font/google"
import "./globals.css"
import {Toaster} from "sonner";
import {SessionProvider} from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import {SettingsProvider} from "@/contexts/settings-context";
import {TooltipProvider} from "@/components/ui/tooltip";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "Biznow - Business News Analytics",
    description: "Business news analytics that keeps you ahead of the market",
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
        </head>
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SettingsProvider>
                <TooltipProvider delayDuration={0}>
                    <SessionProvider>
                        {children}
                        <Toaster/>
                    </SessionProvider>
                </TooltipProvider>
            </SettingsProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}

