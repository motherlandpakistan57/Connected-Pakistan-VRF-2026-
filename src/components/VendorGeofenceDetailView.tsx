import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navigation, MapPin, ZoomIn, ZoomOut, Compass, Droplets, Zap, 
  Trash2, ShieldCheck, Scale, CheckCircle2, QrCode, Search, 
  ExternalLink, Copy, Check, Volume2, ArrowRight, Eye, RefreshCw,
  Maximize2, Sliders, Layers, Radio, Building2, Store, Clock, Award
} from 'lucide-react';
import { Language, VendorProfile, DCRateItem } from '../types';
import { PAKISTAN_CITY_SLOTS_DATA, VendorSlot } from '../data/citySlotsData';
import { INITIAL_VENDORS, INITIAL_DC_RATES } from '../data/seedData';
import { speechService } from '../lib/audio';
import { PakistanFlagEmblem } from './PakistanFlagEmblem';

interface VendorGeofenceDetailViewProps {
  lang: Language;
  currentVendor: VendorProfile;
  dcRates?: DCRateItem[];
  searchTerm?: string;
  onOpenCitySlotsMap?: (slotId?: string) => void;
  onOpenQRBadgeModal?: (vendor: VendorProfile) => void;
  onPreviewPublicProfile?: (vendor: VendorProfile) => void;
}

export const VendorGeofenceDetailView: React.FC<VendorGeofenceDetailViewProps> = ({
  lang,
  currentVendor,
  dcRates = INITIAL_DC_RATES,
  searchTerm = '',
  onOpenCitySlotsMap,
  onOpenQRBadgeModal,
  onPreviewPublicProfile,
}) => {
  const isUrdu = lang === 'ur';

  // Flatten all slots across Pakistan
  const allPakistanSlots: (VendorSlot & { province: string; provinceUrdu: string; zoneName: string; zoneNameUrdu: string })[] = useMemo(() => {
    return PAKISTAN_CITY_SLOTS_DATA.flatMap(city =>
      city.zones.flatMap(zone =>
        zone.slots.map(slot => ({
          ...slot,
          province: city.province,
          provinceUrdu: city.provinceUrdu,
          zoneName: zone.zoneName,
          zoneNameUrdu: zone.zoneNameUrdu,
        }))
      )
    );
  }, []);

  // Internal search state initialized with prop
  const [searchQuery, setSearchQuery] = useState(searchTerm);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(() => {
    if (searchTerm) {
      const match = allPakistanSlots.find(s => 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.assignedVendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.assignedVendorNameUrdu.includes(searchTerm)
      );
      if (match) return match.id;
    }
    return 'RWP-RBZ-A-19';
  });

  // Map Controls State
  const [zoomLevel, setZoomLevel] = useState<20 | 18 | 16 | 14>(20); // 20: Micro-Stall, 18: Footpath Lane, 16: Market Sector, 14: City
  const [mapLayer, setMapLayer] = useState<'satellite' | 'tactical' | 'cadastral'>('satellite');
  const [showAmenities, setShowAmenities] = useState(true);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [calcKg, setCalcKg] = useState<number>(2);

  // Sync with search term changes
  useEffect(() => {
    if (searchTerm) {
      setSearchQuery(searchTerm);
      const match = allPakistanSlots.find(s => 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.assignedVendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.assignedVendorNameUrdu.includes(searchTerm) ||
        s.marketName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cityName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (match) {
        setSelectedSlotId(match.id);
      }
    }
  }, [searchTerm, allPakistanSlots]);

  // Find active slot object
  const activeSlot = useMemo(() => {
    const found = allPakistanSlots.find(s => s.id === selectedSlotId);
    return found || allPakistanSlots[0];
  }, [allPakistanSlots, selectedSlotId]);

  // Find matching vendor profile for active slot
  const matchedVendorProfile: VendorProfile = useMemo(() => {
    const seed = INITIAL_VENDORS.find(v => 
      v.name.toLowerCase() === activeSlot.assignedVendorName.toLowerCase() ||
      v.qrId === activeSlot.qrId ||
      v.slotNumber.includes(activeSlot.slotNumber)
    );
    if (seed) return seed;

    return {
      id: `v-${activeSlot.id}`,
      name: activeSlot.assignedVendorName,
      nameUrdu: activeSlot.assignedVendorNameUrdu,
      shopName: `${activeSlot.assignedVendorName} (${activeSlot.category})`,
      shopNameUrdu: `${activeSlot.assignedVendorNameUrdu} (${activeSlot.categoryUrdu})`,
      marketName: activeSlot.marketName,
      marketNameUrdu: activeSlot.marketNameUrdu,
      cnic: activeSlot.vendorCnic,
      phone: activeSlot.vendorPhone,
      slotNumber: activeSlot.slotNumber,
      zone: activeSlot.marketName,
      score: activeSlot.vendorScore,
      wastePoints: 80,
      creditScore: 780,
      badge: 'green',
      qrId: activeSlot.qrId,
      shiftTime: activeSlot.shiftTiming,
    };
  }, [activeSlot]);

  // Filter search results
  const filteredSlots = useMemo(() => {
    if (!searchQuery.trim()) return allPakistanSlots.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return allPakistanSlots.filter(s => 
      s.assignedVendorName.toLowerCase().includes(q) ||
      s.assignedVendorNameUrdu.includes(q) ||
      s.slotNumber.toLowerCase().includes(q) ||
      s.slotNumberUrdu.includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.qrId.toLowerCase().includes(q) ||
      s.vendorCnic.includes(q) ||
      s.vendorPhone.includes(q) ||
      s.marketName.toLowerCase().includes(q) ||
      s.marketNameUrdu.includes(q) ||
      s.cityName.toLowerCase().includes(q) ||
      s.cityNameUrdu.includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.categoryUrdu.includes(q)
    );
  }, [allPakistanSlots, searchQuery]);

  // Copy GPS Coordinates
  const handleCopyCoords = () => {
    const text = `${activeSlot.lat.toFixed(6)}, ${activeSlot.lng.toFixed(6)}`;
    navigator.clipboard?.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  // Audio directive trigger
  const handleSpeakGeofence = () => {
    const urduText = `سرکاری جیو فینس تفصیل: دکاندار ${activeSlot.assignedVendorNameUrdu}، مقام ${activeSlot.marketNameUrdu} ${activeSlot.cityNameUrdu}۔ الاٹ شدہ رقبہ ${activeSlot.dimensionsUrdu}۔ پیدل چلنے والوں کے لیے ${activeSlot.walkwayClearanceUrdu} صاف رکھنا لازمی ہے۔ جی پی ایس کوآرڈینیٹس ${activeSlot.lat} شمالی اور ${activeSlot.lng} مشرقی ہیں۔ وی آر ایف ایکٹ 2026 کے تحت آپ کو بلاجواز بے دخلی سے مکمل قانونی تحفظ حاصل ہے۔`;
    const engText = `Official Geofence Details: Vendor ${activeSlot.assignedVendorName}, ${activeSlot.marketName}, ${activeSlot.cityName}. Regulated boundary ${activeSlot.dimensions}. Footpath clearance ${activeSlot.walkwayClearance}. Exact Coordinates: ${activeSlot.lat} North, ${activeSlot.lng} East. 100% legal eviction protection under VRF Act 2026.`;
    speechService.speak(isUrdu ? urduText : engText, { lang: isUrdu ? 'ur' : 'en' });
  };

  // Relevant DC Rates for this stall
  const relevantDCRates = useMemo(() => {
    const cat = activeSlot.category.toLowerCase();
    if (cat.includes('fruit') || cat.includes('veg') || cat.includes('سبزی') || cat.includes('پھل')) {
      return dcRates.filter(r => r.categoryEn.includes('Veg') || r.categoryEn.includes('Fruit') || r.id === 'rate-5' || r.id === 'rate-6' || r.id === 'rate-7');
    }
    if (cat.includes('dairy') || cat.includes('milk') || cat.includes('egg') || cat.includes('ڈیری')) {
      return dcRates.filter(r => r.categoryEn.includes('Dairy') || r.id === 'rate-8' || r.id === 'rate-9' || r.id === 'rate-10');
    }
    if (cat.includes('grain') || cat.includes('atta') || cat.includes('flour') || cat.includes('آٹا')) {
      return dcRates.filter(r => r.categoryEn.includes('Grains') || r.categoryEn.includes('Pulses') || r.id === 'rate-1' || r.id === 'rate-2');
    }
    return dcRates.slice(0, 4);
  }, [activeSlot, dcRates]);

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Search and Telemetry Header */}
      <div className="bg-[#04231A] rounded-3xl p-6 sm:p-7 border-2 border-[#E3A82B] shadow-2xl text-white space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#178A52]/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#178A52] text-[#E3A82B] flex items-center justify-center border border-[#E3A82B] shadow-lg shrink-0">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#E3A82B] text-[#04231A] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  VRF Geofence Telemetry
                </span>
                <span className="text-xs text-[#DCEFE4]/80 font-mono">
                  {activeSlot.id}
                </span>
                <span className="text-xs bg-[#178A52] text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  <span>🟢 100% In-Bounds</span>
                </span>
              </div>
              <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-white mt-1">
                {isUrdu ? 'سرکاری جیو فینس ان سائیٹ و باؤنڈری کی تفصیل' : 'Official Geofence Insight & Regulated Stall Boundary'}
              </h3>
              <p className="text-xs text-[#DCEFE4]/80 font-urdu mt-0.5">
                {isUrdu 
                  ? 'وینڈر کا نام، شناختی کوڈ یا سلاٹ درج کر کے مائیکرو کوآرڈینیٹس اور قانونی حدود لائیو دیکھیں — کیو آر کوڈ سے براہ راست منسلک' 
                  : 'Search any vendor ID, name, or slot code to zoom the tactical map onto their exact coordinates — directly linked to QR Badge.'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onOpenQRBadgeModal && onOpenQRBadgeModal(matchedVendorProfile)}
              className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-3.5 py-2 rounded-xl text-xs font-extrabold shadow flex items-center gap-1.5 transition-transform active:scale-95"
              title="View Linked QR Code"
            >
              <QrCode className="w-4 h-4" />
              <span>{isUrdu ? 'منسلک کیو آر کوڈ دیکھیں' : 'View Linked QR Badge'}</span>
            </button>

            <button
              onClick={handleSpeakGeofence}
              className="bg-[#0B4A31] hover:bg-[#178A52] text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-[#178A52] flex items-center gap-1.5 shadow transition-transform active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-[#E3A82B]" />
              <span>{isUrdu ? 'آڈیو رہنمائی سنیں' : 'Listen Directive'}</span>
            </button>

            <button
              onClick={() => onOpenCitySlotsMap && onOpenCitySlotsMap(activeSlot.id)}
              className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md border border-[#E3A82B] flex items-center gap-2 transition-transform active:scale-95"
            >
              <Maximize2 className="w-4 h-4 text-[#E3A82B]" />
              <span>{isUrdu ? 'مکمل سیٹلائٹ نقشہ' : '1-Click Satellite Zoom'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar with Instant Suggestions */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-[#E3A82B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUrdu ? 'کسی بھی وینڈر کا نام، شناختی کارڈ، سلاٹ نمبر یا شہر تلاش کریں...' : 'Search by Vendor Name, CNIC, Slot Code, Market, or City...'}
              className="w-full pl-11 pr-4 py-3 bg-[#0B4A31] text-white placeholder-[#DCEFE4]/60 rounded-2xl border-2 border-[#178A52] focus:border-[#E3A82B] focus:outline-none text-xs sm:text-sm font-medium shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs bg-[#04231A] text-[#DCEFE4] hover:text-white px-2 py-1 rounded-lg border border-[#178A52]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Preset Vendor Quick Switcher Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] text-[#DCEFE4]/70 font-bold shrink-0">
              {isUrdu ? 'فوری انتخاب:' : 'Quick Select:'}
            </span>
            {allPakistanSlots.slice(0, 7).map((s) => {
              const isSelected = s.id === activeSlot.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSlotId(s.id);
                    setSearchQuery(s.assignedVendorName);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#E3A82B] text-[#04231A] border-[#E3A82B] shadow-md scale-105 font-extrabold'
                      : 'bg-[#0B4A31]/90 text-[#DCEFE4] border-[#178A52] hover:bg-[#178A52] hover:text-white'
                  }`}
                >
                  <span>{s.categoryIcon}</span>
                  <span>{isUrdu ? s.assignedVendorNameUrdu : s.assignedVendorName}</span>
                  <span className="text-[10px] opacity-75 font-mono">({s.slotNumber})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Satellite Canvas (Left) + Spatial Blueprint & Rights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Tactical Interactive Geofence Map Visualizer (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#04231A] rounded-3xl p-5 border-2 border-[#178A52] shadow-xl text-white space-y-4">
            {/* Map Header & Layer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#178A52]/50">
              <div className="flex items-center gap-2">
                <PakistanFlagEmblem size="xs" variant="flag" rounded="sm" className="ring-1 ring-amber-400/50 shadow-xs" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#178A52] animate-ping" />
                <span className="font-sora font-extrabold text-sm text-white">
                  GPS Fixed: {activeSlot.lat.toFixed(5)}° N, {activeSlot.lng.toFixed(5)}° E
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Layer Selector */}
                <div className="bg-[#0B4A31] p-1 rounded-xl border border-[#178A52] flex items-center gap-1 text-[11px] font-bold">
                  <button
                    onClick={() => setMapLayer('satellite')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${mapLayer === 'satellite' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4]/80'}`}
                  >
                    🛰️ {isUrdu ? 'سیٹلائٹ' : 'Satellite'}
                  </button>
                  <button
                    onClick={() => setMapLayer('tactical')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${mapLayer === 'tactical' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4]/80'}`}
                  >
                    📐 {isUrdu ? 'ٹیکٹیکل' : 'Tactical'}
                  </button>
                </div>

                {/* Zoom Stepper */}
                <div className="bg-[#0B4A31] p-1 rounded-xl border border-[#178A52] flex items-center gap-1">
                  <button
                    onClick={() => setZoomLevel(20)}
                    title="Micro Stall Zoom (20x)"
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${zoomLevel === 20 ? 'bg-[#E3A82B] text-[#04231A]' : 'text-white'}`}
                  >
                    20x
                  </button>
                  <button
                    onClick={() => setZoomLevel(18)}
                    title="Pedestrian Lane Zoom (18x)"
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${zoomLevel === 18 ? 'bg-[#E3A82B] text-[#04231A]' : 'text-white'}`}
                  >
                    18x
                  </button>
                  <button
                    onClick={() => setZoomLevel(16)}
                    title="Market Sector Zoom (16x)"
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${zoomLevel === 16 ? 'bg-[#E3A82B] text-[#04231A]' : 'text-white'}`}
                  >
                    16x
                  </button>
                </div>
              </div>
            </div>

            {/* High-Definition Interactive Satellite Canvas / Regulated Stall Boundary Map */}
            <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#E3A82B] bg-[#0A1F17] shadow-inner flex items-center justify-center select-none group">
              {/* Satellite / Tactical Terrain Layer Simulation */}
              <div 
                className="absolute inset-0 opacity-85 transition-all duration-700"
                style={{
                  backgroundImage: mapLayer === 'satellite'
                    ? `radial-gradient(circle at 50% 50%, #0B4A31 0%, #04231A 60%, #02120D 100%),
                       linear-gradient(rgba(23, 138, 82, 0.15) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(23, 138, 82, 0.15) 1px, transparent 1px)`
                    : `radial-gradient(circle at 50% 50%, #0E3524 0%, #04231A 100%),
                       linear-gradient(rgba(227, 168, 43, 0.2) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(227, 168, 43, 0.2) 1px, transparent 1px)`,
                  backgroundSize: zoomLevel === 20 ? '32px 32px' : zoomLevel === 18 ? '20px 20px' : '12px 12px',
                }}
              />

              {/* Pedestrian Footpath Corridor Markings (Yellow Zone) */}
              <div 
                className="absolute w-4/5 h-4/5 rounded-3xl border-2 border-dashed border-yellow-400/40 bg-yellow-400/5 flex flex-col justify-between p-3 pointer-events-none"
                style={{ transform: `scale(${zoomLevel === 20 ? 1 : zoomLevel === 18 ? 0.8 : 0.6})` }}
              >
                <div className="flex justify-between items-center text-[10px] text-yellow-300 font-mono bg-[#04231A]/80 px-2 py-0.5 rounded-md self-start border border-yellow-400/30">
                  <span>🚶‍♂️ Pedestrian Corridor: {activeSlot.walkwayClearance}</span>
                </div>
                <div className="text-[9px] text-yellow-400/70 font-mono text-right self-end bg-[#04231A]/80 px-2 py-0.5 rounded-md border border-yellow-400/30">
                  Municipal Yellow Line Marking
                </div>
              </div>

              {/* Central Regulated Stall Boundary Box (Pulsing Neon Gold Box) */}
              <div 
                className="relative z-10 w-52 sm:w-60 h-36 sm:h-40 rounded-2xl bg-[#04231A]/90 border-4 border-[#E3A82B] shadow-[0_0_30px_rgba(227,168,43,0.4)] flex flex-col justify-between p-3.5 text-center transition-all duration-500 hover:scale-105"
                style={{
                  transform: `scale(${zoomLevel === 20 ? 1.1 : zoomLevel === 18 ? 0.95 : 0.8})`,
                }}
              >
                {/* Stall Corner Coordinate Markers */}
                <span className="absolute -top-2.5 -left-2.5 w-4 h-4 rounded-full bg-[#178A52] border-2 border-white text-[8px] font-mono text-white flex items-center justify-center font-bold shadow" title="NW Corner Pin">
                  NW
                </span>
                <span className="absolute -top-2.5 -right-2.5 w-4 h-4 rounded-full bg-[#178A52] border-2 border-white text-[8px] font-mono text-white flex items-center justify-center font-bold shadow" title="NE Corner Pin">
                  NE
                </span>
                <span className="absolute -bottom-2.5 -left-2.5 w-4 h-4 rounded-full bg-[#178A52] border-2 border-white text-[8px] font-mono text-white flex items-center justify-center font-bold shadow" title="SW Corner Pin">
                  SW
                </span>
                <span className="absolute -bottom-2.5 -right-2.5 w-4 h-4 rounded-full bg-[#178A52] border-2 border-white text-[8px] font-mono text-white flex items-center justify-center font-bold shadow" title="SE Corner Pin">
                  SE
                </span>

                {/* Top Badge Inside Stall */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black bg-[#E3A82B] text-[#04231A] px-2 py-0.5 rounded-full">
                    {activeSlot.slotNumber}
                  </span>
                  <span className="text-[10px] text-[#178A52] bg-[#DCEFE4] font-bold px-2 py-0.5 rounded-full">
                    ⭐ {activeSlot.vendorScore} Score
                  </span>
                </div>

                {/* Stall Info */}
                <div className="my-auto">
                  <div className="text-base sm:text-lg font-sora font-extrabold text-white truncate">
                    {isUrdu ? activeSlot.assignedVendorNameUrdu : activeSlot.assignedVendorName}
                  </div>
                  <div className="text-xs text-[#E3A82B] font-bold mt-0.5">
                    {activeSlot.categoryIcon} {isUrdu ? activeSlot.categoryUrdu : activeSlot.category}
                  </div>
                  <div className="text-[11px] text-[#DCEFE4] font-mono mt-1">
                    📐 {activeSlot.dimensions} ({activeSlot.totalAreaSqFt} sq. ft)
                  </div>
                </div>

                {/* Bottom Verification Seal */}
                <div className="flex items-center justify-center gap-1 text-[10px] text-[#DCEFE4] bg-[#178A52]/40 py-0.5 rounded-lg border border-[#178A52]">
                  <ShieldCheck className="w-3 h-3 text-[#E3A82B]" />
                  <span>VRF Official Zoned Stall</span>
                </div>
              </div>

              {/* Surrounding Municipal Proximity Vectors */}
              {showAmenities && (
                <>
                  {/* Potable Water Pin */}
                  <div className="absolute top-4 left-6 z-20 bg-[#04231A]/90 border border-blue-400 px-2.5 py-1 rounded-xl text-[10px] text-blue-300 flex items-center gap-1.5 shadow-lg">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span>Water: {activeSlot.amenities.waterDistanceMeters}m</span>
                  </div>

                  {/* Dustbin Pin */}
                  <div className="absolute bottom-4 right-6 z-20 bg-[#04231A]/90 border border-emerald-400 px-2.5 py-1 rounded-xl text-[10px] text-emerald-300 flex items-center gap-1.5 shadow-lg">
                    <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bin: {activeSlot.amenities.dustbinId}</span>
                  </div>

                  {/* Solar LED Pin */}
                  <div className="absolute top-4 right-6 z-20 bg-[#04231A]/90 border border-yellow-400 px-2.5 py-1 rounded-xl text-[10px] text-yellow-300 flex items-center gap-1.5 shadow-lg">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>12V Solar LED</span>
                  </div>

                  {/* Digital Scale Pin */}
                  <div className="absolute bottom-4 left-6 z-20 bg-[#04231A]/90 border border-[#E3A82B] px-2.5 py-1 rounded-xl text-[10px] text-[#E3A82B] flex items-center gap-1.5 shadow-lg">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Calibrated Scale</span>
                  </div>
                </>
              )}

              {/* Floating Map Watermark */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-[#DCEFE4]/40 font-mono tracking-wider">
                33°N 73°E • VRF ACT 2026 GEOFENCE LAYER
              </div>
            </div>

            {/* Coordinates and Distance Telemetry Bar */}
            <div className="p-3.5 rounded-2xl bg-[#0B4A31] border border-[#178A52] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#04231A] text-[#E3A82B] flex items-center justify-center border border-[#178A52]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#DCEFE4]/70 font-bold block">{isUrdu ? 'جغرافیائی کوآرڈینیٹس' : 'GPS Pinpoint'}</span>
                  <span className="font-mono font-bold text-white">
                    {activeSlot.lat.toFixed(6)}° N, {activeSlot.lng.toFixed(6)}° E
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCoords}
                  className="bg-[#04231A] hover:bg-[#178A52] text-white px-3 py-1.5 rounded-xl border border-[#178A52] text-xs font-bold flex items-center gap-1 shadow transition-colors"
                >
                  {copiedCoords ? <Check className="w-3.5 h-3.5 text-[#E3A82B]" /> : <Copy className="w-3.5 h-3.5 text-[#E3A82B]" />}
                  <span>{copiedCoords ? (isUrdu ? 'کاپی ہو گیا' : 'Copied!') : (isUrdu ? 'کاپی کریں' : 'Copy GPS')}</span>
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeSlot.lat},${activeSlot.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#178A52] hover:bg-[#178A52]/80 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Regulated Spatial Blueprint, Anti-Eviction Rights & DC Price Table (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Spatial Blueprint Dossier Card */}
          <div className="bg-[#FCFAF3] rounded-3xl p-5 sm:p-6 border border-[#178A52]/20 shadow-md text-[#132A21] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F6F2E7]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#04231A] text-[#E3A82B] flex items-center justify-center shadow">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sora font-extrabold text-base text-[#04231A]">
                    {isUrdu ? 'قانونی جیو فینس ڈوزیئر' : 'Regulated Slot Dossier'}
                  </h4>
                  <span className="text-xs text-[#5C6F63] font-mono">
                    {activeSlot.qrId}
                  </span>
                </div>
              </div>

              <span className="text-xs bg-[#178A52] text-white px-2.5 py-1 rounded-xl font-bold">
                Tier A Regulated
              </span>
            </div>

            {/* Parameter Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-[#178A52]/20 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">{isUrdu ? 'الاٹ شدہ رقبہ' : 'Allocated Space'}</span>
                <strong className="text-sm font-mono text-[#04231A] block mt-0.5">{activeSlot.dimensions}</strong>
                <span className="text-[10px] text-[#178A52] font-bold">Max 24 sq. ft footprint</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#178A52]/20 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">{isUrdu ? 'پیدل راستہ بفر' : 'Pedestrian Buffer'}</span>
                <strong className="text-sm font-mono text-[#178A52] block mt-0.5">{activeSlot.walkwayClearance}</strong>
                <span className="text-[10px] text-slate-500">Zero encroachment zone</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#178A52]/20 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">{isUrdu ? 'شفٹ ٹائمنگ' : 'Shift Timing'}</span>
                <strong className="text-xs font-mono text-[#04231A] block mt-0.5">{activeSlot.shiftTiming}</strong>
                <span className="text-[10px] text-[#E3A82B] font-bold">8-Hour Active Rotation</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#178A52]/20 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">{isUrdu ? 'شہر و بازار' : 'Market Location'}</span>
                <strong className="text-xs text-[#04231A] block mt-0.5 truncate">{isUrdu ? activeSlot.cityNameUrdu : activeSlot.cityName}</strong>
                <span className="text-[10px] text-slate-500 truncate block">{isUrdu ? activeSlot.marketNameUrdu : activeSlot.marketName}</span>
              </div>
            </div>

            {/* Eviction Shield Legal Guarantee */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#04231A] to-[#0B4A31] text-white border border-[#E3A82B] text-xs space-y-1.5 shadow">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E3A82B]" />
                <strong className="text-sm font-bold text-white">
                  {isUrdu ? 'وی آر ایف 2026 اینٹی بے دخلی تحفظ' : 'VRF Act 2026 Anti-Eviction Shield'}
                </strong>
              </div>
              <p className="text-[11px] text-[#DCEFE4] font-urdu leading-relaxed">
                {isUrdu
                  ? 'سیکشن 14(2): جب تک دکاندار الاٹ شدہ 6x4 فٹ اور ڈی سی ریٹس کی پاسداری کرتا ہے، کسی بھی اہلکار کو بلاجواز سامان ہٹانے یا ہراساں کرنے کا کوئی اختیار نہیں۔'
                  : 'Section 14(2): As long as the vendor remains within this 6x4ft geofence and complies with DC ceiling prices, arbitrary eviction is legally prohibited.'}
              </p>
            </div>

            {/* Quick Actions to Open QR Badge or Profile */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onOpenQRBadgeModal && onOpenQRBadgeModal(matchedVendorProfile)}
                className="flex-1 bg-[#178A52] hover:bg-[#178A52]/90 text-white py-2.5 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <QrCode className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'کیو آر بیج اسٹوڈیو' : 'QR Badge Studio'}</span>
              </button>

              <button
                onClick={() => onPreviewPublicProfile && onPreviewPublicProfile(matchedVendorProfile)}
                className="flex-1 bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] py-2.5 rounded-xl text-xs font-extrabold shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>{isUrdu ? 'پبلک ریٹس پاپ اپ' : 'DC Pop-Up View'}</span>
              </button>
            </div>
          </div>

          {/* Associated DC Commodity Rates for this Specific Stall */}
          <div className="bg-[#FCFAF3] rounded-3xl p-5 border border-[#178A52]/20 shadow-md text-[#132A21] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F6F2E7]">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#178A52]" />
                <h5 className="font-bold text-xs sm:text-sm text-[#04231A]">
                  {isUrdu ? 'اس سلاٹ کے مصدقہ سرکاری ڈی سی نرخ' : 'Authorized DC Rates for this Slot'}
                </h5>
              </div>
              <span className="text-[10px] bg-[#178A52] text-white px-2 py-0.5 rounded-full font-bold">
                0% Overcharge Guaranteed
              </span>
            </div>

            <div className="space-y-2">
              {relevantDCRates.map((rate) => (
                <div 
                  key={rate.id}
                  className="p-2.5 rounded-xl bg-white border border-[#178A52]/20 flex items-center justify-between text-xs shadow-xs"
                >
                  <div>
                    <strong className="text-slate-900 font-urdu block">
                      {isUrdu ? rate.nameUrdu : rate.nameEn}
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isUrdu ? rate.unitUrdu : rate.unitEn}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-sora font-extrabold text-sm text-[#178A52] block">
                      Rs. {rate.dcRate}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      Avg: Rs. {rate.marketAvg}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Price Calculator */}
            <div className="p-3 bg-[#F6F2E7] rounded-2xl border border-[#178A52]/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#04231A]">
                <span>{isUrdu ? 'وزن کے حساب سے سرکاری قیمت:' : 'Instant Weight Calculator:'}</span>
                <span className="text-[#178A52] font-mono">{calcKg} kg</span>
              </div>
              <input 
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={calcKg}
                onChange={(e) => setCalcKg(parseFloat(e.target.value))}
                className="w-full accent-[#178A52] cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#178A52]/20">
                <span className="text-slate-600 font-urdu">{isUrdu ? 'تخمینہ رقم (ٹماٹر/پیاز):' : 'Calculated Official Price:'}</span>
                <strong className="text-[#178A52] font-sora font-extrabold text-sm">
                  Rs. {Math.round(calcKg * (relevantDCRates[0]?.dcRate || 100))}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
