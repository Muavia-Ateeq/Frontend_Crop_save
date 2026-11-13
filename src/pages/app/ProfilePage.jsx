import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Droplets, FlaskConical, GitBranch, Leaf, Settings,
  Download, HelpCircle, Info, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';

const RESEARCH = [
  ['Dataset',      '480 records'],
  ['Varieties',    '5 genotypes'],
  ['Locations',    '4 cities'],
  ['Years',        '2022 – 2023'],
  ['Target',       'Fiber yield (kg/ha)'],
  ['Best variety', 'CKC-6 (668 kg/ha avg)'],
];

const MODEL = [
  ['Best model',      'EXGEP Ensemble'],
  ['Test R²',         '0.685'],
  ['Test RMSE',       '111.4 kg/ha'],
  ['Pearson r (PCC)', '0.916'],
  ['Generalization',  '−0.023 gap (best)'],
  ['Base models',     'RF · XGBoost · LightGBM · GBDT'],
  ['Meta-model',      'LARS regression'],
  ['Explainability',  'SHAP (TreeExplainer)'],
];

const DRIVERS = [
  { icon: Droplets,     label: 'Water supply',   val: '174 kg/ha' },
  { icon: FlaskConical, label: 'Nitrogen rate',   val: 'management' },
  { icon: GitBranch,    label: 'SNP D05 marker',  val: 'genetic' },
  { icon: Leaf,         label: 'Genotype CKC-6',  val: 'variety' },
];

const MENU = [
  { icon: Settings,   label: 'Settings' },
  { icon: Download,   label: 'Export results' },
  { icon: HelpCircle, label: 'Help' },
  { icon: Info,       label: 'About the app' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, delay, ease: 'easeOut' } },
});

function KVRow({ k, v, last }) {
  return (
    <div className={`flex justify-between items-start py-2.5 ${!last ? 'border-b border-line' : ''}`}>
      <span className="text-sm text-muted">{k}</span>
      <span className="text-sm text-ink font-semibold text-right ml-4 max-w-[55%]">{v}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { displayName, logout } = useAuth();
  const navigate = useNavigate();

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <motion.div {...fadeUp(0)}>
        <p className="text-[11px] text-muted font-semibold uppercase tracking-widest">Account</p>
        <h2 className="text-2xl font-extrabold text-ink mt-0.5 tracking-tight">Profile</h2>
      </motion.div>

      {/* User card */}
      <motion.div {...fadeUp(0.05)}>
        <Card hover className="p-6 flex flex-col items-center text-center">
          {/* Avatar with gradient ring */}
          <div className="relative mb-3">
            <div className="w-[72px] h-[72px] rounded-full gradient-primary p-[3px] shadow-warm-lg">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-primary text-2xl font-extrabold">{initials}</span>
              </div>
            </div>
          </div>
          <p className="text-lg font-extrabold text-ink tracking-tight">{displayName}</p>
          <p className="text-xs text-muted mt-1">CropSave account</p>
          <div className="mt-3 px-3 py-1 bg-primaryLight rounded-full">
            <span className="text-xs font-bold text-primary">Researcher</span>
          </div>
        </Card>
      </motion.div>

      {/* Research summary */}
      <motion.div {...fadeUp(0.1)}>
        <Card hover className="p-4">
          <h3 className="text-sm font-bold text-ink mb-3 tracking-tight">Cotton yield research summary</h3>
          {RESEARCH.map(([k, v], i) => (
            <KVRow key={k} k={k} v={v} last={i === RESEARCH.length - 1} />
          ))}
        </Card>
      </motion.div>

      {/* Model details */}
      <motion.div {...fadeUp(0.15)}>
        <Card hover className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">ML</span>
            </div>
            <h3 className="text-sm font-bold text-ink tracking-tight">Cotton yield model details</h3>
          </div>
          {MODEL.map(([k, v], i) => (
            <KVRow key={k} k={k} v={v} last={i === MODEL.length - 1} />
          ))}
        </Card>
      </motion.div>

      {/* Top yield drivers */}
      <motion.div {...fadeUp(0.2)}>
        <Card hover className="p-4">
          <h3 className="text-sm font-bold text-ink tracking-tight">Top yield drivers</h3>
          <p className="text-xs text-muted mt-0.5 mb-3">From SHAP analysis</p>
          <div className="divide-y divide-line">
            {DRIVERS.map(({ icon: Icon, label, val }, i) => (
              <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-7 h-7 rounded-lg bg-primaryLight flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-primary" />
                </div>
                <span className="flex-1 text-sm font-semibold text-ink">{label}</span>
                <span className="text-xs font-bold text-primary">{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Settings menu */}
      <motion.div {...fadeUp(0.25)}>
        <Card className="divide-y divide-line">
          {MENU.map(({ icon: Icon, label }) => (
            <motion.button
              key={label}
              whileHover={{ x: 2 }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface transition-colors first:rounded-t-2xl"
            >
              <Icon size={17} className="text-muted flex-shrink-0" />
              <span className="flex-1 text-sm font-semibold text-ink text-left">{label}</span>
              <ChevronRight size={15} className="text-muted" />
            </motion.button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors rounded-b-2xl"
          >
            <LogOut size={17} className="text-danger flex-shrink-0" />
            <span className="flex-1 text-sm font-semibold text-danger text-left">Log out</span>
          </button>
        </Card>
      </motion.div>

      <p className="text-center text-xs text-muted pb-2">CropSave · Cotton yield tools · v1.0.0</p>
      <div className="h-4" />
    </div>
  );
}
