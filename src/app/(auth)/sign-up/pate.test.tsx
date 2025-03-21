import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "./page"; // Update path if necessary
import {toast} from "sonner";

// Create a push mock for router
const pushMock = vi.fn();

// Mock Next.js useRouter hook
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

// Mock toast methods
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("SignUpPage", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {
        });
        vi.clearAllMocks();
        // Override global.fetch for each test
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders the sign-up form correctly", () => {
        render(<SignUpPage/>);

        // Check for heading and input fields
        expect(
            screen.getByRole("heading", {name: /create an account/i})
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /sign up/i})).toBeInTheDocument();

        // Check for sign in link text
        expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    it("shows validation errors when form is submitted with empty fields", async () => {
        const user = userEvent.setup();
        render(<SignUpPage/>);

        const submitButton = screen.getByRole("button", {name: /sign up/i});
        await user.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText(/username must be at least 3 characters/i)
            ).toBeInTheDocument();
            expect(
                screen.getByText(/password must be at least 8 characters/i)
            ).toBeInTheDocument();
        });

        // Verify that the API was not called
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("calls API with correct credentials when form is submitted", async () => {
        const user = userEvent.setup();

        // Mock successful API response
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        render(<SignUpPage/>);

        // Fill in the form fields
        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(usernameInput, "testuser");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");

        const submitButton = screen.getByRole("button", {name: /sign up/i});
        await user.click(submitButton);

        // Verify fetch is called with correct parameters
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "testuser",
                    email: "test@example.com",
                    password: "password123",
                }),
            });
        });

        // Verify success toast and redirect
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(
                "Account created! Please check your email and verify your account."
            );
            expect(pushMock).toHaveBeenCalledWith("/auth/sign-in");
        });
    });

    it("shows email exists error when API returns email already exists error", async () => {
        const user = userEvent.setup();

        // Mock API response with email error
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({error: "Email already exists."}),
        });

        render(<SignUpPage/>);
        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(usernameInput, "testuser");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");

        const submitButton = screen.getByRole("button", {name: /sign up/i});
        await user.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText(/email already exists/i)
            ).toBeInTheDocument();
        });
    });

    it("shows username exists error when API returns username already exists error", async () => {
        const user = userEvent.setup();

        // Mock API response with username error
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({error: "Username already exists."}),
        });

        render(<SignUpPage/>);
        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(usernameInput, "testuser");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");

        const submitButton = screen.getByRole("button", {name: /sign up/i});
        await user.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText(/username already exists/i)
            ).toBeInTheDocument();
        });
    });

    it("shows generic error toast when API returns a generic error", async () => {
        const user = userEvent.setup();

        // Mock API response with a generic error message
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({error: "Sign up failed"}),
        });

        render(<SignUpPage/>);
        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(usernameInput, "testuser");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");

        const submitButton = screen.getByRole("button", {name: /sign up/i});
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Sign up failed");
        });
    });

    it("shows error toast when an exception occurs", async () => {
        const user = userEvent.setup();

        // Mock fetch to throw an error
        (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

        render(<SignUpPage/>);
        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(usernameInput, "testuser");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");

        const submitButton = screen.getByRole("button", {name: /sign up/i});
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Please try again later.");
        });
    });

    it("disables the submit button during form submission", async () => {
        const user = userEvent.setup();

        // Create a delayed fetch response to simulate a loading state
        (global.fetch as any).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    setTimeout(
                        () =>
                            resolve({
                                ok: true,
                                json: async () => ({}),
                            }),
                        100
                    );
                })
        );

        render(<SignUpPage/>);
        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(usernameInput, "testuser");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");

        const submitButton = screen.getByRole("button", {name: /sign up/i});
        await user.click(submitButton);

        // Immediately check that the button is disabled and shows the loading text
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent("Creating account...");

        // Wait for the fetch call to complete
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });
});
