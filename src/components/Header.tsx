import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, Bell, Volume2, VolumeX, Globe, 
  Sparkles, ChevronDown, User, LogOut,
  MapPin, Check, Mic, HelpCircle, Edit3, Zap,
  Lock, ShieldAlert, ArrowRight, Store, FileSpreadsheet
} from 'lucide-react';
import { Role, Language, DCRateItem, VendorProfile } from '../types';
import { Emblem } from './Emblem';
import { BrandLogo } from './BrandLogo';
import { PakClock } from './PakClock';
import { speechService } from '../lib/audio';

interface HeaderProps {
  currentRole: Role;
  onRoleChange?: (role: Role) => void;
  onSwitchRole?: (role: Role) => void;
  lang: Language;
  onToggleLang: () => void;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  onOpenVoiceSearch?: () => void;
  onOpenAIGuide?: () => void;
  onOpenIntro?: () => void;
  onOpenTour?: () => void;
  onOpenAlignModal?: () => void;
  onOpenMasterSuite?: () => void;
  onOpenLocate?: (placeName?: string) => void;
  onOpenCitySlotsMap?: () => void;
  onOpenNationalMap?: () => void;
  onOpenCinematicIntro?: () => void;
  onOpenDataEditor?: () => void;
  onOpenVendorAllotment?: (vendorId?: string) => void;
  onOpenUserProfile?: () => void;
  onSelectNav?: (tab: string) => void;
  dcRates?: DCRateItem[];
  vendors?: VendorProfile[];
  onLogout: () => void;
  unreadAlertCount?: number;
  onOpenAlerts?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  userName?: string;
  userProfileCity?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onSwitchRole,
  lang,
  onToggleLang,
  voiceEnabled = true,
  onToggleVoice = () => {},
  onOpenVoiceSearch = () => {},
  onOpenAIGuide = () => {},
  onOpenIntro,
  onOpenTour,
  onOpenAlignModal = () => {},
  onOpenMasterSuite = () => {},
  onOpenLocate = () => {},
  onOpenCitySlotsMap = () => {},
  onOpenNationalMap = () => {},
  onOpenCinematicIntro = () => {},
  onOpenDataEditor = () => {},
  onOpenVendorAllotment,
  onOpenUserProfile,
  onSelectNav = (_tab?: string) => {},
  dcRates = [],
  vendors = [],
  onLogout,
  unreadAlertCount = 0,
  onOpenAlerts = () => {},
  sidebarOpen = false,
  onToggleSidebar = () => {},
  userName = 'احمد علی خان (Ahmed Ali Khan)',
  userProfileCity = 'isb',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [presenceCount, setPresenceCount] = useState(14892);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleRoleSelect = (role: Role) => {
    if (onRoleChange) onRoleChange(role);
    if (onSwitchRole) onSwitchRole(role);
  };

  const handleTourTrigger = () => {
    if (onOpenTour) onOpenTour();
    else if (onOpenIntro) onOpenIntro();
  };

  const isUrdu = lang === 'ur';

  // Outside click listener for quick switch role dropdown & user menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (roleDropdownOpen || userMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [roleDropdownOpen, userMenuOpen]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setRoleDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Presence subtle fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPresenceCount(prev => prev + Math.floor(Math.random() * 7) - 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<Role, { ur: string; en: string; icon: string; descUr: string; descEn: string; badgeStyle: string }> = {
    citizen: { 
      ur: 'شہری کنسول', 
      en: 'Citizen Console', 
      icon: '👤',
      descUr: 'سرکاری ڈی سی نرخ، گمنام رپورٹنگ، گرین دکاندار، انعامات',
      descEn: 'Official DC rates, anonymous reports, green vendors & civic points',
      badgeStyle: 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600 shadow-emerald-700/20'
    },
    vendor: { 
      ur: 'ریڑھی بان و دکاندار', 
      en: 'Vendor Console', 
      icon: '🏪',
      descUr: 'کیو آر بیج، 15 میٹر جیو فینس ریڈار، سلاٹ ریزرویشن، مائیکرو پے',
      descEn: 'Digital QR license, 15m geofence radar, stall shift, MicroPay credit',
      badgeStyle: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 shadow-amber-600/20'
    },
    inspector: { 
      ur: 'پیرہ مجسٹریٹ / انسپکٹر', 
      en: 'PERA Inspector', 
      icon: '🛡️',
      descUr: 'اے آئی ریٹ اسکینر (±3%)، فوری ڈیجیٹل چالان، پیٹرول روٹس',
      descEn: 'AI commodity scanner (±3%), on-spot digital citations & task radar',
      badgeStyle: 'bg-sky-700 hover:bg-sky-800 text-white border-sky-600 shadow-sky-700/20'
    },
    government: { 
      ur: 'ڈپٹی کمشنر کمانڈ', 
      en: 'DC Command Gov', 
      icon: '🏛️',
      descUr: '30 زون لائیو ہیٹ میپ، ریپڈ ڈسپیچ اسکواڈ، سپلائی اینالیٹکس',
      descEn: '30-zone geospatial heatmap, patrol dispatch queue, policy sandbox',
      badgeStyle: 'bg-purple-800 hover:bg-purple-900 text-white border-purple-700 shadow-purple-800/20'
    },
    fakhar_master: { 
      ur: 'فخر مشتاق — ڈیمو فل ایکسیس', 
      en: 'Fakhar Master Access', 
      icon: '⭐',
      descUr: 'تمام 5 کنسولز پر براہ راست سپروائزری رسائی، 6 سطحی سیکیورٹی آڈٹ',
      descEn: 'Omni-role executive supervision across all consoles, 6-layer security audit',
      badgeStyle: 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 hover:from-emerald-900 hover:to-amber-700 text-white border-amber-400/80 shadow-amber-500/20'
    },
    fakhar: { 
      ur: 'فخر مشتاق — وژن کنسول', 
      en: 'Fakhar Vision Console', 
      icon: '👑',
      descUr: 'بنیادی وژن، اخلاقیات اور ٹیم اسٹرانگر ٹوگیدر کا مشن',
      descEn: 'Foundational vision, ethics & socio-civic mission',
      badgeStyle: 'bg-gradient-to-r from-emerald-700 to-amber-600 text-white border-amber-400'
    },
  };

  const isMasterOrGov = currentRole === 'government' || currentRole === 'fakhar_master';

  // Filter search results safely by role permissions
  const allPagesList = [
    { titleUrdu: 'سرکاری ڈی سی ریٹس لسٹ', titleEn: 'Official DC Rates', tab: 'rates', role: 'citizen' },
    { titleUrdu: 'شہری انعامی پوائنٹس', titleEn: 'Civic Points & Rewards', tab: 'civic_points', role: 'citizen' },
    { titleUrdu: 'آن لائن شکایت درج کریں', titleEn: 'Submit Overcharging Report', tab: 'report', role: 'citizen' },
    { titleUrdu: 'میری درج شدہ شکایات', titleEn: 'My Submitted Reports', tab: 'my_reports', role: 'citizen' },
    { titleUrdu: 'تصدیق شدہ گرین دکاندار', titleEn: 'Green Vendor Directory', tab: 'vendors', role: 'citizen' },
    { titleUrdu: 'رہنمائی و اسباق (Why & How)', titleEn: 'Why & How Strategic QA', tab: 'why_how', role: 'all' },
    { titleUrdu: 'ڈیجیٹل کیو آر کوڈ و شفٹ', titleEn: 'Vendor QR Code & Shift', tab: 'dashboard', role: 'vendor' },
    { titleUrdu: 'وینڈر جیو فینس اور سلاٹ', titleEn: 'Vendor Designated Slot', tab: 'slot', role: 'vendor' },
    { titleUrdu: 'زیرو ویسٹ پوائنٹس', titleEn: 'Zero Waste Rewards', tab: 'waste', role: 'vendor' },
    { titleUrdu: 'مائیکرو پے اور کریڈٹ اسکور', titleEn: 'MicroPay & Credit Score', tab: 'micropay', role: 'vendor' },
    { titleUrdu: 'پیرہ ڈیوٹی ڈیش بورڈ', titleEn: 'PERA Inspector Duty', tab: 'duty', role: 'inspector' },
    { titleUrdu: 'اے آئی پرائس اسکینر', titleEn: 'AI Price Scanner (±3%)', tab: 'scanner', role: 'inspector' },
    { titleUrdu: 'ڈیجیٹل چالان لاگز', titleEn: 'Digital Citation Logs', tab: 'citations', role: 'inspector' },
    { titleUrdu: 'ضلعی کمانڈ ڈیش بورڈ', titleEn: 'District Command Hub', tab: 'command', role: 'government' },
    { titleUrdu: 'جغرافیائی زون ہیٹ میپ', titleEn: 'Geospatial Heatmap 30 Zones', tab: 'heatmap', role: 'government' },
    { titleUrdu: 'ریپڈ ڈسپیچ اسکواڈ کیو', titleEn: 'Patrol Dispatch Queue', tab: 'dispatch', role: 'government' },
    { titleUrdu: 'ڈیٹا امپورٹ / ایکسپورٹ سنٹر', titleEn: 'Data Sync & CSV Center', tab: 'datasync', role: 'government' },
    { titleUrdu: 'چیف ایگزیکٹو ڈیش بورڈ', titleEn: 'Master Executive View', tab: 'master_overview', role: 'fakhar_master' },
    { titleUrdu: 'سسٹم سیکیورٹی آڈٹ', titleEn: 'Security Audit & RBAC', tab: 'security_audit', role: 'fakhar_master' },
  ];

  const filteredPages = allPagesList
    .filter(p => {
      // Non-admins can only search pages in their own role domain or global pages
      if (!isMasterOrGov) {
        if (p.role !== currentRole && p.role !== 'all') return false;
      }
      return (
        p.titleUrdu.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const filteredRates = (dcRates || []).filter(r => 
    (r.nameUrdu && r.nameUrdu.includes(searchQuery)) || 
    (r.nameEn && r.nameEn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredVendors = (vendors || []).filter(v => 
    (v.name && v.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (v.nameUrdu && v.nameUrdu.includes(searchQuery)) || 
    (v.marketName && v.marketName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRateClick = (item: DCRateItem) => {
    if (isMasterOrGov) {
      onSelectNav('rates');
    } else if (currentRole === 'citizen') {
      onSelectNav('rates');
    }
    window.dispatchEvent(new CustomEvent('highlight-dc-rate', { 
      detail: { id: item.id, nameEn: item.nameEn, nameUrdu: item.nameUrdu, dcRate: item.dcRate } 
    }));
  };

  const tickerRates = (dcRates && dcRates.length > 0) 
    ? [...dcRates, ...dcRates, ...dcRates, ...dcRates] 
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900 border-b border-slate-200 shadow-sm">
      {/* 40s Live DC Rates Ticker Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 overflow-hidden relative">
        <div className="flex items-center">
          <div 
            onClick={() => {
              speechService.playChime('action');
              if (currentRole === 'government' || currentRole === 'fakhar_master') {
                onSelectNav('gov_rates');
              } else {
                if (currentRole !== 'citizen') handleRoleSelect('citizen');
                onSelectNav('rates');
              }
            }}
            className="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase z-10 shadow-xs cursor-pointer transition-all active:scale-95"
            title="Click to view full DC Rate Sheet"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'براہ راست نرخ نامہ' : 'LIVE DC RATES'}</span>
          </div>

          <div dir="ltr" className="overflow-hidden w-full whitespace-nowrap ml-3">
            <div className="ticker-track flex items-center gap-8 text-slate-300">
              {tickerRates.map((item, idx) => (
                <span 
                  key={`${item.id}-${idx}`} 
                  className="inline-flex items-center gap-1.5 hover:text-amber-300 hover:scale-105 transition-all cursor-pointer py-0.5 px-2 rounded hover:bg-slate-800" 
                  onClick={() => {
                    speechService.playChime('action');
                    handleRateClick(item);
                  }}
                  title={`Click to inspect ${item.nameEn} in official sheet`}
                >
                  <span className={`font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`}>{isUrdu ? item.nameUrdu : item.nameEn}:</span>
                  <span className="font-extrabold text-amber-400">Rs. {item.dcRate}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${item.deviationPct > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {item.deviationPct > 0 ? `+${item.deviationPct}%` : `${item.deviationPct}%`}
                  </span>
                  <span className="text-slate-600">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Topbar */}
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 bg-white">
        {/* Left Side: Menu Button & Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <BrandLogo 
            variant="light" 
            size="sm" 
            showSubtitle={true}
            subtitleText="VRF 2026 • Secure Sovereign Console"
            onClick={handleTourTrigger} 
          />
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md relative hidden lg:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              id="input-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder={isUrdu ? "تلاش کریں (صفحات، دکاندار، ریٹس) — بولنے کے لیے مائیک دبائیں" : "Search pages, vendors, DC rates — or tap mic"}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-20 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenVoiceSearch}
                className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                title={isUrdu ? "بول کر تلاش کریں (Voice Search)" : "Voice Search Command (Speak: 'Show me vendor rates' or 'Find nearest slots')"}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <kbd className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                /
              </kbd>
            </div>
          </div>

          {/* Search Dropdown */}
          {searchOpen && searchQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              <div className="p-2">
                {/* Pages */}
                {filteredPages.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1 font-bold">
                      {isUrdu ? 'صفحات و فنکشنز' : 'Pages & Features'}
                    </p>
                    {filteredPages.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (p.role !== currentRole && p.role !== 'all') {
                            if (isMasterOrGov) {
                              handleRoleSelect(p.role as Role);
                              onSelectNav(p.tab);
                            } else {
                              return;
                            }
                          } else {
                            onSelectNav(p.tab);
                          }
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="font-medium text-slate-800">{isUrdu ? p.titleUrdu : p.titleEn}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                          {p.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rates */}
                {filteredRates.length > 0 && (
                  <div className="mb-2 border-t border-slate-100 pt-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1 font-bold">
                      {isUrdu ? 'سرکاری اشیاء' : 'Official Commodities'}
                    </p>
                    {filteredRates.slice(0, 4).map(r => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onSelectNav('rates');
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="text-slate-800">{isUrdu ? r.nameUrdu : r.nameEn}</span>
                        <span className="text-emerald-700 font-bold">Rs. {r.dcRate}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Vendor ID Geospatial Allotment Quick Lookup */}
                {searchQuery.trim().length >= 2 && onOpenVendorAllotment && (
                  <div className="mb-2 border-b border-slate-100 pb-2">
                    <button
                      onClick={() => {
                        onOpenVendorAllotment(searchQuery.trim());
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-2.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/80 flex items-center justify-between text-xs transition-all text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
                          📍
                        </span>
                        <div>
                          <p className="font-bold text-emerald-900 leading-tight">
                            {isUrdu ? `وینڈر آئی ڈی "${searchQuery}" کا سرکاری مقام نقشہ پر تلاش کریں` : `Search Vendor ID "${searchQuery}" on Google Maps`}
                          </p>
                          <p className="text-[10px] text-emerald-700 font-urdu mt-0.5">
                            {isUrdu ? 'سرکاری الاٹمنٹ پرمٹ، جیو فینس ریڈار اور لائیو کوآرڈینیٹس' : 'DC Allotment Sanction, Geofence Radar & GPS Coordinates'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full shrink-0 group-hover:scale-105 transition-transform">
                        {isUrdu ? 'نقشہ کھولیں' : 'Open Map'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Vendors */}
                {filteredVendors.length > 0 && (
                  <div className="border-t border-slate-100 pt-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1 font-bold">
                      {isUrdu ? 'دکاندار و ریڑھی بان' : 'Vendors & Stalls'}
                    </p>
                    {filteredVendors.map(v => (
                      <div
                        key={v.id}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div 
                          onClick={() => {
                            onSelectNav('vendors');
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="cursor-pointer flex-1"
                        >
                          <p className="font-semibold text-slate-800">{isUrdu ? v.nameUrdu : v.name}</p>
                          <p className="text-[10px] text-slate-500">{isUrdu ? v.marketNameUrdu : v.marketName} • {v.slotNumber}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {onOpenVendorAllotment && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenVendorAllotment(v.qrId || v.slotNumber || v.id);
                                setSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-transform active:scale-95"
                              title="View Designated Pitch on Google Maps"
                            >
                              <span>📍</span>
                              <span>{isUrdu ? 'نقشہ' : 'Map'}</span>
                            </button>
                          )}
                          <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            ⭐ {v.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredPages.length === 0 && filteredRates.length === 0 && filteredVendors.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    {isUrdu ? 'کوئی نتیجہ نہیں ملا۔ دوبارہ کوشش کریں۔' : 'No results found. Try another query.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pakistan Official Standard Clock */}
        <div className="hidden md:flex items-center">
          <PakClock lang={lang} preferredCityId={userProfileCity} />
        </div>

        {/* Right Side: Role Badge, Language, Alerts & User Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Presence on Extra Large Screens */}
          <div className="hidden 2xl:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-xs text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-bold text-slate-900">{presenceCount.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500">{isUrdu ? 'آن لائن' : 'Active'}</span>
          </div>

          {/* Role Badge in Header (RBAC Protected) */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              id="btn-quick-switch-role-badge"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 ${
                roleLabels[currentRole]?.badgeStyle || 'bg-emerald-700 text-white border-emerald-600'
              }`}
              title={
                isMasterOrGov
                  ? (isUrdu ? "فوری رول سوئچ" : "Quick Switch Role")
                  : (isUrdu ? "کردار کے تحت مخصوص رسائی" : "Role-Based Access Control")
              }
              aria-expanded={roleDropdownOpen}
            >
              {isMasterOrGov ? (
                <span className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/30 text-[10px] font-black uppercase shadow-2xs">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                </span>
              ) : (
                <span className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/30 text-[10px] font-bold shadow-2xs">
                  <Lock className="w-3 h-3 text-emerald-200" />
                </span>
              )}

              <span className="text-sm">{roleLabels[currentRole]?.icon || '👤'}</span>
              <span className="max-w-[70px] sm:max-w-[120px] truncate text-white text-[11px] sm:text-xs">
                {isUrdu ? roleLabels[currentRole]?.ur : roleLabels[currentRole]?.en}
              </span>
              <ChevronDown className={`w-3 h-3 opacity-80 transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-slate-900 animate-fadeUp">
                {isMasterOrGov ? (
                  <>
                    <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                          {isUrdu ? 'انتظامی رول سوئچ' : 'Executive Persona Switcher'}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {isUrdu ? 'مکمل رسائی' : 'Full Access'}
                      </span>
                    </div>

                    <div className="p-1.5 space-y-1 max-h-[360px] overflow-y-auto">
                      {(['citizen', 'vendor', 'inspector', 'government', 'fakhar_master'] as Role[]).map((r) => {
                        const cfg = roleLabels[r];
                        const isActive = currentRole === r;
                        return (
                          <button
                            key={r}
                            id={`quick-switch-role-${r}`}
                            onClick={() => {
                              handleRoleSelect(r);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all ${
                              isActive 
                                ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold shadow-xs' 
                                : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base p-1 rounded-lg bg-white border border-slate-200">
                                {cfg.icon}
                              </span>
                              <div>
                                <span className="font-extrabold text-slate-900 text-xs block">
                                  {isUrdu ? cfg.ur : cfg.en}
                                </span>
                              </div>
                            </div>
                            {isActive && <Check className="w-4 h-4 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-sora font-extrabold text-xs text-slate-900">
                          {isUrdu ? 'کردار کے تحت مخصوص رسائی' : 'Role-Based Access Control'}
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">
                          RBAC ENFORCED • {currentRole}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {isUrdu
                        ? 'آپ کا اکاؤنٹ صرف اس کردار کی ذمہ داریوں تک محدود ہے۔ دیگر کنسولز پر سوئچ کرنے کے لیے لاگ آؤٹ کریں۔'
                        : 'Your account is isolated to authorized duties under VRF 2026 security protocols.'}
                    </p>

                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full bg-[#04231A] hover:bg-[#0B4A31] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <span>{isUrdu ? 'لاگ آؤٹ اور نیا کردار منتخب کریں' : 'Switch Persona (Logout)'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button
            id="btn-lang-toggle"
            onClick={onToggleLang}
            className="p-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors border border-slate-200 flex items-center gap-1 shrink-0"
            title={isUrdu ? "Switch to English" : "اردو میں بدلیں"}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-bold">{isUrdu ? 'EN' : 'اردو'}</span>
          </button>

          {/* Notifications Bell */}
          <button
            id="btn-notifications"
            onClick={onOpenAlerts}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative border border-slate-200 shrink-0"
            aria-label="Alerts and Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* User Profile & Executive Utilities Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              id="btn-user-profile-menu"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-1 sm:p-1.5 pl-1.5 pr-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-xs font-bold transition-all shadow-2xs group"
              title="User Profile & Quick Platform Tools"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
                {userName ? userName.charAt(0) : 'U'}
              </div>
              <span className={`hidden sm:inline-block truncate max-w-[90px] font-bold text-[11px] ${isUrdu ? 'font-urdu' : ''}`}>
                {userName ? userName.split(' ')[0] : 'Profile'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-slate-900 animate-fadeUp">
                {/* User Header */}
                <div className="px-3.5 py-2.5 border-b border-slate-100 bg-emerald-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {userName ? userName.charAt(0) : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-sora font-bold text-xs text-slate-900 truncate">{userName}</p>
                      <p className="text-[10px] text-emerald-700 font-mono font-semibold uppercase">{currentRole} • {userProfileCity.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Platform Utilities Menu */}
                <div className="p-1.5 space-y-0.5">
                  {onOpenUserProfile && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenUserProfile();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700 font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>{isUrdu ? 'میری رجسٹریشن و کوائف' : 'My Registered Civic Profile'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenAlignModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700 font-medium transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>{isUrdu ? 'ترجیحات (زبان، آواز، موڈ)' : 'Align-To-You Preferences'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleTourTrigger();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700 font-medium transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>{isUrdu ? 'پلیٹ فارم گائیڈڈ ٹور' : 'Platform Guided Tour'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenNationalMap();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700 font-medium transition-colors"
                  >
                    <span className="text-sm">🇵🇰</span>
                    <span>{isUrdu ? 'قومی جغرافیائی نقشہ' : 'National Geospatial Map'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenCitySlotsMap();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700 font-medium transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{isUrdu ? 'سٹی وینڈر سلاٹس میپ' : 'City Slots & GIS Map'}</span>
                  </button>

                  {onOpenVendorAllotment && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenVendorAllotment();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2.5 text-xs text-slate-700 font-medium transition-colors"
                    >
                      <Store className="w-4 h-4 text-amber-500" />
                      <span>{isUrdu ? 'وینڈر سلاٹ الاٹمنٹ' : 'Designated Stall Allotment'}</span>
                    </button>
                  )}

                  {(currentRole === 'government' || currentRole === 'fakhar_master') && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenDataEditor();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-900 flex items-center gap-2.5 text-xs font-bold transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-emerald-700" />
                      <span>{isUrdu ? 'پلیٹ فارم ڈیٹا ایڈیٹر' : 'Master Records Editor'}</span>
                    </button>
                  )}

                  {/* Voice Toggle in Menu */}
                  <button
                    onClick={() => {
                      onToggleVoice();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 font-medium transition-colors border-t border-slate-100 mt-1"
                  >
                    <div className="flex items-center gap-2.5">
                      {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                      <span>{isUrdu ? 'آواز کی رہنمائی' : 'Voice Narration'}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${voiceEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {voiceEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 text-xs font-bold transition-colors border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
