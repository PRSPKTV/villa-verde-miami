import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useProperties } from '@/hooks/useProperties';
import { useCalendarMutations } from '@/hooks/useCalendarMutations';
import { useCalendarPricing } from '@/hooks/useCalendarPricing';
import { usePricingRules } from '@/hooks/usePricingRules';
import { usePricingMutations } from '@/hooks/usePricingMutations';
import CalendarDayCell from '@/components/dashboard/CalendarDayCell';
import CalendarPricingPanel from '@/components/dashboard/CalendarPricingPanel';
import PricingRulesManager from '@/components/dashboard/PricingRulesManager';
import IcalConnectionsManager from '@/components/dashboard/IcalConnectionsManager';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isBefore, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, RefreshCw, Lock, Unlock, DollarSign, CalendarDays, Link2 } from 'lucide-react';

export default function CalendarManagementPage() {
  const { properties } = useProperties();
  const { toggleDate, blockDates, unblockDates } = useCalendarMutations();
  const { upsertBulkPricing, deleteDatePricing, createPricingRule, updatePricingRule, deletePricingRule } = usePricingMutations();

  const [selectedSlug, setSelectedSlug] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');

  // Selection state
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showPricingPanel, setShowPricingPanel] = useState(false);

  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const { pricingData, refetch: refetchPricing } = useCalendarPricing(selectedSlug, monthStart, monthEnd);
  const { rules, refetch: refetchRules } = usePricingRules(selectedSlug);

  const selectedProperty = properties.find(p => p.slug === selectedSlug);
  const basePrice = selectedProperty?.pricing?.nightlyRate
    ? Math.round(selectedProperty.pricing.nightlyRate * 100)
    : null;

  // Auto-select first property
  useEffect(() => {
    if (properties.length > 0 && !selectedSlug) setSelectedSlug(properties[0].slug);
  }, [properties, selectedSlug]);

  // Fetch availability and bookings
  useEffect(() => {
    if (!selectedSlug) return;
    setLoading(true);
    Promise.all([
      supabase.from('calendar_availability').select('*').eq('property_slug', selectedSlug).gte('date', monthStart).lte('date', monthEnd),
      supabase.from('bookings').select('check_in, check_out, guest_first_name, guest_last_name, status').eq('property_slug', selectedSlug).eq('status', 'confirmed').gte('check_out', monthStart).lte('check_in', monthEnd),
    ]).then(([avRes, bkRes]) => {
      setBlockedDates((avRes.data || []).filter(d => d.is_blocked));
      setBookings(bkRes.data || []);
      setLoading(false);
    });
  }, [selectedSlug, currentMonth]);

  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }), [currentMonth]);
  const startPad = getDay(startOfMonth(currentMonth));

  const isBlocked = (date) => blockedDates.some(d => d.date === format(date, 'yyyy-MM-dd'));
  const isBooked = (date) => { const s = format(date, 'yyyy-MM-dd'); return bookings.some(b => s >= b.check_in && s < b.check_out); };
  const getBookingForDate = (date) => { const s = format(date, 'yyyy-MM-dd'); return bookings.find(b => s >= b.check_in && s < b.check_out); };
  const getPricingForDate = (date) => pricingData.find(p => p.date === format(date, 'yyyy-MM-dd'));

  const isInSelection = (day) => {
    if (!selectionStart || !selectionEnd) return false;
    const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart < selectionEnd ? selectionEnd : selectionStart;
    return day >= start && day <= end;
  };

  const handleDayClick = (day) => {
    if (isBefore(day, new Date()) && !isToday(day)) return;
    if (isBooked(day)) return;

    // If starting a selection
    if (!selectionStart) {
      setSelectionStart(day);
      setSelectionEnd(null);
      setSelectedDates([day]);
      setShowPricingPanel(true);
      return;
    }

    // If extending selection
    if (selectionStart && !selectionEnd) {
      const start = selectionStart < day ? selectionStart : day;
      const end = selectionStart < day ? day : selectionStart;
      const range = eachDayOfInterval({ start, end });
      setSelectionEnd(day);
      setSelectedDates(range);
      setShowPricingPanel(true);
      return;
    }

    // Reset and start new
    setSelectionStart(day);
    setSelectionEnd(null);
    setSelectedDates([day]);
    setShowPricingPanel(true);
  };

  const closePricingPanel = () => {
    setShowPricingPanel(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    setSelectedDates([]);
  };

  const handlePricingSave = async (dates, data) => {
    await upsertBulkPricing(selectedSlug, dates, data);
    refetchPricing();
    closePricingPanel();
  };

  const handlePricingClear = async (dates) => {
    await deleteDatePricing(selectedSlug, dates);
    refetchPricing();
    closePricingPanel();
  };

  const handleBulkBlock = async () => {
    const dates = selectedDates.filter(d => !isBefore(d, new Date()) || isToday(d)).filter(d => !isBooked(d)).map(d => format(d, 'yyyy-MM-dd'));
    await blockDates(selectedSlug, dates);
    setBlockedDates(prev => [...prev, ...dates.map(d => ({ date: d, is_blocked: true }))]);
    closePricingPanel();
  };

  const handleBulkUnblock = async () => {
    const dates = selectedDates.map(d => format(d, 'yyyy-MM-dd'));
    await unblockDates(selectedSlug, dates);
    setBlockedDates(prev => prev.filter(d => !dates.includes(d.date)));
    closePricingPanel();
  };

  const handleToggleDay = async (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const wasBlocked = isBlocked(day);
    await toggleDate(selectedSlug, dateStr, wasBlocked);
    if (wasBlocked) setBlockedDates(prev => prev.filter(d => d.date !== dateStr));
    else setBlockedDates(prev => [...prev, { date: dateStr, is_blocked: true }]);
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
      setTimeout(() => { setCurrentMonth(new Date(currentMonth)); setSyncing(false); }, 3000);
    } catch { setSyncing(false); }
  };

  const handleRuleCreate = async (data) => {
    await createPricingRule({ ...data, property_slug: selectedSlug });
    refetchRules();
  };

  const handleRuleUpdate = async (id, data) => {
    await updatePricingRule(id, data);
    refetchRules();
  };

  const handleRuleDelete = async (id) => {
    await deletePricingRule(id);
    refetchRules();
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-verde-800">Calendar</h1>
          <p className="text-text-secondary font-body mt-1">Manage availability, pricing, and blocked dates.</p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors disabled:opacity-50">
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Calendars'}
        </button>
      </div>

      {/* Property Selector + Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <select value={selectedSlug} onChange={e => setSelectedSlug(e.target.value)} className="px-4 py-2.5 rounded-xl border border-verde-200 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 min-w-[300px]">
          {properties.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
        <div className="flex gap-1 bg-cream-50 rounded-xl p-1 border border-verde-100">
          <button onClick={() => setActiveTab('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-sm transition-colors ${activeTab === 'calendar' ? 'bg-verde-500 text-cream-100 font-semibold' : 'text-verde-700 hover:bg-verde-50'}`}>
            <CalendarDays size={14} /> Calendar
          </button>
          <button onClick={() => setActiveTab('rules')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-sm transition-colors ${activeTab === 'rules' ? 'bg-verde-500 text-cream-100 font-semibold' : 'text-verde-700 hover:bg-verde-50'}`}>
            <DollarSign size={14} /> Pricing Rules
          </button>
          <button onClick={() => setActiveTab('connections')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-sm transition-colors ${activeTab === 'connections' ? 'bg-verde-500 text-cream-100 font-semibold' : 'text-verde-700 hover:bg-verde-50'}`}>
            <Link2 size={14} /> Connections
          </button>
        </div>
      </div>

      {activeTab === 'rules' ? (
        <PricingRulesManager rules={rules} onCreate={handleRuleCreate} onUpdate={handleRuleUpdate} onDelete={handleRuleDelete} />
      ) : activeTab === 'connections' ? (
        <IcalConnectionsManager propertySlug={selectedSlug} />
      ) : (
        <div className="flex gap-6">
          {/* Calendar Grid */}
          <div className="flex-1">
            {/* Bulk Actions */}
            {selectedDates.length > 1 && (
              <div className="mb-4 flex items-center gap-3 bg-verde-50 rounded-xl p-3 border border-verde-200">
                <span className="font-body text-sm text-verde-700">
                  {selectedDates.length} dates selected
                </span>
                <button onClick={handleBulkBlock} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-body text-xs font-semibold hover:bg-red-200">
                  <Lock size={12} /> Block All
                </button>
                <button onClick={handleBulkUnblock} className="flex items-center gap-1 px-3 py-1.5 bg-verde-100 text-verde-700 rounded-lg font-body text-xs font-semibold hover:bg-verde-200">
                  <Unlock size={12} /> Unblock All
                </button>
                <button onClick={closePricingPanel} className="text-text-muted font-body text-xs hover:underline ml-auto">Cancel</button>
              </div>
            )}

            <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-verde-50 text-verde-600"><ChevronLeft size={20} /></button>
                <h2 className="font-heading text-xl font-bold text-verde-800">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-verde-50 text-verde-600"><ChevronRight size={20} /></button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekdays.map(d => <div key={d} className="text-center font-data text-xs text-text-muted py-2 font-semibold">{d}</div>)}
              </div>

              {/* Days Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-verde-500 border-t-transparent" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} className="h-20" />)}
                  {days.map(day => {
                    const isPast = isBefore(day, new Date()) && !isToday(day);
                    const blocked = isBlocked(day);
                    const booked = isBooked(day);
                    const booking = getBookingForDate(day);
                    const customPricing = getPricingForDate(day);
                    const isSelected = selectedDates.length === 1 && isSameDay(selectedDates[0], day);

                    return (
                      <CalendarDayCell
                        key={day.toISOString()}
                        day={day}
                        isPast={isPast}
                        blocked={blocked}
                        booked={booked}
                        booking={booking}
                        customPricing={customPricing}
                        basePrice={basePrice}
                        isInSelection={isInSelection(day)}
                        isSelected={isSelected}
                        onClick={handleDayClick}
                      />
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-verde-100">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-verde-50 border border-verde-200" /> <span className="font-body text-xs text-text-muted">Available</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-50 border border-red-200" /> <span className="font-body text-xs text-text-muted">Blocked</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gold-100 border border-gold-200" /> <span className="font-body text-xs text-text-muted">Booked</span></div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gold-500" /> <span className="font-body text-xs text-text-muted">Has notes</span></div>
                <div className="flex items-center gap-2"><span className="font-data text-[10px] font-bold text-verde-600">$XX</span> <span className="font-body text-xs text-text-muted">Custom price</span></div>
              </div>
            </div>
          </div>

          {/* Pricing Panel (right side) */}
          {showPricingPanel && selectedDates.length > 0 && (
            <div className="w-80 shrink-0 hidden lg:block">
              <CalendarPricingPanel
                selectedDates={selectedDates}
                pricingData={pricingData}
                basePrice={basePrice}
                onSave={handlePricingSave}
                onClear={handlePricingClear}
                onClose={closePricingPanel}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
