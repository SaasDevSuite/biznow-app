import {getPlan} from "@/actions/plan/query";

export async function GET(request: Request, {params}: { params: Promise<{ planId: string }> }) {
    try {
        const {planId} = await params
        const plan = await getPlan(planId)
        return new Response(JSON.stringify(plan), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({error: "Failed to fetch plan from ID"}), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}