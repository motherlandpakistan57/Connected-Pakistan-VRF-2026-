import React, { useState, useEffect } from 'react';
import { 
  QrCode, Camera, Search, Sparkles, CheckCircle2, 
  X, Crosshair, Store, ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { Language, VendorProfile } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  vendors: VendorProfile[];
  onSelectVendor: (vendor: VendorProfile) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  lang,
  vendors = [],
  onSelectVendor,
}) => {
  const isUrdu = lang === 'ur';
  const [scanning, setScanning] = useState(true);
  const [selectedStallId, setSelectedStallId] = useState<string>(vendors[0]?.id || '');
  const [manualCode, setManualCode] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  // Optical camera scan radar effect
  useEffect(() => {
    if (!isOpen) return;

    setScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSimulateScan = (vendor: VendorProfile) => {
    onSelectVendor(vendor);
    onClose();
  };

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualCode.trim().toLowerCase();
    const found = vendors.find(v => 
      v.id.toLowerCase() === query ||
      (v.qrId && v.qrId.toLowerCase().includes(query)) ||
      v.slotNumber.toLowerCase().includes(query) ||
      v.name.toLowerCase().includes(query) ||
      v.shopName.toLowerCase().includes(query)
    );

    if (found) {
      handleSimulateScan(found);
    } else {
      alert(isUrdu ? 'کوئی دکاندار نہیں ملا۔ برائے مہربانی درست کیو آر آئی ڈی درج کریں۔' : 'No vendor found. Please check the QR code or slot ID.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#04231A] text-white rounded-3xl border-2 border-[#178A52] max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeUp">
        
        {/* Header */}
        <div className="p-5 border-b border-[#178A52]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#178A52] flex items-center justify-center text-[#E3A82B] shadow">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sora font-extrabold text-lg text-white flex items-center gap-2">
                <span>{isUrdu ? 'دکاندار کیو آر اسکینر' : 'Live Vendor QR Scanner'}</span>
                <span className="text-[10px] bg-[#178A52] text-white px-2 py-0.5 rounded-full font-bold">
                  PERA Optical
                </span>
              </h3>
              <p className="text-xs text-[#DCEFE4] font-urdu">
                اسٹال کے کیو آر کوڈ کو کیمرے کے سامنے لائیں یا براہ راست دکاندار منتخب کریں۔
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewfinder Box */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-center">
          
          <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 bg-black/60 rounded-3xl border-2 border-[#178A52] overflow-hidden flex flex-col items-center justify-center shadow-2xl">
            {/* Viewfinder Corner Reticles */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#E3A82B] rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#E3A82B] rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#E3A82B] rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#E3A82B] rounded-br-lg" />

            {/* Laser scanning bar */}
            <div 
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E3A82B] to-transparent shadow-[0_0_15px_#E3A82B] transition-all duration-300 pointer-events-none"
              style={{ top: `${scanProgress}%` }}
            />

            <div className="space-y-2 relative z-10 px-4">
              <QrCode className="w-20 h-20 text-[#178A52] mx-auto opacity-75" />
              <p className="text-xs text-[#DCEFE4] font-urdu">
                {isUrdu ? 'کیو آر کوڈ کو فریم کے درمیان میں رکھیں' : 'Align vendor QR badge within frame'}
              </p>
              <span className="text-[10px] bg-[#178A52] text-white px-3 py-1 rounded-full font-mono font-bold inline-block">
                ⚡ Optical Auto-Detect Active
              </span>
            </div>
          </div>

          {/* Quick Simulated Stall Selector */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-[#E3A82B] block">
              {isUrdu ? '1-ٹیپ اسکین کریں (موجودہ بازار کے دکاندار):' : '1-Tap Direct Scan (Registered Stalls):'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {vendors.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSimulateScan(v)}
                  className="p-3 rounded-2xl bg-[#0B4A31] hover:bg-[#178A52] border border-[#178A52]/60 hover:border-[#E3A82B] transition-all text-left flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#04231A] text-[#E3A82B] flex items-center justify-center font-bold text-xs shrink-0">
                      ⭐
                    </div>
                    <div>
                      <strong className="text-xs text-white block font-urdu">
                        {isUrdu ? v.shopNameUrdu : v.shopName}
                      </strong>
                      <span className="text-[10px] text-[#DCEFE4]/80">
                        {v.slotNumber} • DC Score: {v.score}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#E3A82B] opacity-75 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Manual Code / Slot Lookup */}
          <form onSubmit={handleManualLookup} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder={isUrdu ? 'کیو آر کوڈ یا سلاٹ نمبر درج کریں (مثلاً Slot 19)...' : 'Enter QR ID or Slot Number (e.g. Slot 19)...'}
              className="flex-1 bg-[#0B4A31] border border-[#178A52] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#DCEFE4]/50 focus:outline-none focus:border-[#E3A82B]"
            />
            <button
              type="submit"
              className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-4 py-2 rounded-xl text-xs font-bold shadow"
            >
              {isUrdu ? 'تلاش کریں' : 'Lookup'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0B4A31] border-t border-[#178A52]/40 text-center text-xs text-[#DCEFE4] font-urdu">
          حکومت پنجاب — ریگولیٹری انفورسمنٹ و شفافیت انیشیٹو
        </div>
      </div>
    </div>
  );
};
