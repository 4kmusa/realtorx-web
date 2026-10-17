import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Home, TrendingUp, Loader2, UserPlus, X } from 'lucide-react';
import { PageId, Language } from '../types';

interface AdminDashboardPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

let _csrfToken: string | null = null;

const getCSRFToken = async (): Promise<string> => {
  if (_csrfToken) return _csrfToken;
  try {
    const res = await fetch("/api/method/frappe.auth.get_csrf_token", { credentials: "include" });
    const json = await res.json();
    _csrfToken = json.message || "";
    return _csrfToken!;
  } catch {
    return "";
  }
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [custForm, setCustForm] = useState({ full_name: '', email: '', phone: '', city: 'Karachi' });
  const [custMsg, setCustMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/erp/method/realtor_x.api.admin_dashboard', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || json.exception) throw new Error(json.exception || 'Failed to load');
      setData(json.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApproveCommission = async (commName: string) => {
    setActionLoading(commName);
    try {
      const res = await fetch('/api/erp/method/realtor_x.api.approve_commission', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': await getCSRFToken() }, 
        credentials: 'include',
        body: JSON.stringify({ commission_name: commName })
      });
      const json = await res.json();
      if (!res.ok || json.exception) throw new Error(json.exception || 'Failed');
      alert("✅ Commission Approved!"); loadData();
    } catch (err: any) { alert("❌ " + err.message); } finally { setActionLoading(null); }
  };

  const handleSettleDeveloper = async (dealName: string) => {
    setActionLoading(dealName);
    try {
      const res = await fetch('/api/erp/method/realtor_x.api.settle_developer', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': await getCSRFToken() }, 
        credentials: 'include',
        body: JSON.stringify({ deal_name: dealName })
      });
      const json = await res.json();
      if (!res.ok || json.exception) throw new Error(json.exception || 'Failed');
      alert("✅ Developer Settled!\nJE: " + json.message.je_name); loadData();
    } catch (err: any) { alert("❌ " + err.message); } finally { setActionLoading(null); }
  };

  const handlePayDealer = async (payoutName: string) => {
    if (!window.confirm("Are you sure you want to pay this dealer?")) return;
    setActionLoading(payoutName);
    try {
      const res = await fetch('/api/erp/method/realtor_x.api.pay_dealer_payout', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': await getCSRFToken() }, 
        credentials: 'include',
        body: JSON.stringify({ payout_name: payoutName })
      });
      const json = await res.json();
      if (!res.ok || json.exception) throw new Error(json.exception || 'Failed');
      alert("✅ Dealer Paid!\nJE: " + json.message.je_name); loadData();
    } catch (err: any) { alert("❌ " + err.message); } finally { setActionLoading(null); }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('add_cust');
    setCustMsg(null);
    try {
      const res = await fetch('/api/erp/method/realtor_x.api.create_customer', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': await getCSRFToken() }, 
        credentials: 'include',
        body: JSON.stringify(custForm)
      });
      const json = await res.json();
      if (!res.ok || json.exception) throw new Error(json.exception || 'Failed');
      
      setCustMsg({ type: 'success', text: `✅ Customer Created! ID: ${json.message.customer_id}. Password is RealtorX@123` });
      setCustForm({ full_name: '', email: '', phone: '', city: 'Karachi' });
      loadData();
    } catch (err: any) {
      setCustMsg({ type: 'error', text: "❌ Error: " + err.message });
    } finally { setActionLoading(null); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#F5A623]" /></div>;
  if (error) return <div className="p-20 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#F5A623]" />
          <h1 className="text-3xl font-bold text-white font-heading">Admin Dashboard</h1>
        </div>
        <button onClick={() => setShowAddCustomer(true)} className="flex items-center gap-2 bg-[#F5A623] text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#e0951b] transition">
          <UserPlus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1A30] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowAddCustomer(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            <h2 className="text-xl font-bold text-white mb-4">Create New Customer</h2>
            {custMsg && <div className={`p-3 mb-4 rounded-lg text-sm ${custMsg.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{custMsg.text}</div>}
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div><label className="block text-xs text-slate-400 mb-1">Full Name</label><input required type="text" value={custForm.full_name} onChange={e => setCustForm({...custForm, full_name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">Email Address</label><input required type="email" value={custForm.email} onChange={e => setCustForm({...custForm, email: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">Phone (+92)</label><input required type="text" placeholder="+923001234567" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">City</label><input required type="text" value={custForm.city} onChange={e => setCustForm({...custForm, city: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" /></div>
              <button disabled={actionLoading === 'add_cust'} type="submit" className="w-full bg-[#F5A623] text-black font-bold py-2 rounded-lg mt-2">{actionLoading === 'add_cust' ? 'Creating...' : 'Create Customer & User Account'}</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Dealers', value: data.summary.total_dealers, icon: Users, color: 'text-blue-400' },
          { label: 'Total Customers', value: data.summary.total_customers, icon: Users, color: 'text-green-400' },
          { label: 'Active Deals', value: data.summary.total_deals, icon: TrendingUp, color: 'text-[#F5A623]' },
          { label: 'Properties', value: data.summary.total_properties, icon: Home, color: 'text-purple-400' },
        ].map((card, i) => (
          <div key={i} className="bg-slate-900/60 border border-white/[0.06] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Commissions */}
        <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/[0.06] flex justify-between items-center bg-slate-900/80">
            <h2 className="font-semibold text-white">Pending Commissions</h2>
            <span className="bg-[#F5A623]/20 text-[#F5A623] text-xs px-2 py-1 rounded-full">{data.pending_commissions.length}</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {data.pending_commissions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No pending commissions</div>
            ) : (
              data.pending_commissions.map((c: any) => (
                <div key={c.name} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                  <div>
                    <div className="text-sm font-medium text-white">{c.deal}</div>
                    <div className="text-xs text-slate-400">Dealer: {c.dealer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#F5A623]">PKR {c.dealer_commission.toLocaleString()}</div>
                    <button onClick={() => handleApproveCommission(c.name)} disabled={actionLoading === c.name} className="text-xs text-blue-400 hover:text-blue-300 mt-1 font-medium disabled:opacity-50">
                      {actionLoading === c.name ? 'Approving...' : 'Approve →'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Dealer Payouts */}
        <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/[0.06] flex justify-between items-center bg-slate-900/80">
            <h2 className="font-semibold text-white">Dealer Payouts</h2>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">{data.pending_payouts.length}</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {data.pending_payouts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No pending payouts</div>
            ) : (
              data.pending_payouts.map((p: any) => (
                <div key={p.name} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                  <div>
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="text-xs text-slate-400">Dealer: {p.dealer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">PKR {p.net_payable.toLocaleString()}</div>
                    <button onClick={() => handlePayDealer(p.name)} disabled={actionLoading === p.name} className="text-xs text-blue-400 hover:text-blue-300 mt-1 font-medium disabled:opacity-50">
                      {actionLoading === p.name ? 'Paying...' : 'Pay Dealer →'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Developer Settlements */}
        <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/[0.06] flex justify-between items-center bg-slate-900/80">
            <h2 className="font-semibold text-white">Developer Settlements</h2>
            <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">{data.pending_settlements.length}</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {data.pending_settlements.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No pending settlements</div>
            ) : (
              data.pending_settlements.map((d: any) => (
                <div key={d.name} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                  <div>
                    <div className="text-sm font-medium text-white">{d.name}</div>
                    <div className="text-xs text-slate-400">Developer: {d.custom_developer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">PKR {d.custom_developer_payable.toLocaleString()}</div>
                    <button onClick={() => handleSettleDeveloper(d.name)} disabled={actionLoading === d.name} className="text-xs text-blue-400 hover:text-blue-300 mt-1 font-medium disabled:opacity-50">
                      {actionLoading === d.name ? 'Settling...' : 'Settle →'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboardPage;
