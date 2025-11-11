
export enum AppView {
  HOME,
  FORM,
  CONFIRMATION,
  ADMIN,
  LOGIN,
}

export interface OrderData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  store: 'Temu' | 'AliExpress';
  screenshot: File;
  notes?: string;
}

export interface FullOrderData extends OrderData {
  orderId: string;
  paymentProof?: File;
  isProcessed?: boolean;
}

// Fix: Add missing CartAnalysisResult interface
export interface CartAnalysisResult {
  totalPrice: string;
  items: string[];
}
