"use client"

import type React from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"

export interface FrequencyData {
    day: string
    value: number
}

interface LineChartsProps {
    data: FrequencyData[]
}

const LineCharts: React.FC<LineChartsProps> = ({ data }) => {
    return (
        <div className="w-full h-full">
            <h2 className="text-2xl font-bold mb-6">News Frequency</h2>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default LineCharts