'use server'
import {prisma} from "@/prisma";

export const getAllSubscriptions = async (
    page: number,
    pageSize: number,
    search: string,
    status: string = "ACTIVE",
    isExceptStatus: boolean = false
) => {

    const subscriptions = await prisma.subscription.findMany({
        where: {
            OR: [
                {
                    user: {
                        username: {contains: search}
                    }
                },
                {
                    user: {
                        username: {contains: search}
                    }
                },
            ],
            status: isExceptStatus ? {
                notIn: [status as any]
            } : {
                in: [status as any]
            }
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
            user: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const totalSubscriptions = await prisma.subscription.count({
        where: {
            OR: [
                {
                    user: {
                        username: {contains: search}
                    }
                },
                {
                    user: {
                        username: {contains: search}
                    }
                },
            ],
        }
    });

    const totalPages = Math.ceil(totalSubscriptions / pageSize);

    return {subscriptions, totalPages};
}