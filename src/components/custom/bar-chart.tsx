"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

interface CustomBarChartProps {
  data: BarChartData[];
  title?: string;
  dataKey?: string;
  xAxisDataKey?: string;
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({
  data,
  title,
  dataKey = "value",
  xAxisDataKey = "name"
}) => {
  const fallbackColors = [
    "#3366CC",
    "#DC3912",
    "#FF9900",
    "#109618",
    "#990099",
    "#0099C6",
    "#DD4477",
    "#66AA00",
    "#B82E2E",
    "#316395",
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey={xAxisDataKey} 
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "4px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                fontSize: "12px"
              }}
            />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || fallbackColors[index % fallbackColors.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomBarChart;
