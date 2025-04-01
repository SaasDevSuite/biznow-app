import { prisma } from "@/prisma"; // Ensure correct import

export async function GET(): Promise<Response> {
    try {
        const summarizedNews = await prisma.summarizedNews.findMany();
        return new Response(JSON.stringify(summarizedNews), { status: 200 });
    } catch (error) {
        return new Response(`Failed to fetch summarized news.${error}`, { status: 500 });
    }
}
