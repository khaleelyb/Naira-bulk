import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChinaOrder } from '../types';
import { Package, MapPin, Search, Plus, ExternalLink, ArrowRight, Settings, Globe, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/utils';

export function UserDashboard() {
  const [orders, setOrders] = useState<ChinaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('china_orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setOrders(data || []);
      }
      setLoading(false);
    };
    getData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-[32px] bg-slate-900 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-slate-900/10">
            {user?.email?.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Importer Console</h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Managing <span className="text-slate-900 font-bold">{orders.length} active</span> global sourcing requests.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/import" className="px-8 py-4.5 bg-[#FF5A00] text-white font-bold rounded-full text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#FF5A00]/20 hover:bg-[#E65100] transition-all flex items-center gap-3 active:scale-95">
            <Plus className="h-4 w-4" /> Start New Import
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-8">
           <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Navigation</p>
              <Link to="/dashboard" className="flex items-center gap-4 px-6 py-4 bg-white text-[#FF5A00] border border-slate-100 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-soft">
                <Globe className="h-4 w-4" /> Overview
              </Link>
              <Link to="/track" className="flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all group">
                <Package className="h-4 w-4 text-slate-300 group-hover:text-[#FF5A00]" /> Shipments
              </Link>
              <Link to="/dashboard/settings" className="flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all group">
                <Settings className="h-4 w-4 text-slate-300 group-hover:text-[#FF5A00]" /> Config
              </Link>
           </div>
           
           <div className="pt-8 border-t border-slate-100 space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Assets</p>
              <div className="bg-slate-900 p-8 rounded-[40px] shadow-xl shadow-slate-900/10 space-y-6 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                    <Globe className="h-20 w-20" />
                 </div>
                 <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Available Balance</p>
                    <p className="text-3xl font-bold tracking-tighter">₦0.00</p>
                    <button className="mt-8 w-full py-4 bg-[#FF5A00] text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#E65100] transition-colors shadow-lg shadow-[#FF5A00]/20">
                      Top Up Wallet
                    </button>
                 </div>
              </div>
           </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-10">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
             <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="space-y-1">
                   <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-slate-900">
                     Recent Import Documentation
                   </h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking updates from Alibaba & 1688</p>
                </div>
                <div className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-4 py-2 rounded-full shadow-sm">{orders.length} RECORDS</div>
             </div>

             {loading ? (
               <div className="p-24 flex flex-col items-center justify-center">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="h-6 w-6 text-[#FF5A00] animate-spin" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Synchronizing Data...</span>
               </div>
             ) : orders.length === 0 ? (
               <div className="p-24 text-center space-y-8">
                  <div className="bg-slate-50 h-24 w-24 rounded-[40px] flex items-center justify-center mx-auto text-slate-200 shadow-inner">
                    <Search className="h-10 w-10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">No active sourcing records</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-[320px] mx-auto leading-relaxed">
                      Your dashboard is empty. Submit a product link from any Chinese marketplace to begin.
                    </p>
                  </div>
               </div>
             ) : (
               <div className="divide-y divide-slate-50">
                  {orders.map(order => (
                    <div key={order.id} className="px-10 py-8 hover:bg-slate-50/50 transition-all group cursor-pointer">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex gap-8 items-center">
                           <div className="h-20 w-20 bg-slate-50 rounded-[28px] overflow-hidden shrink-0 border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-500">
                             {order.image_url ? (
                               <img src={order.image_url} className="w-full h-full object-cover" alt={order.description} />
                             ) : (
                               <div className="h-full w-full flex items-center justify-center"><Package className="text-slate-200 h-8 w-8" /></div>
                             )}
                           </div>
                           <div className="space-y-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                              <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#FF5A00] transition-colors line-clamp-1">{order.description || 'Global Procurement Link'}</h4>
                              <div className="flex items-center gap-4">
                                 <span className="text-[9px] font-black tracking-[0.2em] text-[#FF5A00] bg-[#FF5A00]/5 px-3 py-1 rounded-full uppercase">{order.shipping_method}</span>
                                 <div className="h-1 w-1 bg-slate-200 rounded-full" />
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Qty: {order.quantity}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-6 shrink-0">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                             order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                             order.status === 'Paid' ? 'bg-green-50 text-green-600 border border-green-100' :
                             'bg-slate-900 text-white shadow-slate-900/10'
                           }`}>
                             {order.status}
                           </span>
                           <Link to={`/track?id=${order.id}`} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2 group/link transition-colors">
                             View Details <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                           </Link>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
