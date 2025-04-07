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

// Simple fallback categorizer using keyword matching
const keywordBasedCategorize = (text: string): string => {
    const lowerText = text.toLowerCase();

    // Define category keywords
    const categoryKeywords: Record<string, string[]> = {
        "Technology": ["tech", "software", "hardware", "ai", "robot", "computer", "digital", "internet", "app", "cyber"],
        "Business": ["business", "company", "corporate", "market", "stock", "finance", "investment", "startup", "entrepreneur"],
        "Politics": ["politic", "government", "election", "policy", "vote", "parliament", "congress", "president", "minister"],
        "Sports": ["sport", "team", "player", "match", "tournament", "championship", "game", "coach", "score", "win"],
        "Entertainment": ["movie", "music", "celebrity", "actor", "film", "song", "concert", "star", "show", "performance"],
        "Health": ["health", "medical", "doctor", "hospital", "disease", "treatment", "patient", "medicine", "therapy", "vaccine"],
        "Science": ["science", "research", "study", "scientist", "discovery", "experiment", "laboratory", "physics", "biology", "chemistry"],
        "Environment": ["environment", "climate", "green", "pollution", "sustainable", "ecology", "renewable", "planet", "earth", "conservation"]
    };

    // Count category matches
    const categoryScores: Record<string, number> = {};

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        categoryScores[category] = 0;

        for (const keyword of keywords) {
            const regex = new RegExp(keyword, 'gi');
            const matches = lowerText.match(regex);
            if (matches) {
                categoryScores[category] += matches.length;
            }
        }
    }

    // Find category with highest score
    let maxScore = 0;
    let bestCategory = "Other";

    for (const [category, score] of Object.entries(categoryScores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }

    return bestCategory;
};

// Initialize categorization system with fallback options
async function initializeCategories() {
    // Try to use Universal Sentence Encoder if available
    let sentenceEncoder = null;
    let useAvailable = false;

    // Try to import USE properly using ES modules
    useAvailable = await tryImportUSE();

    try {
        if (useAvailable && USE) {
            sentenceEncoder = await USE.load();
            console.log("✅ Universal Sentence Encoder loaded successfully");
        } else {
            console.warn("⚠️ Universal Sentence Encoder module not available, using keyword fallback");
        }
    } catch (error) {
        console.warn("⚠️ Failed to load Universal Sentence Encoder:", error);
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
        const categoryEmbeddings: Record<string, tf.Tensor1D> = {};

        // Define category descriptions
        const categories: Record<string, string> = {
            "Technology": "Latest tech innovations, AI, software, hardware, gadgets, cybersecurity, internet trends, mobile phones, robotics, blockchain, virtual reality",
            "Business": "Corporate news, startups, finance, stock markets, economy, entrepreneurship, investments, banking, mergers, acquisitions, business strategies, leadership",
            "Politics": "Government, elections, policy, international relations, diplomacy, parliament, political debates, political parties, governance, public administration",
            "Sports": "Athletic competitions, team sports, athletes, tournaments, cricket, football, Olympics, eSports, major sporting events, sportsmanship, training",
            "Entertainment": "Movies, music, celebrities, TV shows, art, theater, concerts, social media trends, pop culture, fashion, celebrity interviews, streaming platforms",
            "Health": "Medical news, public health, diseases, fitness, mental health, healthcare policies, wellness, medical breakthroughs, vaccines, health research, nutrition",
            "Science": "Research, physics, biology, chemistry, scientific discoveries, space exploration, climate science, scientific innovations, environmental research, astronomy",
            "Finance": "Banking, stock market trends, inflation, cryptocurrencies, personal finance, fintech, investments, retirement planning, insurance, wealth management",
            "Travel": "Tourism, travel destinations, adventure, hospitality, airlines, hotels, cultural experiences, travel tips, global tourism trends, eco-tourism, adventure travel",
            "Weather": "Climate updates, natural disasters, extreme weather, storms, meteorology, global warming, severe weather alerts, climate change reports",
            "Education": "Schools, universities, scholarships, online learning, academic research, student policies, distance learning, academic achievements, curriculum reforms",
            "Crime": "Law enforcement, legal cases, court rulings, fraud, cybercrime, human rights violations, organized crime, criminal investigations, criminal justice reform",
            "Human Rights": "Human rights violations, international law, social justice, humanitarian issues, equality, human dignity, civil rights, global justice, refugee rights",
            "Environment": "Climate change, sustainability, conservation, pollution, renewable energy, global warming, ecosystem protection, biodiversity, environmental policies",
            "Startups": "Entrepreneurship, funding rounds, venture capital, startup success stories, new businesses, innovation hubs, angel investors, startup culture",
            "Agriculture": "Farming, crops, livestock, agribusiness, food security, organic farming, sustainable agriculture, farming technology, crop diseases, food production",
            "Culture & Heritage": "Traditions, historical sites, festivals, literature, art history, folk culture, cultural preservation, archeology, cultural heritage conservation",
            "Tourism": "Travel destinations, local tourism, luxury resorts, backpacking, sightseeing, eco-tourism, local experiences, tourist attractions, heritage tourism",
            "Economy": "GDP, inflation, taxation, trade, global economic trends, financial policies, economic reforms, economic indicators, employment, poverty reduction",
            "Social Issues": "Human rights, gender equality, social justice, poverty, protests, activism, racial equality, LGBTQ+ rights, refugees, humanitarian crises",
            "Other": "Miscellaneous news, viral trends, memes, opinion pieces, public interest stories, offbeat news, internet culture, quirky trends, viral challenges",
            "Obituaries": "Obituaries, memorials, tributes, famous individuals passing, life stories, legacy, tributes to influential people, obituary notices"
        };

        // Generate all embeddings
        for (const [category, description] of Object.entries(categories)) {
            try {
                const embedding = await sentenceEncoder.embed(description);
                categoryEmbeddings[category] = flattenEmbedding(embedding);
            } catch (error) {
                console.warn(`⚠️ Failed to generate embedding for category ${category}:`, error);
            }
        }

        const preprocessTextForCategorization = async (text: string): Promise<tf.Tensor1D> => {
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

        const categorizeWithKMeans = async (text: string): Promise<string> => {
            try {
                const inputTensor = await preprocessTextForCategorization(text);

                let closestCategory: string = "Other";
                let minDistance = Infinity;

                for (const [category, categoryTensor] of Object.entries(categoryEmbeddings)) {
                    const distance = calculateEuclideanDistance(inputTensor, categoryTensor);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCategory = category;
                    }
                }

                return closestCategory;
            } catch (error) {
                console.error("Error in K-means categorization:", error);
                // Fallback to keyword-based categorization
                return keywordBasedCategorize(text);
            }
        };

        return { categorizeWithKMeans };
    } else {
        // If USE is not available, return the keyword-based fallback
        const categorizeWithKMeans = async (text: string): Promise<string> => {
            return keywordBasedCategorize(text);
        };

        return { categorizeWithKMeans };
    }
}

// Export the initialization function that returns the categorization function
export const initializeCategorizer = async () => {
    try {
        return await initializeCategories();
    } catch (error) {
        console.error("❌ Failed to initialize categorizer:", error);
        // Return a fallback if initialization fails
        return {
            categorizeWithKMeans: async (text: string): Promise<string> => {
                return keywordBasedCategorize(text);
            }
        };
    }
};
