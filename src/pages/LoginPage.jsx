import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const formRef = useGsapAnimation((el, gsap) => {
    gsap.from(el.querySelectorAll('.login-anim'), {
      y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.2,
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 flex items-center justify-center min-h-[80vh]">
      <div ref={formRef} className="w-full max-w-md">
        <div className="login-anim text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-verde-50 flex items-center justify-center mx-auto mb-4">
            <LogIn size={24} className="text-verde-500" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-verde-800 mb-2">Welcome Back</h1>
          <p className="text-text-secondary font-body">Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="login-anim bg-surface rounded-3xl border border-verde-100 shadow-card p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-body">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-body font-medium text-verde-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 focus:border-verde-400 transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-verde-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 focus:border-verde-400 transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-verde-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 text-verde-800 py-3.5 rounded-xl font-body font-bold text-base flex items-center justify-center gap-2 hover:bg-gold-400 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="login-anim text-center text-sm text-text-secondary font-body mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-verde-600 font-semibold hover:text-verde-800 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
