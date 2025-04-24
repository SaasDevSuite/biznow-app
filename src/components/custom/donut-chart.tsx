"use client";

import React from "react";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";

export interface ChartData {
    name: string;
    value: number;
    color?: string;
}

interface DonutChartProps {
    data: ChartData[];
    title?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({data, title}) => {
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

    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    return (
        <div className="flex flex-col items-center w-full">
            {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
            <div className="flex flex-row w-full items-center">
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={sortedData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                fill="#8884d8"
                                paddingAngle={3}
                                dataKey="value"
                                label={false}
                                labelLine={false}
                                strokeWidth={1}
                                stroke="#ffffff"
                            >
                                {sortedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color || fallbackColors[index % fallbackColors.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => [`${((value / total) * 100).toFixed(1)}%`, "Percentage"]}
                                contentStyle={{
                                    borderRadius: "4px",
                                    border: "none",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    fontSize: "12px"
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="flex-1 pl-2">
                    <div className="flex flex-col space-y-2">
                        {sortedData.map((item, index) => {
                            const percentage = ((item.value / total) * 100).toFixed(1);
                            const color = item.color || fallbackColors[index % fallbackColors.length];
                            
                            return (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className="w-3 h-3 mr-2 rounded-sm"
                                            style={{backgroundColor: color}}
                                        />
                                        <span className="text-xs font-medium truncate max-w-[100px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold ml-2">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonutChart;
