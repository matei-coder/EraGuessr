import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix the default marker icon paths when bundling with Vite.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// A red teardrop pin (inline SVG) for the correct answer.
const redPinSvg = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 24 36">' +
    '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#e23b3b" stroke="#fff" stroke-width="1.5"/>' +
    '<circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>'
);
const redIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${redPinSvg}`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -36],
});

function ClickHandler({ onPick, disabled }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Once the answer is revealed, zoom/pan so both the guess and the truth fit.
function FitToResult({ guess, actual }) {
  const map = useMap();
  useEffect(() => {
    if (!actual) return;
    if (guess) {
      map.fitBounds(
        [
          [guess.lat, guess.lng],
          [actual.lat, actual.lng],
        ],
        { padding: [60, 60], maxZoom: 6 }
      );
    } else {
      map.setView([actual.lat, actual.lng], 4);
    }
  }, [map, guess, actual]);
  return null;
}

/**
 * GuessMap
 * A Leaflet world map. Clicking drops a guess marker.
 *
 * Props:
 *   - guess: { lat, lng } | null  -> the user's current guess
 *   - onPick: ({ lat, lng }) => void
 *   - disabled: boolean -> lock the map after a round is submitted
 *   - actual: { lat, lng, title } | null -> the true location, revealed after submit
 */
export default function GuessMap({ guess, onPick, disabled = false, actual = null }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      worldCopyJump
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} disabled={disabled} />
      {guess && <Marker position={[guess.lat, guess.lng]} />}

      {/* Revealed answer: red pin, dashed line to the guess, auto-fit view */}
      {actual && (
        <>
          <Marker position={[actual.lat, actual.lng]} icon={redIcon}>
            <Popup>📍 {actual.title}</Popup>
          </Marker>
          {guess && (
            <Polyline
              positions={[
                [guess.lat, guess.lng],
                [actual.lat, actual.lng],
              ]}
              pathOptions={{ color: '#e23b3b', weight: 2, dashArray: '8 8' }}
            />
          )}
          <FitToResult guess={guess} actual={actual} />
        </>
      )}
    </MapContainer>
  );
}
