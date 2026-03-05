import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarDays, BookOpen, FileText, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/properties', icon: Building2, label: 'Properties' },
  { to: '/dashboard/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/dashboard/bookings', icon: BookOpen, label: 'Bookings' },
  { to: '/dashboard/content', icon: FileText, label: 'Content' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardSidebar({ collapsed, onToggle }) {
  const { signOut } = useAuth();

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
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ to, icon: Icon, label, end }) => (
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
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
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
