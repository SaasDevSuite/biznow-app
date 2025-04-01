import cron from 'node-cron';
import { scrapeAndStoreNews } from './src/service/scraper.js'; // Note the './' at the beginning and .js extension

cron.schedule("* * * * *", async () => {
    console.log("Running the scraping job...");

    try {
        await scrapeAndStoreNews(); // Correctly handling async function with await
        console.log("News scraping job completed!");
    } catch (error) {
        console.error("Cron job error:", error);
    }
});

console.log("Running the scraping job...");