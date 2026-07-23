export const CATEGORIES = [
  'Mobile Phones & Tablets',
  'Computers',
  'Women clothes',
  'Men clothes',
  'Men shoes',
  'Women shoes',
  'Watches and jewelries',
  'Cars',
  'Herbals and supplements',
  'Accesories and chargers',
  'Games and Toys',
  'Body care, soaps and perfumes',
  'Electronics',
  'vehicle parts and accesories',
  'Books',
  'Gym equipments',
  'Beauty & Personal Care',
  'Health & Medicine',
  'Vehicles',
  'Home, Furniture & Appliances',
  'Babies & Kids',
  'Animals & Pets',
];

// Only these categories support Add to Cart
export const CART_CATEGORIES = new Set([
  'Herbals and supplements',
  'Food stuffs',
  'Beauty & Personal Care',
  'Health & Medicine',
  'Body care, soaps and perfumes',
  'Food, Agriculture & Farming',
]);

// Size options for clothing and shoe categories
export const SIZE_CATEGORIES: Record<string, string[]> = {
  'Men clothes':  ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  'Women clothes':['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  'Men shoes':    ['39', '40', '41', '42', '43', '44', '45', '46'],
  'Women shoes':  ['36', '37', '38', '39', '40', '41', '42'],
};

// Helper to check if a category can be added to cart
export const isCartableCategory = (category: string) =>
  CART_CATEGORIES.has(category) || category in SIZE_CATEGORIES;
