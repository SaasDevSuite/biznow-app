"use client"

import type React from "react"
import {Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts"

export interface FrequencyData {
    day: string
    value: number
}

interface LineChartsProps {
    data: FrequencyData[]
    title?: string
}

const LineCharts: React.FC<LineChartsProps> = ({data, title}) => {
    return (
        <div className="w-full flex flex-col items-center justify-center h-full">
            {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{top: 5, right: 20, left: -10, bottom: 20}}>
                        <defs>
                            <linearGradient data-testid="colorValue" id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{fontSize: 11}} />
                        <YAxis tick={{fontSize: 11}} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                fontSize: "12px"
                            }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)"/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default LineCharts