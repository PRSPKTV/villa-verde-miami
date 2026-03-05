import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formRef = useGsapAnimation((el, gsap) => {
    gsap.from(el.querySelectorAll('.signup-anim'), {
      y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.2,
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const data = await signUp(email, password, fullName);
      if (data.user && !data.session) {
        setSuccess(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-28 pb-20 px-4 md:px-8 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-verde-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-verde-500" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-verde-800 mb-3">Check Your Email</h1>
          <p className="text-text-secondary font-body mb-8">
            We've sent a confirmation link to <strong className="text-verde-700">{email}</strong>. Click the link to activate your account.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gold-500 text-verde-800 px-6 py-3 rounded-xl font-body font-bold hover:bg-gold-400 transition-colors"
          >
            Go to Login <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 flex items-center justify-center min-h-[80vh]">
      <div ref={formRef} className="w-full max-w-md">
        <div className="signup-anim text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-verde-50 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={24} className="text-verde-500" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-verde-800 mb-2">Create Account</h1>
          <p className="text-text-secondary font-body">Join Villa Verde for exclusive rates and easy booking</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-anim bg-surface rounded-3xl border border-verde-100 shadow-card p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-body">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-body font-medium text-verde-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-verde-200 bg-cream-50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 focus:border-verde-400 transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

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
                placeholder="Minimum 6 characters"
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
              <><Loader2 size={18} className="animate-spin" /> Creating account...</>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="signup-anim text-center text-sm text-text-secondary font-body mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-verde-600 font-semibold hover:text-verde-800 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
