import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { corsHeaders } from "../_shared/cors.ts";

interface CheckoutPayload {
  customer_name: string;
  phone: string;
  address: string;
  items: Array<{ product_id: string; qty: number }>;
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

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") || ""
        }
      }
    });

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const payload = (await req.json()) as CheckoutPayload;
    if (!payload.items?.length) {
      return new Response("Cart is empty", { status: 400, headers: corsHeaders });
    }

    const productIds = payload.items.map((item) => item.product_id);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id,name,price,store_id,type,stock_qty")
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError) throw productsError;
    if (!products || !products.length) {
      return new Response("Products not found", { status: 404, headers: corsHeaders });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const orderItemsPayload: Array<{ product_id: string; qty: number; price: number }> = [];

    for (const item of payload.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return new Response("Produk tidak ditemukan", { status: 404, headers: corsHeaders });
      }

      if (product.type === "stock" && Number(product.stock_qty) < item.qty) {
        return new Response("Stok produk " + product.name + " tidak cukup", {
          status: 400,
          headers: corsHeaders
        });
      }

      orderItemsPayload.push({
        product_id: item.product_id,
        qty: item.qty,
        price: Number(product.price)
      });
    }

    const totalPrice = orderItemsPayload.reduce((sum, item) => sum + item.price * item.qty, 0);
    const storeId = products[0]?.store_id || null;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        store_id: storeId,
        customer_name: payload.customer_name,
        phone: payload.phone,
        address: payload.address,
        total_price: totalPrice,
        status: "pending"
      })
      .select("id")
      .single();

    if (orderError || !order) throw orderError || new Error("Failed create order");

    const orderItemsInsert = orderItemsPayload.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      price: item.price
    }));

    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItemsInsert);
    if (orderItemsError) throw orderItemsError;

    const basicAuth = "Basic " + btoa(midtransServerKey + ":");
    const midtransPayload = {
      transaction_details: {
        order_id: order.id,
        gross_amount: totalPrice
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: payload.customer_name,
        phone: payload.phone,
        address: payload.address,
        email: user.email
      }
    };

    const midtransResponse = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(midtransPayload)
    });

    if (!midtransResponse.ok) {
      const body = await midtransResponse.text();
      throw new Error("Midtrans error: " + body);
    }

    const snapData = await midtransResponse.json();

    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_token: snapData.token })
      .eq("id", order.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        order_id: order.id,
        payment_token: snapData.token
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unknown error", {
      status: 500,
      headers: corsHeaders
    });
  }
});
