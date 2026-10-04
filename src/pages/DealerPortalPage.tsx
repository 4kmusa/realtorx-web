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
} from 'lucide-react';

interface DealerPortalPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_BASE = import.meta.env.PROD ? '/api/erp' : `${ERPNEXT_URL}/api`;

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

export const DealerPortalPage: React.FC<DealerPortalPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('login');
    }
  }, [isAuthenticated, onNavigate]);

  // Fetch dashboard data
  useEffect(() => {
    async function loadDashboard() {
      if (!user?.email) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/method/realtorx.api.dealer_dashboard`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: user.email }),
          }
        );

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

  // Loading state
  if (loading) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 text-center">
        <Loader2 className="w-10 h-10 text-[#F5A623] animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading your dealer dashboard...</p>
      </div>
    );
  }

  // No dealer profile
  if (!data?.dealer) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center">
          <Briefcase className="w-10 h-10 text-[#F5A623]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Dealer Profile Not Found
        </h1>
        <p className="text-slate-400 mb-8">
          You need to register as a Dealer first.
        </p>
        <button
          onClick={() => onNavigate('become-dealer')}
          className="px-6 py-3 bg-[#F5A623] text-slate-950 rounded-lg font-bold"
        >
          Become a Dealer
        </button>
      </div>
    );
  }

  const { dealer, leads, deals, commissions, payouts, targets, tasks } = data;

  // Stats calculations
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

  // Tabs
  const tabs: { key: TabType; label: string; icon: any; count: number }[] = [
    { key: 'overview', label: 'Overview', icon: Home, count: 0 },
    { key: 'leads', label: 'Leads', icon: Users, count: leads.length },
    { key: 'deals', label: 'Deals', icon: Briefcase, count: deals.length },
    { key: 'commission', label: 'Commission', icon: Wallet, count: commissions.length },
    { key: 'payouts', label: 'Payouts', icon: Banknote, count: payouts.length },
    { key: 'targets', label: 'Targets', icon: Target, count: targets.length },
    { key: 'tasks', label: 'Tasks', icon: ListChecks, count: tasks.length },
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>Dealer Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading">
            Welcome, {dealer.full_name?.split(' ')[0] || 'Dealer'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dealer ID: <span className="font-mono text-slate-300">{dealer.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              dealer.status === 'Active'
                ? 'bg-[#28A745]/15 text-[#28A745] border border-[#28A745]/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {dealer.status || 'Draft'}
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Dealer Info Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Email</div>
              <div className="text-sm text-white truncate">{dealer.email}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Phone</div>
              <div className="text-sm text-white">{dealer.phone || '—'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">City</div>
              <div className="text-sm text-white">{dealer.city || '—'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Banknote className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Bank</div>
              <div className="text-sm text-white truncate">{dealer.bank_name || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F5A623]/15 to-[#F5A623]/5 border border-[#F5A623]/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-[#F5A623]" />
            <span className="text-[10px] font-mono text-[#F5A623] uppercase tracking-wider">
              Total Deals
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-heading">
            {formatPKR(totalDealsValue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{deals.length} Deals Closed</div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#28A745]/15 to-[#28A745]/5 border border-[#28A745]/30">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-[#28A745]" />
            <span className="text-[10px] font-mono text-[#28A745] uppercase tracking-wider">
              Earned
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-heading">
            {formatPKR(totalCommissionEarned)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Commission Earned</div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2490EF]/15 to-[#2490EF]/5 border border-[#2490EF]/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-[#2490EF]" />
            <span className="text-[10px] font-mono text-[#2490EF] uppercase tracking-wider">
              Paid Out
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-heading">
            {formatPKR(totalPaidOut)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Received</div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
              Pending
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-heading">
            {formatPKR(pendingPayout)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Awaiting Payout</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#F5A623] text-[#F5A623]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-[#F5A623]/20 text-[#F5A623]' : 'bg-slate-800 text-slate-400'
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

      {/* Tab Content */}
      <div className="space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Target Progress */}
            {currentTarget && (
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#F5A623]" />
                  <h3 className="text-lg font-bold text-white font-heading">Target Progress</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Target Sales</span>
                    <span className="text-white font-bold">
                      {formatPKR(currentTarget.target_sales_value)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Achieved</span>
                    <span className="text-[#28A745] font-bold">
                      {formatPKR(currentTarget.achieved_sales_value)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F5A623] to-[#FFA500]"
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
                  <div className="text-xs text-slate-400 text-center">
                    {(
                      ((currentTarget.achieved_sales_value || 0) /
                        (currentTarget.target_sales_value || 1)) *
                      100
                    ).toFixed(1)}
                    % Complete
                  </div>
                </div>
              </div>
            )}

            {/* Recent Lead */}
            {leads.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#2490EF]" />
                  <h3 className="text-lg font-bold text-white font-heading">Latest Lead</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-base font-semibold text-white">{leads[0].lead_name}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Phone</span>
                    <span className="text-white font-mono">{leads[0].phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Budget</span>
                    <span className="text-[#F5A623] font-bold">
                      {formatPKR(leads[0].budget)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#2490EF]/15 text-[#2490EF]">
                      {leads[0].status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="space-y-3">
            {leads.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Leads Assigned"
                description="Your leads will appear here"
              />
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.name}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono bg-[#2490EF]/15 text-[#2490EF] px-2 py-0.5 rounded">
                          {lead.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            lead.priority === 'High'
                              ? 'bg-red-500/15 text-red-400'
                              : lead.priority === 'Medium'
                              ? 'bg-[#F5A623]/15 text-[#F5A623]'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {lead.priority}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#28A745]/15 text-[#28A745]">
                          {lead.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">
                        {lead.lead_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </span>
                        {lead.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {lead.city}
                          </span>
                        )}
                        {lead.budget && (
                          <span className="text-[#F5A623] font-bold">
                            {formatPKR(lead.budget)}
                          </span>
                        )}
                      </div>
                      {lead.notes && (
                        <p className="text-xs text-slate-400 mt-2 italic">"{lead.notes}"</p>
                      )}
                    </div>
                    {lead.next_followup_date && (
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500 mb-1">Next Followup</div>
                        <div className="text-sm text-white font-semibold">
                          {formatDate(lead.next_followup_date)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* DEALS TAB */}
        {activeTab === 'deals' && (
          <div className="space-y-3">
            {deals.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No Deals Yet"
                description="Your closed deals will appear here"
              />
            ) : (
              deals.map((d) => (
                <div
                  key={d.name}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded">
                          {d.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2490EF]/15 text-[#2490EF]">
                          {d.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">
                        {d.property_title}
                      </h3>
                      <div className="text-xs text-slate-400">
                        Customer: <span className="text-white">{d.customer_name}</span> ·{' '}
                        {formatDate(d.deal_date)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Net Value
                      </div>
                      <div className="text-sm font-bold text-white">
                        {formatPKR(d.net_sale_value)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Your Commission
                      </div>
                      <div className="text-sm font-bold text-[#28A745]">
                        {formatPKR(d.dealer_commission)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Company Share
                      </div>
                      <div className="text-sm font-semibold text-slate-300">
                        {formatPKR(d.company_commission)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* COMMISSION TAB */}
        {activeTab === 'commission' && (
          <div className="space-y-3">
            {commissions.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No Commission Yet"
                description="Commission entries will appear here"
              />
            ) : (
              commissions.map((c) => (
                <div
                  key={c.name}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded">
                          {c.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.status === 'Paid'
                              ? 'bg-[#28A745]/15 text-[#28A745]'
                              : c.status === 'Earned'
                              ? 'bg-[#2490EF]/15 text-[#2490EF]'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Deal: <span className="font-mono text-white">{c.deal}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Your Share
                      </div>
                      <div className="text-lg font-bold text-[#28A745]">
                        {formatPKR(c.dealer_commission)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-500 mb-1">Gross</div>
                      <div className="text-white font-semibold">
                        {formatPKR(c.gross_commission)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">Company</div>
                      <div className="text-slate-300 font-semibold">
                        {formatPKR(c.company_commission)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">Dealer</div>
                      <div className="text-[#28A745] font-semibold">
                        {formatPKR(c.dealer_commission)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PAYOUTS TAB */}
        {activeTab === 'payouts' && (
          <div className="space-y-3">
            {payouts.length === 0 ? (
              <EmptyState
                icon={Banknote}
                title="No Payouts Yet"
                description="Commission payouts will appear here"
              />
            ) : (
              payouts.map((p) => (
                <div
                  key={p.name}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded">
                          {p.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.status === 'Paid'
                              ? 'bg-[#28A745]/15 text-[#28A745]'
                              : p.status === 'Approved'
                              ? 'bg-[#2490EF]/15 text-[#2490EF]'
                              : 'bg-slate-700 text-slate-300'
                          }`}
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
                      <div className="text-lg font-bold text-[#28A745]">
                        {formatPKR(p.net_payable)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-500 mb-1">Gross</div>
                      <div className="text-white font-semibold">
                        {formatPKR(p.gross_payable)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">Deductions</div>
                      <div className="text-red-400 font-semibold">
                        -{formatPKR(p.deductions)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">Net</div>
                      <div className="text-[#28A745] font-semibold">
                        {formatPKR(p.net_payable)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TARGETS TAB */}
        {activeTab === 'targets' && (
          <div className="space-y-3">
            {targets.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No Targets Set"
                description="Your monthly targets will appear here"
              />
            ) : (
              targets.map((t) => {
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
                    className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-bold text-white font-heading">
                        Target Period
                      </h3>
                      <div className="text-xs text-slate-400">
                        {formatDate(t.period_from)} → {formatDate(t.period_to)}
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Sales Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-300">Sales Value</span>
                          <span className="text-sm text-white font-bold">
                            {formatPKR(t.achieved_sales_value)} /{' '}
                            {formatPKR(t.target_sales_value)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#F5A623] to-[#FFA500]"
                            style={{ width: `${salesProgress}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-400 mt-1 text-right">
                          {salesProgress.toFixed(1)}%
                        </div>
                      </div>

                      {/* Deals Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-300">Deals Count</span>
                          <span className="text-sm text-white font-bold">
                            {t.achieved_deals_count} / {t.target_deals_count}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#2490EF] to-[#1b7ecf]"
                            style={{ width: `${dealsProgress}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-400 mt-1 text-right">
                          {dealsProgress.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No Tasks Assigned"
                description="Your tasks will appear here"
              />
            ) : (
              tasks.map((task) => (
                <div
                  key={task.name}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          task.status === 'Completed'
                            ? 'bg-[#28A745] border-[#28A745]'
                            : task.status === 'In Progress'
                            ? 'border-[#2490EF]'
                            : task.status === 'Overdue'
                            ? 'border-red-400'
                            : 'border-slate-600'
                        }`}
                      >
                        {task.status === 'Completed' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className={`text-sm font-bold ${
                            task.status === 'Completed'
                              ? 'text-slate-500 line-through'
                              : 'text-white'
                          }`}
                        >
                          {task.task_title}
                        </h3>
                        {task.description && (
                          <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          task.status === 'Completed'
                            ? 'bg-[#28A745]/15 text-[#28A745]'
                            : task.status === 'In Progress'
                            ? 'bg-[#2490EF]/15 text-[#2490EF]'
                            : task.status === 'Overdue'
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {task.status}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Due: {formatDate(task.due_date)}
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

// Empty state component
const EmptyState: React.FC<{
  icon: any;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/80 flex items-center justify-center">
      <Icon className="w-8 h-8 text-slate-500" />
    </div>
    <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 max-w-md mx-auto">{description}</p>
  </div>
);
