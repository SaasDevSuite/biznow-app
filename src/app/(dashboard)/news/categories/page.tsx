"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  const [mainCategoryStats, setMainCategoryStats] = useState<any>(null);
  //const [isLoadingMainCategories, setIsLoadingMainCategories] = useState(false);

  // Fetch main category statistics
  useEffect(() => {
    const fetchMainCategoryStats = async () => {
      //setIsLoadingMainCategories(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }

        const response = await fetch(`/api/news/main-categories?${params}`);
        if (response.ok) {
          const data = await response.json();
          setMainCategoryStats(data);
        } else {
          console.error('Failed to fetch main category stats');
        }
      } catch (error) {
        console.error('Error fetching main category stats:', error);
      } finally {
        //setIsLoadingMainCategories(false);
      }
    };

    fetchMainCategoryStats();
  }, [selectedCategory]);

  const getRandomColor = (seed: string) => {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return `#${'00000'.substring(0, 6 - c.length)}${c}`;
  };

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

  // Helper function to format main category names for display
  const formatMainCategoryName = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Real data for Regulatory Mentions from database
  const getRegulationData = (): ChartData[] => {
    const regulatoryCategories = ['POLICY_CHANGES', 'COMPLIANCE', 'LEGAL_UPDATES', 'TAX_REGULATIONS'];
    const colorMap: Record<string, string> = {
      'POLICY_CHANGES': '#4a69dd',
      'COMPLIANCE': '#f05a5a',
      'LEGAL_UPDATES': '#f6c652',
      'TAX_REGULATIONS': '#5ec8eb'
    };

    // If we have real data, use it
    if (mainCategoryStats?.mainCategoryData) {
      const realData = mainCategoryStats.mainCategoryData
        .filter((item: any) => regulatoryCategories.includes(item.name))
        .map((item: any) => ({
          name: formatMainCategoryName(item.name),
          value: item.value,
          color: colorMap[item.name] || '#9ca3af'
        }));

      // If we have real data, return it
      if (realData.length > 0) {
        return realData;
      }
    }

    // Fallback data when no real data is available
    return [
      { name: "Policy Changes", value: 0, color: "#4a69dd" },
      { name: "Compliance", value: 0, color: "#f05a5a" },
      { name: "Legal Updates", value: 0, color: "#f6c652" },
      { name: "Tax Regulations", value: 0, color: "#5ec8eb" }
    ];
  };

  // Real data for Growth Mentions from database
  const getGrowthData = (): ChartData[] => {
    const growthCategories = ['MARKET_EXPANSION', 'NEW_INVESTMENTS', 'INNOVATION', 'PARTNERSHIPS'];
    const colorMap: Record<string, string> = {
      'MARKET_EXPANSION': '#90c469',
      'NEW_INVESTMENTS': '#4a69dd',
      'INNOVATION': '#f6c652',
      'PARTNERSHIPS': '#5ec8eb'
    };

    // If we have real data, use it
    if (mainCategoryStats?.mainCategoryData) {
      const realData = mainCategoryStats.mainCategoryData
        .filter((item: any) => growthCategories.includes(item.name))
        .map((item: any) => ({
          name: formatMainCategoryName(item.name),
          value: item.value,
          color: colorMap[item.name] || '#9ca3af'
        }));

      // If we have real data, return it
      if (realData.length > 0) {
        return realData;
      }
    }

    // Fallback data when no real data is available
    return [
      { name: "Market Expansion", value: 0, color: "#90c469" },
      { name: "New Investments", value: 0, color: "#4a69dd" },
      { name: "Innovation", value: 0, color: "#f6c652" },
      { name: "Partnerships", value: 0, color: "#5ec8eb" }
    ];
  };

  // Real data for Risk Signals from database
  const getRiskData = (): ChartData[] => {
    const riskCategories = ['MARKET_VOLATILITY', 'COMPETITION', 'SUPPLY_CHAIN', 'WORKFORCE_ISSUES'];
    const colorMap: Record<string, string> = {
      'MARKET_VOLATILITY': '#f05a5a',
      'COMPETITION': '#f6c652',
      'SUPPLY_CHAIN': '#4a69dd',
      'WORKFORCE_ISSUES': '#5ec8eb'
    };

    // If we have real data, use it
    if (mainCategoryStats?.mainCategoryData) {
      const realData = mainCategoryStats.mainCategoryData
        .filter((item: any) => riskCategories.includes(item.name))
        .map((item: any) => ({
          name: formatMainCategoryName(item.name),
          value: item.value,
          color: colorMap[item.name] || '#9ca3af'
        }));

      // If we have real data, return it
      if (realData.length > 0) {
        return realData;
      }
    }

    // Fallback data when no real data is available
    return [
      { name: "Market Volatility", value: 0, color: "#f05a5a" },
      { name: "Competition", value: 0, color: "#f6c652" },
      { name: "Supply Chain", value: 0, color: "#4a69dd" },
      { name: "Workforce Issues", value: 0, color: "#5ec8eb" }
    ];
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
                                  title={selectedCategory ? `${selectedCategory} Regulatory Impact` : "Overall Regulatory Impact"}
                                  data={getRegulationData()}
                              />
                            </TabsContent>

                            <TabsContent value="growth" className="mt-0">
                              <CustomBarChart
                                  title={selectedCategory ? `${selectedCategory} Growth Indicators` : "Overall Growth Indicators"}
                                  data={getGrowthData()}
                              />
                            </TabsContent>

                            <TabsContent value="risk" className="mt-0">
                              <CustomBarChart
                                  title={selectedCategory ? `${selectedCategory} Risk Analysis` : "Overall Risk Analysis"}
                                  data={getRiskData()}
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
                                  data={getRegulationData()}
                              />
                            </TabsContent>

                            <TabsContent value="growth" className="mt-0">
                              <CustomBarChart
                                  title={selectedCategory ? `${selectedCategory} Growth Indicators` : "Overall Growth Indicators"}
                                  data={getGrowthData()}
                              />
                            </TabsContent>

                            <TabsContent value="risk" className="mt-0">
                              <CustomBarChart
                                  title={selectedCategory ? `${selectedCategory} Risk Analysis` : "Overall Risk Analysis"}
                                  data={getRiskData()}
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
