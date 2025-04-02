'use server';

import { processNews } from "@/service/news/news-processor";
import redis from "@/lib/redis";

const CACHE_KEY = "summarized_news";

// Utility function for delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Parse date function to clean and format the date string
const parseDate = (dateStr: string): Date | null => {
    try {
        const cleanedDateStr = dateStr.replace(/[\r\n\t]/g, '').trim(); // Remove unwanted characters
        const date = new Date(cleanedDateStr);

        if (isNaN(date.getTime())) {
            console.error(`Invalid date format for: ${dateStr}`);
            return null; // Return null if the date is invalid
        }

        return date; // Return Date object instead of ISO string
    } catch (error) {
        console.error(`Error parsing date: ${dateStr}`, error);
        return null;
    }
};

// Load news data dynamically from an external source
const loadNewsData = async (): Promise<any[]> => {
    try {
        // Check if news data exists in Redis cache
        const cachedNews = await redis.get(CACHE_KEY);
        if (cachedNews) {
            console.log("🟢 Returning cached news data");
            return JSON.parse(cachedNews);
        }

        // Fetch news from API if not cached
        const response = await fetch("http://localhost:3000/news-data/newsData.json");
        if (!response.ok) throw new Error("Failed to fetch news data");

        const newsData = await response.json();

        const formattedNewsData = newsData.map((newsItem: any) => ({
            ...newsItem,
            date: parseDate(newsItem.date),
        })).filter((item: any) => item.date !== null);

        // Store fetched data in Redis with expiration of 1 hour
        await redis.set(CACHE_KEY, JSON.stringify(formattedNewsData), "EX", 3600);
        console.log("🟡 Cached news data for 1 hour");

        return formattedNewsData;
    } catch (error) {
        console.error("Error loading news data:", error);
        return [];
    }
};

// Process multiple news articles in batch with delay between each API call
export const processAllNews = async () => {
    const newsArray = await loadNewsData(); // Load news data dynamically
    console.log(`📊 Found ${newsArray.length} news items to process`);

    for (const newsItem of newsArray) {
        try {
            console.log(`🔄 Processing news item: ${newsItem.title}`);

            await processNews(newsItem);

            // Clear cache when new data is processed
            await redis.del(CACHE_KEY);
            console.log("🗑️ News cache invalidated");

            // Delay the next API call by 5 seconds (5000ms)
            await delay(5000); // Delay in milliseconds (5000ms = 5 seconds)
        } catch (error) {
            console.error(`❌ Failed to process: ${newsItem.title}`);
            console.error("Error:", error);
            // Optionally, store or log the failed articles for retry or tracking
        }
    }
};

export { loadNewsData };