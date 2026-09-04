import React, { useState } from 'react';
import { 
  ShieldCheck, Award, QrCode, CheckCircle2, Star, 
  MapPin, Scale, Volume2, Share2, AlertTriangle, 
  Clock, X, Sparkles, ThumbsUp, FileText, Check,
  ZoomIn, Droplets, Zap, Calculator, Compass, Printer
} from 'lucide-react';
import { Language, VendorProfile, DCRateItem } from '../types';
import { speechService } from '../lib/audio';

interface VendorVerifiedProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorProfile | null;
  lang: Language;
  dcRates: DCRateItem[];
  onOpenReportForVendor?: (vendor: VendorProfile) => void;
  onOpenLocate?: (place: string) => void;
  onOpenCitySlotsMap?: (slotId?: string) => void;
  onEndorseVendor?: (vendorId: string) => void;
}

export const VendorVerifiedProfileModal: React.FC<VendorVerifiedProfileModalProps> = ({
  isOpen,
  onClose,
  vendor,
  lang,
  dcRates = [],
  onOpenReportForVendor,
  onOpenLocate,
  onOpenCitySlotsMap,
  onEndorseVendor,
}) => {
  const isUrdu = lang === 'ur';
  const [endorsed, setEndorsed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCalcQty, setSelectedCalcQty] = useState<number>(1);
  const [selectedCalcItem, setSelectedCalcItem] = useState<string>('');

  if (!isOpen || !vendor) return null;

  // Filter or match commodities sold by this vendor type
  const shopKeywords = (vendor.shopName + ' ' + vendor.shopNameUrdu).toLowerCase();
  let vendorItems = dcRates.filter(item => {
    if (shopKeywords.includes('fruit') || shopKeywords.includes('veg') || shopKeywords.includes('سبزی')) {
      return item.categoryEn === 'Vegetables' || item.categoryUrdu.includes('سبزی');
    }
    if (shopKeywords.includes('dairy') || shopKeywords.includes('دودھ') || shopKeywords.includes('گوشت')) {
      return item.categoryEn === 'Dairy & Poultry' || item.categoryEn === 'Meat';
    }
    if (shopKeywords.includes('atta') || shopKeywords.includes('grain') || shopKeywords.includes('کریانہ')) {
      return item.categoryEn === 'Grains & Flour' || item.categoryEn === 'Groceries';
    }
    if (shopKeywords.includes('spice') || shopKeywords.includes('pulse') || shopKeywords.includes('دال')) {
      return item.categoryEn === 'Pulses & Lentils' || item.categoryEn === 'Groceries';
    }
    return true;
  });

  if (vendorItems.length === 0) {
    vendorItems = dcRates.slice(0, 6);
  }

  const handleEndorse = () => {
    if (!endorsed) {
      setEndorsed(true);
      if (onEndorseVendor) onEndorseVendor(vendor.id);
      speechService.confirmVendorAction(
        lang,
        'شکریہ! آپ کی ستائش درج کر لی گئی ہے۔ دکاندار کے کریڈٹ اسکور میں اضافہ ہو گیا۔',
        'Thank you! Your civic endorsement has been recorded.'
      );
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?vendorId=${vendor.id}&slot=${vendor.qrId || 'SLOT-19'}&verify=1`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const speechText = isUrdu
    ? `سرکاری تصدیق شدہ دکاندار: ${vendor.shopNameUrdu}۔ شراکت دار: ${vendor.nameUrdu}۔ ڈی سی تعمیل اسکور: ${vendor.score} از 10۔ جیو فینس شدہ رقبہ: 6 فٹ ضرب 4 فٹ راجہ بازار۔ روزانہ سرکاری نرخوں کی پابندی 100 فیصد ہے۔ ڈیجیٹل اسکیل سرٹیفائیڈ۔`
    : `Official Verified Vendor: ${vendor.shopName}, operated by ${vendor.name}. DC Compliance Score: ${vendor.score} out of 10. Geofenced footprint: 6 by 4 feet at ${vendor.marketName}. Calibrated digital scale certified with zero overcharging.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FCFAF3] text-[#132A21] rounded-3xl border-2 border-[#178A52] max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-fadeUp">
        
        {/* Government Header Banner */}
        <div className="bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] text-white p-5 sm:p-6 border-b-2 border-[#E3A82B] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-[#178A52] text-white text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E3A82B]" />
              {isUrdu ? 'حکومت پنجاب — تصدیق شدہ گرین وینڈر' : 'Govt of Punjab — Verified Green Stall'}
            </span>
            <span className="bg-[#E3A82B] text-[#04231A] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              VRF Act 2026
            </span>
            <span className="bg-[#04231A] border border-[#178A52] text-[#DCEFE4] text-[10px] font-mono px-2 py-0.5 rounded-full">
              QR ID: {vendor.qrId || `VRF-SLOT-${vendor.id}`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
                {isUrdu ? vendor.shopNameUrdu : vendor.shopName}
              </h2>
              <p className="text-xs sm:text-sm text-[#DCEFE4] font-urdu mt-1 flex flex-wrap items-center gap-2">
                <span>{isUrdu ? 'شراکت دار دکاندار:' : 'Partner Vendor:'} <strong className="text-[#E3A82B]">{isUrdu ? vendor.nameUrdu : vendor.name}</strong></span>
                <span>•</span>
                <span>شناختی کارڈ: {vendor.cnic}</span>
                <span>•</span>
                <span className="bg-[#178A52]/60 px-2 py-0.5 rounded-lg text-white font-bold">{vendor.slotNumber}</span>
              </p>
            </div>

            {/* Overall DC Score Badge */}
            <div className="bg-[#04231A] border-2 border-[#E3A82B] rounded-2xl p-3 text-center shrink-0 shadow-lg">
              <span className="text-[10px] text-[#DCEFE4]/80 font-bold block">
                {isUrdu ? 'ڈی سی تعمیل اسکور' : 'DC Compliance Score'}
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-5 h-5 text-[#E3A82B] fill-[#E3A82B]" />
                <span className="font-sora font-extrabold text-2xl text-white">
                  {vendor.score}
                </span>
                <span className="text-xs text-[#DCEFE4]/70">/10</span>
              </div>
              <span className="text-[9px] bg-[#178A52] text-white px-2 py-0.5 rounded-full font-bold block mt-1">
                Top 5% in Zone
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Key Compliance Pillar Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-[#178A52]/20 shadow-xs text-center">
              <Scale className="w-5 h-5 text-[#178A52] mx-auto mb-1" />
              <span className="text-[10px] text-[#5C6F63] font-bold block">{isUrdu ? 'ڈیجیٹل اسکیل' : 'Scale Calibrated'}</span>
              <strong className="text-xs text-[#04231A]">{isUrdu ? '100% تصدیق شدہ' : '100% Certified'}</strong>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-[#178A52]/20 shadow-xs text-center">
              <Award className="w-5 h-5 text-[#E3A82B] mx-auto mb-1" />
              <span className="text-[10px] text-[#5C6F63] font-bold block">{isUrdu ? 'گرین صفائی بیج' : 'Zero-Waste Tier'}</span>
              <strong className="text-xs text-[#178A52]">{vendor.wastePoints} Pts (Tier 1)</strong>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-[#178A52]/20 shadow-xs text-center">
              <Clock className="w-5 h-5 text-[#3D7EA6] mx-auto mb-1" />
              <span className="text-[10px] text-[#5C6F63] font-bold block">{isUrdu ? 'فعال شفٹ' : 'Shift Active'}</span>
              <strong className="text-xs text-[#04231A]">{vendor.shiftTime || '08 AM - 04 PM'}</strong>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-[#178A52]/20 shadow-xs text-center">
              <ShieldCheck className="w-5 h-5 text-[#178A52] mx-auto mb-1" />
              <span className="text-[10px] text-[#5C6F63] font-bold block">{isUrdu ? 'بے دخلی تحفظ' : 'Eviction Shield'}</span>
              <strong className="text-xs text-[#178A52]">{isUrdu ? 'قانونی تحفظ یافتہ' : 'VRF Protected'}</strong>
            </div>
          </div>

          {/* GEOFENCED SLOT SPATIAL BLUEPRINT & LOCATION CARD */}
          <div className="bg-[#04231A] text-white p-5 rounded-3xl border-2 border-[#E3A82B] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#178A52]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#178A52] text-[#E3A82B] flex items-center justify-center shrink-0 shadow">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-[#E3A82B] font-mono font-bold block uppercase tracking-wider">
                    📍 Geofenced Municipal Footprint
                  </span>
                  <h4 className="font-sora font-extrabold text-base sm:text-lg text-white">
                    {isUrdu ? vendor.marketNameUrdu : vendor.marketName}
                  </h4>
                  <p className="text-xs text-[#DCEFE4]/80 font-mono">
                    Slot ID: {vendor.qrId || vendor.slotNumber} • 33.5973°N, 73.0565°E
                  </p>
                </div>
              </div>

              {/* 1-Click Interactive Satellite Map Navigation Trigger */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenCitySlotsMap) {
                    onOpenCitySlotsMap(vendor.qrId || 'RWP-RBZ-A-19');
                  } else if (onOpenLocate) {
                    onOpenLocate(vendor.marketName);
                  }
                }}
                className="w-full sm:w-auto bg-[#178A52] hover:bg-[#178A52]/80 text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 border border-[#E3A82B] transition-transform active:scale-95 group"
              >
                <ZoomIn className="w-4 h-4 text-[#E3A82B] group-hover:scale-125 transition-transform" />
                <span>{isUrdu ? 'سیٹلائٹ نقشے پر سلاٹ زوم کریں' : '1-Click Satellite Map Zoom'}</span>
              </button>
            </div>

            {/* Micro Blueprint Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-[#0B4A31] p-3 rounded-2xl border border-[#178A52]">
                <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'مخصوص رقبہ (Stall Size)' : 'Allotted Dimensions'}</span>
                <strong className="text-[#E3A82B] font-mono text-sm block mt-0.5">6ft × 4ft (24 sq. ft)</strong>
              </div>

              <div className="bg-[#0B4A31] p-3 rounded-2xl border border-[#178A52]">
                <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'پیدل راستہ بفر (Walkway)' : 'Pedestrian Clearance'}</span>
                <strong className="text-white font-mono text-sm block mt-0.5">5.2 ft Clear Corridor</strong>
              </div>

              <div className="bg-[#0B4A31] p-3 rounded-2xl border border-[#178A52]">
                <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'پینے کا پانی (Water Tap)' : 'Potable Water'}</span>
                <strong className="text-white text-sm block mt-0.5 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>14m Distance</span>
                </strong>
              </div>

              <div className="bg-[#0B4A31] p-3 rounded-2xl border border-[#178A52]">
                <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'سولر لائٹ و ڈسٹ بن' : 'Solar Light & Dustbin'}</span>
                <strong className="text-[#E3A82B] text-sm block mt-0.5 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>12V Active • Bin #019</span>
                </strong>
              </div>
            </div>
          </div>

          {/* RELEVANT LIVE DC RATE ADHERENCE TABLE FOR THIS VENDOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-sora font-extrabold text-base text-[#04231A] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#178A52]" />
                <span>{isUrdu ? 'اس اسٹال پر فروخت ہونے والی اشیاء اور لائیو ڈی سی نرخ' : 'Live Commodity DC Rates at this Stall'}</span>
              </h4>
              <span className="text-xs bg-[#178A52]/10 text-[#178A52] font-bold px-3 py-1 rounded-full border border-[#178A52]/30">
                🟢 0% Overcharge Guaranteed
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#178A52]/20 overflow-hidden shadow-sm">
              <div className="divide-y divide-[#F6F2E7]">
                {vendorItems.map((item) => (
                  <div key={item.id} className="p-3.5 sm:px-4 flex items-center justify-between text-xs hover:bg-[#FCFAF3] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#DCEFE4] text-[#04231A] flex items-center justify-center font-bold text-xs">
                        ⚖️
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#04231A] font-urdu block">
                          {isUrdu ? item.nameUrdu : item.nameEn}
                        </span>
                        <span className="text-[11px] text-[#5C6F63]">
                          {isUrdu ? item.unitUrdu : item.unitEn} • {isUrdu ? item.categoryUrdu : item.categoryEn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-[#5C6F63] block font-mono">{isUrdu ? 'سرکاری ڈی سی ریٹ' : 'Official DC Rate'}</span>
                        <strong className="text-sm text-[#178A52] font-mono">Rs. {item.dcRate}</strong>
                      </div>
                      <div className="bg-[#178A52] text-white px-3 py-1.5 rounded-xl font-bold text-xs font-mono shadow-xs">
                        Rs. {item.dcRate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Price Calculator Widget */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF3] border border-[#178A52]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#178A52]" />
                <span className="font-bold text-[#04231A] font-urdu">
                  {isUrdu ? 'وزن کے حساب سے فوری ڈی سی رقم حساب کریں:' : 'Instant DC Price Weight Calculator:'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[0.5, 1, 2, 5].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setSelectedCalcQty(qty)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedCalcQty === qty
                        ? 'bg-[#178A52] text-white shadow-xs'
                        : 'bg-white text-[#132A21] border border-[#178A52]/30'
                    }`}
                  >
                    {qty} kg {vendorItems[0] ? `(Rs. ${Math.round(vendorItems[0].dcRate * qty)})` : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Speech Briefing Banner */}
          <div className="bg-[#04231A] text-white p-4 rounded-2xl flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#178A52] text-[#E3A82B] flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#DCEFE4] font-urdu leading-relaxed">
                {isUrdu 
                  ? 'یہ دکاندار روزانہ ڈی سی ریٹس، تصدیق شدہ ڈیجیٹل اسکیل اور الاٹ شدہ جیو فینس پر 100% پورا اترتا ہے۔' 
                  : 'This merchant complies 100% with daily DC commodity prices, digital scales, and municipal geofenced space regulations.'}
              </p>
            </div>

            <button
              onClick={() => speechService.speak(speechText, { lang: isUrdu ? 'ur' : 'en' })}
              className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow transition-transform active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isUrdu ? 'آڈیو سنیں' : 'Listen'}</span>
            </button>
          </div>
        </div>

        {/* Footer Interactive Actions */}
        <div className="bg-[#F6F2E7] p-4 sm:p-5 border-t border-[#178A52]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleEndorse}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                endorsed
                  ? 'bg-[#178A52] text-white cursor-default'
                  : 'bg-[#178A52] hover:bg-[#178A52]/90 text-white'
              }`}
            >
              {endorsed ? <Check className="w-4 h-4 text-[#E3A82B]" /> : <ThumbsUp className="w-4 h-4" />}
              <span>{endorsed ? (isUrdu ? 'ستائش درج ہو گئی (+0.02)' : 'Endorsed (+0.02)') : (isUrdu ? 'دکاندار کی ستائش کریں' : 'Endorse Vendor')}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#178A52]/30 hover:bg-[#DCEFE4] text-[#04231A] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              title="Copy link to profile"
            >
              <Share2 className="w-4 h-4 text-[#178A52]" />
              <span>{copiedLink ? (isUrdu ? 'لنک کاپی ہو گیا!' : 'Copied!') : (isUrdu ? 'شیئر لنک' : 'Share')}</span>
            </button>
          </div>

          {onOpenReportForVendor && (
            <button
              onClick={() => {
                onClose();
                onOpenReportForVendor(vendor);
              }}
              className="w-full sm:w-auto bg-[#B03A2E] hover:bg-[#B03A2E]/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-[#F4D58D]" />
              <span>{isUrdu ? 'گراں فروشی کی شکایت درج کریں' : 'Report Overcharging'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
