import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/prisma";
import { createPlan, changePlanStatus } from "./operations"; // adjust the path as needed

// Mock the Prisma module
vi.mock("@/prisma", () => ({
    prisma: {
        plan: {
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));

describe("Plan Operations", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("createPlan", () => {
        it("should create a plan with default status ACTIVE when not provided", async () => {
            const planData = {
                name: "Basic Plan",
                description: "A basic plan",
                price: 100,
                currency: "USD",
                interval: "month",
            };

            const mockPlan = { id: "plan-123", ...planData, status: "ACTIVE" };
            (prisma.plan.create as any).mockResolvedValue(mockPlan);

            const result = await createPlan(planData);

            expect(result).toEqual(mockPlan);
            expect(prisma.plan.create).toHaveBeenCalledWith({
                data: {
                    name: planData.name,
                    description: planData.description,
                    price: planData.price,
                    currency: planData.currency,
                    interval: planData.interval,
                    status: "ACTIVE",
                },
            });
        });

        it("should create a plan with provided status", async () => {
            const planData = {
                name: "Premium Plan",
                description: "A premium plan",
                price: 200,
                currency: "USD",
                interval: "year",
                status: "INACTIVE" as const,
            };

            const mockPlan = { id: "plan-456", ...planData };
            (prisma.plan.create as any).mockResolvedValue(mockPlan);

            const result = await createPlan(planData);

            expect(result).toEqual(mockPlan);
            expect(prisma.plan.create).toHaveBeenCalledWith({
                data: {
                    name: planData.name,
                    description: planData.description,
                    price: planData.price,
                    currency: planData.currency,
                    interval: planData.interval,
                    status: planData.status,
                },
            });
        });
    });

    describe("changePlanStatus", () => {
        it("should update the plan status", async () => {
            const planId = "plan-123";
            const newStatus = "CANCELED" as const;
            const mockPlan = {
                id: planId,
                name: "Basic Plan",
                status: newStatus,
            };

            (prisma.plan.update as any).mockResolvedValue(mockPlan);

            const result = await changePlanStatus(planId, newStatus);

            expect(result).toEqual(mockPlan);
            expect(prisma.plan.update).toHaveBeenCalledWith({
                where: { id: planId },
                data: { status: newStatus },
            });
        });
    });
});
