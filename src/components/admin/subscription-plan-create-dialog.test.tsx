// CreatePlanDialog.test.tsx
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, it, expect, beforeEach, vi} from "vitest";

// Import the component and the API call to be mocked
import {CreatePlanDialog} from "./subscription-plan-create-dialog";
import {createPlan} from "@/actions/plan/operations";

// Mock the createPlan function so we don't make an actual API call
vi.mock("@/actions/plan/operations", () => ({
    createPlan: vi.fn().mockResolvedValue(undefined),
}));

describe("CreatePlanDialog", () => {
    const onOpenChange = vi.fn();
    const afterCreate = vi.fn();

    beforeEach(() => {
        onOpenChange.mockClear();
        afterCreate.mockClear();
        (createPlan as any).mockClear();
    });

    it("submits the form and calls createPlan with the correct data", async () => {
        // Render the dialog in open state
        render(
            <CreatePlanDialog
                open={true}
                onOpenChange={onOpenChange}
                afterCreate={afterCreate}
            />
        );

        // Fill in the form fields using the accessible labels
        const nameField = screen.getByLabelText("Name");
        await userEvent.clear(nameField);
        await userEvent.type(nameField, "Premium Plan");

        const descriptionField = screen.getByLabelText("Description");
        await userEvent.clear(descriptionField);
        await userEvent.type(
            descriptionField,
            "Premium subscription for enterprise"
        );

        const priceField = screen.getByLabelText("Price");
        await userEvent.clear(priceField);
        await userEvent.type(priceField, "299.99");

        // Note: Currency and Billing Interval use Select components.
        // The default values are "USD" and "monthly", so we assume these are acceptable.
        // If you want to test selecting a different value, you'd need to simulate opening the select and choosing an item.

        // Submit the form by clicking the "Create Plan" button
        const submitButton = screen.getByRole("button", {
            name: /create plan/i,
        });
        await userEvent.click(submitButton);

        // Wait for the createPlan function to have been called with the expected data
        await waitFor(() => {
            expect(createPlan).toHaveBeenCalledWith({
                name: "Premium Plan",
                description: "Premium subscription for enterprise",
                price: 299.99,
                currency: "USD",
                interval: "monthly",
            });
        });

        // Verify that the dialog is closed and afterCreate callback is invoked
        await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(false);
            expect(afterCreate).toHaveBeenCalled();
        });
    });
});
