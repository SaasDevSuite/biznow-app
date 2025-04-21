"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { auth } from "@/auth"
import Link from "next/link"
import Image from "next/image"

export default async function Home() {
    const session = await auth()

    if (session) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-8 p-4 text-center">
                <div className="absolute right-4 top-4">
                    <ThemeToggle />
                </div>
                <div className="space-y-2">
                    <Image 
                        src="/biznow-logo.webp" 
                        alt="Biznow Logo" 
                        width={200} 
                        height={80} 
                        className="mx-auto mb-6" 
                    />
                    <h1 className="text-4xl font-bold">Welcome to Biznow</h1>
                    <p className="text-muted-foreground">Your business news analytics platform</p>
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
                <ThemeToggle />
            </div>
            <div className="space-y-2">
                <Image 
                    src="/biznow-logo.webp" 
                    alt="Biznow Logo" 
                    width={200} 
                    height={80} 
                    className="mx-auto mb-6" 
                />
                <h1 className="text-4xl font-bold">Biznow</h1>
                <p className="text-muted-foreground">Business news analytics that keeps you ahead of the market</p>
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button asChild size="lg" variant="default">
                    <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="/sign-up">Sign Up</Link>
                </Button>
            </div>
        </div>
    )
}

