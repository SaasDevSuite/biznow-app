"use server"

import {prisma} from "@/prisma"
import {InvoiceStatus, SubscriptionStatus} from "@prisma/client";

// Creates a new subscription for the given user and plan.
// Optionally, you could include additional data (such as billing interval) if needed.
export async function createSubscriptionAction(input: {
    userId: string
    planId: string
}) {
    if (!input.userId || !input.planId) {
        throw new Error("Missing userId or planId");
    }

    const existingSubscription = await prisma.subscription.findFirst({
        where: {
            userId: input.userId,
            planId: input.planId,
            status: {
                in: [
                    SubscriptionStatus.PENDING
                ]
            }
        },
    });
    if (existingSubscription) {
        return existingSubscription
    }
    return prisma.subscription.create({
        data: {
            userId: input.userId,
            planId: input.planId,
        },
    });
}

// Creates an invoice record for a billing event.
// You can extend this to handle additional details (e.g., invoice line items, tax, etc.).
export async function createInvoiceAction(input: {
    userId: string
    subscriptionId: string
    amount: number
    paymentMethod: string
}) {

    if (!input.userId || !input.subscriptionId || !input.amount || !input.paymentMethod) {
        throw new Error("Missing userId, subscriptionId, amount, or paymentMethod");
    }

    const existingInvoice = await prisma.invoice.findFirst({
        where: {
            userId: input.userId,
            subscriptionId: input.subscriptionId,
            status: {
                in: [
                    InvoiceStatus.PENDING
                ]
            }
        },
    });
    if (existingInvoice) {
        return prisma.invoice.update({
            where: {
                id: existingInvoice.id,
            },
            data: {
                amount: input.amount,
                paymentMethod: input.paymentMethod as any,
            },
        });
    }


    return prisma.invoice.create({
        data: {
            userId: input.userId,
            subscriptionId: input.subscriptionId,
            date: new Date(),
            amount: input.amount,
            paymentMethod: input.paymentMethod as any,
        },
    });
}


export const toggleSubscriptionStatus = async (id: string, status: SubscriptionStatus) => {
    return prisma.subscription.update({
        where: {
            id: id
        },
        data: {
            status: status
        }
    })
}