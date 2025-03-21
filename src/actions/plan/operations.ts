'use server'

import {prisma} from "@/prisma";
import type {PlanStatus} from "@prisma/client";

/**
 * Creates a new plan.
 * @param data - The plan data including name, description, price, currency, interval, and optional staus.
 */
export async function createPlan(data: {
    name: string;
    description?: string;
    price: number;
    currency: string;
    interval: string;
    status?: PlanStatus;
}) {
    return prisma.plan.create({
        data: {
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency as any,
            interval: data.interval as any,
            status: data.status ?? "ACTIVE", // default to ACTIVE if not provided
        },
    });
}

/**
 * Updates an existing plan by its ID.
 * @param id - The unique identifier of the plan.
 * @param status - The new status for the plan. Possible values: "ACTIVE", "INACTIVE", "CANCELED".
 */
export async function changePlanStatus(id: string, status: PlanStatus) {
    return prisma.plan.update({
        where: {id},
        data: {status},
    })
}
