import {beforeEach, describe, expect, it, vi} from "vitest";
import {GET} from "@/app/api/invoice/[invoiceId]/route"; // adjust the import path as needed
import {auth} from "@/auth";
import {getInvoiceById} from "@/actions/invoice/query";

// Create typed mocks
// @ts-expect-error
const mockedAuth = auth as unknown as vi.Mock;
// @ts-expect-error
const mockedGetInvoiceById = getInvoiceById as unknown as vi.Mock;

// Mock the modules
vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/actions/invoice/query", () => ({
    getInvoiceById: vi.fn(),
}));

describe("GET invoice route", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return 401 if user is not authenticated", async () => {
        // Simulate no session
        mockedAuth.mockResolvedValue(null);
        const request = new Request("http://localhost");
        const params = Promise.resolve({invoiceId: "invoice-123"});

        const response = await GET(request, {params});
        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data).toEqual({error: "Unauthorized"});
    });

    it("should return 200 with invoice data when authenticated", async () => {
        // Simulate an authenticated session and a successful invoice fetch
        const invoiceData = {id: "invoice-123", amount: 100};
        mockedAuth.mockResolvedValue({user: "test"});
        mockedGetInvoiceById.mockResolvedValue(invoiceData);

        const request = new Request("http://localhost");
        const params = Promise.resolve({invoiceId: "invoice-123"});

        const response = await GET(request, {params});
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toEqual(invoiceData);
    });

    it("should return 500 if getInvoiceById throws an error", async () => {
        // Simulate an authenticated session but an error in fetching the invoice
        mockedAuth.mockResolvedValue({user: "test"});
        mockedGetInvoiceById.mockRejectedValue(new Error("Some error"));

        const request = new Request("http://localhost");
        const params = Promise.resolve({invoiceId: "invoice-123"});

        const response = await GET(request, {params});
        expect(response.status).toBe(500);

        const data = await response.json();
        expect(data).toEqual({error: "Failed to fetch invoice from ID"});
    });
});
