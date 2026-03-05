import { Link } from 'react-router-dom';
import { useTodayData } from '@/hooks/useTodayData';
import TodayTimeline from '@/components/dashboard/TodayTimeline';
import WeekStrip from '@/components/dashboard/WeekStrip';
import { DollarSign, CalendarCheck, Building2, TrendingUp, ArrowRight, MessageCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardOverviewPage() {
  const { checkinsToday, checkoutsToday, upcomingBookings, stats, unreadMessages, loading } = useTodayData();

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'bg-verde-100 text-verde-600' },
    { label: 'Revenue', value: `$${(stats.revenue / 100).toLocaleString()}`, icon: DollarSign, color: 'bg-gold-100 text-gold-600' },
    { label: 'Properties', value: stats.properties, icon: Building2, color: 'bg-blue-100 text-blue-600' },
    { label: 'Upcoming', value: stats.upcoming, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-verde-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-verde-800">{getGreeting()}</h1>
        <p className="text-text-secondary font-body mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Action Items */}
      {(unreadMessages > 0 || checkinsToday.length > 0 || checkoutsToday.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {unreadMessages > 0 && (
            <Link to="/dashboard/messages" className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors">
              <MessageCircle size={14} /> {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''}
            </Link>
          )}
          {checkinsToday.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-verde-50 text-verde-700 rounded-xl font-body text-sm border border-verde-200">
              <AlertCircle size={14} /> {checkinsToday.length} check-in{checkinsToday.length !== 1 ? 's' : ''} today
            </div>
          )}
          {checkoutsToday.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gold-50 text-gold-700 rounded-xl font-body text-sm border border-gold-200">
              <AlertCircle size={14} /> {checkoutsToday.length} checkout{checkoutsToday.length !== 1 ? 's' : ''} today
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface rounded-2xl border border-verde-100 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-muted font-body text-sm">{label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon size={18} /></div>
            </div>
            <div className="font-data text-2xl font-bold text-verde-800">{value}</div>
          </div>
        ))}
      </div>

      {/* Today Timeline + Week Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TodayTimeline checkinsToday={checkinsToday} checkoutsToday={checkoutsToday} />
        <WeekStrip upcomingBookings={upcomingBookings} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { to: '/dashboard/properties', label: 'Listings', desc: 'Manage properties' },
          { to: '/dashboard/calendar', label: 'Calendar', desc: 'Pricing & availability' },
          { to: '/dashboard/revenue', label: 'Revenue', desc: 'Financial analytics' },
          { to: '/dashboard/messages', label: 'Messages', desc: 'Guest communication' },
        ].map(({ to, label, desc }) => (
          <Link key={to} to={to} className="bg-surface rounded-2xl border border-verde-100 p-4 shadow-card hover:shadow-elevated transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-verde-800 group-hover:text-verde-600 transition-colors">{label}</h3>
                <p className="text-text-muted font-body text-xs mt-0.5">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-verde-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card">
        <div className="flex items-center justify-between p-5 border-b border-verde-100">
          <h2 className="font-heading text-lg font-bold text-verde-800">Upcoming Check-ins</h2>
          <Link to="/dashboard/bookings" className="text-verde-500 font-body text-sm font-semibold hover:underline">View all</Link>
        </div>
        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center text-text-muted font-body">No upcoming bookings.</div>
        ) : (
          <div className="divide-y divide-verde-50">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="font-body font-medium text-verde-800">{booking.guest_first_name} {booking.guest_last_name}</div>
                  <div className="font-data text-xs text-text-muted">{booking.confirmation_code} · {booking.property_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-data text-sm font-semibold text-verde-700">
                    {format(new Date(booking.check_in + 'T12:00:00'), 'MMM d')} - {format(new Date(booking.check_out + 'T12:00:00'), 'MMM d')}
                  </div>
                  <div className="font-data text-xs text-gold-600">${(booking.total / 100).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
