import React from 'react';

interface RealtorXLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'horizontal';
  showSubtitle?: boolean;
}

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_BASE = import.meta.env.PROD ? '/api/erp' : `${ERPNEXT_URL}/api`;

export const RealtorXLogo: React.FC<RealtorXLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const sizeMap = {
    sm: { height: 40 },
    md: { height: 55 },
    lg: { height: 75 },
    xl: { height: 100 },
  };

  const currentSize = sizeMap[size];
  const logoUrl = '/images/realtorx-logo.png';
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={logoUrl}
        alt="Realtor X"
        style={{
          height: `${currentSize.height}px`,
          width: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
        }}
        className="block"
      />
    </div>
  );
};
