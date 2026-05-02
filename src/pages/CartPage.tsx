import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export function CartPage() {
  // Cart will be connected to real state management in a future update.
  // Currently shows empty state; items added from ProductDetailsPage will appear here.
  const items: any[] = [];

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
        <p className="text-sm font-medium text-slate-500">Review your selected items.</p>
      </div>
      {/* Cart items would render here */}
    </div>
  );
}
