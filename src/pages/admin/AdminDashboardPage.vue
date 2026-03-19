<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- HEADER SECTION -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-1">
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">KONTROL PUSAT</h1>
        <p class="text-slate-500 font-bold italic flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistem Online & Berjalan Lancar
        </p>
      </div>
      
      <div class="flex gap-3">
        <RouterLink to="/admin/products" class="btn-primary bg-slate-900 shadow-xl shadow-slate-200">
          + TAMBAH PRODUK
        </RouterLink>
        <RouterLink to="/admin/settings" class="btn-secondary bg-white">
          ⚙️ SETTINGS
        </RouterLink>
      </div>
    </header>

    <!-- STATS GRID -->
    <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <article 
        v-for="item in stats" 
        :key="item.label"
        :class="[item.color, 'p-8 rounded-[2.5rem] border border-white/50 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden']"
      >
        <div class="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-125 transition-transform duration-500">
          {{ item.icon }}
        </div>
        
        <div class="relative z-10 flex flex-col gap-4">
          <div :class="['h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-inner', item.iconBg]">
            {{ item.icon }}
          </div>
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest opacity-60">{{ item.label }}</p>
            <p class="text-4xl font-black tracking-tighter">{{ item.value }}</p>
          </div>
        </div>
      </article>
    </section>

    <!-- QUICK OVERVIEW SECTION -->
    <div class="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <!-- RECENT ORDERS -->
      <div class="bg-white rounded-[3rem] border border-slate-100 p-10 space-y-6 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight italic">Order Terbaru</h2>
          <RouterLink to="/admin/orders" class="text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
            Lihat Semua ➡️
          </RouterLink>
        </div>
        
        <div v-if="recentOrders.length > 0" class="space-y-4">
          <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-3xl transition-colors cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-110 transition-transform">
                {{ order.customer_name?.[0] || '?' }}
              </div>
              <div>
                <p class="text-sm font-black text-slate-900">#{{ order.id.slice(0, 8) }}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ order.customer_name }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-6">
              <span class="text-xs font-black text-slate-900 font-mono">Rp{{ formatPrice(order.total_price) }}</span>
              <span :class="[
                'px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest',
                order.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 
                order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-600'
              ]">
                {{ order.status }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-else class="py-10 text-center space-y-4 text-slate-300">
           <div class="text-5xl">🔭</div>
           <p class="font-black text-[10px] uppercase tracking-[0.2em]">Belum ada data order</p>
        </div>
      </div>

      <!-- SYSTEM STATUS -->
      <div class="bg-slate-900 rounded-[3rem] p-10 space-y-8 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
        <div class="absolute -bottom-10 -left-10 text-9xl rotate-12 opacity-5 pointer-events-none">🤖</div>
        
        <div class="relative z-10 space-y-6">
           <h2 class="text-xl font-black uppercase tracking-tight">Status Robot</h2>
           
           <div class="space-y-6">
             <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Nessa Scraper Engine</span>
                <span class="text-xs font-black text-emerald-400 flex items-center gap-2">
                   ACTIVE <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </span>
             </div>
             <div class="h-2 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 w-[95%] animate-pulse"></div>
             </div>
             
             <div class="grid grid-cols-2 gap-4">
                <div class="p-6 bg-white/5 rounded-3xl border border-white/5">
                   <p class="text-white/40 text-[8px] font-black uppercase tracking-widest mb-2">Auto-Pricing</p>
                   <p class="text-xl font-mono font-black text-emerald-400">READY</p>
                </div>
                <div class="p-6 bg-white/5 rounded-3xl border border-white/5">
                   <p class="text-white/40 text-[8px] font-black uppercase tracking-widest mb-2">Task Latency</p>
                   <p class="text-xl font-mono font-black text-blue-400">0.5s</p>
                </div>
             </div>
             
             <button class="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-black text-xs uppercase transition-all active:scale-95 border border-white/10">
                PANTYAU LOG AKTIVITAS ➡️
             </button>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { supabase } from "@/lib/supabase";

const stats = ref([
  { label: "Total Kurasi Produk", value: 0, icon: "📦", color: "bg-blue-50/50", iconBg: "bg-blue-100 text-blue-600" },
  { label: "Order Menunggu", value: 0, icon: "⏳", color: "bg-orange-50/50", iconBg: "bg-orange-100 text-orange-600" },
  { label: "Pemasukan Berhasil", value: 0, icon: "💰", color: "bg-emerald-50/50", iconBg: "bg-emerald-100 text-emerald-600" },
  { label: "Paket Dikirim", value: 0, icon: "🚚", color: "bg-slate-50/50", iconBg: "bg-slate-200 text-slate-700" }
]);

const recentOrders = ref<any[]>([]);

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

async function loadStats() {
  const [products, pending, paid, shipped, recent] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "shipped"),
    supabase.from("orders").select("*").limit(5).order("created_at", { ascending: false })
  ]);

  stats.value[0].value = products.count || 0;
  stats.value[1].value = pending.count || 0;
  stats.value[2].value = paid.count || 0;
  stats.value[3].value = shipped.count || 0;
  
  recentOrders.value = recent.data || [];
}

let realtime: any = null;

onMounted(async () => {
  await loadStats();
  
  // REALTIME UPDATE FOR DASHBOARD
  realtime = supabase
    .channel("admin-dash")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, loadStats)
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, loadStats)
    .subscribe();
});

onUnmounted(() => {
  if (realtime) supabase.removeChannel(realtime);
});
</script>
