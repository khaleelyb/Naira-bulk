import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onMessageSeller: (product: Product) => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onSelectProduct: (product: Product) => void;
}

// Deterministic badge based on product id so it's stable
function getBadge(product: Product): { label: string; bg: string; color: string } | null {
  const hash = product.id.charCodeAt(0) + product.id.charCodeAt(product.id.length - 1);
  const badges = [
    { label: 'HOT', bg: '#e62e04', color: '#fff' },
    { label: 'SALE', bg: '#e62e04', color: '#fff' },
    { label: 'NEW', bg: '#1e88e5', color: '#fff' },
    { label: 'TOP', bg: '#FFD700', color: '#1a1a1a' },
    null, null, null, // more chance of no badge
  ];
  return badges[hash % badges.length];
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onMessageSeller,
  isSaved,
  onToggleSave,
  onSelectProduct,
}) => {
  const [imgError, setImgError] = useState(false);
  const thumbnail = !imgError && product.images?.length ? product.images[0] : null;
  const badge = getBadge(product);

  // Fake a small "original price" for visual richness when price is over 5k
  const showOrig = product.price > 5000;
  const origPrice = showOrig ? Math.round(product.price * 1.12) : null;
  const discount = showOrig ? '-11%' : null;

  return (
    <>
      <style>{cardCss}</style>
      <div className="nb-card" onClick={() => onSelectProduct(product)}>

        {/* ── IMAGE ── */}
        <div className="nb-card-img">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={product.title}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="nb-card-img-placeholder">
              {getCategoryEmoji(product.category)}
            </div>
          )}

          {/* Badge */}
          {badge && (
            <div
              className="nb-card-badge"
              style={{ background: badge.bg, color: badge.color }}
            >
              {badge.label}
            </div>
          )}

          {/* Wishlist */}
          <button
            className={`nb-card-wish${isSaved ? ' saved' : ''}`}
            onClick={e => { e.stopPropagation(); onToggleSave(); }}
            title={isSaved ? 'Remove from saved' : 'Save'}
          >
            {isSaved ? '♥' : '♡'}
          </button>

          {/* Image count pip */}
          {product.images?.length > 1 && (
            <div className="nb-card-img-count">
              🖼 {product.images.length}
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div className="nb-card-body">
          <div className="nb-card-title">{product.title}</div>

          <div className="nb-card-price-row">
            <span className="nb-card-price">₦{product.price.toLocaleString()}</span>
            {origPrice && (
              <span className="nb-card-orig">₦{origPrice.toLocaleString()}</span>
            )}
            {discount && (
              <span className="nb-card-disc">{discount}</span>
            )}
          </div>

          <div className="nb-card-meta">
            <span className="nb-card-cat">{product.category}</span>
            <span className="nb-card-stars">★★★★☆</span>
          </div>

          <div className="nb-card-ship">✓ {product.location} · {product.date}</div>
        </div>

        {/* ── FOOTER ── */}
        <div className="nb-card-footer" onClick={e => e.stopPropagation()}>
          <button
            className="nb-card-msg-btn"
            onClick={() => onMessageSeller(product)}
          >
            💬 Message
          </button>
          <button
            className="nb-card-cart-btn"
            onClick={() => onSelectProduct(product)}
          >
            🛒 View
          </button>
        </div>
      </div>
    </>
  );
};

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    'Mobile Phones & Tablets': '📱',
    'Computers': '💻',
    'Women clothes': '👗',
    'Men clothes': '👔',
    'Men shoes': '👞',
    'Women shoes': '👠',
    'Cars': '🚗',
    'Herbals and supplements': '🌿',
    'Houses': '🏠',
    'Accesories and chargers': '🔌',
    'Electronics': '⚡',
    'vehicle parts and accesories': '🔧',
    'Books': '📚',
    'Gym equipments': '🏋️',
    'Beauty & Personal Care': '💄',
    'Health & Medicine': '💊',
    'Vehicles': '🚙',
    'Property': '🏢',
    'Services': '🛠️',
    'Babies & Kids': '👶',
    'Animals & Pets': '🐾',
    'Jobs': '💼',
    'Body care, soaps and perfumes': '🧴',
    'Home, Furniture & Appliances': '🛋️',
    'Watches and jewelries': '⌚',
    'Grocery': '🛒',
    'Order Food': '🍔',
    'Games and Toys': '🎮',
  };
  return map[category] || '🏷️';
}

const cardCss = `
.nb-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: border-color .15s, box-shadow .15s, transform .15s;
  font-family: 'Barlow', 'DM Sans', sans-serif;
}
.nb-card:hover {
  border-color: #e62e04;
  box-shadow: 0 4px 20px rgba(230,46,4,0.13);
  transform: translateY(-2px);
}

/* Image */
.nb-card-img {
  aspect-ratio: 1;
  background: #f8f8f8;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nb-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .3s;
}
.nb-card:hover .nb-card-img img {
  transform: scale(1.05);
}
.nb-card-img-placeholder {
  font-size: 44px;
  color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Badge */
.nb-card-badge {
  position: absolute;
  top: 7px;
  left: 7px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 3px;
  letter-spacing: .3px;
  z-index: 2;
}

/* Wishlist */
.nb-card-wish {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 28px;
  height: 28px;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
  transition: background .15s, transform .1s;
  z-index: 2;
  color: #aaa;
  line-height: 1;
}
.nb-card-wish:hover { background: #fff; transform: scale(1.1); color: #e62e04; }
.nb-card-wish.saved { background: #e62e04; color: #fff; border-color: #e62e04; }

/* Image count */
.nb-card-img-count {
  position: absolute;
  bottom: 6px;
  left: 7px;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 10px;
  backdrop-filter: blur(2px);
}

/* Body */
.nb-card-body {
  padding: 9px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nb-card-title {
  font-size: 12px;
  color: #212121;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 33px;
  font-weight: 500;
}
.nb-card-price-row {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-top: 2px;
}
.nb-card-price {
  font-size: 16px;
  font-weight: 700;
  color: #e62e04;
  font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
}
.nb-card-orig {
  font-size: 11px;
  color: #bbb;
  text-decoration: line-through;
}
.nb-card-disc {
  font-size: 11px;
  color: #ff6000;
  font-weight: 600;
}
.nb-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.nb-card-cat {
  font-size: 10px;
  background: #fff5f3;
  color: #e62e04;
  padding: 1px 7px;
  border-radius: 10px;
  border: 1px solid #ffd4cc;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
}
.nb-card-stars {
  color: #d4a800;
  font-size: 10px;
  letter-spacing: -1px;
  flex-shrink: 0;
}
.nb-card-ship {
  font-size: 10px;
  color: #00a650;
  font-weight: 500;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer */
.nb-card-footer {
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  padding: 7px 10px;
  display: flex;
  gap: 6px;
}
.nb-card-msg-btn {
  flex: 1;
  background: #fff5f3;
  color: #e62e04;
  border: 1px solid #ffd4cc;
  padding: 5px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
}
.nb-card-msg-btn:hover {
  background: #e62e04;
  color: #fff;
  border-color: #e62e04;
}
.nb-card-cart-btn {
  flex: 1;
  background: #e62e04;
  color: #fff;
  border: none;
  padding: 5px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: inherit;
  transition: background .15s;
}
.nb-card-cart-btn:hover { background: #b52203; }
`;
