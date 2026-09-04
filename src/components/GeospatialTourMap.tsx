import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Radio, Map as MapIcon, Eye, Search, 
  MapPin, Shield, Zap, Compass, CheckCircle2, 
  ArrowRight, ExternalLink, RefreshCw, Store, 
  Layers, Navigation, AlertCircle, Camera, Check, 
  ChevronRight, Sparkles, Building2, MapPinned
} from 'lucide-react';
import L from 'leaflet';
import { PAKISTAN_CITIES, PROVINCE_POLYGONS, PATROL_POINTS } from '../lib/pakistanData';
import { Language } from '../types';
import { PakistanFlagEmblem } from './PakistanFlagEmblem';

interface GeospatialTourMapProps {
  lang: Language;
  onOpenLocate?: (place: string) => void;
}

interface StreetDetail {
  id: string;
  nameEn: string;
  nameUrdu: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  registeredVendors: number;
  complianceRate: number;
  activeSquad: string;
  bazaarType: string;
  descriptionEn: string;
  descriptionUrdu: string;
  topStaples: { name: string; dcRate: number; marketPrice: number }[];
  photoUrl: string;
  gmapsUrl: string;
}

const HISTORIC_BAZAARS: Record<string, StreetDetail> = {
  rwp: {
    id: 'rwp',
    nameEn: 'Rawalpindi — Raja Bazaar & Fawara Chowk',
    nameUrdu: 'راولپنڈی — راجہ بازار و فوارہ چوک تجارتی مرکز',
    city: 'Rawalpindi',
    province: 'Punjab',
    lat: 33.6007,
    lng: 73.0679,
    registeredVendors: 420,
    complianceRate: 98.2,
    activeSquad: 'Price Squad #4 (Sub-Divisional Magistrate)',
    bazaarType: 'Historic Commercial & Vegetable Core',
    descriptionEn: 'Major central hub featuring hundreds of verified micro-geofenced produce vendors, grain markets, and wholesale groceries.',
    descriptionUrdu: 'راولپنڈی کا قدیم ترین و مصروف ترین تجارتی مرکز جہاں سینکڑوں تصدیق شدہ سبزی و کریانہ دکاندار فعال ہیں۔',
    topStaples: [
      { name: 'آٹا 10 کلو (Flour 10kg)', dcRate: 1350, marketPrice: 1350 },
      { name: 'پیاز (Fresh Onion)', dcRate: 92, marketPrice: 95 },
      { name: 'ٹماٹر (Tomato)', dcRate: 130, marketPrice: 130 },
      { name: 'چینی (Sugar)', dcRate: 138, marketPrice: 140 }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80',
    gmapsUrl: 'https://maps.google.com/?q=Raja+Bazaar+Rawalpindi'
  },
  lhr: {
    id: 'lhr',
    nameEn: 'Lahore — Historic Anarkali & Tollington Market',
    nameUrdu: 'لاہور — تاریخی انارکلی بازار و ٹولنگٹن مارکیٹ',
    city: 'Lahore',
    province: 'Punjab',
    lat: 31.5657,
    lng: 74.3142,
    registeredVendors: 680,
    complianceRate: 97.8,
    activeSquad: 'Patrol Squad Alpha (City Assistant Commissioner)',
    bazaarType: 'Heritage Retail & Food Commodity Corridor',
    descriptionEn: 'Over 200 years of trading heritage, now fully synchronized with Connected Pakistan digital QR price tags and digital scales.',
    descriptionUrdu: 'لاہور کا تاریخی فوڈ و تجارتی بازار، جہاں تمام ریڑھیاں کیو آر کوڈز اور ریٹ بورڈز سے لیس ہیں۔',
    topStaples: [
      { name: 'دودھ خالص (Milk 1L)', dcRate: 195, marketPrice: 200 },
      { name: 'دال چنا (Gram Pulse)', dcRate: 240, marketPrice: 240 },
      { name: 'چاول باسمتی (Basmati Rice)', dcRate: 290, marketPrice: 295 },
      { name: 'مرغی برائلر (Live Broiler)', dcRate: 385, marketPrice: 385 }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    gmapsUrl: 'https://maps.google.com/?q=Anarkali+Bazaar+Lahore'
  },
  khi: {
    id: 'khi',
    nameEn: 'Karachi — Saddar Bazaar & Empress Market',
    nameUrdu: 'کراچی — صدر بازار اور ایمپریس مارکیٹ',
    city: 'Karachi',
    province: 'Sindh',
    lat: 24.8615,
    lng: 67.0099,
    registeredVendors: 940,
    complianceRate: 95.6,
    activeSquad: 'South District Magistrate Rapid Patrol #7',
    bazaarType: 'Metropolitan Wholesale & Perishables Hub',
    descriptionEn: 'South Asia’s bustling maritime economic corridor with digital vendor pitches and real-time electronic rate boards.',
    descriptionUrdu: 'کراچی کا مرکزی بازار جہاں روزانہ ہزاروں شہری سرکاری ڈی سی ریٹس کے تحت خریداری کرتے ہیں۔',
    topStaples: [
      { name: 'آلو سفید (Potato)', dcRate: 68, marketPrice: 70 },
      { name: 'گھی / کوکنگ آئل (Cooking Oil)', dcRate: 510, marketPrice: 510 },
      { name: 'ادرک چائنہ (Ginger)', dcRate: 480, marketPrice: 490 },
      { name: 'دال مسور (Masoor Pulse)', dcRate: 270, marketPrice: 270 }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    gmapsUrl: 'https://maps.google.com/?q=Empress+Market+Karachi'
  },
  psh: {
    id: 'psh',
    nameEn: 'Peshawar — Qissa Khwani (Storytellers) Bazaar',
    nameUrdu: 'پشاور — قصہ خوانی بازار و چوک یادگار',
    city: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    lat: 34.0084,
    lng: 71.5785,
    registeredVendors: 310,
    complianceRate: 96.9,
    activeSquad: 'Peshawar Urban Magistrate Squad #2',
    bazaarType: 'Historic Spice, Tea & Commodity Market',
    descriptionEn: 'Famous trading crossroads connecting Silk Route heritage with modern digital price compliance.',
    descriptionUrdu: 'روایتی قہوہ خانوں اور ڈرائی فروٹ کے بیوپاری، 100 فیصد ڈیجیٹل رجسٹرڈ۔',
    topStaples: [
      { name: 'چائے پتی (Black Tea 900g)', dcRate: 1450, marketPrice: 1450 },
      { name: 'گوشت بکرا (Mutton 1kg)', dcRate: 1800, marketPrice: 1850 },
      { name: 'چینی (Sugar)', dcRate: 138, marketPrice: 138 },
      { name: 'دال ماش (Mash Pulse)', dcRate: 490, marketPrice: 490 }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
    gmapsUrl: 'https://maps.google.com/?q=Qissa+Khwani+Bazaar+Peshawar'
  },
  qta: {
    id: 'qta',
    nameEn: 'Quetta — Liaquat Bazaar Trade Corridor',
    nameUrdu: 'کوئٹہ — لیاقت بازار و قندھاری بازار تجارتی راہداری',
    city: 'Quetta',
    province: 'Balochistan',
    lat: 30.1798,
    lng: 66.9750,
    registeredVendors: 220,
    complianceRate: 94.7,
    activeSquad: 'Quetta City Price Magistrate Mobile Squad',
    bazaarType: 'Regional Wholesale & Fresh Produce Gateway',
    descriptionEn: 'Vital trade vein supplying fresh fruits, dry fruits, and essential grain staples across Balochistan.',
    descriptionUrdu: 'بلوچستان کا مرکزی سپلائی مرکز جہاں ڈی سی ریٹ لسٹ باقاعدگی سے آویزاں ہے۔',
    topStaples: [
      { name: 'سیب کالا کولو (Apples)', dcRate: 220, marketPrice: 220 },
      { name: 'آٹا 20 کلو (Flour 20kg)', dcRate: 2650, marketPrice: 2650 },
      { name: 'دہی (Fresh Yogurt)', dcRate: 210, marketPrice: 220 },
      { name: 'لہسن دیسی (Garlic)', dcRate: 360, marketPrice: 360 }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    gmapsUrl: 'https://maps.google.com/?q=Liaquat+Bazaar+Quetta'
  },
  glt: {
    id: 'glt',
    nameEn: 'Gilgit — Main Naya Bazaar & Kashrote Market',
    nameUrdu: 'گلگت — نیا بازار و کشروٹ مارکیٹ (گلگت بلتستان)',
    city: 'Gilgit',
    province: 'Gilgit-Baltistan',
    lat: 35.9221,
    lng: 74.3087,
    registeredVendors: 175,
    complianceRate: 98.5,
    activeSquad: 'Gilgit-Baltistan Administration Squad #1',
    bazaarType: 'Northern Gateway & Alpine Agriculture Hub',
    descriptionEn: 'Strategically located along Karakoram Highway, fully integrated with northern price stabilization radar.',
    descriptionUrdu: 'شاہراہ ریشم پر واقع شمالی علاقہ جات کا مرکزی تجارتی مرکز، 100 فیصد سرکاری ریٹ پر عملدرآمد۔',
    topStaples: [
      { name: 'خشک خوبانی (Dry Apricot)', dcRate: 650, marketPrice: 650 },
      { name: 'آٹا 10 کلو (Flour 10kg)', dcRate: 1350, marketPrice: 1350 },
      { name: 'اخروٹ گری (Walnuts)', dcRate: 1200, marketPrice: 1200 },
      { name: 'انڈے فارمی (Eggs / Dozen)', dcRate: 280, marketPrice: 285 }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    gmapsUrl: 'https://maps.google.com/?q=Naya+Bazaar+Gilgit'
  },
  skd: {
    id: 'skd',
    nameEn: 'Skardu — Hussaini Chowk & Yadgar Bazaar',
    nameUrdu: 'سکردو — حسینی چوک و یادگار بازار (گلگت بلتستان)',
    city: 'Skardu',
    province: 'Gilgit-Baltistan',
    lat: 35.2971,
    lng: 75.6333,
    registeredVendors: 140,
    complianceRate: 97.9,
    activeSquad: 'Baltistan Division Price Control Unit',
    bazaarType: 'High-Altitude Commercial Trading Base',
    descriptionEn: 'Serving thousands of residents and travelers with monitored flour, dairy, and mountain produce.',
    descriptionUrdu: 'بلتستان کا مرکزی چوک جہاں تمام اشیائے ضروریہ کے سرکاری نرخ نامے لائیو مانیٹر ہوتے ہیں۔',
    topStaples: [
      { name: 'بادام دیسی (Almonds)', dcRate: 1100, marketPrice: 1100 },
      { name: 'کھلا دودھ (Milk 1L)', dcRate: 195, marketPrice: 200 },
      { name: 'آلو سکردو (Skardu Potato)', dcRate: 65, marketPrice: 65 },
      { name: 'پیاز (Onion)', dcRate: 92, marketPrice: 95 }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    gmapsUrl: 'https://maps.google.com/?q=Hussaini+Chowk+Skardu'
  },
  ajk: {
    id: 'ajk',
    nameEn: 'Muzaffarabad — Main Madina Market & Bank Road',
    nameUrdu: 'مظفرآباد — مدینہ مارکیٹ و بینک روڈ (آزاد کشمیر)',
    city: 'Muzaffarabad',
    province: 'Azad Jammu & Kashmir',
    lat: 34.3700,
    lng: 73.4710,
    registeredVendors: 260,
    complianceRate: 97.5,
    activeSquad: 'AJK Price Magistrate Squad #3',
    bazaarType: 'Riverine Capital Commercial Hub',
    descriptionEn: 'Capital city trading network with geo-fenced mobile produce stalls and active enforcement patrols.',
    descriptionUrdu: 'آزاد جموں و کشمیر کا صدر مقام، جہاں اشیائے خورونوش کے نرخ شفاف طریقے سے ریگولیٹ ہیں۔',
    topStaples: [
      { name: 'آٹا 10 کلو (Flour 10kg)', dcRate: 1350, marketPrice: 1350 },
      { name: 'گوشت مرغی (Broiler)', dcRate: 385, marketPrice: 390 },
      { name: 'دال چنا (Gram Pulse)', dcRate: 240, marketPrice: 240 },
      { name: 'ٹماٹر (Tomato)', dcRate: 130, marketPrice: 130 }
    ],
    photoUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80',
    gmapsUrl: 'https://maps.google.com/?q=Madina+Market+Muzaffarabad'
  }
};

export const GeospatialTourMap: React.FC<GeospatialTourMapProps> = ({
  lang,
  onOpenLocate,
}) => {
  const isUrdu = lang === 'ur';
  const [geoTab, setGeoTab] = useState<'flag' | 'ops' | 'street'>('flag');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<typeof PAKISTAN_CITIES[0] | null>(PAKISTAN_CITIES[0]);
  const [selectedBazaarId, setSelectedBazaarId] = useState<string>('rwp');
  const [livePatrolTick, setLivePatrolTick] = useState(0);
  const [streetDetailCard, setStreetDetailCard] = useState<StreetDetail | null>(HISTORIC_BAZAARS['rwp']);
  const [streetPanoramaYaw, setStreetPanoramaYaw] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const patrolsGroupRef = useRef<L.LayerGroup | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  // 1.2s Telemetry heartbeat for moving patrols
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePatrolTick(prev => prev + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Initialize and manage Leaflet map with 100% legal, watermark-free OpenStreetMap tiles
  useEffect(() => {
    if ((geoTab !== 'flag' && geoTab !== 'ops') || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30.3753, 69.3451],
        zoom: 5.5,
        minZoom: 4,
        maxZoom: 19,
        zoomControl: true,
        attributionControl: true,
      });

      // Pure OpenStreetMap tiles: guaranteed ZERO "API KEY REQUIRED" watermark
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Connected Pakistan PERA 2026',
      }).addTo(map);

      // Render Pakistan Provinces Polygon Overlays (incorporating GB & AJK)
      PROVINCE_POLYGONS.forEach(prov => {
        const poly = L.polygon(prov.coords as [number, number][], {
          color: geoTab === 'ops' ? '#E3A82B' : '#178A52',
          weight: 2,
          fillColor: geoTab === 'ops' ? '#04231A' : '#178A52',
          fillOpacity: geoTab === 'ops' ? 0.22 : 0.28,
          dashArray: geoTab === 'ops' ? '5, 5' : undefined,
        }).addTo(map);

        poly.bindTooltip(`
          <div style="font-family: system-ui; font-size: 11px; font-weight: 800; color: #04231A; padding: 2px 4px;">
            ${isUrdu ? prov.nameUrdu : prov.nameEn}
          </div>
        `, {
          permanent: false,
          direction: 'center',
          opacity: 0.95,
        });

        poly.on('click', () => {
          map.flyTo(prov.center, 7, { duration: 1.2 });
        });
      });

      // Central Pakistan Crescent & Star watermark emblem
      const emblemIcon = L.divIcon({
        className: 'custom-emblem-marker',
        html: `
          <div style="width: 50px; height: 50px; border-radius: 50%; background: #0B4A31; border: 2.5px solid #E3A82B; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 25px rgba(227,168,43,0.7); color: #FFF; font-size: 22px;">
            ☪
          </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      });
      L.marker([30.3753, 69.3451], { icon: emblemIcon }).addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui; text-align: center; color: #04231A; padding: 4px;">
            <strong style="color: #178A52; font-size: 14px;">Connected Pakistan VRF 2026</strong><br/>
            <span style="font-size: 11px; color: #555;">National Geospatial Core Command</span>
          </div>
        `);

      const markersGroup = L.layerGroup().addTo(map);
      const patrolsGroup = L.layerGroup().addTo(map);

      markersGroupRef.current = markersGroup;
      patrolsGroupRef.current = patrolsGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.invalidateSize();
    }

    return () => {
      // Map cleanup
    };
  }, [geoTab]);

  // Update City Pins when Selected City Changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    PAKISTAN_CITIES.forEach(city => {
      const isSelected = selectedCity?.id === city.id;
      const cityIcon = L.divIcon({
        className: 'city-badge-pin',
        html: `
          <div style="
            background: ${isSelected ? '#E3A82B' : '#04231A'};
            color: ${isSelected ? '#04231A' : '#FFF'};
            border: 2px solid ${isSelected ? '#FFFFFF' : '#178A52'};
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isSelected ? '#04231A' : '#4ADE80'}; display: inline-block;"></span>
            <span>${isUrdu ? city.nameUrdu : city.nameEn}</span>
          </div>
        `,
        iconSize: [110, 24],
        iconAnchor: [55, 12],
      });

      const marker = L.marker([city.lat, city.lng], { icon: cityIcon }).addTo(markersGroupRef.current!);
      marker.on('click', () => {
        setSelectedCity(city);
        flyToCoordinates(city.lat, city.lng, 10, city.nameEn);
        // Find matching historic bazaar if available
        const matchingBazaar = Object.values(HISTORIC_BAZAARS).find(b => 
          b.city.toLowerCase().includes(city.nameEn.toLowerCase()) || 
          city.nameEn.toLowerCase().includes(b.city.toLowerCase())
        );
        if (matchingBazaar) {
          setSelectedBazaarId(matchingBazaar.id);
          setStreetDetailCard(matchingBazaar);
        }
      });
    });
  }, [selectedCity, isUrdu]);

  // Update Moving Patrols on Ops Map
  useEffect(() => {
    if (!mapInstanceRef.current || !patrolsGroupRef.current || geoTab !== 'ops') return;

    patrolsGroupRef.current.clearLayers();

    PATROL_POINTS.forEach((patrol, idx) => {
      const angle = (livePatrolTick * 0.2) + (idx * Math.PI / 2);
      const deltaLat = Math.sin(angle) * 0.025;
      const deltaLng = Math.cos(angle) * 0.025;
      const curLat = patrol.lat + deltaLat;
      const curLng = patrol.lng + deltaLng;

      const patrolIcon = L.divIcon({
        className: 'patrol-marker-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(74, 222, 128, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #4ADE80; border: 2px solid #FFFFFF; box-shadow: 0 0 10px #4ADE80; z-index: 2;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([curLat, curLng], { icon: patrolIcon }).addTo(patrolsGroupRef.current!);
      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 4px; color: #04231A;">
          <strong style="color: #0B4A31;">${patrol.name}</strong><br/>
          <span style="font-size: 11px; color: #178A52; font-weight: bold;">⚡ Live Speed: ${patrol.speed}</span><br/>
          <span style="font-size: 10px; color: #666;">Status: ${patrol.status} • GPS Lat/Lng: ${curLat.toFixed(4)}, ${curLng.toFixed(4)}</span>
        </div>
      `);
    });
  }, [livePatrolTick, geoTab]);

  // Clean map destruction when leaving map tabs
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geoTab]);

  // Fly to target coordinates with precision ring and pinpoint
  const flyToCoordinates = (lat: number, lng: number, zoom = 10, label?: string) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.4 });

    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
    }
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    const circle = L.circle([lat, lng], {
      radius: 3200,
      color: '#E3A82B',
      fillColor: '#E3A82B',
      fillOpacity: 0.18,
      weight: 2,
      dashArray: '6, 6',
    }).addTo(mapInstanceRef.current);

    const searchIcon = L.divIcon({
      className: 'search-target-pin',
      html: `
        <div style="background: #E3A82B; color: #04231A; font-weight: 900; font-size: 11px; padding: 4px 8px; border-radius: 8px; border: 2px solid #FFF; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: flex; items-center; gap: 4px;">
          📍 ${label || 'Target Location'}
        </div>
      `,
      iconSize: [120, 26],
      iconAnchor: [60, 26],
    });

    const marker = L.marker([lat, lng], { icon: searchIcon }).addTo(mapInstanceRef.current);

    accuracyCircleRef.current = circle;
    searchMarkerRef.current = marker;
  };

  // Handle Search Input: searches any Pakistani city, bazaar, province, or district
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();

    // Check in Bazaars first for high-detail match
    const matchedBazaar = Object.values(HISTORIC_BAZAARS).find(b =>
      b.nameEn.toLowerCase().includes(query) ||
      b.nameUrdu.includes(query) ||
      b.city.toLowerCase().includes(query) ||
      b.bazaarType.toLowerCase().includes(query)
    );

    if (matchedBazaar) {
      setSelectedBazaarId(matchedBazaar.id);
      setStreetDetailCard(matchedBazaar);
      flyToCoordinates(matchedBazaar.lat, matchedBazaar.lng, 12, matchedBazaar.nameEn);
      return;
    }

    // Check in Cities
    const matchedCity = PAKISTAN_CITIES.find(c => 
      c.nameEn.toLowerCase().includes(query) || 
      c.nameUrdu.includes(query) ||
      c.provinceEn.toLowerCase().includes(query) ||
      c.provinceUrdu.includes(query)
    );

    if (matchedCity) {
      setSelectedCity(matchedCity);
      flyToCoordinates(matchedCity.lat, matchedCity.lng, 11, matchedCity.nameEn);
      
      // Look for street detail in that city
      const bz = Object.values(HISTORIC_BAZAARS).find(b => 
        b.city.toLowerCase().includes(matchedCity.nameEn.toLowerCase())
      );
      if (bz) {
        setSelectedBazaarId(bz.id);
        setStreetDetailCard(bz);
      }
    } else {
      // Default fly to Islamabad Federal Capital
      flyToCoordinates(33.6844, 73.0479, 10, searchQuery);
    }
  };

  const currentBazaar = HISTORIC_BAZAARS[selectedBazaarId] || HISTORIC_BAZAARS['rwp'];

  return (
    <div className="space-y-4">
      {/* Top Mode Bar & Place Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#04231A] p-3 rounded-2xl border border-emerald-700/50 shadow-xl">
        {/* Three Crisp Mode Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <PakistanFlagEmblem size="sm" variant="flag" rounded="md" className="hidden sm:inline-flex ring-1 ring-amber-400/50 shadow-sm mr-1" />
          <button
            type="button"
            onClick={() => setGeoTab('flag')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              geoTab === 'flag'
                ? 'bg-[#178A52] text-white shadow-lg border border-[#E3A82B]'
                : 'bg-[#031B13] text-slate-300 hover:bg-[#0B4A31] border border-emerald-900/40'
            }`}
          >
            <Globe className="w-4 h-4 text-[#E3A82B]" />
            <span>{isUrdu ? 'قومی مکمل نقشہ (National Map)' : 'National Geospatial Map'}</span>
          </button>

          <button
            type="button"
            onClick={() => setGeoTab('ops')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              geoTab === 'ops'
                ? 'bg-[#178A52] text-white shadow-lg border border-[#E3A82B]'
                : 'bg-[#031B13] text-slate-300 hover:bg-[#0B4A31] border border-emerald-900/40'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{isUrdu ? 'لائیو پٹرولنگ ریڈار (Live Ops)' : 'Live Patrol Radar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setGeoTab('street')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              geoTab === 'street'
                ? 'bg-[#178A52] text-white shadow-lg border border-[#E3A82B]'
                : 'bg-[#031B13] text-slate-300 hover:bg-[#0B4A31] border border-emerald-900/40'
            }`}
          >
            <Eye className="w-4 h-4 text-[#F4D58D]" />
            <span>{isUrdu ? 'اسٹریٹ ویو و بازار (Street View 360)' : 'Street View & Bazaars'}</span>
          </button>
        </div>

        {/* Place Search Bar */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'شہر یا بازار تلاش کریں (مثلاً راجہ بازار، گلگت، انارکلی)...' : 'Search city or bazaar (e.g. Gilgit, Raja Bazaar, Anarkali)...'}
            className="w-full bg-[#031B13] border border-emerald-600/60 rounded-xl pl-9 pr-16 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#E3A82B]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#178A52] text-white text-[11px] font-bold hover:bg-emerald-600 transition-colors"
          >
            Fly To
          </button>
        </form>
      </div>

      {/* Main Map or Street View Experience */}
      <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-emerald-600/50 bg-[#031B13] shadow-2xl">
        {(geoTab === 'flag' || geoTab === 'ops') && (
          <div className="w-full h-full relative">
            <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

            {/* Live Ops Radar Header Ticker */}
            {geoTab === 'ops' && (
              <div className="absolute top-3 right-3 z-10 bg-[#04231A]/95 border border-emerald-500/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-emerald-300 font-bold">
                  LIVE • Patrols Moving: 4 • GPS Sync: {new Date().toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Pakistan Coverage Badge */}
            <div className="absolute bottom-3 left-3 z-10 bg-[#04231A]/95 border border-[#E3A82B]/60 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 text-[11px]">
              <PakistanFlagEmblem size="xs" variant="flag" rounded="sm" className="ring-1 ring-amber-400/40 shadow-xs" />
              <span className="text-white font-bold">
                {isUrdu ? 'مکمل پاکستان — آزاد کشمیر و گلگت بلتستان سمیت' : 'Complete Pakistan — All 4 Provinces, GB & AJK'}
              </span>
            </div>
          </div>
        )}

        {/* ================= RICH INTERACTIVE STREET VIEW (No Broken Iframe) ================= */}
        {geoTab === 'street' && (
          <div className="w-full h-full flex flex-col bg-[#04231A] text-white">
            {/* Top Bazaar Switcher Bar */}
            <div className="p-3 bg-[#031B13] border-b border-emerald-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#E3A82B]" />
                <span className="font-bold text-white">{isUrdu ? 'تاریخی بازار منتخب کریں:' : 'Select Historic Bazaar:'}</span>
                <select
                  value={selectedBazaarId}
                  onChange={(e) => {
                    setSelectedBazaarId(e.target.value);
                    setStreetDetailCard(HISTORIC_BAZAARS[e.target.value]);
                  }}
                  className="bg-[#04231A] text-white border border-emerald-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#E3A82B]"
                >
                  {Object.entries(HISTORIC_BAZAARS).map(([key, b]) => (
                    <option key={key} value={key}>
                      {isUrdu ? b.nameUrdu : b.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={currentBazaar.gmapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#178A52] hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow transition-colors"
                >
                  <span>Google Maps 3D View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Interactive Panoramic Viewport with Stalls & Overlays */}
            <div className="flex-1 relative overflow-hidden group bg-slate-900">
              <img
                src={currentBazaar.photoUrl}
                alt={currentBazaar.nameEn}
                className="w-full h-full object-cover transition-transform duration-700 ease-out"
                style={{ transform: `scale(1.1) translateX(${streetPanoramaYaw}px)` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04231A] via-transparent to-[#04231A]/40" />

              {/* Floating Interactive Street Stall Markers */}
              <div className="absolute top-1/3 left-1/4 animate-bounce">
                <div className="bg-[#04231A]/90 border-2 border-[#E3A82B] text-white p-2 rounded-xl shadow-2xl backdrop-blur-sm text-[11px]">
                  <p className="font-bold text-[#E3A82B] flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" />
                    <span>سلاٹ #12 — پھل و سبزی</span>
                  </p>
                  <p className="text-[10px] text-emerald-300">DC Verified Scale ✓</p>
                </div>
              </div>

              <div className="absolute top-1/2 right-1/4">
                <div className="bg-[#04231A]/90 border-2 border-emerald-400 text-white p-2 rounded-xl shadow-2xl backdrop-blur-sm text-[11px]">
                  <p className="font-bold text-white flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>پرائس مانیٹرنگ یونٹ</span>
                  </p>
                  <p className="text-[10px] text-amber-300">98.2% Compliance</p>
                </div>
              </div>

              {/* Panorama Pan Controls */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-[#04231A]/90 p-1.5 rounded-xl border border-emerald-700/60 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setStreetPanoramaYaw(prev => prev + 40)}
                  className="px-2.5 py-1 bg-[#178A52] hover:bg-emerald-600 rounded-lg text-xs font-bold text-white shadow"
                  title="Pan Left"
                >
                  ◀ Pan Left
                </button>
                <button
                  type="button"
                  onClick={() => setStreetPanoramaYaw(0)}
                  className="px-2 py-1 bg-[#031B13] hover:bg-[#0B4A31] rounded-lg text-[10px] font-bold text-slate-300 border border-emerald-800"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setStreetPanoramaYaw(prev => prev - 40)}
                  className="px-2.5 py-1 bg-[#178A52] hover:bg-emerald-600 rounded-lg text-xs font-bold text-white shadow"
                  title="Pan Right"
                >
                  Pan Right ▶
                </button>
              </div>

              {/* Current Bazaar Title Overlay */}
              <div className="absolute bottom-4 left-4 z-10 max-w-md bg-[#04231A]/90 p-3 rounded-xl border border-emerald-700/70 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-xs text-[#E3A82B] font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentBazaar.city}, {currentBazaar.province}</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white font-urdu">
                  {isUrdu ? currentBazaar.nameUrdu : currentBazaar.nameEn}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                  {isUrdu ? currentBazaar.descriptionUrdu : currentBazaar.descriptionEn}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= SEARCH STREET-LEVEL DETAIL DRAWER / CARD ================= */}
      {streetDetailCard && (
        <div className="bg-[#04231A] rounded-2xl p-4 border border-emerald-700/60 shadow-xl text-white animate-fadeUp">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#178A52] text-white flex items-center justify-center font-extrabold shadow">
                <Building2 className="w-5 h-5 text-[#E3A82B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-[#E3A82B] text-[#04231A] px-2 py-0.5 rounded-md">
                    {streetDetailCard.city} ({streetDetailCard.province})
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    {streetDetailCard.bazaarType}
                  </span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white font-urdu mt-0.5">
                  {isUrdu ? streetDetailCard.nameUrdu : streetDetailCard.nameEn}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-[#031B13] px-3 py-1.5 rounded-xl border border-emerald-800">
                <span className="text-[10px] text-slate-400 block">{isUrdu ? 'رجسٹرڈ ریڑھی بان' : 'Vendors Pinned'}</span>
                <strong className="text-emerald-300 font-mono text-sm">{streetDetailCard.registeredVendors}</strong>
              </div>
              <div className="bg-[#031B13] px-3 py-1.5 rounded-xl border border-emerald-800">
                <span className="text-[10px] text-slate-400 block">{isUrdu ? 'ڈی سی ریٹ پابندی' : 'Compliance Rate'}</span>
                <strong className="text-[#E3A82B] font-mono text-sm">{streetDetailCard.complianceRate}%</strong>
              </div>
            </div>
          </div>

          {/* Commodity DC Ceilings in this Bazaar */}
          <div className="mt-3">
            <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E3A82B]" />
              <span>{isUrdu ? 'اس بازار میں لازمی اشیاء کے ریٹس بمقابلہ اوپن مارکیٹ:' : 'Live Commodity Rates & Ceilings in this Bazaar:'}</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {streetDetailCard.topStaples.map((staple) => (
                <div key={staple.name} className="p-2.5 rounded-xl bg-[#031B13] border border-emerald-900/60 text-xs">
                  <span className="text-[11px] text-slate-300 font-bold block truncate">{staple.name}</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-emerald-400 font-extrabold font-mono text-xs">Rs. {staple.dcRate}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Avg: Rs.{staple.marketPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Four Telemetry Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-[#04231A] border border-emerald-800/50 flex items-center gap-2 text-xs">
          <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
          <div>
            <strong className="text-white block font-bold">4 Live Patrols</strong>
            <span className="text-[10px] text-slate-400">GPS Radar Sync</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#04231A] border border-emerald-800/50 flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-[#E3A82B] shrink-0" />
          <div>
            <strong className="text-white block font-bold">All 10 Cities Pinned</strong>
            <span className="text-[10px] text-slate-400">incl. GB & AJK</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#04231A] border border-emerald-800/50 flex items-center gap-2 text-xs">
          <Shield className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <strong className="text-white block font-bold">160+ Districts</strong>
            <span className="text-[10px] text-slate-400">Precision Geofenced</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#04231A] border border-emerald-800/50 flex items-center gap-2 text-xs">
          <Zap className="w-4 h-4 text-[#F4D58D] shrink-0" />
          <div>
            <strong className="text-white block font-bold">1.2s Realtime Stream</strong>
            <span className="text-[10px] text-slate-400">Zero Watermark</span>
          </div>
        </div>
      </div>
    </div>
  );
};
