import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../lib/utils';

export function CartPage() {
  // Mock cart items for demo
  const items = [
    { id: '1', name: 'Industrial Sourcing Kit', price: 45000, quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200' },
  ];

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="inline-flex p-6 bg-neutral-100 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-neutral-300" />
        </div>
        <h1 className="text-4xl font-black mb-4 uppercase">Your Cart is Empty</h1>
        <p className="text-neutral-500 mb-10 font-medium tracking-tight">Explore our marketplace for professional-grade products from China.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-[#FF4700] text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#E13F00] transition-all">
          CONTINUE SHOPPING <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-sm font-medium text-slate-500">Review your selected items and prepare for sourcing.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-6">
          {items.map(item => (
            <div key={item.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-soft flex gap-8 hover:border-slate-200 transition-all group">
              <div className="h-32 w-32 rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alibaba Global</p>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                  </div>
                  <button className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-[#FF5A00] tracking-tight">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                     <button className="text-slate-400 hover:text-slate-900 font-bold px-2">-</button>
                     <span className="text-sm font-bold text-slate-900 min-w-4 text-center">{item.quantity}</span>
                     <button className="text-slate-400 hover:text-slate-900 font-bold px-2">+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-soft space-y-10">
             <h3 className="text-xl font-bold text-slate-900 tracking-tight">Financial Summary</h3>
             <div className="space-y-6 border-b border-slate-50 pb-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Net Value</span>
                  <span className="font-bold text-slate-900">{formatPrice(45000)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Import Fee</span>
                  <span className="font-medium text-slate-400">TBD at Checkout</span>
                </div>
             </div>
             <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 uppercase tracking-[0.2em] text-[10px]">Est. Total</span>
                <span className="text-3xl font-bold text-[#FF5A00] tracking-tighter">{formatPrice(45000)}</span>
             </div>
             <button className="w-full bg-[#FF5A00] text-white py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#E65100] shadow-lg shadow-[#FF5A00]/20 transition-all mt-4">
                Proceed to Sourcing
             </button>
             <div className="flex items-center justify-center gap-3 py-2">
                <div className="p-1 bg-green-50 rounded-full">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encrypted via Paystack</span>
             </div>
          </div>

          <div className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <ShoppingBag className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Your data is secured by industry standard SSL encryption during checkouts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
