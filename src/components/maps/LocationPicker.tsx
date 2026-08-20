'use client';

// ===========================================
// FoundIt — Location Picker Map Component
// ===========================================
// This must be dynamically imported with ssr: false
// as Leaflet uses the window object.
// ===========================================

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { appConfig } from '@/lib/config';

// Fix for default Leaflet icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/icons/marker-icon-2x.png',
  iconUrl: '/icons/marker-icon.png',
  shadowUrl: '/icons/marker-shadow.png',
});

// We need to provide the actual images in public/icons or use external URLs
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  initialPosition?: [number, number];
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
  readOnly?: boolean;
}

function MapEvents({ onLocationSelect, setPosition, readOnly }: { onLocationSelect?: (lat: number, lng: number) => void, setPosition: (pos: [number, number]) => void, readOnly?: boolean }) {
  useMapEvents({
    click(e) {
      if (readOnly) return;
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      if (onLocationSelect) onLocationSelect(lat, lng);
    },
  });
  return null;
}

export default function LocationPicker({ 
  initialPosition, 
  onLocationSelect, 
  className = "h-[300px] w-full rounded-xl border border-[var(--border-primary)] z-0",
  readOnly = false
}: LocationPickerProps) {
  const defaultPos = initialPosition || appConfig.maps.defaultCenter;
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null);
  const mapRef = useRef<L.Map>(null);

  // When initialPosition changes (e.g. from geocoding search), update marker and view
  useEffect(() => {
    if (initialPosition && mapRef.current) {
      setPosition(initialPosition);
      mapRef.current.setView(initialPosition, 15);
    }
  }, [initialPosition]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <MapContainer
        center={defaultPos}
        zoom={initialPosition ? 15 : appConfig.maps.defaultZoom}
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          attribution={appConfig.maps.tileAttribution}
          url={appConfig.maps.tileUrl}
        />
        {position && (
          <Marker position={position} icon={defaultIcon} />
        )}
        {!readOnly && <MapEvents onLocationSelect={onLocationSelect} setPosition={setPosition} readOnly={readOnly} />}
      </MapContainer>
    </div>
  );
}
