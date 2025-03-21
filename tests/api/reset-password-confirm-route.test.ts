// tests/password-reset.test.ts
import {describe, it, expect, vi, beforeEach} from "vitest";
import {POST} from "@/app/api/auth/reset-password/confirm/route"; // adjust path as needed
import {prisma} from "@/prisma";
import bcrypt from "bcryptjs";

// --- MOCKS ---

// Mock prisma methods
vi.mock("@/prisma", () => ({
    prisma: {
        passwordResetToken: {
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
        user: {
            update: vi.fn(),
        },
    },
}));

// Mock bcrypt.hash to return a predictable hashed password.
vi.spyOn(bcrypt, "hash").mockResolvedValue("hashedNewPassword" as any);


describe("POST /api/password-reset", () => {
    // Reset mocks before each test
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 for invalid input", async () => {
        const invalidData = {
            token: "sometoken",
            newPassword: "short", // less than 8 characters
        };

        const req = new Request("http://localhost/api/password-reset", {
            method: "POST",
            body: JSON.stringify(invalidData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid data");
    });

    it("should return 400 if token is not found", async () => {
        const validData = {
            token: "nonexistenttoken",
            newPassword: "validpassword",
        };

        // Simulate no token record found in the database
        (prisma.passwordResetToken.findUnique as any).mockResolvedValue(null);

        const req = new Request("http://localhost/api/password-reset", {
            method: "POST",
            body: JSON.stringify(validData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid or expired token");
    });

    it("should return 400 if token has expired", async () => {
        const validData = {
            token: "expiredtoken",
            newPassword: "validpassword",
        };

        // Create an expired token record
        const expiredTokenRecord = {
            token: "expiredtoken",
            userId: 1,
            expires: new Date(Date.now() - 1000), // expired 1 second ago
        };

        (prisma.passwordResetToken.findUnique as any).mockResolvedValue(expiredTokenRecord);
        (prisma.passwordResetToken.delete as any).mockResolvedValue({});

        const req = new Request("http://localhost/api/password-reset", {
            method: "POST",
            body: JSON.stringify(validData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Token has expired");
        // Ensure the expired token was deleted
        expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
            where: {token: validData.token},
        });
    });

    it("should reset the password successfully with a valid token", async () => {
        const validData = {
            token: "validtoken",
            newPassword: "validpassword",
        };

        // Create a valid token record (expires in the future)
        const validTokenRecord = {
            token: "validtoken",
            userId: 42,
            expires: new Date(Date.now() + 10000), // expires 10 seconds in the future
        };

        (prisma.passwordResetToken.findUnique as any).mockResolvedValue(validTokenRecord);
        (prisma.user.update as any).mockResolvedValue({id: 42, password: "hashedNewPassword"});
        (prisma.passwordResetToken.delete as any).mockResolvedValue({});

        const req = new Request("http://localhost/api/password-reset", {
            method: "POST",
            body: JSON.stringify(validData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe("Password reset successful");

        // Verify that bcrypt.hash was called with the new password
        expect(bcrypt.hash).toHaveBeenCalledWith(validData.newPassword, 10);

        // Verify that user's password was updated in the database
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: {id: validTokenRecord.userId},
            data: {password: "hashedNewPassword"},
        });

        // Verify that the token was deleted after use
        expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
            where: {token: validData.token},
        });
    });
});