'use server';

import { prisma } from "@/prisma";

export async function fetchLatestNews(limit: number = 3) {
  try {
    // Fetch the latest summarized news items from the database
    const latestNews = await prisma.summarizedNews.findMany({
      orderBy: {
        date: 'desc'
      },
      take: limit
    });
    
    return latestNews;
  } catch (error) {
    console.error("Error fetching latest news for landing page:", error);
    return [];
  }
}