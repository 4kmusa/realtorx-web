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
  Sparkles,
  Home,
  Briefcase,
  CreditCard,
  MapPinned,
  ChevronRight,
} from 'lucide-react';

interface CustomerPortalPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_BASE = import.meta.env.PROD ? '/api/erp' : `${ERPNEXT_URL}/api`;

type TabType = 'overview' | 'bookings' | 'deals' | 'payments' | 'visits';

interface DashboardData {
  customer: any;
  bookings: any[];
  deals: any[];
  payments: any[];
  installments: any[];
  visits: any[];
}

// Format PKR currency
const formatPKR = (amount: number | undefined | null): string => {
  if (!amount && amount !== 0) return 'PKR 0';
  if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(2)} Lakh`;
  return `PKR ${amount.toLocaleString()}`;
};

// Format date
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

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ onNavigate }) => {
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
          `${API_BASE}/method/realtorx.api.customer_dashboard`,
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
        <Loader2 className="w-10 h-10 text-[#2490EF] animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading your dashboard...</p>
      </div>
    );
  }

  // No customer profile
  if (!data?.customer) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center">
          <User className="w-10 h-10 text-[#F5A623]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Customer Profile Not Found
        </h1>
        <p className="text-slate-400 mb-8">
          You need to register as a Customer first.
        </p>
        <button
          onClick={() => onNavigate('become-customer')}
          className="px-6 py-3 bg-[#2490EF] text-white rounded-lg font-semibold"
        >
          Become a Customer
        </button>
      </div>
    );
  }

  const { customer, bookings, deals, payments, installments, visits } = data;

  // Stats calculations
  const totalBooked = bookings.reduce((sum, b) => sum + (b.net_price || 0), 0);
  const totalPaid = installments
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const totalPending = installments
    .filter((i) => i.status !== 'Paid')
    .reduce((sum, i) => sum + ((i.amount || 0) - (i.paid_amount || 0)), 0);

  // Tabs
  const tabs: { key: TabType; label: string; icon: any; count: number }[] = [
    { key: 'overview', label: 'Overview', icon: Home, count: 0 },
    { key: 'bookings', label: 'Bookings', icon: Building2, count: bookings.length },
    { key: 'deals', label: 'Deals', icon: Briefcase, count: deals.length },
    {
      key: 'payments',
      label: 'Payments',
      icon: CreditCard,
      count: installments.length,
    },
    { key: 'visits', label: 'Site Visits', icon: MapPinned, count: visits.length },
  ];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] bg-[#2490EF]/10 border border-[#2490EF]/30 px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Customer Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading">
            Welcome, {customer.full_name?.split(' ')[0] || 'Customer'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Customer ID: <span className="font-mono text-slate-300">{customer.name}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Customer Info Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                Email
              </div>
              <div className="text-sm text-white truncate">{customer.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                Phone
              </div>
              <div className="text-sm text-white">{customer.phone || '—'}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                CNIC
              </div>
              <div className="text-sm text-white font-mono">
                {customer.cnic_number || '—'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div className="min-w-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                City
              </div>
              <div className="text-sm text-white">{customer.city || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2490EF]/15 to-[#2490EF]/5 border border-[#2490EF]/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-[#2490EF]" />
            <span className="text-[10px] font-mono text-[#2490EF] uppercase tracking-wider">
              Total Value
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-heading">
            {formatPKR(totalBooked)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Booked Properties</div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#28A745]/15 to-[#28A745]/5 border border-[#28A745]/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-[#28A745]" />
            <span className="text-[10px] font-mono text-[#28A745] uppercase tracking-wider">
              Received
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-heading">
            {formatPKR(totalPaid)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Payments Received</div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F5A623]/15 to-[#F5A623]/5 border border-[#F5A623]/30">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-[#F5A623]" />
            <span className="text-[10px] font-mono text-[#F5A623] uppercase tracking-wider">
              Balance
            </span>
          </div>
          <div className="text-2xl font-bold text-white font-heading">
            {formatPKR(totalPending)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Pending Payment</div>
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
                    ? 'border-[#2490EF] text-[#2490EF]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-[#2490EF]/20 text-[#2490EF]'
                        : 'bg-slate-800 text-slate-400'
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
            {/* Recent Booking */}
            {bookings.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#2490EF]" />
                  <h3 className="text-lg font-bold text-white font-heading">
                    Latest Booking
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="text-base font-semibold text-white">
                    {bookings[0].property_title}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Booking ID</span>
                    <span className="text-white font-mono">
                      {bookings[0].name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Net Price</span>
                    <span className="text-[#F5A623] font-bold">
                      {formatPKR(bookings[0].net_price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#28A745]/15 text-[#28A745]">
                      {bookings[0].status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Installment */}
            {installments.filter((i) => i.status !== 'Paid').length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 text-[#F5A623]" />
                  <h3 className="text-lg font-bold text-white font-heading">
                    Next Payment Due
                  </h3>
                </div>
                {(() => {
                  const next = installments
                    .filter((i) => i.status !== 'Paid')
                    .sort(
                      (a, b) =>
                        new Date(a.due_date).getTime() -
                        new Date(b.due_date).getTime()
                    )[0];
                  return (
                    <div className="space-y-3">
                      <div className="text-base font-semibold text-white">
                        Installment #{next.installment_number}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Amount</span>
                        <span className="text-[#F5A623] font-bold">
                          {formatPKR(next.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Due Date</span>
                        <span className="text-white">
                          {formatDate(next.due_date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Status</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            next.status === 'Overdue'
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-[#F5A623]/15 text-[#F5A623]'
                          }`}
                        >
                          {next.status}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No Bookings Yet"
                description="Browse properties and book your first one"
                onNavigate={() => onNavigate('properties')}
                actionLabel="Browse Properties"
              />
            ) : (
              bookings.map((b) => (
                <div
                  key={b.name}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono bg-[#2490EF]/15 text-[#2490EF] px-2 py-0.5 rounded">
                          {b.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.status === 'Confirmed'
                              ? 'bg-[#28A745]/15 text-[#28A745]'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">
                        {b.property_title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(b.booking_date)}
                        </span>
                        <span className="text-[#F5A623] font-bold">
                          {formatPKR(b.net_price)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1">
                        Booking Amount
                      </div>
                      <div className="text-sm font-bold text-[#28A745]">
                        {formatPKR(b.booking_amount)}
                      </div>
                    </div>
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
                description="Your active deals will appear here"
                onNavigate={() => onNavigate('properties')}
                actionLabel="Browse Properties"
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
                        Deal Date: {formatDate(d.deal_date)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Gross Price
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {formatPKR(d.gross_price)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Discount
                      </div>
                      <div className="text-sm font-semibold text-slate-300">
                        {formatPKR(d.discount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Net Value
                      </div>
                      <div className="text-sm font-bold text-[#F5A623]">
                        {formatPKR(d.net_sale_value)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Company Comm.
                      </div>
                      <div className="text-sm font-semibold text-[#28A745]">
                        {formatPKR(d.company_commission)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Installments */}
            <div>
              <h3 className="text-lg font-bold text-white font-heading mb-3">
                Payment Schedule
              </h3>
              <div className="space-y-3">
                {installments.length === 0 ? (
                  <EmptyState
                    icon={CreditCard}
                    title="No Payment Schedule"
                    description="Payment schedule will appear after booking"
                  />
                ) : (
                  installments.map((inst) => {
                    const progress =
                      inst.amount > 0
                        ? (inst.paid_amount / inst.amount) * 100
                        : 0;
                    return (
                      <div
                        key={inst.name}
                        className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800"
                      >
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white">
                              #{inst.installment_number}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">
                                Installment {inst.installment_number}
                              </div>
                              <div className="text-xs text-slate-400">
                                Due: {formatDate(inst.due_date)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">
                              {formatPKR(inst.amount)}
                            </div>
                            <div
                              className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1 ${
                                inst.status === 'Paid'
                                  ? 'bg-[#28A745]/15 text-[#28A745]'
                                  : inst.status === 'Overdue'
                                  ? 'bg-red-500/15 text-red-400'
                                  : 'bg-[#F5A623]/15 text-[#F5A623]'
                              }`}
                            >
                              {inst.status}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full ${
                              inst.status === 'Paid'
                                ? 'bg-[#28A745]'
                                : 'bg-[#2490EF]'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Paid: {formatPKR(inst.paid_amount)}</span>
                          <span>
                            Balance:{' '}
                            {formatPKR((inst.amount || 0) - (inst.paid_amount || 0))}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white font-heading mb-3">
                  Payment History
                </h3>
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div
                      key={p.name}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {formatPKR(p.amount)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatDate(p.payment_date)} · {p.payment_mode}
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-[#28A745]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISITS TAB */}
        {activeTab === 'visits' && (
          <div className="space-y-3">
            {visits.length === 0 ? (
              <EmptyState
                icon={MapPinned}
                title="No Site Visits"
                description="Schedule a site visit to view properties"
                onNavigate={() => onNavigate('properties')}
                actionLabel="Browse Properties"
              />
            ) : (
              visits.map((v) => (
                <div
                  key={v.name}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {v.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            v.status === 'Completed'
                              ? 'bg-[#28A745]/15 text-[#28A745]'
                              : v.status === 'Cancelled'
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-[#2490EF]/15 text-[#2490EF]'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">
                        {v.property_title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(v.visit_date)}
                        </span>
                        {v.visit_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {v.visit_time}
                          </span>
                        )}
                      </div>
                      {v.outcome && (
                        <p className="text-xs text-slate-400 mt-2 italic">
                          "{v.outcome}"
                        </p>
                      )}
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
  onNavigate?: () => void;
  actionLabel?: string;
}> = ({ icon: Icon, title, description, onNavigate, actionLabel }) => (
  <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/80 flex items-center justify-center">
      <Icon className="w-8 h-8 text-slate-500" />
    </div>
    <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">{description}</p>
    {onNavigate && actionLabel && (
      <button
        onClick={onNavigate}
        className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] rounded-lg transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
