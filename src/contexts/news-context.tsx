"use client";

import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import { fetchNewsItems, fetchNewsDistribution } from "@/actions/news/query";
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
    businessGrowthTrend: number;
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
        frequencyData: [],
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
            Business: "#34495e",
            Politics: "#f05a5a",
            Sports: "#00b894",
            Entertainment: "#e84393",
            Health: "#e17055",
            Science: "#00cec9",
            Finance: "#0984e3",
            Travel: "#fab1a0",
            Weather: "#74b9ff",
            Education: "#f39c12",
            Crime: "#c0392b",
            "Human Rights": "#e67e22",
            Environment: "#27ae60",
            Startups: "#55efc4",
            Agriculture: "#27ae60",
            "Culture & Heritage": "#a29bfe",
            Tourism: "#16a085",
            Economy: "#90c469",
            "Social Issues": "#8e44ad",
            Other: "#5ec8eb",
            Obituaries: "#636e72"
        };
        return mapping[category] || "#8884d8";
    };

    const getColorForSentiment = (sentiment: string): string => {
        const normalizedSentiment = sentiment.toLowerCase();
        const mapping: Record<string, string> = {
            positive: "#4a69dd",
            neutral: "#90c469",
            negative: "#f6c652",
        };
        return mapping[normalizedSentiment] || "#8884d8";
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
                    mainCategory: item.mainCategory,
                    sentiment: item.sentiment,
                    date: item.date,
                    url: item.url,
                }));

                const frequencyData = await fetchNewsDistribution();

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

                const now = new Date();
                const weightedSentiments = transformedNews.map((item) => {
                    const daysDifference = Math.floor(
                        (now.getTime() - new Date(item.date).getTime()) / (1000 * 3600 * 24)
                    );
                    const recencyWeight = Math.max(0.3, 1 - daysDifference / 30);

                    const categoryWeight = {
                        Economy: 1.3,
                        Politics: 1.2,
                        Technology: 1.1,
                        Environment: 0.9,
                        Other: 0.8,
                    }[item.category as string] || 1.0;

                    return {
                        sentiment: item.sentiment,
                        weight: recencyWeight * categoryWeight,
                    };
                });

                const totalWeight = weightedSentiments.reduce((sum, item) => sum + item.weight, 0);
                const positiveWeight = weightedSentiments
                    .filter((item) => item.sentiment === "Positive")
                    .reduce((sum, item) => sum + item.weight, 0);

                const positiveSentiment =
                    totalWeight > 0 ? Math.round((positiveWeight / totalWeight) * 100) : 50;

                const industryKeywords = {
                    high: ["industry growth", "market expansion", "economic boom", "trade agreement"],
                    medium: ["industry", "market", "economy", "sector", "business", "trade", "commercial"],
                    low: ["supply", "demand", "product", "service", "consumer"],
                };

                const industryNewsItems = transformedNews.map((item) => {
                    const text = (item.title + " " + item.content).toLowerCase();
                    const daysDifference = Math.floor(
                        (now.getTime() - new Date(item.date).getTime()) / (1000 * 3600 * 24)
                    );
                    const recencyWeight = Math.max(0.3, 1 - daysDifference / 30);

                    let relevance = 0;
                    let matchCount = 0;

                    industryKeywords.high.forEach((keyword) => {
                        if (text.includes(keyword)) {
                            relevance += 3;
                            matchCount++;
                        }
                    });

                    industryKeywords.medium.forEach((keyword) => {
                        const pattern = new RegExp(`\\b${keyword}\\b`, "i");
                        if (pattern.test(text)) {
                            relevance += 2;
                            matchCount++;
                        }
                    });

                    industryKeywords.low.forEach((keyword) => {
                        if (text.includes(keyword)) {
                            relevance += 1;
                            matchCount++;
                        }
                    });

                    if (matchCount > 0) {
                        relevance = relevance * (1 + Math.log(matchCount) / 5);
                    }

                    const sentimentValue =
                        item.sentiment === "Positive" ? 1 : item.sentiment === "Negative" ? -1 : 0;

                    const specificIndustryBonus = /\b(tourism|manufacturing|tech|retail|finance|agriculture)\b/i.test(
                        text
                    )
                        ? 1.5
                        : 1;

                    return {
                        relevance: relevance,
                        impact: relevance > 0 ? relevance * sentimentValue * recencyWeight * specificIndustryBonus : 0,
                    };
                });

                const totalRelevance = industryNewsItems.reduce((sum, item) => sum + item.relevance, 0);
                const totalImpact = industryNewsItems.reduce((sum, item) => sum + item.impact, 0);

                const industryImpactScore =
                    totalRelevance > 0
                        ? Math.round(
                        Math.min(100, Math.max(0, 50 + (totalImpact / Math.sqrt(totalRelevance)) * 10)) * 100
                    ) / 100
                        : 50;

                const businessKeywords = {
                    growth: {
                        high: ["new business opening", "major expansion", "significant investment", "job creation"],
                        medium: [
                            "new business",
                            "opening",
                            "launched",
                            "startup",
                            "establishment",
                            "expansion",
                            "growth",
                            "hiring",
                        ],
                        low: ["investment", "development", "increase", "opportunity"],
                    },
                    decline: {
                        high: ["mass layoff", "bankruptcy filed", "business closure", "economic recession"],
                        medium: ["closed", "shutdown", "bankruptcy", "closing down", "out of business", "layoff"],
                        low: ["downsizing", "retrenchment", "cutback", "reduction"],
                    },
                };

                const growthAnalysis = transformedNews.map((item) => {
                    const text = (item.title + " " + item.content).toLowerCase();
                    const date = new Date(item.date);
                    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
                    const recencyFactor = Math.max(0.2, 1 - daysAgo / 60);

                    let growthScore = 0;
                    let declineScore = 0;

                    businessKeywords.growth.high.forEach((kw) => {
                        if (text.includes(kw)) growthScore += 3;
                    });
                    businessKeywords.growth.medium.forEach((kw) => {
                        if (text.includes(kw)) growthScore += 2;
                    });
                    businessKeywords.growth.low.forEach((kw) => {
                        if (text.includes(kw)) growthScore += 1;
                    });

                    businessKeywords.decline.high.forEach((kw) => {
                        if (text.includes(kw)) declineScore += 3;
                    });
                    businessKeywords.decline.medium.forEach((kw) => {
                        if (text.includes(kw)) declineScore += 2;
                    });
                    businessKeywords.decline.low.forEach((kw) => {
                        if (text.includes(kw)) declineScore += 1;
                    });

                    const sentimentModifier =
                        item.sentiment === "Positive" ? 1.5 : item.sentiment === "Negative" ? 0.7 : 1;

                    const lengthWeight = Math.min(1.5, 0.8 + text.length / 5000);

                    return (
                        (growthScore * sentimentModifier - declineScore / sentimentModifier) *
                        recencyFactor *
                        lengthWeight
                    );
                });

                const businessGrowthTrend = Math.max(
                    -100,
                    Math.min(100, Math.round(growthAnalysis.reduce((sum, val) => sum + val, 0)))
                );

                const regulatoryKeywords = {
                    positive: {
                        high: ["major deregulation", "tax exemption", "regulatory relief", "stimulus package"],
                        medium: [
                            "business friendly",
                            "tax break",
                            "incentive",
                            "simplified",
                            "support",
                            "deregulation",
                            "subsidy",
                        ],
                        low: ["reform", "streamline", "facilitate", "promote"],
                    },
                    negative: {
                        high: ["strict regulation", "heavy penalty", "compliance requirement", "regulatory burden"],
                        medium: [
                            "regulation",
                            "restriction",
                            "fine",
                            "penalty",
                            "compliance",
                            "tax increase",
                            "ban",
                            "mandatory",
                        ],
                        low: ["license requirement", "inspection", "oversight", "report"],
                    },
                };

                const regulatoryAnalysis = transformedNews.map((item) => {
                    const text = (item.title + " " + item.content).toLowerCase();
                    if (!text.match(/\b(regulation|regulatory|policy|law|compliance|government|authority|license)\b/i)) {
                        return 0;
                    }

                    const date = new Date(item.date);
                    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
                    const recencyFactor = Math.max(0.3, 1 - daysAgo / 45);

                    let easeScore = 0;
                    let burdenScore = 0;

                    regulatoryKeywords.positive.high.forEach((kw) => {
                        if (text.includes(kw)) easeScore += 3;
                    });
                    regulatoryKeywords.positive.medium.forEach((kw) => {
                        if (text.includes(kw)) easeScore += 2;
                    });
                    regulatoryKeywords.positive.low.forEach((kw) => {
                        if (text.includes(kw)) easeScore += 1;
                    });

                    regulatoryKeywords.negative.high.forEach((kw) => {
                        if (text.includes(kw)) burdenScore += 3;
                    });
                    regulatoryKeywords.negative.medium.forEach((kw) => {
                        if (text.includes(kw)) burdenScore += 2;
                    });
                    regulatoryKeywords.negative.low.forEach((kw) => {
                        if (text.includes(kw)) burdenScore += 1;
                    });

                    const sentimentMultiplier =
                        item.sentiment === "Positive" ? 1.2 : item.sentiment === "Negative" ? 0.8 : 1;

                    const authorityBonus = /\b(minister|official|government|authority|agency|department)\b/i.test(text)
                        ? 1.3
                        : 1;

                    return (easeScore * sentimentMultiplier - burdenScore) * recencyFactor * authorityBonus;
                });

                const regulatoryScoreSum = regulatoryAnalysis.reduce((sum, val) => sum + val, 0);
                const regulatoryItemsCount = regulatoryAnalysis.filter((val) => val !== 0).length;
                const regulatoryEaseScore =
                    regulatoryItemsCount > 0
                        ? Math.min(100, Math.max(0, 50 + (regulatoryScoreSum * 5) / Math.sqrt(regulatoryItemsCount)))
                        : 50;

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
                    frequencyData,
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