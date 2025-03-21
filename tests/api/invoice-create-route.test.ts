import {describe, it, expect, vi, beforeEach} from "vitest";
import {POST} from "@/app/api/invoice/create/route"; // Adjust the path if needed
import {getPlan} from "@/actions/plan/query";
import {createSubscriptionAction, createInvoiceAction} from "@/actions/subscription/operations";

// Create typed mocks
// @ts-ignore
const mockedGetPlan = getPlan as unknown as vi.Mock;
// @ts-ignore
const mockedCreateSubscriptionAction = createSubscriptionAction as unknown as vi.Mock;
// @ts-ignore
const mockedCreateInvoiceAction = createInvoiceAction as unknown as vi.Mock;

// Mock the external modules
vi.mock("@/actions/plan/query", () => ({
    getPlan: vi.fn(),
}));

vi.mock("@/actions/subscription/operations", () => ({
    createSubscriptionAction: vi.fn(),
    createInvoiceAction: vi.fn(),
}));

describe("POST /subscription/invoice route", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return 400 if userId or planId is missing", async () => {
        // Missing userId
        const request = new Request("http://localhost", {
            method: "POST",
            body: JSON.stringify({
                planId: "plan-123",
                paymentMethod: "card",
            }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toEqual({error: "Missing userId or planId"});
    });

    it("should return 404 if plan not found", async () => {
        // Valid payload but getPlan returns null
        const request = new Request("http://localhost", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-123",
                planId: "plan-123",
                paymentMethod: "card",
            }),
        });
        mockedGetPlan.mockResolvedValue(null);

        const response = await POST(request);
        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data).toEqual({error: "Plan not found"});
    });

    it("should return invoice on successful creation", async () => {
        const plan = {id: "plan-123", price: 50};
        const subscription = {id: "sub-123"};
        const invoice = {id: "inv-123", amount: 50};

        const request = new Request("http://localhost", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-123",
                planId: "plan-123",
                paymentMethod: "card",
            }),
        });

        mockedGetPlan.mockResolvedValue(plan);
        mockedCreateSubscriptionAction.mockResolvedValue(subscription);
        mockedCreateInvoiceAction.mockResolvedValue(invoice);

        const response = await POST(request);
        // When not specified, NextResponse.json defaults to a 200 status code.
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(invoice);
    });

    it("should return 500 if an error occurs", async () => {
        // Simulate an error thrown by getPlan (or any other dependency)
        const request = new Request("http://localhost", {
            method: "POST",
            body: JSON.stringify({
                userId: "user-123",
                planId: "plan-123",
                paymentMethod: "card",
            }),
        });
        mockedGetPlan.mockRejectedValue(new Error("Test error"));

        const response = await POST(request);
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({error: "Internal Server Error"});
    });
});
