// tests/password-reset-request.test.ts
import {describe, it, expect, vi, beforeEach} from "vitest";
import {POST} from "@/app/api/auth/reset-password/route"; // adjust the path to where your endpoint is located
import {prisma} from "@/prisma";
import crypto from "crypto";

// --- MOCKS ---

// Mock prisma methods
vi.mock("@/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
        passwordResetToken: {
            create: vi.fn(),
        },
    },
}));

// Spy on crypto.randomBytes to return a predictable buffer
vi.spyOn(crypto, "randomBytes").mockImplementation((size: number) => {
    // Return a buffer of the requested size filled with the letter "a" (0x61)
    return Buffer.alloc(size, "a");
});

describe("POST /api/reset-password-request", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 for invalid email", async () => {
        const invalidData = {
            email: "not-an-email",
        };

        const req = new Request("http://localhost/api/reset-password-request", {
            method: "POST",
            body: JSON.stringify(invalidData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid email");
    });

    it("should return a success message even if the user is not found", async () => {
        const validData = {
            email: "usernotfound@example.com",
        };

        // Simulate no user found by Prisma
        (prisma.user.findUnique as any).mockResolvedValue(null);

        const req = new Request("http://localhost/api/reset-password-request", {
            method: "POST",
            body: JSON.stringify(validData),
        });

        const response = await POST(req);
        const data = await response.json();

        // Should always return the same message to avoid revealing if a user exists.
        expect(response.status).toBe(200);
        expect(data.message).toContain("If an account exists with that email");
        // Ensure no token was created
        expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it("should create a reset token when a user is found", async () => {
        const validData = {
            email: "userfound@example.com",
        };

        // Simulate a found user
        const fakeUser = {id: 42, email: validData.email};
        (prisma.user.findUnique as any).mockResolvedValue(fakeUser);

        // Simulate token creation
        (prisma.passwordResetToken.create as any).mockResolvedValue({token: "dummy"});

        const req = new Request("http://localhost/api/reset-password-request", {
            method: "POST",
            body: JSON.stringify(validData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toContain("If an account exists with that email");

        // Verify that a token was generated and saved in the database
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: {email: validData.email},
        });
        expect(prisma.passwordResetToken.create).toHaveBeenCalled();

        // Optionally, check the token value. Since crypto.randomBytes returns a buffer filled with "a",
        // its hex representation should be a string of "61" repeated.
        const expectedToken = Buffer.alloc(32, "a").toString("hex");
        const createCallArg = (prisma.passwordResetToken.create as any).mock.calls[0][0];
        expect(createCallArg.data.token).toBe(expectedToken);

        // Check that an expiration date is set (roughly 1 hour in the future)
        const expires = new Date(createCallArg.data.expires);
        expect(expires.getTime()).toBeGreaterThan(Date.now());
    });
});
