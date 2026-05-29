
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

// Number of products to load per batch
const BATCH_SIZE = 8;

interface ProductGridProps {
  products: Product[];
  onMessageSeller: (product: Product) => void;
  savedProductIds: Set<string>;
  onToggleSave: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  children?: (props: { product: Product }) => React.ReactNode;
  savedDisplayCount?: number;
  onDisplayCountChange?: (count: number) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, onMessageSeller, savedProductIds, onToggleSave, onSelectProduct, children,
  savedDisplayCount, onDisplayCountChange,
}) => {
  const [displayCount, setDisplayCount] = useState(savedDisplayCount ?? BATCH_SIZE);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only reset if it's a genuinely different product list (e.g. new search)
    // Don't reset if we have a savedDisplayCount to restore
    if (!savedDisplayCount) {
      setDisplayCount(BATCH_SIZE);
    }
  }, [products.length]);

  const updateDisplayCount = (count: number) => {
    setDisplayCount(count);
    onDisplayCountChange?.(count);
  };

  const displayedProducts = products.slice(0, displayCount);
  const hasMore = displayCount < products.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          updateDisplayCount(displayCount + BATCH_SIZE);
        }
      },
      { rootMargin: '400px' }
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => { if (currentLoader) observer.unobserve(currentLoader); };
  }, [hasMore, displayCount]);
  // ... rest of render stays the same

  return (
    <section className="pb-12">
      <div className="container mx-auto px-4">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map(product => (
                <div key={product.id}>
                  <ProductCard 
                    product={product} 
                    onMessageSeller={onMessageSeller}
                    isSaved={savedProductIds.has(product.id)}
                    onToggleSave={() => onToggleSave(product.id)}
                    onSelectProduct={onSelectProduct}
                  />
                  {/* For rendering additional controls like Edit/Delete */}
                  {children && children({ product })}
                </div>
              ))}
            </div>
            <div ref={loaderRef} className="h-20 flex justify-center items-center">
              {hasMore && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" aria-label="Loading more products"></div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>
    </section>
  );
};
