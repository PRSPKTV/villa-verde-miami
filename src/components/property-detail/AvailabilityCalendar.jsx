import { useState, useMemo } from 'react';
import {
  getCalendarDays, isDateBlocked, isDateInRange, isPastDate,
  isSameDay, isSameMonth, addMonths, subMonths, format, startOfDay,
} from '@/utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function AvailabilityCalendar({ checkIn, checkOut, onDateSelect, blockedDates = [], minimumStay = 1 }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  const isSelected = (date) => {
    if (checkIn && isSameDay(date, checkIn)) return 'start';
    if (checkOut && isSameDay(date, checkOut)) return 'end';
    if (checkIn && checkOut && isDateInRange(date, checkIn, checkOut)) return 'range';
    return false;
  };

  const isDisabled = (date) => {
    return isPastDate(date) || isDateBlocked(date, blockedDates);
  };

  const handleClick = (date) => {
    if (isDisabled(date)) return;
    onDateSelect(startOfDay(date));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 rounded-lg hover:bg-verde-50 text-verde-500 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-heading text-sm font-bold text-verde-800">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded-lg hover:bg-verde-50 text-verde-500 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-data font-medium text-text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date, i) => {
          const inMonth = isSameMonth(date, currentMonth);
          const disabled = isDisabled(date);
          const selected = isSelected(date);
          const today = isSameDay(date, new Date());

          let cellClass = 'aspect-square flex items-center justify-center text-xs font-data rounded-lg transition-all cursor-pointer ';

          if (!inMonth) {
            cellClass += 'text-cream-300 cursor-default';
          } else if (disabled) {
            cellClass += 'text-cream-300 line-through cursor-not-allowed';
          } else if (selected === 'start' || selected === 'end') {
            cellClass += 'bg-verde-500 text-cream-100 font-bold';
          } else if (selected === 'range') {
            cellClass += 'bg-verde-100 text-verde-700';
          } else {
            cellClass += 'text-verde-800 hover:bg-verde-50';
          }

          if (today && !selected) {
            cellClass += ' ring-1 ring-gold-500';
          }

          return (
            <button
              key={i}
              onClick={() => inMonth && handleClick(date)}
              disabled={!inMonth || disabled}
              className={cellClass}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {minimumStay > 1 && (
        <p className="text-[10px] font-data text-text-muted mt-2 text-center">
          {minimumStay}-night minimum stay
        </p>
      )}
    </div>
  );
}
