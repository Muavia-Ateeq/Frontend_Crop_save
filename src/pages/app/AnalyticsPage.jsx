import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { Info, Trophy } from 'lucide-react';
import Card from '../../components/Card';

const SHAP = [
  { name: 'Water supply', value: 0.38 },
  { name: 'GDD total',    value: 0.31 },
  { name: 'Boll weight',  value: 0.28 },
  { name: 'Heat stress',  value: 0.24 },
  { name: 'N rate',       value: 0.22 },
  { name: 'NDVI Aug',     value: 0.19 },
];

const GROUPS = [
  { name: 'Management',  pct: 46, color: '#3B6D11' },
  { name: 'Genetic',     pct: 28, color: '#0F6E56' },
  { name: 'Climate',     pct: 17, color: '#639922' },
  { name: 'Soil & NDVI', pct:  9, color: '#888780' },
];

const MODELS = [
  { name: 'EXGEP Ensemble',    r2: 0.685, best: true  },
  { name: 'Gradient Boosting', r2: 0.714, best: false },
  { name: 'Random Forest',     r2: 0.698, best: false },
  { name: 'XGBoost',           r2: 0.698, best: false },
  { name: 'LightGBM',          r2: 0.688, best: false },
  { name: 'Linear Regression', r2: 0.303, best: false },
];

const maxShap = Math.max(...SHAP.map(f => f.value));

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay, ease: 'easeOut' } },
});

const CustomShapTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl px-3 py-2 shadow-warm-lg">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="text-sm font-bold text-ink">|SHAP| = {payload[0].value.toFixed(2)}</p>
    </div>
  );
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, pct }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (pct < 10) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {pct}%
    </text>
  );
};

export default function AnalyticsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <motion.div {...fadeUp(0)}>
        <p className="text-[11px] text-muted font-semibold uppercase tracking-widest">Overall model performance</p>
        <h2 className="text-2xl font-extrabold text-ink mt-0.5 tracking-tight">Analytics</h2>
      </motion.div>

      {/* SHAP feature importance — horizontal bar chart */}
      <motion.div {...fadeUp(0.05)}>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-ink tracking-tight">What affects yield most?</h3>
          <p className="text-xs text-muted mt-0.5 mb-5">Mean |SHAP| value from the ensemble model</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={SHAP}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                barCategoryGap="28%"
              >
                <CartesianGrid horizontal={false} stroke="#E5E5E3" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, 0.42]}
                  tick={{ fontSize: 10, fill: '#888780', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#1A1A1A', fontFamily: 'Inter', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<CustomShapTooltip />} cursor={{ fill: '#EAF3DE' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900}>
                  {SHAP.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? '#3B6D11' : i === 1 ? '#4d8e18' : '#639922'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Feature group contribution — PieChart */}
      <motion.div {...fadeUp(0.1)}>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-ink tracking-tight">Feature group contribution</h3>
          <p className="text-xs text-muted mt-0.5 mb-4">Where the predictive power comes from</p>
          <div className="flex gap-4 items-center">
            <div style={{ width: 160, height: 160, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={GROUPS}
                    dataKey="pct"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={74}
                    labelLine={false}
                    label={CustomPieLabel}
                    isAnimationActive
                    animationDuration={900}
                  >
                    {GROUPS.map((g, i) => (
                      <Cell key={i} fill={g.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5">
              {GROUPS.map(g => (
                <div key={g.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: g.color }} />
                  <span className="text-xs text-ink font-semibold flex-1">{g.name}</span>
                  <span className="text-xs font-bold text-ink tabular-nums">{g.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Model leaderboard */}
      <motion.div {...fadeUp(0.15)}>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-ink tracking-tight">Model leaderboard</h3>
          <p className="text-xs text-muted mt-0.5 mb-2">R² on unseen 2023 test data</p>
          <div className="divide-y divide-line">
            {MODELS.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                className={`flex items-center py-3 gap-3 ${m.best ? 'bg-primaryLight/40 -mx-3 px-3 rounded-xl' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? 'gradient-primary text-white' : 'bg-line text-muted'
                }`}>
                  {i === 0 ? <Trophy size={12} /> : i + 1}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <span className={`text-sm ${m.best ? 'text-primary font-bold' : 'text-ink font-medium'}`}>
                    {m.name}
                  </span>
                  {m.best && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.3 }}
                      className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      Best
                    </motion.span>
                  )}
                </div>
                <span className={`text-sm font-bold tabular-nums ${m.best ? 'text-primary' : 'text-ink'}`}>
                  {m.r2.toFixed(3)}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Info card */}
      <motion.div {...fadeUp(0.2)}>
        <div className="bg-primaryLight border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={15} className="text-primary" />
            <span className="text-sm font-bold text-primary">About these numbers</span>
          </div>
          <p className="text-xs text-primary leading-relaxed">
            These stats come from the trained ensemble model evaluated on 480 real field plots from
            4 locations and 2 seasons. They show overall model accuracy, not your individual prediction.
          </p>
        </div>
      </motion.div>

      <div className="h-4" />
    </div>
  );
}
