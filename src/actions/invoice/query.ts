'use server'
import {prisma} from "@/prisma";

export const getInvoiceById = async (id: string) => {
    return prisma.invoice.findUnique({
        where: {
            id: id
        }
    })
};

export const getAllInvoices = async (
    page: number,
    pageSize: number,
    search: string
) => {
    const invoices = await prisma.invoice.findMany({
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

    const totalInvoices = await prisma.invoice.count({
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

    const totalPages = Math.ceil(totalInvoices / pageSize);

    return {invoices, totalPages};
}