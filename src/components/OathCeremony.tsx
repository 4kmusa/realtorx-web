import React, { useState } from 'react';
import { OATH_CONTENT } from '../data/cultureData';
import { MemberRecord, Language, ERPNextConfig } from '../types';
import { RealtorXLogo } from './RealtorXLogo';
import { syncMemberToERPNext } from '../services/erpnextService';
import { ShieldCheck, Check, PenTool, Database, Award, RefreshCw, Building, User, Mail, MapPin } from 'lucide-react';

interface OathCeremonyProps {
  language: Language;
  erpConfig: ERPNextConfig;
  onMemberCreated: (member: MemberRecord) => void;
  onViewCertificate: (member: MemberRecord) => void;
}

export const OathCeremony: React.FC<OathCeremonyProps> = ({
  language,
  erpConfig,
  onMemberCreated,
  onViewCertificate
}) => {
  const [checkedPromises, setCheckedPromises] = useState<Record<string, boolean>>({});
  const [fullName, setFullName] = useState('');
  const [firmName, setFirmName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [tier, setTier] = useState<'Founding Member' | 'Charter Custodian' | 'Allottee Advocate'>('Founding Member');
  const [signatureText, setSignatureText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState<MemberRecord | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const allPromisesChecked = OATH_CONTENT.promises.every(p => checkedPromises[p.id]);

  const togglePromise = (id: string) => {
    setCheckedPromises(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkAll = () => {
    const all: Record<string, boolean> = {};
    OATH_CONTENT.promises.forEach(p => { all[p.id] = true; });
    setCheckedPromises(all);
  };

  const handleSubmitOath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      alert(language === 'en' ? 'Please enter your Full Name and Email.' : 'براہ کرم اپنا نام اور ای میل درج کریں۔');
      return;
    }

    if (!allPromisesChecked) {
      alert(language === 'en' ? 'Please affirm all 9 solemn promises of the RealtorX Oath.' : 'براہ کرم حلف نامے کے تمام 9 نکات کی توثیق کریں۔');
      return;
    }

    setIsSubmitting(true);
    setSyncStatusMsg(language === 'en' ? 'Recording solemn oath & generating digital custodian hash...' : 'حلف نامہ ریکارڈ اور کسٹوڈین ہیش تیار کی جا رہی ہے...');

    const memberId = `rx-${Date.now().toString(36)}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const memberNumber = `RX-FOUNDER-${randomNum}`;

    const newMember: MemberRecord = {
      id: memberId,
      memberNumber,
      fullName: fullName.trim(),
      firmName: firmName.trim() || 'Independent Custodian Realtor',
      role: tier,
      city: city.trim() || 'Pakistan',
      email: email.trim(),
      phone: phone.trim(),
      licenseNo: licenseNo.trim() || `LIC-${randomNum}`,
      joinedAt: new Date().toISOString().split('T')[0],
      oathAccepted: true,
      codeAgreed: true,
      signatureData: signatureText.trim() || fullName.trim(),
      tier,
      erpnextStatus: 'pending',
      bio: `Solemnly swore the RealtorX Oath on ${new Date().toLocaleDateString()}. Custodian of ethics, collaboration, and allottee protection.`
    };

    try {
      setSyncStatusMsg(language === 'en' ? 'Synchronizing your record...' : 'آپ کا ریکارڈ محفوظ کیا جا رہا ہے...');
      const syncResult = await syncMemberToERPNext(newMember, erpConfig);

      newMember.erpnextStatus = syncResult.success ? 'synced' : 'local';
      newMember.erpnextDocId = syncResult.docId;

      onMemberCreated(newMember);
      setSubmissionComplete(newMember);
      setSyncStatusMsg(syncResult.message);
    } catch (err: any) {
      newMember.erpnextStatus = 'local';
      onMemberCreated(newMember);
      setSubmissionComplete(newMember);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 lg:py-20 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Curatorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <RealtorXLogo size="md" showSubtitle={false} />
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-full mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Foundational Charter 02</span>
            <span aria-hidden="true">·</span>
            <span>The Solemn Promise</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            {language === 'en' ? OATH_CONTENT.title : OATH_CONTENT.titleUrdu}
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            {language === 'en'
              ? 'Taking this oath is an enduring covenant to your clients, your community, and the future of real estate.'
              : 'یہ حلف نامہ محض کاغذی کارروائی نہیں—یہ اپنے ساتھیوں، گاہکوں اور پوری انڈسٹری سے زندگی بھر کا باوقار عہد ہے۔'}
          </p>
        </div>

        {submissionComplete ? (
          /* Success & Verifiable Certificate Preview */
          <div className="bg-slate-900/90 border border-amber-500/50 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-400 mx-auto mb-6 shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-semibold">
              Oath Ratified &amp; Custodian Commissioned
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white mt-2">
              Welcome, Custodian {submissionComplete.fullName}
            </h3>

            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              {language === 'en'
                ? `You have formally sworn the RealtorX Oath. Your official credentials have been recorded, and your member record is securely saved in our registry.`
                : `آپ نے ریئلٹر ایکس کے مقدس حلف کی باقاعدہ توثیق کر دی ہے۔ آپ کے کوائف کا اندراج ہو چکا ہے اور رجسٹری میں محفوظ کر دیا گیا ہے۔`}
            </p>

            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-amber-400 font-bold">ID: {submissionComplete.memberNumber}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{submissionComplete.firmName}</span>
              <span className="text-slate-600">·</span>
              <span className="text-sky-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                {submissionComplete.erpnextDocId ? `Ref: ${submissionComplete.erpnextDocId}` : 'Ready'}
              </span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onViewCertificate(submissionComplete)}
                className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>{language === 'en' ? 'View & Print Digital Certificate' : 'ڈیجیٹل سند دیکھیں اور پرنٹ کریں'}</span>
              </button>

              <button
                onClick={() => {
                  setSubmissionComplete(null);
                  setFullName('');
                  setFirmName('');
                  setSignatureText('');
                  setCheckedPromises({});
                }}
                className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                {language === 'en' ? 'Swear for Another Custodian' : 'کسی اور ممبر کا اندراج کریں'}
              </button>
            </div>
          </div>
        ) : (
          /* Oath Ceremony Form */
          <form onSubmit={handleSubmitOath} className="space-y-8">

            {/* Solemn Preamble Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-amber-950/40 border border-slate-800 text-center shadow-lg">
              <p className="font-serif text-xl sm:text-2xl text-amber-200 italic leading-relaxed">
                "{language === 'en' ? OATH_CONTENT.preamble : OATH_CONTENT.preambleUrdu}"
              </p>
            </div>

            {/* The 9 Promises Checklist */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                <div>
                  <h3 className="font-serif text-xl font-medium text-white">
                    {language === 'en' ? 'The Nine Solemn Promises' : 'حلف نامے کے نو بنیادی وعدے'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'en'
                      ? 'Review each promise carefully before confirming your affirmation.'
                      : 'توثیق کرنے سے پہلے ہر ایک شق کا غور سے مطالعہ فرمائیں۔'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={checkAll}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 underline py-1"
                >
                  {language === 'en' ? 'Affirm All 9' : 'تمام 9 کی توثیق'}
                </button>
              </div>

              <div className="space-y-3.5">
                {OATH_CONTENT.promises.map((promise, index) => {
                  const isChecked = !!checkedPromises[promise.id];
                  return (
                    <div
                      key={promise.id}
                      onClick={() => togglePromise(promise.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 select-none ${
                        isChecked
                          ? 'bg-amber-950/25 border-amber-500/50 shadow-sm'
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                        isChecked ? 'bg-amber-400 text-slate-950 font-bold' : 'border border-slate-700 bg-slate-900'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-amber-400 font-bold">0{index + 1}.</span>
                          <span className={`text-sm sm:text-base font-serif font-medium ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                            {language === 'en' ? promise.en : promise.ur}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custodian Conclusion Quote */}
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
              <p className="font-serif text-lg sm:text-xl text-slate-200 italic">
                "{language === 'en' ? OATH_CONTENT.conclusion : OATH_CONTENT.conclusionUrdu}"
              </p>
            </div>

            {/* Member Details Form */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-serif text-xl font-medium text-white">
                  {language === 'en' ? 'Custodian Identity & Registration' : 'کسٹوڈین کوائف اور رجسٹریشن'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'en'
                    ? 'These details will be verified, recorded in the custodian registry, and securely saved.'
                    : 'یہ معلومات باضابطہ تصدیق کے بعد ریئلٹر ایکس رجسٹری میں محفوظ ہوں گی۔'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>{language === 'en' ? 'Full Legal Name *' : 'مکمل قانونی نام *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Waseem Ahmed / Tariq Mahmood"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-sky-400" />
                    <span>{language === 'en' ? 'Agency / Brokerage / Firm *' : 'ایجنسی / فرم کا نام *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="e.g. Apex Realty / Prime Assets"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{language === 'en' ? 'City / Region *' : 'شہر / ریجن *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Islamabad, Lahore, Karachi, Rawalpindi"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>{language === 'en' ? 'Official Email *' : 'آفیشل ای میل *'}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. custodian@realtorx.org"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1.5">
                    {language === 'en' ? 'Phone / WhatsApp' : 'فون / واٹس ایپ'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1.5">
                    {language === 'en' ? 'Realtor License / Broker ID' : 'ریئلٹر لائسنس / بروکر رجسٹریشن'}
                  </label>
                  <input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="e.g. ICT-REA-9201"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1.5">
                  {language === 'en' ? 'Membership Tier' : 'ممبرشپ کیٹیگری'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Founding Member', 'Charter Custodian', 'Allottee Advocate'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTier(t)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        tier === t
                          ? 'bg-amber-950/40 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">{t}</div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-normal">
                        {t === 'Founding Member' && 'Pioneering custodian with mentorship and voting voice.'}
                        {t === 'Charter Custodian' && 'Verified brokerage leader with co-brokering honors.'}
                        {t === 'Allottee Advocate' && 'Dedicated to dispute resolution & investor safety.'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Digital Signature Affirmation */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'en' ? 'Digital Signature / Legal Sign-off *' : 'ڈیجیٹل دستخط / باضابطہ تصدیق *'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="Type your full legal name as your digital oath signature"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg font-serif italic text-lg text-amber-300 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {language === 'en'
                    ? 'By typing your name, you acknowledge that you are entering into a binding professional covenant with the RealtorX community.'
                    : 'اپنا نام درج کر کے آپ ریئلٹر ایکس کمیونٹی کے ساتھ اس باوقار اخلاقی عہد نامے کی مکمل توثیق کرتے ہیں۔'}
                </p>
              </div>

            </div>

            {/* Submit Action */}
            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !allPromisesChecked}
                className={`w-full sm:w-auto min-w-[300px] px-8 py-4 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 mx-auto ${
                  allPromisesChecked && !isSubmitting
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 cursor-pointer shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{syncStatusMsg || 'Recording your Oath...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-slate-950" />
                    <span>
                      {allPromisesChecked
                        ? (language === 'en' ? 'Solemnly Swear Oath & Issue Custodian Certificate' : 'حلف کی توثیق کریں اور کسٹوڈین سرٹیفکیٹ حاصل کریں')
                        : (language === 'en' ? 'Affirm All 9 Promises to Proceed' : 'آگے بڑھنے کے لیے تمام 9 وعدوں کی توثیق کریں')}
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </section>
  );
};
