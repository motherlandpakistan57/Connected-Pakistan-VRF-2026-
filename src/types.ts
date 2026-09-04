export type UserRole = 'citizen' | 'vendor' | 'inspector' | 'government' | 'fakhar' | 'fakhar_master';
export type Role = UserRole;

export type Language = 'ur' | 'en';
export type AIVoice = 'male' | 'female';
export type Mood = 'theek' | 'normal' | 'pareshan';

export interface UserPreferences {
  lang: Language;
  voice: AIVoice;
  mood: Mood;
  voiceEnabled: boolean;
}

export interface DCRateItem {
  id: string;
  nameUrdu: string;
  nameEn: string;
  categoryUrdu: string;
  categoryEn: string;
  dcRate: number;
  marketAvg: number;
  unitUrdu: string;
  unitEn: string;
  lastUpdated: string;
  deviationPct: number;
}

export type AuthorizationStatus = 'approved' | 'under_review' | 'pending_allotment' | 'suspended' | 'revoked';

export interface VendorProfile {
  id: string;
  name: string;
  nameUrdu: string;
  shopName: string;
  shopNameUrdu: string;
  marketName: string;
  marketNameUrdu: string;
  cnic: string;
  phone: string;
  slotNumber: string;
  zone: string;
  score: number; // 0.0 - 10.0
  wastePoints: number;
  creditScore: number; // /850
  badge: 'green' | 'silver' | 'standard';
  qrPayload?: string;
  qrId?: string;
  shiftTime?: string;
  shiftExpiry?: string;
  latitude?: number;
  longitude?: number;
  isInsideGeofence?: boolean;
  completedLessons?: string[];
  // Official Government Authorization & Governance Fields
  authorizationStatus?: AuthorizationStatus;
  licenseNumber?: string;
  licenseIssuedDate?: string;
  licenseExpiryDate?: string;
  approvingAuthority?: string;
  authorizedOperatingHours?: string;
  assignedPitchDimensions?: string;
  monthlyRegulatoryFee?: number;
  feePaymentStatus?: 'paid' | 'due' | 'waived';
  applicationNotes?: string;
}

export interface CitizenReport {
  id: string;
  timestamp: string;
  category: string;
  item: string;
  vendorName: string;
  marketName: string;
  dcRate: number;
  chargedPrice: number;
  status: 'received' | 'verified' | 'dispatched' | 'vendor_responded' | 'resolved';
  isAnonymous: boolean;
  reporterName?: string;
  evidencePhoto?: string;
  location: string;
  inspectorAssigned?: string;
  resolutionTimeMinutes?: number;
  notes?: string;
  date?: string;
  zone?: string;
  // VRF End-to-End Decision Support & Workflow Fields
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  aiSeverityAnalysis?: string;
  aiRecommendedAction?: string;
  inspectorActionTaken?: 'warning' | 'penalty' | 'coaching_advisory' | 'verified_compliant';
  inspectorNotes?: string;
  vendorResponse?: string;
  resolvedAt?: string;
}

export interface Citation {
  id: string;
  vendorId?: string;
  vendorName: string;
  slotNumber?: string;
  marketName?: string;
  inspectorName: string;
  item: string;
  officialRate: number;
  chargedPrice: number;
  variancePct: number;
  fineAmount: number;
  status: 'pending' | 'active' | 'vendor_responded' | 'resolved';
  timestamp: string;
  evidencePhoto?: string;
  coachingGiven?: boolean;
  gpsLocation?: string;
  actionTaken?: 'warning' | 'penalty' | 'coaching_advisory';
  vendorResponse?: string;
  resolvedAt?: string;
}

export interface ZoneItem {
  id: string;
  nameUrdu: string;
  nameEn: string;
  district: string;
  complianceRate: number;
  totalVendors: number;
  activePatrols: number;
  status: 'green' | 'yellow' | 'red';
  inspectorInCharge: string;
  lat?: number;
  lng?: number;
}

export type ZoneData = ZoneItem;

export interface FieldTask {
  id: string;
  titleUrdu: string;
  titleEn: string;
  zone: string;
  market?: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  timeEst?: string;
  targetSlot?: string;
  reason?: string;
  location?: string;
}

export type InspectorTask = FieldTask;

export interface CivicActivity {
  id: string;
  title: string;
  titleUrdu: string;
  points: number;
  timestamp: string;
  type: 'report_verified' | 'rate_check' | 'vendor_review' | 'quiz_completed' | 'daily_streak';
}

export interface CivicPointsProfile {
  totalPoints: number;
  level: number;
  badgeTitle: string;
  badgeTitleUrdu: string;
  verifiedReportsCount: number;
  priceAuditsCount: number;
  vendorRatingsCount: number;
  streakDays: number;
  lastActiveDate: string;
  activities: CivicActivity[];
  unlockedRewards: string[];
}

export interface TrainingModule {
  id: string;
  titleUrdu: string;
  titleEn: string;
  descUrdu: string;
  descEn: string;
  durationMins: number;
  completed: boolean;
  scoreBoost: number;
  quiz?: {
    questionUrdu: string;
    questionEn: string;
    optionsUrdu: string[];
    optionsEn: string[];
    correctIndex: number;
  };
}

export type TrainingLesson = TrainingModule;

export interface FeedEvent {
  id: string;
  msgUrdu: string;
  msgEn: string;
  zone: string;
  time: string;
  type: string;
}

export interface FAQItem {
  qUrdu: string;
  qEn: string;
  aUrdu: string;
  aEn: string;
}

export interface TeamMember {
  id: string;
  name: string;
  nameUrdu: string;
  role: string;
  roleUrdu: string;
  badge: string;
  badgeUrdu: string;
  avatar: string;
  photoUrl?: string;
  tagline: string;
  taglineUrdu: string;
  welcomeMessage: string;
  welcomeMessageUrdu: string;
  isLead?: boolean;
}

export interface PlatformConfig {
  portalTitleEn: string;
  portalTitleUrdu: string;
  districtNameEn: string;
  districtNameUrdu: string;
  divisionNameEn: string;
  divisionNameUrdu: string;
  dcNameEn: string;
  dcNameUrdu: string;
  helplinePhone: string;
  whatsappEmergency: string;
  officeAddressEn: string;
  officeAddressUrdu: string;
  taglineEn: string;
  taglineUrdu: string;
  visionAttributionEn: string;
  visionAttributionUrdu: string;
  teamNameEn: string;
  teamNameUrdu: string;
}
