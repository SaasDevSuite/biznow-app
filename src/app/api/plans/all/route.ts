import {getPlans} from "@/actions/plan/query";

export async function GET() {
    try {
        const plans = await getPlans()
        return new Response(JSON.stringify(plans), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({error: "Failed to fetch plans from Stripe"}), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}