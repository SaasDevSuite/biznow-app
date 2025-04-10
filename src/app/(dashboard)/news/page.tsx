"use client";

import React, {useEffect, useState} from "react";
import {ArrowDown01, ArrowUp01, BarChart3, Scale, SmilePlus, TrendingUp} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import LineCharts from "@/components/custom/line-chart";
import DonutChart from "@/components/custom/donut-chart";
import {Skeleton} from "@/components/ui/skeleton";
import {useNewsContext} from "@/contexts/news-context";

export default function NewsDashboard() {
    const [mounted, setMounted] = useState(false);
    const {dashboardData, isLoading} = useNewsContext();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <Skeleton className="h-6 w-64"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {Array(4).fill(0).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-5 w-40"/>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-9 w-28 mb-2"/>
                                <Skeleton className="h-4 w-32"/>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {Array(3).fill(0).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="flex justify-center py-4">
                                <Skeleton className="h-64 w-64 rounded-full"/>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
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
                            Business Growth Trend
                            <TrendingUp className="h-4 w-4 text-foreground"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {dashboardData.businessGrowthTrend > 0 ? "+" : ""}{dashboardData.businessGrowthTrend}
                        </div>
                        <div
                            className={`flex items-center mt-1 ${dashboardData.businessGrowthTrend >= 0 ? "text-green-500" : "text-red-500"} text-sm`}>
                            {dashboardData.businessGrowthTrend >= 0 ? (
                                <>
                                    <ArrowUp01 className="h-4 w-4 mr-1"/>
                                    More openings than closures
                                </>
                            ) : (
                                <>
                                    <ArrowDown01 className="h-4 w-4 mr-1"/>
                                    More closures than openings
                                </>
                            )}
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
                            Regulatory Ease Score
                            <Scale className="h-4 w-4 text-foreground"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {dashboardData.regulatoryEaseScore}/100
                        </div>
                        <div
                            className={`flex items-center mt-1 ${dashboardData.regulatoryEaseScore > 50 ? "text-green-500" : "text-red-500"} text-sm`}>
                            {dashboardData.regulatoryEaseScore > 50 ? (
                                <>
                                    <ArrowUp01 className="h-4 w-4 mr-1"/>
                                    Business-friendly environment
                                </>
                            ) : (
                                <>
                                    <ArrowDown01 className="h-4 w-4 mr-1"/>
                                    Challenging regulatory climate
                                </>
                            )}
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
        </div>
    );
}