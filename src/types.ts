export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'seller' | 'admin';
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  category: string;
  images: string[];
  video_url?: string;
  variants?: any;
  specifications?: any;
  shipping_fee: number;
  is_verified_seller: boolean;
  created_at: string;
}

export interface ChinaOrder {
  id: string;
  user_id: string;
  product_url?: string;
  image_url?: string;
  description?: string;
  quantity: number;
  preferences?: any;
  shipping_method: string;
  destination: string;
  budget?: number;
  status: ChinaOrderStatus;
  quotation_price?: number;
  shipping_fee?: number;
  estimated_delivery?: string;
  tracking_number?: string;
  shipment_proof_url?: string;
  created_at: string;
  updated_at: string;
}

export type ChinaOrderStatus =
  | 'Pending'
  | 'Reviewing'
  | 'Quoted'
  | 'Awaiting Payment'
  | 'Paid'
  | 'Processing'
  | 'Purchased'
  | 'Shipped'
  | 'In Transit'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_reference?: string;
  created_at: string;
}
