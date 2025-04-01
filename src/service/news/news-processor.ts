import { callGroqAPI } from "@/lib/groqClient";
import { prisma } from "@/prisma";
import { HfInference } from "@huggingface/inference"; // Hugging Face API client

// Configuration constants
const MAX_INPUT_LENGTH = 5000;

// Type for embeddings to improve type safety
type Embedding = number[];

// Initialize Hugging Face client
const hf = new HfInference("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"); // Your Hugging Face API Key


const callGroqAPIOnce = async (prompt: string, content: string): Promise<string | null> => {
    try {
        const result = await callGroqAPI(prompt, content);
        return result?.trim() || null;
    } catch (error) {
        console.error("❌ Groq API request failed:", error);
        return null;
    }
};


// Flatten nested array and ensure it's a 1D array of numbers
const flattenEmbedding = (embedding: any): Embedding => {
    const flatten = (arr: any): number[] => {
        return arr.reduce((acc: number[], val: any) => {
            return Array.isArray(val) ? [...acc, ...flatten(val)] : [...acc, val];
        }, []);
    };

    return flatten(embedding);
};

// Calculate Euclidean distance between two embeddings
const calculateEuclideanDistance = (emb1: Embedding, emb2: Embedding): number => {
    // Ensure embeddings are of equal length, pad with zeros if needed
    const maxLength = Math.max(emb1.length, emb2.length);
    const padEmb1 = emb1.concat(Array(maxLength - emb1.length).fill(0));
    const padEmb2 = emb2.concat(Array(maxLength - emb2.length).fill(0));

    return Math.sqrt(
        padEmb1.reduce((sum, val, idx) =>
            sum + Math.pow(val - padEmb2[idx], 2), 0)
    );
};

// Sentiment analysis using Hugging Face's API
const analyzeSentiment = async (text: string): Promise<string> => {
    try {
        const result = await hf.textClassification({
            model: "tabularisai/multilingual-sentiment-analysis",
            inputs: text,
        });

        const label = result[0]?.label?.toLowerCase() || "neutral";

        // Map all variations into 3 categories
        if (label.includes("positive")) return "Positive";
        if (label.includes("negative")) return "Negative";
        return "Neutral"; // Default fallback
    } catch (error) {
        console.error("Error in sentiment analysis:", error);
        return "Neutral"; // Fallback on error
    }
};


// K-means Clustering Categorization using Hugging Face's embedding and clustering
const categorizeWithKMeans = async (text: string): Promise<string | null> => {
    try {
        // Step 1: Generate text embedding
        const rawEmbedding = await hf.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2", // Lightweight embedding model
            inputs: text
        });

        // Flatten the embedding
        const embedding = flattenEmbedding(rawEmbedding);

        // Step 2: Use predefined category centers (you might want to adjust these)
        const categoryEmbeddings: Record<string, Embedding> = {
            "Technology": flattenEmbedding(await hf.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: "Latest tech innovations, AI, software, hardware, gadgets"
            })),
            "Business": flattenEmbedding(await hf.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: "Corporate news, startups, finance, markets, economy"
            })),
            "Politics": flattenEmbedding(await hf.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: "Government, elections, policy, international relations"
            })),
            "Sports": flattenEmbedding(await hf.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: "Athletic competitions, team sports, athletes, tournaments"
            })),
            "Entertainment": flattenEmbedding(await hf.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: "Movies, music, celebrities, TV shows, art"
            }))
        };

        // Step 3: Calculate distances and find the closest category
        const distances = Object.entries(categoryEmbeddings).map(([category, catEmbedding]) => {
            // Calculate Euclidean distance between input embedding and category embedding
            const distance = calculateEuclideanDistance(embedding, catEmbedding);
            return { category, distance };
        });

        // Sort by distance and return the closest category
        const closestCategory = distances.reduce((prev, current) =>
            (prev.distance < current.distance) ? prev : current
        ).category;

        return closestCategory;
    } catch (error) {
        console.error("Error in K-means categorization:", error);
        return null;
    }
};

// 🟣 Full News Processor with Safety & Retry
export const processNews = async (newsItem: { title: string; content: string; date: Date; url: string }) => {
    try {
        const safeContent = newsItem.content.slice(0, MAX_INPUT_LENGTH);

        // 🟡 Check if the news article already exists in the database
        const existingNews = await prisma.summarizedNews.findFirst({
            where: {
                OR: [
                    { title: newsItem.title }, // Check by title
                    { url: newsItem.url } // Check by URL
                ]
            }
        });

        if (existingNews) {
            console.warn(`⚠️ News already exists, skipping: ${newsItem.title}`);
            return; // Skip processing if duplicate is found
        }

        // 🟡 Summarization
        let summarizedContent = safeContent;
        if (safeContent.length > 200) {
            try {
                const summaryPrompt = `
                    Summarize the following news article into a paragraph.
                    Do not include phrases like "Here is the summary" or "In simple terms".
                    Only return the summary text, nothing else.

                    ${safeContent}
                `;
                const summarized = await callGroqAPIOnce(summaryPrompt, safeContent);
                if (summarized) summarizedContent = summarized;
            } catch (error) {
                console.warn("⚠️ Summarization failed, fallback to original content", error);
            }
        }

        // 🟡 Categorization using K-means
        let category: string | null = null;
        try {
            category = await categorizeWithKMeans(summarizedContent);
        } catch (error) {
            console.warn("⚠️ Categorization failed", error);
        }

        // 🟡 Sentiment Analysis using Hugging Face
        let sentiment: string | null = null;
        try {
            sentiment = await analyzeSentiment(summarizedContent);
        } catch (error) {
            console.warn("⚠️ Sentiment analysis failed", error);
        }

        // ✅ Store only if both category and sentiment are successfully retrieved
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
            console.warn("⚠️ Skipped storing news due to missing category or sentiment");
        }
    } catch (error) {
        console.error("❌ Error processing news item:", error);
    }
};

