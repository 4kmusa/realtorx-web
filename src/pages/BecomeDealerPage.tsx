import React, { useState } from 'react';
import { PageId, Language } from '../types';
import { RealtorXLogo } from '../components/RealtorXLogo';
import {
  UserPlus,
  Percent,
  ShieldCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  ArrowLeft,
  Upload,
  Video,
  FileCheck,
  Building,
  CreditCard,
  Users,
  Check,
  FileText
} from 'lucide-react';

interface BecomeDealerPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const BecomeDealerPage: React.FC<BecomeDealerPageProps> = ({ onNavigate, language }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states across the 8 steps
  // Step 1: Basic Info
  const [fullName, setFullName] = useState('');
  const [cnic, setCnic] = useState('');
  const [dob, setDob] = useState('1988-06-15');
  const [gender, setGender] = useState('Male');

  // Step 2: Contact
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Karachi');
  const [address, setAddress] = useState('Bahria Town Karachi');

  // Step 3: Bank Details
  const [bankName, setBankName] = useState('Meezan Bank Limited');
  const [accountTitle, setAccountTitle] = useState('');
  const [iban, setIban] = useState('');
  const [branchCode, setBranchCode] = useState('0102');

  // Step 4: Reference
  const [referenceName, setReferenceName] = useState('Haji Farooq');
  const [referenceContact, setReferenceContact] = useState('+92 300 9988776');
  const [referenceRelation, setReferenceRelation] = useState('Senior Dealer - Bahria Precinct 1');

  // Step 5: Video KYC
  const [kycFileUploaded, setKycFileUploaded] = useState(false);
  const [kycType, setKycType] = useState<'video' | 'selfie'>('video');

  // Step 6: The Oath Acceptance
  const [oathAccepted, setOathAccepted] = useState(true);

  // Step 7: Terms & Conditions
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [agreedZeroPoaching, setAgreedZeroPoaching] = useState(true);

  // Step 8: Final Submission
  const [submitted, setSubmitted] = useState(false);
  const [erpDocId, setErpDocId] = useState('');

  const totalSteps = 8;

  const handleNext = () => {
    if (currentStep === 1 && (!fullName || !cnic)) {
      alert('Please fill out your Full Name and CNIC.');
      return;
    }
    if (currentStep === 2 && (!phone || !email)) {
      alert('Please fill out your Phone and Email.');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oathAccepted) {
      alert('You must accept The RealtorX Oath.');
      return;
    }
    if (!agreedTerms || !agreedZeroPoaching) {
      alert('Please agree to the Terms & Conditions and Zero-Poaching policy.');
      return;
    }

    const docId = `RX-DLR-${Math.floor(1000 + Math.random() * 9000)}`;
    setErpDocId(docId);
    setSubmitted(true);

    // Persist oath acceptance in localStorage
    localStorage.setItem('realtorx_dealer_oath_accepted', 'true');
    localStorage.setItem('realtorx_dealer_oath_name', fullName);
  };

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-slate-100">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3.5 py-1 rounded-full">
          <Percent className="w-3.5 h-3.5" />
          <span>40/60 Fair Commission Fraternity</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white font-heading">
          Become a Realtor X Custodian Dealer
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Join Bahria Town Karachi's ethical real estate network. Guaranteed 60% dealer commission split, verified property inventories, and institutional ERPNext backend synchronization.
        </p>
      </div>

      {/* 40/60 Split Guarantee Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-3xl font-black text-[#F5A623] font-mono mb-2">60%</div>
          <h3 className="font-heading font-bold text-white text-base">To The Closing Dealer</h3>
          <p className="text-xs text-slate-400 mt-1">
            You bring the client and effort; you deserve the lion’s share. Immediate payout upon Bahria transfer.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-3xl font-black text-[#2490EF] font-mono mb-2">40%</div>
          <h3 className="font-heading font-bold text-white text-base">To Realtor X Platform</h3>
          <p className="text-xs text-slate-400 mt-1">
            Funds verified title searches, ERPNext transaction infrastructure, professional photography, and legal advisory.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="text-3xl font-black text-[#28A745] font-mono mb-2">100%</div>
          <h3 className="font-heading font-bold text-white text-base">Verified Co-Brokering</h3>
          <p className="text-xs text-slate-400 mt-1">
            Zero back-channel poaching. All co-broker agreements are legally protected and stored on ERPNext.
          </p>
        </div>
      </div>

      {/* 8-Step Progress Stepper */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-2">
          {[
            '1. Basic Info',
            '2. Contact',
            '3. Bank',
            '4. Reference',
            '5. Video KYC',
            '6. The Oath',
            '7. Terms',
            '8. Submit'
          ].map((stepName, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep || submitted;
            const isCurrent = stepNum === currentStep && !submitted;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-[#F5A623] text-slate-950 font-bold shadow-md shadow-[#F5A623]/20'
                    : isCompleted
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                    : 'bg-slate-800/50 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="font-mono">{stepNum}</span>
                )}
                <span>{stepName.split('. ')[1]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        {submitted ? (
          <div className="text-center py-10 space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Dealer Record Registered in ERPNext
              </span>
              <h2 className="text-3xl font-bold text-white font-heading">
                Application Approved, Custodian {fullName}!
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                Your dealer record has been generated on the Realtor X ERPNext node. Your guaranteed 60% commission split is activated.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 inline-block font-mono text-sm text-[#F5A623]">
              ERPNext Dealer ID: {erpDocId}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('dealer')}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 shadow-lg flex items-center gap-2"
              >
                <span>Enter Dealer Portal</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={() => onNavigate('properties')}
                className="px-5 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800"
              >
                Browse Bahria Inventory
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Step 1: Personal &amp; Identity Information</h3>
                  <p className="text-xs text-slate-400 mt-1">Official identity details matching your Government CNIC card.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mahmood"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">CNIC Number (13 digits) *</label>
                    <input
                      type="text"
                      required
                      placeholder="42101-1234567-1"
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2490EF]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Contact */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Step 2: Contact &amp; Office Coordinates</h3>
                  <p className="text-xs text-slate-400 mt-1">Direct contact numbers for customer lead dispatching.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Mobile Phone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="+92 300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Official Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="realtor@agency.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Operating City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Office / Precinct Address</label>
                    <input
                      type="text"
                      placeholder="Office 12, Midway Commercial B, Bahria Town Karachi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Bank Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Step 3: Bank Details for Commission Payouts</h3>
                  <p className="text-xs text-slate-400 mt-1">Your 60% commission is disbursed automatically to this IBAN.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Meezan Bank / HBL / Bank Alfalah"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Account Title</label>
                    <input
                      type="text"
                      value={accountTitle || fullName}
                      onChange={(e) => setAccountTitle(e.target.value)}
                      placeholder="e.g. Tariq Mahmood"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium text-slate-300">IBAN (24 Characters)</label>
                    <input
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="PK44MEZN0001092849102901"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Reference */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Step 4: Professional Reference</h3>
                  <p className="text-xs text-slate-400 mt-1">A senior dealer or recognized Bahria Town realtor who can vouch for your professional ethics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Reference Name</label>
                    <input
                      type="text"
                      value={referenceName}
                      onChange={(e) => setReferenceName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Reference Contact</label>
                    <input
                      type="text"
                      value={referenceContact}
                      onChange={(e) => setReferenceContact(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Relation / Agency</label>
                    <input
                      type="text"
                      value={referenceRelation}
                      onChange={(e) => setReferenceRelation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2490EF]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Video KYC Upload */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Step 5: Video KYC &amp; Verification</h3>
                  <p className="text-xs text-slate-400 mt-1">Upload a 10-second selfie video stating: "I agree to RealtorX ethics and the 40/60 split."</p>
                </div>

                <div className="p-8 border-2 border-dashed border-slate-700 hover:border-[#2490EF] rounded-3xl bg-slate-950/60 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-[#2490EF]">
                    <Video className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">Record or Upload KYC Video</h4>
                    <p className="text-xs text-slate-400 mt-1">MP4, MOV, or WEBM up to 25MB.</p>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setKycFileUploaded(true)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2490EF] hover:bg-[#1f7ecf] transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{kycFileUploaded ? 'Video Attached (kyc_statement.mp4)' : 'Attach Video File'}</span>
                    </button>
                  </div>

                  {kycFileUploaded && (
                    <div className="text-xs text-emerald-400 flex items-center justify-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>KYC Video successfully staged for ERPNext review.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: The Oath Acceptance */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Step 6: The RealtorX Oath Acceptance</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Every authorized dealer must bind themselves to The Oath.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="text-sm font-serif italic text-amber-300">
                    “I will always place ethics before personal gain. I will respect every member regardless of their size, experience or background. I will never intentionally mislead, exploit or damage the trust of this community.”
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="oathCheck"
                      checked={oathAccepted}
                      onChange={(e) => setOathAccepted(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-[#F5A623] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="oathCheck" className="text-xs font-medium text-white cursor-pointer">
                      I solemnly accept and affirm <strong>The RealtorX Founding Member Oath</strong>.
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('oath')}
                      className="text-xs text-[#2490EF] hover:underline"
                    >
                      Read full ceremonial oath text &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Terms & Conditions */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Step 7: Terms, Conditions &amp; Zero Poaching</h3>
                  <p className="text-xs text-slate-400 mt-1">Our covenant protecting co-brokers and platform integrity.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="splitCheck"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-[#2490EF] cursor-pointer mt-0.5"
                    />
                    <label htmlFor="splitCheck" className="text-xs text-slate-300 cursor-pointer">
                      <strong className="text-white block mb-0.5">40/60 Commission Split Agreement</strong>
                      I agree that 60% of all closed transaction brokerage fees go directly to me as the closing dealer, and 40% is retained by Realtor X for verification, platform services, and title search.
                    </label>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="poachCheck"
                      checked={agreedZeroPoaching}
                      onChange={(e) => setAgreedZeroPoaching(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-[#2490EF] cursor-pointer mt-0.5"
                    />
                    <label htmlFor="poachCheck" className="text-xs text-slate-300 cursor-pointer">
                      <strong className="text-white block mb-0.5">Strict Zero-Poaching Guarantee</strong>
                      I covenant never to bypass another RealtorX dealer or custodian after receiving an introduction or property inventory sheet. Any breach results in instant revocation and forfeiture.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: Final Review & Submit */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">Step 8: Review &amp; Submit to ERPNext</h3>
                  <p className="text-xs text-slate-400 mt-1">Verify your application details before registering your dealer node.</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">Dealer Name:</span>
                    <span className="text-white font-bold">{fullName || 'Tariq Mahmood'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CNIC:</span>
                    <span className="text-white">{cnic || '42101-1234567-1'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone:</span>
                    <span className="text-white">{phone || '+92 300 1234567'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bank:</span>
                    <span className="text-white">{bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Commission Split:</span>
                    <span className="text-[#F5A623] font-bold">60% Dealer / 40% Realtor X</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">The Oath:</span>
                    <span className="text-emerald-400 font-bold">Affirmed &amp; Signed</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-300 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Your profile will be immediately registered in the ERPNext Dealer doctype at http://172.23.173.190:8000.</span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : <div />}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-[#2490EF] hover:brightness-110 flex items-center gap-1.5 transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>Submit Application to ERPNext</span>
                </button>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
