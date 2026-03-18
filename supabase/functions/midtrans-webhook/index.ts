import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { corsHeaders } from "../_shared/cors.ts";

async function sha512(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const midtransServerKey = Deno.env.get("MIDTRANS_SERVER_KEY") || "";

    if (!supabaseUrl || !serviceRoleKey || !midtransServerKey) {
      throw new Error("Missing required environment variable");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const payload = await req.json();

    const orderId = payload.order_id as string;
    const statusCode = payload.status_code as string;
    const grossAmount = payload.gross_amount as string;
    const signatureKey = payload.signature_key as string;
    const transactionStatus = payload.transaction_status as string;
    const fraudStatus = payload.fraud_status as string | undefined;

    const expectedSignature = await sha512(orderId + statusCode + grossAmount + midtransServerKey);
    if (expectedSignature !== signatureKey) {
      return new Response("Invalid signature", { status: 401, headers: corsHeaders });
    }

    let nextStatus = "pending";

    if (transactionStatus === "settlement") {
      nextStatus = "paid";
    }

    if (transactionStatus === "capture" && fraudStatus === "accept") {
      nextStatus = "paid";
    }

    if (transactionStatus === "cancel" || transactionStatus === "expire" || transactionStatus === "deny") {
      nextStatus = "pending";
    }

    const { data: currentOrder, error: currentOrderError } = await supabase
      .from("orders")
      .select("id,status")
      .eq("id", orderId)
      .single();

    if (currentOrderError || !currentOrder) throw currentOrderError || new Error("Order not found");
    const isTransitionToPaid = currentOrder.status !== "paid" && nextStatus === "paid";

    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", orderId);

    if (error) throw error;

    if (isTransitionToPaid) {
      const { data: orderDetails, error: orderDetailsError } = await supabase
        .from("orders")
        .select("customer_name, phone, items:order_items(products(name))")
        .eq("id", orderId)
        .single();

      if (!orderDetailsError && orderDetails) {
        const waToken = Deno.env.get("WA_GATEWAY_TOKEN");
        if (waToken) {
          const message = `Halo ${orderDetails.customer_name},\n\nPesanan Anda untuk produk [${orderDetails.items?.map((i: any) => i.products?.name).join(", ")}] sudah kami terima dan sudah LUNAS.\n\nMohon tunggu resi pengirimannya ya!`;
          
          await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: { Authorization: waToken },
            body: new URLSearchParams({
              target: orderDetails.phone,
              message: message
            })
          });
          console.log(`WA notification sent to ${orderDetails.phone}`);
        }
      }

      const { data: stockItems, error: stockItemsError } = await supabase
        .from("order_items")
        .select("product_id,qty,products(type,stock_qty)")
        .eq("order_id", orderId);

      if (stockItemsError) throw stockItemsError;

      const qtyByProduct = new Map<string, number>();
      for (const item of stockItems ?? []) {
        if (item.products?.type !== "stock") continue;
        const prev = qtyByProduct.get(item.product_id) ?? 0;
        qtyByProduct.set(item.product_id, prev + Number(item.qty));
      }

      for (const [productId, qty] of qtyByProduct.entries()) {
        const { data: productRow, error: productError } = await supabase
          .from("products")
          .select("id,stock_qty")
          .eq("id", productId)
          .single();

        if (productError || !productRow) throw productError || new Error("Product not found");
        const nextQty = Number(productRow.stock_qty) - qty;
        if (nextQty < 0) throw new Error("Stock underflow on product " + productId);

        const { error: stockUpdateError } = await supabase
          .from("products")
          .update({ stock_qty: nextQty })
          .eq("id", productId);

        if (stockUpdateError) throw stockUpdateError;
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unknown error", {
      status: 500,
      headers: corsHeaders
    });
  }
});
