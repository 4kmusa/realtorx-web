// The RealtorX logo (unchanged artwork; transparent padding trimmed so it sits correctly in the header).
import React from 'react';

export function RealtorXLogo({ height = 34, className = '' }: { height?: number; className?: string }) {
  return <img src="/images/realtorx-logo-480.png" alt="RealtorX" style={{ height, width: 'auto' }} className={`block select-none ${className}`} draggable={false} />;
}
