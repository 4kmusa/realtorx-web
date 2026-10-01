import React, { useState, useEffect, useRef } from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  User,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Banknote,
  Briefcase,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Video,
  Upload,
  X,
  Play,
  Info,
} from 'lucide-react';

interface BecomeDealerPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';

// Phone formatter
const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  if (cleaned.startsWith('0') && cleaned.length === 11) return '+92' + cleaned.slice(1);
  if (cleaned.startsWith('3') && cleaned.length === 10) return '+92' + cleaned;
  if (cleaned.startsWith('0')) return '+92' + cleaned.slice(1);
  return '+92' + cleaned;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

export const BecomeDealerPage: React.FC<BecomeDealerPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, updateUserRole } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1
    full_name: '',
    cnic_number: '',
    date_of_birth: '',
    gender: 'Male',
    cnic_expiry_date: '',
    // Step 2
    phone: '',
    email: '',
    city: 'Karachi',
    office_address: '',
    service_radius_km: '25',
    // Step 3
    bank_name: '',
    account_number: '',
    iban: '',
    company_type: 'Individual',
    gst_registered: 'No',
    reference_name_1: '',
    // Step 4
    video_kyc_file: null as File | null,
    // Step 5
    terms_and_conditions: false,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) onNavigate('login');
    if (user?.is_dealer) onNavigate('dealer');
  }, [isAuthenticated, user, onNavigate]);

  // Pre-fill from user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Update field helper
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    setError(null);

    if (step === 1) {
      if (!formData.full_name.trim()) {
        setError('Full name is required');
        return false;
      }
      if (!formData.cnic_number.trim()) {
        setError('CNIC number is required');
        return false;
      }
      if (!formData.date_of_birth) {
        setError('Date of birth is required');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.phone.trim()) {
        setError('Phone number is required');
        return false;
      }
      if (!formData.city.trim()) {
        setError('City is required');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.bank_name.trim()) {
        setError('Bank name is required');
        return false;
      }
      if (!formData.account_number.trim()) {
        setError('Account number is required');
        return false;
      }
    }

    if (step === 4) {
      if (!formData.video_kyc_file) {
        setError('Video KYC file is required. Please upload your video.');
        return false;
      }
    }

    if (step === 5) {
      if (!formData.terms_and_conditions) {
        setError('You must accept the Terms & Conditions');
        return false;
      }
    }

    return true;
  };

  // Next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Previous step
  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Video file handler
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload MP4, WebM, or MOV video format only.');
      return;
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      setError(
        `Video size (${formatFileSize(file.size)}) exceeds the maximum allowed size (${formatFileSize(MAX_VIDEO_SIZE)}). Please compress or shorten the video.`
      );
      return;
    }

    updateField('video_kyc_file', file);
  };

  // Final submission
  const handleFinalSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Upload video file first (if exists)
      let videoFileUrl = '';

      if (formData.video_kyc_file) {
        const videoFormData = new FormData();
        videoFormData.append('file', formData.video_kyc_file);
        videoFormData.append('is_private', '1');
        videoFormData.append('folder', 'Home/Video KYC');

        const uploadResponse = await fetch(`${ERPNEXT_URL}/api/method/upload_file`, {
          method: 'POST',
          credentials: 'include',
          body: videoFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload Video KYC. Please try again.');
        }

        const uploadResult = await uploadResponse.json();
        videoFileUrl = uploadResult.message?.file_url || '';
        console.log('✅ Video uploaded:', videoFileUrl);
      }

      // Step 2: Create Dealer record
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
        video_kyc_url: videoFileUrl,
        user_email: user?.email,
      };

      const response = await fetch(
        `${ERPNEXT_URL}/api/method/realtorx.api.become_dealer`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || result.exception) {
        throw new Error(
          result.exception || result.message || 'Failed to create dealer'
        );
      }

      // Update user role
      updateUserRole('Dealer');

      // Redirect to Oath
      sessionStorage.setItem('realtorx_dealer_flow', 'true');
      sessionStorage.setItem('realtorx_dealer_id', result.message?.dealer_id || '');

      setTimeout(() => {
        onNavigate('oath');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
      setLoading(false);
    }
  };

  // Steps config
  const steps = [
    { num: 1, title: 'Personal', icon: User },
    { num: 2, title: 'Contact', icon: Phone },
    { num: 3, title: 'Bank', icon: Banknote },
    { num: 4, title: 'Video KYC', icon: Video },
    { num: 5, title: 'Oath', icon: ShieldCheck },
  ];

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3.5 py-1.5 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dealer Registration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-3">
          Become a Dealer
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Join Realtor X as a partner dealer with{' '}
          <strong className="text-[#F5A623]">60% commission split</strong>. Complete 5 steps to get
          started.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-[#28A745] text-white'
                        : isActive
                        ? 'bg-[#2490EF] text-white ring-4 ring-[#2490EF]/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] sm:text-xs mt-2 font-mono uppercase tracking-wider text-center ${
                      isActive
                        ? 'text-[#2490EF] font-bold'
                        : isCompleted
                        ? 'text-[#28A745]'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 transition-colors ${
                      currentStep > step.num ? 'bg-[#28A745]' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
        {/* STEP 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                <User className="w-5 h-5 text-[#2490EF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  Step 1 — Personal Information
                </h2>
                <p className="text-xs text-slate-400">Your basic identity details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  CNIC Number *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.cnic_number}
                    onChange={(e) => updateField('cnic_number', e.target.value)}
                    placeholder="42101-1234567-1"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => updateField('date_of_birth', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  CNIC Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={formData.cnic_expiry_date}
                    onChange={(e) => updateField('cnic_expiry_date', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Contact */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#2490EF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  Step 2 — Contact Details
                </h2>
                <p className="text-xs text-slate-400">How clients can reach you</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="03XX XXXXXXX"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Local ya international (+92) — dono chalenge
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  City *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Karachi"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  value={formData.service_radius_km}
                  onChange={(e) => updateField('service_radius_km', e.target.value)}
                  placeholder="25"
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Office Address
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <textarea
                    rows={3}
                    value={formData.office_address}
                    onChange={(e) => updateField('office_address', e.target.value)}
                    placeholder="Enter your office address"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Bank & Business */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-[#2490EF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  Step 3 — Bank & Business
                </h2>
                <p className="text-xs text-slate-400">For commission payouts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Bank Name *
                </label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.bank_name}
                    onChange={(e) => updateField('bank_name', e.target.value)}
                    placeholder="Meezan Bank / HBL / UBL"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.account_number}
                  onChange={(e) => updateField('account_number', e.target.value)}
                  placeholder="Enter your account number"
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  IBAN
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => updateField('iban', e.target.value)}
                  placeholder="PK36MEZN0001234567890123"
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Company Type
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) => updateField('company_type', e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]"
                >
                  <option>Individual</option>
                  <option>Company</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  GST Registered
                </label>
                <select
                  value={formData.gst_registered}
                  onChange={(e) => updateField('gst_registered', e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#2490EF]"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Reference Name
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.reference_name_1}
                    onChange={(e) => updateField('reference_name_1', e.target.value)}
                    placeholder="Who referred you to Realtor X?"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Video KYC */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center">
                <Video className="w-5 h-5 text-[#F5A623]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  Step 4 — Video KYC
                </h2>
                <p className="text-xs text-slate-400">
                  Upload a short video for identity verification
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-xl bg-[#F5A623]/5 border border-[#F5A623]/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-[#F5A623] mb-2">
                    Video KYC Requirements:
                  </p>
                  <ul className="space-y-1 list-disc list-inside ml-1">
                    <li>
                      Duration: <strong className="text-white">1-2 minutes</strong>
                    </li>
                    <li>
                      Max file size: <strong className="text-white">50 MB</strong>
                    </li>
                    <li>
                      Format: <strong className="text-white">MP4, WebM, MOV</strong>
                    </li>
                    <li>Camera stable rakhein, chehra clear dikhe</li>
                    <li>
                      Apna naam, CNIC number aur address bolein
                    </li>
                    <li>Quiet environment mein record karein</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload / Preview */}
            {!formData.video_kyc_file ? (
              <label className="block p-10 rounded-2xl border-2 border-dashed border-slate-700 hover:border-[#2490EF]/50 bg-slate-950/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#2490EF]/15 border border-[#2490EF]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-[#2490EF]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">
                      Click to Upload Video
                    </p>
                    <p className="text-xs text-slate-400">
                      MP4, WebM, or MOV · Max 50 MB
                    </p>
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
                        <p className="text-sm font-semibold text-white truncate">
                          {formData.video_kyc_file.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatFileSize(formData.video_kyc_file.size)} · Ready to upload
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('video_kyc_file', null)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
                      <span className="text-xs text-[#28A745] font-medium">
                        Video validated successfully
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info about live recording */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-white">How to record:</strong> Apne mobile ya PC ka
                  camera app kholein, video record karein, phir yahan upload karein. Video
                  recorder browser support jald hi aa raha hai.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Terms & Oath */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  Step 5 — Terms & Oath
                </h2>
                <p className="text-xs text-slate-400">
                  Final step — accept terms and take the Realtor X Oath
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-white mb-3">Review Your Details</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-400">Full Name:</div>
                <div className="text-white text-right">{formData.full_name}</div>
                <div className="text-slate-400">CNIC:</div>
                <div className="text-white text-right font-mono">
                  {formData.cnic_number}
                </div>
                <div className="text-slate-400">Phone:</div>
                <div className="text-white text-right">{formData.phone}</div>
                <div className="text-slate-400">City:</div>
                <div className="text-white text-right">{formData.city}</div>
                <div className="text-slate-400">Bank:</div>
                <div className="text-white text-right">{formData.bank_name}</div>
                <div className="text-slate-400">Video KYC:</div>
                <div className="text-[#28A745] text-right font-semibold">
                  ✅ {formData.video_kyc_file?.name || 'Uploaded'}
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <button
              type="button"
              onClick={() =>
                updateField('terms_and_conditions', !formData.terms_and_conditions)
              }
              className={`w-full p-4 rounded-xl border transition-all flex items-start gap-3 text-left ${
                formData.terms_and_conditions
                  ? 'bg-[#28A745]/10 border-[#28A745]/40'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  formData.terms_and_conditions
                    ? 'bg-[#28A745] border-[#28A745]'
                    : 'border-slate-600'
                }`}
              >
                {formData.terms_and_conditions && (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                )}
              </div>
              <div className="text-sm text-slate-300 leading-relaxed">
                I accept the{' '}
                <strong className="text-white">Realtor X Terms & Conditions</strong>,
                commission structure (60% dealer / 40% company), and understand that final
                activation requires taking the Founding Member Oath.
              </div>
            </button>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-[#F5A623]/5 border border-[#F5A623]/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-[#F5A623]">Next Step:</strong> After registration,
                you'll be redirected to take the{' '}
                <strong>Realtor X Founding Member Oath</strong>. Once taken, your dealer
                account will be fully activated.
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2490EF] to-[#1b7ecf] hover:brightness-110 rounded-lg shadow-md transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-[#F5A623] to-[#FFA500] hover:brightness-110 rounded-lg shadow-md transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading & Creating...
                </>
              ) : (
                <>
                  Complete Registration
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
