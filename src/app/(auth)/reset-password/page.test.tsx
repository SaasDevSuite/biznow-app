import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "./page"; // Update this path as needed
import { toast } from "sonner";

// Mock toast from sonner
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("ResetPasswordPage", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {
        });
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders the reset password page correctly", () => {
        render(<ResetPasswordPage />);

        // Check title and description
        expect(screen.getByText(/reset password/i)).toBeInTheDocument();
        expect(
            screen.getByText(/enter your email address and we'll send you a link to reset your password/i)
        ).toBeInTheDocument();

        // Check email input field and submit button
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();

        // Check for the sign in link in the footer
        expect(screen.getByText(/sign in/i)).toHaveAttribute("href", "/sign-in");
    });

    it("shows validation error when submitted with an empty email", async () => {
        const user = userEvent.setup();
        render(<ResetPasswordPage />);

        const submitButton = screen.getByRole("button", { name: /send reset link/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        });
    });

    it("calls the resetPassword API and shows success message on successful submission", async () => {
        const user = userEvent.setup();
        // Mock fetch to resolve successfully
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        render(<ResetPasswordPage />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, "john@example.com");

        const submitButton = screen.getByRole("button", { name: /send reset link/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "john@example.com" }),
            });
        });

        await waitFor(() => {
            expect((toast.success as any)).toHaveBeenCalledWith(
                "If an account exists with that email, we've sent a password reset link."
            );
        });

        // Use findByText to wait for the success message element to appear
        const returnLink = await screen.findByText(/return to sign in/i);
        expect(returnLink).toBeInTheDocument();
    });

    it("shows error toast when API returns an error", async () => {
        const user = userEvent.setup();
        // Mock fetch to return a failed response with an error message.
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: "Reset email failed" }),
        });

        render(<ResetPasswordPage />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, "john@example.com");

        const submitButton = screen.getByRole("button", { name: /send reset link/i });
        await user.click(submitButton);

        await waitFor(() => {
            // In the catch block, toast.error is always called with "Please try again later."
            expect((toast.error as any)).toHaveBeenCalledWith("Please try again later.");
        });
    });

    it("shows error toast when an exception occurs", async () => {
        const user = userEvent.setup();
        // Simulate a network error.
        (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

        render(<ResetPasswordPage />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, "john@example.com");

        const submitButton = screen.getByRole("button", { name: /send reset link/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect((toast.error as any)).toHaveBeenCalledWith("Please try again later.");
        });
    });

    it("disables the submit button during form submission", async () => {
        const user = userEvent.setup();
        render(<ResetPasswordPage />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, "john@example.com");

        // Simulate a delayed fetch so that isLoading remains true for a while.
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

        const submitButton = screen.getByRole("button", { name: /send reset link/i });
        await user.click(submitButton);

        // Immediately verify that the button is disabled.
        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        });

        // Instead of checking that the button is enabled, check that the success message appears.
        await waitFor(() => {
            expect(screen.getByText(/check your email for a link to reset your password/i)).toBeInTheDocument();
        });

    });
});
