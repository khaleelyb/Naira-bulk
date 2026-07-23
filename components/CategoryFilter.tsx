import React, { useState } from 'react';

const CATEGORY_ICONS: Record<string, string> = {
  'Mobile Phones & Tablets': '📱',
  'Computers': '💻',
  'Women clothes': '👗',
  'Men clothes': '👔',
  'Men shoes': '👞',
  'Women shoes': '👠',
  'Cars': '🚗',
  'Herbals and supplements': '🌿',
  'Accesories and chargers': '🔌',
  'Food stuffs': '🛒',
  'Home, Furniture & Appliances': '🛋️',
  'Body care, soaps and perfumes': '🧴',
  'Electronics': '⚡',
  'vehicle parts and accesories': '🔧',
  'Books': '📚',
  'Gym equipments': '🏋️',
  'Beauty & Personal Care': '💄',
  'Health & Medicine': '💊',
  'Vehicles': '🚙',
  'Food, Agriculture & Farming': '🌾',
  'Babies & Kids': '👶',
  'Animals & Pets': '🐾',
  'Watches and jewelries': '💍',
  'Games and Toys': '🎮',
};

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string) => void;
}

const PREVIEW_COUNT = 30;

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, setSelectedCategory }) => {
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? categories : categories.slice(0, PREVIEW_COUNT);

  return (
    <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Browse Categories
          </h2>
          <span className="text-xs text-gray-400">{categories.length} categories</span>
        </div>

        {/* Grid layout — like Alibaba/AliExpress */}
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-1 sm:gap-2">
          {displayed.map(category => {
            const isActive = selectedCategory === category;
            const emoji = CATEGORY_ICONS[category] || '🏷️';
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex flex-col items-center justify-start gap-1.5 px-1 py-2.5 rounded-xl text-center transition-all duration-200 group ${
                  isActive
                    ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-400 dark:ring-green-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200 text-xl sm:text-2xl shadow-sm ${
                  isActive
                    ? 'bg-green-500 shadow-green-200 dark:shadow-green-900/50 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-green-100 dark:group-hover:bg-green-900/20 group-hover:scale-105'
                }`}>
                  {emoji}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-medium leading-tight line-clamp-2 w-full px-0.5 ${
                  isActive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}>
                  {category}
                </span>
              </button>
            );
          })}

          {/* Show more / less toggle cell */}
          {categories.length > PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="flex flex-col items-center justify-start gap-1.5 px-1 py-2.5 rounded-xl text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/20 group-hover:scale-105 transition-all duration-200">
                <svg
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-green-500 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium text-green-500 dark:text-green-400 leading-tight">
                {showAll ? 'Less' : `+${categories.length - PREVIEW_COUNT} more`}
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
