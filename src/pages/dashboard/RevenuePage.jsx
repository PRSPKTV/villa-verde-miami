import React, { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subYears,
  format,
} from 'date-fns';
import { Loader2 } from 'lucide-react';

import useRevenue from '@/hooks/useRevenue';
import { useProperties } from '@/hooks/useProperties';
import { usePriceLabsNeighborhood } from '@/hooks/usePriceLabsNeighborhood';
import { usePriceLabsMarketKPI } from '@/hooks/usePriceLabsMarketKPI';
import RevenueKPICards from '@/components/dashboard/RevenueKPICards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RevenueTable from '@/components/dashboard/RevenueTable';
import MarketKPICards from '@/components/dashboard/MarketKPICards';
import MarketComparisonChart from '@/components/dashboard/MarketComparisonChart';
import { generateCSV, downloadCSV } from '@/utils/csvExport';

// ── Period presets ────────────────────────────────────────────────

const PERIODS = [
  { key: 'this-month', label: 'This Month' },
  { key: 'last-month', label: 'Last Month' },
  { key: 'this-quarter', label: 'This Quarter' },
  { key: 'this-year', label: 'This Year' },
  { key: 'last-year', label: 'Last Year' },
];

function getDateRange(periodKey) {
  const now = new Date();
  switch (periodKey) {
    case 'this-month':
      return { start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') };
    case 'last-month': {
      const prev = subMonths(now, 1);
      return { start: format(startOfMonth(prev), 'yyyy-MM-dd'), end: format(endOfMonth(prev), 'yyyy-MM-dd') };
    }
    case 'this-quarter':
      return { start: format(startOfQuarter(now), 'yyyy-MM-dd'), end: format(endOfQuarter(now), 'yyyy-MM-dd') };
    case 'this-year':
      return { start: format(startOfYear(now), 'yyyy-MM-dd'), end: format(endOfYear(now), 'yyyy-MM-dd') };
    case 'last-year': {
      const ly = subYears(now, 1);
      return { start: format(startOfYear(ly), 'yyyy-MM-dd'), end: format(endOfYear(ly), 'yyyy-MM-dd') };
    }
    default:
      return { start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') };
  }
}

// ── Chart type tabs ──────────────────────────────────────────────

const CHART_TYPES = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'occupancy', label: 'Occupancy' },
  { key: 'avgRate', label: 'Avg Rate' },
];

const VIEW_TABS = [
  { key: 'your-data', label: 'Your Data' },
  { key: 'market', label: 'Market Intelligence' },
  { key: 'comparison', label: 'Comparison' },
];

// ── Page Component ───────────────────────────────────────────────

export default function RevenuePage() {
  const [period, setPeriod] = useState('this-year');
  const [propertySlug, setPropertySlug] = useState(null);
  const [showYoY, setShowYoY] = useState(false);
  const [chartType, setChartType] = useState('revenue');
  const [viewTab, setViewTab] = useState('your-data');

  const dateRange = useMemo(() => getDateRange(period), [period]);
  const { kpis, monthlyData, prevYearData, loading, error } = useRevenue(dateRange, propertySlug);
  const { properties } = useProperties();

  // PriceLabs market data
  const { data: neighborhoodData, loading: neighborhoodLoading } = usePriceLabsNeighborhood(
    propertySlug || (properties?.[0]?.slug || null),
    dateRange.start,
    dateRange.end
  );
  const { data: marketKPI, loading: kpiLoading } = usePriceLabsMarketKPI(
    propertySlug || (properties?.[0]?.slug || null),
    dateRange.start,
    dateRange.end
  );

  // CSV export handler
  const handleExport = () => {
    if (!monthlyData?.length) return;

    const headers = ['Month', 'Bookings', 'Nights', 'Revenue', 'Avg Rate', 'Occupancy'];
    const rows = monthlyData.map((m) => [
      m.month,
      String(m.bookings),
      String(m.nights),
      `$${m.revenue.toLocaleString()}`,
      `$${m.avgRate.toLocaleString()}`,
      `${m.occupancy}%`,
    ]);

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, `revenue-${period}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">Revenue</h1>
        <p className="font-body text-sm text-text-muted mt-1">Track financial performance & market intelligence</p>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 bg-cream-50 rounded-xl p-1 border border-verde-100 w-fit">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
              viewTab === tab.key
                ? tab.key === 'market' || tab.key === 'comparison'
                  ? 'bg-gold-500 text-white font-semibold'
                  : 'bg-verde-500 text-cream-100 font-semibold'
                : 'text-verde-700 hover:bg-verde-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Period selector */}
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-xl text-sm font-body font-medium transition-colors ${
                period === p.key
                  ? 'bg-verde-600 text-white shadow-sm'
                  : 'bg-verde-50 text-verde-700 hover:bg-verde-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Property filter */}
        <select
          value={propertySlug || ''}
          onChange={(e) => setPropertySlug(e.target.value || null)}
          className="px-3 py-1.5 rounded-xl border border-verde-200 bg-surface font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-verde-300"
        >
          <option value="">All Properties</option>
          {(properties || []).map((prop) => (
            <option key={prop.slug} value={prop.slug}>
              {prop.name}
            </option>
          ))}
        </select>

        {/* YoY toggle (only for Your Data tab) */}
        {viewTab === 'your-data' && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showYoY}
              onChange={(e) => setShowYoY(e.target.checked)}
              className="w-4 h-4 rounded border-verde-300 text-verde-600 focus:ring-verde-500"
            />
            <span className="font-body text-sm text-text-secondary">Year-over-year</span>
          </label>
        )}
      </div>

      {/* Loading / error states */}
      {(loading || (viewTab !== 'your-data' && (neighborhoodLoading || kpiLoading))) && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-verde-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-body text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Your Data Tab ────────────────────────────────────────── */}
      {viewTab === 'your-data' && !loading && !error && (
        <>
          <RevenueKPICards kpis={kpis} />

          <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6">
            <div className="flex gap-1 mb-6">
              {CHART_TYPES.map((ct) => (
                <button
                  key={ct.key}
                  onClick={() => setChartType(ct.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-body font-medium transition-colors ${
                    chartType === ct.key
                      ? 'bg-verde-100 text-verde-800'
                      : 'text-text-muted hover:text-text-secondary hover:bg-cream-50'
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>

            <RevenueChart
              monthlyData={monthlyData}
              prevYearData={prevYearData}
              showYoY={showYoY}
              chartType={chartType}
            />
          </div>

          <RevenueTable monthlyData={monthlyData} onExport={handleExport} />
        </>
      )}

      {/* ── Market Intelligence Tab ──────────────────────────────── */}
      {viewTab === 'market' && !neighborhoodLoading && !kpiLoading && (
        <>
          {!propertySlug && (
            <div className="bg-gold-50 border border-gold-200 rounded-xl p-3">
              <p className="font-body text-sm text-gold-700">Select a specific property above to see its market data. Showing data for your first property.</p>
            </div>
          )}

          <MarketKPICards
            marketKPI={marketKPI}
            neighborhoodData={neighborhoodData}
            yourKpis={kpis}
          />

          <MarketComparisonChart
            neighborhoodData={neighborhoodData}
            yourMonthlyData={monthlyData}
            marketKPI={marketKPI}
          />
        </>
      )}

      {/* ── Comparison Tab ───────────────────────────────────────── */}
      {viewTab === 'comparison' && !loading && !neighborhoodLoading && !kpiLoading && (
        <>
          {!propertySlug && (
            <div className="bg-gold-50 border border-gold-200 rounded-xl p-3">
              <p className="font-body text-sm text-gold-700">Select a specific property above for the most accurate comparison.</p>
            </div>
          )}

          {/* Side-by-side KPI comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-verde-800 mb-3">Your Performance</h3>
              <RevenueKPICards kpis={kpis} />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-gold-700 mb-3">Market Data</h3>
              <MarketKPICards
                marketKPI={marketKPI}
                neighborhoodData={neighborhoodData}
                yourKpis={kpis}
              />
            </div>
          </div>

          <MarketComparisonChart
            neighborhoodData={neighborhoodData}
            yourMonthlyData={monthlyData}
            marketKPI={marketKPI}
          />
        </>
      )}
    </div>
  );
}
