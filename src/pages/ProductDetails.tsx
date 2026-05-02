import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, Clock, MessageCircle, ChevronRight, Globe, Star, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { formatPrice, getWhatsAppLink } from '../lib/utils';
import { toast } from 'sonner';

export function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#FF5A00]" /></div>;
  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
      <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <ChevronRight className="h-8 w-8 text-slate-200" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Resource Not Found</h3>
      <p className="text-sm text-slate-400 font-medium">This product may have been removed or the link is invalid.</p>
    </div>
  );

  const handleAddToCart = () => {
    toast.success('Successfully added to your sourcing cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">
        <span className="hover:text-slate-900 cursor-pointer transition-colors">Platform</span> 
        <ChevronRight className="h-3 w-3" />
        <span className="hover:text-slate-900 cursor-pointer transition-colors">Marketplace</span> 
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900 font-black">{product.category}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Images */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-[4/5] bg-slate-50 rounded-[40px] overflow-hidden border border-slate-100 shadow-soft"
          >
            <img 
              src={product.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000'} 
              className="w-full h-full object-cover" 
              alt={product.name}
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-6">
            {product.images.slice(1, 5).map((img, i) => (
              <div key={i} className="aspect-square bg-slate-50 rounded-[20px] overflow-hidden border border-slate-100 cursor-pointer hover:border-[#FF5A00] transition-all group">
                 <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Global Verified</span>
              {product.is_verified_seller && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#FF5A00] tracking-widest uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" /> Manufacturer Verified
                </div>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">{product.name}</h1>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                 <Star className="h-4 w-4 fill-current" /> 
                 <span className="text-slate-900">4.9</span>
                 <span className="text-slate-400 font-medium">(124 verified reviews)</span>
               </div>
               <div className="h-1 w-1 bg-slate-300 rounded-full" />
               <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{product.stock_quantity > 0 ? 'Active Inventory' : 'Request Backorder'}</span>
            </div>
          </div>

          <div className="p-8 rounded-[32px] border border-slate-100 bg-slate-50/50">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-4xl font-bold text-[#FF5A00] tracking-tighter">{formatPrice(product.discount_price || product.price)}</span>
              {product.discount_price && <span className="text-lg text-slate-400 line-through font-medium">{formatPrice(product.price)}</span>}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Includes direct factory markup + local compliance processing.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white border border-slate-200 rounded-full h-[60px] px-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="h-10 w-10 flex items-center justify-center font-bold text-slate-400 hover:text-slate-900 transition-colors"
                >-</button>
                <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="h-10 w-10 flex items-center justify-center font-bold text-slate-400 hover:text-slate-900 transition-colors"
                >+</button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-slate-900 text-white h-[60px] rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-4 shadow-xl shadow-slate-900/10"
              >
                <ShoppingCart className="h-4.5 w-4.5" /> Procure Item
              </button>
            </div>
            <button 
               onClick={() => window.open(getWhatsAppLink('2348123456789', `Hi, I'm interested in the ${product.name} (${product.category})`), '_blank')}
               className="w-full h-[60px] bg-slate-50 text-slate-900 font-bold rounded-full text-xs uppercase tracking-[0.2em] border border-slate-200 hover:border-[#FF5A00] hover:text-[#FF5A00] transition-all flex items-center justify-center gap-4 group"
            >
              <MessageCircle className="h-4.5 w-4.5 text-[#25D366] group-hover:scale-110 transition-transform" /> Professional Inquiry
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            <div className="p-6 border border-slate-100 rounded-[28px] bg-white space-y-3">
              <div className="p-3 bg-slate-50 w-fit rounded-xl">
                <Truck className="h-5 w-5 text-[#FF5A00]" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-900 mb-1">Global Logistics</p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Direct consolidation from China. 7-14 business days average.</p>
              </div>
            </div>
            <div className="p-6 border border-slate-100 rounded-[28px] bg-white space-y-3">
              <div className="p-3 bg-slate-50 w-fit rounded-xl">
                <ShieldCheck className="h-5 w-5 text-[#FF5A00]" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-900 mb-1">Supply Assurance</p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Verified manufacturer inventory status and quality certification.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
