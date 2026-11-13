import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Clock, X, Bookmark, RotateCcw,
  Lightbulb, Trash2, CheckCircle,
} from 'lucide-react';
import { cottonYieldApi } from '../../lib/cottonYieldApi';
import { supabase } from '../../lib/supabase';
import Card from '../../components/Card';

const LOCATIONS  = ['Multan', 'Faisalabad', 'Khanpur', 'Rajanpur'];
const VARIETIES  = ['CIM-663', 'CKC-6', 'NIAB-878', 'MNH-1020', 'BS-15'];
const IRRIGATION = [
  { code: 'B1', label: 'Full water',    pct: 100 },
  { code: 'B2', label: 'Mild deficit',  pct: 75  },
  { code: 'B3', label: 'Mod. deficit',  pct: 50  },
  { code: 'B4', label: 'Sev. deficit',  pct: 25  },
];
const NITROGEN = [
  { code: 'N1', kg: 190 },
  { code: 'N2', kg: 240 },
  { code: 'N3', kg: 290 },
];
const SOILS = ['Loamy', 'Loam with Silt', 'Sodic-Saline'];

function getGrade(y) {
  if (y >= 850) return { label: 'Excellent', color: '#0F6E56', bg: '#E1F5EE' };
  if (y >= 650) return { label: 'Good',      color: '#3B6D11', bg: '#EAF3DE' };
  if (y >= 450) return { label: 'Moderate',  color: '#854F0B', bg: '#FAEEDA' };
  return              { label: 'Low',         color: '#A32D2D', bg: '#FCEBEB' };
}

function gradeColor(g) {
  return { Excellent: '#0F6E56', Good: '#3B6D11', Moderate: '#854F0B', Low: '#A32D2D' }[g] ?? '#888780';
}

function StepCard({ n, title, selected, children }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          animate={selected ? { background: 'linear-gradient(135deg,#3B6D11,#639922)', color: '#fff' } : {}}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            selected ? '' : 'bg-primaryLight text-primary'
          }`}
        >
          {n}
        </motion.div>
        <span className="text-sm font-bold text-ink flex-1 tracking-tight">{title}</span>
        <AnimatePresence>
          {selected && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-primaryLight text-primary text-xs font-bold px-2.5 py-1 rounded-full"
            >
              {selected}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {children}
    </Card>
  );
}

function GridBtn({ selected, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={selected ? { scale: 1.02 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className={`flex flex-col items-center justify-center border rounded-xl p-3 text-center transition-colors ${
        selected
          ? 'border-primary bg-primaryLight shadow-warm'
          : 'border-line bg-white hover:border-primary/40'
      }`}
    >
      {children}
    </motion.button>
  );
}

function Pill({ selected, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className={`px-3.5 py-2 rounded-full border text-sm font-semibold transition-all ${
        selected
          ? 'bg-primary border-primary text-white shadow-warm'
          : 'border-line bg-white text-ink hover:border-primary/40'
      }`}
    >
      {children}
    </motion.button>
  );
}

const stepFade = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.06, ease: 'easeOut' } },
});

export default function PredictPage() {
  const [loc,  setLoc]  = useState(null);
  const [vari, setVari] = useState(null);
  const [irr,  setIrr]  = useState(null);
  const [nit,  setNit]  = useState(null);
  const [soil, setSoil] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);

  const [showHistory,  setShowHistory]  = useState(false);
  const [history,      setHistory]      = useState([]);
  const [histLoading,  setHistLoading]  = useState(false);

  const allSelected = loc && vari && irr && nit && soil;

  const predict = async () => {
    setLoading(true); setError(null); setResult(null); setSaved(false);
    try {
      const res = await cottonYieldApi.post('/predict', {
        location:         loc,
        genotype:         vari,
        water_supply_pct: irr.pct,
        n_rate_kg_ha:     nit.kg,
        soil_type:        soil,
      });
      setResult(res.data);
    } catch (e) {
      if (e.response?.data?.detail) setError(JSON.stringify(e.response.data.detail));
      else if (e.code === 'ERR_NETWORK') setError(`Network error: cannot reach the server at ${cottonYieldApi.defaults.baseURL}`);
      else setError(e.message || 'Could not reach the server.');
    }
    setLoading(false);
  };

  const save = async () => {
    if (!result || saved) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); setError('Please log in to save.'); return; }
    const y     = result.predicted_fiber_yield_kg_ha;
    const grade = getGrade(y).label;
    const { error: err } = await supabase.from('predictions').insert({
      user_id:          user.id,
      location:         loc,
      genotype:         vari,
      water_supply_pct: irr.pct,
      n_rate_kg_ha:     nit.kg,
      soil_type:        soil,
      predicted_yield:  y,
      grade,
      summary:          result.summary,
      reasons:          result.top_reasons,
      advice:           result.advice,
    });
    setSaving(false);
    if (!err) setSaved(true);
    else setError('Could not save: ' + err.message);
  };

  const reset = () => {
    setLoc(null); setVari(null); setIrr(null); setNit(null); setSoil(null);
    setResult(null); setError(null); setSaved(false);
  };

  const openHistory = async () => {
    setShowHistory(true); setHistLoading(true);
    const { data, error: err } = await supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!err && data) setHistory(data);
    setHistLoading(false);
  };

  const deleteHistory = async (id) => {
    if (!window.confirm('Delete this prediction?')) return;
    const { error: err } = await supabase.from('predictions').delete().eq('id', id);
    if (!err) setHistory(prev => prev.filter(x => x.id !== id));
  };

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <motion.div {...stepFade(0)} className="flex items-end justify-between">
          <div>
            <p className="text-[11px] text-muted font-semibold uppercase tracking-widest">Enter field parameters</p>
            <h2 className="text-2xl font-extrabold text-ink mt-0.5 tracking-tight">Yield prediction</h2>
          </div>
          <button
            onClick={openHistory}
            className="flex items-center gap-2 bg-primaryLight border border-primary/30 text-primary text-xs font-bold px-3.5 py-2 rounded-full hover:bg-green-100 hover:border-primary transition-all"
          >
            <Clock size={13} /> History
          </button>
        </motion.div>

        {/* Step 1 – Location */}
        <motion.div {...stepFade(1)}>
          <StepCard n={1} title="Location" selected={loc}>
            <div className="grid grid-cols-2 gap-2">
              {LOCATIONS.map(o => (
                <GridBtn key={o} selected={loc === o} onClick={() => setLoc(o)}>
                  <span className={`text-sm font-semibold ${loc === o ? 'text-primary' : 'text-ink'}`}>{o}</span>
                </GridBtn>
              ))}
            </div>
          </StepCard>
        </motion.div>

        {/* Step 2 – Variety */}
        <motion.div {...stepFade(2)}>
          <StepCard n={2} title="Variety" selected={vari}>
            <div className="flex flex-wrap gap-2">
              {VARIETIES.map(o => (
                <Pill key={o} selected={vari === o} onClick={() => setVari(o)}>{o}</Pill>
              ))}
            </div>
          </StepCard>
        </motion.div>

        {/* Step 3 – Irrigation */}
        <motion.div {...stepFade(3)}>
          <StepCard n={3} title="Irrigation level" selected={irr?.code}>
            <div className="grid grid-cols-2 gap-2">
              {IRRIGATION.map(o => (
                <GridBtn key={o.code} selected={irr?.code === o.code} onClick={() => setIrr(o)}>
                  <span className={`text-base font-bold ${irr?.code === o.code ? 'text-primary' : 'text-ink'}`}>{o.code}</span>
                  <span className={`text-xs font-semibold mt-0.5 ${irr?.code === o.code ? 'text-primary' : 'text-muted'}`}>{o.label}</span>
                  <span className="text-[11px] text-muted mt-0.5">{o.pct}%</span>
                </GridBtn>
              ))}
            </div>
          </StepCard>
        </motion.div>

        {/* Step 4 – Nitrogen */}
        <motion.div {...stepFade(4)}>
          <StepCard n={4} title="Nitrogen dose" selected={nit?.code}>
            <div className="grid grid-cols-3 gap-2">
              {NITROGEN.map(o => (
                <GridBtn key={o.code} selected={nit?.code === o.code} onClick={() => setNit(o)}>
                  <span className={`text-base font-bold ${nit?.code === o.code ? 'text-primary' : 'text-ink'}`}>{o.code}</span>
                  <span className="text-[11px] text-muted mt-0.5">{o.kg} kg/ha</span>
                </GridBtn>
              ))}
            </div>
          </StepCard>
        </motion.div>

        {/* Step 5 – Soil */}
        <motion.div {...stepFade(5)}>
          <StepCard n={5} title="Soil type" selected={soil}>
            <div className="flex flex-wrap gap-2">
              {SOILS.map(o => (
                <Pill key={o} selected={soil === o} onClick={() => setSoil(o)}>{o}</Pill>
              ))}
            </div>
          </StepCard>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Predict button */}
        <motion.button
          onClick={predict}
          disabled={!allSelected || loading}
          whileHover={allSelected && !loading ? { scale: 1.02 } : {}}
          whileTap={allSelected && !loading ? { scale: 0.98 } : {}}
          className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold transition-all shadow-warm ${
            allSelected && !loading
              ? 'gradient-primary text-white hover:shadow-warm-lg'
              : 'bg-line text-muted cursor-not-allowed shadow-none'
          }`}
        >
          {loading ? (
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {loading ? 'Predicting…' : allSelected ? 'Predict yield' : 'Select all 5 parameters'}
        </motion.button>

        {/* Result card */}
        <AnimatePresence>
          {result && (() => {
            const y     = result.predicted_fiber_yield_kg_ha;
            const grade = getGrade(y);
            const fill  = Math.min(100, Math.max(0, (y / 1200) * 100));
            return (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <Card accent className="p-5 space-y-4" style={{ borderColor: grade.color }}>
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] text-muted font-semibold uppercase tracking-widest">Predicted fiber yield</p>
                      <p className="text-5xl font-extrabold text-ink mt-1 tabular-nums tracking-tight">{y}</p>
                      <p className="text-xs text-muted mt-1">kg / hectare</p>
                    </div>
                    <motion.span
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ color: grade.color, background: grade.bg }}
                    >
                      {grade.label}
                    </motion.span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-primaryLight rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fill}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      className="h-2 rounded-full"
                      style={{ background: grade.color }}
                    />
                  </div>

                  <p className="text-sm text-ink leading-relaxed">{result.summary}</p>

                  {/* Selection pills */}
                  <div>
                    <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-2">Your selections</p>
                    <div className="flex flex-wrap gap-2">
                      {[loc, vari, irr.code, nit.code, soil].map((s, i) => (
                        <span key={i} className="bg-primaryLight text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reasons */}
                  {result.top_reasons?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-2">Why this result?</p>
                      <div className="space-y-2">
                        {result.top_reasons.map((r, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                            className="bg-surface rounded-xl p-3"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-bold text-ink flex-1 mr-2">{r.feature}</span>
                              <span
                                className="text-sm font-bold flex-shrink-0"
                                style={{ color: r.effect === 'increased' ? '#0F6E56' : '#A32D2D' }}
                              >
                                {r.effect === 'increased' ? '+' : '−'}{r.amount_kg_ha}
                              </span>
                            </div>
                            {r.text && <p className="text-xs text-muted mt-1 leading-relaxed">{r.text}</p>}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advice */}
                  {result.advice?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-muted font-bold uppercase tracking-widest mb-2">Advice</p>
                      <div className="space-y-2">
                        {result.advice.map((a, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                            className="bg-warningBg rounded-xl p-3 flex gap-2.5"
                          >
                            <Lightbulb size={14} className="text-warning flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-warning leading-relaxed">{a}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save button */}
                  <motion.button
                    onClick={save}
                    disabled={saved || saving}
                    whileHover={!saved && !saving ? { scale: 1.02 } : {}}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold border transition-all ${
                      saved
                        ? 'gradient-primary border-transparent text-white'
                        : 'bg-primaryLight border-primary text-primary hover:bg-green-100'
                    }`}
                  >
                    {saved
                      ? <><CheckCircle size={15} /> Saved to history</>
                      : saving
                        ? <><span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving…</>
                        : <><Bookmark size={15} /> Save to history</>
                    }
                  </motion.button>

                  {/* Reset button */}
                  <button
                    onClick={reset}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-muted bg-surface hover:bg-line transition-colors"
                  >
                    <RotateCcw size={14} /> Reset & predict again
                  </button>
                </Card>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        <div className="h-8" />
      </div>

      {/* History modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            key="history-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-warm-lg"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Your predictions</p>
                  <h3 className="text-lg font-extrabold text-ink mt-0.5 tracking-tight">History</h3>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted hover:text-ink transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {histLoading && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-muted font-medium">Loading history…</p>
                  </div>
                )}

                {!histLoading && history.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primaryLight flex items-center justify-center mb-3">
                      <Bookmark size={24} className="text-primary" />
                    </div>
                    <p className="text-sm font-bold text-ink">No predictions yet</p>
                    <p className="text-xs text-muted mt-1">Save a prediction to see it here</p>
                  </div>
                )}

                {!histLoading && history.map((item, idx) => {
                  const date = new Date(item.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  });
                  const gc = gradeColor(item.grade);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.25 }}
                      className="border border-line rounded-2xl p-4 bg-white hover:shadow-warm transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-ink">{item.genotype} · {item.location}</p>
                          <p className="text-xs text-muted mt-0.5">{date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-extrabold tabular-nums" style={{ color: '#3B6D11' }}>{item.predicted_yield}</p>
                          <p className="text-[10px] text-muted">kg/ha</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ color: gc, background: gc + '22' }}
                        >
                          {item.grade}
                        </span>
                        <span className="bg-surface text-muted text-xs px-2 py-0.5 rounded-full font-medium">
                          Water {item.water_supply_pct}%
                        </span>
                        <span className="bg-surface text-muted text-xs px-2 py-0.5 rounded-full font-medium">
                          N {item.n_rate_kg_ha}
                        </span>
                        <span className="bg-surface text-muted text-xs px-2 py-0.5 rounded-full font-medium">
                          {item.soil_type}
                        </span>
                      </div>

                      {item.summary && (
                        <p className="text-xs text-muted mt-2.5 leading-relaxed">{item.summary}</p>
                      )}

                      <button
                        onClick={() => deleteHistory(item.id)}
                        className="flex items-center gap-1.5 text-danger text-xs font-bold mt-3 hover:opacity-75 transition-opacity"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
