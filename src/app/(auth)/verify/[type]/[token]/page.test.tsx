import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import VerifyEmailPage from "./page"; // Update this path as needed
import { toast } from "sonner";

// Mock the toast functions from sonner.
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock next/navigation's useParams hook to return a fake token.
vi.mock("next/navigation", () => ({
    useParams: () => ({ token: "fake-token" }),
}));

describe("VerifyEmailPage", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("displays loading message initially", () => {
        render(<VerifyEmailPage />);
        expect(screen.getByText(/verifying your email, please wait/i)).toBeInTheDocument();
    });

    it("displays success message when API returns success", async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        render(<VerifyEmailPage />);

        // Wait until loading is done and the success message appears.
        await waitFor(() => {
            expect(screen.getByText(/email verified successfully!/i)).toBeInTheDocument();
        });

        expect(toast.success).toHaveBeenCalledWith("Email verified successfully!");
        // Also, check that the "Go to Sign In" button is rendered.
        expect(screen.getByRole("link", { name: /go to sign in/i })).toBeInTheDocument();

    });

    it("displays error message when API returns an error", async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: "Verification failed" }),
        });

        render(<VerifyEmailPage />);

        await waitFor(() => {
            expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
        });

        expect(toast.error).toHaveBeenCalledWith("Verification failed");
    });

    it("displays error message when API call throws an error", async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

        render(<VerifyEmailPage />);

        await waitFor(() => {
            expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
        });

        expect(toast.error).toHaveBeenCalledWith("An error occurred");
    });
});
