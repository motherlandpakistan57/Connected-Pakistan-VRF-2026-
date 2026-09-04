import React, { useState, useEffect } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Sparkles, Volume2, 
  MapPin, Shield, CheckCircle2, User, Mic, Play, 
  Layers, ArrowRight, BookOpen, Compass
} from 'lucide-react';
import { Language, Role } from '../types';
import { speechService } from '../lib/audio';
import { Emblem } from './Emblem';
import { BrandLogo } from './BrandLogo';
import { PlatformMindMapView } from './PlatformMindMapView';

interface TourStep {
  id: string;
  targetRole: Role;
  navTab?: string;
  titleEn: string;
  titleUrdu: string;
  subtitleEn: string;
  subtitleUrdu: string;
  explanationEn: string;
  explanationUrdu: string;
  highlightFeaturesEn: string[];
  highlightFeaturesUrdu: string[];
  actionPromptEn: string;
  actionPromptUrdu: string;
  badgeEn: string;
  badgeUrdu: string;
  image?: string;
  captionEn?: string;
  captionUrdu?: string;
}

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  onSelectTab: (tab: string) => void;
  onOpenCitySlots?: () => void;
  onOpenVoiceSearch?: () => void;
  onOpenNationalMap?: () => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentRole,
  onSelectRole,
  onSelectTab,
  onOpenCitySlots,
  onOpenVoiceSearch,
  onOpenNationalMap,
}) => {
  const isUrdu = lang === 'ur';
  const [tourMode, setTourMode] = useState<'steps' | 'mindmap'>('steps');
  const [stepIndex, setStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      targetRole: 'citizen',
      navTab: 'overview',
      titleEn: 'Welcome to Connected Pakistan VRF 2026',
      titleUrdu: 'کنیکٹڈ پاکستان وی آر ایف 2026 میں خوش آمدید',
      subtitleEn: 'Digital Statecraft, Civic Accountability & Vendor Protection',
      subtitleUrdu: 'ڈیجیٹل ریاست، عوامی احتساب اور ریڑھی بان تحفظ کا نیا باب',
      explanationEn: 'Connected Pakistan unites 240+ million citizens, street vendors, PERA magistrates, and District Commissioners into one transparent civic operating system across all 30 districts of Pakistan, AJK & Gilgit-Baltistan.',
      explanationUrdu: 'کنیکٹڈ پاکستان پورے ملک بشمول آزاد کشمیر اور گلگت بلتستان کے 24 کروڑ شہریوں، ریڑھی بانوں، پیرہ مجسٹریٹس اور ضلعی انتظامیہ کو ایک شفاف ڈیجیٹل نظام میں یکجا کرتا ہے۔',
      highlightFeaturesEn: [
        'Zero-Eviction Vendor Framework with QR Slots',
        'Official Daily DC Rates with Live Ticker',
        'Urdu & English Voice Command Intelligence',
        'Real-time GPS Heatmap across 30 Districts'
      ],
      highlightFeaturesUrdu: [
        'کیو آر کوڈ کے ساتھ ریڑھی بانوں کے لیے زیرو بے دخلی کا تحفظ',
        'سرکاری ڈی سی نرخ نامہ اور لائیو ٹکر بار',
        'اردو اور انگریزی آواز کے ساتھ سرچ اور اے آئی کمانڈ',
        '30 اضلاع کا لائیو جی پی ایس ہیٹ میپ اور زون کنٹرول'
      ],
      actionPromptEn: 'Start by exploring the 5 executive consoles tailored for every stakeholder.',
      actionPromptUrdu: 'تمام اسٹیک ہولڈرز کے لیے بنائے گئے 5 بااختیار کنسولز کا معائنہ شروع کریں۔',
      badgeEn: 'Connected Pakistan VRF 2026',
      badgeUrdu: 'کنیکٹڈ پاکستان وی آر ایف 2026',
      captionEn: 'Empowering Pakistan’s grassroots economy with digital dignity',
      captionUrdu: 'پاکستان کی نچلی سطح کی معیشت اور محنت کشوں کو ڈیجیٹل عزت'
    },
    {
      id: 'citizen-rates',
      targetRole: 'citizen',
      navTab: 'rates',
      titleEn: '1. Citizen Voice & Official DC Rates',
      titleUrdu: '۱. شہری کنسول اور سرکاری ڈی سی ریٹس',
      subtitleEn: 'Complete Price Transparency & Anonymous Reporting',
      subtitleUrdu: 'قیمتوں میں شفافیت اور آئینی گمنام شکایت کا اختیار',
      explanationEn: 'Citizens can instantly check mandatory daily Deputy Commissioner price ceilings for essential commodities, search across verified green vendors, and report illegal overcharging with automatic GPS and photo evidence without risking identity.',
      explanationUrdu: 'شہری روزانہ کے سرکاری ڈی سی ریٹس دیکھ سکتے ہیں، قریبی تصدیق شدہ گرین دکاندار تلاش کر سکتے ہیں، اور گمنام رہ کر زائد قیمت کی باضابطہ شکایت درج کرا سکتے ہیں۔',
      highlightFeaturesEn: [
        '40-Second Real-Time DC Commodity Rate Ticker',
        'Encrypted Anonymous Overcharging Complaint Stepper',
        'AI Tolerance Filter (±3% Fair Margin Auto-Verification)',
        'Track Case Resolution with Live ETA & Patrol Dispatch'
      ],
      highlightFeaturesUrdu: [
        '40 سیکنڈز کا مسلسل اپڈیٹ ہونے والا سرکاری ریٹ ٹکر',
        'مکمل انکرپٹڈ اور گمنام شکایت درج کرنے کا آسان فارم',
        'اے آئی 3% رعایت کا خودکار تصدیقی الگورتھم',
        'شکایت پر لائیو پٹرول روانگی اور حل کی تفصیلات'
      ],
      actionPromptEn: 'Switching to Citizen Console...',
      actionPromptUrdu: 'شہری کنسول پر سوئچ کیا جا رہا ہے...',
      badgeEn: 'Citizen Empowerment',
      badgeUrdu: 'عوامی اختیار',
      captionEn: 'Citizens verifying fair consumer rates in local markets',
      captionUrdu: 'مارکیٹ میں شفاف ریٹس پر خریداری کرتے باشعور شہری'
    },
    {
      id: 'vendor-dignity',
      targetRole: 'vendor',
      navTab: 'dashboard',
      titleEn: '2. Vendor Dignity & QR Micro-Banking',
      titleUrdu: '۲. ریڑھی بان عزت اور کیو آر مائیکرو فنانس',
      subtitleEn: 'Zero Unslotted Evictions & Micro-Credit Score (300-850)',
      subtitleUrdu: 'بغیر متبادل کوئی بے دخلی نہیں اور ڈیجیٹل کریڈٹ اسکور',
      explanationEn: 'Street vendors are converted into licensed, respected economic partners. Each vendor receives a designated 8-hour shift slot, QR code license, digital MicroPay wallet, and clean-waste reward tiers that unlock subsidized government loans.',
      explanationUrdu: 'ریڑھی بان ہمارا باعزت شراکت دار ہے۔ ہر وینڈر کو 8 گھنٹے کی مخصوص شفٹ، ڈیجیٹل کیو آر لائسنس، مائیکرو پے والیٹ اور صفائی پر کریڈٹ اسکور ملتا ہے جس سے آسان قرضے ممکن ہوتے ہیں۔',
      highlightFeaturesEn: [
        'Official Municipal QR Badge with Shift Rotation',
        'Clean Green Tier 1/2/3 Waste Rewards',
        'Real-time Daily MicroPay Earnings & Instant Settlements',
        'Coaching Lessons Boosting Civics Rating (+0.05 Points)'
      ],
      highlightFeaturesUrdu: [
        'سرکاری میونسپل کیو آر لائسنس اور 8 گھنٹے کی گردش',
        'صاف ستھری ریڑھی پر کلین گرین ویسٹ ریوارڈز',
        'روزانہ کی شفاف ڈیجیٹل کمائی اور انسٹنٹ ٹرانسفر',
        'آسان تربیتی اسباق اور اسکور میں اضافہ'
      ],
      actionPromptEn: 'Switching to Vendor Partner Console...',
      actionPromptUrdu: 'وینڈر کنسول پر سوئچ کیا جا رہا ہے...',
      badgeEn: 'Vendor Partner',
      badgeUrdu: 'شراکت دار',
      captionEn: 'Baba Nazir Ahmed & proud Pakistani vendors serving with honor',
      captionUrdu: 'بابا نذیر احمد اور باعزت پاکستانی ریڑھی بان'
    },
    {
      id: 'inspector-pera',
      targetRole: 'inspector',
      navTab: 'scanner',
      titleEn: '3. PERA Field Magistrate & AI Scanner',
      titleUrdu: '۳. پیرہ انسپکٹر اور اے آئی پرائس اسکینر',
      subtitleEn: 'Objective ±3% Variance Scanner & Digital Citation',
      subtitleUrdu: 'شواہد پر مبنی اسکینر اور ڈیجیٹل چالان نظام',
      explanationEn: 'Price Enforcement & Regulation Authority (PERA) officers use an AI camera scanner that automatically computes commodity deviation vs DC rates. If within 3% tolerance, it issues a green badge; if violated, it records verifiable photographic evidence and issues an instant SMS citation.',
      explanationUrdu: 'پیرہ مجسٹریٹس اے آئی کیمرہ اسکینر استعمال کرتے ہیں جو موقع پر ڈی سی ریٹ سے فرق چیک کرتا ہے۔ 3 فیصد رعایت پر گرین تعریفی بیج اور خلاف ورزی پر شواہد کے ساتھ ڈیجیٹل چالان جاری ہوتا ہے۔',
      highlightFeaturesEn: [
        '±3% AI Tolerance Margin with Instant Green/Red Feedback',
        'Geo-fenced 35m Stall Verification Radar',
        'On-the-spot Digital Citation with Photo & GPS Timestamp',
        'Route Guidance Checklist with Dynamic Target Points'
      ],
      highlightFeaturesUrdu: [
        '±3% خودکار رعایت اور فوری رنگین الرٹ',
        '35 میٹر ریڈار کے ساتھ وینڈر سلاٹ کی تصدیق',
        'موقع پر تصویر اور جی پی ایس کے ساتھ ڈیجیٹل چالان',
        'فیلڈ انسپکشن روٹ لسٹ اور ترجیحی بازار'
      ],
      actionPromptEn: 'Switching to Inspector Console...',
      actionPromptUrdu: 'پیرہ انسپکٹر کنسول پر سوئچ کیا جا رہا ہے...',
      badgeEn: 'Field Magistrate',
      badgeUrdu: 'پیرہ مجسٹریٹ',
      captionEn: 'Fair, objective field magistrates enforcing rule of law',
      captionUrdu: 'فیلڈ میں شفافیت اور قانون کی بالادستی یقینی بناتے افسران'
    },
    {
      id: 'government-command',
      targetRole: 'government',
      navTab: 'heatmap',
      titleEn: '4. District Command & 30-Zone Heatmap',
      titleUrdu: '۴. ڈپٹی کمشنر کمانڈ سینٹر اور ہیٹ میپ',
      subtitleEn: 'Real-time Intelligence, Squad Dispatch & Zero Leakage',
      subtitleUrdu: '30 اضلاع کا لائیو ڈیٹا، کوئیک ڈسپیچ اور شفاف ریونیو',
      explanationEn: 'District Commissioners and provincial leadership oversee 30 administrative zones. The live heatmap pinpoints complaint density, monitors enforcement squad routes, manages citywide slot capacities, and exports audit-ready CSV reports.',
      explanationUrdu: 'ڈپٹی کمشنرز اور صوبائی قیادت 30 انتظامی زونز کی مکمل نگرانی کرتے ہیں۔ لائیو ہیٹ میپ پر شکایات کی شدت، پیٹرول اسکواڈز کی پوزیشن اور میونسپل ریونیو کا مکمل کنٹرول حاصل ہوتا ہے۔',
      highlightFeaturesEn: [
        'National 30-District Interactive Heatmap',
        '9-Minute Squad Dispatch System with Live GPS tracking',
        'Data Sync Center (Export CSV, JSON, PDF Reports)',
        'Full Legal VRF 2026 Framework and Policy Governance'
      ],
      highlightFeaturesUrdu: [
        'ملک گیر 30 اضلاع کا لائیو انٹراایکٹو ہیٹ میپ',
        '9 منٹ میں پیٹرول اسکواڈ کی روانگی اور ٹریکنگ',
        'ڈیٹا سنک سینٹر سے باضابطہ رپورٹس کی ڈاؤنلوڈ',
        'وی آر ایف 2026 کے قانونی ضوابط اور پالیسی'
      ],
      actionPromptEn: 'Switching to DC Command Center...',
      actionPromptUrdu: 'ڈپٹی کمشنر کمانڈ پر سوئچ کیا جا رہا ہے...',
      badgeEn: 'Executive Command',
      badgeUrdu: 'انتظامی کمانڈ',
      captionEn: 'Municipal leadership governing transparent civic services',
      captionUrdu: 'انتظامیہ کا شفاف اور ڈیجیٹل حکمرانی کا نیا ماڈل'
    },
    {
      id: 'voice-and-ai',
      targetRole: 'citizen',
      navTab: 'why_how',
      titleEn: '5. Voice Command & AI Assistance',
      titleUrdu: '۵. اردو وائس کمانڈ اور اے آئی رہنمائی',
      subtitleEn: 'Speak Naturally: "Show me vendor rates" or "Find nearest slots"',
      subtitleUrdu: 'اپنی زبان میں بولیں اور فوری رہنمائی حاصل کریں',
      explanationEn: 'Designed with complete accessibility so every citizen, literate or non-literate, can use their voice to search rates, find slots, or ask complex governance questions. Equipped with dual Urdu & English natural speech engines.',
      explanationUrdu: 'یہ نظام ہر پاکستانی کے لیے آسان بنایا گیا ہے۔ شہری اپنی مادری زبان میں بول کر نرخ معلوم کر سکتے ہیں، قریبی بازار کا راستہ پوچھ سکتے ہیں، یا تفصیلی سوالات کے جوابات حاصل کر سکتے ہیں۔',
      highlightFeaturesEn: [
        'Global Voice Command Button in Top Navigation Header',
        'Smart AI Guide Drawer with One-Tap Audio Explanations',
        'City Slots Map with 1-Click Interactive Google Satellite Views',
        'Full Accessibility Across Desktop, Tablet & Mobile Devices'
      ],
      highlightFeaturesUrdu: [
        'ٹاپ ہیڈر میں ہر وقت دستیاب وائس کمانڈ بٹن',
        'اے آئی لائیو گائیڈ دراز بمعہ آواز میں جوابات',
        'سٹی سلاٹس میپ بمعہ گوگل سیٹلائٹ اور اسٹریٹ ویو',
        'موبائل، ٹیبلٹ اور کمپیوٹر پر انتہائی تیز رفتار رسائی'
      ],
      actionPromptEn: 'Ready to experience Connected Pakistan!',
      actionPromptUrdu: 'کنیکٹڈ پاکستان کا تجربہ کرنے کے لیے تیار ہیں!',
      badgeEn: 'Accessible to All',
      badgeUrdu: 'ہر شہری کے لیے',
      captionEn: 'Bridging technology and common citizens with voice access',
      captionUrdu: 'صوتی آواز کے ذریعے ہر شہری کے لیے یکساں آسان ٹیکنالوجی'
    }
  ];

  const currentStepData = tourSteps[stepIndex];

  // Auto switch role and active tab to showcase the live view
  useEffect(() => {
    if (isOpen && currentStepData) {
      if (currentStepData.targetRole) {
        onSelectRole(currentStepData.targetRole);
      }
      if (currentStepData.navTab) {
        onSelectTab(currentStepData.navTab);
      }
    }
  }, [isOpen, stepIndex]);

  const handleSpeak = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }
    const textToSpeak = isUrdu 
      ? `${currentStepData.titleUrdu}۔ ${currentStepData.explanationUrdu}`
      : `${currentStepData.titleEn}. ${currentStepData.explanationEn}`;

    setIsSpeaking(true);
    speechService.speak(textToSpeak, {
      lang: isUrdu ? 'ur' : 'en',
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handleNext = () => {
    speechService.stop();
    setIsSpeaking(false);
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    speechService.stop();
    setIsSpeaking(false);
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo 
              variant="light" 
              size="sm" 
              showSubtitle={false}
            />
            {tourMode === 'steps' && (
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {stepIndex + 1} / {tourSteps.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Tour Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-xl text-xs">
              <button
                onClick={() => setTourMode('steps')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  tourMode === 'steps' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {isUrdu ? 'مرحلہ وار ٹور' : 'Step Tour'}
              </button>
              <button
                onClick={() => setTourMode('mindmap')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  tourMode === 'mindmap' ? 'bg-[#E3A82B] text-[#04231A] shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {isUrdu ? 'ماحولیاتی مائنڈ میپ' : 'Mind Map'}
              </button>
            </div>

            {tourMode === 'steps' && (
              <button
                onClick={handleSpeak}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isSpeaking 
                    ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={isUrdu ? 'آواز میں سنیں' : 'Listen with Audio Narration'}
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline-block">
                  {isSpeaking ? (isUrdu ? 'سن رہے ہیں...' : 'Speaking...') : (isUrdu ? 'سنیں' : 'Listen')}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                speechService.stop();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Close guided tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar (Only for steps) */}
        {tourMode === 'steps' && (
          <div className="w-full bg-slate-100 h-1.5 flex">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-full flex-1 transition-all duration-300 ${
                  idx <= stepIndex ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-5">
          {tourMode === 'mindmap' ? (
            <PlatformMindMapView
              lang={lang}
              onSelectRole={(roleKey) => {
                onClose();
                onSelectRole(roleKey as Role);
              }}
              onNavigateTab={(tab) => {
                onClose();
                onSelectTab(tab);
              }}
            />
          ) : (
            <>
              {/* Title & Badge */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isUrdu ? currentStepData.badgeUrdu : currentStepData.badgeEn}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sora">
                    {isUrdu ? currentStepData.titleUrdu : currentStepData.titleEn}
                  </h2>
                  <p className="text-sm text-emerald-700 font-semibold mt-1">
                    {isUrdu ? currentStepData.subtitleUrdu : currentStepData.subtitleEn}
                  </p>
                </div>

                {/* Clean National Platform Telemetry Box */}
                <div className="w-full md:w-56 shrink-0 rounded-2xl p-3 bg-[#04231A] text-white border border-emerald-500/40 shadow-md">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-bold font-mono">VRF-2026</span>
                    <span className="text-[10px] text-amber-300 font-mono">🇵🇰 Active</span>
                  </div>
                  <p className="text-[11px] font-urdu text-slate-200 leading-snug">
                    {isUrdu ? currentStepData.captionUrdu : currentStepData.captionEn}
                  </p>
                </div>
              </div>

              {/* Main Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-sm leading-relaxed font-urdu">
                {isUrdu ? currentStepData.explanationUrdu : currentStepData.explanationEn}
              </div>

              {/* Highlighted Feature Points */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  {isUrdu ? 'نمایاں صلاحیتیں اور سہولیات' : 'Key Capabilities & Live Tools'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(isUrdu ? currentStepData.highlightFeaturesUrdu : currentStepData.highlightFeaturesEn).map((feat, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-slate-800 leading-snug font-urdu">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick interactive action shortcut inside tour */}
              <div className="flex flex-wrap gap-2 pt-2">
                {onOpenNationalMap && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNationalMap();
                    }}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <span>🇵🇰</span>
                    <span>{isUrdu ? 'قومی نقشہ دیکھیں' : 'Open Pakistan National Map'}</span>
                  </button>
                )}

                {stepIndex === 4 && onOpenVoiceSearch && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenVoiceSearch();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isUrdu ? 'وائس سرچ کا عملی تجربہ کریں' : 'Try Live Voice Search'}</span>
                  </button>
                )}
                {stepIndex === 4 && onOpenCitySlots && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCitySlots();
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>{isUrdu ? 'شہر کے وینڈر سلاٹس کا نقشہ کھولیں' : 'Open City Slots Radar Map'}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Controls */}
        {tourMode === 'steps' && (
          <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={stepIndex === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                stepIndex === 0 
                  ? 'opacity-40 cursor-not-allowed text-slate-400' 
                  : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 shadow-xs'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isUrdu ? 'پچھلا' : 'Previous'}</span>
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-1.5">
              {tourSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    speechService.stop();
                    setIsSpeaking(false);
                    setStepIndex(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === stepIndex ? 'bg-emerald-600 w-6' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <span>
                {stepIndex === tourSteps.length - 1 
                  ? (isUrdu ? 'شروع کریں' : 'Finish Tour') 
                  : (isUrdu ? 'اگلا مرحلہ' : 'Next Step')}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
