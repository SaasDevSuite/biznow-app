'use server';

import {processNews} from "../../../src/actions/news/operations.js";
import {prisma} from "../../../src/prisma.js";

import redis from "../../../src/lib/redis.js";

const CACHE_KEY = "summarized_news";

// Utility function for delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// Load news data from database instead of external source
const loadNewsData = async (): Promise<any[]> => {
    try {
        // Check if news data exists in Redis cache
        const cachedNews = await redis.get(CACHE_KEY);
        if (cachedNews) {
            console.log("🟢 Returning cached news data");
            return JSON.parse(cachedNews);
        }

        // Fetch news from database if not cached
        const newsData = await prisma.news.findMany({
            orderBy: {
                date: 'desc'
            }
        });

        // Format the news data to match the expected structure
        const formattedNewsData = newsData.map((newsItem) => ({
            title: newsItem.title,
            content: newsItem.content,
            date: newsItem.date,  // Already a Date object from Prisma
            url: newsItem.url,
            id: newsItem.id
        }));

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
    const newsArray = await loadNewsData(); // Load news data from database
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

export async function fetchNewsItems(
    page: number,
    pageSize: number,
    search?: string,
    category?: string,
    sentiment?: string
) {
    const whereClause: any = {};

    if (search) {
        whereClause.OR = [
            {title: {contains: search, mode: 'insensitive'}},
            {content: {contains: search, mode: 'insensitive'}}
        ];
    }

    if (category) {
        whereClause.category = category;
    }

    if (sentiment) {
        whereClause.sentiment = sentiment;
    }

    const newsItems = await prisma.summarizedNews.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
            date: 'desc'
        }
    });

    const totalItems = await prisma.summarizedNews.count({
        where: whereClause
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {newsItems, totalPages};
}

export {loadNewsData};