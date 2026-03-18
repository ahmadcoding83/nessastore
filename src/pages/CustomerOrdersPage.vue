<template>
  <div class="container-shell py-6">
    <div class="mb-3 flex items-center justify-between gap-3">
      <h1 class="text-2xl font-black text-slate-900">Pesanan Saya</h1>
      <RouterLink to="/" class="btn-secondary py-2">Kembali ke Beranda</RouterLink>
    </div>
    <p class="text-sm text-slate-600">Pantau status order dari pending sampai dikirim.</p>

    <div class="mt-4 space-y-3">
      <article v-for="order in orders" :key="order.id" class="card">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-bold text-slate-900">Order #{{ order.id.slice(0, 8) }}</h2>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
            {{ order.status }}
          </span>
        </div>
        <p class="mt-1 text-sm text-slate-600">{{ order.customer_name }} - {{ order.phone }}</p>
        <p class="text-sm text-slate-600">{{ order.address }}</p>

        <div class="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
          <div v-for="item in order.order_items" :key="item.id" class="flex items-center justify-between text-sm">
            <span>{{ item.products?.name || "Produk" }} x{{ item.qty }}</span>
            <div class="flex items-center gap-3">
              <span>Rp{{ formatPrice(item.price * item.qty) }}</span>
              <a
                v-if="order.status === 'paid' && item.products?.type === 'digital' && item.products?.digital_download_url"
                :href="item.products.digital_download_url"
                target="_blank"
                class="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Download
              </a>
            </div>
          </div>
        </div>

        <p class="mt-2 font-semibold">Total: Rp{{ formatPrice(order.total_price) }}</p>
      </article>
      <p v-if="!orders.length" class="card text-sm text-slate-600">Belum ada order.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { supabase } from "@/lib/supabase";
import type { AppOrder, OrderItem, Product } from "@/types/db";

interface CustomerOrder extends AppOrder {
  order_items: Array<OrderItem & { products?: Product | null }>;
}

const orders = ref<CustomerOrder[]>([]);

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

async function fetchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("id,user_id,store_id,customer_name,phone,address,total_price,status,payment_token,created_at,order_items(id,order_id,product_id,qty,price,products(*))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // FIX: Supabase select on nested object returns an array, but we expect a single object
  const mapped = (data ?? []).map((o: any) => ({
    ...o,
    order_items: (o.order_items ?? []).map((i: any) => ({
      ...i,
      products: Array.isArray(i.products) ? i.products[0] : i.products
    }))
  }));

  orders.value = mapped as CustomerOrder[];
}

onMounted(fetchOrders);
</script>
