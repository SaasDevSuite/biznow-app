import { NextResponse } from 'next/server';
import { scrapeAndStoreNews } from '@/service/scraper';

export async function GET() {
    await scrapeAndStoreNews();
    return NextResponse.json({ message: 'Scraping completed and saved to JSON file' });
}
