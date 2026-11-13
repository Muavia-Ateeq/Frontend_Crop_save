import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CloudRain, MapPinned, Satellite, Sprout } from 'lucide-react';
import AdvisoryPanel from './components/AdvisoryPanel';
import LoadingSpinner from './components/LoadingSpinner';
import PakistanMap from './components/PakistanMap';
import RiskCard from './components/RiskCard';
import { cropSaveApi } from './cropSaveApi';
import './CropSave.css';

const Charts = lazy(() => import('./components/Charts'));

const formatDate = (date) => new Date(date).toLocaleDateString('en', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (typeof error?.message === 'string') return error.message;
  return 'An unexpected error occurred.';
}

export default function CropSaveFeature() {
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const mapSectionRef = useRef(null);
  const resultSectionRef = useRef(null);

  useEffect(() => {
    if (riskData) {
      resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [riskData]);

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setRiskData(null);
    setErrorMessage('');
  };

  const handlePredict = async (district = selectedDistrict) => {
    if (!district) {
      setErrorMessage('Select a district to request a forecast.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const { data } = await cropSaveApi.post('/predict', {
        lat: district.lat,
        lon: district.lon,
        district_name: district.name,
      });

      const score = Number(data?.risk_score);
      const level = String(data?.risk_level || '').toUpperCase();
      if (!Number.isFinite(score) || score < 0 || score > 100 || !['LOW', 'MEDIUM', 'HIGH'].includes(level)) {
        throw new Error('The CropSave API returned an invalid forecast. Check the API response and try again.');
      }

      setRiskData({
        score,
        level,
        soil_moisture: data.soil_moisture,
        rainfall_30d: data.rainfall_last_30_days,
        temp_max: data.temperature_max,
        humidity: data.humidity,
        district: data.district_name || district.name,
        timestamp: data.prediction_date ? formatDate(data.prediction_date) : formatDate(Date.now()),
      });
    } catch (error) {
      setRiskData(null);
      setErrorMessage(`Could not load the CropSave forecast: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRiskData(null);
    setSelectedDistrict(null);
    setErrorMessage('');
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="crop-save-feature">
      {loading && <LoadingSpinner />}

      <header className="crop-save-header">
        <div className="crop-save-mark" aria-hidden="true">
          <Sprout size={24} />
        </div>
        <div>
          <p className="crop-save-eyebrow">Climate risk and farm guidance</p>
          <h1>CropSave</h1>
          <p className="crop-save-intro">
            Explore district drought risk, rainfall trends, and practical farm guidance. Cotton yield tools are also available in your dashboard.
          </p>
        </div>
      </header>

      <div className="crop-save-highlights" aria-label="CropSave forecast details">
        <div className="crop-save-highlight">
          <CloudRain size={19} aria-hidden="true" />
          <div><strong>30-day outlook</strong><span>District-level drought risk</span></div>
        </div>
        <div className="crop-save-highlight">
          <Satellite size={19} aria-hidden="true" />
          <div><strong>NASA climate data</strong><span>Rainfall, soil moisture, and temperature</span></div>
        </div>
        <div className="crop-save-highlight">
          <MapPinned size={19} aria-hidden="true" />
          <div><strong>Pakistan districts</strong><span>Select on the map or search by name</span></div>
        </div>
      </div>

      {errorMessage && (
        <div className="crop-save-error" role="alert">
          <strong>Forecast unavailable</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      <div ref={mapSectionRef} id="crop-save-map">
        <PakistanMap
          selectedDistrict={selectedDistrict}
          onSelectDistrict={handleSelectDistrict}
          onPredict={handlePredict}
          riskData={riskData}
          isLoading={loading}
        />
      </div>

      {riskData && (
        <div ref={resultSectionRef} className="crop-save-results" id="crop-save-results">
          <RiskCard riskData={riskData} district={selectedDistrict} />
          <Suspense fallback={<p className="crop-save-chart-loading" role="status">Loading rainfall history…</p>}>
            <Charts district={selectedDistrict} />
          </Suspense>
          <AdvisoryPanel
            level={riskData.level}
            district={selectedDistrict}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}
