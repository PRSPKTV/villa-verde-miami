import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, LogIn, UserPlus, LogOut, HelpCircle, Info, CalendarCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UserMenu({ variant = 'light' }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, isOwner, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = variant === 'light';

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 border rounded-full px-3 py-2 transition-all duration-200 hover:shadow-md ${
          isLight
            ? 'border-verde-200 bg-surface hover:bg-cream-50 text-verde-800'
            : 'border-cream-100/20 bg-cream-100/10 hover:bg-cream-100/20 text-cream-100'
        }`}
      >
        <Menu size={16} />
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
          isLight ? 'bg-verde-500 text-cream-100' : 'bg-cream-100/20 text-cream-100'
        }`}>
          <User size={14} />
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-56 bg-surface rounded-2xl shadow-elevated border border-verde-100 overflow-hidden z-50">
          {user ? (
            <>
              <div className="px-4 py-3 border-b border-verde-100">
                <p className="font-body font-semibold text-verde-800 text-sm truncate">
                  {user.user_metadata?.full_name || 'Guest'}
                </p>
                <p className="font-body text-xs text-text-muted truncate">{user.email}</p>
              </div>
              <div className="py-2">
                {isOwner && (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-body font-semibold text-verde-800 hover:bg-cream-50 transition-colors">
                    <LayoutDashboard size={16} /> Owner Dashboard
                  </Link>
                )}
                <Link to="/my-bookings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-body text-verde-700 hover:bg-cream-50 transition-colors">
                  <CalendarCheck size={16} /> My Bookings
                </Link>
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="py-2">
              <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-body font-semibold text-verde-800 hover:bg-cream-50 transition-colors">
                <LogIn size={16} /> Log In
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-body text-verde-700 hover:bg-cream-50 transition-colors">
                <UserPlus size={16} /> Sign Up
              </Link>
            </div>
          )}
          <div className="border-t border-verde-100 py-2">
            <Link to="/faq" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-body text-verde-700 hover:bg-cream-50 transition-colors">
              <HelpCircle size={16} /> Help Center
            </Link>
            <Link to="/about" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-body text-verde-700 hover:bg-cream-50 transition-colors">
              <Info size={16} /> About Villa Verde
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
