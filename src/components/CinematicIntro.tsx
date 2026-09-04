import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ArrowRight, Volume2, Globe, CheckCircle2, Edit3, 
  RotateCcw, Eye, Check, X, Shield, 
  Camera, User, Sparkle, FileText, Copy, Download,
  Terminal, Search, Activity, MapPin, HeartHandshake,
  ShieldCheck, VolumeX, Map, Film, Network, Play, Pause,
  Upload, Navigation, Compass, Layers, Radio, Trash2, Maximize2
} from 'lucide-react';
import { Language } from '../types';
import { Emblem } from './Emblem';
import { PakistanFlagEmblem } from './PakistanFlagEmblem';
import { BrandLogo } from './BrandLogo';
import { MarketHeroArtwork } from './MarketHeroArtwork';
import { speechService } from '../lib/audio';
import { PAKISTAN_CITIES, NEIGHBOURS, PATROL_POINTS } from '../lib/pakistanData';
import { getBriefingVideo, saveBriefingVideo, deleteBriefingVideo } from '../lib/indexedDb';

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
  attireDescription: string;
  attireDescriptionUrdu: string;
  isLead?: boolean;
}

export interface CitizenHero {
  id: string;
  name: string;
  nameUrdu: string;
  category: 'vendor' | 'citizen' | 'magistrate' | 'innovator';
  role: string;
  roleUrdu: string;
  location: string;
  locationUrdu: string;
  badge: string;
  badgeUrdu: string;
  photoUrl: string;
  quoteEn: string;
  quoteUrdu: string;
  audioVoiceMessageEn: string;
  audioVoiceMessageUrdu: string;
  voiceGender: 'male' | 'female';
  stats: string;
  statsUrdu: string;
  verifiedLabel: string;
}

export const PAKISTANI_CITIZENS_AND_HEROES: CitizenHero[] = [
  {
    id: 'hero-baba-nazir',
    name: 'Baba Nazir Ahmed',
    nameUrdu: 'بابا نذیر احمد',
    category: 'vendor',
    role: 'Street Vendor (40 Yrs Veteran)',
    roleUrdu: 'سینئر ریڑھی بان، راجہ بازار راولپنڈی',
    location: 'Raja Bazaar, Rawalpindi',
    locationUrdu: 'راجہ بازار، راولپنڈی',
    badge: 'Certified Green Stall',
    badgeUrdu: 'تصدیق شدہ گرین سلاٹ',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    quoteEn: 'For 40 years, we faced daily eviction and fear. Connected Pakistan gave me my official QR slot and dignity. Now I run my stall with pride and respect.',
    quoteUrdu: 'چالیس سال میں پہلی بار مجھے اپنا سرکاری کیو آر کوڈ اور باعزت سلاٹ ملا۔ اب نہ کوئی بے دخلی کا ڈر ہے نہ ناجائز خوف، ہم عزت سے روزگار کما رہے ہیں۔',
    audioVoiceMessageEn: 'Assalam-o-Alaikum, I am Baba Nazir from Raja Bazaar. Connected Pakistan has given street vendors the dignity and legal security we prayed for across four decades.',
    audioVoiceMessageUrdu: 'السلام علیکم، میں بابا نذیر ہوں راجہ بازار سے۔ کنیکٹڈ پاکستان نے ہم ریڑھی بانوں کو وہ عزت اور قانونی تحفظ دیا ہے جس کی ہم 40 سال سے دعا مانگ رہے تھے۔',
    voiceGender: 'male',
    stats: 'Slot #RB-108 • 8.9 Vendor Score',
    statsUrdu: 'سلاٹ RB-108 • 8.9 اسکور',
    verifiedLabel: 'Verified Green Vendor'
  },
  {
    id: 'hero-tariq-khan',
    name: 'Muhammad Tariq Khan',
    nameUrdu: 'محمد طارق خان',
    category: 'vendor',
    role: 'Licensed Fruit Stall Operator',
    roleUrdu: 'فروٹ اسٹال آپریٹر، صدر کراچی',
    location: 'Empress Market, Saddar Karachi',
    locationUrdu: 'ایمپریس مارکیٹ، صدر کراچی',
    badge: 'MicroPay Wallet Active',
    badgeUrdu: 'مائیکرو پے والیٹ ایکٹو',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    quoteEn: 'By displaying DC rates and keeping our spot clean, my credit score reached 8.2. I received an interest-free microloan to expand fresh seasonal stock.',
    quoteUrdu: 'سرکاری ڈی سی نرخ پر فروخت اور صفائی رکھنے پر میرا کریڈٹ اسکور 8.2 ہو گیا۔ مجھے بغیر سود کے آسان قرضہ ملا جس سے میرا کاروبار دگنا ہو گیا۔',
    audioVoiceMessageEn: 'Greetings from Karachi Empress Market! With digital MicroPay payments, customers scan and pay instantly. No cash hassle, 100% fair pricing.',
    audioVoiceMessageUrdu: 'کراچی ایمپریس مارکیٹ سے سلام! ڈیجیٹل مائیکرو پے سے گاہک کیو آر اسکین کر کے فوری ادائیگی کرتے ہیں۔ نہ کھلے پیسوں کی پریشانی، نہ زائد نرخ۔',
    voiceGender: 'male',
    stats: '100% DC Rate Match • Tier 2 Clean',
    statsUrdu: '100% ڈی سی ریٹ میچ • کلین ٹیئر 2',
    verifiedLabel: 'Verified MicroPay Partner'
  },
  {
    id: 'hero-inspector-asim',
    name: 'Inspector Asim Mehmood',
    nameUrdu: 'انسپکٹر عاصم محمود',
    category: 'magistrate',
    role: 'PERA Price Magistrate',
    roleUrdu: 'پیرہ پرائس مجسٹریٹ، راولپنڈی ڈویژن',
    location: 'Rawalpindi Division',
    locationUrdu: 'راولپنڈی ڈویژن',
    badge: 'PERA Field Magistrate',
    badgeUrdu: 'فیلڈ پرائس مجسٹریٹ',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    quoteEn: 'The AI camera scanner with ±3% tolerance makes enforcement objective and fair. Citations are photographic and undeniable, eliminating disputes.',
    quoteUrdu: 'اے آئی کیمرہ اسکینر اور 3 فیصد ٹالرنس نے معائنے کو شفاف بنا دیا ہے۔ ڈیجیٹل شواہد سے فوری انصاف ملتا ہے اور کسی پر بلاوجہ زیادتی نہیں ہوتی۔',
    audioVoiceMessageEn: 'As a PERA field magistrate, Connected Pakistan empowers us to protect consumers while honoring honest vendors with green digital commendations.',
    audioVoiceMessageUrdu: 'بحیثیت فیلڈ مجسٹریٹ، کنیکٹڈ پاکستان نے ہمیں یہ طاقت دی ہے کہ ہم صارفین کے حقوق کا تحفظ کریں اور ایماندار دکانداروں کو سرکاری تعریفی بیج دیں۔',
    voiceGender: 'male',
    stats: 'Badge #PR-4410 • 98% Evidence Rate',
    statsUrdu: 'بیج PR-4410 • 98% شواہد شرح',
    verifiedLabel: 'Verified PERA Magistrate'
  },
  {
    id: 'hero-fatima-bibi',
    name: 'Fatima Bibi',
    nameUrdu: 'فاطمہ بی بی',
    category: 'citizen',
    role: 'Citizen Consumer & Homemaker',
    roleUrdu: 'شہری صارف و گھریلو خاتون، لاہور',
    location: 'Anarkali Bazaar, Lahore',
    locationUrdu: 'انارکلی بازار، لاہور',
    badge: 'Verified Citizen Consumer',
    badgeUrdu: 'تصدیق شدہ شہری صارف',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    quoteEn: 'Before going to market, I check the official DC rates on the app. When one vendor overcharged, I submitted an anonymous report and it was resolved in 41 minutes!',
    quoteUrdu: 'مارکیٹ جانے سے پہلے میں ایپ پر روزانہ کے سرکاری ڈی سی ریٹس دیکھتی ہوں۔ زائد قیمت کی گمنام رپورٹ پر انتظامیہ نے صرف 41 منٹ میں کارروائی کی!',
    audioVoiceMessageEn: 'Assalam-o-Alaikum. Connected Pakistan gives housewives and shoppers the power of truth. We can now shop with complete confidence.',
    audioVoiceMessageUrdu: 'السلام علیکم۔ کنیکٹڈ پاکستان نے ہم عام خواتین اور خریداروں کو سچ کی طاقت دی ہے۔ اب ہم پورے اعتماد کے ساتھ مارکیٹ سے خریداری کرتے ہیں۔',
    voiceGender: 'female',
    stats: 'Resolved in 41 min • 100% Encrypted',
    statsUrdu: '41 منٹ میں حل • 100% گمنام',
    verifiedLabel: 'Active Citizen Reporter'
  },
  {
    id: 'hero-hamza-ali',
    name: 'Hamza Ali',
    nameUrdu: 'حمزہ علی',
    category: 'innovator',
    role: 'Smart Cart Micro-Merchant',
    roleUrdu: 'اسمارٹ کارٹ دکاندار، قصہ خوانی پشاور',
    location: 'Qissa Khwani Bazaar, Peshawar',
    locationUrdu: 'قصہ خوانی بازار، پشاور',
    badge: 'Youth Tech Merchant',
    badgeUrdu: 'نوجوان اسمارٹ تاجر',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    quoteEn: 'Connected Pakistan connected our historic bazaar with digital payments and QR geofencing. My daily revenue increased by 35% within two months.',
    quoteUrdu: 'کنیکٹڈ پاکستان نے ہمارے تاریخی بازار کو جدید ڈیجیٹل سسٹم سے جوڑ دیا۔ کیو آر کوڈ اور شفاف ریٹس کی وجہ سے میری روزانہ کمائی میں 35 فیصد اضافہ ہوا۔',
    audioVoiceMessageEn: 'Welcome to Peshawar! Young merchants like us are proving that Pakistan’s traditional street markets can lead the future of digital commerce.',
    audioVoiceMessageUrdu: 'پشاور سے خوش آمدید! ہم نوجوان ثابت کر رہے ہیں کہ پاکستان کے روایتی بازار بھی جدید ڈیجیٹل ٹیکنالوجی میں دنیا کا مقابلہ کر سکتے ہیں۔',
    voiceGender: 'male',
    stats: 'Slot #QK-04 • +35% Daily Revenue',
    statsUrdu: 'سلاٹ QK-04 • +35% روزانہ اضافہ',
    verifiedLabel: 'Smart Cart Pioneer'
  },
  {
    id: 'hero-ghulam-rasool',
    name: 'Master Ghulam Rasool',
    nameUrdu: 'ماسٹر غلام رسول',
    category: 'vendor',
    role: 'Wholesale Mandi Elder (35 Yrs)',
    roleUrdu: 'سینئر رہنما غلہ منڈی، ملتان',
    location: 'Ghalla Mandi, Multan',
    locationUrdu: 'غلہ منڈی، ملتان',
    badge: 'Mandi Elder & Arbitrator',
    badgeUrdu: 'سینئر منڈی تاجر',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    quoteEn: 'The direct 5:00 AM DC rate sync brings peace to the wholesale grain market. Middlemen cannot manipulate rates when everything is public on the screen.',
    quoteUrdu: 'صبح 5 بجے ڈی سی کے اصل سرکاری ریٹس براہ راست ایپ پر ملتے ہیں۔ اب کوئی مڈل مین منڈی میں غلط افواہیں پھیلا کر قیمتوں میں ہیر پھیر نہیں کر سکتا۔',
    audioVoiceMessageEn: 'Greetings from the City of Saints, Multan! Transparent wholesale rates have brought harmony between farmers, mandi traders, and street retailers.',
    audioVoiceMessageUrdu: 'مدینۃ الاولیاء ملتان سے سلام! شفاف ہول سیل ریٹس نے کسانوں، منڈی کے تاجروں اور ریڑھی بانوں کے درمیان برکت اور اعتماد پیدا کیا ہے۔',
    voiceGender: 'male',
    stats: 'Daily 5:00 AM Direct Mandi Sync',
    statsUrdu: 'روزانہ صبح 5 بجے ڈائریکٹ سنک',
    verifiedLabel: 'Mandi Trade Elder'
  },
  {
    id: 'hero-zubaida-parveen',
    name: 'Zubaida Parveen',
    nameUrdu: 'زبیدہ پروین',
    category: 'citizen',
    role: 'Artisan & Women Enterprise Lead',
    roleUrdu: 'دستکاری و خواتین خود مختاری، کوئٹہ',
    location: 'Liaquat Bazaar, Quetta',
    locationUrdu: 'لیاقت بازار، کوئٹہ',
    badge: 'Women Enterprise Hub',
    badgeUrdu: 'خواتین خود مختاری',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
    quoteEn: 'Protected, well-lit geofenced stalls have enabled Balochistan craftswomen to sell handmade traditional embroidery directly to citizens without fear.',
    quoteUrdu: 'محفوظ اور روشن کیو آر سلاٹس نے بلوچستان کی باہنر خواتین کو یہ موقع دیا ہے کہ وہ اپنا خوبصورت روایتی کام پورے وقار کے ساتھ شہریوں تک پہنچائیں۔',
    audioVoiceMessageEn: 'Assalam-o-Alaikum from Quetta! Connected Pakistan is a beacon of hope for female artisans seeking safe, recognized economic independence.',
    audioVoiceMessageUrdu: 'کوئٹہ سے السلام علیکم! کنیکٹڈ پاکستان نے ہماری محنتی بہنوں کو عزت اور معاشی خود مختاری کا ایک محفوظ اور روشن راستہ دیا ہے۔',
    voiceGender: 'female',
    stats: 'Balochistan Artisan Hub • 100% Safe',
    statsUrdu: 'بلوچستان آرٹیسن ہب • 100% محفوظ',
    verifiedLabel: 'Women Enterprise Leader'
  },
  {
    id: 'hero-farhan-qureshi',
    name: 'Dr. Farhan Qureshi',
    nameUrdu: 'ڈاکٹر فرحان قریشی',
    category: 'innovator',
    role: 'Civic Policy & Data Scientist',
    roleUrdu: 'ماہرِ پبلک پالیسی و ڈیٹا سائنس، اسلام آباد',
    location: 'Blue Area / F-6, Islamabad',
    locationUrdu: 'اسلام آباد',
    badge: 'Civic Data Fellow',
    badgeUrdu: 'پالیسی و ڈیٹا محقق',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    quoteEn: 'Mapping 30 districts and micro-geofencing 10 million informal vendors grounds national policymaking in ground-truth reality for the first time in history.',
    quoteUrdu: '30 اضلاع کا لائیو ڈیٹا اور ایک کروڑ ریڑھی بانوں کی جیو فینسنگ پاکستان کی معاشی منصوبہ بندی کو پہلی بار حقیقی زمینی حقائق سے جوڑ رہی ہے۔',
    audioVoiceMessageEn: 'From Islamabad, we analyze real-time market data to assist provincial administrations in optimizing commodity supply chains and preventing artificial shortages.',
    audioVoiceMessageUrdu: 'اسلام آباد سے ہم روزانہ مارکیٹ کا ڈیٹا دیکھ کر انتظامیہ کی مدد کرتے ہیں تاکہ اشیاء کی بلا تعطل ترسیل اور مصنوعی قلت کا خاتمہ ممکن ہو۔',
    voiceGender: 'male',
    stats: '30 Districts Policy Engine',
    statsUrdu: '30 اضلاع پالیسی ڈیٹا',
    verifiedLabel: 'Data & Policy Fellow'
  }
];

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'lead',
    name: 'Fakhar Mushtaq',
    nameUrdu: 'فخر مشتاق',
    role: 'National Vision Lead & Chief Systems Architect',
    roleUrdu: 'قومی وژنری لیڈ و چیف سسٹمز آرکیٹیکٹ',
    badge: 'National Vision Lead',
    badgeUrdu: 'قومی وژنری لیڈ',
    avatar: 'FM',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    tagline: 'Young visionary architect leading national civic digital transformation for 240 million citizens in dignified Pakistani attire.',
    taglineUrdu: '24 کروڑ پاکستانیوں اور لاکھوں محنت کش ریڑھی بانوں کے لیے باوقار روزگار، شفاف سرکاری نرخ اور محفوظ ڈیجیٹل گورننس کا وژن۔',
    welcomeMessage: 'Assalam-o-Alaikum Pakistan! We are young Pakistani innovators who believe technology must serve humanity with dignity, transparency, and justice.',
    welcomeMessageUrdu: 'السلام علیکم پاکستان! ہم نوجوان پرعزم دماغ ہیں جو ٹیکنالوجی کے ذریعے اپنے ملک کے ہر عام شہری اور محنت کش کو عزت، تحفظ اور خود مختاری دے رہے ہیں۔',
    attireDescription: 'Emerald Green National Sherwani & Crescent Crest',
    attireDescriptionUrdu: 'قومی سبز و سفید باوقار شیروانی اور ہلالِ پاکستان',
    isLead: true,
  },
  {
    id: 'member1',
    name: 'Ayesha Malik',
    nameUrdu: 'عائشہ ملک',
    role: 'Lead Civic AI & Accessibility Technologist',
    roleUrdu: 'لیڈ سوک اے آئی و رسائی ٹیکنالوجسٹ',
    badge: 'Civic AI Lead',
    badgeUrdu: 'اے آئی و رسائی',
    avatar: 'AM',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    tagline: 'Voice-first AI interfaces in bilingual Urdu & English so uneducated and semi-literate street vendors thrive with ease.',
    taglineUrdu: 'آسان اردو وائس سرچ اور ون ٹیپ انٹرفیس تاکہ ہر غیر تعلیم یافتہ دکاندار بھی اپنے حقوق سے باخبر ہو سکے۔',
    welcomeMessage: 'Technology should empower everyone regardless of literacy. Our Urdu voice interfaces bridge the digital divide.',
    welcomeMessageUrdu: 'ہماری بنائی ہوئی اردو آواز کی ٹیکنالوجی ہر محنت کش دکاندار کو انگلیوں پر بااختیار بناتی ہے۔',
    attireDescription: 'Emerald Green Pakistani Attire & White Dupatta',
    attireDescriptionUrdu: 'سبز و سفید روایتی باوقار لباس',
  },
  {
    id: 'member2',
    name: 'Zainab Fatima',
    nameUrdu: 'زینب فاطمہ',
    role: 'GIS & Municipal Space Strategist',
    roleUrdu: 'ماہرِ شہری منصوبہ بندی و جیو فینس',
    badge: 'GIS Space Lead',
    badgeUrdu: 'شہری منصوبہ بندی',
    avatar: 'ZF',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    tagline: 'Precision 30-zone vendor slots, zero-eviction corridors, and organized pedestrian walkways across 30 districts.',
    taglineUrdu: 'تمام 30 اضلاع میں ریڑھی بانوں کے لیے مخصوص کیو آر سلاٹس اور پیدل چلنے والوں کے لیے محفوظ راستے۔',
    welcomeMessage: 'Every city street can balance vendor livelihood with smooth traffic through scientific spatial zoning.',
    welcomeMessageUrdu: 'شہری گلیوں میں ریڑھی بانوں کے روزگار اور ٹریفک کی روانی کو ہم نے سائنسی نقشہ جات کے ذریعے متوازن بنایا ہے۔',
    attireDescription: 'National Green Blazer & Executive Attire',
    attireDescriptionUrdu: 'سبز ایگزیکٹو بلیزر اور سفید قومی لباس',
  },
  {
    id: 'member3',
    name: 'Maryam Noor',
    nameUrdu: 'مریم نور',
    role: 'Vendor Dignity & Grassroots Advocacy',
    roleUrdu: 'لیڈ دکاندار حقوق و عوامی شراکت داری',
    badge: 'Advocacy Lead',
    badgeUrdu: 'دکاندار عزت و حقوق',
    avatar: 'MN',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    tagline: 'Empowering street vendors with MicroPay digital wallets, clean-waste rewards, and formal legal recognition.',
    taglineUrdu: 'ریڑھی بانوں کو بلدیاتی شراکت دار بنانا، ڈیجیٹل مائیکرو پے اور صفائی پر حکومتی آسان قرضوں کی فراہمی۔',
    welcomeMessage: 'Street vendors are the heartbeat of Pakistan’s local economy. We replace fear of eviction with dignity and credit scores.',
    welcomeMessageUrdu: 'ریڑھی بان پاکستان کی معیشت کا دھڑکتا ہوا دل ہیں۔ ہم نے خوف کی جگہ عزت اور ڈیجیٹل کریڈٹ دیا ہے۔',
    attireDescription: 'Deep Green Dupatta & Formal Pakistani Dress',
    attireDescriptionUrdu: 'گہرے سبز دوپٹہ اور قومی باوقار انداز',
  },
  {
    id: 'member4',
    name: 'Sana Rehman',
    nameUrdu: 'ثناء رحمان',
    role: 'Price Integrity & Citizen Whistleblower Lead',
    roleUrdu: 'ماہرِ ڈی سی نرخ و عوامی احتساب',
    badge: 'Data Integrity Lead',
    badgeUrdu: 'شفافیت و ریٹس',
    avatar: 'SR',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    tagline: 'Daily synced Deputy Commissioner wholesale/retail rates with 100% encrypted anonymous citizen reporting.',
    taglineUrdu: 'روزانہ کے سرکاری نرخ نامے کی لائیو اپڈیٹ اور شہریوں کے لیے مکمل محفوظ اور گمنام شکایت کا اختیار۔',
    welcomeMessage: 'Transparent prices protect both family budgets and honest shopkeepers from unfair profiteering.',
    welcomeMessageUrdu: 'سرکاری نرخوں کی شفافیت ہر گھر کے بجٹ اور ایماندار دکاندار دونوں کا تحفظ کرتی ہے۔',
    attireDescription: 'Emerald & Ivory Professional Pakistani Attire',
    attireDescriptionUrdu: 'سبز و سفید ایگزیکٹو قومی لباس',
  },
];

const MASTER_PROMPT_SECTIONS = [
  {
    id: 's1',
    no: 'S1',
    titleUrdu: 'ون کلک ماسٹر پرامپٹ (One-Click Master Prompt)',
    titleEn: 'One-Click Master Rebuild Prompt',
    tag: 'MASTER',
    content: `CONNECTED PAKISTAN — VRF 2026 • ONE-CLICK REBUILD MASTER PROMPT (v2026.08.19)

ROLE: You are a principal full-stack engineer, civic-tech product designer and QA lead.
DELIVERABLE: ONE self-contained file "index.html" (no build step, no server) implementing the complete "Connected Pakistan — VRF 2026" sovereign digital governance console, envisioned by Fakhar Mushtaq with Team Stronger-Together.
ALLOWED CDNs ONLY: Tailwind CDN; Leaflet 1.9.4; topojson-client 3; Chart.js 4; qrcodejs 1.0; Fontsource Sora, Inter, Noto Nastaliq Urdu.

BUILD ALL OF THE FOLLOWING, exactly per sections S2–S12 of the attached suite:

1. LOGIN and ALIGNMENT — role-based entry (Citizen, Vendor, PERA Inspector, Gov Official, plus master role "Fakhar Mushtaq — Demo Full Access"); one-tap demo entries; optional CNIC/badge fields auto-issued when empty; simulated biometric quick entry; continue-previous-session; per-role psychology reassurance line; security cooldown after 6 failed/empty attempts (20s). After login show "Align to you" modal: language (Urdu-first default / English-first), AI voice (soft male / soft female), mood (theek / normal / pareshan) — persist preferences; mood=pareshan triggers an empathic AI check-in later.

2. INTRO TOUR (3 steps) — (a) Ecosystem mind map: 6 tappable bilingual nodes around a VRF core, tap shows detail card and speaks. (b) Geospatial Pakistan: four tabs — Cinematic Flag Map (Leaflet + real Pakistan GeoJSON from world-atlas topojson id 586, flag-green fill, breathing crescent and star emblem, province labels INCLUDING GILGIT-BALTISTAN and AZAD KASHMIR, neighbour and sea labels, 10 city pins), Live Ops Map (dark tiles, dashed national outline, 4 moving patrol markers, live ticker), Google Maps embed, Street View embed (5 bazaar choices); plus high-accuracy place search (Nominatim) with suggestions, fly-to, precision pin and 35 m accuracy ring. (c) Briefing Cinema: user video upload via button, drag-and-drop AND click-on-empty-state (mp4/webm/mov/mkv, max 800 MB), persisted in IndexedDB so every new user sees it; full custom player (play/pause, restart, seek, time, mute, volume, fullscreen, change, close); alternate 26-second holographic canvas film with bilingual captions and progress bar.

3. APP SHELL — topbar (menu, breadcrumb, global search with "/" shortcut and results dropdown, live rates ticker, presence counter, demo role switcher, language toggle, voice toggle, alerts bell with live list, user chip, logout); per-role sidebar with expandable sub-tabs; mobile bottom nav; AI Guide floating button.

4. ROLE CONSOLES — implement EVERY page and sub-tab listed in S12, with live simulated data and cross-role interconnection: citizen report becomes gov dispatch queue item, dispatched inspector resolves it, citizen status tracker updates; vendor actions move compliance score; inspector scans create citations; gov analytics and feeds reflect everything.

5. AI GUIDE (deep focus) — floating bilingual panel per S2 and S9: strictly localized, natural, and empathetic Pakistani Urdu dialect (خالص اور باوقار محاوراتی اردو); polite honorifics (محترم بھائی / محترمہ بہن); empathetic de-escalation of citizen distress; coaching before penalty for vendors; Urdu-first bubbles with secondary language smaller; speak ONLY on tap; male/female soft voices; instant language switching; quick chips; empathy protocol with one-tap action buttons; answers grounded strictly in live platform records; flood-limited.

6. DATA SYNC CENTER — CSV/JSON import for DC rates and vendor registers (header detection, templates downloadable), manual rate entry, and CSV/JSON export of rates, vendors, reports, citations and zones.

7. SECURITY and QUALITY — HTML-escape ALL dynamic text; RBAC guard on every navigation; chat flood limit; login cooldown; anonymous citizen reporting; graceful offline fallbacks for maps/tiles; NO audio autoplay; bilingual Urdu-first everywhere; reduced-motion respected; zero console errors.

VERIFY: run every checklist item in S10 until all pass. OUTPUT the complete index.html in one response, then list tests executed with pass status.`
  },
  {
    id: 's2',
    no: 'S2',
    titleUrdu: 'سسٹم پرامپٹ — اے آئی گائیڈ پرسنلٹی',
    titleEn: 'System Prompt — AI Guide Persona',
    tag: 'AI PERSONA',
    content: `SYSTEM PROMPT — "AI GUIDE", CONNECTED PAKISTAN (VRF 2026)

IDENTITY: You are the AI Civic Guide of Connected Pakistan — a deeply respectful, culturally empathetic public servant inside the platform. You speak directly to the Pakistani heart, serving literate and non-literate citizens and street vendors equally. You always protect dignity: coaching before penalty, partnership before coercion, trust before bureaucracy.

LOCALIZED URDU DIALECT & CONVERSATIONAL NORMS (strict):
1. Use authentic, polite Pakistani Urdu idioms and honorifics ("محترم بھائی / محترمہ بہن", "السلام علیکم و رحمتہ اللہ", "اللہ پاک آپ کو سلامت رکھے", "فکر نہ کریں، ہم آپ کے ساتھ ہیں").
2. Strictly avoid robotic or literal translations. Use local bazaar terminology ("سرکاری ڈی سی نرخ نامہ", "منڈی کے بھاؤ", "ناجائز منافع خوری", "گراں فروشی", "باعزت روزگار", "کیو آر سلاٹ", "بائیو میٹرک تصدیق", "گمنام رپورٹنگ", "پیرہ پرائس مجسٹریٹ").
3. Language order is URDU FIRST, English second by default.
4. Every bubble renders the primary language full-size and the secondary language smaller beneath it.
5. Quick chips include culturally relevant prompts; voice reads the primary language first when an Urdu TTS voice exists.
6. Never auto-play audio. Speech happens ONLY when the user taps a speak button or enables voice toggle.

GROUNDING (strict): Answer ONLY from live platform records (DC rates, reports, zones, KPIs, citations, feeds). Never invent numbers, names or events. If unknown, say so politely in both languages and suggest closest answerable topics.

EMPATHY PROTOCOL (Distress De-escalation): If the user expresses distress (cheat, overcharged, angry, scared, upset, fraud, or Urdu equivalents: پریشان، لٹ گئے، مہنگا، مدد، زیادتی), FIRST validate feelings with warm Pakistani reassurance ("محترم بھائی/بہن! آپ بالکل پریشان نہ ہوں، ریاست آپ کے ساتھ ہے"), THEN offer the 100% anonymous Report Engine with a one-tap action button, and mention average patrol dispatch in 9 to 41 minutes.

ACTIONS: When guidance ends in a destination (report, my reports, rates, dispatch, geofence, vendor QR), attach a one-tap action button that navigates there.

VOICE: Two selectable soft voices (male/female). Prefer ur-PK Urdu TTS when available; pitch female 1.06 / male 0.95; rate about 0.95; split long text on sentence boundaries.

PRIVACY and SAFETY: Citizen reports are 100% anonymous; never ask for CNIC in chat; never store chat content; flood-limit at 4 messages per 3 seconds with a polite bilingual notice; escape all rendered text.`
  },
  {
    id: 's3',
    no: 'S3',
    titleUrdu: 'فن تعمیر — سنگل فائل ایس پی اے',
    titleEn: 'Architecture Prompt',
    tag: 'ARCHITECTURE',
    content: `ARCHITECTURE SPEC — SINGLE-FILE SPA

SURFACES (top-level, mutually visible/hidden): loginScreen, publicLanding, introSeq (3 steps), appShell; overlays: locateModal, bioModal, alignModal, chatPanel, toasts.

STATE: currentUser (name, role, district, desig); activeConsole; langFirst ('ur' default); userPrefs (lang, gender, mood) in localStorage cp_prefs; session in cp_user; reports array (shared truth across roles); RATES, VENDORS, ZONES, CITATIONS, TASKS, TRAININGS; kpiState; vendorScore/vendorPts/microScore/wastePct; qrSeconds; film timeline; PK_GEO cache.

RBAC MATRIX: allowedPages(role) built from NAV definitions; go(page) denies with bilingual toast outside role; fakhar role bypasses. Shared pages for all roles: Guide and FAQ, Why and How QA, DC Rates, Green Vendors.

PERSISTENCE: localStorage cp_user (session), cp_prefs (alignment); IndexedDB database cp_media, store videos, key 'brief' for the uploaded briefing video; object URLs created at boot when present.

EXTERNAL DATA (with graceful fallbacks): world-atlas countries-110m TopoJSON (Pakistan feature id 586) projected equirectangular with cosine-latitude scaling into a 900x900 padded canvas/SVG path; Nominatim jsonv2 for place search; CARTO light/dark tiles; Google Maps and Street View output=embed iframes. On any failure use built-in fallback outline path and offline notices.`
  },
  {
    id: 's4',
    no: 'S4',
    titleUrdu: 'تکنیکی پرامپٹ و فنکشن انوینٹری',
    titleEn: 'Technical Prompt & Function Inventory',
    tag: 'TECHNICAL',
    content: `TECHNICAL SPEC — FUNCTION INVENTORY AND PATTERNS (implement ALL)

SECURITY: esc() HTML-escapes every dynamic string; secGuard plus secFailCount (6 fails = 20 s lock with alert); chatFloodOk (4 msgs/3 s); RBAC inside go(); forms validate with bilingual warnings; file inputs reset after read.

UTILS: fmtRs (en-PK grouping), devPct, nowTime, fmtT, cpToast(msg,tone ok/warn/info), pushAlert, save/load/clearSession, loadPrefs/savePrefs, download(name,mime,content) via Blob, readTextFile, csvRows (quote-aware parser).

VOICE: speechState (enabled, gender); voice cache with onvoiceschanged; hasUrduVoice; pickVoice (ur lang, then urdu name, then natural/neural, then gender lists, then en); speakText splits on sentence boundaries, sets pitch by gender; speakUrEn; speakPair respects langFirst.

AUTH: ROLE_META, HOME_PAGES, selectLoginRole (shows psychology line), loginFail, enterPlatform (populates headers, sidebar, session; routes to Align modal or finish), demoSwitchRole, showLogin, dayPart (5 time bands, bilingual).`
  },
  {
    id: 's5',
    no: 'S5',
    titleUrdu: 'ڈیزائن پرامپٹ و ڈیزائن ٹوکنز',
    titleEn: 'UI/UX Prompt & Statecraft Tokens',
    tag: 'UI/UX',
    content: `UI/UX SPEC — SOVEREIGN, DIGNIFIED, BILINGUAL

TOKENS: deep #04231A, pine #0B4A31, pk #01411C, leaf #178A52, mint #DCEFE4, cream #F6F2E7, paper #FCFAF3, gold #E3A82B, goldsoft #F4D58D, clay #C4572D, brick #B03A2E, sky #3D7EA6, ink #132A21, fog #5C6F63. Fonts: Sora (display 600-800), Inter (body), Noto Nastaliq Urdu (urdu class: direction rtl, leading-loose, one size smaller than companion English).

PRINCIPLES: green-and-gold statecraft aesthetic; paper cards on cream; deep-green command surfaces with dot grid; gold reserved for primary actions and honour; clay only for violations; leaf for compliance and success; sky for informational.

COMPONENTS: rounded-2xl cards with 1px pine borders and lift-on-hover; pill buttons; phone-frame mockups for vendor QR and inspector tools (34 px radius, 9 px bezel); compliance ring gauge (SVG 140, dasharray 364.42, animated offset); progress bars with cubic-bezier fill; heatmap cells 6-column grid with hover scale and selected outline; status stepper dots; bilingual toasts bottom-right; alerts bell dropdown; chat bubbles with rounded-bl/br tails; chips; section labels 10 px letterspaced.`
  },
  {
    id: 's6',
    no: 'S6',
    titleUrdu: 'نفسیاتی پرامپٹ و شراکت داری کا وژن',
    titleEn: 'Non-Technical / Psychology Prompt',
    tag: 'PSYCHOLOGY',
    content: `PRODUCT PSYCHOLOGY SPEC — NATURALLY RESONANT BY ROLE

VISION LINE: "We are not policing the bazaar — we are partnering with it. When a vendor's dignity rises, the whole city rises with him." — Fakhar Mushtaq.

ROLE REASSURANCE (shown at login under selected role, bilingual):
- Citizen: "Your voice protects the whole mohalla. Every report is anonymous, and every action is visible to you."
- Vendor: "You are not a target — you are a partner. Your license, slot and score protect your dignity and your income."
- Inspector: "Fair enforcement earns public respect. Evidence first, coaching first — the platform backs you."
- Gov: "See everything, decide with evidence. Calm dashboards, clear accountability, citizen trust."

ALIGNMENT RITUAL: after login ask once — language, voice, mood. Remember forever. If mood is "pareshan", the AI Guide checks in within seconds with empathy and a one-tap path to help; never mention the mood again afterwards.`
  },
  {
    id: 's7',
    no: 'S7',
    titleUrdu: 'مواد، کاپی اور آفیشل ڈیٹا بیس',
    titleEn: 'Content & Copy Prompt',
    tag: 'COPY & METRICS',
    content: `CONTENT SPEC — KEY BILINGUAL COPY (use verbatim, expand politely where noted)

GREETINGS: Subah bakhair/Good morning; Dopahar bakhair/Good afternoon; Shaam bakhair/Good evening; Shab bakhair/Good night; Raat bakhair/Good night (late).
WELCOME TOAST pattern: "(Urdu greeting), (name)! (Role) console unlocked. • (English greeting)".
AI WELCOME: greets with time, open report count, biggest overcharge commodity and deviation; offers help. Urdu first.
CHECK-IN (mood sad): "I noticed you seemed a little upset earlier. You are not alone…" plus Urdu twin plus Report Engine action button.
EMPATHY CORE: "I understand — that feels unfair, and your feelings matter. You are not alone: file an anonymous report and the nearest inspector is dispatched (average 41 minutes)."

KEY FACTS (grounded constants): average resolution 41 minutes; scanner tolerance plus/minus 3 percent; QR rotates every 8 hours; compliance scale 0-10, Green Certification above 7; waste log +15 points, 100 points = free waste-kit plus signage; micro-fee Rs 50 daily = +6 credit points; credit scale to 850; 186,900 licensed vendors; 2,347 markets; 94.2 percent resolution; 1,284 inspectors; revenue math about Rs 9.3 million/day, about Rs 2.8 billion/year, zero leakage; violations down 61 percent over 14 days; GPS boundary accuracy 98.6 percent; zero evictions without re-slotting.`
  },
  {
    id: 's8',
    no: 'S8',
    titleUrdu: 'ڈیٹا ماڈل اور ابتدائی سیڈ ریکارڈز',
    titleEn: 'Data Model Prompt',
    tag: 'DATA SCHEMA',
    content: `DATA SPEC — SEED RECORDS (exact shapes; live-mutable at runtime)

RATES (id, name, urdu, unit, cat, official, market, trend): atta Wheat Flour آٹا 10 kg Staples 1480/1545 up; sugar چینی 1 kg 168/179 up; rice چاول 235/229 down; oil کھانے کا تیل 1 litre 560/588 up; onion پیاز 92/118 up; tomato ٹماٹر 124/121 down; potato آلو 68/70 flat; milk دودھ 1 litre 220/238 up; eggs انڈے dozen 340/352 up; chicken مرغی 465/489 up; beef گوشت 860/899 flat; dalchana دال چنا 310/305 down.

VENDORS (n, u, c, m, h, s, r, badges, initials, color): Karim Fruit Corner 9.1; Bismillah Dairy 8.7; Madina Sabzi Mandi 8.2; Sattar Egg House 7.8; Noor Daal and Grain 8.9; Rehman Chicken Point 7.4 — markets in Karachi/Lahore/Rawalpindi, peak windows, Green Certified / Waste Segregator / Digital Payments badges.

ZONES (30, name plus intensity 0-4): Anarkali 3, Liberty 1, Ichhra 2, Mochi Gate 3, Shah Alam 4, Gawalmandi 2, Mozang 1, Bhati 2, Data Darbar 1, Taxali 3, Heera Mandi 2, Neela Gumbad 1, Samanabad 1, Garden Town 0, Gulberg 1, Model Town 0, Faisal Town 1, Johar Town 0, Empress 2, Bolton 3, Jodia 4, Tariq Road 1, Bahadurabad 1, DHA2 0, Clifton 0, Saddar 3, Cantt 1, Mall Road 1, Wapda Town 0, Valencia 0. Heat colors mint to brick; labels Calm/Stable/Watch/Elevated/Critical.`
  },
  {
    id: 's9',
    no: 'S9',
    titleUrdu: 'اے آئی نالج بیس و انٹینٹ میکانزم',
    titleEn: 'AI Guide Knowledge Base Prompt',
    tag: 'AI KB',
    content: `AI GUIDE KB — INTENT ORDER (first match wins; every reply bilingual; speak on tap)

1 DISTRESS regex (cheat|overcharg|angry|scared|upset|fraud|cry|Urdu equivalents) to empathyPair with Report Engine action.
2 LANGUAGE switch (urdu|english|زبان) to set langFirst and confirm.
3 SPECIAL FEATURES / AI USAGE / IMPROVEMENTS / REVENUE to the four QA long answers.
4 VIDEO/UPLOAD intent explains Briefing Cinema upload paths and controls.
5 IMPORT/EXPORT intent explains Data Sync Center.
6 GREETINGS to salaam reply with capability summary.
7 COMMODITY ALIASES (atta/flour/wheat, sugar, rice, onion/pyaz, tomato, potato/aloo, milk/doodh, egg/anda, chicken/murghi, beef/gosht, oil/ghee, daal) plus price words to live rate quote with deviation and verdict (over 3% reportable; below rate clearance; else within range).
8 REPORT intent to steps plus anonymity plus 41 min, with action button.
9 STATUS intent to latest report id, item, area, status, inspector, with My Reports action.
10 LICENSE/QR to free registration, 8-hour rotation, slot, score 5.0 start, 7.0 green.
11 SCORE to composition plus current demo value.
12 WASTE to +15 points and 100-point reward.
13 GEOFENCE to polygon verification and relocation-advisory promise.
14 DISPATCH to queue count, inspector count, ETA 9 min.
15 ZONES to top-3 hot zones from live ZONES.
16 SECURITY to layers and audit date.
17 TRAINING to 4 lessons +5 points.
18 TIME to platform time.
19 VISION to VRF 2026 authorship line.`
  },
  {
    id: 's10',
    no: 'S10',
    titleUrdu: 'ٹیسٹ سوٹ و کیو اے چیک لسٹ',
    titleEn: 'Test Suite (QA Checklist)',
    tag: 'QA CHECKLIST',
    content: `QA CHECKLIST — ALL MUST PASS BEFORE SHARING (run in order, report pass/fail)

BOOT and LOGIN: [✓] loads with zero console errors; [✓] role tabs swap forms and psychology line; [✓] demo entries for all 4 roles plus Fakhar; [✓] biometric modal scans and enters; [✓] continue-session appears after first login and works; [✓] 6 empty submits trigger 20 s cooldown toast and alert.
ALIGN: [✓] modal shows after login; [✓] language/voice/mood persist across reload; [✓] mood=pareshan produces empathic check-in and pulsing FAB.
TOUR: [✓] mind map nodes open cards and speak on tap; [✓] flag map renders real Pakistan incl. GB and AJK labels and crescent; [✓] place search suggestions fly with accuracy ring; [✓] ops map patrols move; [✓] Google and Street tabs load; [✓] video upload via button, empty-state click and drag-drop; [✓] video persists after reload (IndexedDB); [✓] all player controls work incl. fullscreen and close; [✓] holographic film plays 26 s with captions, pause/restart/seek.
SHELL: [✓] search dropdown finds pages/people/places; [✓] "/" focuses search; [✓] ticker scrolls and pauses on hover; [✓] bell lists alerts; [✓] role switcher swaps sidebar, bottom nav and home page; [✓] RBAC denies foreign pages with bilingual toast.
CITIZEN: [✓] overview stats and pulse render; [✓] rates search plus category chips plus report jump; [✓] submit report validates, verifies in 2.6 s; [✓] my reports stepper advances to Resolved after gov dispatch; [✓] directory search filters; [✓] FAQ speak buttons vocalize.
VENDOR: [✓] QR renders with live countdown and renew; [✓] gauge and bars animate to score; [✓] waste log increments points and unlocks at 100; [✓] micro-fee updates credit; [✓] trainings complete.
INSPECTOR: [✓] scan compliant/over/below branches; [✓] citation issues, logs, increments; [✓] geo-fence inside/outside messages; [✓] route checkboxes update percent and feed.
GOV: [✓] command charts build once; [✓] heatmap select shows zone intel and dispatch works end-to-end; [✓] analytics charts and leaderboard; [✓] feeds stream; [✓] data center imports CSV and JSON with counts, templates download, all five exports download.
AI GUIDE: [✓] opens from FAB and sidebar; [✓] Urdu-first default; EN switch reorders bubbles instantly; [✓] chips work incl. distress chip producing empathy plus action button that navigates; [✓] rate aliases answer with live numbers; [✓] flood limit warns; [✓] speak buttons honor gender and never autoplay.`
  },
  {
    id: 's11',
    no: 'S11',
    titleUrdu: 'تعیناتی، شیئرنگ و پورٹیبلٹی',
    titleEn: 'Deployment & Zero-Infrastructure Sharing',
    tag: 'DEPLOYMENT',
    content: `DEPLOY SPEC — ZERO-INFRASTRUCTURE SHARING

1. The platform is ONE index.html: host on any static surface (GitHub Pages, Netlify Drop, Vercel, Cloudflare Pages, own server, or share the file directly on WhatsApp/drive). No env vars, no backend.
2. External services degrade gracefully offline (map fallback outline, embed notices), so demos survive weak networks.
3. User data stays on-device: localStorage session and prefs, IndexedDB video. State this in the footer for trust.
4. Versioning: keep the build stamp line (VRF 2026 • Build date) updated on each release; share this PDF alongside the link so any teammate can rebuild or audit with the same prompts.
5. Team handoff package: link to live demo + this Master Suite PDF + one-paragraph vision quote. Anyone with Qoder/Qwen can regenerate the exact platform from S1-S12.
6. Print/save this document as PDF from the toolbar; the print stylesheet is already A4-optimized.`
  },
  {
    id: 's12',
    no: 'S12',
    titleUrdu: 'مکمل نیویگیشن و فیچر انوینٹری',
    titleEn: 'Complete Navigation & Feature Inventory',
    tag: 'INVENTORY',
    content: `COMPLETE NAVIGATION INVENTORY — implement every row

CITIZEN: Overview | DC Rates (sub: Full Price List, Staples Only, Vegetables, Dairy and Eggs) | Report Engine (sub: New Report, My Reports) | Green Vendors | Why and How QA | Guide and FAQ.
VENDOR: Dashboard (QR phone, gauge, waste) | My Peak Slot | Waste Rewards | MicroPay and Credit | Coaching | Why and How QA | Guide and FAQ.
INSPECTOR: Duty Home | AI Price Scanner | Geo-Fence Check | Citation Log | Field Route | Why and How QA | Guide and FAQ.
GOV: Command Center (KPIs, trend chart, heatmap, live feed) | Dispatch Workflow (queue plus resolved) | Analytics (category bar, tier doughnut, zone leaderboard) | Live Feed | Data Sync Center | Policy and VRF | Why and How QA | Guide and FAQ.
FAKHAR (master): Mission Control (role cards, national indices, security audit card, vision quote) | Data Sync Center | Why and How QA | Guide and FAQ.
GLOBAL OVERLAYS: Align-to-You modal | Biometric modal | Location modal | AI Guide panel | Briefing Cinema (tour step 3) | Alerts bell | Toasts.
MOBILE: bottom nav first-4 items per role; drawer sidebar; mobile search row.

END OF SUITE — Pakistan Zindabad. 🇵🇰`
  }
];

export interface CinematicIntroProps {
  onContinue: () => void;
  onOpenGuidedTour?: () => void;
  lang: Language;
  onToggleLang: () => void;
  initialTab?: 'team' | 'pakistan_map' | 'video_room' | 'prompts' | 'framework';
  onBackToMap?: () => void;
}

const streetViewUrls: Record<string, { nameUrdu: string; nameEn: string; url: string }> = {
  rwp: {
    nameUrdu: 'راجہ بازار راولپنڈی',
    nameEn: 'Raja Bazaar, Rawalpindi',
    url: 'https://maps.google.com/maps?q=Raja+Bazaar+Rawalpindi&t=k&z=17&ie=UTF8&iwloc=&output=embed',
  },
  lhr: {
    nameUrdu: 'انارکلی بازار لاہور',
    nameEn: 'Anarkali Bazaar, Lahore',
    url: 'https://maps.google.com/maps?q=Anarkali+Bazaar+Lahore&t=k&z=17&ie=UTF8&iwloc=&output=embed',
  },
  khi: {
    nameUrdu: 'ایمپریس مارکیٹ صدر کراچی',
    nameEn: 'Empress Market Saddar, Karachi',
    url: 'https://maps.google.com/maps?q=Empress+Market+Karachi&t=k&z=17&ie=UTF8&iwloc=&output=embed',
  },
  psh: {
    nameUrdu: 'قصہ خوانی بازار پشاور',
    nameEn: 'Qissa Khwani Bazaar, Peshawar',
    url: 'https://maps.google.com/maps?q=Qissa+Khwani+Bazaar+Peshawar&t=k&z=17&ie=UTF8&iwloc=&output=embed',
  },
  qta: {
    nameUrdu: 'لیاقت بازار کوئٹہ',
    nameEn: 'Liaquat Bazaar, Quetta',
    url: 'https://maps.google.com/maps?q=Liaquat+Bazaar+Quetta&t=k&z=17&ie=UTF8&iwloc=&output=embed',
  },
};

const mindNodes = [
  {
    id: 0,
    titleUrdu: 'شہری (Citizen Voice)',
    titleEn: 'Citizen Voice & Anonymity',
    descUrdu: 'شہریوں کو سرکاری ڈی سی نرخوں کا شفاف علم اور گمنام شکایت درج کرنے کا مکمل آئینی و قانونی اختیار۔',
    descEn: 'Empowers citizens with verified daily price ceilings and encrypted anonymous reporting.',
    icon: '👤',
    color: '#178A52',
  },
  {
    id: 1,
    titleUrdu: 'ریڑھی بان (Vendor Partner)',
    titleEn: 'Vendor Dignity & QR Slots',
    descUrdu: 'کوئی بے دخلی نہیں! 8 گھنٹے کی گردش، ڈیجیٹل کیو آر لائسنس، ویسٹ پوائنٹس اور 850 تک کریڈٹ اسکور۔',
    descEn: 'Zero unslotted evictions, 8-hour shift rotation, waste rewards and micro-banking credit scores.',
    icon: '🏪',
    color: '#E3A82B',
  },
  {
    id: 2,
    titleUrdu: 'پیرہ انسپکٹر (PERA Magistrate)',
    titleEn: 'Field Enforcement & Coaching',
    descUrdu: '±3% رعایت کا اسکینر، شواہد پر مبنی ڈیجیٹل چالان اور ریڑھی بانوں کی باعزت رہنمائی۔',
    descEn: '±3% tolerance verification, digital evidentiary citations, and vendor coaching first.',
    icon: '🛡️',
    color: '#3D7EA6',
  },
  {
    id: 3,
    titleUrdu: 'ضلعی حکومت (District Command)',
    titleEn: 'District Command Oversight',
    descUrdu: '30 زونز کا لائیو ہیٹ میپ، ریپڈ پیٹرول ڈسپیچ، ڈیٹا امپورٹ ایکسپورٹ اور زیرو لیکج ریونیو۔',
    descEn: '30-zone geospatial heatmap, real-time patrol dispatch, and zero-leakage municipal revenue.',
    icon: '🏛️',
    color: '#0B4A31',
  },
  {
    id: 4,
    titleUrdu: 'اے آئی گائیڈ (AI Civic Guide)',
    titleEn: 'AI Urdu & English Guide',
    descUrdu: 'فوری لسانی رہنمائی، ہمدردانہ انداز، سرکاری نرخوں کا مستند جواب اور ایمرجنسی ایکشن۔',
    descEn: 'Natural language assistance, empathetic check-ins, rate queries and one-tap report actions.',
    icon: '✨',
    color: '#F4D58D',
  },
  {
    id: 5,
    titleUrdu: 'جغرافیائی نقشہ (GeoSpatial Ops)',
    titleEn: 'GeoSpatial Satellite & Street View',
    descUrdu: 'پورے پاکستان بشمول گلگت بلتستان و آزاد کشمیر کا جی پی ایس میپ اور 35 میٹر پریسیشن رنگ۔',
    descEn: 'Full national coverage including Gilgit-Baltistan and AJK with 35m accuracy precision targeting.',
    icon: '🗺️',
    color: '#178A52',
  },
];

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onContinue,
  onOpenGuidedTour,
  lang,
  onToggleLang,
  initialTab = 'team',
  onBackToMap,
}) => {
  const isUrdu = lang === 'ur';
  const [mainTab, setMainTab] = useState<'team' | 'pakistan_map' | 'video_room' | 'prompts' | 'framework'>(initialTab);
  
  // Team State
  const [team, setTeam] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('cp_custom_team_data');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_TEAM;
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [speakingMemberId, setSpeakingMemberId] = useState<string | null>(null);
  const [speakingCitizenId, setSpeakingCitizenId] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<'all' | 'leadership' | 'vendors' | 'citizens_magistrates'>('all');

  // Map of Pakistan State
  const [geoTab, setGeoTab] = useState<'flag' | 'ops' | 'google' | 'street'>('flag');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<typeof PAKISTAN_CITIES[0] | null>(PAKISTAN_CITIES[0]);
  const [selectedBazaar, setSelectedBazaar] = useState('rwp');
  const [mapPrecisionRing, setMapPrecisionRing] = useState(false);

  // Mind Map State
  const [selectedMindNode, setSelectedMindNode] = useState<number | null>(0);

  // Video Briefing Room State
  const [cinemaMode, setCinemaMode] = useState<'film' | 'custom_video'>('film');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string>('');
  const [isFilmPlaying, setIsFilmPlaying] = useState(true);
  const [filmProgress, setFilmProgress] = useState(0);
  const [filmCaption, setFilmCaption] = useState('کنیکٹڈ پاکستان: ڈیجیٹل گورننس کا نیا باب');
  const [isMuted, setIsMuted] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted video from IndexedDB
  useEffect(() => {
    getBriefingVideo().then((record) => {
      if (record && record.blob) {
        const url = URL.createObjectURL(record.blob);
        setUploadedVideoUrl(url);
        setUploadedVideoName(record.name);
        setCinemaMode('custom_video');
      }
    });
  }, []);

  // Holographic Canvas Animation
  useEffect(() => {
    if (cinemaMode !== 'film') return;
    let animationId: number;
    let startTime = Date.now();
    const duration = 26000;

    const captions = [
      { start: 0, textUrdu: 'کنیکٹڈ پاکستان: ڈیجیٹل گورننس اور ریاستی شفافیت کا تاریخی سنگ میل' },
      { start: 4000, textUrdu: 'فخر مشتاق کا وژن: ریڑھی بانوں کو عزت، قانونی تحفظ اور کیو آر سلاٹ' },
      { start: 9000, textUrdu: 'عام شہری کے لیے شفاف ڈی سی نرخ اور 41 منٹ میں تصدیق شدہ کارروائی' },
      { start: 14000, textUrdu: 'پیرہ مجسٹریٹس اور ڈی سی کمانڈ کا 30 زونز پر محیط لائیو ہیٹ میپ' },
      { start: 19000, textUrdu: 'پاکستان کے تمام اضلاع میں زیرو کرپشن اور خود مختار ڈیجیٹل ریاست' },
      { start: 23500, textUrdu: 'پاکستان زندہ باد • Team StrongerTogether' },
    ];

    const render = () => {
      const elapsed = (Date.now() - startTime) % duration;
      const progress = (elapsed / duration) * 100;
      setFilmProgress(progress);

      const curCap = [...captions].reverse().find(c => elapsed >= c.start);
      if (curCap) setFilmCaption(curCap.textUrdu);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 20, canvas.width / 2, canvas.height / 2, canvas.width / 1.5);
          grad.addColorStop(0, '#0B4A31');
          grad.addColorStop(0.5, '#04231A');
          grad.addColorStop(1, '#020e0a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = 'rgba(23, 138, 82, 0.18)';
          ctx.lineWidth = 1;
          for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          const time = Date.now() * 0.002;
          const cx = canvas.width / 2;
          const cy = canvas.height / 2 - 20;

          ctx.strokeStyle = '#E3A82B';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 95 + Math.sin(time) * 4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(23, 138, 82, 0.8)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 75 + Math.cos(time * 1.5) * 6, time, time + Math.PI * 1.5);
          ctx.stroke();

          ctx.fillStyle = '#178A52';
          ctx.beginPath();
          ctx.arc(cx, cy, 55, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 22px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🇵🇰 VRF 2026', cx, cy - 8);

          ctx.fillStyle = '#E3A82B';
          ctx.font = 'bold 12px Arial';
          ctx.fillText('CONNECTED PAKISTAN', cx, cy + 14);
        }
      }

      if (isFilmPlaying) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [cinemaMode, isFilmPlaying]);

  const handleVideoUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 800 * 1024 * 1024) {
      showToast(isUrdu ? 'فائل کا سائز 800MB سے زیادہ نہیں ہونا چاہیے' : 'Video file size must be under 800MB');
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setUploadedVideoName(file.name);
      setCinemaMode('custom_video');
      await saveBriefingVideo(file, file.name);
      showToast(isUrdu ? 'ویڈیو کامیابی سے اپ لوڈ اور محفوظ ہو گئی ✓' : 'Video uploaded & saved to database ✓');
    } catch (err) {
      console.error(err);
      showToast(isUrdu ? 'ویڈیو محفوظ کرنے میں مسئلہ پیش آیا' : 'Failed to save video');
    }
  };

  const handleDeleteVideo = async () => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    setUploadedVideoUrl(null);
    setUploadedVideoName('');
    setCinemaMode('film');
    await deleteBriefingVideo();
    showToast(isUrdu ? 'ویڈیو کامیابی سے ہٹا دی گئی' : 'Custom video deleted');
  };

  const handleSelectMindNode = (index: number) => {
    setSelectedMindNode(index);
    const node = mindNodes[index];
    const textToSpeak = isUrdu
      ? `${node.titleUrdu}۔ ${node.descUrdu}`
      : `${node.titleEn}. ${node.descEn}`;
    speechService.speak(textToSpeak, { lang: isUrdu ? 'ur' : 'en' });
  };

  // Prompts Suite State
  const [selectedPromptId, setSelectedPromptId] = useState<string>('s1');
  const [promptSearch, setPromptSearch] = useState<string>('');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    showToast(`${label} copied to clipboard ✓`);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const handleDownloadTxt = () => {
    let txt = `CONNECTED PAKISTAN — VRF 2026 • MASTER REBUILD PROMPT SUITE (v2026.08.19)\nVision: Fakhar Mushtaq • Team Stronger Together\n\n`;
    MASTER_PROMPT_SECTIONS.forEach(s => {
      txt += `════ ${s.no} — ${s.titleEn} ════\n\n${s.content}\n\n`;
    });
    txt += `\nVision by Fakhar Mushtaq • Build with Team Stronger Together • Pakistan Zindabad 🇵🇰\n`;

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Connected-Pakistan_VRF2026_Master-Prompt-Suite.txt';
    a.click();
    showToast('Text Prompt Suite downloaded ⬇');
  };

  const handleDownloadMarkdown = () => {
    let md = `# Connected Pakistan — VRF 2026 • Master Rebuild Prompt Suite\n\n> Version 2026.08.19 • Vision: Fakhar Mushtaq • Team Stronger-Together\n> One-click rebuild kit for Qoder / Qwen / any AI builder. Urdu-first + English.\n\n`;
    MASTER_PROMPT_SECTIONS.forEach(s => {
      md += `## ${s.no} — ${s.titleEn}\n\n\`\`\`\n${s.content}\n\`\`\`\n\n`;
    });
    md += `---\nVision by Fakhar Mushtaq • Build with Team Stronger Together • Pakistan Zindabad 🇵🇰\n`;
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Connected-Pakistan_VRF2026_Master-Prompt-Suite.md';
    a.click();
    showToast('Markdown Prompt Suite downloaded ⬇');
  };

  const filteredPrompts = MASTER_PROMPT_SECTIONS.filter(s => {
    const q = promptSearch.toLowerCase();
    return s.titleEn.toLowerCase().includes(q) || 
           s.titleUrdu.includes(q) || 
           s.content.toLowerCase().includes(q) ||
           s.tag.toLowerCase().includes(q) ||
           s.no.toLowerCase().includes(q);
  });

  const activePrompt = MASTER_PROMPT_SECTIONS.find(s => s.id === selectedPromptId) || MASTER_PROMPT_SECTIONS[0];

  // Save changes to localStorage
  const saveTeamData = (updated: TeamMember[]) => {
    setTeam(updated);
    try {
      localStorage.setItem('cp_custom_team_data', JSON.stringify(updated));
    } catch {
      // non-blocking
    }
  };

  const handleResetTeam = () => {
    setTeam(DEFAULT_TEAM);
    try {
      localStorage.removeItem('cp_custom_team_data');
    } catch {
      // non-blocking
    }
    setIsEditMode(false);
  };

  const updateMemberField = (id: string, field: keyof TeamMember, value: unknown) => {
    const updated = team.map(m => m.id === id ? { ...m, [field]: value } : m);
    saveTeamData(updated);
  };

  const handleFileUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        updateMemberField(id, 'photoUrl', result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (id: string) => {
    updateMemberField(id, 'photoUrl', undefined);
  };

  // Play audio greeting with natural tone
  const handlePlayIndividualMember = (member: TeamMember) => {
    if (speakingMemberId === member.id) {
      speechService.stop();
      setSpeakingMemberId(null);
      return;
    }

    speechService.stop();
    setSpeakingMemberId(member.id);

    const msg = isUrdu ? member.welcomeMessageUrdu : member.welcomeMessage;
    const gender = member.isLead ? 'male' : 'female';

    speechService.playChime('empathy');
    setTimeout(() => {
      speechService.speak(msg, {
        lang,
        voiceGender: gender,
        rate: isUrdu ? 0.88 : 0.96,
        onEnd: () => setSpeakingMemberId(null),
        onError: () => setSpeakingMemberId(null),
      });
    }, 180);
  };

  const handlePlayCitizenHero = (hero: CitizenHero) => {
    if (speakingCitizenId === hero.id) {
      speechService.stop();
      setSpeakingCitizenId(null);
      return;
    }

    speechService.stop();
    setSpeakingMemberId(null);
    setSpeakingCitizenId(hero.id);

    const msg = isUrdu ? hero.audioVoiceMessageUrdu : hero.audioVoiceMessageEn;

    speechService.playChime('empathy');
    setTimeout(() => {
      speechService.speak(msg, {
        lang,
        voiceGender: hero.voiceGender,
        rate: isUrdu ? 0.88 : 0.96,
        onEnd: () => setSpeakingCitizenId(null),
        onError: () => setSpeakingCitizenId(null),
      });
    }, 180);
  };

  const lead = team.find(m => m.isLead) || team[0];
  const females = team.filter(m => !m.isLead);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-inter relative selection:bg-emerald-500 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/60 via-slate-900 to-black pointer-events-none" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-400 flex items-center gap-2 animate-fadeUp">
          <Check className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Navigation Tabs */}
      <header className="px-4 sm:px-8 py-3 border-b border-emerald-800/40 bg-emerald-950/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
        <BrandLogo 
          variant="dark" 
          size="sm" 
          showSubtitle={true}
          subtitleText="VRF 2026 • Secure Sovereign Console"
        />

        {/* Action Controls & Navigation Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Main Top Navigation Tabs */}
          <div className="bg-slate-950/90 p-1 rounded-xl border border-emerald-700/50 flex items-center gap-1 flex-wrap sm:flex-nowrap">
            <button
              id="tab-team-nav"
              onClick={() => setMainTab('team')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainTab === 'team'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'قیادت' : 'Leadership'}</span>
            </button>

            <button
              id="tab-pakistan-map-nav"
              onClick={() => setMainTab('pakistan_map')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainTab === 'pakistan_map'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-emerald-400" />
              <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'نقشہ پاکستان' : 'Pakistan Map'}</span>
            </button>

            <button
              id="tab-video-room-nav"
              onClick={() => setMainTab('video_room')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainTab === 'video_room'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'ویڈیو روم' : 'Video Room'}</span>
            </button>

            <button
              id="tab-prompts-nav"
              onClick={() => setMainTab('prompts')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainTab === 'prompts'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'پرامپٹس' : 'Prompts'}</span>
            </button>

            <button
              id="tab-framework-nav"
              onClick={() => setMainTab('framework')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainTab === 'framework'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'فریم ورک' : 'Framework'}</span>
            </button>
          </div>

          {/* Back to Map button if in sequence */}
          {onBackToMap && (
            <button
              id="btn-back-to-strategic-map"
              onClick={onBackToMap}
              className="bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Map className="w-3.5 h-3.5 text-emerald-400" />
              <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? '← نقشہ' : '← Map'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* Direct Proceed Button to Platform */}
          <button
            id="btn-header-continue-login"
            onClick={onContinue}
            className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'پلیٹ فارم میں داخل ہوں' : 'Enter Platform'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 z-10">

        {/* ======================= TAB 1: TEAM & LEADERSHIP ======================= */}
        {mainTab === 'team' && (
          <div className="space-y-6 animate-fadeUp">
            {/* Top Mission Statement Hero */}
            <div className="text-center max-w-3xl mx-auto space-y-2 pt-2">
              <div className="inline-flex items-center gap-2 bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 px-3.5 py-1 rounded-full text-xs font-bold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isUrdu ? 'قومی ڈیجیٹل گورننس، عوامی فلاح و خود مختاری کا فریم ورک' : 'Sovereign Digital Statecraft & Citizen Dignity Framework 2026'}</span>
              </div>
              <h2 className="font-sora font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                {isUrdu ? 'پاکستان کے باصلاحیت معمار اور عام شہری' : 'The People of Pakistan Behind Connected Pakistan'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-urdu max-w-2xl mx-auto leading-relaxed">
                {isUrdu 
                  ? 'فخر مشتاق کی قیادت، باصلاحیت نوجوان خواتین معمار اور پاکستان کے گلی کوچوں کے اصل ہیروز: محنت کش ریڑھی بان، باشعور شہری اور فرض شناس مجسٹریٹس۔'
                  : 'Envisioned by Fakhar Mushtaq, built with dynamic young Pakistani leaders, and powered by the heartbeat of Pakistan: street vendors, everyday citizens, and field magistrates.'}
              </p>
            </div>

            {/* National Impact Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-600/30 text-center shadow-md">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  {isUrdu ? 'شہری نمائندگی' : 'Citizens Represented'}
                </span>
                <span className="font-sora font-extrabold text-xl text-white block mt-0.5">240 Million</span>
                <span className="text-[10px] text-slate-400 font-urdu mt-0.5 block">{isUrdu ? 'تمام صوبے و آزاد کشمیر' : 'All 4 Provinces, AJK & GB'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-600/30 text-center shadow-md">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  {isUrdu ? 'محنت کش ریڑھی بان' : 'Street Vendors'}
                </span>
                <span className="font-sora font-extrabold text-xl text-white block mt-0.5">10 Million+</span>
                <span className="text-[10px] text-slate-400 font-urdu mt-0.5 block">{isUrdu ? 'کیو آر کوڈ و زیرو بے دخلی' : 'Zero-Eviction QR Slots'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-600/30 text-center shadow-md">
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
                  {isUrdu ? 'انتظامی ڈسٹرکٹس' : 'Connected Districts'}
                </span>
                <span className="font-sora font-extrabold text-xl text-white block mt-0.5">30 Districts</span>
                <span className="text-[10px] text-slate-400 font-urdu mt-0.5 block">{isUrdu ? 'لائیو ہیٹ میپ و ریڈار' : 'Live Geofenced Grid'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-600/30 text-center shadow-md">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  {isUrdu ? 'عزت و باوقار روزگار' : 'Citizen Trust Index'}
                </span>
                <span className="font-sora font-extrabold text-xl text-white block mt-0.5">100% Dignity</span>
                <span className="text-[10px] text-slate-400 font-urdu mt-0.5 block">{isUrdu ? 'گمنام رپورٹنگ و انصاف' : 'Encrypted & Objective'}</span>
              </div>
            </div>

            {/* Category Filter & Editing Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-800/90 p-3 rounded-2xl border border-slate-700 shadow-md">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-700 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => setTeamFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    teamFilter === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'سبھی شخصیات (All)' : 'All People & Leaders'}</span>
                </button>

                <button
                  onClick={() => setTeamFilter('leadership')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    teamFilter === 'leadership'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUrdu ? 'قومی قیادت (5)' : 'Systems Leadership (5)'}</span>
                </button>

                <button
                  onClick={() => setTeamFilter('vendors')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    teamFilter === 'vendors'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUrdu ? 'محنت کش ریڑھی بان' : 'Street Vendors'}</span>
                </button>

                <button
                  onClick={() => setTeamFilter('citizens_magistrates')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    teamFilter === 'citizens_magistrates'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isUrdu ? 'شہری و مجسٹریٹس' : 'Consumers & Magistrates'}</span>
                </button>
              </div>

              {/* Edit Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isEditMode
                      ? 'bg-amber-400 text-emerald-950 font-black shadow-md'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditMode ? (isUrdu ? 'ترمیم مکمل کریں' : 'Done Editing') : (isUrdu ? 'ٹیم تفصیلات تبدیل کریں' : 'Customize Team')}</span>
                </button>

                {isEditMode && (
                  <button
                    onClick={handleResetTeam}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 flex items-center gap-1.5 transition-colors"
                    title="Reset to default original team"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'اصل حالت پر لائیں' : 'Reset'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* SECTION A: SYSTEMS LEADERSHIP (FAKHAR MUSHTAQ & 4 CO-LEADS) */}
            {(teamFilter === 'all' || teamFilter === 'leadership') && (
              <div className="space-y-6">
                {/* 1. NATIONAL VISION LEAD: FAKHAR MUSHTAQ */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 border-2 border-emerald-600 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left z-10 flex-1">
                    {/* Photo or Clean Avatar Slot */}
                    <div className="relative shrink-0">
                      {lead.photoUrl ? (
                        <div className="relative group">
                          <img 
                            src={lead.photoUrl} 
                            alt={lead.name} 
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-amber-400 shadow-2xl"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(lead.id)}
                            className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                            title={isUrdu ? 'تصویر ہٹائیں' : 'Remove Photo'}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label 
                          htmlFor="upload-lead-photo"
                          className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 border-4 border-dashed border-amber-400 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-900/80 transition-all shadow-2xl group text-center p-2"
                          title={isUrdu ? 'فخر مشتاق کی تصویر اپلوڈ کریں' : 'Click to upload Fakhar Mushtaq photo'}
                        >
                          <Camera className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold text-amber-300 mt-1 block">
                            {isUrdu ? 'تصویر اپلوڈ کریں' : 'Upload Photo'}
                          </span>
                        </label>
                      )}

                      <input 
                        id="upload-lead-photo" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(lead.id, e.target.files[0]);
                        }}
                      />

                      <span className="absolute -bottom-2 -right-2 bg-amber-400 text-emerald-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow">
                        ⭐ LEAD
                      </span>
                    </div>

                    {/* Info and Taglines */}
                    <div className="space-y-2 flex-1">
                      <div className="inline-flex items-center gap-2 bg-amber-400 text-emerald-950 px-3 py-0.5 rounded-full text-xs font-black shadow-xs">
                        <Sparkle className="w-3.5 h-3.5 fill-current" />
                        <span>{isUrdu ? lead.badgeUrdu : lead.badge}</span>
                      </div>

                      {isEditMode ? (
                        <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-emerald-700/60">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-emerald-300 font-bold block">Name (EN):</label>
                              <input 
                                type="text" 
                                value={lead.name}
                                onChange={(e) => updateMemberField(lead.id, 'name', e.target.value)}
                                className="w-full bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded border border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-emerald-300 font-bold block font-urdu">نام (اردو):</label>
                              <input 
                                type="text" 
                                value={lead.nameUrdu}
                                onChange={(e) => updateMemberField(lead.id, 'nameUrdu', e.target.value)}
                                className="w-full bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded border border-emerald-500 font-urdu focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-emerald-300 font-bold block">Role & Designation:</label>
                            <input 
                              type="text" 
                              value={lead.role}
                              onChange={(e) => updateMemberField(lead.id, 'role', e.target.value)}
                              className="w-full bg-slate-900 text-emerald-300 text-xs px-2 py-1 rounded border border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-emerald-300 font-bold block">Short Tagline:</label>
                            <textarea 
                              rows={2}
                              value={lead.tagline}
                              onChange={(e) => updateMemberField(lead.id, 'tagline', e.target.value)}
                              className="w-full bg-slate-900 text-white text-xs px-2 py-1 rounded border border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-sora font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                            {isUrdu ? lead.nameUrdu : lead.name}
                          </h3>

                          <p className="text-xs sm:text-sm font-bold text-emerald-300">
                            {isUrdu ? lead.roleUrdu : lead.role}
                          </p>

                          <p className="text-xs sm:text-sm text-emerald-100 font-urdu max-w-xl leading-relaxed">
                            {isUrdu ? lead.taglineUrdu : lead.tagline}
                          </p>
                        </>
                      )}

                      {/* Individual Audio Voice Trigger */}
                      <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                        <button
                          onClick={() => handlePlayIndividualMember(lead)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                            speakingMemberId === lead.id
                              ? 'bg-amber-400 text-emerald-950 animate-bounce'
                              : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500'
                          }`}
                        >
                          {speakingMemberId === lead.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {speakingMemberId === lead.id 
                              ? (isUrdu ? 'آواز روکیں' : 'Stop Audio') 
                              : (isUrdu ? 'فخر مشتاق کا وژن سنیں' : 'Hear Vision Message')}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* National Overview Metric Badge */}
                  <div className="shrink-0 bg-emerald-950/80 p-5 rounded-2xl border border-emerald-700/50 shadow-inner text-center min-w-[200px] z-10">
                    <span className="text-[11px] font-bold text-emerald-300 block uppercase tracking-wider">
                      {isUrdu ? 'قومی ڈیجیٹل احاطہ' : 'Nationwide Vision'}
                    </span>
                    <span className="font-sora font-extrabold text-2xl text-white block mt-1">240M Citizens</span>
                    <span className="text-xs text-amber-300 block font-bold font-urdu mt-0.5">
                      {isUrdu ? '30 اضلاع • 4 باصلاحیت خواتین لیڈز' : 'Standing with 4 Women Co-Leads'}
                    </span>
                    <div className="mt-2 pt-2 border-t border-emerald-800 text-[10px] text-emerald-200">
                      {isUrdu ? '100% شفافیت و خود مختاری' : 'Zero-Eviction Protection'}
                    </div>
                  </div>
                </div>

                {/* 2. FOUR BRILLIANT PAKISTANI WOMEN CO-LEADS */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                        {isUrdu ? 'چار باصلاحیت نوجوان پاکستانی خواتین اسٹریٹجک لیڈز' : 'Four Dynamic Pakistani Women Leaders'}
                      </h4>
                    </div>
                    <span className="text-xs text-emerald-300 font-urdu font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                      {isUrdu ? 'قومی رنگوں میں ملبوس • شعبہ جاتی سربراہان' : 'Co-Founding Executive Pillar Leads'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {females.map((member, idx) => {
                      const isSpeaking = speakingMemberId === member.id;
                      return (
                        <div
                          key={member.id}
                          className="p-5 rounded-3xl bg-slate-800/90 border border-slate-700 hover:border-emerald-500 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
                        >
                          <div>
                            {/* Top Row: Photo Slot & Badge */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="relative">
                                {member.photoUrl ? (
                                  <div className="relative group/pic">
                                    <img 
                                      src={member.photoUrl} 
                                      alt={member.name} 
                                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs group-hover:scale-105 transition-transform"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemovePhoto(member.id);
                                      }}
                                      className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 shadow transition-transform hover:scale-110"
                                      title={isUrdu ? 'تصویر ہٹائیں' : 'Remove Photo'}
                                    >
                                      <X className="w-3 h-3 stroke-[3]" />
                                    </button>
                                  </div>
                                ) : (
                                  <label 
                                    htmlFor={`upload-${member.id}`}
                                    className="w-16 h-16 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border-2 border-dashed border-emerald-500 flex flex-col items-center justify-center cursor-pointer transition-all shadow-xs group/femlabel text-center p-1"
                                    title={isUrdu ? 'تصویر اپلوڈ کریں' : 'Click to upload photo'}
                                  >
                                    <Camera className="w-4 h-4 text-emerald-400 group-hover/femlabel:scale-110 transition-transform" />
                                    <span className="text-[8px] font-bold text-emerald-300 mt-0.5 block leading-none">
                                      {isUrdu ? 'تصویر' : 'Upload'}
                                    </span>
                                  </label>
                                )}

                                {/* Hidden input for female member */}
                                <input 
                                  id={`upload-${member.id}`}
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) handleFileUpload(member.id, e.target.files[0]);
                                  }}
                                />

                                <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow">
                                  #{idx + 1}
                                </span>
                              </div>

                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                                {isUrdu ? member.badgeUrdu : member.badge}
                              </span>
                            </div>

                            {/* Edit Mode Controls for this member */}
                            {isEditMode ? (
                              <div className="space-y-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 mb-2">
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 block">Name (EN):</label>
                                  <input 
                                    type="text" 
                                    value={member.name}
                                    onChange={(e) => updateMemberField(member.id, 'name', e.target.value)}
                                    className="w-full bg-slate-800 text-white text-xs font-bold px-1.5 py-0.5 rounded border border-slate-600 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 block font-urdu">نام (اردو):</label>
                                  <input 
                                    type="text" 
                                    value={member.nameUrdu}
                                    onChange={(e) => updateMemberField(member.id, 'nameUrdu', e.target.value)}
                                    className="w-full bg-slate-800 text-white text-xs font-bold px-1.5 py-0.5 rounded border border-slate-600 font-urdu focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 block">Role:</label>
                                  <input 
                                    type="text" 
                                    value={member.role}
                                    onChange={(e) => updateMemberField(member.id, 'role', e.target.value)}
                                    className="w-full bg-slate-800 text-slate-200 text-[11px] px-1.5 py-0.5 rounded border border-slate-600 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 block">Tagline:</label>
                                  <textarea 
                                    rows={2}
                                    value={member.tagline}
                                    onChange={(e) => updateMemberField(member.id, 'tagline', e.target.value)}
                                    className="w-full bg-slate-800 text-slate-200 text-[11px] px-1.5 py-0.5 rounded border border-slate-600 focus:outline-none"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Name & Title */}
                                <h4 className="font-sora font-extrabold text-base text-white">
                                  {isUrdu ? member.nameUrdu : member.name}
                                </h4>

                                <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                                  {isUrdu ? member.roleUrdu : member.role}
                                </p>

                                <p className="text-xs text-slate-300 mt-2 font-urdu leading-relaxed">
                                  {isUrdu ? member.taglineUrdu : member.tagline}
                                </p>

                                {/* Attire Tag */}
                                <div className="mt-2 text-[10px] text-slate-400 italic bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-700/50">
                                  🇵🇰 {isUrdu ? member.attireDescriptionUrdu : member.attireDescription}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Listen button & Active Status */}
                          <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                            <button
                              onClick={() => handlePlayIndividualMember(member)}
                              className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                                isSpeaking 
                                  ? 'bg-amber-400 text-emerald-950 font-black animate-pulse'
                                  : 'text-emerald-300 hover:bg-emerald-900/60 bg-slate-900'
                              }`}
                            >
                              {isSpeaking ? (
                                <VolumeX className="w-3 h-3" />
                              ) : (
                                <Volume2 className="w-3 h-3" />
                              )}
                              <span>{isSpeaking ? (isUrdu ? 'آواز روکیں' : 'Stop Audio') : (isUrdu ? 'آواز سنیں' : 'Listen')}</span>
                            </button>

                            <span className="flex items-center gap-1 font-semibold text-emerald-400 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isUrdu ? 'فعال لیڈ' : 'Active'}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION B: EVERYDAY HEROES & CITIZENS OF PAKISTAN */}
            {(teamFilter === 'all' || teamFilter === 'vendors' || teamFilter === 'citizens_magistrates') && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                      <h3 className="font-sora font-extrabold text-lg sm:text-xl text-white">
                        {isUrdu ? 'پاکستان کے عام شہری، محنت کش دکاندار اور فیلڈ ہیروز' : 'People of Pakistan: The Real Heartbeat of the Bazaar Economy'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 font-urdu mt-0.5">
                      {isUrdu 
                        ? 'راولپنڈی، کراچی، لاہور، پشاور، ملتان اور کوئٹہ کے حقیقی شہریوں اور دکانداروں کے براہ راست تاثرات اور تجربات۔' 
                        : 'Voices, stories, and verified experiences of street vendors, consumers, magistrates, and local merchants across Pakistan.'}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-700">
                    {isUrdu ? '8 تصدیق شدہ کہانیاں بمعہ آواز' : '8 Authentic Pakistani Testimonials'}
                  </span>
                </div>

                {/* Featured Real-World Case Study Graphic (Exact Match to Screenshot) */}
                <div className="rounded-3xl bg-[#04231A] border-2 border-[#1A774B] p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-xl">
                  <div className="lg:col-span-7">
                    <MarketHeroArtwork 
                      showBadge={false}
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-3.5 text-left">
                    <div className="inline-flex items-center gap-2 bg-[#083825] border border-emerald-500/50 px-3 py-1 rounded-full text-xs text-emerald-400 font-mono font-bold">
                      <span>CASE STUDY • REPORT CP-26-8841</span>
                    </div>
                    <h4 className="font-sora font-extrabold text-xl text-white">
                      {isUrdu ? 'منصفانہ خریداری، باوقار روزگار' : 'Fair Markets & Dignified Livelihoods'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-urdu">
                      {isUrdu 
                        ? 'شہری صارف فاطمہ بی بی کی گمنام رپورٹ پر فیلڈ ٹیم نے راجہ بازار میں 41 منٹ کے اندر معائنہ مکمل کیا، سرکاری نرخ نامہ بحال کرایا اور دکاندار کو گرین کمپلائنس بیج سے نوازا۔'
                        : 'On Fatima Bibi’s encrypted mobile report, the PERA rapid response squad inspected Raja Bazaar in 41 minutes, restored official DC price ceilings, and upgraded the compliant vendor to a verified green tier.'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-[#031E15] border border-emerald-700/50">
                        <span className="text-[10px] text-slate-400 block">Response Time</span>
                        <strong className="text-emerald-400 font-bold font-mono">41 Minutes</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#031E15] border border-emerald-700/50">
                        <span className="text-[10px] text-slate-400 block">Encrypted Voice</span>
                        <strong className="text-amber-300 font-bold font-mono">100% Zero Fear</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Citizen & Vendor Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PAKISTANI_CITIZENS_AND_HEROES
                    .filter(hero => {
                      if (teamFilter === 'vendors') return hero.category === 'vendor' || hero.category === 'innovator';
                      if (teamFilter === 'citizens_magistrates') return hero.category === 'citizen' || hero.category === 'magistrate';
                      return true;
                    })
                    .map((hero) => {
                      const isSpeaking = speakingCitizenId === hero.id;

                      return (
                        <div 
                          key={hero.id}
                          className="p-4 rounded-3xl bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between group"
                        >
                          <div className="space-y-3">
                            {/* Photo & Badge Row */}
                            <div className="flex items-start gap-3">
                              <div className="relative shrink-0">
                                <div className="w-14 h-14 rounded-2xl bg-[#04231A] text-emerald-400 border-2 border-emerald-500 shadow-md flex items-center justify-center font-bold text-lg">
                                  {hero.category === 'vendor' ? '🏪' : hero.category === 'magistrate' ? '🛡️' : hero.category === 'innovator' ? '⚡' : '👥'}
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{isUrdu ? hero.locationUrdu : hero.location}</span>
                                </div>

                                <h4 className="font-sora font-extrabold text-sm text-white truncate mt-0.5">
                                  {isUrdu ? hero.nameUrdu : hero.name}
                                </h4>

                                <span className="text-[10px] font-bold text-emerald-400 block truncate">
                                  {isUrdu ? hero.roleUrdu : hero.role}
                                </span>
                              </div>
                            </div>

                            {/* Verified Badge Tag */}
                            <div className="inline-flex items-center gap-1.5 bg-slate-900/80 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700/80 w-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="truncate">{isUrdu ? hero.badgeUrdu : hero.badge}</span>
                            </div>

                            {/* Quote Content */}
                            <p className="text-xs text-slate-200 font-urdu leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 italic">
                              "{isUrdu ? hero.quoteUrdu : hero.quoteEn}"
                            </p>

                            {/* Key Stats Badge */}
                            <div className="text-[10px] font-bold text-emerald-300 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                              🇵🇰 {isUrdu ? hero.statsUrdu : hero.stats}
                            </div>
                          </div>

                          {/* Speakable Voice Audio Button */}
                          <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between">
                            <button
                              onClick={() => handlePlayCitizenHero(hero)}
                              className={`text-[11px] font-bold flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all shadow-xs ${
                                isSpeaking
                                  ? 'bg-amber-400 text-emerald-950 font-black animate-pulse'
                                  : 'text-emerald-300 hover:bg-emerald-900/60 bg-slate-900 border border-emerald-700/50'
                              }`}
                            >
                              {isSpeaking ? (
                                <VolumeX className="w-3.5 h-3.5" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {isSpeaking 
                                  ? (isUrdu ? 'آواز روکیں' : 'Stop') 
                                  : (isUrdu ? 'تاثرات سنیں' : 'Hear Voice')}
                              </span>
                            </button>

                            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>{hero.verifiedLabel}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: COMPLETE MAP OF PAKISTAN ======================= */}
        {mainTab === 'pakistan_map' && (
          <div className="space-y-6 animate-fadeUp">
            {/* Map Header */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-600/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-start gap-3.5">
                <PakistanFlagEmblem size="md" variant="flag" rounded="md" className="ring-2 ring-amber-400/70 shadow-lg shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      GIS SOVEREIGN SPATIAL MAP
                    </span>
                    <span className="text-xs text-emerald-300 font-semibold hidden sm:inline">
                      • 100% Nationwide Micro-Geofencing Coverage
                    </span>
                  </div>

                  <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-white mt-1.5 flex items-center gap-2">
                    <Map className="w-6 h-6 text-emerald-400" />
                    <span>{isUrdu ? 'نقشہ پاکستان و 30 ضلعی آپریشنل گرڈ' : 'Complete Map of Pakistan & Geospatial Grid'}</span>
                  </h3>
                  
                  <p className="text-xs text-slate-300 font-urdu mt-0.5 max-w-2xl">
                    {isUrdu 
                      ? 'پنجاب، سندھ، خیبر پختونخوا، بلوچستان، گلگت بلتستان، آزاد کشمیر اور وفاقی دارالحکومت میں ریڑھی بانوں کے کیو آر سلاٹس، پیرہ موبائل پیٹرولز اور ڈی سی لائیو کنٹرول۔' 
                      : 'Interactive nationwide coverage with GIS city markers, satellite terrain view, live Google Maps, and 360° historical bazaar street views.'}
                  </p>
                </div>
              </div>

              {/* GeoSubTabs Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-2xl border border-emerald-700/50 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => setGeoTab('flag')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    geoTab === 'flag'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUrdu ? 'قومی نقشہ' : 'National Map'}</span>
                </button>

                <button
                  onClick={() => setGeoTab('ops')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    geoTab === 'ops'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUrdu ? 'لائیو پیٹرول گرڈ' : 'Live Patrols'}</span>
                </button>

                <button
                  onClick={() => setGeoTab('google')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    geoTab === 'google'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isUrdu ? 'سیٹلائٹ میپ' : 'Google Satellite'}</span>
                </button>

                <button
                  onClick={() => setGeoTab('street')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    geoTab === 'street'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUrdu ? 'اسٹریٹ ویو' : '360° Bazaar'}</span>
                </button>
              </div>
            </div>

            {/* Sub-view: Flag / National SVG Map */}
            {geoTab === 'flag' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Vector Map Canvas */}
                <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900/90 border border-emerald-600/40 shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                        {isUrdu ? 'پاکستان کا جغرافیائی و ڈیجیٹل نقشہ' : 'Territorial Vector GIS View'}
                      </span>
                    </div>
                    <button
                      onClick={() => setMapPrecisionRing(!mapPrecisionRing)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                        mapPrecisionRing
                          ? 'bg-amber-400 text-emerald-950 border-amber-300'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>{isUrdu ? '35m جیو فینس رنگ' : '35m Geofence Rings'}</span>
                    </button>
                  </div>

                  {/* Visual SVG Map */}
                  <div className="w-full h-80 sm:h-96 relative bg-emerald-950/70 rounded-2xl border border-emerald-800/60 overflow-hidden flex items-center justify-center p-4">
                    {/* Grid Background */}
                    <div 
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #178A52 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                      }}
                    />

                    {/* Regional Labels Overlay */}
                    <div className="absolute top-3 left-4 text-[10px] text-emerald-400 font-bold bg-slate-950/70 px-2 py-0.5 rounded border border-emerald-800">
                      🏔️ Gilgit-Baltistan & Azad Kashmir Included
                    </div>
                    <div className="absolute bottom-3 right-4 text-[10px] text-amber-300 font-bold bg-slate-950/70 px-2 py-0.5 rounded border border-amber-800">
                      🌊 Arabian Sea Coast (Karachi & Gwadar)
                    </div>

                    {/* Interactive City Nodes on Relative Coords */}
                    <div className="relative w-full h-full max-w-lg max-h-80 mx-auto">
                      {PAKISTAN_CITIES.map((city) => {
                        const isSelected = selectedCity?.id === city.id;
                        // Transform lat/lon into 0-100% position
                        // Lat 24 (Karachi) to 36 (Gilgit), Lon 62 (Gwadar) to 75 (Gilgit)
                        const top = `${100 - ((city.lat - 24) / 12.5) * 85 - 8}%`;
                        const left = `${((city.lng - 62) / 13) * 80 + 10}%`;

                        return (
                          <div
                            key={city.id}
                            style={{ top, left }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                            onClick={() => {
                              setSelectedCity(city);
                              const text = isUrdu 
                                ? `${city.nameUrdu} (${city.provinceUrdu})۔ ضلعی کمانڈ فعال ہے۔ فعال سلاٹس: ${city.activeStalls}۔ رجسٹرڈ دکاندار: ${city.registeredVendors}۔`
                                : `${city.nameEn} (${city.provinceEn}). District command active. Active stalls: ${city.activeStalls}. Registered vendors: ${city.registeredVendors}.`;
                              speechService.speak(text, { lang: isUrdu ? 'ur' : 'en' });
                            }}
                          >
                            {/* 35m Accuracy Ring Pulse */}
                            {mapPrecisionRing && (
                              <div className="absolute -inset-3 rounded-full border border-amber-400/80 animate-ping" />
                            )}

                            {/* Node Dot */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-lg transition-transform group-hover:scale-125 ${
                              isSelected
                                ? 'bg-amber-400 text-emerald-950 ring-4 ring-amber-300/40'
                                : 'bg-emerald-600 text-white border border-emerald-300'
                            }`}>
                              {city.id === 'isb' ? '⭐' : city.registeredVendors > 5000 ? '⚡' : '📍'}
                            </div>

                            {/* City Label Badge */}
                            <div className={`absolute left-1/2 -translate-x-1/2 top-7 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-md transition-all ${
                              isSelected
                                ? 'bg-amber-400 text-emerald-950'
                                : 'bg-slate-900/90 text-emerald-200 border border-emerald-700/60'
                            }`}>
                              {isUrdu ? city.nameUrdu : city.nameEn} ({city.activeStalls})
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Legend */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 font-urdu pt-2 border-t border-slate-800">
                    <span>نقشے پر کسی بھی شہر یا ریجن پر کلک کر کے ضلعی تفصیلات سنیں اور جانچیں</span>
                    <span className="text-amber-400 font-sans font-bold">10 Major Divisions Active</span>
                  </div>
                </div>

                {/* Right: Selected City Inspector Card */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-700/60 shadow-xl flex flex-col justify-between space-y-4">
                  {selectedCity ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-950 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-800 uppercase">
                          {isUrdu ? selectedCity.provinceUrdu : selectedCity.provinceEn} • Active Division
                        </span>
                        <button
                          onClick={() => {
                            const text = isUrdu 
                              ? `${selectedCity.nameUrdu}۔ ضلعی کمانڈ فعال ہے۔ فعال سلاٹس: ${selectedCity.activeStalls}۔ رجسٹرڈ دکاندار: ${selectedCity.registeredVendors}۔ تعمیل: ${selectedCity.complianceRate}%۔`
                              : `${selectedCity.nameEn}. District command active. Active stalls: ${selectedCity.activeStalls}. Registered vendors: ${selectedCity.registeredVendors}. Compliance: ${selectedCity.complianceRate}%.`;
                            speechService.speak(text, { lang: isUrdu ? 'ur' : 'en' });
                          }}
                          className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-sora font-extrabold text-2xl text-white mt-2">
                        {isUrdu ? selectedCity.nameUrdu : selectedCity.nameEn}
                      </h4>
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">
                        {isUrdu ? `${selectedCity.provinceUrdu} ڈویژنل ہیڈ کوارٹر` : `${selectedCity.provinceEn} Divisional Command`}
                      </p>

                      <div className="mt-4 space-y-2.5">
                        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-urdu">مخصوص کیو آر سلاٹس:</span>
                          <span className="font-sora font-extrabold text-amber-400 text-sm">{selectedCity.activeStalls} Units</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-urdu">رجسٹرڈ ریڑھی بان:</span>
                          <span className="font-sora font-bold text-white text-xs">{selectedCity.registeredVendors} Vendors</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-urdu">سرکاری نرخ تعمیل انڈیکس:</span>
                          <span className="font-sora font-extrabold text-emerald-400 text-xs">{selectedCity.complianceRate}% Verified</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-urdu">جیو فینس رینج:</span>
                          <span className="font-mono text-slate-200 text-xs">{selectedCity.lat.toFixed(4)}° N, {selectedCity.lng.toFixed(4)}° E</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-200 font-urdu leading-relaxed">
                        {isUrdu 
                          ? 'اس ڈسٹرکٹ میں تمام ریڑھی بان بغیر بے دخلی کے قانونی کیو آر کے تحت کام کر رہے ہیں اور شکایات پر اوسط ردعمل 41 منٹ ہے۔'
                          : 'Zero unslotted evictions enforced in this district. Average grievance resolution time is under 41 minutes.'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs font-urdu">نقشے پر کسی بھی شہر پر کلک کریں</p>
                    </div>
                  )}

                  {/* Quick Select Buttons */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                      {isUrdu ? 'فوری انتخاب' : 'Quick Jump Cities'}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PAKISTAN_CITIES.slice(0, 6).map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCity(c)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                            selectedCity?.id === c.id
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {isUrdu ? c.nameUrdu : c.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view: Ops Patrols */}
            {geoTab === 'ops' && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-700/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h4 className="font-sora font-extrabold text-lg text-white">
                      {isUrdu ? 'پیرہ فیلڈ پیٹرولز اور لائیو مانیٹرنگ گرڈ' : 'Live PERA Mobile Patrols & Enforcement Units'}
                    </h4>
                  </div>
                  <span className="text-xs text-amber-400 font-bold font-mono">10 Squads Active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PATROL_POINTS.map((patrol, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-emerald-500 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white font-sora">{patrol.id.toUpperCase()}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          patrol.status === 'On Duty' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}>
                          {patrol.status}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300 font-urdu">{patrol.name}</p>
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/60 pt-1.5">
                        <span>سپیڈ: {patrol.speed}</span>
                        <span className="font-mono text-emerald-400">{patrol.lat.toFixed(4)}°, {patrol.lng.toFixed(4)}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-view: Google Satellite Embed */}
            {geoTab === 'google' && (
              <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-700/60 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-sky-400" />
                    <h4 className="font-sora font-extrabold text-base text-white">
                      {isUrdu ? 'لائیو سیٹلائٹ میپ پاکستان' : 'Live Google Satellite GIS Map'}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-urdu">ریئل ٹائم سیٹلائٹ تصاویر و جیو ٹیگنگ</span>
                </div>

                <div className="w-full h-96 rounded-2xl overflow-hidden border border-emerald-800 bg-slate-950">
                  <iframe
                    title="Live Pakistan Map"
                    src="https://maps.google.com/maps?q=Pakistan&t=k&z=6&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Sub-view: Historical Bazaar 360° Street Views */}
            {geoTab === 'street' && (
              <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-700/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-400" />
                    <h4 className="font-sora font-extrabold text-base text-white">
                      {isUrdu ? 'پاکستان کے 5 تاریخی بازاروں کا اسٹریٹ ویو' : '360° Street Views of 5 Historic Pakistani Bazaars'}
                    </h4>
                  </div>

                  {/* Bazaar Selector Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Object.entries(streetViewUrls).map(([key, bz]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedBazaar(key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedBazaar === key
                            ? 'bg-amber-400 text-emerald-950 font-black shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isUrdu ? bz.nameUrdu : bz.nameEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-96 rounded-2xl overflow-hidden border border-amber-600/40 bg-slate-950">
                  <iframe
                    title={streetViewUrls[selectedBazaar]?.nameEn || 'Bazaar Street View'}
                    src={streetViewUrls[selectedBazaar]?.url}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
                <p className="text-xs text-slate-400 font-urdu text-center">
                  {isUrdu 
                    ? 'تاریخی بازاروں میں ریڑھی بانوں کے مخصوص کیو آر زونز اور پیدل چلنے والوں کے راستوں کا جائزہ لیں'
                    : 'Inspect designated micro-geofence vending zones and pedestrian thoroughfares in historic municipal markets.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: VIDEO ROOM & UPLOAD ======================= */}
        {mainTab === 'video_room' && (
          <div className="space-y-6 animate-fadeUp">
            {/* Video Room Header */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-600/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    MULTIMEDIA THEATRE & ARCHIVE
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold hidden sm:inline">
                    • IndexedDB Local Video Persistence (Up to 800MB)
                  </span>
                </div>

                <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-white mt-1.5 flex items-center gap-2">
                  <Film className="w-6 h-6 text-amber-400" />
                  <span>{isUrdu ? 'ویڈیو بریفنگ روم و کسٹم ویڈیو اپ لوڈ' : 'Platform Video Room & Video Upload'}</span>
                </h3>
                
                <p className="text-xs text-slate-300 font-urdu mt-0.5 max-w-2xl">
                  {isUrdu 
                    ? 'کنیکٹڈ پاکستان کا 26 سیکنڈ کا ہولوگرافک فلم یا اپنی بنائی ہوئی پلیٹ فارم ویڈیو اپ لوڈ کر کے چلائیں جو براؤزر میں ہمیشہ محفوظ رہے گی۔' 
                    : 'Watch the sovereign VRF holographic presentation or upload your custom demo/walkthrough video. Persisted locally via IndexedDB.'}
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-2 bg-slate-950/90 p-1.5 rounded-2xl border border-emerald-700/50">
                <button
                  onClick={() => setCinemaMode('film')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    cinemaMode === 'film'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUrdu ? 'ہولوگرافک فلم' : 'Holo Film (26s)'}</span>
                </button>

                <button
                  onClick={() => setCinemaMode('custom_video')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    cinemaMode === 'custom_video'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isUrdu ? 'کسٹم ویڈیو' : 'Custom Video'}</span>
                </button>
              </div>
            </div>

            {/* Video Player Display Area */}
            <div className="p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-700/60 shadow-2xl space-y-4">
              {cinemaMode === 'film' ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video max-h-[460px] mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl bg-black flex items-center justify-center">
                    <canvas 
                      ref={canvasRef} 
                      width={800} 
                      height={450} 
                      className="w-full h-full object-contain"
                    />

                    {/* Overlay Live Ticker Caption */}
                    <div className="absolute bottom-4 inset-x-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/50 shadow-xl text-center">
                      <p className="text-xs sm:text-sm font-urdu font-extrabold text-amber-300 leading-relaxed animate-pulse">
                        {filmCaption}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-200"
                        style={{ width: `${filmProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Play Controls */}
                  <div className="flex items-center justify-between px-2 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsFilmPlaying(!isFilmPlaying)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        {isFilmPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isFilmPlaying ? (isUrdu ? 'روکیں' : 'Pause') : (isUrdu ? 'چلائیں' : 'Play')}</span>
                      </button>

                      <span className="text-xs text-slate-300 font-mono">
                        {Math.round(filmProgress)}% Complete
                      </span>
                    </div>

                    <p className="text-xs text-emerald-400 font-urdu font-bold">
                      وژن: فخر مشتاق • ٹیم سٹرونگر ٹوگیدر 🇵🇰
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Custom Video Playback or Upload Dropzone */}
                  {uploadedVideoUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-full aspect-video max-h-[460px] mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl bg-black">
                        <video
                          ref={videoRef}
                          src={uploadedVideoUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white font-mono">{uploadedVideoName}</span>
                          <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-urdu">
                            IndexedDB میں محفوظ
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'نئی ویڈیو بدلیں' : 'Replace Video'}</span>
                          </button>

                          <button
                            onClick={handleDeleteVideo}
                            className="text-xs font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'ویڈیو ہٹائیں' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Video Upload Dropzone */
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleVideoUpload(file);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-10 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 ${
                        isDragOver
                          ? 'border-amber-400 bg-emerald-950/40 scale-[1.01]'
                          : 'border-emerald-600/60 hover:border-emerald-400 bg-slate-950/60 hover:bg-slate-900/80'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoUpload(file);
                        }}
                      />

                      <div className="w-16 h-16 rounded-3xl bg-emerald-950 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-emerald-700 shadow-xl">
                        <Upload className="w-8 h-8" />
                      </div>

                      <h4 className="font-sora font-extrabold text-lg sm:text-xl text-white">
                        {isUrdu ? 'اپنی پلیٹ فارم ویڈیو اپ لوڈ کریں' : 'Upload Your Platform Video File'}
                      </h4>

                      <p className="text-xs text-slate-300 font-urdu mt-1.5 max-w-md mx-auto">
                        {isUrdu 
                          ? 'ویڈیو فائل (MP4, WebM, MOV) یہاں ڈریگ کریں یا کلک کر کے منتخب کریں۔ یہ براؤزر کے IndexedDB میں محفوظ ہو جائے گی۔' 
                          : 'Drag & drop your demo video here or click to browse. Max size 800MB. Persisted securely in your local IndexedDB.'}
                      </p>

                      <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700 font-mono">
                          Supports MP4 • WebM • MOV (Up to 800MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================= TAB 2: MASTER PROMPTS SUITE S1–S12 ======================= */}
        {mainTab === 'prompts' && (
          <div className="space-y-6 animate-fadeUp">
            {/* Master Prompts Header Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-600/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    S1–S12 MASTER ARCHITECTURE PROMPTS
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold hidden sm:inline">
                    • 100% One-Click Rebuild Suite
                  </span>
                </div>

                <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-white mt-1.5">
                  {isUrdu ? 'مکمل ماسٹر پرامپٹ سویٹ (S1 تا S12)' : 'Connected Pakistan VRF 2026 Master Prompt Suite'}
                </h3>
                
                <p className="text-xs text-slate-300 font-urdu mt-0.5 max-w-2xl">
                  {isUrdu 
                    ? 'یہ مکمل اور جامع پرامپٹس سویٹ کسی بھی اے آئی ماڈل یا انجینئر کے لیے سنگل فائل خود مختار گورننس سسٹم کی تعمیر نو کے تمام اصول فراہم کرتا ہے۔' 
                    : 'The complete ground-truth prompt suite envisioned by Fakhar Mushtaq. 1-click copy any section or download the entire documentation.'}
                </p>
              </div>

              {/* Action Buttons: Copy All & Downloads */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => {
                    const allText = MASTER_PROMPT_SECTIONS.map(s => `════ ${s.no}: ${s.titleEn} ════\n\n${s.content}\n\n`).join('\n');
                    copyToClipboard(allText, 'Entire Master Prompt Suite');
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'تمام پرامپٹس کاپی کریں' : 'Copy All S1–S12'}</span>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs border border-emerald-600 shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.MD</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-slate-600 shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.TXT</span>
                </button>
              </div>
            </div>

            {/* Search and Filter Row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isUrdu ? 'پرامپٹس میں تلاش کریں (جیسے: S1, AI Persona, DC Rates, QA, Architecture)...' : 'Search across prompts (e.g. S1, Persona, Architecture, QA checklist)...'}
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-400 focus:outline-none transition-colors"
                />
              </div>
              {promptSearch && (
                <button
                  onClick={() => setPromptSearch('')}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Prompt Explorer: Left Tab Nav & Right Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Sections List */}
              <div className="lg:col-span-4 space-y-2 bg-slate-950/80 p-3 rounded-3xl border border-slate-800 max-h-[600px] overflow-y-auto no-scrollbar">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isUrdu ? `پرامپٹ سیکشنز (${filteredPrompts.length})` : `Prompt Sections (${filteredPrompts.length})`}
                </div>

                {filteredPrompts.map((sec) => {
                  const isSelected = selectedPromptId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedPromptId(sec.id)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-emerald-950 border-emerald-500 shadow-md text-white'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-amber-400 text-emerald-950' : 'bg-slate-800 text-emerald-400'
                        }`}>
                          {sec.no}
                        </span>

                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                          {sec.tag}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs mt-1 text-white">
                        {sec.titleEn}
                      </h4>
                      <p className="text-[11px] text-emerald-300/80 font-urdu mt-0.5 line-clamp-1">
                        {sec.titleUrdu}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Active Prompt Viewer */}
              <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-emerald-900/60 shadow-2xl overflow-hidden flex flex-col">
                {/* Prompt Viewer Header */}
                <div className="p-4 sm:p-5 bg-emerald-950/90 border-b border-emerald-800/60 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                        {activePrompt.no}
                      </span>
                      <span className="text-xs font-bold text-emerald-300">
                        {activePrompt.tag}
                      </span>
                    </div>
                    <h3 className="font-sora font-extrabold text-base sm:text-lg text-white mt-1">
                      {activePrompt.titleEn}
                    </h3>
                    <p className="text-xs text-emerald-200 font-urdu">
                      {activePrompt.titleUrdu}
                    </p>
                  </div>

                  {/* Actions for this specific prompt */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const voiceText = isUrdu ? activePrompt.titleUrdu : activePrompt.titleEn;
                        speechService.playChime('success');
                        speechService.speak(voiceText, {
                          lang,
                          voiceGender: 'female',
                          rate: isUrdu ? 0.88 : 0.96,
                        });
                      }}
                      className="p-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 transition-colors"
                      title={isUrdu ? 'عنوان سنیں' : 'Listen to title'}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => copyToClipboard(activePrompt.content, `${activePrompt.no} — ${activePrompt.titleEn}`)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        copiedLabel === `${activePrompt.no} — ${activePrompt.titleEn}`
                          ? 'bg-amber-400 text-emerald-950 font-black'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {copiedLabel === `${activePrompt.no} — ${activePrompt.titleEn}` ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Prompt Content Terminal Body */}
                <div className="p-4 sm:p-6 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap selection:bg-emerald-500 selection:text-white">
                  {activePrompt.content}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: SYSTEM FRAMEWORK & ETHICS ======================= */}
        {mainTab === 'framework' && (
          <div className="space-y-6 animate-fadeUp">
            {/* Framework Vision Hero */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-600 shadow-2xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-900 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold border border-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{isUrdu ? 'پائیدار بلدیاتی فریم ورک و قانونی تحفظ' : 'Sovereign Civic Framework Architecture'}</span>
              </div>

              <h3 className="font-sora font-extrabold text-2xl sm:text-3xl text-white">
                {isUrdu ? 'وینڈر ریگولیشن فریم ورک (VRF 2026) کے 5 بنیادی اصول' : 'The 5 Sovereign Pillars of Connected Pakistan'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 font-urdu max-w-3xl leading-relaxed">
                "ہم بازار پر حکومت نہیں کر رہے بلکہ بازار کے ساتھ شراکت داری قائم کر رہے ہیں۔ جب ایک ریڑھی بان کی عزت میں اضافہ ہوتا ہے تو پورا شہر ترقی کرتا ہے۔" — فخر مشتاق
              </p>
            </div>

            {/* 5 Core Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Pillar 1: Citizen 100% Anonymity */}
              <div className="p-5 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold border border-emerald-700">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-sora font-extrabold text-base text-white">
                  {isUrdu ? '1. سو فیصد گمنام شہری رپورٹنگ' : '1. 100% Anonymous Citizen Vigilance'}
                </h4>
                <p className="text-xs text-slate-300 font-urdu leading-relaxed">
                  ہر عام شہری بغیر کسی خوف یا ذاتی شناخت ظاہر کیے گراں فروشی کی رپورٹ درج کر سکتا ہے۔ یہ ڈیٹا سیدھا ڈی سی کمانڈ اور فیلڈ مجسٹریٹ کو 9 منٹ کے اندر پہنچتا ہے۔
                </p>
              </div>

              {/* Pillar 2: ±3% Tolerance */}
              <div className="p-5 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center font-bold border border-emerald-700">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-sora font-extrabold text-base text-white">
                  {isUrdu ? '2. قانونی ±3% لچک و رعایت' : '2. ±3% Legal Tolerance AI Scanner'}
                </h4>
                <p className="text-xs text-slate-300 font-urdu leading-relaxed">
                  ڈی سی ریٹ پر 3 فیصد تک کی قدرتی کمی بیشی قانونی طور پر جائز تسلیم کی جاتی ہے تاکہ دکاندار کو بلاوجہ ہراساں نہ کیا جائے۔ غیر منصفانہ چالان سے پہلے تربیتی رہنمائی دی جاتی ہے۔
                </p>
              </div>

              {/* Pillar 3: Zero-Waste & MicroPay */}
              <div className="p-5 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold border border-emerald-700">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h4 className="font-sora font-extrabold text-base text-white">
                  {isUrdu ? '3. زیرو ویسٹ انعامات و مائیکرو کریڈٹ' : '3. Zero-Waste Rewards & MicroPay'}
                </h4>
                <p className="text-xs text-slate-300 font-urdu leading-relaxed">
                  اپنے اسٹال کو صاف رکھنے والے ریڑھی بانوں کو +15 پوائنٹس، مفت ویسٹ کٹس اور بلدیاتی مائیکرو کریڈٹ (850 اسکیل) ملتا ہے تاکہ وہ باوقار طریقے سے کاروبار کو بڑھا سکیں۔
                </p>
              </div>

              {/* Pillar 4: Precision 30-Zone GIS */}
              <div className="p-5 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-sky-400 flex items-center justify-center font-bold border border-emerald-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-sora font-extrabold text-base text-white">
                  {isUrdu ? '4. 30 اضلاع کا سائنسی جیو فینس' : '4. 30-District GIS Spatial Mapping'}
                </h4>
                <p className="text-xs text-slate-300 font-urdu leading-relaxed">
                  بغیر متبادل کے ریڑھی ہٹانا سختی سے ممنوع ہے۔ تمام 30 اضلاع میں مخصوص کیو آر سلاٹس تفویض کیے گئے ہیں تاکہ ٹریفک اور روزگار دونوں محفوظ رہیں۔
                </p>
              </div>

              {/* Pillar 5: Zero-Infrastructure Sovereign Static App */}
              <div className="p-5 rounded-3xl bg-slate-800/90 border border-slate-700 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center font-bold border border-emerald-700">
                  <Terminal className="w-5 h-5" />
                </div>
                <h4 className="font-sora font-extrabold text-base text-white">
                  {isUrdu ? '5. مکمل پورٹیبل خود مختار سسٹم' : '5. Zero-Server Portable Web Architecture'}
                </h4>
                <p className="text-xs text-slate-300 font-urdu leading-relaxed">
                  پورے پاکستان کے لیے یہ پلیٹ فارم ایک سنگل فائل انڈیکس کی صورت میں مکمل طور پر آزاد اور آف لائن محفوظ چلنے کی صلاحیت رکھتا ہے جس میں ڈیٹا مقامی طور پر محفوظ رہتا ہے۔
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 1-CLICK GATEWAY: GUIDED TOUR OR DIRECT LOGIN */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-emerald-600 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 text-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {isUrdu ? 'اگلا قدم: پورٹل کا تفصیلی معائنہ' : 'Step 2: Platform Experience'}
              </span>
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                • 1-Click Instant Demo
              </span>
            </div>

            <h3 className="font-sora font-extrabold text-lg sm:text-xl text-slate-900 mt-1">
              {isUrdu ? 'پلیٹ فارم کا مکمل گائیڈڈ ٹور لیں یا براہ راست داخل ہوں' : 'Take a Guided Platform Tour or Proceed to 1-Click Login'}
            </h3>
            
            <p className="text-xs text-slate-600 font-urdu mt-0.5 max-w-xl">
              {isUrdu 
                ? 'شہری، ریڑھی بان، پیرہ مجسٹریٹ یا ڈپٹی کمشنر کے طور پر تمام 5 کنسولز اور لائیو ٹولز کا فوری تجربہ کریں۔' 
                : 'Experience all 5 tailored consoles: Citizen DC rates & reports, Vendor QR slot, Inspector scanner & DC Command.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
            {onOpenGuidedTour && (
              <button
                id="btn-open-guided-tour-cinematic"
                onClick={onOpenGuidedTour}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4 text-amber-600" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'مکمل گائیڈڈ ٹور دیکھیں' : 'Take Guided Tour'}</span>
              </button>
            )}

            <button
              id="btn-cinematic-continue"
              onClick={onContinue}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-2xl font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 group"
            >
              <span className={isUrdu ? 'font-urdu text-sm' : ''}>{isUrdu ? 'لاگ ان اسکرین پر جائیں' : 'Continue to Login & Consoles'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-4 py-3.5 border-t border-slate-800 bg-slate-950 text-center z-10">
        <p className="text-xs text-slate-300 font-semibold">
          Vision of <strong className="text-emerald-400">Fakhar Mushtaq</strong> designed by <strong className="text-emerald-400">Team Stronger Together</strong>
        </p>
        <p className="text-[11px] text-slate-400 font-urdu mt-0.5">
          پاکستان زندہ باد • Vision of Fakhar Mushtaq designed by Team Stronger Together • VRF 2026
        </p>
      </footer>
    </div>
  );
};
