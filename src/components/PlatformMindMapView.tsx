import React, { useState } from 'react';
import { 
  Users, Store, Shield, Building2, Sparkles, 
  ArrowRight, CheckCircle2, Volume2, Info, Eye, 
  Share2, Zap, RefreshCw, Layers, ShieldCheck, HeartHandshake
} from 'lucide-react';
import { Language } from '../types';
import { speechService } from '../lib/audio';
import { Emblem } from './Emblem';

interface PlatformMindMapViewProps {
  lang: Language;
  onSelectRole?: (role: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface EcosystemNode {
  id: string;
  roleKey: string;
  titleEn: string;
  titleUrdu: string;
  subtitleEn: string;
  subtitleUrdu: string;
  descEn: string;
  descUrdu: string;
  image?: string;
  badgeEn: string;
  badgeUrdu: string;
  color: string;
  icon: string;
  keyResponsibilitiesEn: string[];
  keyResponsibilitiesUrdu: string[];
  x: number;
  y: number;
}

export const PlatformMindMapView: React.FC<PlatformMindMapViewProps> = ({
  lang,
  onSelectRole,
  onNavigateTab,
}) => {
  const isUrdu = lang === 'ur';
  const [selectedNodeId, setSelectedNodeId] = useState<string>('citizens');
  const [activeFlow, setActiveFlow] = useState<'all' | 'complaint' | 'license' | 'rates'>('all');

  const nodes: EcosystemNode[] = [
    {
      id: 'citizens',
      roleKey: 'citizen',
      titleEn: '1. Citizens of Pakistan',
      titleUrdu: '۱. پاکستانی شہری و صارفین',
      subtitleEn: 'Price Transparency & Anonymous Constitutional Voice',
      subtitleUrdu: 'شفاف نرخ نامہ اور گمنام آئینی شکایت کا حق',
      descEn: 'Empowered with instant access to mandatory Deputy Commissioner price ceilings and the ability to submit encrypted, zero-retaliation overcharging reports.',
      descUrdu: 'شہریوں کو روزانہ کے سرکاری ڈی سی نرخوں کا مکمل علم حاصل ہوتا ہے اور وہ بغیر شناخت ظاہر کیے زائد قیمت کے خلاف باضابطہ شکایت درج کر سکتے ہیں۔',
      badgeEn: 'Constitutional Voice',
      badgeUrdu: 'عوامی اختیار',
      color: '#178A52',
      icon: '👥',
      keyResponsibilitiesEn: [
        'Check daily live DC price ticker for 12+ commodities',
        'Search verified green stalls in nearby bazaars',
        'Submit anonymous overcharging complaints with photo & GPS',
        'Track live squad dispatch & transparent case closure'
      ],
      keyResponsibilitiesUrdu: [
        '12 سے زائد اشیائے ضروریہ کا روزانہ سرکاری ڈی سی ریٹ دیکھنا',
        'قریبی بازار میں تصدیق شدہ گرین دکاندار تلاش کرنا',
        'تصویر اور لوکیشن کے ساتھ گمنام شکایت درج کرانا',
        'شکایت پر اسکواڈ کی روانگی اور کارروائی لائیو ٹریک کرنا'
      ],
      x: 100,
      y: 120,
    },
    {
      id: 'ai_engine',
      roleKey: 'ai',
      titleEn: '2. AI Civic Engine & Verification Gateway',
      titleUrdu: '۲. اے آئی خودکار تصدیق و گیٹ وے',
      subtitleEn: '±3% Fair Margin Filter & 9-Min Dispatch Automation',
      subtitleUrdu: '±3% رعایت کا فلٹر اور 9 منٹ میں خودکار روانگی',
      descEn: 'Acts as the neutral judicial algorithm ensuring objective fairness, filtering frivolous claims while instantaneously deploying PERA squads when violations exceed tolerance.',
      descUrdu: 'یہ خودکار اے آئی نظام زائد قیمت کی شکایت کا موقع پر ڈی سی ریٹ سے موازنہ کرتا ہے۔ 3 فیصد رعایت پر معافی اور اس سے زیادہ پر فوری پیرہ اسکواڈ روانہ کرتا ہے۔',
      badgeEn: 'Objective Algorithm',
      badgeUrdu: 'غیر جانبدار الگورتھم',
      color: '#E3A82B',
      icon: '⚡',
      keyResponsibilitiesEn: [
        'Instant ±3% variance calculation against official gazette',
        'Encrypted geo-tagging & photographic evidence validation',
        'Automated squad dispatch optimization (Avg 9.2 mins)',
        'Urdu & English natural speech command processing'
      ],
      keyResponsibilitiesUrdu: [
        'سرکاری گزٹ کے مطابق ±3% رعایت کا خودکار حساب',
        'انکرپٹڈ جیو ٹیگ اور تصویری شواہد کی فوری توثیق',
        'قریبی پیٹرول اسکواڈ کو خودکار روانگی سگنل',
        'اردو اور انگلش میں قدرتی صوتی احکامات کی پروسیسنگ'
      ],
      x: 350,
      y: 220,
    },
    {
      id: 'inspectors',
      roleKey: 'inspector',
      titleEn: '3. PERA Field Magistrates',
      titleUrdu: '۳. پیرہ فیلڈ مجسٹریٹس و انسپکٹرز',
      subtitleEn: 'Evidence-Based Price Scanner & Coaching Protocol',
      subtitleUrdu: 'شواہد پر مبنی ڈیجیٹل اسکینر اور باوقار رہنمائی',
      descEn: 'Field enforcement officers equipped with AI optical scanners. They prioritize vendor education and issue digital citations only with verifiable proof, eliminating arbitrary extortion.',
      descUrdu: 'پیرہ مجسٹریٹس ریڑھی بانوں کے کیو آر کوڈ اور ریٹس کا اسکینر کے ذریعے معائنہ کرتے ہیں۔ بلاجواز تنگ کرنے کی ممانعت ہے اور صرف ٹھوس ثبوت پر چالان ہوتا ہے۔',
      badgeEn: 'Field Enforcement',
      badgeUrdu: 'فیلڈ مجسٹریٹ',
      color: '#3D7EA6',
      icon: '🛡️',
      keyResponsibilitiesEn: [
        'AI camera scan of price boards & weighing scales',
        '35m geo-fence radius slot verification',
        'Digital instant SMS citation with verifiable evidence',
        'Vendor civics coaching & compliance ratings'
      ],
      keyResponsibilitiesUrdu: [
        'ریٹ بورڈز اور وزن کے پیمانوں کا اے آئی اسکین',
        '35 میٹر جیو فینس کی حدود اور سلاٹ کی تصدیق',
        'موقع پر ایس ایم ایس کے ذریعے ڈیجیٹل چالان',
        'دکانداروں کی اصلاحی رہنمائی اور ریٹنگ میں اضافہ'
      ],
      x: 600,
      y: 120,
    },
    {
      id: 'vendors',
      roleKey: 'vendor',
      titleEn: '4. Street Vendors & Micro-Merchants',
      titleUrdu: '۴. محنت کش ریڑھی بان و تاجر',
      subtitleEn: 'Zero-Eviction Protection, 8-Hr Slots & 0% MicroPay',
      subtitleUrdu: 'زیرو بے دخلی تحفظ، 8 گھنٹے کی گردش اور بلاسود مائیکرو پے',
      descEn: 'Recognized as foundational economic pillars. Provided designated geofenced 6x4 ft spaces, official QR licenses, waste management rewards, and micro-credit scores up to 850.',
      descUrdu: 'پاکستان کے محنت کش معیشت کی ریڑھ کی ہڈی ہیں۔ انہیں مقررہ 6x4 فٹ جیو فینس جگہ، کیو آر لائسنس، روزانہ کیش لیس مائیکرو فنانس اور مکمل قانونی تحفظ حاصل ہے۔',
      badgeEn: 'Dignified Partner',
      badgeUrdu: 'باعزت شراکت دار',
      color: '#178A52',
      icon: '🏪',
      keyResponsibilitiesEn: [
        'Display municipal QR code badge on 6x4 ft regulated stall',
        'Adhere to fair daily DC price ceilings',
        'Earn Clean-Green Tier 1/2/3 zero-waste reward tokens',
        'Access 0% interest morning wholesale working capital'
      ],
      keyResponsibilitiesUrdu: [
        '6x4 فٹ کی ریڑھی پر سرکاری کیو آر لائسنس لگانا',
        'سرکاری ڈی سی نرخوں کے مطابق شفاف فروخت',
        'صفائی پر زیرو ویسٹ گرین پوائنٹس حاصل کرنا',
        'منڈی کے لیے صبح صبح بلاسود ورکنگ کیپیٹل لینا'
      ],
      x: 180,
      y: 340,
    },
    {
      id: 'government',
      roleKey: 'government',
      titleEn: '5. District Command & DC Center',
      titleUrdu: '۵. ڈپٹی کمشنر کمانڈ و ضلعی انتظامیہ',
      subtitleEn: '30-Zone Heatmap, Zero Leakage & Policy Governance',
      subtitleUrdu: '30 اضلاع کا لائیو ہیٹ میپ اور شفاف میونسپل ریونیو',
      descEn: 'Executive municipal leadership managing district slot quotas, monitoring patrol units via live GIS telemetry, and guaranteeing fair market governance under the VRF Act 2026.',
      descUrdu: 'ڈپٹی کمشنرز پورے ضلع میں ریڑھی بانوں کے سلاٹس کی الاٹمنٹ، لائیو ہیٹ میپ کی نگرانی اور میونسپل فیسوں کی 100 فیصد شفاف وصولی کو یقینی بناتے ہیں۔',
      badgeEn: 'Executive Command',
      badgeUrdu: 'انتظامی کمانڈ',
      color: '#0B4A31',
      icon: '🏛️',
      keyResponsibilitiesEn: [
        'Oversee 30 administrative district zones & complaint density',
        'Enforce VRF 2026 anti-harassment statutory protections',
        'Audit transparent digital revenue (Zero middleman leakage)',
        'Authorize strategic seasonal bazaar relocations'
      ],
      keyResponsibilitiesUrdu: [
        '30 اضلاع کے زونز اور شکایات کے رش کی نگرانی',
        'وی آر ایف 2026 کے تحت اینٹی ہراسمنٹ قوانین کا نفاذ',
        'بغیر کسی کرپشن کے شفاف ڈیجیٹل ریونیو کا آڈٹ',
        'ضرورت کے مطابق نئے بازاروں اور سلاٹس کی منظوری'
      ],
      x: 520,
      y: 340,
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleSpeakNode = (node: EcosystemNode) => {
    const text = isUrdu
      ? `${node.titleUrdu}۔ ${node.descUrdu}`
      : `${node.titleEn}. ${node.descEn}`;
    speechService.speak(text, { lang: isUrdu ? 'ur' : 'en' });
  };

  return (
    <div className="space-y-6">
      {/* Top Narrative & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#178A52]/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E3A82B] animate-ping" />
            <span className="text-xs font-mono font-bold text-[#E3A82B] uppercase tracking-wider">
              INTERACTIVE ECOSYSTEM MIND MAP
            </span>
          </div>
          <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-[#04231A] dark:text-white mt-0.5">
            {isUrdu ? 'پلیٹ فارم مائنڈ میپ — باہم مربوط ماحولیاتی نظام' : 'VRF 2026 Connected Ecosystem Mind Map'}
          </h3>
          <p className="text-xs text-[#5C6F63] dark:text-[#DCEFE4]/80 font-urdu mt-0.5">
            {isUrdu
              ? 'شہریوں، دکانداروں، پیرہ انسپکٹرز اور ڈپٹی کمشنرز کے درمیان شفاف ڈیجیٹل تعلق کا بصری خاکہ'
              : 'Interactive flow illustrating the seamless synergy between Citizens, AI Gateway, Vendors, Regulators, and District Command.'}
          </p>
        </div>

        {/* Flow Selector Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#04231A] p-1.5 rounded-2xl border border-[#178A52]/40 text-xs text-white">
          <button
            onClick={() => setActiveFlow('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeFlow === 'all' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4]/70 hover:text-white'
            }`}
          >
            {isUrdu ? 'تمام تعلقات (Full Mind Map)' : 'Full Mind Map'}
          </button>
          <button
            onClick={() => setActiveFlow('complaint')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeFlow === 'complaint' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4]/70 hover:text-white'
            }`}
          >
            {isUrdu ? 'شکایت کا راستہ' : 'Complaint Flow'}
          </button>
          <button
            onClick={() => setActiveFlow('license')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeFlow === 'license' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4]/70 hover:text-white'
            }`}
          >
            {isUrdu ? 'کیو آر و مائیکرو پے' : 'QR & Credit'}
          </button>
        </div>
      </div>

      {/* Interactive SVG Flow Diagram Stage */}
      <div className="bg-[#031E15] rounded-3xl p-4 sm:p-6 border-2 border-[#178A52]/50 shadow-2xl relative overflow-hidden">
        {/* Animated Particles / Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#178A52_1px,transparent_1px),linear-gradient(to_bottom,#178A52_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* SVG Flow Connectors Layer */}
        <svg
          viewBox="0 0 720 460"
          className="w-full h-auto min-h-[320px] max-h-[440px] drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Animated Gradient Lines */}
            <linearGradient id="flowGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E3A82B" />
              <stop offset="50%" stopColor="#178A52" />
              <stop offset="100%" stopColor="#E3A82B" />
            </linearGradient>

            <linearGradient id="flowGradEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#178A52" />
              <stop offset="100%" stopColor="#3D7EA6" />
            </linearGradient>

            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Center Connection Lines */}
          {/* 1. Citizens -> AI Engine */}
          <path
            d="M 170 120 Q 250 120 310 180"
            fill="none"
            stroke="url(#flowGradGold)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
          <text x="210" y="140" fill="#E3A82B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            1. Rate Check & Anonymous Report ➔
          </text>

          {/* 2. AI Engine -> Inspectors */}
          <path
            d="M 430 180 Q 500 120 560 120"
            fill="none"
            stroke="url(#flowGradEmerald)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
          <text x="440" y="140" fill="#3D7EA6" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            ➔ 2. ±3% Scan & 9-Min Dispatch
          </text>

          {/* 3. Inspectors -> Vendors */}
          <path
            d="M 600 180 Q 600 360 260 360"
            fill="none"
            stroke="#178A52"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          <text x="360" y="380" fill="#DCEFE4" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            3. On-Site QR Verification & Vendor Coaching ➔
          </text>

          {/* 4. Vendors -> District Command */}
          <path
            d="M 260 340 L 460 340"
            fill="none"
            stroke="url(#flowGradGold)"
            strokeWidth="2"
          />
          <text x="310" y="330" fill="#E3A82B" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            4. 0% MicroPay & Zero Leakage Fees ➔
          </text>

          {/* 5. District Command -> Citizens */}
          <path
            d="M 520 300 Q 360 280 160 180"
            fill="none"
            stroke="#E3A82B"
            strokeWidth="2"
            strokeDasharray="5 3"
            opacity="0.7"
          />
          <text x="220" y="270" fill="#F4D58D" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            5. Transparent Case Resolution & Verified Bazaars ➔
          </text>

          {/* SVG Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                {/* Outer Glow Ring if Selected */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="0"
                    r="48"
                    fill="none"
                    stroke="#E3A82B"
                    strokeWidth="3"
                    filter="url(#nodeGlow)"
                    className="animate-pulse"
                  />
                )}

                {/* Node Main Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r="40"
                  fill="#0B4A31"
                  stroke={isSelected ? '#E3A82B' : node.color}
                  strokeWidth="2.5"
                />

                {/* Node Icon */}
                <text
                  x="0"
                  y="8"
                  fontSize="24"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {node.icon}
                </text>

                {/* Node Label Below */}
                <rect
                  x="-70"
                  y="46"
                  width="140"
                  height="22"
                  rx="6"
                  fill="#04231A"
                  stroke={isSelected ? '#E3A82B' : '#178A52'}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="60"
                  fontSize="10"
                  fill="#FCFAF3"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {isUrdu ? node.badgeUrdu : node.badgeEn}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Instruction Banner at Top of Stage */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs bg-[#04231A]/90 p-2.5 rounded-2xl border border-[#178A52]/40 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E3A82B]" />
            <span className="font-bold font-urdu">
              {isUrdu ? 'کسی بھی نوڈ پر کلک کریں تاکہ باہمی تعلق، حقوق اور کردار کی تفصیل دیکھیں' : 'Click any node to inspect role responsibilities, rights & live telemetry.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#E3A82B] font-mono">VRF Act 2026 Protected</span>
          </div>
        </div>
      </div>

      {/* Selected Node Comprehensive Deep Dive Detail Card */}
      <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 border border-[#178A52]/20 shadow-xl text-[#132A21] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F6F2E7]">
          <div className="flex items-center gap-4">
            {/* Sovereign Role Avatar Icon */}
            <div className="relative w-16 h-16 rounded-2xl bg-[#04231A] text-emerald-400 flex items-center justify-center border-2 border-[#178A52] shadow-lg shrink-0 text-2xl font-bold">
              <span>{selectedNode.icon}</span>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#178A52] border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#178A52]/10 text-[#178A52] px-2.5 py-0.5 rounded-full font-bold">
                  {isUrdu ? selectedNode.badgeUrdu : selectedNode.badgeEn}
                </span>
                <span className="text-xs text-[#5C6F63] font-mono">ID: {selectedNode.id.toUpperCase()}</span>
              </div>
              <h4 className="font-sora font-extrabold text-xl sm:text-2xl text-[#04231A] mt-1">
                {isUrdu ? selectedNode.titleUrdu : selectedNode.titleEn}
              </h4>
              <p className="text-xs text-[#178A52] font-semibold mt-0.5">
                {isUrdu ? selectedNode.subtitleUrdu : selectedNode.subtitleEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSpeakNode(selectedNode)}
              className="bg-[#04231A] hover:bg-[#0B4A31] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow active:scale-95 transition-transform"
            >
              <Volume2 className="w-4 h-4 text-[#E3A82B]" />
              <span>{isUrdu ? 'تفصیل سنیں' : 'Listen with Audio'}</span>
            </button>

            {onSelectRole && selectedNode.roleKey !== 'ai' && (
              <button
                onClick={() => onSelectRole(selectedNode.roleKey)}
                className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <span>{isUrdu ? 'اس کنسول میں جائیں' : 'Switch to Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Narrative Description */}
        <div className="bg-white rounded-2xl p-5 border border-[#178A52]/20 shadow-sm text-sm text-[#132A21] font-urdu leading-relaxed">
          {isUrdu ? selectedNode.descUrdu : selectedNode.descEn}
        </div>

        {/* 4 Core Responsibilities / Capabilities */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#5C6F63] mb-3 font-urdu">
            {isUrdu ? 'اہم آئینی فرائض و ڈیجیٹل اختیارات:' : 'Key Operational Mandate & Rights under VRF 2026:'}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(isUrdu ? selectedNode.keyResponsibilitiesUrdu : selectedNode.keyResponsibilitiesEn).map((resp, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-2xl border border-[#178A52]/20 shadow-xs flex items-start gap-2.5 hover:border-[#178A52] transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-[#178A52] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-[#04231A] leading-snug font-urdu">{resp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
