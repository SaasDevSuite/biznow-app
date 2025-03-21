import {describe, it, expect, vi, beforeEach} from "vitest";
import {prisma} from "@/prisma";
import {deletePlan, getPlan, getPlans} from "./query"; // Adjust path as needed
import {PlanStatus} from "@prisma/client";

// Mock the Prisma client so that actual DB calls are not made.
vi.mock("@/prisma", () => ({
    prisma: {
        plan: {
            delete: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

describe("Plan Operations", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("deletePlan", () => {
        it("should delete a plan by its id", async () => {
            const planId = "plan-123";
            const mockDeletedPlan = {id: planId, name: "Test Plan"};

            (prisma.plan.delete as any).mockResolvedValue(mockDeletedPlan);

            const result = await deletePlan(planId);
            expect(result).toEqual(mockDeletedPlan);
            expect(prisma.plan.delete).toHaveBeenCalledWith({
                where: {id: planId},
            });
        });
    });

    describe("getPlan", () => {
        it("should return a plan when given a valid id", async () => {
            const planId = "plan-456";
            const mockPlan = {id: planId, name: "Sample Plan"};

            (prisma.plan.findUnique as any).mockResolvedValue(mockPlan);

            const result = await getPlan(planId);
            expect(result).toEqual(mockPlan);
            expect(prisma.plan.findUnique).toHaveBeenCalledWith({
                where: {id: planId},
            });
        });
    });

    describe("getPlans", () => {
        it("should return active plans by default", async () => {
            const mockPlans = [
                {id: "plan-1", status: PlanStatus.ACTIVE, name: "Plan 1"},
                {id: "plan-2", status: PlanStatus.ACTIVE, name: "Plan 2"},
            ];
            (prisma.plan.findMany as any).mockResolvedValue(mockPlans);

            const result = await getPlans(); // Uses default status "ACTIVE"
            expect(result).toEqual(mockPlans);
            expect(prisma.plan.findMany).toHaveBeenCalledWith({
                where: {status: PlanStatus.ACTIVE},
            });
        });

        it("should return inactive plans when status is INACTIVE", async () => {
            const mockPlans = [
                {id: "plan-3", status: PlanStatus.INACTIVE, name: "Plan 3"},
            ];
            (prisma.plan.findMany as any).mockResolvedValue(mockPlans);

            const result = await getPlans("INACTIVE");
            expect(result).toEqual(mockPlans);
            expect(prisma.plan.findMany).toHaveBeenCalledWith({
                where: {status: PlanStatus.INACTIVE},
            });
        });

        it("should return canceled plans when status is CANCELED", async () => {
            const mockPlans = [
                {id: "plan-4", status: PlanStatus.CANCELED, name: "Plan 4"},
            ];
            (prisma.plan.findMany as any).mockResolvedValue(mockPlans);

            const result = await getPlans("CANCELED");
            expect(result).toEqual(mockPlans);
            expect(prisma.plan.findMany).toHaveBeenCalledWith({
                where: {status: PlanStatus.CANCELED},
            });
        });

        it("should default to ACTIVE when an unknown status is provided", async () => {
            const mockPlans = [
                {id: "plan-5", status: PlanStatus.ACTIVE, name: "Plan 5"},
            ];
            (prisma.plan.findMany as any).mockResolvedValue(mockPlans);

            const result = await getPlans("UNKNOWN");
            expect(result).toEqual(mockPlans);
            // When status is unknown, the helper defaults to ACTIVE.
            expect(prisma.plan.findMany).toHaveBeenCalledWith({
                where: {status: PlanStatus.ACTIVE},
            });
        });
    });
});
