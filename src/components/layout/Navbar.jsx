import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';

const navLinks = [
  { to: '/properties', label: 'Properties' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl shadow-card border-b border-verde-100"
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Left — Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="https://villaverdemiami.com/wp-content/uploads/2025/03/WhatsApp_Image_2025-03-11_at_00.35.32_c1c8ffc1-removebg-preview.png"
            alt="Villa Verde logo"
            className="h-[62px] md:h-[69px] w-auto"
          />
          <span className="text-[26px] font-heading font-bold tracking-tight italic text-verde-800">
            Villa Verde
          </span>
        </Link>

        {/* Center — Nav Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-body font-medium">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative py-1 transition-colors duration-200 ${
                  isActive ? 'text-verde-800 font-semibold' : 'text-verde-600 hover:text-verde-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-verde-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/properties"
            className="relative overflow-hidden group px-5 py-2 rounded-full font-body font-semibold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-95 hidden md:block bg-gold-500 text-verde-800"
          >
            <span className="relative z-10">Book Now</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </Link>

          <div className="hidden md:block">
            <UserMenu variant="light" />
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-full transition-colors text-verde-800 hover:bg-verde-50"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-surface/98 backdrop-blur-xl border-t border-verde-100 shadow-elevated">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-base font-body font-medium px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'text-verde-800 bg-verde-50 font-semibold'
                      : 'text-verde-700 hover:bg-cream-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-4 pt-4 border-t border-verde-100 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm font-body text-text-muted">
                    Signed in as {user.user_metadata?.full_name || user.email}
                  </div>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); navigate('/'); }}
                    className="text-base font-body text-red-600 px-4 py-3 rounded-xl hover:bg-red-50 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-body text-verde-700 px-4 py-3 rounded-xl hover:bg-cream-50"
                >
                  Log In
                </Link>
              )}
              <Link
                to="/properties"
                onClick={() => setMobileOpen(false)}
                className="bg-gold-500 text-verde-800 px-6 py-3 rounded-full font-body font-semibold text-center"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
