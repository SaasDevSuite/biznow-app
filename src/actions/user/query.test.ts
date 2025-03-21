import {beforeEach, describe, expect, it, vi} from "vitest";
import {getUserAccounts, getUserById, getUsers, getUserSessions} from "./query"; // Adjust the path if needed
import {prisma} from "@/prisma";

// Mock the Prisma client to avoid real database calls
vi.mock("@/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            count: vi.fn(),
            findMany: vi.fn(),
        },
        account: {
            findMany: vi.fn(),
        },
        session: {
            findMany: vi.fn(),
        },
    },
}));

describe("User Operations", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("getUserById", () => {
        it("should return a user when found", async () => {
            const userId = "user-1";
            const mockUser = { id: userId, username: "testUser", email: "test@example.com" };
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);

            const result = await getUserById(userId);
            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
        });
    });

    describe("getUsers", () => {
        it("should return users and totalPages when a search string is provided", async () => {
            const page = 2;
            const pageSize = 10;
            const search = "john";
            const mockUsers = [{ id: "user-1", username: "john_doe" }];
            const mockTotalUsers = 25; // totalPages = Math.ceil(25 / 10) = 3

            (prisma.user.count as any).mockResolvedValue(mockTotalUsers);
            (prisma.user.findMany as any).mockResolvedValue(mockUsers);

            const result = await getUsers(page, pageSize, search);
            expect(result).toEqual({
                users: mockUsers,
                totalPages: Math.ceil(mockTotalUsers / pageSize),
            });

            // Verify the where clause includes OR conditions for the search
            const expectedWhere = {
                OR: [
                    { username: { contains: search } },
                    { email: { contains: search } },
                    { name: { contains: search } },
                ],
            };
            expect(prisma.user.count).toHaveBeenCalledWith({ where: expectedWhere });
            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: expectedWhere,
                skip: (page - 1) * pageSize,
                take: pageSize,
            });
        });

        it("should return users and totalPages when no search string is provided", async () => {
            const page = 1;
            const pageSize = 5;
            const search = "";
            const mockUsers = [{ id: "user-2", username: "alice" }];
            const mockTotalUsers = 5;

            (prisma.user.count as any).mockResolvedValue(mockTotalUsers);
            (prisma.user.findMany as any).mockResolvedValue(mockUsers);

            const result = await getUsers(page, pageSize, search);
            expect(result).toEqual({
                users: mockUsers,
                totalPages: Math.ceil(mockTotalUsers / pageSize),
            });

            // When search is empty, the where clause should be an empty object.
            expect(prisma.user.count).toHaveBeenCalledWith({ where: {} });
            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: {},
                skip: (page - 1) * pageSize,
                take: pageSize,
            });
        });
    });

    describe("getUserAccounts", () => {
        it("should return accounts for a given userId", async () => {
            const userId = "user-1";
            const mockAccounts = [{ id: "acc-1", userId }];
            (prisma.account.findMany as any).mockResolvedValue(mockAccounts);

            const result = await getUserAccounts(userId);
            expect(result).toEqual(mockAccounts);
            expect(prisma.account.findMany).toHaveBeenCalledWith({
                where: { userId },
            });
        });
    });

    describe("getUserSessions", () => {
        it("should return sessions for a given userId", async () => {
            const userId = "user-1";
            const mockSessions = [{ id: "sess-1", userId }];
            (prisma.session.findMany as any).mockResolvedValue(mockSessions);

            const result = await getUserSessions(userId);
            expect(result).toEqual(mockSessions);
            expect(prisma.session.findMany).toHaveBeenCalledWith({
                where: { userId },
            });
        });
    });
});
