import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, User, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Button from '../components/Button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: 'easeOut' } },
});

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [pass,     setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err,      setErr]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const success   = location.state?.success;

  const login = async (e) => {
    e.preventDefault();
    if (!username.trim() || !pass.trim()) { setErr('Please enter username and password.'); return; }
    setLoading(true); setErr('');
    const email = `${username.trim().toLowerCase()}@cottonyield.app`;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    navigate('/app/home', { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-[52%] gradient-primary relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative mesh */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-20 -left-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full bg-white/8" />

        {/* Logo */}
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">CottonYield AI</span>
        </motion.div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <motion.div {...fadeUp(0.1)}>
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] tracking-[-0.03em]">
              Predict smarter.<br />
              <span className="text-white/70">Grow better.</span>
            </h1>
          </motion.div>
          <motion.p {...fadeUp(0.2)} className="text-white/70 text-lg leading-relaxed max-w-sm font-medium">
            AI-powered cotton fiber yield prediction from real field data.
            Ensemble model with R² = 0.685 across 480 plots.
          </motion.p>

          {/* Stats row */}
          <motion.div {...fadeUp(0.3)} className="flex gap-6">
            {[['480', 'Field plots'], ['4', 'Locations'], ['0.916', 'Pearson r']].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-2xl font-bold text-white tabular-nums">{val}</p>
                <p className="text-white/60 text-xs font-medium mt-0.5">{lbl}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom tag */}
        <motion.p {...fadeUp(0.4)} className="text-white/40 text-xs relative z-10">
          Final Year Project · Cotton Fiber Yield Prediction
        </motion.p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-warm">
              <Leaf size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">CottonYield AI</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">Welcome back</h2>
            <p className="text-muted text-sm mt-1.5 font-medium">Sign in to your researcher account</p>
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-3 mb-5 text-sm text-teal font-medium"
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={login} className="space-y-4">
            <Input
              label="Username"
              icon={User}
              type="text"
              placeholder="Your username"
              autoCapitalize="none"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />

            <Input
              label="Password"
              icon={Lock}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              right={
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-muted hover:text-ink transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link to="/forgot" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {err && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-danger text-center bg-red-50 rounded-xl py-2.5 px-3"
              >
                {err}
              </motion.p>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              {loading ? 'Signing in…' : 'Log in'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            No account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
