'use server'

import {prisma} from "@/prisma";

export const toggleUserStatus = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })
    if (!user) {
        return null
    }
    return prisma.user.update({
        where: {
            id: id
        },
        data: {
            isActive: !user.isActive
        }
    })
}