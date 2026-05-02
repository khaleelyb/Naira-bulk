import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ChinaOrder, ChinaOrderStatus } from '../../types';
import { formatPrice, cn, getWhatsAppLink } from '../../lib/utils';
import { toast } from 'sonner';
import { ExternalLink, Edit3, Save, X, Truck, DollarSign, PackageCheck, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_LIST: ChinaOrderStatus[] = [
  'Pending', 'Reviewing', 'Quoted', 'Awaiting Payment', 'Paid', 'Processing', 'Purchased', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'
];

export function AdminChinaOrders() {
  const [orders, setOrders] = useState<ChinaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ChinaOrder>>({});

  useEffect(() => {
    fetchOrders();
    const subscription = supabase
      .channel('china_orders_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'china_orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('china_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (order: ChinaOrder) => {
    setEditingId(order.id);
    setEditForm(order);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const { error } = await supabase
        .from('china_orders')
        .update(editForm)
        .eq('id', editingId);
      if (error) throw error;
      toast.success('Order updated successfully');
      setEditingId(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Global Sourcing Desk</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Import Management Dashboard</p>
        </div>
        <div className="bg-white px-8 py-6 rounded-[32px] border border-slate-100 flex items-center gap-10 shadow-soft">
          <div className="text-center px-4 border-r border-slate-50">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Portfolio</p>
             <p className="text-2xl font-bold text-slate-900 leading-none">{orders.length}</p>
          </div>
          <div className="text-center px-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pending</p>
             <p className="text-2xl font-bold text-[#FF5A00] leading-none">{orders.filter(o => o.status === 'Pending').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Record Identifier</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Procurement Detail</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Financials</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Logistics Pipeline</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <Loader2 className="h-10 w-10 text-[#FF5A00] animate-spin mx-auto mb-6" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Synchronizing Master Data...</span>
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-900 tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] font-medium text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-1.5 bg-[#FF5A00] rounded-full" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">UID: {order.user_id.slice(0, 6)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-[250px] space-y-2">
                      <p className="text-xs font-bold text-slate-700 line-clamp-1">{order.description || 'Global Procurement Link'}</p>
                      <div className="flex items-center gap-3">
                        {order.product_url && (
                          <a href={order.product_url} target="_blank" rel="noreferrer" className="text-[9px] text-[#FF5A00] font-bold hover:underline flex items-center gap-1.5 uppercase tracking-widest">
                            <ExternalLink className="h-3 w-3" /> Source
                          </a>
                        )}
                        {order.image_url && (
                          <a href={order.image_url} target="_blank" rel="noreferrer" className="text-[9px] text-slate-400 font-bold hover:underline flex items-center gap-1.5 uppercase tracking-widest">
                            <PackageCheck className="h-3 w-3" /> Media
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {editingId === order.id ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <input 
                            type="number"
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-[#FF5A00]/20 transition-all"
                            value={editForm.quotation_price || ''}
                            onChange={(e) => setEditForm({...editForm, quotation_price: parseFloat(e.target.value)})}
                            placeholder="Price (₦)"
                          />
                        </div>
                        <input 
                          type="number"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-[#FF5A00]/20 transition-all"
                          value={editForm.shipping_fee || ''}
                          onChange={(e) => setEditForm({...editForm, shipping_fee: parseFloat(e.target.value)})}
                          placeholder="Ship (₦)"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-slate-900 tracking-tight">{formatPrice(order.quotation_price || 0)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded w-fit">Exp: {formatPrice(order.shipping_fee || 0)}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {editingId === order.id ? (
                      <div className="space-y-3">
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-[#FF5A00]/20 transition-all"
                          value={editForm.status}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value as ChinaOrderStatus})}
                        >
                          {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:ring-[#FF5A00]/20 transition-all"
                          value={editForm.tracking_number || ''}
                          onChange={(e) => setEditForm({...editForm, tracking_number: e.target.value})}
                          placeholder="Tracking Code"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm",
                          order.status === 'Pending' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          order.status === 'Paid' ? "bg-green-50 text-green-600 border border-green-100" :
                          "bg-slate-900 text-white"
                        )}>
                          {order.status}
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">{order.tracking_number || 'ID Pending'}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {editingId === order.id ? (
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={saveEdit} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-900/10">
                          <Save className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => startEdit(order)} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:border-[#FF5A00] hover:text-[#FF5A00] transition-all shadow-soft group/edit">
                          <Edit3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => window.open(getWhatsAppLink('2348123456789', `Order Intelligence: #${order.id.slice(0,8)} status transition: ${order.status}`), '_blank')}
                          className="p-3 bg-[#25D366]/5 text-[#25D366] rounded-2xl hover:bg-[#25D366] hover:text-white transition-all group/wa"
                          title="Notify System"
                        >
                          <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
