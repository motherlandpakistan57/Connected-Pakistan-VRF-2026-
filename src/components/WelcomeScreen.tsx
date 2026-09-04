import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Sparkles, Volume2, Globe, Shield, Store, 
  User, Building2, Crown, Compass, Play,
  Trees, MapPin, HeartHandshake, Mountain, Feather, Leaf
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { PakistanFlagEmblem } from './PakistanFlagEmblem';
import { speechService } from '../lib/audio';
import { triggerCelebration } from '../lib/celebration';

interface WelcomeScreenProps {
  onProceedToLogin: () => void;
  lang: Language;
  onToggleLang: () => void;
  onQuickRoleLogin?: (role: UserRole, userName: string) => void;
  onOpenVideoTour?: () => void;
}

interface ScenicLandscape {
  id: string;
  nameEn: string;
  nameUrdu: string;
  regionEn: string;
  regionUrdu: string;
  imageUrl: string;
  badge: string;
}

const PAKISTAN_SCENIC_LANDSCAPES: ScenicLandscape[] = [
  {
    id: 'swat',
    nameEn: 'Swat Emerald Pine Valleys',
    nameUrdu: 'سوات و کالام کی سرسبز وادیاں',
    regionEn: 'Khyber Pakhtunkhwa',
    regionUrdu: 'خیبر پختونخوا',
    imageUrl: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=2400&q=85',
    badge: 'Pine Valleys & Glacial Rivers',
  },
  {
    id: 'hunza',
    nameEn: 'Hunza & Karakoram Alpine Terraces',
    nameUrdu: 'ہنزہ و قراقرم کے سرسبز باغات',
    regionEn: 'Gilgit-Baltistan',
    regionUrdu: 'گلگت بلتستان',
    imageUrl: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=2400&q=85',
    badge: 'Apricot Terraces & 7000m Peaks',
  },
  {
    id: 'neelum',
    nameEn: 'Neelum River & Verdant Slopes',
    nameUrdu: 'دریائے نیلم و سرسبز جنگلات',
    regionEn: 'Azad Jammu & Kashmir',
    regionUrdu: 'آزاد جموں و کشمیر',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=2400&q=85',
    badge: 'Turquoise Rivers & Alpine Forests',
  },
  {
    id: 'margalla',
    nameEn: 'Margalla Pine Ridges & National Park',
    nameUrdu: 'مارگلہ کے سرسبز پائن سلسلے',
    regionEn: 'Islamabad Capital Territory',
    regionUrdu: 'اسلام آباد وفاقی دارالحکومت',
    imageUrl: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=2400&q=85',
    badge: 'Capital Forest Sanctuary',
  },
  {
    id: 'indus_punjab',
    nameEn: 'Indus Agricultural Fertile Plains',
    nameUrdu: 'وادی مہران و پنجاب کے سرسبز کھیت',
    regionEn: 'Punjab & Sindh Heartland',
    regionUrdu: 'پنجاب و سندھ',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=85',
    badge: 'Wheat & Rice Breadbasket',
  },
  {
    id: 'skardu',
    nameEn: 'Skardu Shangrila Lake & Deosai Plains',
    nameUrdu: 'سکردو جھیل و دیوسائی کے سرسبز میدان',
    regionEn: 'Baltistan Roof of the World',
    regionUrdu: 'بلتستان',
    imageUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=2400&q=85',
    badge: 'High-Altitude Wildflower Plains',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onProceedToLogin,
  lang,
  onToggleLang,
  onQuickRoleLogin,
  onOpenVideoTour,
}) => {
  const isUrdu = lang === 'ur';
  const [activeLandscapeIndex, setActiveLandscapeIndex] = useState(0);
  const [isWelcomingAudioPlaying, setIsWelcomingAudioPlaying] = useState(false);

  const currentLandscape = PAKISTAN_SCENIC_LANDSCAPES[activeLandscapeIndex];

  // Auto-cycle through landscapes slowly every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLandscapeIndex((prev) => (prev + 1) % PAKISTAN_SCENIC_LANDSCAPES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const handlePlayWelcomeGreeting = () => {
    setIsWelcomingAudioPlaying(true);
    speechService.playChime('complete');

    const speechText = isUrdu
      ? 'خوش آمدید! کنیکٹڈ پاکستان میں آپ کا استقبال ہے۔ وژن فخر مشتاق۔ پاکستان کے تمام ۲۴ کروڑ شہریوں، نوجوانوں، محنت کش دکانداروں، اور بزرگوں کو ایک پرچم تلے خوش آمدید کہتے ہیں۔'
      : 'Welcome to Connected Pakistan. Vision of Fakhar Mushtaq. Welcoming 240 million citizens, youth, hardworking street vendors, and families under one sovereign flag of justice and dignity.';

    speechService.speak(speechText, {
      lang: isUrdu ? 'ur' : 'en',
      onEnd: () => setIsWelcomingAudioPlaying(false),
      onError: () => setIsWelcomingAudioPlaying(false),
    });
  };

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between bg-[#021811] text-white selection:bg-[#178A52] selection:text-white ${isUrdu ? 'rtl font-urdu' : 'ltr'}`}>
      
      {/* CINEMATIC PAKISTANI AMBIENT NATURAL LANDSCAPE BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {PAKISTAN_SCENIC_LANDSCAPES.map((landscape, index) => (
          <div
            key={landscape.id}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out transform scale-105 ${
              index === activeLandscapeIndex ? 'opacity-30' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url('${landscape.imageUrl}')` }}
          />
        ))}

        {/* Dramatic Cinematic Vignette with Deep Emerald, Rich Green & Gold Radiance */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02130D]/95 via-[#031E15]/80 to-[#02110B]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(23,138,82,0.25)_0%,_transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(227,168,43,0.12)_0%,_transparent_55%)]" />
      </div>

      {/* TOPBAR: ISLAMIC REPUBLIC OF PAKISTAN EMBLEM & ESSENTIAL CONTROLS */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#178A52]/30 backdrop-blur-md bg-[#04231A]/60">
        <div className="flex items-center gap-3">
          <PakistanFlagEmblem size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sora font-extrabold text-xs sm:text-sm tracking-widest uppercase text-white">
                ISLAMIC REPUBLIC OF PAKISTAN
              </span>
              <span className="hidden sm:inline-block text-[10px] bg-[#E3A82B] text-[#04231A] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                VRF 2026
              </span>
            </div>
            <p className="text-[11px] text-[#DCEFE4]/80 font-mono">
              {isUrdu ? 'قومی ڈیجیٹل گورننس و شفافیت پلیٹ فارم' : 'National Sovereign Civic & Market Platform'}
            </p>
          </div>
        </div>

        {/* Language & Voice Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePlayWelcomeGreeting}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
              isWelcomingAudioPlaying
                ? 'bg-[#E3A82B] text-[#04231A] border-[#E3A82B] ring-2 ring-[#E3A82B]/50 animate-pulse'
                : 'bg-[#0B4A31]/80 hover:bg-[#178A52] text-[#DCEFE4] hover:text-white border-[#178A52]/50'
            }`}
            title="Audio Welcome Greeting"
          >
            <Volume2 className={`w-4 h-4 ${isWelcomingAudioPlaying ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">
              {isWelcomingAudioPlaying 
                ? (isUrdu ? 'آڈیو پیغام جاری...' : 'Playing...') 
                : (isUrdu ? 'خوش آمدید سنیں' : 'Welcome Audio')}
            </span>
          </button>

          {onOpenVideoTour && (
            <button
              onClick={onOpenVideoTour}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#0B4A31]/80 hover:bg-[#178A52] border border-[#178A52]/50 text-xs font-bold text-[#E3A82B] hover:text-white flex items-center gap-1.5 shadow transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">{isUrdu ? 'ویڈیو بریفنگ' : 'Video Tour'}</span>
            </button>
          )}

          <button
            onClick={onToggleLang}
            className="px-3 py-1.5 rounded-xl bg-[#0B4A31]/90 hover:bg-[#178A52] text-white border border-[#E3A82B]/60 text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#E3A82B]" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* GRAND CINEMATIC CENTER: WELCOMING THE ENTIRE NATION                      */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 md:py-20 flex flex-col justify-center items-center text-center">
        
        {/* Glowing National Welcome Crown Badge */}
        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-[#042A1D]/90 border border-[#178A52] text-[#E3A82B] text-xs font-semibold mb-6 shadow-2xl backdrop-blur-xl animate-title-fade">
          <Sparkles className="w-4 h-4 text-[#E3A82B] animate-pulse" />
          <span className="tracking-widest uppercase font-mono text-[11px] sm:text-xs font-bold">
            WELCOMING 240+ MILLION CITIZENS OF PAKISTAN
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span className="text-white text-[11px] font-medium hidden sm:inline">
            One Nation • One Dignity
          </span>
        </div>

        {/* GRAND CINEMATIC MAIN TITLE WITH CSS FADE-IN */}
        <div className="space-y-4 mb-8 sm:mb-10 animate-title-fade">
          <h1 className="font-sora font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white drop-shadow-[0_12px_45px_rgba(0,0,0,0.95)]">
            Connected{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] via-[#4ADE80] to-[#E3A82B] drop-shadow-[0_0_40px_rgba(34,197,94,0.4)]">
              Pakistan
            </span>
          </h1>

          <p className="font-sora font-semibold text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase text-emerald-300 max-w-2xl mx-auto pt-2">
            National Civic Empowerment, Price Integrity & Vendor Dignity Platform
          </p>
        </div>

        {/* CINEMATIC PRIMARY CALL TO ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10 animate-vision-fade">
          <button
            onClick={() => {
              triggerCelebration('entry');
              onProceedToLogin();
            }}
            className="w-full sm:w-auto px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-[#178A52] via-[#1E9E60] to-[#126E40] hover:from-[#1F9D60] hover:to-[#178A52] text-white font-sora font-extrabold text-base sm:text-lg shadow-[0_0_40px_rgba(23,138,82,0.7)] hover:shadow-[0_0_60px_rgba(23,138,82,0.95)] border-2 border-[#E3A82B] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 group"
          >
            <span>Enter Connected Pakistan</span>
            <ArrowRight className="w-5 h-5 text-[#E3A82B] group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* QUICK EVALUATOR ROLES SHORTCUT */}
        {onQuickRoleLogin && (
          <div className="w-full max-w-3xl pt-6 border-t border-[#178A52]/30">
            <span className="text-[11px] font-mono text-[#E3A82B] uppercase tracking-wider block mb-2.5 font-bold">
              Direct Evaluator Role Portals:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <button
                onClick={() => {
                  triggerCelebration('entry');
                  onQuickRoleLogin('citizen', 'Ahmed Ali Khan');
                }}
                className="p-2.5 rounded-xl bg-[#04231A]/90 hover:bg-[#178A52]/40 border border-[#178A52]/40 hover:border-[#E3A82B] text-left transition-all flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#178A52]/30 text-[#E3A82B] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-bold block text-white text-[11px]">Citizen</span>
                  <span className="text-[9px] text-[#DCEFE4]/70">Reports & Rates</span>
                </div>
              </button>

              <button
                onClick={() => {
                  triggerCelebration('entry');
                  onQuickRoleLogin('vendor', 'Muhammad Bashir');
                }}
                className="p-2.5 rounded-xl bg-[#04231A]/90 hover:bg-[#178A52]/40 border border-[#178A52]/40 hover:border-[#E3A82B] text-left transition-all flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#178A52]/30 text-[#E3A82B] flex items-center justify-center shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-bold block text-white text-[11px]">Vendor</span>
                  <span className="text-[9px] text-[#DCEFE4]/70">QR & Permit</span>
                </div>
              </button>

              <button
                onClick={() => {
                  triggerCelebration('entry');
                  onQuickRoleLogin('inspector', 'Inspector Sajid Mehmood');
                }}
                className="p-2.5 rounded-xl bg-[#04231A]/90 hover:bg-[#178A52]/40 border border-[#178A52]/40 hover:border-[#E3A82B] text-left transition-all flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#178A52]/30 text-[#E3A82B] flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-bold block text-white text-[11px]">Inspector</span>
                  <span className="text-[9px] text-[#DCEFE4]/70">Radar Patrol</span>
                </div>
              </button>

              <button
                onClick={() => {
                  triggerCelebration('entry');
                  onQuickRoleLogin('government', 'Deputy Commissioner Hamza Siddiqui');
                }}
                className="p-2.5 rounded-xl bg-[#04231A]/90 hover:bg-[#178A52]/40 border border-[#178A52]/40 hover:border-[#E3A82B] text-left transition-all flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#178A52]/30 text-[#E3A82B] flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-bold block text-white text-[11px]">Government</span>
                  <span className="text-[9px] text-[#DCEFE4]/70">DC Command</span>
                </div>
              </button>

              <button
                onClick={() => {
                  triggerCelebration('entry');
                  onQuickRoleLogin('fakhar_master', 'Fakhar Mushtaq (Visionary)');
                }}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#0B4A31] to-[#04231A] hover:border-[#E3A82B] border border-[#E3A82B] text-left transition-all flex items-center gap-2 group col-span-2 sm:col-span-1 shadow"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E3A82B] text-[#04231A] flex items-center justify-center shrink-0">
                  <Crown className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-bold block text-[#E3A82B] text-[11px]">Fakhar Mushtaq</span>
                  <span className="text-[9px] text-[#DCEFE4]/70">Full Access</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM SECTION & FOOTER: VISION OF FAKHAR MUSHTAQ & SCENIC SELECTION */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-4 border-t border-[#178A52]/40 backdrop-blur-lg bg-[#04231A]/95 flex flex-col gap-3 text-xs text-[#DCEFE4]/90">
        
        {/* DEDICATED PROMINENT VISION ATTRIBUTION BANNER */}
        <div className="w-full max-w-3xl mx-auto py-2.5 px-4 rounded-2xl bg-[#021811]/90 border border-[#E3A82B]/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2.5 justify-center">
            <Sparkles className="w-4 h-4 text-[#E3A82B] animate-pulse shrink-0" />
            <div>
              <span className="font-sora font-extrabold text-xs sm:text-sm text-white tracking-wide block">
                Vision of Fakhar Mushtaq • Designed by Team Stronger Together
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-[#DCEFE4]/80">
            <span className="px-2 py-0.5 rounded bg-[#178A52]/40 border border-[#178A52] text-white">
              VRF Act 2026
            </span>
            <span className="text-emerald-300">
              National Transparency Initiative
            </span>
          </div>
        </div>

        {/* BOTTOM METADATA & SCENIC SWITCHER PILLS */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#178A52]/20">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="text-[10px] font-mono text-[#E3A82B] uppercase tracking-wider font-bold">
              Pakistan Scenery:
            </span>
            {PAKISTAN_SCENIC_LANDSCAPES.map((landscape, index) => (
              <button
                key={landscape.id}
                onClick={() => setActiveLandscapeIndex(index)}
                className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-semibold transition-all flex items-center gap-1 ${
                  index === activeLandscapeIndex
                    ? 'bg-[#178A52] text-white ring-1 ring-[#E3A82B]'
                    : 'bg-[#04231A] text-[#DCEFE4]/70 hover:text-white'
                }`}
              >
                <span>{landscape.id.toUpperCase()}</span>
              </button>
            ))}
          </div>

          <div className="text-center sm:text-right font-medium text-[11px] text-[#DCEFE4]/90">
            <span className="text-white font-bold">Connected Pakistan</span> •{' '}
            <span className="text-[#E3A82B] font-bold">Designed by Dreamer's Lab vision of Fakhar Mushtaq</span> •{' '}
            <span className="text-emerald-300 font-bold">Team Stronger Together</span>
          </div>
        </div>
      </footer>
    </div>
  );
};