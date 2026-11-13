import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Droplets, GitBranch, Trophy, Leaf } from 'lucide-react';
import Card from '../../components/Card';

const VARIETIES = [
  { name: 'CKC-6',    avg: 668, b1: 928, b2: 790, b3: 595, b4: 359, note: 'Best fiber yielder' },
  { name: 'NIAB-878', avg: 593, b1: 825, b2: 700, b3: 530, b4: 320, note: 'Strong performer' },
  { name: 'CIM-663',  avg: 582, b1: 810, b2: 685, b3: 520, b4: 313, note: 'Top seed yielder' },
  { name: 'MNH-1020', avg: 546, b1: 760, b2: 645, b3: 488, b4: 294, note: 'Moderate yield' },
  { name: 'BS-15',    avg: 520, b1: 725, b2: 615, b3: 465, b4: 280, note: 'Lower fiber yield' },
];

const ranked = [...VARIETIES].sort((a, b) => b.avg - a.avg);
const maxAvg  = ranked[0].avg;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay, ease: 'easeOut' } },
});

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl px-3 py-2 shadow-warm-lg">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="text-sm font-bold text-ink tabular-nums">{payload[0].value} kg/ha</p>
    </div>
  );
};

export default function VarietiesPage() {
  const [selected, setSelected] = useState('CKC-6');
  const v       = VARIETIES.find(x => x.name === selected);
  const dropPct = Math.round(((v.b1 - v.b4) / v.b1) * 100);

  const irrData = [
    { code: 'B1', label: '100%', val: v.b1 },
    { code: 'B2', label: '75%',  val: v.b2 },
    { code: 'B3', label: '50%',  val: v.b3 },
    { code: 'B4', label: '25%',  val: v.b4 },
  ];

  const irrCards = [
    { code: 'B1', label: 'Full water (100%)', val: v.b1, accent: true },
    { code: 'B2', label: '75% water',          val: v.b2 },
    { code: 'B3', label: '50% water',          val: v.b3 },
    { code: 'B4', label: '25% water',          val: v.b4 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <motion.div {...fadeUp(0)}>
        <p className="text-[11px] text-muted font-semibold uppercase tracking-widest">Compare varieties</p>
        <h2 className="text-2xl font-extrabold text-ink mt-0.5 tracking-tight">Varieties</h2>
      </motion.div>

      {/* Variety pills */}
      <motion.div {...fadeUp(0.05)} className="flex gap-2 flex-wrap">
        {VARIETIES.map(x => (
          <motion.button
            key={x.name}
            onClick={() => setSelected(x.name)}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
              selected === x.name
                ? 'gradient-primary border-transparent text-white shadow-warm'
                : 'bg-white border-line text-ink hover:border-primary/40'
            }`}
          >
            {x.name}
          </motion.button>
        ))}
      </motion.div>

      {/* Hero card */}
      <motion.div {...fadeUp(0.1)}>
        <Card accent className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={v.name + '-name'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-extrabold text-primary tracking-tight"
                >
                  {v.name}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-muted mt-0.5">{v.note}</p>
            </div>
            <div className="text-right">
              <AnimatePresence mode="wait">
                <motion.p
                  key={v.avg}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="text-3xl font-extrabold text-ink tabular-nums tracking-tight"
                >
                  {v.avg}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-muted">kg/ha · mean</p>
            </div>
          </div>

          {/* Irrigation bar chart */}
          <p className="text-[11px] text-muted font-bold uppercase tracking-widest mt-5 mb-3">
            Yield by irrigation level
          </p>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={irrData} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E5E3" strokeDasharray="3 3" />
                <XAxis
                  dataKey="code"
                  tick={{ fontSize: 11, fill: '#888780', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#888780', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 1000]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EAF3DE', radius: 6 }} />
                <Bar dataKey="val" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={700}>
                  {irrData.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? '#3B6D11' : '#639922'} opacity={i === 0 ? 1 : 0.7 - i * 0.1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* B1/B2/B3/B4 grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {irrCards.map(g => (
              <motion.div
                key={g.code}
                whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(59,109,17,0.12)' }}
                className={`border rounded-xl p-3 transition-all ${
                  g.accent
                    ? 'bg-primaryLight border-primary/40'
                    : 'bg-white border-line'
                }`}
              >
                <p className="text-sm font-bold text-ink">{g.code}</p>
                <p className="text-[11px] text-muted mt-0.5">{g.label}</p>
                <p className="text-2xl font-extrabold text-ink mt-2 tabular-nums">{g.val}</p>
                <p className="text-[10px] text-muted">kg/ha</p>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2.5 bg-primaryLight rounded-xl p-3 mt-4">
            <Droplets size={14} className="text-primary flex-shrink-0" />
            <p className="text-xs text-primary font-semibold leading-relaxed">
              Water stress can drop {v.name} yield by {dropPct}% (B1 → B4).
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Ranking */}
      <motion.div {...fadeUp(0.15)}>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-ink tracking-tight">Ranking by average yield</h3>
          <p className="text-xs text-muted mt-0.5 mb-4">Across all 5 cotton varieties</p>
          <div className="space-y-3">
            {ranked.map((x, i) => (
              <motion.div
                key={x.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'gradient-primary text-white' : 'bg-line text-muted'
                  }`}
                >
                  {i === 0 ? <Trophy size={11} /> : i + 1}
                </div>
                <span
                  className={`w-20 text-sm flex-shrink-0 ${
                    x.name === selected ? 'text-primary font-bold' : 'text-ink font-medium'
                  }`}
                >
                  {x.name}
                </span>
                <div className="flex-1 h-2.5 bg-primaryLight rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(x.avg / maxAvg) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                    className="h-2.5 rounded-full"
                    style={{ background: x.name === selected ? '#3B6D11' : '#639922' }}
                  />
                </div>
                <span className="w-10 text-xs font-bold text-ink text-right flex-shrink-0 tabular-nums">{x.avg}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Facts card */}
      <motion.div {...fadeUp(0.2)}>
        <Card className="p-5 divide-y divide-line">
          <div className="pb-3">
            <h3 className="text-sm font-bold text-ink tracking-tight">How the model uses varieties</h3>
            <p className="text-xs text-muted mt-0.5">From SHAP analysis of the trained ensemble</p>
          </div>
          {[
            {
              icon: GitBranch,
              text: <>Variety + SNP markers contribute about <strong>28%</strong> of the predictive power.</>,
            },
            {
              icon: Trophy,
              text: <><strong>CKC-6</strong> is the top fiber yielder due to high lint percentage, even when seed yield is lower.</>,
            },
            {
              icon: Leaf,
              text: <>All 5 varieties were grown across 4 locations × 2 seasons × 4 irrigation × 3 nitrogen treatments.</>,
            },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex gap-3 py-3 last:pb-0">
              <div className="w-7 h-7 rounded-lg bg-primaryLight flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={13} className="text-primary" />
              </div>
              <p className="text-xs text-ink leading-relaxed">{text}</p>
            </div>
          ))}
        </Card>
      </motion.div>

      <div className="h-4" />
    </div>
  );
}
