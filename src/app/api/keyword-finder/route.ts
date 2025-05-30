import { NextResponse } from 'next/server';
import { storeLLMCategoriesInSummarizedNews } from "@/service/keyword-finder";

export async function GET() {
    //await storeLLMCategoriesInDb();
    await storeLLMCategoriesInSummarizedNews();
    return NextResponse.json({ message: 'Main categories updated in SummarizedNews table' });
}
