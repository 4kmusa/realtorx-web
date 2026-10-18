// src/pages/DealerPortalPage.tsx
import React, { useState, useEffect } from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  FileText,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Home,
  Briefcase,
  Users,
  Target,
  ListChecks,
  ChevronRight,
  Banknote,
  Award,
  ShieldCheck,
  BadgeCheck,
  Sparkle,
  Percent,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { AnimatedNumber } from '../components/AnimatedNumber';

interface DealerPortalPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || '/api/erp';
const API_BASE = '/api/erp';

type TabType = 'overview' | 'leads' | 'deals' | 'commission' | 'payouts' | 'targets' | 'tasks';

interface DashboardData {
  dealer: any;
  leads: any[];
  deals: any[];
  commissions: any[];
  payouts: any[];
  targets: any[];
  tasks: any[];
}

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════
const formatPKR = (amount: number | undefined | null): string => {
  if (!amount && amount !== 0) return 'PKR 0';
  if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lakh`;
  return `PKR ${amount.toLocaleString()}`;
};

const formatDate = (date: string | undefined | null): string => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Paid':
    case 'Completed':
    case 'Active':
      return { bg: 'rgba(40, 167, 69, 0.15)', border: 'rgba(40, 167, 69, 0.3)', text: '#22C55E' };
    case 'Approved':
    case 'Earned':
    case 'In Progress':
      return { bg: 'rgba(36, 144, 239, 0.15)', border: 'rgba(36, 144, 239, 0.3)', text: '#94A3B8' };
    case 'Overdue':
    case 'Rejected':
      return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444' };
    case 'High':
      return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444' };
    case 'Medium':
      return { bg: 'rgba(245, 166, 35, 0.15)', border: 'rgba(245, 166, 35, 0.3)', text: '#F5A623' };
    default:
      return { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)', text: '#94A3B8' };
  }
};

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

export const DealerPortalPage: React.FC<DealerPortalPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useScrollReveal([loading, data, activeTab]);

  useEffect(() => {
    if (!isAuthenticated) onNavigate('login');
  }, [isAuthenticated, onNavigate]);

  useEffect(() => {
    async function loadDashboard() {
      if (!user?.email) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/method/realtorx.api.dealer_dashboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'omit',
          body: JSON.stringify({ user_email: user.email }),
        });
        const result = await response.json();
        if (!response.ok || result.exception) {
          throw new Error(result.exception || 'Failed to load dashboard');
        }
        setData(result.message);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    if (user?.email) loadDashboard();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800/60 rounded w-48" />
          <div className="h-24 bg-slate-800/60 rounded-3xl" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-800/60 rounded-3xl" />
            ))}
          </div>
          <div className="h-96 bg-slate-800/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  // ─── No dealer profile ───
  if (!data?.dealer) {
    return (
      <div className="py-24 max-w-2xl mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center">
          <Briefcase className="w-10 h-10 text-[#F5A623]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 font-heading">
          Dealer Profile Not Found
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          You need to register as a Dealer first to access this dashboard.
        </p>
        <button
          onClick={() => onNavigate('become-dealer')}
          className="relative px-7 py-3.5 bg-[#F5A623] text-slate-950 rounded-2xl font-bold transition-all shadow-xl shadow-[#F5A623]/25 active:scale-[0.98] overflow-hidden group inline-flex items-center gap-2"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Briefcase className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Become a Dealer</span>
        </button>
      </div>
    );
  }

  const { dealer, leads, deals, commissions, payouts, targets, tasks } = data;

  const totalDealsValue = deals.reduce((sum, d) => sum + (d.net_sale_value || 0), 0);
  const totalCommissionEarned = commissions
    .filter((c) => c.status === 'Earned' || c.status === 'Approved' || c.status === 'Paid')
    .reduce((sum, c) => sum + (c.dealer_commission || 0), 0);
  const totalPaidOut = payouts
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + (p.net_payable || 0), 0);
  const pendingPayout = payouts
    .filter((p) => p.status !== 'Paid')
    .reduce((sum, p) => sum + (p.net_payable || 0), 0);

  const currentTarget = targets[0];

  const tabs: { key: TabType; label: string; icon: any; count: number }[] = [
    { key: 'overview', label: 'Overview', icon: Home, count: 0 },
    { key: 'leads', label: 'Leads', icon: Users, count: leads.length },
    { key: 'deals', label: 'Deals', icon: Briefcase, count: deals.length },
    { key: 'commission', label: 'Commission', icon: Wallet, count: commissions.length },
    { key: 'payouts', label: 'Payouts', icon: Banknote, count: payouts.length },
    { key: 'targets', label: 'Targets', icon: Target, count: targets.length },
    { key: 'tasks', label: 'Tasks', icon: ListChecks, count: tasks.length },
  ];

  const statCards = [
    {
      label: 'Total Deals',
      rawValue: totalDealsValue,
      sub: `${deals.length} Deals Closed`,
      icon: TrendingUp,
      color: '#F5A623',  // Hero metric — brand accent
    },
    {
      label: 'Earned',
      rawValue: totalCommissionEarned,
      sub: 'Commission Earned',
      icon: Award,
      color: '#94A3B8',  // Neutral
    },
    {
      label: 'Paid Out',
      rawValue: totalPaidOut,
      sub: 'Total Received',
      icon: CheckCircle2,
      color: '#94A3B8',  // Neutral
    },
    {
      label: 'Pending',
      rawValue: pendingPayout,
      sub: 'Awaiting Payout',
      icon: Clock,
      color: '#94A3B8',  // Neutral
    },
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      {/* ═════ HEADER ═════ */}
      <div className="scroll-reveal">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-6 h-[1px] bg-[#F5A623]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#F5A623] font-semibold">
                Dealer Dashboard
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading tracking-[-0.02em] leading-tight mb-3">
              Welcome back,{' '}
              <span className="gradient-text">{dealer.full_name?.split(' ')[0] || 'Dealer'}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-[#94A3B8]" />
                <span className="font-medium text-slate-300">{dealer.name}</span>
              </div>
              {dealer.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{dealer.city}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: getStatusColor(dealer.status || 'Draft').bg,
                border: `1px solid ${getStatusColor(dealer.status || 'Draft').border}`,
                color: getStatusColor(dealer.status || 'Draft').text,
              }}
            >
              {dealer.status || 'Draft'}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 hover:border-red-500/40 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═════ DEALER INFO CARD ═════ */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-xl shadow-black/20 scroll-reveal">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/40" />
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/50 to-transparent" />

        <div className="relative p-6 sm:p-7">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <InfoItem icon={Mail} label="Email" value={dealer.email || '—'} />
            <InfoItem icon={Phone} label="Phone" value={dealer.phone || '—'} />
            <InfoItem icon={MapPin} label="City" value={dealer.city || '—'} />
            <InfoItem icon={Banknote} label="Bank" value={dealer.bank_name || '—'} />
          </div>
        </div>
      </div>

      {/* ═════ STATS CARDS ═════ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 scroll-reveal">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group relative rounded-2xl bg-slate-900/40 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900/60 p-5"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-slate-500 tracking-wide">
                  {stat.label}
                </span>
                <Icon
                  className="w-4 h-4 transition-colors duration-300"
                  style={{ color: idx === 0 ? '#F5A623' : '#475569' }}
                />
              </div>

              <div
                className="text-2xl font-semibold font-heading tabular-nums tracking-[-0.02em] mb-1"
                style={{ color: idx === 0 ? '#F5A623' : '#F5F5F7' }}
              >
                <AnimatedNumber
                  value={stat.rawValue ?? 0}
                  format={formatPKR}
                  duration={1400}
                />
              </div>
              <div className="text-[11px] text-slate-500">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ═════ TABS ═════ */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] scroll-reveal">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-900/30" />

        <div className="relative p-2 sm:p-3">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 sm:overflow-x-auto sm:hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-medium sm:font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#F5A623]/15 text-[#F5A623] ring-1 ring-[#F5A623]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-[#F5A623]/25 text-[#F5A623]'
                          : 'bg-white/[0.06] text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═════ TAB CONTENT ═════ */}
      <div className="space-y-5">

        {/* ═════ OVERVIEW ═════ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Target */}
            {currentTarget && (
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] scroll-reveal">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/40" />
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5A623]/50 to-transparent" />

                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center">
                      <Target className="w-5 h-5 text-[#F5A623]" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-heading">Target Progress</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Target Sales</span>
                        <span className="text-white font-bold tabular-nums">
                          {formatPKR(currentTarget.target_sales_value)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-slate-400">Achieved</span>
                        <span className="text-[#22C55E] font-bold tabular-nums">
                          {formatPKR(currentTarget.achieved_sales_value)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#F5A623] to-[#E59615] rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              ((currentTarget.achieved_sales_value || 0) /
                                (currentTarget.target_sales_value || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 text-center mt-2 tabular-nums">
                        {(
                          ((currentTarget.achieved_sales_value || 0) /
                            (currentTarget.target_sales_value || 1)) *
                          100
                        ).toFixed(1)}
                        % Complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Latest Lead */}
            {leads.length > 0 && (
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] scroll-reveal">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/40" />
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#94A3B8]/50 to-transparent" />

                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-[#94A3B8]/15 border border-[#94A3B8]/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#94A3B8]" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-heading">Latest Lead</h3>
                  </div>

                  <div className="space-y-3.5">
                    <div className="text-base font-semibold text-white">
                      {leads[0].lead_name}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Phone</div>
                        <div className="text-white text-xs">{leads[0].phone}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Budget</div>
                        <div className="text-[#F5A623] font-bold text-xs tabular-nums">
                          {formatPKR(leads[0].budget)}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: getStatusColor(leads[0].status).bg,
                          border: `1px solid ${getStatusColor(leads[0].status).border}`,
                          color: getStatusColor(leads[0].status).text,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {leads[0].status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!currentTarget && leads.length === 0 && (
              <div className="lg:col-span-2">
                <EmptyState
                  icon={Compass}
                  title="Welcome to Your Dashboard"
                  description="Leads, deals, and targets assigned by Realtor X admin will appear here."
                />
              </div>
            )}
          </div>
        )}

        {/* ═════ LEADS ═════ */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {leads.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Leads Assigned"
                description="Admin-assigned customer inquiries will appear here."
              />
            ) : (
              leads.map((lead, idx) => (
                <div
                  key={lead.name}
                  className="group relative rounded-3xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 shadow-lg hover:shadow-xl scroll-reveal"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/40" />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="text-[10px] font-medium bg-[#94A3B8]/15 text-[#94A3B8] px-2 py-0.5 rounded-md border border-[#94A3B8]/25">
                            {lead.name}
                          </span>
                          {lead.priority && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                              style={{
                                backgroundColor: getStatusColor(lead.priority).bg,
                                border: `1px solid ${getStatusColor(lead.priority).border}`,
                                color: getStatusColor(lead.priority).text,
                              }}
                            >
                              {lead.priority}
                            </span>
                          )}
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                            style={{
                              backgroundColor: getStatusColor(lead.status).bg,
                              border: `1px solid ${getStatusColor(lead.status).border}`,
                              color: getStatusColor(lead.status).text,
                            }}
                          >
                            {lead.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white font-heading mb-3">
                          {lead.lead_name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {lead.phone}
                          </span>
                          {lead.city && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {lead.city}
                            </span>
                          )}
                          {lead.budget && (
                            <span className="flex items-center gap-1.5 text-[#F5A623] font-bold tabular-nums">
                              <Wallet className="w-3.5 h-3.5" />
                              {formatPKR(lead.budget)}
                            </span>
                          )}
                        </div>

                        {lead.notes && (
                          <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <p className="text-xs text-slate-400 italic leading-relaxed">
                              "{lead.notes}"
                            </p>
                          </div>
                        )}
                      </div>

                      {lead.next_followup_date && (
                        <div className="shrink-0 text-right">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
                            Next Followup
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                            <Calendar className="w-3 h-3 text-[#94A3B8]" />
                            <span className="text-xs text-white font-semibold">
                              {formatDate(lead.next_followup_date)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════ DEALS ═════ */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            {deals.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No Deals Yet"
                description="Your closed deals will appear here after admin approval."
              />
            ) : (
              deals.map((d, idx) => (
                <div
                  key={d.name}
                  className="group relative rounded-3xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 shadow-lg hover:shadow-xl scroll-reveal"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/40" />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-medium bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded-md border border-[#F5A623]/25">
                            {d.name}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                            style={{
                              backgroundColor: getStatusColor(d.status).bg,
                              border: `1px solid ${getStatusColor(d.status).border}`,
                              color: getStatusColor(d.status).text,
                            }}
                          >
                            {d.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white font-heading mb-1.5">
                          {d.property_title}
                        </h3>

                        <div className="text-xs text-slate-400">
                          Customer: <span className="text-white font-medium">{d.customer_name}</span>
                          {d.deal_date && <> · {formatDate(d.deal_date)}</>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
                      <MetricBox label="Net Value" value={formatPKR(d.net_sale_value)} color="#fff" />
                      <MetricBox label="Your Commission" value={formatPKR(d.dealer_commission)} color="#22C55E" />
                      <MetricBox label="Company Share" value={formatPKR(d.company_commission)} color="#94A3B8" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════ COMMISSION ═════ */}
        {activeTab === 'commission' && (
          <div className="space-y-4">
            {commissions.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No Commission Yet"
                description="Commission entries will appear after a deal closes."
              />
            ) : (
              commissions.map((c, idx) => (
                <div
                  key={c.name}
                  className="group relative rounded-3xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 shadow-lg hover:shadow-xl scroll-reveal"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/40" />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-medium bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded-md border border-[#F5A623]/25">
                            {c.name}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                            style={{
                              backgroundColor: getStatusColor(c.status).bg,
                              border: `1px solid ${getStatusColor(c.status).border}`,
                              color: getStatusColor(c.status).text,
                            }}
                          >
                            {c.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400">
                          Deal: <span className="font-medium text-white">{c.deal}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                          Your Share (80%)
                        </div>
                        <div className="text-xl font-bold text-[#22C55E] font-heading tabular-nums">
                          {formatPKR(c.dealer_commission)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
                      <MetricBox label="Gross" value={formatPKR(c.gross_commission)} color="#fff" />
                      <MetricBox label="Company (20%)" value={formatPKR(c.company_commission)} color="#94A3B8" />
                      <MetricBox label="Your Share (80%)" value={formatPKR(c.dealer_commission)} color="#22C55E" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════ PAYOUTS ═════ */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            {payouts.length === 0 ? (
              <EmptyState
                icon={Banknote}
                title="No Payouts Yet"
                description="Commission payouts will appear here after transfer completion."
              />
            ) : (
              payouts.map((p, idx) => (
                <div
                  key={p.name}
                  className="group relative rounded-3xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 shadow-lg hover:shadow-xl scroll-reveal"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/40" />

                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-medium bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded-md border border-[#F5A623]/25">
                            {p.name}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                            style={{
                              backgroundColor: getStatusColor(p.status).bg,
                              border: `1px solid ${getStatusColor(p.status).border}`,
                              color: getStatusColor(p.status).text,
                            }}
                          >
                            {p.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400">
                          Period: {formatDate(p.period_from)} → {formatDate(p.period_to)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                          Net Payable
                        </div>
                        <div className="text-xl font-bold text-[#22C55E] font-heading tabular-nums">
                          {formatPKR(p.net_payable)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
                      <MetricBox label="Gross" value={formatPKR(p.gross_payable)} color="#fff" />
                      <MetricBox label="Deductions" value={`-${formatPKR(p.deductions)}`} color="#EF4444" />
                      <MetricBox label="Net" value={formatPKR(p.net_payable)} color="#22C55E" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═════ TARGETS ═════ */}
        {activeTab === 'targets' && (
          <div className="space-y-4">
            {targets.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No Targets Set"
                description="Monthly targets will appear here when assigned by admin."
              />
            ) : (
              targets.map((t, idx) => {
                const salesProgress = Math.min(
                  ((t.achieved_sales_value || 0) / (t.target_sales_value || 1)) * 100,
                  100
                );
                const dealsProgress = Math.min(
                  ((t.achieved_deals_count || 0) / (t.target_deals_count || 1)) * 100,
                  100
                );
                return (
                  <div
                    key={t.name}
                    className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-lg scroll-reveal"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/40" />

                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center">
                            <Target className="w-5 h-5 text-[#F5A623]" />
                          </div>
                          <h3 className="text-lg font-bold text-white font-heading">Target Period</h3>
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatDate(t.period_from)} → {formatDate(t.period_to)}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <ProgressBar
                          label="Sales Value"
                          achieved={`${formatPKR(t.achieved_sales_value)} / ${formatPKR(t.target_sales_value)}`}
                          progress={salesProgress}
                          color="#F5A623"
                        />
                        <ProgressBar
                          label="Deals Count"
                          achieved={`${t.achieved_deals_count} / ${t.target_deals_count}`}
                          progress={dealsProgress}
                          color="#94A3B8"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═════ TASKS ═════ */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No Tasks Assigned"
                description="Your tasks assigned by admin will appear here."
              />
            ) : (
              tasks.map((task, idx) => (
                <div
                  key={task.name}
                  className="relative rounded-3xl overflow-hidden border border-white/[0.06] shadow-lg scroll-reveal"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/40" />

                  <div className="relative p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: task.status === 'Completed' ? '#22C55E' : 'transparent',
                            borderColor:
                              task.status === 'Completed'
                                ? '#22C55E'
                                : task.status === 'In Progress'
                                ? '#94A3B8'
                                : task.status === 'Overdue'
                                ? '#EF4444'
                                : '#475569',
                          }}
                        >
                          {task.status === 'Completed' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3
                            className={`text-sm font-bold font-heading ${
                              task.status === 'Completed'
                                ? 'text-slate-500 line-through'
                                : 'text-white'
                            }`}
                          >
                            {task.task_title}
                          </h3>
                          {task.description && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                          style={{
                            backgroundColor: getStatusColor(task.status).bg,
                            border: `1px solid ${getStatusColor(task.status).border}`,
                            color: getStatusColor(task.status).text,
                          }}
                        >
                          {task.status}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1.5">
                          Due: {formatDate(task.due_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════
const InfoItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 min-w-0">
    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-slate-400" />
    </div>
    <div className="min-w-0">
      <div className="text-[10px] text-slate-500 tracking-wide font-medium mb-1">
        {label}
      </div>
      <div className="text-sm text-white truncate" title={value}>
        {value}
      </div>
    </div>
  </div>
);

const MetricBox: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="min-w-0">
    <div className="text-[10px] text-slate-500 tracking-wide font-medium mb-1">
      {label}
    </div>
    <div className="text-sm font-bold truncate tabular-nums" style={{ color }} title={value}>
      {value}
    </div>
  </div>
);

const ProgressBar: React.FC<{
  label: string;
  achieved: string;
  progress: number;
  color: string;
}> = ({ label, achieved, progress, color }) => (
  <div>
    <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-sm text-white font-bold tabular-nums">{achieved}</span>
    </div>
    <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
        }}
      />
    </div>
    <div className="text-xs text-slate-400 mt-1.5 text-right tabular-nums">
      {progress.toFixed(1)}%
    </div>
  </div>
);

const EmptyState: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="relative rounded-3xl overflow-hidden border border-white/[0.06]">
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/20" />

    <div className="relative text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-white font-heading mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">{description}</p>
    </div>
  </div>
);
