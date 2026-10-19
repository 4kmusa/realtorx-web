// Sections used by both portals: support tickets, notifications, account security.
import React, { useState } from 'react';
import { Bell, LifeBuoy, Loader2, MessageSquare } from 'lucide-react';
import { callPost } from '../../services/api/client';
import { StatusBadge } from '../../components/ui/Badge';
import {
  BackLink, DataTable, DataView, Field, Notice, PrimaryButton, SectionHeader, formatDate, inputClass, useApi,
} from './kit';

interface Ticket {
  name: string;
  subject: string;
  status: string;
  priority?: string;
  opening_date?: string;
  modified: string;
}

interface TicketDetail {
  ticket: Ticket & { description?: string; creation: string };
  messages: { name: string; content: string; creation: string; from_me: boolean }[];
}

export function SupportSection({ ticketId, go }: { ticketId?: string; go: (section: string) => void }) {
  if (ticketId) return <TicketView id={ticketId} back={() => go('support')} />;
  return <TicketList open={(id) => go(`support/${id}`)} />;
}

function TicketList({ open }: { open: (id: string) => void }) {
  const state = useApi<Ticket[]>('realtor_x.api.portal.my_tickets');
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Medium' });
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await callPost<{ ticket: string }>('realtor_x.api.portal.create_ticket', form);
      setForm({ subject: '', description: '', priority: 'Medium' });
      setShowForm(false);
      open(res.ticket);
    } catch (err: any) {
      setError(err?.message || 'Could not create the ticket.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SectionHeader
        title="Support"
        description="Questions about your account, documents or payments. Our team replies here."
        action={!showForm && <PrimaryButton onClick={() => setShowForm(true)}>New request</PrimaryButton>}
      />
      {showForm && (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-xl border border-white/10 bg-[#0B1A30] p-4">
          <Field label="Subject" htmlFor="t-subject">
            <input id="t-subject" required maxLength={140} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} />
          </Field>
          <Field label="How can we help?" htmlFor="t-desc">
            <textarea id="t-desc" required rows={4} maxLength={5000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-y`} />
          </Field>
          <Field label="Priority" htmlFor="t-priority">
            <select id="t-priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </Field>
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex gap-2">
            <PrimaryButton type="submit" busy={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit
            </PrimaryButton>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
              Cancel
            </button>
          </div>
        </form>
      )}
      <DataView
        state={state}
        isEmpty={(rows) => rows.length === 0}
        empty={{ icon: LifeBuoy, title: 'No support requests', description: 'Requests you open will appear here with our replies.' }}
      >
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(r) => r.name}
            onRowClick={(r) => open(r.name)}
            columns={[
              { header: 'Reference', cell: (r) => <span className="font-mono text-xs">{r.name}</span> },
              { header: 'Subject', cell: (r) => r.subject },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
              { header: 'Updated', cell: (r) => formatDate(r.modified) },
            ]}
          />
        )}
      </DataView>
    </>
  );
}

function TicketView({ id, back }: { id: string; back: () => void }) {
  const state = useApi<TicketDetail>('realtor_x.api.portal.my_ticket', { name: id }, id);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const reply = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      state.setData(await callPost<TicketDetail>('realtor_x.api.portal.reply_ticket', { name: id, message }));
      setMessage('');
    } catch (err: any) {
      setError(err?.message || 'Could not send your reply.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <BackLink onClick={back}>All requests</BackLink>
      <DataView state={state}>
        {({ ticket, messages }) => (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-[#0B1A30] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">{ticket.subject}</h2>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {ticket.name} · opened {formatDate(ticket.creation)}
              </p>
              {ticket.description && (
                <div className="mt-3 whitespace-pre-line text-sm text-slate-300">{ticket.description.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '')}</div>
              )}
            </div>
            {messages.length === 0 && <p className="text-sm text-slate-500">No replies yet.</p>}
            {messages.map((m) => (
              <div
                key={m.name}
                className={`rounded-xl border p-3 text-sm ${m.from_me ? 'ml-8 border-[#F5A623]/20 bg-[#F5A623]/5' : 'mr-8 border-white/10 bg-[#0B1A30]'}`}
              >
                <p className="mb-1 text-xs text-slate-500">
                  {m.from_me ? 'You' : 'RealtorX'} · {formatDate(m.creation)}
                </p>
                <p className="whitespace-pre-line text-slate-200">{m.content}</p>
              </div>
            ))}
            {ticket.status !== 'Closed' ? (
              <form onSubmit={reply} className="space-y-2">
                <label htmlFor="t-reply" className="sr-only">Reply</label>
                <textarea id="t-reply" required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass} placeholder="Write a reply…" />
                {error && <Notice tone="error">{error}</Notice>}
                <PrimaryButton type="submit" busy={busy}>
                  <MessageSquare className="h-4 w-4" /> Send reply
                </PrimaryButton>
              </form>
            ) : (
              <Notice>This request is closed. Open a new one if you need more help.</Notice>
            )}
          </div>
        )}
      </DataView>
    </>
  );
}

interface NotificationRow {
  name: string;
  subject: string;
  type?: string;
  link?: string;
  read: number;
  creation: string;
}

/** Unread count for the portal navigation badge; refreshes when `key` changes. */
export function useUnreadCount(key: string): number {
  const state = useApi<NotificationRow[]>('realtor_x.api.portal.my_notifications', undefined, key);
  return state.data?.filter((n) => !n.read).length || 0;
}

export function NotificationsSection({ openLink }: { openLink: (link: string) => void }) {
  const state = useApi<NotificationRow[]>('realtor_x.api.portal.my_notifications');
  const [busy, setBusy] = useState(false);
  const markAll = async () => {
    setBusy(true);
    try {
      await callPost('realtor_x.api.portal.mark_notifications_read');
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
        empty={{ icon: Bell, title: 'No notifications yet', description: 'You will see updates about bookings, payments and support here.' }}
      >
        {(rows) => (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-[#0B1A30]">
            {rows.map((n) => (
              <li key={n.name}>
                <button
                  onClick={async () => {
                    if (!n.read) await callPost('realtor_x.api.portal.mark_notifications_read', { names: JSON.stringify([n.name]) }).catch(() => undefined);
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
      await callPost('realtor_x.api.portal.logout_other_sessions');
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
