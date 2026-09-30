import React from 'react';

interface RealtorXLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'horizontal';
  showSubtitle?: boolean;
}

export const RealtorXLogo: React.FC<RealtorXLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = false,
}) => {
  const sizeMap = {
    sm: { height: 32, textScale: 'text-lg', iconScale: 28 },
    md: { height: 44, textScale: 'text-2xl', iconScale: 38 },
    lg: { height: 60, textScale: 'text-3xl', iconScale: 52 },
    xl: { height: 84, textScale: 'text-4xl sm:text-5xl', iconScale: 72 },
  };

  const currentSize = sizeMap[size];

  // Precision vector SVG matching the uploaded RealtorX Logo
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 280 120"
        className="h-auto"
        style={{ height: `${currentSize.height}px`, maxWidth: '100%' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Orange/Gold Gradient for top swoosh & top half of X */}
          <linearGradient id="rxOrangeGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="45%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          {/* Blue/Cyan Gradient for bottom swoosh & bottom half of X */}
          <linearGradient id="rxBlueCyan" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D47A1" />
            <stop offset="40%" stopColor="#0288D1" />
            <stop offset="100%" stopColor="#29B6F6" />
          </linearGradient>

          {/* Tower 3D Gradients */}
          <linearGradient id="rxTowerFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#B0BEC5" />
          </linearGradient>

          <linearGradient id="rxTowerSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E88E5" />
            <stop offset="100%" stopColor="#0D47A1" />
          </linearGradient>

          <linearGradient id="rxTowerRoof" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ECEFF1" />
            <stop offset="100%" stopColor="#CFD8DC" />
          </linearGradient>

          <filter id="rxDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* --- ICON EMBLEM (Left Section) --- */}
        <g transform="translate(10, 8)" filter="url(#rxDropShadow)">
          {/* Upper Golden/Orange Swoosh Arc */}
          <path
            d="M 6 48 C 6 22, 40 10, 72 14 C 74 15, 68 18, 62 20 C 38 18, 16 28, 16 48 C 16 54, 18 58, 22 62 C 14 60, 6 56, 6 48 Z"
            fill="url(#rxOrangeGold)"
          />

          {/* Lower Cyan/Blue Swoosh Arc */}
          <path
            d="M 32 66 C 44 70, 64 68, 76 56 C 84 46, 82 34, 76 26 C 80 30, 84 38, 82 48 C 78 62, 58 74, 34 70 C 30 69, 31 67, 32 66 Z"
            fill="url(#rxBlueCyan)"
          />

          {/* Tower 1 (Leftmost, Short) */}
          <polygon points="20,58 28,52 28,66 20,70" fill="url(#rxTowerFront)" />
          <polygon points="28,52 34,50 34,64 28,66" fill="url(#rxTowerSide)" />
          <polygon points="20,58 26,50 34,50 28,52" fill="url(#rxTowerRoof)" />

          {/* Tower 2 (Mid-Left, Medium) */}
          <polygon points="31,46 41,38 41,65 31,69" fill="url(#rxTowerFront)" />
          <polygon points="41,38 48,35 48,62 41,65" fill="url(#rxTowerSide)" />
          <polygon points="31,46 38,36 48,35 41,38" fill="url(#rxTowerRoof)" />

          {/* Tower 3 (Center, Tallest Pinnacle) */}
          <polygon points="44,32 56,22 56,64 44,68" fill="url(#rxTowerFront)" />
          <polygon points="56,22 65,18 65,60 56,64" fill="url(#rxTowerSide)" />
          <polygon points="44,32 53,19 65,18 56,22" fill="url(#rxTowerRoof)" />

          {/* Tower 4 (Right, Medium-Tall) */}
          <polygon points="58,40 68,32 68,61 58,65" fill="url(#rxTowerFront)" />
          <polygon points="68,32 75,29 75,58 68,61" fill="url(#rxTowerSide)" />
          <polygon points="58,40 65,30 75,29 68,32" fill="url(#rxTowerRoof)" />
        </g>

        {/* --- TYPOGRAPHY "Realtor" --- */}
        <text
          x="95"
          y="78"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="48"
          letterSpacing="-0.5"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          Realtor
        </text>

        {/* --- DYNAMIC STYLIZED "X" (Golden Top + Sapphire Blue Bottom with clean diagonal split) --- */}
        <g transform="translate(236, 32)">
          {/* Top-Right & Top-Left Wing (Golden Orange Gradient) */}
          <path
            d="M 6 4 L 20 4 L 38 27 L 33 32 L 6 4 Z"
            fill="url(#rxOrangeGold)"
          />
          <path
            d="M 48 4 L 34 4 L 25 18 L 30 23 L 48 4 Z"
            fill="url(#rxOrangeGold)"
          />
          {/* Central Top Triangle Wedge */}
          <polygon points="20,4 34,4 27,15" fill="url(#rxOrangeGold)" />

          {/* Bottom-Right & Bottom-Left Wing (Electric Sapphire Blue Gradient) */}
          <path
            d="M 2 46 L 15 46 L 24 33 L 19 28 L 2 46 Z"
            fill="url(#rxBlueCyan)"
          />
          <path
            d="M 44 46 L 31 46 L 15 23 L 20 18 L 44 46 Z"
            fill="url(#rxBlueCyan)"
          />
          {/* Central Bottom Triangle Wedge */}
          <polygon points="15,46 31,46 23,34" fill="url(#rxBlueCyan)" />
        </g>
      </svg>

      {showSubtitle && (
        <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-sky-400 border-l border-slate-700 pl-2.5">
          Culture &amp; Custodians
        </span>
      )}
    </div>
  );
};
