import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Loader2, Shield } from 'lucide-react';

const ADMIN_USERNAME = 'superadmin';
const ADMIN_PASSWORD = 'admin';
export const ADMIN_SESSION_KEY = 'nairabulk_admin_session';

export function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // slight delay for UX

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      navigate('/admin/overview', { replace: true });
    } else {
      setError('Invalid credentials. Access denied.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF5A00]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-[#FF5A00]/10 border border-[#FF5A00]/20 rounded-[20px] mb-5">
            <Shield className="h-7 w-7 text-[#FF5A00]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Access</h1>
          <p className="text-slate-500 text-sm font-medium mt-2">Nairabulk Control Panel</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="superadmin"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/30 focus:border-[#FF5A00]/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-600" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/30 focus:border-[#FF5A00]/50 transition-all"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-[#FF5A00] text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#E65100] disabled:opacity-40 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#FF5A00]/20 mt-2"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
                : <>Enter Panel <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-6">
          Restricted Access · Nairabulk Admin
        </p>
      </div>
    </div>
  );
}
