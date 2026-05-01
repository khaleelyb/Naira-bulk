import React, { useState, useEffect } from 'react';
import { User, Product } from '../types';
import { CategoryFilter } from './CategoryFilter';
import { CATEGORIES } from '../constants';

interface HomePageProps {
  products: Product[];
  users: User[];
  currentUser: User | null;
  savedProductIds: Set<string>;
  onToggleSave: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onMessageSeller: (product: Product) => void;
  onPostAdClick: () => void;
  onSelectCategory: (cat: string) => void;
  onSelectShop: (seller: User) => void;
  onChinaImportClick: () => void;
  isActiveBoosted: (u: User) => boolean;
  sessionCategoryPick: Map<string, string>;
}

export const HomePage: React.FC<HomePageProps> = ({
  products, users, savedProductIds,
  onToggleSave, onSelectProduct,
  onPostAdClick, onSelectCategory, onSelectShop,
  onChinaImportClick, isActiveBoosted, sessionCategoryPick,
}) => {
  const boostedUsers = users.filter(isActiveBoosted);
  
  // Flash Sale Timer Logic
  const [timeLeft, setTimeLeft] = useState({ h: '02', m: '47', s: '33' });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeLeft({
        h: String(23 - now.getHours()).padStart(2, '0'),
        m: String(59 - now.getMinutes()).padStart(2, '0'),
        s: String(59 - now.getSeconds()).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <CategoryFilter categories={CATEGORIES} selectedCategory={null} setSelectedCategory={onSelectCategory} />

      {/* ── HERO SECTION: CHINA IMPORT ── */}
      <div className="relative overflow-hidden bg-[#e62e04] text-white">
        {/* SVG Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/30">
              <span className="text-yellow-400">🇳🇬</span> New Import Service
            </div>
            <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-4">
              Nigeria's Biggest <br />
              <span className="text-yellow-400">Import Marketplace</span>
            </h1>
            <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
              Alibaba, 1688, Taobao, AliExpress — send us any link. We source, ship & deliver to your door in Nigeria.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <button 
                onClick={onChinaImportClick}
                className="bg-yellow-400 text-black font-black px-8 py-4 rounded-xl shadow-2xl hover:bg-yellow-300 transition-all active:scale-95"
              >
                🇨🇳 Order from China
              </button>
              <button 
                onClick={onChinaImportClick}
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all"
              >
                📋 Track My Orders
              </button>
            </div>
          </div>

          {/* Hero Stats Card */}
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 w-full lg:w-72">
            <span className="text-6xl">🚢</span>
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-400">2–3 Wks</div>
              <div className="text-xs uppercase tracking-widest text-red-100">Avg. Delivery</div>
            </div>
            <div className="w-full border-t border-white/10 pt-4 space-y-2">
              {['No Forwarding', 'Customs Handled', 'Door Delivery'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-yellow-400">✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🛡️', title: 'Buyer Protection', sub: '100% Guarantee' },
            { icon: '🚚', title: 'Nationwide Delivery', sub: 'To all 36 states' },
            { icon: '✔', title: 'Verified Sellers', sub: 'ID Checked' },
            { icon: '💳', title: 'Secure Payment', sub: 'Pay on Delivery' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xl">{item.icon}</div>
              <div>
                <div className="text-sm font-bold text-gray-900">{item.title}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FLASH SALE BAR ── */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl border-l-4 border-red-600 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded uppercase italic">⚡ Flash Sale</div>
          <div className="flex items-center gap-2">
            {[timeLeft.h, timeLeft.m, timeLeft.s].map((unit, i) => (
              <React.Fragment key={i}>
                <div className="bg-gray-900 text-white font-mono font-bold px-2 py-1 rounded text-lg">{unit}</div>
                {i < 2 && <span className="text-gray-400 font-bold">:</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="text-sm text-gray-600 font-medium">Save up to <span className="text-red-600 font-bold">60% off</span> on top electronics!</p>
          <button className="sm:ml-auto text-red-600 font-bold text-sm hover:underline">View All Deals →</button>
        </div>
      </div>

      {/* ── LOCAL MARKETPLACE BANNER ── */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Local Marketplace</h2>
            <p className="opacity-90">{products.length.toLocaleString()} items listed by verified Kano sellers</p>
          </div>
          <button 
            onClick={onPostAdClick}
            className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            + Post Free Ad
          </button>
        </div>
      </div>

      {/* ── FEATURED STORES (Horizontal Layout) ── */}
      {boostedUsers.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span className="text-amber-500">⭐</span> Featured Stores
            </h3>
            <button className="text-sm font-bold text-red-600 hover:underline">View All Stores</button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {boostedUsers.map(seller => {
              const sellerAllProducts = products.filter(p => p.sellerId === seller.id);
              const sellerCategories = [...new Set(sellerAllProducts.map(p => p.category))];
              
              if (!sessionCategoryPick.has(seller.id) || !sellerCategories.includes(sessionCategoryPick.get(seller.id)!)) {
                const randomCat = sellerCategories[Math.floor(Math.random() * sellerCategories.length)];
                sessionCategoryPick.set(seller.id, randomCat);
              }
              
              const pickedCategory = sessionCategoryPick.get(seller.id)!;
              const sellerProducts = sellerAllProducts.filter(p => p.category === pickedCategory).slice(0, 4);
              if (sellerProducts.length === 0) return null;

              return (
                <div key={seller.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-gray-50/80 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <img src={seller.profilePicture} alt={seller.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">{seller.name}</span>
                          {seller.isVerified && <span className="text-blue-500 text-xs">✔</span>}
                        </div>
                        <p className="text-xs text-gray-500">@{seller.username} • <span className="text-red-600 font-bold">{pickedCategory}</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { onSelectCategory(pickedCategory); onSelectShop(seller); }}
                      className="bg-red-600 text-white text-xs font-bold px-5 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Visit Store
                    </button>
                  </div>
                  
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sellerProducts.map(product => (
                      <div 
                        key={product.id} 
                        onClick={() => onSelectProduct(product)}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-2 relative">
                          <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-2 right-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); onToggleSave(product.id); }}
                               className={`p-1.5 rounded-full shadow-md ${savedProductIds.has(product.id) ? 'bg-red-600 text-white' : 'bg-white text-gray-400'}`}
                             >
                               {savedProductIds.has(product.id) ? '♥' : '♡'}
                             </button>
                          </div>
                        </div>
                        <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{product.title}</h4>
                        <p className="text-red-600 font-black text-sm">₦{product.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
