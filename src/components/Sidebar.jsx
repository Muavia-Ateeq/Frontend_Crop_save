import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Home, Sparkles, BarChart2, GitBranch, Sprout, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/app/crop-save', icon: Sprout, label: 'CropSave' },
  { to: '/app/home',      icon: Home,      label: 'Cotton Yield' },
  { to: '/app/predict',   icon: Sparkles,  label: 'Yield Prediction' },
  { to: '/app/analytics', icon: BarChart2, label: 'Yield Analytics' },
  { to: '/app/varieties', icon: GitBranch, label: 'Cotton Varieties' },
  { to: '/app/profile',   icon: User,      label: 'Profile' },
];

export default function Sidebar({ onClose }) {
  const { displayName, logout } = useAuth();
  const navigate = useNavigate();

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-line">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-line">
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-warm"
        >
          <Leaf size={18} className="text-white" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink leading-tight tracking-tight">CropSave</p>
          <p className="text-[11px] text-muted">NASA POWER climate insights</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primaryLight text-primary font-semibold'
                  : 'text-muted hover:text-ink hover:bg-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
                  />
                )}
                <Icon size={17} className={isActive ? 'text-primary' : 'text-muted'} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-line pt-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-warm">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{displayName}</p>
            <p className="text-[11px] text-muted">Researcher</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </div>
  );
}
