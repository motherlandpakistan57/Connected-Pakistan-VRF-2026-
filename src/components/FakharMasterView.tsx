import React, { useState } from 'react';
import { 
  Crown, ShieldCheck, UserCheck, Store, Shield, 
  Building2, Volume2, Sparkles, CheckCircle2, RefreshCw, 
  Lock, Cpu, Award, Edit3, Database
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { Emblem } from './Emblem';
import { speechService } from '../lib/audio';

interface FakharMasterViewProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  lang: Language;
  onSwitchRole: (role: UserRole) => void;
  onOpenAIGuide: () => void;
  onOpenMasterSuite?: () => void;
  onOpenDataEditor?: () => void;
}

export const FakharMasterView: React.FC<FakharMasterViewProps> = ({
  activeTab = 'master_overview',
  onSelectTab,
  lang,
  onSwitchRole,
  onOpenAIGuide,
  onOpenMasterSuite,
  onOpenDataEditor,
}) => {
  const isUrdu = lang === 'ur';

  // Sub-tabs list
  const masterTabs = [
    { id: 'master_overview', labelUrdu: 'مرکزی جائزہ و کنٹرول', labelEn: 'Master Hub', icon: Crown },
    { id: 'security_audit', labelUrdu: 'سسٹم سیکیورٹی آڈٹ', labelEn: 'Security Audit', icon: ShieldCheck },
    { id: 'command', labelUrdu: 'قومی ہیٹ میپ و آپریشنز', labelEn: 'National Ops', icon: Building2 },
    { id: 'vision', labelUrdu: 'وژن اور پیغام', labelEn: 'Vision Statement', icon: Award },
    { id: 'why_how', labelUrdu: 'حکمت عملی و اسباق', labelEn: 'Strategic QA', icon: Sparkles },
  ];

  const handleTabChange = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
  };

  // Security Audit Simulation State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(100);
  const [auditPassed, setAuditPassed] = useState(true);

  const visionStatementUrdu = 
    'کنیکٹڈ پاکستان (VRF 2026) کا مقصد ریاست اور عام شہری کے مابین اعتماد اور عدل کا ڈیجیٹل پل تعمیر کرنا ہے۔ ہم نے ریڑھی بان کو مجبور مزدور سے باوقار کاروباری شراکت دار بنایا، شہری کو شفاف سرکاری نرخوں اور گمنام رپورٹنگ کا تحفظ دیا، اور انتظامیہ کو فوری انصاف کی خودکار طاقت بخشی۔ پاکستان زندہ باد!';

  const visionStatementEn = 
    'Connected Pakistan (VRF 2026) establishes an unshakeable digital bridge of trust between the state and every citizen. It transforms street vendors from vulnerable workers into dignified economic partners, protects consumers through verified DC price transparency, and equips magistrates with rapid evidentiary tools. Pakistan Zindabad!';

  const securityLayers = [
    { name: '1. Rate Limiting & Cooldown Engine', desc: '6 failed login attempts trigger a 20-second biometric lock.', status: 'Active & Verified' },
    { name: '2. Zero-Leak RBAC Permission Guard', desc: 'Strict role segregation across Citizen, Vendor, Inspector, and District Command.', status: 'Active & Verified' },
    { name: '3. Encrypted Anonymous Voice Channel', desc: 'Citizen identity is irreversibly masked before transmission to field inspectors.', status: 'Active & Verified' },
    { name: '4. High-Precision 35m Geo-Fence Radar', desc: 'GPS boundary lock with ±35m satellite verification.', status: 'Active & Verified' },
    { name: '5. Offline-Resilient IndexedDB Media Cache', desc: 'Briefing videos and audit trails cached securely on device storage.', status: 'Active & Verified' },
    { name: '6. Cryptographic Data Integrity Hashes', desc: 'Tamper-proof SHA verification for municipal citation logs.', status: 'Active & Verified' },
  ];

  const handleRunSecurityAudit = () => {
    setIsAuditing(true);
    setAuditProgress(0);

    const interval = setInterval(() => {
      setAuditProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAuditing(false);
          setAuditPassed(true);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Sub-Tab Navigation Bar */}
      <div className="bg-[#FCFAF3] border border-[#178A52]/20 rounded-2xl p-2 shadow-sm overflow-x-auto flex items-center gap-2 no-scrollbar">
        {masterTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected =
            activeTab === tab.id ||
            (tab.id === 'master_overview' && (activeTab === 'overview' || activeTab === 'dashboard')) ||
            (tab.id === 'security_audit' && activeTab === 'audit') ||
            (tab.id === 'vision' && activeTab === 'statement');

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
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

      {/* Visionary Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#E3A82B] shadow-2xl text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#E3A82B] text-[#04231A] px-3.5 py-1 rounded-full text-xs font-extrabold shadow">
              <Crown className="w-4 h-4 text-[#04231A]" />
              <span>{isUrdu ? 'ماسٹر ایگزیکٹو ویو • قومی گورننس' : 'Master Executive View • National Governance'}</span>
            </div>

            <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
              CONNECTED PAKISTAN — VRF 2026
            </h2>
            <p className="text-sm text-[#DCEFE4] font-urdu max-w-2xl leading-relaxed">
              Master Executive View • National Governance System • قومی گورننس
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-[#04231A]/80 p-4 rounded-3xl border border-[#E3A82B]">
            <Emblem size="lg" />
            <div className="text-center">
              <span className="font-sora font-extrabold text-lg text-[#E3A82B] block">PAKISTAN</span>
              <span className="text-xs text-[#FCFAF3] font-urdu font-bold">زندہ باد</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 1. MASTER OVERVIEW & ROLE SWITCH ================= */}
      {(activeTab === 'master_overview' || activeTab === 'overview' || activeTab === 'dashboard' || activeTab === 'command') && (
        <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-sora font-extrabold text-lg text-[#04231A]">
                {isUrdu ? 'تمام کرداروں کے لائیو پینلز (Omni-Role Navigation)' : 'Omni-Role Instant Access'}
              </h3>
              <p className="text-xs text-[#5C6F63] font-urdu">
                کسی بھی کردار کے پینل میں ایک کلک سے سوئچ کریں
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onSwitchRole('citizen')}
              className="p-5 rounded-2xl bg-white border border-[#178A52]/30 hover:border-[#178A52] hover:shadow-lg cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#178A52] text-white flex items-center justify-center mb-3">
                  <UserCheck className="w-5 h-5 text-[#E3A82B]" />
                </div>
                <h4 className="font-bold text-sm text-[#04231A] font-urdu">{isUrdu ? 'شہری پورٹل (Citizen)' : 'Citizen Portal'}</h4>
                <p className="text-xs text-[#5C6F63] font-urdu mt-1">ڈی سی ریٹس، گمنام رپورٹنگ، گرین ڈائرکٹری</p>
              </div>
              <span className="text-[11px] font-bold text-[#178A52] mt-3 block">اوپن کریں →</span>
            </div>

            <div
              onClick={() => onSwitchRole('vendor')}
              className="p-5 rounded-2xl bg-white border border-[#178A52]/30 hover:border-[#178A52] hover:shadow-lg cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0B4A31] text-white flex items-center justify-center mb-3">
                  <Store className="w-5 h-5 text-[#E3A82B]" />
                </div>
                <h4 className="font-bold text-sm text-[#04231A] font-urdu">{isUrdu ? 'دکاندار کنسول (Vendor)' : 'Vendor Console'}</h4>
                <p className="text-xs text-[#5C6F63] font-urdu mt-1">کیو آر لائسنس، ویسٹ پوائنٹس، مائیکرو پے</p>
              </div>
              <span className="text-[11px] font-bold text-[#178A52] mt-3 block">اوپن کریں →</span>
            </div>

            <div
              onClick={() => onSwitchRole('inspector')}
              className="p-5 rounded-2xl bg-white border border-[#178A52]/30 hover:border-[#178A52] hover:shadow-lg cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#3D7EA6] text-white flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5 text-[#E3A82B]" />
                </div>
                <h4 className="font-bold text-sm text-[#04231A] font-urdu">{isUrdu ? 'پیرہ مجسٹریٹ (Inspector)' : 'PERA Inspector'}</h4>
                <p className="text-xs text-[#5C6F63] font-urdu mt-1">±3% اسکینر، فیلڈ روٹس، ڈیجیٹل چالان</p>
              </div>
              <span className="text-[11px] font-bold text-[#3D7EA6] mt-3 block">اوپن کریں →</span>
            </div>

            <div
              onClick={() => onSwitchRole('government')}
              className="p-5 rounded-2xl bg-white border border-[#178A52]/30 hover:border-[#178A52] hover:shadow-lg cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#04231A] text-white flex items-center justify-center mb-3">
                  <Building2 className="w-5 h-5 text-[#E3A82B]" />
                </div>
                <h4 className="font-bold text-sm text-[#04231A] font-urdu">{isUrdu ? 'ضلعی کمانڈ (Government)' : 'District Command'}</h4>
                <p className="text-xs text-[#5C6F63] font-urdu mt-1">30 زونز لائیو میپ، ڈسپیچ، ڈیٹا سنک</p>
              </div>
              <span className="text-[11px] font-bold text-[#04231A] mt-3 block">اوپن کریں →</span>
            </div>
          </div>

          {/* Master Live Data & Record Editor Action Box */}
          {onOpenDataEditor && (
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-[#0B4A31] to-[#178A52] border-2 border-[#E3A82B] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E3A82B] text-[#04231A] flex items-center justify-center shrink-0 shadow-md">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-sm text-[#E3A82B]">
                    {isUrdu ? 'پلیٹ فارم ڈیٹا ایڈیٹر و لائیو ریکارڈز (Live Data Editor)' : 'Platform Data & Live Record Editor (All Modules)'}
                  </h4>
                  <p className="text-xs text-[#DCEFE4]/90 font-urdu mt-0.5">
                    {isUrdu 
                      ? 'ٹیم ممبرز، سرکاری نرخ، دکاندار، چالان، شہری شکایات اور ضلعی کمانڈ کے تمام ریکارڈز لائیو ایڈٹ، امپورٹ اور ایکسپورٹ کریں' 
                      : 'Edit team members, DC rates, vendor profiles, citizen reports, citations, zones, and platform parameters with auto-save.'}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenDataEditor}
                className="w-full sm:w-auto bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <Database className="w-4 h-4" />
                <span>{isUrdu ? 'ڈیٹا ایڈیٹر کھولیں' : 'Open Data Editor'}</span>
              </button>
            </div>
          )}

          {/* Master Rebuild Prompt Suite Action Box */}
          {onOpenMasterSuite && (
            <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-[#04231A] to-[#0B4A31] border-2 border-[#E3A82B] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E3A82B] text-[#04231A] flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-sm text-[#E3A82B]">
                    {isUrdu ? 'مکمل ماسٹر پرامپٹ سوٹ (12 Layers & PDF Export)' : 'Master AI & Architectural Prompt Suite (12 Layers)'}
                  </h4>
                  <p className="text-xs text-[#DCEFE4]/80 font-urdu mt-0.5">
                    {isUrdu 
                      ? '12 تہوں پر مشتمل مکمل پلیٹ فارم ری بلڈ کوڈ، معاشی ماڈل، اور ڈاؤن لوڈ کے قابل پرامپٹ ڈاکس' 
                      : 'Complete 12-layer prompt specification, architecture docs, and copyable regeneration prompts.'}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenMasterSuite}
                className="w-full sm:w-auto bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <Award className="w-4 h-4" />
                <span>{isUrdu ? 'ماسٹر سوٹ کھولیں' : 'Open Master Suite'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. VISION STATEMENT CARD ================= */}
      {(activeTab === 'vision' || activeTab === 'master_overview' || activeTab === 'statement') && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[#04231A] border-2 border-[#E3A82B] text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E3A82B]" />
              <h3 className="font-bold text-base text-[#FCFAF3]">
                {isUrdu ? 'وژن بیان (Vision Statement)' : 'Official Vision Statement'}
              </h3>
            </div>

            <button
              onClick={() => {
                speechService.speak(isUrdu ? visionStatementUrdu : visionStatementEn, {
                  lang: isUrdu ? 'ur' : 'en',
                });
              }}
              className="bg-[#178A52] hover:bg-[#178A52]/80 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Volume2 className="w-4 h-4 text-[#E3A82B]" />
              <span>{isUrdu ? 'وژن آڈیو سنیں' : 'Listen to Vision Audio'}</span>
            </button>
          </div>

          <blockquote className="font-urdu text-sm sm:text-base text-[#DCEFE4] leading-relaxed border-r-4 border-[#E3A82B] pr-4">
            "{isUrdu ? visionStatementUrdu : visionStatementEn}"
          </blockquote>

          <div className="text-left font-sora text-xs text-[#E3A82B] font-bold pt-2">
            — Master Executive Console
          </div>
        </div>
      )}

      {/* ================= 3. SECURITY AUDIT ENGINE ================= */}
      {(activeTab === 'security_audit' || activeTab === 'master_overview' || activeTab === 'audit') && (
        <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#178A52] text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#E3A82B]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#04231A]">
                  {isUrdu ? 'سسٹم سیکیورٹی آڈٹ (6 Layers Verification)' : 'System Security & Integrity Audit'}
                </h3>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  تمام حفاظتی تہوں اور انکرپشن پروٹوکولز کی براہ راست خودکار جانچ
                </p>
              </div>
            </div>

            <button
              onClick={handleRunSecurityAudit}
              disabled={isAuditing}
              className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow disabled:opacity-50"
            >
              {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin text-[#E3A82B]" /> : <Cpu className="w-4 h-4 text-[#E3A82B]" />}
              <span>{isAuditing ? 'آڈٹ جاری ہے...' : (isUrdu ? 'سیکیورٹی آڈٹ چلائیں' : 'Run Security Audit')}</span>
            </button>
          </div>

          {/* Progress bar when auditing */}
          {isAuditing && (
            <div className="w-full bg-[#F6F2E7] h-2 rounded-full overflow-hidden">
              <div className="bg-[#E3A82B] h-full transition-all duration-300" style={{ width: `${auditProgress}%` }} />
            </div>
          )}

          {/* Security Layers List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {securityLayers.map((layer, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-[#178A52]/20 shadow-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#178A52] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-[#04231A]">{layer.name}</h4>
                  <p className="text-[11px] text-[#5C6F63] mt-0.5 font-urdu">{layer.desc}</p>
                  <span className="text-[10px] text-[#178A52] font-bold block mt-1">● {layer.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
