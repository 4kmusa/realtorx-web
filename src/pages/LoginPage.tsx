import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth, AuthUser } from '../context/AuthContext';
import { PageId } from '../types';

export const AFTER_LOGIN_KEY = 'realtorx_after_login';

type Nav = (page: PageId, id?: string) => void;

/** Where to send a user after sign-in: the page they were trying to reach ("page" or
 *  "page/id"), else their portal. */
export function landingPageFor(user: AuthUser | null): string {
  const intended = sessionStorage.getItem(AFTER_LOGIN_KEY);
  sessionStorage.removeItem(AFTER_LOGIN_KEY);
  if (intended) return intended;
  if (user?.is_staff) return 'admin';
  if (user?.member) return 'member';
  return 'home';
}

export function goToLanding(onNavigate: Nav, user: AuthUser | null) {
  const [page, ...rest] = landingPageFor(user).split('/');
  onNavigate(page as PageId, rest.join('/') || undefined);
}

export default function LoginPage({ onNavigate }: { onNavigate: Nav }) {
  const { login, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    if (result.success) {
      goToLanding(onNavigate, await refreshUser());
    } else {
      setError(result.error || 'Invalid email or password.');
    }
    setSubmitting(false);
  };

  const input =
    'w-full bg-[#0B1A30] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-[#F5A623]';

  return (
    <div className="min-h-[70vh] bg-[#0B1A30] flex items-center justify-center p-4">
      <div className="bg-[#081221] p-8 rounded-2xl border border-white/10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign in</h1>
        {error && (
          <div role="alert" className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-xs text-slate-400 mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-xs text-slate-400 mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-black font-bold py-3 rounded-lg mt-4 hover:bg-[#d98c15] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-slate-400 mt-4 text-sm">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('signup')} className="text-[#F5A623] hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
