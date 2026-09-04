import React, { useState } from 'react';
import { 
  Shield, QrCode, MapPin, AlertTriangle, CheckCircle, 
  FileText, Camera, Printer, Check, Crosshair, Navigation, 
  Sparkles, RefreshCw, AlertCircle, Eye, Search, Filter,
  ArrowRight, UserCheck, CheckCircle2, MessageSquare
} from 'lucide-react';
import { Language, DCRateItem, Citation, FieldTask, ZoneItem, VendorProfile, CitizenReport } from '../types';
import { speechService } from '../lib/audio';
import { QRScannerModal } from './QRScannerModal';
import { VendorVerifiedProfileModal } from './VendorVerifiedProfileModal';

interface InspectorViewProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  dcRates: DCRateItem[];
  citations: Citation[];
  fieldTasks: FieldTask[];
  zones: ZoneItem[];
  vendors: VendorProfile[];
  reports?: CitizenReport[];
  onInspectorActionOnReport?: (
    reportId: string,
    action: 'warning' | 'penalty' | 'coaching_advisory' | 'verified_compliant',
    notes: string
  ) => void;
  onResolveReport?: (reportId: string, notes?: string) => void;
  onIssueCitation: (citation: Omit<Citation, 'id' | 'timestamp'>) => void;
  onCompleteTask: (taskId: string) => void;
  onOpenAIGuide: () => void;
  onOpenCitySlotsMap?: (slotId?: string) => void;
  onOpenVendorAllotment?: (vendorId?: string) => void;
}

export const InspectorView: React.FC<InspectorViewProps> = ({
  activeTab,
  onSelectTab,
  lang,
  dcRates = [],
  citations = [],
  fieldTasks = [],
  zones = [],
  vendors = [],
  reports = [],
  onInspectorActionOnReport,
  onResolveReport,
  onIssueCitation,
  onCompleteTask,
  onOpenAIGuide,
  onOpenCitySlotsMap,
  onOpenVendorAllotment,
}) => {
  const isUrdu = lang === 'ur';

  // QR Scanning & Vendor Profile Inspection State
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [inspectedVendor, setInspectedVendor] = useState<VendorProfile | null>(null);

  // Cases Filter & Action Modal State
  const [caseFilter, setCaseFilter] = useState<'all' | 'priority' | 'dispatched' | 'responded' | 'resolved'>('all');
  const [caseSearch, setCaseSearch] = useState('');
  const [selectedCaseForAction, setSelectedCaseForAction] = useState<CitizenReport | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  // State for AI Scanner & ±3% Tolerance Calculation
  const [selectedRateId, setSelectedRateId] = useState<string>(dcRates[0]?.id || 'rate-1');
  const [scannedPrice, setScannedPrice] = useState<number>(dcRates[0]?.dcRate || 1480);
  const [scannedVendorName, setScannedVendorName] = useState('فرحان سبزی و فروٹ اسٹال');
  const [scannedSlot, setScannedSlot] = useState('سلاٹ 19');
  const [scannerPhoto, setScannerPhoto] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    status: 'pass' | 'violation';
    variancePct: number;
    officialRate: number;
    toleranceHigh: number;
  } | null>(null);

  // Active Selected Citation for Print Modal
  const [activePrintCitation, setActivePrintCitation] = useState<Citation | null>(null);

  const currentRateItem = dcRates.find(r => r.id === selectedRateId) || dcRates[0] || {
    id: 'rate-1',
    nameUrdu: 'آٹا 10 کلو تھیلا',
    nameEn: 'Flour (Atta) 10kg Bag',
    categoryUrdu: 'غلہ و اناج',
    categoryEn: 'Flour & Grains',
    dcRate: 1480,
    marketAvg: 1520,
    unitUrdu: '10 کلو بیگ',
    unitEn: '10kg Bag',
    lastUpdated: '10 Mins ago',
    deviationPct: 2.7,
  };

  const handleScanCommodity = (e: React.FormEvent) => {
    e.preventDefault();
    const officialRate = currentRateItem.dcRate;
    const toleranceHigh = officialRate * 1.03; // ±3%
    const variancePct = ((scannedPrice - officialRate) / officialRate) * 100;

    if (scannedPrice <= toleranceHigh) {
      speechService.playChime('scan');
      setScanResult({
        status: 'pass',
        variancePct: +variancePct.toFixed(1),
        officialRate,
        toleranceHigh: +toleranceHigh.toFixed(1),
      });
    } else {
      speechService.playChime('alert');
      setScanResult({
        status: 'violation',
        variancePct: +variancePct.toFixed(1),
        officialRate,
        toleranceHigh: +toleranceHigh.toFixed(1),
      });
    }
  };

  const handleIssueCitationFromScan = () => {
    if (!scanResult || scanResult.status !== 'violation') return;

    const fineAmount = Math.max(1000, Math.round(scanResult.variancePct * 150));
    const challanId = `CH-26-${Math.floor(1000 + Math.random() * 9000)}`;

    onIssueCitation({
      vendorName: scannedVendorName,
      slotNumber: scannedSlot,
      marketName: 'راجہ بازار زون اے، راولپنڈی',
      inspectorName: 'مظہر اقبال (PERA-884)',
      item: currentRateItem.nameUrdu,
      officialRate: currentRateItem.dcRate,
      chargedPrice: scannedPrice,
      variancePct: scanResult.variancePct,
      fineAmount,
      status: 'pending',
      evidencePhoto: scannerPhoto || undefined,
      coachingGiven: true,
      gpsLocation: '33.59°N, 73.05°E',
    });

    // Web Speech API Voice Confirmation in Urdu / English
    speechService.confirmChallanIssued(lang, challanId, scannedVendorName, fineAmount);

    setScanResult(null);
    onSelectTab('inspector_citations');
  };

  const handleStartInspectionForReport = (report: CitizenReport) => {
    // Find matching DC rate
    const matchedRate = dcRates.find(r => 
      r.nameUrdu.includes(report.item) || 
      r.nameEn.toLowerCase().includes(report.item.toLowerCase()) ||
      report.item.includes(r.nameUrdu)
    );
    if (matchedRate) {
      setSelectedRateId(matchedRate.id);
    }
    setScannedPrice(report.chargedPrice);
    setScannedVendorName(report.vendorName);
    setScannedSlot(report.location);
    onSelectTab('scanner');
  };

  const handleTakeActionOnReport = (
    reportId: string, 
    action: 'warning' | 'penalty' | 'coaching_advisory' | 'verified_compliant',
    notes: string
  ) => {
    if (onInspectorActionOnReport) {
      onInspectorActionOnReport(reportId, action, notes);
    }
    setSelectedCaseForAction(null);
    setActionNotes('');
  };

  // Count pending or dispatched cases needing inspector action
  const pendingCasesCount = reports.filter(r => r.status !== 'resolved').length;

  // Sub-tabs list for quick intra-view navigation
  const inspectorTabs = [
    { id: 'duty', labelUrdu: 'ڈیوٹی ڈیش بورڈ', labelEn: 'Duty Home', icon: Shield },
    { id: 'cases', labelUrdu: 'شہری شکایات و تفتیش', labelEn: 'Citizen Cases', icon: AlertTriangle, badge: pendingCasesCount },
    { id: 'scanner', labelUrdu: '±3% اے آئی اسکینر', labelEn: 'AI Scanner', icon: QrCode },
    { id: 'radar', labelUrdu: 'جیو فینس ریڈار', labelEn: 'Geofence Radar', icon: Crosshair },
    { id: 'citations', labelUrdu: 'چالان ریکارڈ', labelEn: 'Citations Log', icon: FileText },
    { id: 'route', labelUrdu: 'فیلڈ پیٹرول روٹ', labelEn: 'Field Route', icon: Navigation },
  ];

  const isCasesTab = activeTab === 'cases' || activeTab === 'inspector_cases';
  const isScannerTab = activeTab === 'scanner' || activeTab === 'inspector_scanner';
  const isRadarTab = activeTab === 'radar' || activeTab === 'geofence' || activeTab === 'inspector_radar' || activeTab === 'inspector_geofence';
  const isCitationsTab = activeTab === 'citations' || activeTab === 'inspector_citations';
  const isRouteTab = activeTab === 'route' || activeTab === 'inspector_route';
  const isDutyTab = activeTab === 'duty' || activeTab === 'dashboard' || activeTab === 'inspector_duty' || activeTab === 'overview' || (!isCasesTab && !isScannerTab && !isRadarTab && !isCitationsTab && !isRouteTab);

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Executive Sub-Tab Navigation Bar for Inspector */}
      <div className="bg-[#04231A] p-2 rounded-2xl border border-[#3D7EA6]/40 shadow-lg overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {inspectorTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              (tab.id === 'duty' && isDutyTab) ||
              (tab.id === 'cases' && isCasesTab) ||
              (tab.id === 'scanner' && isScannerTab) ||
              (tab.id === 'radar' && isRadarTab) ||
              (tab.id === 'citations' && isCitationsTab) ||
              (tab.id === 'route' && isRouteTab);

            return (
              <button
                key={tab.id}
                id={`inspector-subtab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#3D7EA6] text-white shadow-md border border-[#E3A82B]/60'
                    : 'text-[#DCEFE4]/80 hover:text-white hover:bg-[#0B4A31]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E3A82B]' : 'text-[#3D7EA6]'}`} />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? tab.labelUrdu : tab.labelEn}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#E3A82B] text-black text-[10px] font-black leading-none">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 1. DUTY HOME ================= */}
      {isDutyTab && (
        <div className="space-y-6">
          {/* Duty Banner Hero */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#3D7EA6] shadow-2xl text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#3D7EA6] text-white px-3 py-1 rounded-full text-xs font-bold mb-3 shadow">
                  <Shield className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>{isUrdu ? 'پیرہ فیلڈ مجسٹریٹ کنسول' : 'PERA Field Enforcement Active'}</span>
                </div>

                <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
                  {isUrdu ? 'ڈیوٹی زون: راولپنڈی سیکٹر ۴' : 'Duty Zone: Rawalpindi Sector 4'}
                </h2>
                <p className="text-sm text-[#DCEFE4] font-urdu max-w-xl mt-1">
                  پیرہ فیلڈ اسکواڈ: انسپکٹر مظہر اقبال • فیلڈ اسٹیٹس: آن ڈیوٹی (9 منٹ ریپڈ رسپانس)
                </p>
              </div>

              {/* Duty Shift Summary Ring */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3.5 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'تعمیل ریٹ' : 'Compliance'}</span>
                  <span className="font-sora font-extrabold text-2xl text-[#E3A82B]">94.2%</span>
                  <span className="text-[10px] text-[#178A52] block font-bold">In Target</span>
                </div>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3.5 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'آج کے اسکینز' : 'Scans Today'}</span>
                  <span className="font-sora font-extrabold text-2xl text-white">48</span>
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">4 Violations</span>
                </div>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3.5 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'پیٹرول راستے' : 'Route Tasks'}</span>
                  <span className="font-sora font-extrabold text-2xl text-[#3D7EA6]">3 / 5</span>
                  <span className="text-[10px] text-white block font-bold">Completed</span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="mt-6 pt-6 border-t border-[#178A52]/40 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectTab('scanner')}
                className="bg-[#3D7EA6] hover:bg-[#3D7EA6]/80 text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95"
              >
                <QrCode className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? '±3% رعایت اے آئی اسکینر کھولیں' : 'Open ±3% AI Scanner'}</span>
              </button>

              <button
                onClick={() => onSelectTab('radar')}
                className="bg-[#178A52] hover:bg-[#178A52]/80 text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95"
              >
                <Crosshair className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'جیو فینس ریڈار و دکاندار میپ' : 'Geofence Radar'}</span>
              </button>

              <button
                onClick={() => onSelectTab('route')}
                className="bg-[#04231A] hover:bg-[#0B4A31] text-[#FCFAF3] border border-[#178A52] text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2"
              >
                <Navigation className="w-4 h-4 text-[#3D7EA6]" />
                <span>{isUrdu ? 'فیلڈ پیٹرول روٹ' : 'Field Route Tasks'}</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenVendorAllotment) {
                    onOpenVendorAllotment('VRF-RWP-SLOT-19');
                  } else if (onOpenCitySlotsMap) {
                    onOpenCitySlotsMap();
                  }
                }}
                className="bg-[#0B4A31] hover:bg-[#178A52] text-[#E3A82B] border border-[#E3A82B] text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-transform active:scale-95"
              >
                <MapPin className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'وینڈر الاٹمنٹ و حدود تصدیق (Maps Allotment)' : 'Maps Allotment & Pitch Radar'}</span>
              </button>
            </div>
          </div>

          {/* Emergency Alert Banner */}
          <div className="bg-[#B03A2E]/15 border-2 border-[#B03A2E] rounded-3xl p-5 text-[#132A21] flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#B03A2E] text-white flex items-center justify-center font-bold animate-pulse">
                🚨
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#B03A2E]">
                  {isUrdu ? 'شہری الرٹ: راجہ بازار زون اے میں گراں فروشی کی اطلاع' : 'High Priority Citizen Alert: Raja Bazaar Zone A'}
                </h4>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  شہری نے پیاز 120 روپے وصول کرنے کی رپورٹ دی ہے۔ اوسط وقت 9 منٹ کے اندر معائنہ مکمل کریں۔
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('cases')}
                className="bg-[#04231A] hover:bg-[#0B4A31] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#E3A82B]" />
                <span>{isUrdu ? 'تمام شکایات دیکھیں' : 'View All Cases'}</span>
              </button>
              <button
                onClick={() => onSelectTab('scanner')}
                className="bg-[#B03A2E] hover:bg-[#B03A2E]/90 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow"
              >
                {isUrdu ? 'فوری کارروائی کریں' : 'Dispatch Now'}
              </button>
            </div>
          </div>

          {/* Assigned Citizen Cases Preview (VRF Closed Loop) */}
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#3D7EA6] text-white flex items-center justify-center font-bold text-xs">
                  <Shield className="w-4 h-4 text-[#E3A82B]" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-sm text-[#04231A]">
                    {isUrdu ? 'شہری شکایات و انٹیلی جنس فیڈ' : 'Assigned Citizen Complaints & Intel Feed'}
                  </h3>
                  <p className="text-[11px] text-[#5C6F63] font-urdu">
                    {isUrdu ? 'اے آئی کے ذریعے ترجیح شدہ کیسز برائے فیلڈ تصدیق' : 'AI-Prioritized cases assigned for on-ground verification'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectTab('cases')}
                className="text-xs font-bold text-[#178A52] hover:text-[#04231A] flex items-center gap-1"
              >
                <span>{isUrdu ? 'تفصیلی کنسول کھولیں' : 'Open Full Cases Hub'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reports.slice(0, 2).map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl bg-white border border-[#178A52]/15 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#3D7EA6] bg-[#3D7EA6]/10 px-2 py-0.5 rounded-md">
                      {rep.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.priority === 'critical' || rep.priority === 'high'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {rep.priority?.toUpperCase() || 'HIGH'} PRIORITY
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-[#04231A]">
                      <span>{rep.item}</span>
                      <span className="text-rose-600">Rs. {rep.chargedPrice} (DC: Rs. {rep.officialRate})</span>
                    </div>
                    <div className="text-[11px] text-[#5C6F63]">
                      📍 {rep.location} • {rep.vendorName}
                    </div>
                    {rep.aiRecommendedAction && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-[10px] text-amber-900 font-urdu">
                        🤖 <span className="font-bold">تجویز:</span> {rep.aiRecommendedAction}
                      </div>
                    )}
                    {rep.vendorResponse && (
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/60 text-[10px] text-blue-900 font-urdu">
                        🏪 <span className="font-bold">دکاندار کا موقف:</span> {rep.vendorResponse}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleStartInspectionForReport(rep)}
                      className="flex-1 bg-[#3D7EA6] hover:bg-[#3D7EA6]/90 text-white py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#E3A82B]" />
                      <span>{isUrdu ? 'اسکین کریں' : 'Scan Item'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCaseForAction(rep);
                        setActionNotes('');
                      }}
                      className="flex-1 bg-[#04231A] hover:bg-[#0B4A31] text-white py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#E3A82B]" />
                      <span>{isUrdu ? 'کارروائی / حل' : 'Take Action'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. ±3% AI TOLERANCE SCANNER ================= */}
      {isScannerTab && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 border border-[#178A52]/20 shadow-xl text-[#132A21]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#3D7EA6] text-white flex items-center justify-center shadow">
                  <QrCode className="w-6 h-6 text-[#E3A82B]" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                    {isUrdu ? '±3% قانونی رعایت اے آئی اسکینر' : '±3% Legal Tolerance AI Scanner'}
                  </h3>
                  <p className="text-xs text-[#5C6F63] font-urdu">
                    سرکاری ڈی سی نرخ پر 3% تک کی قدرتی کمی بیشی قانونی طور پر جائز ہے۔
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQRScanner(true)}
                className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
              >
                <QrCode className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'اسٹال کیو آر اسکین کریں' : 'Scan Stall QR'}</span>
              </button>
            </div>

            <form onSubmit={handleScanCommodity} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#04231A] block mb-1">
                  {isUrdu ? 'شے / آئٹم منتخب کریں' : 'Select Commodity Item'}
                </label>
                <select
                  value={selectedRateId}
                  onChange={(e) => {
                    setSelectedRateId(e.target.value);
                    const item = dcRates.find(r => r.id === e.target.value);
                    if (item) setScannedPrice(item.dcRate);
                    setScanResult(null);
                  }}
                  className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs text-[#132A21] focus:outline-none focus:border-[#3D7EA6]"
                >
                  {dcRates.map((rate) => (
                    <option key={rate.id} value={rate.id}>
                      {isUrdu ? `${rate.nameUrdu} (DC: Rs. ${rate.dcRate})` : `${rate.nameEn} (DC: Rs. ${rate.dcRate})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#04231A] block mb-1">
                    {isUrdu ? 'دکاندار / اسٹال کا نام' : 'Vendor / Stall Name'}
                  </label>
                  <input
                    type="text"
                    value={scannedVendorName}
                    onChange={(e) => setScannedVendorName(e.target.value)}
                    required
                    className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs text-[#132A21] focus:outline-none focus:border-[#3D7EA6]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#04231A] block mb-1">
                    {isUrdu ? 'کیو آر سلاٹ نمبر' : 'QR Slot Number'}
                  </label>
                  <input
                    type="text"
                    value={scannedSlot}
                    onChange={(e) => setScannedSlot(e.target.value)}
                    required
                    className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs text-[#132A21] focus:outline-none focus:border-[#3D7EA6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#F6F2E7] p-3.5 rounded-2xl border border-[#178A52]/20">
                <div>
                  <span className="text-[10px] font-bold text-[#178A52] block">
                    {isUrdu ? 'سرکاری ڈی سی نرخ' : 'Official DC Rate'}
                  </span>
                  <span className="font-sora font-extrabold text-lg text-[#178A52]">
                    Rs. {currentRateItem.dcRate}
                  </span>
                  <span className="text-[10px] text-[#5C6F63] block">
                    (Max Allowed +3%: Rs. {(currentRateItem.dcRate * 1.03).toFixed(1)})
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#04231A] block mb-1">
                    {isUrdu ? 'موقع پر لی جانے والی قیمت (Rs.)' : 'On-Site Charged Price (Rs.)'}
                  </label>
                  <input
                    type="number"
                    value={scannedPrice}
                    onChange={(e) => {
                      setScannedPrice(Number(e.target.value));
                      setScanResult(null);
                    }}
                    required
                    className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-sm font-bold text-[#04231A] focus:outline-none focus:border-[#3D7EA6]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#3D7EA6] hover:bg-[#3D7EA6]/90 text-white font-extrabold py-3 rounded-2xl text-sm shadow-xl transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                <Crosshair className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'قیمت کی تصدیق و اسکین کریں' : 'Verify ±3% Tolerance'}</span>
              </button>
            </form>

            {/* Scan Outcome Visual Card */}
            {scanResult && (
              <div className="mt-6 animate-fadeUp">
                {scanResult.status === 'pass' ? (
                  <div className="p-5 rounded-2xl bg-[#178A52] text-white flex items-start justify-between shadow-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-[#E3A82B] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-base font-urdu">
                          ✅ پاس: قیمت جائز قانونی حد (±3%) کے اندر ہے!
                        </h4>
                        <p className="text-xs text-white/90 font-urdu mt-1">
                          فرق: {scanResult.variancePct}% • دکاندار کو کوئی جرمانہ نہیں ہوگا۔ شکریہ و ستائش کی گئی۔
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-[#B03A2E] text-white space-y-3 shadow-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-[#F4D58D] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-base font-urdu">
                          🚨 خلاف ورزی: قیمت سرکاری حد سے {scanResult.variancePct}% زائد ہے!
                        </h4>
                        <p className="text-xs text-white/90 font-urdu mt-0.5">
                          سرکاری ریٹ: Rs. {scanResult.officialRate} | وصولی: Rs. {scannedPrice} | جرمانہ تخمینہ: Rs. {Math.max(1000, Math.round(scanResult.variancePct * 150))}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleIssueCitationFromScan}
                      className="w-full bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] font-extrabold py-2.5 rounded-xl text-xs shadow transition-transform active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{isUrdu ? 'ڈیجیٹل چالان جاری کریں اور رہنمائی دیں' : 'Issue Digital Evidentiary Citation'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 3. GEOFENCE RADAR ================= */}
      {isRadarTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A] flex items-center gap-2">
                  <Crosshair className="w-6 h-6 text-[#3D7EA6]" />
                  <span>{isUrdu ? 'جیو فینس ریڈار مانیٹرنگ (Geofence Radar)' : 'Zone Geofence Radar'}</span>
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  راجہ بازار سیکٹر ۴: تمام 30 دکانداروں کی لائیو لوکیشن اور کیو آر سلاٹ تعمیل
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onOpenCitySlotsMap) {
                      onOpenCitySlotsMap();
                    }
                  }}
                  className="bg-[#04231A] hover:bg-[#0B4A31] text-[#E3A82B] border border-[#E3A82B] text-xs font-extrabold px-3.5 py-1 rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'گوگل میپ پر مکمل زوم کریں (1-Click Map)' : '1-Click Google Map Radar'}</span>
                </button>

                <span className="text-xs bg-[#178A52] text-white font-bold px-3 py-1 rounded-full font-mono">
                  30 / 30 Vendors In Slot
                </span>
              </div>
            </div>

            {/* Simulated Zone Map Box */}
            <div className="bg-[#04231A] rounded-2xl p-6 border border-[#178A52] min-h-[300px] flex flex-col justify-between text-white relative overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-mono text-[#E3A82B] bg-[#0B4A31] px-3 py-1 rounded-xl">
                  📍 Boundary: 33.597°N - 73.054°E
                </span>
                <span className="text-xs bg-[#178A52] text-white px-2.5 py-0.5 rounded-full font-bold">
                  Zero Geofence Breach
                </span>
              </div>

              {/* Vendors Dots Matrix */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 my-6 z-10">
                {vendors.map((v) => (
                  <div
                    key={v.id}
                    className="p-2 bg-[#0B4A31] border border-[#178A52] rounded-xl text-center hover:border-[#E3A82B] transition-all cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#178A52] mx-auto block mb-1 animate-pulse" />
                    <span className="text-[10px] font-mono text-white block">{v.slotNumber}</span>
                    <span className="text-[9px] text-[#DCEFE4]/70 block truncate">{v.name}</span>
                  </div>
                ))}
              </div>

              <div className="text-center z-10">
                <p className="text-xs text-[#DCEFE4] font-urdu">
                  🎯 ریڈار 35 میٹر پریسیشن کے ساتھ تمام ریڑھی بانوں کی موجودگی کی خودکار تصدیق کر رہا ہے۔
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. CITATION LOG & PRINT CHALLAN ================= */}
      {isCitationsTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A] flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#B03A2E]" />
                  <span>{isUrdu ? 'ڈیجیٹل چالان ریکارڈ و پرنٹ (Citation Log)' : 'Digital Citation Log & Print'}</span>
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  تمام شواہد جی پی ایس اور تصویری ثبوت کے ساتھ کلاؤڈ ریکارڈ میں محفوظ ہیں۔
                </p>
              </div>
            </div>

            {/* Citations List */}
            <div className="space-y-3.5">
              {citations.map((cit) => (
                <div
                  key={cit.id}
                  className="p-4 rounded-2xl bg-white border border-[#178A52]/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-[#B03A2E] text-white px-2.5 py-0.5 rounded-full">
                        {cit.id}
                      </span>
                      <span className="text-xs text-[#5C6F63]">{cit.timestamp}</span>
                      <span className="text-[10px] bg-[#F6F2E7] text-[#04231A] font-bold px-2 py-0.5 rounded-full">
                        {cit.slotNumber}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-[#04231A] font-urdu mt-1">
                      {cit.vendorName} — {cit.item}
                    </h4>
                    <p className="text-xs text-[#5C6F63]">
                      سرکاری: Rs. {cit.officialRate} | وصولی: Rs. {cit.chargedPrice} (+{cit.variancePct}%) • جرمانہ: <strong className="text-[#B03A2E]">Rs. {cit.fineAmount}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setActivePrintCitation(cit)}
                    className="bg-[#04231A] hover:bg-[#0B4A31] text-[#FCFAF3] border border-[#178A52] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#E3A82B]" />
                    <span>{isUrdu ? 'چالان پرنٹ کریں' : 'Print Challan'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. FIELD ROUTE ================= */}
      {isRouteTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#3D7EA6] text-white flex items-center justify-center shadow">
                <Navigation className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'روزانہ فیلڈ پیٹرول روٹ (5 Checkpoints)' : 'Daily Patrol Route Schedule'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  ہر چیک پوائنٹ پر پہنچ کر تصدیق کریں تاکہ سینٹرل کمانڈ کو ریئل ٹائم اپ ڈیٹ ملے۔
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {fieldTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-[#DCEFE4]/40 border-[#178A52]/40 text-[#0B4A31]'
                      : 'bg-white border-[#178A52]/20 text-[#132A21]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const willBeCompleted = !task.completed;
                        onCompleteTask(task.id);
                        speechService.confirmTaskCompletion(
                          lang,
                          isUrdu ? task.titleUrdu : task.titleEn,
                          willBeCompleted
                        );
                      }}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        task.completed ? 'bg-[#178A52] text-white shadow' : 'bg-[#F6F2E7] border border-[#178A52]/40 hover:bg-[#DCEFE4]'
                      }`}
                      title={isUrdu ? 'چیک پوائنٹ مکمل کریں' : 'Mark checkpoint done'}
                    >
                      {task.completed && <Check className="w-4 h-4" />}
                    </button>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm font-urdu">
                        {isUrdu ? task.titleUrdu : task.titleEn}
                      </h4>
                      <p className="text-[11px] text-[#5C6F63]">{task.zone}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    task.completed ? 'bg-[#178A52] text-white' : 'bg-[#F6F2E7] text-[#5C6F63]'
                  }`}>
                    {task.completed ? (isUrdu ? 'مکمل' : 'Done') : (isUrdu ? 'باقی' : 'Pending')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. CITIZEN CASES & DECISION SUPPORT HUB ================= */}
      {isCasesTab && (
        <div className="space-y-6">
          {/* Decision Support Banner */}
          <div className="rounded-3xl p-6 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#3D7EA6] shadow-2xl text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#3D7EA6] text-white flex items-center justify-center font-bold text-lg shadow shrink-0">
                  <Shield className="w-6 h-6 text-[#E3A82B]" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#178A52] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1">
                    <Sparkles className="w-3 h-3 text-[#E3A82B]" />
                    <span>VRF CLOSED-LOOP ENFORCEMENT</span>
                  </div>
                  <h2 className="font-sora font-extrabold text-xl sm:text-2xl text-white">
                    {isUrdu ? 'شہری شکایات و اے آئی فیصلہ ساز رہنمائی' : 'Citizen Complaints & Decision Support Hub'}
                  </h2>
                  <p className="text-xs text-[#DCEFE4] font-urdu mt-0.5">
                    {isUrdu ? 'شواہد پر مبنی شفاف کارروائی — ہر رپورٹ پر فیلڈ ٹیم 9 منٹ کے اندر معائنہ مکمل کرتی ہے' : 'Evidence-based objective verification with ±3% legal tolerance'}
                  </p>
                </div>
              </div>

              {/* Legal Mandate Pill */}
              <div className="bg-[#04231A]/90 border border-[#E3A82B]/60 px-3.5 py-2 rounded-2xl text-right shrink-0">
                <div className="text-[10px] text-[#E3A82B] font-mono font-bold tracking-wider">
                  DECISION SUPPORT POLICY
                </div>
                <div className="text-xs text-white font-mono font-semibold">
                  AI ASSISTS • RULES PROVIDE CONSISTENCY • HUMANS REMAIN ACCOUNTABLE
                </div>
              </div>
            </div>

            {/* Filter Chips & Search Bar */}
            <div className="mt-6 pt-6 border-t border-[#178A52]/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', labelUrdu: 'تمام کیسز', labelEn: 'All', count: reports.length },
                  { id: 'priority', labelUrdu: 'اہم / فوری', labelEn: 'High Priority', count: reports.filter(r => r.priority === 'critical' || r.priority === 'high').length },
                  { id: 'dispatched', labelUrdu: 'تفویض شدہ', labelEn: 'Dispatched', count: reports.filter(r => r.status === 'investigating' || r.status === 'dispatched' || r.status === 'verified').length },
                  { id: 'responded', labelUrdu: 'دکاندار موقف', labelEn: 'Vendor Responded', count: reports.filter(r => r.status === 'vendor_responded' || !!r.vendorResponse).length },
                  { id: 'resolved', labelUrdu: 'حل شدہ', labelEn: 'Resolved', count: reports.filter(r => r.status === 'resolved').length },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    onClick={() => setCaseFilter(flt.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      caseFilter === flt.id
                        ? 'bg-[#E3A82B] text-[#04231A] shadow-md'
                        : 'bg-[#04231A]/80 text-[#DCEFE4] hover:bg-[#0B4A31] border border-[#178A52]/60'
                    }`}
                  >
                    <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? flt.labelUrdu : flt.labelEn}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20">
                      {flt.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={caseSearch}
                  onChange={(e) => setCaseSearch(e.target.value)}
                  placeholder={isUrdu ? 'آئٹم، دکاندار یا کیس تلاش کریں...' : 'Search by item, stall, ID...'}
                  className="w-full bg-[#04231A]/90 border border-[#3D7EA6]/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#E3A82B]"
                />
              </div>
            </div>
          </div>

          {/* Cases Grid */}
          <div className="space-y-4">
            {reports
              .filter((r) => {
                const q = caseSearch.toLowerCase();
                const matchesSearch =
                  r.item.toLowerCase().includes(q) ||
                  r.vendorName.toLowerCase().includes(q) ||
                  r.location.toLowerCase().includes(q) ||
                  r.id.toLowerCase().includes(q);
                if (!matchesSearch) return false;
                if (caseFilter === 'priority') return r.priority === 'critical' || r.priority === 'high';
                if (caseFilter === 'dispatched') return r.status === 'investigating' || r.status === 'dispatched' || r.status === 'verified';
                if (caseFilter === 'responded') return r.status === 'vendor_responded' || !!r.vendorResponse;
                if (caseFilter === 'resolved') return r.status === 'resolved';
                return true;
              })
              .map((rep) => {
                const variance = ((rep.chargedPrice - rep.officialRate) / rep.officialRate) * 100;
                const isOverTolerance = variance > 3;

                return (
                  <div
                    key={rep.id}
                    className={`rounded-3xl p-6 border shadow-lg transition-all ${
                      rep.status === 'resolved'
                        ? 'bg-white/80 border-slate-200 opacity-90'
                        : rep.priority === 'critical' || rep.priority === 'high'
                        ? 'bg-[#FCFAF3] border-rose-300'
                        : 'bg-[#FCFAF3] border-[#178A52]/30'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow ${
                          rep.status === 'resolved'
                            ? 'bg-emerald-600'
                            : rep.priority === 'critical'
                            ? 'bg-rose-600'
                            : 'bg-[#3D7EA6]'
                        }`}>
                          {rep.status === 'resolved' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-[#E3A82B]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#04231A]">
                              {rep.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              rep.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rep.status === 'vendor_responded'
                                ? 'bg-blue-100 text-blue-800'
                                : rep.priority === 'critical' || rep.priority === 'high'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {rep.status?.replace('_', ' ') || 'DISPATCHED'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {rep.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-[#5C6F63] font-urdu">
                            مقام: <span className="font-bold text-[#04231A]">{rep.location}</span> • دکاندار: <span className="font-bold text-[#04231A]">{rep.vendorName}</span>
                          </p>
                        </div>
                      </div>

                      {/* Disparity Summary */}
                      <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-500 block">{isUrdu ? 'سرکاری ڈی سی ریٹ' : 'DC Rate'}</span>
                          <span className="font-mono font-bold text-sm text-slate-700">Rs. {rep.officialRate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">{isUrdu ? 'وصول کردہ قیمت' : 'Charged Price'}</span>
                          <span className={`font-mono font-bold text-sm ${isOverTolerance ? 'text-rose-600' : 'text-emerald-600'}`}>
                            Rs. {rep.chargedPrice} (+{variance.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Decision Support & Vendor Closed-Loop Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      {/* Left: AI Severity & Recommendation */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#04231A] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#3D7EA6]" />
                            <span>{isUrdu ? 'اے آئی شدت تجزیہ (Decision Support)' : 'AI Severity & Decision Support'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">±3% BUFFER MODEL</span>
                        </div>
                        <p className="text-xs text-[#04231A] font-urdu leading-relaxed">
                          {rep.aiSeverityAnalysis || `تجزیہ: سرکاری نرخ سے ${variance.toFixed(1)} فیصد زائد قیمت وصول کی گئی جو کہ قانونی 3 فیصد کی حد سے تجاوز کرتی ہے۔`}
                        </p>
                        {rep.aiRecommendedAction && (
                          <div className="pt-2 border-t border-slate-200 text-[11px] text-[#3D7EA6] font-urdu font-bold">
                            💡 تجویز: {rep.aiRecommendedAction}
                          </div>
                        )}
                      </div>

                      {/* Right: Vendor Response & Action History */}
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span>{isUrdu ? 'دکاندار کا باضابطہ جواب (Right of Reply)' : 'Vendor Response & Position'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-blue-500">CLOSED LOOP</span>
                        </div>
                        {rep.vendorResponse ? (
                          <div className="text-xs text-blue-900 font-urdu leading-relaxed bg-white/80 p-2.5 rounded-xl border border-blue-200">
                            "{rep.vendorResponse}"
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 font-urdu italic">
                            {isUrdu ? 'دکاندار کی جانب سے تاحال کوئی تحریری موقف درج نہیں کیا گیا۔' : 'No written vendor defense filed yet.'}
                          </p>
                        )}
                        {rep.inspectorActionTaken && (
                          <div className="pt-2 border-t border-blue-200 text-[11px] text-emerald-800 font-urdu font-bold">
                            ✓ فیلڈ کارروائی ریکارڈ: {rep.inspectorActionTaken}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                      <div className="text-[11px] text-slate-500 font-urdu">
                        {isUrdu ? 'انسپکٹر کو حتمی فیصلہ کرنے کا قانونی اختیار حاصل ہے' : 'Field Magistrate retains full accountability for any action.'}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartInspectionForReport(rep)}
                          className="bg-[#3D7EA6] hover:bg-[#3D7EA6]/90 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#E3A82B]" />
                          <span>{isUrdu ? '±3% اسکینر کھولیں' : 'Open AI Scanner'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCaseForAction(rep);
                            setActionNotes('');
                          }}
                          className="bg-[#04231A] hover:bg-[#0B4A31] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-[#E3A82B]" />
                          <span>{isUrdu ? 'قانونی کارروائی درج کریں' : 'Take Action / Resolve'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Case Action Modal for Field Inspector */}
      {selectedCaseForAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full text-[#132A21] shadow-2xl border-4 border-[#04231A] space-y-4 animate-fadeUp">
            <div className="text-center border-b-2 border-[#04231A] pb-3">
              <span className="font-sora font-extrabold text-base text-[#04231A] block">
                PERA MAGISTRATE ACTION LOG
              </span>
              <span className="text-xs font-urdu font-bold text-[#178A52]">
                کیس حوالہ: {selectedCaseForAction.id} • {selectedCaseForAction.item}
              </span>
              <p className="text-[10px] font-mono text-[#5C6F63] mt-0.5">
                Stall: {selectedCaseForAction.vendorName} ({selectedCaseForAction.location})
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 font-urdu">
                <span className="font-bold block mb-1">سرکاری ڈی سی ریٹ بمقابلہ وصولی:</span>
                سرکاری ریٹ Rs. {selectedCaseForAction.officialRate} — وصولی: Rs. {selectedCaseForAction.chargedPrice}
              </div>

              <div>
                <label className="font-bold text-[#04231A] block mb-1">
                  {isUrdu ? 'فیلڈ انسپکٹر کے مشاہداتی ریمارکس:' : 'Inspector Field Notes & Observation:'}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={isUrdu ? 'معائنے کے بعد دکاندار کو دی گئی تنبیہ یا رہنمائی تحریر کریں...' : 'Enter field verification findings...'}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-[#04231A] focus:outline-none focus:border-[#3D7EA6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleTakeActionOnReport(
                      selectedCaseForAction.id,
                      'coaching_advisory',
                      actionNotes || (isUrdu ? 'دکاندار کو ڈی سی ریٹ لسٹ آویزاں کرنے کی مثبت رہنمائی دی گئی' : 'Coaching advisory provided on DC price compliance')
                    );
                  }}
                  className="bg-[#178A52] hover:bg-[#178A52]/90 text-white p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'مثبت تربیتی رہنمائی' : 'Issue Coaching Advisory'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleTakeActionOnReport(
                      selectedCaseForAction.id,
                      'warning',
                      actionNotes || (isUrdu ? 'گراں فروشی پر رسمی انتباہ جاری کیا گیا' : 'Official Regulatory Warning issued')
                    );
                  }}
                  className="bg-[#E3A82B] hover:bg-[#E3A82B]/90 text-[#04231A] p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{isUrdu ? 'رسمی انتباہ (Warning)' : 'Issue Warning'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleTakeActionOnReport(
                      selectedCaseForAction.id,
                      'penalty',
                      actionNotes || (isUrdu ? 'خلاف ورزی ثابت ہونے پر جرمانہ چالان جاری کیا گیا' : 'Penalty Citation recorded for ±3% breach')
                    );
                  }}
                  className="bg-[#B03A2E] hover:bg-[#B03A2E]/90 text-white p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isUrdu ? 'چالان لاگ درج کریں' : 'Issue Penalty Citation'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onResolveReport) {
                      onResolveReport(
                        selectedCaseForAction.id,
                        actionNotes || (isUrdu ? 'معاملہ باہمی رضامندی سے حل اور نرخ درست کروا دیا گیا' : 'Matter resolved and price rectified')
                      );
                    }
                    setSelectedCaseForAction(null);
                  }}
                  className="bg-[#04231A] hover:bg-[#0B4A31] text-white p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'کیس حل شدہ (Resolve)' : 'Mark Case Resolved'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedCaseForAction(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold"
              >
                {isUrdu ? 'منسوخ کریں (Cancel)' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Print-Ready Challan View */}
      {activePrintCitation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full text-[#132A21] shadow-2xl border-4 border-[#04231A] space-y-4 animate-fadeUp">
            <div className="text-center border-b-2 border-[#04231A] pb-3">
              <span className="font-sora font-extrabold text-base text-[#04231A] block">
                GOVERNMENT OF PAKISTAN • PERA
              </span>
              <span className="text-xs font-urdu font-bold text-[#178A52]">
                پنجاب / وفاقی قیمت کنٹرول و دکاندار تحفظ اتھارٹی
              </span>
              <p className="text-[10px] font-mono text-[#5C6F63] mt-0.5">
                Official Challan ID: {activePrintCitation.id} • Date: {activePrintCitation.timestamp}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b py-1">
                <span className="font-bold">دکاندار / اسٹال:</span>
                <span>{activePrintCitation.vendorName} ({activePrintCitation.slotNumber})</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="font-bold">مقام / مارکیٹ:</span>
                <span>{activePrintCitation.marketName}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="font-bold">آئٹم / خلاف ورزی:</span>
                <span>{activePrintCitation.item}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="font-bold">سرکاری ڈی سی نرخ:</span>
                <span>Rs. {activePrintCitation.officialRate}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="font-bold">وصول کی گئی قیمت:</span>
                <span className="font-bold text-[#B03A2E]">Rs. {activePrintCitation.chargedPrice} (+{activePrintCitation.variancePct}%)</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="font-bold">جرمانہ رقم:</span>
                <span className="font-sora font-extrabold text-sm text-[#B03A2E]">Rs. {activePrintCitation.fineAmount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-bold">تفتیشی مجسٹریٹ:</span>
                <span>{activePrintCitation.inspectorName}</span>
              </div>
            </div>

            <div className="bg-[#F6F2E7] p-2.5 rounded-xl text-[10px] text-center font-urdu text-[#5C6F63]">
              یہ چالان ڈیجیٹل سسٹم سے جاری ہوا ہے اور اس پر قانونی مہلت کے تحت اپیل کا حق حاصل ہے۔
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-[#178A52] hover:bg-[#178A52]/90 text-white py-2 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>پرنٹ کریں (Print)</span>
              </button>
              <button
                onClick={() => setActivePrintCitation(null)}
                className="flex-1 bg-[#F6F2E7] hover:bg-[#DCEFE4] text-[#04231A] py-2 rounded-xl text-xs font-bold"
              >
                بند کریں (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Simulator Modal for Inspectors */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        lang={lang}
        vendors={vendors}
        onSelectVendor={(v) => {
          setScannedVendorName(`${v.name} (${v.shopName})`);
          setScannedSlot(v.slotNumber);
          setInspectedVendor(v);
        }}
      />

      {/* Verified Vendor Profile Modal */}
      <VendorVerifiedProfileModal
        isOpen={!!inspectedVendor}
        onClose={() => setInspectedVendor(null)}
        vendor={inspectedVendor}
        lang={lang}
        dcRates={dcRates}
      />
    </div>
  );
};
