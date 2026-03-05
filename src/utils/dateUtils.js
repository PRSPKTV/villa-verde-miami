import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, isWithinInterval,
  addMonths, subMonths, format, isBefore, isAfter, parseISO,
  differenceInDays, startOfDay,
} from 'date-fns';

export function getCalendarDays(year, month) {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

export function isDateBlocked(date, blockedDates = []) {
  if (blockedDates.length === 0) return false;

  // Flat date strings from API: ['2026-03-10', '2026-03-11', ...]
  if (typeof blockedDates[0] === 'string') {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.includes(dateStr);
  }

  // Range objects from static data: [{ start, end }, ...]
  return blockedDates.some(range => {
    const start = parseISO(range.start);
    const end = parseISO(range.end);
    return isWithinInterval(date, { start, end });
  });
}

export function isDateInRange(date, startDate, endDate) {
  if (!startDate || !endDate) return false;
  return isWithinInterval(date, {
    start: startOfDay(startDate),
    end: startOfDay(endDate),
  });
}

export function getNumberOfNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return differenceInDays(checkOut, checkIn);
}

export function formatDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '';
  const sameYear = checkIn.getFullYear() === checkOut.getFullYear();
  const sameMonth = checkIn.getMonth() === checkOut.getMonth();
  if (sameMonth && sameYear) {
    return `${format(checkIn, 'MMM d')} – ${format(checkOut, 'd, yyyy')}`;
  }
  if (sameYear) {
    return `${format(checkIn, 'MMM d')} – ${format(checkOut, 'MMM d, yyyy')}`;
  }
  return `${format(checkIn, 'MMM d, yyyy')} – ${format(checkOut, 'MMM d, yyyy')}`;
}

export function formatDate(date) {
  if (!date) return '';
  return format(date, 'MMM d, yyyy');
}

export function isValidDateRange(checkIn, checkOut, minimumStay = 1) {
  if (!checkIn || !checkOut) return false;
  return differenceInDays(checkOut, checkIn) >= minimumStay;
}

export function isPastDate(date) {
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

export { isSameDay, isSameMonth, addMonths, subMonths, format, isBefore, isAfter, startOfDay };
