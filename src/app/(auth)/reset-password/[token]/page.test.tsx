import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordConfirmPage from "./page"; // Update this path as needed
import {toast} from "sonner";

const pushMock = vi.fn();
const fakeToken = "fake-token";

// Mock next/navigation to provide useRouter and useParams
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
    useParams: () => ({
        token: fakeToken,
    }),
}));

// Mock toast from sonner
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("ResetPasswordConfirmPage", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {
        });
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders the reset password confirm page correctly", () => {
        render(<ResetPasswordConfirmPage/>);

        // Check for title and description text
        expect(screen.getByRole("heading", {
            name: /reset password/i
        })).toBeInTheDocument();
        expect(screen.getByText(/enter your new password/i)).toBeInTheDocument();

        // Check for input fields
        expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

        // Check for submit button
        expect(
            screen.getByRole("button", {name: /reset password/i})
        ).toBeInTheDocument();

        // Check for sign in link
        expect(screen.getByText(/sign in/i)).toHaveAttribute("href", "/sign-in");
    });

    it("shows validation errors when form is submitted with empty fields", async () => {
        const user = userEvent.setup();
        render(<ResetPasswordConfirmPage/>);

        const submitButton = screen.getByRole("button", {name: /reset password/i});
        await user.click(submitButton);

        await waitFor(() => {
            // Expect both fields to display the min length error
            expect(
                screen.getAllByText(/password must be at least 8 characters/i).length
            ).toBeGreaterThanOrEqual(2);
        });
    });

    it("shows password mismatch error when passwords do not match", async () => {
        const user = userEvent.setup();
        render(<ResetPasswordConfirmPage/>);

        const newPasswordInput = screen.getByLabelText(/new password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        await user.type(newPasswordInput, "password123");
        await user.type(confirmPasswordInput, "differentPassword");

        const submitButton = screen.getByRole("button", {name: /reset password/i});
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
    });

    it("calls API, shows success toast, and redirects on successful reset", async () => {
        const user = userEvent.setup();
        // Mock fetch to resolve with a successful response
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        render(<ResetPasswordConfirmPage/>);

        const newPasswordInput = screen.getByLabelText(/new password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        await user.type(newPasswordInput, "password123");
        await user.type(confirmPasswordInput, "password123");

        const submitButton = screen.getByRole("button", {name: /reset password/i});
        await user.click(submitButton);

        // Verify that fetch was called with the correct parameters
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "/api/auth/reset-password/confirm",
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({token: fakeToken, newPassword: "password123"}),
                }
            );
        });

        await waitFor(() => {
            expect((toast.success as any)).toHaveBeenCalledWith(
                "Password reset successful, please sign in"
            );
            expect(pushMock).toHaveBeenCalledWith("/sign-in");
        });
    });

    it("shows error toast when API returns an error", async () => {
        const user = userEvent.setup();
        // Mock fetch to return a non-ok response with an error message
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({error: "Reset failed"}),
        });

        render(<ResetPasswordConfirmPage/>);

        const newPasswordInput = screen.getByLabelText(/new password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        await user.type(newPasswordInput, "password123");
        await user.type(confirmPasswordInput, "password123");

        const submitButton = screen.getByRole("button", {name: /reset password/i});
        await user.click(submitButton);

        await waitFor(() => {
            expect((toast.error as any)).toHaveBeenCalledWith("Reset failed");
        });
    });

    it("shows error toast when an exception occurs", async () => {
        const user = userEvent.setup();
        // Simulate a network error
        (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

        render(<ResetPasswordConfirmPage/>);

        const newPasswordInput = screen.getByLabelText(/new password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        await user.type(newPasswordInput, "password123");
        await user.type(confirmPasswordInput, "password123");

        const submitButton = screen.getByRole("button", {name: /reset password/i});
        await user.click(submitButton);

        await waitFor(() => {
            expect((toast.error as any)).toHaveBeenCalledWith("Please try again later.");
        });
    });

    it("disables the submit button during form submission", async () => {
        const user = userEvent.setup();
        render(<ResetPasswordConfirmPage/>);

        const newPasswordInput = screen.getByLabelText(/new password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

        await user.type(newPasswordInput, "password123");
        await user.type(confirmPasswordInput, "password123");

        // Simulate a delayed fetch so that isLoading remains true
        (global.fetch as any).mockImplementationOnce(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                ok: true,
                                json: async () => ({}),
                            }),
                        1000
                    )
                )
        );

        const submitButton = screen.getByRole("button", {name: /reset password/i});
        await user.click(submitButton);

        // Immediately check that the button is disabled
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });

        // Wait for the submission to complete (router.push is called)
        await waitFor(() => {
            expect(pushMock).toHaveBeenCalled();
        });
    });
});
