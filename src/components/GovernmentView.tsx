import React, { useState, useEffect } from 'react';
import { 
  Building2, Activity, Send, BarChart3, Radio, Database, 
  Settings, Download, Upload, RefreshCw, CheckCircle2, 
  Search, Filter, ShieldCheck, Play, Pause, AlertTriangle, MapPin, Compass,
  TrendingUp, BarChart2, UserCheck, PackagePlus, FileText, ArrowUpRight,
  Scale, FileSpreadsheet, Layers, Zap, Clock, Users, Award,
  Plus, Edit3, Trash2, Check, AlertCircle, Sparkles, TrendingDown, ArrowDownRight, X
} from 'lucide-react';
import { Language, ZoneItem, CitizenReport, FeedEvent, DCRateItem, Citation, VendorProfile } from '../types';
import { DailyOverchargingChart } from './DailyOverchargingChart';
import { GovernmentVendorOutreachModal } from './GovernmentVendorOutreachModal';
import { GovernmentVendorLicensingHub } from './GovernmentVendorLicensingHub';
import { WhyAndHowQA } from './WhyAndHowQA';
import { PakistanNationalMapView } from './PakistanNationalMapView';
import { triggerCelebration } from '../lib/celebration';

interface GovernmentViewProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  zones: ZoneItem[];
  reports: CitizenReport[];
  feedEvents: FeedEvent[];
  dcRates: DCRateItem[];
  citations: Citation[];
  vendors: VendorProfile[];
  onDispatchReport: (reportId: string, squadName: string, priority?: 'routine' | 'urgent' | 'emergency', directives?: string) => void;
  onUpdateDcRate?: (updatedRate: DCRateItem) => void;
  onAddDcRate?: (newRate: DCRateItem) => void;
  onDeleteDcRate?: (rateId: string) => void;
  onPublishRates?: (rates: DCRateItem[]) => void;
  onResetSeedData: () => void;
  onOpenAIGuide: () => void;
  onOpenCitySlotsMap?: (slotId?: string) => void;
  onOpenVendorAllotment?: (vendorId?: string) => void;
  onUpdateVendor?: (vendorId: string, updates: Partial<VendorProfile>) => void;
}

export const GovernmentView: React.FC<GovernmentViewProps> = ({
  activeTab,
  onSelectTab,
  lang,
  zones = [],
  reports = [],
  feedEvents = [],
  dcRates = [],
  citations = [],
  vendors = [],
  onDispatchReport,
  onUpdateDcRate,
  onAddDcRate,
  onDeleteDcRate,
  onPublishRates,
  onResetSeedData,
  onOpenAIGuide,
  onOpenCitySlotsMap,
  onOpenVendorAllotment,
  onUpdateVendor,
}) => {
  const isUrdu = lang === 'ur';

  // Zone Search & Filter
  const [zoneSearch, setZoneSearch] = useState('');
  const [zoneStatusFilter, setZoneStatusFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');

  // DC Rate Gazette Management State
  const [rateSearch, setRateSearch] = useState('');
  const [rateCategoryFilter, setRateCategoryFilter] = useState<string>('all');
  const [editingRate, setEditingRate] = useState<DCRateItem | null>(null);
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [ratePublishSuccess, setRatePublishSuccess] = useState<string | null>(null);

  // Add Rate Form State
  const [newRateUrdu, setNewRateUrdu] = useState('');
  const [newRateEn, setNewRateEn] = useState('');
  const [newRateCatUrdu, setNewRateCatUrdu] = useState('سبزیاں');
  const [newRateCatEn, setNewRateCatEn] = useState('Vegetables');
  const [newRatePrice, setNewRatePrice] = useState('100');
  const [newRateBenchmark, setNewRateBenchmark] = useState('110');
  const [newRateUnitUrdu, setNewRateUnitUrdu] = useState('فی کلو');
  const [newRateUnitEn, setNewRateUnitEn] = useState('per kg');

  // Dispatch selected report state
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [selectedSquad, setSelectedSquad] = useState('اسکواڈ 1 (شمالی زون - راولپنڈی)');
  const [dispatchPriority, setDispatchPriority] = useState<'routine' | 'urgent' | 'emergency'>('urgent');
  const [dispatchDirectives, setDispatchDirectives] = useState('');
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Live Feed Stream Ticker
  const [feedPaused, setFeedPaused] = useState(false);
  const [currentFeedList, setCurrentFeedList] = useState<FeedEvent[]>(feedEvents);

  // Government Official Direct Vendor Outreach State
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [selectedVendorForOutreach, setSelectedVendorForOutreach] = useState<VendorProfile | null>(null);
  const [vendorOutreachSearch, setVendorOutreachSearch] = useState('');

  // Policy Sandbox State
  const [flourSubsidySlider, setFlourSubsidySlider] = useState(1480);
  const [municipalFeeSlider, setMunicipalFeeSlider] = useState(500);

  // Data import/export feedback
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Command Tab Inline Trends Toggle
  const [showCommandTrendsInline, setShowCommandTrendsInline] = useState(false);

  const filteredZones = (zones || []).filter((z) => {
    const matchesSearch =
      (z.nameUrdu && z.nameUrdu.includes(zoneSearch)) ||
      (z.nameEn && z.nameEn.toLowerCase().includes(zoneSearch.toLowerCase())) ||
      (z.district && z.district.toLowerCase().includes(zoneSearch.toLowerCase()));
    const matchesStatus =
      zoneStatusFilter === 'all' || z.status === zoneStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDispatch = () => {
    if (!selectedReportId) return;
    onDispatchReport(selectedReportId, selectedSquad, dispatchPriority, dispatchDirectives);
    setDispatchSuccessMsg(
      isUrdu
        ? `اسکواڈ "${selectedSquad}" کو رپورٹ آئی ڈی ${selectedReportId} کے لیے کامیابی سے روانہ کر دیا گیا ہے۔ (${dispatchPriority === 'emergency' ? 'ہنگامی ریڈ الرٹ' : dispatchPriority === 'urgent' ? 'ارجنٹ' : 'معمول'} - ETA: 9 Mins)`
        : `Squad "${selectedSquad}" dispatched for Report ID ${selectedReportId} (${dispatchPriority.toUpperCase()} - ETA: 9 Mins).`
    );
    setTimeout(() => setDispatchSuccessMsg(null), 5000);
  };

  const handleSaveEditedRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate || !onUpdateDcRate) return;
    onUpdateDcRate(editingRate);
    setEditingRate(null);
  };

  const handleCreateNewRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddDcRate || !newRateUrdu || !newRateEn) return;
    const newRateItem: DCRateItem = {
      id: `rate-custom-${Date.now()}`,
      nameUrdu: newRateUrdu,
      nameEn: newRateEn,
      categoryUrdu: newRateCatUrdu,
      categoryEn: newRateCatEn,
      dcRate: Number(newRatePrice) || 100,
      marketAvg: Number(newRateBenchmark) || Number(newRatePrice) || 100,
      unitUrdu: newRateUnitUrdu,
      unitEn: newRateUnitEn,
      lastUpdated: 'Just now',
      deviationPct: Number((((Number(newRateBenchmark) - Number(newRatePrice)) / Number(newRatePrice)) * 100).toFixed(1)) || 0,
    };
    onAddDcRate(newRateItem);
    setShowAddRateModal(false);
    setNewRateUrdu('');
    setNewRateEn('');
  };

  const handlePublishAllRates = () => {
    if (onPublishRates) {
      onPublishRates(dcRates);
    }
    setRatePublishSuccess(
      isUrdu
        ? 'آج کا سرکاری نرخ نامہ باضابطہ جاری اور تمام پورٹلز (شہری، وینڈر اور انسپکٹر) پر لائیو سنک کر دیا گیا ہے۔'
        : 'Official DC Rate Gazette published and live synchronized across all citizen, vendor, and inspector portals.'
    );
    setTimeout(() => setRatePublishSuccess(null), 5000);
  };

  const handleApplyReliefSubsidy = () => {
    if (!onPublishRates) return;
    const subsidized = dcRates.map(r => ({
      ...r,
      dcRate: Math.max(10, Math.round(r.dcRate * 0.95)),
      lastUpdated: '5% Relief Applied Today',
    }));
    onPublishRates(subsidized);
    setRatePublishSuccess(
      isUrdu
        ? 'عوامی ریلیف پیکج: تمام بنیادی اشیا کے نرخوں پر 5 فیصد سرکاری سبسڈی لاگو کر دی گئی۔'
        : 'Public Relief Package: Uniform 5% relief price reduction applied across all commodities.'
    );
    setTimeout(() => setRatePublishSuccess(null), 5000);
  };

  // CSV Export Utility
  const handleExportCSV = (type: 'rates' | 'reports' | 'citations' | 'vendors') => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === 'rates') {
      headers = ['ID', 'Urdu Name', 'English Name', 'Category', 'DC Rate (PKR)', 'Market Avg', 'Unit'];
      rows = dcRates.map(r => [r.id, r.nameUrdu, r.nameEn, r.categoryEn, String(r.dcRate), String(r.marketAvg), r.unitEn]);
    } else if (type === 'reports') {
      headers = ['ID', 'Item', 'Vendor', 'Market', 'DC Rate', 'Charged Price', 'Status', 'Timestamp'];
      rows = reports.map(r => [r.id, r.item, r.vendorName, r.marketName, String(r.dcRate), String(r.chargedPrice), r.status, r.timestamp]);
    } else if (type === 'citations') {
      headers = ['ID', 'Vendor', 'Slot', 'Item', 'Official Rate', 'Charged Price', 'Variance Pct', 'Fine Amount', 'Status'];
      rows = citations.map(c => [c.id, c.vendorName, c.slotNumber, c.item, String(c.officialRate), String(c.chargedPrice), String(c.variancePct), String(c.fineAmount), c.status]);
    } else {
      headers = ['ID', 'Name', 'Shop', 'Market', 'Slot', 'Score', 'Credit Score', 'Waste Points'];
      rows = vendors.map(v => [v.id, v.name, v.shopName, v.marketName, v.slotNumber, String(v.score), String(v.creditScore), String(v.wastePoints)]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VRF_2026_${type.toUpperCase()}_EXPORT.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLicensingTab = activeTab === 'gov_licensing' || activeTab === 'licensing' || activeTab === 'allotment';
  const isRatesTab = activeTab === 'gov_rates' || activeTab === 'rates' || activeTab === 'prices';
  const isDispatchTab = activeTab === 'gov_dispatch' || activeTab === 'dispatch' || activeTab === 'alerts' || activeTab === 'gov_alerts';
  const isAnalyticsTab = activeTab === 'gov_analytics' || activeTab === 'analytics';
  const isFeedTab = activeTab === 'gov_feed' || activeTab === 'feed' || activeTab === 'notifications' || activeTab === 'gov_notifications';
  const isSyncTab = activeTab === 'gov_sync' || activeTab === 'sync' || activeTab === 'supply' || activeTab === 'gov_supply' || activeTab === 'datasync' || activeTab === 'gov_datasync';
  const isPolicyTab = activeTab === 'gov_policy' || activeTab === 'policy';
  const isWhyHowTab = activeTab === 'why_how';
  const isHeatmapTab = activeTab === 'gov_heatmap' || activeTab === 'heatmap' || activeTab === 'zones' || activeTab === 'map';
  const isCommandTab = activeTab === 'gov_command' || activeTab === 'command' || (!isHeatmapTab && !isLicensingTab && !isRatesTab && !isDispatchTab && !isAnalyticsTab && !isFeedTab && !isSyncTab && !isPolicyTab && !isWhyHowTab);

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Executive Sub-Tab Navigation Bar */}
      <div className="bg-[#FCFAF3] border border-[#178A52]/20 rounded-2xl p-2 shadow-sm overflow-x-auto flex items-center gap-2 no-scrollbar">
        {[
          { id: 'gov_command', labelUrdu: 'مرکزی کنٹرول و لائیو میٹرکس', labelEn: 'Master Control & Intelligence', icon: BarChart3 },
          { id: 'gov_heatmap', labelUrdu: '30 زونز پرائس و زوننگ میپ', labelEn: '30-Zone Price & Zoning Map', icon: Activity },
          { id: 'gov_licensing', labelUrdu: 'وینڈر لائسنسنگ و الاٹمنٹ', labelEn: 'Vendor Licensing & Pitches', icon: ShieldCheck },
          { id: 'gov_rates', labelUrdu: 'سرکاری نرخ نامہ و قیمتیں', labelEn: 'DC Rate Gazette & Prices', icon: Scale },
          { id: 'gov_dispatch', labelUrdu: 'پیٹرول ڈسپیچ', labelEn: 'Patrol Dispatch', icon: Send },
          { id: 'gov_analytics', labelUrdu: 'روزانہ اینالیٹکس و ڈیٹا', labelEn: 'Analytics & Data', icon: TrendingUp },
          { id: 'gov_feed', labelUrdu: 'لائیو اسٹریم و آؤٹ ریچ', labelEn: 'Live Stream & Supplies', icon: Radio },
          { id: 'gov_policy', labelUrdu: 'پالیسی سینڈ باکس', labelEn: 'Policy Sandbox', icon: Settings },
          { id: 'why_how', labelUrdu: 'گورننس فریم ورک', labelEn: 'Governance SOPs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected =
            (tab.id === 'gov_command' && isCommandTab) ||
            (tab.id === 'gov_heatmap' && isHeatmapTab) ||
            (tab.id === 'gov_licensing' && isLicensingTab) ||
            (tab.id === 'gov_rates' && isRatesTab) ||
            (tab.id === 'gov_dispatch' && isDispatchTab) ||
            (tab.id === 'gov_analytics' && isAnalyticsTab) ||
            (tab.id === 'gov_feed' && isFeedTab) ||
            (tab.id === 'gov_policy' && isPolicyTab) ||
            (tab.id === 'why_how' && isWhyHowTab);

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-[#178A52] text-white shadow-md'
                  : 'bg-white text-[#04231A] hover:bg-[#DCEFE4]/40 border border-[#178A52]/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-[#E3A82B]' : 'text-[#178A52]'}`} />
              <span>{isUrdu ? tab.labelUrdu : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ================= 0. OFFICIAL VENDOR LICENSING & AUTHORIZATION HUB ================= */}
      {isLicensingTab && (
        <GovernmentVendorLicensingHub
          lang={lang}
          vendors={vendors}
          onUpdateVendor={(vendorId, updates) => {
            if (onUpdateVendor) {
              onUpdateVendor(vendorId, updates);
            }
          }}
          onOpenVendorAllotment={(vId) => {
            if (onOpenVendorAllotment) {
              onOpenVendorAllotment(vId);
            }
          }}
          onOpenCitySlotsMap={(slotId) => {
            if (onOpenCitySlotsMap) {
              onOpenCitySlotsMap(slotId);
            }
          }}
        />
      )}

      {/* ================= 1. DISTRICT COMMAND & 30 ZONES ================= */}
      {isCommandTab && (
        <div className="space-y-6">
          {/* Executive 1-Tap Management Actions Grid */}
          <div className="bg-[#FCFAF3] rounded-3xl p-5 sm:p-6 border border-[#178A52]/20 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sora font-extrabold text-lg text-[#04231A] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#E3A82B]" />
                  <span>{isUrdu ? 'انتظامی فوری اقدامات (1-Tap Command Actions)' : 'Executive Quick Actions'}</span>
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  {isUrdu ? 'کسی بھی انتظامی کارروائی پر فوری رسائی کے لیے نیچے دیے گئے بٹن پر کلک کریں۔' : 'One-tap direct access to core district management and enforcement workflows.'}
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#178A52]/10 text-[#178A52] text-xs font-bold font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized Government Tier</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Action 1: Vendor Licensing & QR Approval */}
              <button
                id="btn-gov-quick-licensing"
                onClick={() => onSelectTab('gov_licensing')}
                className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] hover:bg-[#EAF5EF] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#178A52] text-[#E3A82B] flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#E3A82B]/20 text-[#8F5E00] px-2 py-0.5 rounded-full">
                    {vendors.filter(v => v.badge === 'yellow' || !v.verified).length} Pending
                  </span>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xs sm:text-sm text-[#04231A] group-hover:text-[#178A52] transition-colors">
                    {isUrdu ? 'وینڈر منظوری و کیو آر' : 'Vendor Approvals & QR'}
                  </h4>
                  <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5 line-clamp-1">
                    {isUrdu ? 'لائسنس جاری و منسوخ کریں' : 'Approve & Issue Digital ID'}
                  </p>
                </div>
              </button>

              {/* Action 2: Patrol Squad Dispatch */}
              <button
                id="btn-gov-quick-dispatch"
                onClick={() => onSelectTab('gov_dispatch')}
                className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] hover:bg-[#EAF5EF] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0B4A31] text-sky-400 flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                    12 Active
                  </span>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xs sm:text-sm text-[#04231A] group-hover:text-[#178A52] transition-colors">
                    {isUrdu ? 'مجسٹریٹ اسکواڈ ڈسپیچ' : 'Patrol Squad Dispatch'}
                  </h4>
                  <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5 line-clamp-1">
                    {isUrdu ? 'موقع پر ٹیم روانہ کریں' : 'Deploy Magistrate Units'}
                  </p>
                </div>
              </button>

              {/* Action 3: 30-Zone Radar & Map */}
              <button
                id="btn-gov-quick-radar"
                onClick={() => {
                  if (onOpenCitySlotsMap) {
                    onOpenCitySlotsMap();
                  }
                }}
                className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] hover:bg-[#EAF5EF] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#04231A] text-[#E3A82B] flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#04231A] text-[#E3A82B] px-2 py-0.5 rounded-full">
                    30 Zones
                  </span>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xs sm:text-sm text-[#04231A] group-hover:text-[#178A52] transition-colors">
                    {isUrdu ? '30 زونز لائیو ریڈار' : '30-Zone GIS Radar'}
                  </h4>
                  <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5 line-clamp-1">
                    {isUrdu ? 'ملک گیر سلاٹس نقشہ' : 'National Heatmap & Slots'}
                  </p>
                </div>
              </button>

              {/* Action 4: Official DC Price Ceilings */}
              <button
                id="btn-gov-quick-policy"
                onClick={() => onSelectTab('gov_policy')}
                className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] hover:bg-[#EAF5EF] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#178A52] text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <Scale className="w-5 h-5 text-[#E3A82B]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#178A52]/20 text-[#178A52] px-2 py-0.5 rounded-full">
                    {dcRates.length} Items
                  </span>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xs sm:text-sm text-[#04231A] group-hover:text-[#178A52] transition-colors">
                    {isUrdu ? 'سرکاری نرخ نامہ و پالیسی' : 'Fix DC Price Ceiling'}
                  </h4>
                  <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5 line-clamp-1">
                    {isUrdu ? 'روزانہ گزٹ و حدِ قیمت' : 'Daily 7 AM Rate Gazette'}
                  </p>
                </div>
              </button>

              {/* Action 5: Compliance Analytics */}
              <button
                id="btn-gov-quick-analytics"
                onClick={() => onSelectTab('gov_analytics')}
                className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] hover:bg-[#EAF5EF] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0B4A31] text-amber-400 flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    93.8%
                  </span>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xs sm:text-sm text-[#04231A] group-hover:text-[#178A52] transition-colors">
                    {isUrdu ? 'تعمیل اینالیٹکس' : 'Compliance Analytics'}
                  </h4>
                  <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5 line-clamp-1">
                    {isUrdu ? 'انحراف اور مارکیٹ رجحانات' : 'Zero-Leakage Audit'}
                  </p>
                </div>
              </button>

              {/* Action 6: Citizen Reports & Grievance Feed */}
              <button
                id="btn-gov-quick-reports"
                onClick={() => onSelectTab('gov_feed')}
                className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] hover:bg-[#EAF5EF] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#C4572D] text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5 text-[#F4D58D]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    {reports.length} Reports
                  </span>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xs sm:text-sm text-[#04231A] group-hover:text-[#178A52] transition-colors">
                    {isUrdu ? 'شہری شکایات و اپیلیں' : 'Citizen Grievances'}
                  </h4>
                  <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5 line-clamp-1">
                    {isUrdu ? 'لائیو فیڈ اور تصاویر' : 'Review Reports & Appeals'}
                  </p>
                </div>
              </button>

              {/* Action 7: Vendor GIS Allotment */}
              <button
                id="btn-gov-quick-allotment"
                onClick={() => {
                  if (onOpenVendorAllotment) {
                    onOpenVendorAllotment();
                  }
                }}
                className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] hover:bg-[#EAF5EF] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#04231A] text-emerald-400 flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    GIS Sync
                  </span>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xs sm:text-sm text-[#04231A] group-hover:text-[#178A52] transition-colors">
                    {isUrdu ? 'جیو فینس و ریڑھی سلاٹ' : 'Vendor GIS Allotment'}
                  </h4>
                  <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5 line-clamp-1">
                    {isUrdu ? 'نقشے پر پچ مختص کریں' : 'Assign Official Coordinates'}
                  </p>
                </div>
              </button>

              {/* Action 8: Export Audit & Daily Gazette */}
              <button
                id="btn-gov-quick-export"
                onClick={() => handleExportCSV('reports')}
                className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] hover:bg-[#EAF5EF] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#178A52] text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                    <Download className="w-5 h-5 text-[#E3A82B]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full">
                    CSV / Report
                  </span>
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-xs sm:text-sm text-[#04231A] group-hover:text-[#178A52] transition-colors">
                    {isUrdu ? 'آڈٹ رپورٹ ڈاؤن لوڈ' : 'Export Audit Gazette'}
                  </h4>
                  <p className="text-[11px] text-[#5C6F63] font-urdu mt-0.5 line-clamp-1">
                    {isUrdu ? 'آفیشل ڈی سی سمری' : 'Official DC Daily Report'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Main Hero Overview Banner */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#178A52] shadow-2xl text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#178A52] text-white px-3 py-1 rounded-full text-xs font-bold mb-3 shadow">
                  <Building2 className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>{isUrdu ? 'سینٹرل کمانڈ و ضلعی گورننس' : 'Central District Command'}</span>
                </div>

                <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
                  {isUrdu ? 'قومی ڈی سی مانیٹرنگ گرڈ (30 زونز)' : 'National DC Compliance Grid (30 Zones)'}
                </h2>
                <p className="text-sm text-[#DCEFE4] font-urdu max-w-2xl mt-1">
                  زیرو لیکج ریونیو، لائیو جیو فینس ٹریکنگ اور فوری اسکواڈ ڈسپیچ سسٹم۔
                </p>
              </div>

              {/* Command KPIs Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'مجموعی زونز' : 'Total Zones'}</span>
                  <span className="font-sora font-extrabold text-2xl text-white">30</span>
                  <span className="text-[10px] text-[#178A52] block font-bold">100% Monitored</span>
                </div>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'اوسط تعمیل' : 'Avg Compliance'}</span>
                  <span className="font-sora font-extrabold text-2xl text-[#E3A82B]">93.8%</span>
                  <span className="text-[10px] text-[#178A52] block font-bold">+2.4% this week</span>
                </div>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'فعال پیٹرول اسکواڈز' : 'Patrol Squads'}</span>
                  <span className="font-sora font-extrabold text-2xl text-[#3D7EA6]">12</span>
                  <span className="text-[10px] text-white block font-bold">9m Avg Response</span>
                </div>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'میونسپل ریونیو' : 'Revenue Shield'}</span>
                  <span className="font-sora font-extrabold text-xl text-[#F4D58D]">100% Zero Leak</span>
                  <span className="text-[10px] text-[#178A52] block font-bold">Digital QR Flow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Overcharging Trends Quick Intelligence Banner */}
          <div className="bg-gradient-to-r from-[#FCFAF3] via-[#F4F9F6] to-[#FCFAF3] rounded-3xl p-5 border-2 border-[#178A52]/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#178A52] text-white flex items-center justify-center shrink-0 shadow">
                <BarChart2 className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#178A52]/15 text-[#0B4A31] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {isUrdu ? 'ری چارٹس تجزیاتی گرڈ (Recharts Engine)' : 'Recharts Analytics Grid'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#178A52]">
                    <TrendingUp className="w-3 h-3 text-[#178A52]" />
                    <span>{isUrdu ? 'روزانہ رجحانات لائیو' : 'Daily Trends Live'}</span>
                  </span>
                </div>
                <h4 className="font-sora font-extrabold text-base sm:text-lg text-[#04231A] mt-0.5">
                  {isUrdu ? 'روزانہ گراں فروشی اور مارکیٹ زوننگ خلاف ورزیوں کا جائزہ' : 'Daily Overcharging Trends & Market Zoning Violations'}
                </h4>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  {isUrdu 
                    ? 'شہری شکایات کے ڈیٹا پر مبنی تفصیلی بار چارٹ برائے مارکیٹ زونز، ڈی سی ریٹ انحراف اور رسپانس مانیٹرنگ۔'
                    : 'Aggregated citizen complaint bar chart tracking daily variance above DC rate ceiling across 30 market zones.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowCommandTrendsInline(prev => !prev)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-white border border-[#178A52]/40 text-[#04231A] hover:bg-[#DCEFE4]/40 shadow-sm transition-all"
              >
                {showCommandTrendsInline 
                  ? (isUrdu ? 'چارٹ چھپائیں ▲' : 'Collapse Chart ▲') 
                  : (isUrdu ? 'ان لائن چارٹ دیکھیں ▼' : 'Expand Inline Chart ▼')}
              </button>
              <button
                onClick={() => onSelectTab('gov_analytics')}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#178A52] hover:bg-[#0B4A31] text-white shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <span>{isUrdu ? 'مکمل تجزیات دیکھیں ↗' : 'Full Analytics View ↗'}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Inline Daily Overcharging Chart inside Command Tab */}
          {showCommandTrendsInline && (
            <div className="animate-fadeUp">
              <DailyOverchargingChart
                reports={reports}
                zones={zones}
                lang={lang}
                onSelectZoneFilter={(z) => {
                  setZoneSearch(z);
                  onSelectTab('gov_heatmap');
                }}
              />
            </div>
          )}

          {/* Quick Operations & Active Enforcement Snapshot */}
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A] flex items-center gap-2">
                  <Activity className="w-6 h-6 text-[#178A52]" />
                  <span>{isUrdu ? 'ضلعی لائیو آپریشنز و اسکواڈ کمانڈ' : 'District Live Operations & Patrol Command'}</span>
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  {isUrdu ? '30 زونز میں فعال پیٹرول اسکواڈز، فوری مداخلت اور جیو فینس کی لائیو سمری' : 'Real-time overview of active patrol squads, incident response, and geospatial compliance.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectTab('gov_heatmap')}
                  className="bg-[#178A52] hover:bg-[#0B4A31] text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? '30 زونز مکمل نقشہ کھولیں ↗' : 'Open 30-Zone Radar Map ↗'}</span>
                </button>
                <button
                  onClick={() => onSelectTab('gov_dispatch')}
                  className="bg-[#04231A] hover:bg-[#0B4A31] text-[#E3A82B] border border-[#E3A82B] text-xs font-extrabold px-4 py-2 rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'پیٹرول ڈسپیچ ↗' : 'Patrol Dispatch ↗'}</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#5C6F63]">{isUrdu ? 'زونز کی تعمیل' : 'Zone Compliance'}</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">93.8% Good</span>
                </div>
                <div className="text-2xl font-extrabold font-sora text-[#04231A]">26 / 30</div>
                <p className="text-[11px] text-[#5C6F63] mt-1 font-urdu">{isUrdu ? '26 زونز میں سرکاری نرخوں پر 100% عملدرآمد' : '26 zones fully compliant within DC rate ceilings.'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#5C6F63]">{isUrdu ? 'فعال پیٹرول اسکواڈز' : 'Patrol Response'}</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">12 Active</span>
                </div>
                <div className="text-2xl font-extrabold font-sora text-[#04231A]">9 min Avg</div>
                <p className="text-[11px] text-[#5C6F63] mt-1 font-urdu">{isUrdu ? 'شہری شکایت پر فیلڈ انسپکٹر کی اوسط رسپانس سپیڈ' : 'Average on-ground response speed for urgent alerts.'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#5C6F63]">{isUrdu ? 'شکایات حل کی شرح' : 'Resolution Rate'}</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">98.2%</span>
                </div>
                <div className="text-2xl font-extrabold font-sora text-[#04231A]">{reports.filter(r => r.status === 'resolved').length || 18} Resolved</div>
                <p className="text-[11px] text-[#5C6F63] mt-1 font-urdu">{isUrdu ? 'تمام شہری کیسز پر تصدیق شدہ کارروائی' : 'Direct magistrate and QR-verified resolution.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 1.2 30-ZONE PRICE & ZONING MAP (RADAR) ================= */}
      {isHeatmapTab && (
        <div className="space-y-6">
          {/* 30-Zone Price & Zoning Map Hero Header */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#178A52] shadow-2xl text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#E3A82B] text-[#04231A] px-3 py-1 rounded-full text-xs font-extrabold mb-3 shadow">
                  <Activity className="w-3.5 h-3.5 text-[#04231A]" />
                  <span>{isUrdu ? '30 زونز پرائس و زوننگ ریڈار میپ' : '30-Zone Price & Zoning Map'}</span>
                </div>

                <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
                  {isUrdu ? 'قومی جیو اسپیشل ریڈار و پرائس مانیٹرنگ نقشہ' : 'National Geospatial Radar & Price Compliance Map'}
                </h2>
                <p className="text-sm text-[#DCEFE4] font-urdu max-w-2xl mt-1">
                  {isUrdu 
                    ? 'پاکستان کے تمام 30 اضلاع، ریڑھی بان سلاٹس، 35 میٹر جیو فینس باؤنڈریز اور لائیو پیٹرول اسکواڈز کی جامع تصویری مانیٹرنگ۔' 
                    : 'Interactive radar covering all 30 official municipal zones, vendor pitches, 35m geo-fences, and real-time squad patrols.'}
                </p>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'کل زونز' : 'Total Zones'}</span>
                  <span className="font-sora font-extrabold text-2xl text-white">30</span>
                  <span className="text-[10px] text-[#178A52] block font-bold">100% Active</span>
                </div>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'مکمل محفوظ' : 'Compliant'}</span>
                  <span className="font-sora font-extrabold text-2xl text-[#10B981]">26</span>
                  <span className="text-[10px] text-[#178A52] block font-bold">🟢 DC Rate Aligned</span>
                </div>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'زیر نگرانی' : 'Under Watch'}</span>
                  <span className="font-sora font-extrabold text-2xl text-[#E3A82B]">3</span>
                  <span className="text-[10px] text-[#E3A82B] block font-bold">🟡 Caution</span>
                </div>

                <div className="bg-[#04231A]/80 border border-[#178A52] rounded-2xl p-3 text-center shadow">
                  <span className="text-[10px] text-[#DCEFE4]/70 block font-bold">{isUrdu ? 'فوری مداخلت' : 'Action Req'}</span>
                  <span className="font-sora font-extrabold text-2xl text-[#EF4444]">1</span>
                  <span className="text-[10px] text-[#EF4444] block font-bold">🔴 Squad Enroute</span>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Full Interactive Pakistan National Map */}
          <div className="bg-[#FCFAF3] rounded-3xl p-5 sm:p-6 border border-[#178A52]/20 shadow-md">
            <PakistanNationalMapView
              lang={lang}
              onSelectZone={(zoneId) => {
                setZoneSearch(zoneId);
              }}
            />
          </div>

          {/* 30 Zones Table & Filter */}
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A] flex items-center gap-2">
                  <Activity className="w-6 h-6 text-[#178A52]" />
                  <span>{isUrdu ? 'تمام 30 زونز کی تفصیلی صورتحال و مانیٹرنگ' : '30-Zone Live Operations & Price Compliance Grid'}</span>
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  {isUrdu ? 'ہر زون کے دکانداروں، فعال پیٹرول، لائسنسنگ اور سرکاری نرخوں کے انحراف کی لائیو رپورٹ' : 'Live status of vendor pitches, DC rate variance, squad response, and compliance rates.'}
                </p>
              </div>

              {/* Status Filters & 1-Click Google Map Button */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    if (onOpenVendorAllotment) {
                      onOpenVendorAllotment();
                    }
                  }}
                  className="bg-[#178A52] hover:bg-[#0B4A31] text-white border border-[#E3A82B] text-xs font-extrabold px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Compass className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'وینڈر الاٹمنٹ و گوگل میپس' : 'Vendor Allotment & Maps'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenCitySlotsMap) {
                      onOpenCitySlotsMap();
                    }
                  }}
                  className="bg-[#04231A] hover:bg-[#0B4A31] text-[#E3A82B] border border-[#E3A82B] text-xs font-extrabold px-3.5 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'پورا پاکستان سلاٹس میپ' : 'City Slots Radar'}</span>
                </button>

                <div className="flex items-center gap-1 bg-[#04231A] p-0.5 rounded-xl border border-[#178A52]/40">
                  <button
                    onClick={() => setZoneStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      zoneStatusFilter === 'all' ? 'bg-[#178A52] text-white' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    All (30)
                  </button>
                  <button
                    onClick={() => setZoneStatusFilter('green')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      zoneStatusFilter === 'green' ? 'bg-[#178A52] text-white' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    🟢 Normal
                  </button>
                  <button
                    onClick={() => setZoneStatusFilter('yellow')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      zoneStatusFilter === 'yellow' ? 'bg-[#E3A82B] text-[#04231A]' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    🟡 Alert
                  </button>
                  <button
                    onClick={() => setZoneStatusFilter('red')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      zoneStatusFilter === 'red' ? 'bg-[#B03A2E] text-white' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    🔴 Critical
                  </button>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-[#5C6F63] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={zoneSearch}
                onChange={(e) => setZoneSearch(e.target.value)}
                placeholder={isUrdu ? 'زون، ضلع یا سیکٹر تلاش کریں...' : 'Search zone, district or sector...'}
                className="w-full bg-white border border-[#178A52]/40 rounded-2xl pl-9 pr-4 py-2 text-xs text-[#132A21] placeholder-[#5C6F63]/60 focus:outline-none focus:border-[#178A52]"
              />
            </div>

            {/* Zones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredZones.map((z) => (
                <div
                  key={z.id}
                  className="p-4 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#178A52] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-xs bg-[#04231A] text-[#E3A82B] px-2.5 py-0.5 rounded-full">
                        {z.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        z.status === 'green' ? 'bg-[#178A52]/20 text-[#178A52]' :
                        z.status === 'yellow' ? 'bg-[#E3A82B]/20 text-[#E3A82B]' : 'bg-[#B03A2E]/20 text-[#B03A2E]'
                      }`}>
                        {z.status === 'green' ? '🟢 Normal' : z.status === 'yellow' ? '🟡 Alert' : '🔴 Critical'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-[#04231A] font-urdu">
                      {isUrdu ? z.nameUrdu : z.nameEn}
                    </h4>
                    <p className="text-xs text-[#5C6F63]">
                      ضلع: {z.district} • انسپکٹر: {z.inspectorInCharge}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#F6F2E7] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'تعمیل' : 'Compliance'}</span>
                      <strong className="font-sora text-sm text-[#178A52]">{z.complianceRate}%</strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'دکاندار / پیٹرول' : 'Vendors / Patrol'}</span>
                      <span className="font-bold text-[#04231A]">{z.totalVendors} / {z.activePatrols} Squads</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 1.5 DC RATE GAZETTE & PRICE CEILINGS PUBLISHER ================= */}
      {isRatesTab && (
        <div className="space-y-6">
          {/* Official Gazette Header Card */}
          <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 border border-[#178A52]/20 shadow-xl text-[#132A21]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F6F2E7]">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#04231A] text-white flex items-center justify-center shadow shrink-0">
                  <Scale className="w-6 h-6 text-[#E3A82B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                      {isUrdu ? 'ضلعی سرکاری نرخ نامہ و قیمتوں کی اشاعت' : 'Official DC Commodity Rate Gazette & Price Ceilings'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#178A52]/15 text-[#178A52] border border-[#178A52]/30 uppercase tracking-wider">
                      Live Sync Active
                    </span>
                  </div>
                  <p className="text-xs text-[#5C6F63] font-urdu mt-0.5">
                    {isUrdu
                      ? 'تمام بنیادی اشیائے ضروریہ کے سرکاری نرخ مقرر، تبدیل اور ایک کلک سے تمام شہریوں و دکانداروں کو لائیو نشر کریں۔'
                      : 'Define, update, and publish official price ceilings with real-time sync across Citizen, Vendor, and Inspector portals.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleApplyReliefSubsidy}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
                  title={isUrdu ? "عوامی ریلیف کیلئے تمام اشیا پر یکمشت 5% ریلیف لاگو کریں" : "Apply 5% Uniform Public Relief Discount"}
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>{isUrdu ? '5% عوامی ریلیف پیکج' : 'Apply 5% Relief'}</span>
                </button>

                <button
                  onClick={() => setShowAddRateModal(true)}
                  className="bg-[#178A52] hover:bg-[#178A52]/90 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'نئی شے شامل کریں' : 'Add Commodity'}</span>
                </button>

                <button
                  onClick={handlePublishAllRates}
                  className="bg-[#04231A] hover:bg-[#0B4A31] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <Send className="w-4 h-4 text-[#E3A82B]" />
                  <span>{isUrdu ? 'شائع و لائیو سنک کریں' : 'Publish & Sync Live'}</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {ratePublishSuccess && (
              <div className="mt-4 p-4 bg-[#178A52] text-white rounded-2xl text-xs font-bold font-urdu flex items-center gap-2 animate-fadeUp">
                <CheckCircle2 className="w-5 h-5 text-[#E3A82B] shrink-0" />
                <span>{ratePublishSuccess}</span>
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="p-3.5 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs">
                <span className="text-[10px] text-[#5C6F63] block font-urdu">{isUrdu ? 'کل مانیٹرڈ اشیا' : 'Total Commodities'}</span>
                <strong className="text-lg font-sora font-extrabold text-[#04231A]">{dcRates.length} Items</strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs">
                <span className="text-[10px] text-[#5C6F63] block font-urdu">{isUrdu ? 'اوسط مارکیٹ تعمیل' : 'Avg Compliance'}</span>
                <strong className="text-lg font-sora font-extrabold text-[#178A52]">96.8%</strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs">
                <span className="text-[10px] text-[#5C6F63] block font-urdu">{isUrdu ? 'آخری باضابطہ نظرثانی' : 'Last Gazette Update'}</span>
                <strong className="text-xs font-mono font-bold text-[#04231A]">Today, 08:30 AM</strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs">
                <span className="text-[10px] text-[#5C6F63] block font-urdu">{isUrdu ? 'سرکاری گزٹ کوڈ' : 'Gazette Batch Ref'}</span>
                <strong className="text-xs font-mono font-bold text-[#E3A82B]">VRF-DC-2026-LHR</strong>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#5C6F63] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rateSearch}
                  onChange={(e) => setRateSearch(e.target.value)}
                  placeholder={isUrdu ? 'شے کا نام، کیٹیگری یا کوڈ سے تلاش کریں...' : 'Search commodity by name or category...'}
                  className="w-full bg-white border border-[#178A52]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-[#132A21] placeholder-[#5C6F63]/60 focus:outline-none focus:ring-2 focus:ring-[#178A52]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', labelUrdu: 'تمام', labelEn: 'All' },
                  { id: 'vegetables', labelUrdu: 'سبزیاں', labelEn: 'Vegetables' },
                  { id: 'grains', labelUrdu: 'غلہ و دالیں', labelEn: 'Grains & Pulses' },
                  { id: 'groceries', labelUrdu: 'کریانہ و تیل', labelEn: 'Groceries' },
                  { id: 'meat', labelUrdu: 'گوشت و مرغی', labelEn: 'Meat & Poultry' },
                  { id: 'fruits', labelUrdu: 'پھل', labelEn: 'Fruits' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setRateCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      rateCategoryFilter === cat.id
                        ? 'bg-[#178A52] text-white shadow-xs'
                        : 'bg-white text-[#5C6F63] hover:bg-[#DCEFE4]/40 border border-[#178A52]/20'
                    }`}
                  >
                    {isUrdu ? cat.labelUrdu : cat.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Rates Table */}
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[#178A52]/20 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DCEFE4]/60 text-[#04231A] font-bold border-b border-[#178A52]/20">
                  <tr>
                    <th className="p-3 font-urdu">{isUrdu ? 'شے کا نام (اردو / انگریزی)' : 'Commodity'}</th>
                    <th className="p-3 font-urdu">{isUrdu ? 'کیٹیگری' : 'Category'}</th>
                    <th className="p-3 font-urdu">{isUrdu ? 'سرکاری ریٹ (ڈی سی ریٹ)' : 'Official DC Rate'}</th>
                    <th className="p-3 font-urdu">{isUrdu ? 'مارکیٹ بینچ مارک' : 'Market Benchmark'}</th>
                    <th className="p-3 font-urdu">{isUrdu ? 'یونٹ' : 'Unit'}</th>
                    <th className="p-3 font-urdu text-center">{isUrdu ? 'اقدامات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F2E7]">
                  {dcRates
                    .filter((r) => {
                      const matchesSearch =
                        !rateSearch ||
                        r.nameUrdu.includes(rateSearch) ||
                        r.nameEn.toLowerCase().includes(rateSearch.toLowerCase()) ||
                        (r.categoryEn && r.categoryEn.toLowerCase().includes(rateSearch.toLowerCase()));
                      
                      let matchesCat = true;
                      if (rateCategoryFilter === 'vegetables') {
                        matchesCat = r.categoryEn?.toLowerCase().includes('vegetable') || r.categoryUrdu?.includes('سبزی');
                      } else if (rateCategoryFilter === 'grains') {
                        matchesCat = r.categoryEn?.toLowerCase().includes('grain') || r.categoryEn?.toLowerCase().includes('flour') || r.categoryUrdu?.includes('غلہ') || r.categoryUrdu?.includes('آٹا');
                      } else if (rateCategoryFilter === 'groceries') {
                        matchesCat = r.categoryEn?.toLowerCase().includes('oil') || r.categoryEn?.toLowerCase().includes('sugar') || r.categoryUrdu?.includes('تیل') || r.categoryUrdu?.includes('چینی');
                      } else if (rateCategoryFilter === 'meat') {
                        matchesCat = r.categoryEn?.toLowerCase().includes('meat') || r.categoryEn?.toLowerCase().includes('chicken') || r.categoryUrdu?.includes('گوشت');
                      } else if (rateCategoryFilter === 'fruits') {
                        matchesCat = r.categoryEn?.toLowerCase().includes('fruit') || r.categoryUrdu?.includes('پھل');
                      }
                      return matchesSearch && matchesCat;
                    })
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-[#FCFAF3] transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-[#04231A] font-urdu text-sm">{item.nameUrdu}</div>
                          <div className="text-[11px] text-[#5C6F63]">{item.nameEn}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#178A52]/10 text-[#178A52]">
                            {isUrdu ? item.categoryUrdu : item.categoryEn}
                          </span>
                        </td>
                        <td className="p-3 font-bold font-sora text-sm text-[#178A52]">
                          Rs. {item.dcRate}
                        </td>
                        <td className="p-3 font-mono text-[#5C6F63]">
                          Rs. {item.marketAvg}
                          {item.deviationPct !== undefined && item.deviationPct !== 0 && (
                            <span className={`ml-1.5 text-[10px] font-bold ${item.deviationPct > 0 ? 'text-rose-600' : 'text-[#178A52]'}`}>
                              {item.deviationPct > 0 ? `+${item.deviationPct}%` : `${item.deviationPct}%`}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[#5C6F63] font-urdu">
                          {isUrdu ? item.unitUrdu : item.unitEn}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingRate(item)}
                              className="p-1.5 rounded-lg bg-[#178A52]/10 hover:bg-[#178A52]/20 text-[#178A52] transition-colors"
                              title={isUrdu ? "نرخ میں ترمیم کریں" : "Edit DC Rate"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteDcRate && (
                              <button
                                onClick={() => onDeleteDcRate(item.id)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                title={isUrdu ? "شے خارج کریں" : "Delete Item"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Add Commodity Modal */}
          {showAddRateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#178A52]/30 shadow-2xl relative text-[#132A21]">
                <button
                  onClick={() => setShowAddRateModal(false)}
                  className="absolute top-4 right-4 text-[#5C6F63] hover:text-[#04231A]"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#F6F2E7]">
                  <div className="w-10 h-10 rounded-xl bg-[#178A52] text-white flex items-center justify-center">
                    <Plus className="w-5 h-5 text-[#E3A82B]" />
                  </div>
                  <div>
                    <h4 className="font-sora font-extrabold text-lg text-[#04231A]">
                      {isUrdu ? 'نئی شے کا سرکاری نرخ نامہ میں اندراج' : 'Add New Commodity to DC Rate List'}
                    </h4>
                    <p className="text-xs text-[#5C6F63] font-urdu">
                      {isUrdu ? 'نام، کیٹیگری اور سرکاری کنٹرول ریٹ درج کریں۔' : 'Enter commodity details and official ceiling price.'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateNewRate} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#04231A] block mb-1 font-urdu">{isUrdu ? 'نام (اردو)' : 'Name (Urdu)'} *</label>
                      <input
                        type="text"
                        required
                        value={newRateUrdu}
                        onChange={(e) => setNewRateUrdu(e.target.value)}
                        placeholder="مثال: لیموں دیسی"
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#178A52]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#04231A] block mb-1">{isUrdu ? 'نام (انگریزی)' : 'Name (English)'} *</label>
                      <input
                        type="text"
                        required
                        value={newRateEn}
                        onChange={(e) => setNewRateEn(e.target.value)}
                        placeholder="e.g. Fresh Lemon"
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#178A52]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#04231A] block mb-1 font-urdu">{isUrdu ? 'کیٹیگری (اردو)' : 'Category (Urdu)'}</label>
                      <input
                        type="text"
                        value={newRateCatUrdu}
                        onChange={(e) => setNewRateCatUrdu(e.target.value)}
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#178A52]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#04231A] block mb-1">{isUrdu ? 'کیٹیگری (انگریزی)' : 'Category (English)'}</label>
                      <input
                        type="text"
                        value={newRateCatEn}
                        onChange={(e) => setNewRateCatEn(e.target.value)}
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#178A52]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#04231A] block mb-1 font-urdu">{isUrdu ? 'سرکاری ڈی سی ریٹ (Rs.)' : 'Official DC Rate (PKR)'} *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newRatePrice}
                        onChange={(e) => setNewRatePrice(e.target.value)}
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs font-bold text-[#178A52] focus:ring-2 focus:ring-[#178A52]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#04231A] block mb-1 font-urdu">{isUrdu ? 'مارکیٹ اوسط ریٹ (Rs.)' : 'Market Avg (PKR)'}</label>
                      <input
                        type="number"
                        min="1"
                        value={newRateBenchmark}
                        onChange={(e) => setNewRateBenchmark(e.target.value)}
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#178A52]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#04231A] block mb-1 font-urdu">{isUrdu ? 'یونٹ (اردو)' : 'Unit (Urdu)'}</label>
                      <input
                        type="text"
                        value={newRateUnitUrdu}
                        onChange={(e) => setNewRateUnitUrdu(e.target.value)}
                        placeholder="فی کلو / فی درجن"
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#178A52]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#04231A] block mb-1">{isUrdu ? 'یونٹ (انگریزی)' : 'Unit (English)'}</label>
                      <input
                        type="text"
                        value={newRateUnitEn}
                        onChange={(e) => setNewRateUnitEn(e.target.value)}
                        placeholder="per kg / per dozen"
                        className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#178A52]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddRateModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold hover:bg-gray-100"
                    >
                      {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#178A52] hover:bg-[#178A52]/90 text-white font-bold shadow transition-all"
                    >
                      {isUrdu ? 'شامل کریں و سنک کریں' : 'Add & Sync'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Quick Edit Commodity Modal */}
          {editingRate && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-[#FCFAF3] rounded-3xl p-6 max-w-md w-full border border-[#178A52]/30 shadow-2xl relative text-[#132A21]">
                <button
                  onClick={() => setEditingRate(null)}
                  className="absolute top-4 right-4 text-[#5C6F63] hover:text-[#04231A]"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#F6F2E7]">
                  <div className="w-10 h-10 rounded-xl bg-[#04231A] text-white flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-[#E3A82B]" />
                  </div>
                  <div>
                    <h4 className="font-sora font-extrabold text-base text-[#04231A]">
                      {isUrdu ? `${editingRate.nameUrdu} کا ریٹ تبدیل کریں` : `Edit Price for ${editingRate.nameEn}`}
                    </h4>
                    <p className="text-xs text-[#5C6F63]">
                      {isUrdu ? 'سرکاری گزٹ میں نیا نرخ مقرر کریں' : 'Set new official ceiling rate in DC Gazette'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveEditedRate} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#04231A] block mb-1 font-urdu">{isUrdu ? 'سرکاری ڈی سی ریٹ (Rs.)' : 'Official DC Rate (PKR)'} *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingRate.dcRate}
                      onChange={(e) => setEditingRate({ ...editingRate, dcRate: Number(e.target.value) })}
                      className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-sm font-extrabold text-[#178A52] focus:ring-2 focus:ring-[#178A52]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#04231A] block mb-1 font-urdu">{isUrdu ? 'مارکیٹ اوسط بینچ مارک (Rs.)' : 'Market Avg Benchmark (PKR)'}</label>
                    <input
                      type="number"
                      min="1"
                      value={editingRate.marketAvg}
                      onChange={(e) => setEditingRate({ ...editingRate, marketAvg: Number(e.target.value) })}
                      className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#178A52]"
                    />
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingRate(null)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold hover:bg-gray-100"
                    >
                      {isUrdu ? 'منسوخ' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#178A52] hover:bg-[#178A52]/90 text-white font-bold shadow transition-all"
                    >
                      {isUrdu ? 'محفوظ کریں و نشر کریں' : 'Save & Publish'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. PATROL DISPATCH ================= */}
      {isDispatchTab && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 border border-[#178A52]/20 shadow-xl text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#178A52] text-white flex items-center justify-center shadow">
                <Send className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'ریپڈ پیٹرول ڈسپیچ کنٹرول (Patrol Dispatch & Escalations)' : 'Rapid Patrol Squad Dispatch & Escalations'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  {isUrdu
                    ? 'شہریوں کی شکایات اور زائد قیمتوں پر قریبی مجسٹریٹ اسکواڈ کو 9 منٹ کے ہدف کے ساتھ فوری روانہ کریں۔'
                    : 'Dispatch nearest magistrate patrol squad to citizen complaint spots within the strict 9-minute ETA SLA.'}
                </p>
              </div>
            </div>

            {/* Notification Banner */}
            {dispatchSuccessMsg && (
              <div className="p-4 bg-[#178A52] text-white rounded-2xl text-xs font-bold font-urdu mb-4 flex items-center gap-2 animate-fadeUp">
                <CheckCircle2 className="w-5 h-5 text-[#E3A82B] shrink-0" />
                <span>{dispatchSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#04231A] block mb-1">
                  {isUrdu ? 'مطلوبہ شکایت منتخب کریں' : 'Select Citizen Report to Dispatch'}
                </label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2.5 text-xs text-[#132A21] focus:outline-none focus:border-[#178A52]"
                >
                  {reports.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.id} — {rep.item} ({rep.location || rep.marketName}) [Status: {rep.status}] - Overcharged: Rs. {rep.chargedPrice} vs DC Rs. {rep.dcRate}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#04231A] block mb-1">
                    {isUrdu ? 'متحرک پیٹرول اسکواڈ تفویض کریں' : 'Assign Active Patrol Squad'}
                  </label>
                  <select
                    value={selectedSquad}
                    onChange={(e) => setSelectedSquad(e.target.value)}
                    className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2.5 text-xs text-[#132A21] focus:outline-none focus:border-[#178A52]"
                  >
                    <option value="اسکواڈ 1 (شمالی زون - راولپنڈی)">اسکواڈ 1 (شمالی زون - راولپنڈی) — ETA 7 Mins</option>
                    <option value="اسکواڈ 2 (مرکزی راجہ بازار)">اسکواڈ 2 (مرکزی راجہ بازار) — ETA 4 Mins</option>
                    <option value="اسکواڈ 3 (لاہور انارکلی زون)">اسکواڈ 3 (لاہور انارکلی زون) — ETA 9 Mins</option>
                    <option value="اسکواڈ 4 (اسلام آباد سیکٹر ایف)">اسکواڈ 4 (اسلام آباد سیکٹر ایف) — ETA 6 Mins</option>
                    <option value="اسکواڈ 5 (فیصل آباد کچہری روڈ)">اسکواڈ 5 (فیصل آباد کچہری روڈ) — ETA 8 Mins</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#04231A] block mb-1">
                    {isUrdu ? 'ترجیح اور رسپانس لیول' : 'Priority & Response SLA'}
                  </label>
                  <select
                    value={dispatchPriority}
                    onChange={(e) => setDispatchPriority(e.target.value as any)}
                    className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2.5 text-xs text-[#132A21] focus:outline-none focus:border-[#178A52]"
                  >
                    <option value="urgent">{isUrdu ? 'ارجنٹ (فوری معائنہ - 9 منٹ ہدف)' : 'Urgent (Target: 9 Mins SLA)'}</option>
                    <option value="emergency">{isUrdu ? 'ہنگامی ریڈ الرٹ (زائد وصولی کارروائی)' : 'Emergency Red Alert (Immediate Action)'}</option>
                    <option value="routine">{isUrdu ? 'معمول کا پیٹرول سروے' : 'Routine Patrol Inspection'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#04231A] block mb-1">
                  {isUrdu ? 'اسپیشل مجسٹریٹ ہدایات / ڈائریکٹوز (اختیاری)' : 'Special Directives & Inspection Guidelines (Optional)'}
                </label>
                <input
                  type="text"
                  value={dispatchDirectives}
                  onChange={(e) => setDispatchDirectives(e.target.value)}
                  placeholder={isUrdu ? 'مثال: موقع پر ریٹ لسٹ، ترازو اور کوالٹی کا فوری معائنہ کریں...' : 'e.g. Verify calibrated weighing scale, official display board, and issue citation if variance exceeds 3%'}
                  className="w-full bg-white border border-[#178A52]/40 rounded-xl px-3 py-2 text-xs text-[#132A21] focus:outline-none focus:ring-2 focus:ring-[#178A52]"
                />
              </div>

              <button
                onClick={handleDispatch}
                className="w-full bg-[#178A52] hover:bg-[#178A52]/90 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-xl transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'اسکواڈ کو فوری روانہ کریں (Dispatch Patrol)' : 'Confirm & Dispatch Patrol Squad'}</span>
              </button>
            </div>
          </div>

          {/* GOVERNMENT OFFICIAL TO VENDOR DIRECT OUTREACH & UPLOAD HUB */}
          <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 border border-[#178A52]/20 shadow-xl text-[#132A21] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[#F6F2E7]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#04231A] text-white flex items-center justify-center shadow">
                  <PackagePlus className="w-6 h-6 text-[#E3A82B]" />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                    {isUrdu ? 'براہ راست دکاندار سے رابطہ و سرکاری سامان/وسائل کی ترسیل' : 'Official-to-Vendor Direct Outreach & Digital Dispatch'}
                  </h3>
                  <p className="text-xs text-[#5C6F63] font-urdu">
                    سرکاری افسران براہ راست کسی بھی وینڈر کو کیو آر اسٹیکر، سبسڈی واؤچر، سرکاری نوٹس یا سامان تفویض کر سکتے ہیں۔
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#178A52]/15 text-[#178A52] rounded-full">
                {vendors.length} {isUrdu ? 'رجسٹرڈ ریڑھی بان' : 'Registered Vendors'}
              </span>
            </div>

            {/* Vendor Quick Search Filter & GPS Allotment Locator */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5C6F63] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vendorOutreachSearch}
                  onChange={(e) => setVendorOutreachSearch(e.target.value)}
                  placeholder={isUrdu ? 'وینڈر کا نام، دکان، شناختی کارڈ یا سلاٹ نمبر سے تلاش کریں...' : 'Search vendor by name, slot number, or market...'}
                  className="w-full bg-white border border-[#178A52]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-[#132A21] placeholder-[#5C6F63]/60 focus:outline-none focus:ring-2 focus:ring-[#178A52]"
                />
              </div>
              {onOpenVendorAllotment && (
                <button
                  type="button"
                  onClick={() => onOpenVendorAllotment(vendorOutreachSearch || undefined)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all whitespace-nowrap active:scale-95"
                  title={isUrdu ? "وینڈر آئی ڈی درج کر کے سرکاری الاٹ شدہ جگہ تلاش کریں" : "Search Vendor ID to view official designated spot & GPS coordinates"}
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-200" />
                  <span>{isUrdu ? 'سرکاری الاٹمنٹ و گوگل میپس' : 'Allotment & GPS Radar'}</span>
                </button>
              )}
            </div>

            {/* Vendors List for Rapid Outreach & Dispatch */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {vendors
                .filter(v => 
                  !vendorOutreachSearch || 
                  v.name.toLowerCase().includes(vendorOutreachSearch.toLowerCase()) ||
                  v.nameUrdu?.includes(vendorOutreachSearch) ||
                  v.slotNumber.toLowerCase().includes(vendorOutreachSearch.toLowerCase()) ||
                  v.marketName.toLowerCase().includes(vendorOutreachSearch.toLowerCase())
                )
                .map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#178A52]/20 hover:border-[#E3A82B] shadow-xs flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#04231A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {v.slotNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-[#04231A]">
                            {isUrdu ? (v.nameUrdu || v.name) : v.name}
                          </h5>
                          <span className="text-[10px] bg-[#178A52]/15 text-[#178A52] font-mono px-1.5 py-0.2 rounded font-bold">
                            Score: {v.score}/10
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5C6F63] font-urdu">
                          {isUrdu ? (v.marketNameUrdu || v.marketName) : v.marketName} • {v.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenCitySlotsMap && (
                        <button
                          type="button"
                          onClick={() => onOpenCitySlotsMap(v.slotNumber || v.id)}
                          className="bg-[#178A52]/10 hover:bg-[#178A52]/20 text-[#178A52] border border-[#178A52]/30 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-2xs transition-transform active:scale-95"
                          title={isUrdu ? "سٹی سلاٹس ریڈار پر لائیو لوکیشن اور جیو فینس دیکھیں" : "View Live Spot and 35m Geofence on City Slots Radar Map"}
                        >
                          <Compass className="w-3.5 h-3.5 text-[#178A52]" />
                          <span className="hidden sm:inline">{isUrdu ? 'سلاٹس میپ' : 'Radar'}</span>
                        </button>
                      )}

                      {onOpenVendorAllotment && (
                        <button
                          type="button"
                          onClick={() => onOpenVendorAllotment(v.id)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-2xs transition-transform active:scale-95"
                          title={isUrdu ? "سرکاری الاٹمنٹ اور نقشہ پر درست مقام دیکھیں" : "View Designated Allotted Spot on Google Maps"}
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          <span className="hidden sm:inline">{isUrdu ? 'الاٹمنٹ' : 'Allotment'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedVendorForOutreach(v);
                          setOutreachModalOpen(true);
                        }}
                        className="bg-[#0B4A31] hover:bg-[#178A52] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-transform active:scale-95 whitespace-nowrap"
                      >
                        <PackagePlus className="w-3.5 h-3.5 text-[#E3A82B]" />
                        <span>{isUrdu ? 'سامان و ہدایات' : 'Outreach'}</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. ANALYTICS ================= */}
      {isAnalyticsTab && (
        <div className="space-y-6">
          {/* Main Recharts-Powered Daily Overcharging Trends & Market Zoning Violations */}
          <DailyOverchargingChart
            reports={reports}
            zones={zones}
            lang={lang}
            onSelectZoneFilter={(z) => setZoneSearch(z)}
          />

          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#0B4A31] text-white flex items-center justify-center shadow">
                <BarChart3 className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'تجزیات و حکومتی اعداد و شمار (Analytics Engine)' : 'Civic Performance & Compliance Analytics'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  قیمتوں کے استحکام، شکایات کے حل اور ریونیو شفافیت کی تفصیلی رپورٹس
                </p>
              </div>
            </div>

            {/* Visual Analytics Graphs Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#178A52]/20 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-[#04231A]">
                  {isUrdu ? 'ہفتہ وار قیمت تعمیل تناسب (Compliance Rate %)' : 'Weekly Price Compliance Ratio'}
                </h4>
                <div className="h-40 bg-[#F6F2E7] rounded-xl flex items-end justify-between p-4 gap-2">
                  <div className="w-full bg-[#178A52] rounded-t-lg h-[82%] relative group">
                    <span className="text-[9px] text-[#04231A] font-bold absolute -top-5 left-1/2 -translate-x-1/2">82%</span>
                  </div>
                  <div className="w-full bg-[#178A52] rounded-t-lg h-[88%] relative group">
                    <span className="text-[9px] text-[#04231A] font-bold absolute -top-5 left-1/2 -translate-x-1/2">88%</span>
                  </div>
                  <div className="w-full bg-[#178A52] rounded-t-lg h-[91%] relative group">
                    <span className="text-[9px] text-[#04231A] font-bold absolute -top-5 left-1/2 -translate-x-1/2">91%</span>
                  </div>
                  <div className="w-full bg-[#178A52] rounded-t-lg h-[95%] relative group">
                    <span className="text-[9px] text-[#04231A] font-bold absolute -top-5 left-1/2 -translate-x-1/2">95%</span>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-[#5C6F63] font-mono">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Current</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#178A52]/20 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-[#04231A]">
                  {isUrdu ? 'شکایات کے حل کا اوسط وقت (Resolution Speed)' : 'Dispute Resolution Speed (Mins)'}
                </h4>
                <div className="h-40 bg-[#F6F2E7] rounded-xl flex items-end justify-between p-4 gap-2">
                  <div className="w-full bg-[#3D7EA6] rounded-t-lg h-[75%] relative">
                    <span className="text-[9px] font-bold absolute -top-5 left-1/2 -translate-x-1/2">45m</span>
                  </div>
                  <div className="w-full bg-[#3D7EA6] rounded-t-lg h-[55%] relative">
                    <span className="text-[9px] font-bold absolute -top-5 left-1/2 -translate-x-1/2">32m</span>
                  </div>
                  <div className="w-full bg-[#3D7EA6] rounded-t-lg h-[35%] relative">
                    <span className="text-[9px] font-bold absolute -top-5 left-1/2 -translate-x-1/2">19m</span>
                  </div>
                  <div className="w-full bg-[#E3A82B] rounded-t-lg h-[18%] relative">
                    <span className="text-[9px] font-bold absolute -top-5 left-1/2 -translate-x-1/2">9m</span>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-[#5C6F63] font-mono">
                  <span>Legacy</span>
                  <span>Phase 1</span>
                  <span>Phase 2</span>
                  <span>VRF 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. LIVE FEED ================= */}
      {isFeedTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A] flex items-center gap-2">
                  <Radio className="w-6 h-6 text-[#B03A2E] animate-pulse" />
                  <span>{isUrdu ? 'لائیو ایونٹس اسٹریم (Real-Time Feed)' : 'Live Operational Event Stream'}</span>
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  تمام زونز میں ہونے والی اسکیننگ، رپورٹنگ اور انسپکشن کا لائیو ڈیٹا
                </p>
              </div>

              <button
                onClick={() => setFeedPaused(!feedPaused)}
                className="bg-[#04231A] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                {feedPaused ? <Play className="w-3.5 h-3.5 text-[#E3A82B]" /> : <Pause className="w-3.5 h-3.5 text-[#E3A82B]" />}
                <span>{feedPaused ? (isUrdu ? 'چلائیں' : 'Resume') : (isUrdu ? 'روکیں' : 'Pause')}</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {currentFeedList.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#178A52] animate-pulse" />
                    <div>
                      <p className="font-bold text-[#04231A] font-urdu">
                        {isUrdu ? evt.msgUrdu : evt.msgEn}
                      </p>
                      <span className="text-[10px] text-[#5C6F63] font-mono">{evt.zone}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#5C6F63]">{evt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. DATA SYNC CENTER ================= */}
      {isSyncTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#178A52] text-white flex items-center justify-center shadow">
                <Database className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'ڈیٹا سنک و امپورٹ / ایکسپورٹ سینٹر' : 'Data Sync & CSV Export / Import'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  حکومتی آڈٹ اور اوپن ڈیٹا کے لیے تمام ریکارڈز کو CSV فارمیٹ میں برآمد یا بحال کریں۔
                </p>
              </div>
            </div>

            {/* Export Actions Grid */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#04231A]">
                {isUrdu ? '۱. سی ایس وی ڈیٹا ایکسپورٹ کریں (Export to CSV):' : '1. Export System Records to CSV:'}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => handleExportCSV('rates')}
                  className="p-3 rounded-2xl bg-white border border-[#178A52]/30 hover:border-[#178A52] shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-5 h-5 text-[#178A52]" />
                  <span className="text-xs font-bold text-[#04231A]">{isUrdu ? 'ڈی سی ریٹس CSV' : 'DC Rates CSV'}</span>
                </button>

                <button
                  onClick={() => handleExportCSV('reports')}
                  className="p-3 rounded-2xl bg-white border border-[#178A52]/30 hover:border-[#178A52] shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-5 h-5 text-[#C4572D]" />
                  <span className="text-xs font-bold text-[#04231A]">{isUrdu ? 'شکایات رپورٹس CSV' : 'Reports CSV'}</span>
                </button>

                <button
                  onClick={() => handleExportCSV('citations')}
                  className="p-3 rounded-2xl bg-white border border-[#178A52]/30 hover:border-[#178A52] shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-5 h-5 text-[#B03A2E]" />
                  <span className="text-xs font-bold text-[#04231A]">{isUrdu ? 'چالان لاگ CSV' : 'Citations CSV'}</span>
                </button>

                <button
                  onClick={() => handleExportCSV('vendors')}
                  className="p-3 rounded-2xl bg-white border border-[#178A52]/30 hover:border-[#178A52] shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-5 h-5 text-[#E3A82B]" />
                  <span className="text-xs font-bold text-[#04231A]">{isUrdu ? 'دکاندار ڈائرکٹری CSV' : 'Vendors CSV'}</span>
                </button>
              </div>

              {/* Reset to Seed Action */}
              <div className="mt-6 pt-6 border-t border-[#F6F2E7] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-xs text-[#B03A2E]">
                    {isUrdu ? 'ڈیٹا بیس کو بنیادی سرکاری حالت پر ری سیٹ کریں' : 'Reset Database to Seed State'}
                  </h5>
                  <p className="text-[11px] text-[#5C6F63] font-urdu">
                    تمام ٹیسٹ ڈیٹا ختم کر کے 30 زونز اور مصدقہ ڈی سی ریٹس بحال ہو جائیں گے۔
                  </p>
                </div>

                <button
                  onClick={onResetSeedData}
                  className="bg-[#B03A2E] hover:bg-[#B03A2E]/90 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'ری سیٹ کریں' : 'Reset Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. POLICY SANDBOX ================= */}
      {isPolicyTab && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#178A52] text-white flex items-center justify-center shadow">
                <Settings className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'پالیسی سینڈ باکس و اقتصادی سیمولیشن' : 'Policy Sandbox & Subsidy Simulator'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  قیمتوں میں تبدیلی اور سبسڈی کے اثرات کا حقیقی وقت میں تخمینہ لگائیں۔
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-[#178A52]/20 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-xs text-[#04231A]">
                    {isUrdu ? 'آٹا 10 کلو سرکاری ریٹ ایڈجسٹمنٹ (Rs.)' : '10kg Flour Price Ceiling Adjustment'}
                  </label>
                  <span className="font-sora font-extrabold text-base text-[#178A52]">
                    Rs. {flourSubsidySlider}
                  </span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="1800"
                  step="10"
                  value={flourSubsidySlider}
                  onChange={(e) => setFlourSubsidySlider(Number(e.target.value))}
                  className="w-full accent-[#178A52]"
                />
                <p className="text-[11px] text-[#5C6F63] font-urdu">
                  تخمینہ اثر: عوام کو ماہانہ 18 کروڑ روپے ریلیف ملے گا؛ مارکیٹ تعمیل 97% متوقع۔
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. GOV WHY & HOW SOPs ================= */}
      {isWhyHowTab && (
        <div className="space-y-6">
          <div className="bg-[#FCFAF3] rounded-3xl p-6 sm:p-8 border border-[#178A52]/20 shadow-xl text-[#132A21]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F6F2E7]">
              <div className="w-12 h-12 rounded-2xl bg-[#04231A] text-white flex items-center justify-center shadow">
                <ShieldCheck className="w-6 h-6 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? 'حکومتی و ضلعی گورننس فریم ورک (VRF 2026)' : 'District Administration Governance SOPs'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  شفافیت، اوپن ڈیٹا اور ریپڈ پبلک سروس ڈیلیوری کے اہم ستون
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#0B4A31] text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="font-bold text-sm text-[#04231A] font-urdu">{isUrdu ? '30 زونز کی لائیو مانیٹرنگ' : '30-Zone Command'}</h4>
                <p className="text-xs text-[#5C6F63] font-urdu leading-relaxed">
                  ہر زون میں تعمیل کی شرح اور فعال مجسٹریٹ اسکواڈز کی حقیقی وقت کی کارکردگی کا جائزہ۔
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#178A52] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="font-bold text-sm text-[#04231A] font-urdu">{isUrdu ? 'اوپن ڈیٹا و CSV برآمدگی' : 'Open Data & CSV Export'}</h4>
                <p className="text-xs text-[#5C6F63] font-urdu leading-relaxed">
                  ڈی سی ریٹس، تصدیق شدہ شکایات اور چالان ریکارڈ ایک کلک پر اوپن ڈیٹا اور شفاف آڈٹ کے لیے دستیاب ہیں۔
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#3D7EA6] text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="font-bold text-sm text-[#04231A] font-urdu">{isUrdu ? 'اقتصادی پالیسی سیمولیشن' : 'Policy Sandbox'}</h4>
                <p className="text-xs text-[#5C6F63] font-urdu leading-relaxed">
                  سرکاری قیمتوں اور سبسڈی ایڈجسٹمنٹ کے عوامی و تجارتی اثرات کی پیشگی پیشگوئی۔
                </p>
              </div>
            </div>
          </div>

          {/* Master Why & How Interactive Accordion Hub */}
          <WhyAndHowQA lang={lang} />
        </div>
      )}

      {/* GOVERNMENT OFFICIAL OUTREACH MODAL */}
      <GovernmentVendorOutreachModal
        isOpen={outreachModalOpen}
        onClose={() => setOutreachModalOpen(false)}
        vendor={selectedVendorForOutreach}
        lang={lang}
      />
    </div>
  );
};
