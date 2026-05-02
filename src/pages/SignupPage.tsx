import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const signupSchema = z.object({
  fullName: z.string().min(3, 'Enter your full name'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } },
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          role: 'user',
        });
        // Ignore duplicate key error if trigger already created the row
        if (profileError && !profileError.message.includes('duplicate')) throw profileError;
      }

      toast.success('Account created! Please check your email to confirm.');
      navigate('/login');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-20 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500 text-sm font-medium">Join our sourcing network.</p>
        </div>

        <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-soft">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                <input
                  {...register('fullName')}
                  autoComplete="name"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="text-[10px] font-bold text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-[10px] font-bold text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10 mt-4"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Register Account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-[#FF5A00] font-bold hover:underline underline-offset-4">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
