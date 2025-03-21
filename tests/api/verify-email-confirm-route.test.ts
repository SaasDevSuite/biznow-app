// tests/email-verification.test.ts
import {describe, it, expect, vi, beforeEach} from "vitest";
import {POST} from "@/app/api/auth/verify-email/confirm/route"; // adjust the path as needed
import {prisma} from "@/prisma";

// --- MOCKS ---
// Mock the Prisma client methods used in the API route.
vi.mock("@/prisma", () => ({
    prisma: {
        verificationToken: {
            findFirst: vi.fn(),
            deleteMany: vi.fn(),
        },
        user: {
            update: vi.fn(),
        },
    },
}));

describe("POST /api/verify-email", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 for invalid input", async () => {
        // Sending data that doesn't match the schema.
        const invalidData = {wrongField: "value"};
        const req = new Request("http://localhost/api/verify-email", {
            method: "POST",
            body: JSON.stringify(invalidData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid data");
    });

    it("should return 400 if token is not found", async () => {
        const validData = {token: "nonexistenttoken"};

        // Simulate no record found in the database.
        (prisma.verificationToken.findFirst as any).mockResolvedValue(null);

        const req = new Request("http://localhost/api/verify-email", {
            method: "POST",
            body: JSON.stringify(validData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid or expired token");
    });

    it("should return 400 if token has expired", async () => {
        const validData = {token: "expiredtoken"};

        // Create an expired verification record.
        const expiredRecord = {
            token: "expiredtoken",
            identifier: "user123",
            expires: new Date(Date.now() - 1000), // expired 1 second ago
        };

        (prisma.verificationToken.findFirst as any).mockResolvedValue(expiredRecord);
        (prisma.verificationToken.deleteMany as any).mockResolvedValue({});

        const req = new Request("http://localhost/api/verify-email", {
            method: "POST",
            body: JSON.stringify(validData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Token has expired");
        // Ensure that the cleanup for expired token is called.
        expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
            where: {token: validData.token},
        });
    });

    it("should verify email successfully with a valid token", async () => {
        const validData = {token: "validtoken"};

        // Create a valid verification record.
        const validRecord = {
            token: "validtoken",
            identifier: "user123",
            expires: new Date(Date.now() + 10000), // expires 10 seconds in the future
        };

        (prisma.verificationToken.findFirst as any).mockResolvedValue(validRecord);
        (prisma.user.update as any).mockResolvedValue({
            username: validRecord.identifier,
            emailVerified: new Date(),
        });
        (prisma.verificationToken.deleteMany as any).mockResolvedValue({});

        const req = new Request("http://localhost/api/verify-email", {
            method: "POST",
            body: JSON.stringify(validData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe("Email verified successfully");

        // Verify that the user's emailVerified field was updated.
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: {username: validRecord.identifier},
            data: {emailVerified: expect.any(Date)},
        });
        // Verify that the token was deleted to prevent reuse.
        expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
            where: {token: validData.token},
        });
    });
});
