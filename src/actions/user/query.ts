'use server'

import {prisma} from "@/prisma";

export const getUserById = async (id: string) => {
    return prisma.user.findUnique({
        where: {
            id: id
        }
    })
}

export const getUsers = async (page: number, pageSize: number, search: string = "") => {
    const whereClause = search
        ? {
            OR: [
                { username: { contains: search } },
                { email: { contains: search } },
                { name: { contains: search } },
            ],
        }
        : {};

    const totalUsers = await prisma.user.count({ where: whereClause });
    const totalPages = Math.ceil(totalUsers / pageSize);

    const users = await prisma.user.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
    });

    return { users, totalPages };
};

export const getUserAccounts = async (userId: string) => {
    return prisma.account.findMany({
        where: {
            userId: userId
        }
    })
}

export const getUserSessions = async (userId: string) => {
    return prisma.session.findMany({
        where: {
            userId: userId
        }
    })
}