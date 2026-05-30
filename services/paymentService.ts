import { supabase } from './supabase_client';

export interface InitiatePaymentParams {
  productId: string;
  productTitle: string;
  amount: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  sellerId?: string;
}

export interface InitiateCartPaymentParams {
  sellerId: string;
  items: { productId: string; productTitle: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
}

export interface PaymentInitResult {
  reference: string;
  orderId: string;
  amount: number;
  currency: string;
  customer: { name: string; email: string };
  productTitle: string;
}

export interface PaymentVerifyResult {
  status: string;
  transactionRef?: string;
  orderId?: string;
}

export const initiatePayment = async (
  params: InitiatePaymentParams
): Promise<PaymentInitResult | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('paystack-charge', {
      body: params,
    });
    if (error) { console.error('initiatePayment error:', error); return null; }
    return data as PaymentInitResult;
  } catch (err) { console.error('initiatePayment unexpected error:', err); return null; }
};

export const initiateCartPayment = async (
  params: InitiateCartPaymentParams
): Promise<PaymentInitResult | null> => {
  try {
    const productTitle = params.items.length === 1
      ? `${params.items[0].productTitle}${params.items[0].quantity > 1 ? ` ×${params.items[0].quantity}` : ''}`
      : `${params.items.length} items (cart order)`;

    const { data, error } = await supabase.functions.invoke('paystack-charge', {
      body: {
        productId: params.items[0].productId,
        productTitle,
        amount: params.totalAmount,
        buyerId: params.buyerId,
        buyerName: params.buyerName,
        buyerEmail: params.buyerEmail,
        buyerPhone: params.buyerPhone,
        buyerAddress: params.buyerAddress,
        sellerId: params.sellerId,
        cartItems: params.items,
      },
    });
    if (error) { console.error('initiateCartPayment error:', error); return null; }
    return data as PaymentInitResult;
  } catch (err) { console.error('initiateCartPayment unexpected error:', err); return null; }
};

export const verifyPayment = async (
  reference: string
): Promise<PaymentVerifyResult | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('paystack-verify', {
      body: { reference },
    });
    if (error) { console.error('verifyPayment error:', error); return null; }
    return data as PaymentVerifyResult;
  } catch (err) { console.error('verifyPayment unexpected error:', err); return null; }
};
