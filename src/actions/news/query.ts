import { processNews } from "@/service/news/newsProcessor";

// Dummy data (Replace with real scraped news)
const newsArray = [
    {
        title: "Tech Company Launches New AI Chip",
        content: "A new AI chip was released today by XYZ Corp, promising faster performance...",
        date: new Date(),
        url: "https://example.com/ai-chip-news",
    },
    {
        title: "Stock Market Sees Major Crash",
        content: "Stock prices plummeted due to economic concerns...",
        date: new Date(),
        url: "https://example.com/stock-crash",
    }
];

/**
 * Process multiple news articles in batch
 */
export const processAllNews = async () => {
    for (const newsItem of newsArray) {
        await processNews(newsItem);
    }
};

processAllNews();
