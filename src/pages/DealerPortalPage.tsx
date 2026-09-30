import React from 'react';
import { PageId, Language } from '../types';
import { Construction } from 'lucide-react';

interface DealerPortalPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

export const DealerPortalPage: React.FC<DealerPortalPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-20 max-w-2xl mx-auto px-4 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center">
        <Construction className="w-10 h-10 text-[#F5A623]" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">
        Dealer Portal Coming Soon
      </h1>
      <p className="text-slate-400 mb-8 leading-relaxed">
        Our full dealer dashboard with leads, deals, commission tracking, 
        payouts, and targets is under construction.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => onNavigate('become-dealer')}
          className="px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 transition-all"
        >
          Become a Dealer
        </button>
        <button
          onClick={() => onNavigate('contact')}
          className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-all"
        >
          Contact Us
        </button>
      </div>
    </div>
  );
};
