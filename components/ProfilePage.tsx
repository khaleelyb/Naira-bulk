import React, { useState, useRef } from 'react';
import { Icon } from './Icon';
import { User, Product, Theme, Page } from '../types';
import { ProductGrid } from './ProductGrid';
import { HelpSupportPage } from './HelpSupportPage';
import { ChangePasswordModal } from './ChangePasswordModal';
import { PrivacyPage } from './PrivacyPage';
import { TermsPage } from './TermsPage';
import { CATEGORIES } from '../constants';

declare const XLSX: any;

const VerifiedBadge = () => (
  <svg className="w-6 h-6 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" title="Verified account">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.497-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12a4.49 4.49 0 0 1 1.549-3.397 4.491 4.491 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

interface ProfilePageProps {
  currentUser: User | null;
  onLogout: () => void;
  onUpdateProfilePicture: (newPictureUrl: string) => void;
  setActivePage: (page: Page) => void;
  userProducts: Product[];
  onMessageSeller: (product: Product) => void;
  savedProductIds: Set<string>;
  onToggleSave: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onSetPin: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  onImportProducts: (items: Omit<Product, 'id'>[]) => Promise<{ created: number; skipped: number }>;
}

const ThemeSelector: React.FC<{ theme: Theme; setTheme: (t: Theme) => void }> = ({ theme, setTheme }) => (
  <div className="px-4 py-3">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Appearance</p>
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
      {(['light', 'dark', 'system'] as Theme[]).map(t => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
            theme === t
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  </div>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser, onLogout, onUpdateProfilePicture, setActivePage,
  userProducts, onMessageSeller, savedProductIds, onToggleSave,
  onSelectProduct, onEditProduct, onDeleteProduct, theme, setTheme, onSetPin,
  onChangePassword, onImportProducts,
}) => {
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [listingCategoryFilter, setListingCategoryFilter] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Import state ────────────────────────────────────────────────────────────
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [bulkCategoryChoice, setBulkCategoryChoice] = useState<string>('__auto__');
  const [importPriceIncreasePct, setImportPriceIncreasePct] = useState<number>(0);
  const [importPriceIncreaseNaira, setImportPriceIncreaseNaira] = useState<number>(0);

  if (!currentUser) {
    return <div className="text-center py-20"><p>Please log in to see your profile.</p></div>;
  }

  if (showHelp) return <HelpSupportPage onClose={() => setShowHelp(false)} />;
  if (showPrivacy) return <PrivacyPage onClose={() => setShowPrivacy(false)} />;
  if (showTerms) return <TermsPage onClose={() => setShowTerms(false)} />;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isSeller = currentUser.isApprovedSeller && !currentUser.isAdmin;
  const isAdmin = currentUser.isAdmin;
  const listingCategories = Array.from(new Set([...CATEGORIES, ...userProducts.map(p => p.category)]));
  const filteredUserProducts = listingCategoryFilter === 'All'
    ? userProducts
    : userProducts.filter(p => p.category === listingCategoryFilter);

  // ── Helpers (mirrors admin logic exactly) ──────────────────────────────────
  const parsePrice = (value: unknown): number | null => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string') return null;
    const numeric = value.replace(/[^\d.]/g, '');
    const parsed = Number(numeric);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseDelimitedLine = (line: string, delimiter: ',' | '\t'): string[] => {
    const out: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i += 1; }
        else inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        out.push(current.trim()); current = '';
      } else { current += ch; }
    }
    out.push(current.trim());
    return out;
  };

  const parseMarketplaceRow = (line: string, delimiter: ',' | '\t') => {
    const cols = parseDelimitedLine(line, delimiter);
    if (delimiter === '\t') return cols;
    const priceIdx = cols.findIndex(c => /₦?\s*\d[\d,]*/.test(c));
    if (priceIdx > 2) {
      const title = cols.slice(2, priceIdx).join(',').trim();
      const tail = cols.slice(priceIdx + 1);
      const urls = tail.filter(c => /^https?:\/\//i.test(c.trim()));
      const image = urls[0] ?? '';
      const image2 = urls[1] ?? urls[0] ?? '';
      return [cols[0] ?? '', cols[1] ?? '', title, cols[priceIdx] ?? '', image, image2];
    }
    return cols;
  };

  const inferCategory = (rawCategory: unknown, title: string): string => {
    const explicit = String(rawCategory ?? '').trim();
    if (explicit && explicit.toLowerCase() !== 'general') return explicit;
    const bracketMatch = title.match(/\[([^\]]+)\]/);
    if (bracketMatch?.[1]) return bracketMatch[1].trim();
    const lower = title.toLowerCase();
    if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('slipper')) return 'Shoes';
    if (lower.includes('phone') || lower.includes('iphone') || lower.includes('android')) return 'Mobile Phones & Tablets';
    if (lower.includes('laptop') || lower.includes('computer')) return 'Computers';
    if (lower.includes('watch')) return 'Watches and jewelries';
    if (lower.includes('bag') || lower.includes('backpack')) return 'Home, Furniture & Appliances';
    if (lower.includes('dress') || lower.includes('shirt') || lower.includes('fashion')) return 'Women clothes';
    return 'General';
  };

  const normalizeMarketplaceImageUrl = (url: string): string => {
    let normalized = url
      .replace(/\/w\/150(\/|$)/i, '/w/900$1')
      .replace(/\/q\/50(\/|$)/i, '/q/90$1')
      .replace(/format\/avif/i, 'format/jpeg');
    normalized = normalized.replace(/\.\d{2,4}x\d{2,4}(\.(jpg|jpeg|png|webp))$/i, '.1000x1000$1');
    return normalized;
  };

  const pickBestImageUrl = (rawCandidates: Array<unknown>): string => {
    for (const raw of rawCandidates) {
      const txt = String(raw ?? '').trim();
      if (!txt) continue;
      const match = txt.match(/https?:\/\/[^\s"']+/i);
      if (match?.[0]) return normalizeMarketplaceImageUrl(match[0]);
    }
    return '';
  };

  // ── Import handler (mirrors admin exactly, including xlsx support) ──────────
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(null);
    setImporting(true);

    try {
      const isExcel = /\.(xlsx|xls)$/i.test(file.name);
      let rows: string[][] = [];

      if (isExcel) {
        // ── Excel path ──────────────────────────────────────────────
        if (typeof XLSX === 'undefined') {
          setImportMessage('Excel support not loaded. Please refresh and try again.');
          setImporting(false);
          return;
        }
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        rows = json.map((row: any[]) => row.map((cell: any) => String(cell ?? '').trim()));
      } else {
        // ── CSV / TSV path ──────────────────────────────────────────
        const rawText = await file.text();
        if (!rawText || rawText.length < 3) {
          setImportMessage('File is empty. Please upload CSV, TSV, or Excel.');
          setImporting(false);
          return;
        }
        const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const firstRow = lines[0] || '';
        const delimiter: ',' | '\t' = firstRow.includes('\t') ? '\t' : ',';
        rows = lines.map(l => parseMarketplaceRow(l, delimiter));
      }

      if (rows.length < 2) {
        setImportMessage('File has no data rows.');
        setImporting(false);
        return;
      }

      const firstRow = rows[0] || [];
      const delimiter: ',' | '\t' = ','; // already split into arrays at this point
      const headers = firstRow.map(h => h.toLowerCase().trim());
      const dataRows = rows.slice(1);

      const idx = {
        title:    headers.findIndex(h => ['title', 'name', 'product_title', 'data'].includes(h)),
        price:    headers.findIndex(h => ['price', 'amount', 'data6'].includes(h)),
        image:    headers.findIndex(h => ['image', 'image_url', 'thumbnail', 'image2'].includes(h)),
        category: headers.findIndex(h => ['category', 'cat', 'type', 'group'].includes(h)),
      };

      const mapped: Omit<Product, 'id'>[] = dataRows.map(cols => {
        const title = String(cols[idx.title] ?? cols[2] ?? '').trim();
        const image = pickBestImageUrl([cols[5], cols[idx.image] ?? '', cols[4]]);
        const price = parsePrice(cols[idx.price] ?? cols[3]);
        const adjustedPrice = price
          ? Math.max(0, Math.round((price * (1 + importPriceIncreasePct / 100)) + importPriceIncreaseNaira))
          : 0;
        const category = bulkCategoryChoice === '__auto__'
          ? inferCategory(cols[idx.category], title)
          : bulkCategoryChoice;

        return {
          title,
          price: adjustedPrice,
          category,
          images: image ? [image] : [],
          location: 'Nationwide',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          description: title,
          sellerId: currentUser.id,
        };
      }).filter(p => p.title && p.price > 0 && p.images.length > 0);

      if (!mapped.length) {
        setImportMessage('No valid rows found. Required columns: title/name/data, price/data6, and image/image2.');
        setImporting(false);
        return;
      }

      const result = await onImportProducts(mapped);
      setImportMessage(`Imported ${result.created} product${result.created === 1 ? '' : 's'}${result.skipped > 0 ? `, skipped ${result.skipped}` : ''}.`);
    } catch (err) {
      console.error('Import error:', err);
      setImportMessage('Failed to read file. Upload CSV, TSV, or Excel (.xlsx).');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Profile Hero */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <img
                src={newImagePreview || currentUser.profilePicture}
                alt={currentUser.name}
                className="w-24 h-24 rounded-2xl object-cover shadow-lg ring-4 ring-green-50 dark:ring-green-900/20"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center rounded-2xl transition-all duration-200"
              >
                <Icon name="pencil" className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            </div>

            {newImagePreview && (
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => { onUpdateProfilePicture(newImagePreview); setNewImagePreview(null); }}
                  className="bg-green-500 text-white text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-green-600 transition-colors"
                >
                  Save Photo
                </button>
                <button
                  onClick={() => setNewImagePreview(null)}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h1>
              {currentUser.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">@{currentUser.username}</p>

            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              {isAdmin && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  Admin
                </span>
              )}
              {isSeller && (
                <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                  </svg>
                  Approved Seller
                </span>
              )}
            </div>

            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{userProducts.length}</p>
                <p className="text-xs text-gray-400">Listings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Admin Panel Button */}
        {isAdmin && (
          <button
            onClick={() => setActivePage('admin')}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white rounded-2xl hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm">Admin Dashboard</p>
              <p className="text-xs text-gray-400">Manage users, products & analytics</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        {/* Seller Orders Button */}
        {isSeller && (
          <button
            onClick={() => setActivePage('seller-orders')}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl hover:from-green-700 hover:to-emerald-600 transition-all shadow-lg shadow-green-200 dark:shadow-green-900/30 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm">My Store Orders</p>
              <p className="text-xs text-green-100">View buyer details, confirm deliveries & more</p>
            </div>
            <svg className="w-4 h-4 text-green-200 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        {/* Settings Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800">

          <button
            onClick={() => setActivePage('edit-profile')}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <Icon name="pencil" className="w-4 h-4 text-blue-500" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">Edit Profile</span>
            <Icon name="chevron-right" className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </button>

          <button
            onClick={onSetPin}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentUser.pin ? 'Change PIN' : 'Set PIN'}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                {currentUser.pin ? 'Update your 4-digit login PIN' : 'Add a PIN to secure your account'}
              </p>
            </div>
            <Icon name="chevron-right" className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </button>

          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Password</span>
              <p className="text-xs text-gray-400 mt-0.5">Update your login password</p>
            </div>
            <Icon name="chevron-right" className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </button>

          <ThemeSelector theme={theme} setTheme={setTheme} />

          <button
            onClick={() => setShowHelp(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">Help & Support</span>
            <Icon name="chevron-right" className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </button>
        </div>

        {/* ── Bulk Import Products (approved sellers + admins only) ── */}
        {(isSeller || isAdmin) && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Import Products</p>
                <p className="text-xs text-gray-400">CSV, TSV or Excel · required columns: title/name, price, image</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Assign category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Assign category
                </label>
                <select
                  value={bulkCategoryChoice}
                  onChange={e => setBulkCategoryChoice(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="__auto__">Auto-detect from file</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Price markup % */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Price markup (%)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-wrap">
                    {[0, 10, 25, 50].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setImportPriceIncreasePct(pct)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border ${
                          importPriceIncreasePct === pct
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300'
                        }`}
                      >
                        {pct === 0 ? '0%' : `+${pct}%`}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number" min={0} max={200} step={1}
                    value={importPriceIncreasePct}
                    onChange={e => setImportPriceIncreasePct(Math.max(0, Math.round(Number(e.target.value))))}
                    className="w-16 px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-400"
                    placeholder="%"
                  />
                </div>
              </div>

              {/* Fixed naira markup */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Fixed markup (₦)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-wrap">
                    {[0, 500, 1000, 2000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setImportPriceIncreaseNaira(amt)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border ${
                          importPriceIncreaseNaira === amt
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300'
                        }`}
                      >
                        {amt === 0 ? '₦0' : `+₦${amt}`}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number" min={0} step={100}
                    value={importPriceIncreaseNaira}
                    onChange={e => setImportPriceIncreaseNaira(Math.max(0, Math.round(Number(e.target.value))))}
                    className="w-20 px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-400"
                    placeholder="₦"
                  />
                </div>
              </div>
            </div>

            {/* Upload button + feedback */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex-wrap">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors border ${
                importing
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40'
              }`}>
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                    Importing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Choose file to import
                  </>
                )}
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.xlsx,.xls"
                  className="hidden"
                  onChange={handleImportFile}
                  disabled={importing}
                />
              </label>

              {importMessage && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl border ${
                  importMessage.startsWith('Imported')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                }`}>
                  {importMessage.startsWith('Imported')
                    ? <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    : <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                  }
                  {importMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Log Out */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          Log Out
        </button>

        {/* Privacy & Terms */}
        <div className="flex items-center justify-center gap-4 pt-2 pb-4">
          <button onClick={() => setShowPrivacy(true)} className="text-xs text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors">
            Privacy Policy
          </button>
          <span className="text-gray-200 dark:text-gray-700">·</span>
          <button onClick={() => setShowTerms(true)} className="text-xs text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors">
            Terms of Service
          </button>
        </div>
      </div>

      {/* My Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Listings</h2>
          {isAdmin && (
            <select
              value={listingCategoryFilter}
              onChange={e => setListingCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="All">All Categories</option>
              {listingCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          )}
        </div>
        {filteredUserProducts.length > 0 ? (
          <ProductGrid
            products={filteredUserProducts}
            onMessageSeller={onMessageSeller}
            savedProductIds={savedProductIds}
            onToggleSave={onToggleSave}
            onSelectProduct={onSelectProduct}
          >
            {({ product }: { product: Product }) => (
              <div className="flex justify-end gap-3 px-3.5 pb-3 -mt-1">
                <button onClick={() => onEditProduct(product)} className="text-xs font-semibold text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1 rounded-lg transition-colors">Edit</button>
                <button onClick={() => onDeleteProduct(product.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1 rounded-lg transition-colors">Delete</button>
              </div>
            )}
          </ProductGrid>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200">No listings yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Post your first ad to get started.</p>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onChangePassword={onChangePassword}
      />
    </div>
  );
};
