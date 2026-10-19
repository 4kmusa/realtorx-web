import React from 'react';
import { getStatusStyle } from '../../utils/status';

export function Badge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  className = '',
}: {
  status?: string;
  className?: string;
}) {
  return (
    <Badge className={`${getStatusStyle(status)} backdrop-blur-sm ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status || 'Unknown'}
    </Badge>
  );
}
