import { loadNewsData } from "@/actions/news/query";
import { prisma } from "@/prisma";

type LLMTaggedNews = {
    id: string;
    category: string;
};

const model = "llama3-8b-8192"; //or "mixtral-8x7b-32768"

function buildPrompt(title: string, content: string): string {
    return `
You are a business news classifier.

Read the article and classify it into exactly ONE of the following categories:
- business_growth → company expansion, investment, new branches, partnerships
- regulatory_change → laws, taxes, government policies affecting business
- economic_risk → economic crisis, layoffs, inflation, shortages
- market_trend → consumer demand, pricing, sales, seasonal business
- technology_innovation → AI, new tech, apps, digital transformation
- infrastructure → construction, logistics, roads, power, transport
- general_business → anything else not fitting above

Respond ONLY in this JSON format:
{ "category": "..." }

Article:
Title: ${title}
Content: ${content}
`;
}

async function classifyWithGroq(title: string, content: string): Promise<string> {
    const prompt = buildPrompt(title, content);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        }),
    });

    const data = await res.json();

    try {
        const parsed = JSON.parse(data.choices[0].message.content);
        return parsed.category || "general_business";
    } catch (err) {
        console.error("❌ Failed to parse Groq response:", err);
        return "general_business";
    }
}

export async function llmFindNewsCategories(): Promise<LLMTaggedNews[]> {
    const newsData = await loadNewsData();
    const results: LLMTaggedNews[] = [];

    for (const news of newsData) {
        const category = await classifyWithGroq(news.title, news.content);
        results.push({ id: news.id, category });

        console.log(`✅ [${news.title}] → ${category}`);
    }

    return results;
}

export async function storeLLMCategoriesInDb() {
    const taggedArticles = await llmFindNewsCategories();

    for (const article of taggedArticles) {
        await prisma.news.update({
            where: { id: article.id },
            data: {
                matchedCategories: article.category,
            },
        });
    }
}
