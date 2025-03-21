import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/plans/select/[planId]/route"; // Adjust the path if needed
import { getPlan } from "@/actions/plan/query";

// Create a typed mock for getPlan
// @ts-ignore
const mockedGetPlan = getPlan as unknown as vi.Mock;

// Mock the external module
vi.mock("@/actions/plan/query", () => ({
    getPlan: vi.fn(),
}));

describe("GET /plan/:planId route", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return 200 and the plan data when getPlan resolves", async () => {
        const planData = { id: "plan-1", name: "Premium Plan" };
        mockedGetPlan.mockResolvedValue(planData);

        const params = Promise.resolve({ planId: "plan-1" });
        const request = new Request("http://localhost");

        const response = await GET(request, { params });
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("application/json");

        const data = await response.json();
        expect(data).toEqual(planData);
    });

    it("should return 500 and an error message when getPlan throws an error", async () => {
        mockedGetPlan.mockRejectedValue(new Error("Some error"));

        const params = Promise.resolve({ planId: "plan-1" });
        const request = new Request("http://localhost");

        const response = await GET(request, { params });
        expect(response.status).toBe(500);
        expect(response.headers.get("Content-Type")).toBe("application/json");

        const data = await response.json();
        expect(data).toEqual({ error: "Failed to fetch plan from ID" });
    });
});
