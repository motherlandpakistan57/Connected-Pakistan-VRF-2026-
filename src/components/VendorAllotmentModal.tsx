import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Search, Building2, Store, ShieldCheck, CheckCircle2, 
  ExternalLink, Copy, Check, Navigation, AlertTriangle, Clock, 
  Sparkles, Layers, QrCode, Phone, FileText, Send, X, Compass,
  Droplets, Zap, Trash2, Printer
} from 'lucide-react';
import { Language, Role, VendorProfile } from '../types';
import { PAKISTAN_CITY_SLOTS_DATA, VendorSlot } from '../data/citySlotsData';
import { INITIAL_VENDORS } from '../data/seedData';

interface VendorAllotmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentRole: Role;
  initialVendorId?: string;
  onDispatchSquad?: (vendorName: string, slotId: string) => void;
  vendors?: VendorProfile[];
}

export const VendorAllotmentModal: React.FC<VendorAllotmentModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentRole,
  initialVendorId = '',
  onDispatchSquad,
  vendors = [],
}) => {
  const isUrdu = lang === 'ur';

  // Search input state
  const [searchInput, setSearchInput] = useState(initialVendorId || 'VRF-RWP-SLOT-19');
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [geofenceVerified, setGeofenceVerified] = useState(false);
  const [dispatchAlert, setDispatchAlert] = useState<string | null>(null);

  // Sync initial vendor id when opened
  useEffect(() => {
    if (initialVendorId) {
      setSearchInput(initialVendorId);
    }
  }, [initialVendorId, isOpen]);

  // Flatten all slots across Pakistan
  const allSlots = useMemo(() => {
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

  // Find slot and vendor matching the search term
  const searchResult = useMemo(() => {
    const term = (searchInput || '').trim().toLowerCase();
    if (!term) return null;

    // 1. Try matching by slot id, qrId, slotNumber, assignedVendorName, or vendorCnic
    const matchedSlot = allSlots.find(s => 
      s.id.toLowerCase() === term ||
      s.qrId.toLowerCase() === term ||
      s.slotNumber.toLowerCase() === term ||
      s.id.toLowerCase().includes(term) ||
      s.qrId.toLowerCase().includes(term) ||
      s.assignedVendorName.toLowerCase().includes(term) ||
      s.assignedVendorNameUrdu.includes(term) ||
      s.vendorPhone.includes(term) ||
      s.vendorCnic.includes(term)
    );

    // 2. Try matching in live vendors or INITIAL_VENDORS
    const pool = vendors && vendors.length > 0 ? vendors : INITIAL_VENDORS;
    const matchedVendor = pool.find(v => 
      v.id.toLowerCase() === term ||
      (v.qrId && v.qrId.toLowerCase() === term) ||
      (v.slotNumber && v.slotNumber.toLowerCase().includes(term)) ||
      v.name.toLowerCase().includes(term) ||
      v.phone.includes(term) ||
      v.cnic.includes(term)
    );

    if (matchedSlot) {
      // Find corresponding vendor in live pool if exists
      const seed = matchedVendor || pool.find(v => 
        (v.qrId && v.qrId === matchedSlot.qrId) ||
        v.name.toLowerCase() === matchedSlot.assignedVendorName.toLowerCase() ||
        (v.slotNumber && matchedSlot.slotNumber.includes(v.slotNumber.replace(/[^0-9]/g, '')))
      );
      return { slot: matchedSlot, vendor: seed };
    }

    if (matchedVendor) {
      // Find corresponding slot in allSlots
      const slot = allSlots.find(s => 
        (matchedVendor.qrId && s.qrId === matchedVendor.qrId) ||
        (matchedVendor.slotNumber && matchedVendor.slotNumber.toLowerCase().includes(s.slotNumber.toLowerCase()))
      ) || {
        id: matchedVendor.id,
        slotNumber: matchedVendor.slotNumber || 'سلاٹ الاٹ شدہ',
        slotNumberUrdu: matchedVendor.slotNumber || 'سلاٹ الاٹ شدہ',
        zoneName: matchedVendor.zone || 'District Command Zone',
        zoneNameUrdu: matchedVendor.zone || 'ضلعی زون',
        province: 'Islamabad / Rawalpindi',
        provinceUrdu: 'اسلام آباد / راولپنڈی',
        assignedVendorName: matchedVendor.name,
        assignedVendorNameUrdu: matchedVendor.nameUrdu || matchedVendor.name,
        stallType: matchedVendor.shopName,
        stallTypeUrdu: matchedVendor.shopNameUrdu || matchedVendor.shopName,
        shiftTime: matchedVendor.authorizedOperatingHours || matchedVendor.shiftTime || '08:00 AM - 04:00 PM',
        shiftTimeUrdu: matchedVendor.authorizedOperatingHours || matchedVendor.shiftTime || '08:00 AM - 04:00 PM',
        qrId: matchedVendor.qrId || 'VRF-SLOT-01',
        vendorPhone: matchedVendor.phone,
        vendorCnic: matchedVendor.cnic,
        latitude: matchedVendor.latitude || 33.6895,
        longitude: matchedVendor.longitude || 73.0298,
        dimensions: matchedVendor.assignedPitchDimensions || '6ft x 4ft (Cart)',
        complianceScore: matchedVendor.score || 8.0,
        monthlyFee: matchedVendor.monthlyRegulatoryFee || 1500,
        status: 'occupied' as const,
        geofenceRadiusMeters: 15,
      };
      return { slot, vendor: matchedVendor };
    }

    return null;
  }, [searchInput, allSlots, vendors]);

  // Fallback to primary demonstration slot if nothing typed
  const activeSlot = searchResult?.slot || allSlots[0];
  const activeVendor = searchResult?.vendor || INITIAL_VENDORS[0];

  if (!isOpen) return null;

  // Google Maps embed URL
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${activeSlot.lat},${activeSlot.lng}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=18&ie=UTF8&iwloc=&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/dir/?api=1&destination=${activeSlot.lat},${activeSlot.lng}`;

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${activeSlot.lat}, ${activeSlot.lng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleVerifyGeofence = () => {
    setGeofenceVerified(true);
    setTimeout(() => setGeofenceVerified(false), 4000);
  };

  const handleDispatch = () => {
    if (onDispatchSquad) {
      onDispatchSquad(activeSlot.assignedVendorName, activeSlot.id);
    }
    setDispatchAlert(`اسکواڈ 1 (شمالی زون) کو وینڈر ${activeSlot.assignedVendorName} کے الاٹ شدہ مقام (${activeSlot.marketName}) پر روانہ کر دیا گیا ہے۔`);
    setTimeout(() => setDispatchAlert(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-500/30 max-w-4xl w-full my-auto overflow-hidden text-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/60 border border-emerald-400/40 flex items-center justify-center text-emerald-200 shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isUrdu ? 'سرکاری الاٹمنٹ و گوگل نقشہ' : 'Government Allotment & Google Maps System'}
                </span>
                <span className="text-[10px] text-amber-300 font-semibold hidden sm:inline-block">
                  {isUrdu ? 'ڈسٹرکٹ ایڈمنسٹریشن تصدیق شدہ' : 'DC Sanctioned Pitch'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {isUrdu 
                  ? 'وینڈر شناختی کوڈ (Vendor ID) تلاش و سرکاری الاٹ شدہ مقام' 
                  : 'Designated Government Allotment & Geospatial Locator'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white bg-emerald-950/50 hover:bg-emerald-950 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Quick Vendor ID Chips */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isUrdu ? 'وینڈر شناختی کوڈ درج کریں (مثلاً VRF-RWP-SLOT-19 یا v-101)...' : 'Enter Vendor ID, Slot #, or Name (e.g. VRF-RWP-SLOT-19, v-101, Slot 19)...'}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white shadow-xs font-mono"
              />
            </div>

            {/* Quick Demo ID suggestions */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap hidden md:inline">
                {isUrdu ? 'فوری کوڈز:' : 'Quick IDs:'}
              </span>
              {[
                { label: 'RWP Slot 19', id: 'VRF-RWP-SLOT-19' },
                { label: 'LHR Slot 04', id: 'VRF-LHR-SLOT-04' },
                { label: 'KHI Slot 12', id: 'VRF-KHI-SLOT-12' },
                { label: 'PEW Slot 08', id: 'VRF-PEW-SLOT-08' },
                { label: 'QTA Slot 05', id: 'VRF-QTA-SLOT-05' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSearchInput(chip.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors shrink-0 ${
                    searchInput === chip.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dispatch Alert Banner */}
        {dispatchAlert && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-amber-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{dispatchAlert}</span>
          </div>
        )}

        {/* Content Body: Split Map & Allotment Certificate */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* Left Column: Official Government Allotment Order Certificate */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Sanction Letter Card */}
            <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-2xl border-2 border-emerald-700/20 p-4 shadow-sm relative overflow-hidden">
              
              {/* Official DC Stamp Watermark */}
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <ShieldCheck className="w-48 h-48 text-emerald-950" />
              </div>

              {/* Sanction Header */}
              <div className="flex items-start justify-between border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    DC
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                      {isUrdu ? 'حکومت پاکستان • ضلعی انتظامیہ' : 'District Administration • Government of Pakistan'}
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-semibold">
                      {isUrdu ? 'سرکاری ریڑھی و دکان الاٹمنٹ پرمٹ آرڈر' : 'Official Street Vendor Pitch Allotment Sanction'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold border border-emerald-300">
                    DC-ALLOT/2026/{activeSlot.id}
                  </span>
                  <div className="text-[9px] text-emerald-700 mt-0.5">
                    {isUrdu ? 'باضابطہ تصدیق شدہ' : 'Legally Sanctioned'}
                  </div>
                </div>
              </div>

              {/* Vendor & Stall Identity */}
              <div className="mt-3.5 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {isUrdu ? 'الائسنس یافتہ وینڈر:' : 'Allotted Vendor Name:'}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {isUrdu ? activeSlot.assignedVendorNameUrdu : activeSlot.assignedVendorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {isUrdu ? 'وینڈر شناختی کوڈ (Vendor ID):' : 'Official Vendor ID:'}
                    </span>
                    <span className="font-mono font-bold text-emerald-800 text-xs">
                      {activeSlot.qrId}
                    </span>
                  </div>
                </div>

                {/* Allotted Location & Pitch Details */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {isUrdu ? 'مخصوص شدہ سرکاری مارکیٹ و سیکٹر:' : 'Designated Government Market & Zone:'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {isUrdu ? activeSlot.marketNameUrdu : activeSlot.marketName}
                      </span>
                      <p className="text-[11px] text-slate-600">
                        {isUrdu ? activeSlot.cityNameUrdu : activeSlot.cityName}, {activeSlot.province}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">{isUrdu ? 'سلاٹ / پچ نمبر:' : 'Allotted Pitch #:'}</span>
                      <span className="font-extrabold text-emerald-800 text-xs">{activeSlot.slotNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{isUrdu ? 'اجناس کی اجازت:' : 'Permitted Trade:'}</span>
                      <span className="font-semibold text-slate-800">{isUrdu ? activeSlot.categoryUrdu : activeSlot.category}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">{isUrdu ? 'پیمائش و رقبہ:' : 'Approved Pitch Area:'}</span>
                      <span className="font-semibold text-slate-800">{activeSlot.dimensions} ({activeSlot.totalAreaSqFt} sq ft)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{isUrdu ? 'پیدل چلنے کا راستہ:' : 'Walkway Clearance:'}</span>
                      <span className="font-semibold text-emerald-800">{activeSlot.walkwayClearance} preserved</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">{isUrdu ? 'مقررہ شفٹ اوقات:' : 'Permitted Trading Shift:'}</span>
                      <span className="font-semibold text-slate-800">{activeSlot.shiftTiming}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{isUrdu ? 'جیو فینس دائرہ:' : 'GPS Radar Ring:'}</span>
                      <span className="font-bold text-emerald-700">35m Safe Buffer</span>
                    </div>
                  </div>
                </div>

                {/* Amenities Available at Pitch */}
                <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    <span>Water: {activeSlot.amenities.waterDistanceMeters}m</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Solar: {activeSlot.amenities.solarLight ? 'Active' : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bin: {activeSlot.amenities.dustbinId}</span>
                  </div>
                </div>

                {/* Official Certification Signature & Contact */}
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-[10px] text-slate-600">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {isUrdu ? 'مجاز پرائس مجسٹریٹ:' : 'Assigned Magistrate:'}
                    </span>
                    <span>Insp. Mazhar Iqbal (PERA-884) • 0300-5551234</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-800 text-white font-bold">
                      {isUrdu ? 'سرکاری مہر' : 'SEAL VERIFIED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Action Controls */}
            {(currentRole === 'government' || currentRole === 'inspector' || currentRole === 'fakhar_master') && (
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    {isUrdu ? 'سرکاری مجسٹریٹ و کمانڈ کنٹرولز' : 'Government Enforcement Commands'}
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                    Live GPS Telemetry
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleVerifyGeofence}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{geofenceVerified ? (isUrdu ? 'مقام درست ہے ✓' : 'Inside Geofence ✓') : (isUrdu ? 'مقام تصدیق کریں' : 'Verify GPS Presence')}</span>
                  </button>

                  <button
                    onClick={handleDispatch}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'اسکواڈ روانہ کریں' : 'Dispatch Field Squad'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Google Maps with Satellite view */}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            
            {/* Map Controls Header */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>{isUrdu ? 'گوگل میپ سیٹلائٹ ریڈار' : 'Live Google Maps Geospatial View'}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  {activeSlot.lat.toFixed(4)}, {activeSlot.lng.toFixed(4)}
                </span>
              </div>

              {/* Toggle Map / Satellite */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setMapType('roadmap')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    mapType === 'roadmap' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    mapType === 'satellite' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Satellite
                </button>
              </div>
            </div>

            {/* Embedded Google Maps Container */}
            <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-100">
              <iframe
                title="Designated Vendor Government Allotment Map"
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer"
                allowFullScreen
                className="w-full h-full"
              />

              {/* Floating Overlay Badge on Map */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-emerald-500/30 text-slate-800 text-xs max-w-[240px]">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isUrdu ? 'سرکاری منظور شدہ پچ' : 'Officially Allotted Spot'}</span>
                </div>
                <p className="font-semibold text-slate-900 text-xs mt-0.5 truncate">
                  {activeSlot.slotNumber} • {activeSlot.assignedVendorName}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {activeSlot.marketName}
                </p>
              </div>

              {/* Floating Geofence Radar Indicator */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="font-mono text-emerald-300">
                  {isUrdu ? 'جیو فینس رینج: 35m' : 'Geofence Radar: 35m Radius'}
                </span>
              </div>
            </div>

            {/* Map Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* Open in Google Maps */}
              <a
                href={googleMapsExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all text-center"
              >
                <Navigation className="w-4 h-4 text-emerald-300" />
                <span>{isUrdu ? 'گوگل میپس پر راستہ دیکھیں' : 'Directions in Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              {/* Copy Coordinates */}
              <button
                onClick={handleCopyCoordinates}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-xs"
              >
                {copiedCoords ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">{isUrdu ? 'کوآرڈینیٹس کاپی ہو گئے' : 'Copied Coordinates'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>{isUrdu ? 'کوآرڈینیٹس کاپی کریں' : 'Copy GPS Coords'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Directions & Navigation Walkthrough */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-700" />
                {isUrdu ? 'مقام تک رسائی کی رہنمائی:' : 'Walking & Vehicle Access Directions:'}
              </span>
              <p className="text-[11px] text-slate-600">
                {isUrdu ? activeSlot.directionsUrdu : activeSlot.directionsEn}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-bold text-emerald-800">
              Connected Pakistan
            </span>
            <span>•</span>
            <span>VRF Price & Allotment Engine 2026</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
