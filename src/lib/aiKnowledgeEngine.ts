import { DCRateItem, VendorProfile, CitizenReport } from '../types';

export interface AIResponsePayload {
  textUrdu: string;
  textEn: string;
  actionButton?: {
    labelUrdu: string;
    labelEn: string;
    actionTab?: string;
    reportItem?: string;
    reportRate?: number;
    specialAction?: 'open_map' | 'open_report' | 'open_rates' | 'open_scanner' | 'open_civic_points' | 'open_tour' | 'open_allotment';
  };
  structuredData?: {
    type: 'calculation' | 'rate_card' | 'legal_fact' | 'district_info';
    items?: Array<{ name: string; quantity?: string; dcRate: number; total: number }>;
    totalDc?: number;
    totalMarket?: number;
    totalSavings?: number;
  };
}

// 30 Major Districts of Pakistan for Geospatial Inquiries
export const PAKISTAN_DISTRICTS_DATA: Record<string, { nameUrdu: string; nameEn: string; province: string; vrfZones: number; magistrateSquads: number }> = {
  islamabad: { nameUrdu: 'اسلام آباد (کیپیٹل)', nameEn: 'Islamabad Capital Territory', province: 'ICT', vrfZones: 8, magistrateSquads: 14 },
  rawalpindi: { nameUrdu: 'راولپنڈی', nameEn: 'Rawalpindi', province: 'Punjab', vrfZones: 12, magistrateSquads: 18 },
  lahore: { nameUrdu: 'لاہور', nameEn: 'Lahore', province: 'Punjab', vrfZones: 24, magistrateSquads: 36 },
  karachi: { nameUrdu: 'کراچی', nameEn: 'Karachi (All 7 Districts)', province: 'Sindh', vrfZones: 35, magistrateSquads: 50 },
  peshawar: { nameUrdu: 'پشاور', nameEn: 'Peshawar', province: 'Khyber Pakhtunkhwa', vrfZones: 10, magistrateSquads: 15 },
  quetta: { nameUrdu: 'کوئٹہ', nameEn: 'Quetta', province: 'Balochistan', vrfZones: 7, magistrateSquads: 10 },
  faisalabad: { nameUrdu: 'فیصل آباد', nameEn: 'Faisalabad', province: 'Punjab', vrfZones: 14, magistrateSquads: 20 },
  multan: { nameUrdu: 'ملتان', nameEn: 'Multan', province: 'Punjab', vrfZones: 9, magistrateSquads: 14 },
  gujranwala: { nameUrdu: 'گوجرانوالہ', nameEn: 'Gujranwala', province: 'Punjab', vrfZones: 8, magistrateSquads: 12 },
  sialkot: { nameUrdu: 'سیالکوٹ', nameEn: 'Sialkot', province: 'Punjab', vrfZones: 6, magistrateSquads: 10 },
  hyderabad: { nameUrdu: 'حیدرآباد', nameEn: 'Hyderabad', province: 'Sindh', vrfZones: 8, magistrateSquads: 12 },
  sukkur: { nameUrdu: 'سکھر', nameEn: 'Sukkur', province: 'Sindh', vrfZones: 5, magistrateSquads: 8 },
  abbottabad: { nameUrdu: 'ایبٹ آباد', nameEn: 'Abbottabad', province: 'Khyber Pakhtunkhwa', vrfZones: 4, magistrateSquads: 7 },
  bahawalpur: { nameUrdu: 'بہاولپور', nameEn: 'Bahawalpur', province: 'Punjab', vrfZones: 6, magistrateSquads: 9 },
  sargodha: { nameUrdu: 'سرگودھا', nameEn: 'Sargodha', province: 'Punjab', vrfZones: 5, magistrateSquads: 8 },
  muzaffarabad: { nameUrdu: 'مظفرآباد', nameEn: 'Muzaffarabad', province: 'Azad Kashmir', vrfZones: 4, magistrateSquads: 6 },
  gilgit: { nameUrdu: 'گلگت', nameEn: 'Gilgit', province: 'Gilgit-Baltistan', vrfZones: 3, magistrateSquads: 5 },
  skardu: { nameUrdu: 'سکردو', nameEn: 'Skardu', province: 'Gilgit-Baltistan', vrfZones: 3, magistrateSquads: 4 },
  gwadar: { nameUrdu: 'گوادر', nameEn: 'Gwadar', province: 'Balochistan', vrfZones: 3, magistrateSquads: 5 },
  mardan: { nameUrdu: 'مردان', nameEn: 'Mardan', province: 'Khyber Pakhtunkhwa', vrfZones: 5, magistrateSquads: 8 },
  swat: { nameUrdu: 'سوات (مینگورہ)', nameEn: 'Swat (Mingora)', province: 'Khyber Pakhtunkhwa', vrfZones: 4, magistrateSquads: 6 },
  sahiwal: { nameUrdu: 'ساہیوال', nameEn: 'Sahiwal', province: 'Punjab', vrfZones: 4, magistrateSquads: 7 },
  kasur: { nameUrdu: 'قصور', nameEn: 'Kasur', province: 'Punjab', vrfZones: 4, magistrateSquads: 6 },
  gujrat: { nameUrdu: 'گجرات', nameEn: 'Gujrat', province: 'Punjab', vrfZones: 5, magistrateSquads: 8 },
  sheikhupura: { nameUrdu: 'شیخوپورہ', nameEn: 'Sheikhupura', province: 'Punjab', vrfZones: 5, magistrateSquads: 7 },
  jhang: { nameUrdu: 'جھنگ', nameEn: 'Jhang', province: 'Punjab', vrfZones: 4, magistrateSquads: 6 },
  rahimyarkhan: { nameUrdu: 'رحیم یار خان', nameEn: 'Rahim Yar Khan', province: 'Punjab', vrfZones: 5, magistrateSquads: 8 },
  deraghazikhan: { nameUrdu: 'ڈیرہ غازی خان', nameEn: 'Dera Ghazi Khan', province: 'Punjab', vrfZones: 4, magistrateSquads: 6 },
  larkana: { nameUrdu: 'لاڑکانہ', nameEn: 'Larkana', province: 'Sindh', vrfZones: 5, magistrateSquads: 7 },
  mirpur: { nameUrdu: 'میرپور (اے جے کے)', nameEn: 'Mirpur', province: 'Azad Kashmir', vrfZones: 4, magistrateSquads: 6 },
};

/**
 * Parses numbers and items for mathematical bill calculation
 */
function tryParseMathCalculation(query: string, dcRates: DCRateItem[]): AIResponsePayload | null {
  const q = query.toLowerCase();
  
  // Look for calculation keywords
  const mathKeywords = ['calculate', 'hisaab', 'hisab', 'total', 'bill', 'kharacha', 'kharcha', 'cost', 'kitna banega', 'kitne bane', 'how much for', 'sum', 'jama', 'plus', 'estimate'];
  const hasMathKeyword = mathKeywords.some(k => q.includes(k));
  
  // Also check if multiple quantities and items are mentioned
  const quantityMatches = q.match(/(\d+(?:\.\d+)?)\s*(kg|kilo|gram|g|dozen|darjan|liter|litre|l|packets?|bori|packet)?\s*([a-zA-Z\u0600-\u06FF]+)/g);
  
  if (!hasMathKeyword && (!quantityMatches || quantityMatches.length < 1)) {
    return null;
  }

  // Find commodities mentioned in the query
  const calculatedItems: Array<{ name: string; quantityStr: string; qty: number; unit: string; dcRate: number; marketRate: number; itemTotalDc: number; itemTotalMarket: number }> = [];

  dcRates.forEach(rate => {
    const names = [rate.nameEn.toLowerCase(), rate.nameUrdu, ...(getItemAliases(rate.id))];
    for (const name of names) {
      if (q.includes(name)) {
        // Look for quantity preceding or succeeding this item name
        const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(kg|kilo|gram|g|darjan|dozen|l|liter|litre|packet)?\\s*${name}`, 'i');
        const regexPost = new RegExp(`${name}\\s*(\\d+(?:\\.\\d+)?)\\s*(kg|kilo|gram|g|darjan|dozen|l|liter|litre|packet)?`, 'i');
        
        let qty = 1;
        let unit = rate.unitEn;
        
        const m1 = q.match(regex);
        const m2 = q.match(regexPost);
        
        if (m1 && m1[1]) {
          qty = parseFloat(m1[1]);
          if (m1[2] && (m1[2] === 'g' || m1[2] === 'gram')) qty = qty / 1000;
        } else if (m2 && m2[1]) {
          qty = parseFloat(m2[1]);
          if (m2[2] && (m2[2] === 'g' || m2[2] === 'gram')) qty = qty / 1000;
        }

        // Avoid duplicate additions
        if (!calculatedItems.some(ci => ci.name === rate.nameEn)) {
          const itemTotalDc = Math.round(rate.dcRate * qty);
          const itemTotalMarket = Math.round(rate.marketAvg * qty);
          calculatedItems.push({
            name: rate.nameEn,
            quantityStr: `${qty} ${rate.unitEn}`,
            qty,
            unit: rate.unitEn,
            dcRate: rate.dcRate,
            marketRate: rate.marketAvg,
            itemTotalDc,
            itemTotalMarket,
          });
        }
        break;
      }
    }
  });

  if (calculatedItems.length === 0) {
    return null;
  }

  const totalDc = calculatedItems.reduce((acc, curr) => acc + curr.itemTotalDc, 0);
  const totalMarket = calculatedItems.reduce((acc, curr) => acc + curr.itemTotalMarket, 0);
  const totalSavings = Math.max(0, totalMarket - totalDc);
  const savingsPct = totalMarket > 0 ? Math.round((totalSavings / totalMarket) * 100) : 0;

  const itemBreakdownUrdu = calculatedItems
    .map(i => `• ${i.name} (${i.quantityStr}): سرکاری ریٹ Rs. ${i.dcRate} = Rs. ${i.itemTotalDc.toLocaleString()} (کھلی مارکیٹ: Rs. ${i.itemTotalMarket.toLocaleString()})`)
    .join('\n');

  const itemBreakdownEn = calculatedItems
    .map(i => `• ${i.name} (${i.quantityStr}): Official DC Rate Rs. ${i.dcRate} = Rs. ${i.itemTotalDc.toLocaleString()} (Market: Rs. ${i.itemTotalMarket.toLocaleString()})`)
    .join('\n');

  const textUrdu = `🧾 باضابطہ ڈی سی راشن و اخراجات کا مصدقہ حساب (Official DC Bill Estimate):\n\n${itemBreakdownUrdu}\n\n━━━━━━━━━━━━━━━━━━━━━\n💰 کل سرکاری ڈی سی بل: Rs. ${totalDc.toLocaleString()}\n🏬 کھلی مارکیٹ کا اوسط بل: Rs. ${totalMarket.toLocaleString()}\n✨ وی آر ایف تحفظ کے تحت آپ کی بچت: Rs. ${totalSavings.toLocaleString()} (${savingsPct}% بچت)\n\nقانون کے مطابق دکاندار صرف سرکاری ڈی سی ریٹ وصول کرنے کا پابند ہے۔ اگر کوئی زائد رقم مانگے تو فوری 100% گمنام رپورٹ درج کریں۔`;

  const textEn = `🧾 Verified Official DC Price & Grocery Calculation:\n\n${itemBreakdownEn}\n\n━━━━━━━━━━━━━━━━━━━━━\n💰 Total at Official DC Rates: Rs. ${totalDc.toLocaleString()}\n🏬 Open Market Equivalent: Rs. ${totalMarket.toLocaleString()}\n✨ Citizen Savings under VRF Protection: Rs. ${totalSavings.toLocaleString()} (${savingsPct}% saved)\n\nVendors are legally bound to sell at or below DC price ceilings. If any vendor attempts to overcharge, submit an instant anonymous report.`;

  return {
    textUrdu,
    textEn,
    actionButton: {
      labelUrdu: '🚨 کسی بھی جنس کی فوری رپورٹ درج کریں',
      labelEn: '🚨 Report Price Overcharging',
      actionTab: 'report',
      specialAction: 'open_report'
    },
    structuredData: {
      type: 'calculation',
      items: calculatedItems.map(ci => ({ name: ci.name, quantity: ci.quantityStr, dcRate: ci.dcRate, total: ci.itemTotalDc })),
      totalDc,
      totalMarket,
      totalSavings,
    }
  };
}

function getItemAliases(id: string): string[] {
  const aliases: Record<string, string[]> = {
    'rate-1': ['atta', 'flour', 'aata', 'gandum', 'aate', 'flours'],
    'rate-2': ['sugar', 'cheeni', 'chini', 'shakar', 'khand'],
    'rate-3': ['rice', 'chawal', 'basmati', 'saila', 'chawlan'],
    'rate-4': ['oil', 'ghee', 'cooking oil', 'tel', 'banaspati', 'dalda'],
    'rate-5': ['onion', 'pyaz', 'piyaz', 'pyaaz', 'kanda', 'vasal'],
    'rate-6': ['tomato', 'tamatar', 'tmatar', 'tamater'],
    'rate-7': ['potato', 'aloo', 'alu', 'batata'],
    'rate-8': ['milk', 'doodh', 'dodh', 'sheer'],
    'rate-9': ['egg', 'eggs', 'anday', 'ande', 'anda'],
    'rate-10': ['chicken', 'murghi', 'kukkad', 'broiler', 'poultry', 'chicken meat'],
    'rate-11': ['beef', 'bada gosht', 'cow meat', 'bada', 'gosht', 'gaye'],
    'rate-12': ['dal', 'daal', 'chana', 'pulses', 'mong', 'mash', 'lentils', 'masoor'],
    'rate-13': ['mutton', 'chota gosht', 'bakra', 'sheep meat', 'chhota gosht'],
    'rate-14': ['bread', 'double roti', 'roti', 'nan', 'naan', 'kulcha'],
  };
  return aliases[id] || [];
}

/**
 * Ultra-Intelligent Question-Answering Core Engine
 */
export function queryAIKnowledgeEngine(
  query: string,
  dcRates: DCRateItem[] = [],
  vendors: VendorProfile[] = [],
  reports: CitizenReport[] = []
): AIResponsePayload {
  const q = query.toLowerCase().trim();

  // 0. Check for Mathematical / Budget Calculation First
  const mathResult = tryParseMathCalculation(query, dcRates);
  if (mathResult) return mathResult;

  // 1. Distress, Overcharging, Loot, Empathy Detection
  const distressKeywords = ['pareshan', 'madad', 'help', 'zulm', 'loot', 'overcharging', 'loot rahe', 'giran faroshi', 'emergency', 'shikayat', 'zyadati', 'ziadti', 'tang', 'mehenga', 'mehnga', 'dhooka', 'dhoka', 'badtameezi', 'zabardasti', 'chor', 'fight', 'chalan'];
  if (distressKeywords.some(k => q.includes(k))) {
    return {
      textUrdu: 'محترم شہری بھائی / بہن! آپ بالکل پریشان نہ ہوں، ریاست اور یہ نظام ہر قدم پر آپ کے ساتھ ہے۔\n\nکسی دکاندار کو یہ حق حاصل نہیں کہ وہ آپ کی محنت کی حلال کمائی پر ناجائز منافع کمائے یا طے شدہ سرکاری ریٹ سے زائد طلب کرے۔\n\nآپ نیچے دیئے گئے بٹن پر کلک کر کے فوری طور پر 100 فیصد محفوظ اور گمنام رپورٹ درج کر سکتے ہیں۔ ہماری پرائس مجسٹریٹ پیٹرول وین اوسطاً 9 سے 41 منٹ کے اندر متعلقہ مارکیٹ پہنچ کر سرکاری ریٹ نافذ کروائے گی اور دکاندار کو آپ کا نام یا فون نمبر ہرگز نہیں بتایا جائے گا۔',
      textEn: 'Dear respected citizen! Please do not worry at all—the entire constitutional framework stands firmly with you.\n\nNo vendor has the legal right to exploit your hard-earned income or demand prices exceeding the regulated DC price ceiling. You can instantly submit a 100% encrypted, completely anonymous report. Our nearest Price Magistrate patrol squad dispatches with an average 9 to 41-minute response time to enforce justice on the ground without revealing your identity.',
      actionButton: {
        labelUrdu: '🚨 فوری 100% گمنام رپورٹ درج کریں (9 تا 41 منٹ رسپانس)',
        labelEn: '🚨 Submit 100% Anonymous Report Now',
        actionTab: 'report',
        specialAction: 'open_report'
      }
    };
  }

  // 2. DC Rates Matching & Price Commodity Lookup
  for (const item of dcRates) {
    const aliases = getItemAliases(item.id);
    const names = [item.nameEn.toLowerCase(), item.nameUrdu.toLowerCase(), ...aliases];
    
    if (names.some(name => q.includes(name))) {
      return {
        textUrdu: `محترم شہری! آج کے مصدقہ سرکاری ڈی سی ریٹ لسٹ (Deputy Commissioner Gazette) کے مطابق:\n\n• جنس: ${item.nameUrdu} (${item.nameEn})\n• سرکاری مقررہ نرخ: Rs. ${item.dcRate} فی ${item.unitUrdu}\n• کھلی مارکیٹ اوسط: Rs. ${item.marketAvg} فی ${item.unitUrdu}\n• مارکیٹ فرق: ${item.deviationPct}%\n\nقانون کے تحت تمام ریڑھی بان اور دکاندار اس ریٹ کی پابندی کرنے کے پابند ہیں۔ اگر کوئی دکاندار Rs. ${item.dcRate} سے زائد طلب کرے تو یہ قانوناً جرم ہے۔`,
        textEn: `According to today's official Deputy Commissioner (DC) Gazette Rate Sheet:\n\n• Commodity: ${item.nameEn} (${item.nameUrdu})\n• Regulated Ceiling Price: Rs. ${item.dcRate} per ${item.unitEn}\n• Open Market Average: Rs. ${item.marketAvg}\n• Price Variance: ${item.deviationPct}%\n\nUnder VRF Act 2026, selling above this ceiling is an actionable offense. Click below to view the official rate sheet or report non-compliance.`,
        actionButton: {
          labelUrdu: `اس جنس (${item.nameUrdu}) کی خلاف ورزی رپورٹ کریں`,
          labelEn: `Report Overcharging on ${item.nameEn}`,
          actionTab: 'report',
          reportItem: item.nameUrdu,
          reportRate: item.dcRate,
          specialAction: 'open_report'
        },
        structuredData: {
          type: 'rate_card',
          items: [{ name: item.nameEn, dcRate: item.dcRate, total: item.dcRate }]
        }
      };
    }
  }

  // 3. District / City Geospatial Inquiries (All 30 Districts)
  for (const [key, d] of Object.entries(PAKISTAN_DISTRICTS_DATA)) {
    if (q.includes(key) || q.includes(d.nameEn.toLowerCase()) || q.includes(d.nameUrdu)) {
      return {
        textUrdu: `📍 ضلع ${d.nameUrdu} (${d.province}) میں کنیکٹڈ پاکستان مائیکرو ریڈار کوریج:\n\n• صوبائی ڈومین: ${d.province}\n• نامزد مائیکرو وی آر ایف زونز: ${d.vrfZones} تصدیق شدہ زونز\n• لائیو پیٹرولنگ مجسٹریٹ اسکواڈز: ${d.magistrateSquads} گاڑیاں اور اہلکار\n• ریپڈ رسپانس اوسط: 9 تا 22 منٹ\n• ریڑھی بانوں کے لیے جیو فینس سلاٹس: 100% ڈیجیٹل رجسٹرڈ\n\nآپ ہمارے 30 اضلاع پر مشتمل نیشنل جیو اسپیشل میپ پر اپنے ضلع کے لائیو ایکٹو زونز اور نرخ نامے کا جائزہ لے سکتے ہیں۔`,
        textEn: `📍 District ${d.nameEn} (${d.province}) Geospatial Coverage:\n\n• Province: ${d.province}\n• Designated Micro VRF Zones: ${d.vrfZones} active municipal sectors\n• Price Magistrate Patrol Squads: ${d.magistrateSquads} rapid units deployed\n• Average Citizen Response Time: 9 to 22 minutes\n• Geofenced Vendor Footprints: 100% digital QR allotment\n\nYou can inspect live vendor slots and patrol routes on our 30-District National Geospatial Map.`,
        actionButton: {
          labelUrdu: `🗺️ ${d.nameUrdu} کا قومی نقشہ و زونز کھولیں`,
          labelEn: `🗺️ Open ${d.nameEn} on National Map`,
          actionTab: 'heatmap',
          specialAction: 'open_map'
        }
      };
    }
  }

  // 4. Geofence, Slot Allotment & GPS Footprint
  if (q.includes('geofence') || q.includes('boundary') || q.includes('hudood') || q.includes('location') || q.includes('slot') || q.includes('footprint') || q.includes('space') || q.includes('naqsha') || q.includes('map') || q.includes('jagah') || q.includes('allotment') || q.includes('bazaar')) {
    return {
      textUrdu: 'محترم شہری و دکاندار! جیو فینس اور سلاٹ الاٹمنٹ کے قانونی ضوابط:\n\n۱. معیاری سلاٹ سائز: ہر رجسٹرڈ ریڑھی بان کو میونسپل حدود میں 6×4 فٹ (24 مربع فٹ) کی باقاعدہ جی پی ایس سلاٹ الاٹ کی جاتی ہے۔\n۲. واک وے بفر: پیدل چلنے والے شہریوں، بزرگوں اور خواتین کے لیے کم از کم 5.2 فٹ کا راستہ صاف رکھنا لازمی ہے۔\n۳. لائیو سیٹلائٹ باؤنڈری: دکاندار کی سیٹلائٹ لوکیشن اس کے کیو آر لائسنس سے جڑی ہوتی ہے، جس سے ٹریفک جام سے نجات ملتی ہے اور دکاندار کو ناجائز بے دخلی سے 100% قانونی تحفظ ملتا ہے۔',
      textEn: 'Official Geofence & Spatial Slot Allocation Regulations (VRF Act 2026):\n\n1. Standard Stall Footprint: Every registered street vendor receives an exact 6x4 ft (24 sq. ft) GPS-coordinated spatial slot.\n2. Pedestrian Walkway Buffer: A strict 5.2 ft buffer must remain unencroached at all times for pedestrians.\n3. Anti-Eviction Satellite Lock: The GPS boundary is locked to the digital QR license, eliminating street congestion while guaranteeing vendors zero arbitrary eviction.',
      actionButton: {
        labelUrdu: '🗺️ سٹی سلاٹس ریڈار نقشہ معائنہ کریں',
        labelEn: '🗺️ Inspect City Slots Radar Map',
        actionTab: 'vendor_geofence',
        specialAction: 'open_map'
      }
    };
  }

  // 5. Vendor Dignity, Anti-Eviction Shield & Legal Rights (Section 14-2)
  if (q.includes('license') || q.includes('qr') || q.includes('dignity') || q.includes('rule') || q.includes('waqar') || q.includes('tahaffuz') || q.includes('eviction') || q.includes('bedakhli') || q.includes('rights') || q.includes('haq') || q.includes('police') || q.includes('rishwat') || q.includes('law') || q.includes('qanoon')) {
    return {
      textUrdu: 'وی آر ایف 2026 قانون محنت کش ریڑھی بانوں کے لیے باوقار تحفظ کی ضمانت ہے:\n\n۱. مفت ڈیجیٹل کیو آر لائسنس: کوئی رشوت، پرچی یا ناجائز فیس نہیں، تمام رجسٹریشن شناختی کارڈ کے ذریعے 100% مفت اور شفاف ہے۔\n۲. زیرو بے دخلی گارنٹی (سیکشن 14-2): جب تک دکاندار اپنے 6×4 فٹ سلاٹ اور سرکاری نرخوں کی پاسداری کرتا ہے، کسی بھی اہلکار کو بلاجواز سامان ضبط کرنے یا ہراساں کرنے کا کوئی اختیار نہیں۔\n۳. 8 گھنٹے منصفانہ شفٹ: ایک ہی جگہ دو دکاندار باری باری استعمال کر کے باعزت روزگار کما سکتے ہیں۔\n۴. گرین پارٹنر فوائد: 7.0 سے زائد اسکور پر بلا سود مائیکرو فنانس قرضے اور میونسپل صفائی کی ترجیحی سہولیات میسر ہیں۔',
      textEn: 'Under the National VRF Act 2026, street vendors are protected business partners:\n\n1. 100% Free Digital QR Licensing: Zero bribery, completely digitized registration via CNIC.\n2. Zero Arbitrary Evictions (Section 14-2): Absolute legal immunity from harassment as long as the vendor stays within their 6x4 ft footprint and complies with DC ceiling rates.\n3. 8-Hour Fair Rotations: Fair shared-space allocation doubling economic opportunity.\n4. Green Tier Benefits: High trust scores unlock 0% interest micro-credit and municipal waste support.',
      actionButton: {
        labelUrdu: '🏪 دکاندار کنسول و کیو آر بیج اسٹوڈیو',
        labelEn: '🏪 Open Vendor Console & QR Studio',
        actionTab: 'vendor_dashboard',
        specialAction: 'open_scanner'
      }
    };
  }

  // 6. Citizen Points & Rewards System
  if (q.includes('civic point') || q.includes('points') || q.includes('reward') || q.includes('inam') || q.includes('score') || q.includes('citizen points') || q.includes('discount')) {
    return {
      textUrdu: 'شہری انعامی پوائنٹس و رعایت اسکیم (Civic Rewards):\n\n• تصدیق شدہ گراں فروشی رپورٹ پر: +25 شہری پوائنٹس ملتے ہیں۔\n• گرین دکانداروں سے خریداری کرنے اور کیو آر اسکین کرنے پر: +10 پوائنٹس روزانہ۔\n• انعامات: جمع شدہ پوائنٹس یوٹیلیٹی اسٹورز پر خصوصی ڈسکاؤنٹ واؤچرز، مفت میونسپل سرٹیفکیٹس اور سالانہ ایوارڈز میں تبدیل کیے جا سکتے ہیں۔\n• ہمارا نصب العین: بیدار شہری، منصفانہ مارکیٹ، مضبوط پاکستان!',
      textEn: 'Citizen Civic Points & Rewards Framework:\n\n• Submitting a verified price violation report: Earns +25 Civic Points.\n• Purchasing from Green Tier certified vendors via QR scanning: Earns +10 points daily.\n• Redemptions: Convert points into Utility Store discount vouchers, municipal service waivers, and Civic Hero badges.\n• Motto: Conscious Citizens, Fair Markets, Prosperous Pakistan!',
      actionButton: {
        labelUrdu: '⭐ میرے شہری پوائنٹس اور انعامات دیکھیں',
        labelEn: '⭐ View My Civic Points & Rewards',
        actionTab: 'civic_points',
        specialAction: 'open_civic_points'
      }
    };
  }

  // 7. Municipal Cleanliness, Zero-Waste Mission
  if (q.includes('waste') || q.includes('safai') || q.includes('kachra') || q.includes('dustbin') || q.includes('clean') || q.includes('environment')) {
    return {
      textUrdu: 'زیرو ویسٹ انعامی اسکیم و ماحولیاتی مشن:\n\n• ریڑھی کے اردگرد صفائی رکھنے اور کچرا ڈسٹ بن میں ڈالنے پر دکاندار کو روزانہ +15 ویسٹ پوائنٹس ملتے ہیں۔\n• 100 پوائنٹس مکمل کرنے پر میونسپل کارپوریشن کی جانب سے مفت صفائی کٹ اور تصدیق شدہ "گرین اسٹال" کا سائن بورڈ تحفتاً ملتا ہے۔\n• صفائی نصف ایمان ہے اور صاف ستھری دکان سے گاہکوں کا اعتماد اور رزق میں برکت بڑھتی ہے۔',
      textEn: 'Zero-Waste Municipal Cleanliness Rewards Program:\n\n• Maintaining a clean stall perimeter with standard waste bins earns vendors +15 waste points daily.\n• Reaching 100 points unlocks a municipal sanitation kit and an official Green Signboard.\n• Cleanliness fosters customer loyalty, hygiene, and community pride.',
    };
  }

  // 8. Vision by Fakhar Mushtaq & Team Stronger Together
  if (q.includes('vision') || q.includes('fakhar') || q.includes('mushtaq') || q.includes('creator') || q.includes('author') || q.includes('team') || q.includes('stronger together') || q.includes('kis ne banaya')) {
    return {
      textUrdu: 'کنیکٹڈ پاکستان کا باوقار وژن:\n\nیہ انقلابی فریم ورک فخر مشتاق (Fakhar Mushtaq) کے بصیرت افروز وژن اور "ٹیم اسٹرانگر ٹوگیدر" (عائشہ ملک، زینب فاطمہ، مریم نور، اور ثناء رحمان) کی انتھک محنت کا ثمر ہے۔\n\nاس کا مقصد جدید ڈیجیٹل ٹیکنالوجی کے ذریعے عام پاکستانی شہری کو مہنگائی و گراں فروشی سے نجات دلانا اور غریب محنت کش ریڑھی بان کو باعزت، خوددار اور قانونی روزگار فراہم کرنا ہے تاکہ ہمارا پیارا پاکستان ترقی اور انصاف کا گہوارہ بنے۔',
      textEn: 'Connected Pakistan is a Vision by Fakhar Mushtaq, Engineered with Team Stronger Together:\n\nA transformative socio-civic operating system architected to eliminate price exploitation for everyday citizens while restoring dignity, legal protection, and prosperity to hard-working street vendors across Pakistan.',
      actionButton: {
        labelUrdu: '🎬 وژن و تعارفی ٹور دیکھیں',
        labelEn: '🎬 Watch Leadership & Vision Tour',
        specialAction: 'open_tour'
      }
    };
  }

  // 9. Inflation, Economy, and General Knowledge
  if (q.includes('inflation') || q.includes('mehngai') || q.includes('ramadan') || q.includes('price rise') || q.includes('economy') || q.includes('hoarding') || q.includes('zakhira')) {
    return {
      textUrdu: 'مہنگائی اور ذخیرہ اندوزی کے خلاف قانونی مؤقف:\n\n• ذخیرہ اندوزی (Hoarding) پاکستان کے پرائس کنٹرول اینڈ پریوینشن آف پرافٹیئرنگ ایکٹ کے تحت سنگین قابل دست اندازیِ پولیس جرم ہے۔\n• اشیائے ضروریہ پر غیر قانونی منافع خوری کے خلاف ضلعی انتظامیہ روزانہ کی بنیاد پر تھوک منڈیوں کے تجزیے سے منصفانہ سرکاری نرخ مقرر کرتی ہے۔\n• جب شہری فوری رپورٹ کرتے ہیں تو مصنوعی مہنگائی کے مافیاز کو قابو پانے میں انتظامیہ کو مدد ملتی ہے۔',
      textEn: 'Legal Position on Inflation & Artificial Hoarding in Pakistan:\n\n• Artificial hoarding is a criminal offense under the Price Control and Prevention of Profiteering and Hoarding Act.\n• The District Administration sets daily ceiling rates by analyzing wholesale supply chain auctions to protect families from price gouging.\n• Immediate citizen reporting empowers magistrates to shut down black-market markups.',
      actionButton: {
        labelUrdu: '🌾 آج کے مکمل سرکاری نرخ دیکھیں',
        labelEn: '🌾 View Full DC Rate Gazette',
        actionTab: 'rates',
        specialAction: 'open_rates'
      }
    };
  }

  // 10. Greetings and Polite Conversation
  if (q.includes('salam') || q.includes('hello') || q.includes('hi') || q.includes('kaise') || q.includes('kya hal') || q.includes('shukriya') || q.includes('thanks')) {
    return {
      textUrdu: 'وعلیکم السلام و رحمتہ اللہ و برکاتہ! اللہ تعالیٰ آپ کو صحت، تندرستی اور دونوں جہانوں کی بھلائیاں عطا فرمائے۔\n\nمیں آپ کی خدمت کے لیے حاضر ہوں۔ آپ مجھ سے راشن اور اشیاء کے سرکاری ریٹس کا حساب، گراں فروشی کی گمنام رپورٹ، دکاندار کے کیو آر کوڈ کی تصدیق یا کسی بھی قانونی و انتظامی مسئلے پر سوال پوچھ سکتے ہیں۔',
      textEn: 'Wa Alaikum Assalam wa Rahmatullah! May Allah bless you with peace and prosperity.\n\nI am at your service. Feel free to ask about official DC ceiling prices, grocery budget calculations, anonymous reporting, vendor spatial slots, or legal rights under VRF Act 2026.',
    };
  }

  // 11. Intelligent General Fallback with Comprehensive Support
  return {
    textUrdu: `محترم شہری بھائی / بہن! آپ کے سوال "${query}" کے تناظر میں:\n\nآپ اس پلیٹ فارم پر درج ذیل تمام امور کے متعلق رہنمائی اور فوری حساب کتاب حاصل کر سکتے ہیں:\n۱. روزانہ کے سرکاری ڈی سی ریٹس (مثلاً: "2 کلو آٹا اور 1 کلو چینی کا بل؟")\n۲. گراں فروشی کی 100% محفوظ اور گمنام رپورٹ درج کرنا\n۳. ریڑھی بانوں کے قانونی حقوق (سیکشن 14-2 اور زیرو بے دخلی گارنٹی)\n۴. 6×4 فٹ جیو فینس سلاٹ اور کیو آر لائسنس کی تصدیق\n۵. شہری انعامی پوائنٹس اور ڈسکاؤنٹ واؤچرز\n\nفرمائیے میں آپ کی مزید کس طرح مدد کروں؟`,
    textEn: `Regarding your inquiry "${query}":\n\nYou can ask about:\n1. Daily DC Rates & grocery budget calculations (e.g. "Calculate 5kg flour + 2kg sugar")\n2. Submitting 100% anonymous overpricing complaints (average 9-41 min response)\n3. Street vendor constitutional protections (Section 14-2 & anti-eviction shield)\n4. 6x4 ft geofenced slots and QR license verification\n5. Citizen Civic Points & redemptions\n\nHow may I further assist you today?`,
    actionButton: {
      labelUrdu: '🌾 سرکاری ڈی سی ریٹس لسٹ دیکھیں',
      labelEn: '🌾 Browse Official DC Rates Sheet',
      actionTab: 'rates',
      specialAction: 'open_rates'
    }
  };
}
