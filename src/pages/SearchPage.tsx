import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports', 'Industrial', 'Automobile', 'Toys'];
const SORT_OPTIONS = [
  { label: 'Newest',        value: 'created_at:desc' },
  { label: 'Price: Low–High', value: 'price:asc' },
  { label: 'Price: High–Low', value: 'price:desc' },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam    = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('category') ?? '';
  const sortParam     = searchParams.get('sort') ?? 'created_at:desc';

  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [inputValue, setInputValue] = useState(queryParam);

  useEffect(() => {
    setLoading(true);
    const [column, order] = sortParam.split(':') as [string, 'asc' | 'desc'];

    let query = supabase.from('products').select('*');
    if (categoryParam) query = query.eq('category', categoryParam);
    if (queryParam)    query = query.ilike('name', `%${queryParam}%`);
    query = query.order(column as never, { ascending: order === 'asc' }).limit(48);

    query.then(({ data }) => {
      setProducts(data ?? []);
      setLoading(false);
    });
  }, [queryParam, categoryParam, sortParam]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', inputValue.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Marketplace</h1>
        <p className="text-sm text-slate-500 font-medium">
          {loading ? 'Searching…' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search products…"
              className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 shadow-soft"
            />
          </div>
          <button type="submit" className="h-12 px-6 bg-[#FF5A00] text-white font-bold rounded-2xl hover:bg-[#E65100] transition-all text-sm">
            Search
          </button>
        </form>

        {/* Sort */}
        <select
          value={sortParam}
          onChange={e => updateParam('sort', e.target.value)}
          className="h-12 bg-white border border-slate-200 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 shadow-soft"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParam('category', '')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            !categoryParam ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => updateParam('category', categoryParam === cat ? '' : cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              categoryParam === cat ? 'bg-[#FF5A00] text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-[#FF5A00] hover:text-[#FF5A00]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active filters */}
      {(queryParam || categoryParam) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active filters:</span>
          {queryParam && (
            <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold">
              "{queryParam}"
              <button onClick={() => { setInputValue(''); updateParam('q', ''); }}><X className="h-3 w-3" /></button>
            </span>
          )}
          {categoryParam && (
            <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold">
              {categoryParam}
              <button onClick={() => updateParam('category', '')}><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-50 animate-pulse rounded-[24px]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-8 w-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
          <p className="text-sm text-slate-400 font-medium">Try a different search or browse all categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
