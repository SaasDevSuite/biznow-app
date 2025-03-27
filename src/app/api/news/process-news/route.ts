import { NextResponse } from "next/server";
import { processNews } from "@/service/news/newsProcessor";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ error: "Invalid request. Expected an array of news items." }, { status: 400 });
        }

        // Process all news articles in parallel
        await Promise.all(body.map(async (newsItem) => {
            const { title, content, date, url } = newsItem;
            if (title && content && date && url) {
                await processNews({ title, content, date: new Date(date), url });
            }
        }));

        return NextResponse.json({ message: "News list processed successfully" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error processing news list:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
