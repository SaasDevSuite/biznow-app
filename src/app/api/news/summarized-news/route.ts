import { prisma } from "@/prisma";

export async function GET() {
    try {
        const summarizedNews = await prisma.summarizedNews.findMany();
        return new Response(JSON.stringify(summarizedNews), { status: 200 });
    } catch (error) {
        return new Response("Failed to fetch summarized news.", { status: 500 });
    }
}
