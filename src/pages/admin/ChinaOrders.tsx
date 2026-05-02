import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ChinaOrder, ChinaOrderStatus } from '../../types';
import { formatPrice, cn, getWhatsAppLink } from '../../lib/utils';
import { toast } from 'sonner';
import {
  ExternalLink, Edit3, Save, X, PackageCheck, Send, Loader2,
  Package, MapPin, Truck, DollarSign, Hash, User, Calendar,
  ChevronDown, ChevronUp, Image as ImageIcon, Eye
} from 'lucide-react';

const STATUS_LIST: ChinaOrderStatus[] = [
  'Pending', 'Reviewing', 'Quoted', 'Awaiting Payment', 'Paid',
  'Processing', 'Purchased', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'
];

const STATUS_COLORS: Record<string, string> = {
  Pending:           'bg-amber-50 text-amber-600 border-amber-100',
  Reviewing:         'bg-blue-50 text-blue-600 border-blue-100',
  Quoted:            'bg-purple-50 text-purple-600 border-purple-100',
  'Awaiting Payment':'bg-orange-50 text-orange-600 border-orange-100',
  Paid:              'bg-green-50 text-green-600 border-green-100',
  Processing:        'bg-cyan-50 text-cyan-600 border-cyan-100',
  Purchased:         'bg-teal-50 text-teal-600 border-teal-100',
  Shipped:           'bg-indigo-50 text-indigo-600 border-indigo-100',
  'In Transit':      'bg-violet-50 text-violet-600 border-violet-100',
  Delivered:         'bg-emerald-50 text-emerald-700 border-emerald-100',
  Cancelled:         'bg-red-50 text-red-500 border-red-100',
};

function OrderCard({
  order,
  onEdit,
}: {
  order: ChinaOrder;
  onEdit: (order: ChinaOrder) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden hover:shadow-md transition-all">
      {/* Main Row */}
      <div className="p-6 flex items-start gap-5">
        {/* Product Image */}
        <div className="shrink-0 h-24 w-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative group">
          {order.image_url && !imgError ? (
            <>
              <img
                src={order.image_url}
                alt={order.description ?? 'Product'}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
              <a
                href={order.image_url}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 flex items-center justify-center transition-all"
                onClick={e => e.stopPropagation()}
              >
                <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-all" />
              </a>
            </>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-1.5">
              <ImageIcon className="h-6 w-6 text-slate-200" />
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">No Image</span>
            </div>
          )}
        </div>

        {/* Core Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <h3 className="font-bold text-slate-900 mt-1 line-clamp-2 text-sm leading-snug">
                {order.description || 'Import Request (No description)'}
              </h3>
            </div>
            <span className={cn(
              'shrink-0 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border',
              STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
            )}>
              {order.status}
            </span>
          </div>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <Package className="h-3 w-3 text-slate-300" /> Qty: {order.quantity}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <Truck className="h-3 w-3 text-slate-300" /> {order.shipping_method}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <MapPin className="h-3 w-3 text-slate-300" /> {order.destination}
            </span>
            {order.quotation_price ? (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF5A00]">
                <DollarSign className="h-3 w-3" /> {formatPrice(order.quotation_price)}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-300 italic">Unquoted</span>
            )}
          </div>

          {/* Links */}
          <div className="flex items-center gap-3 pt-0.5">
            {order.product_url && (
              <a
                href={order.product_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF5A00] hover:underline uppercase tracking-widest"
              >
                <ExternalLink className="h-3 w-3" /> Source Link
              </a>
            )}
            {order.image_url && (
              <a
                href={order.image_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-700 hover:underline uppercase tracking-widest"
              >
                <PackageCheck className="h-3 w-3" /> View Image
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(order)}
              className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:border-[#FF5A00] hover:text-[#FF5A00] transition-all shadow-soft"
              title="Edit order"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => window.open(getWhatsAppLink('2348123456789', `Order #${order.id.slice(0,8)}: ${order.description ?? ''}`), '_blank')}
              className="p-2.5 bg-[#25D366]/5 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all"
              title="WhatsApp"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors mt-1"
          >
            {expanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> Details</>}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-50 bg-slate-50/50 px-6 pb-6 pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { label: 'Order ID',       value: order.id,                           icon: Hash },
              { label: 'User ID',        value: order.user_id.slice(0, 12) + '…',   icon: User },
              { label: 'Submitted',      value: new Date(order.created_at).toLocaleString(), icon: Calendar },
              { label: 'Quantity',       value: String(order.quantity),             icon: Package },
              { label: 'Shipping',       value: order.shipping_method,              icon: Truck },
              { label: 'Destination',    value: order.destination,                  icon: MapPin },
              { label: 'Budget',         value: order.budget ? formatPrice(order.budget) : 'Not set', icon: DollarSign },
              { label: 'Quotation',      value: order.quotation_price ? formatPrice(order.quotation_price) : 'Pending', icon: DollarSign },
              { label: 'Shipping Fee',   value: order.shipping_fee ? formatPrice(order.shipping_fee) : 'TBD', icon: Truck },
              { label: 'Tracking No.',   value: order.tracking_number ?? 'Not assigned', icon: Hash },
              { label: 'Est. Delivery',  value: order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'TBD', icon: Calendar },
              { label: 'Status',         value: order.status,                       icon: PackageCheck },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-3 w-3 text-slate-300" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                </div>
                <p className="text-xs font-bold text-slate-900 break-all leading-snug">{value}</p>
              </div>
            ))}

            {/* Preferences / Notes */}
            {order.preferences && Object.keys(order.preferences).length > 0 && (
              <div className="col-span-full bg-white rounded-2xl p-4 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sourcing Notes</p>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  {(order.preferences as any)?.notes ?? JSON.stringify(order.preferences)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Edit Modal ─────────────────────────────────────────────────────────── */
function EditModal({
  order,
  onClose,
  onSaved,
}: {
  order: ChinaOrder;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<ChinaOrder>>({ ...order });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('china_orders').update(form).eq('id', order.id);
      if (error) throw error;
      toast.success('Order updated');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof ChinaOrder, type = 'text') => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={(form[key] as string) ?? ''}
        onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Editing Order</p>
            <h2 className="font-bold text-slate-900 text-sm mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as ChinaOrderStatus }))}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all appearance-none"
            >
              {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Quotation Price (₦)', 'quotation_price', 'number')}
            {field('Shipping Fee (₦)', 'shipping_fee', 'number')}
            {field('Tracking Number', 'tracking_number')}
            {field('Est. Delivery Date', 'estimated_delivery', 'date')}
          </div>

          {field('Shipment Proof URL', 'shipment_proof_url')}
        </div>

        <div className="px-8 py-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-3 bg-[#FF5A00] text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-[#E65100] disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF5A00]/20"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export function AdminChinaOrders() {
  const [orders, setOrders] = useState<ChinaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<ChinaOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
    const subscription = supabase
      .channel('china_orders_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'china_orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
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

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Global Sourcing Desk</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Import requests with product images & full details</p>
        </div>
        <div className="bg-white px-8 py-5 rounded-[28px] border border-slate-100 flex items-center gap-8 shadow-soft">
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">{orders.length}</p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending</p>
            <p className="text-2xl font-bold text-[#FF5A00] leading-none">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={cn(
            'px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all',
            filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
          )}
        >
          All ({orders.length})
        </button>
        {STATUS_LIST.filter(s => orders.some(o => o.status === s)).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border',
              filterStatus === s
                ? 'bg-slate-900 text-white border-slate-900'
                : cn('bg-white text-slate-500 hover:border-slate-400', STATUS_COLORS[s] ?? '')
            )}
          >
            {s} ({orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-10 w-10 text-[#FF5A00] animate-spin mb-4" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading orders...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[40px] border border-slate-100">
          <Package className="h-12 w-12 text-slate-100 mx-auto mb-4" />
          <p className="font-bold text-slate-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} onEdit={setEditingOrder} />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingOrder && (
        <EditModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={fetchOrders}
        />
      )}
    </div>
  );
}
