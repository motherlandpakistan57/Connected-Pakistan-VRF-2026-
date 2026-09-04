import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, Download, Printer, Share2, Check, 
  ShieldCheck, Star, Sparkles, Scale, X, ExternalLink, 
  RefreshCw, MapPin, ZoomIn, Droplets, Zap, Eye, Compass,
  Sliders, CheckCircle2, ChevronRight, Layers, FileText
} from 'lucide-react';
import { Language, VendorProfile, DCRateItem } from '../types';
import { INITIAL_VENDORS, INITIAL_DC_RATES } from '../data/seedData';
import { PAKISTAN_CITY_SLOTS_DATA } from '../data/citySlotsData';
import { speechService } from '../lib/audio';

interface VendorQRBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorProfile;
  lang: Language;
  dcRates?: DCRateItem[];
  onPreviewPublicProfile?: (selectedVendor?: VendorProfile) => void;
  onOpenCitySlotsMap?: (slotId?: string) => void;
}

export const VendorQRBadgeModal: React.FC<VendorQRBadgeModalProps> = ({
  isOpen,
  onClose,
  vendor,
  lang,
  dcRates = INITIAL_DC_RATES,
  onPreviewPublicProfile,
  onOpenCitySlotsMap,
}) => {
  const isUrdu = lang === 'ur';
  const [activeVendor, setActiveVendor] = useState<VendorProfile>(vendor);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState<'forest' | 'gold' | 'light' | 'matrix'>('forest');
  const [showScoreBadge, setShowScoreBadge] = useState(true);
  const [showGeofenceDetails, setShowGeofenceDetails] = useState(true);
  const [showDCRatesPreview, setShowDCRatesPreview] = useState(true);
  const [customSlotCode, setCustomSlotCode] = useState<string>(vendor.qrId || 'VRF-RWP-SLOT-19');
  const badgeRef = useRef<HTMLDivElement>(null);

  // Sync with prop when opened
  useEffect(() => {
    if (isOpen) {
      setActiveVendor(vendor);
      setCustomSlotCode(vendor.qrId || `VRF-SLOT-${vendor.id}`);
    }
  }, [isOpen, vendor]);

  // Find slot data if available
  const slotGeofenceLat = activeVendor.latitude || 33.5973;
  const slotGeofenceLng = activeVendor.longitude || 73.0565;

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?vendorId=${activeVendor.id}&slot=${customSlotCode}&geofence=${slotGeofenceLat},${slotGeofenceLng}&verify=1`
    : `https://connectedpakistan.pk/vrf?vendorId=${activeVendor.id}&slot=${customSlotCode}`;

  // Filter relevant DC commodities for this vendor
  const relevantDCRates = dcRates.filter(item => {
    const shopLower = (activeVendor.shopName + ' ' + activeVendor.shopNameUrdu).toLowerCase();
    if (shopLower.includes('fruit') || shopLower.includes('veg') || shopLower.includes('سبزی')) {
      return item.categoryEn === 'Vegetables' || item.categoryUrdu.includes('سبزی');
    }
    if (shopLower.includes('dairy') || shopLower.includes('دودھ') || shopLower.includes('گوشت')) {
      return item.categoryEn === 'Dairy & Poultry' || item.categoryEn === 'Meat';
    }
    if (shopLower.includes('atta') || shopLower.includes('grain') || shopLower.includes('کریانہ')) {
      return item.categoryEn === 'Grains & Flour' || item.categoryEn === 'Groceries';
    }
    if (shopLower.includes('spice') || shopLower.includes('pulse') || shopLower.includes('دال')) {
      return item.categoryEn === 'Pulses & Lentils' || item.categoryEn === 'Groceries';
    }
    return true;
  }).slice(0, 4);

  // Generate high-resolution QR Code data URL
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const generateQR = async () => {
      try {
        const darkColor = badgeTheme === 'gold' ? '#04231A' : badgeTheme === 'matrix' ? '#0B4A31' : '#04231A';
        const url = await QRCode.toDataURL(verificationUrl, {
          width: 380,
          margin: 2,
          color: {
            dark: darkColor,
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
        if (isMounted) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };

    generateQR();
    return () => {
      isMounted = false;
    };
  }, [isOpen, verificationUrl, badgeTheme, activeVendor.id, customSlotCode]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrintBadge = () => {
    const printContent = badgeRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const ratesHtml = relevantDCRates.map(r => `
      <tr>
        <td style="padding: 6px 12px; border-bottom: 1px solid #ddd; text-align: left;">${r.nameEn} (${r.nameUrdu})</td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #178A52;">Rs. ${r.dcRate} / ${r.unitEn}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>VRF Official Stall License - ${activeVendor.shopName}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 24px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f4f4f4;
            }
            .badge-container {
              width: 580px;
              background: #04231A;
              color: #ffffff;
              border: 8px solid #E3A82B;
              border-radius: 28px;
              padding: 32px;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.35);
            }
            .header-tag {
              background: #178A52;
              color: #ffffff;
              padding: 6px 20px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: bold;
              display: inline-block;
              margin-bottom: 12px;
            }
            .shop-title {
              font-size: 26px;
              font-weight: 800;
              margin: 6px 0;
              color: #ffffff;
            }
            .vendor-name {
              font-size: 16px;
              color: #E3A82B;
              margin-bottom: 16px;
            }
            .qr-box {
              background: #ffffff;
              padding: 16px;
              border-radius: 20px;
              display: inline-block;
              margin: 12px 0;
              border: 4px solid #178A52;
            }
            .qr-img {
              width: 240px;
              height: 240px;
            }
            .score-pill {
              background: #E3A82B;
              color: #04231A;
              font-size: 15px;
              font-weight: 800;
              padding: 8px 20px;
              border-radius: 12px;
              display: inline-block;
              margin: 10px 0;
            }
            .geofence-box {
              background: #0B4A31;
              border: 1px solid #178A52;
              border-radius: 14px;
              padding: 12px;
              margin: 14px 0;
              font-size: 12px;
              color: #DCEFE4;
              text-align: left;
            }
            .rates-table {
              width: 100%;
              border-collapse: collapse;
              background: #ffffff;
              color: #132A21;
              border-radius: 12px;
              overflow: hidden;
              margin: 12px 0;
              font-size: 12px;
            }
            .footer-line {
              margin-top: 18px;
              font-size: 11px;
              color: #E3A82B;
              border-top: 1px solid #178A52;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="badge-container">
            <div class="header-tag">🟢 GOVT OF PUNJAB — VERIFIED GEOFENCED STALL</div>
            <div class="shop-title">${activeVendor.shopNameUrdu} (${activeVendor.shopName})</div>
            <div class="vendor-name">${activeVendor.nameUrdu} • Slot: ${activeVendor.slotNumber}</div>
            
            <div class="qr-box">
              <img src="${qrDataUrl}" class="qr-img" alt="QR Code" />
            </div>

            <div>
              <div class="score-pill">⭐ DC COMPLIANCE RATING: ${activeVendor.score} / 10.0</div>
            </div>

            <div class="geofence-box">
              <strong>📍 Geofenced Slot:</strong> ${activeVendor.marketName} (${customSlotCode})<br />
              <strong>📐 Stall Area:</strong> 6ft × 4ft (24 sq. ft) • <strong>Walkway:</strong> 5.2 ft Clear Buffer<br />
              <strong>⚖️ Status:</strong> Calibrated Digital Scale Certified • 🛡️ Zero-Unslotted Eviction Shield Active
            </div>

            <table class="rates-table">
              <thead>
                <tr style="background: #178A52; color: #fff;">
                  <th style="padding: 8px 12px; text-align: left;">Live DC Commodity</th>
                  <th style="padding: 8px 12px; text-align: right;">Official Rate</th>
                </tr>
              </thead>
              <tbody>
                ${ratesHtml}
              </tbody>
            </table>

            <div class="footer-line">
              Vendor Relief Framework (VRF Act 2026) • Government of Punjab
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `VRF-QR-License-${customSlotCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FCFAF3] text-[#132A21] rounded-3xl border-2 border-[#E3A82B] max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-fadeUp">
        
        {/* Modal Header */}
        <div className="bg-[#04231A] text-white p-5 sm:p-6 border-b-2 border-[#178A52] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#178A52] flex items-center justify-center text-[#E3A82B] shadow-md border border-[#E3A82B]">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sora font-extrabold text-lg sm:text-2xl text-white">
                  {isUrdu ? 'وینڈر جیو فینس کیو آر کوڈ جنریٹر' : 'Vendor Geofenced QR & DC Rates Studio'}
                </h3>
                <span className="text-[10px] bg-[#E3A82B] text-[#04231A] px-2.5 py-0.5 rounded-full font-bold font-mono">
                  VRF Act 2026
                </span>
              </div>
              <p className="text-xs text-[#DCEFE4] font-urdu mt-0.5">
                {isUrdu 
                  ? 'ہر دکاندار کا مخصوص کیو آر کوڈ ان کی قانونی الاٹ شدہ جگہ اور روزانہ ڈی سی ریٹس کے ساتھ منسلک ہے۔' 
                  : 'Dynamic QR generator linking the merchant directly to their geofenced stall and verified DC commodity rates.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Top Quick Profile & Slot Switcher */}
          <div className="p-4 rounded-2xl bg-white border border-[#178A52]/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCEFE4] text-[#04231A] flex items-center justify-center font-bold">
                🏪
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#5C6F63] block font-mono">
                  {isUrdu ? 'منتخب شدہ وینڈر پروفائل:' : 'Selected Vendor Profile:'}
                </label>
                <select
                  value={activeVendor.id}
                  onChange={(e) => {
                    const found = INITIAL_VENDORS.find(v => v.id === e.target.value);
                    if (found) {
                      setActiveVendor(found);
                      setCustomSlotCode(found.qrId || `VRF-SLOT-${found.id}`);
                    }
                  }}
                  className="bg-white font-extrabold text-sm text-[#04231A] font-urdu focus:outline-none border-b border-[#178A52] py-0.5 cursor-pointer"
                >
                  {INITIAL_VENDORS.map(v => (
                    <option key={v.id} value={v.id}>
                      {isUrdu ? v.shopNameUrdu : v.shopName} ({v.slotNumber} • {v.marketName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (onPreviewPublicProfile) {
                    onPreviewPublicProfile(activeVendor);
                  }
                }}
                className="flex-1 sm:flex-none bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-4 py-2 rounded-xl text-xs font-extrabold shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>{isUrdu ? 'لائیو کیو آر پاپ اپ ٹیسٹ کریں' : 'Test Live QR Pop-up'}</span>
              </button>

              {onOpenCitySlotsMap && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCitySlotsMap(customSlotCode);
                  }}
                  className="bg-[#0B4A31] hover:bg-[#178A52] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'نقشہ پر دیکھیں' : '1-Click Map'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Grid: Live Badge Preview on Left + Customization Controls on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: The High-Resolution Visual Stall QR Badge */}
            <div className="lg:col-span-7">
              <div 
                ref={badgeRef}
                className={`rounded-3xl p-6 border-4 shadow-2xl text-center relative overflow-hidden transition-all ${
                  badgeTheme === 'forest' 
                    ? 'bg-gradient-to-b from-[#04231A] via-[#083625] to-[#04231A] text-white border-[#E3A82B]'
                    : badgeTheme === 'gold'
                    ? 'bg-gradient-to-b from-[#8C6B1F] via-[#E3A82B] to-[#8C6B1F] text-[#04231A] border-[#04231A]'
                    : badgeTheme === 'matrix'
                    ? 'bg-gradient-to-b from-[#0B4A31] via-[#132A21] to-[#04231A] text-white border-[#178A52]'
                    : 'bg-white text-[#132A21] border-[#178A52]'
                }`}
              >
                {/* Verified Header Pill */}
                <div className="inline-flex items-center gap-1.5 bg-[#178A52] text-white px-3.5 py-1 rounded-full text-xs font-bold shadow mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? '🟢 حکومت پنجاب — تصدیق شدہ گرین دکاندار' : '🟢 GOVT OF PUNJAB — VERIFIED GEOFENCE'}</span>
                </div>

                {/* Shop & Vendor Name */}
                <h2 className="font-sora font-extrabold text-xl sm:text-2xl tracking-tight">
                  {isUrdu ? activeVendor.shopNameUrdu : activeVendor.shopName}
                </h2>
                <p className="text-xs sm:text-sm opacity-90 font-urdu mt-0.5">
                  {isUrdu ? `شراکت دار: ${activeVendor.nameUrdu}` : `Operator: ${activeVendor.name}`} • <strong>{activeVendor.slotNumber}</strong>
                </p>

                {/* High-Resolution Dynamic QR Code Display Box */}
                <div className="my-4 inline-block bg-white p-4 rounded-2xl border-4 border-[#178A52] shadow-xl relative">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="Verified Vendor Dynamic QR Code" 
                      className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-[#F6F2E7]">
                      <RefreshCw className="w-8 h-8 text-[#178A52] animate-spin" />
                    </div>
                  )}

                  <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-[#04231A]">
                    <QrCode className="w-3.5 h-3.5 text-[#178A52]" />
                    <span>{customSlotCode}</span>
                  </div>
                </div>

                {/* DC Rating Banner */}
                {showScoreBadge && (
                  <div className="max-w-md mx-auto bg-[#04231A]/90 border-2 border-[#E3A82B] rounded-2xl p-3 text-white shadow-md flex items-center justify-between gap-3 my-2">
                    <div className="flex items-center gap-2 text-left">
                      <Star className="w-6 h-6 text-[#E3A82B] fill-[#E3A82B] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#DCEFE4]/80 font-bold block">
                          {isUrdu ? 'ڈی سی ریٹ تعمیل اسکور' : 'DC Compliance Score'}
                        </span>
                        <strong className="text-sm sm:text-base font-sora font-extrabold text-[#E3A82B]">
                          {activeVendor.score} / 10.0 (Top 5%)
                        </strong>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] bg-[#178A52] text-white px-2 py-0.5 rounded-full font-bold block">
                        Zero Overcharge
                      </span>
                      <span className="text-[9px] text-[#DCEFE4]/70 font-mono mt-0.5 block">
                        Daily DC Synced
                      </span>
                    </div>
                  </div>
                )}

                {/* Geofence Blueprint Details */}
                {showGeofenceDetails && (
                  <div className="bg-[#0B4A31]/90 border border-[#178A52] rounded-2xl p-3 text-left text-xs text-[#DCEFE4] space-y-1.5 my-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1 text-[#E3A82B]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'جیو فینس لوکیشن:' : 'Geofenced Footprint:'}</span>
                      </span>
                      <span className="font-mono text-[11px] text-white">33.5973°N, 73.0565°E</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>📐 <strong>6ft × 4ft</strong> (24 sq. ft Area)</div>
                      <div>🚶 <strong>5.2 ft</strong> Walkway Buffer</div>
                      <div>💧 <strong>14m</strong> Water Station</div>
                      <div>⚡ <strong>12V</strong> Solar Active</div>
                    </div>
                  </div>
                )}

                {/* Live DC Rates mini snippet */}
                {showDCRatesPreview && relevantDCRates.length > 0 && (
                  <div className="bg-white text-[#132A21] rounded-2xl p-2.5 text-xs text-left shadow-md border border-[#178A52]/30 mt-2">
                    <div className="flex items-center justify-between font-bold text-[10px] text-[#5C6F63] border-b pb-1 mb-1">
                      <span>{isUrdu ? 'لازمی سرکاری نرخ (DC Rates)' : 'Live Official DC Rates'}</span>
                      <span className="text-[#178A52]">0% Overcharge</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {relevantDCRates.slice(0, 4).map(item => (
                        <div key={item.id} className="p-1 rounded bg-[#FCFAF3] flex items-center justify-between text-[11px]">
                          <span className="font-urdu truncate max-w-[90px]">{isUrdu ? item.nameUrdu : item.nameEn}</span>
                          <strong className="text-[#178A52] font-mono">Rs.{item.dcRate}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verification Metadata Footer */}
                <div className="mt-3 pt-2 border-t border-current/20 text-[10px] opacity-80 font-urdu flex flex-wrap items-center justify-center gap-3">
                  <span>⚖️ ڈیجیٹل اسکیل تصدیق شدہ</span>
                  <span>•</span>
                  <span>🛡️ بے دخلی تحفظ فعال</span>
                  <span>•</span>
                  <span>VRF Act 2026</span>
                </div>
              </div>
            </div>

            {/* RIGHT: QR Code Customizer & Actions Panel */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Style & Theme Selector */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#178A52]/20 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#178A52]" />
                  <h4 className="font-bold text-sm text-[#04231A]">
                    {isUrdu ? 'بیج ڈیزائن اور تھیم اسٹائل' : 'QR Style & Theme Preset'}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBadgeTheme('forest')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 ${
                      badgeTheme === 'forest' ? 'bg-[#04231A] text-white border-2 border-[#E3A82B]' : 'bg-[#FCFAF3] text-[#132A21] border border-slate-200'
                    }`}
                  >
                    <span className="text-base">🌲</span>
                    <div>
                      <span className="block font-bold">Forest Green</span>
                      <span className="text-[9px] opacity-75">Govt Official</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setBadgeTheme('gold')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 ${
                      badgeTheme === 'gold' ? 'bg-[#E3A82B] text-[#04231A] border-2 border-[#04231A]' : 'bg-[#FCFAF3] text-[#132A21] border border-slate-200'
                    }`}
                  >
                    <span className="text-base">👑</span>
                    <div>
                      <span className="block font-bold">Sovereign Gold</span>
                      <span className="text-[9px] opacity-75">Executive</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setBadgeTheme('matrix')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 ${
                      badgeTheme === 'matrix' ? 'bg-[#0B4A31] text-white border-2 border-[#178A52]' : 'bg-[#FCFAF3] text-[#132A21] border border-slate-200'
                    }`}
                  >
                    <span className="text-base">⚡</span>
                    <div>
                      <span className="block font-bold">Cyber Matrix</span>
                      <span className="text-[9px] opacity-75">Digital Kiosk</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setBadgeTheme('light')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 ${
                      badgeTheme === 'light' ? 'bg-white border-2 border-[#178A52] text-[#04231A]' : 'bg-[#FCFAF3] text-[#132A21] border border-slate-200'
                    }`}
                  >
                    <span className="text-base">📄</span>
                    <div>
                      <span className="block font-bold">White Poster</span>
                      <span className="text-[9px] opacity-75">Print Friendly</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic Information Toggles */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#178A52]/20 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-[#04231A] uppercase tracking-wider font-mono">
                  {isUrdu ? 'بیج پر ظاہر ہونے والے عناصر' : 'Dynamic Elements on Badge'}
                </h4>

                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs font-bold text-[#04231A] p-2 rounded-xl bg-[#FCFAF3] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-[#E3A82B]" />
                      <span>{isUrdu ? 'ڈی سی تعمیل اسکور بیج' : 'DC Compliance Score Banner'}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showScoreBadge}
                      onChange={(e) => setShowScoreBadge(e.target.checked)}
                      className="w-4 h-4 text-[#178A52] rounded accent-[#178A52]"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold text-[#04231A] p-2 rounded-xl bg-[#FCFAF3] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#178A52]" />
                      <span>{isUrdu ? 'جیو فینس رقبہ و سہولیات' : 'Geofence Blueprint (6x4ft)'}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showGeofenceDetails}
                      onChange={(e) => setShowGeofenceDetails(e.target.checked)}
                      className="w-4 h-4 text-[#178A52] rounded accent-[#178A52]"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold text-[#04231A] p-2 rounded-xl bg-[#FCFAF3] cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-[#178A52]" />
                      <span>{isUrdu ? 'روزانہ ڈی سی ریٹس فہرست' : 'Live DC Commodity Rates List'}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showDCRatesPreview}
                      onChange={(e) => setShowDCRatesPreview(e.target.checked)}
                      className="w-4 h-4 text-[#178A52] rounded accent-[#178A52]"
                    />
                  </label>
                </div>
              </div>

              {/* Instant Output Controls */}
              <div className="bg-[#04231A] text-white p-4 sm:p-5 rounded-2xl border-2 border-[#E3A82B] shadow-lg space-y-3">
                <span className="text-[10px] text-[#E3A82B] font-mono font-bold block uppercase">
                  🚀 Output & Physical Deployment
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handlePrintBadge}
                    className="w-full bg-[#178A52] hover:bg-[#178A52]/90 text-white p-3 rounded-xl text-xs font-extrabold shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Printer className="w-4 h-4 text-[#E3A82B]" />
                    <span>{isUrdu ? 'پوسٹر پرنٹ کریں' : 'Print Stall Poster'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPNG}
                    className="w-full bg-white hover:bg-[#DCEFE4] text-[#04231A] p-3 rounded-xl text-xs font-extrabold shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Download className="w-4 h-4 text-[#178A52]" />
                    <span>{isUrdu ? 'کیو آر ڈاؤن لوڈ' : 'Download PNG'}</span>
                  </button>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full bg-[#0B4A31] hover:bg-[#0B4A31]/90 text-white p-2.5 rounded-xl text-xs font-bold border border-[#178A52] flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>{copiedLink ? (isUrdu ? 'لنک کاپی ہو گیا!' : 'Verification URL Copied!') : (isUrdu ? 'ڈائریکٹ کیو آر لنک کاپی کریں' : 'Copy Dynamic QR Deep Link')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F6F2E7] p-4 sm:p-5 border-t border-[#178A52]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#178A52] animate-pulse" />
            <span className="font-urdu text-[#04231A] font-bold">
              {isUrdu ? 'جیو فینس شدہ کیو آر کوڈ 100% قانونی تحفظ یافتہ ہے۔' : 'Dynamic Geofenced QR is legally bound under VRF Act 2026.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onPreviewPublicProfile) {
                  onPreviewPublicProfile(activeVendor);
                }
              }}
              className="bg-[#04231A] hover:bg-[#0B4A31] text-[#E3A82B] px-4 py-2 rounded-xl font-extrabold shadow flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>{isUrdu ? 'خریدار کا لائیو پاپ اپ منظر دیکھیں' : 'Preview Citizen QR Pop-up'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
            >
              {isUrdu ? 'بند کریں' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
