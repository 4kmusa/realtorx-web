import React, { useState } from 'react';
import { Language, PageId } from '../types';
import { Calculator, Percent, Calendar, CheckCircle2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface CalculatorsSectionProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

export const CalculatorsSection: React.FC<CalculatorsSectionProps> = ({ onNavigate, language }) => {
  const [activeTab, setActiveTab] = useState<'emi' | 'commission' | 'visit'>('emi');

  // EMI Calculator State
  const [propertyPrice, setPropertyPrice] = useState<number>(18500000); // 1.85 Crore
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(25);
  const [tenureYears, setTenureYears] = useState<number>(3);
  const [paymentFrequency, setPaymentFrequency] = useState<'quarterly' | 'monthly'>('quarterly');

  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const remainingBalance = propertyPrice - downPaymentAmount;
  const totalInstallmentsCount = paymentFrequency === 'quarterly' ? tenureYears * 4 : tenureYears * 12;
  const installmentAmount = totalInstallmentsCount > 0 ? remainingBalance / totalInstallmentsCount : 0;

  // 40/60 Commission Calculator State
  const [dealValue, setDealValue] = useState<number>(25000000); // 2.5 Crore
  const [commissionRate, setCommissionRate] = useState<number>(1.5); // 1.5% average
  const totalCommission = (dealValue * commissionRate) / 100;
  const dealerShare = totalCommission * 0.60; // 60%
  const realtorXShare = totalCommission * 0.40; // 40%

  // Quick Site Visit State
  const [visitName, setVisitName] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitPrecinct, setVisitPrecinct] = useState('Precinct 1 (Main Gate)');
  const [visitDate, setVisitDate] = useState('');
  const [visitBooked, setVisitBooked] = useState(false);

  const formatPkr = (val: number) => {
    if (val >= 10000000) {
      return `PKR ${(val / 10000000).toFixed(2)} Crore`;
    } else if (val >= 100000) {
      return `PKR ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `PKR ${Math.round(val).toLocaleString()}`;
  };

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitName || !visitPhone) return;
    setVisitBooked(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">

        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] mb-1.5">
              <Calculator className="w-4 h-4 text-[#F5A623]" />
              <span>Smart Real Estate Tools</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              Bahria Investment &amp; Commission Calculators
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Transparent financial modeling for Bahria Town Karachi. Calculate quarterly installments, see exact 40/60 dealer earnings, or request an escorted site visit.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('emi')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'emi'
                  ? 'bg-[#2490EF] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Installment Plan</span>
            </button>

            <button
              onClick={() => setActiveTab('commission')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'commission'
                  ? 'bg-[#F5A623] text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>40/60 Split</span>
            </button>

            <button
              onClick={() => setActiveTab('visit')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'visit'
                  ? 'bg-[#28A745] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Visit</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Installment Plan Calculator */}
        {activeTab === 'emi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Total Property Value (PKR)
                  </label>
                  <span className="text-sm font-bold text-[#F5A623] font-mono">
                    {formatPkr(propertyPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={3000000}
                  max={80000000}
                  step={500000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2490EF]"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>PKR 30 Lakh</span>
                  <span>PKR 2.5 Crore</span>
                  <span>PKR 8.0 Crore</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Down Payment (%)
                  </label>
                  <select
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
                  >
                    <option value={15}>15% (Booking Token)</option>
                    <option value={20}>20% (Standard)</option>
                    <option value={25}>25% (Quarterly Base)</option>
                    <option value={30}>30% (High Equity)</option>
                    <option value={50}>50% (Half Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Tenure (Years)
                  </label>
                  <select
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
                  >
                    <option value={1}>1 Year (4 Quarters)</option>
                    <option value={2}>2 Years (8 Quarters)</option>
                    <option value={3}>3 Years (12 Quarters)</option>
                    <option value={4}>4 Years (16 Quarters)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Frequency
                  </label>
                  <select
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
                  >
                    <option value="quarterly">Quarterly (Every 3 Months)</option>
                    <option value="monthly">Monthly (30 Days)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  All payments in Bahria Town Karachi are routed through registered bank pay orders or official portal receipts for 100% legal security.
                </span>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-[#0C1B33] to-slate-950 border border-[#2490EF]/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#2490EF] font-semibold">
                Estimated Breakdown
              </span>

              <div>
                <div className="text-xs text-slate-400 uppercase font-mono">
                  {paymentFrequency === 'quarterly' ? 'Quarterly Installment' : 'Monthly Installment'}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#F5A623] font-mono mt-1">
                  {formatPkr(installmentAmount)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Across {totalInstallmentsCount} scheduled payments
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-left">
                <div className="p-2.5 bg-slate-900/60 rounded-lg">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Down Payment ({downPaymentPercent}%)</div>
                  <div className="text-xs sm:text-sm font-bold text-white font-mono">{formatPkr(downPaymentAmount)}</div>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded-lg">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Remaining Balance</div>
                  <div className="text-xs sm:text-sm font-bold text-white font-mono">{formatPkr(remainingBalance)}</div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('properties')}
                className="w-full py-2.5 px-4 bg-[#2490EF] hover:bg-[#1b7ecf] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Find Properties In This Budget</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: 40/60 Commission Split Calculator */}
        {activeTab === 'commission' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Deal / Property Sale Value (PKR)
                  </label>
                  <span className="text-sm font-bold text-[#F5A623] font-mono">
                    {formatPkr(dealValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000000}
                  max={100000000}
                  step={1000000}
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#F5A623]"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>PKR 50 Lakh</span>
                  <span>PKR 5.0 Crore</span>
                  <span>PKR 10 Crore</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">
                  Total Brokerage Commission Rate
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[1.0, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCommissionRate(rate)}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold border transition-all ${
                        commissionRate === rate
                          ? 'bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}% Standard
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2490EF]" />
                  Why 40/60 Split is Industry-Leading:
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Traditional agencies take 50% or more from their agents. Realtor X only retains <strong>40%</strong> for portal infrastructure, legal NDC checks, buyer escort vehicles, and system integration, allowing the field dealer to retain <strong>60%</strong> of the earned commission.
                </p>
              </div>
            </div>

            {/* Commission Breakdown Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-[#09182D] to-slate-950 border border-[#F5A623]/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#F5A623] font-semibold">
                Transparent Commission Split
              </span>

              <div>
                <div className="text-xs text-slate-400 uppercase font-mono">
                  Total Deal Commission ({commissionRate}%)
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
                  {formatPkr(totalCommission)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-left">
                {/* Dealer 60% */}
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono font-semibold">
                    <span>Dealer / You</span>
                    <span>60%</span>
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-300 font-mono mt-1">
                    {formatPkr(dealerShare)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Direct payout upon transfer clearance
                  </div>
                </div>

                {/* RealtorX 40% */}
                <div className="p-3 bg-[#2490EF]/10 border border-[#2490EF]/30 rounded-xl">
                  <div className="flex items-center justify-between text-[11px] text-sky-400 font-mono font-semibold">
                    <span>Realtor X</span>
                    <span>40%</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-sky-300 font-mono mt-1">
                    {formatPkr(realtorXShare)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Legal checks, portal &amp; client lead
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('become-dealer')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Register as a 60% Partner Dealer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Fast Escorted Site Visit */}
        {activeTab === 'visit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-lg font-bold text-white">
                Book a Complimentary Escorted Site Visit in Bahria Town Karachi
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Experience Bahria Town Karachi in our dedicated Realtor X vehicle. An authorized custodian agent will pick you up at the Main Entrance Gate or Bahria Hub and guide you through real on-ground plots, villas, and commercial developments with verified maps.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free pick-and-drop from Bahria Main Gate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live on-ground boundary peg inspection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Bahria NDC &amp; utility verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero pressure, 100% advisory approach</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              {visitBooked ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Site Visit Scheduled!</h4>
                  <p className="text-xs text-slate-400">
                    Thank you, <strong>{visitName}</strong>. Our Bahria Town field coordinator has received your request for <strong>{visitPrecinct}</strong> and will call you at <strong>{visitPhone}</strong> to confirm your escort vehicle.
                  </p>
                  <button
                    onClick={() => setVisitBooked(false)}
                    className="text-xs text-[#2490EF] hover:underline font-mono"
                  >
                    Schedule Another Visit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookVisit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Asad Raza"
                      value={visitName}
                      onChange={(e) => setVisitName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+92 300 1234567"
                      value={visitPhone}
                      onChange={(e) => setVisitPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Interested Precinct / Project
                    </label>
                    <select
                      value={visitPrecinct}
                      onChange={(e) => setVisitPrecinct(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
                    >
                      <option value="Precinct 1 (Main Gate)">Precinct 1 (Near Main Gate)</option>
                      <option value="Precinct 10A (Villas)">Precinct 10A (Ready Villas)</option>
                      <option value="Precinct 27 (Golf Facing)">Precinct 27 (Luxury 500 Yds)</option>
                      <option value="Bahria Heights Towers">Bahria Heights Towers (Apartments)</option>
                      <option value="Jinnah Avenue Commercial">Jinnah Avenue Commercial</option>
                      <option value="Bahria Town Karachi 2">Bahria Town Karachi 2 (BTK-2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Confirm Free Site Visit</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
