"use client"

import React from "react"
import Link from "next/link"
import {motion} from "framer-motion"
import {ArrowLeft, Lock} from "lucide-react"
import {Button} from "@/components/ui/button"
import {ThemeToggle} from "@/components/theme-toggle"

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Background grid pattern */}
            <div
                className="absolute inset-0 opacity-10 dark:opacity-5 z-0"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(55, 65, 81, 0.1) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(55, 65, 81, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }}
            />

            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto py-4 px-4 flex justify-between items-center">
                    <Button variant="ghost" asChild>
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>

                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="w-full max-w-3xl bg-card border-2 border-blue-600/20 dark:border-blue-800/30 rounded-xl overflow-hidden shadow-lg z-10"
                >
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 flex justify-center">
                        <div className="bg-white/20 dark:bg-black/20 p-4 rounded-full">
                            <Lock className="h-10 w-10 text-white"/>
                        </div>
                    </div>

                    <div className="p-8">
                        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
                            Privacy Policy
                        </h1>

                        <p className="text-center text-muted-foreground text-sm mb-8">
                            Effective Date: June 11, 2025
                        </p>

                        <p className="mb-6 text-foreground">
                            Biznow values your privacy. Here&#39;s how we handle your data:
                        </p>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Data Collection
                                </h2>
                                <p className="text-muted-foreground">
                                    We collect minimal user data such as email, news preferences, and usage metrics to
                                    improve the platform and provide personalized business intelligence.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Third-Party APIs
                                </h2>
                                <p className="text-muted-foreground">
                                    We connect to external AI providers (e.g., GROUQ, TensorFlow) for news analysis. Your
                                    data is securely routed through these APIs.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Security
                                </h2>
                                <p className="text-muted-foreground">
                                    All data is encrypted in transit using industry standards (TLS). Stored data is
                                    protected using secure access controls. We do not sell your data.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Cookies
                                </h2>
                                <p className="text-muted-foreground">
                                    We use cookies to improve functionality — not for tracking ads.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-muted-foreground">
                                You can delete your account or data anytime by contacting{" "}
                                <a href="mailto:info@syigen.com"
                                   className="text-blue-600 dark:text-blue-400 hover:underline">
                                    info@syigen.com
                                </a>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}