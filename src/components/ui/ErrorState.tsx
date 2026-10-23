import React from 'react';
import { RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'Something went wrong', message, onRetry, retryLabel = 'Try again', className = '',
}: { title?: string; message?: string; onRetry?: () => void; retryLabel?: string; className?: string }) {
  return (
    <div role="alert" className={`flex flex-col items-center justify-center rounded-2xl border border-line px-8 py-16 text-center ${className}`}>
      <h3 className="text-lg font-medium text-fg">{title}</h3>
      {message && <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-2">{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-7 inline-flex h-10 items-center gap-2 rounded-full border border-line-2 px-5 text-sm text-fg transition-colors hover:border-fg/40 hover:bg-white/[0.04]">
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} /> {retryLabel}
        </button>
      )}
    </div>
  );
}
