import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SetPasswordPage from "./page"; // Update path if needed
import { toast } from "sonner";

// Create a push mock for the router
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

// Mock toast from sonner
vi.mock("sonner", () => ({
    toast: vi.fn(),
}));

describe("SetPasswordPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders the set new password form correctly", () => {
        render(<SetPasswordPage />);

        // Check for the title and description text
        expect(screen.getByText(/set new password/i)).toBeInTheDocument();
        expect(
            screen.getByText(/create a new password for your account/i)
        ).toBeInTheDocument();

        // Check for the password and confirm password input fields
        expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

        // Check for the submit button
        expect(
            screen.getByRole("button", { name: /update password/i })
        ).toBeInTheDocument();

        // Check for the sign in link
        expect(screen.getByText(/sign in/i)).toHaveAttribute("href", "/sign-in");
    });

    it("shows validation errors when form is submitted with empty fields", async () => {
        const user = userEvent.setup();
        render(<SetPasswordPage />);

        const submitButton = screen.getByRole("button", {
            name: /update password/i,
        });
        await user.click(submitButton);

        await waitFor(() => {
            // Both password and confirmPassword should display the min length error
            expect(
                screen.getAllByText(/password must be at least 8 characters/i).length
            ).toBeGreaterThanOrEqual(2);
        });
    });

    it("shows password mismatch error when passwords do not match", async () => {
        const user = userEvent.setup();
        render(<SetPasswordPage />);

        const passwordInput = screen.getByLabelText(/new password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        await user.type(passwordInput, "password123");
        await user.type(confirmPasswordInput, "differentPassword");

        const submitButton = screen.getByRole("button", {
            name: /update password/i,
        });
        await user.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText(/passwords do not match/i)
            ).toBeInTheDocument();
        });
    });

    it("calls toast and router.push on successful password update", async () => {
        const user = userEvent.setup();
        render(<SetPasswordPage />);

        const passwordInput = screen.getByLabelText(/new password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        await user.type(passwordInput, "password123");
        await user.type(confirmPasswordInput, "password123");

        const submitButton = screen.getByRole("button", {
            name: /update password/i,
        });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast).toHaveBeenCalledWith(
                "Your password has been successfully updated."
            );
            expect(pushMock).toHaveBeenCalledWith("/sign-in");
        });
    });

    it("shows error toast when an exception occurs", async () => {
        // Force router.push to throw an error
        pushMock.mockImplementationOnce(() => {
            throw new Error("Test error");
        });

        const user = userEvent.setup();
        render(<SetPasswordPage />);

        const passwordInput = screen.getByLabelText(/new password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        await user.type(passwordInput, "password123");
        await user.type(confirmPasswordInput, "password123");

        const submitButton = screen.getByRole("button", {
            name: /update password/i,
        });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast).toHaveBeenCalledWith("Please try again later.");
        });
    });

    it("disables the submit button during form submission", async () => {
        const user = userEvent.setup();
        render(<SetPasswordPage />);

        const passwordInput = screen.getByLabelText(/new password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        await user.type(passwordInput, "password123");
        await user.type(confirmPasswordInput, "password123");

        // Simulate a delay in router.push so that isLoading remains true for a while.
        pushMock.mockImplementationOnce(
            () => new Promise((resolve) => setTimeout(resolve, 1000))
        );

        const submitButton = screen.getByRole("button", {
            name: /update password/i,
        });

        // Click the submit button and immediately check that it's disabled.
        await user.click(submitButton);
        // Use waitFor to allow React to update the state.
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });

        // Optionally, wait for the submission to complete before ending the test.
        await waitFor(() => {
            expect(pushMock).toHaveBeenCalled();
        });
    });
});
