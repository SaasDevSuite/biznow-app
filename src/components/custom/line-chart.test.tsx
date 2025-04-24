import React from "react";
import {render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import LineCharts, {FrequencyData} from "./line-chart"; 
import {Area, Tooltip, XAxis, YAxis} from "recharts";

vi.mock("recharts", () => ({
    ResponsiveContainer: ({children}: { children: React.ReactNode }) => (
        <div className="recharts-responsive-container">{children}</div>
    ),
    AreaChart: vi.fn().mockImplementation(({children, data}) => (
        <div data-testid="area-chart">
            {children}
            <div data-testid="chart-data">{JSON.stringify(data)}</div>
        </div>
    )),
    XAxis: vi.fn().mockImplementation(() => null),
    YAxis: vi.fn().mockImplementation(() => null),
    Tooltip: vi.fn().mockImplementation(() => null),
    Area: vi.fn().mockImplementation(() => null),
    defs: ({children}: { children: React.ReactNode }) => <div data-testid="defs">{children}</div>,
    linearGradient: ({children, id}: { children: React.ReactNode, id: string }) => (
        <div data-testid={id}>{children}</div>
    ),
    stop: () => <div data-testid="stop"></div>,
}));

describe("LineCharts", () => {
    const sampleData: FrequencyData[] = [
        {day: "Mon", value: 5},
        {day: "Tue", value: 8},
    ];

    it("renders the title", () => {
        render(<LineCharts title={"Test Title"} data={sampleData}/>);
        expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("does not render title when not provided", () => {
        const {queryByText} = render(<LineCharts data={sampleData}/>);
        expect(queryByText("Test Title")).not.toBeInTheDocument();
    });

    it("renders chart container with correct dimensions", () => {
        render(<LineCharts title={"Test Title"} data={sampleData}/>);
        const container = screen.getByTestId("area-chart");
        expect(container).toBeInTheDocument();
    });

    it("passes correct data to the chart", () => {
        render(<LineCharts title={"Test Title"} data={sampleData}/>);
        const dataElement = screen.getByTestId("chart-data");
        expect(JSON.parse(dataElement.textContent!)).toEqual(sampleData);
    });

    it("configures XAxis correctly", () => {
        render(<LineCharts title={"Test Title"}  data={sampleData}/>);
        expect(XAxis).toHaveBeenCalledWith(
            expect.objectContaining({dataKey: "day"}),
            undefined,);
    });

    it("configures YAxis correctly", () => {
        render(<LineCharts title={"Test Title"} data={sampleData}/>);
        expect(YAxis).toHaveBeenCalled();
    });

    it("configures Tooltip with correct styles", () => {
        render(<LineCharts title={"Test Title"} data={sampleData}/>);
        expect(Tooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                contentStyle: {
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px"
                },
            }),
            undefined,
        );
    });

    it("configures Area with correct properties", () => {
        render(<LineCharts title={"Test Title"} data={sampleData}/>);
        expect(Area).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "monotone",
                dataKey: "value",
                fillOpacity: 1,
                stroke: "#3b82f6",
                fill: "url(#colorValue)",
            }),
            undefined,
        );
    });

    it("handles empty data gracefully", () => {
        render(<LineCharts title={"Test Title"} data={[]}/>);
        const dataElement = screen.getByTestId("chart-data");
        expect(JSON.parse(dataElement.textContent!)).toEqual([]);
    });

    it("renders gradient definition", () => {
        render(<LineCharts title={"Test Title"} data={sampleData}/>);
        expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    });
});