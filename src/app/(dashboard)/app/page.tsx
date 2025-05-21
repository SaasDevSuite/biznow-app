'use client'
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BarChart3, Newspaper, PieChart } from "lucide-react"

const Page = () => {
    const session = useSession()
    
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Welcome to Biznow</h1>
            <p className="text-muted-foreground mb-8">Your business news analytics platform</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Newspaper className="h-5 w-5" />
                            News Dashboard
                        </CardTitle>
                        <CardDescription>
                            View the latest business news analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            Get insights from our news analysis with sentiment tracking and industry impact scores.
                        </p>
                        <Button asChild>
                            <Link href="/news" className="flex items-center gap-2">
                                View News Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            News Summary
                        </CardTitle>
                        <CardDescription>
                            Browse all captured news articles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            See a complete list of all news articles with filtering by category and sentiment.
                        </p>
                        <Button asChild>
                            <Link href="/news/summary" className="flex items-center gap-2">
                                View News Summary
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Subscription Plans
                        </CardTitle>
                        <CardDescription>
                            View and manage your subscription
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            Check out our subscription plans to get the most out of Biznow&apos;s features.
                        </p>
                        <Button asChild>
                            <Link href="/pricing" className="flex items-center gap-2">
                                View Plans
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="text-sm overflow-auto p-4 bg-muted rounded-md">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}

export default Page