import { loadNewsData } from "@/actions/news/query";
import { prisma } from "@/prisma";
import { MainCategory } from "@prisma/client";
import * as tf from '@tensorflow/tfjs';

// Use dynamic import for USE with proper error handling
let USE: any = null;

// Async function to attempt loading the USE module
const tryImportUSE = async () => {
    try {
        USE = await import('@tensorflow-models/universal-sentence-encoder');
        return true;
    } catch (error) {
        console.warn("⚠️ Universal Sentence Encoder not available:", error);
        return false;
    }
};

type LLMTaggedNews = {
    id: string;
    mainCategory: string;
};

// Valid main categories for validation
const VALID_MAIN_CATEGORIES = [
    "POLICY_CHANGES", "COMPLIANCE", "LEGAL_UPDATES", "TAX_REGULATIONS",
    "MARKET_EXPANSION", "NEW_INVESTMENTS", "INNOVATION", "PARTNERSHIPS",
    "MARKET_VOLATILITY", "COMPETITION", "SUPPLY_CHAIN", "WORKFORCE_ISSUES", "GENERAL"
];

// Helper function to validate and sanitize main category
function validateMainCategory(category: string): string {
    if (!category || typeof category !== 'string') {
        return "GENERAL";
    }

    const upperCategory = category.toUpperCase().trim();
    return VALID_MAIN_CATEGORIES.includes(upperCategory) ? upperCategory : "GENERAL";
}

// Simple fallback categorizer using keyword matching for main categories
const keywordBasedMainCategorize = (text: string): string => {
    const lowerText = text.toLowerCase();

    // Define main category keywords with high priority
    const mainCategoryKeywords: Record<string, string[]> = {
        "POLICY_CHANGES": [
            "policy", "regulation", "government", "law", "reform", "initiative", "regulatory",
            "announcement", "policy change", "new law", "government decision", "regulatory framework"
        ],
        "COMPLIANCE": [
            "compliance", "audit", "certification", "standards", "requirements", "obligations",
            "regulatory compliance", "legal requirements", "standards adherence", "audit requirements"
        ],
        "LEGAL_UPDATES": [
            "court", "legal", "lawsuit", "ruling", "judgment", "legal framework",
            "court decision", "legal precedent", "law amendment", "legal dispute"
        ],
        "TAX_REGULATIONS": [
            "tax", "taxation", "fiscal", "revenue", "tax rate", "tax policy",
            "tax reform", "tax incentive", "fiscal policy", "tax compliance"
        ],
        "MARKET_EXPANSION": [
            "expansion", "new market", "growth", "opening", "launch", "enter",
            "market entry", "geographic growth", "business expansion", "market penetration"
        ],
        "NEW_INVESTMENTS": [
            "investment", "funding", "capital", "venture", "investor", "finance",
            "funding round", "capital raising", "venture capital", "financial backing"
        ],
        "INNOVATION": [
            "innovation", "technology", "r&d", "new product", "breakthrough", "tech",
            "technological advance", "research and development", "product innovation", "technological breakthrough"
        ],
        "PARTNERSHIPS": [
            "partnership", "collaboration", "joint venture", "alliance", "cooperation",
            "strategic partnership", "business alliance", "cooperation agreement", "joint collaboration"
        ],
        "MARKET_VOLATILITY": [
            "volatility", "fluctuation", "uncertainty", "instability", "crisis",
            "market fluctuation", "economic uncertainty", "price volatility", "market instability"
        ],
        "COMPETITION": [
            "competition", "competitor", "rival", "market share", "competitive",
            "competitive landscape", "market competition", "competitive advantage", "industry competition"
        ],
        "SUPPLY_CHAIN": [
            "supply chain", "logistics", "procurement", "distribution", "manufacturing",
            "supply disruption", "logistics challenge", "supply chain management", "sourcing"
        ],
        "WORKFORCE_ISSUES": [
            "employment", "hiring", "layoff", "workforce", "employee", "labor",
            "hr policy", "employee relations", "staffing", "labor dispute", "human resources"
        ]
    };

    // Count category matches with weighted scoring
    const categoryScores: Record<string, number> = {};

    for (const [category, keywords] of Object.entries(mainCategoryKeywords)) {
        categoryScores[category] = 0;

        for (const keyword of keywords) {
            const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = lowerText.match(regex);
            if (matches) {
                // Give higher weight to exact matches and longer phrases
                const weight = keyword.includes(' ') ? 2 : 1;
                categoryScores[category] += matches.length * weight;
            }
        }
    }

    // Find category with highest score
    let maxScore = 0;
    let bestCategory = "GENERAL";

    for (const [category, score] of Object.entries(categoryScores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }

    // Only return a specific category if it has a meaningful score
    return maxScore > 0 ? bestCategory : "GENERAL";
};

// Initialize categorization system with fallback options for main categories
async function initializeMainCategories() {
    // Try to use Universal Sentence Encoder if available
    let sentenceEncoder = null;
    let useAvailable = false;

    // Try to import USE properly using ES modules
    useAvailable = await tryImportUSE();

    try {
        if (useAvailable && USE) {
            sentenceEncoder = await USE.load();
            console.log("✅ Universal Sentence Encoder loaded successfully for main categories");
        } else {
            console.warn("⚠️ Universal Sentence Encoder module not available, using keyword fallback for main categories");
        }
    } catch (error) {
        console.warn("⚠️ Failed to load Universal Sentence Encoder for main categories:", error);
    }

    // If USE is available, set up the tensor-based categorization
    if (useAvailable && sentenceEncoder) {
        // Type-safe version that handles the specific tensor types returned by USE
        const flattenEmbedding = (embedding: any): tf.Tensor1D => {
            return tf.tidy(() => {
                // Get the values directly as a Float32Array
                const values = embedding.dataSync();
                // Create a new tensor with the same values but explicitly as 1D
                return tf.tensor1d(values);
            });
        };

        // Create the embeddings asynchronously
        const mainCategoryEmbeddings: Record<string, tf.Tensor1D> = {};

        // Define main category descriptions for embedding
        const mainCategories: Record<string, string> = {
            "POLICY_CHANGES": "Government policy announcements, regulatory changes, new laws affecting business, policy reforms, government initiatives, regulatory frameworks, policy decisions, government regulations",
            "COMPLIANCE": "Regulatory compliance requirements, legal obligations, standards adherence, audit requirements, certification processes, regulatory reporting, compliance standards, legal compliance",
            "LEGAL_UPDATES": "Court decisions, legal precedents, law amendments, legal frameworks, legal disputes, court rulings, legal changes affecting business, judicial decisions, legal proceedings",
            "TAX_REGULATIONS": "Tax policy changes, tax rates, tax compliance, fiscal policies, tax incentives, tax reforms, taxation matters, revenue policies, fiscal regulations",
            "MARKET_EXPANSION": "Business expansion, entering new markets, geographic growth, market entry, opening new locations, expanding operations, market penetration, business growth, territorial expansion",
            "NEW_INVESTMENTS": "Funding rounds, investment announcements, capital raising, venture capital, investment deals, funding, financial backing, capital injection, investor funding",
            "INNOVATION": "New technologies, research and development, product innovation, technological breakthroughs, new products, technological advances, innovation initiatives, tech developments",
            "PARTNERSHIPS": "Business partnerships, joint ventures, collaborations, alliances, strategic partnerships, business alliances, cooperation agreements, corporate partnerships, business collaborations",
            "MARKET_VOLATILITY": "Market fluctuations, economic uncertainty, price volatility, market instability, economic downturns, market crashes, financial instability, economic turbulence",
            "COMPETITION": "Competitive landscape, market competition, rival companies, competitive advantage, market share battles, competitive strategies, industry competition, business rivalry",
            "SUPPLY_CHAIN": "Supply chain issues, logistics, procurement, distribution, supply disruptions, manufacturing, sourcing, supply chain management, logistics challenges, operational supply",
            "WORKFORCE_ISSUES": "Employment matters, hiring, layoffs, labor relations, workforce changes, HR policies, employee relations, staffing, labor disputes, human resources, employment policies",
            "GENERAL": "Miscellaneous business news, general corporate updates, other business matters, general commercial activities, various business topics, general industry news"
        };

        // Generate all embeddings
        for (const [category, description] of Object.entries(mainCategories)) {
            try {
                const embedding = await sentenceEncoder.embed(description);
                mainCategoryEmbeddings[category] = flattenEmbedding(embedding);
            } catch (error) {
                console.warn(`⚠️ Failed to generate embedding for main category ${category}:`, error);
            }
        }

        const preprocessTextForMainCategorization = async (text: string): Promise<tf.Tensor1D> => {
            const embedding = await sentenceEncoder.embed(text);
            return flattenEmbedding(embedding);
        };

        const calculateEuclideanDistance = (tensor1: tf.Tensor1D, tensor2: tf.Tensor1D): number => {
            const diff = tf.sub(tensor1, tensor2);
            const squaredDiff = tf.square(diff);
            const sumSquaredDiff = tf.sum(squaredDiff);
            const distance = Math.sqrt(sumSquaredDiff.dataSync()[0]);
            return distance;
        };

        const categorizeMainWithTensorFlow = async (text: string): Promise<string> => {
            try {
                const inputTensor = await preprocessTextForMainCategorization(text);

                let closestCategory: string = "GENERAL";
                let minDistance = Infinity;

                for (const [category, categoryTensor] of Object.entries(mainCategoryEmbeddings)) {
                    const distance = calculateEuclideanDistance(inputTensor, categoryTensor);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCategory = category;
                    }
                }

                return closestCategory;
            } catch (error) {
                console.error("Error in main category TensorFlow categorization:", error);
                // Fallback to keyword-based categorization
                return keywordBasedMainCategorize(text);
            }
        };

        return { categorizeMainWithTensorFlow };
    } else {
        // If USE is not available, return the keyword-based fallback
        const categorizeMainWithTensorFlow = async (text: string): Promise<string> => {
            return keywordBasedMainCategorize(text);
        };

        return { categorizeMainWithTensorFlow };
    }
}

// Export the initialization function that returns the main categorization function
const initializeMainCategorizer = async () => {
    try {
        return await initializeMainCategories();
    } catch (error) {
        console.error("❌ Failed to initialize main categorizer:", error);
        // Return a fallback if initialization fails
        return {
            categorizeMainWithTensorFlow: async (text: string): Promise<string> => {
                return keywordBasedMainCategorize(text);
            }
        };
    }
};

// Initialize this as null and assign it later
let mainCategorizerInstance: { categorizeMainWithTensorFlow: (text: string) => Promise<string> } | null = null;

// Initialize the main categorizer when the module loads
(async () => {
    try {
        mainCategorizerInstance = await initializeMainCategorizer();
        console.log("✅ Main categorizer initialized successfully");
    } catch (error) {
        console.error("❌ Failed to initialize main categorizer:", error);
    }
})();

export async function classifyMainCategory(title: string, content: string): Promise<{ mainCategory: string }> {
    try {
        // Ensure main categorizer is initialized
        if (!mainCategorizerInstance) {
            console.warn("⚠️ Main categorizer not initialized yet, initializing now...");
            mainCategorizerInstance = await initializeMainCategorizer();
        }

        // Combine title and content for analysis
        const fullText = `${title} ${content}`;

        let mainCategory: string = "GENERAL";
        try {
            if (mainCategorizerInstance) {
                mainCategory = await mainCategorizerInstance.categorizeMainWithTensorFlow(fullText);
            }
            if (!mainCategory) {
                mainCategory = "GENERAL";
            }
        } catch (error) {
            console.warn("⚠️ Main categorization failed, using fallback:", error);
            mainCategory = keywordBasedMainCategorize(fullText);
        }

        // Validate the result
        const validatedCategory = validateMainCategory(mainCategory);

        return {
            mainCategory: validatedCategory
        };

    } catch (err) {
        console.error("❌ Failed to classify main category:", err);
        return {
            mainCategory: "GENERAL"
        };
    }
}

export async function llmFindNewsCategories(): Promise<LLMTaggedNews[]> {
    const newsData = await loadNewsData();
    const results: LLMTaggedNews[] = [];

    for (const news of newsData) {
        try {
            const classification = await classifyMainCategory(news.title, news.content);
            results.push({
                id: news.id,
                mainCategory: classification.mainCategory
            });

            console.log(`✅ [${news.title}] → Main: ${classification.mainCategory}`);

            // Add a small delay between classifications for performance
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

        } catch (error) {
            console.error(`❌ Error classifying news "${news.title}":`, error);
            // Add the news with default mainCategory even if classification fails
            results.push({
                id: news.id,
                mainCategory: "GENERAL"
            });
        }
    }

    return results;
}

export async function storeLLMCategoriesInDb() {
    const taggedArticles = await llmFindNewsCategories();

    for (const article of taggedArticles) {
        await prisma.news.update({
            where: { id: article.id },
            data: {
                matchedCategories: article.mainCategory,
            },
        });
    }
}

export async function storeLLMCategoriesInSummarizedNews() {
    const taggedArticles = await llmFindNewsCategories();

    for (const article of taggedArticles) {
        // Get the original news article to find matching URL
        const originalNews = await prisma.news.findUnique({
            where: { id: article.id }
        });

        if (originalNews) {
            // Find corresponding summarized news by matching URL
            const summarizedNews = await prisma.summarizedNews.findFirst({
                where: {
                    url: originalNews.url
                }
            });

            if (summarizedNews) {
                await prisma.summarizedNews.update({
                    where: { id: summarizedNews.id },
                    data: {
                        mainCategory: article.mainCategory as MainCategory,
                    },
                });
                console.log(`✅ Updated summarized news: ${summarizedNews.title} → ${article.mainCategory}`);
            } else {
                console.log(`⚠️ No matching summarized news found for: ${originalNews.title}`);
            }
        }
    }
}
