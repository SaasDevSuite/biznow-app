"use client";

import React, {useEffect, useState} from "react";
import Link from "next/link";
import {ArrowDown01, ArrowUp01, BarChart3, Download, Flame, LineChart, Settings, SmilePlus} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import LineCharts, {FrequencyData} from "@/components/custom/frequency-chart";
import DonutChart, {ChartData} from "@/components/custom/donut-chart";
import {fetchNewsItems} from "@/actions/news/query";
import {ThemeToggle} from "@/components/theme-toggle";
import Image from 'next/image';


interface NewsItem {
    id: string;
    title: string;
    category: string;
    sentiment: string;
    date: string;
}

export default function NewsDashboard() {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [city, setCity] = useState<string>("Kalutara");
    const [categoryData, setCategoryData] = useState<ChartData[]>([]);
    const [sentimentData, setSentimentData] = useState<ChartData[]>([]);

    const frequencyData: FrequencyData[] = [
        {day: "Mon", value: 150},
        {day: "Tue", value: 230},
        {day: "Wed", value: 220},
        {day: "Thu", value: 210},
        {day: "Fri", value: 135},
        {day: "Sat", value: 145},
        {day: "Sun", value: 260}
    ];

    useEffect(() => {
        const fetchData = async () => {
            const data: NewsItem[] = await fetchNewsItems();
            setNewsItems(data);

            const categoryMap: Record<string, number> = {};
            const sentimentMap: Record<string, number> = {};

            data.forEach(item => {
                if (item.category) {
                    categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
                }
                if (item.sentiment) {
                    sentimentMap[item.sentiment] = (sentimentMap[item.sentiment] || 0) + 1;
                }
            });

            const categoryArray: ChartData[] = Object.keys(categoryMap).map(key => ({
                name: key,
                value: categoryMap[key],
                color: getColorForCategory(key)
            }));

            const sentimentArray: ChartData[] = Object.keys(sentimentMap).map(key => ({
                name: key,
                value: sentimentMap[key],
                color: getColorForSentiment(key)
            }));

            setCategoryData(categoryArray);
            setSentimentData(sentimentArray);
        };

        fetchData();
    }, []);

    const getColorForCategory = (category: string): string => {
        const mapping: Record<string, string> = {
            Technology: "#4a69dd",
            Economy: "#90c469",
            Environment: "#f6c652",
            Politics: "#f05a5a",
            Other: "#5ec8eb"
        };
        return mapping[category] || "#8884d8";
    };

    const getColorForSentiment = (sentiment: string): string => {
        const mapping: Record<string, string> = {
            Positive: "#4a69dd",
            Neutral: "#90c469",
            Negative: "#f6c652"
        };
        return mapping[sentiment] || "#8884d8";
    };

    // Function to export the report as CSV.
    const handleExportReport = () => {
        // Define the CSV header.
        const header = ["ID", "Title", "Category", "Sentiment", "Date"];
        // Map newsItems to CSV rows.
        const rows = newsItems.map(item => [
            item.id,
            `"${item.title.replace(/"/g, '""')}"`, // escape quotes
            item.category,
            item.sentiment,
            new Date(item.date).toLocaleDateString()
        ]);

        // Join header and rows.
        const csvContent =
            [header, ...rows]
                .map(e => e.join(","))
                .join("\n");

        const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `news_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="border-b border-border bg-background">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Image
                        src="/biznow-logo.webp"
                        alt="Biznow Logo"
                        className="h-10"
                        width={100}
                        height={40}
                        layout="intrinsic"
                    />
                    <div className="flex gap-2">
                        <ThemeToggle/>
                        <Button onClick={handleExportReport} className="gap-2" variant="default">
                            <Download className="h-4 w-4"/>
                            Export Report
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
                    <p className="text-muted-foreground">Today: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="w-full max-w-[300px] bg-background">
                            <SelectValue placeholder="Select City"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Kalutara">Kalutara</SelectItem>
                            <SelectItem value="Panadura">Panadura</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative flex-1">
                        <Input className="w-full bg-background pl-10" placeholder="Search news..."/>
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
                            <div className="text-3xl font-bold text-foreground">85/100</div>
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
                            <div className="text-3xl font-bold text-foreground">320 mentions</div>
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
                            <div className="text-3xl font-bold text-foreground">68%</div>
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
                            <div className="text-3xl font-bold text-foreground">24.8%</div>
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
                            <DonutChart title="Sentiment Analysis" data={sentimentData}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center justify-center">
                            <LineCharts title={"News Frequency"} data={frequencyData}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex justify-center py-4">
                            <DonutChart title="Category Distribution" data={categoryData}/>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Latest News</h2>
                    <div className="bg-background rounded-md border border-border overflow-hidden">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Sentiment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Read More
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                            {newsItems.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                        {item.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {item.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.sentiment === "Positive"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                      >
                        {item.sentiment}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        <Link href={`/news/${item.id}`} className="hover:underline">
                                            Read More
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
