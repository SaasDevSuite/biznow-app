import {NextResponse} from "next/server";
import {createInvoiceAction, createSubscriptionAction} from "@/actions/subscription/operations";
import {getPlan} from "@/actions/plan/query";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {userId, planId, paymentMethod} = body;

        if (!userId || !planId) {
            return NextResponse.json({error: "Missing userId or planId"}, {status: 400});
        }

        const plan = await getPlan(planId);
        if (!plan) {
            return NextResponse.json({error: "Plan not found"}, {status: 404});
        }

        const subscription = await createSubscriptionAction({userId, planId});
        const invoice = await createInvoiceAction({
            userId,
            subscriptionId: subscription.id,
            amount: plan.price,
            paymentMethod
        });
        return NextResponse.json(invoice);
    } catch (error) {
        console.error("Error creating invoice", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
