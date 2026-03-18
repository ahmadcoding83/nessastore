<template>
  <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <article class="card" v-for="item in stats" :key="item.label">
      <p class="text-sm text-slate-500">{{ item.label }}</p>
      <p class="mt-2 text-3xl font-black text-slate-900">{{ item.value }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { supabase } from "@/lib/supabase";

const stats = ref([
  { label: "Total Produk", value: 0 },
  { label: "Order Pending", value: 0 },
  { label: "Order Paid", value: 0 },
  { label: "Order Shipped", value: 0 }
]);

async function loadStats() {
  const [products, pending, paid, shipped] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "shipped")
  ]);

  stats.value = [
    { label: "Total Produk", value: products.count || 0 },
    { label: "Order Pending", value: pending.count || 0 },
    { label: "Order Paid", value: paid.count || 0 },
    { label: "Order Shipped", value: shipped.count || 0 }
  ];
}

onMounted(loadStats);
</script>
