import React, { useState, useEffect } from 'react';
import { 
  User, Store, ShieldCheck, Building2, Crown, Fingerprint, 
  ArrowRight, Sparkles, AlertCircle, Clock, Check, Eye, Lock,
  HelpCircle, Compass, Shield, ChevronRight, Activity, Award,
  CheckCircle2, Globe, HeartHandshake, MapPin
} from 'lucide-react';
import { Role, UserRole, Language } from '../types';
import { Emblem } from './Emblem';
import { BrandLogo } from './BrandLogo';
import { MarketHeroArtwork } from './MarketHeroArtwork';
import { speechService } from '../lib/audio';

interface LoginScreenProps {
  onLogin: (role: UserRole, userName: string) => void;
  lang: Language;
  onToggleLang: () => void;
  onBackToWelcome?: () => void;
  onOpenIntroTour?: () => void;
  onOpenCinematicIntro?: () => void;
  onOpenAlignModal?: (onComplete?: () => void) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  lang,
  onToggleLang,
  onBackToWelcome,
  onOpenIntroTour,
  onOpenCinematicIntro,
  onOpenAlignModal,
}) => {
  const isUrdu = lang === 'ur';

  // Display mode: 'console' (Sovereign Login Split View matching video 0:00) or 'landing' (Public Platform Overview)
  const [viewMode, setViewMode] = useState<'console' | 'landing'>('console');

  // Role Selection State
  const [selectedRole, setSelectedRole] = useState<Role>('government');
  const [officerName, setOfficerName] = useState('Hamza Siddiqui');
  const [officerId, setOfficerId] = useState('GOV-2026');
  const [district, setDistrict] = useState('Karachi South');
  const [designation, setDesignation] = useState('Deputy Commissioner (DC)');

  // Biometric Modal State
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanVerified, setScanVerified] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [savedSession, setSavedSession] = useState<{ role: Role; name: string } | null>(null);

  // Check saved session in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cp_user');
      if (saved) {
        setSavedSession(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read saved session:', e);
    }
  }, []);

  // Cooldown timer interval
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownSeconds]);

  // Set default form values when role changes
  useEffect(() => {
    if (selectedRole === 'citizen') {
      setOfficerName('Tariq Mehmood');
      setOfficerId('CTZ-8912');
      setDistrict('Rawalpindi');
      setDesignation('Verified Citizen Shopper');
    } else if (selectedRole === 'vendor') {
      setOfficerName('Muhammad Tariq Khan');
      setOfficerId('VRF-STALL-14');
      setDistrict('Karachi South');
      setDesignation('Licensed Fruit & Vegetable Vendor');
    } else if (selectedRole === 'inspector') {
      setOfficerName('Insp. Asim Mehmood');
      setOfficerId('PERA-104');
      setDistrict('Lahore Central');
      setDesignation('PERA Price Magistrate');
    } else if (selectedRole === 'government') {
      setOfficerName('Hamza Siddiqui');
      setOfficerId('GOV-2026');
      setDistrict('Karachi South');
      setDesignation('Deputy Commissioner (DC)');
    } else if (selectedRole === 'fakhar_master') {
      setOfficerName('Fakhar Mushtaq');
      setOfficerId('VRF-LEAD-001');
      setDistrict('National Oversight');
      setDesignation('Visionary Lead & Master Architect');
    }
  }, [selectedRole]);

  const handleDemoLogin = (role: Role, customUserName?: string) => {
    if (cooldownSeconds > 0) return;

    let finalName = customUserName || officerName.trim();
    if (!finalName) {
      if (role === 'fakhar_master') finalName = 'Fakhar Mushtaq (Vision Lead)';
      else if (role === 'citizen') finalName = 'Tariq Mehmood (Citizen)';
      else if (role === 'vendor') finalName = 'Muhammad Tariq Khan (Stall RB-14)';
      else if (role === 'inspector') finalName = 'Insp. Asim Mehmood (PERA-104)';
      else finalName = 'Hamza Siddiqui (DC)';
    }

    try {
      localStorage.setItem('cp_user', JSON.stringify({ role, name: finalName, loggedAt: new Date().toISOString() }));
    } catch (e) {
      console.warn(e);
    }

    onLogin(role, finalName);
  };

  const handleStartBiometric = () => {
    if (cooldownSeconds > 0) return;
    setBiometricModalOpen(true);
    setIsScanning(true);
    setScanProgress(0);
    setScanVerified(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      if (current >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setIsScanning(false);
        setScanVerified(true);
        setTimeout(() => {
          setBiometricModalOpen(false);
          handleDemoLogin(selectedRole);
        }, 700);
      } else {
        setScanProgress(current);
      }
    }, 100);
  };

  const handleFillDemoCreds = () => {
    if (selectedRole === 'citizen') {
      setOfficerName('Tariq Mehmood');
      setOfficerId('CTZ-8912');
      setDistrict('Rawalpindi');
      setDesignation('Verified Citizen Shopper');
    } else if (selectedRole === 'vendor') {
      setOfficerName('Muhammad Tariq Khan');
      setOfficerId('VRF-STALL-14');
      setDistrict('Karachi South');
      setDesignation('Licensed Fruit & Vegetable Vendor');
    } else if (selectedRole === 'inspector') {
      setOfficerName('Insp. Asim Mehmood');
      setOfficerId('PERA-104');
      setDistrict('Lahore Central');
      setDesignation('PERA Price Magistrate');
    } else if (selectedRole === 'government') {
      setOfficerName('Hamza Siddiqui');
      setOfficerId('GOV-2026');
      setDistrict('Karachi South');
      setDesignation('Deputy Commissioner (DC)');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#132A21] flex flex-col justify-between relative selection:bg-[#178A52] selection:text-white font-sans">
      {/* ========================================================================= */}
      {/* MODE 1: PUBLIC PLATFORM HERO OVERVIEW (Matching Video 0:02 - 0:13)       */}
      {/* ========================================================================= */}
      {viewMode === 'landing' ? (
        <div className="flex-1 flex flex-col animate-fadeIn">
          {/* Public Top Navbar (Matching Screenshot) */}
          <header className="px-6 sm:px-12 py-3.5 flex items-center justify-between z-20 bg-[#F6F4EE] border-b border-[#E8E5DC] sticky top-0 shadow-xs">
            <BrandLogo 
              variant="light" 
              size="md" 
              showSubtitle={true}
              subtitleText="VRF 2026 • Secure Sovereign Console"
            />

            <div className="flex items-center gap-2 sm:gap-3">
              {onBackToWelcome && (
                <button
                  onClick={onBackToWelcome}
                  className="bg-white hover:bg-slate-100 text-[#04231A] border border-[#178A52]/30 font-sora font-bold text-xs px-3.5 py-2 rounded-full shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  title="Return to Welcome Screen"
                >
                  <span>←</span>
                  <span className="hidden sm:inline">{isUrdu ? 'ہوم پیج' : 'Welcome'}</span>
                </button>
              )}
              <button
                id="btn-enter-platform-top"
                onClick={() => setViewMode('console')}
                className="bg-[#0B4A31] hover:bg-[#178A52] text-white font-sora font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Enter Platform</span>
                <span className="text-white text-base">→</span>
              </button>
            </div>
          </header>

          {/* Hero Section (Matching Screenshot) */}
          <section className="bg-[#04231A] text-white px-6 sm:px-12 py-12 sm:py-16 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#22C55E_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left Hero Copy */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 bg-[#083825]/90 border border-[#178A52]/50 px-3.5 py-1 rounded-full text-xs text-[#4ADE80] font-mono font-bold tracking-wide shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <span>AI-POWERED SMART GOVERNANCE • VRF 2026</span>
                </div>

                <h1 className="font-sora font-extrabold text-4xl sm:text-5xl lg:text-[56px] text-white leading-[1.1] tracking-tight">
                  One Platform. Four Partners. <br />
                  <span className="text-[#E3A82B] block mt-1">A Dignified Economy.</span>
                </h1>

                <p className="text-sm sm:text-base text-[#D4E8DC] font-normal leading-relaxed max-w-xl">
                  Citizens, vendors, PERA inspectors and government institutions working as trusted partners — transforming transparency into trust, accountability into action, and data into better public services for Pakistan's 10 million+ street-market livelihoods.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    id="btn-login-console-hero"
                    onClick={() => setViewMode('console')}
                    className="bg-[#E3A82B] hover:bg-[#F3B740] text-[#04231A] font-sora font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-xl transition-all active:scale-95"
                  >
                    <span>Login to Console — لاگ اِن</span>
                  </button>

                  <button
                    id="btn-try-fakhar-demo-hero"
                    onClick={() => handleDemoLogin('fakhar_master', 'Fakhar Mushtaq (Vision Lead)')}
                    className="bg-[#083825]/80 hover:bg-[#0B4A31] text-white font-sora font-bold text-sm sm:text-base px-6 py-3.5 rounded-full border border-[#1A774B] shadow-md flex items-center gap-2 transition-all active:scale-95"
                  >
                    <span>Try Fakhar Demo</span>
                    <span className="text-white text-base">→</span>
                  </button>
                </div>
              </div>

              {/* Right Hero Market Artwork & Resolution Visual */}
              <div className="lg:col-span-5 relative">
                <MarketHeroArtwork 
                  showBadge={false}
                  onExploreReport={() => setViewMode('console')}
                />
              </div>
            </div>
          </section>

          {/* Role-Based Ecosystem Section */}
          <section className="px-6 sm:px-12 py-12 max-w-6xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-extrabold text-[#178A52] uppercase tracking-widest font-mono">
                ROLE-BASED ECOSYSTEM
              </span>
              <h2 className="font-sora font-extrabold text-2xl sm:text-4xl text-[#04231A]">
                Four consoles. One connected truth.
              </h2>
            </div>

            {/* 4 Consoles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => { setSelectedRole('citizen'); setViewMode('console'); }}
                className="cursor-pointer bg-white rounded-3xl p-6 border border-[#E3E0D5] hover:border-[#178A52] shadow-sm hover:shadow-xl transition-all space-y-3 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF5EF] text-[#178A52] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6" />
                    </div>
                    <span className="font-urdu text-xs text-slate-500">شہری</span>
                  </div>
                  <h3 className="font-sora font-bold text-lg text-[#04231A]">Citizen Shopper</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Daily DC rates, AI overpricing reports, certified green vendor directories.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-[#178A52] group-hover:translate-x-1 transition-transform">
                  <span>Enter Citizen Portal →</span>
                </div>
              </div>

              <div 
                onClick={() => { setSelectedRole('vendor'); setViewMode('console'); }}
                className="cursor-pointer bg-white rounded-3xl p-6 border border-[#E3E0D5] hover:border-[#E3A82B] shadow-sm hover:shadow-xl transition-all space-y-3 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FCF6E9] text-[#E3A82B] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Store className="w-6 h-6" />
                    </div>
                    <span className="font-urdu text-xs text-slate-500">دکاندار</span>
                  </div>
                  <h3 className="font-sora font-bold text-lg text-[#04231A]">Vendor Partner</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Dynamic QR licenses, peak-hour slots, 0-10 compliance scoring, waste rewards.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-[#E3A82B] group-hover:translate-x-1 transition-transform">
                  <span>Enter Vendor Hub →</span>
                </div>
              </div>

              <div 
                onClick={() => { setSelectedRole('inspector'); setViewMode('console'); }}
                className="cursor-pointer bg-white rounded-3xl p-6 border border-[#E3E0D5] hover:border-[#3D7EA6] shadow-sm hover:shadow-xl transition-all space-y-3 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EBF3F8] text-[#3D7EA6] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="font-urdu text-xs text-slate-500">انسپکٹر</span>
                  </div>
                  <h3 className="font-sora font-bold text-lg text-[#04231A]">PERA Inspector</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    AI-assisted scanning, geo-fenced verification, localized digital citations.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-[#3D7EA6] group-hover:translate-x-1 transition-transform">
                  <span>Enter Inspector App →</span>
                </div>
              </div>

              <div 
                onClick={() => { setSelectedRole('government'); setViewMode('console'); }}
                className="cursor-pointer bg-white rounded-3xl p-6 border border-[#E3E0D5] hover:border-[#0B4A31] shadow-sm hover:shadow-xl transition-all space-y-3 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF5EF] text-[#04231A] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="font-urdu text-xs text-slate-500">حکومت</span>
                  </div>
                  <h3 className="font-sora font-bold text-lg text-[#04231A]">Gov Command</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Real-time market intelligence, heatmaps, dispatch workflows for officials.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-[#04231A] group-hover:translate-x-1 transition-transform">
                  <span>Enter Gov Command →</span>
                </div>
              </div>
            </div>
          </section>

          {/* The Impact & Vision Section */}
          <section className="bg-[#04231A] text-white px-6 sm:px-12 py-12 sm:py-14 border-t border-[#178A52]">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4 text-left">
                <span className="text-xs font-mono font-bold text-[#E3A82B] uppercase tracking-widest">
                  THE IMPACT
                </span>
                <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
                  From chaotic friction points to dignified economic engines
                </h2>
                <p className="text-xs sm:text-sm text-[#DCEFE4]/80 leading-relaxed">
                  Powered by artificial intelligence, geospatial technologies, predictive analytics and real-time governance intelligence, Connected Pakistan transforms fragmented markets into transparent, accountable, citizen-centric ecosystems — designed for Pakistan and globally scalable worldwide.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setViewMode('console')}
                    className="bg-[#178A52] hover:bg-[#178A52]/90 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl border border-[#E3A82B] shadow-md flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span>Enter the Platform →</span>
                  </button>
                </div>
              </div>

              {/* Fakhar Mushtaq Vision Quote Card (Matching Video) */}
              <div className="lg:col-span-5 bg-[#0B4A31] border border-[#178A52] p-6 rounded-3xl space-y-4 shadow-xl">
                <p className="text-xs sm:text-sm text-white font-medium italic leading-relaxed">
                  "We are not policing the bazaar — we are partnering with it. When a vendor's dignity rises, the whole city rises with him."
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-[#178A52]">
                  <div className="w-10 h-10 rounded-2xl bg-[#E3A82B] text-[#04231A] font-black font-sora flex items-center justify-center text-sm shadow">
                    FM
                  </div>
                  <div>
                    <h4 className="font-sora font-bold text-sm text-white">Fakhar Mushtaq</h4>
                    <p className="text-xs text-[#E3A82B] font-mono">Visionary Lead — VRF 2026, Team Stronger-Together</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="px-6 py-4 bg-[#02140F] text-[#DCEFE4]/70 text-xs text-center border-t border-[#0B4A31]">
            <p>Vision of Fakhar Mushtaq designed by Team Stronger Together • Connected Pakistan VRF 2026</p>
          </footer>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: SOVEREIGN CONSOLE LOGIN SCREEN (Matching Video 0:00 & 0:14)      */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col justify-between animate-fadeIn">
          {/* Main Content Area: Split 2-Column Sovereign Gateway */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
            {/* Top Navigation: Return to Welcome Screen */}
            {onBackToWelcome && (
              <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                <button
                  onClick={onBackToWelcome}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0B4A31] hover:text-white bg-white hover:bg-[#178A52] px-4 py-2 rounded-full border border-[#178A52]/40 shadow-xs transition-all active:scale-95"
                >
                  <span>←</span>
                  <span>{isUrdu ? 'کنیکٹڈ پاکستان ہوم اسکرین پر واپس جائیں' : 'Return to Connected Pakistan Welcome Page'}</span>
                </button>

                <div className="text-[11px] font-mono font-bold text-[#5C6F63] hidden sm:block">
                  Vision of Fakhar Mushtaq • Team Stronger Together
                </div>
              </div>
            )}

            {/* Security Alert if Cooldown */}
            {cooldownSeconds > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-3 shadow-md">
                <Clock className="w-6 h-6 shrink-0 animate-spin text-rose-600" />
                <div>
                  <p className="font-bold text-sm font-urdu">سیکیورٹی الرٹ: بہت زیادہ کوششیں! براہ کرم انتظار کریں۔</p>
                  <p className="text-xs text-rose-700">
                    Security Lockout: Please wait <span className="font-mono font-bold text-rose-600">{cooldownSeconds}s</span> before retrying.
                  </p>
                </div>
              </div>
            )}

            {/* Split Gateway Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* LEFT COLUMN: Green Brand Box with Emblem & Sovereign Credentials (5 cols) */}
              <div className="lg:col-span-5 bg-[#04231A] rounded-3xl p-7 sm:p-8 border-2 border-[#E3A82B] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#178A52]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-5 relative z-10">
                  {/* Crest & Title Header */}
                  <BrandLogo 
                    variant="dark" 
                    size="lg" 
                    showSubtitle={true}
                    subtitleText="VRF 2026 • Secure Sovereign Console"
                  />

                  {/* Main Headline */}
                  <div className="space-y-2 pt-2">
                    <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                      Sign in as a <span className="text-[#E3A82B]">trusted partner</span> of the bazaar economy.
                    </h1>
                    <p className="text-sm font-urdu text-[#DCEFE4] leading-relaxed">
                      اپنا کردار منتخب کریں - شہری، دکاندار، انسپکٹر، یا سرکاری اہلکار
                    </p>
                  </div>

                  {/* Body Copy */}
                  <p className="text-xs text-[#DCEFE4]/80 leading-relaxed">
                    Role-based access on one intelligent ecosystem. Every login opens exactly the tools, data and duties of your role — powered by the Vendor Relationship Framework (VRF 2026), envisioned by Fakhar Mushtaq with Team Stronger-Together. Built for every Pakistani — باوقار نظام، خود مختار معیشت۔
                  </p>

                  {/* 3 Live Metric Counter Pills (Matching Video 0:00) */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="bg-[#0B4A31] p-2.5 rounded-2xl border border-[#178A52] shadow-sm">
                      <strong className="font-sora font-extrabold text-base sm:text-lg text-white block">10M+</strong>
                      <span className="text-[10px] text-[#DCEFE4]/80 font-medium">Livelihoods</span>
                    </div>
                    <div className="bg-[#0B4A31] p-2.5 rounded-2xl border border-[#178A52] shadow-sm">
                      <strong className="font-sora font-extrabold text-base sm:text-lg text-[#E3A82B] block">2,347</strong>
                      <span className="text-[10px] text-[#DCEFE4]/80 font-medium">Markets Live</span>
                    </div>
                    <div className="bg-[#0B4A31] p-2.5 rounded-2xl border border-[#178A52] shadow-sm">
                      <strong className="font-sora font-extrabold text-base sm:text-lg text-emerald-400 block">94.2%</strong>
                      <span className="text-[10px] text-[#DCEFE4]/80 font-medium">Resolution Rate</span>
                    </div>
                  </div>

                  {/* Security Verification Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[10px] bg-[#0B4A31] text-[#DCEFE4] px-2.5 py-1 rounded-lg border border-[#178A52] font-mono">
                      🔒 AES-256-GCM
                    </span>
                    <span className="text-[10px] bg-[#0B4A31] text-[#DCEFE4] px-2.5 py-1 rounded-lg border border-[#178A52] font-mono">
                      🛡️ TLS 1.3
                    </span>
                    <span className="text-[10px] bg-[#0B4A31] text-[#DCEFE4] px-2.5 py-1 rounded-lg border border-[#178A52] font-mono">
                      ✓ RBAC Enforced
                    </span>
                    <span className="text-[10px] bg-[#0B4A31] text-[#E3A82B] px-2.5 py-1 rounded-lg border border-[#178A52] font-mono">
                      ⚡ Biometric Ready
                    </span>
                  </div>
                </div>

                {/* Bottom Toggle to Public Overview */}
                <div className="pt-6 border-t border-[#178A52]/60 mt-6 flex items-center justify-between text-xs text-[#DCEFE4]/80">
                  <button
                    onClick={() => setViewMode('landing')}
                    className="hover:text-white flex items-center gap-1.5 text-xs text-[#E3A82B] font-bold"
                  >
                    <span>← View public platform overview</span>
                  </button>
                  <button
                    onClick={onToggleLang}
                    className="text-xs bg-[#0B4A31] hover:bg-[#178A52] text-white px-2.5 py-1 rounded-lg border border-[#178A52]"
                  >
                    {isUrdu ? 'English' : 'اردو'}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Role Selection & Credentials Form (7 cols) */}
              <div className="lg:col-span-7 bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 border border-[#E3E0D5] shadow-xl text-[#132A21] flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  {/* Top Role Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DC]">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-[#178A52] uppercase tracking-wider block">
                        SECURE ENTRY • ROLE-BASED SESSION
                      </span>
                      <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-[#04231A]">
                        Select your role
                      </h3>
                      <p className="text-xs text-slate-500 font-urdu mt-0.5">
                        فوری رسائی کے لیے اپنا کردار منتخب کریں یا نام درج کریں۔
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenIntroTour && (
                        <button
                          onClick={onOpenIntroTour}
                          className="text-xs bg-white hover:bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5"
                        >
                          <Compass className="w-3.5 h-3.5 text-[#178A52]" />
                          <span>{isUrdu ? 'پلیٹ فارم ٹور' : 'Platform Tour'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* MASTER BANNER: Fakhar Mushtaq Demo Full Access (Matching Video 0:00) */}
                  <div 
                    onClick={() => {
                      if (onOpenAlignModal) {
                        onOpenAlignModal(() => handleDemoLogin('fakhar_master', 'Fakhar Mushtaq (Vision Lead)'));
                      } else {
                        handleDemoLogin('fakhar_master', 'Fakhar Mushtaq (Vision Lead)');
                      }
                    }}
                    className="cursor-pointer bg-[#04231A] hover:bg-[#0B4A31] text-white rounded-2xl p-3.5 sm:p-4 border-2 border-[#E3A82B] shadow-lg flex items-center justify-between transition-all group hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E3A82B] text-[#04231A] font-black font-sora flex items-center justify-center text-sm shadow shrink-0">
                        FM
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-sora font-black text-sm sm:text-base text-white group-hover:text-[#E3A82B] transition-colors">
                            Fakhar Mushtaq — Demo Full Access
                          </h4>
                          <span className="text-[10px] bg-[#178A52] text-white px-2 py-0.5 rounded-full font-bold">
                            Master
                          </span>
                        </div>
                        <p className="text-xs text-[#DCEFE4]/90 font-medium">
                          Visionary Lead • navigate ALL four consoles instantly • <span className="font-urdu">مکمل رسائی</span>
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[#178A52] group-hover:bg-[#E3A82B] group-hover:text-[#04231A] text-white flex items-center justify-center transition-colors shadow">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Biometric Quick Entry Button */}
                  <button
                    onClick={handleStartBiometric}
                    disabled={cooldownSeconds > 0}
                    className="w-full bg-[#EAF5EF] hover:bg-[#D4EBDD] text-[#04231A] border-2 border-[#178A52] py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Fingerprint className="w-4 h-4 text-[#178A52]" />
                    <span>Biometric Quick Entry — Fingerprint / Face ID</span>
                    <span className="font-urdu text-[11px] text-slate-600">| بائیو میٹرک تصدیق شدہ اندراج</span>
                  </button>

                  {/* 4 Role Selection Cards in 1 Row (Matching Video 0:00) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {/* Citizen Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('citizen')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                        selectedRole === 'citizen'
                          ? 'bg-[#178A52] text-white border-[#178A52] shadow-md scale-105 font-bold'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-[#178A52]'
                      }`}
                    >
                      <User className={`w-5 h-5 mb-1 ${selectedRole === 'citizen' ? 'text-white' : 'text-[#178A52]'}`} />
                      <strong className="text-xs block font-sora">Citizen</strong>
                      <span className="text-[10px] opacity-80 font-urdu">شہری</span>
                    </button>

                    {/* Vendor Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('vendor')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                        selectedRole === 'vendor'
                          ? 'bg-[#E3A82B] text-[#04231A] border-[#E3A82B] shadow-md scale-105 font-black'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-[#E3A82B]'
                      }`}
                    >
                      <Store className={`w-5 h-5 mb-1 ${selectedRole === 'vendor' ? 'text-[#04231A]' : 'text-[#E3A82B]'}`} />
                      <strong className="text-xs block font-sora">Vendor</strong>
                      <span className="text-[10px] opacity-80 font-urdu">دکاندار</span>
                    </button>

                    {/* Inspector Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('inspector')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                        selectedRole === 'inspector'
                          ? 'bg-[#3D7EA6] text-white border-[#3D7EA6] shadow-md scale-105 font-bold'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-[#3D7EA6]'
                      }`}
                    >
                      <ShieldCheck className={`w-5 h-5 mb-1 ${selectedRole === 'inspector' ? 'text-white' : 'text-[#3D7EA6]'}`} />
                      <strong className="text-xs block font-sora">Inspector</strong>
                      <span className="text-[10px] opacity-80 font-urdu">انسپکٹر</span>
                    </button>

                    {/* Gov Official Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('government')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                        selectedRole === 'government'
                          ? 'bg-[#04231A] text-white border-[#04231A] shadow-md scale-105 font-bold'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-[#04231A]'
                      }`}
                    >
                      <Building2 className={`w-5 h-5 mb-1 ${selectedRole === 'government' ? 'text-[#E3A82B]' : 'text-[#04231A]'}`} />
                      <strong className="text-xs block font-sora">Gov Official</strong>
                      <span className="text-[10px] opacity-80 font-urdu">اہلکار</span>
                    </button>
                  </div>

                  {/* Form Inputs Matching Selected Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {selectedRole === 'government' ? 'OFFICER NAME (required)' : selectedRole === 'vendor' ? 'VENDOR NAME' : selectedRole === 'inspector' ? 'INSPECTOR NAME' : 'CITIZEN NAME'}
                      </label>
                      <input
                        type="text"
                        value={officerName}
                        onChange={(e) => setOfficerName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#178A52] focus:ring-1 focus:ring-[#178A52]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {selectedRole === 'government' ? 'OFFICER ID (optional)' : selectedRole === 'vendor' ? 'STALL / QR ID' : selectedRole === 'inspector' ? 'PERA BADGE NO.' : 'CNIC / REFERENCE ID'}
                      </label>
                      <input
                        type="text"
                        value={officerId}
                        onChange={(e) => setOfficerId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#178A52] focus:ring-1 focus:ring-[#178A52]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        DISTRICT • ضلع
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#178A52]"
                      >
                        <option value="Karachi South">Karachi South (صدر، کلفٹن، ایمپریس)</option>
                        <option value="Rawalpindi">Rawalpindi (راجہ بازار، کمیٹی چوک)</option>
                        <option value="Lahore Central">Lahore Central (انارکلی، مال روڈ)</option>
                        <option value="Peshawar City">Peshawar City (قصہ خوانی)</option>
                        <option value="Quetta City">Quetta City (لیاقت بازار)</option>
                        <option value="Gilgit Hub">Gilgit Hub (این 35 بازار)</option>
                        <option value="Muzaffarabad">Muzaffarabad (مین بازار)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        DESIGNATION • عہدہ
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#178A52]"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons Row (Matching Video 0:00) */}
                <div className="pt-3 border-t border-[#ECE8DC] space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      id="btn-enter-command-dashboard"
                      onClick={() => handleDemoLogin(selectedRole)}
                      disabled={cooldownSeconds > 0}
                      className="w-full sm:flex-1 bg-[#178A52] hover:bg-[#0B4A31] text-white font-sora font-extrabold text-xs sm:text-sm py-3 px-6 rounded-2xl shadow-lg border border-[#E3A82B] flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4 text-[#E3A82B]" />
                      <span>
                        {selectedRole === 'government'
                          ? 'Enter Command Dashboard'
                          : selectedRole === 'vendor'
                          ? 'Enter Vendor Hub'
                          : selectedRole === 'inspector'
                          ? 'Enter Inspector App'
                          : 'Enter Citizen Portal'}
                      </span>
                    </button>

                    <button
                      id="btn-quick-demo-entry"
                      onClick={() => handleDemoLogin(selectedRole)}
                      disabled={cooldownSeconds > 0}
                      className="w-full sm:w-auto bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] font-sora font-extrabold text-xs py-3 px-5 rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <span>Demo Entry</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFillDemoCreds}
                      className="text-xs text-slate-500 hover:text-slate-900 underline font-medium"
                    >
                      Fill demo credentials
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      🔒 <span>End-to-end encrypted • Citizen identity anonymized in reports</span>
                    </span>
                    <button
                      onClick={() => setViewMode('landing')}
                      className="text-[#178A52] font-bold hover:underline"
                    >
                      Overview page →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Sovereign Footer */}
          <footer className="px-6 py-3.5 border-t border-[#E3E0D5] bg-white text-center text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              Designed by Dreamer's Lab vision of <strong className="text-[#178A52]">Fakhar Mushtaq</strong> • <strong className="text-[#178A52]">Team Stronger Together</strong> • VRF 2026
            </p>
          </footer>
        </div>
      )}

      {/* Biometric Simulated Sensor Modal */}
      {biometricModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#04231A] border-2 border-[#E3A82B] rounded-3xl p-7 max-w-sm w-full text-center text-white shadow-2xl animate-fadeUp">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0B4A31] border border-[#178A52] flex items-center justify-center mb-4 relative overflow-hidden shadow-inner">
              <Fingerprint className={`w-12 h-12 ${scanVerified ? 'text-[#E3A82B]' : 'text-emerald-400'} transition-colors`} />
              {isScanning && (
                <div
                  className="absolute left-0 right-0 h-1 bg-[#E3A82B] shadow-[0_0_12px_#E3A82B] transition-all duration-100"
                  style={{ top: `${scanProgress}%` }}
                />
              )}
            </div>

            <h3 className="font-sora font-extrabold text-lg text-white mb-1">
              {scanVerified ? 'Biometric Verified!' : 'Scanning Biometric Sensor...'}
            </h3>
            <p className="text-xs text-[#DCEFE4] font-urdu mb-4">
              {scanVerified
                ? 'شناخت کی تصدیق ہو گئی، کنسول میں داخل ہو رہے ہیں'
                : 'براہ کرم فنگر پرنٹ یا چہرہ اسکینر کے سامنے رکھیں'}
            </p>

            <div className="w-full bg-[#0B4A31] h-2 rounded-full overflow-hidden border border-[#178A52]">
              <div
                className="bg-[#E3A82B] h-full transition-all duration-150"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-xs font-mono text-[#E3A82B] mt-2 font-bold">
              {scanProgress}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
