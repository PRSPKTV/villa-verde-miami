import { TrendingUp, Percent, CalendarDays, Moon, BarChart3 } from 'lucide-react';

export default function MarketKPICards({ marketKPI, neighborhoodData, yourKpis }) {
  // Compute market averages from neighborhood data
  const avgMedianRate = neighborhoodData.length > 0
    ? Math.round(neighborhoodData.reduce((sum, d) => sum + (d.p50_price || 0), 0) / neighborhoodData.length / 100)
    : null;

  const avgOccupancy = neighborhoodData.length > 0
    ? Math.round(neighborhoodData.reduce((sum, d) => sum + (d.occupancy_rate || 0), 0) / neighborhoodData.length)
    : null;

  // KPI data from monthly aggregates
  const avgBookingWindow = marketKPI.length > 0
    ? (marketKPI.reduce((sum, k) => sum + (Number(k.avg_booking_window) || 0), 0) / marketKPI.length).toFixed(0)
    : null;

  const avgLOS = marketKPI.length > 0
    ? (marketKPI.reduce((sum, k) => sum + (Number(k.avg_length_of_stay) || 0), 0) / marketKPI.length).toFixed(1)
    : null;

  // Your rate vs market comparison
  const yourRate = yourKpis?.avgNightlyRate || 0;
  const rateDiff = avgMedianRate && yourRate
    ? (((yourRate - avgMedianRate) / avgMedianRate) * 100).toFixed(0)
    : null;

  const cards = [
    {
      label: 'Market Median Rate',
      value: avgMedianRate ? `$${avgMedianRate}` : '—',
      icon: TrendingUp,
    },
    {
      label: 'Market Occupancy',
      value: avgOccupancy != null ? `${avgOccupancy}%` : '—',
      icon: Percent,
    },
    {
      label: 'Avg Booking Window',
      value: avgBookingWindow ? `${avgBookingWindow} days` : '—',
      icon: CalendarDays,
    },
    {
      label: 'Avg Length of Stay',
      value: avgLOS ? `${avgLOS} nights` : '—',
      icon: Moon,
    },
    {
      label: 'Your Rate vs Market',
      value: rateDiff != null ? `${rateDiff > 0 ? '+' : ''}${rateDiff}%` : '—',
      icon: BarChart3,
      highlight: rateDiff != null ? (rateDiff > 0 ? 'text-gold-600' : 'text-verde-600') : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map(({ label, value, icon: Icon, highlight }) => (
        <div
          key={label}
          className="bg-surface rounded-2xl border border-gold-200 shadow-card p-4 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-50 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-gold-600" />
            </div>
          </div>
          <div>
            <p className={`font-heading text-2xl font-bold leading-tight ${highlight || 'text-text-primary'}`}>
              {value}
            </p>
            <p className="font-data text-[10px] uppercase tracking-wider text-text-muted mt-1">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
