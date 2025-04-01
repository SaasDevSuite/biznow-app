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
    const fallbackColors = ["#4a69dd", "#90c469", "#f6c652", "#f05a5a", "#5ec8eb"];

    const total = data.reduce((acc, cur) => acc + cur.value, 0);

    const renderCustomizedLabel = (props: any) => {
        const {percent} = props;
        return `${(percent * 100).toFixed(0)}%`;
    };

    return (
        <div className="flex flex-col items-center">
            {title && <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>}
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={renderCustomizedLabel}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || fallbackColors[index % fallbackColors.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${((value / total) * 100).toFixed(0)}%`, "Percentage"]}/>
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center mt-6 gap-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <div
                            className="w-3 h-3 mr-2 rounded-sm"
                            style={{backgroundColor: item.color || fallbackColors[index % fallbackColors.length]}}
                        />
                        <span className="text-white text-sm">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;
