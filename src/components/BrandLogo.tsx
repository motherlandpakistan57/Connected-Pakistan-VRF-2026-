import React from 'react';
import { PakistanFlagEmblem } from './PakistanFlagEmblem';

interface BrandLogoProps {
  variant?: 'dark' | 'light' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  subtitleText = 'VRF 2026 • Secure Sovereign Console',
  className = '',
  onClick,
}) => {
  const isDark = variant === 'dark';

  const titleSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-[11px] sm:text-xs',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm',
  };

  const urduSizes = {
    sm: 'text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm sm:text-base',
    xl: 'text-base sm:text-lg',
  };

  return (
    <div 
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Exact Pakistan Flag Emblem with Crescent & Star */}
      <PakistanFlagEmblem size={size} />

      {/* Brand Title + Subtitle + Urdu Badge */}
      <div className="flex flex-col justify-center">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <span className={`font-sora font-extrabold tracking-tight leading-tight ${titleSizes[size]} ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Connected Pakistan
          </span>
          <span 
            className={`font-urdu font-bold ${urduSizes[size]} text-[#E3A82B] px-2 py-0.5 rounded-md bg-[#01411C]/60 border border-[#E3A82B]/30 shrink-0 leading-normal inline-block`}
            style={{ fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl' }}
          >
            کنیکٹڈ پاکستان
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-2 mt-1">
            <span className={`font-mono font-medium tracking-wide leading-tight ${subtitleSizes[size]} ${isDark ? 'text-emerald-300/80' : 'text-slate-500'}`}>
              {subtitleText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
