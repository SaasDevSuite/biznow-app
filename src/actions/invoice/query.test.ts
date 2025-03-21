import {describe, it, expect, vi, beforeEach} from "vitest";
import {prisma} from "@/prisma";
import {getInvoiceById, getAllInvoices} from "./query";

// Mock the prisma module so that no real database calls are made
vi.mock("@/prisma", () => ({
    prisma: {
        invoice: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}));

describe("Invoice Operations", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("getInvoiceById", () => {
        it("should return the invoice for a given id", async () => {
            const invoiceId = "invoice-1";
            const mockInvoice = {id: invoiceId, amount: 100};

            (prisma.invoice.findUnique as any).mockResolvedValue(mockInvoice);

            const result = await getInvoiceById(invoiceId);
            expect(result).toEqual(mockInvoice);
            expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
                where: {id: invoiceId},
            });
        });
    });

    describe("getAllInvoices", () => {
        it("should return invoices and total pages", async () => {
            const page = 2;
            const pageSize = 10;
            const search = "john";
            const mockInvoices = [
                {id: "invoice-1", user: {username: "john_doe"}},
                {id: "invoice-2", user: {username: "john_smith"}},
            ];
            const totalInvoicesCount = 15; // totalPages = ceil(15 / 10) = 2

            (prisma.invoice.findMany as any).mockResolvedValue(mockInvoices);
            (prisma.invoice.count as any).mockResolvedValue(totalInvoicesCount);

            const result = await getAllInvoices(page, pageSize, search);

            expect(result).toEqual({
                invoices: mockInvoices,
                totalPages: Math.ceil(totalInvoicesCount / pageSize),
            });
            expect(prisma.invoice.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            {user: {username: {contains: search}}},
                            {user: {username: {contains: search}}},
                        ],
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    include: {user: true},
                    orderBy: {createdAt: "desc"},
                })
            );
            expect(prisma.invoice.count).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            {user: {username: {contains: search}}},
                            {user: {username: {contains: search}}},
                        ],
                    },
                })
            );
        });
    });
});
