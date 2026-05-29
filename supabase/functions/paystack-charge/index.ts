import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type CartItem = {
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
};

type PaymentRequest = {
  productId?: string;
  productTitle?: string;
  amount?: number | string;
  buyerId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  sellerId?: string;
  cartItems?: CartItem[];
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const PAYSTACK_PUBLIC_KEY = Deno.env.get("PAYSTACK_PUBLIC_KEY") ?? Deno.env.get("VITE_PAYSTACK_PUBLIC_KEY") ?? "";
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

    const body = await req.json() as PaymentRequest;
    let {
      productId,
      productTitle,
      amount,
      buyerId,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress,
      sellerId,
      cartItems,
    } = body;

    const amountNum = typeof amount === "string" ? Number(amount) : amount;

    if (!buyerId) {
      buyerId = crypto.randomUUID();
    }

    if (
      !productId ||
      !productTitle ||
      !buyerEmail ||
      !(amountNum && amountNum > 0) ||
      !buyerPhone ||
      !buyerAddress
    ) {
      return jsonResponse({
        error: "Missing or invalid required fields",
        received: body,
      }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!sellerId) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("seller_id")
        .eq("id", productId)
        .single();

      if (productError || !product) {
        return jsonResponse({ error: "Invalid productId", productError }, 400);
      }

      sellerId = product.seller_id;
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", buyerId)
      .maybeSingle();

    if (!existingUser) {
      const { error: createUserError } = await supabase.from("users").insert({
        id: buyerId,
        name: buyerName || "Guest User",
        username: `guest_${Date.now()}`,
        profile_picture: "https://via.placeholder.com/150",
      });

      if (createUserError) {
        console.error("User creation error:", createUserError);
        return jsonResponse({ error: "Failed to create user", createUserError }, 500);
      }
    }

    const reference = `NB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        product_id: productId,
        product_title: productTitle,
        amount: amountNum,
        currency: "NGN",
        buyer_id: buyerId,
        seller_id: sellerId ?? null,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        buyer_address: buyerAddress,
        korapay_reference: reference,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return jsonResponse({ error: "Failed to create order", dbError }, 500);
    }

    const initializeResponse = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: buyerEmail,
        amount: Math.round(amountNum * 100),
        currency: "NGN",
        reference,
        metadata: {
          orderId: order.id,
          buyerId,
          sellerId: sellerId ?? null,
          productId,
          productTitle,
          buyerName,
          buyerPhone,
          buyerAddress,
          cartItems: cartItems ?? [],
        },
      }),
    });

    const initialized = await initializeResponse.json();
    if (!initializeResponse.ok || !initialized.status) {
      console.error("Paystack initialize error:", initialized);
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return jsonResponse({ error: initialized.message ?? "Could not initialize Paystack transaction" }, 502);
    }

    return jsonResponse({
      success: true,
      reference,
      orderId: order.id,
      accessCode: initialized.data?.access_code ?? null,
      authorizationUrl: initialized.data?.authorization_url ?? null,
      publicKey: PAYSTACK_PUBLIC_KEY || null,
      amount: amountNum,
      currency: "NGN",
      customer: {
        name: buyerName,
        email: buyerEmail,
      },
      productTitle,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({
      error: "Internal server error",
      detail: String(err),
    }, 500);
  }
});
