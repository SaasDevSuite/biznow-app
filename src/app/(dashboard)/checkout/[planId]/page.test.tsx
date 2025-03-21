// InvoicePage.test.tsx
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';

// Create a mock for next/navigation with useRouter and useParams.
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({push: mockPush}),
    useParams: () => ({planId: '1'}),
}));

// Create a mock for next-auth/react to return a session with a user.
vi.mock('next-auth/react', () => ({
    useSession: () => ({data: {user: {id: 'user123'}}}),
}));

// Import the component AFTER the mocks have been set up.
import InvoicePage from './page';

describe('InvoicePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders plan details and processes payment submission', async () => {
        // Define mock plan data to be returned from the GET request.
        const mockPlan = {id: '1', name: 'Premium Plan', price: 99.99, interval: 'monthly'};

        // Set up global.fetch to simulate:
        // 1. GET request for plan data.
        // 2. POST request for invoice creation.
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                json: async () => mockPlan,
            })
            .mockResolvedValueOnce({
                json: async () => ({id: 'invoice123'}),
            });

        render(<InvoicePage/>);

        // Initially, the "Loading..." text should be displayed.
        expect(screen.getByText("Loading...")).toBeInTheDocument();

        // Wait for the plan data to be loaded and rendered.
        await waitFor(() => {
            expect(screen.getByText("Subscription Summary")).toBeInTheDocument();
        });

        // Verify that the GET request is made with the correct URL and method.
        expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/plans/select/1', {method: 'GET'});

        // Check that plan details are rendered.
        expect(screen.getByText('Premium Plan')).toBeInTheDocument();
        expect(screen.getByText('$99.99')).toBeInTheDocument();
        expect(screen.getByText('monthly')).toBeInTheDocument();

        // Change payment method to "STRIPE" by clicking on the corresponding label.
        await userEvent.click(screen.getByText("Stripe"));

        // Click the "Pay Now" button to submit.
        await userEvent.click(screen.getByRole("button", {name: /Pay Now/i}));

        // Wait for the POST request to be triggered and for navigation to occur.
        await waitFor(() => {
            // Check that the POST call is made with the expected URL and payload.
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/invoice/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({planId: '1', userId: 'user123', paymentMethod: 'STRIPE'}),
            });
            // Verify that the router push is called with the correct checkout result URL.
            expect(mockPush).toHaveBeenCalledWith('/checkout/result/invoice123');
        });
    });
});
