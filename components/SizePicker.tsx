import React from 'react';
import { SIZE_CATEGORIES } from '../constants';

interface SizePickerProps {
  category: string;
  selectedSize: string | null;
  onChange: (size: string) => void;
  error?: boolean;
}

export const SizePicker: React.FC<SizePickerProps> = ({ category, selectedSize, onChange, error }) => {
  const sizes = SIZE_CATEGORIES[category];
  if (!sizes) return null;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Select Size
        </label>
        {error && (
          <span className="text-xs text-red-500 font-medium">Please select a size</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
              selectedSize === size
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : error
                  ? 'border-red-200 dark:border-red-800 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-green-300'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-green-300 hover:text-green-600'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};
