// PaymentSuccess.test.tsx
import {render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import PaymentSuccess from './page';

// Mock next/navigation to supply invoiceId from the URL
vi.mock('next/navigation', () => ({
    useParams: () => ({invoiceId: '123'}),
}));

describe('PaymentSuccess', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows a loading state before invoice data is loaded', async () => {
        // Create a promise that will not resolve immediately
        let resolveFetch: any;
        const fetchPromise = new Promise((resolve) => {
            resolveFetch = resolve;
        });
        global.fetch = vi.fn().mockReturnValueOnce(fetchPromise);

        render(<PaymentSuccess/>);

        // Initially, the "Loading..." text should be present.
        expect(screen.getByText("Loading...")).toBeInTheDocument();

        // Resolve the fetch promise with a PAID invoice response.
        resolveFetch({
            json: async () => ({status: "PAID", id: "123", name: "Invoice 123"}),
        });

        // Wait for the invoice data to be rendered.
        await waitFor(() => {
            expect(screen.getByText("Payment Success")).toBeInTheDocument();
        });
    });

    it('renders correct content for a PAID invoice', async () => {
        const mockInvoice = {status: "PAID", id: "123", name: "Invoice 123"};
        global.fetch = vi.fn().mockResolvedValueOnce({
            json: async () => mockInvoice,
        });

        render(<PaymentSuccess/>);

        // Wait for the PAID invoice data to be rendered.
        await waitFor(() => {
            expect(screen.getByText("Payment Success")).toBeInTheDocument();
        });
        expect(
            screen.getByText("Your payment has been successfully processed.")
        ).toBeInTheDocument();
    });

    it('renders correct content for a PENDING invoice', async () => {
        const mockInvoice = {status: "PENDING", id: "123", name: "Invoice 123"};
        global.fetch = vi.fn().mockResolvedValueOnce({
            json: async () => mockInvoice,
        });

        render(<PaymentSuccess/>);

        // Wait for the PENDING invoice data to be rendered.
        await waitFor(() => {
            expect(screen.getByText("Payment Pending")).toBeInTheDocument();
        });
        expect(
            screen.getByText("Your payment is currently being processed.")
        ).toBeInTheDocument();
    });

    it('renders correct content for a FAILED invoice', async () => {
        const mockInvoice = {status: "FAILED", id: "123", name: "Invoice 123"};
        global.fetch = vi.fn().mockResolvedValueOnce({
            json: async () => mockInvoice,
        });

        render(<PaymentSuccess/>);

        // Wait for the FAILED invoice data to be rendered.
        await waitFor(() => {
            expect(screen.getByText("Payment Failed")).toBeInTheDocument();
        });
        expect(
            screen.getByText("Your payment has failed. Please try again.")
        ).toBeInTheDocument();
    });
});
