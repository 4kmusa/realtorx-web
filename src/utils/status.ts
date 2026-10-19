const STATUS_STYLES: Record<string, string> = {
  // Property
  Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  Reserved: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Sold: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  // Project
  Active: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  Upcoming: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  'On Hold': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  // Lead / Deal pipeline
  New: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  Contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Qualified: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  Won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  Lost: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  'Site Visit': 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  Negotiation: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Booking: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  Booked: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  // Bookings / visits / deals
  Draft: 'bg-slate-500/10 text-slate-300 border-white/10',
  Verification: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Approval: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  'Payment Pending': 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  Scheduled: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  'No-Show': 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  Released: 'bg-slate-500/10 text-slate-300 border-white/10',
  Installments: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  // Money
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  'Partially Paid': 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  Earned: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  Approved: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  Payable: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  Held: 'bg-slate-500/10 text-slate-300 border-white/10',
  Reversed: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  // Support
  Open: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  Replied: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  Resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  Closed: 'bg-slate-500/10 text-slate-300 border-white/10',
};

const NEUTRAL_STYLE = 'bg-slate-500/10 text-slate-300 border-white/10';

export function getStatusStyle(status?: string): string {
  if (!status) return NEUTRAL_STYLE;
  return STATUS_STYLES[status] ?? NEUTRAL_STYLE;
}
