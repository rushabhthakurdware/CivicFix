import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

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
        width: 16px;
        height: 16px;
        background: ${fill};
        border: 2px solid ${border};
        border-radius: 50%;
        box-shadow: 0 0 8px ${fill}99;
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

export default function DetailMiniMap({ lat, lng, severity }) {
  if (lat === null || lng === null || isNaN(Number(lat)) || isNaN(Number(lng))) {
    return null;
  }

  const position = [Number(lat), Number(lng)];

  return (
    <div className="h-44 w-full rounded-xl overflow-hidden border border-neutral-800 relative mt-3 z-0">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        zoomControl={true}
        className="h-full w-full bg-[#0d0d0d]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-tiles"
        />
        <Marker position={position} icon={createSeverityPin(severity)} />
      </MapContainer>
    </div>
  );
}