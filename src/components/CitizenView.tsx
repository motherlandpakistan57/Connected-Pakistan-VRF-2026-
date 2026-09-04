import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, AlertTriangle, FileText, CheckCircle, HelpCircle, 
  Search, RefreshCw, Volume2, ShieldCheck, ArrowRight, Upload, 
  MapPin, Clock, CheckCircle2, UserX, Sparkles, Filter, QrCode,
  Eye, ExternalLink, Compass, Star, Award, Trophy, Flame,
  ChevronLeft, ChevronRight, Wheat, Milk, Leaf, Package, Layers, Store, Camera
} from 'lucide-react';
import { Language, DCRateItem, VendorProfile, CitizenReport } from '../types';
import { speechService } from '../lib/audio';
import { VRF_FAQ } from '../data/seedData';
import { QRScannerModal } from './QRScannerModal';
import { VendorVerifiedProfileModal } from './VendorVerifiedProfileModal';
import { CivicPointsSection } from './CivicPointsSection';
import { MarketHeroArtwork } from './MarketHeroArtwork';

interface CitizenViewProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  dcRates: DCRateItem[];
  vendors: VendorProfile[];
  reports: CitizenReport[];
  onSubmitReport: (report: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>) => void;
  onRefreshRates: () => void;
  userName: string;
  onOpenAIGuide: () => void;
  onOpenCitySlotsMap?: (slotId?: string) => void;
  onOpenVendorAllotment?: (vendorId?: string) => void;
}

export const CitizenView: React.FC<CitizenViewProps> = ({
  activeTab,
  onSelectTab,
  lang,
  dcRates = [],
  vendors = [],
  reports = [],
  onSubmitReport,
  onRefreshRates,
  userName,
  onOpenAIGuide,
  onOpenCitySlotsMap,
  onOpenVendorAllotment,
}) => {
  const isUrdu = lang === 'ur';

  // QR Scanning and Verified Profile Modals
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedVendorForProfile, setSelectedVendorForProfile] = useState<VendorProfile | null>(null);

  // State for DC Rates filter & search & highlight
  const [ratesSearch, setRatesSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [highlightedRateId, setHighlightedRateId] = useState<string | null>(null);

  // Listen for top bar rate ticker clicks
  useEffect(() => {
    const handleHighlightEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.id) setHighlightedRateId(customEvent.detail.id);
        if (customEvent.detail.nameEn || customEvent.detail.nameUrdu) {
          setRatesSearch(''); // clear search filter so it is visible
          setSelectedCategory('all');
        }
        // auto-clear highlight after 6 seconds
        setTimeout(() => setHighlightedRateId(null), 6000);
      }
    };

    window.addEventListener('highlight-dc-rate', handleHighlightEvent);
    return () => window.removeEventListener('highlight-dc-rate', handleHighlightEvent);
  }, []);

  // State for Report Engine 3-Step Wizard
  const [reportStep, setReportStep] = useState<1 | 2 | 3>(1);
  const [reportCategory, setReportCategory] = useState('سبزیاں');
  const [reportItem, setReportItem] = useState('پیاز درجہ اول (Fresh Onion)');
  const [reportVendor, setReportVendor] = useState('');
  const [reportMarket, setReportMarket] = useState('راجہ بازار زون اے، راولپنڈی');
  const [reportDcRate, setReportDcRate] = useState<number>(92);
  const [reportChargedPrice, setReportChargedPrice] = useState<number>(120);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccessId, setReportSuccessId] = useState<string | null>(null);

  // State for Vendor Directory filter
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorTierFilter, setVendorTierFilter] = useState<'all' | 'green' | 'silver'>('all');

  // Sub-tabs list for quick intra-view navigation
  const citizenTabs = [
    { id: 'overview', labelUrdu: 'ہوم ڈیش بورڈ', labelEn: 'Overview', icon: Compass },
    { id: 'civic_points', labelUrdu: 'شہری پوائنٹس و انعامات', labelEn: 'Civic Points', icon: Award },
    { id: 'rates', labelUrdu: 'سرکاری نرخ نامہ', labelEn: 'DC Rates', icon: ShoppingBag },
    { id: 'report', labelUrdu: 'شکایت درج کریں', labelEn: 'Report Violation', icon: AlertTriangle },
    { id: 'my_reports', labelUrdu: 'میری شکایات کا اسٹیٹس', labelEn: 'My Reports', icon: FileText, badge: reports.length },
    { id: 'vendors', labelUrdu: 'گرین دکاندار ڈائرکٹری', labelEn: 'Green Vendors', icon: CheckCircle },
  ];

  // Time-of-day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isUrdu ? 'صبح بخیر (Subah Bakhair)' : 'Good Morning';
    if (hour < 17) return isUrdu ? 'دوپہر بخیر (Dopahar Bakhair)' : 'Good Afternoon';
    return isUrdu ? 'شام بخیر (Shaam Bakhair)' : 'Good Evening';
  };

  // Categories list for chips
  const categories = [
    { id: 'all', labelUrdu: 'تمام اشیاء', labelEn: 'All Items' },
    { id: 'غلہ و اناج', labelUrdu: 'غلہ و اناج', labelEn: 'Flour & Grains' },
    { id: 'سبزیاں', labelUrdu: 'تازہ سبزیاں', labelEn: 'Vegetables' },
    { id: 'ڈیری و پولٹری', labelUrdu: 'ڈیری و پولٹری', labelEn: 'Dairy & Poultry' },
    { id: 'کریانہ', labelUrdu: 'کریانہ و تیل', labelEn: 'Groceries' },
    { id: 'دالیں', labelUrdu: 'دالیں', labelEn: 'Pulses' },
    { id: 'گوشت', labelUrdu: 'گوشت', labelEn: 'Meat' },
  ];

  const filteredRates = (dcRates || []).filter((item) => {
    const matchesSearch =
      (item.nameUrdu && item.nameUrdu.includes(ratesSearch)) ||
      (item.nameEn && item.nameEn.toLowerCase().includes(ratesSearch.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || (item.categoryUrdu && item.categoryUrdu.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const filteredVendors = (vendors || []).filter((v) => {
    const matchesSearch =
      (v.name && v.name.toLowerCase().includes(vendorSearch.toLowerCase())) ||
      (v.nameUrdu && v.nameUrdu.includes(vendorSearch)) ||
      (v.marketName && v.marketName.toLowerCase().includes(vendorSearch.toLowerCase()));
    const matchesTier =
      vendorTierFilter === 'all' || v.badge === vendorTierFilter;
    return matchesSearch && matchesTier;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);

    const deviation = ((reportChargedPrice - reportDcRate) / reportDcRate) * 100;
    const newReportId = `CP-26-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      onSubmitReport({
        category: reportCategory,
        item: reportItem,
        vendorName: reportVendor.trim() || 'نامعلوم دکاندار (Unspecified Stall)',
        marketName: reportMarket,
        dcRate: reportDcRate,
        chargedPrice: reportChargedPrice,
        isAnonymous,
        reporterName: isAnonymous ? undefined : userName,
        location: reportMarket,
        evidencePhoto: reportPhoto || undefined,
        notes: `Overcharging of ${deviation.toFixed(1)}% reported by citizen.`,
      });

      setReportSubmitting(false);
      setReportSuccessId(newReportId);

      // Award +50 Civic Points for citizen vigilance
      try {
        const saved = localStorage.getItem('cp_citizen_civic_points');
        const prof = saved ? JSON.parse(saved) : { totalPoints: 340, level: 2, activities: [], verifiedReportsCount: 4, badgeTitle: 'Civic Guardian', badgeTitleUrdu: 'محافظِ انصاف' };
        prof.totalPoints = (prof.totalPoints || 340) + 50;
        prof.verifiedReportsCount = (prof.verifiedReportsCount || 4) + 1;
        prof.activities = [
          {
            id: `act-${Date.now()}`,
            title: `Verified Overpricing Report: ${reportItem}`,
            titleUrdu: `${reportItem} کے زائد نرخ کی رپورٹ درج کی (+50 پوائنٹس)`,
            points: 50,
            timestamp: 'Just now',
            type: 'report_verified',
          },
          ...(prof.activities || []).slice(0, 15)
        ];
        localStorage.setItem('cp_citizen_civic_points', JSON.stringify(prof));
      } catch (e) {
        console.warn(e);
      }

      // Web Speech API Voice Confirmation in Urdu / English
      speechService.confirmReportSubmission(
        lang,
        newReportId,
        reportItem,
        reportMarket
      );
    }, 600);
  };

  const isCivicPointsTab = activeTab === 'civic_points' || activeTab === 'citizen_civic_points' || activeTab === 'points' || activeTab === 'rewards';
  const isRatesTab = activeTab === 'rates' || activeTab === 'citizen_rates' || activeTab === 'dc_rates';
  const isReportTab = activeTab === 'report' || activeTab === 'citizen_report' || activeTab === 'complaint';
  const isMyReportsTab = activeTab === 'my_reports' || activeTab === 'citizen_my_reports' || activeTab === 'reports' || activeTab === 'track';
  const isVendorsTab = activeTab === 'vendors' || activeTab === 'citizen_vendors' || activeTab === 'directory';
  const isOverviewTab = activeTab === 'overview' || activeTab === 'citizen_overview' || activeTab === 'dashboard' || (!isCivicPointsTab && !isRatesTab && !isReportTab && !isMyReportsTab && !isVendorsTab);

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Executive Sub-Tab Navigation Bar for Citizen */}
      <div className="bg-[#04231A] p-2 rounded-2xl border border-[#178A52]/40 shadow-lg overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {citizenTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              (tab.id === 'overview' && isOverviewTab) ||
              (tab.id === 'civic_points' && isCivicPointsTab) ||
              (tab.id === 'rates' && isRatesTab) ||
              (tab.id === 'report' && isReportTab) ||
              (tab.id === 'my_reports' && isMyReportsTab) ||
              (tab.id === 'vendors' && isVendorsTab);

            return (
              <button
                key={tab.id}
                id={`citizen-subtab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#178A52] text-white shadow-md border border-[#E3A82B]/60'
                    : 'text-[#DCEFE4]/80 hover:text-white hover:bg-[#0B4A31]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E3A82B]' : 'text-[#178A52]'}`} />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? tab.labelUrdu : tab.labelEn}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-[#E3A82B] text-[#04231A] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 1. OVERVIEW & GREETING ================= */}
      {isOverviewTab && (
        <div className="space-y-6">
          {/* Greeting Hero Card */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#E3A82B]/60 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#178A52]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#178A52] text-white px-3 py-1 rounded-full text-xs font-bold mb-3 shadow">
                  <Sparkles className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>{getGreeting()}</span>
                </div>

                <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  {isUrdu ? `خوش آمدید، ${userName}` : `Welcome, ${userName}`}
                </h2>
                <p className="text-sm sm:text-base text-[#DCEFE4] font-urdu max-w-2xl mt-1 leading-snug">
                  {isUrdu ? 'سرکاری ڈی سی نرخ چیک کریں اور گراں فروشی کی فوری گمنام رپورٹ درج کریں۔' : 'Check official DC rates and report overpricing instantly & anonymously.'}
                </p>
              </div>

              {/* Quick Summary Pill Stats with Civic Points Widget */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
                <button 
                  onClick={() => onSelectTab('civic_points')}
                  className="bg-[#04231A] hover:bg-[#0B4A31] border-2 border-[#E3A82B] rounded-2xl p-3.5 text-center shadow-lg transition-transform active:scale-95 text-left group"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-[#E3A82B] block font-extrabold uppercase">
                      {isUrdu ? 'شہری انعامات' : 'Civic Points'}
                    </span>
                    <Trophy className="w-3.5 h-3.5 text-[#E3A82B] group-hover:animate-bounce" />
                  </div>
                  <span className="font-sora font-extrabold text-xl sm:text-2xl text-[#E3A82B]">340+</span>
                  <span className="text-[9px] text-[#DCEFE4]/80 block font-bold">
                    {isUrdu ? 'لیول 2 محافظ' : 'Lvl 2 Guardian'}
                  </span>
                </button>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3.5 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'سرکاری اشیاء' : 'DC Items'}</span>
                  <span className="font-sora font-extrabold text-xl sm:text-2xl text-white">12</span>
                  <span className="text-[9px] text-[#178A52] block font-bold">100% Live</span>
                </div>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3.5 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'حل شدہ شکایات' : 'Resolved'}</span>
                  <span className="font-sora font-extrabold text-xl sm:text-2xl text-white">98.6%</span>
                  <span className="text-[9px] text-[#E3A82B] block font-bold font-mono">Avg 28 Mins</span>
                </div>
              </div>
            </div>

            {/* Action Quick Links Row */}
            <div className="mt-6 pt-6 border-t border-[#178A52]/40 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectTab('civic_points')}
                className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] text-xs font-black px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 border border-[#04231A]"
              >
                <Award className="w-4 h-4 text-[#04231A]" />
                <span>{isUrdu ? 'شہری پوائنٹس و انعامات کلیم کریں' : 'Civic Points & Rewards'}</span>
              </button>

              <button
                onClick={() => setShowQRScanner(true)}
                className="bg-[#04231A] hover:bg-[#0B4A31] text-white border border-[#178A52] text-xs font-extrabold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95"
              >
                <QrCode className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'دکاندار کا کیو آر اسکین کریں' : 'Scan Vendor QR Code'}</span>
              </button>

              <button
                onClick={() => onSelectTab('rates')}
                className="bg-[#178A52] hover:bg-[#178A52]/80 text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'سرکاری نرخ نامہ دیکھیں' : 'View DC Price List'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onSelectTab('report')}
                className="bg-[#C4572D] hover:bg-[#B03A2E] text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 text-[#F4D58D]" />
                <span>{isUrdu ? 'گراں فروشی کی گمنام رپورٹ' : 'Report Overcharging Anonymously'}</span>
              </button>

              <button
                onClick={() => onSelectTab('vendors')}
                className="bg-[#04231A] hover:bg-[#0B4A31] text-[#FCFAF3] border border-[#178A52] text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-[#178A52]" />
                <span>{isUrdu ? 'تصدیق شدہ گرین دکاندار' : 'Green Vendor Directory'}</span>
              </button>
            </div>
          </div>

          {/* Live Verified Market Resolution Case Study (Exact Platform Aligned) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#04231A] p-6 rounded-3xl border-2 border-[#1A774B] shadow-2xl text-white">
            <div className="lg:col-span-7">
              <MarketHeroArtwork 
                showBadge={false}
                onExploreReport={() => onSelectTab('rates')}
              />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#178A52] text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E3A82B]" />
                <span>{isUrdu ? 'براہ راست حل شدہ کیس اسٹڈی' : 'Live Verified Resolution'}</span>
              </div>
              <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-white">
                {isUrdu ? 'منصفانہ نرخ • باوقار روزگار' : 'Fair Rates • Dignified Livelihood'}
              </h3>
              <p className="text-xs sm:text-sm text-[#DCEFE4] font-urdu leading-relaxed">
                {isUrdu 
                  ? 'راجہ بازار زون-اے میں صارف کی 100% گمنام اطلاع پر ضلعی انسپکٹر نے 41 منٹ کے ریکارڈ وقت میں سرکاری نرخ نافذ کرائے۔ ہر شہری کی اطلاع راولپنڈی و اسلام آباد کو گراں فروشی سے پاک بنا رہی ہے۔'
                  : 'On an anonymous citizen report in Raja Bazaar Zone-A, PERA enforcement restored official DC price ceilings in 41 minutes with complete evidence verification.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => onSelectTab('rates')}
                  className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isUrdu ? 'ڈی سی ریٹس موازنہ' : 'Compare DC Rates'}</span>
                </button>
                <button
                  onClick={() => onSelectTab('report')}
                  className="bg-[#178A52] hover:bg-[#0B4A31] text-white border border-[#E3A82B]/50 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'اپنی شکایت درج کریں' : 'Submit Report'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Market Pulse Banner */}
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#178A52] text-white flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#04231A]">
                    {isUrdu ? 'مارکیٹ پلس اور اہم سرکاری اعلانات' : 'Daily Market Pulse & Bulletins'}
                  </h3>
                  <p className="text-xs text-[#5C6F63] font-urdu">
                    ضلعی انتظامیہ کی طرف سے روزانہ صبح 8 بجے ریٹس کی توثیق کی جاتی ہے۔
                  </p>
                </div>
              </div>

              <span className="text-xs bg-[#178A52]/10 text-[#178A52] font-bold px-3 py-1 rounded-full font-mono">
                Updated: 08:00 AM
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#DCEFE4]/40 border border-[#178A52]/20">
                <p className="text-xs font-bold text-[#0B4A31]">{isUrdu ? 'آٹا اور دالیں مستحکم' : 'Flour & Pulses Stable'}</p>
                <p className="text-[11px] text-[#5C6F63] mt-1 font-urdu">
                  ضلع بھر میں 10 کلو آٹا 1480 روپے پر وافر مقدار میں دستیاب ہے۔
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F4D58D]/30 border border-[#E3A82B]/30">
                <p className="text-xs font-bold text-[#0B4A31]">{isUrdu ? 'پیاز پر خصوصی مانیٹرنگ' : 'Onion Price Advisory'}</p>
                <p className="text-[11px] text-[#5C6F63] mt-1 font-urdu">
                  پیاز کے نرخ 92 روپے مقرر ہیں۔ اضافی ریٹ لینے والے دکانداروں پر اسکینرز فعال ہیں۔
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#DCEFE4]/40 border border-[#178A52]/20">
                <p className="text-xs font-bold text-[#0B4A31]">{isUrdu ? 'گرین دکاندار بیج' : 'Green Vendor Rewards'}</p>
                <p className="text-[11px] text-[#5C6F63] mt-1 font-urdu">
                  7.0 سے زائد اسکور والے دکانداروں سے خریداری پر گاہک کو مستند وزن کی گارنٹی ملتی ہے۔
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CIVIC POINTS & GAMIFICATION ================= */}
      {isCivicPointsTab && (
        <CivicPointsSection
          lang={lang}
          userName={userName}
          onNavigateToReport={() => onSelectTab('report')}
          onNavigateToRates={() => onSelectTab('rates')}
          onNavigateToVendors={() => onSelectTab('vendors')}
        />
      )}

      {/* ================= 2. OFFICIAL DC RATES ================= */}
      {isRatesTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A] flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-[#178A52]" />
                  <span>{isUrdu ? 'سرکاری ڈی سی نرخ نامہ (Official DC Rates)' : 'Official DC Price Ceiling'}</span>
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu mt-0.5">
                  تمام 12 لازمی اشیاء کے ریٹس ضلعی انتظامیہ سے براہ راست تصدیق شدہ ہیں
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onRefreshRates}
                  className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'ریٹس ریفریش کریں' : 'Re-Sync Rates'}</span>
                </button>
              </div>
            </div>

            {/* Search & Category Filter Chips */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[#5C6F63] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ratesSearch}
                  onChange={(e) => setRatesSearch(e.target.value)}
                  placeholder={isUrdu ? 'نام یا کیٹیگری تلاش کریں (مثلاً آٹا، چینی، ٹماٹر)...' : 'Search commodity name (e.g. Atta, Sugar, Tomato)...'}
                  className="w-full bg-white border border-[#178A52]/40 rounded-2xl pl-9 pr-4 py-2 text-xs text-[#132A21] placeholder-[#5C6F63]/60 focus:outline-none focus:border-[#178A52] focus:ring-1 focus:ring-[#178A52]"
                />
              </div>

              {/* Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#178A52] text-white shadow'
                        : 'bg-[#F6F2E7] text-[#132A21] hover:bg-[#DCEFE4]'
                    }`}
                  >
                    {isUrdu ? cat.labelUrdu : cat.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* DC Rates Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredRates.map((item) => {
                const isOvercharged = item.deviationPct > 3;
                const isHighlighted = highlightedRateId === item.id;

                return (
                  <div
                    key={item.id}
                    id={`rate-card-${item.id}`}
                    className={`p-4 rounded-2xl bg-white transition-all flex flex-col justify-between ${
                      isHighlighted 
                        ? 'border-2 border-[#E3A82B] shadow-xl ring-4 ring-[#E3A82B]/20 animate-pulse scale-[1.02]' 
                        : 'border border-[#178A52]/20 hover:border-[#178A52] shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold bg-[#DCEFE4] text-[#0B4A31] px-2 py-0.5 rounded-full">
                          {isUrdu ? item.categoryUrdu : item.categoryEn}
                        </span>
                        <div className="flex items-center gap-1">
                          {isHighlighted && (
                            <span className="text-[9px] font-bold bg-[#E3A82B] text-[#04231A] px-1.5 py-0.5 rounded-full animate-bounce">
                              {isUrdu ? 'منتخب شدہ' : 'SELECTED'}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOvercharged ? 'bg-[#C4572D]/20 text-[#C4572D]' : 'bg-[#178A52]/20 text-[#178A52]'
                          }`}>
                            {item.deviationPct > 0 ? `+${item.deviationPct}%` : `${item.deviationPct}%`}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-[#04231A] font-urdu leading-snug">
                        {isUrdu ? item.nameUrdu : item.nameEn}
                      </h4>
                      <p className="text-[11px] text-[#5C6F63]">
                        {isUrdu ? item.nameEn : item.nameUrdu}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#F6F2E7] flex items-end justify-between">
                      <div>
                        <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'سرکاری ڈی سی ریٹ' : 'Official DC Rate'}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-sora font-extrabold text-xl text-[#178A52]">Rs. {item.dcRate}</span>
                          <span className="text-[10px] text-[#5C6F63]">{isUrdu ? item.unitUrdu : item.unitEn}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'مارکیٹ اوسط' : 'Market Avg'}</span>
                        <span className="font-bold text-xs text-[#04231A]">Rs. {item.marketAvg}</span>
                      </div>
                    </div>

                    {/* Quick Report Trigger on item */}
                    <div className="mt-2 pt-2 border-t border-[#F6F2E7] flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          const text = isUrdu
                            ? `${item.nameUrdu} کا سرکاری ڈی سی ریٹ ${item.dcRate} روپے ${item.unitUrdu} ہے۔`
                            : `The official DC Rate for ${item.nameEn} is Rs. ${item.dcRate} ${item.unitEn}.`;
                          speechService.speak(text, { lang: isUrdu ? 'ur' : 'en' });
                        }}
                        className="p-1 rounded text-[#5C6F63] hover:text-[#178A52]"
                        title="Read rate aloud"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setReportCategory(item.categoryUrdu);
                          setReportItem(`${item.nameUrdu} (${item.nameEn})`);
                          setReportDcRate(item.dcRate);
                          setReportChargedPrice(Math.round(item.dcRate * 1.18));
                          onSelectTab('report');
                        }}
                        className="text-[11px] font-bold text-[#C4572D] hover:underline flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{isUrdu ? 'زیادہ قیمت کی رپورٹ کریں' : 'Report Overcharging'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. REPORT ENGINE (3-STEP INTUITIVE WIZARD) ================= */}
      {isReportTab && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 border border-[#178A52]/20 shadow-xl text-[#132A21]">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#C4572D] text-white flex items-center justify-center shadow">
                  <AlertTriangle className="w-6 h-6 text-[#F4D58D]" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-lg sm:text-xl text-[#04231A]">
                    {isUrdu ? 'گراں فروشی کی آن لائن شکایت (3-Step Report Wizard)' : 'Submit Price Violation Report'}
                  </h3>
                  <p className="text-xs text-[#5C6F63] font-urdu">
                    {isUrdu ? 'آسان 3 مراحل میں فوری رپورٹ — پیرہ مجسٹریٹ اسکواڈ موقع پر روانہ ہوگا۔' : 'Intuitive 3-step reporting with auto-verification & squad dispatch.'}
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#178A52]/10 text-[#178A52] text-xs font-bold font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Anonymous</span>
              </span>
            </div>

            {/* Success Banner */}
            {reportSuccessId && (
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#0B4A31] via-[#178A52] to-[#0B4A31] text-white flex flex-col sm:flex-row items-start gap-4 shadow-xl border-2 border-[#E3A82B] animate-fadeUp">
                <div className="w-10 h-10 rounded-xl bg-[#E3A82B] text-[#04231A] flex items-center justify-center shrink-0 shadow">
                  <CheckCircle2 className="w-6 h-6 text-[#04231A]" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-base font-urdu text-[#E3A82B]">
                      {isUrdu ? `شکایت کامیابی سے درج ہو گئی! (رپورٹ آئی ڈی: ${reportSuccessId})` : `Report Registered Successfully! (ID: ${reportSuccessId})`}
                    </h4>
                    <span className="bg-[#E3A82B] text-[#04231A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      {isUrdu ? 'صوتی تصدیق نشر کی گئی' : 'Voice Audio Dispatched'}
                    </span>
                  </div>
                  <p className="text-xs text-white/95 font-urdu mt-1 leading-relaxed">
                    {isUrdu 
                      ? 'اے آئی نظام نے ڈی سی لسٹ سے تصدیق کر کے قریبی فیلڈ پرائس مجسٹریٹ اسکواڈ کو نو منٹ کے اندر کارروائی کے لیے روانہ کر دیا ہے۔'
                      : 'AI system verified price disparity against DC ceiling and dispatched the nearest Price Magistrate Squad.'}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speechService.confirmReportSubmission(lang, reportSuccessId, reportItem, reportMarket)}
                      className="bg-white hover:bg-[#F6F2E7] text-[#0B4A31] text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95 border border-[#E3A82B]"
                    >
                      <Volume2 className="w-4 h-4 text-[#178A52]" />
                      <span>{isUrdu ? 'صوتی تصدیق دوبارہ سنیں (Replay Voice)' : 'Replay Voice Audio'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTab('my_reports')}
                      className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5"
                    >
                      <span>{isUrdu ? 'میری شکایات میں اسٹیٹس ٹریک کریں' : 'Track Status in My Reports'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReportSuccessId(null);
                        setReportStep(1);
                      }}
                      className="bg-[#04231A] hover:bg-[#0B4A31] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow ml-auto"
                    >
                      + {isUrdu ? 'ایک اور رپورٹ درج کریں' : 'File Another Report'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3-Step Wizard Navigation Indicator */}
            {!reportSuccessId && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#04231A] border border-[#178A52]/40">
                  <button
                    type="button"
                    onClick={() => setReportStep(1)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      reportStep === 1
                        ? 'bg-[#178A52] text-white shadow-md'
                        : reportStep > 1
                        ? 'bg-[#0B4A31] text-[#E3A82B]'
                        : 'text-[#DCEFE4]/60 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                    <span className="truncate">{isUrdu ? 'شے و کیٹیگری' : 'Item & Category'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportStep(2)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      reportStep === 2
                        ? 'bg-[#178A52] text-white shadow-md'
                        : reportStep > 2
                        ? 'bg-[#0B4A31] text-[#E3A82B]'
                        : 'text-[#DCEFE4]/60 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                    <span className="truncate">{isUrdu ? 'مقام و قیمت' : 'Location & Price'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportStep(3)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      reportStep === 3
                        ? 'bg-[#178A52] text-white shadow-md'
                        : 'text-[#DCEFE4]/60 hover:text-white'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                    <span className="truncate">{isUrdu ? 'ثبوت و تصدیق' : 'Evidence & Submit'}</span>
                  </button>
                </div>
              </div>
            )}

            {!reportSuccessId && (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* ================= STEP 1: CATEGORY & ITEM SELECTION (LARGE ICON CARDS) ================= */}
                {reportStep === 1 && (
                  <div className="space-y-4 animate-fadeUp">
                    <div>
                      <label className="text-xs font-extrabold text-[#04231A] mb-2 block flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-[#178A52]" />
                        <span>{isUrdu ? '1. بنیادی کیٹیگری منتخب کریں (Choose Category)' : '1. Choose Item Category'}</span>
                      </label>

                      {/* Large Icon Cards for Categories */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'سبزیاں', labelUrdu: 'تازہ سبزیاں', labelEn: 'Vegetables', icon: Leaf, color: 'bg-emerald-500' },
                          { id: 'غلہ و اناج', labelUrdu: 'غلہ و اناج / آٹا', labelEn: 'Flour & Grains', icon: Wheat, color: 'bg-amber-500' },
                          { id: 'ڈیری و پولٹری', labelUrdu: 'ڈیری و پولٹری', labelEn: 'Dairy & Poultry', icon: Milk, color: 'bg-sky-500' },
                          { id: 'کریانہ', labelUrdu: 'کریانہ و تیل', labelEn: 'Groceries & Oil', icon: Package, color: 'bg-orange-500' },
                          { id: 'دالیں', labelUrdu: 'دالیں و لوبیا', labelEn: 'Pulses & Lentils', icon: Layers, color: 'bg-yellow-600' },
                          { id: 'گوشت', labelUrdu: 'بکرے / گائے گوشت', labelEn: 'Fresh Meat', icon: Flame, color: 'bg-rose-500' },
                        ].map((cat) => {
                          const IconComp = cat.icon;
                          const isSelected = reportCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setReportCategory(cat.id);
                                // Pre-fill default item for selected category
                                if (cat.id === 'سبزیاں') {
                                  setReportItem('پیاز درجہ اول (Fresh Onion)');
                                  setReportDcRate(92);
                                  setReportChargedPrice(120);
                                } else if (cat.id === 'غلہ و اناج') {
                                  setReportItem('آٹا 10 کلو تھیلا (Flour 10kg)');
                                  setReportDcRate(1350);
                                  setReportChargedPrice(1500);
                                } else if (cat.id === 'ڈیری و پولٹری') {
                                  setReportItem('کھلا دودھ خالص (Fresh Milk)');
                                  setReportDcRate(195);
                                  setReportChargedPrice(240);
                                } else if (cat.id === 'کریانہ') {
                                  setReportItem('چینی ریٹیل (Sugar)');
                                  setReportDcRate(138);
                                  setReportChargedPrice(165);
                                } else if (cat.id === 'دالیں') {
                                  setReportItem('دال چنا سپیشل (Lentil Gram)');
                                  setReportDcRate(240);
                                  setReportChargedPrice(290);
                                } else if (cat.id === 'گوشت') {
                                  setReportItem('زندہ مرغی برائلر (Live Broiler)');
                                  setReportDcRate(385);
                                  setReportChargedPrice(450);
                                }
                              }}
                              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#04231A] text-white border-2 border-[#E3A82B] shadow-lg scale-[1.02]'
                                  : 'bg-white text-[#04231A] border-[#178A52]/20 hover:border-[#178A52] hover:bg-[#EAF5EF]'
                              }`}
                            >
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow ${
                                isSelected ? 'bg-[#178A52]' : cat.color
                              }`}>
                                <IconComp className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="font-sora font-extrabold text-xs block">
                                  {isUrdu ? cat.labelUrdu : cat.labelEn}
                                </span>
                                <span className={`text-[10px] font-mono ${isSelected ? 'text-[#E3A82B]' : 'text-[#5C6F63]'}`}>
                                  {cat.labelEn}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Item Chips with DC Rates */}
                    <div>
                      <label className="text-xs font-bold text-[#04231A] mb-1.5 block">
                        {isUrdu ? 'مقبول اشیاء (1-Click Item Selection):' : 'Popular Daily Staples (1-Click Select):'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(reportCategory === 'سبزیاں' ? [
                          { name: 'پیاز درجہ اول (Fresh Onion)', dc: 92, charged: 120 },
                          { name: 'ٹماٹر درجہ اول (Fresh Tomato)', dc: 130, charged: 170 },
                          { name: 'آلو سفید (Potato)', dc: 68, charged: 90 },
                          { name: 'ادرک چائنہ (Ginger)', dc: 480, charged: 600 },
                          { name: 'لہسن دیسی (Garlic)', dc: 360, charged: 440 },
                        ] : reportCategory === 'غلہ و اناج' ? [
                          { name: 'آٹا 10 کلو تھیلا (Flour 10kg)', dc: 1350, charged: 1500 },
                          { name: 'آٹا 20 کلو تھیلا (Flour 20kg)', dc: 2650, charged: 2900 },
                          { name: 'باسمتی چاول پرانا (Rice)', dc: 290, charged: 350 },
                          { name: 'چینی سفید (Sugar)', dc: 138, charged: 165 },
                        ] : reportCategory === 'ڈیری و پولٹری' ? [
                          { name: 'کھلا دودھ خالص (Fresh Milk)', dc: 195, charged: 240 },
                          { name: 'دہی خالص (Yogurt)', dc: 210, charged: 250 },
                          { name: 'انڈے فارمی (Eggs / Dozen)', dc: 280, charged: 340 },
                          { name: 'زندہ مرغی برائلر (Chicken)', dc: 385, charged: 450 },
                        ] : reportCategory === 'دالیں' ? [
                          { name: 'دال چنا سپیشل (Gram Pulse)', dc: 240, charged: 290 },
                          { name: 'دال ماش دھلی (Mash Pulse)', dc: 490, charged: 580 },
                          { name: 'دال مسور موٹی (Masoor)', dc: 270, charged: 320 },
                          { name: 'دال مونگ (Moong)', dc: 280, charged: 340 },
                        ] : [
                          { name: 'ڈالڈا گھی پاؤچ (Ghee 1kg)', dc: 490, charged: 560 },
                          { name: 'کوکنگ آئل 1 لٹر (Oil 1L)', dc: 510, charged: 590 },
                          { name: 'چائے پتی 900 گرام (Tea)', dc: 1450, charged: 1700 },
                          { name: 'لال مرچ پاؤڈر (Chili)', dc: 820, charged: 980 },
                        ]).map((itemObj) => (
                          <button
                            key={itemObj.name}
                            type="button"
                            onClick={() => {
                              setReportItem(itemObj.name);
                              setReportDcRate(itemObj.dc);
                              setReportChargedPrice(itemObj.charged);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              reportItem === itemObj.name
                                ? 'bg-[#178A52] text-white border-[#E3A82B]'
                                : 'bg-white text-[#04231A] border-[#178A52]/30 hover:border-[#178A52]'
                            }`}
                          >
                            <span>{itemObj.name}</span>
                            <span className="font-mono text-[10px] bg-black/10 px-1.5 py-0.5 rounded">
                              DC: Rs.{itemObj.dc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Item Name Input */}
                    <div>
                      <label className="text-xs font-bold text-[#04231A] mb-1 block">
                        {isUrdu ? 'یا اپنی مرضی کی شے کا نام لکھیں:' : 'Or type item name:'}
                      </label>
                      <input
                        type="text"
                        value={reportItem}
                        onChange={(e) => setReportItem(e.target.value)}
                        placeholder="e.g. پیاز، آٹا، چینی، دودھ"
                        required
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#132A21] focus:outline-none focus:border-[#178A52] shadow-sm"
                      />
                    </div>

                    {/* Next Step Button */}
                    <button
                      type="button"
                      onClick={() => setReportStep(2)}
                      className="w-full bg-[#178A52] hover:bg-[#0B4A31] text-white font-extrabold py-3 rounded-2xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
                    >
                      <span>{isUrdu ? 'اگلا مرحلہ: مارکیٹ و وصول شدہ قیمت درج کریں' : 'Next: Enter Market Location & Price'}</span>
                      <ChevronRight className="w-4 h-4 text-[#E3A82B]" />
                    </button>
                  </div>
                )}

                {/* ================= STEP 2: LOCATION & PRICE COMPARISON ================= */}
                {reportStep === 2 && (
                  <div className="space-y-4 animate-fadeUp">
                    {/* Selected Item Summary Header */}
                    <div className="p-3 rounded-2xl bg-[#178A52]/10 border border-[#178A52]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#178A52]" />
                        <span className="font-bold text-xs text-[#04231A]">{reportItem}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#178A52] bg-white px-2 py-0.5 rounded-lg">
                        DC Rate: Rs. {reportDcRate}
                      </span>
                    </div>

                    {/* Market Location with Quick Chips */}
                    <div>
                      <label className="text-xs font-extrabold text-[#04231A] mb-1.5 block flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#178A52]" />
                        <span>{isUrdu ? '2. مارکیٹ یا بازار کا مقام' : '2. Market Location & City'}</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[
                          'راجہ بازار، راولپنڈی',
                          'انارکلی بازار، لاہور',
                          'صدر بازار، کراچی',
                          'قصہ خوانی بازار، پشاور',
                          'لیاقت بازار، کوئٹہ',
                          'جی نائن مرکز، اسلام آباد',
                        ].map((mkt) => (
                          <button
                            key={mkt}
                            type="button"
                            onClick={() => setReportMarket(mkt)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                              reportMarket === mkt
                                ? 'bg-[#04231A] text-[#E3A82B] border-[#E3A82B]'
                                : 'bg-white text-[#04231A] border-[#178A52]/20 hover:bg-[#EAF5EF]'
                            }`}
                          >
                            {mkt}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={reportMarket}
                        onChange={(e) => setReportMarket(e.target.value)}
                        placeholder="e.g. راجہ بازار، راولپنڈی یا گلی نمبر"
                        required
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#132A21] focus:outline-none focus:border-[#178A52] shadow-sm"
                      />
                    </div>

                    {/* Vendor / Stall Name */}
                    <div>
                      <label className="text-xs font-bold text-[#04231A] mb-1 block flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-[#178A52]" />
                        <span>{isUrdu ? 'دکان یا ریڑھی کا نام / نمبر (اختیاری):' : 'Shop / Stall Name or Number (Optional):'}</span>
                      </label>
                      <input
                        type="text"
                        value={reportVendor}
                        onChange={(e) => setReportVendor(e.target.value)}
                        placeholder={isUrdu ? 'مثلاً فرحان سبزی والا (سلاٹ نمبر 19)' : 'e.g. Farhan Sabzi (Stall 19)'}
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#132A21] focus:outline-none focus:border-[#178A52] shadow-sm"
                      />
                    </div>

                    {/* Rates Comparison Visual Cards */}
                    <div className="grid grid-cols-2 gap-3 bg-[#F6F2E7] p-4 rounded-2xl border border-[#178A52]/20">
                      <div>
                        <label className="text-xs font-extrabold text-[#178A52] mb-1 block">
                          {isUrdu ? 'سرکاری ڈی سی ریٹ (Rs.)' : 'Official DC Rate (Rs.)'}
                        </label>
                        <input
                          type="number"
                          value={reportDcRate}
                          onChange={(e) => setReportDcRate(Number(e.target.value))}
                          required
                          className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-base font-extrabold text-[#178A52] focus:outline-none focus:border-[#178A52] shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-extrabold text-[#C4572D] mb-1 block">
                          {isUrdu ? 'وصول کی گئی قیمت (Rs.)' : 'Charged Price (Rs.)'}
                        </label>
                        <input
                          type="number"
                          value={reportChargedPrice}
                          onChange={(e) => setReportChargedPrice(Number(e.target.value))}
                          required
                          className="w-full bg-white border border-[#C4572D]/50 rounded-xl px-3 py-2 text-base font-extrabold text-[#C4572D] focus:outline-none focus:border-[#C4572D] shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Real-time Overcharge Variance Dial */}
                    {reportDcRate > 0 && reportChargedPrice > 0 && (
                      <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        reportChargedPrice > reportDcRate
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-5 h-5 ${reportChargedPrice > reportDcRate ? 'text-red-600' : 'text-emerald-600'}`} />
                          <div>
                            <span className="font-bold text-xs">
                              {reportChargedPrice > reportDcRate 
                                ? (isUrdu ? 'گراں فروشی کا تناسب (Overcharge Variance)' : 'Overcharge Disparity') 
                                : (isUrdu ? 'قیمت سرکاری نرخ کے برابر ہے' : 'Fair Price Level')}
                            </span>
                            <p className="text-[11px] font-urdu">
                              {reportChargedPrice > reportDcRate
                                ? `ڈی سی ریٹ سے Rs. ${reportChargedPrice - reportDcRate} زائد وصول کیے گئے`
                                : 'کوئی خلاف ورزی نہیں پائی گئی'}
                            </p>
                          </div>
                        </div>
                        <span className={`font-sora font-extrabold text-base px-3 py-1 rounded-xl ${
                          reportChargedPrice > reportDcRate ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {reportChargedPrice > reportDcRate 
                            ? `+${(((reportChargedPrice - reportDcRate) / reportDcRate) * 100).toFixed(1)}%` 
                            : '0%'}
                        </span>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setReportStep(1)}
                        className="px-4 py-3 rounded-2xl bg-white border border-[#178A52]/30 text-[#04231A] font-bold text-xs flex items-center gap-1.5 hover:bg-[#EAF5EF]"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{isUrdu ? 'پچھلا' : 'Back'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportStep(3)}
                        className="flex-1 bg-[#178A52] hover:bg-[#0B4A31] text-white font-extrabold py-3 rounded-2xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
                      >
                        <span>{isUrdu ? 'اگلا مرحلہ: تصویر و گمنام تصدیق' : 'Next: Photo Evidence & Confirm'}</span>
                        <ChevronRight className="w-4 h-4 text-[#E3A82B]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= STEP 3: EVIDENCE & 1-TAP DISPATCH ================= */}
                {reportStep === 3 && (
                  <div className="space-y-4 animate-fadeUp">
                    {/* Summary Card Before Submit */}
                    <div className="p-4 rounded-2xl bg-[#04231A] text-white border-2 border-[#E3A82B] space-y-2">
                      <div className="flex items-center justify-between border-b border-[#178A52]/40 pb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#E3A82B]" />
                          <span className="font-bold text-xs">{isUrdu ? 'شکایت کا حتمی خلاصہ' : 'Report Verification Summary'}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-[#178A52] text-white px-2 py-0.5 rounded-full">
                          Ready to Dispatch
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#DCEFE4]/70 text-[10px] block">{isUrdu ? 'شے / آئٹم' : 'Item'}:</span>
                          <span className="font-bold text-white">{reportItem}</span>
                        </div>
                        <div>
                          <span className="text-[#DCEFE4]/70 text-[10px] block">{isUrdu ? 'مقام' : 'Market'}:</span>
                          <span className="font-bold text-white">{reportMarket}</span>
                        </div>
                        <div>
                          <span className="text-[#DCEFE4]/70 text-[10px] block">{isUrdu ? 'ڈی سی ریٹ' : 'DC Rate'}:</span>
                          <span className="font-mono text-[#E3A82B]">Rs. {reportDcRate}</span>
                        </div>
                        <div>
                          <span className="text-[#DCEFE4]/70 text-[10px] block">{isUrdu ? 'وصول شدہ قیمت' : 'Charged Price'}:</span>
                          <span className="font-mono text-red-400 font-bold">Rs. {reportChargedPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Anonymous Toggle Pill */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#178A52]/30 text-[#04231A] flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-[#178A52]" />
                        <div>
                          <span className="font-bold text-xs">
                            {isUrdu ? 'گمنام رپورٹ موڈ (100% Anonymous Mode)' : '100% Anonymous Report'}
                          </span>
                          <p className="text-[10px] text-[#5C6F63] font-urdu">
                            {isUrdu ? 'آپ کا نام اور نمبر کسی دکاندار کو ظاہر نہیں کیا جائے گا۔' : 'Your identity will be kept completely private.'}
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#178A52]" />
                      </label>
                    </div>

                    {/* Photo Evidence Upload */}
                    <div>
                      <label className="text-xs font-bold text-[#04231A] mb-1 block flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#178A52]" />
                        <span>{isUrdu ? 'اختیاری ثبوت: ریٹ لسٹ یا رسید کی تصویر' : 'Optional Evidence: Photo of price tag or receipt'}</span>
                      </label>
                      <div className="border-2 border-dashed border-[#178A52]/40 rounded-2xl p-4 text-center bg-white hover:border-[#178A52] cursor-pointer transition-colors">
                        <Upload className="w-6 h-6 text-[#178A52] mx-auto mb-1" />
                        <p className="text-xs font-bold text-[#04231A]">
                          {reportPhoto ? 'تصویر منسلک ہو گئی (Evidence Attached)' : (isUrdu ? 'تصویر اپ لوڈ کرنے کے لیے کلک کریں' : 'Click to Upload Photo Evidence')}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setReportPhoto(URL.createObjectURL(e.target.files[0]));
                            }
                          }}
                          className="hidden"
                          id="report-photo-input"
                        />
                        <label htmlFor="report-photo-input" className="cursor-pointer text-[11px] text-[#178A52] font-semibold block mt-1">
                          {reportPhoto ? 'تبدیل کریں (Change Photo)' : (isUrdu ? 'فائل منتخب کریں' : 'Browse Files')}
                        </label>
                      </div>
                    </div>

                    {/* Navigation & Submit Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setReportStep(2)}
                        className="px-4 py-3 rounded-2xl bg-white border border-[#178A52]/30 text-[#04231A] font-bold text-xs flex items-center gap-1.5 hover:bg-[#EAF5EF]"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{isUrdu ? 'پچھلا' : 'Back'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={reportSubmitting}
                        className="flex-1 bg-[#178A52] hover:bg-[#0B4A31] text-white font-extrabold py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl transition-transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {reportSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#E3A82B]" />
                            <span>{isUrdu ? 'اے آئی خودکار تصدیق جاری ہے...' : 'AI Verifying against DC List (2.6s)...'}</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-[#E3A82B]" />
                            <span>{isUrdu ? 'شکایت درج کریں اور کارروائی شروع کروائیں (+50 پوائنٹس)' : 'Submit & Dispatch Patrol (+50 Civic Points)'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= 4. MY REPORTS STEPPER ================= */}
      {isMyReportsTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A] flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#178A52]" />
                  <span>{isUrdu ? 'میری شکایات کا لائیو اسٹیٹس (My Reports Tracker)' : 'My Reports Lifecycle'}</span>
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  موصول ➔ خودکار تصدیق ➔ انسپکٹر روانگی ➔ حل شدہ
                </p>
              </div>

              <button
                onClick={() => onSelectTab('report')}
                className="bg-[#178A52] hover:bg-[#178A52]/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow"
              >
                + {isUrdu ? 'نئی شکایت' : 'New Report'}
              </button>
            </div>

            {/* Reports List with Visual Stepper */}
            <div className="space-y-4">
              {reports.map((rep) => {
                const stepIndex = 
                  rep.status === 'received' ? 1 :
                  rep.status === 'verified' ? 2 :
                  rep.status === 'dispatched' ? 3 : 4;

                return (
                  <div
                    key={rep.id}
                    className="p-5 rounded-2xl bg-white border border-[#178A52]/20 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-[#04231A] text-[#E3A82B] px-2.5 py-0.5 rounded-full">
                            {rep.id}
                          </span>
                          <span className="text-xs text-[#5C6F63]">{rep.timestamp}</span>
                          {rep.isAnonymous && (
                            <span className="text-[10px] bg-[#DCEFE4] text-[#0B4A31] font-bold px-2 py-0.2 rounded-full">
                              🔒 Anonymous
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-[#04231A] font-urdu mt-1">
                          {rep.item}
                        </h4>
                        <p className="text-xs text-[#5C6F63]">
                          {rep.vendorName} • {rep.location}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-semibold text-[#5C6F63]">
                          ڈی سی: Rs. {rep.dcRate} vs وصولی: <strong className="text-[#C4572D]">Rs. {rep.chargedPrice}</strong>
                        </div>
                      </div>
                    </div>

                    {/* 4-Step Lifecycle Visual Indicator */}
                    <div className="pt-2 border-t border-[#F6F2E7]">
                      <div className="grid grid-cols-4 gap-1 text-center">
                        <div className={`p-1.5 rounded-lg text-[10px] font-bold ${stepIndex >= 1 ? 'bg-[#178A52] text-white' : 'bg-[#F6F2E7] text-[#5C6F63]'}`}>
                          1. {isUrdu ? 'موصول' : 'Received'}
                        </div>
                        <div className={`p-1.5 rounded-lg text-[10px] font-bold ${stepIndex >= 2 ? 'bg-[#178A52] text-white' : 'bg-[#F6F2E7] text-[#5C6F63]'}`}>
                          2. {isUrdu ? 'تصدیق شدہ' : 'AI Verified'}
                        </div>
                        <div className={`p-1.5 rounded-lg text-[10px] font-bold ${stepIndex >= 3 ? 'bg-[#3D7EA6] text-white' : 'bg-[#F6F2E7] text-[#5C6F63]'}`}>
                          3. {isUrdu ? 'اسکواڈ روانہ' : 'Dispatched'}
                        </div>
                        <div className={`p-1.5 rounded-lg text-[10px] font-bold ${stepIndex >= 4 ? 'bg-[#7BA66B] text-white' : 'bg-[#F6F2E7] text-[#5C6F63]'}`}>
                          4. {isUrdu ? 'حل شدہ' : 'Resolved'}
                        </div>
                      </div>
                    </div>

                    {/* Inspector Resolution Notes if present */}
                    {rep.notes && (
                      <div className="bg-[#DCEFE4]/40 p-2.5 rounded-xl text-xs text-[#0B4A31] font-urdu">
                        💡 {rep.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. GREEN VENDOR DIRECTORY ================= */}
      {isVendorsTab && (
        <div className="space-y-4">
          {/* 1-Click City Slots Map Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#04231A] text-white border-2 border-[#E3A82B] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#178A52] text-white flex items-center justify-center shadow shrink-0">
                <MapPin className="w-6 h-6 text-[#E3A82B] animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base sm:text-lg text-white">
                    {isUrdu ? 'پورا شہر: سرکاری وینڈر سلاٹس اور گوگل میپ زوم' : 'Citywide Zoned Stalls & 1-Click Google Map Zoom'}
                  </h4>
                  <span className="bg-[#E3A82B] text-[#04231A] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    All Pakistan
                  </span>
                </div>
                <p className="text-xs text-[#DCEFE4]/90 font-urdu mt-0.5">
                  {isUrdu 
                    ? 'راولپنڈی، لاہور، اسلام آباد، کراچی، پشاور، کوئٹہ، فیصل آباد اور ملتان کے تمام تصدیق شدہ سلاٹس لائیو دیکھیں' 
                    : 'Interactive 1-Click GPS Zoom across Rawalpindi, Lahore, Islamabad, Karachi & all zones.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onOpenCitySlotsMap) {
                  onOpenCitySlotsMap();
                }
              }}
              className="bg-[#178A52] hover:bg-[#178A52]/80 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl border border-[#E3A82B] transition-transform active:scale-95 shrink-0"
            >
              <Compass className="w-4 h-4 text-[#E3A82B]" />
              <span>{isUrdu ? 'سٹی میپ و سلاٹس کھولیں (1-Click Map)' : 'Open City Slots Map'}</span>
            </button>
          </div>

          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A] flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-[#178A52]" />
                  <span>{isUrdu ? 'تصدیق شدہ گرین دکاندار (Green Vendor Directory)' : 'Certified Green Vendor Directory'}</span>
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  7.0 سے زائد تعمیل اسکور رکھنے والے ایماندار اور صفائی پسند شراکت دار
                </p>
              </div>

              {/* Tier Filter & Scan Trigger */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-3 py-1 rounded-xl text-xs font-extrabold shadow flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#04231A]" />
                  <span>{isUrdu ? 'کیو آر اسکین کریں' : 'Scan Stall QR'}</span>
                </button>

                <div className="flex items-center gap-1 bg-[#04231A] p-0.5 rounded-xl border border-[#178A52]/40">
                  <button
                    onClick={() => setVendorTierFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      vendorTierFilter === 'all' ? 'bg-[#178A52] text-white' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    {isUrdu ? 'تمام' : 'All'}
                  </button>
                  <button
                    onClick={() => setVendorTierFilter('green')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      vendorTierFilter === 'green' ? 'bg-[#178A52] text-white' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    🟢 Green (&gt;7.0)
                  </button>
                  <button
                    onClick={() => setVendorTierFilter('silver')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      vendorTierFilter === 'silver' ? 'bg-[#178A52] text-white' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    ⚪ Silver
                  </button>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-[#5C6F63] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder={isUrdu ? 'دکاندار، دکان یا بازار تلاش کریں...' : 'Search vendor name, stall or bazaar...'}
                className="w-full bg-white border border-[#178A52]/40 rounded-2xl pl-9 pr-4 py-2 text-xs text-[#132A21] placeholder-[#5C6F63]/60 focus:outline-none focus:border-[#178A52]"
              />
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="bg-[#04231A] text-[#E3A82B] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        {vendor.slotNumber}
                      </span>
                      <span className="bg-[#178A52] text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                        ⭐ {vendor.score} / 10
                      </span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-[#04231A]">
                      {isUrdu ? vendor.shopNameUrdu : vendor.shopName}
                    </h4>
                    <p className="text-xs text-[#178A52] font-semibold">
                      {isUrdu ? vendor.nameUrdu : vendor.name}
                    </p>
                    <p className="text-[11px] text-[#5C6F63] mt-1 font-urdu">
                      📍 {isUrdu ? vendor.marketNameUrdu : vendor.marketName}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#F6F2E7] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] bg-[#DCEFE4] text-[#0B4A31] font-bold px-2 py-0.5 rounded-full">
                        🌱 {vendor.wastePoints} Waste Pts
                      </span>
                      <span className="text-[11px] text-[#5C6F63] font-mono">
                        Credit: {vendor.creditScore} / 850
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedVendorForProfile(vendor)}
                        className="bg-[#FCFAF3] hover:bg-[#178A52] text-[#04231A] hover:text-white border border-[#178A52]/30 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#178A52] group-hover:text-white" />
                        <span>{isUrdu ? 'کیو آر بیج' : 'QR Profile'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenVendorAllotment) {
                            onOpenVendorAllotment(vendor.qrId || vendor.slotNumber || vendor.id);
                          } else if (onOpenCitySlotsMap) {
                            onOpenCitySlotsMap(vendor.slotNumber);
                          }
                        }}
                        className="bg-[#0B4A31] hover:bg-[#178A52] text-white py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#E3A82B]" />
                        <span>{isUrdu ? 'گوگل میپ الاٹمنٹ' : 'Maps Allotment'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Simulator Modal */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        lang={lang}
        vendors={vendors}
        onSelectVendor={(v) => {
          setSelectedVendorForProfile(v);
        }}
      />

      {/* Verified Vendor Profile & DC Compliance Modal */}
      <VendorVerifiedProfileModal
        isOpen={!!selectedVendorForProfile}
        onClose={() => setSelectedVendorForProfile(null)}
        vendor={selectedVendorForProfile}
        lang={lang}
        dcRates={dcRates}
        onOpenCitySlotsMap={onOpenCitySlotsMap}
        onOpenReportForVendor={(v) => {
          setReportVendor(`${v.name} (${v.slotNumber})`);
          setReportMarket(v.marketName);
          onSelectTab('report');
        }}
      />
    </div>
  );
};
