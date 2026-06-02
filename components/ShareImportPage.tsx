import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../constants';

interface ImportedProduct {
  title?: string;
  price?: number | string;
  description?: string;
  images?: string[];
  image?: string;
  category?: string;
  url?: string; // source URL for reference
}

interface ShareImportPageProps {
  importedData: ImportedProduct | null;
  currentUser: { id: string; name: string } | null;
  onConfirmImport: (product: Omit<Product, 'id' | 'sellerId' | 'location' | 'date'>) => void;
  onLoginClick: () => void;
  onClose: () => void;
}

export const ShareImportPage: React.FC<ShareImportPageProps> = ({
  importedData,
  currentUser,
  onConfirmImport,
  onLoginClick,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!importedData) return;
    if (importedData.title) setTitle(importedData.title);
    if (importedData.price) setPrice(String(importedData.price).replace(/[^\d.]/g, ''));
    if (importedData.description) setDescription(importedData.description);
    if (importedData.category) {
      const matched = CATEGORIES.find(c =>
        c.toLowerCase().includes(importedData.category!.toLowerCase()) ||
        importedData.category!.toLowerCase().includes(c.toLowerCase())
      );
      if (matched) setCategory(matched);
    }
    const imgs = importedData.images?.length
      ? importedData.images
      : importedData.image
      ? [importedData.image]
      : [];
    setImages(imgs.slice(0, 3));
  }, [importedData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Please enter a title.'); return; }
    if (!price || isNaN(Number(price))) { setError('Please enter a valid price.'); return; }
    if (!images.length) { setError('At least one image is required.'); return; }
    onConfirmImport({ title, price: Number(price), description, category, images });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-gray-400 hover:text-green-500 text-sm font-medium transition-colors">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Cancel
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-amber-400 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Import Product</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Info banner */}
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Product imported from external app</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Review and adjust the details below before posting to NairaBulk.</p>
          </div>
        </div>

        {/* Login prompt */}
        {!currentUser && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">You need to be logged in to post a listing.</p>
            <button onClick={onLoginClick} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Log In / Register
            </button>
          </div>
        )}

        {/* Image preview */}
        {images.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex gap-3 p-4 overflow-x-auto">
              {images.map((img, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={img}
                    alt={`Product ${i + 1}`}
                    className="w-24 h-24 rounded-xl object-cover border border-gray-100 dark:border-gray-700"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <button
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {images.length === 0 && (
              <div className="px-4 pb-4">
                <p className="text-xs text-red-500">No valid images. Add one manually after importing.</p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        {currentUser && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setError(''); }}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Product title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price (₦)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => { setPrice(e.target.value); setError(''); }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  placeholder="Describe the product..."
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-green-200 dark:shadow-green-900/30 text-sm"
            >
              Post to NairaBulk
            </button>
          </form>
        )}

        {/* How to share section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">How to share products to NairaBulk</h3>
          <div className="space-y-3">
            {[
              {
                icon: '🔗',
                title: 'Share Link',
                desc: 'From any app, copy the share URL and append product data as a base64 JSON ?import= parameter to your NairaBulk domain.',
              },
              {
                icon: '📋',
                title: 'CSV / Bulk Import',
                desc: 'Use the bulk import tool on your Profile page to upload a CSV or TSV with title, price, and image columns.',
              },
              {
                icon: '📱',
                title: 'Web Share API',
                desc: 'Apps that support the Web Share API can share directly to NairaBulk if it\'s installed as a PWA on your device.',
              },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Generate share URL tool */}
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Generate a share URL</p>
            <GenerateShareUrl />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Mini tool to generate share URLs ─────────────────────────────────────────
const GenerateShareUrl: React.FC = () => {
  const [gTitle, setGTitle] = useState('');
  const [gPrice, setGPrice] = useState('');
  const [gImage, setGImage] = useState('');
  const [copied, setCopied] = useState(false);

  const generatedUrl = (() => {
    if (!gTitle) return '';
    try {
      const data: Record<string, unknown> = { title: gTitle };
      if (gPrice) data.price = Number(gPrice);
      if (gImage) data.images = [gImage];
      const encoded = btoa(JSON.stringify(data));
      return `${window.location.origin}/?import=${encoded}`;
    } catch { return ''; }
  })();

  const copy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={gTitle}
        onChange={e => setGTitle(e.target.value)}
        placeholder="Product title *"
        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-400"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={gPrice}
          onChange={e => setGPrice(e.target.value)}
          placeholder="Price (₦)"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
        <input
          type="url"
          value={gImage}
          onChange={e => setGImage(e.target.value)}
          placeholder="Image URL (optional)"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>
      {generatedUrl && (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={generatedUrl}
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400 font-mono truncate"
          />
          <button
            onClick={copy}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-500 hover:text-white'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
};
