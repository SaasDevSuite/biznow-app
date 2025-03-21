'use server'
import {prisma} from "@/prisma";
import {BillingInterval, InvoiceStatus, SubscriptionStatus} from "@prisma/client";

export const markInvoiceAsPaid = async (id: string) => {
    const makeInvoicePayment = await prisma.invoice.update({
        where: {
            id: id
        },
        data: {
            status: InvoiceStatus.PAID
        },
        select: {
            id: true,
            subscription: {
                select: {
                    id: true,
                    plan: true
                }
            }
        }
    })

    console.log(makeInvoicePayment)

    if (!makeInvoicePayment) {
        throw new Error("Failed to mark invoice as paid");
    }

    const plan = await prisma.plan.findUnique({
        where: {
            id: makeInvoicePayment.subscription.plan.id
        }
    })

    if (!plan) {
        throw new Error("Plan not found");
    }

    const startDate = new Date();

    let days = 0;
    switch (plan.interval) {
        case BillingInterval.MONTHLY:
            days = 30;
            break;
        case BillingInterval.QUARTERLY:
            days = 90;
            break;
        case BillingInterval.SEMI_ANNUAL:
            days = 180;
            break;
        case  BillingInterval.YEARLY:
            days = 365;
            break;
        default:
            days = 0;
            break;
    }

    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);


    // Update user subscription status
    await prisma.subscription.update({
        where: {
            id: makeInvoicePayment.subscription.id
        },
        data: {
            status: SubscriptionStatus.ACTIVE,
            startDate: startDate,
            endDate: endDate
        }
    });

    return makeInvoicePayment
};