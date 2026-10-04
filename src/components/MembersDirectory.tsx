import React, { useState } from 'react';
import { MemberRecord, Language } from '../types';
import { RealtorXLogo } from './RealtorXLogo';
import { Search, ShieldCheck, Award, Building2, MapPin, CheckCircle2, UserCheck, PlusCircle } from 'lucide-react';

interface MembersDirectoryProps {
  members: MemberRecord[];
  onViewCertificate: (member: MemberRecord) => void;
  onTakeOath: () => void;
  language: Language;
}

export const MembersDirectory: React.FC<MembersDirectoryProps> = ({
  members,
  onViewCertificate,
  onTakeOath,
  language
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');

  const cities = ['All', ...Array.from(new Set(members.map(m => m.city.split('/')[0].trim())))];
  const tiers = ['All', 'Founding Member', 'Charter Custodian', 'Allottee Advocate'];

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.firmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memberNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === 'All' || m.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesTier = selectedTier === 'All' || m.tier === selectedTier;

    return matchesSearch && matchesCity && matchesTier;
  });

  return (
    <section className="py-12 lg:py-20 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Curatorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <RealtorXLogo size="md" showSubtitle={false} />
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky-400 bg-sky-950/40 border border-sky-800/40 px-3 py-1 rounded-full mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Verified Custodians Registry</span>
            <span aria-hidden="true">·</span>
            <span>Real Estate Fellowship</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {language === 'en' ? 'The RealtorX Custodians' : 'ریئلٹر ایکس کسٹوڈینز ڈائریکٹری'}
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            {language === 'en'
              ? 'Every member listed here has personally taken the RealtorX Oath, pledged the 8 tenets of the Code, and stands committed to collaboration and allottee protection.'
              : 'یہاں درج ہر ممبر نے باقاعدہ حلف اٹھایا ہے، ضابطہ اخلاق پر دستخط کیے ہیں، اور مارکیٹ میں دیانت و باہمی اشتراک کا علمبردار ہے۔'}
          </p>
        </div>

        {/* Community Hub Atrium Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 mb-12 shadow-2xl">
          <img
            src="/images/realtorx_hub_atrium_1790597209570.jpg"
            alt="The RealtorX Flagship Hub Atrium"
            referrerPolicy="no-referrer"
            className="w-full h-56 sm:h-72 object-cover brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060b19]/95 via-[#060b19]/70 to-transparent" />
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center max-w-xl">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-1.5 font-semibold">
              Ecosystem Headquarters
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              The RealtorX Flagship Hub
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Where founding custodians assemble, transparent co-brokering standards are upheld, and allottee dispute relief is organized.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-sm shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, brokerage, city, or ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {cities.map(c => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Cities / Regions' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {tiers.map(t => (
                  <option key={t} value={t}>
                    {t === 'All' ? 'All Membership Tiers' : t}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-6 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {member.memberNumber}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] font-mono text-sky-400">
                        {member.tier}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-white mt-1">
                      {member.fullName}
                    </h3>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-slate-950 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-200 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{member.firmName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{member.city}</span>
                    {member.licenseNo && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono">{member.licenseNo}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio statement */}
                {member.bio && (
                  <p className="mt-3 text-xs text-slate-400 italic line-clamp-2 leading-relaxed">
                    "{member.bio}"
                  </p>
                )}
              </div>

              {/* Bottom Actions & Verifications */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Oath Ratified</span>
                </div>

                <button
                  onClick={() => onViewCertificate(member)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Certificate</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <UserCheck className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No custodians found matching your filter criteria.</p>
          </div>
        )}

        {/* CTA to join */}
        <div className="mt-16 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
            Ready to stand with the custodians?
          </p>
          <button
            onClick={onTakeOath}
            className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-lg shadow-amber-500/10 transition-all inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>{language === 'en' ? 'Take the Founding Member Oath' : 'بانی حلف اٹھائیں اور فہرست میں شامل ہوں'}</span>
          </button>
        </div>

      </div>
    </section>
  );
};
