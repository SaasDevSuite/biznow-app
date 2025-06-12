"use client"

import React from "react"
import Link from "next/link"
import {motion} from "framer-motion"
import {ArrowLeft, Brain} from "lucide-react"
import {Button} from "@/components/ui/button"
import {ThemeToggle} from "@/components/theme-toggle"

export default function AboutUsPage() {
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
                    className="w-full max-w-4xl space-y-8 z-10 my-8"
                >
                    {/* About Us Section */}
                    <div
                        className="bg-card border-2 border-blue-600/20 dark:border-blue-800/30 rounded-xl overflow-hidden shadow-lg">
                        <div
                            className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 flex justify-center">
                            <div className="bg-white/20 dark:bg-black/20 p-4 rounded-full">
                                <Brain className="h-10 w-10 text-white"/>
                            </div>
                        </div>

                        <div className="p-8">
                            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
                                About Us
                            </h1>

                            <div className="space-y-6 text-foreground">
                                <p className="text-lg">
                                    Biznow was born out of a simple frustration: business professionals needed a better
                                    way to stay informed about market trends and industry news that actually matter to
                                    them.
                                </p>

                                <p className="text-lg">
                                    We&apos;re not a big tech conglomerate. We&apos;re a passionate team who started
                                    building AI tools before they were mainstream. Biznow is the result of our hands-on
                                    experience, crafted to solve real problems faced by real business leaders.
                                </p>

                                <p className="text-lg">
                                    Our mission is to make business intelligence accessible, efficient, and
                                    human-centered. With Biznow, you&apos;re not just consuming news, you&apos;re
                                    mastering it.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vision, Values, Team Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            whileHover={{y: -5}}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 text-white shadow-lg"
                        >
                            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                            <p>
                                To create the most intuitive and powerful AI interface that empowers everyone to harness
                                the full potential of business intelligence and stay ahead of market trends.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{y: -5}}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 text-white shadow-lg"
                        >
                            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
                            <p>
                                Transparency, user privacy, and creating tools that augment human decision-making rather
                                than replace it. We believe in ethical AI that serves people.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{y: -5}}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 text-white shadow-lg"
                        >
                            <h2 className="text-2xl font-bold mb-4">Our Team</h2>
                            <p>
                                A diverse group of engineers, designers, and business intelligence experts committed to
                                building the future of AI-powered market analysis.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}