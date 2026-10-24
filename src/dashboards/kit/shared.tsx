// Sections shared by the Agent and Developer dashboards: notifications and account security.
import React, { useState } from 'react';
import { Bell, LifeBuoy, Loader2, MessageSquare } from 'lucide-react';
import { callPost } from '../../services/api/client';
import { StatusBadge } from '../../components/ui/Badge';
import {
  BackLink, DataTable, DataView, Notice, PrimaryButton, SectionHeader, formatDate, useApi,
} from './kit';
import { t } from '../i18n';

export interface NotificationRow {
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

/** Where a notification leads inside a dashboard: a section, and optionally a query that opens one record. */
export type NotificationTarget = { section: string; query?: string } | null;

/** Opens the section a notification is about. `targetFor` maps the record type to a section of this dashboard;
 * a link that already points into this dashboard (e.g. /agent/leads?lead=…) is followed as it is. */
export function NotificationsSection({ app, targetFor, onOpen }: {
  app: 'agent' | 'developer';
  targetFor: (n: NotificationRow) => NotificationTarget;
  onOpen: (section: string, query?: string) => void;
}) {
  const open = (n: NotificationRow) => {
    const own = n.link?.match(new RegExp(`^/${app}/([\\w-]+)/?(?:\\?(.*))?$`));
    const target: NotificationTarget = own ? { section: own[1], query: own[2] } : targetFor(n);
    if (target) onOpen(target.section, target.query);
    return !!target;
  };
  const state = useApi<NotificationRow[]>('realtor_x.api.account.my_notifications');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markAll = async () => {
    setBusy(true);
    setError(null);
    try {
      await callPost('realtor_x.api.account.mark_notifications_read');
      state.reload();
    } catch (err: any) {
      setError(err?.message || t('Something went wrong. Please try again.'));
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
      {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
      <DataView
        state={state}
        isEmpty={(rows) => rows.length === 0}
        empty={{ icon: Bell, title: 'No notifications yet', description: 'Buyer leads, deal stages, payments, commission and case updates appear here.' }}
      >
        {(rows) => (
          <ul className="divide-y divide-white/5 rounded-xl border border-line bg-panel">
            {rows.map((n) => (
              <li key={n.name}>
                <button
                  onClick={async () => {
                    if (!n.read) await callPost('realtor_x.api.account.mark_notifications_read', { names: JSON.stringify([n.name]) }).catch(() => undefined);
                    if (!open(n)) state.reload();
                  }}
                  className="flex w-full items-start gap-3 p-4 text-start hover:bg-white/[0.03]"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-fg text-ink'}`} aria-label={n.read ? 'Read' : 'Unread'} />
                  <span className="min-w-0">
                    <span className={`block text-sm ${n.read ? 'text-fg-2' : 'text-fg'}`}>{(n.subject || '').replace(/<[^>]+>/g, '')}</span>
                    <span className="mt-0.5 block text-xs text-fg-3">{formatDate(n.creation)}</span>
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
  // Dashboard passwords are issued and changed only by RealtorX (no self-service change or email reset).
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

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
      <div className="max-w-md rounded-xl border border-line bg-panel p-4">
        <h3 className="font-semibold text-fg">{t("Password")}</h3>
        <p className="mt-1 text-sm text-fg-2">{t("Your password is set by RealtorX. To get a new one, contact the RealtorX team; your other devices are then signed out.")}</p>
      </div>
      <div className="mt-4 max-w-md rounded-xl border border-line bg-panel p-4">
        <h3 className="font-semibold text-fg">{t("Other devices")}</h3>
        <p className="mt-1 text-sm text-fg-2">{t("Sign out everywhere except this browser.")}</p>
        <button onClick={signOutOthers} disabled={busy} className="mt-3 rounded-lg border border-line-2 px-4 py-2 text-sm text-fg hover:bg-white/5 disabled:opacity-50">
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
