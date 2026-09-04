import React from 'react';

interface PakistanFlagEmblemProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'full' | 'lg' | 'md' | 'none';
  variant?: 'circle' | 'flag';
}

/**
 * High-precision Official Islamic Republic of Pakistan Flag & Emblem.
 * Matches national constitutional geometry:
 * - Field: Pakistan Deep Emerald Green (#01411C / #063D27)
 * - Hoist: Pure White vertical strip (1/4 of total flag width in 'flag' mode)
 * - Crescent: Luminous white crescent oriented at ~45° toward upper fly
 * - Five-Pointed Star: White 5-pointed star pointing toward crescent cusp
 */
export const PakistanFlagEmblem: React.FC<PakistanFlagEmblemProps> = ({
  size = 'md',
  className = '',
  rounded = 'full',
  variant = 'circle',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const flagSizeMap = {
    xs: 'w-8 h-5',
    sm: 'w-10 h-6',
    md: 'w-14 h-9',
    lg: 'w-16 h-10',
    xl: 'w-24 h-15',
  };

  const roundedClasses = {
    full: 'rounded-full',
    lg: 'rounded-xl',
    md: 'rounded-lg',
    none: 'rounded-none',
  };

  if (variant === 'flag') {
    return (
      <div 
        className={`relative inline-flex shrink-0 overflow-hidden shadow-md border border-emerald-800/40 ${flagSizeMap[size]} ${roundedClasses[rounded]} ${className}`}
      >
        <svg viewBox="0 0 300 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* White vertical bar at hoist (1/4 width) */}
          <rect x="0" y="0" width="75" height="200" fill="#FFFFFF" />
          {/* Deep Pakistan dark green field (3/4 width) */}
          <rect x="75" y="0" width="225" height="200" fill="#01411C" />
          
          {/* Authentic Crescent & 5-pointed Star oriented toward top fly corner */}
          <g transform="translate(187.5, 100) rotate(-40)">
            {/* White outer circle */}
            <circle cx="0" cy="0" r="54" fill="#FFFFFF" />
            {/* Green cutout circle to form sharp crescent */}
            <circle cx="16" cy="-6" r="48" fill="#01411C" />
            {/* 5-pointed star placed in the opening of the crescent */}
            <polygon 
              points="0,-24 7,-8 24,-8 11,2 16,18 0,8 -16,18 -11,2 -24,-8 -7,-8"
              fill="#FFFFFF" 
              transform="translate(32, -18) scale(0.65) rotate(15)"
            />
          </g>
        </svg>
      </div>
    );
  }

  // Circular Badge Emblem (National Flag Crescent & Star with authentic geometry)
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-[#01411C] shadow-md ring-1 ring-emerald-500/50 ${sizeMap[size]} ${roundedClasses[rounded]} ${className}`}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Deep Sovereign Dark Green Background */}
        <circle cx="50" cy="50" r="50" fill="#01411C" />

        {/* Crescent and Star positioned at official Pakistan 45 degree tilt */}
        <g transform="translate(48, 52) rotate(-42)">
          {/* Outer white disc of crescent */}
          <circle cx="0" cy="0" r="34" fill="#FFFFFF" />
          {/* Inner cutout disc shifted to form crescent */}
          <circle cx="10" cy="-4" r="30" fill="#01411C" />
          
          {/* 5-Pointed White Star positioned facing outwards */}
          <polygon
            points="0,-16 4.7,-4.9 16,-4.9 7.3,1.4 10.6,12.5 0,5.6 -10.6,12.5 -7.3,1.4 -16,-4.9 -4.7,-4.9"
            fill="#FFFFFF"
            transform="translate(20, -12) scale(0.68) rotate(18)"
          />
        </g>
      </svg>
    </div>
  );
};
