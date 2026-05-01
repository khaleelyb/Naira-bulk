import React, { useState } from 'react';
import { supabase } from '../services/supabase_client';

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  reviewing: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  quoted:    'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  confirmed: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  sourcing:  'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  shipped:   'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  delivered: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', reviewing: 'Reviewing', quoted: 'Quoted', confirmed: 'Confirmed',
  sourcing: 'Sourcing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};
const ALL_STATUSES = ['pending', 'reviewing', 'quoted', 'confirmed', 'sourcing', 'shipped', 'delivered', 'cancelled'];

interface ChinaImportAdminProps {
  requests: any[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export const ChinaImportAdmin: React.FC<ChinaImportAdminProps> = ({ requests, onRefresh, showToast }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = q === '' || r.buyer_name?.toLowerCase().includes(q) || r.product_description?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setEditForm({
      status: r.status,
      admin_note: r.admin_note ?? '',
      quoted_price: r.quoted_price ?? '',
      shipping_fee: r.shipping_fee ?? '',
      estimated_delivery: r.estimated_delivery ?? '',
      tracking_number: r.tracking_number ?? '',
    });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('import_requests').update({
        status: editForm.status,
        admin_note: editForm.admin_note || null,
        quoted_price: editForm.quoted_price ? Number(editForm.quoted_price) : null,
        shipping_fee: editForm.shipping_fee ? Number(editForm.shipping_fee) : null,
        estimated_delivery: editForm.estimated_delivery || null,
        tracking_number: editForm.tracking_number || null,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
      showToast('Import request updated!');
      setEditingId(null);
      onRefresh();
    } catch (e) {
      console.error(e);
      showToast('Error updating request.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all';

  return (
    <div className="space-y-4">
      {/* Alert bar for pending */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/40 rounded-xl px-4 py-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
            {pendingCount} new import request{pendingCount > 1 ? 's' : ''} waiting for review
          </p>
          <button onClick={() => setStatusFilter('pending')} className="ml-auto text-xs font-bold text-yellow-600 hover:text-yellow-700">
            View →
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input type="text" placeholder="Search by buyer, product, category…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400">
          <option value="all">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Requests List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{filtered.length} import requests</span>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {filtered.map(req => {
            const isExpanded = expandedId === req.id;
            const isEditing = editingId === req.id;
            return (
              <div key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                      {req.reference_image
                        ? <img src={req.reference_image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🇨🇳</div>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">{req.product_description}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">{req.category}</span>
                            <span className="text-xs text-gray-400">Qty: {req.quantity}</span>
                            <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLES[req.status] || STATUS_STYLES.pending}`}>
                          {STATUS_LABELS[req.status] || req.status}
                        </span>
                      </div>

                      {/* Buyer Info */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                          {req.buyer_name}
                        </span>
                        {req.buyer_phone && (
                          <a href={`tel:${req.buyer_phone}`} className="flex items-center gap-1 hover:text-red-500 transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                            {req.buyer_phone}
                          </a>
                        )}
                        {req.budget_min && (
                          <span>Budget: ₦{Number(req.budget_min).toLocaleString()} – ₦{Number(req.budget_max || req.budget_min).toLocaleString()}</span>
                        )}
                      </div>

                      {/* WhatsApp Button */}
                      {req.buyer_phone && (
                        <div className="mt-2">
                          <a
                            href={`https://wa.me/${req.buyer_phone.replace(/^0/, '234').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${req.buyer_name}, regarding your import request for: "${req.product_description.slice(0, 80)}"...`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 transition-colors"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                            WhatsApp Buyer
                          </a>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <button onClick={() => { setExpandedId(isExpanded ? null : req.id); if (!isExpanded) startEdit(req); }}
                          className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          {isExpanded ? 'Hide' : 'Manage'}
                        </button>
                        {req.product_url && (
                          <a href={req.product_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-500 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            🔗 View Product
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Edit Panel */}
                  {isExpanded && (
                    <div className="mt-4 ml-18 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Update Request</p>

                      {/* Status */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                        <select value={editForm.status} onChange={e => setEditForm((f: any) => ({ ...f, status: e.target.value }))} className={inputCls}>
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      </div>

                      {/* Admin Note */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Message to Buyer</label>
                        <textarea value={editForm.admin_note} onChange={e => setEditForm((f: any) => ({ ...f, admin_note: e.target.value }))}
                          rows={2} placeholder="e.g. We found your item! Price quote below..."
                          className={inputCls + ' resize-none'} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Quoted Price */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Quoted Price (₦)</label>
                          <input type="number" value={editForm.quoted_price} onChange={e => setEditForm((f: any) => ({ ...f, quoted_price: e.target.value }))}
                            placeholder="e.g. 45000" className={inputCls} />
                        </div>

                        {/* Shipping Fee */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Shipping Fee (₦)</label>
                          <input type="number" value={editForm.shipping_fee} onChange={e => setEditForm((f: any) => ({ ...f, shipping_fee: e.target.value }))}
                            placeholder="e.g. 8000" className={inputCls} />
                        </div>

                        {/* Est. Delivery */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Estimated Delivery</label>
                          <input type="text" value={editForm.estimated_delivery} onChange={e => setEditForm((f: any) => ({ ...f, estimated_delivery: e.target.value }))}
                            placeholder="e.g. 2–3 weeks" className={inputCls} />
                        </div>

                        {/* Tracking */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Tracking Number</label>
                          <input type="text" value={editForm.tracking_number} onChange={e => setEditForm((f: any) => ({ ...f, tracking_number: e.target.value }))}
                            placeholder="e.g. EE123456789CN" className={inputCls} />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button onClick={() => { setEditingId(null); setExpandedId(null); }}
                          className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => saveEdit(req.id)} disabled={saving}
                          className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold transition-colors">
                          {saving ? 'Saving…' : '💾 Save Update'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">No import requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
