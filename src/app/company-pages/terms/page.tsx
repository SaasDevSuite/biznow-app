"use client"

import React from "react"
import Link from "next/link"
import {motion} from "framer-motion"
import {ArrowLeft, FileText} from "lucide-react"
import {Button} from "@/components/ui/button"
import {ThemeToggle} from "@/components/theme-toggle"

export default function TermsPage() {
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
                            <ArrowLeft className="h-4 w-4"/>
                            Back to Home
                        </Link>
                    </Button>

                    <ThemeToggle/>
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="w-full max-w-3xl bg-card border-2 border-blue-600/20 dark:border-blue-800/30 rounded-xl overflow-hidden shadow-lg z-10 my-8"
                >
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 flex justify-center">
                        <div className="bg-white/20 dark:bg-black/20 p-4 rounded-full">
                            <FileText className="h-10 w-10 text-white"/>
                        </div>
                    </div>

                    <div className="p-8">
                        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
                            Terms of Service
                        </h1>

                        <p className="text-center text-muted-foreground text-sm mb-8">
                            Effective Date: June 11, 2025
                        </p>

                        <p className="mb-6 text-foreground">
                            By using Biznow, you agree to the following:
                        </p>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Eligibility
                                </h2>
                                <p className="text-muted-foreground">
                                    You must be 10 years or older and legally allowed to use AI services in your region.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Account Use
                                </h2>
                                <p className="text-muted-foreground">
                                    You are responsible for all activity on your account. Don&apos;t share your
                                    credentials.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Termination
                                </h2>
                                <p className="text-muted-foreground">
                                    We may suspend or terminate your access if you violate these terms or abuse the
                                    system.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Changes
                                </h2>
                                <p className="text-muted-foreground">
                                    We may update these terms from time to time. Continued use implies acceptance.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Data Processing
                                </h2>
                                <p className="text-muted-foreground">
                                    We process your data in accordance with our Privacy Policy. By using Biznow, you
                                    consent to this processing.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Intellectual Property
                                </h2>
                                <p className="text-muted-foreground">
                                    All content and technology provided by Biznow is owned by us or our licensors and is
                                    protected by intellectual property laws.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-muted-foreground">
                                For more legal details, contact us at{" "}
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