"use client"

import React, {useState} from "react"
import Link from "next/link"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import { useCursorAnimation } from "@/hooks/useCursorAnimation";

import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {toast} from "sonner"
import {ThemeToggle} from "@/components/theme-toggle";

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
})

async function resetPassword(values: z.infer<typeof formSchema>) {
    const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
    })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send reset email")
    }
    return res.json()
}

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await resetPassword(values)
            setIsSubmitted(true)
            toast.success(
                "If an account exists with that email, we've sent a password reset link."
            )
        } catch (error) {
            console.error(error)
            toast.error("Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    useCursorAnimation();

    return (
        <div className="animated-bg flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-radial opacity-0 transition-opacity duration-300" id="cursor-bg"></div>
            <div className="absolute right-5 top-5"><ThemeToggle/></div>
            <div
                id="cursor-bg"
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out"
                style={{ background: "transparent" }}
            ></div>
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle
                        role="heading"
                        className="text-center text-3xl font-bold text-[#624bfa] drop-shadow-md transition-all duration-300 hover:scale-105">
                        Reset password
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we&apos;ll send you a link to reset your
                        password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="space-y-4 text-center">
                            <p className="text-muted-foreground">
                                Check your email for a link to reset your password. If it doesn&apos;t
                                appear within a few minutes, check your spam folder.
                            </p>
                            <Button asChild className="mt-2">
                                <Link href="/sign-in">Return to sign in</Link>
                            </Button>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-[#624bfa] hover:bg-[#513dd1] text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Sending reset link..." : "Send reset link"}
                                </Button>
                            </form>
                        </Form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link href="/sign-in" className="text-primary underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
