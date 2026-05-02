import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600';

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.discount_price ?? product.price;
  const discountPct = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-soft transition-all duration-300"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-slate-50">
        <img
          src={product.images[0] ?? FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {discountPct !== null && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-wide">
            {discountPct}% OFF
          </div>
        )}
        {product.is_verified_seller && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#FF5A00] p-1.5 rounded-full shadow-sm">
            <ShieldCheck className="h-4 w-4" />
          </div>
        )}
      </Link>

      <div className="p-4 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#FF5A00] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-slate-900">{formatPrice(displayPrice)}</span>
          {product.discount_price && (
            <span className="text-[11px] text-slate-400 line-through font-medium">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <Link
          to={`/product/${product.id}`}
          className="block w-full mt-2 py-2.5 text-center bg-slate-50 text-slate-600 font-bold text-[11px] rounded-lg border border-slate-100 hover:border-[#FF5A00] hover:text-[#FF5A00] hover:bg-white transition-all"
        >
          View Product
        </Link>
      </div>
    </motion.div>
  );
}
