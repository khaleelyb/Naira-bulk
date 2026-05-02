import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, MessageCircle, ChevronRight, Star, Loader2, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { formatPrice, getWhatsAppLink } from '../lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct]       = useState<Product | null>(null);
  const [loading, setLoading]       = useState(true);
  const [quantity, setQuantity]     = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#FF5A00] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <h3 className="text-xl font-bold text-slate-900">Product Not Found</h3>
        <p className="text-sm text-slate-400 font-medium">This product may have been removed.</p>
        <Link to="/search" className="mt-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-full text-sm hover:bg-black transition-all">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`, {
      action: { label: 'View Cart', onClick: () => navigate('/cart') },
    });
  };

  const images = product.images.length > 0 ? product.images : [FALLBACK_IMAGE];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/search" className="hover:text-slate-900 transition-colors">Marketplace</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/search?category=${product.category}`} className="hover:text-slate-900 transition-colors">{product.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900 font-black line-clamp-1 max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Images */}
        <div className="lg:col-span-7 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[4/5] bg-slate-50 rounded-[40px] overflow-hidden border border-slate-100 shadow-soft"
          >
            <img
              src={images[activeImage]}
              className="w-full h-full object-cover"
              alt={product.name}
            />
          </motion.div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square bg-slate-50 rounded-[20px] overflow-hidden border transition-all group ${
                    activeImage === i ? 'border-[#FF5A00]' : 'border-slate-100 hover:border-[#FF5A00]'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                {product.category}
              </span>
              {product.is_verified_seller && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#FF5A00] uppercase tracking-widest">
                  <ShieldCheck className="h-3.5 w-3.5" /> Manufacturer Verified
                </div>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-slate-900">4.9</span>
                <span className="text-slate-400 font-medium">(124 reviews)</span>
              </div>
              <div className="h-1 w-1 bg-slate-300 rounded-full" />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="p-8 rounded-[32px] border border-slate-100 bg-slate-50/50">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-4xl font-bold text-[#FF5A00] tracking-tighter">
                {formatPrice(product.discount_price ?? product.price)}
              </span>
              {product.discount_price && (
                <span className="text-lg text-slate-400 line-through font-medium">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              + {formatPrice(product.shipping_fee)} shipping
            </p>
          </div>

          {/* Add to cart */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white border border-slate-200 rounded-full h-[60px] px-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock_quantity || 99, q + 1))}
                  className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 bg-slate-900 text-white h-[60px] rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
            </div>

            <button
              onClick={() => window.open(getWhatsAppLink('2348123456789', `Hi, I'm interested in: ${product.name}`), '_blank')}
              className="w-full h-[60px] bg-slate-50 text-slate-900 font-bold rounded-full text-xs uppercase tracking-[0.2em] border border-slate-200 hover:border-[#FF5A00] hover:text-[#FF5A00] transition-all flex items-center justify-center gap-3 group"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366] group-hover:scale-110 transition-transform" />
              Enquire on WhatsApp
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Description</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{product.description}</p>
            </div>
          )}

          {/* Logistics badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 border border-slate-100 rounded-[28px] bg-white space-y-3">
              <div className="p-3 bg-slate-50 w-fit rounded-xl">
                <Truck className="h-5 w-5 text-[#FF5A00]" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-900 mb-1">Global Logistics</p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">7–14 business days average.</p>
              </div>
            </div>
            <div className="p-6 border border-slate-100 rounded-[28px] bg-white space-y-3">
              <div className="p-3 bg-slate-50 w-fit rounded-xl">
                <ShieldCheck className="h-5 w-5 text-[#FF5A00]" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-900 mb-1">Supply Assurance</p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Verified manufacturer inventory.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
