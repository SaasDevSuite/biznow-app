"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {ThemeToggle} from "@/components/theme-toggle"
import {useSession} from "next-auth/react";

export default function Home() {
    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)
    const {data: session} = useSession()

    useEffect(() => {
        setMounted(true)

        // Set initial state
        setIsDark(document.documentElement.classList.contains("dark"))

        // Set up observer to detect theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    setIsDark(document.documentElement.classList.contains("dark"))
                }
            })
        })

        observer.observe(document.documentElement, {attributes: true})

        return () => observer.disconnect()
    }, [])

    if (!mounted) {
        return null
    }

    if (session && session.user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-8 p-4 text-center">
                <div className="absolute right-4 top-4">
                    <ThemeToggle/>
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold">Welcome to the Freelancer Buddy</h1>
                    <p className="text-muted-foreground">This is a demonstration of authentication UI components</p>
                </div>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <Button asChild size="lg">
                        <Link href="/app">Dashboard</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-8 p-4 text-center">
            <div className="absolute right-4 top-4">
                <ThemeToggle/>
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">Welcome to the Auth Demo</h1>
                <p className="text-muted-foreground">This is a demonstration of authentication UI components</p>
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button asChild size="lg">
                    <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/sign-up">Sign Up</Link>
                </Button>
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/reset-password">Reset Password</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                    <Link href="/set-password">Set Password</Link>
                </Button>
            </div>
            <div className="mt-8 p-4 border rounded-md bg-card">
                <p className="text-sm font-medium">
                    Current Theme: <span className="font-bold">{isDark ? "Dark" : "Light"}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Click the {isDark ? "moon" : "sun"} icon in the top right to change the theme
                </p>
            </div>
        </div>
    )
}

