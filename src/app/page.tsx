"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {ThemeToggle} from "@/components/theme-toggle"
import {useCursorAnimation} from "@/hooks/useCursorAnimation"

export default function Home() {
    useCursorAnimation();

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
  `

    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setIsDark(document.documentElement.classList.contains("dark"))

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

    if (!mounted) return null

    return (
        <div
            className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
            {/* 👇 This is the animated background */}
            <div
                id="cursor-bg"
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
                style={{opacity: 0}}
            />

            <style dangerouslySetInnerHTML={{__html: typingAnimationStyles}}/>

            <div className="absolute right-4 top-4 z-10">
                <ThemeToggle/>
            </div>

            <h1 className="text-4xl font-bold text-[#624bfa] z-10">
                <span className="typing-animation">Welcome to Biznow</span>
            </h1>
            <p className="text-muted-foreground mt-2 z-10">
                Biznow delivers intelligent business news—categorized, summarized, and analyzed to keep you ahead.
            </p>

            <div className="flex mt-6 flex-col sm:flex-row gap-4 z-10">
                <Button
                    asChild
                    size="lg"
                    type="submit"
                    className="bg-[#624bfa] hover:bg-[#513dd1] text-white"
                >
                    <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link href="/sign-up">Sign Up</Link>
                </Button>
            </div>

            <div className="flex mt-4 flex-col sm:flex-row gap-4 z-10">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/reset-password">Reset Password</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                    <Link href="/set-password">Set Password</Link>
                </Button>
            </div>

            <div className="mt-8 p-4 border rounded-md bg-card z-10">
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
