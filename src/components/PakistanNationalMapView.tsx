import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, Shield, Radio, Navigation, Maximize2, 
  ExternalLink, Search, Filter, CheckCircle2, 
  AlertTriangle, Users, Building, ArrowUpRight, 
  Layers, Volume2, Sparkles, Compass, Eye,
  ArrowRight, Film, LogOut, LayoutDashboard
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { PAKISTAN_CITIES, PATROL_POINTS, PROVINCE_POLYGONS, NEIGHBOURS } from '../lib/pakistanData';
import { speechService } from '../lib/audio';
import { Emblem } from './Emblem';
import { PakistanFlagEmblem } from './PakistanFlagEmblem';
import { calculateClusters, createClusterIcon, ClusterPoint, ClusteredGroup } from '../lib/markerClustering';
import { PAKISTAN_CITY_SLOTS_DATA } from '../data/citySlotsData';

interface PakistanNationalMapViewProps {
  lang: Language;
  onOpenCitySlotsMap?: (slotId?: string) => void;
  onOpenLocate?: (place: string) => void;
  isSequenceMode?: boolean;
  userName?: string;
  currentRole?: UserRole;
  onContinueToPresentation?: () => void;
  onSkipToPlatform?: () => void;
  onLogout?: () => void;
}

interface ProvinceCoverage {
  id: string;
  nameEn: string;
  nameUrdu: string;
  districtsCount: number;
  totalVendors: number;
  activeSlots: number;
  complianceRate: number;
  activePatrols: number;
  keyBazaars: string[];
  image?: string;
  captionUrdu: string;
  captionEn: string;
  status: 'optimal' | 'high_patrol' | 'expanding';
}

const PROVINCE_DATA: ProvinceCoverage[] = [
  {
    id: 'punjab',
    nameEn: 'Punjab Province',
    nameUrdu: 'پنجاب (36 اضلاع)',
    districtsCount: 36,
    totalVendors: 64200,
    activeSlots: 58900,
    complianceRate: 97.4,
    activePatrols: 18,
    keyBazaars: ['Raja Bazaar Rawalpindi', 'Anarkali Lahore', 'Ghanta Ghar Faisalabad', 'Haram Gate Multan'],
    captionUrdu: 'انارکلی اور راجہ بازار میں منظم و محفوظ ریڑھی بان سلاٹس',
    captionEn: 'Regulated micro-geofenced vendor stalls in Anarkali & Raja Bazaar',
    status: 'optimal',
  },
  {
    id: 'sindh',
    nameEn: 'Sindh Province',
    nameUrdu: 'سندھ (30 اضلاع)',
    districtsCount: 30,
    totalVendors: 38400,
    activeSlots: 34100,
    complianceRate: 94.8,
    activePatrols: 12,
    keyBazaars: ['Empress Market Saddar Karachi', 'Shahi Bazaar Hyderabad', 'Sarafa Sukkur'],
    captionUrdu: 'صدر کراچی اور حیدرآباد کے گرین فروٹ و سبزی تاجر',
    captionEn: 'Verified green fruit and commodity hawkers in Saddar Karachi',
    status: 'optimal',
  },
  {
    id: 'kpk',
    nameEn: 'Khyber Pakhtunkhwa',
    nameUrdu: 'خیبر پختونخوا (35 اضلاع)',
    districtsCount: 35,
    totalVendors: 14800,
    activeSlots: 13200,
    complianceRate: 96.2,
    activePatrols: 6,
    keyBazaars: ['Qissa Khwani Peshawar', 'Saddar Bazar Abbottabad', 'Mingora Bazaar Swat'],
    captionUrdu: 'قصہ خوانی پشاور کے روایتی قہوہ خانے اور ڈرائی فروٹ دکاندار',
    captionEn: 'Traditional dry-fruit and tea merchants in Qissa Khwani Peshawar',
    status: 'optimal',
  },
  {
    id: 'balochistan',
    nameEn: 'Balochistan Province',
    nameUrdu: 'بلوچستان (36 اضلاع)',
    districtsCount: 36,
    totalVendors: 5800,
    activeSlots: 5100,
    complianceRate: 93.5,
    activePatrols: 4,
    keyBazaars: ['Liaquat Bazaar Quetta', 'Shahi Bazaar Gwadar', 'Turbat Center'],
    captionUrdu: 'لیاقت بازار کوئٹہ اور گوادر فری زون کے رجسٹرڈ دستکار',
    captionEn: 'Registered dry-fruit and artisanal hawkers in Liaquat Bazaar Quetta',
    status: 'expanding',
  },
  {
    id: 'ict',
    nameEn: 'Islamabad Capital Territory',
    nameUrdu: 'وفاقی دارالحکومت اسلام آباد',
    districtsCount: 1,
    totalVendors: 4200,
    activeSlots: 4050,
    complianceRate: 99.1,
    activePatrols: 5,
    keyBazaars: ['F-10 Markaz', 'G-9 Karachi Company', 'Aabpara Market', 'Melody Food Street'],
    captionUrdu: 'ایف ٹین اور جی نائن مرکز میں سمارٹ ڈیجیٹل کیو آر بیجز',
    captionEn: 'Smart digital QR badges in F-10 and G-9 Markaz Islamabad',
    status: 'optimal',
  },
  {
    id: 'gb_ajk',
    nameEn: 'Gilgit-Baltistan & AJK',
    nameUrdu: 'گلگت بلتستان و آزاد کشمیر (20 اضلاع)',
    districtsCount: 20,
    totalVendors: 3900,
    activeSlots: 3600,
    complianceRate: 98.0,
    activePatrols: 3,
    keyBazaars: ['Naya Bazaar Gilgit', 'Main Bazaar Skardu', 'Bank Road Muzaffarabad', 'Chowk Shaheedan Mirpur'],
    captionUrdu: 'مظفرآباد اور سکردو کے کشمیری و شمالی روایتی بازار',
    captionEn: 'Traditional mountain produce and crafts across Muzaffarabad & Skardu',
    status: 'optimal',
  },
];

// Cartographic projection function for authentic Pakistan coordinates in SVG
export const projectPakistanGeo = (lat: number, lng: number, width = 740, height = 440) => {
  // Bounding box for Pakistan: lng 60.5 to 77.8, lat 23.5 to 37.5
  const minLng = 60.5;
  const maxLng = 77.8;
  const minLat = 23.5;
  const maxLat = 37.5;
  const x = ((lng - minLng) / (maxLng - minLng)) * (width - 70) + 35;
  const y = ((maxLat - lat) / (maxLat - minLat)) * (height - 60) + 30;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
};

export const PakistanNationalMapView: React.FC<PakistanNationalMapViewProps> = ({
  lang,
  onOpenCitySlotsMap,
  onOpenLocate,
  isSequenceMode = false,
  userName,
  currentRole,
  onContinueToPresentation,
  onSkipToPlatform,
  onLogout,
}) => {
  const isUrdu = lang === 'ur';
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('punjab');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high_compliance' | 'active_patrol'>('all');
  const [searchCity, setSearchCity] = useState('');
  const [mapLayer, setMapLayer] = useState<'clustered' | 'tactical' | 'satellite' | 'street_view'>('clustered');
  const [clusterFilter, setClusterFilter] = useState<'all' | 'vendors' | 'alerts' | 'patrols'>('all');
  const [selectedStreetBazaar, setSelectedStreetBazaar] = useState<string>('raja_bazaar');
  const [activeMarkerModal, setActiveMarkerModal] = useState<ClusterPoint | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const provinceLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Compile full set of nationwide points for marker clustering
  const allClusterPoints: ClusterPoint[] = React.useMemo(() => {
    const points: ClusterPoint[] = [];

    // 1. All vendor slots from major Pakistan city bazaars
    PAKISTAN_CITY_SLOTS_DATA.forEach(city => {
      city.zones.forEach(zone => {
        zone.slots.forEach(slot => {
          points.push({
            id: `vendor-${slot.id}`,
            lat: slot.lat,
            lng: slot.lng,
            type: 'vendor',
            titleEn: `${slot.assignedVendorName} (${slot.slotNumber})`,
            titleUrdu: `${slot.assignedVendorNameUrdu || slot.assignedVendorName} (${slot.slotNumber})`,
            subtitleEn: `${slot.marketName}, ${city.cityName}`,
            subtitleUrdu: `${slot.marketName}، ${city.cityNameUrdu}`,
            categoryIcon: slot.categoryIcon,
            status: slot.status,
            data: slot,
          });
        });
      });
    });

    // 2. Nationwide high-priority violation alerts
    const violationAlerts: Array<{
      id: string;
      lat: number;
      lng: number;
      variance: number;
      commodityEn: string;
      commodityUrdu: string;
      marketEn: string;
      marketUrdu: string;
    }> = [
      { id: 'alert-rwp-1', lat: 33.5982, lng: 73.0570, variance: 18, commodityEn: 'Potatoes & Onions', commodityUrdu: 'آلو و پیاز', marketEn: 'Raja Bazaar Rawalpindi', marketUrdu: 'راجہ بازار راولپنڈی' },
      { id: 'alert-lhr-1', lat: 31.5662, lng: 74.3148, variance: 14, commodityEn: 'Flour & Sugar', commodityUrdu: 'آٹا و چینی', marketEn: 'Anarkali Bazaar Lahore', marketUrdu: 'انارکلی بازار لاہور' },
      { id: 'alert-khi-1', lat: 24.8620, lng: 67.0105, variance: 19, commodityEn: 'Poultry & Eggs', commodityUrdu: 'مرغی و انڈے', marketEn: 'Empress Market Saddar Karachi', marketUrdu: 'ایم Empress مارکیٹ صدر کراچی' },
      { id: 'alert-pew-1', lat: 34.0090, lng: 71.5790, variance: 12, commodityEn: 'Cooking Oil', commodityUrdu: 'کوکنگ آئل', marketEn: 'Qissa Khwani Peshawar', marketUrdu: 'قصہ خوانی بازار پشاور' },
      { id: 'alert-qta-1', lat: 30.1805, lng: 66.9760, variance: 16, commodityEn: 'Dry Fruits & Pulses', commodityUrdu: 'ڈرائی فروٹ و دالیں', marketEn: 'Liaquat Bazaar Quetta', marketUrdu: 'لیاقت بازار کوئٹہ' },
      { id: 'alert-isb-1', lat: 33.6930, lng: 73.0130, variance: 9, commodityEn: 'Dairy Milk & Yogurt', commodityUrdu: 'دودھ و دہی', marketEn: 'F-10 Markaz Islamabad', marketUrdu: 'ایف ٹین مرکز اسلام آباد' },
      { id: 'alert-mul-1', lat: 30.1980, lng: 71.4720, variance: 15, commodityEn: 'Red Chillies & Spices', commodityUrdu: 'سرخ مرچ و مصالحہ جات', marketEn: 'Haram Gate Multan', marketUrdu: 'حرم گیٹ ملتان' },
      { id: 'alert-fsd-1', lat: 31.4185, lng: 73.0790, variance: 13, commodityEn: 'Lentils & Grains', commodityUrdu: 'دالیں و اجناس', marketEn: 'Ghanta Ghar Faisalabad', marketUrdu: 'گھنٹہ گھر فیصل آباد' },
    ];

    violationAlerts.forEach(a => {
      points.push({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        type: 'alert',
        titleEn: `⚠️ Rate Violation (+${a.variance}%)`,
        titleUrdu: `⚠️ زائد قیمت شکایت (+${a.variance}%)`,
        subtitleEn: `${a.commodityEn} • ${a.marketEn}`,
        subtitleUrdu: `${a.commodityUrdu} • ${a.marketUrdu}`,
        variancePct: a.variance,
        data: a,
      });
    });

    // 3. Active PERA Patrol mobile squad units
    PATROL_POINTS.forEach(p => {
      points.push({
        id: `patrol-${p.id}`,
        lat: p.lat,
        lng: p.lng,
        type: 'patrol',
        titleEn: p.name,
        titleUrdu: p.name,
        subtitleEn: `${p.status} • Speed: ${p.speed}`,
        subtitleUrdu: `${p.status} • رفتار: ${p.speed}`,
        status: p.status,
        data: p,
      });
    });

    return points;
  }, []);

  // Filter points based on user's active cluster filter
  const visibleClusterPoints = React.useMemo(() => {
    if (clusterFilter === 'vendors') return allClusterPoints.filter(p => p.type === 'vendor');
    if (clusterFilter === 'alerts') return allClusterPoints.filter(p => p.type === 'alert');
    if (clusterFilter === 'patrols') return allClusterPoints.filter(p => p.type === 'patrol');
    return allClusterPoints;
  }, [allClusterPoints, clusterFilter]);

  // Leaflet map initialization & cluster rendering
  useEffect(() => {
    if (mapLayer !== 'clustered') return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30.3753, 69.3451],
        zoom: 6,
        minZoom: 4,
        maxZoom: 19,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | PERA National Telemetry',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      const polyLayerGroup = L.layerGroup().addTo(map);
      clusterLayerGroupRef.current = layerGroup;
      provinceLayerGroupRef.current = polyLayerGroup;
      mapInstanceRef.current = map;

      // Authentic Pakistan provincial boundary overlays
      PROVINCE_POLYGONS.forEach(prov => {
        const poly = L.polygon(prov.coords as [number, number][], {
          color: '#10B981',
          weight: 2,
          fillColor: '#059669',
          fillOpacity: 0.12,
          dashArray: '4, 4'
        }).addTo(polyLayerGroup);

        poly.bindTooltip(`
          <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: bold; color: #04231A; padding: 2px 4px;">
            ${isUrdu ? prov.nameUrdu : prov.nameEn}
          </div>
        `, { permanent: false, direction: 'center', opacity: 0.95 });

        poly.on('click', () => {
          map.flyTo(prov.center, 7, { duration: 0.8 });
          const matching = PROVINCE_DATA.find(p => p.id === prov.id || (prov.id === 'kpk' && p.id === 'kpk') || ((prov.id === 'gb' || prov.id === 'ajk') && p.id === 'gb_ajk'));
          if (matching) setSelectedProvinceId(matching.id);
        });
      });

      const renderCurrentClusters = () => {
        if (!clusterLayerGroupRef.current || !mapInstanceRef.current) return;
        clusterLayerGroupRef.current.clearLayers();

        const clusters = calculateClusters(visibleClusterPoints, mapInstanceRef.current, 60);

        clusters.forEach(cluster => {
          const icon = createClusterIcon(cluster, isUrdu);
          const marker = L.marker([cluster.lat, cluster.lng], { icon });

          marker.on('click', () => {
            if (cluster.isCluster) {
              const nextZoom = Math.min(map.getZoom() + 2, 18);
              map.flyTo([cluster.lat, cluster.lng], nextZoom, { duration: 0.8 });
            } else {
              setActiveMarkerModal(cluster.items[0]);
            }
          });

          clusterLayerGroupRef.current?.addLayer(marker);
        });
      };

      map.on('moveend', renderCurrentClusters);
      map.on('zoomend', renderCurrentClusters);
      renderCurrentClusters();
    } else {
      // Re-render when visible points change
      const map = mapInstanceRef.current;
      if (clusterLayerGroupRef.current && map) {
        clusterLayerGroupRef.current.clearLayers();
        const clusters = calculateClusters(visibleClusterPoints, map, 60);

        clusters.forEach(cluster => {
          const icon = createClusterIcon(cluster, isUrdu);
          const marker = L.marker([cluster.lat, cluster.lng], { icon });

          marker.on('click', () => {
            if (cluster.isCluster) {
              const nextZoom = Math.min(map.getZoom() + 2, 18);
              map.flyTo([cluster.lat, cluster.lng], nextZoom, { duration: 0.8 });
            } else {
              setActiveMarkerModal(cluster.items[0]);
            }
          });

          clusterLayerGroupRef.current?.addLayer(marker);
        });
      }
    }

    return () => {
      // Keep map instance alive during tab changes for smooth performance
    };
  }, [mapLayer, visibleClusterPoints, isUrdu]);

  const streetBazaars = [
    { id: 'raja_bazaar', nameEn: 'Raja Bazaar, Rawalpindi', nameUrdu: 'راجہ بازار، راولپنڈی', lat: 33.5982, lng: 73.0570, descEn: 'Historic commercial artery with 1,200+ regulated 6x4 ft slots' },
    { id: 'anarkali', nameEn: 'Anarkali Bazaar, Lahore', nameUrdu: 'انارکلی بازار، لاہور', lat: 31.5658, lng: 74.3142, descEn: 'Oldest trading corridor with 100% digital QR price verification' },
    { id: 'empress_market', nameEn: 'Empress Market Saddar, Karachi', nameUrdu: 'ایم Empress مارکیٹ صدر، کراچی', lat: 24.8617, lng: 67.0105, descEn: 'Heritage trading hub with DC price ceiling compliance' },
    { id: 'qissa_khwani', nameEn: 'Qissa Khwani, Peshawar', nameUrdu: 'قصہ خوانی، پشاور', lat: 34.0090, lng: 71.5790, descEn: 'Traditional tea, dry-fruit and spice hawkers corridor' },
    { id: 'liaquat_bazaar', nameEn: 'Liaquat Bazaar, Quetta', nameUrdu: 'لیاقت بازار، کوئٹہ', lat: 30.1805, lng: 66.9760, descEn: 'Balochistan central handicraft and dry-produce market' },
    { id: 'f10_markaz', nameEn: 'F-10 Markaz, Islamabad', nameUrdu: 'ایف ٹین مرکز، اسلام آباد', lat: 33.6930, lng: 73.0130, descEn: 'Smart digital kiosk corridor with solar awning integration' },
  ];

  const currentStreetBazaar = streetBazaars.find(b => b.id === selectedStreetBazaar) || streetBazaars[0];

  const selectedProvince = PROVINCE_DATA.find((p) => p.id === selectedProvinceId) || PROVINCE_DATA[0];

  const handleSpeakOverview = () => {
    const text = isUrdu
      ? `قومی جغرافیائی نقشہ برائے کنیکٹڈ پاکستان۔ پورے پاکستان میں 1 لاکھ 24 ہزار سے زائد ریڑھی بانوں کے جیو فینس سلاٹس لائیو فعال ہیں۔ پنجاب، سندھ، خیبر پختونخوا، بلوچستان، اسلام آباد، گلگت بلتستان اور آزاد کشمیر مکمل تحفظ کے ساتھ منسلک ہیں۔`
      : `Connected Pakistan National Geospatial Map. Visualizing 124,500+ protected hawkers across Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad ICT, Gilgit-Baltistan, and Azad Jammu and Kashmir.`;
    speechService.speak(text, { lang: isUrdu ? 'ur' : 'en' });
  };

  const filteredCities = PAKISTAN_CITIES.filter(c => 
    c.nameEn.toLowerCase().includes(searchCity.toLowerCase()) || 
    c.nameUrdu.includes(searchCity) ||
    c.provinceEn.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sequence Step Tracker Bar (Post-Login -> Map -> Video Presentation -> Platform Entry) */}
      {isSequenceMode && (
        <div className="bg-[#04231A] border-2 border-[#E3A82B] rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden animate-fadeUp">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#E3A82B] text-[#04231A] text-xs font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {isUrdu ? 'مرحلہ 1 از 2 • لاگ اِن مکمل' : 'Step 1 of 2 • Logged In'}
                </span>
                <span className="text-xs text-emerald-300 font-bold bg-[#0B4A31] border border-[#178A52] px-2.5 py-0.5 rounded-full">
                  {userName ? (isUrdu ? `خوش آمدید، ${userName}` : `Welcome, ${userName}`) : (isUrdu ? 'قومی آپریشنز نقشہ' : 'National Operations Map')}
                </span>
                {currentRole && (
                  <span className="text-[11px] text-[#E3A82B] font-mono bg-white/10 px-2 py-0.5 rounded-full uppercase">
                    Role: {currentRole}
                  </span>
                )}
              </div>
              <h3 className="font-sora font-extrabold text-xl text-white">
                {isUrdu ? 'پلیٹ فارم میں داخلے اور ویڈیو پریزنٹیشن سے قبل: پاکستان اسٹریٹجک نقشہ' : 'Strategic Pakistan Geospatial Radar & Operations Map'}
              </h3>
              <p className="text-xs text-[#DCEFE4] font-urdu max-w-2xl">
                {isUrdu 
                  ? 'ملک بھر کے 30 اضلاع، 124,000+ فعال ریڑھی بان سلاٹس اور پیٹرول یونٹس کا جائزہ لیں۔ اس کے بعد وژن ویڈیو پریزنٹیشن دیکھیں۔'
                  : 'Review the live operational telemetry across Pakistan\'s 30 districts before watching the cinematic vision presentation.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {onContinueToPresentation && (
                <button
                  id="btn-continue-to-video-presentation"
                  onClick={onContinueToPresentation}
                  className="bg-[#E3A82B] hover:bg-[#F3B740] text-[#04231A] font-sora font-extrabold text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 transition-all active:scale-95"
                >
                  <Film className="w-4 h-4 text-[#04231A]" />
                  <span>{isUrdu ? 'ویڈیو پریزنٹیشن کی طرف بڑھیں' : 'Continue to Video Presentation'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {onSkipToPlatform && (
                <button
                  id="btn-skip-direct-platform"
                  onClick={onSkipToPlatform}
                  className="bg-[#0B4A31] hover:bg-[#178A52] text-white border border-[#178A52] font-sora font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                  <span>{isUrdu ? 'براہ راست ڈیش بورڈ' : 'Direct to Platform'}</span>
                </button>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-rose-900/50 text-white/80 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Stepper Dots visual */}
          <div className="mt-4 pt-3 border-t border-[#178A52]/40 flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E3A82B] animate-pulse" />
            <span className="font-bold text-[#E3A82B]">{isUrdu ? '1. قومی نقشہ (موجودہ)' : '1. National Map (Current)'}</span>
            <span className="text-slate-500">→</span>
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="text-slate-400">{isUrdu ? '2. ویڈیو پریزنٹیشن' : '2. Video Presentation'}</span>
            <span className="text-slate-500">→</span>
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="text-slate-400">{isUrdu ? '3. کنسول ڈیش بورڈ' : '3. Console Dashboard'}</span>
          </div>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-[#04231A] rounded-3xl p-6 sm:p-8 border-2 border-[#178A52]/40 shadow-2xl text-[#FCFAF3] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#178A52]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2">
              <PakistanFlagEmblem size="md" variant="flag" rounded="md" className="ring-2 ring-amber-400/70 shadow-lg" />
              <Emblem size="lg" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold bg-[#E3A82B] text-[#04231A] px-2.5 py-0.5 rounded-full">
                  NATIONAL GEOSPATIAL RADAR
                </span>
                <span className="text-xs bg-[#178A52] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                  <span>30 Districts Live</span>
                </span>
              </div>
              <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-white mt-1">
                {isUrdu ? 'قومی جغرافیائی کوریج نقشہ — ریاستِ پاکستان' : 'Pakistan National Geospatial Coverage'}
              </h2>
              <p className="text-xs sm:text-sm text-[#DCEFE4]/80 font-urdu mt-1 max-w-2xl">
                {isUrdu 
                  ? 'خیبر سے کراچی، گوادر سے گلگت و آزاد کشمیر تک 124,500+ ریڑھی بانوں کے مائیکرو سلاٹس اور ڈی سی پرائس زونز کا مکمل خودمختار نقشہ۔' 
                  : 'Sovereign digital mapping uniting 124,500+ protected hawkers, DC rates, and live enforcement across all 30 districts.'}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleSpeakOverview}
              className="bg-[#0B4A31] hover:bg-[#178A52] text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-[#178A52] flex items-center gap-1.5 shadow transition-transform active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-[#E3A82B]" />
              <span>{isUrdu ? 'آواز میں سنیں' : 'Audio Briefing'}</span>
            </button>

            <button
              onClick={() => onOpenCitySlotsMap && onOpenCitySlotsMap()}
              className="bg-[#E3A82B] hover:bg-[#F4D58D] text-[#04231A] px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isUrdu ? 'شہری مائیکرو جیو فینسنگ نقشہ کھولیں' : 'Open Micro-Geofence Map'}</span>
            </button>
          </div>
        </div>

        {/* 4 National Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#178A52]/30 text-xs">
          <div className="bg-[#0B4A31]/60 p-3 rounded-2xl border border-[#178A52]/40">
            <span className="text-[11px] text-[#DCEFE4]/70 font-urdu block">{isUrdu ? 'کل رجسٹرڈ دکاندار' : 'Protected Vendors'}</span>
            <strong className="text-lg text-white font-sora mt-0.5 block">124,500+</strong>
            <span className="text-[10px] text-[#E3A82B]">100% Zero-Eviction Shield</span>
          </div>

          <div className="bg-[#0B4A31]/60 p-3 rounded-2xl border border-[#178A52]/40">
            <span className="text-[11px] text-[#DCEFE4]/70 font-urdu block">{isUrdu ? 'قومی تعمیل کی شرح' : 'National Compliance'}</span>
            <strong className="text-lg text-[#E3A82B] font-sora mt-0.5 block">96.8%</strong>
            <span className="text-[10px] text-emerald-400">Within ±3% DC Fair Margin</span>
          </div>

          <div className="bg-[#0B4A31]/60 p-3 rounded-2xl border border-[#178A52]/40">
            <span className="text-[11px] text-[#DCEFE4]/70 font-urdu block">{isUrdu ? 'فعال پیٹرول اسکواڈز' : 'Live Patrol Squads'}</span>
            <strong className="text-lg text-[#3D7EA6] font-sora mt-0.5 block">45 Squads</strong>
            <span className="text-[10px] text-[#DCEFE4]/70">GPS Telemetry Sync</span>
          </div>

          <div className="bg-[#0B4A31]/60 p-3 rounded-2xl border border-[#178A52]/40">
            <span className="text-[11px] text-[#DCEFE4]/70 font-urdu block">{isUrdu ? 'اوسط جوابی وقت' : 'Avg Response Time'}</span>
            <strong className="text-lg text-white font-sora mt-0.5 block">9.2 Mins</strong>
            <span className="text-[10px] text-emerald-400">Rapid Dispatch Protocol</span>
          </div>
        </div>
      </div>

      {/* Main Map & Province Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map & Province Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#04231A] rounded-3xl p-5 sm:p-6 border border-[#178A52]/30 shadow-xl text-white">
            {/* Map Header Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#178A52]/30">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#E3A82B]" />
                <h3 className="font-sora font-extrabold text-base sm:text-lg">
                  {isUrdu ? 'صوبائی زونز اور ہائی لیول کوریج' : 'Territorial Zones & High-Level Coverage'}
                </h3>
              </div>

              {/* Map Layer Switcher */}
              <div className="flex items-center gap-1 bg-[#0B4A31] p-1 rounded-xl border border-[#178A52]/40 text-xs overflow-x-auto">
                <button
                  onClick={() => setMapLayer('clustered')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    mapLayer === 'clustered' ? 'bg-[#178A52] text-white shadow ring-1 ring-[#E3A82B]' : 'text-[#DCEFE4]/70 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>{isUrdu ? 'کلسترڈ نقشہ (High-Perf)' : 'Clustered Map'}</span>
                </button>

                <button
                  onClick={() => setMapLayer('tactical')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                    mapLayer === 'tactical' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4]/70 hover:text-white'
                  }`}
                >
                  {isUrdu ? 'تکنیکی جائزہ' : 'Tactical'}
                </button>

                <button
                  onClick={() => setMapLayer('satellite')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                    mapLayer === 'satellite' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4]/70 hover:text-white'
                  }`}
                >
                  {isUrdu ? 'سیٹلائٹ' : 'Satellite'}
                </button>

                <button
                  onClick={() => setMapLayer('street_view')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    mapLayer === 'street_view' ? 'bg-[#178A52] text-white shadow ring-1 ring-[#E3A82B]' : 'text-[#DCEFE4]/70 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-[#E3A82B]" />
                  <span>{isUrdu ? 'اسٹریٹ ویو 360°' : 'Street View 360°'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Map Render Stage */}
            <div className="relative my-4 rounded-2xl bg-[#031E15] border-2 border-[#178A52]/40 overflow-hidden min-h-[420px]">
              
              {/* TAB 1: High-Performance Clustered Leaflet Map */}
              {mapLayer === 'clustered' && (
                <div className="relative w-full h-[450px]">
                  {/* Cluster Category Filter Pills Bar */}
                  <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-1.5 bg-[#04231A]/90 p-1.5 rounded-xl border border-[#178A52] backdrop-blur-md text-[11px] shadow-lg">
                    <button
                      onClick={() => setClusterFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        clusterFilter === 'all' ? 'bg-[#178A52] text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {isUrdu ? 'تمام مارکرز' : 'All Clusters'} ({allClusterPoints.length})
                    </button>
                    <button
                      onClick={() => setClusterFilter('vendors')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        clusterFilter === 'vendors' ? 'bg-[#178A52] text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>🏪</span>
                      <span>{isUrdu ? 'ریڑھی بان سلاٹس' : 'Stalls'}</span>
                    </button>
                    <button
                      onClick={() => setClusterFilter('alerts')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        clusterFilter === 'alerts' ? 'bg-red-700 text-white' : 'text-red-300 hover:text-white'
                      }`}
                    >
                      <span>⚠️</span>
                      <span>{isUrdu ? 'زائد قیمت الرٹس' : 'Violations'}</span>
                    </button>
                    <button
                      onClick={() => setClusterFilter('patrols')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        clusterFilter === 'patrols' ? 'bg-blue-700 text-white' : 'text-blue-300 hover:text-white'
                      }`}
                    >
                      <span>🚓</span>
                      <span>{isUrdu ? 'پیٹرول اسکواڈز' : 'Patrols'}</span>
                    </button>
                  </div>

                  {/* Leaflet Map DOM Node */}
                  <div ref={mapContainerRef} className="w-full h-full" />

                  {/* Active Selected Marker Inspection Modal Overlay */}
                  {activeMarkerModal && (
                    <div className="absolute bottom-3 left-3 right-3 z-[500] bg-[#04231A]/95 border-2 border-[#178A52] rounded-2xl p-4 text-white shadow-2xl backdrop-blur-md animate-fadeUp">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow shrink-0 ${
                            activeMarkerModal.type === 'alert' ? 'bg-red-600' :
                            activeMarkerModal.type === 'patrol' ? 'bg-blue-600' : 'bg-[#178A52]'
                          }`}>
                            {activeMarkerModal.type === 'alert' ? '⚠️' :
                             activeMarkerModal.type === 'patrol' ? '🚓' : (activeMarkerModal.categoryIcon || '🏪')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-white">
                                {isUrdu ? activeMarkerModal.titleUrdu : activeMarkerModal.titleEn}
                              </h5>
                              <span className="text-[10px] bg-[#E3A82B] text-[#04231A] font-extrabold px-1.5 py-0.2 rounded uppercase">
                                {activeMarkerModal.type}
                              </span>
                            </div>
                            <p className="text-xs text-[#DCEFE4] font-urdu mt-0.5">
                              {isUrdu ? activeMarkerModal.subtitleUrdu : activeMarkerModal.subtitleEn}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveMarkerModal(null)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/10"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#178A52]/40 text-xs">
                        <span className="text-[#E3A82B] font-mono text-[11px]">
                          GPS: {activeMarkerModal.lat.toFixed(4)}, {activeMarkerModal.lng.toFixed(4)}
                        </span>
                        <div className="flex items-center gap-2">
                          {activeMarkerModal.type === 'vendor' && onOpenCitySlotsMap && (
                            <button
                              onClick={() => {
                                onOpenCitySlotsMap(activeMarkerModal.data.slotNumber);
                                setActiveMarkerModal(null);
                              }}
                              className="bg-[#178A52] hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1 transition-all"
                            >
                              <span>{isUrdu ? 'سلاٹ ریڈار پر دیکھیں' : 'Inspect 6x4ft Slot'}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#E3A82B]" />
                            </button>
                          )}
                          <button
                            onClick={() => setActiveMarkerModal(null)}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl transition-all"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Street View 360° Bazaar Panorama */}
              {mapLayer === 'street_view' && (
                <div className="w-full h-[450px] flex flex-col bg-[#031E15]">
                  {/* Street Bazaar Switcher Bar */}
                  <div className="p-3 bg-[#04231A] border-b border-[#178A52]/40 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      <span className="text-[#E3A82B] font-bold shrink-0">{isUrdu ? 'بازار منتخب کریں:' : 'Select Bazaar:'}</span>
                      {streetBazaars.map(b => (
                        <button
                          key={b.id}
                          onClick={() => setSelectedStreetBazaar(b.id)}
                          className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                            selectedStreetBazaar === b.id
                              ? 'bg-[#178A52] text-white shadow ring-1 ring-[#E3A82B]'
                              : 'bg-[#0B4A31] text-[#DCEFE4] hover:bg-[#178A52]/50'
                          }`}
                        >
                          {isUrdu ? b.nameUrdu : b.nameEn}
                        </button>
                      ))}
                    </div>

                    <a
                      href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${currentStreetBazaar.lat},${currentStreetBazaar.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#E3A82B] text-[#04231A] px-3 py-1 rounded-xl font-bold text-xs hover:bg-[#F3B740] shadow shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'گوگل اسٹریٹ ویو میں کھولیں' : 'Open in Google Street View'}</span>
                    </a>
                  </div>

                  {/* Street View Embedded Container */}
                  <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
                    <iframe
                      title={`Street View ${currentStreetBazaar.nameEn}`}
                      src={`https://maps.google.com/maps?q=${currentStreetBazaar.lat},${currentStreetBazaar.lng}&layer=c&cbll=${currentStreetBazaar.lat},${currentStreetBazaar.lng}&cbp=11,0,0,0,0&output=svembed`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                    />

                    {/* Overlay info badge */}
                    <div className="absolute top-3 left-3 bg-[#04231A]/90 p-3 rounded-2xl border border-[#178A52] shadow-xl text-white max-w-sm pointer-events-none backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#E3A82B] animate-spin" />
                        <h4 className="font-bold text-xs text-white">
                          {isUrdu ? currentStreetBazaar.nameUrdu : currentStreetBazaar.nameEn}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#DCEFE4]/80 mt-1 font-urdu">
                        {currentStreetBazaar.descEn}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-300 font-mono">
                        <span>Lat: {currentStreetBazaar.lat}</span>
                        <span>•</span>
                        <span>Lng: {currentStreetBazaar.lng}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Satellite Google Map */}
              {mapLayer === 'satellite' && (
                <iframe
                  title="Pakistan Satellite Map"
                  src="https://maps.google.com/maps?q=Pakistan&t=k&z=6&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-[450px] rounded-xl border-0"
                  loading="lazy"
                />
              )}

              {/* TAB 4: Tactical Sovereign SVG Map of Pakistan */}
              {mapLayer === 'tactical' && (
                <div className="w-full h-full p-4 relative flex flex-col justify-between overflow-hidden">
                  {/* Grid Lines Pattern */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#178A52_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Province Quick Switcher Pills */}
                  <div className="relative z-10 flex items-center gap-1.5 flex-wrap pb-2 border-b border-[#178A52]/30">
                    {PROVINCE_DATA.map((prov) => {
                      const isSelected = selectedProvinceId === prov.id;
                      return (
                        <button
                          key={prov.id}
                          onClick={() => setSelectedProvinceId(prov.id)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#178A52] border border-[#E3A82B] text-white shadow-md'
                              : 'bg-[#0B4A31]/70 border border-[#178A52]/40 text-[#DCEFE4]/80 hover:text-white'
                          }`}
                        >
                          <span>{isUrdu ? prov.nameUrdu : prov.nameEn}</span>
                          <span className="ml-1 text-[10px] text-[#E3A82B] font-mono">({prov.complianceRate}%)</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Authentic SVG Map Stage of Pakistan */}
                  <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center my-2">
                    <svg
                      viewBox="0 0 740 440"
                      className="w-full h-auto max-h-[360px] drop-shadow-2xl select-none"
                    >
                      <defs>
                        <radialGradient id="pakistanGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#04231A" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Ambient Glow Background */}
                      <ellipse cx="370" cy="220" rx="330" ry="180" fill="url(#pakistanGlow)" />

                      {/* International Neighbors Labels */}
                      {NEIGHBOURS.map(n => {
                        const pt = projectPakistanGeo(n.lat, n.lng, 740, 440);
                        return (
                          <text
                            key={n.name}
                            x={pt.x}
                            y={pt.y}
                            fill="#6E8578"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            letterSpacing="1"
                            textAnchor="middle"
                          >
                            {n.name.toUpperCase()}
                          </text>
                        );
                      })}

                      {/* Pakistan Provinces Geographic Polygons */}
                      {PROVINCE_POLYGONS.map(prov => {
                        const isSelected = selectedProvinceId === prov.id || 
                          (prov.id === 'kpk' && selectedProvinceId === 'kpk') || 
                          ((prov.id === 'gb' || prov.id === 'ajk') && selectedProvinceId === 'gb_ajk');
                        
                        const pts = prov.coords.map(([lat, lng]) => {
                          const pt = projectPakistanGeo(lat, lng, 740, 440);
                          return `${pt.x},${pt.y}`;
                        }).join(' ');

                        const centerPt = projectPakistanGeo(prov.center[0], prov.center[1], 740, 440);

                        return (
                          <g 
                            key={prov.id} 
                            className="cursor-pointer group" 
                            onClick={() => {
                              const matching = PROVINCE_DATA.find(p => p.id === prov.id || (prov.id === 'kpk' && p.id === 'kpk') || ((prov.id === 'gb' || prov.id === 'ajk') && p.id === 'gb_ajk'));
                              if (matching) setSelectedProvinceId(matching.id);
                            }}
                          >
                            <polygon
                              points={pts}
                              fill={isSelected ? '#178A52' : '#0B4A31'}
                              fillOpacity={isSelected ? 0.8 : 0.45}
                              stroke={isSelected ? '#E3A82B' : '#10B981'}
                              strokeWidth={isSelected ? 2.5 : 1.2}
                              strokeDasharray={isSelected ? 'none' : '4, 2'}
                              className="transition-all duration-200 group-hover:fill-opacity-80"
                            />
                            {/* Province Label */}
                            <text
                              x={centerPt.x}
                              y={centerPt.y}
                              fill={isSelected ? '#FFFFFF' : '#DCEFE4'}
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="pointer-events-none drop-shadow"
                            >
                              {isUrdu ? prov.nameUrdu : prov.nameEn}
                            </text>
                          </g>
                        );
                      })}

                      {/* Major Pakistan Cities Overlay */}
                      {PAKISTAN_CITIES.map(city => {
                        const pt = projectPakistanGeo(city.lat, city.lng, 740, 440);
                        const isCap = city.id === 'isb';
                        const cityName = isUrdu ? city.nameUrdu : city.nameEn;

                        return (
                          <g
                            key={city.id}
                            className="cursor-pointer group"
                            onClick={() => {
                              if (onOpenLocate) onOpenLocate(city.nameEn);
                              const matchingProv = PROVINCE_DATA.find(p => 
                                p.nameEn.toLowerCase().includes(city.provinceEn.toLowerCase()) || 
                                city.provinceEn.toLowerCase().includes(p.nameEn.toLowerCase())
                              );
                              if (matchingProv) setSelectedProvinceId(matchingProv.id);
                            }}
                          >
                            {isCap && (
                              <circle cx={pt.x} cy={pt.y} r="10" fill="none" stroke="#E3A82B" strokeWidth="1.5" className="animate-ping opacity-60" />
                            )}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isCap ? 5 : 3.5}
                              fill={isCap ? '#E3A82B' : '#34D399'}
                              stroke="#04231A"
                              strokeWidth="1.5"
                              className="transition-transform group-hover:scale-125"
                            />
                            <text
                              x={pt.x + 7}
                              y={pt.y + 3}
                              fill="#FFFFFF"
                              fontSize="9.5"
                              fontWeight={isCap ? '800' : '600'}
                              fontFamily="system-ui, sans-serif"
                              className="drop-shadow pointer-events-none"
                            >
                              {cityName}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Province Stats Summary & Link to City Micro-Geofence */}
                  <div className="bg-[#0B4A31] p-3.5 rounded-2xl border border-[#E3A82B]/50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Navigation className="w-5 h-5 text-[#E3A82B] shrink-0 animate-pulse" />
                      <div>
                        <h5 className="font-bold text-xs text-white">
                          {isUrdu ? `${selectedProvince.nameUrdu}: ${selectedProvince.activeSlots.toLocaleString()} فعال ریڑھی بان سلاٹس` : `${selectedProvince.nameEn}: ${selectedProvince.activeSlots.toLocaleString()} Active Hawkers`}
                        </h5>
                        <p className="text-[11px] text-[#DCEFE4]/70 font-urdu">
                          {isUrdu ? `تعمیل کی شرح ${selectedProvince.complianceRate}% • ${selectedProvince.activePatrols} پیٹرول اسکواڈز` : `Compliance: ${selectedProvince.complianceRate}% • ${selectedProvince.activePatrols} Squads`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenCitySlotsMap && onOpenCitySlotsMap()}
                      className="bg-[#178A52] hover:bg-[#178A52]/90 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 transition-transform"
                    >
                      <span>{isUrdu ? 'شہری سلاٹس دیکھیں' : 'Launch City Slots'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#E3A82B]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* City Live Search Bar */}
            <div className="mt-4 pt-4 border-t border-[#178A52]/30 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#DCEFE4]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder={isUrdu ? 'شہر، بازار یا زون تلاش کریں (مثلاً: لاہور، راولپنڈی، پشاور)...' : 'Search city or market (e.g. Lahore, Rawalpindi, Peshawar)...'}
                  className="w-full bg-[#0B4A31] border border-[#178A52]/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#DCEFE4]/50 focus:outline-none focus:border-[#E3A82B]"
                />
              </div>

              <button
                onClick={() => {
                  if (onOpenLocate && selectedProvince.keyBazaars[0]) {
                    onOpenLocate(selectedProvince.keyBazaars[0]);
                  }
                }}
                className="bg-[#0B4A31] hover:bg-[#178A52] text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-[#178A52] flex items-center gap-1.5 whitespace-nowrap"
              >
                <Eye className="w-4 h-4 text-[#E3A82B]" />
                <span>{isUrdu ? 'لائیو اسٹریٹ دیکھیں' : 'Street View'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Province Detail & Authentic People Imagery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Province Deep Dive Card */}
          <div className="bg-[#FCFAF3] rounded-3xl p-5 sm:p-6 border border-[#178A52]/20 shadow-xl text-[#132A21] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F6F2E7]">
              <div>
                <span className="text-[10px] text-[#5C6F63] uppercase font-bold tracking-wider">
                  {isUrdu ? 'منتخب صوبائی ریجن' : 'Selected Territory'}
                </span>
                <h3 className="font-sora font-extrabold text-xl text-[#04231A]">
                  {isUrdu ? selectedProvince.nameUrdu : selectedProvince.nameEn}
                </h3>
              </div>
              <span className="bg-[#178A52]/10 text-[#178A52] border border-[#178A52]/30 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                {selectedProvince.districtsCount} Districts Active
              </span>
            </div>

            {/* Clean National Telemetry Banner */}
            <div className="rounded-2xl p-4 bg-[#031E15] border border-[#178A52]/40 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-urdu text-emerald-300">
                  {isUrdu ? selectedProvince.captionUrdu : selectedProvince.captionEn}
                </span>
                <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  VRF-2026 Zone
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-[#04231A] border border-[#178A52]/30">
                  <span className="text-[10px] text-slate-400 block">{isUrdu ? 'فعال ریڑھی بان' : 'Total Hawkers'}</span>
                  <strong className="text-sm font-mono text-white">{selectedProvince.totalVendors.toLocaleString()}</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#04231A] border border-[#178A52]/30">
                  <span className="text-[10px] text-slate-400 block">{isUrdu ? 'ڈی سی ہم آہنگی' : 'DC Compliance'}</span>
                  <strong className="text-sm font-mono text-emerald-400">{selectedProvince.complianceRate}%</strong>
                </div>
              </div>
            </div>

            {/* Key Markets / Bazaars List */}
            <div>
              <h5 className="text-xs font-bold text-[#04231A] mb-2 font-urdu">
                {isUrdu ? 'نمایاں ریگولیٹڈ تجارتی مراکز و بازار:' : 'Key Regulated Commercial Bazaars:'}
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedProvince.keyBazaars.map((bazaar, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onOpenLocate) onOpenLocate(bazaar);
                    }}
                    className="bg-white hover:bg-[#DCEFE4] text-[#04231A] border border-[#178A52]/20 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <MapPin className="w-3 h-3 text-[#178A52]" />
                    <span>{bazaar}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F6F2E7] text-center text-xs">
              <div className="p-2 rounded-xl bg-white border border-[#178A52]/10">
                <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'وینڈرز' : 'Vendors'}</span>
                <strong className="text-[#04231A] font-bold">{selectedProvince.totalVendors.toLocaleString()}</strong>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#178A52]/10">
                <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'تعمیل ریٹ' : 'Compliance'}</span>
                <strong className="text-[#178A52] font-bold">{selectedProvince.complianceRate}%</strong>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#178A52]/10">
                <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'پیٹرول ٹیمیں' : 'Patrols'}</span>
                <strong className="text-[#E3A82B] font-bold">{selectedProvince.activePatrols} Active</strong>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              onClick={() => onOpenCitySlotsMap && onOpenCitySlotsMap()}
              className="w-full bg-[#178A52] hover:bg-[#178A52]/90 text-white py-2.5 rounded-xl text-xs font-extrabold shadow flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Navigation className="w-4 h-4 text-[#E3A82B]" />
              <span>{isUrdu ? 'اس ریجن کے مائیکرو سلاٹس نقشے پر زوم کریں' : 'Zoom into Regional Micro-Slots'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sequence Progression Banner (Next: Video Presentation) */}
      {isSequenceMode && (
        <div className="bg-gradient-to-r from-[#04231A] via-[#0B4A31] to-[#04231A] border-2 border-[#E3A82B] rounded-3xl p-6 shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-5 animate-fadeUp">
          <div className="text-left space-y-1">
            <div className="inline-flex items-center gap-2 bg-[#E3A82B] text-[#04231A] text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
              <span>{isUrdu ? 'اگلا مرحلہ • Step 2' : 'Next Step • Step 2'}</span>
            </div>
            <h4 className="font-sora font-extrabold text-lg text-white">
              {isUrdu ? 'کنیکٹڈ پاکستان سنیماٹک وژن اور ویڈیو بریفنگ روم' : 'Connected Pakistan Cinematic Vision & Video Briefing Room'}
            </h4>
            <p className="text-xs text-[#DCEFE4] font-urdu max-w-xl">
              {isUrdu 
                ? 'فخر مشتاق کا قومی وژن، ہولوگرافک فلم، اور چاروں پارٹنرز کے حقوق کی مکمل ویڈیو بریفنگ دیکھیں۔'
                : 'Watch the vision briefing, holographic film, and team architecture before entering the full console dashboard.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onContinueToPresentation && (
              <button
                id="btn-bottom-continue-presentation"
                onClick={onContinueToPresentation}
                className="bg-[#E3A82B] hover:bg-[#F3B740] text-[#04231A] font-sora font-extrabold text-sm px-7 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 transition-all active:scale-95"
              >
                <Film className="w-4 h-4 text-[#04231A]" />
                <span>{isUrdu ? 'ویڈیو پریزنٹیشن دیکھیں' : 'Watch Video Presentation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onSkipToPlatform && (
              <button
                id="btn-bottom-skip-platform"
                onClick={onSkipToPlatform}
                className="bg-[#178A52] hover:bg-[#1f9d5f] text-white font-sora font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl border border-[#178A52] shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <span>{isUrdu ? 'براہ راست کنسول میں داخل ہوں' : 'Enter Console Directly'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
