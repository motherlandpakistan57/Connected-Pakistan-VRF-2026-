import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, ShieldCheck, X, Sparkles, Lock } from 'lucide-react';
import { Role, Language } from '../types';
import { Emblem } from './Emblem';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: Role, name: string) => void;
  lang: Language;
  selectedRole?: Role;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang,
  selectedRole = 'citizen',
}) => {
  const isUrdu = lang === 'ur';
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const roleNames: Record<Role, { urdu: string; en: string; name: string }> = {
    citizen: { urdu: 'شہری (Tariq Mehmood)', en: 'Citizen (Tariq Mehmood)', name: 'Tariq Mehmood (Citizen)' },
    vendor: { urdu: 'ریڑھی بان (Muhammad Tariq)', en: 'Vendor (Muhammad Tariq)', name: 'Muhammad Tariq Khan (Stall RB-14)' },
    inspector: { urdu: 'پیرہ مجسٹریٹ (Hamza Malik)', en: 'Inspector (Hamza Malik)', name: 'Inspector Hamza Malik (PERA)' },
    government: { urdu: 'ڈی سی کمانڈ (Ayesha Rehman)', en: 'DC Command (Ayesha Rehman)', name: 'Ayesha Rehman (DC Office)' },
    fakhar: { urdu: 'فخر مشتاق (Master)', en: 'Fakhar Mushtaq (Master)', name: 'Fakhar Mushtaq (Master Access)' },
    fakhar_master: { urdu: 'فخر مشتاق (Master)', en: 'Fakhar Mushtaq (Master)', name: 'Fakhar Mushtaq (Master Access)' },
  };

  const currentRoleInfo = roleNames[selectedRole] || roleNames.citizen;

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setIsVerified(true);

          setTimeout(() => {
            onSuccess(selectedRole, currentRoleInfo.name);
            onClose();
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 180);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#04231A] border-2 border-[#E3A82B] rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl animate-fadeUp text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#0B4A31] hover:bg-[#B03A2E] text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex justify-center mb-3">
          <Emblem size="md" />
        </div>

        <h3 className="font-sora font-extrabold text-xl text-white">
          {isUrdu ? 'بایومیٹرک فوری تصدیق' : 'Biometric Quick Verification'}
        </h3>
        <p className="text-xs text-[#DCEFE4]/80 font-urdu mt-1 mb-6">
          {isUrdu 
            ? `برائے: ${currentRoleInfo.urdu} • نادرا سیکیورٹی تصدیق`
            : `Signing in as: ${currentRoleInfo.en} • 100% Mock Nadra Auth`}
        </p>

        {/* Interactive Fingerprint Scanner */}
        <div className="relative my-6 flex flex-col items-center justify-center">
          <div 
            onClick={!isScanning && !isVerified ? handleStartScan : undefined}
            className={`w-32 h-32 rounded-3xl border-2 flex items-center justify-center relative cursor-pointer transition-all ${
              isVerified
                ? 'bg-[#178A52]/40 border-[#178A52] shadow-[0_0_30px_#178A52]'
                : isScanning
                ? 'bg-[#E3A82B]/20 border-[#E3A82B] shadow-[0_0_30px_#E3A82B]'
                : 'bg-[#0B4A31]/50 border-[#178A52]/50 hover:border-[#E3A82B] hover:scale-105'
            }`}
          >
            {/* Laser scanning beam */}
            {isScanning && (
              <div 
                className="absolute left-0 right-0 h-1 bg-[#E3A82B] shadow-[0_0_12px_#E3A82B] animate-pulse"
                style={{ top: `${scanProgress}%` }}
              />
            )}

            {isVerified ? (
              <CheckCircle2 className="w-16 h-16 text-[#178A52] animate-bounce" />
            ) : (
              <Fingerprint className={`w-16 h-16 transition-colors ${isScanning ? 'text-[#E3A82B]' : 'text-[#DCEFE4]'}`} />
            )}
          </div>

          {/* Progress bar / Instruction */}
          <div className="mt-4 w-full">
            {isScanning ? (
              <div className="space-y-1.5">
                <div className="w-full bg-[#0B4A31] h-2 rounded-full overflow-hidden border border-[#178A52]/40">
                  <div 
                    className="bg-[#E3A82B] h-full transition-all duration-150"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-[#E3A82B]">
                  {scanProgress}% — {isUrdu ? 'فنگر پرنٹ کی توثیق جاری ہے...' : 'Verifying biometric telemetry...'}
                </span>
              </div>
            ) : isVerified ? (
              <span className="text-xs font-bold text-[#178A52] flex items-center justify-center gap-1.5 font-urdu">
                <ShieldCheck className="w-4 h-4" />
                {isUrdu ? 'بایومیٹرک کامیاب! لاگ ان ہو رہا ہے...' : 'Biometric Match Confirmed!'}
              </span>
            ) : (
              <button
                onClick={handleStartScan}
                className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] font-bold text-xs px-6 py-2.5 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{isUrdu ? 'فنگر پرنٹ لگائیں (ایک کلک)' : 'Tap to Scan Fingerprint'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Security badge */}
        <div className="pt-3 border-t border-[#0B4A31] flex items-center justify-center gap-2 text-[11px] text-[#DCEFE4]/70">
          <Lock className="w-3.5 h-3.5 text-[#E3A82B]" />
          <span>{isUrdu ? '256-بٹ محفوظ انکرپشن • سیکیورٹی لیول 5/5' : '256-Bit Encrypted Verification • 5/5 Security'}</span>
        </div>
      </div>
    </div>
  );
};
