// UserTable.test.tsx
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, it, expect, vi, beforeEach} from "vitest";
import {UserTable} from "./user-table";

// Import the modules to be mocked
import * as queryModule from "@/actions/user/query";
import * as operationsModule from "@/actions/user/operations";

describe("UserTable", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("renders user data in the table", async () => {
        // Prepare a dummy response for getUsers
        const dummyResponse = {
            users: [
                {
                    id: "1",
                    username: "user1",
                    name: "User One",
                    email: "user1@example.com",
                    isActive: true,
                },
                {
                    id: "2",
                    username: "user2",
                    name: "User Two",
                    email: "user2@example.com",
                    isActive: false,
                },
            ],
            totalPages: 1,
        };

        vi.spyOn(queryModule, "getUsers").mockResolvedValue(dummyResponse as any);

        render(<UserTable/>);

        // Wait for the component to fetch and render user data
        await waitFor(() => {
            expect(screen.getByText("user1")).toBeInTheDocument();
            expect(screen.getByText("User One")).toBeInTheDocument();
            expect(screen.getByText("user1@example.com")).toBeInTheDocument();
            expect(screen.getByText("Active")).toBeInTheDocument();

            expect(screen.getByText("user2")).toBeInTheDocument();
            expect(screen.getByText("User Two")).toBeInTheDocument();
            expect(screen.getByText("user2@example.com")).toBeInTheDocument();
            expect(screen.getByText("Inactive")).toBeInTheDocument();
        });
    });

    it("calls getUsers with the search query when typing", async () => {
        const dummyResponse = {users: [], totalPages: 1};
        const getUsersMock = vi
            .spyOn(queryModule, "getUsers")
            .mockResolvedValue(dummyResponse);

        render(<UserTable/>);

        const searchInput = screen.getByPlaceholderText(/search/i);
        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, "test");

        // Since the search callback is called on every keystroke, expect the function to be called with "t", "te", etc.
        await waitFor(() => {
            expect(getUsersMock).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), "test");
        });
    });

    it("toggles user status and refreshes the table", async () => {
        // Initial response with the user active
        const initialResponse = {
            users: [
                {
                    id: "1",
                    username: "user1",
                    name: "User One",
                    email: "user1@example.com",
                    isActive: true,
                },
            ],
            totalPages: 1,
        };
        // Response after toggling: user becomes inactive
        const toggledResponse = {
            users: [
                {
                    id: "1",
                    username: "user1",
                    name: "User One",
                    email: "user1@example.com",
                    isActive: false,
                },
            ],
            totalPages: 1,
        };

        // Mock getUsers so that it returns the initial response then the toggled response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const getUsersMock = vi
            .spyOn(queryModule, "getUsers")
            .mockResolvedValueOnce(initialResponse as any) // Initial fetch
            .mockResolvedValueOnce(toggledResponse as any); // Fetch after toggle

        const toggleUserStatusMock = vi
            .spyOn(operationsModule, "toggleUserStatus")
            .mockResolvedValue(null);

        render(<UserTable/>);

        // Wait for initial data to be rendered (Active status)
        await waitFor(() => {
            expect(screen.getByText("Active")).toBeInTheDocument();
        });

        // Find the actions dropdown button.
        // Note: GenericTable renders a button with an icon for actions; we find the first button that contains an SVG.
        const actionButtons = screen.getAllByRole("button");
        const dropdownButton = actionButtons.find((btn) =>
            btn.querySelector("svg")
        );
        expect(dropdownButton).toBeDefined();

        // Open the actions dropdown for the first row
        if (dropdownButton) {
            await userEvent.click(dropdownButton);
        }

        // Click on the "Deactivate" action
        const deactivateAction = await screen.findByText("Deactivate");
        await userEvent.click(deactivateAction);

        // Expect the toggleUserStatus function to be called with the correct user id
        expect(toggleUserStatusMock).toHaveBeenCalledWith("1");

        // After the toggle, the component re-fetches the data and should display "Inactive"
        await waitFor(() => {
            expect(screen.getByText("Inactive")).toBeInTheDocument();
        });
    });
});
