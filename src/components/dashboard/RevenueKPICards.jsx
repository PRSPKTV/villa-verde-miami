import React from 'react';
import { DollarSign, TrendingUp, Percent, Moon, CalendarCheck } from 'lucide-react';

const cards = [
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: DollarSign,
    format: (v) => `$${Number(v || 0).toLocaleString()}`,
  },
  {
    key: 'avgNightlyRate',
    label: 'Avg Nightly Rate',
    icon: TrendingUp,
    format: (v) => `$${Number(v || 0).toLocaleString()}`,
  },
  {
    key: 'occupancyRate',
    label: 'Occupancy Rate',
    icon: Percent,
    format: (v) => `${v || 0}%`,
  },
  {
    key: 'avgStayLength',
    label: 'Avg Stay Length',
    icon: Moon,
    format: (v) => `${v || 0} nights`,
  },
  {
    key: 'totalBookings',
    label: 'Total Bookings',
    icon: CalendarCheck,
    format: (v) => `${v || 0}`,
  },
];

export default function RevenueKPICards({ kpis }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map(({ key, label, icon: Icon, format: fmt }) => (
        <div
          key={key}
          className="bg-surface rounded-2xl border border-verde-100 shadow-card p-4 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-verde-50 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-verde-600" />
            </div>
          </div>

          <div>
            <p className="font-heading text-2xl font-bold text-text-primary leading-tight">
              {kpis ? fmt(kpis[key]) : '--'}
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
