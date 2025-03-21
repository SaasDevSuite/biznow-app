import {beforeEach, describe, expect, it, vi} from "vitest";
import {POST} from "@/app/api/subscription/route"; // Adjust the path as needed
import {createSubscriptionAction} from "@/actions/subscription/operations";

// Create a typed mock for createSubscriptionAction
// @ts-ignore
const mockedCreateSubscriptionAction = createSubscriptionAction as unknown as vi.Mock;

// Mock the external module
vi.mock("@/actions/subscription/operations", () => ({
    createSubscriptionAction: vi.fn(),
}));

describe("POST /subscription", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return subscription data when createSubscriptionAction resolves", async () => {
        const subscriptionData = { id: "sub-1", userId: "user-1", planId: "plan-1" };
        mockedCreateSubscriptionAction.mockResolvedValue(subscriptionData);

        const request = new Request("http://localhost", {
            method: "POST",
            body: JSON.stringify({ userId: "user-1", planId: "plan-1" }),
        });

        const response = await POST(request);
        // Response created with new Response() defaults to status 200.
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toEqual(subscriptionData);
    });

    it("should throw an error when createSubscriptionAction rejects", async () => {
        mockedCreateSubscriptionAction.mockRejectedValue(new Error("Error creating subscription"));

        const request = new Request("http://localhost", {
            method: "POST",
            body: JSON.stringify({ userId: "user-1", planId: "plan-1" }),
        });

        // Since POST does not catch errors, we expect the promise to reject.
        await expect(POST(request)).rejects.toThrow("Error creating subscription");
    });
});
