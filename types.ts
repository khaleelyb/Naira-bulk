export enum AppView {
  HOME,
  FORM,
  CONFIRMATION,
  ADMIN,
  LOGIN,
}

/**
 * Represents the data collected from the user in the order form.
 */
export interface OrderFormData {
  fullName: string;
  phone: string;

  email: string;
  address: string;
  store: 'Temu' | 'AliExpress';
  screenshot: File;
  notes?: string;
}

/**
 * Represents a complete order as stored in the persistent storage.
 * File objects are replaced with their public URLs.
 */
export interface Order {
  orderId: string;
  createdAt: number; // For sorting
  fullName: string;
  phone: string;
  email: string;
  address: string;
  store: 'Temu' | 'AliExpress';
  screenshot: string; // URL
  notes?: string;
  paymentProof?: string; // URL
  isProcessed?: boolean;
}

export interface CartAnalysisResult {
  totalPrice: string;
  items: string[];
}
