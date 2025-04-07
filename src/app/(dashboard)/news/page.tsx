"use client";

import React, {useEffect, useRef, useState} from "react";
import {ArrowDown01, ArrowUp01, BarChart3, Download, Flame, LineChart, Settings, SmilePlus,} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import LineCharts, {FrequencyData} from "@/components/custom/frequency-chart";
import DonutChart, {ChartData} from "@/components/custom/donut-chart";
import {fetchNewsItems} from "@/actions/news/query";
import {ThemeToggle} from "@/components/theme-toggle";
import Image from "next/image";
import {exportAsPDF} from "@/utils/pdf-export";
import {SummarizedNews} from "@prisma/client";

interface DashboardData {
    newsItems: SummarizedNews[];
    categoryData: ChartData[];
    sentimentData: ChartData[];
    frequencyData: FrequencyData[];
    city: string;
    industryImpactScore: number;
    competitorMentions: number;
    positiveSentiment: number;
    engagementRate: number;
    lastUpdated: string;
}

export default function NewsDashboard() {
    const [mounted, setMounted] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        newsItems: [],
        categoryData: [],
        sentimentData: [],
        frequencyData: [
            {day: "Mon", value: 150},
            {day: "Tue", value: 230},
            {day: "Wed", value: 220},
            {day: "Thu", value: 210},
            {day: "Fri", value: 135},
            {day: "Sat", value: 145},
            {day: "Sun", value: 260},
        ],
        city: "Kalutara",
        industryImpactScore: 85,
        competitorMentions: 320,
        positiveSentiment: 68,
        engagementRate: 24.8,
        lastUpdated: "",
    });

    const [isExporting, setIsExporting] = useState<boolean>(false);
    const dashboardRef = useRef<HTMLDivElement>(null);

    const getColorForCategory = (category: string): string => {
        const mapping: Record<string, string> = {
            Technology: "#4a69dd",
            Economy: "#90c469",
            Environment: "#f6c652",
            Politics: "#f05a5a",
            Other: "#5ec8eb",
        };
        return mapping[category] || "#8884d8";
    };

    const getColorForSentiment = (sentiment: string): string => {
        const mapping: Record<string, string> = {
            Positive: "#4a69dd",
            Neutral: "#90c469",
            Negative: "#f6c652",
        };
        return mapping[sentiment] || "#8884d8";
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {newsItems} = await fetchNewsItems(1, 100);
                const transformedNews: SummarizedNews[] = newsItems.map((item) => ({
                    id: item.id,
                    title: item.title,
                    content: item.content,
                    category: item.category,
                    sentiment: item.sentiment,
                    date: item.date,
                    url: item.url,
                }));

                const categoryMap: Record<string, number> = {};
                const sentimentMap: Record<string, number> = {};

                transformedNews.forEach((item) => {
                    if (item.category) {
                        categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
                    }
                    if (item.sentiment) {
                        sentimentMap[item.sentiment] = (sentimentMap[item.sentiment] || 0) + 1;
                    }
                });

                setDashboardData((prev) => ({
                    ...prev,
                    newsItems: transformedNews,
                    categoryData: Object.keys(categoryMap).map((key) => ({
                        name: key,
                        value: categoryMap[key],
                        color: getColorForCategory(key),
                    })),
                    sentimentData: Object.keys(sentimentMap).map((key) => ({
                        name: key,
                        value: sentimentMap[key],
                        color: getColorForSentiment(key),
                    })),
                    lastUpdated: new Date().toISOString(),
                }));
            } catch (error) {
                console.error("Failed to fetch news:", error);
            }
        };

        fetchData();
    }, []);

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await exportAsPDF(dashboardData);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div
            id="news-dashboard"
            className="flex flex-col min-h-screen bg-background"
            ref={dashboardRef}
        >
            <header className="border-b border-border bg-background">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="relative h-10 w-24">
                        <Image
                            src="/biznow-logo.webp"
                            alt="Biznow Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <Input
                                className="w-full bg-background pl-10"
                                placeholder="Search news..."
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-search"
                                >
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.3-4.3"/>
                                </svg>
                            </div>
                        </div>
                        <ThemeToggle/>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleExportPDF}
                            disabled={isExporting}
                        >
                            <Download className="h-4 w-4"/>
                            {isExporting ? "Exporting..." : "Export"}
                        </Button>
                        <Button className="gap-2" variant="outline">
                            <Settings className="h-4 w-4"/>
                            Settings
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <p className="text-muted-foreground">
                        Last Updated:{" "}
                        {mounted
                            ? new Date(dashboardData.lastUpdated).toLocaleString()
                            : "Loading..."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                Industry Impact Score
                                <BarChart3 className="h-4 w-4 text-foreground"/>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {dashboardData.industryImpactScore}/100
                            </div>
                            <div className="flex items-center mt-1 text-green-500 text-sm">
                                <ArrowUp01 className="h-4 w-4 mr-1"/>
                                12.5% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                Competitor Mentions
                                <Flame className="h-4 w-4 text-foreground"/>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {dashboardData.competitorMentions} mentions
                            </div>
                            <div className="flex items-center mt-1 text-red-500 text-sm">
                                <ArrowDown01 className="h-4 w-4 mr-1"/>
                                Up 12%
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                Positive Sentiment
                                <SmilePlus className="h-4 w-4 text-foreground"/>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {dashboardData.positiveSentiment}%
                            </div>
                            <div className="flex items-center mt-1 text-green-500 text-sm">
                                <ArrowUp01 className="h-4 w-4 mr-1"/>
                                5.3% from last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                Engagement Rate
                                <LineChart className="h-4 w-4 text-foreground"/>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {dashboardData.engagementRate}%
                            </div>
                            <div className="flex items-center mt-1 text-green-500 text-sm">
                                <ArrowUp01 className="h-4 w-4 mr-1"/>
                                2.1% from last month
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="flex justify-center py-4">
                            <DonutChart title="Sentiment Analysis" data={dashboardData.sentimentData}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center justify-center">
                            <LineCharts title="News Frequency" data={dashboardData.frequencyData}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex justify-center py-4">
                            <DonutChart title="Category Distribution" data={dashboardData.categoryData}/>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
