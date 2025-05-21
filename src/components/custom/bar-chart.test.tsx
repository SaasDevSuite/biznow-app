import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CustomBarChart, { BarChartData } from "./bar-chart";
import { Bar, CartesianGrid, Tooltip, XAxis } from "recharts";

// Mock recharts components to avoid rendering issues in test environment
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div className="recharts-responsive-container">{children}</div>
  ),
  BarChart: vi.fn().mockImplementation(({ children, data }) => (
    <div data-testid="bar-chart">
      {children}
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  )),
  Bar: vi.fn().mockImplementation(({ children }) => (
    <div data-testid="bar">{children}</div>
  )),
  Cell: vi.fn().mockImplementation(() => null),
  XAxis: vi.fn().mockImplementation(() => null),
  YAxis: vi.fn().mockImplementation(() => null),
  CartesianGrid: vi.fn().mockImplementation(() => null),
  Tooltip: vi.fn().mockImplementation(() => null),
}));

describe("CustomBarChart", () => {
  const sampleData: BarChartData[] = [
    { name: "Category A", value: 10, color: "#ff0000" },
    { name: "Category B", value: 20 },
    { name: "Category C", value: 15, color: "#00ff00" },
  ];

  it("renders title when provided", () => {
    render(<CustomBarChart data={sampleData} title="Test Chart Title" />);
    expect(screen.getByText("Test Chart Title")).toBeInTheDocument();
  });

  it("does not render title when not provided", () => {
    const { queryByText } = render(<CustomBarChart data={sampleData} />);
    expect(queryByText("Test Chart Title")).not.toBeInTheDocument();
  });

  it("renders chart container with correct data", () => {
    render(<CustomBarChart data={sampleData} />);
    const chartData = screen.getByTestId("chart-data");
    const parsedData = JSON.parse(chartData.textContent!);

    expect(parsedData).toHaveLength(3);
    expect(parsedData[0].name).toBe("Category A");
    expect(parsedData[0].value).toBe(10);
    expect(parsedData[1].name).toBe("Category B");
    expect(parsedData[1].value).toBe(20);
  });

  it("uses custom dataKey when provided", () => {
    render(<CustomBarChart data={sampleData} dataKey="customKey" />);

    // Check if Bar was called with the correct props
    expect(Bar).toHaveBeenCalled();

    // Check if the component was rendered with the right props
    const calls = (Bar as unknown as jest.Mock).mock.calls;
    let foundCustomKey = false;

    // Check all calls to see if any has the custom dataKey
    for (const call of calls) {
      if (call[0].dataKey === "customKey") {
        foundCustomKey = true;
        break;
      }
    }

    expect(foundCustomKey).toBe(true);
  });

  it("uses default dataKey when not provided", () => {
    render(<CustomBarChart data={sampleData} />);

    expect(Bar).toHaveBeenCalled();
    const barProps = (Bar as unknown as jest.Mock).mock.calls[0][0];
    expect(barProps.dataKey).toBe("value");
  });

  it("uses custom xAxisDataKey when provided", () => {
    render(<CustomBarChart data={sampleData} xAxisDataKey="customXKey" />);

    expect(XAxis).toHaveBeenCalled();

    const calls = (XAxis as unknown as jest.Mock).mock.calls;
    let foundCustomXKey = false;

    // Check all calls to see if any has the custom xAxisDataKey
    for (const call of calls) {
      if (call[0].dataKey === "customXKey") {
        foundCustomXKey = true;
        break;
      }
    }

    expect(foundCustomXKey).toBe(true);
  });

  it("uses default xAxisDataKey when not provided", () => {
    render(<CustomBarChart data={sampleData} />);

    expect(XAxis).toHaveBeenCalled();
    const xAxisProps = (XAxis as unknown as jest.Mock).mock.calls[0][0];
    expect(xAxisProps.dataKey).toBe("name");
  });

  it("configures CartesianGrid with correct properties", () => {
    render(<CustomBarChart data={sampleData} />);

    expect(CartesianGrid).toHaveBeenCalled();
    const gridProps = (CartesianGrid as unknown as jest.Mock).mock.calls[0][0];

    expect(gridProps.strokeDasharray).toBe("3 3");
    expect(gridProps.vertical).toBe(false);
    expect(gridProps.opacity).toBe(0.3);
  });

  it("configures Tooltip with correct styling", () => {
    render(<CustomBarChart data={sampleData} />);

    expect(Tooltip).toHaveBeenCalled();
    const tooltipProps = (Tooltip as unknown as jest.Mock).mock.calls[0][0];

    expect(tooltipProps.contentStyle).toHaveProperty("borderRadius", "4px");
    expect(tooltipProps.contentStyle).toHaveProperty("border", "none");
    expect(tooltipProps.contentStyle).toHaveProperty("boxShadow", "0 2px 8px rgba(0,0,0,0.15)");
    expect(tooltipProps.contentStyle).toHaveProperty("fontSize", "12px");
  });

  it("configures Bar with correct radius", () => {
    render(<CustomBarChart data={sampleData} />);

    expect(Bar).toHaveBeenCalled();
    const barProps = (Bar as unknown as jest.Mock).mock.calls[0][0];

    expect(barProps.radius).toEqual([4, 4, 0, 0]);
  });

  it("handles empty data gracefully", () => {
    render(<CustomBarChart data={[]} />);
    const chartData = screen.getByTestId("chart-data");
    expect(JSON.parse(chartData.textContent!)).toEqual([]);
  });

  it("renders chart with correct dimensions", () => {
    const { container } = render(<CustomBarChart data={sampleData} />);
    const chartContainer = container.querySelector(".w-full.h-\\[220px\\]");
    expect(chartContainer).toBeInTheDocument();
  });
});
