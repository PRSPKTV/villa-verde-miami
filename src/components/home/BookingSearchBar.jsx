import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, CalendarDays, Users, Minus, Plus } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, isSameDay, isToday } from 'date-fns';
import { useProperties } from '@/hooks/useProperties';
import { useBooking } from '@/context/BookingContext';

export default function BookingSearchBar() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { updateSearchParams } = useBooking();
  const [activeField, setActiveField] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const barRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    setActiveField(null);
    updateSearchParams({
      checkIn: checkIn ? format(checkIn, 'yyyy-MM-dd') : null,
      checkOut: checkOut ? format(checkOut, 'yyyy-MM-dd') : null,
      guests,
    });

    const params = new URLSearchParams();
    if (selectedProperty !== 'all') params.set('property', selectedProperty);
    if (checkIn) params.set('checkIn', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) params.set('checkOut', format(checkOut, 'yyyy-MM-dd'));
    params.set('guests', guests.toString());

    navigate(`/properties?${params.toString()}`);
  };

  const handleDateClick = (date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return;

    const isCheckinField = activeField === 'checkin' || activeField === 'm-checkin';
    const isCheckoutField = activeField === 'checkout' || activeField === 'm-checkout';
    const isMobile = activeField === 'm-checkin' || activeField === 'm-checkout';

    if (isCheckinField || (!checkIn && isCheckoutField)) {
      setCheckIn(date);
      setCheckOut(null);
      setActiveField(isMobile ? 'm-checkout' : 'checkout');
    } else if (isCheckoutField) {
      if (isBefore(date, checkIn)) {
        setCheckIn(date);
        setCheckOut(null);
      } else {
        setCheckOut(date);
        setActiveField(isMobile ? 'mobile' : null);
      }
    }
  };

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
    <div ref={barRef} className="relative w-full max-w-5xl mx-auto">
      {/* Main Pill Bar — desktop only */}
      <div className="hidden md:flex bg-surface/95 backdrop-blur-xl rounded-full shadow-elevated border border-verde-100/50 items-stretch h-[84px] overflow-visible">

        {/* Property Selector */}
        <button
          onClick={() => setActiveField(activeField === 'property' ? null : 'property')}
          className={`flex-1 flex items-center gap-3 px-6 md:px-8 rounded-l-full transition-colors ${
            activeField === 'property' ? 'bg-verde-50' : 'hover:bg-cream-50'
          }`}
        >
          <div className="text-left min-w-0">
            <div className="font-data text-[12px] uppercase tracking-wider text-text-muted">Property</div>
            <div className="font-body text-lg font-medium text-verde-800 truncate">
              {selectedProperty === 'all' ? 'All properties' : properties.find(p => p.slug === selectedProperty)?.name.split(':')[0] || 'All properties'}
            </div>
          </div>
          <ChevronDown size={16} className="text-text-muted shrink-0" />
        </button>

        <div className="w-px bg-verde-100 my-5" />

        {/* Check In */}
        <button
          onClick={() => setActiveField(activeField === 'checkin' ? null : 'checkin')}
          className={`flex-1 flex items-center gap-3 px-6 md:px-8 transition-colors ${
            activeField === 'checkin' ? 'bg-verde-50' : 'hover:bg-cream-50'
          }`}
        >
          <CalendarDays size={20} className="text-verde-400 shrink-0 hidden sm:block" />
          <div className="text-left">
            <div className="font-data text-[12px] uppercase tracking-wider text-text-muted">Check in</div>
            <div className="font-body text-lg font-medium text-verde-800">
              {checkIn ? format(checkIn, 'MMM d') : 'Add date'}
            </div>
          </div>
        </button>

        <div className="w-px bg-verde-100 my-5" />

        {/* Check Out */}
        <button
          onClick={() => setActiveField(activeField === 'checkout' ? null : 'checkout')}
          className={`flex-1 flex items-center gap-3 px-6 md:px-8 transition-colors ${
            activeField === 'checkout' ? 'bg-verde-50' : 'hover:bg-cream-50'
          }`}
        >
          <CalendarDays size={20} className="text-verde-400 shrink-0 hidden sm:block" />
          <div className="text-left">
            <div className="font-data text-[12px] uppercase tracking-wider text-text-muted">Check out</div>
            <div className="font-body text-lg font-medium text-verde-800">
              {checkOut ? format(checkOut, 'MMM d') : 'Add date'}
            </div>
          </div>
        </button>

        <div className="w-px bg-verde-100 my-5" />

        {/* Guests */}
        <button
          onClick={() => setActiveField(activeField === 'guests' ? null : 'guests')}
          className={`flex items-center gap-3 px-6 md:px-8 transition-colors ${
            activeField === 'guests' ? 'bg-verde-50' : 'hover:bg-cream-50'
          }`}
        >
          <Users size={20} className="text-verde-400 shrink-0 hidden sm:block" />
          <div className="text-left">
            <div className="font-data text-[12px] uppercase tracking-wider text-text-muted">Guests</div>
            <div className={`font-body text-lg font-medium ${guests === 0 ? 'text-text-muted' : 'text-verde-800'}`}>
              {guests === 0 ? 'Add guests' : `${guests} ${guests === 1 ? 'guest' : 'guests'}`}
            </div>
          </div>
        </button>

        {/* Search Button */}
        <div className="flex items-center pr-2.5">
          <button
            onClick={handleSearch}
            disabled={guests === 0}
            className="bg-gold-500 hover:bg-gold-400 text-verde-800 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-tropical disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Search size={22} />
          </button>
        </div>
      </div>

      {/* Dropdowns */}
      {activeField === 'property' && (
        <div className="absolute top-full left-0 mt-3 w-72 bg-surface rounded-2xl shadow-elevated border border-verde-100 overflow-hidden z-50">
          <div className="py-2">
            <button
              onClick={() => { setSelectedProperty('all'); setActiveField(null); }}
              className={`w-full text-left px-4 py-3 text-sm font-body transition-colors ${
                selectedProperty === 'all' ? 'bg-verde-50 text-verde-800 font-semibold' : 'text-verde-700 hover:bg-cream-50'
              }`}
            >
              All Properties
            </button>
            {properties.map(p => (
              <button
                key={p.slug}
                onClick={() => { setSelectedProperty(p.slug); setActiveField(null); }}
                className={`w-full text-left px-4 py-3 text-sm font-body transition-colors ${
                  selectedProperty === p.slug ? 'bg-verde-50 text-verde-800 font-semibold' : 'text-verde-700 hover:bg-cream-50'
                }`}
              >
                <div className="font-medium">{p.name.split(':')[0]}</div>
                <div className="text-xs text-text-muted mt-0.5">${p.pricing.nightlyRate}/night · {p.details.maxGuests} guests</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {(activeField === 'checkin' || activeField === 'checkout') && (
        <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-surface rounded-2xl shadow-elevated border border-verde-100 z-50">
          {renderCalendar()}
        </div>
      )}

      {activeField === 'guests' && (
        <div className="absolute top-full right-16 mt-3 w-64 bg-surface rounded-2xl shadow-elevated border border-verde-100 p-5 z-50">
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

      {/* Mobile version — always expanded */}
      <div className="md:hidden mt-3">
        <div className="bg-surface/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-verde-100/50 overflow-hidden">
          {/* Check In */}
          <button
            onClick={() => setActiveField(activeField === 'm-checkin' ? null : 'm-checkin')}
            className={`w-full flex items-center gap-3 px-5 py-4 border-b border-verde-100/50 transition-colors ${
              activeField === 'm-checkin' ? 'bg-verde-50' : 'hover:bg-cream-50'
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

          {/* Check In Calendar — inline */}
          {activeField === 'm-checkin' && (
            <div className="border-b border-verde-100/50">
              {renderCalendar()}
            </div>
          )}

          {/* Check Out */}
          <button
            onClick={() => setActiveField(activeField === 'm-checkout' ? null : 'm-checkout')}
            className={`w-full flex items-center gap-3 px-5 py-4 border-b border-verde-100/50 transition-colors ${
              activeField === 'm-checkout' ? 'bg-verde-50' : 'hover:bg-cream-50'
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

          {/* Check Out Calendar — inline */}
          {activeField === 'm-checkout' && (
            <div className="border-b border-verde-100/50">
              {renderCalendar()}
            </div>
          )}

          {/* Guests */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-verde-100/50">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-verde-400 shrink-0" />
              <div>
                <div className="font-data text-[11px] uppercase tracking-wider text-text-muted">Guests</div>
                <div className={`font-body text-sm font-medium ${guests === 0 ? 'text-text-muted' : 'text-verde-800'}`}>{guests === 0 ? 'Add guests' : `${guests} ${guests === 1 ? 'guest' : 'guests'}`}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuests(Math.max(0, guests - 1))}
                className="w-8 h-8 rounded-full border border-verde-200 flex items-center justify-center text-verde-600 disabled:opacity-30"
                disabled={guests <= 0}
              >
                <Minus size={14} />
              </button>
              <span className="font-data text-base font-semibold text-verde-800 w-4 text-center">{guests}</span>
              <button
                onClick={() => setGuests(Math.min(8, guests + 1))}
                className="w-8 h-8 rounded-full border border-verde-200 flex items-center justify-center text-verde-600 disabled:opacity-30"
                disabled={guests >= 8}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Search button */}
          <div className="p-4">
            <button
              onClick={handleSearch}
              disabled={guests === 0}
              className="w-full bg-gold-500 hover:bg-gold-400 text-verde-800 rounded-xl py-3.5 font-body font-semibold flex items-center justify-center gap-2 transition-colors shadow-tropical disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Search size={18} /> {guests === 0 ? 'Select number of guests' : 'Search Properties'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
