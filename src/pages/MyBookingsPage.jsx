import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getMyBookings } from '@/lib/api';
import { formatCurrency } from '@/utils/priceUtils';
import { CalendarCheck, MapPin, Users, Loader2, ArrowRight } from 'lucide-react';

const statusStyles = {
  confirmed: 'bg-verde-50 text-verde-700',
  pending: 'bg-gold-300/20 text-gold-700',
  cancelled: 'bg-red-50 text-red-600',
};

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    getMyBookings(user.email)
      .then(setBookings)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-20 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-verde-500 mb-4" />
        <p className="text-text-secondary font-body">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-verde-800 mb-2">
        My Bookings
      </h1>
      <p className="font-body text-text-muted mb-8">
        {user?.user_metadata?.full_name || user?.email}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-body mb-6">
          {error}
        </div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="text-center py-16">
          <CalendarCheck size={48} className="mx-auto text-verde-200 mb-4" />
          <h2 className="font-heading text-xl font-bold text-verde-800 mb-2">No bookings yet</h2>
          <p className="font-body text-text-muted mb-6">When you book a stay, it will appear here.</p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-gold-500 text-verde-800 px-6 py-3 rounded-full font-body font-semibold hover:bg-gold-400 transition-colors"
          >
            Browse Properties <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="bg-surface rounded-2xl border border-verde-100 shadow-card p-5 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-lg font-bold text-verde-800">
                      {booking.property_name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-data font-semibold uppercase tracking-wider ${statusStyles[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-body text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck size={14} className="text-verde-400" />
                      {booking.check_in} — {booking.check_out}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-verde-400" />
                      {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'} · {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                    </span>
                  </div>

                  <div className="mt-2 font-data text-xs text-text-muted">
                    Confirmation: {booking.confirmation_code}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-data text-lg font-bold text-gold-600">
                    {formatCurrency(booking.total / 100)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
