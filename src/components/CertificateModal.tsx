import React from 'react';
import { MemberRecord, Language } from '../types';
import { PHILOSOPHY_QUOTE } from '../data/cultureData';
import { RealtorXLogo } from './RealtorXLogo';
import { Printer, X, Award, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  member: MemberRecord | null;
  onClose: () => void;
  language: Language;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  member,
  onClose,
  language
}) => {
  if (!member) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden my-8">

        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#060b19] border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Award className="w-4 h-4" />
            <span>OFFICIAL REALTORX CUSTODIAN CREDENTIAL</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg transition-all shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Print / Save PDF' : 'پرنٹ / پی ڈی ایف محفوظ کریں'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Frame (High quality for screen and print) */}
        <div className="p-6 sm:p-12 bg-[#FAF7F2] text-slate-900 select-none">
          <div className="relative p-6 sm:p-10 border-4 border-double border-[#8C6D3F] rounded-lg bg-[#FAF8F5] shadow-inner">

            {/* Ornamental Corner Filigree */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#8C6D3F]" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#8C6D3F]" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#8C6D3F]" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#8C6D3F]" />

            {/* Header Lockup with Brand Mark */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <RealtorXLogo size="md" showSubtitle={false} />
              </div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] uppercase text-[#8C6D3F] font-semibold">
                <span>The Global Real Estate Community Charter</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-slate-900 uppercase">
                Founding Member Custodian
              </h1>
              <div className="text-xs sm:text-sm font-serif italic text-slate-600">
                Commissioned in Dedication to Honor, Integrity &amp; Allottee Protection
              </div>
              <div className="w-28 h-0.5 bg-[#8C6D3F] mx-auto mt-2" />
            </div>

            {/* Certification Statement */}
            <div className="my-8 text-center space-y-4 max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm uppercase tracking-widest text-slate-500 font-sans">
                This is to officially attest that
              </p>

              <div className="py-2 border-b border-slate-300">
                <span className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-wide text-balance">
                  {member.fullName}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed">
                representing <strong className="font-semibold text-slate-900">{member.firmName}</strong> in <strong className="font-semibold text-slate-900">{member.city}</strong>, has solemnly sworn the RealtorX Oath, pledged adherence to the RealtorX Code, and is inducted into the inaugural register of custodians.
              </p>

              {/* Watermark Quote Box */}
              <div className="p-4 my-4 bg-slate-100/90 rounded border border-slate-200 italic font-serif text-xs sm:text-sm text-slate-800 leading-snug">
                "{PHILOSOPHY_QUOTE.quote}"
              </div>
            </div>

            {/* Verification Grid & Signatures */}
            <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center">

              {/* Left: Custodian Signature */}
              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center font-serif italic text-lg sm:text-xl text-slate-800">
                  {member.signatureData || member.fullName}
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="text-[11px] font-sans uppercase tracking-wider font-semibold text-slate-700">
                    Custodian Signature
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    ID: {member.memberNumber}
                  </div>
                </div>
              </div>

              {/* Center: Gold Embossed Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-double border-[#8C6D3F] bg-gradient-to-br from-[#FAF5EC] to-[#E9DCBF] flex flex-col items-center justify-center shadow-md p-1">
                  <ShieldCheck className="w-6 h-6 text-[#8C6D3F] stroke-[1.5]" />
                  <span className="text-[8px] font-mono uppercase tracking-tighter text-[#8C6D3F] font-bold mt-0.5">
                    VERIFIED
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  RealtorX Registry
                </span>
              </div>

              {/* Right: Conveners & Date */}
              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center font-serif text-sm font-semibold text-slate-800">
                  Ethics &amp; Governance Board
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="text-[11px] font-sans uppercase tracking-wider font-semibold text-slate-700">
                    Date of Oath
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {member.joinedAt}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Meta & Security Bar */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Security Hash: RX-{member.id.toUpperCase()}-VERIFIED</span>
              <span className="mt-1 sm:mt-0">Registry Ref: {member.erpnextDocId || 'PENDING-DISPATCH'}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
