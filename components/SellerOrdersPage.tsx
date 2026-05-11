import React, { useState, useMemo } from 'react';
import { User, Product } from '../types';
import type { Order } from '../services/dbService';
import { verifyDeliveryOtp } from '../services/dbService';

interface SellerOrdersPageProps {
  currentUser: User;
  orders: Order[];
  products: Product[];
  onBack: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  processing: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  success:    'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  failed:     'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800',
  shipped:    'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  delivered:  'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', processing: 'Processing', success: 'Paid',
  failed: 'Failed', shipped: 'Shipped', delivered: 'Delivered',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

// ── OTP Entry Modal ───────────────────────────────────────────────────────────
interface OtpModalProps {
  order: Order;
  /** Called with confirmed OTP — returns 'ok' | 'wrong' | 'error' */
  onConfirm: (otp: string) => Promise<'ok' | 'wrong' | 'error'>;
  onClose: () => void;
}

const OtpModal: React.FC<OtpModalProps> = ({ order, onConfirm, onClose }) => {
  const [otp, setOtp] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'wrong' | 'error' | 'ok'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) return;
    setState('loading');
    const result = await onConfirm(otp.trim());
    setState(result);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Confirm Delivery</h3>
                <p className="text-xs text-gray-400 truncate max-w-[180px]">{order.productTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {state === 'ok' ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">Delivery Confirmed!</p>
                <p className="text-sm text-gray-400 mt-1">Order marked as delivered. Payment released.</p>
              </div>
              <button onClick={onClose} className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-2.5 rounded-xl transition-colors text-sm">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Ask the buyer for their 6-digit delivery code. Enter it below to confirm delivery.
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Buyer's Delivery Code
                </label>
                {/* OTP boxes */}
                <div className="flex gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`flex-1 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                      state === 'wrong' || state === 'error'
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                        : otp.length > i
                          ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <span className={`text-lg font-bold ${
                        state === 'wrong' || state === 'error' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {otp[i] ?? ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Hidden actual input */}
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setState('idle'); }}
                  className="sr-only"
                  autoFocus
                  id="otp-input"
                />
                {/* Clickable label to focus hidden input */}
                <label
                  htmlFor="otp-input"
                  className="block mt-2 text-center text-xs text-green-500 hover:text-green-600 cursor-pointer font-medium"
                >
                  Tap here to type code
                </label>

                {/* Visible number pad */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                    k === '' ? <div key={i} /> : (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setState('idle');
                          if (k === '⌫') { setOtp(p => p.slice(0, -1)); }
                          else if (otp.length < 6) { setOtp(p => p + k); }
                        }}
                        className="h-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
                      >
                        {k}
                      </button>
                    )
                  ))}
                </div>

                {state === 'wrong' && (
                  <div className="mt-2 flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-xl px-3 py-2">
                    <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    <p className="text-xs text-red-600 dark:text-red-400">Incorrect code. Ask the buyer to check their Order History.</p>
                  </div>
                )}
                {state === 'error' && (
                  <p className="text-xs text-red-500 mt-2 text-center">Something went wrong. Please try again.</p>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otp.length !== 6 || state === 'loading'}
                  className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors shadow-md shadow-green-200 dark:shadow-green-900/30"
                >
                  {state === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying…
                    </span>
                  ) : 'Confirm Delivery'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const SellerOrdersPage: React.FC<SellerOrdersPageProps> = ({
  currentUser, orders, products, onBack, onUpdateOrderStatus,
}) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'shipped' | 'delivered' | 'pending' | 'failed'>('all');
  const [otpModal, setOtpModal] = useState<Order | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const myOrders = useMemo(() =>
    orders.filter(o => o.sellerId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders, currentUser.id]
  );

  const filtered = useMemo(() =>
    filter === 'all' ? myOrders : myOrders.filter(o => o.status === filter),
    [myOrders, filter]
  );

  const stats = useMemo(() => ({
    total: myOrders.length,
    paid: myOrders.filter(o => o.status === 'success').length,
    shipped: myOrders.filter(o => o.status === 'shipped').length,
    delivered: myOrders.filter(o => o.status === 'delivered').length,
    revenue: myOrders
      .filter(o => ['success', 'shipped', 'delivered'].includes(o.status))
      .reduce((s, o) => s + o.amount, 0),
  }), [myOrders]);

  /**
   * Called by OtpModal — verifies against Supabase DB.
   * On 'ok', also updates local state via onUpdateOrderStatus.
   */
  const handleOtpConfirm = async (order: Order, enteredOtp: string): Promise<'ok' | 'wrong' | 'error'> => {
    const result = await verifyDeliveryOtp(order.id, enteredOtp);
    if (result === 'ok') {
      // Update local orders state to reflect delivered + otpVerified
      onUpdateOrderStatus(order.id, 'delivered');
    }
    return result;
  };

  const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'success', label: 'Paid' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-400 hover:text-green-500 dark:hover:text-green-400 text-sm font-medium transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">My Store Orders</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Orders', value: stats.total, color: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-gray-900' },
            { label: 'Awaiting Ship', value: stats.paid, color: 'text-green-600 dark:text-green-400', bg: 'bg-white dark:bg-gray-900' },
            { label: 'Delivered', value: stats.delivered, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-white dark:bg-gray-900' },
            { label: 'Revenue', value: `₦${stats.revenue.toLocaleString()}`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/10' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 dark:border-gray-800 p-4`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── OTP delivery info banner ── */}
        {stats.paid > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {stats.paid} order{stats.paid !== 1 ? 's' : ''} ready to ship
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5 leading-relaxed">
                When you deliver an order, tap <strong>"Confirm Delivery"</strong> and enter the 6-digit code the buyer received after payment. This verifies delivery and marks the order complete.
              </p>
            </div>
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {FILTER_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === t.key
                  ? 'bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/40'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-green-300 hover:text-green-500'
              }`}
            >
              {t.label}
              {t.key !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  {myOrders.filter(o => o.status === t.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Orders list ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200">No orders here</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filter === 'all' ? 'Your orders will appear here once buyers purchase your products.' : `No ${STATUS_LABELS[filter]?.toLowerCase()} orders.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const product = products.find(p => p.id === order.productId);
              const isExpanded = expandedId === order.id;
              const isDelivered = order.status === 'delivered' || order.otpVerified;

              // Show "Confirm Delivery" if order is paid or shipped and has an OTP that hasn't been verified
              const canConfirmDelivery =
                (order.status === 'success' || order.status === 'shipped') &&
                order.deliveryOtp &&
                !order.otpVerified;

              return (
                <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-green-200 dark:hover:border-green-800/50 transition-colors">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Product image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                        {product?.images?.[0]
                          ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                              </svg>
                            </div>
                        }
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug truncate max-w-[200px] sm:max-w-none">
                              {order.productTitle}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className="font-bold text-green-600 dark:text-green-400">₦{order.amount.toLocaleString()}</p>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>

                        {/* Buyer quick info */}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {order.buyerName && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                              </svg>
                              {order.buyerName}
                            </div>
                          )}
                          {order.buyerPhone && (
                            <a href={`tel:${order.buyerPhone}`} className="flex items-center gap-1 text-xs text-green-500 hover:text-green-600 transition-colors">
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                              </svg>
                              {order.buyerPhone}
                            </a>
                          )}
                        </div>

                        {/* Delivered + OTP verified badge */}
                        {isDelivered && order.otpVerified && (
                          <div className="mt-2 inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Delivery code verified
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex-wrap">

                      {/* ── CONFIRM DELIVERY via OTP ── */}
                      {canConfirmDelivery && (
                        <button
                          onClick={() => setOtpModal(order)}
                          className="flex items-center gap-1.5 text-xs font-bold bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-green-200 dark:shadow-green-900/30"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                          Enter Delivery Code
                        </button>
                      )}

                      {/* Mark as shipped if paid */}
                      {order.status === 'success' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'shipped')}
                          className="flex items-center gap-1.5 text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                          </svg>
                          Mark Shipped
                        </button>
                      )}

                      {/* WhatsApp buyer */}
                      {order.buyerPhone && (
                        <a
                          href={`https://wa.me/${order.buyerPhone.replace(/^0/, '234').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${order.buyerName ?? 'there'}, your order "${order.productTitle}" is on the way! 🚚`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:text-white hover:bg-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                          </svg>
                          WhatsApp
                        </a>
                      )}

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="ml-auto text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {isExpanded ? 'Less' : 'Details'}
                      </button>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {order.buyerEmail && (
                            <div>
                              <p className="text-gray-400 font-semibold uppercase tracking-wide mb-1">Email</p>
                              <a href={`mailto:${order.buyerEmail}`} className="text-green-500 hover:text-green-600">{order.buyerEmail}</a>
                            </div>
                          )}
                          {order.buyerAddress && (
                            <div className="sm:col-span-2">
                              <p className="text-gray-400 font-semibold uppercase tracking-wide mb-1">Delivery Address</p>
                              <p className="text-gray-600 dark:text-gray-300">{order.buyerAddress}</p>
                            </div>
                          )}
                          {order.korapayReference && (
                            <div>
                              <p className="text-gray-400 font-semibold uppercase tracking-wide mb-1">Payment Ref</p>
                              <p className="font-mono text-gray-600 dark:text-gray-300 break-all">{order.korapayReference}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-400 font-semibold uppercase tracking-wide mb-1">Order ID</p>
                            <p className="font-mono text-gray-600 dark:text-gray-300 break-all">{order.id.slice(0, 16)}…</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OTP Confirmation Modal */}
      {otpModal && (
        <OtpModal
          order={otpModal}
          onConfirm={(enteredOtp) => handleOtpConfirm(otpModal, enteredOtp)}
          onClose={() => setOtpModal(null)}
        />
      )}
    </div>
  );
};
