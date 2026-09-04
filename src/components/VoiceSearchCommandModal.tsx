import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, Sparkles, X, ArrowRight, CheckCircle2, 
  MapPin, ShoppingBag, AlertTriangle, Shield, Layers, HelpCircle
} from 'lucide-react';
import { Language } from '../types';
import { speechService } from '../lib/audio';

interface VoiceSearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onExecuteCommand: (commandType: string, payload?: any) => void;
}

export const VoiceSearchCommandModal: React.FC<VoiceSearchCommandModalProps> = ({
  isOpen,
  onClose,
  lang,
  onExecuteCommand,
}) => {
  const isUrdu = lang === 'ur';
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [matchedAction, setMatchedAction] = useState<{
    id: string;
    titleEn: string;
    titleUrdu: string;
    description: string;
    action: () => void;
  } | null>(null);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Suggested voice commands
  const suggestedCommands = [
    {
      textUrdu: 'سرکاری ریٹس دکھائیں',
      textEn: 'Show me vendor rates',
      description: isUrdu ? 'سرکاری ڈی سی نرخ لسٹ کھولیں' : 'Open live DC official price sheet',
      actionKey: 'rates'
    },
    {
      textUrdu: 'قریبی سلاٹس تلاش کریں',
      textEn: 'Find nearest slots',
      description: isUrdu ? 'سٹی سلاٹس گوگل میپ ریڈار کھولیں' : 'Open 1-Click GIS Stall Map Radar',
      actionKey: 'city_slots'
    },
    {
      textUrdu: 'شکایت درج کریں',
      textEn: 'Report overcharging',
      description: isUrdu ? 'گراں فروشی کی گمنام رپورٹ درج کریں' : 'Open Price Violation Report Form',
      actionKey: 'report'
    },
    {
      textUrdu: 'گرین دکاندار دکھائیں',
      textEn: 'Show green vendors',
      description: isUrdu ? 'تصدیق شدہ دکانداروں کی فہرست' : 'Open Verified 5-Star Vendor Directory',
      actionKey: 'vendors'
    },
    {
      textUrdu: 'اے آئی اسکینر کھولیں',
      textEn: 'Open AI Price Scanner',
      description: isUrdu ? 'انسپکٹر ±3% ٹولرنس اسکینر' : 'Launch Inspector Camera Scanner',
      actionKey: 'scanner'
    },
    {
      textUrdu: 'ٹیم تعارف دیکھیں',
      textEn: 'Meet the team',
      description: isUrdu ? 'فخر مشتاق اور چار خواتین لیڈز کا تعارف' : 'Open Leadership & Team Overview',
      actionKey: 'team'
    }
  ];

  const handleCommandMatch = (spokenText: string) => {
    const lower = spokenText.toLowerCase();
    
    // Rates command
    if (
      lower.includes('rate') || lower.includes('rates') || lower.includes('price') || 
      lower.includes('نرخ') || lower.includes('ریٹ') || lower.includes('قیمت') || lower.includes('ڈی سی')
    ) {
      const match = {
        id: 'rates',
        titleEn: 'Official DC Rates Sheet',
        titleUrdu: 'سرکاری ڈی سی نرخ نامہ',
        description: isUrdu ? 'سرکاری ریٹس لسٹ پر روانہ ہو رہے ہیں...' : 'Navigating to Official DC Rates...',
        action: () => onExecuteCommand('nav_rates')
      };
      setMatchedAction(match);
      speechService.playChime('success');
      setTimeout(() => {
        match.action();
        onClose();
      }, 1200);
      return;
    }

    // Nearest slots / Map command
    if (
      lower.includes('slot') || lower.includes('slots') || lower.includes('map') || lower.includes('nearest') ||
      lower.includes('سلاٹ') || lower.includes('نقشہ') || lower.includes('قریبی') || lower.includes('جگہ')
    ) {
      const match = {
        id: 'city_slots',
        titleEn: '1-Click City GIS Slots Map',
        titleUrdu: 'سٹی سلاٹس گوگل میپ ریڈار',
        description: isUrdu ? 'سٹی سلاٹس کا نقشہ کھل رہا ہے...' : 'Launching 1-Click GIS Slots Radar...',
        action: () => onExecuteCommand('city_slots_map')
      };
      setMatchedAction(match);
      speechService.playChime('success');
      setTimeout(() => {
        match.action();
        onClose();
      }, 1200);
      return;
    }

    // Report command
    if (
      lower.includes('report') || lower.includes('complaint') || lower.includes('violation') ||
      lower.includes('شکایت') || lower.includes('رپورٹ') || lower.includes('گراں فروشی')
    ) {
      const match = {
        id: 'report',
        titleEn: 'Submit Price Violation Report',
        titleUrdu: 'شکایت درج کرنے کا فارم',
        description: isUrdu ? 'شکایت فارم کھول رہے ہیں...' : 'Opening Anonymous Report Form...',
        action: () => onExecuteCommand('nav_report')
      };
      setMatchedAction(match);
      speechService.playChime('success');
      setTimeout(() => {
        match.action();
        onClose();
      }, 1200);
      return;
    }

    // Green Vendors command
    if (
      lower.includes('vendor') || lower.includes('vendors') || lower.includes('green') ||
      lower.includes('دکاندار') || lower.includes('ریڑھی') || lower.includes('گرین')
    ) {
      const match = {
        id: 'vendors',
        titleEn: 'Green Verified Vendor Directory',
        titleUrdu: 'گرین تصدیق شدہ دکاندار ڈائرکٹری',
        description: isUrdu ? 'گرین دکانداروں کی لسٹ کھول رہے ہیں...' : 'Opening Green Vendor Directory...',
        action: () => onExecuteCommand('nav_vendors')
      };
      setMatchedAction(match);
      speechService.playChime('success');
      setTimeout(() => {
        match.action();
        onClose();
      }, 1200);
      return;
    }

    // Scanner
    if (
      lower.includes('scanner') || lower.includes('camera') || lower.includes('scan') ||
      lower.includes('اسکین') || lower.includes('کیمرہ')
    ) {
      const match = {
        id: 'scanner',
        titleEn: 'AI Price Scanner Console',
        titleUrdu: 'اے آئی پرائس اسکینر',
        description: isUrdu ? 'اے آئی اسکینر کھولا جا رہا ہے...' : 'Launching AI Price Scanner...',
        action: () => onExecuteCommand('nav_scanner')
      };
      setMatchedAction(match);
      speechService.playChime('success');
      setTimeout(() => {
        match.action();
        onClose();
      }, 1200);
      return;
    }

    // Team Leadership
    if (
      lower.includes('team') || lower.includes('fakhar') || lower.includes('leader') || lower.includes('intro') ||
      lower.includes('ٹیم') || lower.includes('فخر') || lower.includes('تعارف')
    ) {
      const match = {
        id: 'team',
        titleEn: 'Team & Leadership Overview',
        titleUrdu: 'ٹیم اور قائدین کا تعارف',
        description: isUrdu ? 'ٹیم تعارف اسکرین کھول رہے ہیں...' : 'Opening Leadership Screen...',
        action: () => onExecuteCommand('cinematic_intro')
      };
      setMatchedAction(match);
      speechService.playChime('success');
      setTimeout(() => {
        match.action();
        onClose();
      }, 1200);
      return;
    }
  };

  const startListening = () => {
    setMatchedAction(null);
    setTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechRecognition(false);
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isUrdu ? 'ur-PK' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        speechService.playChime('beep');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (event.results[current].isFinal) {
          handleCommandMatch(text);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn(e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsListening(false);
  };

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopListening();
      setTranscript('');
      setMatchedAction(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04231A]/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#FCFAF3] text-[#132A21] border-2 border-[#178A52] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col relative"
        style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', 'Sora', sans-serif" : "'Sora', sans-serif" }}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[#04231A] text-white flex items-center justify-between border-b border-[#0B4A31]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow ${
              isListening ? 'bg-[#E3A82B] text-[#04231A] animate-pulse' : 'bg-[#178A52] text-white'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {isUrdu ? 'وائس کمانڈ نیویگیشن' : 'Voice Command Radar'}
                </h3>
                <span className="bg-[#E3A82B] text-[#04231A] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  AI Live
                </span>
              </div>
              <p className="text-xs text-[#DCEFE4]/80 font-urdu">
                {isUrdu ? 'بغیر ٹائپ کیے براہ راست بول کر کسی بھی فیچر پر جائیں' : 'Speak commands like "Show me vendor rates" or "Find nearest slots"'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#0B4A31] hover:bg-[#178A52] text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Area */}
        <div className="p-6 space-y-5 bg-[#FCFAF3]">
          {/* Active Listening Visualizer */}
          <div className="bg-[#F0F7F4] border-2 border-[#178A52]/30 rounded-2xl p-6 text-center space-y-4">
            <div className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-200'
                    : 'bg-[#178A52] hover:bg-[#126B40] text-white ring-8 ring-[#178A52]/20'
                }`}
              >
                {isListening ? <Mic className="w-9 h-9" /> : <MicOff className="w-9 h-9" />}
              </button>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#178A52]">
                {isListening 
                  ? (isUrdu ? 'آواز سنی جا رہی ہے... ابھی بولیں' : 'Listening carefully... speak now')
                  : (isUrdu ? 'مائیکروفون بند ہے۔ شروع کرنے کے لیے بٹن دبائیں۔' : 'Mic is idle. Tap above to speak')}
              </p>

              {transcript ? (
                <div className="mt-2 p-3 bg-white border border-[#178A52]/40 rounded-xl shadow-inner text-base font-bold text-[#04231A]">
                  "{transcript}"
                </div>
              ) : (
                <p className="text-xs text-[#5C6F63] mt-1 font-urdu">
                  {isUrdu ? 'مثال کے طور پر بولیں: "سرکاری ریٹس دکھائیں" یا "قریبی سلاٹس نقشہ"' : 'E.g., Say "Show me vendor rates" or "Find nearest slots"'}
                </p>
              )}
            </div>

            {/* Matched Action Confirmation */}
            {matchedAction && (
              <div className="p-3.5 bg-[#E3A82B]/20 border border-[#E3A82B] rounded-xl flex items-center justify-between text-left animate-bounce">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#178A52] shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm text-[#04231A]">
                      {isUrdu ? matchedAction.titleUrdu : matchedAction.titleEn}
                    </h4>
                    <p className="text-xs text-[#132A21]/80 font-urdu">{matchedAction.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    matchedAction.action();
                    onClose();
                  }}
                  className="bg-[#178A52] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1 shrink-0"
                >
                  <span>{isUrdu ? 'ابھی جائیں' : 'Go Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick 1-Click Spoken Shortcuts */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-[#04231A] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E3A82B]" />
              <span>{isUrdu ? 'یا 1-کلک فوری وائس شارٹ کٹس آزمائیں' : 'Or Tap Suggested Commands Directly'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(isUrdu ? cmd.textUrdu : cmd.textEn);
                    handleCommandMatch(isUrdu ? cmd.textUrdu : cmd.textEn);
                  }}
                  className="p-3 bg-white hover:bg-[#F0F7F4] border border-[#178A52]/30 hover:border-[#178A52] rounded-xl text-left transition-all shadow-xs flex items-center justify-between group"
                >
                  <div>
                    <p className="font-extrabold text-xs text-[#04231A] group-hover:text-[#178A52]">
                      "{isUrdu ? cmd.textUrdu : cmd.textEn}"
                    </p>
                    <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5">
                      {cmd.description}
                    </p>
                  </div>
                  <Volume2 className="w-4 h-4 text-[#178A52] opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#EAF3EE] border-t border-[#178A52]/30 text-center text-xs text-[#132A21] flex items-center justify-between px-5">
          <span className="font-urdu text-[11px]">
            {isUrdu ? 'تمام شہریوں اور ریڑھی بانوں کے لیے آسان وائس نیویگیشن' : 'Accessible Voice-First Navigation for All Citizens & Vendors'}
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#178A52] hover:underline"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
