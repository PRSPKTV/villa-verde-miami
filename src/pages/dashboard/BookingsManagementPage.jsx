import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [emailLogs, setEmailLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings(data || []);
        setLoading(false);
      });
  }, []);

  const loadEmailLog = async (bookingId) => {
    if (emailLogs[bookingId]) return;
    const { data } = await supabase.from('guest_emails_log').select('*').eq('booking_id', bookingId).order('created_at');
    setEmailLogs(prev => ({ ...prev, [bookingId]: data || [] }));
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadEmailLog(id);
    }
  };

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.confirmation_code?.toLowerCase().includes(q) ||
        b.guest_first_name?.toLowerCase().includes(q) ||
        b.guest_last_name?.toLowerCase().includes(q) ||
        b.guest_email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-verde-100 text-verde-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-verde-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-verde-800">Bookings</h1>
        <p className="text-text-secondary font-body mt-1">View and manage all guest bookings.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-verde-200 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-muted" />
          {['all', 'confirmed', 'pending', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full font-body text-xs font-semibold capitalize transition-colors ${
                statusFilter === status ? 'bg-verde-500 text-cream-100' : 'bg-verde-50 text-verde-600 hover:bg-verde-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-text-muted font-data text-sm mb-4">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</p>

      {/* Bookings Table */}
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted font-body">No bookings found.</div>
        ) : (
          <div className="divide-y divide-verde-50">
            {filtered.map(booking => (
              <div key={booking.id}>
                <button
                  onClick={() => toggleExpand(booking.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-cream-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-data text-sm font-bold text-verde-800">{booking.confirmation_code}</span>
                      <span className={`px-2 py-0.5 rounded-full font-data text-[10px] font-bold uppercase ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="font-body text-sm text-text-secondary mt-0.5">
                      {booking.guest_first_name} {booking.guest_last_name} &middot; {booking.property_name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-data text-sm text-verde-700">
                      {format(new Date(booking.check_in + 'T12:00:00'), 'MMM d')} - {format(new Date(booking.check_out + 'T12:00:00'), 'MMM d, yyyy')}
                    </div>
                    <div className="font-data text-xs text-gold-600 font-bold">${(booking.total / 100).toLocaleString()}</div>
                  </div>
                  {expandedId === booking.id ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                </button>

                {expandedId === booking.id && (
                  <div className="px-5 pb-5 bg-cream-50 border-t border-verde-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                      <div>
                        <div className="font-data text-[10px] uppercase text-text-muted tracking-wider">Email</div>
                        <div className="font-body text-sm text-verde-800">{booking.guest_email}</div>
                      </div>
                      <div>
                        <div className="font-data text-[10px] uppercase text-text-muted tracking-wider">Phone</div>
                        <div className="font-body text-sm text-verde-800">{booking.guest_phone}</div>
                      </div>
                      <div>
                        <div className="font-data text-[10px] uppercase text-text-muted tracking-wider">Guests</div>
                        <div className="font-body text-sm text-verde-800">{booking.guests}</div>
                      </div>
                      <div>
                        <div className="font-data text-[10px] uppercase text-text-muted tracking-wider">Nights</div>
                        <div className="font-body text-sm text-verde-800">{booking.nights}</div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="grid grid-cols-5 gap-2 py-3 border-t border-verde-100 text-xs font-data">
                      <div><span className="text-text-muted">Subtotal:</span> <span className="text-verde-800">${(booking.subtotal / 100).toFixed(0)}</span></div>
                      <div><span className="text-text-muted">Cleaning:</span> <span className="text-verde-800">${(booking.cleaning_fee / 100).toFixed(0)}</span></div>
                      <div><span className="text-text-muted">Service:</span> <span className="text-verde-800">${(booking.service_fee / 100).toFixed(0)}</span></div>
                      <div><span className="text-text-muted">Taxes:</span> <span className="text-verde-800">${(booking.taxes / 100).toFixed(0)}</span></div>
                      <div><span className="text-text-muted">Total:</span> <span className="text-gold-600 font-bold">${(booking.total / 100).toFixed(0)}</span></div>
                    </div>

                    {booking.special_requests && (
                      <div className="py-3 border-t border-verde-100">
                        <div className="font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Special Requests</div>
                        <div className="font-body text-sm text-text-secondary">{booking.special_requests}</div>
                      </div>
                    )}

                    {/* Email Log */}
                    <div className="py-3 border-t border-verde-100">
                      <div className="flex items-center gap-1 mb-2">
                        <Mail size={12} className="text-verde-400" />
                        <span className="font-data text-[10px] uppercase text-text-muted tracking-wider">Email Log</span>
                      </div>
                      {!emailLogs[booking.id] ? (
                        <div className="text-text-muted font-body text-xs">Loading...</div>
                      ) : emailLogs[booking.id].length === 0 ? (
                        <div className="text-text-muted font-body text-xs">No emails sent.</div>
                      ) : (
                        <div className="space-y-1">
                          {emailLogs[booking.id].map(log => (
                            <div key={log.id} className="flex items-center gap-3 text-xs font-data">
                              <span className="text-verde-600">{log.template}</span>
                              <span className="text-text-muted">{log.sent_to}</span>
                              <span className="text-text-muted">{format(new Date(log.created_at), 'MMM d, h:mm a')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
