
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SavedLocation } from '../types';

// Fix for default marker icons in Leaflet with React/ESM
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  locations: SavedLocation[];
}

// Helper to center map
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

const MapView: React.FC<Props> = ({ locations }) => {
  // Default to first location or Turkey Center
  const centerLat = locations.length > 0 ? locations[0].lat : 39.0;
  const centerLng = locations.length > 0 ? locations[0].lng : 35.0;

  return (
    <div className="h-[450px] w-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl relative bg-slate-100">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={6} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <div className="p-2 min-w-[140px]">
                <h4 className="font-extrabold text-slate-800 text-sm mb-1">{loc.name}</h4>
                <p className="text-[10px] text-slate-500 mb-2 leading-tight">{loc.description}</p>
                <div className="font-mono text-[10px] text-blue-600 bg-blue-50 p-2 rounded-lg text-center font-bold">
                  {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {locations.length > 0 && <RecenterMap lat={locations[0].lat} lng={locations[0].lng} />}
      </MapContainer>
      
      {locations.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-none p-8 text-center">
          <i className="fas fa-map-pin text-slate-300 text-4xl mb-4"></i>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs leading-loose">Haritada görüntülenecek kayıtlı nokta bulunamadı</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
