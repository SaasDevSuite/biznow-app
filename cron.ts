import cron from 'node-cron';
import { scrapeAndStoreNews } from './src/service/scraper.js';

cron.schedule("* * * * *", async () => {
    console.log("Running the scraping job...");

    try {
        await scrapeAndStoreNews();
        console.log("News scraping job completed!");
    } catch (error) {
        console.error("Cron job error:", error);
    }
});

console.log("Running the scraping job...");