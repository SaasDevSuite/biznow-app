import { callGroqAPI } from "@/lib/groqClient";
import {prisma} from "@/prisma";


/**
 * Process a single news article:
 * - Summarize content
 * - Categorize news
 * - Analyze sentiment
 * - Store in summarized_news table
 */
export const processNews = async (newsItem: { title: string; content: string; date: Date; url: string }) => {
    try {
        // 1️⃣ Summarization
        //const summaryPrompt = "Summarize the following news article in simple terms, keeping only key points.";
        //const summarizedContent = await callGroqAPI(summaryPrompt, newsItem.content);
        let summarizedContent = newsItem.content;
        if (newsItem.content.length > 200) { // You can adjust this length threshold as needed
            const summaryPrompt = "Summarize the following news article in simple terms, keeping only key points.";
            const summarized = await callGroqAPI(summaryPrompt, newsItem.content);

            // Clean up unwanted parts of the summary
            const cleanSummary = summarized.replace(/Here is a summary of the article in simple terms, keeping only the key points:\s*/i, '').trim();

            // Use cleaned summary content
            summarizedContent = cleanSummary;
        }

        // 2️⃣ Categorization
        const categoryPrompt = "Categorize the following news article into one category (Technology, Crime, Business, Sports, etc.). Reply only with the category name.";
        const category = await callGroqAPI(categoryPrompt, newsItem.content);

        // 3️⃣ Sentiment Analysis
        const sentimentPrompt = "Analyze the sentiment of the following news article. Reply with one word: Positive, Neutral, or Negative.";
        const sentiment = await callGroqAPI(sentimentPrompt, newsItem.content);

        // 4️⃣ Store results in DB (now includes category)
        const summarizedNews = await prisma.summarizedNews.create({
            data: {
                title: newsItem.title,
                content: summarizedContent,
                category: category.trim(), // ✅ Storing category
                sentiment: sentiment.trim(),
                date: newsItem.date,
                url: newsItem.url,
            },
        });

        // ✅ Log the full object
        console.log("✅ Processed News:", summarizedNews);

    } catch (error) {
        console.error("❌ Error processing news:", error);
    }
};
