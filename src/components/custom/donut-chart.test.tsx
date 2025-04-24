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
    Pie: vi.fn().mockImplementation(({children, data}) => (
        <div data-testid="pie">
            {children}
            <div data-testid="pie-data">{JSON.stringify(data)}</div>
        </div>
    )),
    Cell: vi.fn().mockImplementation(() => null),
    Tooltip: vi.fn().mockImplementation(() => null),
}));

describe("DonutChart", () => {
    const sampleData = [
        {name: "A", value: 10, color: "#ff0000"},
        {name: "B", value: 20},
    ];

    const fallbackColors = [
        "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", 
        "#0099C6", "#DD4477", "#66AA00", "#B82E2E", "#316395"
    ];

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
        expect(colorSquares[0]).toHaveStyle(`background-color: ${fallbackColors[0]}`);
        expect(colorSquares[1]).toHaveStyle("background-color: #ff0000");
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

    it("sorts data by value in descending order", () => {
        const unsortedData = [
            {name: "A", value: 10},
            {name: "B", value: 30},
            {name: "C", value: 20},
        ];
        render(<DonutChart data={unsortedData}/>);
        
        const pieData = screen.getByTestId("pie-data");
        const parsedData = JSON.parse(pieData.textContent!);
        
        expect(parsedData[0].value).toBe(30);
        expect(parsedData[1].value).toBe(20);
        expect(parsedData[2].value).toBe(10);
    });

    it("displays correct percentages in legend", () => {
        render(<DonutChart title={"Test Title"} data={sampleData}/>);
        
        expect(screen.getByText("33.3%")).toBeInTheDocument();
        expect(screen.getByText("66.7%")).toBeInTheDocument();
    });

    it("configures Tooltip formatter correctly", () => {
        render(<DonutChart title={"Test Title"} data={sampleData}/>);
        const tooltipProps = (Tooltip as any).mock.calls[0][0];
        
        expect(tooltipProps.formatter(10)).toEqual(["33.3%", "Percentage"]);
    });

    it("handles empty data without crashing", () => {
        const {container} = render(<DonutChart title={"Test Title"} data={[]}/>);
        const colorSquares = container.querySelectorAll(".w-3.h-3");
        expect(colorSquares.length).toBe(0);
    });

    it("configures Pie with correct properties", () => {
        render(<DonutChart data={sampleData}/>);
        
        expect(Pie).toHaveBeenCalled();
        
        const pieProps = (Pie as unknown as jest.Mock).mock.calls[0][0];
        
        expect(pieProps).toHaveProperty("cx", "50%");
        expect(pieProps).toHaveProperty("cy", "50%");
        expect(pieProps).toHaveProperty("innerRadius", 40);
        expect(pieProps).toHaveProperty("outerRadius", 70);
        expect(pieProps).toHaveProperty("paddingAngle", 3);
        expect(pieProps).toHaveProperty("dataKey", "value");
        expect(pieProps).toHaveProperty("label", false);
        expect(pieProps).toHaveProperty("labelLine", false);
    });

    it("renders chart container", () => {
        render(<DonutChart data={sampleData}/>);
        expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    });
});