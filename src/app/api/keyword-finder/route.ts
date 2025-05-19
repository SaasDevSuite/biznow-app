import { NextResponse } from 'next/server';
import { storeCategoriesInDb} from "@/service/keyword-finder";

export async function GET() {
    await storeCategoriesInDb();
    return NextResponse.json({ message: 'Scraping completed and saved to JSON file' });
}
