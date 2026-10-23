import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.04] ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] rounded-xl" />
      <Skeleton className="mt-4 h-5 w-1/2" />
      <Skeleton className="mt-2 h-4 w-3/4" />
    </div>
  );
}
