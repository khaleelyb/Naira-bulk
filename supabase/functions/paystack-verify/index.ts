import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const PAYSTACK_API_BASE = 'https://api.paystack.co';

const requiredEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { reference } = await req.json() as { reference?: string };
    if (!reference || typeof reference !== 'string') {
      return jsonResponse({ error: 'Missing payment reference' }, 400);
    }

    const supabaseUrl = requiredEnv('SUPABASE_URL');
    const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const paystackSecretKey = requiredEnv('PAYSTACK_SECRET_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, amount, status')
      .eq('korapay_reference', reference)
      .single();

    if (orderError || !order) {
      console.error('paystack-verify order lookup error:', orderError);
      return jsonResponse({ error: 'Order not found' }, 404);
    }

    const verifyResponse = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecretKey}` },
    });
    const verified = await verifyResponse.json();

    if (!verifyResponse.ok || !verified.status) {
      console.error('paystack-verify API error:', verified);
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return jsonResponse({ status: 'failed', orderId: order.id, message: verified.message ?? 'Verification failed' }, 502);
    }

    const transaction = verified.data;
    const expectedAmount = Math.round(Number(order.amount) * 100);
    const paidSuccessfully = transaction?.status === 'success' && transaction?.currency === 'NGN' && transaction?.amount === expectedAmount;
    const nextStatus = paidSuccessfully ? 'success' : 'failed';

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', order.id);

    if (updateError) {
      console.error('paystack-verify order update error:', updateError);
      return jsonResponse({ error: 'Could not update order after verification' }, 500);
    }

    return jsonResponse({
      status: nextStatus,
      transactionRef: transaction?.reference ?? reference,
      orderId: order.id,
    });
  } catch (err) {
    console.error('paystack-verify unexpected error:', err);
    return jsonResponse({ error: 'Unexpected payment verification error' }, 500);
  }
});
