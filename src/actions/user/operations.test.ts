import {describe, it, expect, vi, beforeEach} from "vitest";
import {toggleUserStatus} from "./operations"; // Adjust the path if needed
import {prisma} from "@/prisma";

// Mock the prisma module
vi.mock("@/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

describe("toggleUserStatus", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return null if no user is found", async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);

        const result = await toggleUserStatus("user-1");
        expect(result).toBeNull();
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("should toggle an active user to inactive", async () => {
        // Simulate a user with isActive true
        const mockUser = {id: "user-1", isActive: true};
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        // Simulate Prisma returning the updated user with isActive false
        const updatedUser = {id: "user-1", isActive: false};
        (prisma.user.update as any).mockResolvedValue(updatedUser);

        const result = await toggleUserStatus("user-1");
        expect(result).toEqual(updatedUser);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: {id: "user-1"},
            data: {isActive: false},
        });
    });

    it("should toggle an inactive user to active", async () => {
        // Simulate a user with isActive false
        const mockUser = {id: "user-1", isActive: false};
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        // Simulate Prisma returning the updated user with isActive true
        const updatedUser = {id: "user-1", isActive: true};
        (prisma.user.update as any).mockResolvedValue(updatedUser);

        const result = await toggleUserStatus("user-1");
        expect(result).toEqual(updatedUser);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: {id: "user-1"},
            data: {isActive: true},
        });
    });
});
