import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSubscriptionAction, createInvoiceAction, toggleSubscriptionStatus } from "./operations"; // Adjust the path as needed
import { prisma } from "@/prisma";
import { InvoiceStatus, SubscriptionStatus } from "@prisma/client";

// Mock the prisma module so no actual database calls are made.
vi.mock("@/prisma", () => ({
    prisma: {
        subscription: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        invoice: {
            findFirst: vi.fn(),
            update: vi.fn(),
            create: vi.fn(),
        },
    },
}));

describe("Subscription and Invoice Operations", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("createSubscriptionAction", () => {
        it("should throw an error if missing userId or planId", async () => {
            await expect(createSubscriptionAction({ userId: "", planId: "plan-1" })).rejects.toThrow("Missing userId or planId");
            await expect(createSubscriptionAction({ userId: "user-1", planId: "" })).rejects.toThrow("Missing userId or planId");
        });

        it("should return an existing subscription if found", async () => {
            const existingSubscription = { id: "sub-1", userId: "user-1", planId: "plan-1", status: SubscriptionStatus.PENDING };
            (prisma.subscription.findFirst as any).mockResolvedValue(existingSubscription);

            const result = await createSubscriptionAction({ userId: "user-1", planId: "plan-1" });
            expect(result).toEqual(existingSubscription);
            expect(prisma.subscription.create).not.toHaveBeenCalled();
        });

        it("should create a new subscription if none exists", async () => {
            (prisma.subscription.findFirst as any).mockResolvedValue(null);
            const newSubscription = { id: "sub-2", userId: "user-2", planId: "plan-2" };
            (prisma.subscription.create as any).mockResolvedValue(newSubscription);

            const result = await createSubscriptionAction({ userId: "user-2", planId: "plan-2" });
            expect(result).toEqual(newSubscription);
            expect(prisma.subscription.create).toHaveBeenCalledWith({ data: { userId: "user-2", planId: "plan-2" } });
        });
    });

    describe("createInvoiceAction", () => {
        it("should throw an error if any required field is missing", async () => {
            await expect(
                createInvoiceAction({ userId: "", subscriptionId: "sub-1", amount: 100, paymentMethod: "card" })
            ).rejects.toThrow("Missing userId, subscriptionId, amount, or paymentMethod");

            await expect(
                createInvoiceAction({ userId: "user-1", subscriptionId: "", amount: 100, paymentMethod: "card" })
            ).rejects.toThrow("Missing userId, subscriptionId, amount, or paymentMethod");

            // Assuming zero is invalid for amount:
            await expect(
                createInvoiceAction({ userId: "user-1", subscriptionId: "sub-1", amount: 0, paymentMethod: "card" })
            ).rejects.toThrow("Missing userId, subscriptionId, amount, or paymentMethod");

            await expect(
                createInvoiceAction({ userId: "user-1", subscriptionId: "sub-1", amount: 100, paymentMethod: "" })
            ).rejects.toThrow("Missing userId, subscriptionId, amount, or paymentMethod");
        });

        it("should update an existing invoice if found", async () => {
            const existingInvoice = { id: "inv-1", userId: "user-1", subscriptionId: "sub-1", status: InvoiceStatus.PENDING, amount: 50, paymentMethod: "old" };
            (prisma.invoice.findFirst as any).mockResolvedValue(existingInvoice);

            const updatedInvoice = { id: "inv-1", userId: "user-1", subscriptionId: "sub-1", status: InvoiceStatus.PENDING, amount: 100, paymentMethod: "card" };
            (prisma.invoice.update as any).mockResolvedValue(updatedInvoice);

            const result = await createInvoiceAction({ userId: "user-1", subscriptionId: "sub-1", amount: 100, paymentMethod: "card" });
            expect(result).toEqual(updatedInvoice);
            expect(prisma.invoice.update).toHaveBeenCalledWith({
                where: { id: existingInvoice.id },
                data: { amount: 100, paymentMethod: "card" },
            });
        });

        it("should create a new invoice if none exists", async () => {
            (prisma.invoice.findFirst as any).mockResolvedValue(null);
            const newInvoice = { id: "inv-2", userId: "user-2", subscriptionId: "sub-2", amount: 150, paymentMethod: "card", date: new Date() };
            (prisma.invoice.create as any).mockResolvedValue(newInvoice);

            const result = await createInvoiceAction({ userId: "user-2", subscriptionId: "sub-2", amount: 150, paymentMethod: "card" });
            expect(result).toEqual(newInvoice);
            expect(prisma.invoice.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: "user-2",
                    subscriptionId: "sub-2",
                    amount: 150,
                    paymentMethod: "card",
                    date: expect.any(Date),
                }),
            });
        });
    });

    describe("toggleSubscriptionStatus", () => {
        it("should update the subscription status", async () => {
            const updatedSubscription = { id: "sub-1", userId: "user-1", planId: "plan-1", status: SubscriptionStatus.CANCELED };
            (prisma.subscription.update as any).mockResolvedValue(updatedSubscription);

            const result = await toggleSubscriptionStatus("sub-1", SubscriptionStatus.CANCELED);
            expect(result).toEqual(updatedSubscription);
            expect(prisma.subscription.update).toHaveBeenCalledWith({
                where: { id: "sub-1" },
                data: { status: SubscriptionStatus.CANCELED },
            });
        });
    });
});
