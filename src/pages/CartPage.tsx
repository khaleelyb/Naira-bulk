import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300';

export function CartPage() {
  const { items, itemCount, total, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="inline-flex p-6 bg-slate-50 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-slate-200" />
        </div>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Your Cart is Empty</h1>
        <p className="text-slate-500 mb-10 font-medium">Explore our marketplace for professional-grade products.</p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 bg-[#FF5A00] text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#E65100] transition-all"
        >
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ product, quantity }) => {
            const unitPrice = product.discount_price ?? product.price;
            return (
              <div key={product.id} className="bg-white rounded-[28px] border border-slate-100 shadow-soft p-6 flex items-center gap-6">
                <div className="h-24 w-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                  <img
                    src={product.images[0] ?? FALLBACK_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.id}`} className="font-bold text-slate-900 hover:text-[#FF5A00] transition-colors line-clamp-1">
                    {product.name}
                  </Link>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{product.category}</p>
                  <p className="text-lg font-bold text-slate-900 mt-2">{formatPrice(unitPrice)}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-full">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-base font-bold text-slate-900 shrink-0 w-28 text-right">
                  {formatPrice(unitPrice * quantity)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-soft p-8 space-y-6 sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Order Summary</h2>

            <div className="space-y-3 border-b border-slate-100 pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal ({itemCount} items)</span>
                <span className="font-bold text-slate-900">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Shipping</span>
                <span className="font-bold text-slate-500">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-xl font-bold text-[#FF5A00]">{formatPrice(total)}</span>
            </div>

            <button className="w-full py-4 bg-[#FF5A00] text-white font-bold rounded-full hover:bg-[#E65100] transition-all text-sm uppercase tracking-widest shadow-lg shadow-[#FF5A00]/20 flex items-center justify-center gap-3">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link
              to="/search"
              className="block text-center text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
