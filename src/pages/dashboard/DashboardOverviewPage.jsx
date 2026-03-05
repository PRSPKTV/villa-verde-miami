import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { DollarSign, CalendarCheck, Building2, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, properties: 0, upcoming: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [bookingsRes, propertiesRes, upcomingRes] = await Promise.all([
        supabase.from('bookings').select('total, status'),
        supabase.from('properties').select('id'),
        supabase.from('bookings').select('*').gte('check_in', new Date().toISOString().split('T')[0]).eq('status', 'confirmed').order('check_in').limit(5),
      ]);

      const bookings = bookingsRes.data || [];
      const confirmed = bookings.filter(b => b.status === 'confirmed');
      const revenue = confirmed.reduce((sum, b) => sum + (b.total || 0), 0);

      setStats({
        bookings: confirmed.length,
        revenue,
        properties: (propertiesRes.data || []).length,
        upcoming: (upcomingRes.data || []).length,
      });
      setRecentBookings(upcomingRes.data || []);
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Bookings', value: stats.bookings, icon: CalendarCheck, color: 'bg-verde-100 text-verde-600' },
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
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-verde-800">Dashboard</h1>
        <p className="text-text-secondary font-body mt-1">Overview of your properties and bookings.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface rounded-2xl border border-verde-100 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-muted font-body text-sm">{label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="font-data text-2xl font-bold text-verde-800">{value}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/dashboard/properties', label: 'Manage Properties', desc: 'Edit listings, pricing, and images' },
          { to: '/dashboard/calendar', label: 'Calendar', desc: 'Block dates and manage availability' },
          { to: '/dashboard/content', label: 'Edit Content', desc: 'Blog, FAQ, testimonials, and more' },
        ].map(({ to, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="bg-surface rounded-2xl border border-verde-100 p-5 shadow-card hover:shadow-elevated transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-verde-800 group-hover:text-verde-600 transition-colors">{label}</h3>
                <p className="text-text-muted font-body text-sm mt-1">{desc}</p>
              </div>
              <ArrowRight size={18} className="text-verde-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card">
        <div className="flex items-center justify-between p-5 border-b border-verde-100">
          <h2 className="font-heading text-lg font-bold text-verde-800">Upcoming Check-ins</h2>
          <Link to="/dashboard/bookings" className="text-verde-500 font-body text-sm font-semibold hover:underline">
            View all
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-text-muted font-body">No upcoming bookings.</div>
        ) : (
          <div className="divide-y divide-verde-50">
            {recentBookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="font-body font-medium text-verde-800">
                    {booking.guest_first_name} {booking.guest_last_name}
                  </div>
                  <div className="font-data text-xs text-text-muted">
                    {booking.confirmation_code} &middot; {booking.property_name}
                  </div>
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
