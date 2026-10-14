// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { RealtorXLogo } from '../components/RealtorXLogo';
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  Award,
  Sparkle,
  CheckCircle2,
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.is_customer) onNavigate('portal');
      else if (user.is_dealer) onNavigate('dealer');
      else onNavigate('profile');
    }
  }, [isAuthenticated, user, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#0B1A30] overflow-hidden">
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(36, 144, 239, 0.15) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 70% 80%, rgba(245, 166, 35, 0.10) 0%, transparent 60%)',
        }}
      />

      <div className="relative w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* ═════ LEFT: Brand Panel ═════ */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center px-8 space-y-8">
            <RealtorXLogo size="lg" showSubtitle={false} />

            <div className="space-y-5">
              <h2 className="text-4xl xl:text-5xl font-bold text-white font-heading tracking-[-0.03em] leading-[1.05] text-balance">
                Welcome back to{' '}
                <span className="gradient-text">Realtor X</span>
              </h2>
              <p className="text-base text-slate-300 leading-relaxed max-w-md">
                Login to access your dashboard, manage properties, and stay connected with Bahria
                Town Karachi's most trusted real estate community.
              </p>
            </div>

            {/* Trust features */}
            <div className="space-y-3 pt-4">
              {[
                { icon: ShieldCheck, text: 'Verified listings & documents' },
                { icon: Users, text: 'Trusted dealer fraternity' },
                { icon: Award, text: 'Fair 80/20 commission split' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                    <span className="text-sm text-slate-300">{item.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Philosophy quote */}
            <div className="pt-6 border-t border-white/[0.06]">
              <p className="font-heading italic text-slate-400 text-sm leading-relaxed">
                "Real estate is not just about land, buildings or transactions. It is about people.
                It is about dreams. It is about trust."
              </p>
            </div>
          </div>

          {/* ═════ RIGHT: Login Form ═════ */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:mx-0">
            <div className="lg:hidden flex justify-center mb-8">
              <RealtorXLogo size="lg" showSubtitle={false} />
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 to-slate-900/70" />
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#94A3B8]/60 to-transparent" />

              <div className="relative p-8 sm:p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 mb-5">
                <span className="w-6 h-[1px] bg-current" style={{ color: '#94A3B8' }} />
                <span className="text-[11px] font-medium font-semibold tracking-wide" style={{ color: '#94A3B8' }}>Member Login</span>
              </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-[-0.02em] mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-sm text-slate-400">
                    Login to continue to your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 tracking-wide">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#94A3B8] transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#94A3B8]/60 focus:ring-4 focus:ring-[#94A3B8]/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-semibold text-slate-400 tracking-wide">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-[10px] font-semibold text-[#94A3B8] hover:text-[#60A5FA] transition-colors tracking-wide"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#94A3B8] transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        autoComplete="current-password"
                        className="w-full pl-11 pr-11 py-3.5 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#94A3B8]/60 focus:ring-4 focus:ring-[#94A3B8]/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3.5 px-4 text-sm font-bold text-slate-950 bg-[#F5A623] hover:brightness-110 rounded-xl shadow-xl shadow-[#F5A623]/25 hover:shadow-[#F5A623]/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group active:scale-[0.98] mt-2"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                        <span className="relative z-10">Logging in...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">Login to Account</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/[0.06] text-center text-xs text-slate-400">
                  New to Realtor X?{' '}
                  <button
                    onClick={() => onNavigate('signup')}
                    className="text-[#94A3B8] hover:text-[#60A5FA] font-semibold transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
