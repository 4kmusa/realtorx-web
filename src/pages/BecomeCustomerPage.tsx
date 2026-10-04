import React, { useState, useEffect } from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface BecomeCustomerPageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_BASE = import.meta.env.PROD ? '/api/erp' : `${ERPNEXT_URL}/api`;

export const BecomeCustomerPage: React.FC<BecomeCustomerPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, refreshUser, updateUserRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    cnic_number: '',
    phone: '',
    whatsapp: '',
    city: 'Karachi',
    address: '',
  });

  // Pre-fill from user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || '',
        phone: user.phone || '',
        whatsapp: user.phone || '',
      }));
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('login');
    }
    if (user?.is_customer) {
      onNavigate('portal');
    }
  }, [isAuthenticated, user, onNavigate]);

  // Auto-format phone number to international format
  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-()]/g, '');

    // Already has + prefix
    if (cleaned.startsWith('+')) return cleaned;

    // Starts with 00
    if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);

    // Pakistani local: 03XXXXXXXXX (11 digits)
    if (cleaned.startsWith('0') && cleaned.length === 11) return '+92' + cleaned.slice(1);

    // Pakistani without leading 0: 3XXXXXXXXX (10 digits)
    if (cleaned.startsWith('3') && cleaned.length === 10) return '+92' + cleaned;

    // Landline or other
    if (cleaned.startsWith('0')) return '+92' + cleaned.slice(1);

    // Default: assume Pakistan
    return '+92' + cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/method/realtorx.api.become_customer`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            phone: formatPhoneNumber(formData.phone),
            whatsapp: formData.whatsapp
              ? formatPhoneNumber(formData.whatsapp)
              : formatPhoneNumber(formData.phone),
            user_email: user?.email,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.exception) {
        throw new Error(
          result.exception || result.message || 'Failed to create customer account'
        );
      }

      // Update role in frontend immediately
      updateUserRole('Customer');

      // Best-effort backend refresh
      try {
        await refreshUser();
      } catch (e) {
        console.warn('Refresh skipped');
      }

      setSuccess(true);

      setTimeout(() => {
        onNavigate('portal');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#28A745]/15 border-2 border-[#28A745]/40 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-[#28A745]" />
        </div>
        <h1 className="text-3xl font-bold text-white font-heading mb-3">
          Welcome, Customer!
        </h1>
        <p className="text-slate-400 mb-6">
          Aapka customer account ban gaya hai. Ab aap properties book kar sakte hain, payments
          track kar sakte hain, aur documents manage kar sakte hain.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-[#2490EF]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Customer Portal load ho raha hai...
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] bg-[#2490EF]/10 border border-[#2490EF]/30 px-3.5 py-1.5 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Customer Registration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-3">
          Become a Customer
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Register as a Realtor X Customer to book properties, track payments, and manage your
          real estate investments with complete trust.
        </p>
      </div>

      {/* Back Button */}
      <button
        onClick={() => onNavigate('profile')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Profile</span>
      </button>

      {/* Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
              />
            </div>
          </div>

          {/* CNIC */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
              CNIC / ID Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={formData.cnic_number}
                onChange={(e) => setFormData({ ...formData, cnic_number: e.target.value })}
                placeholder="XXXXX-XXXXXXX-X"
                className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
              />
            </div>
          </div>

          {/* Phone + WhatsApp */}
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="03XX XXXXXXX"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Local format ya international (+92) — dono chalenge
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                WhatsApp (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="03XX XXXXXXX"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
                />
              </div>
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Karachi"
                className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
              Address
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your complete address"
                className="w-full pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2490EF] resize-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 text-sm font-bold text-white bg-gradient-to-r from-[#2490EF] to-[#1b7ecf] hover:brightness-110 rounded-lg shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your account...
              </>
            ) : (
              <>
                Register as Customer
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            By registering, you agree to our Terms &amp; Conditions and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};
