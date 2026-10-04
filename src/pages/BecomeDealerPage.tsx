// src/pages/BecomeDealerPage.tsx
import React, { useState, useEffect } from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { OATH_CONTENT } from '../data/cultureData';
import { fetchDealerApplicationByEmail, DealerApplication } from '../services/propertyService';
import {
  User, CreditCard, Calendar, Phone, Mail, MapPin, FileText, Banknote, Briefcase,
  ShieldCheck, Loader2, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft,
  Check, Video, Upload, X, Play, Info, Percent, Users, Award, TrendingUp, BookOpen,
  FileCheck, HelpCircle, Camera, Clock, XCircle,
} from 'lucide-react';

interface BecomeDealerPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_BASE = import.meta.env.PROD ? '/api/erp' : `${ERPNEXT_URL}/api`;

const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  if (cleaned.startsWith('0') && cleaned.length === 11) return '+92' + cleaned.slice(1);
  if (cleaned.startsWith('3') && cleaned.length === 10) return '+92' + cleaned;
  if (cleaned.startsWith('0')) return '+92' + cleaned.slice(1);
  return '+92' + cleaned;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type Mode = 'info' | 'form' | 'status';

export const BecomeDealerPage: React.FC<BecomeDealerPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, updateUserRole } = useAuth();
  const [mode, setMode] = useState<Mode>('info');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<DealerApplication | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    cnic_number: '',
    date_of_birth: '',
    gender: 'Male',
    cnic_expiry_date: '',
    phone: '',
    email: '',
    city: 'Karachi',
    office_address: '',
    service_radius_km: '25',
    bank_name: '',
    account_number: '',
    iban: '',
    company_type: 'Individual',
    gst_registered: 'No',
    reference_name_1: '',
    profile_image_file: null as File | null,
    video_kyc_file: null as File | null,
    terms_and_conditions: false,
  });

  // ═══════════════════════════════════════════════════════
  // ON MOUNT: check application status
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    async function checkStatus() {
      if (!isAuthenticated || !user?.email) return;

      // If already a dealer → dealer dashboard
      if (user.is_dealer) {
        onNavigate('dealer');
        return;
      }

      setCheckingStatus(true);
      try {
        const app = await fetchDealerApplicationByEmail(user.email);
        if (app) {
          setApplication(app);
          if (app.status === 'Approved') {
            setMode('status');
          } else if (app.status === 'Pending') {
            setMode('status');
          } else if (app.status === 'Rejected') {
            setMode('status');
          } else if (app.status === 'Active') {
            // Already active → dealer dashboard
            onNavigate('dealer');
          } else {
            setMode('status');
          }
        } else {
          setMode('info');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingStatus(false);
      }
    }
    checkStatus();
  }, [isAuthenticated, user, onNavigate]);

  // Pre-fill from user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!formData.full_name.trim()) { setError('Full name is required'); return false; }
      if (!formData.cnic_number.trim()) { setError('CNIC number is required'); return false; }
      if (!formData.date_of_birth) { setError('Date of birth is required'); return false; }
    }
    if (step === 2) {
      if (!formData.phone.trim()) { setError('Phone number is required'); return false; }
      if (!formData.city.trim()) { setError('City is required'); return false; }
    }
    if (step === 3) {
      if (!formData.bank_name.trim()) { setError('Bank name is required'); return false; }
      if (!formData.account_number.trim()) { setError('Account number is required'); return false; }
    }
    if (step === 4) {
      if (!formData.video_kyc_file) { setError('Video KYC file is required.'); return false; }
    }
    if (step === 5) {
      if (!formData.terms_and_conditions) { setError('You must accept the Terms & Conditions'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) { setError('Please upload MP4, WebM, or MOV only.'); return; }
    if (file.size > MAX_VIDEO_SIZE) {
      setError(`Video size exceeds ${formatFileSize(MAX_VIDEO_SIZE)}.`);
      return;
    }
    updateField('video_kyc_file', file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload a valid image file.'); return; }
    if (file.size > MAX_IMAGE_SIZE) {
      setError(`Image exceeds ${formatFileSize(MAX_IMAGE_SIZE)}.`);
      return;
    }
    updateField('profile_image_file', file);
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(5)) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Upload profile image
      let profileImageUrl = '';
      if (formData.profile_image_file) {
        const imgFormData = new FormData();
        imgFormData.append('file', formData.profile_image_file);
        imgFormData.append('is_private', '0');
        imgFormData.append('folder', 'Home/Dealer Profiles');

        const imgResponse = await fetch(`${API_BASE}/method/upload_file`, {
          method: 'POST',
          credentials: 'include',
          body: imgFormData,
        });
        if (imgResponse.ok) {
          const imgResult = await imgResponse.json();
          profileImageUrl = imgResult.message?.file_url || '';
        }
      }

      // 2. Upload video KYC
      let videoFileUrl = '';
      if (formData.video_kyc_file) {
        const videoFormData = new FormData();
        videoFormData.append('file', formData.video_kyc_file);
        videoFormData.append('is_private', '1');
        videoFormData.append('folder', 'Home/Video KYC');

        const uploadResponse = await fetch(`${API_BASE}/method/upload_file`, {
          method: 'POST',
          credentials: 'include',
          body: videoFormData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload Video KYC.');
        const uploadResult = await uploadResponse.json();
        videoFileUrl = uploadResult.message?.file_url || '';
      }

      // 3. Create dealer application with PENDING status
      const payload = {
        full_name: formData.full_name,
        cnic_number: formData.cnic_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        cnic_expiry_date: formData.cnic_expiry_date,
        phone: formatPhoneNumber(formData.phone),
        email: formData.email,
        city: formData.city,
        office_address: formData.office_address,
        service_radius_km: formData.service_radius_km,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        iban: formData.iban,
        company_type: formData.company_type,
        gst_registered: formData.gst_registered,
        reference_name_1: formData.reference_name_1,
        profile_image_url: profileImageUrl,
        video_kyc_url: videoFileUrl,
        user_email: user?.email,
        application_status: 'Pending',   // IMPORTANT
      };

      const response = await fetch(`${API_BASE}/method/realtorx.api.become_dealer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || result.exception) {
        throw new Error(result.exception || result.message || 'Failed to create application');
      }

      // Reload application status
      const app = await fetchDealerApplicationByEmail(user?.email || '');
      setApplication(app || {
        id: result.message?.dealer_id || '',
        status: 'Pending',
        reviewNotes: '',
        reviewedOn: '',
        submittedOn: new Date().toISOString(),
        fullName: formData.full_name,
        firm: '',
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
      });

      setMode('status');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // CHECKING STATUS LOADER
  // ═══════════════════════════════════════════════════════
  if (checkingStatus) {
    return (
      <div className="py-24 max-w-4xl mx-auto px-4 text-center">
        <Loader2 className="w-10 h-10 text-[#2490EF] animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Checking your application status...</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // STATUS MODE
  // ═══════════════════════════════════════════════════════
  if (mode === 'status' && application) {
    const isPending = application.status === 'Pending';
    const isApproved = application.status === 'Approved';
    const isRejected = application.status === 'Rejected';

    return (
      <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/70 border border-slate-800 shadow-2xl">

          {/* Pending */}
          {isPending && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#F5A623]/15 border border-[#F5A623]/40 flex items-center justify-center">
                <Clock className="w-10 h-10 text-[#F5A623]" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#F5A623] mb-2">
                  Under Review
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-3">
                  Application Received!
                </h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{application.fullName}</strong>. Your dealer
                  application is currently <strong className="text-[#F5A623]">under review</strong> by our team.
                  We typically respond within 24-48 hours.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                  Application Details
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-400">Application ID:</div>
                  <div className="text-white text-right font-mono truncate">{application.id}</div>
                  <div className="text-slate-400">Status:</div>
                  <div className="text-[#F5A623] text-right font-semibold">{application.status}</div>
                  <div className="text-slate-400">Submitted:</div>
                  <div className="text-white text-right">
                    {new Date(application.submittedOn).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 text-left">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    What happens next? Our team will verify your CNIC, video KYC, and background.
                    Once approved, you'll receive a notification to take the Founding Oath and
                    activate your dealer account.
                  </p>
                </div>

                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-4 h-4" />
                  Refresh Status
                </button>
              </div>
            </div>
          )}

          {/* Approved */}
          {isApproved && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#28A745]/15 border border-[#28A745]/40 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#28A745]" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#28A745] mb-2">
                  Approved
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-3">
                  Congratulations! 🎉
                </h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your dealer application has been <strong className="text-[#28A745]">approved</strong>.
                  Take the Founding Oath to activate your dealer account and start listing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#28A745]/5 border border-[#28A745]/30 text-left">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#28A745] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Next Step:</strong> Take the Realtor X Founding
                    Member Oath to activate your account.
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sessionStorage.setItem('realtorx_dealer_flow', 'true');
                  sessionStorage.setItem('realtorx_dealer_id', application.id);
                  onNavigate('oath');
                }}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 transition-all shadow-lg shadow-[#F5A623]/25 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Take the Founding Oath
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Rejected */}
          {isRejected && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/15 border border-red-500/40 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-red-400 mb-2">
                  Not Approved
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-3">
                  Application Not Approved
                </h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Unfortunately, your dealer application could not be approved at this time.
                </p>
              </div>

              {application.reviewNotes && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/30 text-left">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-red-400 mb-1.5">
                    Reviewer Notes
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {application.reviewNotes}
                  </p>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <a
                  href="https://wa.me/923049383785?text=Hello%20Realtor%20X,%20my%20dealer%20application%20was%20not%20approved.%20I'd%20like%20to%20discuss."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5b] transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Discuss on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // INFO MODE (existing)
  // ═══════════════════════════════════════════════════════
  if (mode === 'info') {
    const benefits = [
      { icon: Percent, title: '60% Commission Split', desc: 'Industry-leading payout. You keep 60% of every closed deal — we only retain 40% for portal, legal, and infrastructure.', color: '#F5A623' },
      { icon: Users, title: 'Verified Buyer Leads', desc: 'Real, qualified leads from our digital marketing. No fake contacts, no wasted time on cold calls.', color: '#2490EF' },
      { icon: Award, title: 'Pro Training & Oath', desc: 'Free onboarding, sales training, and the Realtor X Founding Oath that builds community trust.', color: '#28A745' },
      { icon: TrendingUp, title: 'Co-Brokering Network', desc: 'Collaborate with hundreds of verified dealers. Share listings, split deals, grow together.', color: '#8B5CF6' },
    ];

    const requirements = [
      { icon: CreditCard, title: 'Valid CNIC', desc: 'Original NADRA CNIC (front + back), not expired' },
      { icon: FileCheck, title: 'Realtor License (optional)', desc: 'Broker/agent license from a recognized association is a bonus' },
      { icon: User, title: 'Age 21+', desc: 'Minimum 21 years old with sound professional reputation' },
      { icon: Phone, title: 'Active Phone & WhatsApp', desc: 'Reachable at all times for client coordination' },
      { icon: Banknote, title: 'Bank Account', desc: 'Personal or business account for commission payouts' },
      { icon: Video, title: 'Video KYC', desc: 'A short 1-2 minute video introducing yourself for identity verification' },
    ];

    const processSteps = [
      { num: 1, title: 'Submit Application', desc: 'Fill out the 5-step form with your personal, contact, and bank details.', icon: FileText },
      { num: 2, title: 'Admin Review', desc: 'Our team verifies your CNIC, contact, and background within 24-48 hours.', icon: ShieldCheck },
      { num: 3, title: 'Approval', desc: 'Once approved, you\'ll be notified to proceed to the next step.', icon: CheckCircle2 },
      { num: 4, title: 'Take the Oath', desc: 'Recite the Realtor X Founding Oath and receive your verified custodian credential.', icon: BookOpen },
      { num: 5, title: 'Get Activated', desc: 'Your dealer account is activated. Start listing, receiving leads, and closing deals.', icon: Award },
    ];

    const faqs = [
      { q: 'How long does approval take?', a: 'Typically 24-48 hours after you submit the complete form and Video KYC. If additional verification is needed, our team will contact you.' },
      { q: 'What is the 60/40 commission split?', a: 'For every closed deal, you receive 60% of the total commission. Realtor X retains 40% to cover portal infrastructure, legal NDC verification, buyer escort services, and marketing.' },
      { q: 'Is there any joining fee?', a: 'No. Joining Realtor X is completely free. We earn only when you close a deal.' },
      { q: 'What is the Founding Member Oath?', a: 'A solemn commitment every Realtor X dealer takes — 9 promises about ethics, transparency, client protection, and community.' },
      { q: 'Can I keep my existing brokerage?', a: 'Yes. Realtor X is a cooperative network. You can continue your existing practice and still list deals through our platform.' },
    ];

    return (
      <div className="py-12 space-y-16 sm:space-y-20">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-4 py-1.5 rounded-full mb-6">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Realtor X Dealer Program</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight mb-5">
            Become a <span className="text-[#F5A623]">Realtor X</span> Dealer
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Join Bahria Town Karachi's most ethical real estate fraternity. Earn <strong className="text-[#F5A623]">60% commission</strong> on every closed deal, get verified buyer leads, and be part of a community that puts integrity first.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                if (!isAuthenticated) onNavigate('login');
                else { setMode('form'); setCurrentStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              }}
              className="px-8 py-4 rounded-2xl text-sm sm:text-base font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 transition-all shadow-xl shadow-[#F5A623]/30 flex items-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => document.getElementById('dealer-process')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-4 rounded-2xl text-sm font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all"
            >
              See the Process
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#28A745]" />Free to join</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#28A745]" />Admin reviewed</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#28A745]" />24-48h approval</span>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#2490EF]">The Realtor X Advantage</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 font-heading">Why Dealers Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${b.color}20`, border: `1px solid ${b.color}40` }}>
                    <Icon className="w-6 h-6" style={{ color: b.color }} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-white mb-2">{b.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800 p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-[#28A745]">Eligibility</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 font-heading">What You Need to Apply</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requirements.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#2490EF]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">{r.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="dealer-process" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#2490EF]">Simple & Transparent</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 font-heading">How It Works</h2>
            <p className="text-sm text-slate-400 mt-3">
              From application to activation — with admin review at every step.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {processSteps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="relative p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-[#2490EF]/50 transition-all">
                  <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-gradient-to-br from-[#2490EF] to-[#1b7ecf] flex items-center justify-center text-white text-xs font-bold shadow-lg">{s.num}</div>
                  <div className="w-12 h-12 rounded-2xl bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center mb-4 mt-2">
                    <Icon className="w-6 h-6 text-[#2490EF]" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900/50 border border-amber-500/30 p-8 sm:p-12">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-4 py-1.5 rounded-full mb-5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>The Solemn Pledge</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-4">The Realtor X Founding Oath</h2>
              <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Taken by every Realtor X dealer before activation. It is a personal promise of integrity,
                transparency, and community protection that defines who we are.
              </p>
            </div>
            <div className="mb-8">
              <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-[#F5A623] mb-4 text-center">The Nine Solemn Promises</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(OATH_CONTENT?.promises || []).slice(0, 9).map((p: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="text-[11px] font-mono text-[#F5A623] font-bold shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}.</span>
                    <span className="text-xs text-slate-300 leading-relaxed">{p.en || p.ur || p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center pt-6 border-t border-slate-800">
              <button
                onClick={() => onNavigate('oath')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#F5A623] hover:underline"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read the full Oath</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#2490EF]">Questions</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 font-heading">Frequently Asked</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-4 h-4 text-[#2490EF] shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                  </div>
                  <ChevronDownIcon />
                </summary>
                <p className="text-xs text-slate-400 leading-relaxed mt-3 pl-7">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#0E2849] via-[#0B1A30] to-[#0E2849] border border-[#F5A623]/30 p-8 sm:p-14 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#F5A623]/15 border border-[#F5A623]/40 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-[#F5A623]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-4">Ready to Join Realtor X?</h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
              Start your application now. Takes 10 minutes. Admin reviews within 48 hours. Free to join.
            </p>
            <button
              onClick={() => {
                if (!isAuthenticated) onNavigate('login');
                else { setMode('form'); setCurrentStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              }}
              className="px-8 py-4 rounded-2xl text-sm sm:text-base font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 transition-all shadow-xl shadow-[#F5A623]/30 inline-flex items-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              <span>Apply Now — Become a Dealer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!isAuthenticated && (
              <p className="text-xs text-slate-500 mt-4">You'll need to log in or sign up first</p>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // FORM MODE — same as before
  // ═══════════════════════════════════════════════════════
  const steps = [
    { num: 1, title: 'Personal', icon: User },
    { num: 2, title: 'Contact', icon: Phone },
    { num: 3, title: 'Bank', icon: Banknote },
    { num: 4, title: 'Video KYC', icon: Video },
    { num: 5, title: 'Submit', icon: ShieldCheck },
  ];

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => { setMode('info'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Program Info</span>
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3.5 py-1.5 rounded-full mb-4">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Dealer Application</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-3">Complete Your Application</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Fill in 5 quick steps. Our team will review your application within 24-48 hours.
        </p>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-[#28A745] text-white' : isActive ? 'bg-[#2490EF] text-white ring-4 ring-[#2490EF]/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <span className={`text-[9px] sm:text-xs mt-2 font-mono uppercase tracking-wider text-center ${
                    isActive ? 'text-[#2490EF] font-bold' : isCompleted ? 'text-[#28A745]' : 'text-slate-500'
                  }`}>{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 transition-colors ${currentStep > step.num ? 'bg-[#28A745]' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                <User className="w-5 h-5 text-[#2490EF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Step 1 — Personal Information</h2>
                <p className="text-xs text-slate-400">Your basic identity details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" required value={formData.full_name} onChange={(e) => updateField('full_name', e.target.value)} placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">CNIC Number *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" required value={formData.cnic_number} onChange={(e) => updateField('cnic_number', e.target.value)} placeholder="42101-1234567-1"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Date of Birth *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="date" required value={formData.date_of_birth} onChange={(e) => updateField('date_of_birth', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Gender *</label>
                <select value={formData.gender} onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">CNIC Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="date" value={formData.cnic_expiry_date} onChange={(e) => updateField('cnic_expiry_date', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]" />
                </div>
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Profile Image</label>
                <p className="text-[11px] text-slate-500 mb-3">
                  This photo will appear in the "Registered Dealers" section on the home page.
                </p>

                {!formData.profile_image_file ? (
                  <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-[#2490EF]/50 bg-slate-950/50 transition-all cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="w-14 h-14 rounded-full bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Camera className="w-6 h-6 text-[#2490EF]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Upload Profile Photo</p>
                      <p className="text-xs text-slate-400">JPG, PNG · Max 5 MB · Square photo best</p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#28A745]/5 border border-[#28A745]/30">
                    <img src={URL.createObjectURL(formData.profile_image_file)} alt="Profile preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#28A745]/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{formData.profile_image_file.name}</p>
                      <p className="text-xs text-[#28A745] mt-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready to upload
                      </p>
                    </div>
                    <button type="button" onClick={() => updateField('profile_image_file', null)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#2490EF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Step 2 — Contact Details</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="tel" required value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="03XX XXXXXXX"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="email" value={formData.email} disabled
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-400 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">City *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" required value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Karachi"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Service Radius (km)</label>
                <input type="number" value={formData.service_radius_km} onChange={(e) => updateField('service_radius_km', e.target.value)} placeholder="25"
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Office Address</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <textarea rows={3} value={formData.office_address} onChange={(e) => updateField('office_address', e.target.value)} placeholder="Enter your office address"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF] resize-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-[#2490EF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Step 3 — Bank & Business</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Bank Name *</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" required value={formData.bank_name} onChange={(e) => updateField('bank_name', e.target.value)} placeholder="Meezan Bank / HBL / UBL"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Account Number *</label>
                <input type="text" required value={formData.account_number} onChange={(e) => updateField('account_number', e.target.value)} placeholder="Enter your account number"
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">IBAN</label>
                <input type="text" value={formData.iban} onChange={(e) => updateField('iban', e.target.value)} placeholder="PK36MEZN0001234567890123"
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF] font-mono" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Company Type</label>
                <select value={formData.company_type} onChange={(e) => updateField('company_type', e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]">
                  <option>Individual</option>
                  <option>Company</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">GST Registered</label>
                <select value={formData.gst_registered} onChange={(e) => updateField('gst_registered', e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]">
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Reference Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" value={formData.reference_name_1} onChange={(e) => updateField('reference_name_1', e.target.value)} placeholder="Who referred you to Realtor X?"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center">
                <Video className="w-5 h-5 text-[#F5A623]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Step 4 — Video KYC</h2>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5A623]/5 border border-[#F5A623]/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-[#F5A623] mb-2">Video KYC Requirements:</p>
                  <ul className="space-y-1 list-disc list-inside ml-1">
                    <li>Duration: <strong className="text-white">1-2 minutes</strong></li>
                    <li>Max file size: <strong className="text-white">50 MB</strong></li>
                    <li>Format: <strong className="text-white">MP4, WebM, MOV</strong></li>
                    <li>State your name, CNIC number, and address</li>
                  </ul>
                </div>
              </div>
            </div>

            {!formData.video_kyc_file ? (
              <label className="block p-10 rounded-2xl border-2 border-dashed border-slate-700 hover:border-[#2490EF]/50 bg-slate-950/50 transition-all cursor-pointer group">
                <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUpload} className="hidden" />
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-[#2490EF]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Click to Upload Video</p>
                    <p className="text-xs text-slate-400">MP4, WebM, or MOV · Max 50 MB</p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="p-5 rounded-2xl bg-[#28A745]/5 border border-[#28A745]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#28A745]/15 border border-[#28A745]/30 flex items-center justify-center shrink-0">
                    <Play className="w-6 h-6 text-[#28A745]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{formData.video_kyc_file.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatFileSize(formData.video_kyc_file.size)}</p>
                      </div>
                      <button type="button" onClick={() => updateField('video_kyc_file', null)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5 */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">Step 5 — Review & Submit</h2>
                <p className="text-xs text-slate-400">Review your details before submitting</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-white mb-3">Review Your Details</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">Full Name:</div>
                <div className="text-white text-right">{formData.full_name}</div>
                <div className="text-slate-400">CNIC:</div>
                <div className="text-white text-right font-mono">{formData.cnic_number}</div>
                <div className="text-slate-400">Phone:</div>
                <div className="text-white text-right">{formData.phone}</div>
                <div className="text-slate-400">City:</div>
                <div className="text-white text-right">{formData.city}</div>
                <div className="text-slate-400">Bank:</div>
                <div className="text-white text-right">{formData.bank_name}</div>
                <div className="text-slate-400">Profile Image:</div>
                <div className={formData.profile_image_file ? 'text-[#28A745] text-right font-semibold' : 'text-slate-500 text-right'}>
                  {formData.profile_image_file ? '✅ Uploaded' : '— Not uploaded'}
                </div>
                <div className="text-slate-400">Video KYC:</div>
                <div className="text-[#28A745] text-right font-semibold">✅ {formData.video_kyc_file?.name || 'Uploaded'}</div>
              </div>
            </div>

            <button type="button" onClick={() => updateField('terms_and_conditions', !formData.terms_and_conditions)}
              className={`w-full p-4 rounded-xl border transition-all flex items-start gap-3 text-left ${
                formData.terms_and_conditions ? 'bg-[#28A745]/10 border-[#28A745]/40' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
              }`}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                formData.terms_and_conditions ? 'bg-[#28A745] border-[#28A745]' : 'border-slate-600'
              }`}>
                {formData.terms_and_conditions && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </div>
              <div className="text-sm text-slate-300 leading-relaxed">
                I accept the <strong className="text-white">Realtor X Terms & Conditions</strong>,
                commission structure (60% dealer / 40% company), and understand that final activation
                requires admin approval and taking the Founding Member Oath.
              </div>
            </button>

            <div className="p-4 rounded-xl bg-[#F5A623]/5 border border-[#F5A623]/30 flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-[#F5A623]">What happens next:</strong> After submission, our
                team will review your application within <strong>24-48 hours</strong>. You'll be
                notified once approved, then you can take the Founding Oath.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button type="button" onClick={prevStep} disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <button type="button" onClick={() => { setMode('info'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Info
            </button>
          )}

          {currentStep < 5 ? (
            <button type="button" onClick={nextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2490EF] to-[#1b7ecf] hover:brightness-110 rounded-lg shadow-md transition-all">
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleFinalSubmit} disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 rounded-lg shadow-md transition-all disabled:opacity-60">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit for Review
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ChevronDownIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-open:rotate-180 transition-transform shrink-0 mt-1">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
