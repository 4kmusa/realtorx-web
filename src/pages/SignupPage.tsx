// src/pages/SignupPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { RealtorXLogo } from '../components/RealtorXLogo';
import {
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  Award,
  Sparkle,
  Check,
  X,
} from 'lucide-react';

interface SignupPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) onNavigate('profile');
  }, [isAuthenticated, onNavigate]);

  // Password strength
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthInfo = useMemo(() => {
    const map = [
      { label: 'Too weak', color: '#EF4444', width: '0%' },
      { label: 'Weak', color: '#EF4444', width: '25%' },
      { label: 'Fair', color: '#F5A623', width: '50%' },
      { label: 'Good', color: '#2490EF', width: '75%' },
      { label: 'Strong', color: '#28A745', width: '100%' },
    ];
    return map[passwordStrength] || map[0];
  }, [passwordStrength]);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const showMismatch = password && confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreeTerms) {
      setError('Please accept Terms & Conditions to continue');
      return;
    }

    setLoading(true);
    const result = await signup({ email, full_name: fullName, phone, password });

    if (result.success) {
      onNavigate('profile');
    } else {
      setError(result.error || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#0A1628] overflow-hidden">
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
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center px-8 space-y-8">
            <RealtorXLogo size="lg" showSubtitle={false} />

            <div className="space-y-5">
              <h2 className="text-4xl xl:text-5xl font-bold text-white font-heading tracking-[-0.03em] leading-[1.05] text-balance">
                Join the{' '}
                <span className="gradient-text">Realtor X</span> movement
              </h2>
              <p className="text-base text-slate-300 leading-relaxed max-w-md">
                Create your account to access verified Bahria Town Karachi properties, connect
                with trusted dealers, and be part of a community built on integrity.
              </p>
            </div>

            {/* Trust features */}
            <div className="space-y-3 pt-4">
              {[
                { icon: ShieldCheck, text: '100% verified listings & documents' },
                { icon: Users, text: 'Community of trusted dealers' },
                { icon: Award, text: 'Take the Founding Member Oath' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#2490EF]" />
                    </div>
                    <span className="text-sm text-slate-300">{item.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Philosophy */}
            <div className="pt-6 border-t border-white/[0.06]">
              <p className="font-display italic text-slate-400 text-sm leading-relaxed">
                "Connect. Collaborate. Grow."
              </p>
            </div>
          </div>

          {/* ═════ RIGHT: Signup Form ═════ */}
          <div className="lg:col-span-7 w-full max-w-xl mx-auto lg:mx-0">
            <div className="lg:hidden flex justify-center mb-8">
              <RealtorXLogo size="lg" showSubtitle={false} />
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 to-slate-900/70" />
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/60 to-transparent" />

              <div className="relative p-8 sm:p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#F5A623] bg-[#F5A623]/[0.08] border border-[#F5A623]/25 px-3.5 py-1.5 rounded-full mb-5">
                    <Sparkle className="w-3 h-3" />
                    <span>Create Account</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-[-0.02em] mb-2">
                    Join Realtor X
                  </h1>
                  <p className="text-sm text-slate-400">
                    Start your journey with verified real estate
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                      Full Name *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Muhammad Ahmed Khan"
                        autoComplete="name"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                        Email *
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                        Phone *
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+92 300 1234567"
                          autoComplete="tel"
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                      Password *
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 chars with number & symbol"
                        autoComplete="new-password"
                        className="w-full pl-11 pr-11 py-3.5 bg-slate-950/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]/60 focus:ring-4 focus:ring-[#2490EF]/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password strength */}
                    {password && (
                      <div className="mt-3 space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                            Strength
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: strengthInfo.color }}
                          >
                            {strengthInfo.label}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: strengthInfo.width,
                              backgroundColor: strengthInfo.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-[0.12em]">
                      Confirm Password *
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#2490EF] transition-colors" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Retype password"
                        autoComplete="new-password"
                        className={`w-full pl-11 pr-11 py-3.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition-all ${
                          showMismatch
                            ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10'
                            : passwordsMatch
                            ? 'border-[#28A745]/50 focus:border-[#28A745]/60 focus:ring-[#28A745]/10'
                            : 'border-white/[0.08] hover:border-white/[0.15] focus:border-[#2490EF]/60 focus:ring-[#2490EF]/10'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordsMatch && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#28A745] animate-fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Passwords match</span>
                      </div>
                    )}
                    {showMismatch && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-400 animate-fade-in">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Passwords don't match</span>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <button
                    type="button"
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    className="w-full flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all text-left group"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        agreeTerms
                          ? 'bg-[#28A745] border-[#28A745] scale-105'
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}
                    >
                      {agreeTerms && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <span className="text-xs text-slate-300 leading-relaxed">
                      I agree to the{' '}
                      <span className="text-white font-medium">Terms &amp; Conditions</span> and{' '}
                      <span className="text-white font-medium">Privacy Policy</span>
                    </span>
                  </button>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !agreeTerms}
                    className="relative w-full py-3.5 px-4 text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#FFB84D] to-[#F5A623] hover:brightness-110 rounded-xl shadow-xl shadow-[#F5A623]/25 hover:shadow-[#F5A623]/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center gap-2 overflow-hidden group active:scale-[0.98] mt-2"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                        <span className="relative z-10">Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">Create Account</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/[0.06] text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-[#2490EF] hover:text-[#60A5FA] font-semibold transition-colors"
                  >
                    Login here
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
