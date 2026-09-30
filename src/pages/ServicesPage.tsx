import React from 'react';
import { PageId, Language } from '../types';
import { Home, Key, TrendingUp, Building2, Scale, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate, language }) => {
  const services = [
    {
      icon: Home,
      title: "Property Buying & Allotment Advisory",
      desc: "Comprehensive guidance on purchasing residential plots, built villas, and apartments across Bahria Town Karachi. 100% legal document audit and clear title verification."
    },
    {
      icon: Key,
      title: "Property Selling & Resale Representation",
      desc: "Fast, dignified property liquidations with verified buyers. Professional 4K photo coverage, transparent valuation, and zero hidden charges."
    },
    {
      icon: Building2,
      title: "Commercial & High-Yield Retail Spaces",
      desc: "Prime shops, offices, and showrooms on Jinnah Avenue and Liberty Commercial. Strategic tenant sourcing and rental yield optimization."
    },
    {
      icon: TrendingUp,
      title: "Strategic Investment & Capital Planning",
      desc: "Data-driven feasibility studies for overseas Pakistanis and corporate entities looking for capital appreciation across BTK-1, BTK-2, and M-9 corridor."
    },
    {
      icon: Scale,
      title: "Legal Title Verification & Allottee Advocacy",
      desc: "In-house legal team auditing Bahria NDC letters, transfer documents, power of attorney verifications, and resolution of stalled allotment disputes."
    },
    {
      icon: ShieldCheck,
      title: "Site Visit Concierge & Transfer Escrow",
      desc: "Dedicated chauffeured inspection tours with seasoned precinct custodians. Secure token escrow handling through official Bahria transfer windows."
    }
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] bg-[#2490EF]/10 border border-[#2490EF]/30 px-3.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Professional Excellence</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white font-heading">
          Our Real Estate Services
        </h1>

        <p className="text-sm sm:text-base text-slate-300">
          Tailored advisory for homebuyers, corporate investors, and commercial entrepreneurs in Bahria Town Karachi.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-[#2490EF]/50 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center text-[#2490EF]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white">
                  {srv.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Service</span>
                </span>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-xs font-semibold text-[#2490EF] hover:underline flex items-center gap-1"
                >
                  <span>Inquire Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0B1A30] to-slate-950 border border-slate-800 text-center space-y-4">
        <h3 className="text-2xl font-bold text-white font-heading">
          Need a Custom Real Estate Consultation in Bahria Town?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Our senior property advisors and allottee custodians are available 6 days a week at our Opal Mall office on Jinnah Avenue.
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#2490EF] hover:bg-[#1b7ecf] transition-all shadow"
        >
          Schedule a Consultation Today
        </button>
      </div>

    </div>
  );
};
