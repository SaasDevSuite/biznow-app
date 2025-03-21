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
import React from "react"
import {signOut, useSession} from "next-auth/react"

export function TopNav() {
    const pathname = usePathname()
    const pathSegments = pathname.split("/").filter(Boolean)
    const {settings} = useSettings()
    const {data: session} = useSession()

    return (
        <header className="sticky top-0 z-40 border-b  bg-background">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="hidden md:block">
                    <nav className="flex items-center space-x-2">
                        <Link href="/" className="text-sm font-medium">
                            Home
                        </Link>
                        {pathSegments.map((segment, index) => (
                            <React.Fragment key={segment}>
                                <span className="text-muted-foreground">/</span>
                                <Link href={`/${pathSegments.slice(0, index + 1).join("/")}`}
                                      className="text-sm font-medium">
                                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                                </Link>
                            </React.Fragment>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {(session?.user as any)?.role === "ADMIN" && (
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
                                        session?.user?.image || "User"
                                    }/>
                                    <AvatarFallback>
                                        {(session?.user?.name || "User")
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
                                        session?.user?.name || "User"
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

