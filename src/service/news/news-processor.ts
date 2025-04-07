import { analyzeSentiment } from '@/service/sentiment-analysis';
import { initializeCategorizer } from '@/service/categorization';
import { prisma } from '@/prisma';
import { callGroqAPI } from "@/lib/groqClient";

const MAX_INPUT_LENGTH = 5000;

// Initialize this as null and assign it later
let categorizerInstance: { categorizeWithKMeans: (text: string) => Promise<string | null> } | null = null;

// Initialize immediately when the module loads
(async () => {
    try {
        categorizerInstance = await initializeCategorizer();
        console.log("✅ Categorizer initialized successfully");
    } catch (error) {
        console.error("❌ Failed to initialize categorizer:", error);
    }
})();

export const processNews = async (newsItem: { title: string; content: string; date: Date; url: string }) => {
    try {
        // Ensure categorizer is initialized
        if (!categorizerInstance) {
            console.warn("⚠️ Categorizer not initialized yet, initializing now...");
            categorizerInstance = await initializeCategorizer();
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
            // Use the categorizer instance
            category = await categorizerInstance.categorizeWithKMeans(summarizedContent);
        } catch (error) {
            console.warn("⚠️ Categorization failed", error);
        }

        let sentiment: string | null = null;
        try {
            const sentimentResult = await analyzeSentiment(summarizedContent);
            if (sentimentResult ) {
                const label = sentimentResult.sentiment; // Assuming sentimentResult is an array
                console.log("Sentiment result:", sentimentResult);
                sentiment =label

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
