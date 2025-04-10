"use client";

import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {fetchNewsItems} from "@/actions/news/query";
import {SummarizedNews} from "@prisma/client";
import {ChartData} from "@/components/custom/donut-chart";
import {FrequencyData} from "@/components/custom/line-chart";
import {toast} from "sonner";

export interface DashboardData {
    newsItems: SummarizedNews[];
    categoryData: ChartData[];
    sentimentData: ChartData[];
    frequencyData: FrequencyData[];
    city: string;
    industryImpactScore: number;
    businessGrowthTrend: number
    positiveSentiment: number;
    regulatoryEaseScore: number;
    lastUpdated: string;
}

interface NewsContextType {
    dashboardData: DashboardData;
    isLoading: boolean;
    isExporting: boolean;
    exportReport: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function useNewsContext() {
    const context = useContext(NewsContext);
    if (!context) {
        throw new Error("useNewsContext must be used within a NewsProvider");
    }
    return context;
}

export function NewsProvider({children}: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
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
        positiveSentiment: 68,
        businessGrowthTrend: 5,
        regulatoryEaseScore: 65,
        lastUpdated: new Date().toISOString(),
    });

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
        const fetchData = async () => {
            setIsLoading(true);
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

                const totalSentiments = Object.values(sentimentMap).reduce((sum, count) => sum + count, 0);
                const positiveSentiment = sentimentMap["Positive"]
                    ? Math.round((sentimentMap["Positive"] / totalSentiments) * 100)
                    : 0;

                const industryKeywords = ['industry', 'market', 'economy', 'sector', 'business'];
                let industryNewsCount = 0;
                let industryPositiveCount = 0;

                transformedNews.forEach(item => {
                    const hasIndustryKeyword = industryKeywords.some(keyword =>
                        item.title.toLowerCase().includes(keyword) ||
                        item.content.toLowerCase().includes(keyword)
                    );

                    if (hasIndustryKeyword) {
                        industryNewsCount++;
                        if (item.sentiment === 'Positive') {
                            industryPositiveCount++;
                        }
                    }
                });

                const industryImpactScore = industryNewsCount > 0
                    ? Math.round((industryPositiveCount / industryNewsCount) * 100)
                    : 50;

                const businessOpenKeywords = ['new business', 'opening', 'launched', 'startup', 'establishment'];
                const businessCloseKeywords = ['closed', 'shutdown', 'bankruptcy', 'closing down', 'out of business'];

                let businessOpenCount = 0;
                let businessCloseCount = 0;

                transformedNews.forEach(item => {
                    const contentLower = item.content.toLowerCase();
                    const titleLower = item.title.toLowerCase();

                    if (businessOpenKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword))) {
                        businessOpenCount++;
                    }

                    if (businessCloseKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword))) {
                        businessCloseCount++;
                    }
                });

                const businessGrowthTrend = businessOpenCount - businessCloseCount;

                const positiveRegKeywords = ['business friendly', 'tax break', 'incentive', 'simplified', 'support'];
                const negativeRegKeywords = ['regulation', 'restriction', 'fine', 'penalty', 'compliance'];

                let positiveRegCount = 0;
                let negativeRegCount = 0;

                transformedNews.forEach(item => {
                    const contentLower = item.content.toLowerCase();
                    const titleLower = item.title.toLowerCase();

                    if (positiveRegKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword))) {
                        positiveRegCount++;
                    }

                    if (negativeRegKeywords.some(keyword => contentLower.includes(keyword) || titleLower.includes(keyword))) {
                        negativeRegCount++;
                    }
                });

                const regulatoryEaseScore = Math.min(100, Math.max(0,
                    50 + (positiveRegCount * 5) - (negativeRegCount * 3)
                ));

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
                    positiveSentiment,
                    industryImpactScore,
                    businessGrowthTrend,
                    regulatoryEaseScore,
                    lastUpdated: new Date().toISOString(),
                }));
            } catch (error) {
                console.error("Failed to fetch news:", error);
                toast.error("Failed to load news data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const exportReport = async () => {
        if (isExporting) return;

        setIsExporting(true);
        try {
            const {exportAsPDF} = await import("@/utils/pdf-export");
            await exportAsPDF(dashboardData);
            toast.success("Report exported successfully");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export report");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <NewsContext.Provider
            value={{
                dashboardData,
                isLoading,
                isExporting,
                exportReport,
            }}
        >
            {children}
        </NewsContext.Provider>
    );
}