import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Home, Calendar, DollarSign, Plus } from 'lucide-react';
export const DealModal = ({ dealName, onClose, onRefresh }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const fetchData = () => {
    setLoading(true);
    fetch(`/api/erp/method/realtor_x.api.get_deal_360?deal_name=${dealName}`, { credentials: 'include' }).then(r => r.json()).then(res => setData(res.message)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [dealName]);
  const handlePay = async () => {
    const amount = prompt("Enter Amount (PKR):");
    if (!amount) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/erp/method/realtor_x.api.receive_payment?deal_name=${dealName}&amount=${amount}`, { credentials: 'include' });
      const json = await res.json();
      if (json.message?.status === 'success') { alert("✅ Payment Received!"); fetchData(); if (onRefresh) onRefresh(); }
    } finally { setPaying(false); }
  };
  if (loading) return <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#F5A623]" /></div>;
  if (!data) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#081221] border border-white/10 rounded-2xl w-full max-w-5xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400"><X className="w-5 h-5"/></button>
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white">Deal 360: {data.deal.name}</h2>
          {data.deal.custom_total_received < data.deal.net_sale_value && (
            <button onClick={handlePay} disabled={paying} className="bg-[#F5A623] text-black px-4 py-2 rounded-lg font-bold text-sm flex gap-2 items-center"><Plus className="w-4 h-4"/> Receive Payment</button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0B1A30] p-4 rounded-xl"><h3 className="text-[#F5A623] text-sm font-bold mb-2 flex gap-2"><User className="w-4 h-4"/> Customer</h3><p className="text-white">{data.customer?.full_name}</p></div>
          <div className="bg-[#0B1A30] p-4 rounded-xl"><h3 className="text-purple-400 text-sm font-bold mb-2 flex gap-2"><Home className="w-4 h-4"/> Property</h3><p className="text-white">{data.property?.property_title}</p></div>
          <div className="bg-[#0B1A30] p-4 rounded-xl"><h3 className="text-green-400 text-sm font-bold mb-2 flex gap-2"><DollarSign className="w-4 h-4"/> Financials</h3><p className="text-white">Rec: {data.deal?.custom_total_received?.toLocaleString()}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div><h3 className="text-blue-400 text-sm font-bold mb-2 flex gap-2"><Calendar className="w-4 h-4"/> Installments</h3><table className="w-full text-left text-sm bg-[#0B1A30]"><tbody>{data.installments?.map((i:any)=><tr key={i.name} className="border-b border-white/5"><td className="p-3">#{i.installment_number}</td><td className="p-3">{i.due_date}</td><td className="p-3">{i.amount?.toLocaleString()}</td><td className="p-3 text-green-400">{i.status}</td></tr>)}</tbody></table></div>
          <div><h3 className="text-green-400 text-sm font-bold mb-2 flex gap-2"><DollarSign className="w-4 h-4"/> Payments</h3><table className="w-full text-left text-sm bg-[#0B1A30]"><tbody>{data.payments?.map((p:any)=><tr key={p.name} className="border-b border-white/5"><td className="p-3">{p.payment_date}</td><td className="p-3">{p.amount?.toLocaleString()}</td></tr>)}</tbody></table></div>
        </div>
      </div>
    </div>
  );
};
