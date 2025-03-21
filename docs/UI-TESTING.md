# Testing UI Components

## 1. Why Test UI Components?

Testing your UI components helps you:

- **Catch bugs early:** Automated tests ensure that your UI behaves as expected after changes.
- **Improve code quality:** Tests act as living documentation and give you confidence when refactoring.
- **Ensure consistency:** Verifying that user interactions, validations, and API calls work as expected reduces
  regressions.

## 2. Setting Up Your Testing Environment

For testing React UI components, a popular choice is **React Testing Library** combined with a test runner like **Vitest
** (or Jest). This guide uses Vitest.

### Basic Setup

1. **Install dependencies:**

   ```bash
   npm install --save-dev @testing-library/react @testing-library/user-event vitest jsdom
   ```

2. **Configure Vitest:**  
   Create or update a `vitest.config.ts` file to include:
   ```ts
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       environment: 'jsdom',
       globals: true,
     },
   });
   ```

3. **Update your package.json scripts:**
   ```json
   {
     "scripts": {
       "test": "vitest"
     }
   }
   ```

## 3. Basics of Writing Test Cases

### a. Import Testing Tools

- **render:** Renders your component in a simulated DOM.
- **screen:** Provides queries to search for elements.
- **userEvent:** Simulates user actions like clicking and typing.
- **waitFor / findBy:** Wait for asynchronous actions (like API calls or state updates).

### b. Writing a Simple Test

Here’s a minimal example for a component that renders a button:

```tsx
// ButtonComponent.tsx
import React from "react";

export function ButtonComponent({onClick, label}: { onClick: () => void; label: string }) {
    return <button onClick={onClick}>{label}</button>;
}
```

And its test case:

```tsx
// ButtonComponent.test.tsx
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ButtonComponent} from "./ButtonComponent";
import {describe, it, expect, vi} from "vitest";

describe("ButtonComponent", () => {
    it("renders with the correct label and responds to click events", async () => {
        const handleClick = vi.fn();
        render(<ButtonComponent onClick={handleClick} label="Click Me"/>);

        // Check if the button renders with the text "Click Me"
        const button = screen.getByRole("button", {name: /click me/i});
        expect(button).toBeInTheDocument();

        // Simulate a click event
        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
```

### c. Testing Asynchronous Behavior

For components that load data or respond to API calls, use asynchronous utilities like `waitFor` or `findByText`. For
example, if your component shows a loading state before displaying data:

```tsx
// DataComponent.tsx
import React, {useEffect, useState} from "react";

export function DataComponent() {
    const [data, setData] = useState<string | null>(null);

    useEffect(() => {
        setTimeout(() => {
            setData("Data loaded!");
        }, 500);
    }, []);

    if (!data) return <div>Loading...</div>;
    return <div>{data}</div>;
}
```

Test case for asynchronous behavior:

```tsx
// DataComponent.test.tsx
import {render, screen} from "@testing-library/react";
import {DataComponent} from "./DataComponent";
import {describe, it, expect} from "vitest";

describe("DataComponent", () => {
    it("displays loading initially and then shows loaded data", async () => {
        render(<DataComponent/>);
        // Initially, the loading text should be present.
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        // Wait for the data to appear.
        const dataElement = await screen.findByText(/data loaded!/i);
        expect(dataElement).toBeInTheDocument();
    });
});
```

## 4. Testing Components with API Calls

When testing components that call an API, you usually:

- **Mock the API call:** Override `global.fetch` or use libraries like MSW (Mock Service Worker) to simulate API
  responses.
- **Simulate user actions:** For example, filling out forms or clicking buttons.
- **Assert the component’s reaction:** This includes verifying that the correct success or error messages are shown.

### Example: Testing a Password Reset Component

Consider the following password reset component:

```tsx
// ResetPasswordPage.tsx
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";

const ResetPasswordPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const {register, handleSubmit, formState: {errors}} = useForm<{ email: string }>();

    async function onSubmit(values: { email: string }) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                throw new Error("Failed to send reset email");
            }
            toast.success("Reset email sent!");
        } catch (error) {
            toast.error("Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input type="email" placeholder="Email" {...register("email", {required: true})} />
            {errors.email && <span>Please enter a valid email</span>}
            <button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
        </form>
    );
};

export default ResetPasswordPage;
```

Test case for the above component:

```tsx
// ResetPasswordPage.test.tsx
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "./ResetPasswordPage";
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {toast} from "sonner";

// Mock toast functions
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("ResetPasswordPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("submits the form and shows a success toast", async () => {
        // Mock successful API response
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        render(<ResetPasswordPage/>);

        const emailInput = screen.getByPlaceholderText(/email/i);
        const submitButton = screen.getByRole("button", {name: /send reset link/i});

        await userEvent.type(emailInput, "test@example.com");
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith("/api/auth/reset-password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: "test@example.com"}),
            });
        });

        await waitFor(() => {
            expect((toast.success as any)).toHaveBeenCalledWith("Reset email sent!");
        });
    });

    it("shows an error toast when API fails", async () => {
        // Mock API error response
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            json: async () => ({error: "Reset email failed"}),
        });

        render(<ResetPasswordPage/>);

        const emailInput = screen.getByPlaceholderText(/email/i);
        const submitButton = screen.getByRole("button", {name: /send reset link/i});

        await userEvent.type(emailInput, "test@example.com");
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect((toast.error as any)).toHaveBeenCalledWith("Please try again later.");
        });
    });
});
```

## 5. Common Pitfalls and Mistakes

Even when following a guide, developers new to testing often run into some common issues. Here are some pitfalls to
watch out for:

### a. Not Waiting for Asynchronous Updates

- **Mistake:** Immediately querying for elements after a state change or API call.
- **Tip:** Use `waitFor`, `findBy` queries, or proper async/await logic to let the DOM update.
- **Example:**  
  Instead of:
  ```ts
  expect(screen.getByText(/data loaded!/i)).toBeInTheDocument();
  ```
  Use:
  ```ts
  const dataElement = await screen.findByText(/data loaded!/i);
  expect(dataElement).toBeInTheDocument();
  ```

### b. Using Stale Element References

- **Mistake:** Storing a reference to an element before it is updated and then asserting on it.
- **Tip:** Re-query the DOM after state changes to ensure you're interacting with the latest version of an element.
- **Example:**
  ```ts
  await userEvent.click(submitButton);
  // Instead of using the cached submitButton, re-query:
  const newSubmitButton = screen.getByRole("button", { name: /send reset link/i });
  expect(newSubmitButton).not.toBeDisabled();
  ```

### c. Not Cleaning Up Mocks Between Tests

- **Mistake:** Allowing previous tests’ mocks to affect subsequent tests.
- **Tip:** Use `beforeEach` and `afterEach` to clear or reset mocks.
- **Example:**
  ```ts
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });
  ```

### d. Testing Implementation Details Instead of Behavior

- **Mistake:** Writing tests that depend on the internal structure of your component rather than its behavior.
- **Tip:** Focus on what the user sees or can interact with. Test for text content, roles, and user interactions rather
  than the exact implementation (e.g., specific class names or component internals).

### e. Over-Mocking

- **Mistake:** Mocking too many parts of your component or external dependencies can make tests brittle and less
  realistic.
- **Tip:** Only mock what is necessary to isolate your component. For instance, use real DOM queries for UI elements,
  and only mock API calls or external libraries.

## 6. Conclusion

Testing UI components may seem challenging at first, but by following best practices and learning from common pitfalls,
you can build a robust test suite that helps maintain and improve your code quality. Start with simple tests, gradually
add asynchronous and error handling scenarios, and always focus on the user experience.