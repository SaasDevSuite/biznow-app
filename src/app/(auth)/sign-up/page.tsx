"use client"

import React, {useState} from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {useCursorAnimation} from "@/hooks/useCursorAnimation"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {toast} from "sonner"
import {ThemeToggle} from "@/components/theme-toggle";


const formSchema = z.object({
    username: z.string().min(3, {
        message: "Username must be at least 3 characters.",
    }),
    email: z
        .string()
        .email({message: "Please enter a valid email address."})
        .optional()
        .or(z.literal("")),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})

export default function SignUpPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })
            const data = await res.json()

            if (!res.ok) {
                // Show errors next to the related field
                if (data.error === "Email already exists.") {
                    form.setError("email", {message: data.error})
                } else if (data.error === "Username already exists.") {
                    form.setError("username", {message: data.error})
                } else {
                    toast.error(data.error || "Sign up failed")
                }
            } else {
                toast.success("Account created! Please check your email and verify your account.")
                router.push("/sign-in")
            }
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
            <div
                id="cursor-bg"
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out"
                style={{background: "transparent"}}
            ></div>
            <div
                className="pointer-events-none absolute inset-0 z-0 bg-gradient-radial opacity-0 transition-opacity duration-300"
                id="cursor-bg"></div>
            <div className="absolute right-5 top-5"><ThemeToggle/></div>
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle
                        role="heading"
                        className="text-center text-3xl font-bold text-[#624bfa] drop-shadow-md transition-all duration-300 hover:scale-105"
                    >
                        Create an Account
                    </CardTitle>
                    <CardDescription className="text-center">Enter your details below to create your
                        account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email (optional)</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
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
                                {isLoading ? "Creating account..." : "Sign up"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-primary underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
