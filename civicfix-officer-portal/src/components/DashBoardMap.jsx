import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import SeverityBadge from './SeverityBadge';
import StatusBadge from './StatusBadge';

// Custom SVG pins color-coded by severity
const createSeverityPin = (severity) => {
  const norm = (severity || 'LOW').toUpperCase();
  const colors = {
    HIGH: { fill: '#ef4444', border: '#b91c1c' },
    MEDIUM: { fill: '#f59e0b', border: '#d97706' },
    LOW: { fill: '#10b981', border: '#059669' },
  };
  const { fill, border } = colors[norm] || colors.LOW;

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: ${fill};
        border: 2px solid ${border};
        border-radius: 50%;
        box-shadow: 0 0 10px ${fill}66;
        cursor: pointer;
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

// Auto-adjust view bounds to fit all active markers
function BoundsAdjuster({ markers }) {
  const map = useMap();

  React.useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [markers, map]);

  return null;
}

export default function DashboardMap({ complaints = [] }) {
  const navigate = useNavigate();

  // Extract complaints with valid geospatial coordinates
  const markers = useMemo(() => {
    return complaints
      .map((item) => {
        const lat =
          item.latitude ??
          item.lat ??
          (item.location?.coordinates ? item.location.coordinates[1] : null);
        const lng =
          item.longitude ??
          item.lng ??
          (item.location?.coordinates ? item.location.coordinates[0] : null);

        if (lat === null || lng === null || isNaN(Number(lat)) || isNaN(Number(lng))) {
          return null;
        }

        return {
          id: item._id || item.id,
          lat: Number(lat),
          lng: Number(lng),
          title: item.title || item.category || 'Infrastructure Defect',
          address: item.address || 'Location unrecorded',
          severity: item.severity,
          status: item.status,
          hasAr: Boolean(item.measured_via_ar || item.measuredViaAr),
        };
      })
      .filter(Boolean);
  }, [complaints]);

  // Default coordinate center (fallback to city center if no markers)
  const defaultCenter = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [21.1458, 79.0882];

  return (
    <div className="bg-[#111] border border-neutral-800/90 rounded-2xl overflow-hidden mb-8">
      <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">
            Geospatial Triage Map
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Real-time geospatial distribution of citizen reports
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" /> Med
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" /> Low
          </span>
        </div>
      </div>

      <div className="h-96 w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full bg-[#0d0d0d]"
        >
          {/* CartoDB Dark Matter tile layer for clean dark theme */}
          <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  className="dark-tiles"
/>

          {markers.length > 0 && <BoundsAdjuster markers={markers} />}

          {markers.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={createSeverityPin(pin.severity)}
            >
              <Popup className="civicfix-popup">
                <div className="p-1 space-y-2 text-neutral-200">
                  <div className="flex items-center gap-1.5">
                    <SeverityBadge severity={pin.severity} />
                    <StatusBadge status={pin.status} />
                  </div>
                  <h4 className="font-semibold text-xs text-white leading-tight">{pin.title}</h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">{pin.address}</p>
                  <button
                    onClick={() => navigate(`/complaints/${pin.id}`)}
                    className="w-full bg-white text-black py-1 px-2 rounded-lg text-[11px] font-semibold hover:bg-neutral-200 transition"
                  >
                    View Report →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}