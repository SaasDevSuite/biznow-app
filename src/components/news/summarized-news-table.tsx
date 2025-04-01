import React, { useEffect, useState } from 'react';
import { ExternalLink } from "lucide-react";

interface SummarizedNews {
    id: string;
    title: string;
    content: string;
    category: string;
    sentiment: string;
    date: string;
    url: string;
}

const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
        case 'positive': return 'bg-green-100 text-green-800';
        case 'neutral': return 'bg-gray-100 text-gray-800';
        case 'negative': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SummarizedNewsTable = () => {
    const [newsData, setNewsData] = useState<SummarizedNews[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummarizedNews = async () => {
            try {
                const res = await fetch('/api/news/summarized-news');
                if (res.ok) {
                    const data = await res.json();
                    setNewsData(data);
                } else {
                    console.error("Failed to fetch summarized news.");
                }
            } catch (error) {
                console.error("Error fetching summarized news:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummarizedNews();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Summarized News</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm">
                        <th className="px-6 py-3 text-left font-medium uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left font-medium uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left font-medium uppercase tracking-wider">Sentiment</th>
                        <th className="px-6 py-3 text-left font-medium uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {newsData.map((news) => (
                        <tr key={news.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {news.title}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-500">{news.category}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSentimentColor(news.sentiment)}`}>
                                        {news.sentiment}
                                    </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(news.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <a
                                    href={news.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-900 transition-colors inline-flex items-center"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SummarizedNewsTable;