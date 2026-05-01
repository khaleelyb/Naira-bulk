// This is the updated home section that replaces the hero strip in App.tsx renderPage()
// Replace the existing hero strip + Featured Stores section with this component

import React, { useRef } from 'react';
import { User, Product } from '../types';
import { CategoryFilter } from './CategoryFilter';
import { ProductGrid } from './ProductGrid';
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
  products, users, currentUser, savedProductIds,
  onToggleSave, onSelectProduct, onMessageSeller,
  onPostAdClick, onSelectCategory, onSelectShop,
  onChinaImportClick, isActiveBoosted, sessionCategoryPick,
}) => {
  const boostedUsers = users.filter(isActiveBoosted);

  return (
    <>
      <CategoryFilter categories={CATEGORIES} selectedCategory={null} setSelectedCategory={onSelectCategory} />

      {/* ── CHINA IMPORT HERO ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-orange-500">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">🇨🇳</span>
                <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">New</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                Order Direct from China
              </h2>
              <p className="text-red-100 mt-2 text-sm sm:text-base leading-relaxed max-w-xl">
                Alibaba, 1688, Taobao, AliExpress — send us any link or describe what you want. We source, ship & deliver to your door in Nigeria.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['✅ No Forwarding Needed', '🚢 Customs Handled', '🏠 Door Delivery', '💰 Best Prices'].map(f => (
                  <span key={f} className="bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">{f}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <button
                onClick={onChinaImportClick}
                className="flex items-center justify-center gap-2 bg-white text-red-700 font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-red-50 transition-all text-base sm:text-lg active:scale-95"
              >
                <span>🇨🇳</span>
                Order from China
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <button
                onClick={onChinaImportClick}
                className="flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/25 transition-all text-sm"
              >
                📋 Track My Orders
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
            {[
              { icon: '📦', value: '500+', label: 'Products sourced' },
              { icon: '🚢', value: '2–3 wks', label: 'Avg. delivery time' },
              { icon: '⭐', value: '4.9/5', label: 'Customer rating' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-white font-black text-lg leading-none">{s.value}</div>
                <div className="text-red-200 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOCAL MARKETPLACE STRIP ── */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Local Marketplace</h2>
            <p className="text-orange-100 mt-0.5 text-sm">{products.length.toLocaleString()} active listings from Kano sellers</p>
          </div>
          <button
            onClick={onPostAdClick}
            className="flex-shrink-0 bg-white text-orange-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-orange-50 transition-all"
          >
            + Post Free Ad
          </button>
        </div>
      </div>

      {/* ── FEATURED STORES ── */}
      {boostedUsers.length > 0 && (() => {
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clipRule="evenodd" />
                </svg>
                Featured
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Featured Stores</h3>
            </div>

            <div className="space-y-6 mb-8">
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
                  <div key={seller.id} className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-amber-200 dark:border-amber-800/50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={seller.profilePicture} alt={seller.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-300 dark:ring-amber-700" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5Z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{seller.name}</p>
                            {seller.isVerified && (
                              <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.497-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12a4.49 4.49 0 0 1 1.549-3.397 4.491 4.491 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">@{seller.username} · <span className="text-orange-500 font-semibold">{pickedCategory}</span></p>
                          {seller.bio && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{seller.bio}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => { onSelectCategory(pickedCategory); onSelectShop(seller); }}
                        className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        View Store
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {sellerProducts.map(product => {
                          const isSaved = savedProductIds.has(product.id);
                          return (
                            <div key={product.id} className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all duration-200">
                              <button onClick={() => onSelectProduct(product)} className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 w-full">
                                {product.images?.[0] ? (
                                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                                  </div>
                                )}
                                <button onClick={ev => { ev.stopPropagation(); onToggleSave(product.id); }}
                                  className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow transition-all ${isSaved ? 'bg-orange-500 text-white' : 'bg-white/90 text-gray-400 hover:text-orange-500'}`}>
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" strokeWidth={2} fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                  </svg>
                                </button>
                              </button>
                              <button onClick={() => onSelectProduct(product)} className="block p-2 text-left w-full">
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 leading-snug">{product.title}</p>
                                <p className="text-sm font-bold text-orange-500 mt-0.5">₦{product.price.toLocaleString()}</p>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 mb-6" />
          </div>
        );
      })()}
    </>
  );
};
