import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { formatPrice, cn } from '../../lib/utils';
import { toast } from 'sonner';
import {
  Plus, Trash2, Edit3, Save, X, Upload, Image as ImageIcon,
  Loader2, Package, DollarSign, Tag, Hash, ShieldCheck, Eye
} from 'lucide-react';

const CATEGORIES = [
  'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty',
  'Sports', 'Industrial', 'Automobile', 'Toys', 'Other'
];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  discount_price: '',
  stock_quantity: '',
  category: 'Electronics',
  shipping_fee: '',
  is_verified_seller: false,
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setAdminUserId(data.user.id);
    });
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('products').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
      urls.push(publicUrl);
    }
    return urls;
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    if (!adminUserId) { toast.error('Not authenticated'); return; }

    setSaving(true);
    try {
      const newImageUrls = await uploadImages();
      const allImages = [...existingImages, ...newImageUrls];

      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        category: form.category,
        shipping_fee: parseFloat(form.shipping_fee) || 0,
        is_verified_seller: form.is_verified_seller,
        images: allImages,
        seller_id: adminUserId,
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Product updated!');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success('Product created!');
      }

      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || '',
      stock_quantity: product.stock_quantity.toString(),
      category: product.category,
      shipping_fee: product.shipping_fee.toString(),
      is_verified_seller: product.is_verified_seller,
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImagePreviews([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Product Catalogue</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage marketplace inventory</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-soft flex items-center gap-6">
            <div className="text-center px-3 border-r border-slate-50">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-xl font-bold text-slate-900">{products.length}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Stock</p>
              <p className="text-xl font-bold text-[#FF5A00]">{products.filter(p => p.stock_quantity > 0).length}</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-soft overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                {editingId ? 'Edit Product' : 'New Product'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {editingId ? `Editing ID: ${editingId.slice(0, 8)}` : 'Fill in the details below'}
              </p>
            </div>
            <button onClick={resetForm} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                  placeholder="e.g. Industrial LED Strip Light 5m"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all resize-none"
                  placeholder="Describe the product, materials, features..."
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price (₦) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                  placeholder="50000"
                />
              </div>

              {/* Discount Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount Price (₦)</label>
                <input
                  type="number"
                  value={form.discount_price}
                  onChange={e => setForm({ ...form, discount_price: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                  placeholder="Optional"
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock Quantity</label>
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={e => setForm({ ...form, stock_quantity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                  placeholder="100"
                />
              </div>

              {/* Shipping Fee */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shipping Fee (₦)</label>
                <input
                  type="number"
                  value={form.shipping_fee}
                  onChange={e => setForm({ ...form, shipping_fee: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all"
                  placeholder="0"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/20 transition-all appearance-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Verified Toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Seller</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_verified_seller: !form.is_verified_seller })}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-bold transition-all w-full",
                    form.is_verified_seller
                      ? "bg-[#FF5A00]/5 border-[#FF5A00]/20 text-[#FF5A00]"
                      : "bg-slate-50 border-slate-100 text-slate-400"
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {form.is_verified_seller ? 'Verified ✓' : 'Not Verified'}
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Images</label>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-2">
                  {existingImages.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} className="h-24 w-24 object-cover rounded-2xl border border-slate-100" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New previews */}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-2">
                  {imagePreviews.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} className="h-24 w-24 object-cover rounded-2xl border-2 border-[#FF5A00]/20" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-[24px] hover:border-[#FF5A00] hover:bg-[#FF5A00]/5 transition-all cursor-pointer p-8 flex flex-col items-center gap-3"
              >
                <div className="p-3 bg-slate-50 rounded-xl">
                  <Upload className="h-6 w-6 text-slate-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Click to upload images</span>
                <span className="text-[10px] text-slate-300">PNG, JPG, WEBP up to 10MB each</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-3 px-10 py-4 bg-[#FF5A00] text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-[#E65100] disabled:opacity-50 transition-all shadow-lg shadow-[#FF5A00]/20"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button
                onClick={resetForm}
                className="px-8 py-4 bg-slate-50 text-slate-600 font-bold rounded-full text-xs uppercase tracking-widest border border-slate-100 hover:border-slate-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Product</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Stock</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="h-8 w-8 text-[#FF5A00] animate-spin mx-auto mb-4" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading inventory...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="h-16 w-16 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-4">
                      <Package className="h-7 w-7 text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No products yet</p>
                    <p className="text-[11px] text-slate-300 mt-1">Click "Add Product" to create your first listing</p>
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-slate-200" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#FF5A00] transition-colors">{product.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 line-clamp-1 max-w-[200px]">{product.description || '—'}</p>
                          {product.is_verified_seller && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#FF5A00] uppercase tracking-widest">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">{formatPrice(product.discount_price || product.price)}</p>
                        {product.discount_price && (
                          <p className="text-[10px] font-medium text-slate-400 line-through">{formatPrice(product.price)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        product.stock_quantity > 10 ? "bg-green-50 text-green-600 border border-green-100" :
                        product.stock_quantity > 0 ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-red-50 text-red-500 border border-red-100"
                      )}>
                        {product.stock_quantity} units
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/product/${product.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:border-slate-300 hover:text-slate-700 transition-all shadow-soft"
                          title="View listing"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:border-[#FF5A00] hover:text-[#FF5A00] transition-all shadow-soft"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all shadow-soft disabled:opacity-50"
                        >
                          {deletingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
