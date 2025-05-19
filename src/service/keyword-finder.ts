import { loadNewsData } from "@/actions/news/query";
import businessKeywords from "@/../public/data/business-keywords.json";
import { PorterStemmer } from "natural";
import { prisma } from "@/prisma";

type TaggedNews = {
    id: string;
    matched_categories: string[];
};

function getCategoryStemMap(): Map<string, Set<string>> {
    const categoryMap = new Map<string, Set<string>>();

    for (const [category, keywords] of Object.entries(businessKeywords)) {
        const stemmedSet = new Set<string>();
        for (const keyword of keywords) {
            const stemmed = PorterStemmer.stem(keyword.toLowerCase());
            stemmedSet.add(stemmed);
        }
        categoryMap.set(category, stemmedSet);
    }

    return categoryMap;
}

export async function findKeywords(): Promise<TaggedNews[]> {
    const newsData = await loadNewsData();
    const categoryMap = getCategoryStemMap();

    const taggedArticles: TaggedNews[] = [];

    for (const news of newsData) {
        const combinedText = `${news.title}. ${news.content}`.toLowerCase();
        const words = combinedText.split(/\W+/);

        const articleStems = new Set<string>();
        for (const word of words) {
            const stemmed = PorterStemmer.stem(word);
            articleStems.add(stemmed);
        }

        const matchedCategories: string[] = [];

        for (const [category, stemmedKeywords] of categoryMap.entries()) {
            const intersects = [...stemmedKeywords].some(stem => articleStems.has(stem));
            if (intersects) {
                matchedCategories.push(category);
            }
        }

        if (matchedCategories.length > 0) {
            taggedArticles.push({
                id: news.id,
                matched_categories: matchedCategories
            });
        }
    }

    for (const taggedArticle of taggedArticles) {
        console.log(taggedArticle);
    }
    return taggedArticles;
}

export async function storeCategoriesInDb() {
    const taggedArticles = await findKeywords();

    for (const article of taggedArticles) {
        await prisma.news.update({
            where: { id: article.id },
            data: {
                matchedCategories: JSON.stringify(article.matched_categories)
            }
        });
    }
}
