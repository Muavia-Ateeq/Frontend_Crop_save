import { useEffect, useState } from 'react';
import {
  Sprout, Droplets, TrendingUp,
  AlertTriangle, CloudOff, AlertOctagon, Phone,
  Lightbulb, RefreshCw
} from 'lucide-react';

const ADVISORIES = {
  LOW: [
    {
      icon: Sprout,
      color: '#0F6E56',
      title: 'Great Time to Plant',
      desc: 'Good conditions for wheat, cotton, or rice. Soil moisture is adequate for healthy germination.',
    },
    {
      icon: Droplets,
      color: '#3B6D11',
      title: 'Normal Irrigation',
      desc: 'Maintain your regular irrigation schedule. No water stress expected in the next 30 days.',
    },
    {
      icon: TrendingUp,
      color: '#639922',
      title: 'Apply Fertilizer',
      desc: 'Favorable conditions for fertilizer application this month. Maximize your yield potential.',
    },
  ],
  MEDIUM: [
    {
      icon: AlertTriangle,
      color: '#854F0B',
      title: 'Moderate Risk Detected',
      desc: 'Consider switching to drought-resistant crop varieties like sorghum, millet, or barley.',
    },
    {
      icon: Droplets,
      color: '#0F6E56',
      title: 'Reduce Irrigation by 20%',
      desc: 'Reduce irrigation frequency. Use drip irrigation if available to conserve water resources.',
    },
    {
      icon: CloudOff,
      color: '#854F0B',
      title: 'Prepare Water Storage',
      desc: 'Rainfall may be below average. Prepare water storage solutions before conditions worsen.',
    },
  ],
  HIGH: [
    {
      icon: AlertOctagon,
      color: '#A32D2D',
      title: 'HIGH RISK — Avoid Water-Intensive Crops',
      desc: 'Do not plant water-intensive crops. Severe drought conditions are predicted for your area.',
    },
    {
      icon: Droplets,
      color: '#A32D2D',
      title: 'Maximum Water Conservation',
      desc: 'Switch to minimal irrigation immediately. Every liter of water must be conserved right now.',
    },
    {
      icon: Phone,
      color: '#854F0B',
      title: 'Contact Agricultural Department',
      desc: 'Contact your local agricultural department for emergency drought relief and government support.',
    },
  ],
};

const AdvisoryCard = ({ icon: Icon, color, title, desc, delay }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="advisory-card glass"
      style={{
        padding: '24px',
        display: 'flex',
        gap: '18px',
        alignItems: 'flex-start',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-30px)',
        transition: `all 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) ${delay}ms`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.boxShadow = `0 8px 30px ${color}15, 0 0 0 1px ${color}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#E5E5E3';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
        background: `${color}18`,
        border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={color} />
      </div>

      {/* Content */}
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A1A', marginBottom: '6px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '13px', color: '#66665F', lineHeight: '1.6', margin: 0 }}>
          {desc}
        </p>
      </div>
    </div>
  );
};

const AdvisoryPanel = ({ level = 'LOW', district, onReset }) => {
  const advisories = ADVISORIES[level];
  const levelColors = { LOW: '#0F6E56', MEDIUM: '#854F0B', HIGH: '#A32D2D' };

  return (
    <section style={{ padding: '0 24px 32px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `${levelColors[level]}18`,
            border: `1px solid ${levelColors[level]}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lightbulb size={20} color={levelColors[level]} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1A1A', margin: 0 }}>
              Farming Advisory
            </h3>
            <p style={{ fontSize: '13px', color: '#888780', margin: 0, marginTop: '2px' }}>
              Based on {level} drought risk · {district?.name}
            </p>
          </div>
        </div>

        {/* Advisory Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {advisories.map((adv, i) => (
            <AdvisoryCard
              key={adv.title}
              {...adv}
              delay={200 + i * 130}
            />
          ))}
        </div>

        {/* Reset Button */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn-outline"
            onClick={onReset}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', padding: '13px 32px' }}
          >
            <RefreshCw size={16} />
            New Prediction
          </button>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#888780', lineHeight: '1.6' }}>
            Advisory is generated based on NASA satellite data and AI predictions.
            Always consult your local agricultural extension officer for final decisions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AdvisoryPanel;
