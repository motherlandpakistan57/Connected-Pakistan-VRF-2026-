import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Map, Film, Network, 
  Volume2, VolumeX, Play, Pause, RotateCcw, Maximize2, 
  Upload, Search, CheckCircle2, Shield, Sparkles, Navigation, 
  Eye, Compass, Layers, Globe, Radio, MapPin, Ban, ShoppingBag,
  Store, ClipboardCheck, Building2, Bot, ArrowRight, Check,
  LogOut, Video
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { speechService } from '../lib/audio';
import { getBriefingVideo, saveBriefingVideo, deleteBriefingVideo } from '../lib/indexedDb';
import { PlatformMindMapView } from './PlatformMindMapView';
import { GeospatialTourMap } from './GeospatialTourMap';
import { MarketHeroArtwork } from './MarketHeroArtwork';

interface IntroTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenLocate?: (place: string) => void;
  onLogout?: () => void;
  onSelectRole?: (role: UserRole) => void;
  isFullPage?: boolean;
}

export const IntroTourModal: React.FC<IntroTourModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenLocate,
  onLogout,
  onSelectRole,
  isFullPage = false,
}) => {
  const isUrdu = lang === 'ur';
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1 Mind Map State
  const [selectedMindNode, setSelectedMindNode] = useState<number | null>(0);
  const [mindMapMode, setMindMapMode] = useState<'constellation' | 'deep_architecture'>('constellation');

  // STEP 3 Cinema Video & Canvas State
  const [cinemaMode, setCinemaMode] = useState<'film' | 'custom_video' | 'case_study'>('custom_video');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string>('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoVolume, setVideoVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Canvas Film State
  const [isFilmPlaying, setIsFilmPlaying] = useState(true);
  const [filmProgress, setFilmProgress] = useState(0);
  const [filmCaption, setFilmCaption] = useState('کنیکٹڈ پاکستان: ڈیجیٹل گورننس کا نیا باب');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);

  // 6 Mind Map Partner Nodes matching Video 0:00 - 0:25
  const mindNodes = [
    {
      id: 0,
      roleKey: 'citizen' as UserRole,
      titleEn: 'Citizen',
      titleUrdu: 'شہری',
      subtitleEn: 'Price Transparency & Sovereign Voice',
      subtitleUrdu: 'شفاف نرخ نامہ اور گمنام شکایت',
      descEn: 'Empowers citizens with verified daily price ceilings, optical verification, and encrypted zero-retaliation reporting.',
      descUrdu: 'شہریوں کو روزانہ کے سرکاری ڈی سی ریٹس کی تصدیق اور گمنام شکایت درج کرنے کا آئینی اختیار حاصل ہے۔',
      icon: ShoppingBag,
      color: '#178A52',
    },
    {
      id: 1,
      roleKey: 'vendor' as UserRole,
      titleEn: 'Vendor',
      titleUrdu: 'فروش',
      subtitleEn: 'Dignified 6x4ft Slots & QR Badges',
      subtitleUrdu: 'باعزت 6x4 فٹ جگہ اور کیو آر لائسنس',
      descEn: 'Zero unslotted evictions, 8-hour shift rotations, civic waste rewards, and daily micro-banking up to 850 credit scores.',
      descUrdu: 'ریڑھی بانوں کو مقررہ جیو فینس جگہ، کیو آر لائسنس، 8 گھنٹے کی گردش اور بلاسود مائیکرو فنانس کی سہولت۔',
      icon: Store,
      color: '#E3A82B',
    },
    {
      id: 2,
      roleKey: 'government' as UserRole,
      titleEn: 'Government',
      titleUrdu: 'حکومت',
      subtitleEn: 'District Command & Live Telemetry',
      subtitleUrdu: 'ضلعی کمانڈ اور لائیو ہیٹ میپ',
      descEn: 'Executive municipal leadership managing district slot quotas, real-time patrol GPS, and zero-leakage transparent revenue.',
      descUrdu: 'ڈپٹی کمشنرز پورے ضلع میں ریڑھی بانوں کے سلاٹس، لائیو ہیٹ میپ کی نگرانی اور میونسپل فیسوں کا کنٹرول سنبھالتے ہیں۔',
      icon: Building2,
      color: '#0B4A31',
    },
    {
      id: 3,
      roleKey: 'government' as UserRole,
      titleEn: 'GeoSpatial',
      titleUrdu: 'جیو اسپیشل',
      subtitleEn: 'National Satellites & 35m Precision',
      subtitleUrdu: 'قومی سیٹلائٹ میپ اور 35 میٹر پریسیشن',
      descEn: 'Full national GIS covering all provinces, Gilgit-Baltistan, and AJK with 35-meter accuracy boundary locks.',
      descUrdu: 'پورے پاکستان بشمول گلگت بلتستان و آزاد کشمیر کا جی پی ایس میپ اور 35 میٹر پریسیشن رنگ۔',
      icon: Globe,
      color: '#178A52',
    },
    {
      id: 4,
      roleKey: 'citizen' as UserRole,
      titleEn: 'AI Guide',
      titleUrdu: 'اے آئی گائیڈ',
      subtitleEn: 'Natural Urdu/English Civic Guide',
      subtitleUrdu: 'قدرتی اردو اور انگریزی آواز میں مدد',
      descEn: 'Empathetic conversational AI providing instant rate lookups, rights guidance, dispute resolution, and 1-tap rapid dispatch.',
      descUrdu: 'فوری لسانی رہنمائی، ہمدردانہ گفتگو، سرکاری نرخوں کا فوری جواب اور ہنگامی مدد کی فراہمی۔',
      icon: Bot,
      color: '#F4D58D',
    },
    {
      id: 5,
      roleKey: 'inspector' as UserRole,
      titleEn: 'Inspector',
      titleUrdu: 'انسپکٹر',
      subtitleEn: '±3% Tolerance Scanner & Coaching',
      subtitleUrdu: '±3% رعایت کا اسکینر اور رہنمائی',
      descEn: 'Field magistrates equipped with AI optical scanners. Prioritizes vendor coaching; digital citations require incontrovertible proof.',
      descUrdu: 'پیرہ مجسٹریٹس ریٹس کا اسکینر کے ذریعے معائنہ کرتے ہیں۔ بلاجواز ہراساں کرنے کی ممانعت ہے اور اصلاح اول ترجیح ہے۔',
      icon: ClipboardCheck,
      color: '#3D7EA6',
    },
  ];

  // Load persisted video from IndexedDB on mount
  useEffect(() => {
    getBriefingVideo().then((record) => {
      if (record && record.blob) {
        const url = URL.createObjectURL(record.blob);
        setUploadedVideoUrl(url);
        setUploadedVideoName(record.name);
        setCinemaMode('custom_video');
      }
    });
  }, []);

  // Speak Node on Selection with TTS
  const handleSelectMindNode = (index: number) => {
    setSelectedMindNode(index);
    const node = mindNodes[index];
    const textToSpeak = isUrdu
      ? `${node.titleUrdu} شراکت دار۔ ${node.descUrdu}`
      : `${node.titleEn} partner. ${node.descEn}`;
    speechService.speak(textToSpeak, { lang: isUrdu ? 'ur' : 'en' });
  };

  // Video Upload Handler
  const handleVideoUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 800 * 1024 * 1024) {
      alert(isUrdu ? 'فائل کا سائز 800MB سے زیادہ نہیں ہونا چاہیے' : 'Video file size must be under 800MB');
      return;
    }

    try {
      await saveBriefingVideo(file, file.name);
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setUploadedVideoName(file.name);
      setCinemaMode('custom_video');
      setIsVideoPlaying(false);
      setShowToast(isUrdu ? 'ویڈیو کامیابی کے ساتھ لوڈ ہو گئی ہے — چلانے کے لیے ▶ دبائیں' : 'Video loaded for this session — press ▶ to play.');
      setTimeout(() => setShowToast(null), 4000);
    } catch (e) {
      console.error('Error saving video to IndexedDB:', e);
    }
  };

  // Video Player Controls
  const togglePlayVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
      setVideoDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setVideoCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVideoVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!stageContainerRef.current) return;
    if (!document.fullscreenElement) {
      stageContainerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 26-Second Holographic Canvas Animation Film
  useEffect(() => {
    if (!isOpen || currentStep !== 3 || cinemaMode !== 'film') return;

    let frameId: number;
    const startTime = Date.now();
    const duration = 26000;

    const captions = [
      { at: 0, ur: 'کنیکٹڈ پاکستان: ڈیجیٹل گورننس کا نیا سورج', en: 'Connected Pakistan: The Dawn of Digital Statecraft' },
      { at: 4000, ur: 'خیبر سے کراچی، گلگت سے گوادر تک 30 اضلاع کا تحفظ', en: 'Protecting 30 Districts from Khyber to Karachi, Gilgit to Gwadar' },
      { at: 9000, ur: 'ریڑھی بان ہمارا باعزت شراکت دار ہے — زیرو بے دخلی', en: 'Street Vendors Are Dignified Partners — Zero Evictions' },
      { at: 15000, ur: 'شہریوں کو سرکاری نرخوں کا مکمل اختیار اور گمنام رپورٹنگ', en: 'Citizens Empowered with Verified DC Rates & Anonymous Voice' },
      { at: 20000, ur: 'پاکستان زندہ باد • خود مختار معیشت، باوقار روزگار • VRF 2026', en: 'Pakistan Zindabad • Sovereign Economy, Dignified Livelihoods • VRF 2026' }
    ];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const elapsed = (Date.now() - startTime) % duration;
      const progress = (elapsed / duration) * 100;
      setFilmProgress(Math.floor(progress));

      const activeCaption = captions.slice().reverse().find(c => elapsed >= c.at);
      if (activeCaption) {
        setFilmCaption(isUrdu ? activeCaption.ur : activeCaption.en);
      }

      ctx.fillStyle = '#031B13';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      ctx.strokeStyle = 'rgba(23, 138, 82, 0.15)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw central Pakistan Emblem Hologram
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const pulse = Math.sin(Date.now() / 300) * 10;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 75 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = '#E3A82B';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#E3A82B';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☪', cx, cy - 4);

      ctx.fillStyle = '#E3A82B';
      ctx.font = 'bold 15px Sora, sans-serif';
      ctx.fillText('VRF 2026', cx, cy + 34);

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, currentStep, cinemaMode, isUrdu]);

  if (!isOpen) return null;

  // Render Inner Content
  const tourContent = (
    <div className="w-full max-w-5xl mx-auto flex flex-col justify-between h-full space-y-4">
      {/* Top Bar: Title, Stepper, Skip & Logout */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40 gap-3">
        {/* Left: Platform Tour Label */}
        <div className="flex items-center gap-2">
          <span className="text-xl text-[#E3A82B]">☪</span>
          <div>
            <h2 className="font-sora font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
              <span>Platform Tour</span>
              <span className="text-emerald-400 font-urdu text-xs font-semibold">پلیٹ فارم کا تعارف</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Connected Pakistan • VRF 2026
            </p>
          </div>
        </div>

        {/* Center: 3-Step Dot Indicators matching Video */}
        <div className="flex items-center gap-2 bg-[#04231A] px-3 py-1.5 rounded-full border border-emerald-700/50">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentStep === 1
                ? 'w-7 h-2.5 bg-[#E3A82B] shadow-[0_0_10px_#E3A82B]'
                : 'w-2.5 h-2.5 bg-emerald-950/80 border border-emerald-600/60 hover:bg-emerald-700'
            }`}
            title="Step 1: Ecosystem Mind Map"
          />
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentStep === 2
                ? 'w-7 h-2.5 bg-[#E3A82B] shadow-[0_0_10px_#E3A82B]'
                : 'w-2.5 h-2.5 bg-emerald-950/80 border border-emerald-600/60 hover:bg-emerald-700'
            }`}
            title="Step 2: Geospatial Radar"
          />
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentStep === 3
                ? 'w-7 h-2.5 bg-[#E3A82B] shadow-[0_0_10px_#E3A82B]'
                : 'w-2.5 h-2.5 bg-emerald-950/80 border border-emerald-600/60 hover:bg-emerald-700'
            }`}
            title="Step 3: Briefing Cinema"
          />
        </div>

        {/* Right: Skip to Console & Logout */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-[#0B4A31] hover:bg-[#178A52] text-white text-xs font-bold transition-all border border-emerald-600/40 flex items-center gap-1.5 cursor-pointer shadow"
          >
            <span>Skip to Console</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E3A82B]" />
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout ⎋</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= STEP 1: ECOSYSTEM MIND MAP ================= */}
      {currentStep === 1 && (
        <div className="flex-1 flex flex-col justify-between animate-fadeIn space-y-4">
          {/* Header Content matching Video 0:00 */}
          <div className="text-center space-y-1 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-widest uppercase block">
              STEP 1 OF 3 • Ecosystem Mind Map
            </span>
            <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              How Connected Pakistan thinks
            </h1>
            <p className="text-sm sm:text-base font-urdu text-[#E3A82B] font-semibold">
              پورا نظام ایک نظر میں - ہر شراکت دار، ایک روشن خیال
            </p>
            <p className="text-xs text-slate-300 leading-normal max-w-lg mx-auto">
              Tap any node to hear and read how each partner connects. Icons speak for every citizen — literate or not.
            </p>
          </div>

          {/* Radial Constellation Stage matching Video 0:05 */}
          <div className="relative rounded-3xl bg-[#031B13] border border-emerald-600/30 p-4 sm:p-6 shadow-2xl overflow-hidden my-auto min-h-[360px] flex items-center justify-center">
            {/* Background connecting lines canvas effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#178A52_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Central VRF 2026 Core Emblem */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0B4A31] border-2 border-[#E3A82B] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(227,168,43,0.5)] p-2">
                <span className="text-2xl text-white">☪</span>
                <span className="font-sora font-black text-xs text-[#E3A82B] tracking-wider mt-0.5">VRF 2026</span>
                <span className="text-[9px] text-emerald-200 font-urdu leading-tight mt-0.5">ریاست و شراکت دار</span>
              </div>
            </div>

            {/* 6 Partner Nodes positioned in radial hexagon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {mindNodes.map((node, index) => {
                const angle = (index * 60 - 90) * (Math.PI / 180);
                // Radius responsive to screen
                const radius = 135;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isSelected = selectedMindNode === index;
                const IconComponent = node.icon;

                return (
                  <button
                    key={node.titleEn}
                    type="button"
                    onClick={() => handleSelectMindNode(index)}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className={`pointer-events-auto absolute flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-[#178A52] border-[#E3A82B] shadow-[0_0_20px_rgba(227,168,43,0.6)] scale-110 z-20 text-white'
                        : 'bg-[#04231A] border-emerald-700/60 hover:border-[#E3A82B] text-slate-300 hover:text-white z-10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#031B13] flex items-center justify-center text-[#E3A82B]">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="text-left pr-1">
                      <div className="text-xs font-bold font-sora flex items-center gap-1">
                        <span>{node.titleEn}</span>
                        <span className="text-[10px] font-urdu text-[#E3A82B]">({node.titleUrdu})</span>
                      </div>
                      <span className="text-[9px] text-slate-400 block max-w-[90px] truncate">{node.subtitleEn}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Node Detailed Info Card matching Video 0:15 */}
          {selectedMindNode !== null && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#04231A] border border-[#E3A82B]/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#178A52] text-white flex items-center justify-center shrink-0 border border-emerald-400">
                  {React.createElement(mindNodes[selectedMindNode].icon, { className: 'w-5 h-5 text-[#E3A82B]' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white font-sora">
                      {mindNodes[selectedMindNode].titleEn}
                    </h4>
                    <span className="text-xs text-[#E3A82B] font-urdu font-bold">
                      {mindNodes[selectedMindNode].titleUrdu}
                    </span>
                    <span className="text-[10px] bg-[#031B13] text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full">
                      {mindNodes[selectedMindNode].subtitleEn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-urdu leading-relaxed mt-0.5">
                    {mindNodes[selectedMindNode].descUrdu}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const node = mindNodes[selectedMindNode];
                    speechService.speak(isUrdu ? `${node.titleUrdu}۔ ${node.descUrdu}` : `${node.titleEn}. ${node.descEn}`, { lang: isUrdu ? 'ur' : 'en' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#031B13] hover:bg-[#0B4A31] border border-emerald-700 text-xs text-[#E3A82B] flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'آواز سنیں' : 'Listen'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Next Button matching Video 0:25 */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-12 py-3.5 rounded-full bg-gradient-to-r from-[#E3A82B] via-[#F4D58D] to-[#E3A82B] text-[#04231A] font-sora font-extrabold text-sm shadow-[0_0_25px_rgba(227,168,43,0.4)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <span>Next: Live Map of Pakistan →</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: GEOSPATIAL RADAR ================= */}
      {currentStep === 2 && (
        <div className="flex-1 flex flex-col justify-between animate-fadeIn space-y-4">
          {/* Header Content matching Video 0:26 */}
          <div className="text-center space-y-1 max-w-3xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-widest uppercase block">
              STEP 2 OF 3 • GEOSPATIAL RADAR
            </span>
            <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              The complete nation — live on the map
            </h1>
            <p className="text-sm sm:text-base font-urdu text-[#E3A82B] font-semibold">
              مکمل قومی نقشہ - گلگت بلتستان اور آزاد کشمیر سمیت
            </p>
            <p className="text-xs text-slate-300 leading-normal max-w-xl mx-auto">
              Type any place name — the map flies you there with high-accuracy pin + accuracy ring • full Pakistan incl. GB & AJK • live ops, Google Maps & real street view
            </p>
          </div>

          {/* Full Interactive Geospatial Map */}
          <GeospatialTourMap lang={lang} onOpenLocate={onOpenLocate} />

          {/* Bottom Navigation Buttons matching Video 0:44 */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 rounded-full bg-[#0B4A31] hover:bg-[#178A52] text-[#DCEFE4] font-bold text-sm transition-all cursor-pointer"
            >
              ← Mind Map
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-12 py-3.5 rounded-full bg-gradient-to-r from-[#E3A82B] via-[#F4D58D] to-[#E3A82B] text-[#04231A] font-sora font-extrabold text-sm shadow-[0_0_25px_rgba(227,168,43,0.4)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <span>Next: Briefing Cinema →</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: BRIEFING CINEMA ================= */}
      {currentStep === 3 && (
        <div className="flex-1 flex flex-col justify-between animate-fadeIn space-y-4">
          {/* Header Content matching Video 0:45 */}
          <div className="text-center space-y-1 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-widest uppercase block">
              STEP 3 OF 3 • Sovereign Vision Cinema & Briefing
            </span>
            <h1 className="font-sora font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              The Connected Pakistan 2026 Dawn
            </h1>
            <p className="text-sm sm:text-base font-urdu text-[#E3A82B] font-semibold">
              بریفنگ سنیما اور ہولوگرافک پیشکش • وژن: فخر مشتاق
            </p>
          </div>

          {/* Cinema Stage */}
          <div className="rounded-3xl bg-[#031B13] border border-emerald-600/30 p-4 sm:p-6 shadow-2xl space-y-3 my-auto">
            {/* Top Cinema Sub-tabs */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCinemaMode('custom_video')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    cinemaMode === 'custom_video' ? 'bg-[#178A52] text-white shadow' : 'bg-[#04231A] text-slate-300'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>Briefing Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCinemaMode('film')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    cinemaMode === 'film' ? 'bg-[#178A52] text-white shadow' : 'bg-[#04231A] text-slate-300'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>26s Holographic Film</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCinemaMode('case_study')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    cinemaMode === 'case_study' ? 'bg-[#178A52] text-white shadow' : 'bg-[#04231A] text-slate-300'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>Market Ground Case Study</span>
                </button>
              </div>

              {/* Upload Video Trigger */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVideoUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-[#E3A82B] text-[#04231A] font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow hover:bg-amber-400 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video (Max 800MB)</span>
                </button>
              </div>
            </div>

            {/* Video Stage Frame */}
            <div
              ref={stageContainerRef}
              className="w-full h-72 sm:h-84 bg-black rounded-2xl border border-emerald-600/50 relative overflow-hidden flex items-center justify-center shadow-inner"
            >
              {cinemaMode === 'custom_video' ? (
                uploadedVideoUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center group bg-black">
                    <video
                      ref={videoRef}
                      src={uploadedVideoUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsVideoPlaying(false)}
                      className="w-full h-full object-contain"
                    />

                    {/* Big Center Play Overlay Button */}
                    {!isVideoPlaying && (
                      <button
                        type="button"
                        onClick={togglePlayVideo}
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#E3A82B] text-[#04231A] flex items-center justify-center shadow-[0_0_30px_rgba(227,168,43,0.7)] hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
                      >
                        <Play className="w-8 h-8 fill-current ml-1" />
                      </button>
                    )}

                    {/* Toast Notification */}
                    {showToast && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#04231A]/90 border border-emerald-500 text-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl animate-fadeIn z-30">
                        {showToast}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Exact Empty State matching Video 0:45 */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer text-center p-8 w-full h-full flex flex-col items-center justify-center bg-[#04231A]/80 border-2 border-dashed border-emerald-600/60 rounded-2xl hover:border-[#E3A82B] transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#0B4A31] border border-emerald-500 flex items-center justify-center text-[#E3A82B] mb-3 shadow-lg">
                      <Video className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-base text-white font-sora">
                      No briefing video yet
                    </h4>
                    <p className="text-xs font-urdu text-[#E3A82B] mt-1 max-w-md">
                      ابھی کوئی بریفنگ ویڈیو دستیاب نہیں ہے۔ یہاں کلک کریں اور اپنا بریفنگ ویڈیو فائل اپ لوڈ کریں
                    </p>
                    <button
                      type="button"
                      className="mt-4 px-6 py-2.5 rounded-xl bg-[#E3A82B] text-[#04231A] font-extrabold text-xs shadow-lg hover:bg-amber-400 flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Briefing Video</span>
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2">
                      mp4 / webm / mkv / mov — plays with ⏯, 🔊, ⛶ controls after upload. Or switch to the 🏛 Holographic Film.
                    </p>
                  </div>
                )
              ) : cinemaMode === 'film' ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={420}
                    className="w-full h-full object-contain"
                  />
                  {/* Subtitle Caption Overlay */}
                  <div className="absolute bottom-6 left-4 right-4 text-center pointer-events-none">
                    <span className="bg-[#04231A]/90 text-[#E3A82B] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold font-urdu border border-[#E3A82B]/50 shadow-lg inline-block max-w-xl">
                      {filmCaption}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#04231A]">
                    <div
                      className="h-full bg-[#E3A82B] transition-all"
                      style={{ width: `${filmProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full overflow-y-auto p-4 flex items-center justify-center bg-[#04231A]">
                  <div className="w-full max-w-2xl">
                    <MarketHeroArtwork showBadge={false} />
                  </div>
                </div>
              )}
            </div>

            {/* Video Player Control Bar matching Video 0:52 */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#04231A] border border-emerald-800/40 text-xs gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlayVideo}
                  className="p-2 rounded-xl bg-[#178A52] text-white hover:bg-emerald-600 cursor-pointer"
                >
                  {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <span className="font-mono text-[#E3A82B] font-bold text-xs">
                  {cinemaMode === 'custom_video'
                    ? `${formatTime(videoCurrentTime)} / ${formatTime(videoDuration || 291)}`
                    : `${filmProgress}% Complete`}
                </span>
              </div>

              {/* Scrubber Progress Slider */}
              {cinemaMode === 'custom_video' && uploadedVideoUrl && (
                <div className="flex-1 max-w-md mx-2">
                  <input
                    type="range"
                    min={0}
                    max={videoDuration || 100}
                    value={videoCurrentTime}
                    onChange={handleSeek}
                    className="w-full accent-[#E3A82B] cursor-pointer"
                  />
                </div>
              )}

              {/* Volume & Fullscreen */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-xl bg-[#031B13] text-white hover:bg-emerald-800 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#E3A82B]" />}
                </button>

                {uploadedVideoUrl && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-xl bg-[#031B13] hover:bg-[#0B4A31] border border-emerald-700 text-slate-300 text-[11px] font-semibold cursor-pointer"
                  >
                    Change Video
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-xl bg-[#031B13] text-white hover:bg-emerald-800 cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Buttons matching Video 0:58 */}
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-full bg-[#0B4A31] hover:bg-[#178A52] text-[#DCEFE4] font-bold text-sm transition-all cursor-pointer"
            >
              ← Map
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-12 py-3.5 rounded-full bg-gradient-to-r from-[#E3A82B] via-[#F4D58D] to-[#E3A82B] text-[#04231A] font-sora font-black text-sm sm:text-base shadow-[0_0_25px_rgba(227,168,43,0.6)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <span>🇵🇰 Enter the Platform</span>
              <span className="text-base font-extrabold">»</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen w-full bg-[#031B13] text-[#FCFAF3] p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-x-hidden">
        {tourContent}
        {/* Executive Footer */}
        <footer className="mt-6 border-t border-[#178A52]/30 py-4 text-center text-xs text-emerald-200/80">
          <p className="font-semibold text-white">
            Connected Pakistan • <span className="text-amber-400 font-bold">VRF Act 2026</span>
          </p>
          <p className="text-[11px] text-emerald-300/60 font-urdu mt-0.5">
            پاکستان زندہ باد • خود مختار معیشت، باوقار روزگار
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#031B13]/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#031B13] border-2 border-[#E3A82B] rounded-3xl w-full max-w-5xl p-4 sm:p-6 shadow-2xl relative my-auto">
        {tourContent}
      </div>
    </div>
  );
};
