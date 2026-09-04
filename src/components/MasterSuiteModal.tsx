import React, { useState } from 'react';
import { 
  FileText, Copy, Printer, Download, Sparkles, 
  Check, X, ChevronRight, Layers, ShieldCheck, 
  Share2, Terminal, Code, BookOpen
} from 'lucide-react';
import { Language } from '../types';
import { Emblem } from './Emblem';
import { BrandLogo } from './BrandLogo';

interface MasterSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const MasterSuiteModal: React.FC<MasterSuiteModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isUrdu = lang === 'ur';
  const [activeTab, setActiveTab] = useState<string>('s1');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    showToast(`${label} copied to clipboard ✓`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const sections = [
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

5. AI GUIDE (deep focus) — floating bilingual panel per S2 and S9: Urdu-first bubbles with secondary language smaller; speak ONLY on tap; male/female soft voices; instant language switching; quick chips; empathy protocol with one-tap action buttons; answers grounded strictly in live platform records; flood-limited.

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

IDENTITY: You are the AI Guide of Connected Pakistan — a respectful, warm public servant inside the platform. You serve literate and non-literate users equally. You always protect dignity: coaching before penalty, partnership before coercion.

LANGUAGE RULES (strict):
1. Default language order is URDU FIRST, English second, unless the user switches to English-first (chat header buttons, topbar toggle, or Align modal preference).
2. Every bubble renders the primary language full-size and the secondary language smaller beneath it.
3. Quick chips include both scripts; voice reads the primary language first when a Urdu TTS voice exists, otherwise English only.
4. Never auto-play audio. Speech happens ONLY when the user taps a speak button or enables the voice toggle.

GROUNDING (strict): Answer ONLY from live platform records (DC rates, reports, zones, KPIs, citations, feeds). Never invent numbers, names or events. If unknown, say so politely in both languages and suggest closest answerable topics.

EMPATHY PROTOCOL: If the user expresses distress (cheat, overcharged, angry, scared, upset, fraud, or Urdu equivalents), FIRST validate feelings in one warm bilingual sentence, THEN offer the anonymous Report Engine with a one-tap action button, and mention average resolution 41 minutes.

ACTIONS: When guidance ends in a destination (report, my reports, rates, dispatch), attach a one-tap action button that navigates there.

VOICE: Two selectable soft voices (male/female). Prefer ur-PK Urdu TTS when available; pitch female 1.06 / male 0.95; rate about 0.95; split long text on sentence boundaries.

PRIVACY and SAFETY: Citizen reports are anonymous; never ask for CNIC in chat; never store chat content; flood-limit at 4 messages per 3 seconds with a polite bilingual notice; escape all rendered text.`
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

  const handleDownloadMarkdown = () => {
    let md = `# Connected Pakistan — VRF 2026 • Master Rebuild Prompt Suite\n\n> Version 2026.08.19 • Vision: Fakhar Mushtaq • Team Stronger-Together\n> One-click rebuild kit for Qoder / Qwen / any AI builder. Urdu-first + English.\n\n`;
    sections.forEach(s => {
      md += `## ${s.no} — ${s.titleEn}\n\n\`\`\`\n${s.content}\n\`\`\`\n\n`;
    });
    md += `---\nVision by Fakhar Mushtaq • Build with Team Stronger Together • Pakistan Zindabad 🇵🇰\n`;
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Connected-Pakistan_VRF2026_Master-Prompt-Suite.md';
    a.click();
    showToast('Markdown downloaded ⬇');
  };

  const handleDownloadTxt = () => {
    let txt = `CONNECTED PAKISTAN — VRF 2026 • MASTER REBUILD PROMPT SUITE (v2026.08.19)\nVision: Fakhar Mushtaq • Team Stronger Together\n\n`;
    sections.forEach(s => {
      txt += `════ ${s.no} — ${s.titleEn} ════\n\n${s.content}\n\n`;
    });
    txt += `\nVision by Fakhar Mushtaq • Build with Team Stronger Together • Pakistan Zindabad 🇵🇰\n`;

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Connected-Pakistan_VRF2026_Master-Prompt-Suite.txt';
    a.click();
    showToast('TXT downloaded ⬇');
  };

  const handlePrintPDF = () => {
    showToast('Opening print dialog — select "Save as PDF" 🖨');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleCopyAll = () => {
    let full = `CONNECTED PAKISTAN — VRF 2026 • MASTER REBUILD PROMPT SUITE (v2026.08.19)\nVision: Fakhar Mushtaq • Team Stronger Together\n\n`;
    sections.forEach(s => {
      full += `════ ${s.no} — ${s.titleEn} ════\n\n${s.content}\n\n`;
    });
    full += `\nVision by Fakhar Mushtaq • Build with Team Stronger Together • Pakistan Zindabad 🇵🇰\n`;
    copyText(full, 'Entire Master Suite');
  };

  const activeSection = sections.find(s => s.id === activeTab) || sections[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FCFAF3] text-[#132A21] rounded-3xl border-2 border-[#E3A82B] max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-fadeUp">
        {/* Top Header Bar */}
        <div className="bg-[#04231A] text-[#FCFAF3] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#E3A82B]">
          <BrandLogo 
            variant="dark" 
            size="sm" 
            showSubtitle={true}
            subtitleText="VRF 2026 • 12 Master Rebuild Prompts"
          />

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrintPDF}
              className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
              title="Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'پی ڈی ایف محفوظ کریں' : 'Save PDF'}</span>
            </button>

            <button
              onClick={handleCopyAll}
              className="bg-[#178A52] hover:bg-[#01411C] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 border border-[#E3A82B]/40"
              title="Copy All 12 Sections"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'مکمل سوٹ کاپی کریں' : 'Copy All'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="bg-[#0B4A31] hover:bg-[#178A52] text-[#DCEFE4] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border border-[#178A52]/40"
              title="Download Markdown"
            >
              .MD
            </button>

            <button
              onClick={handleDownloadTxt}
              className="bg-[#0B4A31] hover:bg-[#178A52] text-[#DCEFE4] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border border-[#178A52]/40"
              title="Download TXT"
            >
              .TXT
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#0B4A31] hover:bg-[#B03A2E] text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast feedback */}
        {toastMsg && (
          <div className="bg-[#178A52] text-white text-xs font-bold px-4 py-2 text-center shadow-inner flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-[#E3A82B]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Main Content Area: Sidebar Tabs + Selected Prompt Display */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Section Picker Sidebar */}
          <div className="w-full md:w-72 bg-[#F6F2E7] border-b md:border-b-0 md:border-r border-[#178A52]/20 p-3 overflow-y-auto max-h-48 md:max-h-none space-y-1">
            <p className="text-[10px] font-black text-[#5C6F63] uppercase px-2 mb-2">
              {isUrdu ? '12 پرامپٹ تہیں (S1 - S12)' : '12 Prompt Layers'}
            </p>
            {sections.map((s) => {
              const isSelected = activeTab === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id)}
                  className={`w-full text-left p-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-[#178A52] text-white shadow-md'
                      : 'hover:bg-[#DCEFE4] text-[#132A21]'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-[#04231A] text-[#E3A82B]' : 'bg-[#0B4A31]/15 text-[#0B4A31]'}`}>
                      {s.no}
                    </span>
                    <span className="truncate text-xs">
                      {isUrdu ? s.titleUrdu : s.titleEn}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/10 text-white font-mono shrink-0 ml-1">
                    {s.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Prompt Viewer Panel */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col bg-white">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#178A52]/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#178A52] text-white text-xs font-black px-2 py-0.5 rounded-md">
                    {activeSection.no}
                  </span>
                  <span className="text-xs font-bold text-[#E3A82B] uppercase font-mono">
                    {activeSection.tag}
                  </span>
                </div>
                <h4 className="font-sora font-extrabold text-base sm:text-lg text-[#04231A]">
                  {isUrdu ? activeSection.titleUrdu : activeSection.titleEn}
                </h4>
              </div>

              <button
                onClick={() => copyText(activeSection.content, `Section ${activeSection.no}`)}
                className="bg-[#04231A] hover:bg-[#178A52] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 border border-[#E3A82B]"
              >
                {copiedId === `Section ${activeSection.no}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#E3A82B]" />
                    <span>{isUrdu ? 'کاپی ہو گیا!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#E3A82B]" />
                    <span>{isUrdu ? 'پرامپٹ کاپی کریں' : 'Copy Prompt'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Code / Prompt box */}
            <div className="relative rounded-2xl bg-[#04231A] border-2 border-[#0B4A31] text-[#DCEFE4] p-4 flex-1 shadow-inner overflow-hidden flex flex-col">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#E3A82B] pb-2 border-b border-[#0B4A31] mb-2">
                <span>PROMPT TEXT • READY FOR QODER / QWEN / CLAUDE / CHATGPT</span>
                <span>UTF-8 BILINGUAL</span>
              </div>
              <pre className="text-xs sm:text-[13px] font-mono leading-relaxed whitespace-pre-wrap word-break-words overflow-y-auto flex-1 text-[#FCFAF3] selection:bg-[#E3A82B] selection:text-[#04231A]">
                {activeSection.content}
              </pre>
            </div>

            {/* Bottom Tip */}
            <div className="mt-4 p-3 rounded-2xl bg-[#F6F2E7] border border-[#178A52]/20 flex items-center justify-between text-xs text-[#5C6F63]">
              <span>
                💡 <b>How to use:</b> Paste this prompt into any AI builder or LLM with the attached HTML to regenerate or audit the full platform in one click.
              </span>
              <span className="font-bold text-[#0B4A31] hidden sm:inline">
                Connected Pakistan • VRF Framework 2026
              </span>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="bg-[#04231A] text-[#DCEFE4] p-3 text-center text-xs border-t border-[#0B4A31]">
          <span>Connected Pakistan • <b>VRF Act 2026 Sovereign Blueprint</b> • <b>Pakistan Zindabad 🇵🇰</b></span>
        </div>
      </div>
    </div>
  );
};
