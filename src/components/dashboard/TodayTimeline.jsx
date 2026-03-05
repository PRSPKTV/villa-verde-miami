import { format } from 'date-fns';
import { LogIn, LogOut, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TodayTimeline({ checkinsToday, checkoutsToday }) {
  const events = [
    ...checkinsToday.map(b => ({ type: 'checkin', booking: b, time: b.check_in })),
    ...checkoutsToday.map(b => ({ type: 'checkout', booking: b, time: b.check_out })),
  ];

  if (events.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6 text-center">
        <CalendarCheck size={28} className="mx-auto text-verde-200 mb-2" />
        <p className="font-body text-sm text-text-muted">No check-ins or checkouts today</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-5">
      <h2 className="font-heading text-lg font-bold text-verde-800 mb-4">Today's Activity</h2>
      <div className="space-y-3">
        {events.map((event, i) => {
          const { booking, type } = event;
          const isCheckin = type === 'checkin';
          const guestName = `${booking.guest_first_name || ''} ${booking.guest_last_name || ''}`.trim();

          return (
            <div key={`${type}-${booking.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-verde-100">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isCheckin ? 'bg-verde-100 text-verde-600' : 'bg-gold-100 text-gold-600'}`}>
                {isCheckin ? <LogIn size={16} /> : <LogOut size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-verde-800">
                  {isCheckin ? 'Check-in' : 'Checkout'}: {guestName}
                </p>
                <p className="font-body text-xs text-text-muted">{booking.property_name}</p>
              </div>
              <Link to="/dashboard/bookings" className="font-body text-xs text-verde-600 hover:underline shrink-0">
                View
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
