import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Button from '../components/Button';

export default function ForgotPage() {
  const [step,     setStep]     = useState(1);
  const [username, setUsername] = useState('');
  const [pass,     setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err,      setErr]      = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const navigate = useNavigate();

  const verifyUsername = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setErr('Please enter your username.'); return; }
    setLoading(true); setErr('');

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .single();

    setLoading(false);
    if (error || !data) { setErr('No account found with that username.'); return; }
    setStep(2);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!pass.trim()) { setErr('Please enter a new password.'); return; }
    if (pass.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true); setErr('');

    const { error } = await supabase.rpc('reset_password_by_username', {
      p_username:     username.trim().toLowerCase(),
      p_new_password: pass,
    });

    setLoading(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-successBg flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-success" />
          </div>
          <h2 className="text-xl font-bold text-ink">Password updated</h2>
          <p className="text-muted text-sm mt-2 mb-6">You can now log in with your new password.</p>
          <Button onClick={() => navigate('/login', { replace: true })} size="lg" className="w-full">
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-up">
        <button
          onClick={() => (step === 2 ? setStep(1) : navigate(-1))}
          className="flex items-center gap-2 text-sm text-muted hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primaryLight flex items-center justify-center mb-5">
            <Leaf size={30} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Reset password</h1>
          <p className="text-muted text-sm mt-1">
            {step === 1 ? 'Enter your username to continue' : 'Choose a new password'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  s <= step ? 'bg-primary text-white' : 'bg-line text-muted'
                }`}
              >
                {s}
              </div>
              {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-primary' : 'bg-line'}`} />}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={verifyUsername} className="space-y-4">
            <Input
              label="Username"
              icon={User}
              type="text"
              placeholder="Your username"
              autoCapitalize="none"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            {err && (
              <p className="text-sm text-danger text-center bg-red-50 rounded-xl py-2.5 px-3">{err}</p>
            )}
            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? 'Checking…' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="bg-primaryLight border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary font-medium">
              Username: <span className="font-bold">{username}</span>
            </div>
            <Input
              label="New password"
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
            {err && (
              <p className="text-sm text-danger text-center bg-red-50 rounded-xl py-2.5 px-3">{err}</p>
            )}
            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted mt-6">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
