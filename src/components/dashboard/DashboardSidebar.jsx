import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarDays, BookOpen, FileText, Settings, LogOut, ChevronLeft, MessageCircle, TrendingUp, BookMarked } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Today', end: true },
  { to: '/dashboard/messages', icon: MessageCircle, label: 'Messages', badge: true },
  { to: '/dashboard/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/dashboard/bookings', icon: BookOpen, label: 'Bookings' },
  { to: '/dashboard/revenue', icon: TrendingUp, label: 'Revenue' },
];

const manageNav = [
  { to: '/dashboard/properties', icon: Building2, label: 'Listings' },
  { to: '/dashboard/guidebook', icon: BookMarked, label: 'Guidebook' },
  { to: '/dashboard/content', icon: FileText, label: 'Content' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardSidebar({ collapsed, onToggle }) {
  const { signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase
      .from('guest_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_type', 'host')
      .then(({ count }) => setUnreadCount(count || 0));
  }, []);

  const renderNavItem = ({ to, icon: Icon, label, end, badge }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-body text-sm ${
          isActive
            ? 'bg-verde-700 text-gold-400 font-semibold'
            : 'text-cream-200 hover:bg-verde-700/50 hover:text-cream-100'
        }`
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && (
        <span className="flex-1 flex items-center justify-between">
          {label}
          {badge && unreadCount > 0 && (
            <span className="ml-auto bg-gold-500 text-verde-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
      )}
      {collapsed && badge && unreadCount > 0 && (
        <span className="absolute left-9 top-1 w-2 h-2 bg-gold-500 rounded-full" />
      )}
    </NavLink>
  );

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-verde-800 text-cream-100 flex flex-col transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-verde-700">
        {!collapsed && (
          <span className="font-heading text-lg font-bold text-gold-400">Dashboard</span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-verde-700 transition-colors"
        >
          <ChevronLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {mainNav.map(renderNavItem)}
        </div>

        {/* Divider */}
        <div className={`my-4 border-t border-verde-700 ${collapsed ? 'mx-1' : 'mx-3'}`} />

        {!collapsed && (
          <div className="px-3 mb-2">
            <span className="font-body text-[10px] font-semibold text-verde-400 uppercase tracking-wider">Manage</span>
          </div>
        )}
        <div className="space-y-1">
          {manageNav.map(renderNavItem)}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-verde-700 space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-cream-200 hover:bg-verde-700/50 hover:text-cream-100 transition-colors font-body text-sm"
        >
          <ChevronLeft size={18} className="shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </NavLink>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-cream-200 hover:bg-red-900/30 hover:text-red-300 transition-colors font-body text-sm"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
