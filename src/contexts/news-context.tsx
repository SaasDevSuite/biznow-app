"use client";

import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {fetchNewsItems} from "@/actions/news/query";
import {SummarizedNews} from "@prisma/client";
import {ChartData} from "@/components/custom/donut-chart";
import {FrequencyData} from "@/components/custom/frequency-chart";
import {toast} from "sonner";

export interface DashboardData {
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
        competitorMentions: 320,
        positiveSentiment: 68,
        engagementRate: 24.8,
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