import { NextResponse } from 'next/server';
import { storeLLMCategoriesInDb} from "@/service/keyword-finder";

export async function GET() {
    await storeLLMCategoriesInDb();
    return NextResponse.json({ message: 'Scraping completed and saved to JSON file' });
}
