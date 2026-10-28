import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  Tooltip,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Building2,
  AlertTriangle,
  Compass,
  Maximize2,
  Minimize2,
  Search,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  TrendingUp,
  Hospital,
  Activity,
  Phone,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

// Tile Providers Configuration (100% Free Public GIS Services - Zero API Key Required)
const BASEMAP_PROVIDERS = {
  dark: {
    id: 'dark',
    name: 'Tactical Dark',
    icon: '🌙',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite HD',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
    maxZoom: 18
  },
  streets: {
    id: 'streets',
    name: 'Streets HD',
    icon: '🏙️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS',
    maxZoom: 18
  },
  light: {
    id: 'light',
    name: 'Minimal Light',
    icon: '🗺️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  },
  topo: {
    id: 'topo',
    name: 'Topographic',
    icon: '⛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, USGS',
    maxZoom: 18
  }
};

// Regional Quick-Nav Centers
const REGIONS = [
  { id: 'all', name: 'All India', center: [21.8, 79.5], zoom: 4.8 },
  { id: 'south', name: 'South Corridor', center: [10.5, 77.8], zoom: 7 },
  { id: 'west', name: 'Western Belt', center: [20.2, 73.2], zoom: 7 },
  { id: 'north', name: 'North Capital', center: [28.6, 77.3], zoom: 7 },
  { id: 'east', name: 'Eastern Hub', center: [23.5, 86.8], zoom: 6.8 }
];

// Major Interstate Worker Corridors (Origin -> Destination)
const MIGRATION_CORRIDORS = [
  {
    id: 'c1',
    name: 'Bihar ➔ Kerala Corridor',
    origin: 'Darbhanga, Bihar',
    destination: 'Ernakulam, Kerala',
    startCoord: [26.1542, 85.8918],
    endCoord: [9.9816, 76.2999],
    midPoint: [17.5, 82.2], // Curved arc
    sector: 'Construction & Civil Masonry',
    estimatedWorkers: '45,000+ Workers',
    color: '#38bdf8'
  },
  {
    id: 'c2',
    name: 'West Bengal ➔ Gujarat Corridor',
    origin: 'Murshidabad, WB',
    destination: 'Surat, Gujarat',
    startCoord: [24.1759, 88.2802],
    endCoord: [21.1702, 72.8311],
    midPoint: [23.5, 80.5],
    sector: 'Textile Looms & Dyeing Industry',
    estimatedWorkers: '60,000+ Workers',
    color: '#a855f7'
  },
  {
    id: 'c3',
    name: 'Uttar Pradesh ➔ Maharashtra Corridor',
    origin: 'Gorakhpur, UP',
    destination: 'Mumbai / Thane, Maharashtra',
    startCoord: [26.7606, 83.3732],
    endCoord: [19.2183, 72.9781],
    midPoint: [23.2, 77.8],
    sector: 'Heavy Rigging, Scaffolding & Logistics',
    estimatedWorkers: '85,000+ Workers',
    color: '#f59e0b'
  },
  {
    id: 'c4',
    name: 'Odisha ➔ Tamil Nadu Corridor',
    origin: 'Mayurbhanj, Odisha',
    destination: 'Chennai, Tamil Nadu',
    startCoord: [21.9287, 86.7369],
    endCoord: [13.0827, 80.2707],
    midPoint: [17.8, 83.5],
    sector: 'Sanitation, Hospital Support & Logistics',
    estimatedWorkers: '32,000+ Workers',
    color: '#10b981'
  },
  {
    id: 'c5',
    name: 'Jharkhand ➔ Delhi NCR Corridor',
    origin: 'Ranchi, Jharkhand',
    destination: 'Delhi NCR',
    startCoord: [23.3441, 85.3096],
    endCoord: [28.6139, 77.2090],
    midPoint: [25.8, 81.2],
    sector: 'Transit Infrastructure & Brick Kilns',
    estimatedWorkers: '50,000+ Workers',
    color: '#ec4899'
  }
];

// Helper to generate a curved quadratic bezier path
function generateCurvedPolyline(p1, p2, pMid, pointsCount = 16) {
  const points = [];
  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    // Quadratic Bézier formula: (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
    const lat = Math.pow(1 - t, 2) * p1[0] + 2 * (1 - t) * t * pMid[0] + Math.pow(t, 2) * p2[0];
    const lng = Math.pow(1 - t, 2) * p1[1] + 2 * (1 - t) * t * pMid[1] + Math.pow(t, 2) * p2[1];
    points.push([lat, lng]);
  }
  return points;
}

// Marker Icon Generators
const createOutbreakIcon = (severity, cases) => {
  let mainColor = '#0284c7';
  let pulseColor = 'rgba(2, 132, 199, 0.4)';
  let size = 26;

  if (severity === 'Critical') {
    mainColor = '#ef4444';
    pulseColor = 'rgba(239, 68, 68, 0.45)';
    size = 32;
  } else if (severity === 'High') {
    mainColor = '#f97316';
    pulseColor = 'rgba(249, 115, 22, 0.45)';
    size = 28;
  } else if (severity === 'Moderate') {
    mainColor = '#f59e0b';
    pulseColor = 'rgba(245, 158, 11, 0.4)';
    size = 24;
  } else if (severity === 'Contained') {
    mainColor = '#10b981';
    pulseColor = 'rgba(16, 185, 129, 0.4)';
    size = 22;
  }

  const isSevere = severity === 'Critical' || severity === 'High';

  return L.divIcon({
    className: 'custom-outbreak-marker-wrapper',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${
          isSevere
            ? `<div class="map-radar-pulse" style="background: ${pulseColor};"></div>
               <div class="map-radar-pulse-delayed" style="background: ${pulseColor};"></div>`
            : ''
        }
        <div style="
          position: relative;
          z-index: 2;
          background: ${mainColor};
          width: ${size - 4}px;
          height: ${size - 4}px;
          border-radius: 50%;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 14px ${mainColor}, 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 10px;
        ">
          ${cases > 50 ? cases : ''}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const createHospitalIcon = (tier) => {
  const isApex = tier?.includes('Tier-1') || tier?.includes('Apex');
  const bg = isApex ? '#003366' : '#0284c7';
  const border = isApex ? '#38bdf8' : '#ffffff';

  return L.divIcon({
    className: 'custom-hospital-marker-wrapper',
    html: `
      <div style="
        position: relative;
        background: ${bg};
        border: 2px solid ${border};
        width: 32px;
        height: 32px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transform: rotate(45deg);
      ">
        <div style="transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v12M6 12h12"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Map Controller for Smooth Flying Transitions
function MapController({ targetCenter, targetZoom }) {
  const map = useMap();

  useEffect(() => {
    if (targetCenter && targetZoom) {
      map.flyTo(targetCenter, targetZoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [targetCenter, targetZoom, map]);

  return null;
}

export default function InteractiveHealthMap({
  outbreaks = [],
  hospitals = [],
  selectedCategory = 'All',
  onSelectCategory,
  onOpenAlertModal,
  onSelectHospital,
  className = ''
}) {
  // Detect dark mode from root element or default to tactical dark
  const [basemapKey, setBasemapKey] = useState(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    return 'streets';
  });

  const [activeCenter, setActiveCenter] = useState([21.8, 79.5]);
  const [activeZoom, setActiveZoom] = useState(4.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Layer Visibility Toggles
  const [layers, setLayers] = useState({
    outbreaks: true,
    heatZones: true,
    hospitals: true,
    corridors: true
  });

  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Auto-sync when HTML dark class toggles
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      // Only auto-switch if user hasn't selected satellite or topo
      setBasemapKey((prev) => {
        if (prev === 'satellite' || prev === 'topo') return prev;
        return isDark ? 'dark' : 'streets';
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const currentProvider = BASEMAP_PROVIDERS[basemapKey] || BASEMAP_PROVIDERS.dark;

  // Filter Outbreaks based on category & search query
  const filteredOutbreaks = useMemo(() => {
    return outbreaks.filter((o) => {
      const matchesCategory =
        selectedCategory === 'All' || o.disease_category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        o.disease_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.cluster_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.state?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [outbreaks, selectedCategory, searchQuery]);

  // Aggregate quick metrics
  const activeCasesTotal = filteredOutbreaks.reduce((s, o) => s + (o.active_cases || 0), 0);
  const totalWorkforce = filteredOutbreaks.reduce(
    (s, o) => s + (o.migrant_workforce_exposure || 0),
    0
  );

  const handleRegionClick = (region) => {
    setActiveCenter(region.center);
    setActiveZoom(region.zoom);
  };

  const toggleLayer = (layerName) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : className
      }`}
      style={{ minHeight: isFullscreen ? 'auto' : '520px' }}
    >
      {/* Top Map HUD Bar */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
        
        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="font-extrabold text-sm tracking-wide text-white">
              EPIDEMIOLOGICAL SURVEILLANCE GRID
            </span>
          </div>

          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
            {filteredOutbreaks.length} Active Hotspots
          </span>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            {activeCasesTotal} Confirmed Cases
          </span>
          <span className="hidden lg:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            {hospitals.length} Network Facilities
          </span>
        </div>

        {/* Quick Search & Controls */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search cluster, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-36 sm:w-44 text-xs rounded-lg bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Layer Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              title="Toggle Map Layers"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Layers</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl p-3 z-30 space-y-2 text-xs">
                <div className="font-bold text-slate-300 pb-1 border-b border-slate-800">
                  Data Overlays
                </div>
                <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Outbreak Hotspots
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.outbreaks}
                    onChange={() => toggleLayer('outbreaks')}
                    className="rounded bg-slate-800 text-sky-500 focus:ring-0"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Caseload Heat Halos
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.heatZones}
                    onChange={() => toggleLayer('heatZones')}
                    className="rounded bg-slate-800 text-sky-500 focus:ring-0"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Hospital className="w-3.5 h-3.5 text-blue-400" />
                    Federated Hospitals
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.hospitals}
                    onChange={() => toggleLayer('hospitals')}
                    className="rounded bg-slate-800 text-sky-500 focus:ring-0"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    Migration Corridors
                  </span>
                  <input
                    type="checkbox"
                    checked={layers.corridors}
                    onChange={() => toggleLayer('corridors')}
                    className="rounded bg-slate-800 text-sky-500 focus:ring-0"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Sub-Navigation: Basemaps & Region Bookmarks */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 text-xs">
        
        {/* Basemap Switcher Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-sky-400" /> Map Style:
          </span>
          {Object.values(BASEMAP_PROVIDERS).map((p) => (
            <button
              key={p.id}
              onClick={() => setBasemapKey(p.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                basemapKey === p.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Regional Camera Nav Bookmarks */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-400" /> Focus:
          </span>
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRegionClick(r)}
              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition"
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actual Leaflet Map Canvas */}
      <div className="relative flex-1 w-full" style={{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : '480px' }}>
        <MapContainer
          center={activeCenter}
          zoom={activeZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: isFullscreen ? 'calc(100vh - 120px)' : '480px' }}
        >
          <MapController targetCenter={activeCenter} targetZoom={activeZoom} />

          {/* Primary Base Tile Layer */}
          <TileLayer
            key={currentProvider.url}
            url={currentProvider.url}
            attribution={currentProvider.attribution}
            maxZoom={currentProvider.maxZoom}
            subdomains={currentProvider.subdomains}
          />

          {/* Satellite Boundaries / Place Names Overlay */}
          {currentProvider.overlayUrl && (
            <TileLayer
              key={currentProvider.overlayUrl}
              url={currentProvider.overlayUrl}
              maxZoom={currentProvider.maxZoom}
            />
          )}

          {/* Layer 1: Interstate Migration Flow Corridors */}
          {layers.corridors &&
            MIGRATION_CORRIDORS.map((c) => {
              const polyPoints = generateCurvedPolyline(c.startCoord, c.endCoord, c.midPoint);
              return (
                <React.Fragment key={c.id}>
                  {/* Background shadow line */}
                  <Polyline
                    positions={polyPoints}
                    pathOptions={{
                      color: '#000000',
                      weight: 5,
                      opacity: 0.35
                    }}
                  />
                  {/* Glowing Animated Flow line */}
                  <Polyline
                    positions={polyPoints}
                    className="flow-polyline-animated"
                    pathOptions={{
                      color: c.color,
                      weight: 3,
                      opacity: 0.9,
                      dashArray: '8, 8'
                    }}
                  >
                    <Tooltip sticky>
                      <div className="text-xs font-sans">
                        <div className="font-black text-sky-400">{c.name}</div>
                        <div className="text-slate-300 text-[11px] mt-0.5">
                          {c.origin} ➔ {c.destination}
                        </div>
                        <div className="mt-1 text-slate-200">
                          <span className="font-bold">Workforce Volume:</span> {c.estimatedWorkers}
                        </div>
                        <div className="text-slate-400 text-[10px]">Sector: {c.sector}</div>
                      </div>
                    </Tooltip>
                  </Polyline>
                </React.Fragment>
              );
            })}

          {/* Layer 2: Outbreak Hotspots & Caseload Halos */}
          {layers.outbreaks &&
            filteredOutbreaks.map((outbreak) => {
              const lat = parseFloat(outbreak.lat);
              const lng = parseFloat(outbreak.lng);
              if (isNaN(lat) || isNaN(lng)) return null;

              const isCritical = outbreak.severity_level === 'Critical';
              const isHigh = outbreak.severity_level === 'High';
              const circleColor = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#f59e0b';

              return (
                <React.Fragment key={`outbreak-${outbreak.id}`}>
                  {/* Dynamic Heat / Radius Circle */}
                  {layers.heatZones && (
                    <Circle
                      center={[lat, lng]}
                      radius={outbreak.active_cases * 1100}
                      pathOptions={{
                        color: circleColor,
                        fillColor: circleColor,
                        fillOpacity: isCritical ? 0.28 : 0.18,
                        weight: isCritical ? 2 : 1.2
                      }}
                    />
                  )}

                  {/* Marker Pin with Pulsing Radar Beacon */}
                  <Marker
                    position={[lat, lng]}
                    icon={createOutbreakIcon(outbreak.severity_level, outbreak.active_cases)}
                  >
                    <Popup maxWidth={320}>
                      <div className="p-3 font-sans text-slate-900 dark:text-slate-100">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                          <span className="font-black text-sm text-[#003366] dark:text-sky-400">
                            {outbreak.disease_name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              outbreak.severity_level === 'Critical'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800'
                                : outbreak.severity_level === 'High'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {outbreak.severity_level}
                          </span>
                        </div>

                        {/* Location Details */}
                        <div className="space-y-0.5 text-xs mb-2.5">
                          <div className="font-bold text-slate-800 dark:text-white">
                            📍 {outbreak.cluster_name}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">
                            {outbreak.district}, {outbreak.state}
                          </div>
                        </div>

                        {/* Quantitative Caseload Stats */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 mb-2.5">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Active Cases
                            </span>
                            <span className="font-black text-rose-600 dark:text-rose-400 text-base">
                              {outbreak.active_cases}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Workforce at Risk
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              {outbreak.migrant_workforce_exposure?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Recommended Intervention */}
                        <div className="text-[11px] bg-amber-50 dark:bg-purple-950/50 p-2 rounded-lg border border-amber-200 dark:border-purple-800 text-amber-900 dark:text-purple-200 mb-2">
                          <strong className="block text-amber-950 dark:text-purple-300 mb-0.5">
                            Containment Action:
                          </strong>
                          {outbreak.recommended_intervention}
                        </div>

                        {/* Direct Modal Alert Trigger */}
                        {onOpenAlertModal && (
                          <button
                            onClick={() => onOpenAlertModal(outbreak)}
                            className="w-full mt-1 py-1.5 px-3 rounded-md bg-[#003366] hover:bg-[#002244] dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                            <span>Issue Containment Directive</span>
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}

          {/* Layer 3: Federated Hospital Network */}
          {layers.hospitals &&
            hospitals.map((h) => {
              const lat = parseFloat(h.lat);
              const lng = parseFloat(h.lng);
              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker key={`hosp-${h.id}`} position={[lat, lng]} icon={createHospitalIcon(h.tier)}>
                  <Popup maxWidth={300}>
                    <div className="p-3 font-sans text-slate-900 dark:text-slate-100">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                        <div>
                          <div className="font-black text-sm text-[#003366] dark:text-sky-400">
                            {h.name}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Code: {h.code}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-sky-950 dark:text-sky-300 border border-blue-200 dark:border-sky-800">
                          {h.tier?.includes('Tier-1') ? 'Tier 1' : 'Tier 2'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 mb-2">
                        <div className="text-slate-700 dark:text-slate-300">
                          📍 {h.address}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-medium">
                          {h.district}, {h.state}
                        </div>
                        {h.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold pt-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{h.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] mb-2">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Clinical Doctors:</span>
                          <span className="font-bold text-slate-800 dark:text-white">
                            {h.doctorCount || 1} Registered
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Encounters Handled:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {h.encounterCount || 1} Consultations
                          </span>
                        </div>
                      </div>

                      {onSelectHospital && (
                        <button
                          onClick={() => onSelectHospital(h)}
                          className="w-full py-1.5 px-3 rounded-md bg-[#003366] hover:bg-[#002244] dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Select & Manage Hospital Node</span>
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {/* Floating Map Legend (Bottom Right HUD) */}
        <div className="absolute bottom-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-[11px] text-slate-200 max-w-xs space-y-2 pointer-events-auto">
          <div className="font-black text-white text-xs flex items-center justify-between pb-1 border-b border-slate-800">
            <span>GRID LEGEND</span>
            <span className="text-[10px] text-sky-400 font-mono">LIVE SYNC</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm inline-block animate-pulse"></span>
              <span>Critical Outbreak</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-sm inline-block"></span>
              <span>High Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm inline-block"></span>
              <span>Moderate Hazard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm inline-block"></span>
              <span>Contained</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#003366] border border-sky-400 flex items-center justify-center text-[9px] text-white font-bold">
                +
              </span>
              <span>Network Hospital</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-sky-400 inline-block"></span>
              <span>Worker Corridor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
