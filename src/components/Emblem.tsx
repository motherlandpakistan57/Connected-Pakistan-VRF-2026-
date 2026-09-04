import React from 'react';

interface EmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean;
  className?: string;
  showRays?: boolean;
}

export const Emblem: React.FC<EmblemProps> = ({ 
  size = 'md', 
  animated = true, 
  className = '',
  showRays = true 
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-22 h-22',
    '2xl': 'w-28 h-28',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      {/* State-Grade Sovereign Pakistani Emblem with 24k Gold Bezel & Deep Emerald Radial Depth */}
      <svg
        viewBox="0 0 140 140"
        className={`w-full h-full drop-shadow-2xl ${animated ? 'animate-pulse-slow' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep Sovereign Emerald Gradient */}
          <radialGradient id="emblemPakShield" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#25A566" />
            <stop offset="35%" stopColor="#178A52" />
            <stop offset="70%" stopColor="#0B4A31" />
            <stop offset="100%" stopColor="#031E15" />
          </radialGradient>

          {/* 24k Sovereign Gold Filigree Gradient */}
          <linearGradient id="emblemGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B8" />
            <stop offset="25%" stopColor="#F4D58D" />
            <stop offset="50%" stopColor="#E3A82B" />
            <stop offset="75%" stopColor="#B37D14" />
            <stop offset="100%" stopColor="#F4D58D" />
          </linearGradient>

          {/* Pure Platinum Moon Gradient */}
          <radialGradient id="emblemMoonGlow" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F8FAF7" />
            <stop offset="100%" stopColor="#D5EFE2" />
          </radialGradient>

          {/* Golden Rim Highlight */}
          <linearGradient id="emblemRimGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B37D14" />
            <stop offset="50%" stopColor="#FFF2B8" />
            <stop offset="100%" stopColor="#E3A82B" />
          </linearGradient>

          {/* Luminous Glow Filter */}
          <filter id="emblemLuminousGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Drop Shadow Filter for Bezel */}
          <filter id="emblemGoldDepth" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#02140E" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* Outer Sunburst Sovereign Rays */}
        {showRays && (
          <g stroke="url(#emblemGoldGrad)" strokeWidth="0.8" opacity="0.45">
            {[...Array(24)].map((_, i) => (
              <line
                key={i}
                x1="70"
                y1="4"
                x2="70"
                y2="9"
                transform={`rotate(${i * 15} 70 70)`}
              />
            ))}
          </g>
        )}

        {/* Outer Solid Golden Bezel with Diamond Knurling */}
        <circle cx="70" cy="70" r="64" fill="#031E15" stroke="url(#emblemGoldGrad)" strokeWidth="2.5" filter="url(#emblemGoldDepth)" />
        <circle cx="70" cy="70" r="61" fill="none" stroke="url(#emblemGoldGrad)" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />

        {/* Stepped Inner Golden Ring */}
        <circle cx="70" cy="70" r="56" fill="url(#emblemPakShield)" stroke="url(#emblemRimGlow)" strokeWidth="2" />

        {/* Sovereign Geometric Stars on Outer Ring (Cardinal Positions) */}
        <g fill="url(#emblemGoldGrad)">
          <polygon points="70,10 71.5,13.5 75,14 72,16.5 73,20 70,17.5 67,20 68,16.5 65,14 68.5,13.5" transform="scale(0.8) translate(17, 3)" />
          <polygon points="70,10 71.5,13.5 75,14 72,16.5 73,20 70,17.5 67,20 68,16.5 65,14 68.5,13.5" transform="rotate(90 70 70) scale(0.8) translate(17, 3)" />
          <polygon points="70,10 71.5,13.5 75,14 72,16.5 73,20 70,17.5 67,20 68,16.5 65,14 68.5,13.5" transform="rotate(180 70 70) scale(0.8) translate(17, 3)" />
          <polygon points="70,10 71.5,13.5 75,14 72,16.5 73,20 70,17.5 67,20 68,16.5 65,14 68.5,13.5" transform="rotate(270 70 70) scale(0.8) translate(17, 3)" />
        </g>

        {/* Heraldic Jasmine Wreath (National Flower of Pakistan - Left & Right Branches) */}
        <g stroke="url(#emblemGoldGrad)" strokeWidth="1.6" fill="none" opacity="0.9">
          {/* Left Wreath Branch */}
          <path d="M 28 88 C 22 72 26 50 40 36 C 34 50 36 72 45 84" />
          <path d="M 25 74 Q 32 70 36 78" />
          <path d="M 29 58 Q 37 56 40 65" />
          <path d="M 36 44 Q 45 46 45 55" />
          <circle cx="25" cy="74" r="1.5" fill="#FFF2B8" />
          <circle cx="29" cy="58" r="1.5" fill="#FFF2B8" />
          <circle cx="36" cy="44" r="1.5" fill="#FFF2B8" />

          {/* Right Wreath Branch */}
          <path d="M 112 88 C 118 72 114 50 100 36 C 106 50 104 72 95 84" />
          <path d="M 115 74 Q 108 70 104 78" />
          <path d="M 111 58 Q 103 56 100 65" />
          <path d="M 104 44 Q 95 46 95 55" />
          <circle cx="115" cy="74" r="1.5" fill="#FFF2B8" />
          <circle cx="111" cy="58" r="1.5" fill="#FFF2B8" />
          <circle cx="104" cy="44" r="1.5" fill="#FFF2B8" />
        </g>

        {/* Central Luminous Sovereign Crescent and 5-Point Star (Tilted -19° to match Pakistan's National Flag geometry) */}
        <g transform="translate(70, 70) rotate(-19) translate(-70, -70)">
          {/* Crisp High-Fidelity Crescent */}
          <path
            d="M 80,26 A 38,38 0 1,0 104,98 A 33,33 0 1,1 80,26 Z"
            fill="url(#emblemMoonGlow)"
            filter="url(#emblemLuminousGlow)"
          />
          {/* Luminous Five-Pointed Star pointing toward the crescent's cusp */}
          <polygon
            points="89,47 93,59 105,59 95,67 99,79 89,71 79,79 83,67 73,59 85,59"
            fill="url(#emblemMoonGlow)"
            filter="url(#emblemLuminousGlow)"
          />
        </g>

        {/* Sovereign Ribbon Base Knot with Gold Star Node */}
        <path d="M 52 114 Q 70 120 88 114 Q 70 123 52 114 Z" fill="url(#emblemGoldGrad)" />
        <circle cx="70" cy="117" r="3.5" fill="#E3A82B" stroke="#031E15" strokeWidth="1" />
        <polygon points="70,111 72,116 77,117 72,118 70,123 68,118 63,117 68,116" fill="#FFF2B8" />
      </svg>
    </div>
  );
};
