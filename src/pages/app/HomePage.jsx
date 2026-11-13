import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Leaf, MapPin, GitBranch, Droplets, BarChart2, CheckCircle, Sparkles, CloudUpload, ChevronRight, CloudSun } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';

const LOC_DATA = [
  { name: 'Faisalabad', value: 612 },
  { name: 'Multan',     value: 583 },
  { name: 'Rajanpur',   value: 573 },
  { name: 'Khanpur',    value: 558 },
];

const STATS = [
  { icon: MapPin,    value: '4',     label: 'Locations',   accent: false },
  { icon: GitBranch, value: '5',     label: 'Varieties',   accent: true  },
  { icon: Droplets,  value: '480',   label: 'Field plots', accent: false },
  { icon: BarChart2, value: '0.685', label: 'R² accuracy', accent: true  },
];

const ACTIVITY = [
  { icon: CheckCircle, color: '#0F6E56', title: 'Model training complete',   sub: 'Ensemble R² = 0.685, PCC = 0.916' },
  { icon: Sparkles,    color: '#854F0B', title: 'SHAP analysis done',         sub: 'Top: Water supply (174 kg/ha)' },
  { icon: CloudUpload, color: '#3B6D11', title: 'Dataset prepared',           sub: '480 plots · 4 cities · 2 years' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay, ease: 'easeOut' } },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const childFade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl px-3 py-2 shadow-warm-lg">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="text-sm font-bold text-ink tabular-nums">{payload[0].value} kg/ha</p>
    </div>
  );
};

export default function HomePage() {
  const { displayName } = useAuth();
  const [bestPred, setBestPred] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('predictions')
        .select('predicted_yield, genotype, location, water_supply_pct, n_rate_kg_ha')
        .order('predicted_yield', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setBestPred(data[0]);
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted font-semibold uppercase tracking-widest">Welcome back</p>
          <h2 className="text-2xl font-extrabold text-ink mt-0.5 tracking-tight">{displayName}</h2>
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 6 }}
          className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-warm"
        >
          <Leaf size={18} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Hero card */}
      <motion.div
        {...fadeUp(0.05)}
        className="rounded-2xl gradient-primary p-6 flex items-center gap-4 overflow-hidden relative shadow-warm-lg"
      >
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute right-16 -bottom-10 w-28 h-28 rounded-full bg-white/5" />

        <div className="flex-1 min-w-0 relative z-10">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
            {bestPred ? 'Your best predicted fiber yield' : 'Top variety avg fiber yield'}
          </p>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-5xl font-extrabold text-white tabular-nums tracking-tight">
              {bestPred ? Math.round(bestPred.predicted_yield) : 668}
            </span>
            <span className="text-white/60 text-sm mb-1.5 font-medium">kg/ha</span>
          </div>
          <div className="inline-flex mt-3 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-white text-xs font-semibold">
              {bestPred
                ? `${bestPred.genotype} · ${bestPred.location} · ${bestPred.water_supply_pct}% · ${bestPred.n_rate_kg_ha}N`
                : 'CKC-6 · highest avg yield variety'}
            </span>
          </div>
        </div>
        <Leaf size={96} className="text-white/8 flex-shrink-0 absolute right-3 bottom-0" />
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3"
      >
        {STATS.map(({ icon: Icon, value, label, accent }) => (
          <motion.div key={label} variants={childFade}>
            <Card
              hover
              className={`p-4 ${accent ? 'bg-primaryLight border-primaryLight' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon size={16} className="text-primary" />
                </div>
                <span className="text-2xl font-extrabold text-ink tabular-nums">{value}</span>
              </div>
              <p className="text-xs text-muted mt-3 font-semibold">{label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Bar chart card */}
      <motion.div {...fadeUp(0.2)}>
        <Card className="p-5">
          <h3 className="text-sm font-bold text-ink tracking-tight">Yield by location</h3>
          <p className="text-xs text-muted mt-0.5 mb-5">Average fiber yield, kg/ha</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LOC_DATA} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E5E3" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#888780', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#888780', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[500, 640]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EAF3DE', radius: 8 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={800}>
                  {LOC_DATA.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? '#3B6D11' : '#639922'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Recent activity */}
      <motion.div {...fadeUp(0.25)}>
        <Card className="divide-y divide-line">
          <div className="p-4 pb-3">
            <h3 className="text-sm font-bold text-ink tracking-tight">Recent activity</h3>
          </div>
          <motion.div variants={stagger} initial="initial" animate="animate">
            {ACTIVITY.map(({ icon: Icon, color, title, sub }, i) => (
              <motion.div key={i} variants={childFade} className="flex items-start gap-3 px-4 py-3.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: color + '18' }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Card>
      </motion.div>

      {/* Predict shortcut */}
      <motion.div {...fadeUp(0.3)}>
        <Link
          to="/app/predict"
          className="group flex items-center gap-3 bg-primaryLight border border-primary/30 rounded-2xl px-4 py-3.5 hover:bg-green-100 hover:border-primary hover:shadow-warm transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-warm group-hover:scale-105 transition-transform">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="flex-1 text-sm font-bold text-primary">Go to yield prediction</span>
          <ChevronRight size={16} className="text-primary group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </motion.div>

      <motion.div {...fadeUp(0.35)}>
        <Link
          to="/app/crop-save"
          className="group flex items-center gap-3 bg-white border border-line rounded-2xl px-4 py-3.5 hover:border-primary/40 hover:shadow-warm transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center flex-shrink-0 shadow-warm group-hover:scale-105 transition-transform">
            <CloudSun size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-ink">Explore CropSave</span>
            <span className="block text-xs text-muted mt-0.5">District drought forecasts and farm guidance</span>
          </div>
          <ChevronRight size={16} className="text-primary group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </motion.div>

      <div className="h-4" />
    </div>
  );
}
