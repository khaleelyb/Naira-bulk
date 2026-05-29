import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PAYSTACK_API_BASE = "https://api.paystack.co";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Missing PAYSTACK_SECRET_KEY");
    }

    const { reference } = await req.json() as { reference?: string };
    if (!reference || typeof reference !== "string") {
      return jsonResponse({ error: "Missing payment reference" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, amount, status")
      .eq("korapay_reference", reference)
      .single();

    if (orderError || !order) {
      console.error("Order lookup error:", orderError);
      return jsonResponse({ error: "Order not found" }, 404);
    }

    const verifyResponse = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const verified = await verifyResponse.json();

    if (!verifyResponse.ok || !verified.status) {
      console.error("Paystack verify error:", verified);
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return jsonResponse({ status: "failed", orderId: order.id, message: verified.message ?? "Verification failed" }, 502);
    }

    const transaction = verified.data;
    const expectedAmount = Math.round(Number(order.amount) * 100);
    const paidSuccessfully = transaction?.status === "success" && transaction?.currency === "NGN" && transaction?.amount === expectedAmount;
    const nextStatus = paidSuccessfully ? "success" : "failed";

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", order.id);

    if (updateError) {
      console.error("Order update error:", updateError);
      return jsonResponse({ error: "Could not update order after verification" }, 500);
    }

    return jsonResponse({
      status: nextStatus,
      transactionRef: transaction?.reference ?? reference,
      orderId: order.id,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({
      error: "Internal server error",
      detail: String(err),
    }, 500);
  }
});
