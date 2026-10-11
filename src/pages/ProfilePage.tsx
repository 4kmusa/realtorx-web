// src/pages/ProfilePage.tsx
import React, { useEffect } from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { RealtorXLogo } from '../components/RealtorXLogo';
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Loader2,
  UserCheck,
  Building2,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkle,
  Compass,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

// ═══════════════════════════════════════════════════════
// Scroll Reveal Hook
// ═══════════════════════════════════════════════════════
function useScrollReveal(deps: React.DependencyList = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    const checkAndObserve = () => {
      document.querySelectorAll('.scroll-reveal:not(.is-visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) el.classList.add('is-visible');
        else observer.observe(el);
      });
    };
    checkAndObserve();
    const mutationObserver = new MutationObserver(() => checkAndObserve());
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, loading, logout } = useAuth();

  useScrollReveal([loading, user?.email]);

  // ─── Loading ───
  if (loading) {
    return (
      <div className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800/60 rounded w-48 mx-auto" />
          <div className="h-64 bg-slate-800/60 rounded-3xl" />
          <div className="h-48 bg-slate-800/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  // ─── Not Logged In ───
  if (!user) {
    return (
      <div className="py-24 max-w-2xl mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 font-heading">Please Login</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          You need to be logged in to view your profile.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="relative px-7 py-3.5 bg-[#2490EF] hover:bg-[#1b7ecf] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#2490EF]/25 active:scale-[0.98] overflow-hidden group inline-flex items-center gap-2"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative z-10">Go to Login</span>
          <ChevronRight className="w-4 h-4 relative z-10" />
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  // Determine user type
  const getUserType = () => {
    if (user.is_dealer)
      return { label: 'Dealer Partner', color: '#F5A623', icon: Building2, ring: 'from-[#F5A623]/50 via-[#FFB84D]/30 to-[#F5A623]/50' };
    if (user.is_customer)
      return { label: 'Customer', color: '#2490EF', icon: UserCheck, ring: 'from-[#2490EF]/50 via-[#60A5FA]/30 to-[#2490EF]/50' };
    return { label: 'Website User', color: '#94A3B8', icon: User, ring: 'from-slate-500/50 via-slate-400/30 to-slate-500/50' };
  };

  const userType = getUserType();
  const UserTypeIcon = userType.icon;

  const actionCards = [
    user.is_customer
      ? {
          label: 'Customer Dashboard',
          desc: 'Track bookings, payments, and documents',
          icon: UserCheck,
          color: '#2490EF',
          action: () => onNavigate('portal'),
        }
      : null,
    user.is_dealer
      ? {
          label: 'Dealer Dashboard',
          desc: 'Manage leads, deals, and commissions',
          icon: Briefcase,
          color: '#F5A623',
          action: () => onNavigate('dealer'),
        }
      : null,
    !user.is_customer
      ? {
          label: 'Become a Customer',
          desc: 'Register to book properties and track payments',
          icon: UserCheck,
          color: '#2490EF',
          action: () => onNavigate('become-customer'),
        }
      : null,
    !user.is_dealer
      ? {
          label: 'Become a Dealer',
          desc: 'Join 60% commission split partner program',
          icon: Briefcase,
          color: '#F5A623',
          action: () => onNavigate('become-dealer'),
        }
      : null,
  ].filter(Boolean) as {
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
    action: () => void;
  }[];

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      {/* ═════ HERO ═════ */}
      <div className="text-center max-w-3xl mx-auto scroll-reveal">
        <div className="flex justify-center mb-6">
          <RealtorXLogo size="lg" showSubtitle={false} />
        </div>

        <div className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-[1px] bg-[#2490EF]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#2490EF] font-semibold">
            Your Account
          </span>
          <span className="w-6 h-[1px] bg-[#2490EF]" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white font-heading tracking-[-0.03em] leading-tight text-balance">
          My <span className="gradient-text">Profile</span>
        </h1>
      </div>

      {/* ═════ PROFILE HEADER CARD ═════ */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30 scroll-reveal">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-[#0B1A30] to-slate-900/70" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(ellipse at 20% 30%, ${userType.color}15 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(36, 144, 239, 0.08) 0%, transparent 60%)`,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar with gradient ring */}
            <div className="relative shrink-0">
              <div
                className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-br"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${userType.color}, ${userType.color}60, ${userType.color})`,
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0A1628] flex items-center justify-center">
                  <span
                    className="text-4xl font-bold font-heading"
                    style={{ color: userType.color }}
                  >
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#28A745] border-4 border-[#0A1628] flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* User info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-[-0.02em] mb-2 truncate">
                {user.full_name}
              </h2>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
                <UserTypeIcon className="w-3.5 h-3.5" style={{ color: userType.color }} />
                <span
                  className="text-xs font-mono uppercase tracking-wider font-semibold"
                  style={{ color: userType.color }}
                >
                  {userType.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════ ACCOUNT DETAILS ═════ */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-xl shadow-black/20 scroll-reveal">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/40" />
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2490EF]/50 to-transparent" />

        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-7 pb-5 border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
              <User className="w-5 h-5 text-[#2490EF]" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#2490EF] mb-0.5">
                Account Information
              </div>
              <h3 className="text-lg font-bold text-white font-heading tracking-[-0.01em]">
                Account Details
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoField icon={Mail} label="Email Address" value={user.email} />
            {user.phone && <InfoField icon={Phone} label="Phone / WhatsApp" value={user.phone} />}
            <InfoField icon={User} label="Full Name" value={user.full_name} />

            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-slate-500 font-mono mb-2">
                <Shield className="w-3 h-3" />
                <span>Roles</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="text-[11px] font-mono uppercase tracking-wider bg-white/[0.04] text-slate-300 px-2.5 py-1 rounded-lg border border-white/[0.08]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════ ACTION CARDS ═════ */}
      {actionCards.length > 0 && (
        <div className="scroll-reveal">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-[1px] bg-[#F5A623]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#F5A623] font-semibold">
              Quick Actions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {actionCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <button
                  key={idx}
                  onClick={card.action}
                  className="group relative rounded-3xl overflow-hidden border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1 shadow-lg hover:shadow-2xl text-left scroll-reveal"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/40" />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 0% 0%, ${card.color}15 0%, transparent 60%)`,
                    }}
                  />

                  <div className="relative p-6 flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        backgroundColor: `${card.color}18`,
                        border: `1px solid ${card.color}35`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-base text-white mb-1.5">
                        {card.label}
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">
                        {card.desc}
                      </div>
                    </div>
                    <ChevronRight
                      className="w-5 h-5 text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-3"
                      style={{ color: card.color }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═════ LOGOUT ═════ */}
      <div className="pt-4 scroll-reveal">
        <button
          onClick={handleLogout}
          className="group w-full rounded-3xl overflow-hidden border border-red-500/20 hover:border-red-500/40 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-red-500/10 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.03] via-red-500/[0.06] to-red-500/[0.03]" />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 0% 50%, rgba(239, 68, 68, 0.10) 0%, transparent 60%)',
            }}
          />

          <div className="relative p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-heading font-bold text-base text-red-300 mb-1">
                Logout
              </div>
              <div className="text-xs text-slate-400">
                Sign out of your account
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// INFO FIELD COMPONENT
// ═══════════════════════════════════════════════════════
const InfoField: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-slate-500 font-mono mb-2">
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
    <div className="text-sm text-white font-medium truncate" title={value}>
      {value}
    </div>
  </div>
);
