import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, UserCircle, AtSign, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Button from '../components/Button';

export default function SignupPage() {
  const [name,     setName]     = useState('');
  const [username, setUsername] = useState('');
  const [pass,     setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err,      setErr]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const navigate = useNavigate();

  const signup = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !pass.trim()) { setErr('Please fill all fields.'); return; }
    if (pass.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true); setErr('');

    const email = `${username.trim().toLowerCase()}@cottonyield.app`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: name, username: username.trim().toLowerCase() } },
    });

    if (error) { setLoading(false); setErr(error.message); return; }

    if (data.user) {
      await supabase.from('profiles').insert({
        id:        data.user.id,
        username:  username.trim().toLowerCase(),
        full_name: name,
      });
    }

    await supabase.auth.signOut();
    setLoading(false);
    navigate('/login', { replace: true, state: { success: 'Account created! Please log in.' } });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 6 }}
            className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-warm"
          >
            <Leaf size={28} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Create account</h1>
          <p className="text-muted text-sm mt-1.5 font-medium">Create your CropSave account</p>
        </div>

        <form onSubmit={signup} className="space-y-4">
          <Input
            label="Full name"
            icon={UserCircle}
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Input
            label="Username"
            icon={AtSign}
            type="text"
            placeholder="Choose a username"
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

          <AnimatePresence>
            {err && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-danger text-center bg-red-50 rounded-xl py-2.5 px-3"
              >
                {err}
              </motion.p>
            )}
          </AnimatePresence>

          <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
            {loading ? 'Creating…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
