import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Globe, Package, TrendingUp, Users, ArrowRight, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

export function AdminOverview() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, productsRes, usersRes, recentRes] = await Promise.all([
        supabase.from('china_orders').select('id, status, quotation_price, shipping_fee, created_at'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('china_orders').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.reduce((sum, o) =>
        sum + (o.quotation_price || 0) + (o.shipping_fee || 0), 0);

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'Pending').length,
        totalProducts: productsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalRevenue: revenue,
      });
      setRecentOrders(recentRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const STAT_CARDS = [
    { label: 'Total Orders', value: stats.totalOrders, icon: Globe, color: 'text-[#FF5A00]', bg: 'bg-[#FF5A00]/5' },
    { label: 'Pending Review', value: stats.pendingOrders, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Products Listed', value: stats.totalProducts, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Registered Users', value: stats.totalUsers, icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-8 w-8 text-[#FF5A00] animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Command Center</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform overview & live metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="bg-white rounded-[28px] border border-slate-100 shadow-soft p-8 space-y-5">
            <div className={`h-12 w-12 rounded-2xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tighter">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue card */}
      <div className="bg-slate-900 rounded-[32px] p-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#FF5A00]" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Sourcing Volume</p>
          </div>
          <p className="text-4xl font-bold tracking-tighter">{formatPrice(stats.totalRevenue)}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Across all completed quotes</p>
        </div>
        <Link to="/admin/china-orders" className="flex items-center gap-3 px-8 py-4 bg-[#FF5A00] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#E65100] transition-all shadow-lg shadow-[#FF5A00]/20 whitespace-nowrap">
          Manage Orders <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="px-10 py-7 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Recent Import Requests</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Latest 5 orders</p>
          </div>
          <Link to="/admin/china-orders" className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-widest hover:underline flex items-center gap-1.5">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recentOrders.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm font-medium">No orders yet.</div>
          ) : recentOrders.map(order => (
            <div key={order.id} className="px-10 py-5 flex items-center justify-between gap-6 hover:bg-slate-50/30 transition-all">
              <div className="flex items-center gap-5">
                <div className="h-10 w-10 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shrink-0">
                  <Globe className="h-4 w-4 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{order.description || 'Import Request'}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0 ${
                order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                order.status === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                'bg-slate-900 text-white'
              }`}>{order.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
