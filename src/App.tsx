import React, { useState, useEffect } from 'react';
import { 
  UserRole, Language, UserPreferences, 
  DCRateItem, VendorProfile, CitizenReport, Citation, 
  FieldTask, ZoneItem, FeedEvent, PlatformConfig, TeamMember
} from './types';
import { Sparkles, MessageSquare } from 'lucide-react';
import { 
  INITIAL_DC_RATES, INITIAL_VENDORS, INITIAL_CITIZEN_REPORTS, 
  INITIAL_CITATIONS, INITIAL_FIELD_TASKS, INITIAL_ZONES, INITIAL_FEED_EVENTS,
  INITIAL_PLATFORM_CONFIG, INITIAL_TEAM_MEMBERS
} from './data/seedData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { AlignModal } from './components/AlignModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { IntroTourModal } from './components/IntroTourModal';
import { AIGuideDrawer } from './components/AIGuideDrawer';
import { LocateModal } from './components/LocateModal';
import { WhyAndHowQA } from './components/WhyAndHowQA';
import { MasterSuiteModal } from './components/MasterSuiteModal';
import { BiometricModal } from './components/BiometricModal';
import { CitySlotsMapModal } from './components/CitySlotsMapModal';
import { CinematicIntro } from './components/CinematicIntro';
import { VoiceSearchCommandModal } from './components/VoiceSearchCommandModal';
import { PlatformDataEditorModal } from './components/PlatformDataEditorModal';
import { PakistanNationalMapView } from './components/PakistanNationalMapView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { UserProfileEntryModal, UserProfileData } from './components/UserProfileEntryModal';
import { VendorAllotmentModal } from './components/VendorAllotmentModal';

// Role View Components
import { CitizenView } from './components/CitizenView';
import { VendorView } from './components/VendorView';
import { InspectorView } from './components/InspectorView';
import { GovernmentView } from './components/GovernmentView';
import { FakharMasterView } from './components/FakharMasterView';
import { NavigationController } from './lib/navigationController';
import { StateSync } from './lib/stateSync';
import { triggerCelebration } from './lib/celebration';

export function App() {
  // Preferences & Alignment (Default to English LTR format)
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('cp_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return {
      lang: 'en',
      voice: 'male',
      mood: 'theek',
      voiceEnabled: true,
    };
  });

  // Flow Architecture: Welcome -> Login -> Map -> Video Presentation -> Platform Entry
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showPostLoginMap, setShowPostLoginMap] = useState<boolean>(false);
  const [showCinematicIntro, setShowCinematicIntro] = useState<boolean>(false);
  const [cinematicInitialTab, setCinematicInitialTab] = useState<'team' | 'pakistan_map' | 'mind_map' | 'video_room' | 'prompts' | 'framework'>('video_room');
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [userName, setUserName] = useState<string>(preferences.lang === 'ur' ? 'احمد علی خان (Ahmed Ali Khan)' : 'Ahmed Ali Khan (Citizen)');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // In-App Toast Notification System (Eliminates browser native alerts as per PDF specifications)
  const [toastNotification, setToastNotification] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastNotification({ text, type });
    setTimeout(() => {
      setToastNotification(curr => curr?.text === text ? null : curr);
    }, 4500);
  };

  // Synchronize HTML lang and dir attributes whenever preferences.lang changes
  useEffect(() => {
    document.documentElement.lang = preferences.lang;
    document.documentElement.dir = preferences.lang === 'ur' ? 'rtl' : 'ltr';
  }, [preferences.lang]);

  // Modal Visibilities
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showVoiceSearchModal, setShowVoiceSearchModal] = useState<boolean>(false);
  const [showAlignModal, setShowAlignModal] = useState<boolean>(false);
  const [showGuidedTourModal, setShowGuidedTourModal] = useState<boolean>(false);
  const [showIntroEcosystemModal, setShowIntroEcosystemModal] = useState<boolean>(false);
  const [showAIGuide, setShowAIGuide] = useState<boolean>(false);
  const [showLocateModal, setShowLocateModal] = useState<boolean>(false);
  const [showMasterSuiteModal, setShowMasterSuiteModal] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [showCitySlotsMapModal, setShowCitySlotsMapModal] = useState<boolean>(false);
  const [showNationalMapModal, setShowNationalMapModal] = useState<boolean>(false);
  const [showPlatformDataEditorModal, setShowPlatformDataEditorModal] = useState<boolean>(false);
  const [selectedCitySlotId, setSelectedCitySlotId] = useState<string | undefined>(undefined);
  const [locateTargetPlace, setLocateTargetPlace] = useState<string>('Raja Bazaar Rawalpindi');

  // User Civic Profile & Registration State
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(() => {
    try {
      const saved = localStorage.getItem('cp_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return null;
  });
  const [showVendorAllotmentModal, setShowVendorAllotmentModal] = useState<boolean>(false);
  const [allotmentSearchVendorId, setAllotmentSearchVendorId] = useState<string>('VRF-RWP-SLOT-19');

  // Zero-Latency CSS Breathing Animation: Detect User Inactivity
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const IDLE_TIMEOUT_MS = 5000; // 5 seconds of idle inactivity

    const setIdleTrue = () => {
      document.body.setAttribute('data-user-idle', 'true');
      document.documentElement.setAttribute('data-user-idle', 'true');
    };

    const handleUserInteraction = () => {
      document.body.setAttribute('data-user-idle', 'false');
      document.documentElement.setAttribute('data-user-idle', 'false');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(setIdleTrue, IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    events.forEach(evt => window.addEventListener(evt, handleUserInteraction, { passive: true }));

    idleTimer = setTimeout(setIdleTrue, IDLE_TIMEOUT_MS);

    return () => {
      clearTimeout(idleTimer);
      events.forEach(evt => window.removeEventListener(evt, handleUserInteraction));
    };
  }, []);

  // Live Civic State Collections with LocalStorage Persistence
  const [dcRates, setDcRates] = useState<DCRateItem[]>(() => {
    try {
      const saved = localStorage.getItem('cp_dc_rates');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return INITIAL_DC_RATES;
  });

  const [vendors, setVendors] = useState<VendorProfile[]>(() => {
    try {
      const saved = localStorage.getItem('cp_vendors');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return INITIAL_VENDORS;
  });

  const [reports, setReports] = useState<CitizenReport[]>(() => {
    try {
      const saved = localStorage.getItem('cp_reports');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return INITIAL_CITIZEN_REPORTS;
  });

  const [citations, setCitations] = useState<Citation[]>(() => {
    try {
      const saved = localStorage.getItem('cp_citations');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return INITIAL_CITATIONS;
  });

  const [fieldTasks, setFieldTasks] = useState<FieldTask[]>(() => {
    try {
      const saved = localStorage.getItem('cp_field_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return INITIAL_FIELD_TASKS;
  });

  const [zones, setZones] = useState<ZoneItem[]>(() => {
    try {
      const saved = localStorage.getItem('cp_zones');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return INITIAL_ZONES;
  });

  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>(() => {
    try {
      const saved = localStorage.getItem('cp_feed_events');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return INITIAL_FEED_EVENTS;
  });

  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(() => {
    try {
      const saved = localStorage.getItem('cp_platform_config');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return INITIAL_PLATFORM_CONFIG;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('cp_custom_team_data');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return INITIAL_TEAM_MEMBERS;
  });

  // Auto-Save Data Collections to LocalStorage & Emit StateSync Events
  useEffect(() => {
    try { localStorage.setItem('cp_dc_rates', JSON.stringify(dcRates)); } catch(e){}
  }, [dcRates]);

  useEffect(() => {
    try { localStorage.setItem('cp_vendors', JSON.stringify(vendors)); } catch(e){}
    StateSync.emitVendors(vendors);
  }, [vendors]);

  useEffect(() => {
    try { localStorage.setItem('cp_reports', JSON.stringify(reports)); } catch(e){}
    StateSync.emitReports(reports);
  }, [reports]);

  useEffect(() => {
    try { localStorage.setItem('cp_citations', JSON.stringify(citations)); } catch(e){}
    StateSync.emitCitations(citations);
  }, [citations]);

  useEffect(() => {
    try { localStorage.setItem('cp_field_tasks', JSON.stringify(fieldTasks)); } catch(e){}
  }, [fieldTasks]);

  useEffect(() => {
    try { localStorage.setItem('cp_zones', JSON.stringify(zones)); } catch(e){}
  }, [zones]);

  useEffect(() => {
    try { localStorage.setItem('cp_feed_events', JSON.stringify(feedEvents)); } catch(e){}
  }, [feedEvents]);

  useEffect(() => {
    try { localStorage.setItem('cp_platform_config', JSON.stringify(platformConfig)); } catch(e){}
  }, [platformConfig]);

  useEffect(() => {
    try { localStorage.setItem('cp_custom_team_data', JSON.stringify(teamMembers)); } catch(e){}
  }, [teamMembers]);

  // Sync role default tab on role switch
  const handleSwitchRole = (role: UserRole) => {
    // Strict RBAC Enforcement: Non-admin users cannot switch roles while logged in
    if (isLoggedIn && currentRole !== 'government' && currentRole !== 'fakhar_master' && role !== currentRole) {
      const isUrdu = preferences.lang === 'ur';
      showToast(
        isUrdu 
          ? 'سیکیورٹی الرٹ: کنسول اور کردار تبدیل کرنے کی اجازت صرف سرکاری افسر یا فخر مشتاق کو ہے۔' 
          : 'Security Alert: Role switching is strictly restricted to Government Official or Fakhar Mushtaq Master.',
        'warn'
      );
      return;
    }

    setCurrentRole(role);
    const isUrdu = preferences.lang === 'ur';
    let roleTitleUr = 'شہری کنسول';
    let roleTitleEn = 'Citizen Console';

    if (role === 'citizen') {
      setActiveTab('overview');
      setUserName(isUrdu ? 'احمد علی خان (Ahmed Ali Khan)' : 'Ahmed Ali Khan (Citizen)');
      roleTitleUr = 'شہری کنسول';
      roleTitleEn = 'Citizen Console';
    } else if (role === 'vendor') {
      setActiveTab('dashboard');
      setUserName(isUrdu ? 'محمد بلال (Muhammad Bilal)' : 'Muhammad Bilal (Vendor Slot 19)');
      roleTitleUr = 'ریڑھی بان و دکاندار کنسول';
      roleTitleEn = 'Vendor Console';
    } else if (role === 'inspector') {
      setActiveTab('duty');
      setUserName(isUrdu ? 'مظہر اقبال (PERA-884)' : 'Mazhar Iqbal (PERA-884)');
      roleTitleUr = 'پیرہ مجسٹریٹ کنسول';
      roleTitleEn = 'PERA Inspector Console';
    } else if (role === 'government') {
      setActiveTab('command');
      setUserName(isUrdu ? 'ڈائریکٹر ریگولیشن (DC Command)' : 'Director Regulation (DC Command)');
      roleTitleUr = 'ڈپٹی کمشنر کمانڈ کنسول';
      roleTitleEn = 'DC Command Console';
    } else if (role === 'fakhar_master') {
      setActiveTab('master_overview');
      setUserName(isUrdu ? 'فخر مشتاق (Fakhar Mushtaq)' : 'Fakhar Mushtaq (Vision Lead)');
      roleTitleUr = 'فخر مشتاق ماسٹر کنسول';
      roleTitleEn = 'Fakhar Master Executive Console';
    }

    showToast(
      isUrdu 
        ? `⚡ فوری کنسول سوئچ: اب آپ "${roleTitleUr}" میں ہیں۔ تمام فعال ٹیبز اور اجازتیں اپ ڈیٹ ہو گئی ہیں۔` 
        : `⚡ Quick Switched to "${roleTitleEn}". All active tabs and permissions dynamically updated.`,
      'success'
    );
  };

  const handleSaveUserProfile = (profile: UserProfileData) => {
    setUserProfile(profile);
    setUserName(profile.fullName);
    const isUrdu = preferences.lang === 'ur';
    showToast(
      isUrdu 
        ? `شکریہ ${profile.fullName}! آپ کی معلومات کامیابی سے محفوظ ہو گئیں۔` 
        : `Personal profile saved for ${profile.fullName}. Civic access personalized.`,
      'success'
    );
  };

  const handleOpenVendorAllotment = (vendorId?: string) => {
    if (vendorId) setAllotmentSearchVendorId(vendorId);
    setShowVendorAllotmentModal(true);
  };

  const handleLogin = (role: UserRole, name: string) => {
    triggerCelebration('entry');
    setCurrentRole(role);
    setUserName(name);
    setIsLoggedIn(true);
    handleSwitchRole(role);
    // User lands directly in their personalized role dashboard
    setShowPostLoginMap(false);
    setShowCinematicIntro(false);

    // Auto-prompt registration form if user has not filled basic info yet
    const savedProf = localStorage.getItem('cp_user_profile');
    if (!savedProf) {
      setTimeout(() => {
        setShowUserProfileModal(true);
      }, 150);
    }

    // Show align modal on first login if not set
    if (!localStorage.getItem('cp_prefs')) {
      setShowAlignModal(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowPostLoginMap(false);
    setShowCinematicIntro(false);
    setShowWelcomeScreen(true);
  };

  const toggleLanguage = () => {
    const nextLang: Language = preferences.lang === 'ur' ? 'en' : 'ur';
    const updated = { ...preferences, lang: nextLang };
    setPreferences(updated);
    try {
      localStorage.setItem('cp_prefs', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Safe navigation handler with orphan-tab fallback and modal triggers
  const handleSelectTab = (tab: string) => {
    // 1. Intercept modal triggers
    if (tab === 'master_suite') {
      setShowMasterSuiteModal(true);
      return;
    }
    if (tab === 'data_editor') {
      setShowPlatformDataEditorModal(true);
      return;
    }
    if (tab === 'city_slots' || tab === 'city_slots_map') {
      setSelectedCitySlotId(undefined);
      setShowCitySlotsMapModal(true);
      return;
    }
    if (tab === 'vendor_allotment') {
      setShowVendorAllotmentModal(true);
      return;
    }
    if (tab === 'user_profile') {
      setShowUserProfileModal(true);
      return;
    }
    if (tab === 'guided_tour' || tab === 'tour') {
      setShowGuidedTourModal(true);
      return;
    }
    if (tab === 'cinematic_intro' || tab === 'video_room') {
      setCinematicInitialTab('video_room');
      setShowCinematicIntro(true);
      return;
    }
    if (tab === 'ai_guide') {
      setShowAIGuide(true);
      return;
    }
    if (tab === 'voice_search') {
      setShowVoiceSearchModal(true);
      return;
    }
    if (tab === 'align_modal') {
      setShowAlignModal(true);
      return;
    }

    // 2. Global full-screen tabs
    if (tab === 'why_how' || tab === 'pakistan_map' || tab === 'mind_map') {
      setActiveTab(tab);
      return;
    }

    // 3. Role-specific validation & strict role-based access control via NavigationController
    const validatedTab = NavigationController.validateTab(currentRole, tab);
    setActiveTab(validatedTab);
  };

  // Report Creation Handler with AI-Assisted Variance & Priority Classification
  const handleAddReport = (newReport: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>) => {
    const variance = newReport.dcRate > 0 
      ? ((newReport.chargedPrice - newReport.dcRate) / newReport.dcRate) * 100 
      : 0;
    const priority: 'Critical' | 'High' | 'Medium' | 'Low' = 
      variance > 30 ? 'Critical' : variance > 15 ? 'High' : variance > 5 ? 'Medium' : 'Low';
    
    const aiAnalysis = `AI Variance Analysis: +${variance.toFixed(1)}% above DC ceiling. ${
      variance > 25 
        ? 'High severity overcharge detected on essential commodity.' 
        : 'Moderate rate disparity detected.'
    } System classified as ${priority} Priority for field inspection.`;
    
    const aiAction = variance > 25 
      ? 'Recommended: Urgent patrol squad dispatch, verify digital scale calibration, issue citation if deliberate variance.'
      : 'Recommended: Routine spot audit, issue coaching advisory and verify daily rate board display.';

    const created: CitizenReport = {
      ...newReport,
      id: `CP-26-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
      date: (newReport as any).date || new Date().toISOString().split('T')[0],
      zone: (newReport as any).zone || newReport.location || 'Zone 1 (Anarkali)',
      status: 'verified',
      priority,
      aiSeverityAnalysis: aiAnalysis,
      aiRecommendedAction: aiAction,
    };
    
    setReports(prev => {
      const updated = [created, ...prev];
      try { localStorage.setItem('cp_reports', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    // Push to live feed
    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `نئی شکایت: ${created.item} پر +${variance.toFixed(0)}% زائد قیمت کی اطلاع (${created.location})۔ ترجیح: ${priority}۔`,
      msgEn: `New Report: Overcharging on ${created.item} (+${variance.toFixed(0)}%) at ${created.location}. Priority: ${priority}.`,
      zone: created.location,
      time: 'Just now',
      type: 'report',
    };
    setFeedEvents(prev => {
      const updatedFeed = [newFeed, ...prev];
      try { localStorage.setItem('cp_feed_events', JSON.stringify(updatedFeed)); } catch(e){}
      return updatedFeed;
    });

    triggerCelebration('achievement');
  };

  // Citation Issuance Handler
  const handleIssueCitation = (newCitation: Omit<Citation, 'id' | 'timestamp'>) => {
    const created: Citation = {
      ...newCitation,
      id: `CH-26-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: 'Just now',
    };
    setCitations(prev => {
      const updated = [created, ...prev];
      try { localStorage.setItem('cp_citations', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    // Push to live feed
    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `چالان جاری: ${created.vendorName} پر Rs. ${created.fineAmount} جرمانہ (${created.variancePct}% زائد قیمت)۔`,
      msgEn: `Citation Issued: Rs. ${created.fineAmount} fine on ${created.vendorName} (+${created.variancePct}% variance).`,
      zone: created.marketName,
      time: 'Just now',
      type: 'citation',
    };
    setFeedEvents(prev => {
      const updatedFeed = [newFeed, ...prev];
      try { localStorage.setItem('cp_feed_events', JSON.stringify(updatedFeed)); } catch(e){}
      return updatedFeed;
    });

    triggerCelebration('action');
  };

  // Vendor Response Handler to Report
  const handleVendorRespondToReport = (reportId: string, responseText: string) => {
    setReports(prev => {
      const updated = prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'vendor_responded' as const,
            vendorResponse: responseText,
          };
        }
        return r;
      });
      try { localStorage.setItem('cp_reports', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `وینڈر کا جوابی ردعمل موصول: رپورٹ #${reportId} پر وینڈر نے اصلاحی بیان درج کرایا۔`,
      msgEn: `Vendor Response Logged: Vendor submitted compliance statement for Report #${reportId}.`,
      zone: 'Zone 1 (Anarkali)',
      time: 'Just now',
      type: 'report',
    };
    setFeedEvents(prev => {
      const updatedFeed = [newFeed, ...prev];
      try { localStorage.setItem('cp_feed_events', JSON.stringify(updatedFeed)); } catch(e){}
      return updatedFeed;
    });
    showToast(isUrdu ? 'وینڈر کا وضاحتی بیان کامیابی سے درج کر لیا گیا ہے۔' : 'Vendor compliance response successfully logged.', 'success');
  };

  // Vendor Response Handler to Citation
  const handleVendorRespondToCitation = (citationId: string, responseText: string) => {
    setCitations(prev => {
      const updated = prev.map(c => {
        if (c.id === citationId) {
          return {
            ...c,
            status: 'vendor_responded' as const,
            vendorResponse: responseText,
          };
        }
        return c;
      });
      try { localStorage.setItem('cp_citations', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `چالان #${citationId} پر وینڈر کا جواب درج: فیلڈ مجسٹریٹ کو نظرثانی کیلئے ارسال۔`,
      msgEn: `Vendor Response Logged on Citation #${citationId}: Transmitted to Magistrate for review.`,
      zone: 'Zone 1 (Anarkali)',
      time: 'Just now',
      type: 'citation',
    };
    setFeedEvents(prev => {
      const updatedFeed = [newFeed, ...prev];
      try { localStorage.setItem('cp_feed_events', JSON.stringify(updatedFeed)); } catch(e){}
      return updatedFeed;
    });
    showToast(isUrdu ? 'چالان پر وینڈر کا ردعمل جمع کر دیا گیا۔' : 'Citation compliance response submitted.', 'success');
  };

  // Inspector Action on Citizen Report
  const handleInspectorActionOnReport = (
    reportId: string,
    action: 'warning' | 'penalty' | 'coaching_advisory' | 'verified_compliant',
    notes: string
  ) => {
    setReports(prev => {
      const updated = prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'resolved' as const,
            inspectorActionTaken: action,
            inspectorNotes: notes,
            resolvedAt: 'Just now',
          };
        }
        return r;
      });
      try { localStorage.setItem('cp_reports', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    const actionTextUrdu = action === 'penalty' ? 'جرمانہ / چالان' : action === 'warning' ? 'تنبیہ / وارننگ' : action === 'coaching_advisory' ? 'تربیتی رہنمائی' : 'شکایت کی تصدیق و اصلاح';
    const actionTextEn = action === 'penalty' ? 'Penalty Citation' : action === 'warning' ? 'Formal Warning' : action === 'coaching_advisory' ? 'Coaching Advisory' : 'Compliance Verified';

    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `انسپکٹر ایکشن: رپورٹ #${reportId} پر ${actionTextUrdu} نافذ، کیس کامیابی سے حل۔`,
      msgEn: `Inspector Action: ${actionTextEn} executed on Report #${reportId}. Case resolved.`,
      zone: 'Active Sector',
      time: 'Just now',
      type: 'action',
    };
    setFeedEvents(prev => {
      const updatedFeed = [newFeed, ...prev];
      try { localStorage.setItem('cp_feed_events', JSON.stringify(updatedFeed)); } catch(e){}
      return updatedFeed;
    });
    showToast(isUrdu ? `رپورٹ #${reportId} پر انسپکٹر کارروائی مکمل اور کیس حل ہو گیا۔` : `Inspector action recorded. Report #${reportId} resolved.`, 'success');
  };

  // Resolve Citizen Report
  const handleResolveReport = (reportId: string, notes?: string) => {
    setReports(prev => {
      const updated = prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'resolved' as const,
            inspectorNotes: notes || r.inspectorNotes || 'Verified compliant with daily DC ceiling.',
            resolvedAt: 'Just now',
          };
        }
        return r;
      });
      try { localStorage.setItem('cp_reports', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    triggerCelebration('action');
    showToast(isUrdu ? `شکایت #${reportId} باضابطہ طور پر حل ہو گئی۔` : `Case #${reportId} officially resolved.`, 'success');
  };

  // Field Task Completion Handler
  const handleCompleteTask = (taskId: string) => {
    setFieldTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, completed: true } : t);
      try { localStorage.setItem('cp_field_tasks', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    triggerCelebration('achievement');
  };

  // Dispatch Assignment Handler with Linked FieldTask Generation
  const handleDispatchReport = (
    reportId: string, 
    squadName: string, 
    priority: 'routine' | 'urgent' | 'emergency' = 'urgent', 
    directives?: string
  ) => {
    const report = reports.find(r => r.id === reportId);
    const repItem = report?.item || 'Commodity Overcharging';
    const repLoc = report?.location || report?.marketName || 'Market Area';

    // 1. Update Citizen Report status
    setReports(prev => {
      const updated = prev.map(r => r.id === reportId ? { 
        ...r, 
        status: 'dispatched' as const, 
        inspectorAssigned: squadName, 
        notes: directives || `اسکواڈ "${squadName}" روانہ کر دیا گیا ہے۔ (${priority === 'emergency' ? 'ہنگامی ریڈ الرٹ' : priority === 'urgent' ? 'ارجنٹ' : 'معمول'} - ETA: 9 Mins)` 
      } : r);
      try { localStorage.setItem('cp_reports', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    // 2. Automatically generate linked task for Inspector Duty Queue
    const newTask: FieldTask = {
      id: `task-disp-${Date.now()}`,
      titleUrdu: `پیٹرول ڈسپیچ: ${repLoc} میں ${repItem} پر کارروائی`,
      titleEn: `Patrol Dispatch: ${repItem} spot check at ${repLoc}`,
      zone: report?.marketName || repLoc,
      market: repLoc,
      location: repLoc,
      targetSlot: report?.vendorName ? `${report.vendorName}` : 'Designated Stall',
      priority: priority === 'emergency' ? 'high' : priority === 'urgent' ? 'high' : 'medium',
      timeEst: '9 Mins',
      completed: false,
      reason: directives || `Government Dispatch: Investigate complaint for ${repItem} (Report #${reportId})`,
    };

    setFieldTasks(prev => {
      const updatedTasks = [newTask, ...prev];
      try { localStorage.setItem('cp_field_tasks', JSON.stringify(updatedTasks)); } catch(e){}
      return updatedTasks;
    });

    // 3. Emit Feed Event
    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `سرکاری ڈسپیچ: اسکواڈ "${squadName}" کو رپورٹ #${reportId} (${repItem}) کے معائنے کیلئے روانہ کر دیا گیا۔`,
      msgEn: `Government Dispatch: Squad "${squadName}" deployed for inspection on Report #${reportId} (${repItem}).`,
      zone: repLoc,
      time: 'Just now',
      type: 'dispatch',
    };
    setFeedEvents(prev => [newFeed, ...prev]);

    showToast(
      preferences.lang === 'ur'
        ? `اسکواڈ "${squadName}" کو کامیابی سے ڈسپیچ کر دیا گیا ہے۔ انسپکٹر ڈیوٹی پر ٹاسک منتقل ہو گیا۔`
        : `Squad "${squadName}" dispatched. Task synced to Inspector Duty Queue.`,
      'success'
    );
  };

  // DC Commodity Rate List Management Handlers
  const handleUpdateDcRate = (updatedRate: DCRateItem) => {
    setDcRates(prev => {
      const next = prev.map(r => r.id === updatedRate.id ? updatedRate : r);
      try { localStorage.setItem('cp_dc_rates', JSON.stringify(next)); } catch(e){}
      return next;
    });
    StateSync.emitDCRates(dcRates.map(r => r.id === updatedRate.id ? updatedRate : r));
    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `ڈی سی ریٹ اپ ڈیٹ: ${updatedRate.nameUrdu} کا سرکاری نرخ Rs. ${updatedRate.dcRate} مقرر کر دیا گیا۔`,
      msgEn: `DC Rate Updated: Price ceiling for ${updatedRate.nameEn} set to Rs. ${updatedRate.dcRate}.`,
      zone: 'District Command',
      time: 'Just now',
      type: 'rate',
    };
    setFeedEvents(prev => [newFeed, ...prev]);
    showToast(
      preferences.lang === 'ur'
        ? `${updatedRate.nameUrdu} کا نرخ کامیابی سے اپ ڈیٹ ہو گیا۔`
        : `${updatedRate.nameEn} price ceiling updated successfully.`,
      'success'
    );
  };

  const handleAddDcRate = (newRate: DCRateItem) => {
    setDcRates(prev => {
      const next = [newRate, ...prev];
      try { localStorage.setItem('cp_dc_rates', JSON.stringify(next)); } catch(e){}
      return next;
    });
    StateSync.emitDCRates([newRate, ...dcRates]);
    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `نئی شے کا اندراج: ${newRate.nameUrdu} سرکاری ریٹ لسٹ میں شامل، نرخ: Rs. ${newRate.dcRate}۔`,
      msgEn: `New Commodity Added: ${newRate.nameEn} added to official DC rate list at Rs. ${newRate.dcRate}.`,
      zone: 'District Command',
      time: 'Just now',
      type: 'rate',
    };
    setFeedEvents(prev => [newFeed, ...prev]);
    showToast(
      preferences.lang === 'ur'
        ? 'نئی شے سرکاری ریٹ لسٹ میں کامیابی سے شامل کر دی گئی۔'
        : 'New commodity added to official DC rate list.',
      'success'
    );
  };

  const handleDeleteDcRate = (rateId: string) => {
    const item = dcRates.find(r => r.id === rateId);
    setDcRates(prev => {
      const next = prev.filter(r => r.id !== rateId);
      try { localStorage.setItem('cp_dc_rates', JSON.stringify(next)); } catch(e){}
      return next;
    });
    showToast(
      preferences.lang === 'ur'
        ? `${item?.nameUrdu || 'شے'} ریٹ لسٹ سے خارج کر دی گئی۔`
        : `${item?.nameEn || 'Item'} removed from rate list.`,
      'info'
    );
  };

  const handlePublishAllDcRates = (ratesToPublish: DCRateItem[]) => {
    setDcRates(ratesToPublish);
    try { localStorage.setItem('cp_dc_rates', JSON.stringify(ratesToPublish)); } catch(e){}
    StateSync.emitDCRates(ratesToPublish);
    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `ڈپٹی کمشنر آفس: آج کے تمام اشیائے ضروریہ کے سرکاری نرخ نامے کی نئی لسٹ باضابطہ شائع اور لائیو سنک کر دی گئی۔`,
      msgEn: `DC Central Command: Official commodity rate list published and live synchronized across all citizen and vendor portals.`,
      zone: 'District Command',
      time: 'Just now',
      type: 'rate',
    };
    setFeedEvents(prev => [newFeed, ...prev]);
    showToast(
      preferences.lang === 'ur'
        ? 'آج کا مکمل سرکاری ریٹ نامہ باضابطہ جاری اور تمام پورٹلز پر لائیو ہو گیا۔'
        : 'Official DC Rate Gazette successfully published and synchronized across all portals.',
      'success'
    );
  };

  // Government Update Vendor Profile & Licensing
  const handleUpdateVendor = (vendorId: string, updates: Partial<VendorProfile>) => {
    setVendors(prev => {
      const updated = prev.map(v => v.id === vendorId ? { ...v, ...updates } : v);
      try {
        localStorage.setItem('cp_vendors', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    const vendor = vendors.find(v => v.id === vendorId);
    const vName = vendor ? (preferences.lang === 'ur' ? (vendor.nameUrdu || vendor.name) : vendor.name) : vendorId;
    const newFeed: FeedEvent = {
      id: `evt-${Date.now()}`,
      msgUrdu: `ضلعی انتظامیہ کی جانب سے وینڈر "${vName}" کا ریکارڈ، الاٹمنٹ اور لائسنس تصدیق نامہ اپ ڈیٹ کر دیا گیا۔`,
      msgEn: `District Administration updated official pitch allotment and license for Vendor "${vName}".`,
      zone: updates.zone || 'District Command',
      time: 'Just now',
      type: 'license',
    };
    setFeedEvents(prev => [newFeed, ...prev]);
  };

  // Reset to Seed
  const handleResetSeedData = () => {
    setDcRates(INITIAL_DC_RATES);
    setVendors(INITIAL_VENDORS);
    setReports(INITIAL_CITIZEN_REPORTS);
    setCitations(INITIAL_CITATIONS);
    setFieldTasks(INITIAL_FIELD_TASKS);
    setZones(INITIAL_ZONES);
    setFeedEvents(INITIAL_FEED_EVENTS);
    setPlatformConfig(INITIAL_PLATFORM_CONFIG);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    try {
      localStorage.removeItem('cp_dc_rates');
      localStorage.removeItem('cp_vendors');
      localStorage.removeItem('cp_reports');
      localStorage.removeItem('cp_citations');
      localStorage.removeItem('cp_field_tasks');
      localStorage.removeItem('cp_zones');
      localStorage.removeItem('cp_feed_events');
      localStorage.removeItem('cp_platform_config');
      localStorage.removeItem('cp_custom_team_data');
    } catch(e){}
    showToast(preferences.lang === 'ur' ? 'تمام ڈیٹا کامیابی سے اصل سرکاری حالت پر ری سیٹ ہو گیا ہے۔' : 'All platform data reset to official seed state.', 'info');
  };

  const isUrdu = preferences.lang === 'ur';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white ${isUrdu ? 'rtl' : 'ltr'}`}>
      {showWelcomeScreen && !isLoggedIn ? (
        <WelcomeScreen
          onProceedToLogin={() => setShowWelcomeScreen(false)}
          lang={preferences.lang}
          onToggleLang={toggleLanguage}
          onQuickRoleLogin={(role, name) => {
            setShowWelcomeScreen(false);
            handleLogin(role, name);
          }}
          onOpenVideoTour={() => {
            setCinematicInitialTab('video_room');
            setShowCinematicIntro(true);
          }}
        />
      ) : !isLoggedIn ? (
        <LoginScreen
          onLogin={handleLogin}
          lang={preferences.lang}
          onToggleLang={toggleLanguage}
          onBackToWelcome={() => setShowWelcomeScreen(true)}
          onOpenIntroTour={() => setShowIntroEcosystemModal(true)}
          onOpenCinematicIntro={() => {
            setCinematicInitialTab('video_room');
            setShowCinematicIntro(true);
          }}
          onOpenAlignModal={(onDone) => {
            setShowAlignModal(true);
            if (onDone) {
              // save callback to execute upon save
              (window as any).__onAlignDone = onDone;
            }
          }}
        />
      ) : showPostLoginMap ? (
        <IntroTourModal
          isOpen={true}
          isFullPage={true}
          lang={preferences.lang}
          onClose={() => {
            setShowPostLoginMap(false);
            setShowCinematicIntro(false);
          }}
          onLogout={handleLogout}
          onOpenLocate={(place) => {
            setLocateTargetPlace(place);
            setShowLocateModal(true);
          }}
        />
      ) : showCinematicIntro ? (
        <CinematicIntro
          initialTab={cinematicInitialTab}
          onContinue={() => {
            setShowCinematicIntro(false);
            setShowPostLoginMap(false);
            try {
              localStorage.setItem('cp_seen_intro', 'true');
            } catch (e) {
              console.warn(e);
            }
          }}
          onBackToMap={isLoggedIn ? () => {
            setShowCinematicIntro(false);
            setShowPostLoginMap(true);
          } : undefined}
          onOpenGuidedTour={() => {
            setShowCinematicIntro(false);
            setShowGuidedTourModal(true);
          }}
          lang={preferences.lang}
          onToggleLang={toggleLanguage}
        />
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* Global Header Topbar */}
          <Header
            currentRole={currentRole}
            userName={userName}
            lang={preferences.lang}
            onToggleLang={toggleLanguage}
            voiceEnabled={preferences.voiceEnabled}
            onToggleVoice={() => {
              const updated = { ...preferences, voiceEnabled: !preferences.voiceEnabled };
              setPreferences(updated);
              try { localStorage.setItem('cp_prefs', JSON.stringify(updated)); } catch(e){}
            }}
            onOpenVoiceSearch={() => setShowVoiceSearchModal(true)}
            onOpenAlignModal={() => setShowAlignModal(true)}
            onOpenMasterSuite={() => setShowMasterSuiteModal(true)}
            onOpenTour={() => setShowGuidedTourModal(true)}
            onOpenIntro={() => setShowIntroEcosystemModal(true)}
            onOpenAIGuide={() => setShowAIGuide(true)}
            onOpenDataEditor={() => setShowPlatformDataEditorModal(true)}
            onOpenLocate={(place) => {
              setLocateTargetPlace(place || 'Raja Bazaar Rawalpindi');
              setShowLocateModal(true);
            }}
            onOpenCitySlotsMap={() => {
              setSelectedCitySlotId(undefined);
              setShowCitySlotsMapModal(true);
            }}
            onOpenNationalMap={() => setShowNationalMapModal(true)}
            onOpenVendorAllotment={handleOpenVendorAllotment}
            onOpenUserProfile={() => setShowUserProfileModal(true)}
            userProfileCity={userProfile?.city}
            onSwitchRole={handleSwitchRole}
            onRoleChange={handleSwitchRole}
            onSelectNav={handleSelectTab}
            dcRates={dcRates}
            vendors={vendors}
            onLogout={handleLogout}
            unreadAlertCount={reports.filter(r => r.status === 'received').length}
            onOpenAlerts={() => {
              if (currentRole === 'government') handleSelectTab('dispatch');
              else if (currentRole === 'citizen') handleSelectTab('my_reports');
              else if (currentRole === 'inspector') handleSelectTab('citations');
              else handleSelectTab('overview');
            }}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          />

          {/* Body Container with Sidebar + Dynamic View */}
          <div className="flex-1 flex w-full max-w-[1760px] mx-auto px-2 sm:px-4 lg:px-6 py-4 gap-4">
            {/* Responsive Navigation Sidebar (Desktop Static + Mobile Drawer) */}
            <Sidebar
              currentRole={currentRole}
              activeTab={activeTab}
              onSelectTab={(tab) => {
                handleSelectTab(tab);
                setSidebarOpen(false);
              }}
              lang={preferences.lang}
              onOpenIntro={() => {
                setShowGuidedTourModal(true);
                setSidebarOpen(false);
              }}
              onOpenAlign={() => {
                setShowAlignModal(true);
                setSidebarOpen(false);
              }}
              onOpenAIGuide={() => {
                setShowAIGuide(true);
                setSidebarOpen(false);
              }}
              onOpenMasterSuite={() => {
                setShowMasterSuiteModal(true);
                setSidebarOpen(false);
              }}
              onOpenDataEditor={() => {
                setShowPlatformDataEditorModal(true);
                setSidebarOpen(false);
              }}
              onOpenCitySlotsMap={() => {
                setSelectedCitySlotId(undefined);
                setShowCitySlotsMapModal(true);
                setSidebarOpen(false);
              }}
              onOpenCinematicIntro={() => {
                setShowCinematicIntro(true);
                setSidebarOpen(false);
              }}
              onOpenVendorAllotment={handleOpenVendorAllotment}
              onOpenUserProfile={() => {
                setShowUserProfileModal(true);
                setSidebarOpen(false);
              }}
              pendingReportsCount={reports.filter(r => r.status === 'received').length}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content & Page Flow Container */}
            <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-6">
              <main className="flex-1 w-full max-w-full overflow-hidden">
                {activeTab === 'why_how' ? (
                  <WhyAndHowQA lang={preferences.lang} />
                ) : activeTab === 'pakistan_map' ? (
                  <PakistanNationalMapView
                    lang={preferences.lang}
                    onOpenCitySlotsMap={(slotId) => {
                      setSelectedCitySlotId(slotId);
                      setShowCitySlotsMapModal(true);
                    }}
                    onOpenLocate={(place) => {
                      setLocateTargetPlace(place);
                      setShowLocateModal(true);
                    }}
                  />
                ) : (
                  <>
                    {currentRole === 'citizen' && (
                      <CitizenView
                        activeTab={activeTab}
                        onSelectTab={handleSelectTab}
                        lang={preferences.lang}
                        dcRates={dcRates}
                        vendors={vendors}
                        reports={reports}
                        onSubmitReport={handleAddReport}
                        onRefreshRates={() => {
                          showToast(isUrdu ? 'سرکاری ڈی سی نرخ براہ راست ڈسٹرکٹ سرور سے ہم آہنگ ہو گئے ہیں ✓' : 'DC Rates live re-synced with District Command Server ✓', 'success');
                        }}
                        userName={userName}
                        onOpenAIGuide={() => setShowAIGuide(true)}
                        onOpenCitySlotsMap={(slotId) => {
                          setSelectedCitySlotId(slotId);
                          setShowCitySlotsMapModal(true);
                        }}
                        onOpenVendorAllotment={handleOpenVendorAllotment}
                      />
                    )}

                    {currentRole === 'vendor' && (
                      <VendorView
                        activeTab={activeTab}
                        onSelectTab={handleSelectTab}
                        lang={preferences.lang}
                        vendor={vendors[0]}
                        dcRates={dcRates}
                        reports={reports}
                        citations={citations}
                        onVendorRespondToReport={handleVendorRespondToReport}
                        onVendorRespondToCitation={handleVendorRespondToCitation}
                        onUpdateVendor={(updated) => {
                          setVendors(prev => prev.map(v => v.id === vendors[0]?.id ? { ...v, ...updated } : v));
                        }}
                        onOpenAIGuide={() => setShowAIGuide(true)}
                        onOpenCitySlotsMap={(slotId) => {
                          setSelectedCitySlotId(slotId);
                          setShowCitySlotsMapModal(true);
                        }}
                        onOpenVendorAllotment={handleOpenVendorAllotment}
                      />
                    )}

                    {currentRole === 'inspector' && (
                      <InspectorView
                        activeTab={activeTab}
                        onSelectTab={handleSelectTab}
                        lang={preferences.lang}
                        dcRates={dcRates}
                        vendors={vendors}
                        reports={reports}
                        citations={citations}
                        fieldTasks={fieldTasks}
                        zones={zones}
                        onInspectorActionOnReport={handleInspectorActionOnReport}
                        onResolveReport={handleResolveReport}
                        onIssueCitation={handleIssueCitation}
                        onCompleteTask={handleCompleteTask}
                        onOpenAIGuide={() => setShowAIGuide(true)}
                        onOpenCitySlotsMap={(slotId) => {
                          setSelectedCitySlotId(slotId);
                          setShowCitySlotsMapModal(true);
                        }}
                        onOpenVendorAllotment={handleOpenVendorAllotment}
                      />
                    )}

                    {currentRole === 'government' && (
                      <GovernmentView
                        activeTab={activeTab}
                        onSelectTab={handleSelectTab}
                        lang={preferences.lang}
                        dcRates={dcRates}
                        vendors={vendors}
                        reports={reports}
                        citations={citations}
                        zones={zones}
                        feedEvents={feedEvents}
                        onDispatchReport={handleDispatchReport}
                        onUpdateDcRate={handleUpdateDcRate}
                        onAddDcRate={handleAddDcRate}
                        onDeleteDcRate={handleDeleteDcRate}
                        onPublishRates={handlePublishAllDcRates}
                        onResetSeedData={handleResetSeedData}
                        onOpenAIGuide={() => setShowAIGuide(true)}
                        onOpenCitySlotsMap={(slotId) => {
                          setSelectedCitySlotId(slotId);
                          setShowCitySlotsMapModal(true);
                        }}
                        onOpenVendorAllotment={handleOpenVendorAllotment}
                        onUpdateVendor={handleUpdateVendor}
                      />
                    )}

                    {currentRole === 'fakhar_master' && (
                      <FakharMasterView
                        activeTab={activeTab}
                        onSelectTab={handleSelectTab}
                        lang={preferences.lang}
                        onSwitchRole={handleSwitchRole}
                        onOpenAIGuide={() => setShowAIGuide(true)}
                        onOpenMasterSuite={() => setShowMasterSuiteModal(true)}
                        onOpenDataEditor={() => setShowPlatformDataEditorModal(true)}
                      />
                    )}
                  </>
                )}
              </main>

              {/* Platform Global Desktop / Tablet Footer */}
              <footer className="mt-8 border-t border-slate-200 bg-white/90 backdrop-blur-xs py-4 px-6 rounded-2xl text-center text-xs text-slate-600 shadow-xs">
                <p className="font-semibold text-slate-800">
                  Connected Pakistan • <span className="text-emerald-700 font-bold">VRF Act 2026</span>
                </p>
                <p className="text-[11px] text-slate-500 font-urdu mt-0.5">
                  پاکستان زندہ باد • خود مختار معیشت، باوقار روزگار
                </p>
              </footer>
            </div>
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav
            currentRole={currentRole}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            lang={preferences.lang}
            onOpenAIGuide={() => setShowAIGuide(true)}
            pendingReportsCount={reports.filter(r => r.status === 'received').length}
          />

          {/* Floating Bottom-Right Adjustable AI Guide Assistant Launcher */}
          {!showAIGuide && (
            <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 group animate-fadeUp">
              <button
                id="btn-floating-ai-guide-launcher"
                onClick={() => setShowAIGuide(true)}
                className="flex items-center gap-2.5 bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#178A52] text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-2xl border-2 border-[#E3A82B] hover:border-amber-300 hover:scale-105 active:scale-95 transition-all duration-300 shadow-emerald-950/40"
                title={isUrdu ? "اے آئی گائیڈ کھولیں (منتقل و ایڈجسٹ کرنے کے قابل)" : "Open AI Civic Guide (Moveable & Adjustable Assistant)"}
                aria-label="Open AI Assistant"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-300/40">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#04231A] rounded-full animate-ping" />
                </div>
                
                <div className="text-left hidden xs:block">
                  <p className="text-[11px] sm:text-xs font-black tracking-wide text-amber-300 flex items-center gap-1 leading-tight">
                    <span>{isUrdu ? 'اے آئی معاون' : 'AI Civic Guide'}</span>
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1 py-0.2 rounded font-mono">2026</span>
                  </p>
                  <p className="text-[10px] text-slate-200 font-medium leading-tight">
                    {isUrdu ? 'ڈی سی ریٹس و فوری رہنمائی' : 'Ask Rates & Assistance'}
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= GLOBAL FLOATING MODALS ================= */}

      {/* Align-To-You Preferences Modal */}
      <AlignModal
        isOpen={showAlignModal}
        onClose={() => setShowAlignModal(false)}
        preferences={preferences}
        onSavePreferences={(newPrefs) => {
          setPreferences(newPrefs);
          try {
            localStorage.setItem('cp_prefs', JSON.stringify(newPrefs));
          } catch (e) {
            console.warn(e);
          }
        }}
      />

      {/* Personalized Complete Platform Guided Tour */}
      <GuidedTourModal
        isOpen={showGuidedTourModal}
        onClose={() => setShowGuidedTourModal(false)}
        lang={preferences.lang}
        currentRole={currentRole}
        onSelectRole={handleSwitchRole}
        onSelectTab={handleSelectTab}
        onOpenCitySlots={() => {
          setSelectedCitySlotId(undefined);
          setShowCitySlotsMapModal(true);
        }}
        onOpenVoiceSearch={() => setShowVoiceSearchModal(true)}
        onOpenNationalMap={() => setShowNationalMapModal(true)}
      />

      {/* Mind Map and GeoSpatial Ecosystem Tour */}
      <IntroTourModal
        isOpen={showIntroEcosystemModal}
        onClose={() => setShowIntroEcosystemModal(false)}
        lang={preferences.lang}
        onOpenLocate={(place) => {
          setLocateTargetPlace(place);
          setShowLocateModal(true);
        }}
      />

      {/* AI Guide Drawer */}
      <AIGuideDrawer
        isOpen={showAIGuide}
        onClose={() => setShowAIGuide(false)}
        lang={preferences.lang}
        onToggleLang={toggleLanguage}
        voice={preferences.voice}
        voiceEnabled={preferences.voiceEnabled}
        dcRates={dcRates}
        vendors={vendors}
        reports={reports}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
        }}
        onOpenReportModalWithItem={(_item, _rate) => {
          setActiveTab('report');
        }}
      />

      {/* Geospatial Locate Modal */}
      <LocateModal
        isOpen={showLocateModal}
        onClose={() => setShowLocateModal(false)}
        lang={preferences.lang}
        initialPlace={locateTargetPlace}
      />

      {/* Master Rebuild Prompt Suite Modal */}
      <MasterSuiteModal
        isOpen={showMasterSuiteModal}
        onClose={() => setShowMasterSuiteModal(false)}
        lang={preferences.lang}
      />

      {/* Biometric & Fast Auth Modal */}
      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        lang={preferences.lang}
        selectedRole={currentRole}
        onSuccess={(role, name) => {
          handleLogin(role, name);
        }}
      />

      {/* High-Precision City Slots & GIS Map Modal */}
      <CitySlotsMapModal
        isOpen={showCitySlotsMapModal}
        onClose={() => setShowCitySlotsMapModal(false)}
        lang={preferences.lang}
        initialSlotId={selectedCitySlotId}
        vendors={vendors}
      />

      {/* Live Platform Data & Records Editor Modal */}
      <PlatformDataEditorModal
        isOpen={showPlatformDataEditorModal}
        onClose={() => setShowPlatformDataEditorModal(false)}
        lang={preferences.lang}
        dcRates={dcRates}
        setDcRates={setDcRates}
        vendors={vendors}
        setVendors={setVendors}
        reports={reports}
        setReports={setReports}
        citations={citations}
        setCitations={setCitations}
        fieldTasks={fieldTasks}
        setFieldTasks={setFieldTasks}
        zones={zones}
        setZones={setZones}
        platformConfig={platformConfig}
        setPlatformConfig={setPlatformConfig}
        teamMembers={teamMembers}
        setTeamMembers={setTeamMembers}
        onResetSeedData={handleResetSeedData}
      />

      {/* Voice Search Command Modal */}
      <VoiceSearchCommandModal
        isOpen={showVoiceSearchModal}
        onClose={() => setShowVoiceSearchModal(false)}
        lang={preferences.lang}
        onExecuteCommand={(commandType, _payload) => {
          if (commandType === 'nav_rates') {
            setActiveTab('rates');
          } else if (commandType === 'city_slots_map') {
            setSelectedCitySlotId(undefined);
            setShowCitySlotsMapModal(true);
          } else if (commandType === 'nav_report') {
            setActiveTab('report');
          } else if (commandType === 'nav_vendors') {
            setActiveTab('vendors');
          } else if (commandType === 'nav_scanner') {
            setActiveTab('scanner');
          } else if (commandType === 'cinematic_intro') {
            setShowCinematicIntro(true);
          } else if (commandType === 'ai_guide') {
            setShowAIGuide(true);
          } else if (commandType === 'master_suite') {
            setShowMasterSuiteModal(true);
          } else if (commandType.startsWith('nav_')) {
            setActiveTab(commandType.replace('nav_', ''));
          }
        }}
      />

      {/* Pakistan National Map Modal */}
      {showNationalMapModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-[#04231A] border-2 border-[#E3A82B] rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 sm:px-6 bg-[#0B4A31] border-b border-[#178A52]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇵🇰</span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white font-sora">
                    {preferences.lang === 'ur' ? 'قومی جغرافیائی مائیکرو ریڈار و زون کوریج' : 'Pakistan National Geospatial & Micro-Zone Radar'}
                  </h3>
                  <p className="text-[11px] text-[#E3A82B] font-urdu">
                    30 اضلاع، آزاد کشمیر و گلگت بلتستان • 100% وی آر ایف تحفظ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNationalMapModal(false)}
                className="p-2 rounded-xl bg-[#04231A] hover:bg-rose-900 text-white transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#04231A]">
              <PakistanNationalMapView
                lang={preferences.lang}
                onOpenCitySlots={(slotId) => {
                  setShowNationalMapModal(false);
                  setSelectedCitySlotId(slotId);
                  setShowCitySlotsMapModal(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Civic Registration & Basic Profile Modal */}
      {showUserProfileModal && (
        <UserProfileEntryModal
          isOpen={showUserProfileModal}
          onClose={() => setShowUserProfileModal(false)}
          lang={preferences.lang}
          currentRole={currentRole}
          currentName={userName}
          initialData={userProfile || undefined}
          onSave={handleSaveUserProfile}
          onSaveProfile={handleSaveUserProfile}
        />
      )}

      {/* Official Vendor Slot Allotment & GPS Location Modal */}
      {showVendorAllotmentModal && (
        <VendorAllotmentModal
          isOpen={showVendorAllotmentModal}
          onClose={() => setShowVendorAllotmentModal(false)}
          lang={preferences.lang}
          initialVendorId={allotmentSearchVendorId}
          currentRole={currentRole}
          vendors={vendors}
          onOpenRadarSlots={(slotId) => {
            setShowVendorAllotmentModal(false);
            setSelectedCitySlotId(slotId);
            setShowCitySlotsMapModal(true);
          }}
        />
      )}

      {/* Global In-App Toast Notification (Zero browser-native alerts) */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-md animate-bounceIn">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-sm font-bold ${
            toastNotification.type === 'warn'
              ? 'bg-[#04231A] text-amber-300 border-amber-500'
              : toastNotification.type === 'info'
              ? 'bg-[#04231A] text-sky-300 border-sky-500'
              : 'bg-[#04231A] text-[#FCFAF3] border-[#178A52]'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3A82B] animate-ping shrink-0" />
              <span className="font-urdu leading-relaxed">{toastNotification.text}</span>
            </div>
            <button 
              onClick={() => setToastNotification(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs shrink-0"
              aria-label="Dismiss toast"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
