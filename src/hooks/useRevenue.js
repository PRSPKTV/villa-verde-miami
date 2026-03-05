import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  startOfMonth,
  endOfMonth,
  subYears,
  differenceInDays,
  format,
  parseISO,
} from 'date-fns';

/**
 * Revenue data-fetching hook.
 * Queries the bookings table directly for confirmed bookings within a date range,
 * calculates KPIs, monthly breakdowns, YoY comparison data, and per-property splits.
 *
 * All monetary values in the DB are stored in cents and converted to dollars here.
 *
 * @param {{ start: string, end: string }} dateRange  — 'yyyy-MM-dd' strings
 * @param {string|null} propertySlug — optional filter to a single property
 */
export default function useRevenue(dateRange, propertySlug = null) {
  const [kpis, setKpis] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [prevYearData, setPrevYearData] = useState([]);
  const [byProperty, setByProperty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dateRange?.start || !dateRange?.end) return;

    let cancelled = false;

    async function fetchRevenue() {
      setLoading(true);
      setError(null);

      try {
        // ── Current-period bookings ───────────────────────────────
        let bookingsQuery = supabase
          .from('bookings')
          .select('id, total, nightly_rate, nights, check_in, property_id, properties(name)')
          .eq('status', 'confirmed')
          .gte('check_in', dateRange.start)
          .lte('check_in', dateRange.end);

        if (propertySlug) {
          bookingsQuery = bookingsQuery.eq('property_slug', propertySlug);
        }

        const { data: bookings, error: bookingsErr } = await bookingsQuery;
        if (bookingsErr) throw bookingsErr;

        // ── Blocked days (for occupancy) ─────────────────────────
        let blockedQuery = supabase
          .from('calendar_availability')
          .select('date, property_id')
          .eq('is_blocked', true)
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);

        if (propertySlug) {
          blockedQuery = blockedQuery.eq('property_slug', propertySlug);
        }

        const { data: blockedDays, error: blockedErr } = await blockedQuery;
        if (blockedErr) throw blockedErr;

        // ── Previous-year bookings (YoY) ─────────────────────────
        const prevStart = format(subYears(parseISO(dateRange.start), 1), 'yyyy-MM-dd');
        const prevEnd = format(subYears(parseISO(dateRange.end), 1), 'yyyy-MM-dd');

        let prevQuery = supabase
          .from('bookings')
          .select('id, total, nightly_rate, nights, check_in, property_id, properties(name)')
          .eq('status', 'confirmed')
          .gte('check_in', prevStart)
          .lte('check_in', prevEnd);

        if (propertySlug) {
          prevQuery = prevQuery.eq('property_slug', propertySlug);
        }

        const { data: prevBookings, error: prevErr } = await prevQuery;
        if (prevErr) throw prevErr;

        if (cancelled) return;

        // ── KPI calculations ─────────────────────────────────────
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0) / 100;
        const totalBookings = bookings.length;
        const totalNights = bookings.reduce((sum, b) => sum + (b.nights || 0), 0);
        const avgNightlyRate =
          totalBookings > 0
            ? bookings.reduce((sum, b) => sum + (b.nightly_rate || 0), 0) / totalBookings / 100
            : 0;
        const avgStayLength =
          totalBookings > 0
            ? totalNights / totalBookings
            : 0;

        // Occupancy = booked nights / available nights
        const totalDaysInPeriod =
          differenceInDays(parseISO(dateRange.end), parseISO(dateRange.start)) + 1;
        const blockedCount = blockedDays?.length || 0;
        const availableDays = Math.max(totalDaysInPeriod - blockedCount, 1);
        const occupancyRate = Math.min((totalNights / availableDays) * 100, 100);

        setKpis({
          totalRevenue,
          avgNightlyRate: Math.round(avgNightlyRate),
          occupancyRate: Math.round(occupancyRate),
          avgStayLength: Math.round(avgStayLength * 10) / 10,
          totalBookings,
          totalNights,
        });

        // ── Monthly breakdown ────────────────────────────────────
        const monthlyMap = buildMonthlyMap(bookings, dateRange, blockedDays);
        setMonthlyData(monthlyMap);

        // ── Previous-year monthly breakdown ──────────────────────
        const prevMonthlyMap = buildMonthlyMap(prevBookings, { start: prevStart, end: prevEnd }, []);
        setPrevYearData(prevMonthlyMap);

        // ── By-property breakdown ────────────────────────────────
        const propMap = {};
        bookings.forEach((b) => {
          const name = b.properties?.name || 'Unknown';
          if (!propMap[name]) propMap[name] = 0;
          propMap[name] += (b.total || 0) / 100;
        });
        setByProperty(
          Object.entries(propMap)
            .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
            .sort((a, b) => b.revenue - a.revenue)
        );
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load revenue data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRevenue();
    return () => {
      cancelled = true;
    };
  }, [dateRange?.start, dateRange?.end, propertySlug]);

  return { kpis, monthlyData, prevYearData, byProperty, loading, error };
}

// ── Helpers ──────────────────────────────────────────────────────

function buildMonthlyMap(bookings, dateRange, blockedDays) {
  const months = {};

  // Seed every month in the range so gaps still appear
  let cursor = parseISO(dateRange.start);
  const end = parseISO(dateRange.end);
  while (cursor <= end) {
    const key = format(cursor, 'yyyy-MM');
    if (!months[key]) {
      months[key] = {
        month: format(cursor, 'MMM'),
        revenue: 0,
        bookings: 0,
        nights: 0,
        totalRate: 0,
        rateCount: 0,
        avgRate: 0,
        occupancy: 0,
      };
    }
    cursor = startOfMonth(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  }

  // Aggregate bookings
  bookings.forEach((b) => {
    const key = format(parseISO(b.check_in), 'yyyy-MM');
    if (!months[key]) return;
    months[key].revenue += (b.total || 0) / 100;
    months[key].bookings += 1;
    months[key].nights += b.nights || 0;
    months[key].totalRate += (b.nightly_rate || 0) / 100;
    months[key].rateCount += 1;
  });

  // Build blocked-days-per-month map
  const blockedPerMonth = {};
  (blockedDays || []).forEach((d) => {
    const key = format(parseISO(d.date), 'yyyy-MM');
    blockedPerMonth[key] = (blockedPerMonth[key] || 0) + 1;
  });

  // Finalize averages and occupancy
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, m]) => {
      const [year, mo] = key.split('-').map(Number);
      const daysInMonth = new Date(year, mo, 0).getDate();

      // Clamp to actual range dates
      const monthStart = new Date(year, mo - 1, 1);
      const monthEnd = new Date(year, mo, 0);
      const rangeStart = parseISO(dateRange.start);
      const rangeEnd = parseISO(dateRange.end);
      const effectiveStart = monthStart < rangeStart ? rangeStart : monthStart;
      const effectiveEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd;
      const effectiveDays = differenceInDays(effectiveEnd, effectiveStart) + 1;

      const blocked = blockedPerMonth[key] || 0;
      const available = Math.max(effectiveDays - blocked, 1);
      const occupancy = Math.min(Math.round((m.nights / available) * 100), 100);

      return {
        month: m.month,
        revenue: Math.round(m.revenue),
        bookings: m.bookings,
        nights: m.nights,
        avgRate: m.rateCount > 0 ? Math.round(m.totalRate / m.rateCount) : 0,
        occupancy,
      };
    });
}
