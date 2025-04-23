"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {ThemeToggle} from "@/components/theme-toggle"
import {useSession} from "next-auth/react";
import {useCursorAnimation} from "@/hooks/useCursorAnimation";

export default function Home() {
    const typingAnimationStyles = `
        .typing-animation {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            border-right: 4px solid #624bfa;
            padding-right: 4px;
            width: 0;
            animation: typing 7s steps(40) infinite, blink-caret 10.5s step-end infinite;
        }

        @keyframes typing {
            0% { width: 0; }
            30% { width: 100%; }
            80% { width: 100%; }
            100% { width: 0; }
        }

        @keyframes blink-caret {
            from, to { border-color: transparent }
            50% { border-color: #624bfa }
        }
    `;

    useCursorAnimation();

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
            <div className="animated-bg flex min-h-screen flex-col items-center justify-center space-y-8 p-4 text-center relative overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: typingAnimationStyles }} />
                <div
                    id="cursor-bg"
                    className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out"
                    style={{ background: "transparent" }}
                ></div>
                <div className="absolute right-4 top-4">
                    <ThemeToggle/>
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold relative">
                        <span className="typing-animation">Welcome to the Freelancer Buddy</span>
                    </h1>
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
        <div className="animated-bg flex min-h-screen flex-col items-center justify-center space-y-8 p-4 text-center relative overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: typingAnimationStyles }} />
            <div
                id="cursor-bg"
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out"
                style={{ background: "transparent" }}
            ></div>
            <div className="absolute right-4 top-4">
                <ThemeToggle/>
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-bold relative text-[#624bfa]">
                    <span className="typing-animation">Welcome to Biznow</span>
                </h1>
                <p className="text-muted-foreground">Biznow delivers intelligent business news—categorized, summarized, and analyzed to keep you ahead.</p>
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button
                    asChild size="lg"
                    type="submit"
                    className="bg-[#624bfa] hover:bg-[#513dd1] text-white"
                >
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

