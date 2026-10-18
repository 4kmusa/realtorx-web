import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
export const CreateDealModal = ({ data, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customer: '', property: '', dealer: '', total_price: '' });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`/api/erp/method/realtor_x.api.create_deal?customer=${form.customer}&property_name=${form.property}&dealer=${form.dealer}&total_price=${form.total_price}`, { credentials: 'include' });
      const json = await res.json();
      if (json.message?.status === 'success') { alert("✅ Deal Created!"); onSuccess(); onClose(); }
      else { alert("❌ Error: " + (json.message?.error || "Check Developer")); }
    } catch { alert("❌ Error"); } finally { setLoading(false); }
  };
  const cOpts = data.all_customers?.map((c: any) => ({ value: c.name, label: `${c.full_name} (${c.phone})` })) || [];
  const pOpts = data.all_properties?.filter((p: any) => p.status === 'Available').map((p: any) => ({ value: p.name, label: `${p.property_title} - PKR ${p.list_price?.toLocaleString()}` })) || [];
  const dOpts = data.all_dealers?.map((d: any) => ({ value: d.name, label: d.full_name })) || [];
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#081221] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold text-white mb-6">Create New Deal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs text-slate-400 mb-1">Customer</label><SearchableSelect options={cOpts} value={form.customer} onChange={(v:any) => setForm({...form, customer: v})} placeholder="Search Customer" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Property</label><SearchableSelect options={pOpts} value={form.property} onChange={(v:any) => { const p = data.all_properties.find((x:any)=>x.name===v); setForm({...form, property: v, total_price: p?.list_price?.toString()}) }} placeholder="Search Property" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Dealer</label><SearchableSelect options={dOpts} value={form.dealer} onChange={(v:any) => setForm({...form, dealer: v})} placeholder="Search Dealer" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Total Price</label><input required type="number" value={form.total_price} onChange={(e) => setForm({...form, total_price: e.target.value})} className="w-full bg-[#0B1A30] border border-white/10 p-3 rounded-lg text-white text-sm" /></div>
          <button type="submit" disabled={loading} className="w-full bg-[#F5A623] text-black font-bold py-3 rounded-lg mt-4">{loading ? 'Creating...' : 'Create Deal'}</button>
        </form>
      </div>
    </div>
  );
};
