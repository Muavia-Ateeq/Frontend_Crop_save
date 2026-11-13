import { useEffect, useRef, useState } from 'react';

const COLORS = {
  LOW: { primary: '#0f6e56', secondary: '#1d9e75', glow: 'rgba(15,110,86,0.25)' },
  MEDIUM: { primary: '#854f0b', secondary: '#b57922', glow: 'rgba(133,79,11,0.25)' },
  HIGH: { primary: '#a32d2d', secondary: '#c25d55', glow: 'rgba(163,45,45,0.25)' },
};

const RiskGauge = ({ score = 0, level = 'LOW' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const rafRef = useRef(null);
  const colors = COLORS[level];

  const SIZE = 260;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RADIUS = 100;
  const STROKE = 14;
  const START_ANGLE = -180;
  const END_ANGLE = 0;

  const angleToXY = (angleDeg, r) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + r * Math.cos(rad),
      y: CY + r * Math.sin(rad),
    };
  };

  const describeArc = (startAngle, endAngle, r) => {
    const s = angleToXY(startAngle, r);
    const e = angleToXY(endAngle, r);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  // Animate score
  useEffect(() => {
    let start = null;
    const duration = 1800;
    const from = 0;
    const to = score;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(from + (to - from) * easeOut(progress));
      setAnimatedScore(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    const timeoutId = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafRef.current);
    };
  }, [score]);

  // The filled arc angle based on score
  const filledEndAngle = START_ANGLE + (animatedScore / 100) * 180;

  // Needle angle
  const needleAngle = -180 + (animatedScore / 100) * 180;
  const needleLen = RADIUS - 20;
  const needlePoint = angleToXY(needleAngle, needleLen);
  const needleBase1 = angleToXY(needleAngle + 90, 6);
  const needleBase2 = angleToXY(needleAngle - 90, 6);

  return (
    <div className="gauge-container" style={{ userSelect: 'none' }}>
      <svg width={SIZE} height={SIZE / 1.4} viewBox={`0 0 ${SIZE} ${SIZE * 0.75}`} overflow="visible">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f6e56" />
            <stop offset="50%" stopColor="#b57922" />
            <stop offset="100%" stopColor="#a32d2d" />
          </linearGradient>
        </defs>

        {/* Background arc (track) */}
        <path
          d={describeArc(START_ANGLE, END_ANGLE, RADIUS)}
          fill="none"
          stroke="rgba(26,26,26,0.1)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* Gradient zone arcs (decorative) */}
        <path
          d={describeArc(-180, -126, RADIUS - 2)}
          fill="none"
          stroke="rgba(15,110,86,0.12)"
          strokeWidth={STROKE - 4}
          strokeLinecap="round"
        />
        <path
          d={describeArc(-126, -63, RADIUS - 2)}
          fill="none"
          stroke="rgba(133,79,11,0.12)"
          strokeWidth={STROKE - 4}
          strokeLinecap="round"
        />
        <path
          d={describeArc(-63, 0, RADIUS - 2)}
          fill="none"
          stroke="rgba(163,45,45,0.12)"
          strokeWidth={STROKE - 4}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {animatedScore > 0 && (
          <path
            d={describeArc(START_ANGLE, Math.min(filledEndAngle, END_ANGLE), RADIUS)}
            fill="none"
            stroke={colors.primary}
            strokeWidth={STROKE}
            strokeLinecap="round"
            filter="url(#glow)"
            style={{ transition: 'none' }}
          />
        )}

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = -180 + (tick / 100) * 180;
          const inner = angleToXY(tickAngle, RADIUS - STROKE / 2 - 10);
          const outer = angleToXY(tickAngle, RADIUS + STROKE / 2 + 6);
          return (
            <line
              key={tick}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="rgba(26,26,26,0.16)"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Tick labels */}
        {[{ v: 0, label: '0' }, { v: 50, label: '50' }, { v: 100, label: '100' }].map(({ v, label }) => {
          const tickAngle = -180 + (v / 100) * 180;
          const pos = angleToXY(tickAngle, RADIUS + 26);
          return (
            <text
              key={v}
              x={pos.x} y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#888780"
              fontSize="10"
              fontFamily="Inter, sans-serif"
            >
              {label}
            </text>
          );
        })}

        {/* Needle */}
        <polygon
          points={`${needlePoint.x},${needlePoint.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill={colors.primary}
          filter="url(#glow)"
        />
        {/* Needle center dot */}
        <circle cx={CX} cy={CY} r={10} fill={colors.primary} filter="url(#glow)" />
        <circle cx={CX} cy={CY} r={5} fill="#FFFFFF" />

        {/* Score number */}
        <text
          x={CX} y={CY - 28}
          textAnchor="middle"
          dominantBaseline="central"
          fill={colors.primary}
          fontSize="38"
          fontWeight="900"
          fontFamily="Inter, sans-serif"
          filter="url(#glow)"
        >
          {animatedScore}
        </text>

        {/* /100 */}
        <text
          x={CX + 28} y={CY - 12}
          textAnchor="middle"
          fill="#888780"
          fontSize="12"
          fontFamily="Inter, sans-serif"
        >
          /100
        </text>

        {/* Zone labels */}
        <text x={CX - 80} y={CY + 14} textAnchor="middle" fill="#0F6E56" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="600">LOW</text>
        <text x={CX} y={CY + 6} textAnchor="middle" fill="#854F0B" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="600">MED</text>
        <text x={CX + 80} y={CY + 14} textAnchor="middle" fill="#A32D2D" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="600">HIGH</text>
      </svg>
    </div>
  );
};

export default RiskGauge;
