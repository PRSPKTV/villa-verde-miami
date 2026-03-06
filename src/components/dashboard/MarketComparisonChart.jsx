import { useState } from 'react';
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
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

const CHART_MODES = [
  { key: 'rate', label: 'Rate Comparison' },
  { key: 'occupancy', label: 'Occupancy' },
  { key: 'revenue', label: 'Revenue Index' },
];

export default function MarketComparisonChart({ neighborhoodData, yourMonthlyData, marketKPI }) {
  const [mode, setMode] = useState('rate');

  // Build daily rate comparison data
  const rateData = neighborhoodData.map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    market: d.p50_price ? Math.round(d.p50_price / 100) : null,
    p25: d.p25_price ? Math.round(d.p25_price / 100) : null,
    p75: d.p75_price ? Math.round(d.p75_price / 100) : null,
  }));

  // Build daily occupancy data
  const occData = neighborhoodData.map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    marketOcc: d.occupancy_rate != null ? Math.round(d.occupancy_rate * 100) : null,
    lastYearOcc: d.occ_last_year != null ? Math.round(d.occ_last_year * 100) : null,
  }));

  // Monthly revenue comparison — your revenue vs market KPI
  const revenueData = (yourMonthlyData || []).map((m) => {
    const kpiMonth = (marketKPI || []).find(k => {
      const kMonth = format(parseISO(k.month), 'MMM yyyy');
      return kMonth === m.month || format(parseISO(k.month), 'MMM') === m.month;
    });
    return {
      month: m.month,
      yours: m.revenue || 0,
      market: kpiMonth?.revenue ? Math.round(kpiMonth.revenue / 100) : null,
    };
  });

  return (
    <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6">
      {/* Mode tabs */}
      <div className="flex gap-1 mb-6">
        {CHART_MODES.map((cm) => (
          <button
            key={cm.key}
            onClick={() => setMode(cm.key)}
            className={`px-4 py-2 rounded-xl text-sm font-body font-medium transition-colors ${
              mode === cm.key
                ? 'bg-gold-100 text-gold-800'
                : 'text-text-muted hover:text-text-secondary hover:bg-cream-50'
            }`}
          >
            {cm.label}
          </button>
        ))}
      </div>

      {mode === 'rate' && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rateData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} interval="preserveStartEnd" />
            <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} />
            <Tooltip content={<CustomTooltip prefix="$" />} />
            <Legend />
            <Line type="monotone" dataKey="p25" stroke="#d4a843" strokeWidth={1} strokeDasharray="4 2" dot={false} name="25th percentile" />
            <Line type="monotone" dataKey="market" stroke="#d4a843" strokeWidth={2} dot={false} name="Market Median" />
            <Line type="monotone" dataKey="p75" stroke="#d4a843" strokeWidth={1} strokeDasharray="4 2" dot={false} name="75th percentile" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {mode === 'occupancy' && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={occData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }} interval="preserveStartEnd" />
            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} />
            <Tooltip content={<CustomTooltip suffix="%" />} />
            <Legend />
            <Bar dataKey="marketOcc" fill="#d4a843" radius={[2, 2, 0, 0]} name="Market Occ." />
            <Bar dataKey="lastYearOcc" fill="#22856a" radius={[2, 2, 0, 0]} opacity={0.5} name="Last Year Occ." />
          </BarChart>
        </ResponsiveContainer>
      )}

      {mode === 'revenue' && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} />
            <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} />
            <Tooltip content={<CustomTooltip prefix="$" />} />
            <Legend />
            <Bar dataKey="yours" fill="#22856a" radius={[4, 4, 0, 0]} name="Your Revenue" />
            <Bar dataKey="market" fill="#d4a843" radius={[4, 4, 0, 0]} opacity={0.7} name="Market Revenue" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
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
