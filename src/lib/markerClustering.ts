import L from 'leaflet';

export interface ClusterPoint {
  id: string;
  lat: number;
  lng: number;
  type: 'vendor' | 'alert' | 'patrol';
  titleEn: string;
  titleUrdu: string;
  subtitleEn: string;
  subtitleUrdu: string;
  categoryIcon?: string;
  status?: string;
  variancePct?: number;
  data: any;
}

export interface ClusteredGroup {
  id: string;
  lat: number;
  lng: number;
  isCluster: boolean;
  count: number;
  vendorsCount: number;
  alertsCount: number;
  patrolsCount: number;
  items: ClusterPoint[];
  dominantType: 'vendor' | 'alert' | 'mixed' | 'patrol';
}

/**
 * High-performance grid-based clustering calculation for Leaflet maps
 * Groups geographic points within a pixel radius at the current zoom level
 */
export function calculateClusters(
  points: ClusterPoint[],
  map: L.Map,
  radiusPx = 55
): ClusteredGroup[] {
  if (!points || points.length === 0) return [];
  if (!map) return [];

  const zoom = map.getZoom();
  const clusters: ClusteredGroup[] = [];
  const processed = new Set<string>();

  // Convert points to screen pixel coords for the current zoom
  const projectedPoints = points.map(p => {
    const latLng = L.latLng(p.lat, p.lng);
    const pixel = map.project(latLng, zoom);
    return { ...p, pixel };
  });

  for (let i = 0; i < projectedPoints.length; i++) {
    const p1 = projectedPoints[i];
    if (processed.has(p1.id)) continue;

    const clusterItems: ClusterPoint[] = [p1];
    processed.add(p1.id);

    let sumX = p1.pixel.x;
    let sumY = p1.pixel.y;
    let sumLat = p1.lat;
    let sumLng = p1.lng;

    for (let j = i + 1; j < projectedPoints.length; j++) {
      const p2 = projectedPoints[j];
      if (processed.has(p2.id)) continue;

      const dx = p1.pixel.x - p2.pixel.x;
      const dy = p1.pixel.y - p2.pixel.y;
      const distSq = dx * dx + dy * dy;

      if (distSq <= radiusPx * radiusPx) {
        clusterItems.push(p2);
        processed.add(p2.id);
        sumX += p2.pixel.x;
        sumY += p2.pixel.y;
        sumLat += p2.lat;
        sumLng += p2.lng;
      }
    }

    const count = clusterItems.length;
    const centerLat = sumLat / count;
    const centerLng = sumLng / count;

    let vendorsCount = 0;
    let alertsCount = 0;
    let patrolsCount = 0;

    clusterItems.forEach(item => {
      if (item.type === 'vendor') vendorsCount++;
      else if (item.type === 'alert') alertsCount++;
      else if (item.type === 'patrol') patrolsCount++;
    });

    let dominantType: 'vendor' | 'alert' | 'mixed' | 'patrol' = 'vendor';
    if (alertsCount > 0 && vendorsCount > 0) dominantType = 'mixed';
    else if (alertsCount > 0) dominantType = 'alert';
    else if (patrolsCount > 0) dominantType = 'patrol';

    clusters.push({
      id: count === 1 ? clusterItems[0].id : `cluster-${i}-${count}`,
      lat: count === 1 ? clusterItems[0].lat : centerLat,
      lng: count === 1 ? clusterItems[0].lng : centerLng,
      isCluster: count > 1,
      count,
      vendorsCount,
      alertsCount,
      patrolsCount,
      items: clusterItems,
      dominantType,
    });
  }

  return clusters;
}

/**
 * Creates custom HTML DivIcons for clusters and individual markers
 */
export function createClusterIcon(cluster: ClusteredGroup, isUrdu = false): L.DivIcon {
  if (!cluster.isCluster) {
    const item = cluster.items[0];
    if (item.type === 'alert') {
      // High-visibility pulsing red violation marker
      return L.divIcon({
        className: 'custom-alert-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #DC2626; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 800; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.6); z-index: 2;">
              ⚠️
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
    }

    if (item.type === 'patrol') {
      return L.divIcon({
        className: 'custom-patrol-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #2563EB; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.5); z-index: 2;">
              🚓
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    }

    // Individual 6x4 ft Vendor Stall Marker
    const icon = item.categoryIcon || '🏪';
    return L.divIcon({
      className: 'custom-vendor-marker',
      html: `
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          background: #04231A;
          color: #FFFFFF;
          border: 2px solid #178A52;
          padding: 3px 8px;
          border-radius: 20px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          cursor: pointer;
          white-space: nowrap;
          transform: translate(-50%, -50%);
        ">
          <span style="font-size: 13px;">${icon}</span>
          <span>${isUrdu ? item.titleUrdu : item.titleEn}</span>
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; display: inline-block;"></span>
        </div>
      `,
      iconSize: [120, 28],
      iconAnchor: [60, 14],
    });
  }

  // Cluster Marker
  let bgColor = '#178A52'; // green for compliant vendors
  let ringColor = '#0B4A31';
  let badgeLabel = 'Vendors';
  let size = 44;

  if (cluster.count > 100) size = 56;
  else if (cluster.count > 30) size = 50;

  if (cluster.dominantType === 'alert') {
    bgColor = '#DC2626';
    ringColor = '#7F1D1D';
    badgeLabel = 'Alerts';
  } else if (cluster.dominantType === 'mixed') {
    bgColor = '#D97706';
    ringColor = '#78350F';
    badgeLabel = 'Mixed';
  }

  return L.divIcon({
    className: 'custom-cluster-badge',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${bgColor};
        border: 3px solid #FFFFFF;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #FFFFFF;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        user-select: none;
      ">
        <div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px dashed ${bgColor}; opacity: 0.6; animation: spin 10s linear infinite;"></div>
        <span style="font-size: ${size > 50 ? 14 : 12}px; font-weight: 900; line-height: 1;">${cluster.count}</span>
        ${cluster.alertsCount > 0 ? `<span style="font-size: 9px; font-weight: 800; background: #991B1B; padding: 1px 4px; border-radius: 6px; margin-top: 2px;">⚠️ ${cluster.alertsCount}</span>` : `<span style="font-size: 8px; text-transform: uppercase; font-weight: 700; opacity: 0.9;">${isUrdu ? 'اسٹالز' : 'Slots'}</span>`}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
