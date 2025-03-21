// SubscriptionTable.test.tsx
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi } from 'vitest';
import {SubscriptionTable} from './subscription-table'; // adjust the import path if needed
import {SubscriptionStatus} from '@prisma/client';

// Mock API calls
import * as subscriptionQuery from '@/actions/subscription/query';
import * as subscriptionOps from '@/actions/subscription/operations';

vi.mock('@/actions/subscription/query', () => ({
    getAllSubscriptions: vi.fn(),
}));

vi.mock('@/actions/subscription/operations', () => ({
    toggleSubscriptionStatus: vi.fn(),
}));

describe('SubscriptionTable', () => {
    const mockSubscriptions = [
        {
            id: '1',
            user: {name: 'John Doe'},
            status: SubscriptionStatus.ACTIVE,
            startDate: new Date('2025-01-01T00:00:00.000Z'),
            endDate: new Date('2025-12-31T00:00:00.000Z'),
        },
        {
            id: '2',
            user: {name: 'Alice'},
            status: SubscriptionStatus.DEACTIVATED,
            startDate: new Date('2025-02-01T00:00:00.000Z'),
            endDate: new Date('2025-11-30T00:00:00.000Z'),
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Set the default response for getAllSubscriptions
        (subscriptionQuery.getAllSubscriptions as any).mockResolvedValue({
            subscriptions: mockSubscriptions,
            totalPages: 2,
        });
    });

    it('renders subscriptions and pagination correctly', async () => {
        render(<SubscriptionTable status="ACTIVE"/>);

        // Wait for subscription data to load
        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();

        // Check status badges (Active and Inactive)
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();

        // Verify pagination information
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Previous/i})).toBeDisabled();
        expect(screen.getByRole('button', {name: /Next/i})).not.toBeDisabled();
    });

    it('updates search query and fetches subscriptions', async () => {
        render(<SubscriptionTable status="ACTIVE"/>);

        // Wait for initial load
        await screen.findByText('John Doe');

        const searchInput = screen.getByPlaceholderText('Search...');
        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, 'Alice');

        await waitFor(() => {
            expect(subscriptionQuery.getAllSubscriptions).toHaveBeenCalledWith(
                1, // page
                3, // pageSize
                'Alice', // search query
                'ACTIVE', // status prop
                false // isExceptStatus (default)
            );
        });
    });

    it('calls toggleSubscriptionStatus when clicking the action button', async () => {
        render(<SubscriptionTable status="ACTIVE"/>);

        // Wait for subscription data to load
        await screen.findByText('John Doe');

        // Get all dropdown trigger buttons (they render only an icon)
        const actionButtons = screen.getAllByRole('button').filter(btn => btn.textContent === '');
        // Assume the first action button corresponds to the first subscription ("John Doe")
        const actionButton = actionButtons[0];
        await userEvent.click(actionButton);

        // The dropdown item should have the label "Deactivate" (since prop status is "ACTIVE")
        const actionItem = await screen.findByText('Deactivate');
        await userEvent.click(actionItem);

        await waitFor(() => {
            expect(subscriptionOps.toggleSubscriptionStatus).toHaveBeenCalledWith(
                '1', // subscription id
                SubscriptionStatus.DEACTIVATED // toggled status
            );
        });
    });

    it('changes page when clicking next and previous buttons', async () => {
        render(<SubscriptionTable status="ACTIVE"/>);

        await screen.findByText('John Doe');

        // Click the "Next" button to move to page 2
        const nextButton = screen.getByRole('button', {name: /Next/i});
        await userEvent.click(nextButton);

        await waitFor(() => {
            expect(subscriptionQuery.getAllSubscriptions).toHaveBeenCalledWith(
                2, // page
                3, // pageSize
                '', // search query remains empty
                'ACTIVE',
                false
            );
        });

        // Click the "Previous" button to go back to page 1
        const previousButton = screen.getByRole('button', {name: /Previous/i});
        await userEvent.click(previousButton);

        await waitFor(() => {
            expect(subscriptionQuery.getAllSubscriptions).toHaveBeenCalledWith(
                1, // page
                3,
                '',
                'ACTIVE',
                false
            );
        });
    });
});
