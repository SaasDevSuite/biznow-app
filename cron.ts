import cron from 'node-cron';
import { scrapeAndStoreNews } from './src/service/scraper.js';
import dotenv from 'dotenv';
import { processAllNews } from "./src/actions/news/query.js";
dotenv.config();

cron.schedule("*/5 * * * *", async () => {
    console.log("💻💻 Running the scraping job...💻💻");

    try {
        await scrapeAndStoreNews().then(async () => {
            console.log("🏁🏁 News scraped!!! now processing........! 🏁🏁");
            await processAllNews();
        });
        console.log("🎉🎉 News scraping job completed! 🎉🎉");
    } catch (error) {
        console.error("Cron job error:", error);
    }
});

console.log("Running the scraping job... executed.");