import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  session: Session | null;
  children: React.ReactNode;
}

export function AdminGuard({ session, children }: AdminGuardProps) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setRole(data?.role ?? 'user');
        setLoading(false);
      });
  }, [session]);

  if (!session) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#FF5A00] animate-spin" />
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
          <span className="text-3xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-500 text-sm max-w-xs">
          You don't have admin privileges. Contact the system administrator.
        </p>
        <a
          href="/"
          className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
        >
          Return Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
