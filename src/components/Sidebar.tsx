import React from 'react';
import { 
  Sparkles, MapPin, Edit3, Eye, UserCheck, 
  FileText, SlidersHorizontal, BookOpen, Compass
} from 'lucide-react';
import { Role, Language } from '../types';
import { BrandLogo } from './BrandLogo';
import { NavigationController } from '../lib/navigationController';

interface SidebarProps {
  currentRole: Role;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenIntro: () => void;
  onOpenAlign: () => void;
  onOpenAIGuide: () => void;
  onOpenMasterSuite?: () => void;
  onOpenCitySlotsMap?: () => void;
  onOpenCinematicIntro?: () => void;
  onOpenDataEditor?: () => void;
  onOpenVendorAllotment?: (vendorId?: string) => void;
  onOpenUserProfile?: () => void;
  pendingReportsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  lang,
  onOpenIntro,
  onOpenAlign,
  onOpenAIGuide,
  onOpenMasterSuite,
  onOpenCitySlotsMap,
  onOpenCinematicIntro,
  onOpenDataEditor,
  onOpenVendorAllotment,
  onOpenUserProfile,
  pendingReportsCount,
}) => {
  const isUrdu = lang === 'ur';
  const sidebarSections = NavigationController.getSidebarSections(currentRole);
  const isMasterOrGov = currentRole === 'fakhar_master' || currentRole === 'government';

  return (
    <>
      {/* Backdrop for mobile touch */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#04231A]/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container with Pakistan Premium Branding */}
      <aside
        className={`fixed lg:static top-0 bottom-0 z-50 w-72 bg-[#FCFAF3] text-[#132A21] border-r border-[#178A52]/20 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-xs ${
          isOpen ? 'translate-x-0' : 'max-lg:-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section with Official Brand Logo */}
        <div className="p-4 border-b border-[#178A52]/15 bg-white/70">
          <div className="mb-2">
            <BrandLogo 
              variant="light" 
              size="sm" 
              showSubtitle={true}
              subtitleText="VRF 2026 • ضلع و شہر تحفظ"
            />
          </div>

          <div className="bg-[#04231A] text-white rounded-2xl p-3 mt-3 border border-[#178A52]/40 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#DCEFE4]/70 font-semibold">{isUrdu ? 'موجودہ کردار:' : 'Authorized Role:'}</span>
              <span className="bg-[#178A52] text-white text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {currentRole}
              </span>
            </div>
            <p className={`text-xs font-bold text-[#E3A82B] ${isUrdu ? 'font-urdu' : ''}`}>
              {currentRole === 'citizen' && (isUrdu ? 'شہری کنسول — گمنام رپورٹنگ' : 'Citizen Console — Protected Voice')}
              {currentRole === 'vendor' && (isUrdu ? 'ریڑھی بان — باعزت شراکت داری' : 'Vendor Partner — Dignity & QR Slot')}
              {currentRole === 'inspector' && (isUrdu ? 'پیرہ مجسٹریٹ — شواہد اور رہنمائی' : 'PERA Inspector — Evidence & Coaching')}
              {currentRole === 'government' && (isUrdu ? 'ضلعی انتظامیہ — شفاف احتساب' : 'District Command — Complete Oversight')}
              {currentRole === 'fakhar_master' && (isUrdu ? 'فخر مشتاق — مکمل رسائی' : 'Fakhar Mushtaq — Master Access')}
            </p>
          </div>
        </div>

        {/* Navigation Items Organized by Sections from NavigationController */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {sidebarSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[10px] uppercase font-sora font-extrabold text-[#5C6F63] px-3 pb-1 tracking-wider">
                {isUrdu ? section.titleUrdu : section.titleEn}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badge = item.badgeCount 
                  ? item.badgeCount({ pendingReportsCount, activeCitationsCount: pendingReportsCount }) 
                  : 0;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sora font-bold transition-all group active:scale-98 ${
                      isActive
                        ? 'bg-[#178A52] text-white shadow-md'
                        : 'text-[#132A21] hover:bg-[#178A52]/10 hover:text-[#04231A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#178A52]'}`} />
                      <span className={`text-start ${isUrdu ? 'font-urdu text-[13px] leading-relaxed font-bold' : 'text-xs'}`}>
                        {isUrdu ? item.labelUrdu : item.labelEn}
                      </span>
                    </div>

                    {badge > 0 && (
                      <span className="text-[10px] bg-[#B03A2E] text-white px-2 py-0.5 rounded-full font-mono font-bold animate-pulse shadow-xs">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Quick Actions (Intelligently Filtered per Role) */}
          <div className="pt-3 pb-1 border-t border-[#178A52]/15 mt-2 space-y-1">
            <p className="text-[10px] uppercase font-sora font-extrabold text-[#5C6F63] px-3 pb-1 tracking-wider">
              {isUrdu ? 'فوری ایکشنز و نقشہ جات' : 'Quick Actions & Geo-Radar'}
            </p>

            {/* City Slots Radar Map for Vendors, Inspectors, and Command */}
            {onOpenCitySlotsMap && (
              <button
                onClick={() => {
                  onOpenCitySlotsMap();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#04231A] hover:bg-[#178A52]/10 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#178A52]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'سٹی سلاٹس ریڈار نقشہ' : 'City Slots Radar Map'}</span>
              </button>
            )}

            {/* Vendor Allotment & Google Maps */}
            {onOpenVendorAllotment && (
              <button
                onClick={() => {
                  onOpenVendorAllotment();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#7E5700] bg-[#E3A82B]/10 hover:bg-[#E3A82B]/20 border border-[#E3A82B]/30 transition-colors shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-[#E3A82B]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'وینڈر الاٹمنٹ و گوگل میپس' : 'Vendor Allotment & Maps'}</span>
              </button>
            )}

            {/* Master Suite and Cinematic Intro ONLY for Fakhar Master */}
            {currentRole === 'fakhar_master' && onOpenCinematicIntro && (
              <button
                onClick={() => {
                  onOpenCinematicIntro();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B4A31] bg-[#178A52]/15 hover:bg-[#178A52]/25 transition-colors border border-[#178A52]/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#178A52]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'ٹیم و وژن تعارف' : 'Team Leadership Intro'}</span>
              </button>
            )}

            {currentRole === 'fakhar_master' && onOpenMasterSuite && (
              <button
                onClick={() => {
                  onOpenMasterSuite();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#132A21] hover:bg-[#178A52]/10 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#178A52]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'ماسٹر پرامپٹ سوٹ (PDF)' : 'Master Prompt Suite (PDF)'}</span>
              </button>
            )}

            {/* Platform Data Editor ONLY for Government and Master roles */}
            {isMasterOrGov && onOpenDataEditor && (
              <button
                onClick={() => {
                  onOpenDataEditor();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B4A31] bg-[#178A52]/15 hover:bg-[#178A52]/25 border border-[#178A52]/30 transition-colors shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#178A52]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'پلیٹ فارم ڈیٹا ایڈیٹر' : 'Edit Platform Records'}</span>
              </button>
            )}

            {/* Citizen Guided Tour */}
            {(currentRole === 'citizen' || isMasterOrGov) && (
              <button
                onClick={() => {
                  onOpenIntro();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#132A21] hover:bg-[#178A52]/10 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-[#E3A82B]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'انٹرو گائیڈڈ ٹور' : 'Platform Guided Tour'}</span>
              </button>
            )}

            {/* My Profile & Address */}
            {onOpenUserProfile && (
              <button
                onClick={() => {
                  onOpenUserProfile();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#132A21] hover:bg-[#178A52]/10 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#178A52]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'میری رجسٹریشن و پتہ' : 'My Registered Profile'}</span>
              </button>
            )}

            {/* User Preferences / Align */}
            <button
              onClick={() => {
                onOpenAlign();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#132A21] hover:bg-[#178A52]/10 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#178A52]" />
              <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'میری ترجیحات (Align)' : 'Align-To-You Prefs'}</span>
            </button>

            {/* AI Guide for all roles */}
            <button
              onClick={() => {
                onOpenAIGuide();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#04231A] bg-[#178A52]/10 hover:bg-[#178A52]/20 border border-[#178A52]/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E3A82B]" />
              <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'اے آئی مددگار سے پوچھیں' : 'Ask AI Guide'}</span>
            </button>
          </div>
        </nav>

        {/* Bottom Status Line */}
        <div className="p-3 border-t border-[#178A52]/15 bg-white/60">
          <div className="p-2.5 rounded-2xl bg-[#04231A] text-white border border-[#178A52]/40 text-center shadow-xs">
            <p className="text-[11px] text-[#DCEFE4] font-bold leading-snug">
              Connected Pakistan <span className="text-[#E3A82B]">VRF 2026</span>
            </p>
            <p className="text-[10px] text-[#178A52] font-urdu leading-tight mt-0.5 font-bold">
              پاکستان زندہ باد 🇵🇰
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
