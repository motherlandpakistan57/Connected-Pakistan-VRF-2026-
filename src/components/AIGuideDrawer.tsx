import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Send, Sparkles, Volume2, VolumeX, AlertTriangle, 
  HelpCircle, Shield, ShoppingBag, Store, HeartHandshake, CheckCircle2,
  Move, GripHorizontal, Minus, Maximize2, Minimize2, PanelRight, MapPin, 
  Compass, RotateCcw, ZoomIn, ZoomOut, Calculator, FileText, ArrowRight,
  Eye, Check, Copy, Sliders, Bell
} from 'lucide-react';
import { Language, AIVoice, DCRateItem, VendorProfile, CitizenReport } from '../types';
import { speechService } from '../lib/audio';
import { BrandLogo } from './BrandLogo';
import { queryAIKnowledgeEngine, AIResponsePayload } from '../lib/aiKnowledgeEngine';

interface AIGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onToggleLang: () => void;
  voice: AIVoice;
  voiceEnabled: boolean;
  dcRates: DCRateItem[];
  vendors: VendorProfile[];
  reports: CitizenReport[];
  onNavigateToTab: (tab: string) => void;
  onOpenReportModalWithItem?: (item: string, rate: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  textUrdu: string;
  textEn: string;
  structuredData?: AIResponsePayload['structuredData'];
  actionButton?: {
    labelUrdu: string;
    labelEn: string;
    actionTab?: string;
    reportItem?: string;
    reportRate?: number;
    specialAction?: string;
  };
  timestamp: string;
}

const ZOOM_LEVELS = [0.8, 0.9, 1.0, 1.15, 1.3, 1.45];

export const AIGuideDrawer: React.FC<AIGuideDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  onToggleLang,
  voice,
  voiceEnabled,
  dcRates = [],
  vendors = [],
  reports = [],
  onNavigateToTab,
  onOpenReportModalWithItem,
}) => {
  const isUrdu = lang === 'ur';

  // Moveable Chatbot Position & State
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('cp_chatbot_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch (e) {}
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      x: Math.max(16, w - 440),
      y: Math.max(70, h - 680),
    };
  });

  // Minimization & Docking State
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDocked, setIsDocked] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [snapMenuOpen, setSnapMenuOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Zoom In / Out State & Auto-Scale
  const [zoomIndex, setZoomIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cp_ai_guide_zoom');
      if (saved) {
        const idx = parseInt(saved, 10);
        if (!isNaN(idx) && idx >= 0 && idx < ZOOM_LEVELS.length) return idx;
      }
    } catch (e) {}
    return 2; // Default 1.0 (100%)
  });

  const [autoScaleEnabled, setAutoScaleEnabled] = useState<boolean>(true);
  const [autoMinimizeOnOutside, setAutoMinimizeOnOutside] = useState<boolean>(true);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      textUrdu: 'السلام علیکم و رحمتہ اللہ و برکاتہ! میں کنیکٹڈ پاکستان کا انتہائی ذہین اے آئی شہری و دکاندار رہنماء ہوں۔\n\nاللہ تعالیٰ آپ کو اور آپ کے اہل خانہ کو ہمیشہ خوش، سلامت اور برکتوں میں رکھے۔ آپ مجھ سے روزمرہ کے سرکاری ڈی سی ریٹس، راشن کا حساب کتاب (مثلاً: "2 کلو آٹا اور 1 کلو چینی کا بل")، دکاندار کیو آر لائسنس و جیو فینس تصدیق، گراں فروشی کی 100% خفیہ رپورٹ یا ریڑھی بانوں کے قانونی حقوق (سیکشن 14-2) کے بارے میں کچھ بھی پوچھ سکتے ہیں۔\n\n✨ یہ کھڑکی مکمل موو ایبل ہے اور آپ کی ضرورت کے مطابق زوم ان/آؤٹ (Zoom In/Out) اور خودکار منیمائز ہوتی ہے۔ فرمائیے میں آپ کی کیا خدمت کروں؟',
      textEn: 'Assalam-o-Alaikum wa Rahmatullah! I am your Ultra-Intelligent Connected Pakistan Civic AI Guide.\n\nMay Allah bless you and your family with health and prosperity. Ask me anything: official daily DC ceiling rates, grocery budget calculations (e.g. "Calculate 3kg flour + 2kg sugar"), vendor QR badge verification, 100% encrypted anonymous complaints, or street vendor legal protections under VRF Act 2026.\n\n✨ This assistant is fully moveable, supports smart Auto Zoom In/Out, and auto-minimizes when you explore the platform. How may I assist you today?',
      timestamp: 'Just now',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recentMessageTimes, setRecentMessageTimes] = useState<number[]>([]);
  const [floodWarning, setFloodWarning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initPosX: number;
    initPosY: number;
  }>({ startX: 0, startY: 0, initPosX: 0, initPosY: 0 });

  const currentZoom = ZOOM_LEVELS[zoomIndex];

  // Save zoom changes to localStorage
  const handleSetZoom = (newIdx: number) => {
    const clamped = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, newIdx));
    setZoomIndex(clamped);
    try {
      localStorage.setItem('cp_ai_guide_zoom', clamped.toString());
    } catch (e) {}
  };

  const handleZoomIn = () => handleSetZoom(zoomIndex + 1);
  const handleZoomOut = () => handleSetZoom(zoomIndex - 1);
  const handleResetZoom = () => handleSetZoom(2); // 1.0

  // Focus input on open/expand
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  // Scroll to bottom on message or typing change
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isMinimized]);

  // Smart Auto-Minimize when user interacts with other parts of the platform
  useEffect(() => {
    if (!isOpen || isMinimized || !autoMinimizeOnOutside) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Don't minimize if click is inside this chatbot window or floating buttons
      if (containerRef.current && containerRef.current.contains(target)) return;
      if (target.closest('#moveable-ai-chatbot-window') || target.closest('#btn-floating-ai-guide-launcher') || target.closest('#btn-open-ai-guide')) return;

      // Auto-minimize when clicking outside to let user interact with the underlying page freely
      setIsMinimized(true);
    };

    // Listen on document for clicks outside
    document.addEventListener('mousedown', handleOutsideClick, { passive: true });
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, isMinimized, autoMinimizeOnOutside]);

  // When isOpen transitions from false to true, ensure it expands smoothly
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Window resize bounds check
  useEffect(() => {
    const handleResize = () => {
      setPos(prev => {
        const width = isMinimized ? 240 : Math.min(440, window.innerWidth - 16);
        const height = isMinimized ? 60 : Math.min(680, window.innerHeight - 80);
        return {
          x: Math.max(8, Math.min(window.innerWidth - width - 8, prev.x)),
          y: Math.max(60, Math.min(window.innerHeight - height - 8, prev.y)),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMinimized]);

  // Mouse Drag Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDocked) return;
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPosX: pos.x,
      initPosY: pos.y,
    };
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      const widgetWidth = isMinimized ? 240 : Math.min(440, window.innerWidth - 16);
      const widgetHeight = isMinimized ? 60 : Math.min(680, window.innerHeight - 80);

      const nextX = Math.max(8, Math.min(window.innerWidth - widgetWidth - 8, dragRef.current.initPosX + dx));
      const nextY = Math.max(60, Math.min(window.innerHeight - widgetHeight - 8, dragRef.current.initPosY + dy));

      setPos({ x: nextX, y: nextY });
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      const dx = upEvent.clientX - dragRef.current.startX;
      const dy = upEvent.clientY - dragRef.current.startY;
      const finalPos = {
        x: Math.max(8, Math.min(window.innerWidth - (isMinimized ? 240 : 440) - 8, dragRef.current.initPosX + dx)),
        y: Math.max(60, Math.min(window.innerHeight - (isMinimized ? 60 : 680) - 8, dragRef.current.initPosY + dy)),
      };
      try {
        localStorage.setItem('cp_chatbot_pos', JSON.stringify(finalPos));
      } catch (e) {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Touch Drag Handler for mobile / touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDocked) return;
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;
    const touch = e.touches[0];

    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initPosX: pos.x,
      initPosY: pos.y,
    };
    setIsDragging(true);

    const onTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0];
      const dx = currentTouch.clientX - dragRef.current.startX;
      const dy = currentTouch.clientY - dragRef.current.startY;
      const widgetWidth = isMinimized ? 240 : Math.min(440, window.innerWidth - 16);
      const widgetHeight = isMinimized ? 60 : Math.min(680, window.innerHeight - 80);

      const nextX = Math.max(8, Math.min(window.innerWidth - widgetWidth - 8, dragRef.current.initPosX + dx));
      const nextY = Math.max(60, Math.min(window.innerHeight - widgetHeight - 8, dragRef.current.initPosY + dy));

      setPos({ x: nextX, y: nextY });
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  // Quick preset snaps
  const snapTo = (preset: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center') => {
    const width = isMinimized ? 240 : 440;
    const height = isMinimized ? 60 : 680;
    let nextPos = { x: 20, y: 80 };

    if (preset === 'bottom-right') {
      nextPos = { x: Math.max(16, window.innerWidth - width - 20), y: Math.max(70, window.innerHeight - height - 20) };
    } else if (preset === 'bottom-left') {
      nextPos = { x: 20, y: Math.max(70, window.innerHeight - height - 20) };
    } else if (preset === 'top-right') {
      nextPos = { x: Math.max(16, window.innerWidth - width - 20), y: 75 };
    } else if (preset === 'top-left') {
      nextPos = { x: 20, y: 75 };
    } else if (preset === 'center') {
      nextPos = { x: Math.max(16, (window.innerWidth - width) / 2), y: Math.max(70, (window.innerHeight - height) / 2) };
    }

    setPos(nextPos);
    setSnapMenuOpen(false);
    try {
      localStorage.setItem('cp_chatbot_pos', JSON.stringify(nextPos));
    } catch(e) {}
  };

  // Quick Chips with authentic localized Pakistani phrasing & calculations
  const promptChips = [
    { labelUrdu: '🌾 آٹے، چینی، گھی کا سرکاری ریٹ؟', labelEn: 'Flour, Sugar & Ghee Official Rates?', query: 'atta cheeni ghee rate' },
    { labelUrdu: '🧾 5 کلو آٹا اور 2 کلو چینی کا بل؟', labelEn: 'Calculate 5kg Flour + 2kg Sugar', query: 'Calculate total bill for 5kg atta and 2kg cheeni and 1 dozen anday' },
    { labelUrdu: '🚨 دکاندار زائد پیسے مانگ رہا ہے، کیا کروں؟', labelEn: 'Vendor overcharging, what should I do?', query: 'madad pareshan overcharging loot' },
    { labelUrdu: '🛡️ کیا شکایت 100% محفوظ اور گمنام ہے؟', labelEn: 'Is reporting 100% anonymous & safe?', query: 'is reporting anonymous safe gumnam' },
    { labelUrdu: '🏪 ریڑھی بان کے قانونی حقوق و تحفظات', labelEn: 'Vendor Legal Rights (Sec 14-2)', query: 'vendor rights anti eviction waqar' },
    { labelUrdu: '🗺️ 30 اضلاع میں مائیکرو ریڈار کوریج', labelEn: '30 Districts Geospatial Coverage', query: 'islamabad rawalpindi lahore karachi zones' },
  ];

  // Flood limiter: 5 msgs / 3 seconds
  const checkFloodLimit = (): boolean => {
    const now = Date.now();
    const recent = recentMessageTimes.filter(t => now - t < 3000);
    if (recent.length >= 5) {
      setFloodWarning(true);
      setTimeout(() => setFloodWarning(false), 3000);
      return false;
    }
    setRecentMessageTimes([...recent, now]);
    return true;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!checkFloodLimit()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      textUrdu: text,
      textEn: text,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = queryAIKnowledgeEngine(text, dcRates, vendors, reports);
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        textUrdu: response.textUrdu,
        textEn: response.textEn,
        structuredData: response.structuredData,
        actionButton: response.actionButton ? {
          labelUrdu: response.actionButton.labelUrdu,
          labelEn: response.actionButton.labelEn,
          actionTab: response.actionButton.actionTab,
          reportItem: response.actionButton.reportItem,
          reportRate: response.actionButton.reportRate,
          specialAction: response.actionButton.specialAction,
        } : undefined,
        timestamp: 'Just now',
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      // Automatic Zoom Optimization for detailed calculations / long tables
      if (autoScaleEnabled && response.structuredData?.type === 'calculation') {
        if (zoomIndex > 2) {
          // If zoomed very large, gently adjust to 100% so calculation fits nicely
          setZoomIndex(2);
        }
      }

      if (voiceEnabled) {
        speechService.playChime('complete');
        setTimeout(() => {
          speechService.speak(isUrdu ? response.textUrdu : response.textEn, {
            lang: isUrdu ? 'ur' : 'en',
            voiceGender: voice,
          });
        }, 150);
      } else {
        speechService.playChime('beep');
      }
    }, 100);
  };

  const handleActionButtonClick = (btn: NonNullable<ChatMessage['actionButton']>) => {
    if (btn.reportItem && btn.reportRate) {
      onOpenReportModalWithItem?.(btn.reportItem, btn.reportRate);
    }
    if (btn.actionTab) {
      onNavigateToTab(btn.actionTab);
    }
    // Auto-minimize when jumping to tab so user can see the target screen
    setIsMinimized(true);
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (e) {}
  };

  if (!isOpen) return null;

  // MINIMIZED FLOATING BUBBLE (Moveable anywhere, automatically clicks to re-open)
  if (isMinimized) {
    return (
      <div
        id="moveable-ai-chatbot-minimized"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => {
          setIsMinimized(false);
          speechService.playChime('action');
        }}
        className={`fixed z-50 flex items-center gap-2.5 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#178A52] text-white p-2.5 px-3.5 rounded-2xl shadow-2xl border-2 border-[#E3A82B] cursor-grab active:cursor-grabbing select-none hover:scale-105 active:scale-95 transition-all duration-200 ${
          isDragging ? 'ring-4 ring-amber-400/40 opacity-90' : ''
        }`}
        title={isUrdu ? "ماؤس سے پکڑ کر اسکرین پر کہیں بھی لے جائیں • کلک کر کے دوبارہ کھولیں" : "Drag anywhere • Click to expand AI Assistant"}
      >
        <div className="flex items-center gap-1.5 cursor-grab">
          <GripHorizontal className="w-3.5 h-3.5 text-amber-300/80" />
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        <div className="flex flex-col text-left">
          <span className={`text-xs font-black text-amber-300 ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? 'اے آئی معاون' : 'AI Civic Guide'}
          </span>
          <span className="text-[9px] text-slate-200 font-sans leading-none">
            {isUrdu ? 'کلک کر کے سوال پوچھیں' : 'Click to ask anything'}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
            speechService.playChime('action');
          }}
          className="p-1 rounded-lg bg-[#04231A] hover:bg-[#178A52] text-[#E3A82B] hover:text-white transition-colors"
          title="Expand Chatbot"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10"
          title="Close Chatbot"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // DOCKED SIDEBAR VS. MOVEABLE FLOATING CHATBOT
  const containerClasses = isDocked
    ? 'fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] max-w-full bg-[#04231A] border-l-2 border-[#E3A82B] shadow-2xl flex flex-col justify-between text-white animate-fadeUp'
    : 'fixed z-50 w-[95vw] sm:w-[440px] h-[640px] max-h-[88vh] bg-[#04231A] rounded-3xl border-2 border-[#E3A82B] shadow-2xl flex flex-col justify-between text-white overflow-hidden animate-fadeUp';

  const containerStyle = isDocked
    ? undefined
    : { left: `${pos.x}px`, top: `${pos.y}px` };

  return (
    <div
      ref={containerRef}
      id="moveable-ai-chatbot-window"
      style={containerStyle}
      className={containerClasses}
    >
      {/* Draggable Header Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`p-3 bg-[#0B4A31] border-b border-[#178A52]/50 flex items-center justify-between select-none ${
          !isDocked ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        title={
          !isDocked
            ? (isUrdu ? "اسکرین پر کہیں بھی منتقل کرنے کے لیے ماؤس سے پکڑ کر گھسیٹیں" : "Click and drag to move chatbot anywhere on your screen")
            : undefined
        }
      >
        {/* Left Drag Indicator & Brand */}
        <div className="flex items-center gap-2">
          {!isDocked && (
            <div 
              className="flex items-center gap-0.5 p-1 rounded-md bg-black/25 text-amber-300 hover:bg-black/40 transition-colors"
              title={isUrdu ? "موو ایبل ہینڈل: پکڑ کر اسکرین پر کہیں بھی رکھیں" : "Move Handle: Click & drag anywhere"}
            >
              <Move className="w-3.5 h-3.5" />
              <GripHorizontal className="w-3.5 h-3.5 opacity-75" />
            </div>
          )}
          <BrandLogo variant="dark" size="sm" showSubtitle={false} />
          <div className="h-5 w-px bg-white/20" />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-xs sm:text-sm text-[#FCFAF3]">
                {isUrdu ? 'اے آئی رہنماء چیٹ بوٹ' : 'AI Civic Guide'}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[9px] text-[#DCEFE4]/80 font-urdu leading-tight">
              {!isDocked 
                ? (isUrdu ? '✨ موو ایبل و زوم ایبل رہنماء' : '✨ Moveable & Zoomable AI Assistant')
                : (isUrdu ? 'سرکاری اے آئی اسسٹنٹ' : 'Official DC AI Assistant')}
            </p>
          </div>
        </div>

        {/* Right Controls: Zoom Controls, Snap Menu, Settings, Dock/Undock, Minimize, Close */}
        <div className="flex items-center gap-1">
          {/* Zoom In / Zoom Out Widget */}
          <div className="flex items-center bg-[#04231A] rounded-lg border border-[#178A52]/50 p-0.5" title="Adjust text & interface zoom size">
            <button
              onClick={handleZoomOut}
              disabled={zoomIndex === 0}
              className="p-1 text-slate-300 hover:text-amber-300 disabled:opacity-30 transition-colors"
              title={isUrdu ? "زوم آؤٹ (Zoom Out)" : "Zoom Out (A-)"}
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-1 text-[10px] font-mono font-bold text-amber-300 select-none">
              {Math.round(currentZoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              className="p-1 text-slate-300 hover:text-amber-300 disabled:opacity-30 transition-colors"
              title={isUrdu ? "زوم ان (Zoom In)" : "Zoom In (A+)"}
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            {currentZoom !== 1.0 && (
              <button
                onClick={handleResetZoom}
                className="p-1 text-[9px] text-slate-400 hover:text-white"
                title="Reset Zoom to 100%"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Quick Settings Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSettingsOpen(!settingsOpen);
              }}
              className={`p-1.5 rounded-lg transition-colors ${settingsOpen ? 'bg-[#04231A] text-amber-300' : 'text-[#DCEFE4] hover:bg-[#04231A] hover:text-white'}`}
              title="Assistant Preferences & Auto-Minimize Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#04231A] border-2 border-[#178A52] rounded-2xl shadow-2xl p-2.5 z-50 text-xs text-white animate-fadeUp">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#178A52]/40 mb-2">
                  <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                    {isUrdu ? 'اے آئی ترجیحات' : 'AI Preferences'}
                  </span>
                  <button onClick={() => setSettingsOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between text-[11px] cursor-pointer hover:bg-[#0B4A31] p-1.5 rounded-lg">
                    <div>
                      <p className="font-bold">{isUrdu ? 'خودکار چھوٹا ہونا (Auto-Minimize)' : 'Auto-Minimize on Click Outside'}</p>
                      <p className="text-[9px] text-slate-300">{isUrdu ? 'دیگر اسکرین پر جانے پر خودکار چھوٹا کریں' : 'Minimizes to floating bubble when moving'}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={autoMinimizeOnOutside} 
                      onChange={(e) => setAutoMinimizeOnOutside(e.target.checked)}
                      className="accent-[#E3A82B] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-[11px] cursor-pointer hover:bg-[#0B4A31] p-1.5 rounded-lg">
                    <div>
                      <p className="font-bold">{isUrdu ? 'خودکار اسکیلنگ (Smart Auto-Scale)' : 'Smart Auto-Scale on Long Data'}</p>
                      <p className="text-[9px] text-slate-300">{isUrdu ? 'بڑے بل پر خودکار زوم سیٹ کریں' : 'Auto-adjusts zoom for itemized bills'}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={autoScaleEnabled} 
                      onChange={(e) => setAutoScaleEnabled(e.target.checked)}
                      className="accent-[#E3A82B] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Position Snap Presets Dropdown */}
          {!isDocked && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSnapMenuOpen(!snapMenuOpen);
                }}
                className="p-1.5 rounded-lg text-[#DCEFE4] hover:bg-[#04231A] hover:text-amber-300 transition-colors"
                title={isUrdu ? "اسکرین پر پوزیشن تبدیل کریں (Snap)" : "Snap Position Presets"}
              >
                <Compass className="w-3.5 h-3.5" />
              </button>

              {snapMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#04231A] border border-[#178A52] rounded-xl shadow-xl p-1.5 z-50 text-xs text-white animate-fadeUp">
                  <p className="text-[10px] font-bold text-amber-300 px-2 py-1 uppercase tracking-wider border-b border-[#178A52]/40">
                    {isUrdu ? 'اسکرین پوزیشن منتخب کریں' : 'Place Chatbot At'}
                  </p>
                  <button
                    onClick={() => snapTo('bottom-right')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#0B4A31] flex items-center justify-between text-[11px]"
                  >
                    <span>{isUrdu ? 'نیچے دائیں (ڈیفالٹ)' : 'Bottom Right (Default)'}</span>
                    <span>↘️</span>
                  </button>
                  <button
                    onClick={() => snapTo('bottom-left')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#0B4A31] flex items-center justify-between text-[11px]"
                  >
                    <span>{isUrdu ? 'نیچے بائیں' : 'Bottom Left'}</span>
                    <span>↙️</span>
                  </button>
                  <button
                    onClick={() => snapTo('top-right')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#0B4A31] flex items-center justify-between text-[11px]"
                  >
                    <span>{isUrdu ? 'اوپر دائیں' : 'Top Right'}</span>
                    <span>↗️</span>
                  </button>
                  <button
                    onClick={() => snapTo('top-left')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#0B4A31] flex items-center justify-between text-[11px]"
                  >
                    <span>{isUrdu ? 'اوپر بائیں' : 'Top Left'}</span>
                    <span>↖️</span>
                  </button>
                  <button
                    onClick={() => snapTo('center')}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#0B4A31] flex items-center justify-between text-[11px]"
                  >
                    <span>{isUrdu ? 'درمیان (Center)' : 'Center'}</span>
                    <span>🎯</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dock / Undock Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDocked(!isDocked);
            }}
            className="p-1.5 rounded-lg text-[#DCEFE4] hover:bg-[#04231A] hover:text-white transition-colors"
            title={isDocked ? "Float as Moveable Window" : "Dock to Side Drawer"}
          >
            <PanelRight className={`w-3.5 h-3.5 ${isDocked ? 'text-amber-300' : ''}`} />
          </button>

          {/* Minimize Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            className="p-1.5 rounded-lg text-[#DCEFE4] hover:bg-[#04231A] hover:text-amber-300 transition-colors"
            title={isUrdu ? "چھوٹا کریں (Minimize to Bubble)" : "Minimize to Floating Bubble"}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLang();
            }}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#04231A] text-[#E3A82B] border border-[#178A52]/40"
          >
            {isUrdu ? 'EN' : 'اردو'}
          </button>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#DCEFE4] hover:bg-[#04231A] hover:text-rose-400 transition-colors"
            aria-label="Close AI guide"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Moveable & Zoom Hint Bar */}
      {!isDocked && (
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="bg-emerald-950/90 text-amber-200/90 text-[10px] px-3 py-1 border-b border-emerald-800/40 flex items-center justify-between cursor-grab active:cursor-grabbing"
        >
          <span className="flex items-center gap-1 font-mono">
            <Move className="w-3 h-3 text-amber-400" />
            <span>{isUrdu ? 'اسکرین پر کہیں بھی منتقل کریں • زوم سائز تبدیل کریں' : 'Moveable anywhere • Auto-Zoom & Auto-Minimize enabled'}</span>
          </span>
          <span className="text-[9px] opacity-75 font-urdu">اے آئی معاون</span>
        </div>
      )}

      {/* Flood Limit Warning Banner */}
      {floodWarning && (
        <div className="bg-[#B03A2E] text-white p-2 text-center text-xs font-bold font-urdu animate-shake">
          ⚠️ برائے مہربانی رفتار دھیمی رکھیں (Flood Limit: 5 msgs / 3s)
        </div>
      )}

      {/* Messages Scroll Area with Scalable Zoom */}
      <div 
        className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#04231A] transition-all duration-200 origin-top"
        style={{ fontSize: `${currentZoom}rem` }}
      >
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-3 shadow-md relative ${
                  isAI
                    ? 'bg-[#0B4A31] border border-[#178A52] text-[#FCFAF3]'
                    : 'bg-[#178A52] border border-[#E3A82B]/60 text-white'
                }`}
              >
                {/* Urdu Primary Text */}
                <p className="font-urdu leading-relaxed whitespace-pre-line text-[0.85em]">
                  {msg.textUrdu}
                </p>

                {/* English Subtitle */}
                <p className="text-[0.72em] text-[#DCEFE4]/75 mt-1.5 pt-1.5 border-t border-[#178A52]/40 leading-snug">
                  {msg.textEn}
                </p>

                {/* Structured Calculation Breakdown Card */}
                {msg.structuredData?.type === 'calculation' && msg.structuredData.items && (
                  <div className="mt-2.5 p-2 bg-[#04231A]/90 rounded-xl border border-[#E3A82B]/50 text-[0.78em] space-y-1.5 font-sans">
                    <div className="flex items-center justify-between text-amber-300 font-bold border-b border-white/10 pb-1">
                      <span className="flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'تفصیلی حساب کتاب' : 'Itemized DC Breakdown'}</span>
                      </span>
                      <span className="font-mono text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                        VRF 2026
                      </span>
                    </div>

                    <div className="space-y-1">
                      {msg.structuredData.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-200 text-[11px]">
                          <span>{item.name} ({item.quantity})</span>
                          <span className="font-mono font-bold text-amber-200">Rs. {item.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1.5 border-t border-white/10 flex items-center justify-between font-bold text-emerald-300">
                      <span>{isUrdu ? 'کل رقم:' : 'Official Total:'}</span>
                      <span className="font-mono text-sm">Rs. {msg.structuredData.totalDc?.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Optional Action Button */}
                {msg.actionButton && (
                  <button
                    onClick={() => handleActionButtonClick(msg.actionButton!)}
                    className="mt-2.5 w-full bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-3 py-1.5 rounded-xl text-[0.78em] font-extrabold transition-transform active:scale-95 shadow flex items-center justify-center gap-1.5"
                  >
                    <span>{isUrdu ? msg.actionButton.labelUrdu : msg.actionButton.labelEn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Utility Controls: Speak & Copy */}
                {isAI && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      onClick={() => handleCopyMessage(msg.id, isUrdu ? msg.textUrdu : msg.textEn)}
                      className="p-1 text-[#DCEFE4]/60 hover:text-white transition-colors"
                      title="Copy response text"
                    >
                      {copiedMsgId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        speechService.speak(isUrdu ? msg.textUrdu : msg.textEn, {
                          lang: isUrdu ? 'ur' : 'en',
                          voiceGender: voice,
                        });
                      }}
                      className="p-1 text-[#DCEFE4]/60 hover:text-[#E3A82B] transition-colors"
                      title="Read message aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[0.65em] text-[#DCEFE4]/50 mt-0.5 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 bg-[#0B4A31] p-3 rounded-2xl w-24">
            <span className="w-2 h-2 rounded-full bg-[#E3A82B] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#E3A82B] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-[#E3A82B] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="p-2 bg-[#04231A] border-t border-[#0B4A31] flex gap-1.5 overflow-x-auto no-scrollbar">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.query)}
            className="px-2.5 py-1 rounded-xl bg-[#0B4A31] hover:bg-[#178A52] text-[11px] text-[#DCEFE4] hover:text-white whitespace-nowrap transition-colors border border-[#178A52]/30 font-urdu shrink-0"
          >
            {isUrdu ? chip.labelUrdu : chip.labelEn}
          </button>
        ))}
      </div>

      {/* Question Input Box */}
      <div className="p-2.5 bg-[#0B4A31] border-t border-[#178A52]/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isUrdu ? 'پوچھیے (مثلاً: 2 کلو آٹے اور 1 کلو چینی کا بل، ریٹس، شکایت)...' : 'Ask anything (e.g. calculate 5kg flour + 2kg sugar, report)...'}
            className="flex-1 bg-[#04231A] border border-[#178A52] rounded-xl px-3 py-2 text-xs text-white placeholder-[#DCEFE4]/40 focus:outline-none focus:border-[#E3A82B]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#178A52] hover:bg-[#178A52]/80 text-white disabled:opacity-40 transition-transform active:scale-95 shadow shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
