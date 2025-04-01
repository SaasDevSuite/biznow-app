import React from "react";
import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import DonutChart from "./donut-chart";
import {Pie, Tooltip} from "recharts";

vi.mock("recharts", () => ({
    ResponsiveContainer: ({children}: { children: React.ReactNode }) => (
        <div className="recharts-responsive-container">{children}</div>
    ),
    PieChart: ({children}: { children: React.ReactNode }) => (
        <div data-testid="pie-chart">{children}</div>
    ),
    Pie: vi.fn().mockImplementation(() => null),
    Cell: vi.fn().mockImplementation(() => null),
    Tooltip: vi.fn().mockImplementation(() => null),
}));

describe("DonutChart", () => {
    const sampleData = [
        {name: "A", value: 10, color: "#ff0000"},
        {name: "B", value: 20}, // No color provided
    ];

    const fallbackColors = ["#4a69dd", "#90c469", "#f6c652", "#f05a5a", "#5ec8eb"];

    it("renders title when provided", () => {
        render(<DonutChart data={sampleData} title={"Test Title"}/>);
        expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("does not render title when not provided", () => {
        const {queryByText} = render(<DonutChart data={sampleData}/>);
        expect(queryByText("Test Title")).not.toBeInTheDocument();
    });

    it("renders legend items with correct names and colors", () => {
        const {container} = render(<DonutChart title={"Test Title"} data={sampleData}/>);

        expect(screen.getByText("A")).toBeInTheDocument();
        expect(screen.getByText("B")).toBeInTheDocument();

        const colorSquares = container.querySelectorAll(".w-3.h-3");
        expect(colorSquares[0]).toHaveStyle("background-color: #ff0000");
        expect(colorSquares[1]).toHaveStyle(`background-color: ${fallbackColors[1]}`);
    });

    it("uses fallback colors when data items lack color", () => {
        const dataWithoutColors = [
            {name: "C", value: 30},
            {name: "D", value: 40},
            {name: "E", value: 50},
        ];
        const {container} = render(<DonutChart title={"Test Title"} data={dataWithoutColors}/>);

        const colorSquares = container.querySelectorAll(".w-3.h-3");
        expect(colorSquares[0]).toHaveStyle(`background-color: ${fallbackColors[0]}`);
        expect(colorSquares[1]).toHaveStyle(`background-color: ${fallbackColors[1]}`);
        expect(colorSquares[2]).toHaveStyle(`background-color: ${fallbackColors[2]}`);
    });

    it("displays correct percentage in segment labels", () => {
        render(<DonutChart title={"Test Title"} data={sampleData}/>);
        const pieProps = (Pie as any).mock.calls[0][0];
        const label = pieProps.label({percent: 0.3333});
        expect(label).toBe("33%");
    });

    it("displays correct tooltip percentage", () => {
        render(<DonutChart title={"Test Title"} data={sampleData}/>);
        const tooltipProps = (Tooltip as any).mock.calls[0][0];
        const formattedValue = tooltipProps.formatter(10);
        expect(formattedValue).toEqual(["33%", "Percentage"]);
    });

    it("handles empty data without crashing", () => {
        const {container} = render(<DonutChart title={"Test Title"} data={[]}/>);
        const colorSquares = container.querySelectorAll(".w-3.h-3");
        expect(colorSquares.length).toBe(0);
    });

    it("renders chart container", () => {
        render(<DonutChart data={sampleData}/>);
        expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    });
});