"use client"
import {ThemeToggle} from "@/components/theme-toggle"
import {Notifications} from "@/components/notifications"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {useSettings} from "@/contexts/settings-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import React, { useEffect, useState } from "react"
import {signOut, useSession} from "next-auth/react"
import Image from "next/image"
import { Download} from "lucide-react"


export function TopNav() {
    const pathname = usePathname()
    const {settings} = useSettings()
    const session = useSession()

    const [newsContext, setNewsContext] = useState<any>(null)

    const isNewsSection = pathname.startsWith('/news')

    useEffect(() => {
        const loadNewsContext = async () => {
            if (isNewsSection) {
                try {
                    const mod = await import("@/contexts/news-context")
                    setNewsContext(mod.useNewsContext())
                } catch {
                    setNewsContext(null)
                }
            }
        }
        loadNewsContext()
    }, [isNewsSection])

    return (
        <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-4">
                    <div className="relative h-10 w-24 hidden md:block">
                        <Link href="/">
                            <Image
                                src="/biznow-logo.webp"
                                alt="Biznow Logo"
                                fill
                                className="object-contain"
                            />
                        </Link>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <Link href="/app" className={`text-sm font-medium ${pathname === '/app' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            Dashboard
                        </Link>

                        {/* Separate buttons for News and News Summary */}
                        <Link href="/news" className={`text-sm font-medium ${pathname === '/news' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            News
                        </Link>

                        <Link href="/news/summary" className={`text-sm font-medium ${pathname === '/news/summary' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            News Summary
                        </Link>

                        <Link href="/pricing" className={`text-sm font-medium ${pathname === '/pricing' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            Pricing
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {/* News-specific actions - just download button */}
                    {isNewsSection && newsContext && (
                        <Button
                            className="gap-2"
                            variant="outline"
                            size="sm"
                            onClick={newsContext.exportReport}
                            disabled={newsContext.isExporting}
                        >
                            <Download className="h-4 w-4"/>
                            {newsContext.isExporting ? "Exporting..." : "Export Report"}
                        </Button>
                    )}

                    {(session?.data?.user as any)?.role === "ADMIN" && (
                        <Link href="/admin" className="text-sm font-medium">
                            Admin Dashboard
                        </Link>
                    )}
                    <Notifications/>
                    <ThemeToggle/>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={settings.avatar} alt={
                                        session?.data?.user?.image || "User"
                                    }/>
                                    <AvatarFallback>
                                        {(session?.data?.user?.name || "User")
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{
                                        session?.data?.user?.name || "User"
                                    }</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>
                                <form
                                    action={async () => {
                                        await signOut()
                                    }}
                                >
                                    <button type="submit">Sign Out</button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
