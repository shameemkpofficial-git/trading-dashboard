import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { ChartPoint } from '../../types';
import { formatTimeShort, formatTimeFull, formatPrice } from '../../utils/formatters';
import {
  CHART_LINE_COLOR,
  CHART_GRID_STROKE,
  CHART_AXIS_STROKE,
  CHART_TOOLTIP_BG,
  CHART_TOOLTIP_BORDER,
  CHART_TOOLTIP_COLOR,
} from '../../constants';

interface Props {
  data: ChartPoint[];
  ticker: string;
}

const Chart = memo(({ data }: Props) => {
  return (
    <div className="chart-container" style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
          <XAxis
            dataKey="time"
            stroke={CHART_AXIS_STROKE}
            tickFormatter={(time) => formatTimeShort(time)}
          />
          <YAxis
            stroke={CHART_AXIS_STROKE}
            domain={['auto', 'auto']}
            tickFormatter={(value) => formatPrice(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_TOOLTIP_BG,
              border: `1px solid ${CHART_TOOLTIP_BORDER}`,
              color: CHART_TOOLTIP_COLOR,
            }}
            labelFormatter={(label) => formatTimeFull(label)}
            formatter={(value: any) => [formatPrice(Number(value)), 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={CHART_LINE_COLOR}
            dot={false}
            strokeWidth={2}
            animationDuration={300}
            isAnimationActive={false} // Prevents lag on high-frequency real-time updates
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

Chart.displayName = 'Chart';

export default Chart;
