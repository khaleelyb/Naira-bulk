// services/paymentService.ts
import { supabase } from './supabase_client';
import { generateDeliveryOtp, storeDeliveryOtp } from './dbService';

export interface InitiatePaymentParams {
  productId: string;
  productTitle: string;
  amount: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
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
  deliveryOtp?: string;
}

export const initiatePayment = async (
  params: InitiatePaymentParams
): Promise<PaymentInitResult | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('korapay-charge', {
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

    const { data, error } = await supabase.functions.invoke('korapay-charge', {
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

/**
 * Verifies a KoraPay payment and — if successful — generates + stores a 6-digit
 * delivery OTP on the order row.  Returns the OTP so the buyer can see it immediately.
 */
export const verifyPayment = async (
  reference: string
): Promise<PaymentVerifyResult | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('korapay-verify', {
      body: { reference },
    });
    if (error) { console.error('verifyPayment error:', error); return null; }

    const result = data as PaymentVerifyResult;

    // If payment succeeded and we have an orderId, generate + store the delivery OTP
    if (result?.status === 'success' && result.orderId) {
      const otp = generateDeliveryOtp();
      const stored = await storeDeliveryOtp(result.orderId, otp);
      if (stored) {
        result.deliveryOtp = otp;
      }
    }

    return result;
  } catch (err) { console.error('verifyPayment unexpected error:', err); return null; }
};

export const getBuyerOrders = async (buyerId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getBuyerOrders error:', error); return []; }
  return data ?? [];
};
