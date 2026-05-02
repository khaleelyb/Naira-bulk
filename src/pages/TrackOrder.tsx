import { useState, useEffect } from 'react';
import { Search, Package, MapPin, Calendar, Clock, ArrowRight, CheckCircle2, ChevronRight, MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChinaOrder, ChinaOrderStatus } from '../types';
import { formatPrice, getWhatsAppLink } from '../lib/utils';

const STATUS_STEPS: ChinaOrderStatus[] = [
  'Pending',
  'Reviewing',
  'Quoted',
  'Awaiting Payment',
  'Paid',
  'Processing',
  'Purchased',
  'Shipped',
  'In Transit',
  'Delivered'
];

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<ChinaOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Auto-fetch if id is in URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setOrderId(idFromUrl);
      fetchOrder(idFromUrl);
    }
  }, [searchParams]);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setSearchInitiated(true);
    try {
      const { data, error } = await supabase
        .from('china_orders')
        .select('*')
        .eq('id', id.trim())
        .single();
      
      if (error) throw error;
      setOrder(data);
    } catch (err) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (currentStatus: ChinaOrderStatus) => {
    const idx = STATUS_STEPS.indexOf(currentStatus);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Track Your Order</h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium text-sm leading-relaxed">
          Enter your Order ID or Tracking Number to see real-time updates on your global sourcing journey.
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto bg-white p-2 rounded-[28px] border border-slate-200 shadow-soft">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-4 h-4.5 w-4.5 text-slate-300" />
            <input
              type="text"
              placeholder="Order ID (e.g. 550e8400...)"
              className="w-full border-none bg-transparent py-4 pl-12 pr-4 text-sm font-medium focus:ring-0 text-slate-900"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrder(orderId)}
            />
          </div>
          <button 
            onClick={() => fetchOrder(orderId)}
            className="px-10 py-4 bg-[#FF5A00] text-white font-bold rounded-full hover:bg-[#E65100] transition-all whitespace-nowrap text-sm uppercase tracking-widest shadow-lg shadow-[#FF5A00]/20"
          >
            Track Status
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-10 w-10 text-[#FF5A00] animate-spin mb-4" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Identifying Shipment...</span>
          </motion.div>
        ) : order ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={order.id}
            className="space-y-10"
          >
            {/* Order Header */}
            <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Current Status</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{order.status}</span>
                  <div className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => window.open(getWhatsAppLink('2348123456789', `Hi, I need help with order #${order.id}`), '_blank')}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-50 text-slate-900 font-bold rounded-full text-[11px] uppercase tracking-widest border border-slate-200 hover:border-[#FF5A00] hover:text-[#FF5A00] transition-all"
                >
                  <MessageCircle className="h-4 w-4" /> Support Case
                </button>
              </div>
            </div>

            {/* Visual Tracking Steps */}
            <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-soft overflow-x-auto">
              <div className="min-w-[800px] flex justify-between relative px-4">
                {/* Connector Line */}
                <div className="absolute top-6 left-0 w-full h-[2px] bg-slate-100 -z-0" />
                <div 
                  className="absolute top-6 left-0 h-[2px] bg-[#FF5A00] transition-all duration-1000 -z-0" 
                  style={{ width: `${(getStatusIndex(order.status) / (STATUS_STEPS.length - 1)) * 100}%` }} 
                />

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = getStatusIndex(order.status) >= idx;
                  const isCurrent = order.status === step;

                  return (
                    <div key={step} className="flex flex-col items-center gap-5 relative z-10 w-24">
                      <div className={`h-12 w-12 flex items-center justify-center rounded-2xl border-4 border-white shadow-soft transition-all duration-500 ${isCompleted ? 'bg-[#FF5A00] text-white' : 'bg-slate-50 text-slate-300'}`}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest text-center px-1 ${isCurrent ? 'text-[#FF5A00]' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-soft space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <Package className="h-5 w-5 text-[#FF5A00]" />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Shipment Details</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between py-4 border-b border-slate-50">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Tracking ID</span>
                    <span className="text-xs font-bold text-slate-900 font-mono bg-slate-50 px-3 py-1 rounded-lg">{order.tracking_number || 'Preparing...'}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-slate-50">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Method</span>
                    <span className="text-xs font-bold text-slate-900">{order.shipping_method}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-slate-50">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Destination</span>
                    <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[200px] text-right">{order.destination}</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Est. Delivery</span>
                    <span className="text-xs font-bold text-[#FF5A00]">{order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'Processing'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-soft space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <ArrowRight className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Financial Summary</h3>
                </div>
                <div className="space-y-1">
                   {order.quotation_price ? (
                     <>
                      <div className="flex justify-between py-4 border-b border-slate-50">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Quotation</span>
                        <span className="text-sm font-bold text-slate-900">{formatPrice(order.quotation_price)}</span>
                      </div>
                      <div className="flex justify-between py-4 border-b border-slate-50">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Global Logistics</span>
                        <span className="text-sm font-bold text-slate-900">{formatPrice(order.shipping_fee || 0)}</span>
                      </div>
                      <div className="flex justify-between py-8">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Total Sourcing Cost</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-[#FF5A00] block tracking-tighter">{formatPrice((order.quotation_price + (order.shipping_fee || 0)))}</span>
                          <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Secure via Paystack</span>
                        </div>
                      </div>
                      {(order.status === 'Quoted' || order.status === 'Awaiting Payment') ? (
                        <button className="w-full py-4 bg-[#FF5A00] text-white font-bold rounded-full hover:bg-[#E65100] shadow-lg shadow-[#FF5A00]/20 transition-all uppercase tracking-[0.2em] text-[10px]">
                          Complete Payment
                        </button>
                      ) : (
                        <div className="py-3 px-5 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Accounted & Paid</span>
                        </div>
                      )}
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Loader2 className="h-10 w-10 text-slate-100 mb-6" />
                        <p className="text-[11px] font-bold text-slate-400 max-w-[220px] leading-relaxed uppercase tracking-widest">Our agents are finalizing your procurement quote. You'll be notified shortly.</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : searchInitiated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-[40px] border border-slate-200 shadow-soft"
          >
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Record Not Found</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium leading-relaxed">Please ensure your Order ID is correct or contact our procurement team for assistance.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
