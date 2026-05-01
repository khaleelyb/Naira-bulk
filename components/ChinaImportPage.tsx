import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabase_client';
import { compressImage } from '../utils/imageUtils';

const CHINA_CATEGORIES = [
  'Electronics & Gadgets',
  'Mobile Phones & Accessories',
  'Clothing & Fashion',
  'Shoes & Footwear',
  'Bags & Luggage',
  'Watches & Jewelry',
  'Home & Kitchen',
  'Furniture & Decor',
  'Beauty & Skincare',
  'Hair & Wigs',
  'Children & Baby Items',
  'Sports & Fitness',
  'Tools & Hardware',
  'Car Accessories',
  'Industrial Equipment',
  'Office Supplies',
  'Toys & Games',
  'Other',
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; desc: string }> = {
  pending:    { label: 'Request Received',    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',   icon: '📥', desc: 'Your request has been submitted and is awaiting review.' },
  reviewing:  { label: 'Under Review',        color: 'text-blue-600 bg-blue-50 border-blue-200',         icon: '🔍', desc: 'Our team is reviewing your request and sourcing options.' },
  quoted:     { label: 'Quote Ready',         color: 'text-purple-600 bg-purple-50 border-purple-200',   icon: '💰', desc: 'We have a price quote ready for your approval.' },
  confirmed:  { label: 'Order Confirmed',     color: 'text-orange-600 bg-orange-50 border-orange-200',   icon: '✅', desc: 'Payment confirmed. We are now sourcing your item from China.' },
  sourcing:   { label: 'Sourcing in China',   color: 'text-indigo-600 bg-indigo-50 border-indigo-200',   icon: '🇨🇳', desc: 'Your item is being purchased and prepared in China.' },
  shipped:    { label: 'Shipped to Nigeria',  color: 'text-cyan-600 bg-cyan-50 border-cyan-200',         icon: '✈️', desc: 'Your order is on its way to Nigeria!' },
  delivered:  { label: 'Delivered',           color: 'text-green-600 bg-green-50 border-green-200',      icon: '🎉', desc: 'Your order has been delivered successfully!' },
  cancelled:  { label: 'Cancelled',           color: 'text-red-500 bg-red-50 border-red-200',            icon: '❌', desc: 'This request was cancelled.' },
};

const STEPS = ['pending', 'reviewing', 'quoted', 'confirmed', 'sourcing', 'shipped', 'delivered'];

interface ChinaImportPageProps {
  currentUser: User | null;
  onLoginClick: () => void;
  onBack: () => void;
}

export const ChinaImportPage: React.FC<ChinaImportPageProps> = ({ currentUser, onLoginClick, onBack }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'my-orders'>('new');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);

  // Form state
  const [form, setForm] = useState({
    productUrl: '',
    productDescription: '',
    category: '',
    quantity: 1,
    budgetMin: '',
    budgetMax: '',
    buyerName: currentUser?.name ?? '',
    buyerPhone: currentUser?.phone ?? '',
    buyerEmail: currentUser?.email ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.buyerName.trim()) e.buyerName = 'Your name is required.';
    if (!form.buyerPhone.trim() || form.buyerPhone.length < 7) e.buyerPhone = 'Valid phone required.';
    if (!form.productDescription.trim() || form.productDescription.length < 20)
      e.productDescription = 'Please describe the product in at least 20 characters.';
    if (!form.category) e.category = 'Please select a category.';
    if (form.quantity < 1) e.quantity = 'Quantity must be at least 1.';
    return e;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageProcessing(true);
    try {
      const compressed = await compressImage(file, 600, 0.7);
      setImagePreview(compressed);
    } catch { /* ignore */ }
    setImageProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!currentUser) { onLoginClick(); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('import_requests').insert({
        buyer_id: currentUser.id,
        buyer_name: form.buyerName.trim(),
        buyer_phone: form.buyerPhone.trim(),
        buyer_email: form.buyerEmail.trim() || null,
        product_url: form.productUrl.trim() || null,
        product_description: form.productDescription.trim(),
        category: form.category,
        quantity: form.quantity,
        budget_min: form.budgetMin ? Number(form.budgetMin) : null,
        budget_max: form.budgetMax ? Number(form.budgetMax) : null,
        reference_image: imagePreview || null,
        status: 'pending',
      });
      if (error) throw error;
      setStep('success');
    } catch (err) {
      console.error(err);
      alert('Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadMyOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('import_requests')
        .select('*')
        .eq('buyer_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (!error && data) setMyRequests(data);
    } catch (e) { console.error(e); }
    setLoadingOrders(false);
  };

  React.useEffect(() => {
    if (activeTab === 'my-orders' && currentUser) loadMyOrders();
  }, [activeTab, currentUser]);

  const set = (k: string, v: any) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const inputCls = (k: string) =>
    `w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all ${errors[k] ? 'border-red-300 bg-red-50/50' : 'border-gray-200 dark:border-gray-700'}`;

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted! 🎉</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">
            Your import request from China has been received. Our team will review it and get back to you within <strong>24–48 hours</strong> with a price quote.
          </p>
          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-2xl p-4 my-5 text-left space-y-2">
            <p className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">What happens next?</p>
            {[
              '📋 We review your request',
              '💰 We send you a price quote',
              '✅ You confirm & pay',
              '🇨🇳 We source & ship from China',
              '🚚 Delivered to your door in Nigeria',
            ].map(s => (
              <p key={s} className="text-xs text-gray-600 dark:text-gray-400">{s}</p>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setStep('form'); setForm(f => ({ ...f, productUrl: '', productDescription: '', category: '', quantity: 1, budgetMin: '', budgetMax: '' })); setImagePreview(null); }}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              New Request
            </button>
            <button
              onClick={() => { setActiveTab('my-orders'); setStep('form'); }}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
            >
              Track Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 text-sm font-medium transition-colors">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <span className="text-lg">🇨🇳</span>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Import from China</h1>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">🇨🇳</div>
            <div>
              <h2 className="text-xl font-bold">Order Anything from China</h2>
              <p className="text-red-100 text-sm">Alibaba · 1688 · Taobao · AliExpress · DHGate</p>
            </div>
          </div>
          <p className="text-red-100 text-sm leading-relaxed">
            Found a product on any Chinese website? Send us the link or describe it — we'll source it, ship it to Nigeria, and deliver it to your door.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {['No Forwarding Hassle', 'Customs Handled', 'Door Delivery', 'Price Guarantee'].map(f => (
              <span key={f} className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
          <button onClick={() => setActiveTab('new')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'new' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
            📦 New Request
          </button>
          <button onClick={() => { setActiveTab('my-orders'); if (!currentUser) onLoginClick(); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'my-orders' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
            📋 My Orders
          </button>
        </div>

        {/* NEW REQUEST FORM */}
        {activeTab === 'new' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product URL */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                Product Info
              </h3>

              <div className="space-y-4">
                {/* URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Product URL <span className="font-normal text-gray-400">(optional but recommended)</span>
                  </label>
                  <input
                    type="url"
                    value={form.productUrl}
                    onChange={e => set('productUrl', e.target.value)}
                    placeholder="https://www.alibaba.com/product/..."
                    className={inputCls('productUrl')}
                  />
                  <p className="mt-1 text-xs text-gray-400">Paste a link from Alibaba, 1688, Taobao, AliExpress, DHGate, etc.</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Product Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.productDescription}
                    onChange={e => set('productDescription', e.target.value)}
                    rows={4}
                    placeholder="Describe the product in detail: color, size, material, specifications, any variations you want..."
                    className={inputCls('productDescription') + ' resize-none'}
                  />
                  {errors.productDescription && <p className="mt-1 text-xs text-red-500">{errors.productDescription}</p>}
                </div>

                {/* Reference Image */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Reference Image <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  {imagePreview ? (
                    <div className="relative w-32 h-32">
                      <img src={imagePreview} alt="Reference" className="w-full h-full object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
                      <button type="button" onClick={() => setImagePreview(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors">×</button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-300 dark:hover:border-red-700 cursor-pointer transition-colors group">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                        {imageProcessing
                          ? <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full" />
                          : <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload reference photo</p>
                        <p className="text-xs text-gray-400">Screenshot from website or similar product</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Category + Quantity + Budget */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                Order Details
              </h3>
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls('category')}>
                    <option value="">Select a category...</option>
                    {CHINA_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Quantity <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => set('quantity', Math.max(1, form.quantity - 1))}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">−</button>
                    <input type="number" value={form.quantity} min={1}
                      onChange={e => set('quantity', Math.max(1, Number(e.target.value)))}
                      className="w-20 text-center px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400" />
                    <button type="button" onClick={() => set('quantity', form.quantity + 1)}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">+</button>
                    <span className="text-xs text-gray-400">units</span>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Budget Range (₦) <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="number" value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)}
                      placeholder="Min" className={inputCls('budgetMin') + ' flex-1'} />
                    <span className="text-gray-400 font-medium">–</span>
                    <input type="number" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)}
                      placeholder="Max" className={inputCls('budgetMax') + ' flex-1'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center text-xs font-bold">3</span>
                Your Contact Info
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'buyerName', label: 'Full Name', type: 'text', ph: 'Aminu Musa', req: true },
                  { key: 'buyerPhone', label: 'Phone / WhatsApp', type: 'tel', ph: '+234 800 000 0000', req: true },
                  { key: 'buyerEmail', label: 'Email', type: 'email', ph: 'you@example.com', req: false },
                ].map(({ key, label, type, ph, req }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      {label} {req && <span className="text-red-500">*</span>}
                    </label>
                    <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                      placeholder={ph} className={inputCls(key)} />
                    {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">📌 Important</p>
              <p className="text-xs text-amber-700 dark:text-amber-600 leading-relaxed">
                After reviewing your request, we'll send you a total price (product + shipping + customs + our fee) via WhatsApp. You only pay after you approve the quote.
              </p>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-red-200 dark:shadow-red-900/30 text-base">
              {submitting
                ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Submitting…</>
                : <><span>🇨🇳</span> Submit Import Request</>
              }
            </button>
          </form>
        )}

        {/* MY ORDERS TAB */}
        {activeTab === 'my-orders' && (
          <>
            {!currentUser ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Log in to see your orders</h3>
                <button onClick={onLoginClick}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">
                  Log In
                </button>
              </div>
            ) : loadingOrders ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-4xl mb-3">📭</div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200">No import requests yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submit your first request above!</p>
                <button onClick={() => setActiveTab('new')}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                  + New Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map(req => {
                  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                  const stepIdx = STEPS.indexOf(req.status);
                  return (
                    <div key={req.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      {/* Status bar */}
                      <div className={`px-5 py-3 border-b flex items-center gap-3 ${cfg.color}`}>
                        <span className="text-lg">{cfg.icon}</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{cfg.label}</p>
                          <p className="text-xs opacity-80">{cfg.desc}</p>
                        </div>
                        <span className="text-xs font-mono opacity-60">#{req.id.slice(0, 8)}</span>
                      </div>

                      <div className="p-5">
                        {/* Progress */}
                        {req.status !== 'cancelled' && (
                          <div className="flex items-center gap-1 mb-4">
                            {STEPS.map((s, i) => (
                              <React.Fragment key={s}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all flex-shrink-0 ${
                                  i < stepIdx ? 'bg-green-500 text-white' :
                                  i === stepIdx ? 'bg-red-500 text-white ring-2 ring-red-200 dark:ring-red-900/50' :
                                  'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                }`}>
                                  {i < stepIdx ? '✓' : i + 1}
                                </div>
                                {i < STEPS.length - 1 && (
                                  <div className={`flex-1 h-0.5 ${i < stepIdx ? 'bg-green-400' : 'bg-gray-100 dark:bg-gray-800'}`} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{req.product_description}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">{req.category}</span>
                          <span className="text-xs text-gray-400">Qty: {req.quantity}</span>
                          <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>

                        {req.product_url && (
                          <a href={req.product_url} target="_blank" rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 font-medium">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                            View Product Link
                          </a>
                        )}

                        {req.admin_note && (
                          <div className="mt-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-3">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-0.5">Message from team:</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">{req.admin_note}</p>
                          </div>
                        )}

                        {req.quoted_price && (
                          <div className="mt-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-xl p-3">
                            <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">💰 Price Quote</p>
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">₦{Number(req.quoted_price).toLocaleString()}</p>
                            {req.shipping_fee && <p className="text-xs text-green-600 dark:text-green-500">+ ₦{Number(req.shipping_fee).toLocaleString()} shipping</p>}
                            {req.estimated_delivery && <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Est. delivery: {req.estimated_delivery}</p>}
                          </div>
                        )}

                        {req.tracking_number && (
                          <div className="mt-3 bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800/30 rounded-xl p-3">
                            <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 mb-0.5">✈️ Tracking Number</p>
                            <p className="text-sm font-mono font-bold text-cyan-700 dark:text-cyan-400">{req.tracking_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
