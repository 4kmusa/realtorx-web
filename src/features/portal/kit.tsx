// Shared building blocks for the customer and dealer portals.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LogOut, Menu } from 'lucide-react';
import { callGet } from '../../services/api/client';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';

// ── Formatting ───────────────────────────────────────────────────────────
const PKR = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

export function formatPKR(value: number | null | undefined): string {
  return `Rs. ${PKR.format(Number(value) || 0)}`;
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
  if (empty && isEmpty?.(state.data)) return <EmptyState {...empty} />;
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
  children,
}: {
  title: string;
  subtitle?: string;
  badges?: Record<string, number>;
  nav: NavItem[];
  active: string;
  onSelect: (section: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const current = nav.find((n) => n.section === active);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#F5A623]">{title}</p>
          <h1 className="truncate text-2xl font-bold text-white">{subtitle}</h1>
        </div>
        <button
          onClick={onLogout}
          aria-label="Sign out"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Mobile section picker */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#0B1A30] px-4 py-3 text-sm text-white"
          >
            <span className="flex items-center gap-2">
              {current && <current.icon className="h-4 w-4 text-[#F5A623]" />}
              {current?.label || 'Menu'}
            </span>
            <Menu className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        <nav
          aria-label={`${title} sections`}
          className={`${open ? 'block' : 'hidden'} mb-6 lg:mb-0 lg:block`}
        >
          <ul className="space-y-1 rounded-xl border border-white/10 bg-[#0B1A30] p-2 lg:sticky lg:top-24">
            {nav.map((item) => {
              const isActive = item.section === active;
              return (
                <li key={item.section}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      onSelect(item.section);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive ? 'bg-[#F5A623]/10 font-semibold text-[#F5A623]' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {badges[item.section] > 0 && (
                      <span className="rounded-full bg-[#F5A623] px-1.5 text-[10px] font-bold text-black" aria-label={`${badges[item.section]} unread`}>
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
    </div>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'default' }: { label: string; value: React.ReactNode; hint?: string; tone?: 'default' | 'warn' | 'good' }) {
  const color = tone === 'warn' ? 'text-rose-400' : tone === 'good' ? 'text-emerald-400' : 'text-white';
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B1A30] p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${color}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
}

/** Table on wide screens; scrolls inside its own container on narrow ones. */
export function DataTable<T>({ rows, columns, onRowClick, rowKey }: { rows: T[]; columns: Column<T>[]; onRowClick?: (row: T) => void; rowKey: (row: T) => string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-slate-400">
          <tr>
            {columns.map((c) => (
              <th key={c.header} scope="col" className={`px-4 py-3 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={onRowClick ? 'cursor-pointer hover:bg-white/[0.03] focus:bg-white/[0.05] focus:outline-none' : ''}
            >
              {columns.map((c) => (
                <td key={c.header} className={`px-4 py-3 text-slate-200 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const inputClass =
  'w-full rounded-lg border border-white/10 bg-[#081221] p-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#F5A623]';

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs text-slate-400">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
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
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#F5A623] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#d98c15] disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
    >
      {children}
    </button>
  );
}

export function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="mb-4 text-sm text-slate-400 hover:text-white">
      ← {children}
    </button>
  );
}
