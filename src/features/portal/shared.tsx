// Sections shared by the member portal: notifications and account security.
import React, { useState } from 'react';
import { Bell, LifeBuoy, Loader2, MessageSquare } from 'lucide-react';
import { callPost } from '../../services/api/client';
import { StatusBadge } from '../../components/ui/Badge';
import {
  BackLink, DataTable, DataView, Field, Notice, PrimaryButton, SectionHeader, formatDate, inputClass, useApi,
} from './kit';

interface NotificationRow {
  name: string;
  subject: string;
  type: string;
  document_type: string | null;
  document_name: string | null;
  link: string | null;
  read: number;
  creation: string;
}

export function useUnreadCount(key: string): number {
  const state = useApi<NotificationRow[]>('realtor_x.api.account.my_notifications', undefined, key);
  return state.data?.filter((n) => !n.read).length || 0;
}

export function NotificationsSection({ openLink }: { openLink: (link: string) => void }) {
  const state = useApi<NotificationRow[]>('realtor_x.api.account.my_notifications');
  const [busy, setBusy] = useState(false);
  const markAll = async () => {
    setBusy(true);
    try {
      await callPost('realtor_x.api.account.mark_notifications_read');
      state.reload();
    } finally {
      setBusy(false);
    }
  };
  const unread = state.data?.filter((n) => !n.read).length || 0;
  return (
    <>
      <SectionHeader
        title="Notifications"
        description="Updates about your account. Email and SMS delivery depend on configured providers."
        action={unread > 0 && <PrimaryButton busy={busy} onClick={markAll}>Mark all as read</PrimaryButton>}
      />
      <DataView
        state={state}
        isEmpty={(rows) => rows.length === 0}
        empty={{ icon: Bell, title: 'No notifications yet', description: 'Membership updates, buyer leads, listing reviews, case updates and Hub bookings appear here.' }}
      >
        {(rows) => (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-[#0B1A30]">
            {rows.map((n) => (
              <li key={n.name}>
                <button
                  onClick={async () => {
                    if (!n.read) await callPost('realtor_x.api.account.mark_notifications_read', { names: JSON.stringify([n.name]) }).catch(() => undefined);
                    if (n.link) openLink(n.link);
                    else state.reload();
                  }}
                  className="flex w-full items-start gap-3 p-4 text-left hover:bg-white/[0.03]"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-[#F5A623]'}`} aria-label={n.read ? 'Read' : 'Unread'} />
                  <span className="min-w-0">
                    <span className={`block text-sm ${n.read ? 'text-slate-400' : 'text-slate-100'}`}>{(n.subject || '').replace(/<[^>]+>/g, '')}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{formatDate(n.creation)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DataView>
    </>
  );
}

export function SecuritySection({ email }: { email: string }) {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    if (form.new_password.length < 8) return setResult({ tone: 'error', text: 'Use at least 8 characters.' });
    if (form.new_password !== form.confirm) return setResult({ tone: 'error', text: 'The new passwords do not match.' });
    setBusy(true);
    try {
      // Frappe's standard endpoint: verifies the current password and applies the password policy.
      await callPost('frappe.core.doctype.user.user.update_password', {
        old_password: form.old_password,
        new_password: form.new_password,
        logout_all_sessions: 1,
      });
      setForm({ old_password: '', new_password: '', confirm: '' });
      setResult({ tone: 'success', text: 'Password changed. Other devices have been signed out.' });
    } catch (err: any) {
      setResult({ tone: 'error', text: err?.message || 'Could not change the password.' });
    } finally {
      setBusy(false);
    }
  };

  const signOutOthers = async () => {
    setBusy(true);
    setResult(null);
    try {
      await callPost('realtor_x.api.account.logout_other_sessions');
      setResult({ tone: 'success', text: 'All other sessions have been signed out.' });
    } catch (err: any) {
      setResult({ tone: 'error', text: err?.message || 'Could not sign out other sessions.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SectionHeader title="Security" description={`Signed in as ${email}`} />
      <form onSubmit={changePassword} className="max-w-md space-y-3 rounded-xl border border-white/10 bg-[#0B1A30] p-4">
        <h3 className="font-semibold text-white">Change password</h3>
        <Field label="Current password" htmlFor="sec-old">
          <input id="sec-old" type="password" autoComplete="current-password" required value={form.old_password} onChange={(e) => setForm({ ...form, old_password: e.target.value })} className={inputClass} />
        </Field>
        <Field label="New password" htmlFor="sec-new" hint="At least 8 characters; avoid common words.">
          <input id="sec-new" type="password" autoComplete="new-password" required value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Confirm new password" htmlFor="sec-confirm">
          <input id="sec-confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={inputClass} />
        </Field>
        <PrimaryButton type="submit" busy={busy}>Update password</PrimaryButton>
      </form>
      <div className="mt-4 max-w-md rounded-xl border border-white/10 bg-[#0B1A30] p-4">
        <h3 className="font-semibold text-white">Other devices</h3>
        <p className="mt-1 text-sm text-slate-400">Sign out everywhere except this browser.</p>
        <button onClick={signOutOthers} disabled={busy} className="mt-3 rounded-lg border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50">
          Sign out other sessions
        </button>
      </div>
      {result && (
        <div className="mt-4 max-w-md">
          <Notice tone={result.tone}>{result.text}</Notice>
        </div>
      )}
    </>
  );
}
