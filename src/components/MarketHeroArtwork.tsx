import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, MapPin, Eye, Info, Volume2, Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { speechService } from '../lib/audio';

interface MarketHeroArtworkProps {
  className?: string;
  showBadge?: boolean;
  onExploreReport?: () => void;
}

const DEFAULT_MARKET_PHOTO = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';

export const MarketHeroArtwork: React.FC<MarketHeroArtworkProps> = ({
  className = '',
  showBadge = false,
  onExploreReport
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<'scene' | 'photo'>('photo');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('connected_pakistan_hero_custom_image');
      if (saved) {
        setCustomImage(saved);
        setRenderMode('photo');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCustomImage(result);
        setRenderMode('photo');
        try {
          localStorage.setItem('connected_pakistan_hero_custom_image', result);
        } catch {
          // ignore
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImage(null);
    setRenderMode('scene');
    try {
      localStorage.removeItem('connected_pakistan_hero_custom_image');
    } catch {
      // ignore
    }
  };

  const handlePlayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speak(
      'رپورٹ نمبر CP-26-8841۔ راجہ بازار میں گمنام صارف کی اطلاع پر پیرہ معائنہ کاروں نے 41 منٹ میں سرکاری نرخ نافذ کرائے۔',
      { lang: 'ur' }
    );
  };

  const activePhotoSrc = customImage || DEFAULT_MARKET_PHOTO;

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#1A774B] bg-[#062D1F] select-none group ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Main Visual Display - completely unobstructed */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] overflow-hidden bg-[#8D5B3A]">
        {renderMode === 'photo' ? (
          <img
            src={activePhotoSrc}
            alt="Connected Pakistan Market Hero"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          /* Exact Artistic High-Fidelity Scene SVG matching the screenshot composition */
          <svg
            viewBox="0 0 960 600"
            className="w-full h-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Sky and sunlit atmospheric gradients */}
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F6D19E" />
                <stop offset="50%" stopColor="#E9B273" />
                <stop offset="100%" stopColor="#B36E41" />
              </linearGradient>

              <linearGradient id="brickWall" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8F5435" />
                <stop offset="100%" stopColor="#5E311B" />
              </linearGradient>

              <linearGradient id="awningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E6E45" />
                <stop offset="100%" stopColor="#0B4226" />
              </linearGradient>

              <linearGradient id="woodCart" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6E4429" />
                <stop offset="50%" stopColor="#8A5A39" />
                <stop offset="100%" stopColor="#58351F" />
              </linearGradient>

              <linearGradient id="vendorKameez" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3F5E8E" />
                <stop offset="50%" stopColor="#2A4368" />
                <stop offset="100%" stopColor="#1C2E4A" />
              </linearGradient>

              <linearGradient id="customerDupatta" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8A79B" />
                <stop offset="60%" stopColor="#E88377" />
                <stop offset="100%" stopColor="#CC6258" />
              </linearGradient>

              <linearGradient id="pomegranateGrad" x1="20%" y1="20%" x2="80%" y2="80%">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="50%" stopColor="#BE123C" />
                <stop offset="100%" stopColor="#6E0B24" />
              </linearGradient>

              <linearGradient id="bananaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFEA6B" />
                <stop offset="70%" stopColor="#F5B800" />
                <stop offset="100%" stopColor="#C98B00" />
              </linearGradient>

              <radialGradient id="sunGlow" cx="80%" cy="15%" r="60%">
                <stop offset="0%" stopColor="#FFF2D1" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#F6C878" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#B36E41" stopOpacity="0" />
              </radialGradient>

              <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.4" floodColor="#1C0D05" />
              </filter>
            </defs>

            {/* Background Sky & Warm Sunlight */}
            <rect width="960" height="600" fill="url(#skyGrad)" />
            <rect width="960" height="600" fill="url(#sunGlow)" />

            {/* Old City Brick Buildings & Archways */}
            <path d="M0,0 L420,0 L440,320 L0,360 Z" fill="url(#brickWall)" opacity="0.9" />
            <path d="M500,80 L960,30 L960,420 L480,380 Z" fill="#753F24" opacity="0.95" />
            
            {/* Arched bazaar window/door */}
            <path d="M600,120 Q645,80 690,120 L690,190 L600,190 Z" fill="#3D1D0E" />

            {/* Distant bazaar shoppers in ambient lighting */}
            <circle cx="770" cy="270" r="14" fill="#D3A27F" />
            <path d="M756,284 L784,284 L788,380 L752,380 Z" fill="#E8DEC9" />

            <circle cx="830" cy="285" r="12" fill="#C98E6B" />
            <path d="M818,297 L842,297 L846,375 L814,375 Z" fill="#38526B" />

            {/* Ground Street Pavement */}
            <path d="M0,320 L960,340 L960,600 L0,600 Z" fill="#807266" />
            <path d="M0,390 L960,370 L960,600 L0,600 Z" fill="#695D53" />

            {/* Green Bazaar Canopy / Tarpaulin */}
            <polygon points="560,180 880,195 860,280 540,260" fill="url(#awningGrad)" filter="url(#softShadow)" />
            <line x1="580" y1="260" x2="580" y2="390" stroke="#4A3423" strokeWidth="4" />
            <line x1="840" y1="275" x2="840" y2="390" stroke="#4A3423" strokeWidth="4" />

            {/* LEFT VEGETABLE PUSHCART */}
            {/* Wooden Wheel with detailed spokes */}
            <g transform="translate(230, 440)">
              <circle cx="0" cy="0" r="70" fill="none" stroke="#422515" strokeWidth="12" />
              <circle cx="0" cy="0" r="62" fill="none" stroke="#7A4B29" strokeWidth="6" />
              <circle cx="0" cy="0" r="16" fill="#2E180C" />
              <circle cx="0" cy="0" r="8" fill="#A8744F" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="0"
                  x2={Math.cos((deg * Math.PI) / 180) * 60}
                  y2={Math.sin((deg * Math.PI) / 180) * 60}
                  stroke="#5C361E"
                  strokeWidth="4"
                />
              ))}
            </g>

            {/* Wooden Cart Bed */}
            <polygon points="160,330 510,310 520,380 170,410" fill="url(#woodCart)" filter="url(#softShadow)" />
            <polygon points="150,330 510,310 500,295 140,315" fill="#A16E47" />

            {/* Colorful Fresh Vegetables on Left Cart */}
            {/* Green capsicums & chilies */}
            <circle cx="210" cy="300" r="15" fill="#2E9E44" />
            <circle cx="230" cy="290" r="17" fill="#248A37" />
            <circle cx="245" cy="305" r="14" fill="#38B34F" />
            <circle cx="220" cy="315" r="16" fill="#1C742D" />
            
            {/* Yellow lemons & squash */}
            <circle cx="270" cy="295" r="13" fill="#FACC15" />
            <circle cx="285" cy="285" r="14" fill="#EAB308" />
            <circle cx="295" cy="305" r="12" fill="#FDE047" />

            {/* Purple eggplants / brinjals */}
            <ellipse cx="330" cy="295" rx="16" ry="12" fill="#581C87" transform="rotate(-15 330 295)" />
            <ellipse cx="350" cy="290" rx="17" ry="13" fill="#6B21A8" transform="rotate(10 350 290)" />
            <ellipse cx="365" cy="305" rx="15" ry="11" fill="#4C1D95" />

            {/* Carrots & cucumbers */}
            <ellipse cx="395" cy="285" rx="20" ry="8" fill="#F97316" transform="rotate(-25 395 285)" />
            <ellipse cx="410" cy="295" rx="22" ry="7" fill="#EA580C" transform="rotate(-15 410 295)" />
            <ellipse cx="430" cy="280" rx="22" ry="7" fill="#15803D" transform="rotate(-20 430 280)" />

            {/* PAKISTANI STREET VENDOR (Center) */}
            <g transform="translate(460, 180)">
              {/* Legs / Shalwar */}
              <path d="M-22,230 L-26,380 L-6,380 L-6,230 Z" fill="#1D304A" />
              <path d="M8,230 L8,380 L28,380 L24,230 Z" fill="#18273D" />
              {/* Traditional Sandals/Peshawari Chappal */}
              <ellipse cx="-16" cy="385" rx="18" ry="7" fill="#2E1B10" />
              <ellipse cx="18" cy="385" rx="18" ry="7" fill="#2E1B10" />

              {/* Kurta / Kameez Body */}
              <path d="M-40,65 L40,65 L55,240 L-55,240 Z" fill="url(#vendorKameez)" filter="url(#softShadow)" />
              {/* White collar detail */}
              <polygon points="-8,65 0,95 8,65" fill="#E8EEF5" />
              <line x1="0" y1="95" x2="0" y2="150" stroke="#182A45" strokeWidth="2" />

              {/* Head & Smiling Face */}
              <circle cx="0" cy="25" r="28" fill="#E6A880" />
              {/* Friendly eyes & warm smile */}
              <path d="M-12,18 Q-7,12 -2,18" fill="none" stroke="#3D2012" strokeWidth="3" strokeLinecap="round" />
              <path d="M2,18 Q7,12 12,18" fill="none" stroke="#3D2012" strokeWidth="3" strokeLinecap="round" />
              <path d="M-10,32 Q0,44 10,32" fill="none" stroke="#3D2012" strokeWidth="3.5" strokeLinecap="round" />
              {/* Neat Beard / Moustache */}
              <path d="M-14,28 Q0,38 14,28 Q18,48 0,55 Q-18,48 -14,28 Z" fill="#362216" opacity="0.65" />

              {/* White Embroidered Topi / Cap */}
              <path d="M-22,8 Q0,-12 22,8 L24,18 L-24,18 Z" fill="#F8FAFC" />
              <line x1="-20" y1="14" x2="20" y2="14" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />

              {/* Left Arm resting on stall */}
              <path d="M-38,75 L-110,140 L-90,165 L-25,100 Z" fill="#2C476E" />
              <circle cx="-105" cy="155" r="13" fill="#E6A880" />

              {/* Right Arm EXTENDING & HANDING BANANAS */}
              <path d="M38,75 L115,100 L125,120 L45,105 Z" fill="#2C476E" />
              <circle cx="120" cy="115" r="14" fill="#E6A880" />

              {/* Fresh Bunch of Bananas being handed over */}
              <g transform="translate(120, 95)">
                <path d="M0,0 Q18,-15 36,-6 Q18,12 0,8 Z" fill="url(#bananaGrad)" />
                <path d="M-5,10 Q16,-8 38,4 Q16,22 -5,16 Z" fill="url(#bananaGrad)" />
                <path d="M-10,20 Q12,2 34,14 Q12,30 -10,26 Z" fill="url(#bananaGrad)" />
                <circle cx="34" cy="4" r="3" fill="#713F12" />
                <circle cx="36" cy="-6" r="3" fill="#713F12" />
                <circle cx="32" cy="14" r="3" fill="#713F12" />
                <rect x="-14" y="2" width="10" height="20" rx="4" fill="#65A30D" />
              </g>
            </g>

            {/* PAKISTANI CUSTOMER (Fatima Bibi) & CHILD */}
            <g transform="translate(680, 190)">
              {/* Flowing Peach-Pink Floral Dupatta / Chador */}
              <path
                d="M-30,40 Q-50,110 -35,270 L70,260 Q65,100 35,40 Q0,0 -30,40 Z"
                fill="url(#customerDupatta)"
                filter="url(#softShadow)"
              />
              {/* Subtle floral accents on Dupatta */}
              <circle cx="-15" cy="120" r="3" fill="#FFE4E6" opacity="0.6" />
              <circle cx="15" cy="140" r="3" fill="#FFE4E6" opacity="0.6" />
              <circle cx="-5" cy="190" r="3" fill="#FFE4E6" opacity="0.6" />
              <circle cx="30" cy="200" r="3" fill="#FFE4E6" opacity="0.6" />

              {/* Face gently framed by Dupatta */}
              <ellipse cx="-2" cy="50" rx="19" ry="22" fill="#F3BBA2" />
              {/* Modest pleasant expression */}
              <path d="M-10,48 Q-6,44 -2,48" fill="none" stroke="#4A2511" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M2,48 Q6,44 10,48" fill="none" stroke="#4A2511" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M-6,60 Q0,66 6,60" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />

              {/* Hand receiving the bananas */}
              <path d="M-30,105 L-70,105 L-70,120 L-25,120 Z" fill="#E88377" />
              <circle cx="-75" cy="112" r="11" fill="#F3BBA2" />

              {/* Woven Straw Basket */}
              <g transform="translate(-60, 140)">
                <path d="M-10,0 Q15,-20 40,0 L35,40 Q15,50 -5,40 Z" fill="#C29B63" stroke="#8A6533" strokeWidth="3" />
                <path d="M0,0 Q15,-25 30,0" fill="none" stroke="#8A6533" strokeWidth="3" />
              </g>

              {/* Little Child Standing Beside Mother */}
              <g transform="translate(-40, 160)">
                <circle cx="0" cy="0" r="14" fill="#F3BBA2" />
                <path d="M-12,12 L12,12 L18,120 L-18,120 Z" fill="#0284C7" />
                <circle cx="-4" cy="-2" r="2" fill="#331A0C" />
                <circle cx="4" cy="-2" r="2" fill="#331A0C" />
                <path d="M-3,5 Q0,8 3,5" fill="none" stroke="#331A0C" strokeWidth="1.5" />
              </g>
            </g>

            {/* FOREGROUND FRUIT STALL (Heaped Pomegranates & Mangoes) */}
            <g transform="translate(680, 430)">
              {/* Wooden Stall Table */}
              <polygon points="-220,10 240,0 240,170 -220,170" fill="#54301B" filter="url(#softShadow)" />
              <polygon points="-230,10 240,0 230,-15 -240,-5" fill="#784628" />

              {/* Heaped Vibrant Red Pomegranates (Ruby Gloss) */}
              <circle cx="-40" cy="-30" r="28" fill="url(#pomegranateGrad)" />
              <circle cx="-10" cy="-45" r="30" fill="url(#pomegranateGrad)" />
              <circle cx="20" cy="-35" r="29" fill="url(#pomegranateGrad)" />
              <circle cx="-70" cy="-15" r="27" fill="url(#pomegranateGrad)" />
              <circle cx="-25" cy="-10" r="32" fill="url(#pomegranateGrad)" />
              <circle cx="15" cy="-10" r="31" fill="url(#pomegranateGrad)" />
              <circle cx="55" cy="-20" r="26" fill="url(#pomegranateGrad)" />
              <circle cx="-50" cy="15" r="28" fill="url(#pomegranateGrad)" />
              <circle cx="-5" cy="20" r="30" fill="url(#pomegranateGrad)" />
              <circle cx="40" cy="15" r="29" fill="url(#pomegranateGrad)" />

              {/* Crown calyx details on pomegranates */}
              {[-40, -10, 20, -25, 15, -5].map((x, idx) => (
                <polygon
                  key={idx}
                  points={`${x},${-35 + idx * 8} ${x - 4},${-42 + idx * 8} ${x + 4},${-42 + idx * 8}`}
                  fill="#881337"
                />
              ))}

              {/* Golden Mangoes & Citrus beside pomegranates */}
              <ellipse cx="90" cy="20" rx="24" ry="18" fill="#EAB308" transform="rotate(25 90 20)" />
              <ellipse cx="120" cy="15" rx="22" ry="16" fill="#F59E0B" transform="rotate(-15 120 15)" />
              <ellipse cx="105" cy="-10" rx="20" ry="15" fill="#84CC16" transform="rotate(10 105 -10)" />
            </g>
          </svg>
        )}

        {/* Ambient Market Bottom Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto z-20">
          <div className="bg-[#031E15]/95 backdrop-blur-md px-3.5 sm:px-4 py-2 rounded-2xl border border-emerald-500/40 text-white text-xs font-medium flex items-center gap-2.5 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-urdu text-amber-300 text-sm">منصفانہ نرخ • باوقار روزگار</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hidden sm:inline text-emerald-300 font-mono text-xs">VRF 2026 Sovereign Verified</span>
          </div>

          <button
            onClick={handlePlayVoice}
            title="Listen to Report Audio Briefing"
            className="w-9 h-9 rounded-full bg-[#E3A82B] text-[#04231A] hover:bg-[#F3B740] flex items-center justify-center shadow-xl transition-all active:scale-90 hover:scale-105"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Study Resolution Modal */}
      {showDetailModal && (
        <div 
          onClick={() => setShowDetailModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#04231A] text-white border-2 border-[#E3A82B] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-fadeUp"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1A774B]">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-900 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-xs">
                  REPORT CP-26-8841
                </span>
                <span className="bg-[#178A52] text-white text-xs font-extrabold px-3 py-1 rounded-full">
                  ✓ Resolved in 41 min
                </span>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-[#083825] border border-[#178A52]/60 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[#D4E8DC]/70">Location:</span>
                  <span className="font-bold text-white">Raja Bazaar, Rawalpindi (Zone-A)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D4E8DC]/70">Audited Commodity:</span>
                  <span className="font-bold text-amber-300">Fresh Bananas & Seasonal Pomegranates</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D4E8DC]/70">Official DC Rate:</span>
                  <span className="font-mono font-bold text-emerald-400">Rs. 110 / Dozen (Enforced)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D4E8DC]/70">Citizen Privacy:</span>
                  <span className="font-bold text-sky-300">100% Encrypted & Anonymous</span>
                </div>
              </div>

              <p className="text-xs text-[#DCEFE4] leading-relaxed font-urdu">
                پلیٹ فارم کے ذریعے موصول ہونے والی اطلاع پر فیلڈ ٹیم نے 41 منٹ کے اندر معائنہ کر کے سرکاری نرخ نامہ آویزاں کروایا اور صارف کے حقوق بحال کیے۔
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  if (onExploreReport) onExploreReport();
                }}
                className="bg-[#E3A82B] hover:bg-[#F3B740] text-[#04231A] font-extrabold text-xs px-5 py-2.5 rounded-full shadow"
              >
                Explore Full Platform →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
