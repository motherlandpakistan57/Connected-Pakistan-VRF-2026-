import React, { useState } from 'react';
import { 
  X, Save, Download, Upload, RefreshCw, Plus, Trash2, Edit3, 
  Check, CheckCircle2, AlertTriangle, Users, ShoppingBag, Store, 
  Shield, FileText, Map, Settings, Database, Camera, Sparkles,
  ArrowRight, Search, Copy
} from 'lucide-react';
import { 
  Language, DCRateItem, VendorProfile, CitizenReport, Citation, 
  FieldTask, ZoneItem, PlatformConfig, TeamMember 
} from '../types';
import { 
  INITIAL_DC_RATES, INITIAL_VENDORS, INITIAL_CITIZEN_REPORTS, 
  INITIAL_CITATIONS, INITIAL_FIELD_TASKS, INITIAL_ZONES, 
  INITIAL_PLATFORM_CONFIG, INITIAL_TEAM_MEMBERS 
} from '../data/seedData';
import { BrandLogo } from './BrandLogo';

interface PlatformDataEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  dcRates: DCRateItem[];
  onUpdateDcRates: (rates: DCRateItem[]) => void;
  vendors: VendorProfile[];
  onUpdateVendors: (vendors: VendorProfile[]) => void;
  reports: CitizenReport[];
  onUpdateReports: (reports: CitizenReport[]) => void;
  fieldTasks: FieldTask[];
  onUpdateFieldTasks: (tasks: FieldTask[]) => void;
  zones: ZoneItem[];
  onUpdateZones: (zones: ZoneItem[]) => void;
  platformConfig: PlatformConfig;
  onUpdatePlatformConfig: (config: PlatformConfig) => void;
  teamMembers: TeamMember[];
  onUpdateTeamMembers: (team: TeamMember[]) => void;
}

type EditorTab = 'team' | 'rates' | 'vendors' | 'tasks' | 'reports' | 'zones' | 'config' | 'json';

export const PlatformDataEditorModal: React.FC<PlatformDataEditorModalProps> = ({
  isOpen,
  onClose,
  lang,
  dcRates,
  onUpdateDcRates,
  vendors,
  onUpdateVendors,
  reports,
  onUpdateReports,
  fieldTasks,
  onUpdateFieldTasks,
  zones,
  onUpdateZones,
  platformConfig,
  onUpdatePlatformConfig,
  teamMembers,
  onUpdateTeamMembers,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<string>('Auto-Saved ✓');
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccess, setJsonSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUrdu = lang === 'ur';

  const triggerSaveNotice = () => {
    setSaveStatus('Saving changes...');
    setTimeout(() => {
      setSaveStatus('Auto-Saved ✓');
    }, 400);
  };

  // ================= 1. TEAM MANAGEMENT =================
  const handleUpdateTeamMember = (id: string, field: keyof TeamMember, val: any) => {
    const updated = teamMembers.map(m => m.id === id ? { ...m, [field]: val } : m);
    onUpdateTeamMembers(updated);
    triggerSaveNotice();
  };

  const handleAddTeamMember = () => {
    const newId = `team-${Date.now()}`;
    const newMember: TeamMember = {
      id: newId,
      name: 'New Team Lead',
      nameUrdu: 'نیا ٹیم رکن',
      role: 'Civic Specialist',
      roleUrdu: 'شہری امور کے ماہر',
      badge: 'Civic Lead',
      badgeUrdu: 'شہری رکن',
      avatar: 'PK',
      photoUrl: undefined,
      tagline: 'Dedicated to national transparent governance and citizen welfare.',
      taglineUrdu: 'قومی شفاف گورننس اور عوامی فلاح و بہبود کے لیے پرعزم۔',
      welcomeMessage: 'Welcome to Connected Pakistan VRF platform.',
      welcomeMessageUrdu: 'کنیکٹڈ پاکستان وی آر ایف پلیٹ فارم پر خوش آمدید۔',
      isLead: false,
    };
    onUpdateTeamMembers([...teamMembers, newMember]);
    triggerSaveNotice();
  };

  const handleDeleteTeamMember = (id: string) => {
    if (teamMembers.length <= 1) {
      alert('At least one team member must remain.');
      return;
    }
    const updated = teamMembers.filter(m => m.id !== id);
    onUpdateTeamMembers(updated);
    triggerSaveNotice();
  };

  const handlePhotoUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      handleUpdateTeamMember(id, 'photoUrl', base64Url);
    };
    reader.readAsDataURL(file);
  };

  // ================= 2. DC RATES MANAGEMENT =================
  const handleUpdateRate = (id: string, field: keyof DCRateItem, val: any) => {
    const updated = dcRates.map(r => {
      if (r.id === id) {
        const next = { ...r, [field]: val };
        // Recalculate deviation if dcRate or marketAvg changed
        if (field === 'dcRate' || field === 'marketAvg') {
          const dc = field === 'dcRate' ? Number(val) || 1 : r.dcRate;
          const mkt = field === 'marketAvg' ? Number(val) || 0 : r.marketAvg;
          next.deviationPct = Number((((mkt - dc) / dc) * 100).toFixed(2));
        }
        return next;
      }
      return r;
    });
    onUpdateDcRates(updated);
    triggerSaveNotice();
  };

  const handleAddRate = () => {
    const newId = `rate-${Date.now()}`;
    const newItem: DCRateItem = {
      id: newId,
      nameEn: 'Fresh Item (Grade A)',
      nameUrdu: 'نئی سرکاری چیز',
      categoryEn: 'Vegetables',
      categoryUrdu: 'سبزیاں',
      dcRate: 100,
      marketAvg: 105,
      unitEn: 'per kg',
      unitUrdu: 'فی کلو',
      lastUpdated: 'Just now',
      deviationPct: 5.0,
    };
    onUpdateDcRates([newItem, ...dcRates]);
    triggerSaveNotice();
  };

  const handleDeleteRate = (id: string) => {
    if (confirm(isUrdu ? 'کیا آپ اس آئٹم کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this commodity?')) {
      onUpdateDcRates(dcRates.filter(r => r.id !== id));
      triggerSaveNotice();
    }
  };

  // ================= 3. VENDOR MANAGEMENT =================
  const handleUpdateVendor = (id: string, field: keyof VendorProfile, val: any) => {
    const updated = vendors.map(v => v.id === id ? { ...v, [field]: val } : v);
    onUpdateVendors(updated);
    triggerSaveNotice();
  };

  const handleAddVendor = () => {
    const newId = `ven-${Date.now()}`;
    const newVendor: VendorProfile = {
      id: newId,
      name: 'New Registered Vendor',
      nameUrdu: 'نیا رجسٹرڈ دکاندار',
      shopName: 'Green Fresh Stall',
      shopNameUrdu: 'گرین فریش اسٹال',
      marketName: 'Raja Bazaar Zone 1',
      marketNameUrdu: 'راجہ بازار زون 1',
      cnic: '37405-1234567-1',
      phone: '0300-1234567',
      slotNumber: `S-${Math.floor(10 + Math.random() * 90)}`,
      zone: 'Zone 1 (Rawalpindi)',
      score: 8.5,
      wastePoints: 240,
      creditScore: 720,
      badge: 'green',
      shiftTime: '08:00 AM - 04:00 PM',
      shiftExpiry: '2026-12-31',
      isInsideGeofence: true,
    };
    onUpdateVendors([newVendor, ...vendors]);
    triggerSaveNotice();
  };

  const handleDeleteVendor = (id: string) => {
    if (confirm(isUrdu ? 'کیا آپ اس دکاندار کو لسٹ سے خارج کرنا چاہتے ہیں؟' : 'Delete this vendor profile?')) {
      onUpdateVendors(vendors.filter(v => v.id !== id));
      triggerSaveNotice();
    }
  };

  // ================= 4. FIELD TASKS =================
  const handleUpdateTask = (id: string, field: keyof FieldTask, val: any) => {
    const updated = fieldTasks.map(t => t.id === id ? { ...t, [field]: val } : t);
    onUpdateFieldTasks(updated);
    triggerSaveNotice();
  };

  const handleAddTask = () => {
    const newId = `task-${Date.now()}`;
    const newTask: FieldTask = {
      id: newId,
      titleEn: 'Inspect Wholesale Arrivals & Spot Rates',
      titleUrdu: 'منڈی آمد اور سرکاری نرخوں کی اسپاٹ چیکنگ',
      zone: 'Zone 1 (Raja Bazaar)',
      market: 'Central Market',
      completed: false,
    };
    onUpdateFieldTasks([...fieldTasks, newTask]);
    triggerSaveNotice();
  };

  const handleDeleteTask = (id: string) => {
    onUpdateFieldTasks(fieldTasks.filter(t => t.id !== id));
    triggerSaveNotice();
  };

  // ================= 5. CITIZEN REPORTS =================
  const handleUpdateReport = (id: string, field: keyof CitizenReport, val: any) => {
    const updated = reports.map(r => r.id === id ? { ...r, [field]: val } : r);
    onUpdateReports(updated);
    triggerSaveNotice();
  };

  const handleDeleteReport = (id: string) => {
    onUpdateReports(reports.filter(r => r.id !== id));
    triggerSaveNotice();
  };

  // ================= 6. ZONES =================
  const handleUpdateZone = (id: string, field: keyof ZoneItem, val: any) => {
    const updated = zones.map(z => z.id === id ? { ...z, [field]: val } : z);
    onUpdateZones(updated);
    triggerSaveNotice();
  };

  const handleAddZone = () => {
    const newId = `zone-${Date.now()}`;
    const newZone: ZoneItem = {
      id: newId,
      nameEn: 'Zone 31 (New Commercial Corridor)',
      nameUrdu: 'زون 31 (نیا تجارتی کوریڈور)',
      district: 'Rawalpindi',
      complianceRate: 92,
      totalVendors: 45,
      activePatrols: 3,
      status: 'green',
      inspectorInCharge: 'Inspector PERA-901',
    };
    onUpdateZones([...zones, newZone]);
    triggerSaveNotice();
  };

  const handleDeleteZone = (id: string) => {
    onUpdateZones(zones.filter(z => z.id !== id));
    triggerSaveNotice();
  };

  // ================= 7. PLATFORM CONFIG =================
  const handleUpdateConfig = (field: keyof PlatformConfig, val: string) => {
    const updated = { ...platformConfig, [field]: val };
    onUpdatePlatformConfig(updated);
    triggerSaveNotice();
  };

  // ================= 8. JSON BACKUP & RESTORE =================
  const getAllPlatformData = () => {
    return {
      version: 'VRF-2026.1',
      exportedAt: new Date().toISOString(),
      platformConfig,
      teamMembers,
      dcRates,
      vendors,
      reports,
      fieldTasks,
      zones,
    };
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getAllPlatformData(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `connected-pakistan-vrf-data-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(getAllPlatformData(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportJson = () => {
    setJsonError(null);
    setJsonSuccess(null);
    try {
      if (!jsonInput.trim()) {
        setJsonError('Please paste valid JSON data into the text box.');
        return;
      }
      const parsed = JSON.parse(jsonInput);

      if (parsed.platformConfig) onUpdatePlatformConfig(parsed.platformConfig);
      if (Array.isArray(parsed.teamMembers)) onUpdateTeamMembers(parsed.teamMembers);
      if (Array.isArray(parsed.dcRates)) onUpdateDcRates(parsed.dcRates);
      if (Array.isArray(parsed.vendors)) onUpdateVendors(parsed.vendors);
      if (Array.isArray(parsed.reports)) onUpdateReports(parsed.reports);
      if (Array.isArray(parsed.fieldTasks)) onUpdateFieldTasks(parsed.fieldTasks);
      if (Array.isArray(parsed.zones)) onUpdateZones(parsed.zones);

      setJsonSuccess('✓ Platform records successfully updated and restored!');
      triggerSaveNotice();
    } catch (e: any) {
      setJsonError('Invalid JSON format: ' + (e.message || 'Syntax Error'));
    }
  };

  const handleResetToDefaults = () => {
    if (confirm(isUrdu ? 'کیا آپ تمام ڈیٹا کو ابتدائی ڈیفالٹ پر ری سیٹ کرنا چاہتے ہیں؟' : 'Reset all records to factory defaults?')) {
      onUpdateDcRates(INITIAL_DC_RATES);
      onUpdateVendors(INITIAL_VENDORS);
      onUpdateReports(INITIAL_CITIZEN_REPORTS);
      onUpdateFieldTasks(INITIAL_FIELD_TASKS);
      onUpdateZones(INITIAL_ZONES);
      onUpdatePlatformConfig(INITIAL_PLATFORM_CONFIG);
      onUpdateTeamMembers(INITIAL_TEAM_MEMBERS);
      localStorage.removeItem('cp_dc_rates');
      localStorage.removeItem('cp_vendors');
      localStorage.removeItem('cp_reports');
      localStorage.removeItem('cp_field_tasks');
      localStorage.removeItem('cp_zones');
      localStorage.removeItem('cp_platform_config');
      localStorage.removeItem('cp_custom_team_data');
      triggerSaveNotice();
      alert(isUrdu ? 'تمام ڈیٹا کامیابی سے ری سیٹ کر دیا گیا ہے۔' : 'Platform data successfully reset to verified defaults.');
    }
  };

  // Nav Items
  const tabs = [
    { id: 'team', labelEn: '🇵🇰 Team & Leadership', labelUrdu: '🇵🇰 قیادت و ٹیم پروفائلز', icon: Users, count: teamMembers.length },
    { id: 'rates', labelEn: '🏷️ Official DC Rates', labelUrdu: '🏷️ سرکاری ڈی سی ریٹس', icon: ShoppingBag, count: dcRates.length },
    { id: 'vendors', labelEn: '🏪 Registered Vendors', labelUrdu: '🏪 رجسٹرڈ دکاندار و سلاٹس', icon: Store, count: vendors.length },
    { id: 'tasks', labelEn: '🛡️ Field Tasks & Squads', labelUrdu: '🛡️ فیلڈ ٹاسک و مجسٹریٹ', icon: Shield, count: fieldTasks.length },
    { id: 'reports', labelEn: '📢 Citizen Reports', labelUrdu: '📢 عوامی شکایات و چالان', icon: FileText, count: reports.length },
    { id: 'zones', labelEn: '🗺️ GIS Zones & Corridors', labelUrdu: '🗺️ جغرافیائی 30 زونز', icon: Map, count: zones.length },
    { id: 'config', labelEn: '🏛️ District & Info Config', labelUrdu: '🏛️ ضلعی تفصیلات و ہیلپ لائن', icon: Settings },
    { id: 'json', labelEn: '💾 Backup, Export & JSON', labelUrdu: '💾 ڈیٹا بیک اپ و امپورٹ', icon: Database },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div 
        className="bg-white text-slate-900 w-full max-w-6xl h-[94vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between border-b border-slate-800 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo variant="dark" size="sm" showSubtitle={false} />
            <div className="hidden sm:block h-8 w-px bg-slate-700" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {isUrdu ? 'پلیٹ فارم مکمل ڈیٹا ایڈیٹر و ریکارڈ مینیجر' : 'Master Platform Data & Record Editor'}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/40">
                  {saveStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isUrdu ? 'کسی بھی ٹیم، ریٹس، دکاندار یا ضلعی تفصیلات میں ترمیم کریں — تمام تبدیلیاں خودکار محفوظ ہوتی ہیں۔' : 'Edit any team profile, DC price ceiling, vendor stall, or district contact details. All changes save live.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
              title="Download JSON Backup"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isUrdu ? 'بیک اپ ڈاؤنلوڈ' : 'Backup JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-thin">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as EditorTab);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isCurrent 
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30' 
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                <span>{isUrdu ? tab.labelUrdu : tab.labelEn}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isCurrent ? 'bg-emerald-900/60 text-emerald-200' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50">
          
          {/* ================= TAB 1: TEAM & LEADERSHIP ================= */}
          {activeTab === 'team' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isUrdu ? 'قومی وژنری لیڈ اور ٹیم اراکین کی تفصیلات' : 'National Visionary Lead & Team Details'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'نام، تصاویر، کردار، بیجز اور صوتی پیغامات کو حسبِ ضرورت اپ ڈیٹ کریں۔' : 'Update names, roles, custom photos, taglines, and bilingual voice welcome greetings.'}
                  </p>
                </div>

                <button
                  onClick={handleAddTeamMember}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'نیا ٹیم ممبر شامل کریں' : 'Add Team Member'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member, idx) => (
                  <div 
                    key={member.id}
                    className={`p-5 rounded-2xl border bg-white shadow-xs transition-all ${
                      member.isLead ? 'border-emerald-500 ring-2 ring-emerald-500/20 md:col-span-2' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {/* Photo Box with Direct Click Upload */}
                        <div className="relative group">
                          {member.photoUrl ? (
                            <img 
                              src={member.photoUrl} 
                              alt={member.name}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs" 
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-900 border-2 border-emerald-400 flex items-center justify-center font-bold text-xl">
                              {member.avatar || 'PK'}
                            </div>
                          )}

                          <label 
                            htmlFor={`team-upload-${member.id}`}
                            className="absolute inset-0 bg-slate-950/60 text-white opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-opacity text-[9px] font-bold p-1 text-center"
                          >
                            <Camera className="w-4 h-4 mb-0.5" />
                            <span>Upload</span>
                          </label>
                          <input 
                            id={`team-upload-${member.id}`}
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handlePhotoUpload(member.id, e.target.files[0]);
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              #{idx + 1} {member.name}
                            </span>
                            {member.isLead && (
                              <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                National Lead
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-emerald-700 font-semibold block">{member.role}</span>
                          <span className="text-[11px] text-slate-500 font-urdu">{member.nameUrdu} — {member.roleUrdu}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {member.photoUrl && (
                          <button
                            onClick={() => handleUpdateTeamMember(member.id, 'photoUrl', undefined)}
                            className="text-xs text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
                            title="Remove Photo"
                          >
                            Remove Pic
                          </button>
                        )}
                        {!member.isLead && (
                          <button
                            onClick={() => handleDeleteTeamMember(member.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Name (English):</label>
                        <input 
                          type="text" 
                          value={member.name}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">نام (اردو):</label>
                        <input 
                          type="text" 
                          value={member.nameUrdu}
                          dir="rtl"
                          onChange={(e) => handleUpdateTeamMember(member.id, 'nameUrdu', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 font-urdu focus:bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Role / Designation (English):</label>
                        <input 
                          type="text" 
                          value={member.role}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'role', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">عہدہ و ذمہ داری (اردو):</label>
                        <input 
                          type="text" 
                          value={member.roleUrdu}
                          dir="rtl"
                          onChange={(e) => handleUpdateTeamMember(member.id, 'roleUrdu', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 font-urdu focus:bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Badge Title (English):</label>
                        <input 
                          type="text" 
                          value={member.badge}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'badge', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Avatar Initials:</label>
                        <input 
                          type="text" 
                          value={member.avatar}
                          maxLength={3}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'avatar', e.target.value.toUpperCase())}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 font-mono uppercase"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Direct Image URL (Optional):</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/photo.jpg"
                          value={member.photoUrl || ''}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'photoUrl', e.target.value || undefined)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Vision Statement / Tagline (English):</label>
                        <textarea 
                          rows={2}
                          value={member.tagline}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'tagline', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">وژن کا خلاصہ (اردو):</label>
                        <textarea 
                          rows={2}
                          dir="rtl"
                          value={member.taglineUrdu}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'taglineUrdu', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 font-urdu focus:bg-white focus:outline-none focus:border-emerald-600 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Voice Welcome Audio Script (English):</label>
                        <input 
                          type="text" 
                          value={member.welcomeMessage}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'welcomeMessage', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">صوتی خوش آمدیدی پیغام (اردو):</label>
                        <input 
                          type="text" 
                          dir="rtl"
                          value={member.welcomeMessageUrdu}
                          onChange={(e) => handleUpdateTeamMember(member.id, 'welcomeMessageUrdu', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 font-urdu focus:bg-white focus:outline-none focus:border-emerald-600 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: OFFICIAL DC RATES ================= */}
          {activeTab === 'rates' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder={isUrdu ? 'آئٹم تلاش کریں...' : 'Search commodity rates...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 w-64 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-bold">
                    {dcRates.length} {isUrdu ? 'سرکاری اشیاء' : 'Ceiling Items'}
                  </span>
                </div>

                <button
                  onClick={handleAddRate}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'نئی چیز شامل کریں' : 'Add New Item'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {dcRates
                  .filter(r => 
                    r.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    r.nameUrdu.includes(searchQuery) ||
                    r.categoryEn.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((rate, idx) => (
                    <div 
                      key={rate.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900">{rate.nameEn}</span>
                          <span className="text-xs text-slate-500 font-urdu">({rate.nameUrdu})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rate.deviationPct > 10 ? 'bg-rose-100 text-rose-800' :
                            rate.deviationPct > 0 ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {rate.deviationPct > 0 ? `+${rate.deviationPct}%` : `${rate.deviationPct}%`} Var
                          </span>
                          <button
                            onClick={() => handleDeleteRate(rate.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Name (EN):</label>
                          <input 
                            type="text" 
                            value={rate.nameEn}
                            onChange={(e) => handleUpdateRate(rate.id, 'nameEn', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">نام (اردو):</label>
                          <input 
                            type="text" 
                            dir="rtl"
                            value={rate.nameUrdu}
                            onChange={(e) => handleUpdateRate(rate.id, 'nameUrdu', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800 font-urdu focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-emerald-700 block mb-0.5">Official DC Rate (Rs):</label>
                          <input 
                            type="number" 
                            value={rate.dcRate}
                            onChange={(e) => handleUpdateRate(rate.id, 'dcRate', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded font-bold text-emerald-950 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Market Avg (Rs):</label>
                          <input 
                            type="number" 
                            value={rate.marketAvg}
                            onChange={(e) => handleUpdateRate(rate.id, 'marketAvg', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Unit (EN / UR):</label>
                          <div className="flex gap-1">
                            <input 
                              type="text" 
                              value={rate.unitEn}
                              placeholder="per kg"
                              onChange={(e) => handleUpdateRate(rate.id, 'unitEn', e.target.value)}
                              className="w-1/2 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-[10px]"
                            />
                            <input 
                              type="text" 
                              dir="rtl"
                              value={rate.unitUrdu}
                              placeholder="فی کلو"
                              onChange={(e) => handleUpdateRate(rate.id, 'unitUrdu', e.target.value)}
                              className="w-1/2 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-urdu"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Category:</label>
                          <input 
                            type="text" 
                            value={rate.categoryEn}
                            onChange={(e) => handleUpdateRate(rate.id, 'categoryEn', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800 text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: REGISTERED VENDORS ================= */}
          {activeTab === 'vendors' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder={isUrdu ? 'دکاندار تلاش کریں...' : 'Search vendors, CNIC or slot...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 w-64 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-bold">
                    {vendors.length} {isUrdu ? 'رجسٹرڈ دکاندار' : 'Vendors Registered'}
                  </span>
                </div>

                <button
                  onClick={handleAddVendor}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'نیا دکاندار رجسٹر کریں' : 'Register New Vendor'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {vendors
                  .filter(v => 
                    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    v.nameUrdu.includes(searchQuery) ||
                    v.cnic.includes(searchQuery) ||
                    v.slotNumber.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((vendor, idx) => (
                    <div 
                      key={vendor.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900">{vendor.name}</span>
                          <span className="text-xs text-slate-500 font-urdu">({vendor.nameUrdu})</span>
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                            Slot {vendor.slotNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            vendor.badge === 'green' ? 'bg-emerald-100 text-emerald-800' :
                            vendor.badge === 'silver' ? 'bg-slate-200 text-slate-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {vendor.badge} Badge
                          </span>
                          <button
                            onClick={() => handleDeleteVendor(vendor.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Vendor Name (EN):</label>
                          <input 
                            type="text" 
                            value={vendor.name}
                            onChange={(e) => handleUpdateVendor(vendor.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">نام (اردو):</label>
                          <input 
                            type="text" 
                            dir="rtl"
                            value={vendor.nameUrdu}
                            onChange={(e) => handleUpdateVendor(vendor.id, 'nameUrdu', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800 font-urdu"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Stall / Market:</label>
                          <input 
                            type="text" 
                            value={vendor.marketName}
                            onChange={(e) => handleUpdateVendor(vendor.id, 'marketName', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">CNIC No:</label>
                          <input 
                            type="text" 
                            value={vendor.cnic}
                            onChange={(e) => handleUpdateVendor(vendor.id, 'cnic', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-emerald-700 block mb-0.5">Score (0-10):</label>
                          <input 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="10"
                            value={vendor.score}
                            onChange={(e) => handleUpdateVendor(vendor.id, 'score', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded font-bold text-emerald-950"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Credit Score (/850):</label>
                          <input 
                            type="number" 
                            value={vendor.creditScore}
                            onChange={(e) => handleUpdateVendor(vendor.id, 'creditScore', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: FIELD TASKS & SQUADS ================= */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isUrdu ? 'پیرہ فیلڈ ڈیوٹی اسائنمنٹس و اسکواڈ ایکشن لسٹ' : 'PERA Field Patrol Tasks & Squad Assignments'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'انسپکٹرز کے تفویض کردہ ٹاسکس میں ترمیم کریں یا نیا معائنہ شامل کریں۔' : 'Manage on-ground patrol duties, market spot inspection orders, and squad targets.'}
                  </p>
                </div>

                <button
                  onClick={handleAddTask}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'نیا ٹاسک تفویض کریں' : 'Assign New Task'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {fieldTasks.map((task, idx) => (
                  <div 
                    key={task.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-1.5">
                        <input 
                          type="text" 
                          value={task.titleEn}
                          onChange={(e) => handleUpdateTask(task.id, 'titleEn', e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded font-semibold text-xs text-slate-900"
                        />
                        <input 
                          type="text" 
                          dir="rtl"
                          value={task.titleUrdu}
                          onChange={(e) => handleUpdateTask(task.id, 'titleUrdu', e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-xs text-slate-900 font-urdu"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Zone / Market"
                        value={task.zone}
                        onChange={(e) => handleUpdateTask(task.id, 'zone', e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono w-40"
                      />

                      <button
                        onClick={() => handleUpdateTask(task.id, 'completed', !task.completed)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          task.completed 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {task.completed ? 'Completed ✓' : 'Pending'}
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: CITIZEN REPORTS ================= */}
          {activeTab === 'reports' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isUrdu ? 'عوامی شکایات کا لائیو ریکارڈ و اسٹیٹس' : 'Citizen Overpricing Reports & Dispatch Log'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'شکایات کی تصدیق، ڈسپیچ یا حل شدہ اسٹیٹس کو کنٹرول کریں۔' : 'Inspect, edit overcharge variances, or modify resolution statuses.'}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  {reports.length} {isUrdu ? 'شکایات درج ہیں' : 'Total Reports'}
                </span>
              </div>

              <div className="space-y-3">
                {reports.map((rep, idx) => (
                  <div 
                    key={rep.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {rep.id}
                        </span>
                        <span className="font-extrabold text-xs text-slate-900">{rep.item}</span>
                        <span className="text-xs text-slate-500">@ {rep.marketName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select 
                          value={rep.status}
                          onChange={(e) => handleUpdateReport(rep.id, 'status', e.target.value as any)}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none"
                        >
                          <option value="received">Received (موصول)</option>
                          <option value="verified">Verified (تصدیق شدہ)</option>
                          <option value="dispatched">Dispatched (اسکواڈ روانہ)</option>
                          <option value="resolved">Resolved (حل شدہ)</option>
                        </select>

                        <button
                          onClick={() => handleDeleteReport(rep.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Item Name:</label>
                        <input 
                          type="text" 
                          value={rep.item}
                          onChange={(e) => handleUpdateReport(rep.id, 'item', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Vendor / Market:</label>
                        <input 
                          type="text" 
                          value={rep.vendorName}
                          onChange={(e) => handleUpdateReport(rep.id, 'vendorName', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-emerald-700 block mb-0.5">Official DC Rate (Rs):</label>
                        <input 
                          type="number" 
                          value={rep.dcRate}
                          onChange={(e) => handleUpdateReport(rep.id, 'dcRate', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded font-bold text-emerald-950"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-rose-700 block mb-0.5">Charged Price (Rs):</label>
                        <input 
                          type="number" 
                          value={rep.chargedPrice}
                          onChange={(e) => handleUpdateReport(rep.id, 'chargedPrice', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-rose-50 border border-rose-300 rounded font-bold text-rose-950"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 6: GIS ZONES ================= */}
          {activeTab === 'zones' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isUrdu ? 'جغرافیائی 30 زونز اور کوریڈور مینجمنٹ' : 'Geospatial 30 Zones & Municipal Corridor Registry'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'تمام ضلعی زونز، گنجائش اور معائنہ ٹیموں کو منظم کریں۔' : 'Configure designated vendor capacity, compliance index, and assigned PERA officers.'}
                  </p>
                </div>

                <button
                  onClick={handleAddZone}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'نیا زون شامل کریں' : 'Add New Zone'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {zones.map((zone, idx) => (
                  <div 
                    key={zone.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-xs text-slate-900">{zone.nameEn}</span>
                        <span className="text-xs text-slate-500 font-urdu">({zone.nameUrdu})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select 
                          value={zone.status}
                          onChange={(e) => handleUpdateZone(zone.id, 'status', e.target.value as any)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border uppercase ${
                            zone.status === 'green' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            zone.status === 'yellow' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="green">Green (Compliant)</option>
                          <option value="yellow">Yellow (Moderate)</option>
                          <option value="red">Red (Critical Attention)</option>
                        </select>

                        <button
                          onClick={() => handleDeleteZone(zone.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Zone Name (EN):</label>
                        <input 
                          type="text" 
                          value={zone.nameEn}
                          onChange={(e) => handleUpdateZone(zone.id, 'nameEn', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">نام (اردو):</label>
                        <input 
                          type="text" 
                          dir="rtl"
                          value={zone.nameUrdu}
                          onChange={(e) => handleUpdateZone(zone.id, 'nameUrdu', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800 font-urdu"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Total Vendors Slot Capacity:</label>
                        <input 
                          type="number" 
                          value={zone.totalVendors}
                          onChange={(e) => handleUpdateZone(zone.id, 'totalVendors', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Compliance Rate (%):</label>
                        <input 
                          type="number" 
                          value={zone.complianceRate}
                          onChange={(e) => handleUpdateZone(zone.id, 'complianceRate', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded font-bold text-emerald-950"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 7: DISTRICT & PLATFORM CONFIG ================= */}
          {activeTab === 'config' && (
            <div className="space-y-6 max-w-4xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isUrdu ? 'ضلعی و انتظامی تفصیلات اور ہیلپ لائنز' : 'District, Government Administration & Official Contacts'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'ضلع کا نام، ڈپٹی کمشنر کی تفصیل، رابطہ نمبرز اور کریڈٹ لائنز میں ترمیم کریں۔' : 'Customize platform portal title, district names, DC office contacts, helplines, and attribution.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Portal Title (English):</label>
                  <input 
                    type="text" 
                    value={platformConfig.portalTitleEn}
                    onChange={(e) => handleUpdateConfig('portalTitleEn', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">پورٹل کا عنوان (اردو):</label>
                  <input 
                    type="text" 
                    dir="rtl"
                    value={platformConfig.portalTitleUrdu}
                    onChange={(e) => handleUpdateConfig('portalTitleUrdu', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 font-urdu focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">District / City (English):</label>
                  <input 
                    type="text" 
                    value={platformConfig.districtNameEn}
                    onChange={(e) => handleUpdateConfig('districtNameEn', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">ضلع و شہر (اردو):</label>
                  <input 
                    type="text" 
                    dir="rtl"
                    value={platformConfig.districtNameUrdu}
                    onChange={(e) => handleUpdateConfig('districtNameUrdu', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 font-urdu"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Deputy Commissioner (Name & Rank):</label>
                  <input 
                    type="text" 
                    value={platformConfig.dcNameEn}
                    onChange={(e) => handleUpdateConfig('dcNameEn', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">ڈپٹی کمشنر (نام و عہدہ):</label>
                  <input 
                    type="text" 
                    dir="rtl"
                    value={platformConfig.dcNameUrdu}
                    onChange={(e) => handleUpdateConfig('dcNameUrdu', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 font-urdu"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Helpline Phone:</label>
                  <input 
                    type="text" 
                    value={platformConfig.helplinePhone}
                    onChange={(e) => handleUpdateConfig('helplinePhone', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">WhatsApp Complaints Hotline:</label>
                  <input 
                    type="text" 
                    value={platformConfig.whatsappEmergency}
                    onChange={(e) => handleUpdateConfig('whatsappEmergency', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Deputy Commissioner Complex Address:</label>
                  <input 
                    type="text" 
                    value={platformConfig.officeAddressEn}
                    onChange={(e) => handleUpdateConfig('officeAddressEn', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Standard Vision Attribution:</label>
                  <input 
                    type="text" 
                    value={platformConfig.visionAttributionEn}
                    onChange={(e) => handleUpdateConfig('visionAttributionEn', e.target.value)}
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl font-bold text-emerald-950"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Team Credit:</label>
                  <input 
                    type="text" 
                    value={platformConfig.teamNameEn}
                    onChange={(e) => handleUpdateConfig('teamNameEn', e.target.value)}
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl font-bold text-emerald-950"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 8: JSON BACKUP & RESTORE ================= */}
          {activeTab === 'json' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {isUrdu ? 'ڈیٹا ایکسپورٹ، بیک اپ اور فائل امپورٹ' : 'Full JSON Backup, Data Export & Restore'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isUrdu ? 'تمام پلیٹ فارم ڈیٹا کو ایک فائل کے طور پر محفوظ کریں یا کسٹم ڈیٹا لوڈ کریں۔' : 'Export complete platform snapshot to a portable JSON backup or import records directly.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportJson}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isUrdu ? 'بیک اپ فائل ڈاؤنلوڈ' : 'Download JSON'}</span>
                    </button>

                    <button
                      onClick={handleCopyJson}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isUrdu ? 'کسٹم جے ایس او این ڈیٹا یہاں پیسٹ کریں اور امپورٹ پر کلک کریں:' : 'Paste JSON dataset below to restore or overwrite records:'}
                  </label>
                  <textarea 
                    rows={10}
                    placeholder='{"platformConfig": {...}, "dcRates": [...], "teamMembers": [...]}'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {jsonError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{jsonError}</span>
                  </div>
                )}

                {jsonSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{jsonSuccess}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleImportJson}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-sm transition-transform active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUrdu ? 'جے ایس او این امپورٹ کریں' : 'Import & Apply JSON'}</span>
                  </button>

                  <button
                    onClick={handleResetToDefaults}
                    className="flex items-center gap-1.5 px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors border border-rose-200"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'فیکٹری ڈیفالٹ پر ری سیٹ کریں' : 'Reset to Factory Defaults'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">
              {isUrdu ? 'تمام تبدیلیاں آپ کے براؤزر کے محفوظ اسٹوریج میں لائیو اپ ڈیٹ ہو رہی ہیں۔' : 'Live Synchronization active: All records persist in your local storage.'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-transform active:scale-95"
          >
            {isUrdu ? 'مکمل و محفوظ کریں (Done)' : 'Done & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
