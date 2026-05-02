import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Github, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-20 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Access your sourcing dashboard and global marketplace orders.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-soft">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-4.5 w-4.5 text-slate-300" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-primary/20 transition-all"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-4.5 w-4.5 text-slate-300" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5A00] text-white py-4.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#E65100] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#FF5A00]/20 mt-4"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log In Account'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-500 font-medium">
              New to Nairabulk? <Link to="/signup" className="text-[#FF5A00] font-bold hover:underline underline-offset-4 decoration-2">Create an account</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Protected by Enterprise Grade Compliance
          </p>
        </div>
      </div>
    </div>
  );
}
