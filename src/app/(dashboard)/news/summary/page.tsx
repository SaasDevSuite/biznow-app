"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewsContext } from "@/contexts/news-context";

export default function NewsSummary() {
    const { dashboardData, isLoading } = useNewsContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [sentiment, setSentiment] = useState("all");
    const pageSize = 10;

    const filteredNews = dashboardData.newsItems.filter(item => {
        const matchesSearch = search ?
            item.title.toLowerCase().includes(search.toLowerCase()) : true;
        const matchesCategory = category !== "all" ?
            item.category.toLowerCase() === category.toLowerCase() : true;
        const matchesSentiment = sentiment !== "all" ?
            item.sentiment.toLowerCase() === sentiment.toLowerCase() : true;
        return matchesSearch && matchesCategory && matchesSentiment;
    });

    const totalItems = filteredNews.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentItems = filteredNews.slice(startIndex, endIndex);

    const handleSearch = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (value: React.SetStateAction<string>) => {
        setCategory(value);
        setCurrentPage(1);
    };

    const handleSentimentChange = (value: React.SetStateAction<string>) => {
        setSentiment(value);
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">News Table</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <Input
                        placeholder="Search news..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full"
                    />
                </div>
                <div>
                    <Select value={category} onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {dashboardData.categoryData.map(cat => (
                                <SelectItem key={cat.name} value={cat.name.toLowerCase()}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Select value={sentiment} onValueChange={handleSentimentChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select sentiment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sentiments</SelectItem>
                            {dashboardData.sentimentData.map(sent => (
                                <SelectItem key={sent.name} value={sent.name.toLowerCase()}>
                                    {sent.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : (
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
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                                        No news items found
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map(item => (
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
                                                    item.sentiment.toLowerCase() === "positive"
                                                        ? "bg-green-100 text-green-800"
                                                        : item.sentiment.toLowerCase() === "negative"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {item.sentiment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            <Link href={`/news/article/${item.id}`} className="hover:underline">
                                                Read More
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isLoading}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}