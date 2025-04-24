import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

export interface NewsArticle {
    title: string;
    content: string;
    date: string;
    rawDate?: string;
    url: string;
    source: string;
}

interface SiteConfig {
    name: string;
    baseUrl: string;
    articleLinkPattern: RegExp;
    articleSelector?: string;
}

interface RateLimitConfig {
    tokensPerMinute: number;
    tokensUsed: number;
    resetTime: number;
}

const rateLimitState: RateLimitConfig = {
    tokensPerMinute: 6000,
    tokensUsed: 0,
    resetTime: Date.now() + 60000
};


async function extractWithLLM(html: string, url: string, source: string): Promise<NewsArticle> {
    try {
        const $ = cheerio.load(html);

        $('script, style, meta, link, noscript, iframe').remove();

        const textContent = $('body').text().trim().replace(/\s+/g, ' ');

        const structuredData = await callGroqLLMServiceWithRetry(textContent, url, source);

        return structuredData;
    } catch (error) {
        console.error(`Error extracting data with LLM for ${url}:`, error);
        return {
            title: "Error extracting title",
            content: "Error extracting content",
            date: new Date().toISOString().split('T')[0],
            rawDate: "Error extracting date",
            url,
            source
        };
    }
}


function formatDateString(dateStr: string): { formatted: string, raw: string } {
    const raw = dateStr.trim();

    try {
        const date = new Date(raw);
        if (!isNaN(date.getTime())) {
            return {
                formatted: date.toISOString().split('T')[0],
                raw
            };
        }

        const monthDayYearRegex = /([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/;
        const mdyMatch = raw.match(monthDayYearRegex);

        if (mdyMatch) {
            const [_, month, day, year] = mdyMatch;
            const monthIndex = new Date(`${month} 1, 2000`).getMonth();
            if (!isNaN(monthIndex)) {
                const formattedDate = new Date(parseInt(year), monthIndex, parseInt(day));
                return {
                    formatted: formattedDate.toISOString().split('T')[0],
                    raw
                };
            }
        }

        const dayMonthYearRegex = /(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/;
        const dmyMatch = raw.match(dayMonthYearRegex);

        if (dmyMatch) {
            const [_, day, month, year] = dmyMatch;
            const monthIndex = new Date(`${month} 1, 2000`).getMonth();
            if (!isNaN(monthIndex)) {
                const formattedDate = new Date(parseInt(year), monthIndex, parseInt(day));
                return {
                    formatted: formattedDate.toISOString().split('T')[0],
                    raw
                };
            }
        }

        const numericDateRegex = /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/;
        const numericMatch = raw.match(numericDateRegex);

        if (numericMatch) {
            const [_, first, second, year] = numericMatch;
            const formattedYear = year.length === 2 ? `20${year}` : year;
            const formattedDate = new Date(`${first}/${second}/${formattedYear}`);
            if (!isNaN(formattedDate.getTime())) {
                return {
                    formatted: formattedDate.toISOString().split('T')[0],
                    raw
                };
            }
        }

        // If all parsing attempts fail, return original with current date as formatted
        return {
            formatted: new Date().toISOString().split('T')[0],
            raw
        };
    } catch (error) {
        console.error("Error formatting date:", error);
        return {
            formatted: new Date().toISOString().split('T')[0],
            raw
        };
    }
}


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


function checkRateLimit(requestedTokens: number): { canProceed: boolean; waitTime: number } {
    const now = Date.now();

    // Reset the counter if we've passed the reset time
    if (now > rateLimitState.resetTime) {
        rateLimitState.tokensUsed = 0;
        rateLimitState.resetTime = now + 60000;
    }

    if (rateLimitState.tokensUsed + requestedTokens > rateLimitState.tokensPerMinute) {
        const waitTime = rateLimitState.resetTime - now;
        return { canProceed: false, waitTime };
    }

    rateLimitState.tokensUsed += requestedTokens;
    return { canProceed: true, waitTime: 0 };
}


function parseRetryDelay(errorMessage: string): number {
    const match = errorMessage.match(/Please try again in (\d+)ms/);
    if (match && match[1]) {
        return parseInt(match[1]) + 100; // Add a small buffer
    }
    return 1000;
}


function parseRequestedTokens(errorMessage: string): number {
    const match = errorMessage.match(/Requested (\d+)/);
    if (match && match[1]) {
        return parseInt(match[1]);
    }
    return 500;
}


async function callGroqLLMServiceWithRetry(
    text: string,
    url: string,
    source: string,
    maxRetries: number = 5
): Promise<NewsArticle> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error("GROQ_API_KEY is not set in environment variables");
        throw new Error("GROQ_API_KEY is required");
    }

    // Estimate token count - rough heuristic: ~4 characters per token
    const estimatedTokens = Math.ceil(text.length / 4) + 500;

    let retries = 0;
    let lastError: any = null;

    while (retries <= maxRetries) {
        const { canProceed, waitTime } = checkRateLimit(estimatedTokens);

        if (!canProceed) {
            console.log(`Rate limit would be exceeded. Waiting ${waitTime}ms before retry...`);
            await sleep(waitTime);
            continue;
        }

        try {
            return await callGroqLLMService(text, url, source, apiKey);
        } catch (error: any) {
            lastError = error;

            // Check if it's a rate limit error
            if (error.response?.status === 429) {
                retries++;

                const errorMessage = error.response?.data?.error?.message || '';
                console.log(`Rate limit hit (retry ${retries}/${maxRetries}): ${errorMessage}`);

                // Extract retry delay from error message
                const retryDelay = parseRetryDelay(errorMessage);

                // Update rate limit with the tokens that were requested
                const requestedTokens = parseRequestedTokens(errorMessage);
                rateLimitState.tokensUsed = Math.max(
                    rateLimitState.tokensPerMinute - requestedTokens,
                    rateLimitState.tokensUsed
                );

                // Apply exponential backoff
                const backoffDelay = retryDelay * Math.pow(1.5, retries - 1);
                console.log(`Waiting ${backoffDelay}ms before retry...`);
                await sleep(backoffDelay);
            } else {
                // For non-rate-limit errors, throw immediately
                throw error;
            }
        }
    }

    // If we've exhausted all retries
    console.error(`Failed after ${maxRetries} retries:`, lastError);
    throw new Error(`Failed to call Groq LLM service after ${maxRetries} retries`);
}


async function callGroqLLMService(text: string, url: string, source: string, apiKey: string): Promise<NewsArticle> {
    const prompt = `
  Your task is to extract structured information from the following news article text.
  
  Extract the following information:
  1. Title: The main headline or title of the article
  2. Content: The main body content of the article (summarized if very long)
  3. Date: The publication date of the article (extract the full date in its original format)
  
  Article text:
  ${text.substring(0, 6000)} // Reduced to avoid token limits
  
  Return ONLY valid JSON with exactly these fields: title, content, and date.
  Format:
  {
    "title": "The extracted title",
    "content": "The extracted or summarized content",
    "date": "The extracted date exactly as it appears"
  }
  `;

    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: "llama3-70b-8192",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that extracts structured information from news article text. Always return valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: 1500
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const result = response.data.choices[0].message.content;
    console.log(`Raw LLM result for ${url}:`, result);

    // Update token usage if available in the response
    if (response.data.usage && response.data.usage.total_tokens) {
        const actualTokens = response.data.usage.total_tokens;
        rateLimitState.tokensUsed += (actualTokens - Math.ceil(text.length / 4) - 500);
    }

    let parsedResult;
    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : result;
        parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
        console.error("Error parsing LLM JSON response:", parseError);
        console.log("Problematic JSON string:", result);
        throw new Error("Failed to parse LLM response as JSON");
    }

    const rawDate = parsedResult.date || "No date extracted";
    const { formatted: formattedDate, raw: originalDate } = formatDateString(rawDate);

    return {
        title: parsedResult.title || "No title extracted",
        content: parsedResult.content || "No content extracted",
        date: formattedDate,
        rawDate: originalDate,
        url,
        source
    };
}

export async function scrapeAndProcessNews(config: SiteConfig, maxArticles: number = 10) {
    const FILE_PATH = path.join(process.cwd(), `public/news-data/newsData.json`);
    const articles: NewsArticle[] = [];
    const seen = new Set<string>();

    try {
        console.log(`Starting to scrape ${config.name} at ${config.baseUrl}`);
        const { data } = await axios.get(config.baseUrl);
        const $ = cheerio.load(data);

        const links = $('a');
        console.log(`Found ${links.length} links to check on ${config.name}`);

        let articlesProcessed = 0;

        for (const link of links) {
            // Check whether the limit reached
            if (articlesProcessed >= maxArticles) {
                console.log(`Reached maximum of ${maxArticles} articles for ${config.name}`);
                break;
            }

            const url = $(link).attr('href');
            const absoluteUrl = url && url.startsWith('http') ? url : url ? new URL(url, config.baseUrl).toString() : null;

            if (absoluteUrl && config.articleLinkPattern.test(absoluteUrl) && !seen.has(absoluteUrl)) {
                seen.add(absoluteUrl);
                console.log(`Processing article from ${config.name}: ${absoluteUrl}`);

                try {
                    const { data: articleData } = await axios.get(absoluteUrl);

                    let articleHtml = articleData;
                    if (config.articleSelector) {
                        const $article = cheerio.load(articleData);
                        articleHtml = $article(config.articleSelector).html() || articleData;
                    }

                    const processedArticle = await extractWithLLM(articleHtml, absoluteUrl, config.name);
                    articles.push(processedArticle);

                    articlesProcessed++;
                    console.log(`Successfully processed article ${articlesProcessed} from ${config.name}`);

                    // Add a larger delay between articles to help with rate limiting
                    await sleep(2500);
                } catch (error) {
                    console.error(`Error processing article ${absoluteUrl}:`, error);

                    // Save partial results after errors
                    if (articles.length > 0) {
                        fs.writeFileSync(FILE_PATH, JSON.stringify(articles, null, 2), 'utf-8');
                        console.log(`✅ Partial news data saved to JSON file for ${config.name}:`, FILE_PATH);
                    }

                    await sleep(5000);
                }
            }
        }

        if (articles.length > 0) {
            fs.writeFileSync(FILE_PATH, JSON.stringify(articles, null, 2), 'utf-8');
            console.log(`✅ News data saved to JSON file for ${config.name}:`, FILE_PATH);
            console.log(`Total articles scraped: ${articles.length}`);
        } else {
            console.log(`No articles found to save for ${config.name}.`);
        }

        return articles;
    } catch (error) {
        console.error(`❌ Error scraping news from ${config.name}:`, error);
        return articles;
    }
}

export async function scrapeAndStoreNews() {
    const meepuraConfig: SiteConfig = {
        name: "meepura",
        baseUrl: "https://www.meepura.com/english/",
        articleLinkPattern: /^https:\/\/www\.meepura\.com\/english\/\?p=\d+$/,
        articleSelector: "article"
    };

    const deranaConfig: SiteConfig = {
        name: "derana",
        baseUrl: "https://www.adaderana.lk/hot-news/",
        articleLinkPattern: /https:\/\/www\.adaderana\.lk\/news\/\d+\/[a-z0-9\-]+/,
        articleSelector: "article"
    };

    return await scrapeAndProcessNews(meepuraConfig, 100);
}