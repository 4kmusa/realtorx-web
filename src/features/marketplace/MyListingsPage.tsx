// The signed-in user's own listings (/my-listings): status, review feedback, interest and actions.
import React, { useEffect, useState } from 'react';
import { Eye, Home, Pencil, Plus, Send, Undo2, Users } from 'lucide-react';
import { PageId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  LISTING_STATUS_LABEL, LISTING_STATUS_TONE, MyListingRow, formatArea, formatPrice, getMyListings, imageUrl, markListingSold, submitListing,
  withdrawListing,
} from './api';
import { Gate } from './PostListingPage';

type Nav = (page: PageId, id?: string) => void;

export default function MyListingsPage({ onNavigate, embedded = false }: { onNavigate: Nav; embedded?: boolean }) {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [rows, setRows] = useState<MyListingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ name: string; action: 'withdraw' | 'sold' } | null>(null);

  const load = () => {
    setError(null);
    getMyListings().then(setRows).catch((e) => setError(e?.message || 'Could not load your listings.'));
  };
  useEffect(() => {
    if (isAuthenticated) load();
    else if (!authLoading) sessionStorage.setItem('realtorx_after_login', 'my-listings');
  }, [isAuthenticated, authLoading]);

  const act = async (name: string, fn: () => Promise<unknown>, done: string) => {
    setBusy(name);
    setMessage(null);
    setError(null);
    try {
      await fn();
      setMessage(done);
      load();
    } catch (e: any) {
      setError(e?.message || 'Action failed.');
    } finally {
      setBusy(null);
      setConfirm(null);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return <Gate title="Sign in to see your listings" text="Your listings, their review status and interested buyers are shown here." actions={[['Sign in', () => onNavigate('login')]]} />;
  }
  if (user?.is_staff) {
    return <Gate title="Staff manage listings in the back office" text="Use Desk → Property, filtered by Listing Status." actions={[['Open back office', () => (window.location.href = '/app/property?listing_status=Pending%20Review')]]} />;
  }

  return (
    <div className={embedded ? '' : 'min-h-screen bg-[#0B1A30] pb-16'}>
      <div className={embedded ? '' : 'mx-auto max-w-6xl px-4 py-8 sm:px-6'}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className={embedded ? 'text-lg font-semibold text-white' : 'text-2xl font-bold text-white'}>My listings</h1>
            <p className="mt-1 text-sm text-slate-400">Listings go live after a RealtorX review. Buyers reach you through your RealtorX realtor.</p>
          </div>
          <button onClick={() => onNavigate('post-listing')} className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110">
            <Plus className="h-4 w-4" /> Post a property
          </button>
        </div>

        {message && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200" role="status">{message}</div>}
        {error && rows && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200" role="alert">{error}</div>}

        {error && !rows ? (
          <ErrorState message={error} onRetry={load} />
        ) : !rows ? (
          <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Home} title="No listings yet" description="Post your first property. It takes about five minutes." actionLabel="Post a property" onAction={() => onNavigate('post-listing')} />
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => {
              const cover = imageUrl(r.cover_image);
              const live = r.listing_status === 'Approved';
              return (
                <li key={r.name} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#081221] p-4 sm:flex-row">
                  <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-800 sm:w-40">
                    {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-600"><Home className="h-8 w-8" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${LISTING_STATUS_TONE[r.listing_status] || ''}`}>
                        {LISTING_STATUS_LABEL[r.listing_status] || r.listing_status}
                      </span>
                      {live && r.status !== 'Available' && <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-slate-300">{r.purpose === 'Rent' ? 'Rented' : r.status}</span>}
                      <span className="text-[11px] text-slate-500">{r.name}</span>
                    </div>
                    <p className="mt-1.5 truncate font-semibold text-white">{r.property_title}</p>
                    <p className="text-xs text-slate-400">
                      {formatPrice(r.list_price, r.purpose)} · {formatArea(r.size, r.size_unit)} · {[r.location_area, r.city].filter(Boolean).join(', ')}
                    </p>
                    {r.listing_status === 'Declined' && r.decline_reason && (
                      <p className="mt-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-200">RealtorX: {r.decline_reason}</p>
                    )}
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <Users className="h-3.5 w-3.5" /> {r.interest_count || 0} interested {r.interest_count === 1 ? 'buyer' : 'buyers'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-start gap-2 sm:w-44 sm:flex-col sm:items-stretch">
                    {live && r.status === 'Available' && (
                      <button onClick={() => onNavigate('property-detail', r.name)} className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/5">
                        <Eye className="h-3.5 w-3.5" /> View live
                      </button>
                    )}
                    {r.listing_status !== 'Withdrawn' && (
                      <button onClick={() => onNavigate('post-listing', r.name)} className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/5">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    )}
                    {['Draft', 'Declined', 'Withdrawn'].includes(r.listing_status) && (
                      <button disabled={busy === r.name} onClick={() => act(r.name, () => submitListing(r.name), 'Submitted for review.')} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#F5A623] px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">
                        <Send className="h-3.5 w-3.5" /> Submit for review
                      </button>
                    )}
                    {live && r.status === 'Available' && (
                      <button disabled={busy === r.name} onClick={() => setConfirm({ name: r.name, action: 'sold' })} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/5">
                        Mark as {r.purpose === 'Rent' ? 'rented' : 'sold'}
                      </button>
                    )}
                    {['Draft', 'Pending Review', 'Approved'].includes(r.listing_status) && (
                      <button disabled={busy === r.name} onClick={() => setConfirm({ name: r.name, action: 'withdraw' })} className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">
                        <Undo2 className="h-3.5 w-3.5" /> Withdraw
                      </button>
                    )}
                    {confirm?.name === r.name && (
                      <div className="w-full rounded-lg border border-white/15 bg-black/30 p-2 text-xs text-slate-200" role="alertdialog" aria-label="Confirm">
                        <p>{confirm.action === 'withdraw' ? 'Withdraw this listing? It will be removed from the website.' : 'Mark as no longer available? It will be removed from search.'}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            className="rounded bg-red-500/80 px-2 py-1 font-semibold text-white"
                            onClick={() =>
                              confirm.action === 'withdraw'
                                ? act(r.name, () => withdrawListing(r.name), 'Listing withdrawn.')
                                : act(r.name, () => markListingSold(r.name), 'Listing marked as no longer available.')
                            }
                          >
                            Yes
                          </button>
                          <button className="rounded px-2 py-1 text-slate-300 hover:bg-white/10" onClick={() => setConfirm(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
