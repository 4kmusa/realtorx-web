import React from 'react';
import { PageId, Language } from '../types';
import { Construction } from 'lucide-react';

interface CustomerPortalPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-20 max-w-2xl mx-auto px-4 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center">
        <Construction className="w-10 h-10 text-[#F5A623]" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">
        Customer Portal Coming Soon
      </h1>
      <p className="text-slate-400 mb-8 leading-relaxed">
        We're building a full customer dashboard where you can track bookings, payments, 
        documents, and site visits. Launching soon!
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => onNavigate('properties')}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#2490EF] hover:bg-[#1b7ecf] transition-all"
        >
          Browse Properties
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
