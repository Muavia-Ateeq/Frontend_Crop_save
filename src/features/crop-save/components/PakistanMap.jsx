import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Zap } from 'lucide-react';

const PAKISTAN_DISTRICTS = [
  { name: "Lahore", lat: 31.5204, lon: 74.3587 },
  { name: "Karachi", lat: 24.8607, lon: 67.0011 },
  { name: "Islamabad", lat: 33.6844, lon: 73.0479 },
  { name: "Faisalabad", lat: 31.4504, lon: 73.1350 },
  { name: "Rawalpindi", lat: 33.5651, lon: 73.0169 },
  { name: "Multan", lat: 30.1575, lon: 71.5249 },
  { name: "Peshawar", lat: 34.0151, lon: 71.5249 },
  { name: "Quetta", lat: 30.1798, lon: 66.9750 },
  { name: "Sialkot", lat: 32.4945, lon: 74.5229 },
  { name: "Gujranwala", lat: 32.1877, lon: 74.1945 },
  { name: "Hyderabad", lat: 25.3960, lon: 68.3578 },
  { name: "Sukkur", lat: 27.7052, lon: 68.8574 },
  { name: "Larkana", lat: 27.5570, lon: 68.2140 },
  { name: "Bahawalpur", lat: 29.3956, lon: 71.6836 },
  { name: "Sargodha", lat: 32.0836, lon: 72.6711 },
  { name: "Mardan", lat: 34.2010, lon: 72.0449 },
  { name: "Abbottabad", lat: 34.1463, lon: 73.2117 },
  { name: "Dera Ghazi Khan", lat: 30.0588, lon: 70.6399 },
  { name: "Muzaffarabad", lat: 34.3700, lon: 73.4710 },
  { name: "Gilgit", lat: 35.9221, lon: 74.3085 },
];

const RISK_STYLES = {
  LOW: {
    label: 'LOW',
    fill: '#0f6e56',
    border: '#1d9e75',
    background: 'rgba(15,110,86,0.12)',
    shadow: '0 0 8px rgba(15,110,86,0.3)',
  },
  MEDIUM: {
    label: 'MEDIUM',
    fill: '#854f0b',
    border: '#d49b3f',
    background: 'rgba(250,238,218,0.8)',
    shadow: '0 0 8px rgba(133,79,11,0.2)',
  },
  HIGH: {
    label: 'HIGH',
    fill: '#a32d2d',
    border: '#d58c86',
    background: 'rgba(252,235,235,0.9)',
    shadow: '0 0 8px rgba(163,45,45,0.2)',
  },
  DEFAULT: {
    label: '',
    fill: '#3b6d11',
    border: '#639922',
    background: 'rgba(234,243,222,0.9)',
    shadow: '0 0 8px rgba(59,109,17,0.2)',
  },
};

function normalizeRisk(riskData) {
  if (!riskData) return '';

  const rawRisk = typeof riskData === 'string'
    ? riskData
    : riskData.risk
      ?? riskData.risk_level
      ?? riskData.riskLevel
      ?? riskData.level
      ?? riskData.drought_risk
      ?? riskData.prediction?.risk
      ?? riskData.prediction?.risk_level
      ?? riskData.prediction
      ?? '';

  const normalized = String(rawRisk).trim().toUpperCase();

  if (normalized.includes('LOW')) return 'LOW';
  if (normalized.includes('MEDIUM') || normalized.includes('MODERATE')) return 'MEDIUM';
  if (normalized.includes('HIGH')) return 'HIGH';

  return '';
}

const PakistanMap = ({
  onSelectDistrict,
  selectedDistrict,
  onPredict,
  riskData,
  isLoading = false,
}) => {
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const selectedRisk = normalizeRisk(riskData);
  const selectedRiskStyle = RISK_STYLES[selectedRisk] || RISK_STYLES.DEFAULT;

  const isSelected = (district) =>
    selectedDistrict && selectedDistrict.name === district.name;

  return (
    <section style={{ padding: '24px 0', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ color: '#3B6D11', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Drought forecast
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '800', letterSpacing: '-0.5px', color: '#1A1A1A', marginBottom: '8px' }}>
            Select Your <span className="gradient-text">District</span>
          </h2>
          <p style={{ color: '#888780', fontSize: '14px' }}>
            Click any district marker on the map to get your drought forecast
          </p>
        </div>

        {/* Map Container */}
        <div
          className="glass"
          style={{
            padding: '4px',
            overflow: 'hidden',
            border: '1px solid #E5E5E3',
            borderRadius: '16px',
            boxShadow: selectedDistrict
              ? `0 4px 16px ${selectedRiskStyle.background}`
              : '0 1px 3px rgba(59,109,17,0.08), 0 4px 12px rgba(59,109,17,0.06)',
            transition: 'box-shadow 0.5s ease',
          }}
        >
          <MapContainer
            center={[30.3753, 69.3451]}
            zoom={5}
            style={{ height: '480px', width: '100%', borderRadius: '16px' }}
            zoomControl={true}
            attributionControl
          >
            {/* Free tile layers — no API key needed */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={19}
            />

            {PAKISTAN_DISTRICTS.map((district) => {
              const districtIsSelected = isSelected(district);
              const markerStyle = districtIsSelected ? selectedRiskStyle : RISK_STYLES.DEFAULT;

              return (
                <CircleMarker
                  key={`${district.name}-${districtIsSelected ? (selectedRisk || 'selected') : 'normal'}`}
                  center={[district.lat, district.lon]}
                  radius={districtIsSelected ? (selectedRisk ? 12 : 10) : hoveredDistrict === district.name ? 9 : 7}
                  pathOptions={{
                    fillColor: markerStyle.fill,
                    fillOpacity: districtIsSelected ? 1 : 0.85,
                    color: districtIsSelected ? markerStyle.border : 'rgba(59,109,17,0.6)',
                    weight: districtIsSelected ? 3 : 1.5,
                  }}
                  eventHandlers={{
                    click: () => onSelectDistrict(district),
                    mouseover: () => setHoveredDistrict(district.name),
                    mouseout: () => setHoveredDistrict(null),
                  }}
                >
                  <Tooltip permanent={false} direction="top" offset={[0, -8]}>
                    <div style={{
                      background: '#FFFFFF',
                      border: `1px solid ${markerStyle.border}`,
                      borderRadius: '8px',
                      padding: '4px 10px',
                      color: markerStyle.fill,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: '600',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 2px 8px rgba(26,26,26,0.12)',
                    }}>
                      📍 {district.name}{districtIsSelected && selectedRiskStyle.label ? ` · ${selectedRiskStyle.label} RISK` : ''}
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Selection Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
          {/* Selected badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={16} color={selectedDistrict ? selectedRiskStyle.fill : '#888780'} />
            {selectedDistrict ? (
              <div style={{
                background: selectedRiskStyle.background,
                border: `1px solid ${selectedRiskStyle.border}`,
                borderRadius: '50px', padding: '6px 18px', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: selectedRiskStyle.fill, boxShadow: selectedRiskStyle.shadow,
                  animation: 'pulse 1.5s ease infinite',
                }} />
                <span style={{ color: selectedRiskStyle.border, fontWeight: '600', fontSize: '14px' }}>
                  {selectedDistrict.name}
                </span>
                {selectedRiskStyle.label && (
                  <span style={{ color: selectedRiskStyle.fill, fontWeight: '700', fontSize: '12px' }}>
                    {selectedRiskStyle.label} RISK
                  </span>
                )}
                <span style={{ color: '#888780', fontSize: '12px' }}>
                  {selectedDistrict.lat.toFixed(2)}°N, {selectedDistrict.lon.toFixed(2)}°E
                </span>
              </div>
            ) : (
              <span style={{ color: '#888780', fontSize: '14px' }}>
                No district selected
              </span>
            )}
          </div>

          {/* Predict button */}
          <button
            className="btn-emerald"
            onClick={() => selectedDistrict && onPredict(selectedDistrict)}
            disabled={!selectedDistrict || isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '15px', padding: '13px 28px',
              opacity: selectedDistrict ? 1 : 0.4,
              cursor: selectedDistrict ? 'pointer' : 'not-allowed',
            }}
          >
            <Zap size={16} />
            Predict Drought Risk
          </button>
        </div>

        {/* Risk legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '18px', color: '#66665F', fontSize: '12px' }}>
          <span style={{ color: '#888780', marginRight: '2px' }}>Risk:</span>
          {['LOW', 'MEDIUM', 'HIGH'].map((risk) => (
            <span key={risk} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: RISK_STYLES[risk].fill, boxShadow: RISK_STYLES[risk].shadow }} />
              {risk}
            </span>
          ))}
        </div>

        {/* District Quick Select Dropdown */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Navigation size={14} color="#3B6D11" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <select
              onChange={(e) => {
                const d = PAKISTAN_DISTRICTS.find(d => d.name === e.target.value);
                if (d) onSelectDistrict(d);
              }}
              value={selectedDistrict?.name || ''}
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid #E5E5E3',
                borderRadius: '12px',
                padding: '11px 14px 11px 38px',
                color: selectedDistrict ? '#1A1A1A' : '#888780',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none',
              }}
            >
              <option value="" disabled>Or search by name...</option>
              {PAKISTAN_DISTRICTS.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PakistanMap;
