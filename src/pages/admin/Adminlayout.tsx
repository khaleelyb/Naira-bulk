import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import {
  Store, Tag, Megaphone, Star, ToggleLeft, ToggleRight,
  Plus, Trash2, Save, Edit3, X, Loader2, Globe, Package,
  TrendingUp, AlertCircle, CheckCircle2, Layout, Palette,
  ArrowUpDown, Eye, EyeOff, RefreshCw, Zap, Search
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '📱', Fashion: '👕', 'Home & Kitchen': '🍳',
  Beauty: '💄', Sports: '🏃', Industrial: '⚙️', Automobile: '🚗', Toys: '🧸', Other: '📦'
};

interface MarketplaceSettings {
  announcement: string;
  announcementActive: boolean;
  featuredCategories: string[];
  heroTitle: string;
  heroSubtitle: string;
  whatsappNumber: string;
  freeShippingThreshold: number;
  maintenanceMode: boolean;
}

interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  images: string[];
  price: number;
  discount_price?: number;
}

const DEFAULT_SETTINGS: MarketplaceSettings = {
  announcement: 'DIRECT IMPORT FROM CHINA · FREIGHT SHIPPING · WAREHOUSING',
  announcementActive: true,
  featuredCategories: ['Electronics', 'Fashion', 'Home & Kitchen'],
  heroTitle: 'Global Sourcing Refined.',
  heroSubtitle: 'We eliminate the complexity of cross-border procurement.',
  whatsappNumber: '2348123456789',
  freeShippingThreshold: 50000,
  maintenanceMode: false,
};

const TABS = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'featured', label: 'Featured Products', icon: Star },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
];

export function AdminProducts() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<MarketplaceSettings>({ ...DEFAULT_SETTINGS });
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [stats, setStats] = useState({ totalProducts: 0, activeCategories: 0, avgPrice: 0 });
  const [categoryOrder] = useState(Object.keys(CATEGORY_ICONS));
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, []);

  const loadProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, category, images, price, discount_price')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoadingProducts(false);
  };

  const loadStats = async () => {
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, category, price, discount_price');
    const list = allProducts || [];
    const categories = new Set(list.map((p: any) => p.category));
    const avgPrice = list.length
      ? list.reduce((s: number, p: any) => s + (p.discount_price || p.price), 0) / list.length
      : 0;
    setStats({
      totalProducts: list.length,
      activeCategories: categories.size,
      avgPrice: Math.round(avgPrice),
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Marketplace settings saved successfully');
    setSaving(false);
  };

  const toggleCategory = (cat: string) => {
    setHiddenCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleFeatured = (id: string) => {
    setFeaturedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Marketplace Control</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storefront configuration & curation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-3 px-5 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all cursor-pointer",
            settings.maintenanceMode
              ? "bg-amber-50 border-amber-200 text-amber-600"
              : "bg-green-50 border-green-200 text-green-600"
          )} onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}>
            {settings.maintenanceMode
              ? <><AlertCircle className="h-4 w-4" /> Maintenance</>
              : <><CheckCircle2 className="h-4 w-4" /> Live</>}
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-3 px-8 py-4 bg-[#FF5A00] text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-[#E65100] disabled:opacity-60 transition-all shadow-lg shadow-[#FF5A00]/20 active:scale-95"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-[#FF5A00]', bg: 'bg-[#FF5A00]/5' },
          { label: 'Active Categories', value: stats.activeCategories, icon: Tag, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Avg. Price', value: `₦${(stats.avgPrice / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-[24px] border border-slate-100 shadow-soft p-6 flex items-center gap-5">
            <div className={`h-12 w-12 rounded-2xl ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tighter">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-soft p-2 flex gap-2 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-6 py-3.5 rounded-[20px] text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">

        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="p-10 space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-slate-50 rounded-xl"><Store className="h-5 w-5 text-[#FF5A00]" /></div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Store Configuration</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Core marketplace settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hero Title</label>
                <input
                  value={settings.heroTitle}
                  onChange={e => setSettings(s => ({ ...s, heroTitle: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hero Subtitle</label>
                <textarea
                  value={settings.heroSubtitle}
                  onChange={e => setSettings(s => ({ ...s, heroSubtitle: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp Number</label>
                <input
                  value={settings.whatsappNumber}
                  onChange={e => setSettings(s => ({ ...s, whatsappNumber: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                  placeholder="234XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Free Shipping Threshold (₦)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={e => setSettings(s => ({ ...s, freeShippingThreshold: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { key: 'announcementActive', label: 'Announcement Bar', desc: 'Show top banner to all visitors' },
                  { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable the storefront' },
                ].map(toggle => (
                  <button
                    key={toggle.key}
                    type="button"
                    onClick={() => setSettings(s => ({ ...s, [toggle.key]: !s[toggle.key as keyof MarketplaceSettings] }))}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border transition-all text-left",
                      settings[toggle.key as keyof MarketplaceSettings]
                        ? "bg-[#FF5A00]/5 border-[#FF5A00]/20"
                        : "bg-slate-50 border-slate-100"
                    )}
                  >
                    <div>
                      <p className={cn("text-xs font-bold uppercase tracking-tight", settings[toggle.key as keyof MarketplaceSettings] ? "text-[#FF5A00]" : "text-slate-600")}>
                        {toggle.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{toggle.desc}</p>
                    </div>
                    {settings[toggle.key as keyof MarketplaceSettings]
                      ? <ToggleRight className="h-6 w-6 text-[#FF5A00] shrink-0" />
                      : <ToggleLeft className="h-6 w-6 text-slate-300 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="p-10 space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-slate-50 rounded-xl"><Tag className="h-5 w-5 text-blue-500" /></div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Category Visibility</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Toggle categories shown on homepage</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categoryOrder.map(cat => {
                const isHidden = hiddenCategories.includes(cat);
                return (
                  <div
                    key={cat}
                    className={cn(
                      "p-5 rounded-[24px] border transition-all cursor-pointer select-none group",
                      isHidden ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200 shadow-soft hover:border-[#FF5A00]"
                    )}
                    onClick={() => toggleCategory(cat)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{CATEGORY_ICONS[cat]}</span>
                      {isHidden ? <EyeOff className="h-4 w-4 text-slate-300" /> : <Eye className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", isHidden ? "text-slate-400" : "text-slate-700")}>{cat}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium">
                      {products.filter(p => p.category === cat).length} products
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                Hidden categories won't appear on the homepage carousel but products remain accessible via direct links and search.
              </p>
            </div>
          </div>
        )}

        {/* FEATURED PRODUCTS TAB */}
        {activeTab === 'featured' && (
          <div className="p-10 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 rounded-xl"><Star className="h-5 w-5 text-amber-500" /></div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Featured Products</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{featuredIds.length} selected · shown in homepage spotlight</p>
                </div>
              </div>
              <button onClick={loadProducts} className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
              <input
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search products to feature..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20"
              />
            </div>
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-[#FF5A00] animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">No products found.</p>
                ) : filteredProducts.map(product => {
                  const isFeatured = featuredIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleFeatured(product.id)}
                      className={cn(
                        "flex items-center gap-5 p-4 rounded-2xl border cursor-pointer transition-all",
                        isFeatured ? "bg-[#FF5A00]/5 border-[#FF5A00]/20 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
                        {product.images?.[0]
                          ? <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
                          : <div className="h-full flex items-center justify-center text-slate-200"><Package className="h-5 w-5" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-bold truncate", isFeatured ? "text-[#FF5A00]" : "text-slate-900")}>{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{product.category}</span>
                          <span className="text-[10px] font-bold text-slate-500">₦{((product.discount_price || product.price) / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                      <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", isFeatured ? "bg-[#FF5A00] border-[#FF5A00]" : "border-slate-200")}>
                        {isFeatured && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div className="p-10 space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-slate-50 rounded-xl"><Megaphone className="h-5 w-5 text-purple-500" /></div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Announcement Bar</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Manage the top banner across all pages</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Preview</label>
              <div className={cn(
                "py-2.5 px-4 text-center text-[11px] font-bold tracking-tight uppercase rounded-2xl transition-all",
                settings.announcementActive ? "bg-[#FF5A00] text-white" : "bg-slate-100 text-slate-400 line-through"
              )}>
                {settings.announcement || 'Enter announcement text below...'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Announcement Text</label>
              <textarea
                value={settings.announcement}
                onChange={e => setSettings(s => ({ ...s, announcement: e.target.value }))}
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all resize-none"
                placeholder="Enter the message to display in the announcement bar..."
              />
              <p className="text-[9px] text-slate-400 font-medium text-right">{settings.announcement.length} characters</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, announcementActive: !s.announcementActive }))}
              className={cn("flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all w-full text-left", settings.announcementActive ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100")}
            >
              {settings.announcementActive
                ? <ToggleRight className="h-6 w-6 text-green-500 shrink-0" />
                : <ToggleLeft className="h-6 w-6 text-slate-300 shrink-0" />}
              <div>
                <p className={cn("text-xs font-bold uppercase tracking-tight", settings.announcementActive ? "text-green-700" : "text-slate-500")}>
                  {settings.announcementActive ? 'Bar is Active' : 'Bar is Hidden'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Click to toggle visibility</p>
              </div>
            </button>
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Presets</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'DIRECT IMPORT FROM CHINA · FREIGHT SHIPPING · WAREHOUSING',
                  '🚀 EXPRESS AIR FREIGHT NOW AVAILABLE · ORDER BEFORE 5PM',
                  '🎉 FESTIVE SEASON DEALS · UP TO 30% OFF SELECT ITEMS',
                  '📦 FREE DELIVERY ON ORDERS ABOVE ₦50,000',
                ].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setSettings(s => ({ ...s, announcement: preset }))}
                    className={cn(
                      "p-3 rounded-xl border text-[10px] font-bold uppercase tracking-tight text-left transition-all",
                      settings.announcement === preset
                        ? "bg-[#FF5A00]/5 border-[#FF5A00]/30 text-[#FF5A00]"
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
