import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {SubscriptionPlanTable} from "./subscription-plan-table";
import * as planQuery from "@/actions/plan/query";
import * as planOps from "@/actions/plan/operations";

const mockPlans = [
    {
        id: "1",
        name: "Basic Plan",
        description: "Basic subscription plan",
        price: 100,
        currency: "USD",
        interval: "Monthly",
        status: "INACTIVE",
        createdAt: new Date("2023-01-01T00:00:00Z"),
    },
    {
        id: "2",
        name: "Pro Plan",
        description: "Professional plan",
        price: 200,
        currency: "USD",
        interval: "Monthly",
        status: "ACTIVE",
        createdAt: new Date("2023-02-01T00:00:00Z"),
    },
];

describe("SubscriptionPlanTable", () => {
    beforeEach(() => {
        vi.spyOn(planQuery, "getPlans").mockResolvedValue(mockPlans as any);
        vi.spyOn(planOps, "changePlanStatus").mockResolvedValue(undefined as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("calls changePlanStatus when an action button is clicked", async () => {
        render(<SubscriptionPlanTable />);

        // Wait for the row containing "Basic Plan" to appear
        const basicPlanCell = await screen.findByText("Basic Plan");
        const row = basicPlanCell.closest("tr");
        expect(row).toBeInTheDocument();

        // Within that row, find the dropdown trigger button.
        // (In our case, the dropdown trigger is rendered with data-slot="dropdown-menu-trigger")
        const dropdownTrigger = row!.querySelector('[data-slot="dropdown-menu-trigger"]');
        expect(dropdownTrigger).toBeInTheDocument();

        // Click the dropdown trigger to open the menu
        await userEvent.click(dropdownTrigger!);

        // After opening the dropdown, query for the "Mark as Active" button.
        // It might be rendered in a portal, so we search the whole document.
        const markActiveButton = await screen.findByText(/mark as active/i);
        expect(markActiveButton).toBeInTheDocument();

        // Click the "Mark as Active" button and assert the changePlanStatus call
        await userEvent.click(markActiveButton);
        expect(planOps.changePlanStatus).toHaveBeenCalledWith("1", "ACTIVE");
    });
});
