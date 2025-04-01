import { NextResponse } from 'next/server';
import { processAllNews } from '@/actions/news/query'; // Import the function to process all news

// Handle the API route for processing all news articles
export async function POST() {
    try {
        // Log the start of the processing
        console.log("🔄 Starting batch news processing...");

        // Call the function to process all news items
        await processAllNews();

        // Return a successful response once processing is complete
        return NextResponse.json({ message: "Successfully processed all news articles." }, { status: 200 });
    } catch (error) {
        // If there is an error, log it and return a failure response
        console.error("❌ Error processing news:", error);

        return NextResponse.json(
            { message: "Failed to process news.", error },
            { status: 500 }
        );
    }
}