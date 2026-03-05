import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { properties } from '@/data/properties';
import PropertyCard from '@/components/properties/PropertyCard';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { SlidersHorizontal, X, CalendarDays, Users, Minus, Plus, ChevronDown, Search } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, isSameDay, isToday } from 'date-fns';
import { useBooking } from '@/context/BookingContext';

export default function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const { updateSearchParams: updateBookingParams } = useBooking();
  const [guestFilter, setGuestFilter] = useState(parseInt(searchParams.get('guests')) || 0);
  const [bedroomFilter, setBedroomFilter] = useState(0);
  const [priceMax, setPriceMax] = useState(500);
  const [showFilters, setShowFilters] = useState(false);

  // Trip dates state
  const [checkIn, setCheckIn] = useState(() => {
    const ci = searchParams.get('checkIn');
    return ci ? new Date(ci + 'T12:00:00') : null;
  });
  const [checkOut, setCheckOut] = useState(() => {
    const co = searchParams.get('checkOut');
    return co ? new Date(co + 'T12:00:00') : null;
  });
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests')) || 0);
  const [activeField, setActiveField] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(checkIn || new Date());
  const dateBarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateBarRef.current && !dateBarRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateClick = (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return;
    if (activeField === 'checkin' || (!checkIn && activeField === 'checkout')) {
      setCheckIn(date);
      setCheckOut(null);
      setActiveField('checkout');
    } else if (activeField === 'checkout') {
      if (isBefore(date, checkIn)) {
        setCheckIn(date);
        setCheckOut(null);
      } else {
        setCheckOut(date);
        setActiveField(null);
        updateBookingParams({
          checkIn: format(checkIn, 'yyyy-MM-dd'),
          checkOut: format(date, 'yyyy-MM-dd'),
          guests,
        });
      }
    }
  };

  const clearDates = () => {
    setCheckIn(null);
    setCheckOut(null);
    setActiveField(null);
  };

  const filtered = useMemo(() => {
    return properties.filter(p => {
      if (guestFilter > 0 && p.details.maxGuests < guestFilter) return false;
      if (bedroomFilter > 0 && p.details.bedrooms < bedroomFilter) return false;
      if (p.pricing.nightlyRate > priceMax) return false;
      return true;
    });
  }, [guestFilter, bedroomFilter, priceMax]);

  const sectionRef = useGsapAnimation((el, gsap, ScrollTrigger) => {
    gsap.from(el.querySelectorAll('.property-card'), {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
  });

  const clearFilters = () => {
    setGuestFilter(0);
    setBedroomFilter(0);
    setPriceMax(500);
  };

  const hasActiveFilters = guestFilter > 0 || bedroomFilter > 0 || priceMax < 500;

  const renderCalendar = () => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPad = getDay(monthStart);
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            className="p-1 rounded-full hover:bg-verde-50 text-verde-600"
          >
            <ChevronDown size={16} className="rotate-90" />
          </button>
          <span className="font-body font-semibold text-verde-800 text-sm">
            {format(calendarMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            className="p-1 rounded-full hover:bg-verde-50 text-verde-600"
          >
            <ChevronDown size={16} className="-rotate-90" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(d => (
            <div key={d} className="text-center text-xs font-data text-text-muted py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map(day => {
            const isPast = isBefore(day, new Date()) && !isToday(day);
            const isSelected = (checkIn && isSameDay(day, checkIn)) || (checkOut && isSameDay(day, checkOut));
            const isInRange = checkIn && checkOut && day > checkIn && day < checkOut;

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                disabled={isPast}
                className={`w-9 h-9 rounded-full text-xs font-body flex items-center justify-center transition-all ${
                  isPast
                    ? 'text-text-muted/40 cursor-not-allowed'
                    : isSelected
                      ? 'bg-verde-500 text-cream-100 font-semibold'
                      : isInRange
                        ? 'bg-verde-100 text-verde-800'
                        : 'text-verde-800 hover:bg-verde-50'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-verde-800 mb-3">Our Properties</h1>
        <p className="text-text-secondary font-body text-lg max-w-xl">
          Handpicked retreats in the heart of Little Havana. Each one curated for comfort, style, and an authentic Miami experience.
        </p>
      </div>

      {/* Trip Dates Bar */}
      <div ref={dateBarRef} className="relative mb-8">
        <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-4 md:p-0 md:rounded-full md:flex md:items-stretch md:h-[68px] md:overflow-visible">
          {/* Check In */}
          <button
            onClick={() => setActiveField(activeField === 'checkin' ? null : 'checkin')}
            className={`w-full md:w-auto md:flex-1 flex items-center gap-3 px-4 py-3 md:py-0 md:px-6 rounded-xl md:rounded-l-full transition-colors ${
              activeField === 'checkin' ? 'bg-verde-50' : 'hover:bg-cream-50'
            }`}
          >
            <CalendarDays size={18} className="text-verde-400 shrink-0" />
            <div className="text-left">
              <div className="font-data text-[11px] uppercase tracking-wider text-text-muted">Check in</div>
              <div className="font-body text-sm font-medium text-verde-800">
                {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Add date'}
              </div>
            </div>
          </button>

          <div className="hidden md:block w-px bg-verde-100 my-4" />

          {/* Check Out */}
          <button
            onClick={() => setActiveField(activeField === 'checkout' ? null : 'checkout')}
            className={`w-full md:w-auto md:flex-1 flex items-center gap-3 px-4 py-3 md:py-0 md:px-6 transition-colors ${
              activeField === 'checkout' ? 'bg-verde-50' : 'hover:bg-cream-50'
            }`}
          >
            <CalendarDays size={18} className="text-verde-400 shrink-0" />
            <div className="text-left">
              <div className="font-data text-[11px] uppercase tracking-wider text-text-muted">Check out</div>
              <div className="font-body text-sm font-medium text-verde-800">
                {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Add date'}
              </div>
            </div>
          </button>

          <div className="hidden md:block w-px bg-verde-100 my-4" />

          {/* Guests */}
          <button
            onClick={() => setActiveField(activeField === 'guests' ? null : 'guests')}
            className={`w-full md:w-auto flex items-center gap-3 px-4 py-3 md:py-0 md:px-6 transition-colors ${
              activeField === 'guests' ? 'bg-verde-50' : 'hover:bg-cream-50'
            }`}
          >
            <Users size={18} className="text-verde-400 shrink-0" />
            <div className="text-left">
              <div className="font-data text-[11px] uppercase tracking-wider text-text-muted">Guests</div>
              <div className={`font-body text-sm font-medium ${guests === 0 ? 'text-text-muted' : 'text-verde-800'}`}>
                {guests === 0 ? 'Add guests' : `${guests} ${guests === 1 ? 'guest' : 'guests'}`}
              </div>
            </div>
          </button>

          {/* Clear dates button */}
          {(checkIn || checkOut) && (
            <div className="flex items-center px-3">
              <button
                onClick={clearDates}
                className="p-2 rounded-full text-text-muted hover:bg-verde-50 hover:text-verde-600 transition-colors"
                title="Clear dates"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Calendar dropdown */}
        {(activeField === 'checkin' || activeField === 'checkout') && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-surface rounded-2xl shadow-elevated border border-verde-100 z-50">
            {renderCalendar()}
          </div>
        )}

        {/* Guests dropdown */}
        {activeField === 'guests' && (
          <div className="absolute top-full right-4 md:right-16 mt-3 w-64 bg-surface rounded-2xl shadow-elevated border border-verde-100 p-5 z-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-body font-medium text-verde-800 text-sm">Guests</div>
                <div className="font-body text-xs text-text-muted">Max 8 guests</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests(Math.max(0, guests - 1))}
                  className="w-8 h-8 rounded-full border border-verde-200 flex items-center justify-center text-verde-600 hover:border-verde-400 transition-colors disabled:opacity-30"
                  disabled={guests <= 0}
                >
                  <Minus size={14} />
                </button>
                <span className="font-data text-base font-semibold text-verde-800 w-4 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(8, guests + 1))}
                  className="w-8 h-8 rounded-full border border-verde-200 flex items-center justify-center text-verde-600 hover:border-verde-400 transition-colors disabled:opacity-30"
                  disabled={guests >= 8}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-verde-200 text-verde-600 font-body text-sm font-medium hover:bg-verde-50 transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-verde-50 text-verde-500 font-body text-sm font-medium hover:bg-verde-100 transition-colors"
          >
            <X size={14} /> Clear all
          </button>
        )}

        <span className="text-text-muted font-data text-sm ml-auto">
          {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

      {showFilters && (
        <div className="mb-8 p-6 bg-surface rounded-2xl border border-verde-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-body font-medium text-verde-700 mb-2">Guests</label>
            <select
              value={guestFilter}
              onChange={(e) => setGuestFilter(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            >
              <option value={0}>Any</option>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}+ guests</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-verde-700 mb-2">Bedrooms</label>
            <select
              value={bedroomFilter}
              onChange={(e) => setBedroomFilter(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            >
              <option value={0}>Any</option>
              {[1, 2, 3].map(n => (
                <option key={n} value={n}>{n}+ bedrooms</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-verde-700 mb-2">
              Max price: <span className="font-data text-gold-600">${priceMax}/night</span>
            </label>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={priceMax}
              onChange={(e) => setPriceMax(parseInt(e.target.value))}
              className="w-full accent-verde-500"
            />
          </div>
        </div>
      )}

      <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(property => (
          <div key={property.id} className="property-card">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted font-body text-lg mb-4">No properties match your filters.</p>
          <button onClick={clearFilters} className="text-verde-500 font-body font-semibold underline">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
