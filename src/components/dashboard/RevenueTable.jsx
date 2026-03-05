import React from 'react';
import { Download } from 'lucide-react';

/**
 * Monthly revenue breakdown table.
 *
 * @param {{ monthlyData: array, onExport: () => void }} props
 */
export default function RevenueTable({ monthlyData = [], onExport }) {
  // Totals row
  const totals = monthlyData.reduce(
    (acc, m) => {
      acc.bookings += m.bookings;
      acc.nights += m.nights;
      acc.revenue += m.revenue;
      acc.rateSum += m.avgRate * m.bookings;
      acc.rateCount += m.bookings;
      acc.occSum += m.occupancy;
      acc.occCount += 1;
      return acc;
    },
    { bookings: 0, nights: 0, revenue: 0, rateSum: 0, rateCount: 0, occSum: 0, occCount: 0 }
  );

  const avgRate = totals.rateCount > 0 ? Math.round(totals.rateSum / totals.rateCount) : 0;
  const avgOcc = totals.occCount > 0 ? Math.round(totals.occSum / totals.occCount) : 0;

  return (
    <div className="bg-surface rounded-2xl border border-verde-100 shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-verde-100">
        <h3 className="font-heading text-lg font-bold text-text-primary">Monthly Breakdown</h3>
        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body font-medium rounded-xl border border-verde-200 text-verde-700 hover:bg-verde-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-verde-50/50">
              {['Month', 'Bookings', 'Nights', 'Revenue', 'Avg Rate', 'Occupancy'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 font-data text-[10px] uppercase tracking-wider text-text-muted font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-verde-50">
            {monthlyData.map((row, i) => (
              <tr key={i} className="hover:bg-cream-50/40 transition-colors">
                <td className="px-6 py-3 font-body text-sm text-text-primary font-medium">
                  {row.month}
                </td>
                <td className="px-6 py-3 font-data text-sm text-text-secondary">
                  {row.bookings}
                </td>
                <td className="px-6 py-3 font-data text-sm text-text-secondary">
                  {row.nights}
                </td>
                <td className="px-6 py-3 font-data text-sm text-text-primary font-medium">
                  ${row.revenue.toLocaleString()}
                </td>
                <td className="px-6 py-3 font-data text-sm text-text-secondary">
                  ${row.avgRate.toLocaleString()}
                </td>
                <td className="px-6 py-3 font-data text-sm text-text-secondary">
                  {row.occupancy}%
                </td>
              </tr>
            ))}

            {/* Totals row */}
            {monthlyData.length > 0 && (
              <tr className="bg-verde-50/30 border-t-2 border-verde-200">
                <td className="px-6 py-3 font-body text-sm text-text-primary font-bold">Total</td>
                <td className="px-6 py-3 font-data text-sm text-text-primary font-bold">
                  {totals.bookings}
                </td>
                <td className="px-6 py-3 font-data text-sm text-text-primary font-bold">
                  {totals.nights}
                </td>
                <td className="px-6 py-3 font-data text-sm text-text-primary font-bold">
                  ${totals.revenue.toLocaleString()}
                </td>
                <td className="px-6 py-3 font-data text-sm text-text-primary font-bold">
                  ${avgRate.toLocaleString()}
                </td>
                <td className="px-6 py-3 font-data text-sm text-text-primary font-bold">
                  {avgOcc}%
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {monthlyData.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-body text-sm text-text-muted">No data for the selected period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
