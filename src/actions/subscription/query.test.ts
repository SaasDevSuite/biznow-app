import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllSubscriptions } from "./query"; // Adjust the path as needed
import { prisma } from "@/prisma";

// Mock the Prisma client so no real database calls are made.
vi.mock("@/prisma", () => ({
    prisma: {
        subscription: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}));

describe("getAllSubscriptions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return subscriptions and totalPages when isExceptStatus is false (default)", async () => {
        const page = 2;
        const pageSize = 5;
        const search = "john";
        const status = "ACTIVE";
        const isExceptStatus = false; // default behavior

        const mockSubscriptions = [
            { id: "sub-1", user: { username: "john_doe" } },
            { id: "sub-2", user: { username: "john_smith" } },
        ];
        const mockCount = 12;

        (prisma.subscription.findMany as any).mockResolvedValue(mockSubscriptions);
        (prisma.subscription.count as any).mockResolvedValue(mockCount);

        const result = await getAllSubscriptions(page, pageSize, search, status, isExceptStatus);

        expect(result).toEqual({
            subscriptions: mockSubscriptions,
            totalPages: Math.ceil(mockCount / pageSize),
        });

        expect(prisma.subscription.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    OR: [
                        { user: { username: { contains: search } } },
                        { user: { username: { contains: search } } },
                    ],
                    status: { in: [status] },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: { user: true },
                orderBy: { createdAt: "desc" },
            })
        );

        expect(prisma.subscription.count).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    OR: [
                        { user: { username: { contains: search } } },
                        { user: { username: { contains: search } } },
                    ],
                },
            })
        );
    });

    it("should return subscriptions and totalPages when isExceptStatus is true", async () => {
        const page = 1;
        const pageSize = 10;
        const search = "doe";
        const status = "INACTIVE";
        const isExceptStatus = true;

        const mockSubscriptions = [
            { id: "sub-3", user: { username: "jane_doe" } },
        ];
        const mockCount = 20;

        (prisma.subscription.findMany as any).mockResolvedValue(mockSubscriptions);
        (prisma.subscription.count as any).mockResolvedValue(mockCount);

        const result = await getAllSubscriptions(page, pageSize, search, status, isExceptStatus);

        expect(result).toEqual({
            subscriptions: mockSubscriptions,
            totalPages: Math.ceil(mockCount / pageSize),
        });

        expect(prisma.subscription.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    OR: [
                        { user: { username: { contains: search } } },
                        { user: { username: { contains: search } } },
                    ],
                    status: { notIn: [status] },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: { user: true },
                orderBy: { createdAt: "desc" },
            })
        );

        expect(prisma.subscription.count).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    OR: [
                        { user: { username: { contains: search } } },
                        { user: { username: { contains: search } } },
                    ],
                },
            })
        );
    });
});