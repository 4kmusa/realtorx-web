// Dialog shell: a panel that slides in from the right on large screens and rises from the bottom on phones.
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, subtitle, onClose, children, labelId = 'modal-title' }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; labelId?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade sm:items-stretch sm:justify-end" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby={labelId}>
      <div onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-ink animate-rise sm:max-h-none sm:max-w-[480px] sm:rounded-none sm:border-y-0 sm:border-r-0">
        <div className="x-rule absolute inset-x-0 top-0" />
        <div className="flex items-start justify-between gap-6 px-7 pb-2 pt-8">
          <div className="min-w-0">
            <h2 id={labelId} className="text-2xl font-medium tracking-[-0.025em] text-fg">{title}</h2>
            {subtitle && <p className="mt-1.5 truncate text-[14px] text-fg-3">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="-mr-2 -mt-1 rounded-full p-2 text-fg-2 transition-colors hover:bg-white/5 hover:text-fg" aria-label="Close">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="overflow-y-auto px-7 pb-8 pt-4">{children}</div>
      </div>
    </div>
  );
}

/** Confirmation shown inside a modal after a request is sent. */
export function Sent({ title, children, reference, onClose }: { title: string; children: React.ReactNode; reference?: string | null; onClose: () => void }) {
  return (
    <div className="py-6">
      <p className="font-serif text-5xl italic text-fg">Thank you.</p>
      <h3 className="mt-6 text-lg font-medium text-fg">{title}</h3>
      <div className="mt-2 text-[15px] leading-relaxed text-fg-2">{children}</div>
      {reference && (
        <p className="mt-6 rounded-xl border border-line px-4 py-3 text-[13px] text-fg-2">
          Your reference <span className="ml-2 font-medium tracking-wide text-fg">{reference}</span>
        </p>
      )}
      <button onClick={onClose} className="mt-8 h-11 rounded-full border border-line-2 px-6 text-sm text-fg transition-colors hover:bg-white/[0.04]">Close</button>
    </div>
  );
}
