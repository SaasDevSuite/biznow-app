# Testing Next.js API Routes with Vitest

Testing is essential to building reliable applications. It provides confidence that your code behaves as expected, helps
you catch bugs early, and documents your intended behavior for future reference. In this guide, you'll learn how to set
up your Next.js project for testing, write API tests with Vitest, and understand common pitfalls and frequently asked
questions (FAQ) to help you avoid mistakes as you add or change test cases.

---

## 1. Why Testing Matters

- **Confidence:** Automated tests catch bugs before they hit production.
- **Documentation:** Tests serve as living documentation for how your code is expected to work.
- **Safe Refactoring:** With a robust test suite, you can change code without fear of breaking functionality.
- **Quick Debugging:** Tests help pinpoint issues quickly when something goes wrong.

---

## 2. Setting Up Your Next.js Project for Testing

### **Step 1: Initialize a Next.js Project**

If you haven't already, create your Next.js project:

```bash
npx create-next-app@latest my-nextjs-api-app --typescript
cd my-nextjs-api-app
```

### **Step 2: Install Testing Dependencies**

Install Vitest and other dependencies your API routes might need:

```bash
npm install -D vitest @vitest/ui
```

If you're using libraries like Prisma, bcrypt, or Zod, ensure they're installed as well.

### **Step 3: Configure Vitest**

Create a `vitest.config.ts` file in your project root:

```ts
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node', // Use Node environment for backend API tests.
        include: ['**/*.test.{ts,tsx}'],
    },
});
```

Add a test script to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

---

## 3. Writing Tests for Next.js API Routes

Next.js API routes are functions that receive a request and return a response. Your tests will simulate requests and
validate the responses.

### **Example API Route: Sign-Up**

Imagine you have an endpoint in `pages/api/sign-up.ts`:

```ts
// pages/api/sign-up.ts
import {NextResponse} from 'next/server';
import {z} from 'zod';
import bcrypt from 'bcryptjs';
import {prisma} from '@/prisma';

const formSchema = z.object({
    username: z.string().min(3, {message: "Username must be at least 3 characters."}),
    email: z.string().email({message: "Please enter a valid email address."}).optional().or(z.literal("")),
    password: z.string().min(8, {message: "Password must be at least 8 characters."}),
});

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const parsed = formSchema.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json({error: parsed.error.errors}, {status: 400});
        }
        const {username, email, password} = parsed.data;

        const existingUser = await prisma.user.findUnique({where: {username}});
        if (existingUser) {
            return NextResponse.json({error: "Username already exists."}, {status: 400});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {username, email: email?.trim() || null, password: hashedPassword},
        });

        await prisma.account.create({
            data: {
                userId: newUser.id,
                type: "credential",
                provider: "credential",
                providerAccountId: newUser.id,
            },
        });

        return NextResponse.json({message: "User created successfully", user: newUser}, {status: 201});
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
```

### **Writing a Test for the Sign-Up API**

Create a file named `tests/sign-up-api-route.test.ts`:

```ts
import {describe, it, expect, vi, beforeEach} from "vitest";
import {POST} from "../../pages/api/sign-up"; // adjust the path as needed
import {prisma} from "@/prisma";
import bcrypt from "bcryptjs";

// --- MOCK DEPENDENCIES ---
// Mock Prisma functions to isolate testing from the actual database.
vi.mock("@/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        account: {
            create: vi.fn(),
        },
    },
}));

// Mock bcrypt.hash to always return a fixed value.
vi.spyOn(bcrypt, "hash").mockResolvedValue("hashedpassword");

describe("POST /api/sign-up", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return 400 for invalid input", async () => {
        const invalidData = {
            username: "ab", // too short
            email: "test@example.com",
            password: "validpassword",
        };

        const req = new Request("http://localhost/api/sign-up", {
            method: "POST",
            body: JSON.stringify(invalidData),
        });
        const response = await POST(req);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.error[0].message).toContain("at least 3 characters");
    });

    it("should return 400 if username exists", async () => {
        const validData = {
            username: "existinguser",
            email: "test@example.com",
            password: "validpassword",
        };

        // Simulate an existing user.
        (prisma.user.findUnique as any).mockResolvedValueOnce({id: 1, username: "existinguser"});
        const req = new Request("http://localhost/api/sign-up", {
            method: "POST",
            body: JSON.stringify(validData),
        });
        const response = await POST(req);
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.error).toBe("Username already exists.");
    });

    it("should create a new user successfully", async () => {
        const validData = {
            username: "newuser",
            email: "newuser@example.com",
            password: "validpassword",
        };

        // Simulate no existing user.
        (prisma.user.findUnique as any)
            .mockResolvedValueOnce(null) // for username check
            .mockResolvedValueOnce(null); // for email check

        (prisma.user.create as any).mockResolvedValue({
            id: 123,
            username: validData.username,
            email: validData.email,
            password: "hashedpassword",
        });
        (prisma.account.create as any).mockResolvedValue({});

        const req = new Request("http://localhost/api/sign-up", {
            method: "POST",
            body: JSON.stringify(validData),
        });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe("User created successfully");
        expect(data.user.username).toBe(validData.username);
        expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
        expect(prisma.user.create).toHaveBeenCalledOnce();
        expect(prisma.account.create).toHaveBeenCalledOnce();
    });
});
```

---

## 4. Best Practices When Adding or Changing Test Cases

### **Understanding the Structure: Arrange, Act, Assert**

- **Arrange:** Set up your data, state, and mocks.
- **Act:** Call the API route by simulating a request.
- **Assert:** Verify that the response meets your expectations.

### **Tips for Modifying or Adding Tests**

1. **Keep Tests Focused:**  
   Write tests that target a single behavior (e.g., invalid input vs. successful creation).

2. **Descriptive Test Names:**  
   Use clear names like `"should return 400 for invalid input"` so that it’s easy to understand what each test covers.

3. **Mock External Dependencies:**  
   Always isolate your tests by mocking modules that interact with the database or third-party services.

4. **Test Both Positive and Negative Scenarios:**  
   Include tests for both expected (positive) behaviors and error (negative) conditions.

5. **Run Tests Regularly:**  
   Run tests frequently during development. Use Vitest’s watch mode:
   ```bash
   npx vitest --watch
   ```

6. **Document Your Tests:**  
   Add comments where needed so that other developers (or future you) understand why a test is written a certain way.

---

## 5. Common Pitfalls and Mistakes

### **Pitfall 1: Not Isolating Tests**

- **Issue:**  
  Tests that rely on real database connections or external APIs can be slow and flaky.
- **Solution:**  
  Mock external dependencies (like Prisma, bcrypt, or crypto) to ensure tests run quickly and reliably.

### **Pitfall 2: Overly Complex Test Setup**

- **Issue:**  
  Complex setup code in tests makes them hard to maintain.
- **Solution:**  
  Keep your test setup as simple as possible. Use helper functions or setup files to share common configuration.

### **Pitfall 3: Inconsistent Test Data**

- **Issue:**  
  Changing your API without updating test data can cause false negatives.
- **Solution:**  
  Update test cases as you modify API logic. Make sure your test cases reflect the latest changes in your code.

### **Pitfall 4: Ignoring Edge Cases**

- **Issue:**  
  Focusing only on "happy path" scenarios may leave unexpected errors untested.
- **Solution:**  
  Add tests for invalid inputs, duplicate data, expired tokens, and other error conditions.

### **Pitfall 5: Not Running Tests Frequently**

- **Issue:**  
  Delaying tests until later can lead to discovering many issues at once.
- **Solution:**  
  Integrate testing into your development workflow. Run tests after every significant change.

---

## 6. FAQ: Frequently Asked Questions

### **Q1: What if my tests are failing unexpectedly?**

**A:**

- **Check Your Mocks:** Ensure your mocks correctly simulate external dependencies.
- **Review Test Data:** Verify that the test input data matches the expectations of your API schema.
- **Isolate the Issue:** Run a single test or add logging to determine where the failure occurs.

### **Q2: How can I add tests for a new API endpoint?**

**A:**

- Create the new endpoint (e.g., password reset or email verification).
- Write tests following the Arrange-Act-Assert model.
- Mock any external calls specific to that endpoint.
- Add the test file under the `/tests` folder and run your tests.

### **Q3: Should I test every possible edge case?**

**A:**  
While it’s important to cover both positive and negative cases, focus on scenarios that are likely to occur and those
that are critical for security (e.g., handling expired tokens, duplicate data, or invalid inputs).

### **Q4: How do I update tests when I change API logic?**

**A:**  
Whenever you refactor or add new features:

- Update test data to reflect new schema validations or behavior.
- Ensure your mocks return data consistent with your new logic.
- Run your test suite to catch any discrepancies early.

### **Q5: Can I run tests on a CI/CD pipeline?**

**A:**  
Yes. Integrate Vitest in your CI/CD process by running `npm run test` in your pipeline configuration. This ensures that
all tests pass before deployments.

---

## 7. Additional Resources

- **Vitest Documentation:** [Vitest Docs](https://vitest.dev/)
- **Next.js API Routes:** [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- **Prisma Documentation:** [Prisma Docs](https://www.prisma.io/docs/)
- **Zod for Validation:** [Zod Docs](https://github.com/colinhacks/zod)