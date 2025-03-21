import {createSubscriptionAction} from "@/actions/subscription/operations"

export async function POST(request: Request) {
    const {userId, planId} = await request.json()
    const subscription = await createSubscriptionAction({userId, planId})
    return new Response(JSON.stringify(subscription))
}