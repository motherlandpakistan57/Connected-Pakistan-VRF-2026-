import React, { useState } from 'react';
import { 
  Sparkles, Bot, TrendingUp, DollarSign, Volume2, 
  VolumeX, Copy, Check, ShieldCheck, Cpu, ArrowUpRight, 
  Layers, MapPin, Award, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Language } from '../types';
import { speechService } from '../lib/audio';
import { BrandLogo } from './BrandLogo';

interface WhyAndHowQAProps {
  lang: Language;
}

export const WhyAndHowQA: React.FC<WhyAndHowQAProps> = ({ lang }) => {
  const isUrdu = lang === 'ur';
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const qaItems = [
    {
      id: 1,
      titleUrdu: '1. کنیکٹڈ پاکستان (VRF 2026) کی بنیادی اور منفرد خصوصیات کیا ہیں؟',
      titleEn: '1. What are the core special features of Connected Pakistan (VRF 2026)?',
      icon: Sparkles,
      color: '#178A52',
      badge: 'Sovereign Innovation',
      urdu: `کنیکٹڈ پاکستان (VRF 2026) پاکستان کی شہری معیشت اور منڈیوں کے نظام میں ایک تاریخی ڈیجیٹل انقلاب ہے۔ اس کے اہم ترین ستون یہ ہیں:

1. باعزت شراکت داری (Dignity-First Enforcement): ریڑھی بان کو جرمانے یا ہٹانے کے خوف کے بجائے ڈیجیٹل کیو آر لائسنس، محفوظ 8 گھنٹے شفٹ سلاٹ اور قانونی تحفظ دیا جاتا ہے۔
2. سنگل سورس آف ٹروتھ (Single Source of Truth): شہریوں اور مجسٹریٹس دونوں کے پاس 12 بنیادی اشیائے خوردونوش کے آفیشل ڈی سی ریٹس، منڈی اوسط اور ±3% کی قدرتی گنجائش کا درست ڈیٹا ایک ہی اسکرین پر دستیاب ہے۔
3. ویسٹ ریوارڈز اور گرین پوائنٹس (Waste-to-Income): روزانہ +15 ویسٹ پوائنٹس کا نظام ریڑھی بان کو میونسپل صفائی کا فعال نگہبان بناتا ہے اور 100 پوائنٹس پر اعزازی میونسپل کٹ جاری ہوتی ہے۔
4. مائیکرو پے کریڈٹ ہسٹری (MicroPay & Financial Inclusion): روزانہ 50 روپے فیس کی ڈیجیٹل ادائیگی سے وینڈر کا باقاعدہ کریڈٹ اسکور (850 تک) بنتا ہے، جس سے وہ سودی قرضوں کے بجائے باوقار مائیکرو فنانس کے اہل بنتے ہیں۔
5. مکمل قومی نقشہ بمعہ گلگت بلتستان و آزاد کشمیر: جغرافیائی وحدت اور 30 زونز کی ریئل ٹائم مانیٹرنگ۔`,
      english: `Connected Pakistan (VRF 2026) represents a sovereign leap in municipal governance and urban market dignity:

1. Dignity-First Enforcement: Street vendors transition from constant eviction anxiety to certified economic partners with dynamic QR stall licenses, designated 8-hour shifts, and relocation protections.
2. Unified Price Truth: Both citizens and PERA field inspectors reference synchronized DC commodity rates, mandi market averages, and automated ±3% natural tolerance thresholds in real time.
3. Waste-to-Income Rewards: A gamified daily +15 sanitation point engine turns stallholders into frontline municipal stewards, unlocking certified hygiene gear and municipal trust badges at 100 points.
4. MicroPay Credit Building: Daily transparent micro-fee contributions build an unshakeable formal credit rating (out of 850), freeing micro-entrepreneurs from predatory informal lenders.
5. Complete Sovereign Geospatial Map: 100% unified national cartography explicitly integrating Gilgit-Baltistan, Azad Kashmir, and 30 active district command zones.`,
      highlights: [
        { labelUrdu: 'لائسنس یافتہ وینڈرز', labelEn: 'Active Registered Vendors', val: '186,900+' },
        { labelUrdu: 'حل کا اوسط وقت', labelEn: 'Average Resolution Time', val: '41 Mins' },
        { labelUrdu: 'شہری رپورٹنگ', labelEn: 'Anonymity Guarantee', val: '100% Secure' },
      ]
    },
    {
      id: 2,
      titleUrdu: '2. اس پلیٹ فارم میں مصنوعی ذہانت (AI) کا استعمال کیوں اور کیسے کیا گیا ہے؟',
      titleEn: '2. How and why is Artificial Intelligence (AI) utilized across the platform?',
      icon: Cpu,
      color: '#3D7EA6',
      badge: 'Intelligent Civic Tech',
      urdu: `اس پلیٹ فارم میں مصنوعی ذہانت کو نمائشی مقاصد کے لیے نہیں بلکہ عام شہری کی عملی آسانی اور منصفانہ احتساب کے لیے نافذ کیا گیا ہے:

1. خودکار نرخ تصدیق (Instant AI Deviation Scanner): جب انسپکٹر یا شہری کسی چیز کی قیمت درج کرتا ہے تو اے آئی خودکار طور پر سرکاری ڈی سی ریٹ کے مقابلے میں فرق کا فیصد نکالتا ہے اور ±3% کی قدرتی حد کو گرین رکھتے ہوئے صرف اصل خلاف ورزی کو ہائی لائٹ کرتا ہے۔
2. صوتی رہنمائی اور لسانی رسائی (Bilingual Voice & Text-to-Speech): غیر تعلیم یافتہ شہریوں اور بزرگوں کے لیے رومن اردو، سلیس اردو اور انگریزی میں صوتی سوال و جواب فراہم کرتا ہے۔
3. ہمدردانہ پروٹوکول (Empathy Protocol): شہری کے پریشان ہونے کی صورت میں اے آئی فوری ہمدردی کا اظہار کرتا ہے اور براہ راست گمنام رپورٹنگ کا لنک فراہم کرتا ہے۔
4. انسانی حتمی فیصلہ (Human-in-the-loop): اے آئی تجزیہ اور سفارشات مرتب کرتا ہے لیکن قانونی چالان یا ریلیف کا حتمی فیصلہ ہمیشہ انسان (مجسٹریٹ) کے ہاتھ میں رہتا ہے۔`,
      english: `Artificial Intelligence is embedded to eliminate friction for everyday citizens and maintain evidentiary fairness:

1. Instant Rate Discrepancy Scanning: Automatically calculates percentage price deviations against official DC rate baselines, applying an algorithmic ±3% natural market buffer before triggering coaching or alerts.
2. Bilingual Voice & Conversational Engine: Empowers citizens of all literacy levels to query prices, report overcharging, or understand municipal laws in Roman-Urdu, formal Urdu, and English via native Web Speech synthesis.
3. Psychological Empathy Protocol: Recognizes distress or frustration and immediately provides calming reassurance with 1-click routing to the anonymous reporting engine.
4. Human-in-the-Loop Governance: AI advises and organizes telemetry; human magistrates and district command officers retain 100% authoritative decision-making.`,
      highlights: [
        { labelUrdu: 'اسکیننگ گنجائش', labelEn: 'Tolerance Buffer', val: '±3.0%' },
        { labelUrdu: 'اے آئی رسپانس رفتار', labelEn: 'Inference Speed', val: '<450 ms' },
        { labelUrdu: 'فیصلہ سازی', labelEn: 'Authority Model', val: 'Human-Led' },
      ]
    },
    {
      id: 3,
      titleUrdu: '3. مستقبل کے توسیعی منصوبے اور علاقائی زبانوں کی سپورٹ کیا ہیں؟',
      titleEn: '3. What are the future expansion plans and roadmap for scale?',
      icon: TrendingUp,
      color: '#E3A82B',
      badge: 'National Scale 2026-2030',
      urdu: `کنیکٹڈ پاکستان کے آئندہ توسیعی منصوبے میں شامل ہیں:

1. علاقائی زبانوں کی مکمل صوتی سپورٹ: سندھی، پشتو، بلوچی، پنجابی، سرائیکی اور شینا میں صوتی و متنی گائیڈ کی شمولیت۔
2. بغیر انٹرنیٹ کے USSD اور SMS چینل: سادہ کی پیڈ فونز والے ریڑھی بانوں کے لیے *2026# ڈائل کر کے ڈی سی ریٹس اور کیو آر تصدیق کی سہولت۔
3. بینکنگ اور مائیکرو تکافل انشورنس: وینڈر کے کریڈٹ اسکور کی بنیاد پر اسٹیٹ بینک کے منظور شدہ بینکوں سے 0% سود پر تجارتی مائیکرو فنانس اور ہیلتھ تکافل۔
4. سیٹلائٹ اربن پلاننگ: مصنوعی سیاروں اور میونسپل جی آئی ایس میپنگ سے نئے سستے بازاروں کی خودکار منصوبہ بندی۔`,
      english: `The expansion roadmap for Connected Pakistan envisions nationwide deep-tier inclusion:

1. Full Regional Dialect Support: Onboarding native voice and text comprehension for Sindhi, Pashto, Balochi, Punjabi, Saraiki, and Shina.
2. USSD & SMS Gateway for Feature Phones: Instant access via *2026# USSD codes allowing non-smartphone vendors to verify DC rates and validate QR shift permits.
3. Banking & Micro-Takaful Integration: Connecting vendor MicroPay credit scores with State Bank licensed microfinance institutions for interest-free stall capital and health takaful.
4. Satellite Urban GIS Zoning: Municipal heatmaps dynamically allocating new pedestrian market slots based on satellite foot-traffic density.`,
      highlights: [
        { labelUrdu: 'علاقائی زبانیں', labelEn: 'Dialect Targets', val: '6+ Languages' },
        { labelUrdu: 'فیچر فون سپورٹ', labelEn: 'Keypad USSD', val: '*2026#' },
        { labelUrdu: 'قومی وسعت', labelEn: 'National Reach', val: 'All 36 Districts' },
      ]
    },
    {
      id: 4,
      titleUrdu: '4. ریونیو ماڈل اور قومی معیشت پر مثبت اثرات (Rs 2.8 Billion/Year Math) کیا ہیں؟',
      titleEn: '4. What is the economic & revenue impact model (Rs 2.8 Billion/Year)?',
      icon: DollarSign,
      color: '#178A52',
      badge: 'Rs 2.8B Zero-Leakage Math',
      urdu: `یہ نظام نہ صرف شفافیت لاتا ہے بلکہ قومی و میونسپل خزانے کو اربوں روپے کی شفاف آمدن فراہم کرتا ہے:

1. روزانہ 50 روپے مائیکرو فیس کا حساب: پاکستان کے بڑے شہروں میں 186,900 لائسنس یافتہ ریڑھی بان اگر روزانہ صرف 50 روپے کی معمولی میونسپل سروس فیس ادا کریں تو روزانہ 9.34 ملین روپے اور سالانہ 2.8 ارب روپے سے زائد شفاف رقم بغیر کسی رشوت یا لیکیج کے براہ راست سرکاری خزانے میں جمع ہوتی ہے۔
2. کچرے کی ری سائیکلنگ اور صفائی کی بچت: روزانہ 15 پوائنٹس کی ترغیب سے شہروں کا 40% کچرا منڈی کی سطح پر الگ ہوتا ہے، جس سے بلدیاتی اخراجات میں سالانہ 600 ملین روپے کی بچت ہوتی ہے۔
3. شہریوں کی جیب میں بچت: گراں فروشی کے 61% خاتمے سے کروڑوں غریب خاندانوں کو سستی دالیں، آٹا، چینی اور سبزیاں ملنے سے سالانہ اربوں روپے کا ریلیف ملتا ہے۔`,
      english: `The VRF economic engine is mathematically structured for zero leakage and immense public dividend:

1. Rs 50/Day Micro-Service Math: With 186,900 certified vendors contributing a modest Rs 50 daily service fee, municipalities generate Rs 9.345 Million daily — yielding over Rs 2.8 Billion annually in 100% digital, leak-free municipal revenue.
2. Waste Segregation & Municipal Savings: The daily +15 point incentive segregates ~40% of organic bazaar waste at source, saving municipal corporations over Rs 600 Million annually in landfill logistics.
3. Consumer Purchasing Power Relief: A 61% reduction in arbitrary price gouging saves millions of middle and lower-income Pakistani households billions of rupees annually on essential staples.`,
      highlights: [
        { labelUrdu: 'سالانہ بلدیاتی آمدن', labelEn: 'Annual Municipal Revenue', val: 'Rs 2.8+ Billion' },
        { labelUrdu: 'روزانہ شفاف وصولی', labelEn: 'Daily Transparent Inflow', val: 'Rs 9.34 Million' },
        { labelUrdu: 'گراں فروشی میں کمی', labelEn: 'Overcharging Reduction', val: '-61% in 14 Days' },
      ]
    }
  ];

  const handleSpeak = (text: string, index: number) => {
    if (playingAudioIndex === index) {
      speechService.stop();
      setPlayingAudioIndex(null);
    } else {
      speechService.stop();
      setPlayingAudioIndex(index);
      speechService.speak(text, {
        lang: isUrdu ? 'ur' : 'en',
        onEnd: () => setPlayingAudioIndex(null),
      });
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Header Banner */}
      <div className="bg-[#04231A] text-[#FCFAF3] p-6 sm:p-8 rounded-3xl border-2 border-[#E3A82B] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-3 flex-1">
          <div className="inline-flex items-center gap-2 bg-[#E3A82B] text-[#04231A] px-3.5 py-1 rounded-full text-xs font-extrabold shadow">
            <Sparkles className="w-4 h-4 text-[#04231A]" />
            <span>{isUrdu ? 'پلیٹ فارم وژن و تفصیلی سوالات' : 'VRF 2026 Knowledge & Strategic Architecture'}</span>
          </div>

          <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
            {isUrdu ? 'کیوں اور کیسے؟ تفصیلی سوال و جواب' : 'Why and How? Strategic QA'}
          </h2>
          <p className="text-sm text-[#DCEFE4] max-w-2xl font-urdu leading-relaxed">
            {isUrdu 
              ? 'کنیکٹڈ پاکستان کے تمام اہم پہلوؤں، اے آئی میکانزم، اقتصادی ماڈل اور مستقبل کی منصوبہ بندی کے مستند جوابات'
              : 'Deep strategic insights into VRF 2026 architecture, AI design philosophies, economic revenue math, and future roadmap.'}
          </p>
        </div>

        <div className="relative z-10 shrink-0 bg-[#0B4A31]/90 p-4 rounded-3xl border border-[#E3A82B]/60 shadow-lg">
          <BrandLogo variant="dark" size="md" showSubtitle={true} subtitleText="VRF 2026 Sovereign Blueprint" />
        </div>
      </div>

      {/* Accordion Cards */}
      <div className="space-y-4">
        {qaItems.map((qa, idx) => {
          const Icon = qa.icon;
          const isOpen = activeAccordion === idx;
          const currentContent = isUrdu ? qa.urdu : qa.english;
          const isPlaying = playingAudioIndex === idx;

          return (
            <div 
              key={qa.id}
              className={`rounded-3xl border transition-all shadow-md overflow-hidden ${
                isOpen 
                  ? 'bg-[#FCFAF3] border-[#178A52] ring-2 ring-[#178A52]/20' 
                  : 'bg-[#FCFAF3] border-[#178A52]/20 hover:border-[#178A52]/50'
              }`}
            >
              {/* Header clickable bar */}
              <div 
                onClick={() => setActiveAccordion(isOpen ? null : idx)}
                className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: qa.color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCEFE4] text-[#0B4A31] uppercase">
                        {qa.badge}
                      </span>
                    </div>
                    <h3 className={`font-sora font-bold text-base sm:text-lg text-[#04231A] ${isUrdu ? 'font-urdu' : ''}`}>
                      {isUrdu ? qa.titleUrdu : qa.titleEn}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentContent, idx);
                    }}
                    className={`p-2 rounded-xl border transition-colors ${
                      isPlaying 
                        ? 'bg-[#B03A2E] text-white border-[#B03A2E]' 
                        : 'bg-[#0B4A31]/10 hover:bg-[#0B4A31]/20 text-[#04231A] border-[#0B4A31]/20'
                    }`}
                    title={isPlaying ? 'Stop Audio' : 'Play Narration'}
                  >
                    {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <div className="p-1.5 text-[#04231A]">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Body Content */}
              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#178A52]/10 space-y-4">
                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {qa.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="bg-[#DCEFE4]/40 p-3 rounded-2xl border border-[#178A52]/20 text-center">
                        <span className="block text-xs text-[#0B4A31] font-semibold">
                          {isUrdu ? h.labelUrdu : h.labelEn}
                        </span>
                        <span className="font-sora font-extrabold text-base text-[#04231A]">
                          {h.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Text Description */}
                  <div className={`p-4 rounded-2xl bg-white border border-[#178A52]/20 text-[#132A21] leading-relaxed whitespace-pre-line text-sm ${isUrdu ? 'font-urdu text-base' : ''}`}>
                    {currentContent}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleCopy(currentContent, idx)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B4A31] hover:text-[#178A52] transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-4 h-4 text-[#178A52]" />
                          <span>{isUrdu ? 'کاپی ہو گیا!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{isUrdu ? 'متن کاپی کریں' : 'Copy Answer'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSpeak(currentContent, idx)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#178A52] text-white px-3.5 py-1.5 rounded-xl shadow hover:bg-[#0B4A31] transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlaying ? (isUrdu ? 'آواز بند کریں' : 'Stop') : (isUrdu ? 'آواز سنیں' : 'Listen')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Sovereign Statement */}
      <div className="p-4 rounded-2xl bg-[#04231A] text-center border border-[#178A52]/40 text-white">
        <p className="text-xs text-[#DCEFE4]">
          {isUrdu ? 'کنیکٹڈ پاکستان (VRF 2026) • خود مختار ڈیجیٹل گورننس فریم ورک • پاکستان زندہ باد 🇵🇰' : 'Connected Pakistan VRF 2026 • Sovereign Digital Governance Framework • Pakistan Zindabad 🇵🇰'}
        </p>
      </div>
    </div>
  );
};
