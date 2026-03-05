import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

/**
 * Revenue chart wrapper — renders different chart types based on `chartType`.
 *
 * @param {{ monthlyData: array, prevYearData: array, showYoY: boolean, chartType: 'revenue'|'occupancy'|'avgRate' }} props
 */
export default function RevenueChart({ monthlyData = [], prevYearData = [], showYoY = false, chartType = 'revenue' }) {
  // Merge current + previous-year data by month label for overlay
  const mergedData = monthlyData.map((cur, i) => ({
    ...cur,
    prevRevenue: prevYearData[i]?.revenue ?? null,
    prevOccupancy: prevYearData[i]?.occupancy ?? null,
    prevAvgRate: prevYearData[i]?.avgRate ?? null,
  }));

  if (chartType === 'occupancy') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mergedData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          />
          <Tooltip content={<CustomTooltip valueKey="occupancy" suffix="%" />} />
          <Bar dataKey="occupancy" fill="#22856a" radius={[4, 4, 0, 0]} name="Occupancy" />
          {showYoY && (
            <Bar dataKey="prevOccupancy" fill="#d4a843" radius={[4, 4, 0, 0]} opacity={0.5} name="Prior Year" />
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // revenue or avgRate — both use LineChart
  const dataKey = chartType === 'avgRate' ? 'avgRate' : 'revenue';
  const prevKey = chartType === 'avgRate' ? 'prevAvgRate' : 'prevRevenue';
  const strokeColor = chartType === 'avgRate' ? '#d4a843' : '#22856a';
  const labelName = chartType === 'avgRate' ? 'Avg Rate' : 'Revenue';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mergedData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
        />
        <YAxis
          tickFormatter={(v) => `$${v.toLocaleString()}`}
          tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
        />
        <Tooltip content={<CustomTooltip valueKey={dataKey} prefix="$" />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={strokeColor}
          strokeWidth={2}
          dot={{ r: 4, fill: strokeColor }}
          activeDot={{ r: 6 }}
          name={labelName}
        />
        {showYoY && (
          <Line
            type="monotone"
            dataKey={prevKey}
            stroke="#d4a843"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: '#d4a843' }}
            name="Prior Year"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Custom Tooltip ───────────────────────────────────────────────

function CustomTooltip({ active, payload, label, valueKey, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-surface border border-verde-100 rounded-xl shadow-elevated px-4 py-3">
      <p className="font-body text-sm font-semibold text-text-primary mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-body text-sm text-text-secondary" style={{ color: entry.color }}>
          {entry.name}: {prefix}
          {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          {suffix}
        </p>
      ))}
    </div>
  );
}
