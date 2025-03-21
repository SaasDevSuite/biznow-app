// PlansPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi } from 'vitest';
import PlansPage from './page'; // adjust the import path as needed

// Define mock plan data
const mockPlans = [
    { id: '1', name: 'Plan A' },
    { id: '2', name: 'Plan B' },
];

// Mock the global fetch API to return mockPlans
global.fetch = vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve(mockPlans),
    })
) as any;

// Mock the Next.js useRouter hook
const push = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

// Stub the PlanCard component to isolate PlansPage behavior
vi.mock('@/components/app/plan-card', () => ({
    PlanCard: ({ plan, handleSubscribe }: { plan: any; handleSubscribe: (planId: string) => void }) => (
        <div data-testid="plan-card" onClick={() => handleSubscribe(plan.id)}>
            {plan.name}
        </div>
    ),
}));

describe('PlansPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and displays plans on mount', async () => {
        render(<PlansPage />);

        // Wait for the plan cards to render after fetch resolves
        const planCards = await screen.findAllByTestId('plan-card');
        expect(planCards).toHaveLength(mockPlans.length);
        expect(planCards[0]).toHaveTextContent('Plan A');
        expect(planCards[1]).toHaveTextContent('Plan B');
    });

    it('navigates to the checkout page when a plan card is clicked', async () => {
        render(<PlansPage />);

        // Wait for the plan cards to appear
        const planCards = await screen.findAllByTestId('plan-card');

        // Simulate a click on the first plan card
        await userEvent.click(planCards[0]);

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith(`/checkout/${mockPlans[0].id}`);
        });
    });
});
