import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

type NewsArticle = {
    title: string;
    url: string;
    content: string;
    date: string;
};

const FILE_PATH = path.join(process.cwd(), 'public/news-data', 'news.json'); // File location

async function getFullNewsContent(url: string): Promise<NewsArticle> {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('article.news h1').text().trim();
        const date = $('article.news p.news-datestamp').text().trim();
        const content = $('div.news-content p').text().trim() || 'No content found';

        return {
            title,
            url,
            content,
            date,
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        console.error(`❌ Error fetching content for: ${url}`);
        return {
            title: 'Error',
            url: "error",
            content: 'Error fetching content',
            date: '',
        };
    }
}

export async function scrapeAndStoreNews() {
    try {
        const { data } = await axios.get('https://www.adaderana.lk/hot-news/');
        const $ = cheerio.load(data);
        const articles: NewsArticle[] = [];

        const links = $('div.thumb-image a');

        for (const element of links) {
            const url = $(element).attr('href') || '';
            const news = await getFullNewsContent(url);

            articles.push(news);
        }

        // Save data to JSON file
        fs.writeFileSync(FILE_PATH, JSON.stringify(articles, null, 2), 'utf-8');

        console.log('✅ News data saved to JSON file:', FILE_PATH);
    } catch (error) {
        console.error('❌ Error scraping news:', error);
    }
}