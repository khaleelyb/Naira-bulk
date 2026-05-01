export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string[];
  location: string;
  date: string;
  description: string;
  sellerId: string;
}

export interface ImportRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  productUrl?: string;
  productDescription: string;
  category: string;
  quantity: number;
  budgetMin?: number;
  budgetMax?: number;
  referenceImage?: string;
  status: 'pending' | 'reviewing' | 'quoted' | 'confirmed' | 'sourcing' | 'shipped' | 'delivered' | 'cancelled';
  adminNote?: string;
  quotedPrice?: number;
  shippingFee?: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface MessageThread {
  id: string;
  productId: string;
  productTitle: string;
  participants: [string, string];
  messages: Message[];
  lastMessageTimestamp: number;
}

export type Page = 'home' | 'saved' | 'messages' | 'profile' | 'edit-profile' | 'admin' | 'cart' | 'china-import';
