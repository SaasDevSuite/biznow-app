"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, TrendingUp, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNewsContext } from "@/contexts/news-context";
import { Skeleton } from "@/components/ui/skeleton";
import DonutChart from "@/components/custom/donut-chart";
import CustomBarChart from "@/components/custom/bar-chart";
import { ChartData } from "@/components/custom/donut-chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CategoriesPage() {
  const { dashboardData, isLoading } = useNewsContext();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Sort categories by value
  const sortedCategories = [...dashboardData.categoryData].sort(
      (a, b) => b.value - a.value
  );

  // Get news items for the selected category
  const categoryNews = useMemo(() => {
    return selectedCategory
      ? dashboardData.newsItems.filter(
          (item) =>
              item.category.toLowerCase() === selectedCategory.toLowerCase()
      )
      : [];
  }, [selectedCategory, dashboardData.newsItems]);

  // Calculate sentiment distribution for the selected category
  const categorySentiment = useMemo(() => {
    if (!selectedCategory || categoryNews.length === 0) return [];

    const sentimentMap: Record<string, number> = {};

    categoryNews.forEach(item => {
      if (item.sentiment) {
        sentimentMap[item.sentiment] = (sentimentMap[item.sentiment] || 0) + 1;
      }
    });

    const sentimentColors: Record<string, string> = {};
    dashboardData.sentimentData.forEach(item => {
      sentimentColors[item.name] = item.color || '';
    });

    return Object.keys(sentimentMap).map(key => ({
      name: key,
      value: sentimentMap[key],
      color: sentimentColors[key] || getRandomColor(key),
    }));
  }, [selectedCategory, categoryNews, dashboardData.sentimentData]);

  // Sample data for Regulatory Mentions
  const getRegulationData = (category: string | null): ChartData[] => {
    if (category) {
      return [
        { name: "Policy Changes", value: Math.floor(Math.random() * 30) + 10, color: "#4a69dd" },
        { name: "Compliance", value: Math.floor(Math.random() * 25) + 15, color: "#f05a5a" },
        { name: "Legal Updates", value: Math.floor(Math.random() * 20) + 5, color: "#f6c652" },
        { name: "Tax Regulations", value: Math.floor(Math.random() * 15) + 10, color: "#5ec8eb" }
      ];
    }

    // Default data for all categories
    return [
      { name: "Policy Changes", value: 28, color: "#4a69dd" },
      { name: "Compliance", value: 35, color: "#f05a5a" },
      { name: "Legal Updates", value: 22, color: "#f6c652" },
      { name: "Tax Regulations", value: 15, color: "#5ec8eb" }
    ];
  };

  // Sample data for Growth Mentions
  const getGrowthData = (category: string | null): ChartData[] => {
    // If we have a selected category, filter or adjust the data accordingly
    if (category) {
      return [
        { name: "Market Expansion", value: Math.floor(Math.random() * 40) + 20, color: "#90c469" },
        { name: "New Investments", value: Math.floor(Math.random() * 30) + 15, color: "#4a69dd" },
        { name: "Innovation", value: Math.floor(Math.random() * 25) + 10, color: "#f6c652" },
        { name: "Partnerships", value: Math.floor(Math.random() * 20) + 5, color: "#5ec8eb" }
      ];
    }

    // Default data for all categories
    return [
      { name: "Market Expansion", value: 42, color: "#90c469" },
      { name: "New Investments", value: 38, color: "#4a69dd" },
      { name: "Innovation", value: 27, color: "#f6c652" },
      { name: "Partnerships", value: 18, color: "#5ec8eb" }
    ];
  };

  // Sample data for Risk Signals
  const getRiskData = (category: string | null): ChartData[] => {
    // If we have a selected category, filter or adjust the data accordingly
    if (category) {
      return [
        { name: "Market Volatility", value: Math.floor(Math.random() * 35) + 10, color: "#f05a5a" },
        { name: "Competition", value: Math.floor(Math.random() * 30) + 15, color: "#f6c652" },
        { name: "Supply Chain", value: Math.floor(Math.random() * 25) + 5, color: "#4a69dd" },
        { name: "Workforce Issues", value: Math.floor(Math.random() * 20) + 10, color: "#5ec8eb" }
      ];
    }

    // Default data for all categories
    return [
      { name: "Market Volatility", value: 32, color: "#f05a5a" },
      { name: "Competition", value: 28, color: "#f6c652" },
      { name: "Supply Chain", value: 24, color: "#4a69dd" },
      { name: "Workforce Issues", value: 16, color: "#5ec8eb" }
    ];
  };

  // Fallback function for sentiment colors
  const getRandomColor = (seed: string) => {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return `#${'00000'.substring(0, 6 - c.length)}${c}`;
  };

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Navigation Bar */}
        <div className="mb-6 overflow-x-auto">
          {isLoading ? (
              <div className="flex space-x-2 pb-2">
                {Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-md" />
                ))}
              </div>
          ) : (
              <div className="flex space-x-2 pb-2">
                <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="whitespace-nowrap"
                >
                  All Categories
                </Button>
                {sortedCategories.map((category) => (
                    <Button
                        key={category.name}
                        variant={selectedCategory === category.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.name)}
                        className="whitespace-nowrap"
                    >
                      <div
                          className="w-2 h-2 mr-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </Button>
                ))}
              </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">

          {/* Category Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory
                    ? `${selectedCategory} Sentiment Analysis`
                    : "Categories Sentiment Analysis"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCategory ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Overall Sentiment Analysis */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Overall Sentiment Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <DonutChart
                              title="Sentiment Analysis Across All Categories"
                              data={dashboardData.sentimentData}
                          />
                        </CardContent>
                      </Card>

                      {/* Analysis Charts with Navigation */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Category Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="regulatory">
                            <TabsList className="mb-4">
                              <TabsTrigger value="regulatory" className="flex items-center gap-2">
                                <Scale className="h-4 w-4" />
                                Regulatory Impact
                              </TabsTrigger>
                              <TabsTrigger value="growth" className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Growth Indicators
                              </TabsTrigger>
                              <TabsTrigger value="risk" className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Risk Analysis
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="regulatory" className="mt-0">
                              <CustomBarChart
                                  title="Overall Regulatory Impact"
                                  data={getRegulationData(null)}
                              />
                            </TabsContent>

                            <TabsContent value="growth" className="mt-0">
                              <CustomBarChart
                                  title="Overall Growth Indicators"
                                  data={getGrowthData(null)}
                              />
                            </TabsContent>

                            <TabsContent value="risk" className="mt-0">
                              <CustomBarChart
                                  title="Overall Risk Analysis"
                                  data={getRiskData(null)}
                              />
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
              ) : isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                  </div>
              ) : categoryNews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No news found for this category
                  </div>
              ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Sentiment Analysis Chart */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Sentiment Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {categorySentiment.length > 0 ? (
                              <DonutChart
                                  title={`Sentiment Analysis for ${selectedCategory}`}
                                  data={categorySentiment}
                              />
                          ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                No sentiment data available for this category
                              </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Charts with Navigation */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Category Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="regulatory">
                            <TabsList className="mb-4">
                              <TabsTrigger value="regulatory" className="flex items-center gap-2">
                                <Scale className="h-4 w-4" />
                                Regulatory Impact
                              </TabsTrigger>
                              <TabsTrigger value="growth" className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Growth Indicators
                              </TabsTrigger>
                              <TabsTrigger value="risk" className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Risk Analysis
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="regulatory" className="mt-0">
                              <CustomBarChart
                                  title={selectedCategory ? `${selectedCategory} Regulatory Impact` : "Overall Regulatory Impact"}
                                  data={getRegulationData(selectedCategory)}
                              />
                            </TabsContent>

                            <TabsContent value="growth" className="mt-0">
                              <CustomBarChart
                                  title={selectedCategory ? `${selectedCategory} Growth Indicators` : "Overall Growth Indicators"}
                                  data={getGrowthData(selectedCategory)}
                              />
                            </TabsContent>

                            <TabsContent value="risk" className="mt-0">
                              <CustomBarChart
                                  title={selectedCategory ? `${selectedCategory} Risk Analysis` : "Overall Risk Analysis"}
                                  data={getRiskData(selectedCategory)}
                              />
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
