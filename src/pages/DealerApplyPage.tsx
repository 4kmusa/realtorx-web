import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { callGet, callPost } from '../services/api/client';
import { PageId } from '../types';

interface Application {
  id: string;
  status: string;
  raw_status: string;
  submittedOn: string;
}

const input =
  'w-full bg-[#0B1A30] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-[#F5A623]';

export default function DealerApplyPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const { user, isAuthenticated, loading: authLoading, login, refreshUser } = useAuth();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', city: '', company_name: '', cnic: '', password: '',
  });
  const [existing, setExisting] = useState<Application | null>(null);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    setForm((f) => ({ ...f, full_name: f.full_name || user?.full_name || '', phone: f.phone || user?.phone || '' }));
    setChecking(true);
    callGet<Application | null>('realtor_x.api.portal.get_my_dealer_application')
      .then(setExisting)
      .catch(() => setExisting(null))
      .finally(() => setChecking(false));
  }, [isAuthenticated, user]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const details = {
        full_name: form.full_name,
        phone: form.phone,
        city: form.city,
        cnic: form.cnic,
        company_name: form.company_name,
      };
      if (isAuthenticated) {
        await callPost('realtor_x.api.portal.submit_dealer_application', details);
      } else {
        await callPost('realtor_x.api.v1.apply_dealer', { ...details, email: form.email, password: form.password });
        await login(form.email, form.password);
      }
      await refreshUser();
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'We could not submit your application.');
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-label="Loading" />
      </div>
    );
  }

  if (status === 'success' || existing) {
    return (
      <div className="min-h-[60vh] bg-[#0B1A30] flex items-center justify-center p-4">
        <div className="bg-[#081221] border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {existing ? `Application ${existing.status}` : 'Application received'}
          </h2>
          <p className="text-slate-400 mb-6">
            {existing?.status === 'Active' || existing?.status === 'Approved'
              ? 'Your dealer account is approved. Open the dealer portal to get started.'
              : 'Our team will review your application and contact you to complete KYC (CNIC images, bank details and video verification).'}
          </p>
          <button
            onClick={() => onNavigate(existing?.status === 'Active' ? 'dealer' : 'home')}
            className="bg-[#F5A623] text-black font-bold px-6 py-2 rounded-lg"
          >
            {existing?.status === 'Active' ? 'Go to dealer portal' : 'Back to home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B1A30] py-12 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-[#081221] border border-white/10 rounded-2xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Dealer application</h1>
        <p className="text-slate-400 text-center mb-8">
          Apply to sell RealtorX inventory. Applications are reviewed by our team before access is granted.
        </p>
        {status === 'error' && (
          <div role="alert" className="bg-rose-500/10 text-rose-400 p-4 rounded mb-6">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="da-name" className="text-xs text-slate-400 mb-1 block">Full name</label>
              <input id="da-name" required value={form.full_name} onChange={update('full_name')} className={input} />
            </div>
            <div>
              <label htmlFor="da-cnic" className="text-xs text-slate-400 mb-1 block">CNIC number</label>
              <input id="da-cnic" required placeholder="42101-1234567-1" inputMode="numeric" value={form.cnic} onChange={update('cnic')} className={input} />
            </div>
            {!isAuthenticated && (
              <div>
                <label htmlFor="da-email" className="text-xs text-slate-400 mb-1 block">Email</label>
                <input id="da-email" required type="email" autoComplete="email" value={form.email} onChange={update('email')} className={input} />
              </div>
            )}
            <div>
              <label htmlFor="da-phone" className="text-xs text-slate-400 mb-1 block">Mobile number</label>
              <input id="da-phone" required type="tel" placeholder="0300 1234567" value={form.phone} onChange={update('phone')} className={input} />
            </div>
            <div>
              <label htmlFor="da-city" className="text-xs text-slate-400 mb-1 block">City</label>
              <input id="da-city" required value={form.city} onChange={update('city')} className={input} />
            </div>
            <div>
              <label htmlFor="da-company" className="text-xs text-slate-400 mb-1 block">
                Company name <span className="text-slate-600">(optional)</span>
              </label>
              <input id="da-company" value={form.company_name} onChange={update('company_name')} className={input} />
            </div>
          </div>
          {!isAuthenticated && (
            <div>
              <label htmlFor="da-password" className="text-xs text-slate-400 mb-1 block">Create a password</label>
              <input id="da-password" required type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={update('password')} className={input} />
              <p className="mt-1 text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem('realtorx_after_login', 'become-dealer');
                    onNavigate('login');
                  }}
                  className="text-[#F5A623] hover:underline"
                >
                  Sign in first
                </button>
              </p>
            </div>
          )}
          <button
            disabled={status === 'loading'}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-black font-bold py-3 rounded-lg mt-6 hover:bg-[#d98c15] disabled:opacity-50"
          >
            {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === 'loading' ? 'Submitting…' : 'Submit application'}
          </button>
        </form>
      </div>
    </div>
  );
}
