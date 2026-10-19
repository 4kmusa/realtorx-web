import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center ${className}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10">
        <AlertTriangle className="h-7 w-7 text-rose-400" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {message && (
        <p className="mt-2 max-w-md text-sm text-slate-400">{message}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#d98c15]"
        >
          <RefreshCw className="h-4 w-4" /> {retryLabel}
        </button>
      )}
    </div>
  );
}
