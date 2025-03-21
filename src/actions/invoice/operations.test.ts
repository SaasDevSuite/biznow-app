import {describe, it, expect, vi, beforeEach} from "vitest";
import {createSubscriptionAction, createInvoiceAction} from "@/actions/subscription/operations";
import {prisma} from "@/prisma";

// Mock the prisma module so that the actual database is not hit.
vi.mock("@/prisma", () => ({
    prisma: {
        subscription: {
            create: vi.fn(),
            findFirst: vi.fn(),
        },
        invoice: {
            create: vi.fn(),
            findFirst: vi.fn(),
        },
    },
}));

describe("Subscription Operations with mocked Prisma", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("createSubscriptionAction", () => {
        it("should create a subscription when valid userId and planId are provided", async () => {
            const userId = "user-123";
            const planId = "plan-123";
            const mockSubscription = {id: "sub-123", userId, planId};

            // Simulate successful creation by Prisma
            (prisma.subscription.create as any).mockResolvedValue(mockSubscription);

            const subscription = await createSubscriptionAction({userId, planId});
            expect(subscription).toEqual(mockSubscription);

            // Use objectContaining to check for at least userId and planId within data
            expect(prisma.subscription.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({userId, planId}),
                })
            );
        });

        describe("createInvoiceAction", () => {
            it("should create an invoice when valid parameters are provided", async () => {
                const input = {
                    userId: "user-123",
                    subscriptionId: "sub-123",
                    amount: 200,
                    paymentMethod: "card",
                };
                const mockInvoice = {id: "inv-123", ...input};

                // Simulate successful creation by Prisma
                (prisma.invoice.create as any).mockResolvedValue(mockInvoice);

                const invoice = await createInvoiceAction(input);
                expect(invoice).toEqual(mockInvoice);
                expect(prisma.invoice.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        userId: input.userId,
                        subscriptionId: input.subscriptionId,
                        amount: input.amount,
                        paymentMethod: input.paymentMethod,
                        date: expect.any(Date),
                    }),
                });
            });

            it("should throw an error if required invoice parameters are missing", async () => {
                const inputMissingSubscriptionId = {
                    userId: "user-123",
                    subscriptionId: "",
                    amount: 200,
                    paymentMethod: "card",
                };

                // We expect the function to throw if a required parameter is missing.
                await expect(createInvoiceAction(inputMissingSubscriptionId)).rejects.toThrow();
            });
        });
    });
});