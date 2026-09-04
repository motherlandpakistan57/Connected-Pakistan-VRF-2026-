import React, { useState, useEffect } from 'react';
import { 
  Store, QrCode, Clock, Award, ArrowRightLeft, 
  Trash2, CreditCard, BookOpen, CheckCircle, Sparkles, 
  Play, Volume2, Check, AlertCircle, RefreshCw, Printer,
  Eye, Share2, ExternalLink, MapPin, ZoomIn, Droplets, Zap,
  Search, Navigation, ShieldCheck, HeartHandshake, Users, Quote, Star
} from 'lucide-react';
import { Language, VendorProfile, TrainingModule, DCRateItem, CitizenReport, Citation } from '../types';
import { speechService } from '../lib/audio';
import { VRF_TRAININGS, INITIAL_DC_RATES } from '../data/seedData';
import { PAKISTAN_CITY_SLOTS_DATA } from '../data/citySlotsData';
import { VendorQRBadgeModal } from './VendorQRBadgeModal';
import { VendorVerifiedProfileModal } from './VendorVerifiedProfileModal';
import { VendorGeofenceDetailView } from './VendorGeofenceDetailView';

interface VendorViewProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  vendor: VendorProfile;
  dcRates?: DCRateItem[];
  reports?: CitizenReport[];
  citations?: Citation[];
  onVendorRespondToReport?: (reportId: string, responseText: string) => void;
  onVendorRespondToCitation?: (citationId: string, responseText: string) => void;
  onUpdateVendor: (updated: Partial<VendorProfile>) => void;
  onOpenAIGuide: () => void;
  onOpenCitySlotsMap?: (slotId?: string) => void;
  onOpenVendorAllotment?: (vendorId?: string) => void;
}

export const VendorView: React.FC<VendorViewProps> = ({
  activeTab,
  onSelectTab,
  lang,
  vendor,
  dcRates = INITIAL_DC_RATES,
  reports = [],
  citations = [],
  onVendorRespondToReport,
  onVendorRespondToCitation,
  onUpdateVendor,
  onOpenAIGuide,
  onOpenCitySlotsMap,
  onOpenVendorAllotment,
}) => {
  const isUrdu = lang === 'ur';

  // Vendor Right of Reply / Appeals States
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replySuccessMsg, setReplySuccessMsg] = useState<string | null>(null);

  // Modal states for QR Badge generation & Public Profile
  const [showQRBadgeModal, setShowQRBadgeModal] = useState(false);
  const [showVerifiedProfileModal, setShowVerifiedProfileModal] = useState(false);
  const [selectedModalVendor, setSelectedModalVendor] = useState<VendorProfile | null>(null);

  // State for shift rotation timer (8h shift)
  const [shiftHoursLeft, setShiftHoursLeft] = useState(4);
  const [shiftMinsLeft, setShiftMinsLeft] = useState(28);

  // Waste to reward interaction
  const [wasteSuccessMsg, setWasteSuccessMsg] = useState(false);

  // Slot swap modal state
  const [swapTargetSlot, setSwapTargetSlot] = useState('سلاٹ 14 (صبح شفٹ)');
  const [swapSuccess, setSwapSuccess] = useState(false);

  // Micro-loan application state
  const [loanApplied, setLoanApplied] = useState(false);

  // Vendor Geofence Search state
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');

  // Government Official Inbound Transmissions & Direct Deliveries
  const [transmissions, setTransmissions] = useState<any[]>([]);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cp_vendor_transmissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransmissions(parsed);
          return;
        }
      }
      // Default initial welcome transmission from AC office if none yet
      const initialDispatch = [
        {
          id: 'TRX-DEFAULT-01',
          officialName: 'احمد فاروق (اسسٹنٹ کمشنر صدر)',
          officialDept: 'محکمہ بلدیات و پرائس کنٹرول سیل',
          vendorId: vendor.id,
          vendorName: vendor.name,
          slotNumber: vendor.slotNumber,
          subjectUrdu: 'باضابطہ جیو فینس کیو آر اسٹیکر و سرکاری سبسڈی کٹ کی تفویض',
          notesUrdu: 'آپ کو پنجاب اسٹریٹ وینڈر ریگولیشن ایکٹ 2026 کے تحت باضابطہ قانونی تحفظ اور ڈی سی پرائس سیل کی طرف سے سبسڈی منظور کی گئی ہے۔ سامان اپنے قریبی سہولت مرکز سے وصول کر سکتے ہیں۔',
          items: [
            { id: 'item-1', nameUrdu: 'سرکاری ڈیجیٹل کیلیبریٹڈ ترازو (Approved Scale)', qty: 1 },
            { id: 'item-2', nameUrdu: 'سولر ایل ای ڈی اسٹال لائٹ کٹ (Govt Subsidized)', qty: 1 },
            { id: 'item-3', nameUrdu: 'واٹر پروف پرنٹڈ کیو آر کوڈ اسٹیکر', qty: 2 },
          ],
          fileName: 'Govt_Official_Slot_Allotment_RWP19.pdf',
          fileSize: '1.4 MB',
          date: '2026-02-28',
          status: 'delivered'
        }
      ];
      setTransmissions(initialDispatch);
      localStorage.setItem('cp_vendor_transmissions', JSON.stringify(initialDispatch));
    } catch (e) {
      // ignore
    }
  }, [vendor]);

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds(prev => ({ ...prev, [id]: true }));
    speechService.confirmVendorAction(
      lang,
      'حکومتی ترسیل و سامان کی وصولی کی تصدیق ریکارڈ میں درج ہو چکی ہے۔ شکریہ!',
      'Government dispatch acknowledged and verified successfully. Thank you!'
    );
  };

  // Active training state
  const [trainings, setTrainings] = useState<TrainingModule[]>(VRF_TRAININGS);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScoreFeedback, setQuizScoreFeedback] = useState<string | null>(null);

  // Daily coaching tip
  const coachingTipUrdu = 'ڈی سی نرخ کی فہرست گاہک کو واضح دکھائیں؛ وزن ہمیشہ ڈیجیٹل اسکیل پر پورا تولیں تاکہ آپ کا تعمیل اسکور 8.0 سے تجاوز کرے۔';
  const coachingTipEn = 'Display the official DC rate sheet clearly; always use a calibrated scale to maintain a score above 8.0.';

  const handleWasteLog = () => {
    const newPoints = vendor.wastePoints + 15;
    onUpdateVendor({ wastePoints: newPoints });
    setWasteSuccessMsg(true);
    
    // Voice confirmation
    speechService.confirmVendorAction(
      lang,
      'آپ کے پندرہ زیرو ویسٹ پوائنٹس کامیابی سے درج ہو گئے۔ ڈی سی گرین فنڈ کی طرف سے شکریہ!',
      '15 Zero-Waste reward points successfully credited to your account. Thank you!'
    );

    setTimeout(() => setWasteSuccessMsg(false), 4000);
  };

  const handleQuizSubmit = (trainingId: string, correctIndex: number) => {
    if (selectedAnswer === correctIndex) {
      const newScore = Math.min(10, +(vendor.score + 0.05).toFixed(2));
      const newCredit = Math.min(850, vendor.creditScore + 10);
      onUpdateVendor({ score: newScore, creditScore: newCredit });

      setTrainings(prev => prev.map(t => t.id === trainingId ? { ...t, completed: true } : t));
      setQuizScoreFeedback(isUrdu ? 'بہترین! درست جواب — آپ کے اسکور میں +0.05 کا اضافہ کر دیا گیا ہے۔' : 'Correct! +0.05 added to your compliance score.');
      
      // Voice confirmation
      speechService.confirmVendorAction(
        lang,
        'بہترین! تربیتی سوال کا درست جواب۔ آپ کے تعمیل اسکور میں اضافہ کر دیا گیا ہے۔',
        'Excellent! Correct answer submitted. Your compliance rating is upgraded.'
      );
    } else {
      speechService.playChime('alert');
      setQuizScoreFeedback(isUrdu ? 'غلط جواب — دوبارہ کوشش کریں۔' : 'Incorrect, please try again.');
    }
  };

  // Calculate pending / active cases or inquiries involving this vendor or their market zone
  const relevantReports = reports.filter(r => 
    r.vendorName.toLowerCase().includes(vendor.name.toLowerCase()) || 
    r.vendorName.toLowerCase().includes(vendor.shopName.toLowerCase()) ||
    r.location.toLowerCase().includes(vendor.slotNumber.toLowerCase()) ||
    r.location.includes('راجہ بازار')
  );

  const pendingAppealsCount = relevantReports.filter(r => r.status !== 'resolved').length;

  // Sub-tabs list for quick intra-view navigation
  const vendorTabs = [
    { id: 'dashboard', labelUrdu: 'کیو آر لائسنس', labelEn: 'QR License', icon: QrCode },
    { id: 'appeals', labelUrdu: 'حقِ صفائی و سماعت (Right of Reply)', labelEn: 'Right of Reply', icon: ShieldCheck, count: pendingAppealsCount },
    { id: 'geofence', labelUrdu: 'جیو فینس ان سائیٹ (نقشہ)', labelEn: 'Geofence Insight', icon: Navigation },
    { id: 'slot', labelUrdu: 'سلاٹ مینجمنٹ', labelEn: 'Slot Rotation', icon: Clock },
    { id: 'waste', labelUrdu: 'زیرو ویسٹ انعامات', labelEn: 'Waste Rewards', icon: Trash2 },
    { id: 'micropay', labelUrdu: 'مائیکرو پے کریڈٹ', labelEn: 'MicroPay', icon: CreditCard },
    { id: 'coaching', labelUrdu: 'تربیتی ماڈیولز', labelEn: 'Coaching', icon: BookOpen },
    { id: 'stories', labelUrdu: 'محنت کشوں کا وقار و کہانیاں', labelEn: 'Vendor Stories', icon: HeartHandshake },
  ];

  const handleTriggerGeofenceSearch = (term: string) => {
    setVendorSearchTerm(term);
    onSelectTab('geofence');
    speechService.confirmVendorAction(
      lang,
      `جیو فینس نقشہ ${term} کے سرکاری تفویض شدہ کوآرڈینیٹس پر زوم کر رہا ہے۔`,
      `Zooming geofence satellite map onto coordinates for ${term}.`
    );
  };

  const isAppealsTab = activeTab === 'appeals' || activeTab === 'vendor_appeals' || activeTab === 'right_of_reply';
  const isGeofenceTab = activeTab === 'geofence' || activeTab === 'vendor_geofence' || activeTab === 'geofence_insight';
  const isSlotTab = activeTab === 'vendor_slots' || activeTab === 'slot' || activeTab === 'slots' || activeTab === 'vendor_slot';
  const isWasteTab = activeTab === 'vendor_waste' || activeTab === 'waste';
  const isMicropayTab = activeTab === 'vendor_micropay' || activeTab === 'micropay';
  const isCoachingTab = activeTab === 'vendor_coaching' || activeTab === 'coaching';
  const isStoriesTab = activeTab === 'stories' || activeTab === 'vendor_stories';
  const isDashboardTab = activeTab === 'vendor_dashboard' || activeTab === 'dashboard' || activeTab === 'overview' || (!isAppealsTab && !isGeofenceTab && !isSlotTab && !isWasteTab && !isMicropayTab && !isCoachingTab && !isStoriesTab);

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Executive Sub-Tab Navigation Bar for Vendor */}
      <div className="bg-[#04231A] p-2 rounded-2xl border border-[#178A52]/40 shadow-lg overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {vendorTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              (tab.id === 'dashboard' && isDashboardTab) ||
              (tab.id === 'appeals' && isAppealsTab) ||
              (tab.id === 'geofence' && isGeofenceTab) ||
              (tab.id === 'slot' && isSlotTab) ||
              (tab.id === 'waste' && isWasteTab) ||
              (tab.id === 'micropay' && isMicropayTab) ||
              (tab.id === 'coaching' && isCoachingTab) ||
              (tab.id === 'stories' && isStoriesTab);

            return (
              <button
                key={tab.id}
                id={`vendor-subtab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#178A52] text-white shadow-md border border-[#E3A82B]/60'
                    : 'text-[#DCEFE4]/80 hover:text-white hover:bg-[#0B4A31]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E3A82B]' : 'text-[#178A52]'}`} />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? tab.labelUrdu : tab.labelEn}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-[#E3A82B] text-[#04231A] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 1. VENDOR DASHBOARD ================= */}
      {isDashboardTab && (
        <div className="space-y-6">
          {/* Main QR License Hero Card */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#E3A82B] shadow-2xl text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Profile & Shift Overview */}
              <div className="space-y-3 flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-[#178A52] text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                  <Store className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>{isUrdu ? 'سرکاری رجسٹرڈ دکاندار فریم ورک' : 'Verified Vendor Partner'}</span>
                </div>

                <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
                  {isUrdu ? vendor.shopNameUrdu : vendor.shopName}
                </h2>
                <p className="text-sm text-[#DCEFE4] font-urdu">
                  شراکت دار: <strong className="text-[#E3A82B]">{isUrdu ? vendor.nameUrdu : vendor.name}</strong> • شناختی کارڈ: {vendor.cnic}
                </p>

                {/* 8-Hour Shift Clock Ring */}
                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-4 flex items-center justify-between gap-4 max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#178A52] flex items-center justify-center text-[#E3A82B] shadow">
                      <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'فعال شفٹ ٹائمر' : 'Active 8h Shift'}</span>
                      <strong className="text-sm font-mono text-white">
                        {shiftHoursLeft}h {shiftMinsLeft}m {isUrdu ? 'باقی ہیں' : 'Remaining'}
                      </strong>
                    </div>
                  </div>

                  <span className="text-xs bg-[#E3A82B] text-[#04231A] font-bold px-3 py-1 rounded-xl">
                    {vendor.shiftTime}
                  </span>
                </div>
              </div>

              {/* Digital QR License Box & Generator Trigger */}
              <div 
                onClick={() => setShowQRBadgeModal(true)}
                className="bg-white p-5 rounded-3xl text-center shadow-2xl border-4 border-[#E3A82B] shrink-0 text-[#132A21] cursor-pointer hover:scale-105 active:scale-95 transition-all group relative"
                title="Click to open QR Badge Studio"
              >
                <div className="w-36 h-36 mx-auto bg-[#F6F2E7] rounded-2xl p-2 border-2 border-dashed border-[#178A52] flex flex-col items-center justify-center relative group-hover:bg-[#DCEFE4] transition-colors">
                  <QrCode className="w-24 h-24 text-[#04231A]" />
                  <span className="text-[9px] font-mono font-bold bg-[#178A52] text-white px-2 py-0.2 rounded-full absolute bottom-1">
                    {vendor.qrId}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-sora font-extrabold text-sm text-[#04231A] block">
                    {vendor.slotNumber}
                  </span>
                  <span className="text-[10px] bg-[#178A52]/10 text-[#178A52] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                    🟢 Green Verified Tier
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-[#178A52]/20 flex items-center justify-center gap-1 text-[11px] font-bold text-[#178A52] group-hover:text-[#04231A]">
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'کیو آر بیج پرنٹ کریں' : 'Generate & Print'}</span>
                </div>
              </div>
            </div>

            {/* Quick QR & Verification Actions Bar */}
            <div className="mt-5 p-3 rounded-2xl bg-[#04231A]/90 border border-[#E3A82B]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#178A52] animate-pulse" />
                <span className="text-xs font-bold text-white font-urdu">
                  {isUrdu ? 'سرکاری کیو آر کوڈ اور ڈی سی ریٹنگ لائیو سرور سے منسلک ہے۔' : 'Official QR Code and DC Rating are live and verified.'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    if (onOpenVendorAllotment) {
                      onOpenVendorAllotment(vendor.qrId || vendor.slotNumber);
                    } else if (onOpenCitySlotsMap) {
                      onOpenCitySlotsMap('RWP-RBZ-A-19');
                    }
                  }}
                  className="bg-[#0B4A31] hover:bg-[#178A52] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[#E3A82B] shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'سرکاری مقام و نقشہ الاٹمنٹ' : 'Official Map & Allotment'}</span>
                </button>

                <button
                  onClick={() => setShowQRBadgeModal(true)}
                  className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <QrCode className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'کیو آر بیج اسٹوڈیو کھولیں' : 'Open QR Badge Studio'}</span>
                </button>

                <button
                  onClick={() => setShowVerifiedProfileModal(true)}
                  className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isUrdu ? 'خریدار کا منظر دیکھیں' : 'Preview Citizen View'}</span>
                </button>
              </div>
            </div>

            {/* Score & Tier Progress Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#178A52]/40">
              <div className="bg-[#04231A]/80 border border-[#178A52]/50 rounded-2xl p-3 text-center">
                <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'تعمیل اسکور' : 'Compliance Score'}</span>
                <span className="font-sora font-extrabold text-xl sm:text-2xl text-[#E3A82B]">{vendor.score} / 10</span>
                <span className="text-[10px] text-[#178A52] block font-bold">Top 5% in Zone</span>
              </div>

              <div className="bg-[#04231A]/80 border border-[#178A52]/50 rounded-2xl p-3 text-center">
                <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'ویسٹ پوائنٹس' : 'Waste Points'}</span>
                <span className="font-sora font-extrabold text-xl sm:text-2xl text-white">{vendor.wastePoints} / 100</span>
                <span className="text-[10px] text-[#E3A82B] block font-bold">Free Kit at 100</span>
              </div>

              <div className="bg-[#04231A]/80 border border-[#178A52]/50 rounded-2xl p-3 text-center">
                <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'مائیکرو کریڈٹ' : 'Credit Score'}</span>
                <span className="font-sora font-extrabold text-xl sm:text-2xl text-[#178A52]">{vendor.creditScore} / 850</span>
                <span className="text-[10px] text-white block font-bold">Rs. 15,000 Eligible</span>
              </div>

              <div className="bg-[#04231A]/80 border border-[#178A52]/50 rounded-2xl p-3 text-center">
                <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'زیرو بے دخلی گارنٹی' : 'Eviction Shield'}</span>
                <span className="font-sora font-extrabold text-lg sm:text-xl text-[#F4D58D]">100% Guaranteed</span>
                <span className="text-[10px] text-[#DCEFE4]/70 block">VRF Act 2026</span>
              </div>
            </div>
          </div>

          {/* RIGHT OF REPLY & CLOSED-LOOP NOTIFICATION CARD */}
          <div className="bg-gradient-to-r from-[#04231A] to-[#0B4A31] rounded-3xl p-6 border-2 border-[#E3A82B]/60 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E3A82B] text-[#04231A] flex items-center justify-center font-bold shadow-md shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 bg-[#178A52] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  <span>VRF ARTICLE 14 PROTECTION</span>
                  <span>•</span>
                  <span>حقِ صفائی و وقار</span>
                </div>
                <h3 className="font-sora font-extrabold text-lg text-white">
                  {isUrdu ? 'باضابطہ حقِ صفائی و شہری انکوائری نوٹسز (Right of Reply)' : 'Official Right of Reply & Open Hearings'}
                </h3>
                <p className="text-xs text-[#DCEFE4] font-urdu">
                  {isUrdu
                    ? `آپ کے اسٹال و مارکیٹ سے متعلق ${relevantReports.length} شہری انکوائریز درج ہیں۔ کسی سزا سے قبل اپنا تحریری موقف اور ہول سیل پرچی درج کرائیں۔`
                    : `${relevantReports.length} citizen price inquiries active. Submit wholesale receipts or official explanation before any enforcement.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('appeals')}
              className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-lg flex items-center gap-2 shrink-0 transition-transform active:scale-95"
            >
              <span>{isUrdu ? 'موقف درج کریں (Right of Reply)' : 'View & File Explanation'}</span>
              <span className="bg-[#04231A] text-white text-[10px] px-2 py-0.5 rounded-full">
                {pendingAppealsCount}
              </span>
            </button>
          </div>

          {/* INBOUND GOVERNMENT OFFICIAL DISPATCHES & EQUIPMENT TRANSMISSIONS */}
          {transmissions.length > 0 && (
            <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-7 border-2 border-[#178A52]/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#F6F2E7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0B4A31] text-white flex items-center justify-center shadow">
                    <ShieldCheck className="w-5 h-5 text-[#E3A82B]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sora font-extrabold text-base sm:text-lg text-[#04231A]">
                        {isUrdu ? 'سرکاری احکامات و سامان کی ترسیل (Govt Dispatches)' : 'Official Government Inbound Deliveries & Notices'}
                      </h3>
                      <span className="text-[10px] bg-[#178A52] text-white font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {transmissions.length} New
                      </span>
                    </div>
                    <p className="text-xs text-[#5C6F63] font-urdu">
                      سرکاری افسر یا مجسٹریٹ کی جانب سے آپ کے اسٹال کو براہ راست بھیجی گئی اشیاء، فائلیں و نوٹسز۔
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-[#178A52] bg-[#178A52]/10 px-2.5 py-1 rounded-xl">
                  {isUrdu ? 'خودکار ڈیجیٹل وصولی' : 'Auto-Sync Active'}
                </span>
              </div>

              <div className="space-y-3">
                {transmissions.map((t, idx) => {
                  const isAcked = acknowledgedIds[t.id || idx];
                  return (
                    <div
                      key={t.id || idx}
                      className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] shadow-xs space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#04231A] font-urdu">
                              {t.subjectUrdu || t.subject || 'سرکاری ترسیل و سامان'}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.2 bg-[#04231A] text-[#E3A82B] rounded-full">
                              {t.id || 'TRX-GOV'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5">
                            بھیجنے والے افسر: <strong className="text-[#0B4A31]">{t.officialName}</strong> ({t.officialDept}) • {t.date}
                          </p>
                        </div>

                        {isAcked ? (
                          <span className="bg-[#178A52]/15 text-[#178A52] font-bold text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 font-urdu">
                            <Check className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'رسید وصولی کی تصدیق ہو گئی' : 'Delivery Acknowledged'}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcknowledge(t.id || idx)}
                            className="bg-[#178A52] hover:bg-[#178A52]/90 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow transition-transform active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5 text-[#E3A82B]" />
                            <span>{isUrdu ? 'وصولی کی تصدیق کریں (Acknowledge)' : 'Acknowledge Receipt'}</span>
                          </button>
                        )}
                      </div>

                      {t.notesUrdu && (
                        <p className="text-xs text-[#04231A] font-urdu bg-[#FCFAF3] p-2.5 rounded-xl border border-[#178A52]/10 leading-relaxed">
                          {t.notesUrdu}
                        </p>
                      )}

                      {/* Equipment & Attached items */}
                      {t.items && t.items.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-[#04231A] block font-urdu">
                            {isUrdu ? 'تفویض شدہ سرکاری سامان:' : 'Assigned Equipment & Kits:'}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {t.items.map((item: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-xl bg-[#F6F2E7]/70 border border-[#178A52]/15 text-xs font-urdu"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#178A52]" />
                                  <span className="font-bold text-[#04231A]">{item.nameUrdu || item.name}</span>
                                </div>
                                <span className="font-mono font-bold text-[#0B4A31] bg-white px-2 py-0.5 rounded-md text-[10px]">
                                  تعداد: {item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Document file if present */}
                      {t.fileName && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#DCEFE4]/40 border border-[#178A52]/30 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📄</span>
                            <div>
                              <span className="font-bold text-[#04231A] block">{t.fileName}</span>
                              <span className="text-[10px] text-[#5C6F63]">{t.fileSize || 'Official PDF'} • Verified Cryptographic Hash</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-[#178A52] bg-white px-2.5 py-1 rounded-lg border border-[#178A52]/20">
                            {isUrdu ? 'محفوظ سرکاری دستاویز' : 'Verified Document'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Coaching Tip of the Day */}
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21] flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E3A82B] text-[#04231A] flex items-center justify-center font-bold">
                💡
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#04231A]">
                  {isUrdu ? 'آج کا مشورہ برائے دکاندار (Coaching Tip):' : 'Daily Vendor Coaching Tip:'}
                </h4>
                <p className="text-xs text-[#5C6F63] font-urdu max-w-xl mt-0.5">
                  {isUrdu ? coachingTipUrdu : coachingTipEn}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                speechService.speak(isUrdu ? coachingTipUrdu : coachingTipEn, { lang: isUrdu ? 'ur' : 'en' });
              }}
              className="bg-[#178A52] hover:bg-[#178A52]/80 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#E3A82B]" />
              <span>{isUrdu ? 'سنیں' : 'Listen'}</span>
            </button>
          </div>

          {/* NATIONWIDE VENDOR GEOFENCED AREA & QR VERIFICATION FINDER */}
          <div className="bg-[#04231A] rounded-3xl p-6 border-2 border-[#E3A82B] shadow-2xl text-white space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#178A52]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#178A52] text-[#E3A82B] flex items-center justify-center border border-[#E3A82B]">
                  <Search className="w-5 h-5 text-[#E3A82B]" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-lg text-white">
                    {isUrdu ? 'کسی بھی وینڈر کی قانونی جیو فینس جگہ اور کیو آر کوڈ دیکھیں' : 'Nationwide Vendor Geofence & QR Space Finder'}
                  </h3>
                  <p className="text-xs text-[#DCEFE4]/80 font-urdu">
                    {isUrdu ? 'نام یا شناختی کوڈ درج کریں — کیمرہ خود بخود مائیکرو لیول پر زوم کرے گا۔' : 'Type any merchant name or ID to zoom into their micro-geospatial zone.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTriggerGeofenceSearch(vendorSearchTerm || vendor.name)}
                  className="px-3.5 py-2 rounded-xl bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] text-xs font-black flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{isUrdu ? 'جیو فینس کی تفصیل دیکھیں' : 'Geofence Detail'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenCitySlotsMap) onOpenCitySlotsMap();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#178A52] hover:bg-[#0B4A31] text-white border border-[#E3A82B] text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'شہر کا نقشہ' : 'City Grid'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#E3A82B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vendorSearchTerm}
                  onChange={(e) => setVendorSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && vendorSearchTerm.trim()) {
                      handleTriggerGeofenceSearch(vendorSearchTerm.trim());
                    }
                  }}
                  placeholder={isUrdu ? 'وینڈر کا نام، سلاٹ کوڈ (مثلاً RWP-19, LHR-14) یا شہر تلاش کریں...' : 'Search vendor name, slot ID (e.g. RWP-19, LHR-14, KHI-01)...'}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B4A31] text-white placeholder-[#DCEFE4]/60 rounded-xl border border-[#178A52] focus:border-[#E3A82B] focus:outline-none text-xs font-medium"
                />
              </div>
              <button
                onClick={() => handleTriggerGeofenceSearch(vendorSearchTerm || 'RWP-RBZ-A-19')}
                className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-[#E3A82B] shadow flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5 text-[#E3A82B]" />
                <span>{isUrdu ? 'تلاش و زوم' : 'Search & Zoom'}</span>
              </button>
            </div>

            {/* Quick Vendor Selector Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                onClick={() => handleTriggerGeofenceSearch('RWP-RBZ-A-19')}
                className="p-3 rounded-2xl bg-[#0B4A31] hover:bg-[#178A52] border border-[#178A52] hover:border-[#E3A82B] text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E3A82B]">Slot RWP-19</span>
                  <span className="text-[10px] bg-[#04231A] text-white px-2 py-0.5 rounded-full font-mono">33.5973°N</span>
                </div>
                <div className="font-extrabold text-sm text-white mt-1">محمد بلال (سبزی و فروٹ)</div>
                <div className="text-[11px] text-[#DCEFE4]/80 mt-0.5">راجہ بازار راولپنڈی • 6×4 فٹ جیو فینس</div>
              </button>

              <button
                onClick={() => handleTriggerGeofenceSearch('LHR-ANA-014')}
                className="p-3 rounded-2xl bg-[#0B4A31] hover:bg-[#178A52] border border-[#178A52] hover:border-[#E3A82B] text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E3A82B]">Slot LHR-14</span>
                  <span className="text-[10px] bg-[#04231A] text-white px-2 py-0.5 rounded-full font-mono">31.5710°N</span>
                </div>
                <div className="font-extrabold text-sm text-white mt-1">کریم بخش فروٹ کارٹ</div>
                <div className="text-[11px] text-[#DCEFE4]/80 mt-0.5">انارکلی بازار لاہور • 6×4 فٹ جیو فینس</div>
              </button>

              <button
                onClick={() => handleTriggerGeofenceSearch('KHI-SAD-001')}
                className="p-3 rounded-2xl bg-[#0B4A31] hover:bg-[#178A52] border border-[#178A52] hover:border-[#E3A82B] text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E3A82B]">Slot KHI-01</span>
                  <span className="text-[10px] bg-[#04231A] text-white px-2 py-0.5 rounded-full font-mono">24.8569°N</span>
                </div>
                <div className="font-extrabold text-sm text-white mt-1">طارق ڈرائی فروٹس و خشک میوہ</div>
                <div className="text-[11px] text-[#DCEFE4]/80 mt-0.5">صدر ایمپریس مارکیٹ کراچی • 6×4 فٹ</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= GEOFENCE DETAIL SUB-VIEW ================= */}
      {isGeofenceTab && (
        <VendorGeofenceDetailView
          lang={lang}
          currentVendor={vendor}
          dcRates={dcRates}
          searchTerm={vendorSearchTerm}
          onOpenCitySlotsMap={onOpenCitySlotsMap}
          onOpenQRBadgeModal={(chosen) => {
            setSelectedModalVendor(chosen);
            setShowQRBadgeModal(true);
          }}
          onPreviewPublicProfile={(chosen) => {
            setSelectedModalVendor(chosen);
            setShowVerifiedProfileModal(true);
          }}
        />
      )}

      {/* ================= 2. PEAK SLOT & SHIFT ROTATION ================= */}
      {isSlotTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#178A52] text-white flex items-center justify-center shadow">
                <Clock className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'پیک آورز سلاٹ مینجمنٹ و تبادلہ (Slot Rotation)' : 'Peak Slot Management & 2-Tap Shift Swap'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  ہر دکاندار کو 8 گھنٹے کی منصفانہ سلاٹ ملتی ہے۔ ضرورت پڑنے پر ساتھی دکاندار سے تبادلہ کریں۔
                </p>
              </div>
            </div>

            {/* Current Active Slot Card with Full Spatial Breakdown & 1-Click Google Map Zoom */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#04231A] text-white border-2 border-[#E3A82B] shadow-2xl mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#E3A82B] text-[#04231A] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {isUrdu ? 'سرکاری رجسٹرڈ سلاٹ' : 'Official Zoned Footprint'}
                    </span>
                    <span className="text-xs text-[#DCEFE4]/80 font-mono">
                      VRF-RWP-SLOT-19
                    </span>
                  </div>
                  <h4 className="font-sora font-extrabold text-2xl text-white mt-1">
                    {vendor.slotNumber} — {isUrdu ? 'راجہ بازار زون اے، راولپنڈی' : 'Raja Bazaar Zone A, Rawalpindi'}
                  </h4>
                  <p className="text-xs text-[#DCEFE4]/90 font-urdu mt-1">
                    شفٹ کا وقت: <strong>08:00 AM تا 04:00 PM</strong> (صبح شفٹ • شام کا وقت ساتھی دکاندار کے پاس جائے گا)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center bg-[#0B4A31] p-3 rounded-2xl border border-[#178A52] shrink-0">
                    <span className="text-[11px] text-[#DCEFE4]/70 block">{isUrdu ? 'باقی وقت' : 'Time Left'}</span>
                    <span className="font-mono font-extrabold text-xl text-[#E3A82B]">04h : 28m</span>
                  </div>

                  {/* 1-Click Zoom Google Map Trigger */}
                  <button
                    onClick={() => {
                      if (onOpenCitySlotsMap) {
                        onOpenCitySlotsMap('RWP-RBZ-A-19');
                      }
                      speechService.confirmVendorAction(
                        lang,
                        'گوگل میپ کیمرہ آپ کے سرکاری سلاٹ پر 1-کلک کے ساتھ زوم کر رہا ہے۔',
                        'Zooming into your assigned government stall on Google Map.'
                      );
                    }}
                    className="bg-[#178A52] hover:bg-[#178A52]/80 text-white px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-xl border border-[#E3A82B] transition-transform active:scale-95 group"
                  >
                    <ZoomIn className="w-4 h-4 text-[#E3A82B] group-hover:scale-125 transition-transform" />
                    <span>{isUrdu ? 'نقشہ پر سلاٹ دیکھیں (1-Click Zoom)' : '1-Click Google Map Zoom'}</span>
                  </button>
                </div>
              </div>

              {/* Exact Space Breakdown & Municipal Facilities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#178A52]/40 text-xs">
                <div className="bg-[#0B4A31] p-2.5 rounded-2xl border border-[#178A52]">
                  <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'مختص کردہ رقبہ (Dimensions)' : 'Assigned Dimensions'}</span>
                  <strong className="text-[#E3A82B] font-mono text-sm block mt-0.5">6ft × 4ft (24 sq. ft)</strong>
                </div>

                <div className="bg-[#0B4A31] p-2.5 rounded-2xl border border-[#178A52]">
                  <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'پیدل راستہ بفر (Walkway)' : 'Footpath Clearance'}</span>
                  <strong className="text-white font-mono text-sm block mt-0.5">5.2 ft Clear Space</strong>
                </div>

                <div className="bg-[#0B4A31] p-2.5 rounded-2xl border border-[#178A52]">
                  <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'پینے کا پانی (Water Tap)' : 'Potable Water'}</span>
                  <strong className="text-white text-sm block mt-0.5 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span>14m Distance</span>
                  </strong>
                </div>

                <div className="bg-[#0B4A31] p-2.5 rounded-2xl border border-[#178A52]">
                  <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'سولر لائٹ و ڈسٹ بن' : 'Solar LED & Bin'}</span>
                  <strong className="text-[#E3A82B] text-sm block mt-0.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>12V Solar • Bin #019</span>
                  </strong>
                </div>
              </div>

              {/* Audio Listen Guide for Less Educated Vendors */}
              <div className="p-3 bg-[#0B4A31]/80 rounded-2xl border border-[#178A52] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📢</span>
                  <p className="text-[#DCEFE4] font-urdu text-[11px]">
                    {isUrdu 
                      ? 'آڈیو رہنمائی: اپنی ریڑھی کو 6 ضرب 4 فٹ کے نشان کے اندر رکھیں تاکہ راستہ بند نہ ہو اور انسپکٹر فائن سے بچا جا سکے۔' 
                      : 'Audio Directive: Always keep your cart within the 6x4 ft boundary to maintain pedestrian safety.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    speechService.speak(
                      isUrdu
                        ? 'آپ کی سرکاری تفویض شدہ جگہ سلاٹ نمبر 19 راجہ بازار میں ہے۔ کل رقبہ 24 مربع فٹ یعنی 6 فٹ ضرب 4 فٹ ہے۔ پیدل چلنے والوں کے لیے سوا پانچ فٹ راستہ خالی رکھنا قانونی طور پر لازمی ہے۔ پینے کا پانی 14 میٹر پر دستیاب ہے اور ڈسٹ بن نمبر 19 استعمال کریں۔'
                        : 'Your assigned official stall is Slot 19, Raja Bazaar. Footprint is 6 by 4 feet. Keep 5.2 feet walkway clear at all times.',
                      { lang: isUrdu ? 'ur' : 'en' }
                    );
                  }}
                  className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'آڈیو سنیں' : 'Listen Rules'}</span>
                </button>
              </div>
            </div>

            {/* 2-Tap Slot Swap Section */}
            <div className="p-5 rounded-2xl bg-white border border-[#178A52]/20 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-[#178A52]" />
                <h4 className="font-bold text-base text-[#04231A]">
                  {isUrdu ? 'ساتھی دکاندار کے ساتھ شفٹ تبادلہ (2-Tap Swap)' : '2-Tap Shift Swap Request'}
                </h4>
              </div>

              {swapSuccess && (
                <div className="p-3 bg-[#178A52] text-white rounded-xl text-xs font-bold font-urdu flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#E3A82B]" />
                  <span>تبادلے کی درخواست کامیابی سے سسٹم میں رجسٹر ہو گئی ہے۔ متعلقہ پارٹنر کی تصدیق ہوتے ہی کیو آر اپ ڈیٹ ہو جائے گا۔</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#04231A] block mb-1">
                    {isUrdu ? 'مطلوبہ سلاٹ منتخب کریں' : 'Target Slot / Shift'}
                  </label>
                  <select
                    value={swapTargetSlot}
                    onChange={(e) => setSwapTargetSlot(e.target.value)}
                    className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs text-[#132A21] focus:outline-none focus:border-[#178A52]"
                  >
                    <option value="سلاٹ 14 (شام شفٹ: 04 PM - 12 AM)">سلاٹ 14 (شام شفٹ: 04 PM - 12 AM)</option>
                    <option value="سلاٹ 08 (صبح شفٹ: 08 AM - 04 PM)">سلاٹ 08 (صبح شفٹ: 08 AM - 04 PM)</option>
                    <option value="سلاٹ 22 (نائٹ شفٹ: 12 AM - 08 AM)">سلاٹ 22 (نائٹ شفٹ: 12 AM - 08 AM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#04231A] block mb-1">
                    {isUrdu ? 'تبادلے کی وجہ' : 'Reason for Swap'}
                  </label>
                  <input
                    type="text"
                    placeholder={isUrdu ? 'مثلاً سامان کی ترسیل میں تاخیر' : 'e.g. Stock delivery schedule'}
                    className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs text-[#132A21] focus:outline-none focus:border-[#178A52]"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setSwapSuccess(true);
                  setTimeout(() => setSwapSuccess(false), 4000);
                }}
                className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'تبادلے کی درخواست بھیجیں' : 'Submit Swap Request'}</span>
              </button>
            </div>

            {/* Dynamic QR Code & DC Rate Linker Card for this Slot */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#E3A82B] shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-white p-2 border-2 border-[#178A52] flex items-center justify-center shrink-0 shadow-lg">
                  <QrCode className="w-12 h-12 text-[#04231A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#E3A82B] text-[#04231A] px-2 py-0.5 rounded-full font-extrabold uppercase">
                      Dynamic Geofence QR
                    </span>
                    <span className="text-xs text-[#DCEFE4]/80 font-mono">VRF-RWP-SLOT-19</span>
                  </div>
                  <h4 className="font-sora font-extrabold text-lg sm:text-xl text-white mt-1">
                    {isUrdu ? 'اس سلاٹ کا باضابطہ کیو آر کوڈ اور ڈی سی نرخ' : 'Official Stall QR Code & DC Rates Link'}
                  </h4>
                  <p className="text-xs text-[#DCEFE4]/80 font-urdu mt-0.5">
                    {isUrdu 
                      ? 'یہ کیو آر کوڈ آپ کے الاٹ شدہ 6x4 فٹ رقبے اور روزانہ سرکاری ریٹس کو لائیو پاپ اپ میں ظاہر کرتا ہے۔' 
                      : 'This QR code links your exact 6x4ft geofenced stall and daily DC commodity price data in a live pop-up.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setShowQRBadgeModal(true)}
                  className="w-full sm:w-auto bg-[#178A52] hover:bg-[#178A52]/90 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <QrCode className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'کیو آر کوڈ جنریٹر کھولیں' : 'Open QR Generator'}</span>
                </button>

                <button
                  onClick={() => setShowVerifiedProfileModal(true)}
                  className="w-full sm:w-auto bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-4 py-2.5 rounded-xl text-xs font-extrabold shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isUrdu ? 'لائیو ڈی سی پاپ اپ ٹیسٹ کریں' : 'Test DC Rates Pop-up'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. WASTE TO REWARD ================= */}
      {isWasteTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#178A52] text-white flex items-center justify-center shadow">
                <Trash2 className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'زیرو ویسٹ انعامی اسکیم (Waste-to-Reward)' : 'Zero-Waste Rewards Program'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  اپنی دکان کا کچرا میونسپل ڈسٹ بن میں ڈالیں، پوائنٹس حاصل کریں اور مفت ویسٹ کٹ اور گرین بیج پائیں۔
                </p>
              </div>
            </div>

            {/* Reward Progress Bar */}
            <div className="p-6 rounded-2xl bg-[#04231A] text-white space-y-4 mb-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#DCEFE4]/70 font-bold block">{isUrdu ? 'آپ کے مجموعی ویسٹ پوائنٹس' : 'Your Waste Points'}</span>
                  <span className="font-sora font-extrabold text-3xl text-[#E3A82B]">{vendor.wastePoints} / 100</span>
                </div>

                <span className="bg-[#178A52] text-white text-xs font-bold px-3 py-1 rounded-xl">
                  {100 - vendor.wastePoints} {isUrdu ? 'پوائنٹس باقی ہیں' : 'points left for free kit'}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-[#0B4A31] h-3 rounded-full overflow-hidden border border-[#178A52]">
                <div
                  className="bg-[#E3A82B] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, vendor.wastePoints)}%` }}
                />
              </div>

              <p className="text-xs text-[#DCEFE4] font-urdu">
                🎁 100 پوائنٹس پر انعامات: سرکاری کلین کٹ، ہینڈ سینیٹائزر اسٹینڈ، اور گرین دکاندار بیج۔
              </p>
            </div>

            {/* Action Trigger Button */}
            {wasteSuccessMsg && (
              <div className="p-3 bg-[#178A52] text-white rounded-xl text-xs font-bold font-urdu mb-4 flex items-center gap-2 animate-fadeUp">
                <Check className="w-4 h-4 text-[#E3A82B]" />
                <span>شاباش! +15 ویسٹ پوائنٹس کامیابی سے آپ کے اکاؤنٹ میں شامل کر دیے گئے ہیں۔</span>
              </div>
            )}

            <button
              onClick={handleWasteLog}
              className="w-full bg-[#178A52] hover:bg-[#178A52]/90 text-white font-extrabold py-4 rounded-2xl text-base shadow-xl transition-transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5 text-[#E3A82B]" />
              <span>{isUrdu ? 'کچرا ڈسٹ بن میں ڈالا (+15 پوائنٹس)' : 'Disposed Waste in Dustbin (+15 Pts)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= 4. MICROPAY & CREDIT SCORE ================= */}
      {isMicropayTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#0B4A31] text-white flex items-center justify-center shadow">
                <CreditCard className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'مائیکرو فنانس و کریڈٹ اسکور (MicroPay)' : 'MicroPay Credit & Daily Working Capital'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  عمدہ تعمیل اور صفائی سے آپ کا کریڈٹ اسکور بڑھتا ہے، جس پر روزانہ بلا سود ورکنگ کیپیٹل دستیاب ہے۔
                </p>
              </div>
            </div>

            {/* Credit Score Meter Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-6 rounded-2xl bg-[#04231A] text-white text-center flex flex-col items-center justify-center shadow-xl">
                <span className="text-xs text-[#DCEFE4]/70 font-bold block">{isUrdu ? 'موجودہ کریڈٹ اسکور' : 'Civic Credit Score'}</span>
                <span className="font-sora font-extrabold text-4xl text-[#E3A82B] my-2">{vendor.creditScore}</span>
                <span className="text-xs bg-[#178A52] text-white px-3 py-0.5 rounded-full font-bold">
                  High Trust (850 Scale)
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B4A31] text-white flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-xs text-[#DCEFE4]/70 font-bold block">{isUrdu ? 'ورکنگ کیپیٹل حد' : 'Eligible Loan Limit'}</span>
                  <span className="font-sora font-extrabold text-3xl text-white">Rs. 15,000</span>
                  <p className="text-xs text-[#DCEFE4] font-urdu mt-1">
                    0% مارک اپ — روزانہ آسان قسطوں میں واپسی۔
                  </p>
                </div>

                <button
                  onClick={() => {
                    setLoanApplied(true);
                    speechService.confirmVendorAction(
                      lang,
                      'مائیکرو پے 15 ہزار روپے بلاسود ورکنگ کیپیٹل کی درخواست کامیابی کے ساتھ ارسال کر دی گئی ہے۔',
                      'MicroPay Rs. 15,000 working capital loan application submitted successfully.'
                    );
                  }}
                  disabled={loanApplied}
                  className="mt-3 bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-4 py-2 rounded-xl text-xs font-extrabold shadow disabled:opacity-60 transition-transform active:scale-95"
                >
                  {loanApplied ? (isUrdu ? 'درخواست پراسیس ہو رہی ہے' : 'Application in Review') : (isUrdu ? 'فوری قرض حاصل کریں (Instant Apply)' : 'Apply Instant Capital')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. COACHING & TRAINING ================= */}
      {isCoachingTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#178A52] text-white flex items-center justify-center shadow">
                <BookOpen className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'دکاندار تربیتی ماڈیولز و کوئز (Vendor Coaching)' : 'Vendor Dignity Coaching & Boosters'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  5 منٹ کا تربیتی ماڈیول مکمل کریں اور اپنے اسکور میں +0.05 کا فوری اضافہ حاصل کریں۔
                </p>
              </div>
            </div>

            {/* Quiz Feedback Banner */}
            {quizScoreFeedback && (
              <div className="p-3 bg-[#178A52] text-white rounded-xl text-xs font-bold font-urdu mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E3A82B]" />
                <span>{quizScoreFeedback}</span>
              </div>
            )}

            {/* Modules Grid */}
            <div className="space-y-4">
              {trainings.map((mod) => (
                <div
                  key={mod.id}
                  className="p-5 rounded-2xl bg-white border border-[#178A52]/20 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-[#DCEFE4] text-[#0B4A31] font-bold px-2.5 py-0.5 rounded-full font-mono">
                          ⏱️ {mod.durationMins} mins
                        </span>
                        {mod.completed && (
                          <span className="text-xs bg-[#178A52] text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Completed (+0.05)
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-[#04231A] font-urdu mt-1.5">
                        {isUrdu ? mod.titleUrdu : mod.titleEn}
                      </h4>
                      <p className="text-xs text-[#5C6F63] font-urdu mt-0.5">
                        {isUrdu ? mod.descUrdu : mod.descEn}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveQuizId(activeQuizId === mod.id ? null : mod.id)}
                      className="bg-[#178A52] hover:bg-[#178A52]/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow shrink-0"
                    >
                      {activeQuizId === mod.id ? (isUrdu ? 'کوئز بند کریں' : 'Close Quiz') : (isUrdu ? 'کوئز حل کریں' : 'Take Quiz')}
                    </button>
                  </div>

                  {/* Interactive Mini Quiz */}
                  {activeQuizId === mod.id && mod.quiz && (
                    <div className="mt-3 p-4 bg-[#F6F2E7] rounded-2xl border border-[#178A52]/30 space-y-3 animate-fadeUp">
                      <h5 className="font-bold text-xs text-[#04231A] font-urdu">
                        ❓ {isUrdu ? mod.quiz.questionUrdu : mod.quiz.questionEn}
                      </h5>

                      <div className="space-y-2">
                        {(isUrdu ? mod.quiz.optionsUrdu : mod.quiz.optionsEn).map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => setSelectedAnswer(optIdx)}
                            className={`w-full p-2.5 rounded-xl text-left text-xs font-urdu transition-all border ${
                              selectedAnswer === optIdx
                                ? 'bg-[#178A52] text-white border-[#E3A82B] font-bold'
                                : 'bg-white text-[#132A21] border-[#178A52]/30 hover:bg-[#DCEFE4]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handleQuizSubmit(mod.id, mod.quiz!.correctIndex)}
                        disabled={selectedAnswer === null}
                        className="w-full bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] font-extrabold py-2 rounded-xl text-xs shadow disabled:opacity-50"
                      >
                        {isUrdu ? 'جواب جمع کروائیں (+0.05 اسکور)' : 'Submit Answer (+0.05 Boost)'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. VENDOR STORIES & VOICES OF DIGNITY ================= */}
      {isStoriesTab && (
        <div className="space-y-6">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 border border-[#178A52]/20 shadow-xl text-[#132A21] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F6F2E7]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#04231A] text-[#E3A82B] flex items-center justify-center shadow-lg">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-[#04231A]">
                    {isUrdu ? 'محنت کشوں کا وقار — سچی کہانیاں اور کامیابیاں' : 'Voices of Dignity: Real Vendor Stories'}
                  </h3>
                  <p className="text-xs text-[#5C6F63] font-urdu">
                    {isUrdu
                      ? 'کنیکٹڈ پاکستان نے ریڑھی بانوں کو خوف، بھتے اور بے دخلی سے نکال کر باوقار ڈیجیٹل انٹرپرینیور کیسے بنایا'
                      : 'How VRF 2026 transformed vulnerable street hawkers into respected, protected micro-entrepreneurs.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#DCEFE4] text-[#04231A] px-3.5 py-1.5 rounded-full text-xs font-bold font-mono border border-[#178A52]/30">
                <Users className="w-4 h-4 text-[#178A52]" />
                <span>124,500+ Protected Hawkers Across Pakistan</span>
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Story 1 */}
              <div className="bg-white rounded-2xl p-5 border border-[#178A52]/20 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#178A52] transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🍎</span>
                      <div>
                        <h4 className="font-bold text-sm text-[#04231A]">{isUrdu ? 'بابا نذیر احمد' : 'Baba Nazir Ahmed'}</h4>
                        <span className="text-[10px] text-[#5C6F63] font-urdu">{isUrdu ? 'پھل فروش، انارکلی لاہور (32 سالہ تجربہ)' : 'Fruit Vendor, Anarkali Lahore (32 yrs)'}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-[#178A52]/10 text-[#178A52] px-2 py-0.5 rounded-full font-bold">⭐ 9.4 Score</span>
                  </div>

                  <div className="relative pl-2 border-l-2 border-[#178A52]">
                    <Quote className="w-4 h-4 text-[#E3A82B] mb-1" />
                    <p className="text-xs text-[#132A21] font-urdu leading-relaxed italic">
                      {isUrdu 
                        ? '32 سال ریڑھی لگائی، روزانہ ڈر رہتا تھا کہ کب گاڑی آئے گی اور سامان اٹھا لے جائے گی۔ جب سے کیو آر بیج ملا ہے، اب کوئی رشوت نہیں مانگتا۔ میں فخر سے اپنے بچوں کو بتاتا ہوں کہ میں رجسٹرڈ تاجر ہوں۔'
                        : '"For 32 years I lived in constant fear of sudden confiscation. Today with my QR License, no one demands illicit bribes. I proudly tell my children that their father is a certified merchant."'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#5C6F63]">
                  <span>{isUrdu ? 'سلاٹ: LHR-AK-04' : 'Slot: LHR-AK-04'}</span>
                  <span className="text-[#178A52] font-bold">{isUrdu ? '0% مائیکرو کریڈٹ صارف' : 'Rs. 15,000 MicroPay'}</span>
                </div>
              </div>

              {/* Story 2 */}
              <div className="bg-white rounded-2xl p-5 border border-[#178A52]/20 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#178A52] transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🥬</span>
                      <div>
                        <h4 className="font-bold text-sm text-[#04231A]">{isUrdu ? 'محمد اسلم سبزی فروش' : 'Muhammad Aslam'}</h4>
                        <span className="text-[10px] text-[#5C6F63] font-urdu">{isUrdu ? 'سبزی فروش، راجہ بازار راولپنڈی' : 'Vegetable Vendor, Raja Bazar RWP'}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-[#178A52]/10 text-[#178A52] px-2 py-0.5 rounded-full font-bold">⭐ 9.1 Score</span>
                  </div>

                  <div className="relative pl-2 border-l-2 border-[#178A52]">
                    <Quote className="w-4 h-4 text-[#E3A82B] mb-1" />
                    <p className="text-xs text-[#132A21] font-urdu leading-relaxed italic">
                      {isUrdu
                        ? 'پہلے سود خور آڑھتی کو روزانہ 20% سود دینا پڑتا تھا۔ مائیکرو پے والٹ سے مجھے صبح صبح سبزی منڈی کے لیے بغیر سود 12,000 مل جاتے ہیں اور شام کو ریٹس کے مطابق کما کر واپس کر دیتا ہوں۔ منافع دوگنا ہو گیا ہے۔'
                        : '"Previously informal moneylenders charged crippling 20% daily interest. With VRF MicroPay, I access 0% working capital at 5 AM for the wholesale market and repay by 8 PM. My family income doubled."'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#5C6F63]">
                  <span>{isUrdu ? 'سلاٹ: RWP-RB-12' : 'Slot: RWP-RB-12'}</span>
                  <span className="text-[#178A52] font-bold">{isUrdu ? 'زیرو ویسٹ چیمپیئن' : 'Zero-Waste Champion'}</span>
                </div>
              </div>

              {/* Story 3 */}
              <div className="bg-white rounded-2xl p-5 border border-[#178A52]/20 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#178A52] transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌰</span>
                      <div>
                        <h4 className="font-bold text-sm text-[#04231A]">{isUrdu ? 'بی بی شازیہ و طارق خان' : 'Bibi Shazia & Tariq'}</h4>
                        <span className="text-[10px] text-[#5C6F63] font-urdu">{isUrdu ? 'خشک میوہ جات، صدر پشاور' : 'Dry Fruits, Saddar Peshawar'}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-[#178A52]/10 text-[#178A52] px-2 py-0.5 rounded-full font-bold">⭐ 9.8 Score</span>
                  </div>

                  <div className="relative pl-2 border-l-2 border-[#178A52]">
                    <Quote className="w-4 h-4 text-[#E3A82B] mb-1" />
                    <p className="text-xs text-[#132A21] font-urdu leading-relaxed italic">
                      {isUrdu
                        ? 'خواتین کے لیے سڑک پر کام کرنا مشکل تھا۔ جیو فینس سلاٹ اور سیکیورٹی الارم سسٹم کی وجہ سے ہمارے پاس محفوظ مقررہ جگہ ہے جہاں خریدار اعتماد سے آتے ہیں اور ڈیجیٹل ادائیگی کرتے ہیں۔'
                        : '"Working as a female vendor on the roadside was challenging. With the regulated geofenced slot and safety integration, our stall is secure, orderly, and customers buy with complete trust."'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#5C6F63]">
                  <span>{isUrdu ? 'سلاٹ: PSW-SD-08' : 'Slot: PSW-SD-08'}</span>
                  <span className="text-[#178A52] font-bold">{isUrdu ? 'ڈیجیٹل کیو آر پیمنٹ' : 'Digital QR Payments'}</span>
                </div>
              </div>
            </div>

            {/* Humane Impact Metrics */}
            <div className="bg-[#04231A] text-white p-5 rounded-2xl border border-[#178A52]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h5 className="font-bold text-sm text-[#E3A82B] font-urdu">
                  {isUrdu ? 'پاکستان کے محنت کش — معیشت کی ریڑھ کی ہڈی' : 'The People Behind the Stalls: Pakistan’s Economic Backbone'}
                </h5>
                <p className="text-xs text-[#DCEFE4]/80 font-urdu">
                  {isUrdu
                    ? 'کنیکٹڈ پاکستان کا مشن صرف ڈیجیٹل نقشے نہیں، بلکہ ہر محنت کش کی عزتِ نفس اور بچوں کا روشن مستقبل ہے۔'
                    : 'VRF 2026 is built on empathy, social dignity, and the constitutional right to lawful, unharassed livelihood.'}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectTab('geofence');
                  speechService.confirmVendorAction(
                    lang,
                    'جیو فینس ان سائیٹ نقشے پر وینڈرز کے الاٹ شدہ ریگولیٹڈ سلاٹس لائیو دکھائے جا رہے ہیں۔',
                    'Displaying live geofenced slots and vendor boundaries on the map.'
                  );
                }}
                className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow flex items-center gap-2 whitespace-nowrap active:scale-95 transition-transform"
              >
                <Navigation className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'جیو فینس ان سائیٹ دیکھیں' : 'Explore Geofence Insight'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 9. VENDOR RIGHT OF REPLY & APPEALS ================= */}
      {isAppealsTab && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#E3A82B] shadow-2xl text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-[#178A52] text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>{isUrdu ? 'پنجاب اسٹریٹ وینڈر ایکٹ 2026 — دفعہ 14' : 'Punjab Vendor Act 2026 — Section 14'}</span>
                </div>
                <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
                  {isUrdu ? 'باضابطہ حقِ صفائی و انکوائری نوٹسز (Right of Reply)' : 'Vendor Right of Reply & Open Hearings'}
                </h2>
                <p className="text-sm text-[#DCEFE4] font-urdu leading-relaxed max-w-2xl">
                  {isUrdu
                    ? 'کنیکٹڈ پاکستان میں کسی بھی دکاندار کو صفائی کا موقع دیے بغیر یکطرفہ جرمانہ نہیں کیا جا سکتا۔ آپ کا احترام، روزگار کا وقار اور شفافیت ہماری اولین ترجیح ہے۔'
                    : 'Zero Arbitrary Fines. Under VRF 2026, every vendor is guaranteed the constitutional right to file explanations, wholesale purchase slips, and request magistrate review.'}
                </p>
              </div>

              <div className="bg-[#04231A]/90 border border-[#E3A82B]/60 p-4 rounded-2xl text-right shrink-0">
                <span className="text-[10px] text-[#E3A82B] font-mono font-bold block">CASE QUEUE STATUS</span>
                <span className="font-sora font-extrabold text-xl text-white">
                  {relevantReports.length} {isUrdu ? 'انکوائریز' : 'Inquiries'}
                </span>
                <span className="text-xs text-[#178A52] font-bold block mt-0.5">
                  {relevantReports.filter(r => r.status === 'resolved').length} Resolved
                </span>
              </div>
            </div>

            {/* Quick Policy Principles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#178A52]/40">
              <div className="bg-[#04231A]/80 border border-[#178A52]/50 rounded-2xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-[#E3A82B] font-urdu block">۱. منڈی ہول سیل سلپ کا حق</span>
                <p className="text-[11px] text-[#DCEFE4]/80 font-urdu">
                  اگر سبزی منڈی سے ہول سیل نرخ زیادہ ملے ہوں تو دکاندار منڈی پرچی لگا کر خود کو بری کروا سکتا ہے۔
                </p>
              </div>
              <div className="bg-[#04231A]/80 border border-[#178A52]/50 rounded-2xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-[#E3A82B] font-urdu block">۲. قانونی 3 فیصد چھوٹ</span>
                <p className="text-[11px] text-[#DCEFE4]/80 font-urdu">
                  قدرتی وزن کی کمی اور چھانٹی کی صورت میں ±3 فیصد کا قانونی بفر ہر وینڈر کا تسلیم شدہ حق ہے۔
                </p>
              </div>
              <div className="bg-[#04231A]/80 border border-[#178A52]/50 rounded-2xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-[#E3A82B] font-urdu block">۳. جرمانہ سے قبل مثبت رہنمائی</span>
                <p className="text-[11px] text-[#DCEFE4]/80 font-urdu">
                  پہلی خلاف ورزی پر فوری جرمانے کے بجائے ڈی سی کوچنگ اور ریٹ لسٹ کی تنصیب میں مدد فراہم کی جاتی ہے۔
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Success Toast */}
          {replySuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-between animate-fadeUp">
              <span>✓ {replySuccessMsg}</span>
              <button onClick={() => setReplySuccessMsg(null)} className="text-xs text-emerald-700 underline">
                بند کریں
              </button>
            </div>
          )}

          {/* List of Inquiries / Reports */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sora font-extrabold text-base text-[#04231A] flex items-center gap-2">
                <Store className="w-4 h-4 text-[#178A52]" />
                <span>{isUrdu ? 'آپ کے مارکیٹ زون سے متعلق کیسز' : 'Citizen Alerts Involving Your Zone/Stall'}</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Stall: {vendor.slotNumber} ({vendor.name})
              </span>
            </div>

            {relevantReports.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-[#04231A] font-urdu">ماشاءاللہ! کوئی فعال شکایت درج نہیں ہے</h4>
                <p className="text-xs text-slate-500 font-urdu max-w-md mx-auto">
                  آپ کے اسٹال کا تعمیل اسکور بہترین ہے اور آپ سرکاری نرخوں پر دیانت داری سے کاروبار کر رہے ہیں۔
                </p>
              </div>
            ) : (
              relevantReports.map((rep) => {
                const variance = ((rep.chargedPrice - rep.officialRate) / rep.officialRate) * 100;
                const hasResponded = rep.status === 'vendor_responded' || !!rep.vendorResponse;

                return (
                  <div
                    key={rep.id}
                    className={`rounded-3xl p-6 border shadow-lg transition-all ${
                      rep.status === 'resolved'
                        ? 'bg-white/80 border-slate-200'
                        : hasResponded
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-[#FCFAF3] border-[#178A52]/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#04231A]">
                            {rep.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rep.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : hasResponded
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {hasResponded ? (isUrdu ? 'موقف درج شدہ' : 'Vendor Responded') : (isUrdu ? 'سماعت کے منتظر' : 'Awaiting Reply')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {rep.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C6F63] font-urdu mt-0.5">
                          آئٹم: <strong className="text-[#04231A]">{rep.item}</strong> • مقام: <strong>{rep.location}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[9px] text-slate-500 block">ڈی سی ریٹ</span>
                          <span className="font-mono font-bold text-xs">Rs. {rep.officialRate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 block">رپورٹ شدہ قیمت</span>
                          <span className="font-mono font-bold text-xs text-rose-600">Rs. {rep.chargedPrice} (+{variance.toFixed(1)}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Report Analysis & Inspector Guidance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
                      <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-[#04231A] block">{isUrdu ? 'شہری شکایت کی تفصیل:' : 'Citizen Report:'}</span>
                        <p className="text-slate-600 font-urdu">{rep.description}</p>
                      </div>

                      <div className="bg-emerald-50/60 p-3 rounded-xl text-xs space-y-1 border border-emerald-100">
                        <span className="font-bold text-emerald-900 block">{isUrdu ? 'مجسٹریٹ / انسپکٹر رہنمائی:' : 'Field Advisory:'}</span>
                        <p className="text-emerald-800 font-urdu">
                          {rep.inspectorActionTaken || (isUrdu ? 'معائنہ عملہ آپ کے تحریری موقف کا انتظار کر رہا ہے۔' : 'Awaiting vendor explanation before final order.')}
                        </p>
                      </div>
                    </div>

                    {/* Official Response Section */}
                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#04231A] flex items-center gap-1.5">
                          <Quote className="w-3.5 h-3.5 text-[#E3A82B]" />
                          <span>{isUrdu ? 'آپ کا باضابطہ قانونی موقف (Your Official Defense):' : 'Your Official Position / Mandi Slip:'}</span>
                        </span>
                        {rep.vendorResponse && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                            ✓ ریکارڈ پر موجود ہے
                          </span>
                        )}
                      </div>

                      {rep.vendorResponse ? (
                        <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 text-xs text-blue-950 font-urdu leading-relaxed">
                          "{rep.vendorResponse}"
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Preset Options */}
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'منڈی سے ہول سیل مال زیادہ ریٹ پر ملا، ہول سیل پرچی موجود ہے۔',
                              'وزن کی قدرتی کمی کے باعث فرق آیا جو کہ قانونی 3 فیصد بفر میں ہے۔',
                              'خریدار سے غلط فہمی ہوئی تھی، ڈی سی ریٹ پر راضی کر کے رقم ایڈجسٹ کر دی۔',
                            ].map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setReplyTexts(prev => ({ ...prev, [rep.id]: preset }))}
                                className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-urdu transition-colors text-left"
                              >
                                + {preset}
                              </button>
                            ))}
                          </div>

                          <textarea
                            value={replyTexts[rep.id] || ''}
                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [rep.id]: e.target.value }))}
                            placeholder={isUrdu ? 'اپنا تحریری موقف، ہول سیل منڈی پرچی نمبر یا وضاحت درج کریں...' : 'Enter your explanation or wholesale mandi slip details...'}
                            rows={2}
                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-[#04231A] focus:outline-none focus:border-[#178A52]"
                          />

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const text = replyTexts[rep.id];
                                if (!text || !text.trim()) {
                                  alert(isUrdu ? 'براہ کرم اپنا موقف درج کریں۔' : 'Please enter your explanation.');
                                  return;
                                }
                                if (onVendorRespondToReport) {
                                  onVendorRespondToReport(rep.id, text);
                                }
                                setReplySuccessMsg(
                                  isUrdu
                                    ? `کیس ${rep.id} کے لیے آپ کا باضابطہ موقف کامیابی سے ڈی سی پورٹل پر جمع کر دیا گیا۔`
                                    : `Official response for ${rep.id} submitted to magistrate portal.`
                                );
                                speechService.confirmVendorAction(
                                  lang,
                                  'آپ کا باضابطہ قانونی موقف درج کر لیا گیا ہے۔ فیلڈ مجسٹریٹ انصاف کے تقاضوں کے مطابق جائزہ لے گا۔',
                                  'Your official explanation has been submitted to the magistrate portal.'
                                );
                              }}
                              className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-transform active:scale-95"
                            >
                              <ShieldCheck className="w-4 h-4 text-[#E3A82B]" />
                              <span>{isUrdu ? 'موقف جمع کرائیں (Submit Official Defense)' : 'Submit Official Explanation'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Official Stall QR Badge Generator Modal */}
      <VendorQRBadgeModal
        isOpen={showQRBadgeModal}
        onClose={() => setShowQRBadgeModal(false)}
        vendor={selectedModalVendor || vendor}
        lang={lang}
        dcRates={dcRates}
        onOpenCitySlotsMap={onOpenCitySlotsMap}
        onPreviewPublicProfile={(chosenVendor) => {
          if (chosenVendor) setSelectedModalVendor(chosenVendor);
          setShowVerifiedProfileModal(true);
        }}
      />

      {/* Citizen Public Profile View Modal */}
      <VendorVerifiedProfileModal
        isOpen={showVerifiedProfileModal}
        onClose={() => setShowVerifiedProfileModal(false)}
        vendor={selectedModalVendor || vendor}
        lang={lang}
        dcRates={dcRates}
        onOpenCitySlotsMap={onOpenCitySlotsMap}
      />
    </div>
  );
};
