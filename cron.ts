import schedule from 'node-schedule';
import dotenv from 'dotenv';
import {scrapeAndStoreNews} from "@/service/scraper";
import {processAllNews} from "@/actions/news/query";
// import fs from 'fs'; // No longer needed directly here
// import path from 'path'; // No longer needed directly here

dotenv.config();

// const SCHEDULER_STATE_FILE = path.resolve(process.cwd(), 'scheduler_state.json'); // No longer needed directly here

// Removed getSchedulerState as state will be managed and checked in the API

let currentSchedulerJob: schedule.Job | null = null; // To hold the scheduled job instance

export function startNewsScheduler(): void {
    if (currentSchedulerJob) {
        console.log("Scheduler is already running.");
        return; // Prevent multiple scheduler instances
    }

    console.log("Setting up news scheduler...");

    currentSchedulerJob = schedule.scheduleJob('0 * * * *', async function() {
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
    console.log("News scraping job scheduled to run every hour!");
}

export function stopNewsScheduler(): void {
    if (currentSchedulerJob) {
        currentSchedulerJob.cancel();
        currentSchedulerJob = null;
        console.log("News scraping scheduler stopped.");
    } else {
        console.log("News scraping scheduler is not running.");
    }
}