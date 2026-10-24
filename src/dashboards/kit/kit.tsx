// Shared building blocks for the customer and dealer portals.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Globe, LogOut, Menu } from 'lucide-react';
import { callGet } from '../../services/api/client';
import { LANGS, setLang, t, useLang, type Lang } from '../i18n';
import { WEBSITE_URL } from '../session';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';

// ── Formatting ───────────────────────────────────────────────────────────
const PKR = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

export function formatPKR(value: number | null | undefined): string {
  return `Rs. ${PKR.format(Number(value) || 0)}`;
}

/** Money in the record's own currency (multi-country); falls back to a plain number. */
export function formatMoney(value: number | null | undefined, currency?: string | null): string {
  const n = Number(value) || 0;
  if (!currency) return PKR.format(n);
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${PKR.format(n)}`;
  }
}

/** Amounts summed per currency by the server ([{currency, amount}], largest first). */
export interface MoneyAmount {
  currency: string;
  amount: number;
}
export function formatMoneyList(list: MoneyAmount[] | null | undefined, empty = '0'): string {
  if (!list || list.length === 0) return empty;
  return list.map((m) => formatMoney(m.amount, m.currency)).join(' + ');
}

/** Copies text; where the browser refuses (no permission, old phone), shows it in a box to copy by hand. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) throw new Error('no clipboard');
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    window.prompt(t('Copy this text:'), text);
    return false;
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value.replace(' ', 'T'));
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Data loading ─────────────────────────────────────────────────────────
export interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
  setData: (data: T) => void;
}

/** GET a whitelisted method; re-runs when `key` changes. */
export function useApi<T>(method: string | null, params?: Record<string, unknown>, key = ''): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!method);
  const [tick, setTick] = useState(0);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    if (!method) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    callGet<T>(method, paramsRef.current)
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err?.message || 'Could not load data.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [method, key, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload, setData };
}

/** Renders loading / error / empty states around content. */
export function DataView<T>({
  state,
  isEmpty,
  empty,
  children,
}: {
  state: ApiState<T>;
  isEmpty?: (data: T) => boolean;
  empty?: { icon?: LucideIcon; title: string; description?: string; actionLabel?: string; onAction?: () => void };
  children: (data: T) => React.ReactNode;
}) {
  if (state.loading && !state.data) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;
  if (!state.data) return null;
  if (empty && isEmpty?.(state.data)) return <EmptyState {...empty} title={t(empty.title)} description={t(empty.description)} />;
  return <>{children(state.data)}</>;
}

// ── Layout ───────────────────────────────────────────────────────────────
export interface NavItem {
  section: string;
  label: string;
  icon: LucideIcon;
}

export function PortalShell({
  title,
  subtitle,
  nav,
  active,
  onSelect,
  onLogout,
  badges = {},
  tabs,
  children,
}: {
  title: string;
  subtitle?: string;
  badges?: Record<string, number>;
  nav: NavItem[];
  /** Sections shown in the bottom tab bar on phones (the rest are under "More"). */
  tabs?: string[];
  active: string;
  onSelect: (section: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const current = nav.find((n) => n.section === active);
  const tabItems = (tabs || []).map((s) => nav.find((n) => n.section === s)).filter(Boolean) as NavItem[];
  const moreBadge = nav.filter((n) => !tabs?.includes(n.section)).reduce((sum, n) => sum + (badges[n.section] || 0), 0);
  const go = (section: string) => {
    setOpen(false);
    onSelect(section);
  };
  useLang(); // re-render the menu and header when the language changes
  return (
    <div className={`mx-auto max-w-[1280px] px-5 py-8 sm:px-8 ${tabItems.length ? 'pb-28 lg:pb-8' : ''}`}>
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-line pb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <a href={WEBSITE_URL} title={t('Go to the website')} className="hidden shrink-0 sm:block">
              <img src="/images/realtorx-logo-480.png" alt="RealtorX" className="h-8 w-auto" />
            </a>
            <span className="hidden h-8 w-px bg-line-2 sm:block" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-fg-3">{t(title)}</p>
              <h1 className="truncate text-xl font-medium tracking-[-0.02em] text-fg">{subtitle}</h1>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={WEBSITE_URL}
            aria-label={t('Go to the website')}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-sm text-fg-2 hover:bg-white/[0.04] hover:text-fg"
          >
            <Globe className="h-4 w-4" /> <span className="hidden sm:inline">{t('Website')}</span>
          </a>
          <LanguagePicker />
          <button
            onClick={onLogout}
            aria-label={t('Sign out')}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-sm text-fg-2 hover:bg-white/[0.04] hover:text-fg"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t('Sign out')}</span>
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[230px_1fr] lg:gap-10">
        {/* Mobile section picker (dashboards without a bottom tab bar) */}
        <div className={`mb-4 lg:hidden ${tabItems.length ? 'hidden' : ''}`}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex w-full items-center justify-between rounded-full border border-line-2 px-5 py-3 text-sm text-fg"
          >
            <span className="flex items-center gap-2">
              {current && <current.icon className="h-4 w-4 text-fg" />}
              {t(current?.label || 'Menu')}
            </span>
            <Menu className="h-4 w-4 text-fg-2" />
          </button>
        </div>
        {open && tabItems.length > 0 && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}
        <nav
          aria-label={`${title} sections`}
          className={
            tabItems.length
              ? `${open ? 'fixed inset-x-3 bottom-24 z-50 max-h-[65vh] overflow-y-auto rounded-2xl border border-line bg-panel p-2 shadow-2xl' : 'hidden'} lg:static lg:z-auto lg:mb-0 lg:block lg:max-h-none lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`
              : `${open ? 'block' : 'hidden'} mb-6 lg:mb-0 lg:block`
          }
        >
          <ul className="space-y-0.5 lg:sticky lg:top-8">
            {nav.map((item) => {
              const isActive = item.section === active;
              return (
                <li key={item.section}>
                  <button
                    onClick={() => go(item.section)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start text-sm transition-colors lg:py-2 ${
                      isActive ? 'bg-white/[0.06] text-fg' : 'text-fg-2 hover:bg-white/[0.03] hover:text-fg'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{t(item.label)}</span>
                    {badges[item.section] > 0 && (
                      <span className="rounded-full bg-blue px-1.5 text-[10px] font-bold text-white" aria-label={`${badges[item.section]} unread`}>
                        {badges[item.section]}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <section className="min-w-0">{children}</section>
      </div>

      {tabItems.length > 0 && (
        // Phones: the main sections as a tab bar at the bottom, within thumb reach; "More" opens the full list.
        <nav aria-label={t('Main sections')} className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <ul className="mx-auto flex max-w-lg">
            {[...tabItems.map((item) => ({ key: item.section, icon: item.icon, label: item.label, on: item.section === active && !open, badge: badges[item.section] || 0, press: () => go(item.section) })),
              { key: 'more', icon: Menu, label: 'More', on: open || !tabs?.includes(active), badge: moreBadge, press: () => setOpen((o) => !o) }].map((tab) => (
              <li key={tab.key} className="flex-1">
                <button
                  type="button"
                  onClick={tab.press}
                  aria-current={tab.on && tab.key !== 'more' ? 'page' : undefined}
                  aria-expanded={tab.key === 'more' ? open : undefined}
                  className={`relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] ${tab.on ? 'text-fg' : 'text-fg-3'}`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="max-w-full truncate px-1">{t(tab.label)}</span>
                  {tab.badge > 0 && <span className="absolute right-[calc(50%-18px)] top-2 h-2 w-2 rounded-full bg-blue" aria-label={`${tab.badge} unread`} />}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-medium tracking-[-0.025em] text-fg">{t(title)}</h2>
        {description && <p className="mt-1 text-sm text-fg-2">{t(description)}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'default' }: { label: string; value: React.ReactNode; hint?: string; tone?: 'default' | 'warn' | 'good' }) {
  const color = tone === 'warn' ? 'text-rose-400' : tone === 'good' ? 'text-emerald-400' : 'text-fg';
  return (
    <div className="h-full min-w-0 rounded-2xl border border-line bg-panel p-4 sm:p-5">
      <p className="text-xs text-fg-2">{t(label)}</p>
      {/* Long amounts ("PKR 113,700,000") get a smaller size on phones instead of breaking in the middle of the number. */}
      <p className={`mt-2 font-medium leading-tight tracking-[-0.02em] tabular-nums sm:text-2xl ${String(value ?? '').length > 12 ? 'text-[15px]' : 'text-lg'} ${color}`} dir="ltr">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-3">{t(hint)}</p>}
    </div>
  );
}

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
}

/** Table on wide screens; scrolls inside its own container on narrow ones. */
/** A table on wider screens; on phones each row becomes a card (first column as its title, the rest as label and value),
 * so no column is cut off or needs sideways scrolling. */
export function DataTable<T>({ rows, columns, onRowClick, rowKey }: { rows: T[]; columns: Column<T>[]; onRowClick?: (row: T) => void; rowKey: (row: T) => string }) {
  const [first, ...rest] = columns;
  return (
    <>
    <ul className="space-y-3 md:hidden">
      {rows.map((row) => (
        <li
          key={rowKey(row)}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
          tabIndex={onRowClick ? 0 : undefined}
          role={onRowClick ? 'button' : undefined}
          className={`rounded-2xl border border-line bg-panel p-4 text-sm ${onRowClick ? 'cursor-pointer active:bg-white/[0.04]' : ''}`}
        >
          {first && <div className="mb-2 font-medium text-fg">{first.cell(row)}</div>}
          <dl className="divide-y divide-line/60">
            {rest.map((c) => (
              <div key={c.header} className="flex items-start justify-between gap-4 py-2">
                {c.header && <dt className="shrink-0 text-[13px] text-fg-3">{t(c.header)}</dt>}
                <dd className={`min-w-0 text-fg ${c.header ? 'text-end' : 'w-full'} ${c.align === 'right' ? 'tabular-nums' : ''}`}>{c.cell(row)}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
    <div className="hidden overflow-x-auto rounded-2xl border border-line md:block">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-white/[0.02] text-start text-[11px] uppercase tracking-[0.16em] text-fg-3">
          <tr>
            {columns.map((c) => (
              <th key={c.header} scope="col" className={`px-4 py-3 text-start font-medium ${c.align === 'right' ? 'text-end' : ''}`}>
                {t(c.header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={onRowClick ? 'cursor-pointer hover:bg-white/[0.03] focus:bg-white/[0.05] focus:outline-none' : ''}
            >
              {columns.map((c) => (
                <td key={c.header} className={`px-4 py-3 text-fg ${c.align === 'right' ? 'text-end tabular-nums' : ''}`}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

export const inputClass =
  'min-h-11 w-full rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-3 outline-none transition-colors focus:border-blue-2/70';

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] text-fg-2">
        {t(label)}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-fg-3">{t(hint)}</p>}
    </div>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success'; children: React.ReactNode }) {
  const cls =
    tone === 'error'
      ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
      : tone === 'success'
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
        : 'border-sky-500/20 bg-sky-500/10 text-sky-200';
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${cls}`}>
      {children}
    </div>
  );
}

export function PrimaryButton({ children, busy, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  // Text parts are translated; icons and other elements pass through.
  children = React.Children.map(children, (c) => (typeof c === 'string' && c.trim() ? c.replace(c.trim(), t(c.trim())) : c));
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-fg text-ink h-10 px-5 text-sm font-medium text-ink hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
    >
      {children}
    </button>
  );
}

export function LanguagePicker() {
  const lang = useLang();
  const options = LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>);
  const change = (e: React.ChangeEvent<HTMLSelectElement>) => setLang(e.target.value as Lang);
  return (
    <>
      {/* Phones: a small round button showing EN / UR / AR (the full list opens on tap), so the header keeps room. */}
      <label className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-2 text-[12px] font-medium uppercase text-fg sm:hidden">
        {lang}
        <select aria-label={t('Language')} value={lang} onChange={change} className="absolute inset-0 cursor-pointer opacity-0">{options}</select>
      </label>
      <select
        aria-label={t('Language')}
        value={lang}
        onChange={change}
        className="hidden h-10 rounded-full border border-line-2 bg-transparent px-3 text-sm text-fg outline-none focus:border-blue-2/70 sm:block"
      >
        {options}
      </select>
    </>
  );
}

export function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="mb-2 inline-flex min-h-11 items-center gap-1 text-sm text-fg-2 hover:text-fg">
      <span className="inline-block rtl:rotate-180">←</span> {t(children)}
    </button>
  );
}
