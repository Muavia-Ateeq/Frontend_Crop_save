import { useEffect, useState } from 'react';
import { Droplets, CloudRain, Thermometer, MapPin, Calendar } from 'lucide-react';
import RiskGauge from './RiskGauge';

const LEVEL_CONFIG = {
  LOW: {
    label: 'LOW RISK',
    glassClass: 'glass-emerald',
    glowClass: 'glow-emerald',
    badgeColor: '#0F6E56',
    badgeBg: '#E1F5EE',
    badgeBorder: '#9CCFBC',
    emoji: '✅',
  },
  MEDIUM: {
    label: 'MEDIUM RISK',
    glassClass: 'glass-amber',
    glowClass: 'glow-amber',
    badgeColor: '#854F0B',
    badgeBg: '#FAEEDA',
    badgeBorder: '#E4D4B8',
    emoji: '⚠️',
  },
  HIGH: {
    label: 'HIGH RISK',
    glassClass: 'glass-red',
    glowClass: 'glow-red',
    badgeColor: '#A32D2D',
    badgeBg: '#FCEBEB',
    badgeBorder: '#E8C1BE',
    emoji: '🚨',
  },
};

const StatBadge = ({ icon: Icon, value, label, color, delay }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        flex: '1 1 120px',
        padding: '16px',
        borderRadius: '14px',
        background: `${color}0f`,
        border: `1px solid ${color}25`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <Icon size={18} color={color} />
      <div style={{ fontSize: '18px', fontWeight: '800', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#888780', fontWeight: '500' }}>{label}</div>
    </div>
  );
};

const RiskCard = ({ riskData, district }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const level = riskData?.level || 'LOW';
  const cfg = LEVEL_CONFIG[level];

  return (
    <section style={{ padding: '20px 24px 32px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Result heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ color: '#3B6D11', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Prediction Complete
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '800', color: '#1A1A1A', letterSpacing: '-0.5px' }}>
            Drought Risk for <span className="gradient-text">{district?.name}</span>
          </h2>
        </div>

        {/* Main Card */}
        <div
          className={`${cfg.glassClass} ${cfg.glowClass}`}
          style={{
            padding: '40px 32px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.8s cubic-bezier(0.34, 1.2, 0.64, 1) 100ms',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} color="#888780" />
              <span style={{ color: '#1A1A1A', fontSize: '14px' }}>{district?.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} color="#888780" />
              <span style={{ color: '#888780', fontSize: '13px' }}>{riskData?.timestamp}</span>
            </div>
          </div>

          {/* Gauge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <RiskGauge score={riskData?.score || 0} level={level} />
          </div>

          {/* Risk Level Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <div
              style={{
                background: cfg.badgeBg,
                border: `1.5px solid ${cfg.badgeBorder}`,
                borderRadius: '50px',
                padding: '10px 28px',
                display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 1px 3px rgba(26,26,26,0.06)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <span style={{ fontSize: '18px' }}>{cfg.emoji}</span>
              <span style={{ color: cfg.badgeColor, fontSize: '15px', fontWeight: '800', letterSpacing: '2px' }}>
                {cfg.label}
              </span>
              {/* Pulse dot */}
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: cfg.badgeColor,
                boxShadow: `0 0 10px ${cfg.badgeColor}`,
                animation: 'pulse 1.5s ease infinite',
              }} />
            </div>
          </div>

          {/* NASA Data Stats */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatBadge
              icon={Droplets}
              value={`${riskData?.soil_moisture || '--'}%`}
              label="Soil Moisture"
              color="#0F6E56"
              delay={400}
            />
            <StatBadge
              icon={CloudRain}
              value={`${riskData?.rainfall_30d || '--'} mm`}
              label="Rain (30 days)"
              color="#3B6D11"
              delay={550}
            />
            <StatBadge
              icon={Thermometer}
              value={`${riskData?.temp_max || '--'}°C`}
              label="Max Temp"
              color="#854F0B"
              delay={700}
            />
          </div>

          {/* NASA attribution */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#888780' }}>
              📡 Powered by NASA POWER API · SMAP Soil Moisture Data
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskCard;
