import React, { useState, useEffect } from 'react';
import { 
  Award, Trophy, Star, ShieldCheck, Flame, Gift, CheckCircle2, 
  ArrowRight, Sparkles, TrendingUp, HelpCircle, FileCheck, Share2, 
  Download, Volume2, UserCheck
} from 'lucide-react';
import { Language, CivicPointsProfile, CivicActivity } from '../types';
import { speechService } from '../lib/audio';

interface CivicPointsSectionProps {
  lang: Language;
  userName: string;
  onNavigateToReport: () => void;
  onNavigateToRates: () => void;
  onNavigateToVendors: () => void;
}

const DEFAULT_PROFILE: CivicPointsProfile = {
  totalPoints: 340,
  level: 2,
  badgeTitle: 'Civic Guardian',
  badgeTitleUrdu: 'محافظِ انصاف',
  verifiedReportsCount: 4,
  priceAuditsCount: 6,
  vendorRatingsCount: 3,
  streakDays: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  activities: [
    {
      id: 'act-1',
      title: 'Verified Overpricing Report: Onion (Raja Bazaar)',
      titleUrdu: 'پیاز کے زائد نرخ کی تصدیق شدہ رپورٹ (راجہ بازار)',
      points: 50,
      timestamp: 'Today, 02:15 PM',
      type: 'report_verified',
    },
    {
      id: 'act-2',
      title: 'Spot Price Audit: 10kg Atta Ceiling Check',
      titleUrdu: '10 کلو آٹا سرکاری ریٹ اسپاٹ آڈٹ',
      points: 25,
      timestamp: 'Yesterday, 11:30 AM',
      type: 'rate_check',
    },
    {
      id: 'act-3',
      title: 'Green Vendor Review: Al-Madina Fruits (Slot 04)',
      titleUrdu: 'گرین دکاندار ریویو: المدینہ فروٹ (سلاٹ 04)',
      points: 15,
      timestamp: '2 days ago',
      type: 'vendor_review',
    },
    {
      id: 'act-4',
      title: 'Civic Rights & Price Laws Quiz Completed',
      titleUrdu: 'شہری حقوق و پرائس ایکٹ کوئز پاس کیا',
      points: 30,
      timestamp: '3 days ago',
      type: 'quiz_completed',
    },
    {
      id: 'act-5',
      title: '5-Day Continuous Daily Login Streak',
      titleUrdu: '5 روزہ مسلسل لاگ ان اسٹریک',
      points: 10,
      timestamp: '4 days ago',
      type: 'daily_streak',
    },
  ],
  unlockedRewards: ['cert_dc', 'badge_guardian', 'priority_queue'],
};

export const CivicPointsSection: React.FC<CivicPointsSectionProps> = ({
  lang,
  userName,
  onNavigateToReport,
  onNavigateToRates,
  onNavigateToVendors,
}) => {
  const isUrdu = lang === 'ur';

  // Persistent Civic Points state
  const [profile, setProfile] = useState<CivicPointsProfile>(() => {
    try {
      const saved = localStorage.getItem('cp_citizen_civic_points');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PROFILE;
  });

  const [activeQuizIndex, setActiveQuizIndex] = useState<number | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [claimedStreakToday, setClaimedStreakToday] = useState<boolean>(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // Save changes automatically
  const saveProfile = (newProf: CivicPointsProfile) => {
    setProfile(newProf);
    try {
      localStorage.setItem('cp_citizen_civic_points', JSON.stringify(newProf));
    } catch (e) {
      console.warn(e);
    }
  };

  // Check level calculation
  const getLevelInfo = (pts: number) => {
    if (pts >= 1000) {
      return {
        level: 4,
        titleEn: 'National Champion',
        titleUrdu: 'قومی سفیرِ انصاف',
        nextTarget: 2000,
        color: '#E3A82B',
        icon: '👑',
        progressPct: Math.min(100, (pts / 2000) * 100),
      };
    }
    if (pts >= 500) {
      return {
        level: 3,
        titleEn: 'Community Hero',
        titleUrdu: 'ہیرو آف کمیونٹی',
        nextTarget: 1000,
        color: '#178A52',
        icon: '🏆',
        progressPct: ((pts - 500) / 500) * 100,
      };
    }
    if (pts >= 200) {
      return {
        level: 2,
        titleEn: 'Civic Guardian',
        titleUrdu: 'محافظِ انصاف',
        nextTarget: 500,
        color: '#3D7EA6',
        icon: '🛡️',
        progressPct: ((pts - 200) / 300) * 100,
      };
    }
    return {
      level: 1,
      titleEn: 'Vigilant Citizen',
      titleUrdu: 'بیدار شہری',
      nextTarget: 200,
      color: '#7BA66B',
      icon: '🌱',
      progressPct: (pts / 200) * 100,
    };
  };

  const currentLevelInfo = getLevelInfo(profile.totalPoints);

  // Award Points Helper
  const awardPoints = (amount: number, titleEn: string, titleUrdu: string, type: CivicActivity['type']) => {
    const newTotal = profile.totalPoints + amount;
    const newLevelInfo = getLevelInfo(newTotal);
    const newActivity: CivicActivity = {
      id: `act-${Date.now()}`,
      title: titleEn,
      titleUrdu: titleUrdu,
      points: amount,
      timestamp: 'Just now',
      type,
    };

    const newProf: CivicPointsProfile = {
      ...profile,
      totalPoints: newTotal,
      level: newLevelInfo.level,
      badgeTitle: newLevelInfo.titleEn,
      badgeTitleUrdu: newLevelInfo.titleUrdu,
      activities: [newActivity, ...profile.activities.slice(0, 15)],
    };

    if (type === 'report_verified') newProf.verifiedReportsCount += 1;
    if (type === 'rate_check') newProf.priceAuditsCount += 1;
    if (type === 'vendor_review') newProf.vendorRatingsCount += 1;

    saveProfile(newProf);

    setRewardToast(`+${amount} ${isUrdu ? 'شہری پوائنٹس شامل ہو گئے!' : 'Civic Points Awarded!'}`);
    setTimeout(() => setRewardToast(null), 3000);

    speechService.playChime('complete');
    setTimeout(() => {
      speechService.speak(
        isUrdu 
          ? `مبارک ہو! آپ کو ${amount} شہری پوائنٹس مل گئے ہیں۔ آپ کا موجودہ رینک ${newLevelInfo.titleUrdu} ہے۔` 
          : `Congratulations! You earned ${amount} Civic Points. Your current rank is ${newLevelInfo.titleEn}.`,
        { lang: isUrdu ? 'ur' : 'en' }
      );
    }, 150);
  };

  // Daily Streak Claim
  const handleClaimStreak = () => {
    if (claimedStreakToday) return;
    setClaimedStreakToday(true);
    const newStreak = profile.streakDays + 1;
    const newTotal = profile.totalPoints + 10;
    const newLevelInfo = getLevelInfo(newTotal);

    const newActivity: CivicActivity = {
      id: `act-${Date.now()}`,
      title: `Daily Check-in: Day ${newStreak} Streak`,
      titleUrdu: `روزانہ حاضری: ${newStreak} روزہ اسٹریک`,
      points: 10,
      timestamp: 'Just now',
      type: 'daily_streak',
    };

    const newProf: CivicPointsProfile = {
      ...profile,
      totalPoints: newTotal,
      streakDays: newStreak,
      level: newLevelInfo.level,
      badgeTitle: newLevelInfo.titleEn,
      badgeTitleUrdu: newLevelInfo.titleUrdu,
      activities: [newActivity, ...profile.activities.slice(0, 15)],
    };

    saveProfile(newProf);
    setRewardToast(isUrdu ? '+10 پوائنٹس! روزانہ اسٹریک حاصل کر لیا گیا۔' : '+10 Points! Daily streak claimed.');
    setTimeout(() => setRewardToast(null), 3000);
  };

  // Civic Quiz Bank
  const QUIZ_QUESTIONS = [
    {
      qEn: 'Under the Price Control and Prevention of Profiteering and Hoarding Act, what is required of every registered vendor?',
      qUrdu: 'پرائس کنٹرول ایکٹ کے تحت ہر رجسٹرڈ دکاندار پر کیا لازمی ہے؟',
      optionsEn: [
        'Display official DC Rate List at a prominent spot and issue verified prices',
        'Charge any market price according to daily personal wish',
        'Hide commodity prices until the customer pays',
        'Only sell goods after midnight',
      ],
      optionsUrdu: [
        'نمایاں جگہ پر سرکاری ڈی سی نرخ نامہ آویزاں کرنا اور مقررہ ریٹ پر فروخت کرنا',
        'اپنی مرضی کے مطابق جو چاہیں ریٹ وصول کرنا',
        'گاہک کے خریدنے تک قیمتیں خفیہ رکھنا',
        'صرف رات کے اوقات میں خریداری کی اجازت دینا',
      ],
      correctIndex: 0,
      explanationEn: 'Vendors must prominently display the Deputy Commissioner price list and adhere to the official price ceilings.',
      explanationUrdu: 'قانون کے مطابق دکاندار کے لیے سرکاری ریٹ لسٹ آویزاں کرنا اور مقررہ نرخوں پر اشیاء فراہم کرنا لازمی ہے۔',
    },
    {
      qEn: 'What happens when a citizen submits an anonymous overcharging report on Connected Pakistan?',
      qUrdu: 'کنیکٹڈ پاکستان پر شہری کی گمنام شکایت پر کیا فوری کارروائی ہوتی ہے؟',
      optionsEn: [
        'AI verifies the price disparity and dispatches the nearest Price Magistrate Squad',
        'The citizen’s private contact details are shared with the vendor',
        'Nothing happens until 30 days have passed',
        'The app deletes the report automatically',
      ],
      optionsUrdu: [
        'اے آئی سسٹم ڈی سی ریٹ سے فرق چیک کر کے قریبی فیلڈ پرائس مجسٹریٹ اسکواڈ کو فوری روانہ کرتا ہے',
        'شہری کا ذاتی فون نمبر دکاندار کو دیا جاتا ہے',
        '30 دن تک کوئی کارروائی نہیں ہوتی',
        'سسٹم شکایت کو خودکار طریقے سے ڈیلیٹ کر دیتا ہے',
      ],
      correctIndex: 0,
      explanationEn: 'The automated engine verifies the DC rate deviation and dispatches field inspectors in real time while keeping the citizen 100% anonymous.',
      explanationUrdu: 'اے آئی سسٹم فوری طور پر ریٹ کے فرق کی توثیق کر کے فیلڈ مجسٹریٹ کو موقع پر بھیجتا ہے جبکہ شہری کا ڈیٹا 100 فیصد خفیہ رہتا ہے۔',
    },
  ];

  const handleQuizSubmit = (questionIdx: number) => {
    if (selectedQuizOption === null) return;
    const currentQ = QUIZ_QUESTIONS[questionIdx];
    const isCorrect = selectedQuizOption === currentQ.correctIndex;

    if (isCorrect) {
      setQuizFeedback({
        isCorrect: true,
        text: isUrdu ? currentQ.explanationUrdu : currentQ.explanationEn,
      });
      awardPoints(30, 'Civic Knowledge Quiz Passed (+30 Pts)', 'شہری شعور و پرائس ایکٹ کوئز کامیابی سے مکمل کیا', 'quiz_completed');
    } else {
      setQuizFeedback({
        isCorrect: false,
        text: isUrdu 
          ? `غلط جواب۔ درست جواب: ${currentQ.optionsUrdu[currentQ.correctIndex]}۔ ${currentQ.explanationUrdu}`
          : `Incorrect. Correct answer: ${currentQ.optionsEn[currentQ.correctIndex]}. ${currentQ.explanationEn}`,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Reward Floating Toast */}
      {rewardToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#04231A] text-[#E3A82B] border-2 border-[#E3A82B] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-6 h-6 text-[#E3A82B]" />
          <span className="font-extrabold text-sm">{rewardToast}</span>
        </div>
      )}

      {/* Hero Gamification Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#E3A82B] shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#178A52]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#E3A82B]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#E3A82B] text-[#04231A] px-3.5 py-1 rounded-full text-xs font-black shadow-md">
              <Trophy className="w-4 h-4 text-[#04231A]" />
              <span>{isUrdu ? 'قومی شہری انعامی نظام' : 'National Civic Rewards System'}</span>
            </div>

            <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              {isUrdu ? `${userName} کا شہری پوائنٹس ڈیش بورڈ` : `${userName}'s Civic Points Dashboard`}
            </h2>

            <p className="text-sm sm:text-base text-[#DCEFE4] font-urdu max-w-2xl leading-relaxed">
              {isUrdu 
                ? 'گراں فروشی کی تصدیق شدہ رپورٹنگ، سرکاری نرخوں کی نگرانی اور ایماندار گرین دکانداروں کی حوصلہ افزائی پر پوائنٹس اور اعزازی سرٹیفکیٹ حاصل کریں۔'
                : 'Earn Civic Points by monitoring official DC prices, submitting verified reports, and supporting honest vendors. Unlock digital badges and official DC commendations.'}
            </p>

            {/* Quick Badges & Daily Streak */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="bg-[#04231A]/80 border border-[#178A52] px-3 py-1.5 rounded-xl flex items-center gap-2 shadow">
                <span className="text-lg">{currentLevelInfo.icon}</span>
                <div>
                  <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'موجودہ رینک' : 'Current Rank'}</span>
                  <span className="text-xs font-extrabold text-[#E3A82B]">
                    {isUrdu ? currentLevelInfo.titleUrdu : currentLevelInfo.titleEn} (Lvl {currentLevelInfo.level})
                  </span>
                </div>
              </div>

              <div className="bg-[#04231A]/80 border border-[#178A52] px-3 py-1.5 rounded-xl flex items-center gap-2 shadow">
                <Flame className="w-5 h-5 text-[#E3A82B] animate-pulse" />
                <div>
                  <span className="text-[10px] text-[#DCEFE4]/70 block">{isUrdu ? 'روزانہ اسٹریک' : 'Daily Streak'}</span>
                  <span className="text-xs font-extrabold text-white">
                    {profile.streakDays} {isUrdu ? 'دن مسلسل' : 'Days Active'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleClaimStreak}
                disabled={claimedStreakToday}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition-all ${
                  claimedStreakToday 
                    ? 'bg-[#178A52]/40 text-[#DCEFE4]/60 cursor-not-allowed border border-[#178A52]/40' 
                    : 'bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] active:scale-95 border border-[#04231A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{claimedStreakToday ? (isUrdu ? 'آج کا اسٹریک وصول شدہ ✓' : 'Claimed Today ✓') : (isUrdu ? 'روزانہ 10 پوائنٹس کلیم کریں' : 'Claim Daily +10 Pts')}</span>
              </button>
            </div>
          </div>

          {/* Points Counter & Level Radial Card */}
          <div className="bg-[#04231A]/90 border-2 border-[#178A52] rounded-3xl p-5 sm:p-6 text-center shadow-2xl shrink-0 min-w-[260px]">
            <span className="text-xs font-bold text-[#DCEFE4]/80 uppercase tracking-wider block">
              {isUrdu ? 'کل شہری پوائنٹس' : 'Total Civic Points'}
            </span>

            <div className="flex items-baseline justify-center gap-1 my-2">
              <span className="font-sora font-black text-4xl sm:text-5xl text-[#E3A82B] drop-shadow-md">
                {profile.totalPoints}
              </span>
              <span className="text-sm font-extrabold text-[#DCEFE4]">PTS</span>
            </div>

            {/* Progress Bar to next level */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-[#DCEFE4]/80">
                <span>{isUrdu ? `لیول ${currentLevelInfo.level}` : `Level ${currentLevelInfo.level}`}</span>
                <span>{Math.round(currentLevelInfo.progressPct)}% ({isUrdu ? 'اگلا لیول' : 'Next Level'})</span>
              </div>
              <div className="w-full bg-[#0B4A31] h-2.5 rounded-full overflow-hidden border border-[#178A52]">
                <div 
                  className="bg-gradient-to-r from-[#178A52] to-[#E3A82B] h-full rounded-full transition-all duration-700"
                  style={{ width: `${currentLevelInfo.progressPct}%` }}
                />
              </div>
              <span className="text-[10px] text-[#DCEFE4]/60 block font-urdu">
                {isUrdu 
                  ? `اگلے رینک کے لیے مزید ${Math.max(0, currentLevelInfo.nextTarget - profile.totalPoints)} پوائنٹس درکار ہیں` 
                  : `${Math.max(0, currentLevelInfo.nextTarget - profile.totalPoints)} points to next milestone`}
              </span>
            </div>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="mt-4 w-full bg-[#178A52] hover:bg-[#178A52]/80 text-white text-xs font-bold py-2 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all border border-[#E3A82B]/60"
            >
              <Award className="w-4 h-4 text-[#E3A82B]" />
              <span>{isUrdu ? 'اعزازی ڈی سی سرٹیفکیٹ دیکھیں' : 'View DC Commendation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Earning Civic Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div className="bg-[#FCFAF3] p-5 rounded-3xl border border-[#178A52]/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#C4572D] text-white flex items-center justify-center shadow font-bold">
                📢
              </div>
              <span className="bg-[#C4572D]/10 text-[#C4572D] font-extrabold text-xs px-2.5 py-1 rounded-full">
                +50 PTS
              </span>
            </div>
            <h4 className="font-bold text-base text-[#04231A] font-urdu">
              {isUrdu ? 'تصدیق شدہ گراں فروشی رپورٹ' : 'Verified Price Report'}
            </h4>
            <p className="text-xs text-[#5C6F63] font-urdu mt-1 leading-relaxed">
              {isUrdu 
                ? 'ڈی سی لسٹ سے زائد قیمت وصولی کی درست رپورٹ درج کرنے پر خودکار 50 پوائنٹس ملتے ہیں۔' 
                : 'Submit valid overpricing reports verified by AI against the daily DC ceiling.'}
            </p>
          </div>
          <button
            onClick={onNavigateToReport}
            className="mt-4 w-full bg-[#04231A] hover:bg-[#0B4A31] text-white text-xs font-bold py-2 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{isUrdu ? 'شکایت درج کریں (+50)' : 'Report Overcharging'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E3A82B]" />
          </button>
        </div>

        {/* Pillar 2 */}
        <div className="bg-[#FCFAF3] p-5 rounded-3xl border border-[#178A52]/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#178A52] text-white flex items-center justify-center shadow font-bold">
                🔍
              </div>
              <span className="bg-[#178A52]/10 text-[#178A52] font-extrabold text-xs px-2.5 py-1 rounded-full">
                +25 PTS
              </span>
            </div>
            <h4 className="font-bold text-base text-[#04231A] font-urdu">
              {isUrdu ? 'مارکیٹ ریٹ اسپاٹ آڈٹ' : 'Spot Price Audit'}
            </h4>
            <p className="text-xs text-[#5C6F63] font-urdu mt-1 leading-relaxed">
              {isUrdu 
                ? 'کسی بھی لازمی شے کے سرکاری ریٹس چیک کریں اور ریٹ لسٹ کی توثیق کریں۔' 
                : 'Audit current market items against official wholesale and retail price lists.'}
            </p>
          </div>
          <button
            onClick={() => {
              awardPoints(25, 'Market Price Audit Checked', 'مارکیٹ ریٹ لسٹ اسپاٹ آڈٹ مکمل کیا', 'rate_check');
              onNavigateToRates();
            }}
            className="mt-4 w-full bg-[#178A52] hover:bg-[#178A52]/90 text-white text-xs font-bold py-2 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{isUrdu ? 'ریٹس چیک کریں (+25)' : 'Audit DC Rates'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E3A82B]" />
          </button>
        </div>

        {/* Pillar 3 */}
        <div className="bg-[#FCFAF3] p-5 rounded-3xl border border-[#178A52]/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#3D7EA6] text-white flex items-center justify-center shadow font-bold">
                ⭐
              </div>
              <span className="bg-[#3D7EA6]/10 text-[#3D7EA6] font-extrabold text-xs px-2.5 py-1 rounded-full">
                +15 PTS
              </span>
            </div>
            <h4 className="font-bold text-base text-[#04231A] font-urdu">
              {isUrdu ? 'گرین دکاندار کی تائید' : 'Rate & Praise Green Vendor'}
            </h4>
            <p className="text-xs text-[#5C6F63] font-urdu mt-1 leading-relaxed">
              {isUrdu 
                ? 'ایماندار اور درست تولنے والے ریڑھی بان کو ریویو دے کر حوصلہ افزائی کریں۔' 
                : 'Review and support compliant, hygienic vendors in your local market zone.'}
            </p>
          </div>
          <button
            onClick={() => {
              awardPoints(15, 'Reviewed Compliant Green Stall', 'ایماندار گرین دکاندار کو مثبت ریٹنگ دی', 'vendor_review');
              onNavigateToVendors();
            }}
            className="mt-4 w-full bg-[#0B4A31] hover:bg-[#178A52] text-white text-xs font-bold py-2 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{isUrdu ? 'دکاندار منتخب کریں (+15)' : 'Praise Vendor'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E3A82B]" />
          </button>
        </div>

        {/* Pillar 4 */}
        <div className="bg-[#FCFAF3] p-5 rounded-3xl border border-[#178A52]/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#E3A82B] text-[#04231A] flex items-center justify-center shadow font-bold">
                🧠
              </div>
              <span className="bg-[#E3A82B]/20 text-[#04231A] font-extrabold text-xs px-2.5 py-1 rounded-full">
                +30 PTS
              </span>
            </div>
            <h4 className="font-bold text-base text-[#04231A] font-urdu">
              {isUrdu ? 'شہری قوانین و شعور کوئز' : 'Civic Rights Law Quiz'}
            </h4>
            <p className="text-xs text-[#5C6F63] font-urdu mt-1 leading-relaxed">
              {isUrdu 
                ? 'پرائس کنٹرول ایکٹ اور صارفین کے قانونی حقوق کے آسان سوالات کے درست جواب دیں۔' 
                : 'Test your knowledge on consumer protection laws and municipal price regulations.'}
            </p>
          </div>
          <button
            onClick={() => {
              setActiveQuizIndex(0);
              setSelectedQuizOption(null);
              setQuizFeedback(null);
            }}
            className="mt-4 w-full bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] text-xs font-extrabold py-2 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all border border-[#04231A]"
          >
            <span>{isUrdu ? 'کوئز شروع کریں (+30)' : 'Start Law Quiz'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Civic Law Awareness Quiz Card if active */}
      {activeQuizIndex !== null && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E3A82B] shadow-xl text-[#132A21] animate-fadeUp">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F6F2E7]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#E3A82B] text-[#04231A] flex items-center justify-center font-bold">
                📝
              </div>
              <div>
                <h4 className="font-bold text-base text-[#04231A]">
                  {isUrdu ? `سوال نمبر ${activeQuizIndex + 1}: شہری حقوق و پرائس کنٹرول ایکٹ` : `Question ${activeQuizIndex + 1}: Civic Rights & Price Control Act`}
                </h4>
                <p className="text-xs text-[#5C6F63] font-urdu">
                  درست جواب پر +30 شہری پوائنٹس دیے جائیں گے
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveQuizIndex(null)}
              className="text-xs font-bold text-[#5C6F63] hover:text-[#04231A] px-2 py-1"
            >
              ✕ {isUrdu ? 'بند کریں' : 'Close'}
            </button>
          </div>

          <div className="space-y-4">
            <h5 className="font-bold text-base text-[#04231A] font-urdu leading-relaxed">
              {isUrdu ? QUIZ_QUESTIONS[activeQuizIndex].qUrdu : QUIZ_QUESTIONS[activeQuizIndex].qEn}
            </h5>

            <div className="space-y-2">
              {(isUrdu ? QUIZ_QUESTIONS[activeQuizIndex].optionsUrdu : QUIZ_QUESTIONS[activeQuizIndex].optionsEn).map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedQuizOption(idx)}
                  className={`w-full p-3.5 rounded-2xl text-left sm:text-right font-urdu text-xs sm:text-sm font-semibold transition-all border flex items-center justify-between ${
                    selectedQuizOption === idx 
                      ? 'bg-[#178A52] text-white border-[#E3A82B] shadow-md' 
                      : 'bg-[#FCFAF3] text-[#04231A] border-[#178A52]/20 hover:bg-[#DCEFE4]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedQuizOption === idx ? 'bg-white text-[#178A52]' : 'bg-[#E3A82B]/20 text-[#04231A]'
                    }`}>
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {selectedQuizOption === idx && <CheckCircle2 className="w-5 h-5 text-[#E3A82B]" />}
                </button>
              ))}
            </div>

            {quizFeedback && (
              <div className={`p-4 rounded-2xl text-xs sm:text-sm font-urdu leading-relaxed ${
                quizFeedback.isCorrect ? 'bg-[#DCEFE4] text-[#0B4A31] border border-[#178A52]' : 'bg-[#FADBD8] text-[#78281F] border border-[#C4572D]'
              }`}>
                <p className="font-bold">{quizFeedback.isCorrect ? (isUrdu ? '🎉 زبردست! بالکل درست جواب۔' : '🎉 Excellent! Correct Answer.') : (isUrdu ? '⚠️ نامکمل جواب:' : '⚠️ Incorrect:')}</p>
                <p className="mt-1">{quizFeedback.text}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={selectedQuizOption === null}
                onClick={() => handleQuizSubmit(activeQuizIndex)}
                className="bg-[#178A52] hover:bg-[#178A52]/90 disabled:opacity-50 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'جواب کی توثیق کریں' : 'Submit & Check Answer'}</span>
              </button>

              {activeQuizIndex < QUIZ_QUESTIONS.length - 1 && (
                <button
                  onClick={() => {
                    setActiveQuizIndex(activeQuizIndex + 1);
                    setSelectedQuizOption(null);
                    setQuizFeedback(null);
                  }}
                  className="bg-[#04231A] hover:bg-[#0B4A31] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5"
                >
                  <span>{isUrdu ? 'اگلا سوال' : 'Next Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity History & Unlocked Privileges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Activity Points Ledger */}
        <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F6F2E7]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#178A52]" />
              <h3 className="font-bold text-base text-[#04231A] font-urdu">
                {isUrdu ? 'پوائنٹس ہسٹری و ایکٹیویٹی لاگ' : 'Points Activity Ledger'}
              </h3>
            </div>
            <span className="text-xs bg-[#178A52]/10 text-[#178A52] font-extrabold px-2.5 py-0.5 rounded-full">
              {profile.activities.length} {isUrdu ? 'سرگرمیاں' : 'Entries'}
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {profile.activities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-white border border-[#178A52]/20 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    act.type === 'report_verified' ? 'bg-[#C4572D] text-white' :
                    act.type === 'rate_check' ? 'bg-[#178A52] text-white' :
                    act.type === 'quiz_completed' ? 'bg-[#E3A82B] text-[#04231A]' :
                    'bg-[#3D7EA6] text-white'
                  }`}>
                    {act.type === 'report_verified' ? '📢' :
                     act.type === 'rate_check' ? '🔍' :
                     act.type === 'quiz_completed' ? '🧠' : '⭐'}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-[#04231A] font-urdu">
                      {isUrdu ? act.titleUrdu : act.title}
                    </h5>
                    <span className="text-[10px] text-[#5C6F63]">{act.timestamp}</span>
                  </div>
                </div>

                <span className="font-sora font-extrabold text-sm text-[#178A52] bg-[#DCEFE4] px-2.5 py-1 rounded-xl shrink-0">
                  +{act.points} PTS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Unlocked Rewards & Privileges */}
        <div className="bg-[#FCFAF3] rounded-3xl p-6 border border-[#178A52]/20 shadow-md text-[#132A21]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F6F2E7]">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#E3A82B]" />
              <h3 className="font-bold text-base text-[#04231A] font-urdu">
                {isUrdu ? 'کھلے ہوئے انعامات اور مراعات' : 'Unlocked Rewards & Privileges'}
              </h3>
            </div>
            <span className="text-xs bg-[#E3A82B]/20 text-[#04231A] font-extrabold px-2.5 py-0.5 rounded-full">
              Level {profile.level} Unlocked
            </span>
          </div>

          <div className="space-y-3">
            {/* Reward 1 */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#178A52]/20 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#04231A] text-[#E3A82B] flex items-center justify-center font-bold">
                  📜
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#04231A] font-urdu">
                    {isUrdu ? 'ڈپٹی کمشنر ڈیجیٹل سرٹیفکیٹ برائے دیانت' : 'DC Commendation Certificate'}
                  </h5>
                  <p className="text-[10px] text-[#5C6F63] font-urdu">
                    سرکاری تصدیقی نمبر کے ساتھ ڈاؤن لوڈ کے لیے دستیاب
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(true)}
                className="bg-[#178A52] hover:bg-[#178A52]/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow"
              >
                {isUrdu ? 'دیکھیں' : 'View'}
              </button>
            </div>

            {/* Reward 2 */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#178A52]/20 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#178A52] text-white flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#04231A] font-urdu">
                    {isUrdu ? 'ترجیحی فاسٹ ٹریک شکایت کیو' : 'Priority Whistleblower Queue'}
                  </h5>
                  <p className="text-[10px] text-[#5C6F63] font-urdu">
                    آپ کی شکایات کو مجسٹریٹ اسکواڈ ترجیحی بنیادوں پر 5 منٹ میں وصول کرتا ہے
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-[#178A52] text-white font-extrabold px-2 py-0.5 rounded-full">
                Active ✓
              </span>
            </div>

            {/* Reward 3 */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#178A52]/20 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E3A82B] text-[#04231A] flex items-center justify-center font-bold">
                  🏷️
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#04231A] font-urdu">
                    {isUrdu ? '5% ڈسکاؤنٹ واؤچر گرین دکانوں پر' : '5% Green Stall Discount Voucher'}
                  </h5>
                  <p className="text-[10px] text-[#5C6F63] font-urdu">
                    تصدیق شدہ گرین دکانداروں پر کیو آر اسکیننگ کے ساتھ فعال
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-[#E3A82B] text-[#04231A] font-extrabold px-2 py-0.5 rounded-full">
                Unlocked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FCFAF3] rounded-3xl border-4 border-[#E3A82B] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-scaleUp text-[#04231A]">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 text-xs font-bold bg-[#04231A] text-white px-3 py-1 rounded-full hover:bg-[#C4572D]"
            >
              ✕ {isUrdu ? 'بند کریں' : 'Close'}
            </button>

            <div className="border-2 border-[#178A52] p-6 rounded-2xl bg-white relative text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🇵🇰</span>
                <div>
                  <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                    GOVERNMENT OF PAKISTAN
                  </h3>
                  <p className="text-xs text-[#178A52] font-bold">
                    Office of the Deputy Commissioner & District Price Control Authority
                  </p>
                </div>
                <span className="text-3xl">⭐</span>
              </div>

              <div className="py-2">
                <span className="bg-[#E3A82B] text-[#04231A] text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                  Digital Civic Commendation
                </span>
              </div>

              <p className="text-xs text-[#5C6F63] font-urdu">
                یہ اعزازی سند دیانت داری اور بیداری کی توثیق کے لیے جاری کی جاتی ہے:
              </p>

              <h4 className="font-sora font-black text-2xl text-[#178A52] underline underline-offset-4">
                {userName}
              </h4>

              <p className="text-xs sm:text-sm text-[#04231A] font-urdu leading-relaxed max-w-lg mx-auto">
                کنیکٹڈ پاکستان پلیٹ فارم کے ذریعے سرکاری ڈی سی نرخوں کے نفاذ، گراں فروشی کی بروقت نشاندہی اور معاشرے میں معاشی انصاف قائم کرنے میں آپ کی سرگرم کوششوں کا اعتراف کیا جاتا ہے۔
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F6F2E7] text-left">
                <div>
                  <span className="text-[10px] text-[#5C6F63] block">Certificate Serial No:</span>
                  <span className="text-xs font-mono font-bold text-[#04231A]">CP-PK-2026-CERT-8842</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#5C6F63] block">Verification Status:</span>
                  <span className="text-xs font-bold text-[#178A52]">VERIFIED BY DC OFFICE ✓</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  speechService.speak(
                    isUrdu 
                      ? `محترم ${userName}! آپ کو ڈپٹی کمشنر پاکستان کی جانب سے بیدار شہری کا اعزازی ڈیجیٹل سرٹیفکیٹ مبارک ہو۔` 
                      : `Dear ${userName}! Congratulations on receiving the Official Deputy Commissioner Civic Commendation Certificate.`,
                    { lang: isUrdu ? 'ur' : 'en' }
                  );
                }}
                className="bg-[#04231A] hover:bg-[#0B4A31] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Volume2 className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'صوتی تبریک سنیں' : 'Listen Congratulations'}</span>
              </button>

              <button
                onClick={() => {
                  alert(isUrdu ? 'سرٹیفکیٹ پی ڈی ایف آپ کے آلے میں محفوظ ہو گیا ہے۔' : 'Certificate PDF saved to your device.');
                }}
                className="bg-[#178A52] hover:bg-[#178A52]/90 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'سرٹیفکیٹ ڈاؤن لوڈ کریں' : 'Download Certificate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
