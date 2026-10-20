import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageId } from '../types';
import { goToLanding } from './LoginPage';

export default function SignupPage({ onNavigate }: { onNavigate: (page: PageId, id?: string) => void }) {
  const { signup, refreshUser } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    const result = await signup(form);
    if (result.success) {
      goToLanding(onNavigate, await refreshUser());
    } else {
      setError(result.error || 'Sign up failed.');
    }
    setSubmitting(false);
  };

  const input =
    'w-full bg-[#0B1A30] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-[#F5A623]';

  return (
    <div className="min-h-[70vh] bg-[#0B1A30] flex items-center justify-center p-4">
      <div className="bg-[#081221] p-8 rounded-2xl border border-white/10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create an account</h1>
        {error && (
          <div role="alert" className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="su-name" className="block text-xs text-slate-400 mb-1">Full name</label>
            <input id="su-name" required autoComplete="name" value={form.full_name} onChange={update('full_name')} className={input} />
          </div>
          <div>
            <label htmlFor="su-email" className="block text-xs text-slate-400 mb-1">Email</label>
            <input id="su-email" type="email" required autoComplete="email" value={form.email} onChange={update('email')} className={input} />
          </div>
          <div>
            <label htmlFor="su-phone" className="block text-xs text-slate-400 mb-1">Mobile number</label>
            <input
              id="su-phone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder="0300 1234567"
              value={form.phone}
              onChange={update('phone')}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="su-password" className="block text-xs text-slate-400 mb-1">Password</label>
            <input
              id="su-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
              className={input}
            />
            <p className="mt-1 text-xs text-slate-500">At least 8 characters; avoid common words.</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-black font-bold py-3 rounded-lg mt-4 hover:bg-[#d98c15] disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p className="text-center text-slate-400 mt-4 text-sm">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-[#F5A623] hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
