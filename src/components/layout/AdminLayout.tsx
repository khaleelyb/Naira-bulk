import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Globe, Package, LogOut, HardDrive } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const ADMIN_NAV = [
  { label: 'Overview',     path: '/admin/overview',      icon: LayoutDashboard },
  { label: 'China Orders', path: '/admin/china-orders',  icon: Globe },
  { label: 'Products',     path: '/admin/products',      icon: Package },
  { label: 'Media Vault',  path: '/admin/uploads',       icon: HardDrive },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Admin Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-200 shrink-0 hidden lg:flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-10">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-[#FF5A00]">NAIRABULK</Link>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sourcing Control</p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {ADMIN_NAV.map((item) => {
             const active = location.pathname === item.path;
             return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group",
                  active
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={cn("h-5 w-5", active ? "text-[#FF5A00]" : "text-slate-300 group-hover:text-slate-600")} />
                  <span className="text-xs font-bold tracking-tight uppercase">{item.label}</span>
                </div>
                {active && <div className="h-1.5 w-1.5 bg-[#FF5A00] rounded-full" />}
              </Link>
             );
          })}
        </nav>

        <div className="p-8 border-t border-slate-100">
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-4 text-slate-400 hover:text-red-500 transition-all px-5 py-3 rounded-2xl hover:bg-red-50 w-full group"
          >
            <LogOut className="h-5 w-5 group-hover:animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Logout System</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-[#F9FAFB] min-h-screen">
          <div className="h-16 bg-white border-b border-slate-200 hidden lg:flex items-center justify-end px-10 gap-6 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none">Admin</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
               </div>
               <div className="h-10 w-10 bg-[#FF5A00] rounded-full border-2 border-white shadow-soft flex items-center justify-center text-white font-bold text-xs">
                 AD
               </div>
            </div>
          </div>
          <div className="p-10">
            <Outlet />
          </div>
      </main>
    </div>
  );
}
