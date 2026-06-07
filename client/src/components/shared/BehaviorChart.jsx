import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';

/**
 * BehaviorChart
 *
 * Props:
 *   sessions    — array of session objects with a `scores` array and `session_date`
 *   metrics     — array of metric objects { id, name, color, lower_is_better, scale_min, scale_max }
 *   height      — chart height (default 320)
 */
export default function BehaviorChart({ sessions = [], metrics = [], height = 320 }) {
  // Transform sessions into chart data points
  const data = sessions
    .slice()
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
    .map(session => {
      const point = {
        date: format(parseISO(session.session_date), 'MMM d'),
        fullDate: session.session_date,
      };
      (session.scores || []).forEach(s => {
        point[s.metric_id] = parseFloat(s.score);
      });
      return point;
    });

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No sessions logged yet. Add a session to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="behavior-chart">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={[
              metrics[0]?.scale_min ?? 1,
              metrics[0]?.scale_max ?? 10
            ]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: 13,
            }}
            formatter={(value, name) => {
              const metric = metrics.find(m => m.id === name);
              return [value, metric?.name ?? name];
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Legend
            formatter={(value) => {
              const metric = metrics.find(m => m.id === value);
              return metric?.name ?? value;
            }}
            wrapperStyle={{ fontSize: 13 }}
          />
          {metrics.map(metric => (
            <Line
              key={metric.id}
              type="monotone"
              dataKey={metric.id}
              name={metric.id}
              stroke={metric.color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: metric.color, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
