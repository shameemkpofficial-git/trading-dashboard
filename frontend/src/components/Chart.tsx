import { memo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import type { ChartPoint } from "../types";

interface Props {
    data: ChartPoint[];
    ticker: string;
}

const Chart = memo(({ data }: Props) => {
    return (
        <div className="chart-container" style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#272a3b" />
                    <XAxis 
                        dataKey="time" 
                        stroke="#8c93a8" 
                        tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    />
                    <YAxis 
                        stroke="#8c93a8" 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#14161f', border: '1px solid #272a3b', color: '#f0f2f7' }}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#00d382" 
                        dot={false}
                        strokeWidth={2}
                        animationDuration={300}
                        isAnimationActive={false} // Prevents lag on high frequency real-time updates
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
});

Chart.displayName = 'Chart';

export default Chart;