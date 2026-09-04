import { UserRole, Language } from '../types';
import { 
  Home, ShoppingBag, AlertTriangle, FileText, QrCode, Shield, 
  BarChart3, Compass, MapPin, Activity, HelpCircle, Layers, 
  Settings, Award, CheckCircle2, LucideIcon 
} from 'lucide-react';

export interface NavRouteItem {
  id: string;
  labelEn: string;
  labelUrdu: string;
  icon: LucideIcon;
  descriptionEn?: string;
  descriptionUrdu?: string;
  badgeCount?: (state: { pendingReportsCount: number; activeCitationsCount: number }) => number;
}

export interface RoleNavigationConfig {
  role: UserRole;
  defaultTab: string;
  allowedTabs: string[];
  bottomBarItems: NavRouteItem[];
  sidebarSections: {
    titleEn: string;
    titleUrdu: string;
    items: NavRouteItem[];
  }[];
}

export const ROLE_NAVIGATION_MAP: Record<UserRole, RoleNavigationConfig> = {
  citizen: {
    role: 'citizen',
    defaultTab: 'overview',
    allowedTabs: ['overview', 'rates', 'report', 'my_reports', 'why_how', 'pakistan_map'],
    bottomBarItems: [
      { id: 'overview', labelEn: 'Home', labelUrdu: 'ہوم', icon: Home },
      { id: 'rates', labelEn: 'DC Rates', labelUrdu: 'نرخ نامہ', icon: ShoppingBag },
      { id: 'report', labelEn: 'Report', labelUrdu: 'شکایت', icon: AlertTriangle },
      { 
        id: 'my_reports', 
        labelEn: 'Status', 
        labelUrdu: 'اسٹیٹس', 
        icon: FileText,
        badgeCount: ({ pendingReportsCount }) => pendingReportsCount 
      },
    ],
    sidebarSections: [
      {
        titleEn: 'Citizen Portal',
        titleUrdu: 'عوامی پورٹل',
        items: [
          { id: 'overview', labelEn: 'Dashboard Overview', labelUrdu: 'مرکزی ڈیش بورڈ', icon: Home },
          { id: 'rates', labelEn: 'Official DC Price List', labelUrdu: 'سرکاری ڈی سی نرخ نامہ', icon: ShoppingBag },
          { id: 'report', labelEn: 'File Price Violation Report', labelUrdu: 'گراں فروشی شکایت درج کریں', icon: AlertTriangle },
          { 
            id: 'my_reports', 
            labelEn: 'My Reports & Case Status', 
            labelUrdu: 'میری شکایات و پیشرفت', 
            icon: FileText,
            badgeCount: ({ pendingReportsCount }) => pendingReportsCount 
          },
        ]
      },
      {
        titleEn: 'National Knowledge',
        titleUrdu: 'قومی رہنمائی',
        items: [
          { id: 'pakistan_map', labelEn: 'National Geospatial Radar', labelUrdu: 'قومی جیو اسپیشل نقشہ', icon: Compass },
          { id: 'why_how', labelEn: 'Why & How Strategy Guide', labelUrdu: 'کیوں اور کیسے حکمت عملی', icon: HelpCircle },
        ]
      }
    ]
  },
  vendor: {
    role: 'vendor',
    defaultTab: 'dashboard',
    allowedTabs: ['dashboard', 'slot', 'waste', 'micropay', 'why_how', 'pakistan_map'],
    bottomBarItems: [
      { id: 'dashboard', labelEn: 'QR Slot', labelUrdu: 'کیو آر', icon: QrCode },
      { id: 'slot', labelEn: 'Peak Slot', labelUrdu: 'سلاٹ', icon: Home },
      { id: 'waste', labelEn: 'Rewards', labelUrdu: 'انعامات', icon: Award },
      { id: 'micropay', labelEn: 'MicroPay', labelUrdu: 'مائیکرو پے', icon: ShoppingBag },
    ],
    sidebarSections: [
      {
        titleEn: 'Vendor Terminal',
        titleUrdu: 'وینڈر ٹرمینل',
        items: [
          { id: 'dashboard', labelEn: 'Vendor Stall & QR Identity', labelUrdu: 'ریڑھی پروفائل و کیو آر', icon: QrCode },
          { id: 'slot', labelEn: 'Designated Pitch & Timings', labelUrdu: 'الاٹ شدہ سلاٹ و اوقات', icon: Home },
          { id: 'waste', labelEn: 'Cleanliness Rewards & Waste', labelUrdu: 'صفائی انعامات و ویسٹ مینجمنٹ', icon: Award },
          { id: 'micropay', labelEn: 'Daily Micro-Pay & Ledger', labelUrdu: 'روزانہ مائیکرو فیس و کھاتہ', icon: ShoppingBag },
        ]
      },
      {
        titleEn: 'National Knowledge',
        titleUrdu: 'قومی رہنمائی',
        items: [
          { id: 'pakistan_map', labelEn: 'National Geospatial Radar', labelUrdu: 'قومی جیو اسپیشل نقشہ', icon: Compass },
          { id: 'why_how', labelEn: 'Why & How Strategy Guide', labelUrdu: 'کیوں اور کیسے حکمت عملی', icon: HelpCircle },
        ]
      }
    ]
  },
  inspector: {
    role: 'inspector',
    defaultTab: 'duty',
    allowedTabs: ['duty', 'scanner', 'geofence', 'citations', 'why_how', 'pakistan_map'],
    bottomBarItems: [
      { id: 'duty', labelEn: 'Duty', labelUrdu: 'ڈیوٹی', icon: Shield },
      { id: 'scanner', labelEn: 'Scanner', labelUrdu: 'اسکینر', icon: QrCode },
      { id: 'geofence', labelEn: 'Geofence', labelUrdu: 'جیو فینس', icon: MapPin },
      { 
        id: 'citations', 
        labelEn: 'Citations', 
        labelUrdu: 'چالان', 
        icon: FileText,
        badgeCount: ({ activeCitationsCount }) => activeCitationsCount 
      },
    ],
    sidebarSections: [
      {
        titleEn: 'Price Enforcement Squad',
        titleUrdu: 'پرائس مجسٹریٹ اسکواڈ',
        items: [
          { id: 'duty', labelEn: 'Daily Duty & Active Squad', labelUrdu: 'روزانہ ڈیوٹی و ایکٹو اسکواڈ', icon: Shield },
          { id: 'scanner', labelEn: 'QR & Digital Scale Scanner', labelUrdu: 'کیو آر و ترازو اسکینر', icon: QrCode },
          { id: 'geofence', labelEn: '35m Geofence Radar', labelUrdu: '35 میٹر جیو فینس ریڈار', icon: MapPin },
          { 
            id: 'citations', 
            labelEn: 'Digital Citations & Challans', 
            labelUrdu: 'ڈیجیٹل چالان و ایکشن لاگ', 
            icon: FileText,
            badgeCount: ({ activeCitationsCount }) => activeCitationsCount 
          },
        ]
      },
      {
        titleEn: 'National Knowledge',
        titleUrdu: 'قومی رہنمائی',
        items: [
          { id: 'pakistan_map', labelEn: 'National Geospatial Radar', labelUrdu: 'قومی جیو اسپیشل نقشہ', icon: Compass },
          { id: 'why_how', labelEn: 'Why & How Strategy Guide', labelUrdu: 'کیوں اور کیسے حکمت عملی', icon: HelpCircle },
        ]
      }
    ]
  },
  government: {
    role: 'government',
    defaultTab: 'command',
    allowedTabs: ['command', 'heatmap', 'dispatch', 'analytics', 'gov_analytics', 'licensing', 'why_how', 'pakistan_map'],
    bottomBarItems: [
      { id: 'command', labelEn: 'Command', labelUrdu: 'کمانڈ', icon: BarChart3 },
      { id: 'heatmap', labelEn: 'Heatmap', labelUrdu: 'ہیٹ میپ', icon: Activity },
      { 
        id: 'dispatch', 
        labelEn: 'Dispatch', 
        labelUrdu: 'ڈسپیچ', 
        icon: AlertTriangle,
        badgeCount: ({ pendingReportsCount }) => pendingReportsCount 
      },
      { id: 'analytics', labelEn: 'Analytics', labelUrdu: 'تجزیات', icon: FileText },
    ],
    sidebarSections: [
      {
        titleEn: 'District Sovereign Command',
        titleUrdu: 'ضلعی کمانڈ و کنٹرول',
        items: [
          { id: 'command', labelEn: 'Master Control & Intelligence', labelUrdu: 'مرکزی کنٹرول و لائیو میٹرکس', icon: BarChart3 },
          { id: 'heatmap', labelEn: '30-Zone Price & Zoning Map', labelUrdu: '30 زونز ریڈار و مانیٹرنگ', icon: Activity },
          { 
            id: 'dispatch', 
            labelEn: 'Citizen Complaint Dispatch', 
            labelUrdu: 'شکایات ازالہ و اسکواڈ ڈسپیچ', 
            icon: AlertTriangle,
            badgeCount: ({ pendingReportsCount }) => pendingReportsCount 
          },
          { id: 'licensing', labelEn: 'Vendor Authorization & Licenses', labelUrdu: 'وینڈر رجسٹریشن و لائسنسنگ', icon: CheckCircle2 },
          { id: 'analytics', labelEn: 'Economic Reports & Trends', labelUrdu: 'اقتصادی رپورٹس و رجحانات', icon: FileText },
        ]
      },
      {
        titleEn: 'National Knowledge',
        titleUrdu: 'قومی رہنمائی',
        items: [
          { id: 'pakistan_map', labelEn: 'National Geospatial Radar', labelUrdu: 'قومی جیو اسپیشل نقشہ', icon: Compass },
          { id: 'why_how', labelEn: 'Why & How Strategy Guide', labelUrdu: 'کیوں اور کیسے حکمت عملی', icon: HelpCircle },
        ]
      }
    ]
  },
  fakhar: {
    role: 'fakhar',
    defaultTab: 'command',
    allowedTabs: ['command', 'heatmap', 'dispatch', 'analytics', 'gov_analytics', 'licensing', 'why_how', 'pakistan_map'],
    bottomBarItems: [
      { id: 'command', labelEn: 'Command', labelUrdu: 'کمانڈ', icon: BarChart3 },
      { id: 'heatmap', labelEn: 'Heatmap', labelUrdu: 'ہیٹ میپ', icon: Activity },
      { 
        id: 'dispatch', 
        labelEn: 'Dispatch', 
        labelUrdu: 'ڈسپیچ', 
        icon: AlertTriangle,
        badgeCount: ({ pendingReportsCount }) => pendingReportsCount 
      },
      { id: 'analytics', labelEn: 'Analytics', labelUrdu: 'تجزیات', icon: FileText },
    ],
    sidebarSections: [
      {
        titleEn: 'District Sovereign Command',
        titleUrdu: 'ضلعی کمانڈ و کنٹرول',
        items: [
          { id: 'command', labelEn: 'Master Control & Intelligence', labelUrdu: 'مرکزی کنٹرول و لائیو میٹرکس', icon: BarChart3 },
          { id: 'heatmap', labelEn: '30-Zone Price & Zoning Map', labelUrdu: '30 زونز ریڈار و مانیٹرنگ', icon: Activity },
          { 
            id: 'dispatch', 
            labelEn: 'Citizen Complaint Dispatch', 
            labelUrdu: 'شکایات ازالہ و اسکواڈ ڈسپیچ', 
            icon: AlertTriangle,
            badgeCount: ({ pendingReportsCount }) => pendingReportsCount 
          },
          { id: 'licensing', labelEn: 'Vendor Authorization & Licenses', labelUrdu: 'وینڈر رجسٹریشن و لائسنسنگ', icon: CheckCircle2 },
          { id: 'analytics', labelEn: 'Economic Reports & Trends', labelUrdu: 'اقتصادی رپورٹس و رجحانات', icon: FileText },
        ]
      },
      {
        titleEn: 'National Knowledge',
        titleUrdu: 'قومی رہنمائی',
        items: [
          { id: 'pakistan_map', labelEn: 'National Geospatial Radar', labelUrdu: 'قومی جیو اسپیشل نقشہ', icon: Compass },
          { id: 'why_how', labelEn: 'Why & How Strategy Guide', labelUrdu: 'کیوں اور کیسے حکمت عملی', icon: HelpCircle },
        ]
      }
    ]
  },
  fakhar_master: {
    role: 'fakhar_master',
    defaultTab: 'command',
    allowedTabs: ['command', 'heatmap', 'dispatch', 'analytics', 'gov_analytics', 'licensing', 'why_how', 'pakistan_map'],
    bottomBarItems: [
      { id: 'command', labelEn: 'Command', labelUrdu: 'کمانڈ', icon: BarChart3 },
      { id: 'heatmap', labelEn: 'Heatmap', labelUrdu: 'ہیٹ میپ', icon: Activity },
      { 
        id: 'dispatch', 
        labelEn: 'Dispatch', 
        labelUrdu: 'ڈسپیچ', 
        icon: AlertTriangle,
        badgeCount: ({ pendingReportsCount }) => pendingReportsCount 
      },
      { id: 'analytics', labelEn: 'Analytics', labelUrdu: 'تجزیات', icon: FileText },
    ],
    sidebarSections: [
      {
        titleEn: 'Architect Command Suite',
        titleUrdu: 'آرکیٹیکٹ کمانڈ سویٹ',
        items: [
          { id: 'command', labelEn: 'Full System Sovereign View', labelUrdu: 'مکمل نظام کا خود مختار جائزہ', icon: BarChart3 },
          { id: 'licensing', labelEn: 'Vendor Allotments & Licensing', labelUrdu: 'وینڈر الاٹمنٹ و لائسنسنگ', icon: CheckCircle2 },
          { id: 'analytics', labelEn: 'Macroeconomic Impact Model', labelUrdu: 'معاشی اثرات کا ماڈل', icon: FileText },
        ]
      },
      {
        titleEn: 'National Knowledge',
        titleUrdu: 'قومی رہنمائی',
        items: [
          { id: 'pakistan_map', labelEn: 'National Geospatial Radar', labelUrdu: 'قومی جیو اسپیشل نقشہ', icon: Compass },
          { id: 'why_how', labelEn: 'Why & How Strategy Guide', labelUrdu: 'کیوں اور کیسے حکمت عملی', icon: HelpCircle },
        ]
      }
    ]
  }
};

export class NavigationController {
  /**
   * Validate if a tab is authorized for the given role, otherwise return the default tab
   */
  public static validateTab(role: UserRole, targetTab: string): string {
    const config = ROLE_NAVIGATION_MAP[role] || ROLE_NAVIGATION_MAP.citizen;
    if (config.allowedTabs.includes(targetTab)) {
      return targetTab;
    }
    return config.defaultTab;
  }

  /**
   * Get default tab when switching roles
   */
  public static getDefaultTabForRole(role: UserRole): string {
    const config = ROLE_NAVIGATION_MAP[role] || ROLE_NAVIGATION_MAP.citizen;
    return config.defaultTab;
  }

  /**
   * Get bottom bar navigation items for mobile
   */
  public static getBottomBarItems(role: UserRole) {
    const config = ROLE_NAVIGATION_MAP[role] || ROLE_NAVIGATION_MAP.citizen;
    return config.bottomBarItems;
  }

  /**
   * Get sidebar sections for desktop navigation
   */
  public static getSidebarSections(role: UserRole) {
    const config = ROLE_NAVIGATION_MAP[role] || ROLE_NAVIGATION_MAP.citizen;
    return config.sidebarSections;
  }
}
