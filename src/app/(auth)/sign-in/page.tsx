"use client"

import React, {useState} from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {signIn} from "next-auth/react"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import { useCursorAnimation } from "@/hooks/useCursorAnimation";

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {toast} from "sonner"
import {ThemeToggle} from "@/components/theme-toggle";

const formSchema = z.object({
    username: z.string().min(1, {message: "Username is required."}),
    password: z.string().min(1, {message: "Password is required."}),
})

export default function SignInPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const res = await signIn("credentials", {
                username: values.username,
                password: values.password,
                redirect: false,
            })
            console.log(res)
            if (res?.error) {
                // Attach error to the username field so it displays inline with the input
                form.setError("username", {message: ""})
                form.setError("password", {message: "Invalid username or password."})
            } else {
                toast.success("You've successfully signed in!")
                router.push("/app")
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
                        className="text-center text-3xl font-bold text-[#624bfa] drop-shadow-md transition-all duration-300 hover:scale-105"
                    >
                        Sign in
                    </CardTitle>
                    <CardDescription className="text-center">Enter your credentials to access your
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
                            <div className="text-right">
                                <Link href="/reset-password" className="text-sm text-primary underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-[#624bfa] hover:bg-[#513dd1] text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/sign-up" className="text-primary underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
