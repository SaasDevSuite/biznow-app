import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/plans/all/route"; // Adjust the path if needed
import { getPlans } from "@/actions/plan/query";

// Create a typed mock for getPlans
// @ts-ignore
const mockedGetPlans = getPlans as unknown as vi.Mock;

// Mock the external module
vi.mock("@/actions/plan/query", () => ({
    getPlans: vi.fn(),
}));

describe("GET /plans route", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return 200 with plans data", async () => {
        const plansData = [{ id: "plan-1", name: "Basic Plan" }];
        mockedGetPlans.mockResolvedValue(plansData);

        const response = await GET();
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("application/json");

        const data = await response.json();
        expect(data).toEqual(plansData);
    });

    it("should return 500 if getPlans throws an error", async () => {
        mockedGetPlans.mockRejectedValue(new Error("Test error"));

        const response = await GET();
        expect(response.status).toBe(500);
        expect(response.headers.get("Content-Type")).toBe("application/json");

        const data = await response.json();
        expect(data).toEqual({ error: "Failed to fetch plans from Stripe" });
    });
});
