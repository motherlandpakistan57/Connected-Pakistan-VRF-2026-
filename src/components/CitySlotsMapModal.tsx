import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  X, MapPin, ZoomIn, ZoomOut, Layers, Navigation, Volume2, 
  CheckCircle2, Sparkles, Building2, Store, Users, Compass, 
  Search, ShieldCheck, ArrowRightLeft, Droplets, Zap, Trash2, ArrowUpRight, Phone, Award, QrCode,
  Send, Upload, FileText, Eye, ExternalLink,
  BarChart3, TrendingUp, AlertTriangle, Activity
} from 'lucide-react';
import { Language, UserRole, VendorProfile } from '../types';
import { PAKISTAN_CITY_SLOTS_DATA, VendorSlot, CityZoneBreakdown } from '../data/citySlotsData';
import { INITIAL_VENDORS } from '../data/seedData';
import { speechService } from '../lib/audio';
import { BrandLogo } from './BrandLogo';
import { calculateClusters, createClusterIcon, ClusterPoint } from '../lib/markerClustering';
import { GovernmentVendorOutreachModal } from './GovernmentVendorOutreachModal';
import { PakistanFlagEmblem } from './PakistanFlagEmblem';

interface CitySlotsMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userRole?: UserRole;
  initialSlotId?: string;
  initialCityId?: string;
  vendors?: VendorProfile[];
}

export const CitySlotsMapModal: React.FC<CitySlotsMapModalProps> = ({
  isOpen,
  onClose,
  lang,
  userRole = 'citizen',
  initialSlotId,
  initialCityId = 'rwp',
  vendors: propVendors,
}) => {
  const isUrdu = lang === 'ur';

  // Local state data from the vendors array
  const [vendors, setVendors] = useState<VendorProfile[]>(() => {
    if (propVendors && propVendors.length > 0) return propVendors;
    try {
      const saved = localStorage.getItem('cp_vendors');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_VENDORS;
  });

  useEffect(() => {
    if (propVendors && propVendors.length > 0) {
      setVendors(propVendors);
    }
  }, [propVendors]);

  const [selectedCityId, setSelectedCityId] = useState<string>(initialCityId);
  const [selectedSlot, setSelectedSlot] = useState<VendorSlot | null>(null);
  const [mapType, setMapType] = useState<'m' | 'k' | 'p'>('m'); // m: roadmap, k: satellite, p: terrain
  const [mapViewMode, setMapViewMode] = useState<'clustered' | 'satellite' | 'street_view'>('clustered');
  const [zoomLevel, setZoomLevel] = useState<number>(19);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showQrBadge, setShowQrBadge] = useState<boolean>(false);
  const [showOutreachModal, setShowOutreachModal] = useState<boolean>(false);

  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.LayerGroup | null>(null);
  const geofenceGroupRef = useRef<L.LayerGroup | null>(null);

  // Find active city
  const currentCity = PAKISTAN_CITY_SLOTS_DATA.find(c => c.cityId === selectedCityId) || PAKISTAN_CITY_SLOTS_DATA[0];

  // All slots in current city
  const allCitySlots = currentCity.zones.flatMap(z => z.slots);

  // Cross-city slots repository
  const allPakistanSlots = PAKISTAN_CITY_SLOTS_DATA.flatMap(c => c.zones.flatMap(z => z.slots));

  // Current slot vendor profile adapter for outreach modal
  const currentSlotVendorProfile: VendorProfile | null = selectedSlot ? {
    id: selectedSlot.id,
    name: selectedSlot.assignedVendorName,
    nameUrdu: selectedSlot.assignedVendorNameUrdu,
    shopName: selectedSlot.assignedVendorName + ' اسٹال',
    shopNameUrdu: (selectedSlot.assignedVendorNameUrdu || selectedSlot.assignedVendorName) + ' ریڑھی',
    cnic: selectedSlot.vendorCnic || '37405-1829481-3',
    phone: selectedSlot.vendorPhone || '+92 300 5519284',
    marketName: selectedSlot.marketName,
    marketNameUrdu: selectedSlot.marketNameUrdu,
    slotNumber: selectedSlot.slotNumber,
    zone: selectedSlot.marketName,
    badge: 'green',
    score: (selectedSlot.vendorScore || 92) / 10,
    creditScore: 780,
    wastePoints: 120,
    qrId: selectedSlot.qrId,
    latitude: selectedSlot.lat,
    longitude: selectedSlot.lng,
    isInsideGeofence: true,
  } : null;

  // Calculate Occupancy Rate and Violation Frequency for the currently selected market slot using local state vendors array
  const slotStats = useMemo(() => {
    if (!selectedSlot) {
      return {
        occupancyRate: 0,
        occupancyFormatted: '0%',
        occupancyStatus: 'Unallocated',
        occupancyStatusUrdu: 'غیر مختص شدہ',
        violationFrequency: 0,
        violationFormatted: '0.0%',
        violationCountPerMonth: '0.0 / mo',
        violationStatus: 'No Violations',
        violationStatusUrdu: 'کوئی خلاف ورزی نہیں',
        matchedVendor: null,
        totalMarketVendors: 0,
        marketCorridorOccupancy: 0,
      };
    }

    // 1. Find matching vendor in the local state vendors array
    const cleanSlotNum = selectedSlot.slotNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedVendor = vendors.find(v => {
      if (v.id === selectedSlot.id) return true;
      if (v.cnic && selectedSlot.vendorCnic && v.cnic === selectedSlot.vendorCnic) return true;
      if (v.qrId && selectedSlot.qrId && v.qrId.toLowerCase() === selectedSlot.qrId.toLowerCase()) return true;

      const vCleanSlot = (v.slotNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanSlotNum && vCleanSlot && (cleanSlotNum.includes(vCleanSlot) || vCleanSlot.includes(cleanSlotNum))) return true;

      if (v.name && selectedSlot.assignedVendorName &&
        (v.name.toLowerCase().includes(selectedSlot.assignedVendorName.toLowerCase()) ||
         selectedSlot.assignedVendorName.toLowerCase().includes(v.name.toLowerCase()))) {
        return true;
      }
      return false;
    }) || null;

    // 2. Market corridor vendors count from local state vendors array
    const marketVendors = vendors.filter(v =>
      (v.marketName && selectedSlot.marketName &&
        (v.marketName.toLowerCase().includes(selectedSlot.marketName.toLowerCase()) ||
         selectedSlot.marketName.toLowerCase().includes(v.marketName.toLowerCase()))) ||
      (v.zone && selectedSlot.marketName && v.zone.toLowerCase().includes(selectedSlot.marketName.toLowerCase()))
    );

    // 3. Occupancy Rate calculation from vendors array data
    let occupancyRate = 0;
    if (selectedSlot.status === 'occupied') {
      if (matchedVendor) {
        // Shift completion and attendance rate derived from vendor credit and score in vendors array
        const baseShiftRate = 88 + (matchedVendor.score * 1.05);
        const creditBonus = (matchedVendor.creditScore / 850) * 1.5;
        occupancyRate = Math.min(99.4, Math.max(78, Math.round((baseShiftRate + creditBonus) * 10) / 10));
      } else {
        occupancyRate = 94.6;
      }
    } else if (selectedSlot.status === 'shift_swap_available') {
      occupancyRate = 50.0;
    } else {
      occupancyRate = 0.0;
    }

    // 4. Violation Frequency calculation from vendors array data
    // In vendors array, score is 0.0 - 10.0 (10.0 = zero infractions, < 7.0 = multiple price/scale infractions)
    let violationFrequency = 0;
    let violationCountPerMonth = '0.0 / mo';
    let violationStatus = 'Low Risk (Zero Infractions)';
    let violationStatusUrdu = 'کم ترین خطرہ (صفر خلاف ورزی)';

    if (selectedSlot.status === 'occupied') {
      if (matchedVendor) {
        const deviation = Math.max(0, 10 - matchedVendor.score);
        violationFrequency = Math.round(deviation * 0.75 * 10) / 10;
        const countMonthly = (deviation * 0.22).toFixed(1);
        violationCountPerMonth = `${countMonthly} / mo`;

        if (matchedVendor.score >= 8.5) {
          violationStatus = 'Exemplary (Zero DC Deviations)';
          violationStatusUrdu = 'شاندار (صفر ڈی سی انحراف)';
        } else if (matchedVendor.score >= 7.5) {
          violationStatus = 'Compliant (Minor Dispute Resolved)';
          violationStatusUrdu = 'مطابق ضابطہ (معمولی تنازعہ حل شدہ)';
        } else {
          violationStatus = 'Audited (Under Active Watch)';
          violationStatusUrdu = 'زیر نگرانی (ڈی سی ریٹ چیک)';
        }
      } else {
        violationFrequency = 0.8;
        violationCountPerMonth = '0.2 / mo';
        violationStatus = 'Compliant (Low Infraction)';
        violationStatusUrdu = 'مطابق ضابطہ (کم ترین)';
      }
    } else {
      violationFrequency = 0.0;
      violationCountPerMonth = '0.0 / mo';
      violationStatus = 'Vacant Slot (Zero Violations)';
      violationStatusUrdu = 'خالی سلاٹ (کوئی ریکارڈ نہیں)';
    }

    const marketCorridorOccupancy = marketVendors.length > 0
      ? Math.min(100, Math.round((marketVendors.length / Math.max(marketVendors.length, 6)) * 100))
      : 92;

    return {
      occupancyRate,
      occupancyFormatted: `${occupancyRate}%`,
      occupancyStatus: occupancyRate >= 90 ? 'High Utilization' : (occupancyRate > 0 ? 'Partial Shift' : 'Vacant'),
      occupancyStatusUrdu: occupancyRate >= 90 ? 'بلند ترین استعمال' : (occupancyRate > 0 ? 'جزوی شفٹ' : 'خالی سلاٹ'),
      violationFrequency,
      violationFormatted: `${violationFrequency}%`,
      violationCountPerMonth,
      violationStatus,
      violationStatusUrdu,
      matchedVendor,
      totalMarketVendors: marketVendors.length,
      marketCorridorOccupancy,
    };
  }, [selectedSlot, vendors]);

  // Leaflet Clustered Map points calculation
  const cityClusterPoints: ClusterPoint[] = React.useMemo(() => {
    const points: ClusterPoint[] = [];

    // All slots in this city
    allCitySlots.forEach(slot => {
      points.push({
        id: `slot-${slot.id}`,
        lat: slot.lat,
        lng: slot.lng,
        type: 'vendor',
        titleEn: `${slot.assignedVendorName} (${slot.slotNumber})`,
        titleUrdu: `${slot.assignedVendorNameUrdu || slot.assignedVendorName} (${slot.slotNumberUrdu || slot.slotNumber})`,
        subtitleEn: `${slot.marketName} • ${slot.dimensions}`,
        subtitleUrdu: `${slot.marketNameUrdu || slot.marketName} • ${slot.dimensionsUrdu || slot.dimensions}`,
        categoryIcon: slot.categoryIcon,
        status: slot.status,
        data: slot,
      });
    });

    // Add local simulated violation alerts in this bazaar corridor
    if (selectedCityId === 'rwp') {
      points.push({
        id: 'alert-rwp-local',
        lat: 33.5986,
        lng: 73.0573,
        type: 'alert',
        titleEn: '⚠️ Overcharging Dispute (+16%)',
        titleUrdu: '⚠️ زائد قیمت تنازعہ (+16%)',
        subtitleEn: 'Onion & Garlic • Raja Bazaar',
        subtitleUrdu: 'پیاز و لہسن • راجہ بازار',
        variancePct: 16,
        data: { market: 'Raja Bazaar' },
      });
    } else if (selectedCityId === 'lhr') {
      points.push({
        id: 'alert-lhr-local',
        lat: 31.5665,
        lng: 74.3149,
        type: 'alert',
        titleEn: '⚠️ Price Variance (+14%)',
        titleUrdu: '⚠️ ڈی سی ریٹ خلاف ورزی (+14%)',
        subtitleEn: 'Flour Bag • Anarkali',
        subtitleUrdu: 'آٹا تھیلا • انارکلی',
        variancePct: 14,
        data: { market: 'Anarkali' },
      });
    }

    return points;
  }, [allCitySlots, selectedCityId]);

  // Initialize and maintain Leaflet map with clustering & geofence rings
  useEffect(() => {
    if (!isOpen || mapViewMode !== 'clustered' || !leafletContainerRef.current) {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {
          console.warn('Leaflet cleanup error:', e);
        }
        leafletMapRef.current = null;
        geofenceGroupRef.current = null;
        clusterGroupRef.current = null;
      }
      return;
    }

    const initialCenter: [number, number] = selectedSlot 
      ? [selectedSlot.lat, selectedSlot.lng]
      : [currentCity.centerLat, currentCity.centerLng];

    const initialZoom = selectedSlot ? 19 : 16;

    if (!leafletMapRef.current) {
      const map = L.map(leafletContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 6,
        maxZoom: 19,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap | PERA Micro-Geofencing',
        maxZoom: 19,
      }).addTo(map);

      const geofenceGroup = L.layerGroup().addTo(map);
      const clusterGroup = L.layerGroup().addTo(map);

      geofenceGroupRef.current = geofenceGroup;
      clusterGroupRef.current = clusterGroup;
      leafletMapRef.current = map;

      // Invalidate size after modal render transitions complete
      setTimeout(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
          if (selectedSlot) {
            leafletMapRef.current.flyTo([selectedSlot.lat, selectedSlot.lng], 19, { animate: true, duration: 0.8 });
          }
        }
      }, 200);

      const renderClusters = () => {
        if (!clusterGroupRef.current || !leafletMapRef.current) return;
        clusterGroupRef.current.clearLayers();

        const clusters = calculateClusters(cityClusterPoints, leafletMapRef.current, 50);

        clusters.forEach(cluster => {
          const icon = createClusterIcon(cluster, isUrdu);
          const marker = L.marker([cluster.lat, cluster.lng], { icon });

          marker.on('click', () => {
            if (cluster.isCluster) {
              const currentZoom = leafletMapRef.current?.getZoom() || 16;
              leafletMapRef.current?.flyTo([cluster.lat, cluster.lng], currentZoom + 2, { duration: 0.6 });
            } else {
              const matchedSlot = allCitySlots.find(s => `slot-${s.id}` === cluster.items[0].id);
              if (matchedSlot) {
                setSelectedSlot(matchedSlot);
              }
            }
          });

          clusterGroupRef.current?.addLayer(marker);
        });
      };

      map.on('moveend', renderClusters);
      map.on('zoomend', renderClusters);
      renderClusters();
    } else {
      // Update center or re-render
      const map = leafletMapRef.current;
      map.invalidateSize();
      if (selectedSlot) {
        map.flyTo([selectedSlot.lat, selectedSlot.lng], 19, { duration: 0.8 });
      }

      if (clusterGroupRef.current && map) {
        clusterGroupRef.current.clearLayers();
        const clusters = calculateClusters(cityClusterPoints, map, 50);

        clusters.forEach(cluster => {
          const icon = createClusterIcon(cluster, isUrdu);
          const marker = L.marker([cluster.lat, cluster.lng], { icon });

          marker.on('click', () => {
            if (cluster.isCluster) {
              const currentZoom = map.getZoom();
              map.flyTo([cluster.lat, cluster.lng], currentZoom + 2, { duration: 0.6 });
            } else {
              const matchedSlot = allCitySlots.find(s => `slot-${s.id}` === cluster.items[0].id);
              if (matchedSlot) {
                setSelectedSlot(matchedSlot);
              }
            }
          });

          clusterGroupRef.current?.addLayer(marker);
        });
      }
    }

    // Render 35m radar geofence circle, 6x4 ft pitch rectangle, and active popup highlight
    if (leafletMapRef.current && geofenceGroupRef.current && selectedSlot) {
      geofenceGroupRef.current.clearLayers();

      // 35m Geofence Buffer Circle
      const circle = L.circle([selectedSlot.lat, selectedSlot.lng], {
        radius: 35,
        color: '#178A52',
        weight: 2.5,
        fillColor: '#178A52',
        fillOpacity: 0.15,
        dashArray: '6, 6',
      });
      geofenceGroupRef.current.addLayer(circle);

      // Exact 6x4 ft rectangle boundary
      const latHalf = 0.000018;
      const lngHalf = 0.000012;
      const bounds: L.LatLngBoundsLiteral = [
        [selectedSlot.lat - latHalf, selectedSlot.lng - lngHalf],
        [selectedSlot.lat + latHalf, selectedSlot.lng + lngHalf],
      ];
      const rect = L.rectangle(bounds, {
        color: '#E3A82B',
        weight: 3,
        fillColor: '#04231A',
        fillOpacity: 0.75,
      });
      geofenceGroupRef.current.addLayer(rect);

      // High-Visibility Vendor Highlight Pin with Auto-Open Popup
      const highlightIcon = L.divIcon({
        className: 'vendor-highlight-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #0B4A31; border: 3px solid #E3A82B; box-shadow: 0 0 15px rgba(227, 168, 43, 0.8), 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 16px;">
              ${selectedSlot.categoryIcon || '🛒'}
            </div>
            <div style="margin-top: 2px; background: #04231A; color: #E3A82B; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 6px; border: 1px solid #E3A82B; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
              ${isUrdu ? selectedSlot.slotNumberUrdu : selectedSlot.slotNumber}
            </div>
          </div>
        `,
        iconSize: [36, 52],
        iconAnchor: [18, 50],
        popupAnchor: [0, -50],
      });

      const pinMarker = L.marker([selectedSlot.lat, selectedSlot.lng], { icon: highlightIcon });
      
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; color: #132A21; min-width: 190px; line-height: 1.4;">
          <div style="background: #0B4A31; color: #FFFFFF; padding: 6px 10px; border-radius: 8px 8px 0 0; margin: -14px -14px 8px -14px; border-bottom: 2px solid #E3A82B;">
            <div style="font-size: 9px; color: #E3A82B; font-weight: 800; text-transform: uppercase;">
              ${isUrdu ? 'سرکاری تصدیق شدہ پچ' : 'DC Sanctioned Spot'}
            </div>
            <div style="font-weight: 800; font-size: 13px;">
              ${isUrdu ? selectedSlot.slotNumberUrdu : selectedSlot.slotNumber}
            </div>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #04231A; margin-bottom: 2px;">
            ${isUrdu ? selectedSlot.assignedVendorNameUrdu : selectedSlot.assignedVendorName}
          </div>
          <div style="font-size: 11px; color: #5C6F63; margin-bottom: 6px;">
            ${isUrdu ? selectedSlot.marketNameUrdu : selectedSlot.marketName}
          </div>
          <div style="background: #F6F2E7; padding: 5px 8px; border-radius: 6px; font-size: 10px; border: 1px solid #178A52/30; margin-bottom: 6px;">
            <div><strong>${isUrdu ? 'پیمائش:' : 'Pitch Area:'}</strong> ${selectedSlot.dimensions}</div>
            <div><strong>${isUrdu ? 'پیدل راستہ:' : 'Walkway Buffer:'}</strong> ${selectedSlot.walkwayClearance}</div>
            <div><strong>${isUrdu ? 'شفٹ اوقات:' : 'Hours:'}</strong> ${selectedSlot.shiftTiming}</div>
          </div>
          <div style="font-family: monospace; font-size: 10px; color: #178A52; font-weight: 700;">
            📍 ${selectedSlot.lat.toFixed(5)}°N, ${selectedSlot.lng.toFixed(5)}°E
          </div>
        </div>
      `;
      pinMarker.bindPopup(popupHtml, { maxWidth: 240 });
      geofenceGroupRef.current.addLayer(pinMarker);

      // Auto-open popup on selection
      setTimeout(() => {
        pinMarker.openPopup();
      }, 350);
    }

    return () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {
          console.warn('Leaflet cleanup on unmount error:', e);
        }
        leafletMapRef.current = null;
        geofenceGroupRef.current = null;
        clusterGroupRef.current = null;
      }
    };
  }, [isOpen, mapViewMode, cityClusterPoints, selectedSlot, currentCity, isUrdu]);

  // Set initial selected slot
  useEffect(() => {
    if (initialSlotId) {
      // 1. Check matching vendor in vendors array
      const matchedVendor = vendors.find(v => 
        v.id === initialSlotId || 
        v.qrId === initialSlotId ||
        (v.name && v.name.toLowerCase().includes(initialSlotId.toLowerCase())) ||
        (v.slotNumber && v.slotNumber.toLowerCase().includes(initialSlotId.toLowerCase()))
      );

      // 2. Find slot across all cities
      for (const city of PAKISTAN_CITY_SLOTS_DATA) {
        for (const zone of city.zones) {
          const matched = zone.slots.find(s => 
            s.id === initialSlotId || 
            s.slotNumber.toLowerCase().includes(initialSlotId.toLowerCase()) || 
            s.qrId.toLowerCase().includes(initialSlotId.toLowerCase()) ||
            s.assignedVendorName.toLowerCase().includes(initialSlotId.toLowerCase()) ||
            s.assignedVendorNameUrdu.includes(initialSlotId) ||
            (matchedVendor && (s.assignedVendorName.toLowerCase().includes(matchedVendor.name.toLowerCase()) || s.slotNumber.toLowerCase().includes((matchedVendor.slotNumber || '').toLowerCase())))
          );
          if (matched) {
            setSelectedCityId(city.cityId);
            setSelectedSlot(matched);
            setZoomLevel(19);
            if (leafletMapRef.current) {
              leafletMapRef.current.flyTo([matched.lat, matched.lng], 19, { duration: 0.8 });
            }
            return;
          }
        }
      }

      // If vendor has GPS coordinates but not in static city slots data, create a dynamic active slot
      if (matchedVendor && matchedVendor.latitude && matchedVendor.longitude) {
        const dynamicSlot: VendorSlot = {
          id: matchedVendor.id,
          slotNumber: matchedVendor.slotNumber || 'Slot A-1',
          slotNumberUrdu: matchedVendor.slotNumber || 'سلاٹ A-1',
          cityName: 'Islamabad / Rawalpindi',
          cityNameUrdu: 'اسلام آباد / راولپنڈی',
          marketName: matchedVendor.marketName || 'District Market Area',
          marketNameUrdu: matchedVendor.marketNameUrdu || matchedVendor.marketName || 'مارکیٹ زون',
          category: 'Produce Stall',
          categoryUrdu: 'پھل و سبزی ریڑھی',
          lat: matchedVendor.latitude,
          lng: matchedVendor.longitude,
          status: 'occupied',
          assignedVendorName: matchedVendor.name,
          assignedVendorNameUrdu: matchedVendor.nameUrdu || matchedVendor.name,
          vendorPhone: matchedVendor.phone || '+92 300 1234567',
          vendorCnic: matchedVendor.cnic || '37405-1234567-1',
          vendorScore: (matchedVendor.score || 9) * 10,
          qrId: matchedVendor.qrId || matchedVendor.id,
          dimensions: matchedVendor.assignedPitchDimensions || '6x4 ft',
          dimensionsUrdu: '6x4 فٹ ریڑھی سلاٹ',
          totalAreaSqFt: 24,
          walkwayClearance: '3.5 ft clear',
          walkwayClearanceUrdu: '3.5 فٹ پیدل راستہ',
          amenities: {
            electricity: true,
            waterDistanceMeters: 15,
            dustbinId: 'BIN-101',
            solarLight: true,
          },
          shiftTiming: matchedVendor.authorizedOperatingHours || matchedVendor.shiftTime || '08:00 AM - 04:00 PM',
          shiftTimingUrdu: 'صبح 8:00 تا شام 4:00',
          categoryIcon: '🛒',
          zoomLevel: 19,
          directionsUrdu: 'ڈی سی نامزد کردہ مارکیٹ احاطہ',
          directionsEn: 'DC Designated Market Corridor Zone',
        };
        setSelectedSlot(dynamicSlot);
        setZoomLevel(19);
        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([dynamicSlot.lat, dynamicSlot.lng], 19, { duration: 0.8 });
        }
        return;
      }
    }
    
    // Default to first slot if none selected
    if (!selectedSlot && allCitySlots.length > 0) {
      setSelectedSlot(allCitySlots[0]);
    }
  }, [initialSlotId, isOpen, vendors]);

  // Global search trigger across all Pakistani cities
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (!val.trim()) return;

    const q = val.toLowerCase().trim();
    
    // First try matching in current city
    const localMatch = allCitySlots.find(s =>
      s.assignedVendorName.toLowerCase().includes(q) ||
      s.assignedVendorNameUrdu.includes(q) ||
      s.slotNumber.toLowerCase().includes(q) ||
      s.slotNumberUrdu.includes(q) ||
      s.qrId.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.vendorCnic?.includes(q) ||
      s.vendorPhone?.includes(q)
    );

    if (localMatch) {
      setSelectedSlot(localMatch);
      setZoomLevel(19);
      return;
    }

    // If not in current city, search across all of Pakistan and auto-switch city!
    for (const city of PAKISTAN_CITY_SLOTS_DATA) {
      for (const zone of city.zones) {
        const nationwideMatch = zone.slots.find(s =>
          s.assignedVendorName.toLowerCase().includes(q) ||
          s.assignedVendorNameUrdu.includes(q) ||
          s.slotNumber.toLowerCase().includes(q) ||
          s.slotNumberUrdu.includes(q) ||
          s.qrId.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.vendorCnic?.includes(q) ||
          s.vendorPhone?.includes(q)
        );

        if (nationwideMatch) {
          setSelectedCityId(city.cityId);
          setSelectedSlot(nationwideMatch);
          setZoomLevel(19);
          return;
        }
      }
    }
  };

  // Update selected slot if city changes and current selected slot is not in new city
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    const newCity = PAKISTAN_CITY_SLOTS_DATA.find(c => c.cityId === cityId);
    if (newCity && newCity.zones[0]?.slots[0]) {
      setSelectedSlot(newCity.zones[0].slots[0]);
      setZoomLevel(19);
    }
  };

  // 1-Click Zoom into slot
  const handleSelectSlot = (slot: VendorSlot) => {
    setSelectedSlot(slot);
    setZoomLevel(19);
    
    // Play subtle chime
    speechService.playChime('success');
  };

  // Speak directions
  const handleSpeakDirections = () => {
    if (!selectedSlot) return;
    setIsSpeaking(true);

    const speechText = isUrdu
      ? `سرکاری الاٹ شدہ ${selectedSlot.slotNumberUrdu}، بازار: ${selectedSlot.marketNameUrdu}۔ الاٹ شدہ دکاندار: ${selectedSlot.assignedVendorNameUrdu}۔ رقبہ: ${selectedSlot.dimensionsUrdu}۔ راستہ: ${selectedSlot.directionsUrdu}۔ سہولیات: ${selectedSlot.amenities.solarLight ? 'سولر لائٹ موجود ہے، ' : ''}پینے کا پانی ${selectedSlot.amenities.waterDistanceMeters} میٹر کے فاصلے پر ہے اور ڈسٹ بن کوڈ ہے ${selectedSlot.amenities.dustbinId}۔`
      : `Official government assigned ${selectedSlot.slotNumber} in ${selectedSlot.marketName}. Assigned vendor: ${selectedSlot.assignedVendorName}. Dimensions: ${selectedSlot.dimensions}. Directions: ${selectedSlot.directionsEn}. Walkway buffer: ${selectedSlot.walkwayClearance}. Water station is ${selectedSlot.amenities.waterDistanceMeters} meters away.`;

    speechService.speak(speechText, {
      lang: isUrdu ? 'ur' : 'en',
      voiceGender: 'female',
      rate: isUrdu ? 0.92 : 1.0,
      onEnd: () => setIsSpeaking(false),
    });
  };

  // Filter slots in current city
  const filteredSlots = allCitySlots.filter(s => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      s.slotNumber.toLowerCase().includes(query) ||
      s.slotNumberUrdu.includes(query) ||
      s.assignedVendorName.toLowerCase().includes(query) ||
      s.assignedVendorNameUrdu.includes(query) ||
      s.marketName.toLowerCase().includes(query) ||
      s.marketNameUrdu.includes(query) ||
      s.category.toLowerCase().includes(query) ||
      s.categoryUrdu.includes(query) ||
      s.qrId.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query)
    );
  });

  if (!isOpen) return null;

  const targetLat = selectedSlot ? selectedSlot.lat : currentCity.centerLat;
  const targetLng = selectedSlot ? selectedSlot.lng : currentCity.centerLng;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${targetLat},${targetLng}&t=${mapType}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="fixed inset-0 z-50 bg-[#04231A]/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="bg-[#FCFAF3] border-2 border-[#178A52] rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-[#132A21]"
        style={{ fontFamily: isUrdu ? "'Noto Nastaliq Urdu', 'Sora', sans-serif" : "'Sora', sans-serif" }}
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="p-4 sm:p-5 bg-[#0B4A31] text-white border-b-2 border-[#E3A82B] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <PakistanFlagEmblem size="sm" variant="flag" rounded="md" className="ring-1 ring-amber-400/60 shadow-md" />
            <BrandLogo variant="dark" size="sm" showSubtitle={false} />
            <div className="hidden sm:block h-8 w-px bg-white/20" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#FCFAF3]">
                  {isUrdu ? 'پورا شہر: سرکاری وینڈر سلاٹس و جیو فینس نقشہ' : 'Complete City Vendor Slots & GIS Space Breakdown'}
                </h3>
                <span className="bg-[#E3A82B] text-[#04231A] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  VRF 2026 High-Precision
                </span>
              </div>
              <p className="text-xs text-[#DCEFE4]/90 font-urdu mt-0.5">
                {isUrdu 
                  ? 'تمام شہروں کے سرکاری سلاٹس کا تفصیلی رقبہ، پیدل راستہ اور 1-کلک گوگل میپ زوم' 
                  : '1-Click Precision Zoom into assigned space, dimensions, walkway buffer & live amenities'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#DCEFE4] hover:bg-[#04231A] hover:text-white transition-colors"
              title={isUrdu ? 'بند کریں' : 'Close'}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ================= CITY SELECTION TABS ================= */}
        <div className="p-3 bg-[#F6F2E7] border-b border-[#178A52]/20 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-xs font-extrabold text-[#0B4A31] shrink-0 flex items-center gap-1 pl-2">
            <Building2 className="w-4 h-4 text-[#178A52]" />
            {isUrdu ? 'شہر منتخب کریں:' : 'Select City:'}
          </span>

          <div className="flex items-center gap-1.5">
            {PAKISTAN_CITY_SLOTS_DATA.map((city) => {
              const isSelected = selectedCityId === city.cityId;
              return (
                <button
                  key={city.cityId}
                  onClick={() => handleCityChange(city.cityId)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#0B4A31] text-white shadow-md border-2 border-[#E3A82B]'
                      : 'bg-white text-[#132A21] hover:bg-[#DCEFE4] border border-[#178A52]/30'
                  }`}
                >
                  <span>{isUrdu ? city.cityNameUrdu : city.cityName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-[#E3A82B] text-[#04231A]' : 'bg-[#F6F2E7] text-[#5C6F63]'
                  }`}>
                    {city.totalZonedSlots}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= CITY STATS OVERVIEW BAR ================= */}
        <div className="px-4 py-2.5 bg-[#FCFAF3] border-b border-[#178A52]/15 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#178A52]" />
              <span className="text-[#5C6F63]">{isUrdu ? 'کل منظور شدہ سلاٹس:' : 'Total Zoned Slots:'}</span>
              <strong className="text-[#04231A] font-mono text-sm">{currentCity.totalZonedSlots}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#178A52]" />
              <span className="text-[#5C6F63]">{isUrdu ? 'مقبوضہ و ریگولرائزڈ:' : 'Occupied & Active:'}</span>
              <strong className="text-[#178A52] font-mono text-sm">{currentCity.occupiedSlots}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-[#E3A82B]" />
              <span className="text-[#5C6F63]">{isUrdu ? 'تبادلہ/خالی دستیاب:' : 'Swap/Vacant Available:'}</span>
              <strong className="text-[#E3A82B] font-mono text-sm">{currentCity.vacantSlots}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0B4A31]" />
              <span className="text-[#5C6F63]">{isUrdu ? 'اوسط تعمیل اسکور:' : 'Avg Compliance:'}</span>
              <strong className="text-[#0B4A31] font-mono text-sm">{currentCity.averageCompliance}%</strong>
            </div>
          </div>

          {/* Quick Search & Vendor Suggestions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-[#5C6F63] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={isUrdu ? 'کسی بھی وینڈر کا نام، سلاٹ ID یا CNIC تلاش کریں...' : 'Search vendor name, slot ID, QR or CNIC...'}
                className="w-full bg-white border border-[#178A52]/40 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#132A21] placeholder-[#5C6F63]/70 focus:outline-none focus:ring-2 focus:ring-[#178A52] font-medium shadow-xs"
              />
            </div>
            
            {/* Quick Vendor Search Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[10px]">
              <span className="text-[#5C6F63] whitespace-nowrap font-bold">{isUrdu ? 'فوری تلاش:' : 'Quick:'}</span>
              <button
                onClick={() => handleSearchChange('Muhammad Bilal')}
                className="px-2 py-0.5 rounded-lg bg-[#DCEFE4] hover:bg-[#178A52] hover:text-white text-[#0B4A31] font-semibold whitespace-nowrap transition-colors"
              >
                {isUrdu ? 'محمد بلال (RWP-19)' : 'M. Bilal (RWP-19)'}
              </button>
              <button
                onClick={() => handleSearchChange('Karim')}
                className="px-2 py-0.5 rounded-lg bg-[#DCEFE4] hover:bg-[#178A52] hover:text-white text-[#0B4A31] font-semibold whitespace-nowrap transition-colors"
              >
                {isUrdu ? 'کریم فروٹ (LHR-14)' : 'Karim (LHR-14)'}
              </button>
              <button
                onClick={() => handleSearchChange('Tariq')}
                className="px-2 py-0.5 rounded-lg bg-[#DCEFE4] hover:bg-[#178A52] hover:text-white text-[#0B4A31] font-semibold whitespace-nowrap transition-colors"
              >
                {isUrdu ? 'طارق ڈرائی فروٹس (KHI-01)' : 'Tariq (KHI-01)'}
              </button>
              <button
                onClick={() => handleSearchChange('Bismillah')}
                className="px-2 py-0.5 rounded-lg bg-[#DCEFE4] hover:bg-[#178A52] hover:text-white text-[#0B4A31] font-semibold whitespace-nowrap transition-colors"
              >
                {isUrdu ? 'بسم اللہ ڈیری (ISB-03)' : 'Bismillah (ISB-03)'}
              </button>
            </div>
          </div>
        </div>

        {/* ================= MAIN SPLIT VIEW (MAP + SLOTS BREAKDOWN) ================= */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-[420px]">
          
          {/* LEFT/TOP: SLOTS LIST & DETAILED SPACE BREAKDOWN (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white border-b lg:border-b-0 lg:border-r border-[#178A52]/20 flex flex-col overflow-hidden max-h-[50vh] lg:max-h-full">
            <div className="p-3 bg-[#F6F2E7] border-b border-[#178A52]/15 flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B4A31] flex items-center gap-1">
                <Store className="w-4 h-4 text-[#178A52]" />
                {isUrdu ? `${currentCity.cityNameUrdu} کے تفویض شدہ سلاٹس` : `${currentCity.cityName} Assigned Slots Registry`}
              </span>
              <span className="text-[11px] text-[#5C6F63] font-mono">
                {filteredSlots.length} {isUrdu ? 'سلاٹس' : 'slots'}
              </span>
            </div>

            {/* Slots Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSelectSlot(slot)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#0B4A31] text-white border-[#E3A82B] shadow-lg ring-2 ring-[#E3A82B]/50'
                        : 'bg-[#FCFAF3] hover:bg-[#F6F2E7] text-[#132A21] border-[#178A52]/20 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-label={slot.category}>
                          {slot.categoryIcon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className={`font-black text-sm ${isSelected ? 'text-[#E3A82B]' : 'text-[#04231A]'}`}>
                              {isUrdu ? slot.slotNumberUrdu : slot.slotNumber}
                            </h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              slot.status === 'occupied' 
                                ? (isSelected ? 'bg-[#178A52] text-white' : 'bg-[#DCEFE4] text-[#0B4A31]')
                                : 'bg-[#E3A82B] text-[#04231A]'
                            }`}>
                              {slot.status === 'occupied' 
                                ? (isUrdu ? 'سرکاری فعال' : 'Active Zoned') 
                                : (isUrdu ? 'تبادلہ دستیاب' : 'Swap Open')}
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/95' : 'text-[#5C6F63]'}`}>
                            {isUrdu ? slot.assignedVendorNameUrdu : slot.assignedVendorName}
                          </p>
                        </div>
                      </div>

                      {/* 1-Click Zoom Badge */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSlot(slot);
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs transition-transform active:scale-95 ${
                          isSelected
                            ? 'bg-[#E3A82B] text-[#04231A]'
                            : 'bg-[#178A52] hover:bg-[#0B4A31] text-white'
                        }`}
                      >
                        <ZoomIn className="w-3 h-3" />
                        <span>{isUrdu ? '1-کلک زوم' : '1-Click Zoom'}</span>
                      </button>
                    </div>

                    {/* Spatial & Physical Breakdown Snapshot */}
                    <div className={`mt-2.5 pt-2 grid grid-cols-2 gap-2 text-[11px] border-t ${
                      isSelected ? 'border-white/20 text-white/90' : 'border-[#178A52]/15 text-[#5C6F63]'
                    }`}>
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{isUrdu ? 'رقبہ:' : 'Area:'}</span>
                        <span className="font-mono">{isUrdu ? slot.dimensionsUrdu : slot.dimensions}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{isUrdu ? 'پیدل راستہ:' : 'Walkway:'}</span>
                        <span>{isUrdu ? slot.walkwayClearanceUrdu : slot.walkwayClearance}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredSlots.length === 0 && (
                <div className="text-center py-8 text-xs text-[#5C6F63]">
                  {isUrdu ? 'کوئی سلاٹ نہیں ملا۔ تلاش تبدیل کریں۔' : 'No matching slots found.'}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT/BOTTOM: HIGH PRECISION GOOGLE MAP & STREET ZOOM RADAR (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col bg-[#04231A] relative overflow-hidden">
            
            {/* Map Controls Bar */}
            <div className="p-2.5 bg-[#0B4A31] border-b border-[#178A52] flex flex-wrap items-center justify-between gap-2 text-white text-xs z-10">
              <div className="flex items-center gap-2">
                <span className="bg-[#E3A82B] text-[#04231A] text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Compass className="w-3 h-3 animate-spin" />
                  {isUrdu ? '±35m جی پی ایس درستگی' : 'High-Precision GPS Lock'}
                </span>
                {selectedSlot && (
                  <span className="text-[11px] text-[#DCEFE4] font-medium hidden sm:inline font-mono">
                    📍 {selectedSlot.lat.toFixed(5)}°N, {selectedSlot.lng.toFixed(5)}°E
                  </span>
                )}
              </div>

              {/* Map Layer & Zoom Controls */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* View Mode Switcher */}
                <div className="flex rounded-lg overflow-hidden border border-[#178A52] bg-[#04231A]">
                  <button
                    onClick={() => setMapViewMode('clustered')}
                    className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition-all ${
                      mapViewMode === 'clustered' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#E3A82B]" />
                    <span>{isUrdu ? 'کلسترڈ نقشہ' : 'Clustered'}</span>
                  </button>
                  <button
                    onClick={() => setMapViewMode('satellite')}
                    className={`px-2.5 py-1 text-[11px] font-bold transition-all ${
                      mapViewMode === 'satellite' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    {isUrdu ? 'سیٹلائٹ' : 'Satellite'}
                  </button>
                  <button
                    onClick={() => setMapViewMode('street_view')}
                    className={`px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition-all ${
                      mapViewMode === 'street_view' ? 'bg-[#178A52] text-white shadow' : 'text-[#DCEFE4] hover:text-white'
                    }`}
                  >
                    <Eye className="w-3 h-3 text-[#E3A82B]" />
                    <span>{isUrdu ? 'اسٹریٹ ویو 360°' : 'Street View 360°'}</span>
                  </button>
                </div>

                {mapViewMode === 'satellite' && (
                  <div className="flex rounded-lg overflow-hidden border border-[#178A52] bg-[#04231A]">
                    <button
                      onClick={() => setMapType('m')}
                      className={`px-2 py-1 text-[10px] font-bold ${mapType === 'm' ? 'bg-[#178A52] text-white' : 'text-[#DCEFE4] hover:text-white'}`}
                    >
                      {isUrdu ? 'روڈ' : 'Road'}
                    </button>
                    <button
                      onClick={() => setMapType('k')}
                      className={`px-2 py-1 text-[10px] font-bold ${mapType === 'k' ? 'bg-[#178A52] text-white' : 'text-[#DCEFE4] hover:text-white'}`}
                    >
                      {isUrdu ? 'سیٹلائٹ' : 'Sat'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Map Render Stage based on active view mode */}
            <div className="flex-1 w-full h-[320px] sm:h-full relative bg-[#04231A]">
              
              {/* MODE 1: CLUSTERED LEAFLET MAP WITH RADAR GEOFENCE */}
              {mapViewMode === 'clustered' && (
                <div className="w-full h-full relative">
                  <div ref={leafletContainerRef} className="w-full h-full" />
                  
                  {/* Floating 1-Click Zoom Notice Overlay */}
                  <div className="absolute top-3 right-3 z-[400] bg-[#04231A]/90 text-white p-2.5 rounded-2xl border border-[#E3A82B] shadow-xl backdrop-blur-xs max-w-xs text-xs pointer-events-none hidden sm:block">
                    <div className="flex items-center gap-1.5 text-[#E3A82B] font-bold mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E3A82B]" />
                      <span>{isUrdu ? 'مارکر کلسٹرنگ و 35m جیو فینس' : 'Marker Clustering & 35m Radar Lock'}</span>
                    </div>
                    <p className="text-[11px] text-[#DCEFE4] leading-tight font-urdu">
                      {selectedSlot 
                        ? (isUrdu ? `کیمرہ خودکار طریقے سے ${selectedSlot.slotNumberUrdu} پر فوکسڈ ہے۔ 6x4 فٹ حد بندی نمایاں ہے۔` : `Camera locked on ${selectedSlot.slotNumber}. 6x4 ft geofence marked in gold.`)
                        : (isUrdu ? 'کسی بھی کلسٹر پر کلک کریں تاکہ خودکار زوم ہو۔' : 'Click any cluster bubble to expand.')}
                    </p>
                  </div>
                </div>
              )}

              {/* MODE 2: SATELLITE GOOGLE MAP */}
              {mapViewMode === 'satellite' && (
                <iframe
                  title="Google Maps City Slot Zoom"
                  src={mapEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              )}

              {/* MODE 3: STREET VIEW 360° PANORAMA */}
              {mapViewMode === 'street_view' && (
                <div className="w-full h-full relative bg-black flex flex-col">
                  <div className="p-2 bg-[#04231A] border-b border-[#178A52]/40 flex items-center justify-between text-xs px-3">
                    <span className="text-[#E3A82B] font-bold">
                      {isUrdu ? `اسٹریٹ ویو منظر: ${selectedSlot ? selectedSlot.marketNameUrdu : currentCity.cityNameUrdu}` : `Street View 360° Panorama: ${selectedSlot ? selectedSlot.marketName : currentCity.cityName}`}
                    </span>
                    {selectedSlot && (
                      <a
                        href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedSlot.lat},${selectedSlot.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] bg-[#E3A82B] text-[#04231A] px-2.5 py-0.5 rounded-lg font-black hover:bg-[#F3B740]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Google Street View 360°</span>
                      </a>
                    )}
                  </div>
                  <div className="relative flex-1 w-full">
                    <iframe
                      title="Bazaar Street View 360"
                      src={`https://maps.google.com/maps?q=${selectedSlot ? selectedSlot.lat : currentCity.centerLat},${selectedSlot ? selectedSlot.lng : currentCity.centerLng}&layer=c&cbll=${selectedSlot ? selectedSlot.lat : currentCity.centerLat},${selectedSlot ? selectedSlot.lng : currentCity.centerLng}&cbp=11,0,0,0,0&output=svembed`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACTIVE SELECTED SLOT INSPECTION & AMENITIES CARD */}
            {selectedSlot && (
              <div className="p-3.5 sm:p-4 bg-[#FCFAF3] border-t-2 border-[#E3A82B] text-[#132A21] flex flex-col gap-3 shadow-xl shrink-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedSlot.categoryIcon}</span>
                      <div>
                        <h4 className="font-extrabold text-base text-[#04231A]">
                          {isUrdu ? selectedSlot.slotNumberUrdu : selectedSlot.slotNumber} — {isUrdu ? selectedSlot.marketNameUrdu : selectedSlot.marketName}
                        </h4>
                        <p className="text-xs text-[#5C6F63] font-urdu">
                          {isUrdu ? `تفویض شدہ دکاندار: ${selectedSlot.assignedVendorNameUrdu}` : `Assigned Merchant: ${selectedSlot.assignedVendorName}`} • {selectedSlot.vendorPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Audio Listen, QR Badge, Outreach, & External Map buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* GOVERNMENT OUTREACH & UPLOAD BUTTON */}
                    <button
                      onClick={() => setShowOutreachModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#0B4A31] hover:bg-[#178A52] text-white border border-[#E3A82B] text-xs font-bold flex items-center gap-1.5 shadow transition-transform active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 text-[#E3A82B]" />
                      <span>{isUrdu ? 'سرکاری ترسیل و وسائل تفویض کریں' : 'Dispatch / Upload to Vendor'}</span>
                    </button>

                    <button
                      onClick={() => setShowQrBadge(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#04231A] hover:bg-[#0B4A31] text-[#E3A82B] border border-[#E3A82B]/60 text-xs font-black flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                    >
                      <QrCode className="w-4 h-4 text-[#E3A82B]" />
                      <span>{isUrdu ? 'کیو آر کوڈ و سرٹیفکیٹ' : 'View QR Badge'}</span>
                    </button>

                    <button
                      onClick={handleSpeakDirections}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all active:scale-95 ${
                        isSpeaking 
                          ? 'bg-[#E3A82B] text-[#04231A] animate-pulse'
                          : 'bg-[#178A52] hover:bg-[#0B4A31] text-white'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 text-[#E3A82B]" />
                      <span>{isSpeaking ? (isUrdu ? 'آڈیو رہنمائی جاری ہے...' : 'Speaking...') : (isUrdu ? 'آڈیو رہنمائی سنیں' : 'Listen Urdu Directions')}</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedSlot.lat},${selectedSlot.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F6F2E7] text-[#0B4A31] border border-[#178A52]/40 text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <span>{isUrdu ? 'گوگل میپ ایپ میں کھولیں' : 'Open in Google Maps'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* SUMMARY STATS CARD (OCCUPANCY RATE & VIOLATION FREQUENCY) */}
                <div 
                  id="selected-slot-summary-stats-card" 
                  className="bg-white rounded-2xl border-2 border-[#178A52]/30 p-3.5 sm:p-4 shadow-sm space-y-3"
                >
                  {/* Card Title & Meta Header */}
                  <div className="flex items-center justify-between border-b border-[#178A52]/15 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#0B4A31] text-[#E3A82B] flex items-center justify-center font-bold shadow-xs">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs sm:text-sm text-[#04231A] flex items-center gap-1.5">
                          <span>{isUrdu ? `خلاصہ شماریات برائے ${selectedSlot.slotNumberUrdu}` : `Summary Stats — ${selectedSlot.slotNumber}`}</span>
                          <span className="text-[10px] font-normal text-[#5C6F63]">({isUrdu ? selectedSlot.marketNameUrdu : selectedSlot.marketName})</span>
                        </h5>
                        <p className="text-[10px] text-[#5C6F63] font-urdu">
                          {isUrdu ? 'لوکل اسٹیٹ وینڈرز ڈیٹا بیس سے ریئل ٹائم تصدیق شدہ' : 'Live performance metrics calculated from local state vendors array'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#DCEFE4] text-[#0B4A31] border border-[#178A52]/20">
                      <Activity className="w-3 h-3 text-[#178A52]" />
                      <span>{isUrdu ? 'لوکل اسٹیٹ فعال' : 'Vendors Registry Active'}</span>
                    </div>
                  </div>

                  {/* Dual Metric Tiles: Occupancy Rate & Violation Frequency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Metric 1: Occupancy Rate */}
                    <div className="p-3 rounded-xl bg-[#FCFAF3] border border-[#178A52]/20 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-[#178A52]" />
                          <span className="text-xs font-extrabold text-[#04231A]">
                            {isUrdu ? 'شرح قبضہ (Occupancy Rate)' : 'Occupancy Rate'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          slotStats.occupancyRate >= 90 
                            ? 'bg-[#178A52] text-white' 
                            : slotStats.occupancyRate > 0 
                            ? 'bg-[#E3A82B] text-[#04231A]' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isUrdu ? slotStats.occupancyStatusUrdu : slotStats.occupancyStatus}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-[#04231A] font-mono tracking-tight">
                          {slotStats.occupancyFormatted}
                        </span>
                        <span className="text-[11px] text-[#5C6F63]">
                          {isUrdu ? 'مقررہ شفٹ استعمال' : 'Shift Allocation'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-[#E5E0D3] rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#178A52] h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(100, Math.max(0, slotStats.occupancyRate))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#5C6F63]">
                          <span>{isUrdu ? '28/30 دن مختص' : '28/30 Days Allocated'}</span>
                          <span>{isUrdu ? `بازار کوریڈور: ${slotStats.marketCorridorOccupancy}%` : `Corridor Avg: ${slotStats.marketCorridorOccupancy}%`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metric 2: Violation Frequency */}
                    <div className="p-3 rounded-xl bg-[#FCFAF3] border border-[#178A52]/20 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className={`w-4 h-4 ${slotStats.violationFrequency <= 1.5 ? 'text-[#178A52]' : 'text-[#E3A82B]'}`} />
                          <span className="text-xs font-extrabold text-[#04231A]">
                            {isUrdu ? 'تعدد خلاف ورزی (Violation Frequency)' : 'Violation Frequency'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          slotStats.violationFrequency <= 1.0 
                            ? 'bg-[#178A52] text-white' 
                            : slotStats.violationFrequency <= 2.5 
                            ? 'bg-[#E3A82B] text-[#04231A]' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {isUrdu ? slotStats.violationStatusUrdu : slotStats.violationStatus}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-[#04231A] font-mono tracking-tight">
                          {slotStats.violationFormatted}
                        </span>
                        <span className="text-[11px] text-[#5C6F63] font-mono font-semibold">
                          ({slotStats.violationCountPerMonth})
                        </span>
                      </div>

                      {/* Safety Compliance Meter */}
                      <div className="space-y-1">
                        <div className="w-full bg-[#E5E0D3] rounded-full h-2 overflow-hidden flex">
                          <div 
                            className="bg-[#178A52] h-2 transition-all duration-500"
                            style={{ width: `${Math.max(0, 100 - slotStats.violationFrequency * 10)}%` }}
                            title="Compliant Ratio"
                          />
                          <div 
                            className="bg-[#E3A82B] h-2 transition-all duration-500"
                            style={{ width: `${Math.min(100, slotStats.violationFrequency * 10)}%` }}
                            title="Violation Frequency Margin"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#5C6F63]">
                          <span>{isUrdu ? 'ڈی سی ریٹ و ترازو درستگی' : 'DC Price & Digital Scale Integrity'}</span>
                          <span className="font-semibold text-[#178A52]">
                            {slotStats.matchedVendor ? `${isUrdu ? 'اسکور' : 'Score'}: ${slotStats.matchedVendor.score}/10` : 'Zero Overcharge'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Context Strip from Local State Vendors Array */}
                  <div className="pt-2 border-t border-[#178A52]/15 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#5C6F63]">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>
                        <strong>{isUrdu ? 'مربوط دکاندار:' : 'Assigned Vendor:'}</strong>{' '}
                        <span className="text-[#04231A] font-semibold">{isUrdu ? selectedSlot.assignedVendorNameUrdu : selectedSlot.assignedVendorName}</span>
                      </span>
                      {slotStats.matchedVendor && (
                        <>
                          <span>
                            <strong>{isUrdu ? 'کریڈٹ ریٹنگ:' : 'Credit Standing:'}</strong>{' '}
                            <span className="text-[#0B4A31] font-mono font-bold">{slotStats.matchedVendor.creditScore}/850</span>
                          </span>
                          <span>
                            <strong>{isUrdu ? 'سیوک پوائنٹس:' : 'Civic Waste:'}</strong>{' '}
                            <span className="text-[#178A52] font-mono font-bold">+{slotStats.matchedVendor.wastePoints} pts</span>
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[#0B4A31] font-semibold">
                      {isUrdu ? 'پنجاب و وفاقی وی آر ایف مائیکرو سلاٹس ضابطہ 2026' : 'VRF Micro-Slots Regulation 2026'}
                    </span>
                  </div>
                </div>

                {/* GEOFENCED PERIMETER & MICRO-GIS BOUNDARY BREAKDOWN */}
                <div className="p-3 rounded-2xl bg-[#04231A] text-white border border-[#E3A82B]/40 shadow-inner space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#E3A82B] font-extrabold">
                      <ShieldCheck className="w-4 h-4 text-[#E3A82B]" />
                      <span>{isUrdu ? 'قانونی جیو فینس حد بندی و 4 کونوں کے جی پی ایس کوآرڈینیٹس' : 'Official Geofenced Boundary & 4-Corner GPS Vertices'}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#178A52] text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                      {isUrdu ? '0.0m ڈرفٹ — مکمل محفوظ' : '0.0m Drift (Active in Zone)'}
                    </span>
                  </div>

                  {/* 4 Corner Vertices Micro-Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px]">
                    <div className="bg-[#0B4A31] p-1.5 rounded-lg border border-[#178A52]/50">
                      <span className="text-[#E3A82B] block font-sans font-bold">{isUrdu ? 'شمال مغربی کونا (NW):' : 'NW Corner:'}</span>
                      <span className="text-[#DCEFE4]">{(selectedSlot.lat + 0.000028).toFixed(6)}°N</span>
                      <span className="text-[#5C6F63] block">{(selectedSlot.lng - 0.000018).toFixed(6)}°E</span>
                    </div>
                    <div className="bg-[#0B4A31] p-1.5 rounded-lg border border-[#178A52]/50">
                      <span className="text-[#E3A82B] block font-sans font-bold">{isUrdu ? 'شمال مشرقی کونا (NE):' : 'NE Corner:'}</span>
                      <span className="text-[#DCEFE4]">{(selectedSlot.lat + 0.000028).toFixed(6)}°N</span>
                      <span className="text-[#5C6F63] block">{(selectedSlot.lng + 0.000018).toFixed(6)}°E</span>
                    </div>
                    <div className="bg-[#0B4A31] p-1.5 rounded-lg border border-[#178A52]/50">
                      <span className="text-[#E3A82B] block font-sans font-bold">{isUrdu ? 'جنوب مشرقی کونا (SE):' : 'SE Corner:'}</span>
                      <span className="text-[#DCEFE4]">{(selectedSlot.lat - 0.000028).toFixed(6)}°N</span>
                      <span className="text-[#5C6F63] block">{(selectedSlot.lng + 0.000018).toFixed(6)}°E</span>
                    </div>
                    <div className="bg-[#0B4A31] p-1.5 rounded-lg border border-[#178A52]/50">
                      <span className="text-[#E3A82B] block font-sans font-bold">{isUrdu ? 'جنوب مغربی کونا (SW):' : 'SW Corner:'}</span>
                      <span className="text-[#DCEFE4]">{(selectedSlot.lat - 0.000028).toFixed(6)}°N</span>
                      <span className="text-[#5C6F63] block">{(selectedSlot.lng - 0.000018).toFixed(6)}°E</span>
                    </div>
                  </div>
                </div>

                {/* Spatial Grid & Amenities Micro-Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#178A52]/15 text-xs">
                  <div className="bg-white p-2 rounded-xl border border-[#178A52]/20">
                    <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'سلاٹ پیمائش' : 'Stall Dimensions'}</span>
                    <strong className="text-[#04231A] font-mono text-xs">{isUrdu ? selectedSlot.dimensionsUrdu : selectedSlot.dimensions}</strong>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-[#178A52]/20">
                    <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'پیدل راستہ بفر' : 'Walkway Buffer'}</span>
                    <strong className="text-[#178A52] text-xs">{isUrdu ? selectedSlot.walkwayClearanceUrdu : selectedSlot.walkwayClearance}</strong>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-[#178A52]/20">
                    <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'پینے کا پانی' : 'Drinking Water'}</span>
                    <strong className="text-[#0B4A31] text-xs flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      {selectedSlot.amenities.waterDistanceMeters} {isUrdu ? 'میٹر فاصلہ' : 'meters away'}
                    </strong>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-[#178A52]/20">
                    <span className="text-[10px] text-[#5C6F63] block">{isUrdu ? 'شفٹ اوقات' : 'Shift Timing'}</span>
                    <strong className="text-[#E3A82B] text-xs">{isUrdu ? selectedSlot.shiftTimingUrdu : selectedSlot.shiftTiming}</strong>
                  </div>
                </div>

                {/* Plain Step-by-Step Directions */}
                <div className="p-2.5 rounded-xl bg-[#DCEFE4]/60 border border-[#178A52]/30 text-xs flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-[#178A52] shrink-0 mt-0.5" />
                  <p className="text-[#132A21] font-urdu leading-relaxed">
                    <strong>{isUrdu ? 'مقام تک پہنچنے کا آسان راستہ: ' : 'Exact Directions: '}</strong>
                    {isUrdu ? selectedSlot.directionsUrdu : selectedSlot.directionsEn}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR CODE BADGE PREVIEW MODAL */}
        {showQrBadge && selectedSlot && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#FCFAF3] border-2 border-[#E3A82B] rounded-3xl p-6 max-w-lg w-full shadow-2xl text-center space-y-4 text-[#132A21] animate-fadeUp">
              <div className="flex items-center justify-between border-b border-[#178A52]/30 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#178A52]" />
                  <h4 className="font-extrabold text-sm sm:text-base text-[#04231A] font-sora">
                    {isUrdu ? 'حکومت پاکستان — باضابطہ وینڈر جیو فینس کیو آر' : 'Govt of Pakistan Official Geofenced QR Badge'}
                  </h4>
                </div>
                <button
                  onClick={() => setShowQrBadge(false)}
                  className="p-1 rounded-full hover:bg-slate-200 text-slate-500 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Dynamic QR Badge View */}
              <div className="p-4 bg-gradient-to-b from-[#04231A] to-[#0B4A31] border-2 border-[#E3A82B] rounded-2xl flex flex-col items-center justify-center text-white relative shadow-lg">
                <div className="inline-block bg-white p-3 rounded-2xl border-4 border-[#178A52] shadow-xl relative">
                  <QrCode className="w-36 h-36 text-[#04231A]" />
                  <span className="absolute bottom-1 bg-[#178A52] text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold left-1/2 -translate-x-1/2">
                    {selectedSlot.qrId}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#E3A82B] mt-2">
                  {selectedSlot.slotNumber} • 33.5973°N, 73.0565°E
                </span>
                <span className="text-[10px] text-[#DCEFE4] font-urdu mt-0.5">
                  VRF Act 2026 • 100% Calibrated Digital Scale Certified
                </span>
              </div>

              {/* Geofence & DC Rates Specs Grid */}
              <div className="text-left bg-white p-3.5 rounded-2xl border border-[#178A52]/20 text-xs space-y-1.5 shadow-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isUrdu ? 'دکاندار نام:' : 'Assigned Merchant:'}</span>
                  <strong className="text-slate-900 font-urdu">{isUrdu ? selectedSlot.assignedVendorNameUrdu : selectedSlot.assignedVendorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isUrdu ? 'سلاٹ کوڈ:' : 'Slot ID:'}</span>
                  <strong className="text-[#178A52] font-mono font-bold">{selectedSlot.slotNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isUrdu ? 'بازار و مقام:' : 'Market:'}</span>
                  <strong className="text-slate-900 font-urdu">{isUrdu ? selectedSlot.marketNameUrdu : selectedSlot.marketName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isUrdu ? 'رقبہ و بفر:' : 'Dimensions & Corridor:'}</span>
                  <strong className="text-[#04231A] font-bold">{selectedSlot.dimensions} (Walkway: 5.2 ft Clear)</strong>
                </div>
                <div className="flex justify-between border-t pt-1.5 mt-1">
                  <span className="text-[#178A52] font-bold">{isUrdu ? 'ڈی سی ریٹس تعمیل:' : 'DC Rates Compliance:'}</span>
                  <strong className="text-[#178A52] font-bold">⭐ 9.4 / 10 (Zero Overcharge)</strong>
                </div>
              </div>

              <button
                onClick={() => setShowQrBadge(false)}
                className="w-full py-2.5 bg-[#178A52] hover:bg-[#0B4A31] text-white rounded-xl font-bold text-xs shadow-md transition-transform active:scale-95"
              >
                {isUrdu ? 'تصدیق مکمل — بند کریں' : 'Verified & Close'}
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL FOOTER ================= */}
        <div className="p-3.5 bg-[#0B4A31] border-t-2 border-[#E3A82B] text-white flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E3A82B] animate-ping" />
            <span className="text-[#FCFAF3] font-urdu text-[11px]">
              {isUrdu 
                ? 'پنجاب و وفاقی بلدیاتی ریگولیشن: کسی بھی غیر مجاز ریڑھی ہٹانے سے پہلے متبادل سلاٹ فراہم کرنا لازمی ہے۔' 
                : 'Zero-Unslotted Eviction: Every registered vendor is guaranteed an official mapped slot.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-[#178A52] hover:bg-[#178A52]/80 text-white px-5 py-1.5 rounded-xl font-bold shadow transition-transform active:scale-95"
            >
              {isUrdu ? 'مکمل (بند کریں)' : 'Done (Close)'}
            </button>
          </div>
        </div>

        {/* GOVERNMENT VENDOR OUTREACH & DISPATCH MODAL */}
        <GovernmentVendorOutreachModal
          isOpen={showOutreachModal}
          onClose={() => setShowOutreachModal(false)}
          vendor={currentSlotVendorProfile}
          lang={lang}
        />
      </div>
    </div>
  );
};
