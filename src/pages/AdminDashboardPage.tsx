import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Home, FileText, Briefcase, Loader2, LogOut, TrendingUp } from 'lucide-react';
import { DealModal } from '../components/admin/DealModal';
import { CreateDealModal } from '../components/admin/CreateDealModal';
export const AdminDashboardPage = ({ onNavigate }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const loadData = () => {
    setLoading(true);
    fetch('/api/erp/method/realtor_x.api.get_full_dashboard_data', { credentials: 'include' }).then(r => r.json()).then(res => setData(res.message)).finally(() => setLoading(false));
  };
  useEffect(() => { loadData(); }, []);
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0B1A30]"><Loader2 className="w-10 h-10 animate-spin text-[#F5A623]" /></div>;
  if (!data) return null;
  return (
    <div className="flex h-screen bg-[#0B1A30] text-slate-200">
      <aside className="w-64 bg-[#081221] border-r border-white/10 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/10"><ShieldCheck className="w-6 h-6 text-[#F5A623] mr-2" /><span className="font-bold text-white">RealtorX</span></div>
        <div className="flex-1 py-4 px-3 space-y-1">
          {[{ id: 'overview', label: 'Overview', icon: TrendingUp }, { id: 'deals', label: 'Deals', icon: FileText }, { id: 'inventory', label: 'Inventory', icon: Home }, { id: 'customers', label: 'Customers', icon: Users }, { id: 'dealers', label: 'Dealers', icon: Briefcase }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === t.id ? 'bg-[#F5A623]/10 text-[#F5A623]' : 'text-slate-400 hover:text-white'}`}><t.icon className="w-4 h-4" /> {t.label}</button>
          ))}
        </div>
        <div className="p-4 border-t border-white/10"><button onClick={() => onNavigate('home')} className="text-red-400 text-sm flex items-center gap-2"><LogOut className="w-4 h-4" /> Back</button></div>
      </aside>
      <main className="flex-1 flex flex-col h-full">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6">
          <h2 className="text-white font-bold capitalize">{activeTab}</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowCreateDeal(true)} className="bg-[#F5A623] text-black px-4 py-2 rounded-lg text-sm font-bold">+ New Deal</button>
            <button onClick={loadData} className="bg-white/5 px-4 py-2 rounded-lg text-sm text-white">Refresh</button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-4 gap-4">
              {[{ l: 'Total Cash', v: `PKR ${data.summary.total_cash.toLocaleString()}` }, { l: 'Customers', v: data.summary.total_customers }, { l: 'Deals', v: data.summary.total_deals }, { l: 'Properties', v: data.summary.total_properties }].map((c, i) => (
                <div key={i} className="bg-[#081221] border border-white/10 rounded-2xl p-6"><div className="text-xs text-slate-400 uppercase mb-2">{c.l}</div><div className="text-2xl font-bold text-white">{c.v}</div></div>
              ))}
            </div>
          )}
          {activeTab === 'deals' && (
            <div className="bg-[#081221] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm"><thead className="bg-[#0B1A30] text-slate-400"><tr><th className="p-4">Customer</th><th className="p-4">Property</th><th className="p-4">Amount</th><th className="p-4">Status</th></tr></thead>
                <tbody className="divide-y divide-white/5">{data.all_deals.map((d: any) => (<tr key={d.name} onClick={() => setSelectedDeal(d.name)} className="hover:bg-white/5 cursor-pointer"><td className="p-4 text-white">{d.customer_name}</td><td className="p-4">{d.property_title}</td><td className="p-4 text-[#F5A623] font-bold">PKR {d.net_sale_value?.toLocaleString()}</td><td className="p-4">{d.status}</td></tr>))}</tbody>
              </table>
            </div>
          )}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-6 gap-4">
              {data.all_properties.map((p: any) => (<div key={p.name} className={`p-4 rounded-xl border ${p.status === 'Available' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}><div className="text-xs font-bold text-white truncate">{p.property_title}</div><div className={`text-xs font-bold mt-2 ${p.status === 'Available' ? 'text-green-400' : 'text-red-400'}`}>{p.status}</div></div>))}
            </div>
          )}
          {activeTab === 'customers' && (
             <div className="bg-[#081221] border border-white/10 rounded-2xl overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-[#0B1A30] text-slate-400"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th></tr></thead><tbody className="divide-y divide-white/5">{data.all_customers.map((c: any) => (<tr key={c.name}><td className="p-4 text-white">{c.full_name}</td><td className="p-4">{c.email}</td><td className="p-4">{c.phone}</td></tr>))}</tbody></table></div>
          )}
          {activeTab === 'dealers' && (
             <div className="bg-[#081221] border border-white/10 rounded-2xl overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-[#0B1A30] text-slate-400"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Status</th></tr></thead><tbody className="divide-y divide-white/5">{data.all_dealers.map((d: any) => (<tr key={d.name}><td className="p-4 text-white">{d.full_name}</td><td className="p-4">{d.email}</td><td className="p-4 text-green-400">{d.status}</td></tr>))}</tbody></table></div>
          )}
        </div>
      </main>
      {selectedDeal && <DealModal dealName={selectedDeal} onClose={() => setSelectedDeal(null)} onRefresh={loadData} />}
      {showCreateDeal && <CreateDealModal data={data} onClose={() => setShowCreateDeal(false)} onSuccess={loadData} />}
    </div>
  );
};
export default AdminDashboardPage;
