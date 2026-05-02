import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Truck, BarChart3, Star, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Home & Kitchen', icon: '🍳' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Sports', icon: '🏃' },
  { name: 'Industrial', icon: '⚙️' },
  { name: 'Automobile', icon: '🚗' },
  { name: 'Toys', icon: '🧸' },
];

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(8);
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-24 pb-32">
      {/* Hero Section */}
      <section className="relative h-[600px] sm:h-[750px] flex items-center bg-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF5A00]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-100/50 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="inline-flex items-center gap-3 text-slate-400 text-[10px] font-bold px-4 py-2 bg-slate-50 border border-slate-100 rounded-full mb-10 uppercase tracking-[0.3em]">
              <span className="h-1.5 w-1.5 bg-[#FF5A00] rounded-full animate-pulse" />
              Direct Global Inventory Access
            </div>
            <h1 className="text-6xl sm:text-8xl font-bold text-slate-900 mb-8 leading-[0.95] tracking-tighter">
              Global Sourcing <br />
              <span className="text-[#FF5A00]">Refined.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              We eliminate the complexity of cross-border procurement. Direct factory connections, managed logistics, and verified quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button className="px-12 py-5 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-slate-900/10 active:scale-95">
                Explore Marketplace
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link to="/import" className="px-12 py-5 bg-white text-slate-900 font-bold rounded-full border border-slate-200 hover:border-slate-900 transition-all flex items-center justify-center gap-4 active:scale-95">
                Custom Procurement
                <Globe className="h-4 w-4 text-[#FF5A00]" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { icon: ShieldCheck, title: 'Verified Escrow', desc: 'Secure settlements with Paystack' },
          { icon: Truck, title: 'Express Logistics', desc: 'Door-to-door transit mastery' },
          { icon: BarChart3, title: 'Factory Rates', desc: 'Zero middlemen markup sourcing' },
          { icon: Zap, title: 'Rapid Sourcing', desc: 'Quotes delivered in 24 hours' },
        ].map((item, idx) => (
          <div key={idx} className="group p-2">
            <div className="space-y-6 text-center md:text-left">
              <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto md:mx-0 group-hover:border-[#FF5A00] transition-colors shadow-soft">
                <item.icon className="h-6 w-6 text-slate-400 group-hover:text-[#FF5A00] transition-colors" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <p className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-[0.4em]">Sector Mastery</p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Explore our Verticals</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
          {CATEGORIES.map((cat) => (
            <button key={cat.name} className="flex flex-col items-center gap-5 p-8 bg-white rounded-[40px] border border-slate-100 hover:border-[#FF5A00] hover:shadow-soft transition-all group">
              <span className="text-4xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">{cat.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Curation Spotlight</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected from the top global vendors</p>
          </div>
          <button className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-widest border border-slate-100 px-6 py-2.5 rounded-full hover:bg-slate-50 transition-all">View All Products</button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] bg-slate-50 border border-slate-100 animate-pulse rounded-[32px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product) => (
              // @ts-ignore
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Import CTA Card */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 rounded-[64px] p-12 sm:p-24 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/10">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-700">
             <Globe className="h-96 w-96" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-[0.4em] mb-8">Supply Chain Partner</p>
            <h2 className="text-5xl sm:text-6xl font-bold mb-8 tracking-tighter leading-[0.95]">Have a link from <br /> Alibaba or 1688?</h2>
            <p className="text-slate-400 text-lg mb-12 font-medium leading-relaxed">
              We handle the entire procurement cycle. Simply provide the source link or an image, and our team will manage sourcing, quality control, and doorstep delivery.
            </p>
            <Link to="/import" className="inline-flex items-center gap-3 bg-[#FF5A00] text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#E65100] transition-all shadow-xl shadow-[#FF5A00]/20">
              Launch Procurement Request
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
