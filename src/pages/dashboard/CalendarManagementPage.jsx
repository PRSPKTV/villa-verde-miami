import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useProperties } from '@/hooks/useProperties';
import { useCalendarMutations } from '@/hooks/useCalendarMutations';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isBefore, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, RefreshCw, Lock, Unlock } from 'lucide-react';

export default function CalendarManagementPage() {
  const { properties } = useProperties();
  const { toggleDate, blockDates, unblockDates } = useCalendarMutations();
  const [selectedSlug, setSelectedSlug] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);

  // Auto-select first property
  useEffect(() => {
    if (properties.length > 0 && !selectedSlug) {
      setSelectedSlug(properties[0].slug);
    }
  }, [properties, selectedSlug]);

  // Fetch availability and bookings for selected property & month
  useEffect(() => {
    if (!selectedSlug) return;
    setLoading(true);

    const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    Promise.all([
      supabase.from('calendar_availability').select('*').eq('property_slug', selectedSlug).gte('date', monthStart).lte('date', monthEnd),
      supabase.from('bookings').select('check_in, check_out, guest_first_name, guest_last_name, status').eq('property_slug', selectedSlug).eq('status', 'confirmed').gte('check_out', monthStart).lte('check_in', monthEnd),
    ]).then(([avRes, bkRes]) => {
      setBlockedDates((avRes.data || []).filter(d => d.is_blocked));
      setBookings(bkRes.data || []);
      setLoading(false);
    });
  }, [selectedSlug, currentMonth]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startPad = getDay(startOfMonth(currentMonth));

  const isBlocked = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.some(d => d.date === dateStr);
  };

  const isBooked = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.some(b => dateStr >= b.check_in && dateStr < b.check_out);
  };

  const getBookingForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.find(b => dateStr >= b.check_in && dateStr < b.check_out);
  };

  const handleDayClick = async (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return;
    if (isBooked(date)) return;

    if (selectionStart && !selectionEnd) {
      setSelectionEnd(date);
      return;
    }

    setSelectionStart(null);
    setSelectionEnd(null);

    const dateStr = format(date, 'yyyy-MM-dd');
    const wasBlocked = isBlocked(date);
    try {
      await toggleDate(selectedSlug, dateStr, wasBlocked);
      if (wasBlocked) {
        setBlockedDates(prev => prev.filter(d => d.date !== dateStr));
      } else {
        setBlockedDates(prev => [...prev, { date: dateStr, is_blocked: true }]);
      }
    } catch (err) {
      console.error('Failed to toggle date:', err);
    }
  };

  const handleBulkAction = async (action) => {
    if (!selectionStart || !selectionEnd) return;
    const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart < selectionEnd ? selectionEnd : selectionStart;
    const rangeDates = eachDayOfInterval({ start, end })
      .filter(d => !isBefore(d, new Date()) || isToday(d))
      .filter(d => !isBooked(d))
      .map(d => format(d, 'yyyy-MM-dd'));

    try {
      if (action === 'block') {
        await blockDates(selectedSlug, rangeDates);
        setBlockedDates(prev => [...prev, ...rangeDates.map(d => ({ date: d, is_blocked: true }))]);
      } else {
        await unblockDates(selectedSlug, rangeDates);
        setBlockedDates(prev => prev.filter(d => !rangeDates.includes(d.date)));
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      await fetch(`${url}/functions/v1/sync-calendar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      });
      // Refresh data after sync
      setTimeout(() => { setCurrentMonth(new Date(currentMonth)); setSyncing(false); }, 3000);
    } catch {
      setSyncing(false);
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-verde-800">Calendar</h1>
          <p className="text-text-secondary font-body mt-1">Manage availability and blocked dates.</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Airbnb'}
        </button>
      </div>

      {/* Property Selector */}
      <div className="mb-6">
        <select
          value={selectedSlug}
          onChange={e => setSelectedSlug(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-verde-200 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 min-w-[300px]"
        >
          {properties.map(p => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      {selectionStart && selectionEnd && (
        <div className="mb-4 flex items-center gap-3 bg-verde-50 rounded-xl p-3 border border-verde-200">
          <span className="font-body text-sm text-verde-700">
            Selected: {format(selectionStart < selectionEnd ? selectionStart : selectionEnd, 'MMM d')} - {format(selectionStart < selectionEnd ? selectionEnd : selectionStart, 'MMM d')}
          </span>
          <button onClick={() => handleBulkAction('block')} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-body text-xs font-semibold hover:bg-red-200">
            <Lock size={12} /> Block All
          </button>
          <button onClick={() => handleBulkAction('unblock')} className="flex items-center gap-1 px-3 py-1.5 bg-verde-100 text-verde-700 rounded-lg font-body text-xs font-semibold hover:bg-verde-200">
            <Unlock size={12} /> Unblock All
          </button>
          <button onClick={() => { setSelectionStart(null); setSelectionEnd(null); }} className="text-text-muted font-body text-xs hover:underline ml-auto">
            Cancel
          </button>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-verde-50 text-verde-600">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-heading text-xl font-bold text-verde-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-verde-50 text-verde-600">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(d => (
            <div key={d} className="text-center font-data text-xs text-text-muted py-2 font-semibold">{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-verde-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const isPast = isBefore(day, new Date()) && !isToday(day);
              const blocked = isBlocked(day);
              const booked = isBooked(day);
              const booking = getBookingForDate(day);
              const isInSelection = selectionStart && selectionEnd &&
                day >= (selectionStart < selectionEnd ? selectionStart : selectionEnd) &&
                day <= (selectionStart < selectionEnd ? selectionEnd : selectionStart);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  disabled={isPast}
                  title={booked ? `${booking.guest_first_name} ${booking.guest_last_name}` : blocked ? 'Blocked' : 'Available'}
                  className={`h-14 rounded-lg text-sm font-body flex flex-col items-center justify-center transition-all relative ${
                    isPast ? 'text-text-muted/30 cursor-not-allowed' :
                    isInSelection ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' :
                    booked ? 'bg-gold-100 text-gold-800 cursor-not-allowed' :
                    blocked ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                    'text-verde-800 hover:bg-verde-50'
                  }`}
                >
                  <span className="font-data text-sm">{format(day, 'd')}</span>
                  {booked && <span className="text-[9px] font-data">Booked</span>}
                  {blocked && !booked && <span className="text-[9px] font-data">Blocked</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-verde-100">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-verde-50 border border-verde-200" /> <span className="font-body text-xs text-text-muted">Available</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-100 border border-red-200" /> <span className="font-body text-xs text-text-muted">Blocked</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gold-100 border border-gold-200" /> <span className="font-body text-xs text-text-muted">Booked</span></div>
        </div>
      </div>
    </div>
  );
}
