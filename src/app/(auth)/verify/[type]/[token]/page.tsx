"use client"

import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import Link from "next/link"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {toast} from "sonner"

export default function VerifyEmailPage() {
    const {token} = useParams() as { token: string }
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        async function verifyEmail() {
            try {
                const res = await fetch("/api/auth/verify-email/confirm", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({token}),
                })
                const data = await res.json()
                if (!res.ok) {
                    setMessage(data.error || "Verification failed")
                    toast.error(data.error || "Verification failed")
                } else {
                    setMessage("Email verified successfully!")
                    toast.success("Email verified successfully!")
                }
            } catch (error) {
                console.error(error)
                setMessage("An error occurred")
                toast.error("An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            verifyEmail()
        }
    }, [token])

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
                    <CardDescription>
                        {loading ? "Verifying your email, please wait..." : message}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!loading && (
                        <div className="text-center">
                            <Button asChild>
                                <Link href="/sign-in">Go to Sign In</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        If you did not receive an email, please check your spam folder.
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
