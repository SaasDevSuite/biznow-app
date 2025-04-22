"use client"

import React, {useState} from "react"
import Link from "next/link"
import {useRouter} from "next/navigation"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import { useCursorAnimation } from "@/hooks/useCursorAnimation";

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {toast} from "sonner";
import {ThemeToggle} from "@/components/theme-toggle";

const formSchema = z
    .object({
        password: z.string().min(8, {
            message: "Password must be at least 8 characters.",
        }),
        confirmPassword: z.string().min(8, {
            message: "Password must be at least 8 characters.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })


export default function SetPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            console.log(values);
            toast("Your password has been successfully updated.");
            await router.push("/sign-in"); // Await the push to simulate a pending submission.
        } catch (error) {
            console.log(`${error}`);
            toast("Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    useCursorAnimation();

    return (
        <div className="animated-bg flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-radial opacity-0 transition-opacity duration-300" id="cursor-bg"></div>
            <div
                id="cursor-bg"
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out"
                style={{ background: "transparent" }}
            ></div>
            <div className="absolute right-5 top-5"><ThemeToggle/></div>
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle
                        role="heading"
                        className="text-center text-3xl font-bold text-[#624bfa] drop-shadow-md transition-all duration-300 hover:scale-105"
                    >
                        Set new password
                    </CardTitle>
                    <CardDescription>Create a new password for your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
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
                                {isLoading ? "Updating password..." : "Update password"}
                            </Button>
                        </form>
                    </Form>
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

