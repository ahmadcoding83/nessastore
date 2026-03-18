<template>
  <section class="space-y-3">
    <article class="card" v-for="order in orders" :key="order.id">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <h2 class="font-bold text-slate-900">Order #{{ order.id.slice(0, 8) }}</h2>
          <p class="text-sm text-slate-600">{{ order.customer_name }} - {{ order.phone }}</p>
          <p class="text-sm text-slate-600">{{ order.address }}</p>
          <p class="text-sm font-semibold">Total Rp{{ formatPrice(order.total_price) }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <select v-model="order.status" class="rounded-xl border px-3 py-2 text-sm" @change="updateStatus(order)">
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="ordered_to_supplier">ordered_to_supplier</option>
            <option value="shipped">shipped</option>
          </select>
          <button class="btn-secondary py-2 text-sm" @click="orderToSupplier(order)">Order ke Supplier</button>
        </div>
      </div>

      <div class="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm">
        <div v-for="item in order.order_items" :key="item.id" class="flex justify-between">
          <span>{{ item.products?.name || "Produk" }} x{{ item.qty }}</span>
          <span>Rp{{ formatPrice(item.price * item.qty) }}</span>
        </div>
      </div>
    </article>

    <p v-if="!orders.length" class="card text-sm text-slate-600">Belum ada order masuk.</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { supabase } from "@/lib/supabase";
import { buildSupplierOrderTemplate } from "@/utils/orderTemplate";
import type { OrderItem, OrderStatus } from "@/types/db";

interface AdminOrder {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  total_price: number;
  status: OrderStatus;
  order_items: Array<OrderItem & { products?: { name: string; supplier_link: string | null } | null }>;
}

const orders = ref<AdminOrder[]>([]);

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

async function fetchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,customer_name,phone,address,total_price,status,order_items(id,order_id,product_id,qty,price,products(name,supplier_link))"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // FIX: Supabase returns nested items as arrays sometimes, especially when joining
  const mapped = (data ?? []).map((o: any) => ({
    ...o,
    order_items: (o.order_items ?? []).map((i: any) => ({
      ...i,
      products: Array.isArray(i.products) ? i.products[0] : i.products
    }))
  }));

  orders.value = mapped as AdminOrder[];
}

async function updateStatus(order: AdminOrder) {
  const { error } = await supabase.from("orders").update({ status: order.status }).eq("id", order.id);
  if (error) throw error;
}

async function orderToSupplier(order: AdminOrder) {
  if (!order.order_items.length) return;

  const template = buildSupplierOrderTemplate({
    customerName: order.customer_name,
    phone: order.phone,
    address: order.address,
    items: order.order_items
  });

  await navigator.clipboard.writeText(template);

  const firstSupplierLink = order.order_items.find((item) => item.products?.supplier_link)?.products?.supplier_link;
  if (firstSupplierLink) {
    window.open(firstSupplierLink, "_blank");
  }

  order.status = "ordered_to_supplier";
  await updateStatus(order);
}

onMounted(fetchOrders);
</script>
