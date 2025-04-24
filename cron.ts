import cron from 'node-cron';
import { scrapeAndStoreNews } from './src/service/scraper.js';
import dotenv from 'dotenv';
import {processAllNews} from "@/actions/news/query";

dotenv.config();

cron.schedule("* * * * *", async () => {
    console.log("Running the scraping job...");

    try {
        await scrapeAndStoreNews().then(async ()=>{
            await processAllNews();
        });
        console.log("News scraping job completed!");
    } catch (error) {
        console.error("Cron job error:", error);
    }
});

console.log("Running the scraping job...");