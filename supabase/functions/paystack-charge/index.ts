import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

type CartItem = {
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
};

type PaymentRequest = {
  productId: string;
  productTitle: string;
  amount: number;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  sellerId?: string;
  cartItems?: CartItem[];
};

const PAYSTACK_API_BASE = 'https://api.paystack.co';

const requiredEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const isValidPaymentRequest = (body: Partial<PaymentRequest>): body is PaymentRequest => (
  typeof body.productId === 'string' && body.productId.trim().length > 0 &&
  typeof body.productTitle === 'string' && body.productTitle.trim().length > 0 &&
  typeof body.amount === 'number' && Number.isFinite(body.amount) && body.amount > 0 &&
  typeof body.buyerId === 'string' && body.buyerId.trim().length > 0 &&
  typeof body.buyerName === 'string' && body.buyerName.trim().length > 0 &&
  typeof body.buyerEmail === 'string' && body.buyerEmail.includes('@') &&
  typeof body.buyerPhone === 'string' && body.buyerPhone.trim().length >= 7 &&
  typeof body.buyerAddress === 'string' && body.buyerAddress.trim().length > 0
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const payload = await req.json() as Partial<PaymentRequest>;
    if (!isValidPaymentRequest(payload)) {
      return jsonResponse({ error: 'Invalid payment request' }, 400);
    }

    const supabaseUrl = requiredEnv('SUPABASE_URL');
    const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const paystackSecretKey = requiredEnv('PAYSTACK_SECRET_KEY');
    const paystackPublicKey = Deno.env.get('PAYSTACK_PUBLIC_KEY') ?? Deno.env.get('VITE_PAYSTACK_PUBLIC_KEY') ?? null;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const amountInKobo = Math.round(payload.amount * 100);
    const reference = `NB-${crypto.randomUUID()}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: payload.buyerId,
        seller_id: payload.sellerId ?? null,
        product_id: payload.productId,
        product_title: payload.productTitle,
        amount: payload.amount,
        currency: 'NGN',
        status: 'pending',
        korapay_reference: reference,
        buyer_email: payload.buyerEmail,
        buyer_name: payload.buyerName,
        buyer_phone: payload.buyerPhone,
        buyer_address: payload.buyerAddress,
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('paystack-charge order insert error:', orderError);
      return jsonResponse({ error: 'Could not create order' }, 500);
    }

    const initializeResponse = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.buyerEmail,
        amount: amountInKobo,
        currency: 'NGN',
        reference,
        metadata: {
          orderId: order.id,
          buyerId: payload.buyerId,
          sellerId: payload.sellerId ?? null,
          productId: payload.productId,
          productTitle: payload.productTitle,
          buyerName: payload.buyerName,
          buyerPhone: payload.buyerPhone,
          buyerAddress: payload.buyerAddress,
          cartItems: payload.cartItems ?? [],
        },
      }),
    });

    const initialized = await initializeResponse.json();
    if (!initializeResponse.ok || !initialized.status) {
      console.error('paystack-charge initialize error:', initialized);
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return jsonResponse({ error: initialized.message ?? 'Could not initialize Paystack transaction' }, 502);
    }

    return jsonResponse({
      reference,
      orderId: order.id,
      accessCode: initialized.data?.access_code ?? null,
      authorizationUrl: initialized.data?.authorization_url ?? null,
      publicKey: paystackPublicKey,
      amount: payload.amount,
      currency: 'NGN',
      customer: { name: payload.buyerName, email: payload.buyerEmail },
      productTitle: payload.productTitle,
    });
  } catch (err) {
    console.error('paystack-charge unexpected error:', err);
    return jsonResponse({ error: 'Unexpected payment initialization error' }, 500);
  }
});
