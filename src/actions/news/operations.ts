import { analyzeSentiment } from '@/service/sentiment-analysis';
import { initializeCategorizer } from '@/service/categorization';
import { prisma } from '@/prisma';
import { callGroqAPI } from "@/lib/groqClient";

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const MAX_INPUT_LENGTH = 5000;

// Initialize this as null and assign it later
let categorizerInstance: { categorizeWithKMeans: (text: string) => Promise<string | null> } | null = null;

// Export for testing
export const getCategorizerInstance = () => categorizerInstance;
export const setCategorizerInstance = (instance: any) => {
    categorizerInstance = instance;
};

const initializeCategorizerWithRetry = async (retries: number = MAX_RETRIES) => {
    try {
        categorizerInstance = await initializeCategorizer();
        console.log("✅ Categorizer initialized successfully");
    } catch (error) {
        if (retries > 0) {
            console.warn(`⚠️ Categorizer initialization failed, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            await initializeCategorizerWithRetry(retries - 1);
        } else {
            console.error("❌ Failed to initialize categorizer after multiple attempts:", error);
        }
    }
};

// Initialize immediately when the module loads
(async () => {
    await initializeCategorizerWithRetry();
})();

export const processNews = async (newsItem: { title: string; content: string; date: Date; url: string }) => {
    try {
        // Ensure categorizer is initialized
        if (!categorizerInstance) {
            console.warn("⚠️ Categorizer not initialized yet, initializing now...");
            await initializeCategorizerWithRetry();  // Retry initialization
        }

        const safeContent = newsItem.content.slice(0, MAX_INPUT_LENGTH);

        const existingNews = await prisma.summarizedNews.findFirst({
            where: {
                OR: [
                    { title: newsItem.title },
                    { url: newsItem.url }
                ]
            }
        });

        if (existingNews) {
            console.warn(`⚠️ News already exists, skipping: ${newsItem.title}`);
            return;
        }

        let summarizedContent = safeContent;
        if (safeContent.length > 200) {
            try {
                const summaryPrompt = `
                    Summarize the following news article into a paragraph.
                    Do not include phrases like "Here is the summary" or "In simple terms".
                    Only return the summary text, nothing else.
                    ${safeContent}
                `;
                const summarized = await callGroqAPI(summaryPrompt, safeContent);
                if (summarized) summarizedContent = summarized;
            } catch (error) {
                console.warn("⚠️ Summarization failed, fallback to original content", error);
            }
        }

        let category: string | null = null;
        try {
            if (categorizerInstance) {
                category = await categorizerInstance.categorizeWithKMeans(summarizedContent);
            }
            if (!category) {
                category = null; // Explicitly handle the case where it's undefined or falsy
            }
        } catch (error) {
            console.warn("⚠️ Categorization failed", error);
        }

        let sentiment: string | null = null;
        try {
            const sentimentResult = await analyzeSentiment(summarizedContent);
            if (sentimentResult) {
                sentiment = sentimentResult.sentiment || null; // Ensure sentiment is null or string
                console.log("Sentiment result:", sentimentResult);
            }
        } catch (error) {
            console.warn("⚠️ Sentiment analysis failed", error);
        }

        if (category && sentiment) {
            await prisma.summarizedNews.create({
                data: {
                    title: newsItem.title,
                    content: summarizedContent,
                    category,
                    sentiment,
                    date: newsItem.date,
                    url: newsItem.url,
                },
            });
            console.log("✅ Processed:", newsItem.title);
        } else {
            console.warn(`⚠️ Skipped storing news due to missing category (${category}) or sentiment (${sentiment})`);
        }
    } catch (error) {
        console.error("❌ Error processing news item:", error);
    }
};
