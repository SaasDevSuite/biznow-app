import {signInMock, pushMock, toastSuccessMock, toastErrorMock} from "@/mock";
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInPage from "./page"; // Update this path as needed

describe("SignInPage", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders the sign-in form correctly", () => {
        render(<SignInPage/>);

        // Check if important elements are rendered
        expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /sign in/i})).toBeInTheDocument();
        expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
        expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
        expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });

    it("shows validation errors when form is submitted with empty fields", async () => {
        const user = userEvent.setup();
        render(<SignInPage/>);

        // Submit the form without filling any fields
        const submitButton = screen.getByRole("button", {name: /sign in/i});
        await user.click(submitButton);

        // Check if validation errors are displayed
        await waitFor(() => {
            expect(screen.getByText(/username is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });

        // Verify signIn was not called
        expect(signInMock).not.toHaveBeenCalled();
    });

    it("calls signIn with correct credentials when form is submitted", async () => {
        // Mock successful sign-in
        signInMock.mockResolvedValueOnce({error: undefined});

        const user = userEvent.setup();
        render(<SignInPage/>);

        // Fill in the form
        await user.type(screen.getByLabelText(/username/i), "testuser");
        await user.type(screen.getByLabelText(/password/i), "password123");

        // Submit the form
        const submitButton = screen.getByRole("button", {name: /sign in/i});
        await user.click(submitButton);

        // Verify signIn was called with correct arguments
        await waitFor(() => {
            expect(signInMock).toHaveBeenCalledWith("credentials", {
                username: "testuser",
                password: "password123",
                redirect: false,
            });
        });
    });

    it("shows success toast and redirects on successful sign-in", async () => {
        // Mock successful sign-in
        signInMock.mockResolvedValueOnce({error: null});

        const user = userEvent.setup();
        render(<SignInPage/>);

        // Fill in the form
        await user.type(screen.getByLabelText(/username/i), "testuser");
        await user.type(screen.getByLabelText(/password/i), "password123");

        // Submit the form
        const submitButton = screen.getByRole("button", {name: /sign in/i});
        await user.click(submitButton);

        // Verify success toast was shown and redirect happened
        await waitFor(() => {
            expect(toastSuccessMock).toHaveBeenCalledWith("You've successfully signed in!");
            expect(pushMock).toHaveBeenCalledWith("/app");
        });
    });

    it("shows error message when sign-in fails", async () => {
        // Mock failed sign-in
        signInMock.mockResolvedValueOnce({error: "Invalid credentials"});

        const user = userEvent.setup();
        render(<SignInPage/>);

        // Fill in the form
        await user.type(screen.getByLabelText(/username/i), "testuser");
        await user.type(screen.getByLabelText(/password/i), "wrongpassword");

        // Submit the form
        const submitButton = screen.getByRole("button", {name: /sign in/i});
        await user.click(submitButton);

        // Verify error message is displayed
        await waitFor(() => {
            expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
        });

        // Verify no redirect or success toast
        expect(pushMock).not.toHaveBeenCalled();
        expect(toastSuccessMock).not.toHaveBeenCalled();
    });

    it("shows error toast when an exception occurs", async () => {
        // Mock exception during sign-in
        signInMock.mockRejectedValueOnce(new Error("Network error"));

        const user = userEvent.setup();
        render(<SignInPage/>);

        // Fill in the form
        await user.type(screen.getByLabelText(/username/i), "testuser");
        await user.type(screen.getByLabelText(/password/i), "password123");

        // Submit the form
        const submitButton = screen.getByRole("button", {name: /sign in/i});
        await user.click(submitButton);

        // Verify error toast was shown
        await waitFor(() => {
            expect(toastErrorMock).toHaveBeenCalledWith("Please try again later.");
        });
    });

    it("disables the submit button during form submission", async () => {
        // Mock a delayed response to test loading state
        signInMock.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve({error: null}), 100);
                })
        );

        const user = userEvent.setup();
        render(<SignInPage/>);

        // Fill in the form
        await user.type(screen.getByLabelText(/username/i), "testuser");
        await user.type(screen.getByLabelText(/password/i), "password123");

        // Submit the form
        const submitButton = screen.getByRole("button", {name: /sign in/i});
        await user.click(submitButton);

        // Check if button is disabled and shows loading text
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent("Signing in...");

        // Wait for the submission to complete
        await waitFor(() => {
            expect(signInMock).toHaveBeenCalled();
        });
    });

    it("navigates to reset password page when forgot password is clicked", async () => {
        const user = userEvent.setup();
        render(<SignInPage/>);

        // Click on the forgot password link
        const forgotPasswordLink = screen.getByText(/forgot password/i);
        await user.click(forgotPasswordLink);

        // Since we're using a real Link component, we can't directly test navigation,
        // but we can check if the link has the correct href
        expect(forgotPasswordLink.closest("a")).toHaveAttribute("href", "/reset-password");
    });

    it("navigates to sign up page when sign up link is clicked", async () => {
        const user = userEvent.setup();
        render(<SignInPage/>);

        // Click on the sign up link
        const signUpLink = screen.getByText(/sign up/i);
        await user.click(signUpLink);

        // Check if the link has the correct href
        expect(signUpLink.closest("a")).toHaveAttribute("href", "/sign-up");
    });
});
