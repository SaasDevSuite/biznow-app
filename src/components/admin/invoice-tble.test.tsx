// InvoiceTable.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi } from 'vitest';
import { InvoiceTable } from './invoice-table'; // adjust the import path as needed
import { InvoiceStatus } from '@prisma/client';
import { toast } from 'sonner';

// Mock the API calls and toast notifications
import * as invoiceQuery from '@/actions/invoice/query';
import * as invoiceOps from '@/actions/invoice/operations';

vi.mock('@/actions/invoice/query', () => ({
    getAllInvoices: vi.fn(),
}));

vi.mock('@/actions/invoice/operations', () => ({
    markInvoiceAsPaid: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('InvoiceTable', () => {
    const mockInvoices = [
        {
            id: '1',
            user: { username: 'john' },
            status: InvoiceStatus.PENDING, // This should show "Mark as Paid"
            paymentMethod: 'Credit Card',
            date: new Date('2025-03-16T00:00:00.000Z'),
        },
        {
            id: '2',
            user: { username: 'alice' },
            status: InvoiceStatus.PAID, // This should show "Mark as Unpaid"
            paymentMethod: 'PayPal',
            date: new Date('2025-03-15T00:00:00.000Z'),
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Default API response for getAllInvoices
        (invoiceQuery.getAllInvoices as any).mockResolvedValue({
            invoices: mockInvoices,
            totalPages: 2,
        });
    });

    it('renders invoices and pagination correctly', async () => {
        render(<InvoiceTable />);

        // Wait until invoice data is loaded (invoice usernames are rendered)
        expect(await screen.findByText('john')).toBeInTheDocument();
        expect(screen.getByText('alice')).toBeInTheDocument();

        // Check that pagination text appears correctly
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();

        // "Previous" button should be disabled on first page; "Next" enabled
        expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
    });

    it('updates search query and fetches invoices', async () => {
        render(<InvoiceTable />);

        // Wait for initial load
        await screen.findByText('john');

        const searchInput = screen.getByPlaceholderText('Search...');
        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, 'alice');

        // Wait for the component to trigger a re-fetch with the search query.
        await waitFor(() => {
            expect(invoiceQuery.getAllInvoices).toHaveBeenCalledWith(1, 3, 'alice');
        });
    });

    it('calls markInvoiceAsPaid when marking a pending invoice as paid', async () => {
        render(<InvoiceTable />);

        // Wait for invoice data to load
        await screen.findByText('john');

        // Find the dropdown trigger for the pending invoice.
        // Since the action button has no text (it only renders an icon), we filter by buttons with empty text.
        const actionButtons = screen.getAllByRole('button').filter((btn) => btn.textContent === '');
        // Assume the first action button corresponds to the invoice with status PENDING (john)
        const pendingActionButton = actionButtons[0];
        await userEvent.click(pendingActionButton);

        // After opening the dropdown, "Mark as Paid" should be visible.
        const markAsPaidOption = await screen.findByText('Mark as Paid');
        await userEvent.click(markAsPaidOption);

        // Expect markInvoiceAsPaid to be called with the invoice id "1"
        await waitFor(() => {
            expect(invoiceOps.markInvoiceAsPaid).toHaveBeenCalledWith('1');
        });
    });

    it('shows error toast when trying to mark a paid invoice as unpaid', async () => {
        render(<InvoiceTable />);

        // Wait for the "alice" row (paid invoice) to be rendered
        await screen.findByText('alice');

        // Get all action buttons and assume the second corresponds to the paid invoice.
        const actionButtons = screen.getAllByRole('button').filter((btn) => btn.textContent === '');
        const paidActionButton = actionButtons[1];
        await userEvent.click(paidActionButton);

        // The dropdown should now show "Mark as Unpaid"
        const markAsUnpaidOption = await screen.findByText('Mark as Unpaid');
        await userEvent.click(markAsUnpaidOption);

        // Expect an error toast to be shown
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Cannot mark as unpaid');
        });
        // Also, markInvoiceAsPaid should not be called
        expect(invoiceOps.markInvoiceAsPaid).not.toHaveBeenCalled();
    });

    it('changes page when clicking next and previous buttons', async () => {
        render(<InvoiceTable />);

        // Wait for initial data to load
        await screen.findByText('john');

        // Click the "Next" pagination button
        const nextButton = screen.getByRole('button', { name: /Next/i });
        await userEvent.click(nextButton);

        await waitFor(() => {
            // Verify that getAllInvoices is called with page 2
            expect(invoiceQuery.getAllInvoices).toHaveBeenCalledWith(2, 3, '');
        });

        // Click the "Previous" button to go back to page 1
        const previousButton = screen.getByRole('button', { name: /Previous/i });
        await userEvent.click(previousButton);

        await waitFor(() => {
            expect(invoiceQuery.getAllInvoices).toHaveBeenCalledWith(1, 3, '');
        });
    });
});
