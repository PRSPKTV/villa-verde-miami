import { format, startOfWeek, addDays, isToday } from 'date-fns';

export default function WeekStrip({ upcomingBookings }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const checkins = upcomingBookings.filter(b => b.check_in === dayStr);
    const checkouts = upcomingBookings.filter(b => b.check_out === dayStr);
    return { checkins, checkouts };
  };

  return (
    <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-5">
      <h2 className="font-heading text-lg font-bold text-verde-800 mb-4">This Week</h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const today = isToday(day);
          const { checkins, checkouts } = getEventsForDay(day);
          const hasEvents = checkins.length > 0 || checkouts.length > 0;

          return (
            <div
              key={day.toISOString()}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${today ? 'bg-verde-500 text-cream-100' : hasEvents ? 'bg-verde-50' : ''}`}
            >
              <span className={`font-data text-[10px] uppercase ${today ? 'text-cream-200' : 'text-text-muted'}`}>
                {format(day, 'EEE')}
              </span>
              <span className={`font-heading text-lg font-bold ${today ? 'text-cream-100' : 'text-verde-800'}`}>
                {format(day, 'd')}
              </span>
              <div className="flex gap-1 mt-1">
                {checkins.length > 0 && (
                  <div className={`w-2 h-2 rounded-full ${today ? 'bg-cream-100' : 'bg-verde-500'}`} title={`${checkins.length} check-in(s)`} />
                )}
                {checkouts.length > 0 && (
                  <div className={`w-2 h-2 rounded-full ${today ? 'bg-gold-400' : 'bg-gold-500'}`} title={`${checkouts.length} checkout(s)`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-verde-100">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-verde-500" /><span className="font-body text-[10px] text-text-muted">Check-in</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gold-500" /><span className="font-body text-[10px] text-text-muted">Checkout</span></div>
      </div>
    </div>
  );
}
