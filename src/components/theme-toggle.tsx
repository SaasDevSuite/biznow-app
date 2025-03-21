"use client"

import {useEffect, useState} from "react"
import {Moon, Sun} from "lucide-react"
import {Button} from "@/components/ui/button"
import {toast} from "sonner"

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)

    // Initialize on mount
    useEffect(() => {
        // Check if dark mode is active
        const isDarkMode = document.documentElement.classList.contains("dark")
        setIsDark(isDarkMode)
    }, [])

    // Function to toggle theme with direct DOM manipulation
    function toggleTheme() {
        if (document.documentElement.classList.contains("dark")) {
            // Switch to light mode
            document.documentElement.classList.remove("dark")
            setIsDark(false)
            localStorage.setItem("theme", "light")
            toast.success("The theme has been changed to light mode.")
        } else {
            // Switch to dark mode
            document.documentElement.classList.add("dark")
            setIsDark(true)
            localStorage.setItem("theme", "dark")
            toast.success("The theme has been changed to dark mode.")
        }
    }

    return (
        <Button variant="outline" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full">
            {isDark ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}
        </Button>
    )
}

