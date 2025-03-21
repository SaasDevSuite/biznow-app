'use server'
import {prisma} from "@/prisma";
import {PlanStatus} from "@prisma/client";

/**
 * Deletes a plan by its ID.
 * @param id - The unique identifier of the plan.
 */
export async function deletePlan(id: string) {
    return prisma.plan.delete({
        where: {id},
    });
}

/**
 * Retrieves a single plan by its ID.
 * @param id - The unique identifier of the plan.
 */
export async function getPlan(id: string) {
    return prisma.plan.findUnique({
        where: {id},
    });
}

/**
 * Retrieves all plans.
 */
export async function getPlans(status: string = "ACTIVE") {
    const getPlanStatus = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return PlanStatus.ACTIVE
            case "INACTIVE":
                return PlanStatus.INACTIVE
            case "CANCELED":
                return PlanStatus.CANCELED
            default:
                return PlanStatus.ACTIVE
        }
    };
    return prisma.plan.findMany(
        {
            where: {
                status: getPlanStatus ? getPlanStatus(status) : PlanStatus.ACTIVE
            }
        }
    );
}
