import React from 'react';
import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon, title, description, actionLabel, onAction, className = '',
}: { icon?: LucideIcon; title: string; description?: string; actionLabel?: string; onAction?: () => void; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-line px-8 py-16 text-center ${className}`}>
      {Icon && <Icon className="mb-5 h-8 w-8 text-fg-3" strokeWidth={1.25} />}
      <h3 className="text-lg font-medium tracking-[-0.01em] text-fg">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-2">{description}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="mt-7 h-10 rounded-full border border-line-2 px-5 text-sm text-fg transition-colors hover:border-fg/40 hover:bg-white/[0.04]">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
