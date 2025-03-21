// tests/register-api.test.ts
import {beforeEach, describe, expect, it, vi} from "vitest";
import {POST} from "@/app/api/auth/signup/route"; // adjust the import path as needed
import {prisma} from "@/prisma";
import crypto from "crypto";

// --- MOCKS ---
// Mock prisma methods
vi.mock("@/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        account: {
            create: vi.fn(),
        },
        verificationToken: {
            create: vi.fn(),
        },
    },
}));

// Mock bcrypt.hash to always resolve to "hashedpassword"
// vi.spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword");

// Mock crypto.randomBytes to return a fixed token buffer
vi.spyOn(crypto, "randomBytes").mockImplementation(() => {
    return Buffer.from("fixedtoken");
});

describe("POST /api/register", () => {
    // Reset mocks before each test
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 for invalid input (username too short)", async () => {
        const invalidData = {
            username: "ab", // too short
            email: "test@example.com",
            password: "validpassword",
        };

        const req = new Request("http://localhost/api/register", {
            method: "POST",
            body: JSON.stringify(invalidData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBeDefined();
        // Check that the error message mentions the username length issue
        expect(data.error[0].message).toContain("at least 3 characters");
    });

    it("should return 400 if username already exists", async () => {
        const validData = {
            username: "existinguser",
            email: "test@example.com",
            password: "validpassword",
        };

        // Simulate that a user with this username exists
        (prisma.user.findUnique as any).mockResolvedValueOnce({id: 1, username: "existinguser"});

        const req = new Request("http://localhost/api/register", {
            method: "POST",
            body: JSON.stringify(validData),
        });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Username already exists.");
    });

    it("should create a new user successfully when valid data is provided", async () => {
        const validData = {
            username: "newuser",
            email: "newuser@example.com",
            password: "validpassword",
        };

        // Simulate no user found for username and email
        (prisma.user.findUnique as any)
            .mockResolvedValueOnce(null) // for username check
            .mockResolvedValueOnce(null); // for email check

        // Simulate user creation returning a user object with an id
        (prisma.user.create as any).mockResolvedValue({
            id: 123,
            username: validData.username,
            email: validData.email,
            password: "hashedpassword",
        });

        // Simulate account creation
        (prisma.account.create as any).mockResolvedValue({});

        // Simulate verification token creation (if email provided)
        (prisma.verificationToken.create as any).mockResolvedValue({});

        const req = new Request("http://localhost/api/register", {
            method: "POST",
            body: JSON.stringify(validData),
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe("User created successfully");
        expect(data.user).toBeDefined();
        expect(data.user.username).toBe(validData.username);

        // Verify that prisma methods were called as expected:
        expect(prisma.user.findUnique).toHaveBeenCalledTimes(2); // username and email checks
        expect(prisma.user.create).toHaveBeenCalledOnce();
        expect(prisma.account.create).toHaveBeenCalledOnce();
        // Since email was provided, a verification token should be created.
        expect(prisma.verificationToken.create).toHaveBeenCalledOnce();
    });
});
