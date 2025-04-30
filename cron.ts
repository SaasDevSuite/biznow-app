// scheduler.ts
import schedule from 'node-schedule';
import dotenv from 'dotenv';
import {scrapeAndStoreNews} from "@/service/scraper";
import {processAllNews} from "@/actions/news/query";

dotenv.config();

// Function to start scheduling
export function startScheduler(): void {
    console.log("Setting up scheduler...");

    // Schedule job to run every 5 minutes
    // The "*/5 * * * *" cron expression means "every 5 minutes"
    schedule.scheduleJob('*/5 * * * *', async function() {
        console.log("💻💻 Running the scraping job...💻💻");

        try {
            await scrapeAndStoreNews();
            console.log("🏁🏁 News scraped!!! now processing........! 🏁🏁");
            await processAllNews();
            console.log("🎉🎉 News scraping job completed! 🎉🎉");
        } catch (error) {
            console.error("Cron job error:", error);
        }
    });
    console.log("News scraping job scheduled to run every 5 minutes!");
}