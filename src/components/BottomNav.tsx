import React from 'react';
import { Sparkles } from 'lucide-react';
import { Role, Language } from '../types';
import { NavigationController } from '../lib/navigationController';

interface BottomNavProps {
  currentRole: Role;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onOpenAIGuide: () => void;
  pendingReportsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  lang,
  onOpenAIGuide,
  pendingReportsCount,
}) => {
  const isUrdu = lang === 'ur';
  const navItems = NavigationController.getBottomBarItems(currentRole);

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FCFAF3]/95 backdrop-blur-md border-t border-[#178A52]/20 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const badge = item.badgeCount 
          ? item.badgeCount({ pendingReportsCount, activeCitationsCount: pendingReportsCount }) 
          : 0;

        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative rounded-xl transition-all active:scale-95 touch-manipulation min-h-[44px] ${
              isActive 
                ? 'text-[#178A52] font-extrabold bg-[#178A52]/10 shadow-xs' 
                : 'text-[#5C6F63] hover:text-[#04231A]'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#178A52]' : ''}`} />
              {badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#B03A2E] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight ${isUrdu ? 'font-urdu' : 'font-sora font-semibold'}`}>
              {isUrdu ? item.labelUrdu : item.labelEn}
            </span>
          </button>
        );
      })}

      {/* Floating AI guide quick action button */}
      <button
        onClick={onOpenAIGuide}
        className="flex flex-col items-center justify-center flex-1 py-1 text-[#178A52] hover:text-[#0B4A31] active:scale-95 touch-manipulation min-h-[44px]"
        aria-label="AI Assistant Guide"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#04231A] via-[#178A52] to-[#E3A82B] flex items-center justify-center shadow-md border border-[#E3A82B]">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <span className="text-[9px] mt-0.5 font-bold font-sora text-[#04231A]">AI Guide</span>
      </button>
    </nav>
  );
};
