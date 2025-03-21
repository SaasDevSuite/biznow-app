// GenericTable.test.tsx
import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, it, expect, vi} from "vitest";
import {GenericTable, Column} from "./table"; // Adjust the import path as needed
import {MoreHorizontal} from "lucide-react";

// Define a sample type for testing
type Person = {
    id: string;
    name: string;
    age: number;
};

const columns: Column<Person>[] = [
    {key: "name", label: "Name"},
    {key: "age", label: "Age"},
];

const sampleData: Person[] = [
    {id: "1", name: "Alice", age: 30},
    {id: "2", name: "Bob", age: 25},
];

describe("GenericTable", () => {
    it("renders table headers and data rows", () => {
        render(
            <GenericTable
                columns={columns}
                data={sampleData}
                onSearch={() => {
                }}
                page={1}
                totalPages={2}
                onChangePage={() => {
                }}
            />
        );

        // Check headers
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Age")).toBeInTheDocument();

        // Check each data row
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("30")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(screen.getByText("25")).toBeInTheDocument();

        // Check pagination info
        expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
    });

    it("calls onSearch when search input changes", async () => {
        const onSearchMock = vi.fn();
        render(
            <GenericTable
                columns={columns}
                data={sampleData}
                onSearch={onSearchMock}
                searchQuery=""
                page={1}
                totalPages={2}
                onChangePage={() => {
                }}
            />
        );

        const searchInput = screen.getByPlaceholderText(/search/i);
        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, "Alice");
        expect(onSearchMock).toHaveBeenCalledWith("A");
        // Note: userEvent.type triggers onChange with each character.
    });

    it("renders 'No data found.' when data is empty", () => {
        render(
            <GenericTable
                columns={columns}
                data={[]}
                onSearch={() => {
                }}
                page={1}
                totalPages={1}
                onChangePage={() => {
                }}
            />
        );

        expect(screen.getByText("No data found.")).toBeInTheDocument();
    });

    it("renders actions dropdown and triggers action callback", async () => {
        const actionCallback = vi.fn();
        const actions = () => [
            {
                label: "Edit",
                icon: <MoreHorizontal key="edit"/>,
                onClick: actionCallback,
            },
        ];

        render(
            <GenericTable
                columns={columns}
                data={sampleData}
                actions={actions}
                onSearch={() => {
                }}
                page={1}
                totalPages={1}
                onChangePage={() => {
                }}
            />
        );

        // The MoreHorizontal button should be rendered for each row
        const actionButtons = screen.getAllByRole("button", {name: ""});
        expect(actionButtons.length).toBe(sampleData.length);

        // Click the first action button to open the dropdown
        await userEvent.click(actionButtons[0]);

        // Check that the action label is displayed
        const editAction = await screen.findByText("Edit");
        expect(editAction).toBeInTheDocument();

        // Click the action and verify the callback is triggered
        await userEvent.click(editAction);
        expect(actionCallback).toHaveBeenCalled();
    });

    it("handles pagination controls correctly", async () => {
        const onChangePageMock = vi.fn();
        const {rerender} = render(
            <GenericTable
                columns={columns}
                data={sampleData}
                onSearch={() => {
                }}
                page={1}
                totalPages={3}
                onChangePage={onChangePageMock}
            />
        );

        // On page 1, previous button should be disabled and next enabled.
        const prevButton = screen.getByRole("button", {name: /previous/i});
        const nextButton = screen.getByRole("button", {name: /next/i});
        expect(prevButton).toBeDisabled();
        expect(nextButton).not.toBeDisabled();

        // Simulate clicking next
        await userEvent.click(nextButton);
        expect(onChangePageMock).toHaveBeenCalledWith(2);

        // Rerender as page 3 (last page)
        rerender(
            <GenericTable
                columns={columns}
                data={sampleData}
                onSearch={() => {
                }}
                page={3}
                totalPages={3}
                onChangePage={onChangePageMock}
            />
        );
        expect(nextButton).toBeDisabled();
        expect(prevButton).not.toBeDisabled();
    });
});
