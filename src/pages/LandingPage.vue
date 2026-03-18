<template>
  <div class="gradient-bg min-h-screen text-slate-900">

    <!-- STICKY HEADER -->
    <header class="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl">
      <div class="container-shell h-20 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- DYNAMIC LOGO -->
          <div v-if="storeSettings?.logo_url" class="h-10 w-10 rounded-2xl overflow-hidden shadow-lg shadow-slate-200">
            <img :src="storeSettings.logo_url" class="h-full w-full object-cover" />
          </div>
          <div v-else
            class="h-10 w-10 flex items-center justify-center bg-slate-900 rounded-2xl text-white font-black italic shadow-lg shadow-slate-200">
            {{ storeSettings?.name?.[0] || 'N' }}
          </div>
          <div class="text-xl font-black tracking-tighter italic mr-8 uppercase">{{ storeSettings?.name || 'NESSASTORE' }}</div>
        </div>

        <div class="hidden md:flex items-center gap-6">
          <button v-for="c in categories" :key="c.id" @click="activeCategory = c.id"
            :class="[activeCategory === c.id ? 'font-black border-b-2 border-slate-900' : 'text-slate-500 font-bold']"
            class="text-xs pb-1 transition-all flex items-center gap-1 uppercase tracking-tighter">
            <span>{{ c.icon }}</span> {{ c.label }}
          </button>
        </div>

        <div class="flex gap-2">
          <RouterLink class="hidden sm:inline-flex btn-secondary py-2.5 text-xs" to="/my-orders">📦 Pesanan</RouterLink>
          <RouterLink v-if="authStore.isAdmin" class="btn-primary py-2.5 text-xs bg-slate-900" to="/admin">🛡️ Admin
          </RouterLink>
          <RouterLink v-if="!authStore.isLoggedIn" class="btn-secondary py-2.5 text-xs" to="/auth">Masuk</RouterLink>
          <button v-else type="button" class="btn-secondary py-2.5 text-xs" @click="logout">Keluar</button>
        </div>
      </div>
    </header>

    <main class="py-12 space-y-20">
      <!-- SEARCH ENGINE: COMPARATOR HERO -->
      <section class="max-w-4xl mx-auto text-center space-y-10 py-12 px-4">
        <div class="space-y-6">
          <h1 class="text-4xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]">
            Cari Barang, <br />
            <span class="text-emerald-500 italic">Kami Carikan Harga Termurahnya!</span>
          </h1>
          <p class="text-slate-500 font-bold text-lg max-w-2xl mx-auto line-relaxed">
            Pecinta diskon bergabunglah! Kami bandingkan ribuan produk dari berbagai marketplace untuk Anda.
          </p>
        </div>

        <div class="relative group max-w-3xl mx-auto">
          <div
            class="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200">
          </div>
          <div class="relative flex items-center bg-white rounded-[2rem] border-2 border-slate-100 p-2 shadow-2xl">
            <span class="pl-6 text-2xl">🔍</span>
            <input v-model="searchQuery" type="text" placeholder="Ketik barang yang Anda cari (Gamis, Sepatu, dll)..."
              class="flex-1 bg-transparent border-none focus:ring-0 text-lg font-black p-4 placeholder-slate-300" />
            <button
              class="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all transform active:scale-95 shadow-xl">
              CARI SEKARANG
            </button>
          </div>
        </div>

        <!-- SEARCH RESULTS PREVIEW -->
        <div v-if="searchQuery" class="mt-4 space-y-4 max-w-3xl mx-auto">
          <!-- 1. LOADING SKELETON (ROBOT WORKING) -->
          <div v-if="requesting"
            class="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-200 p-6 shadow-xl space-y-4 text-left animate-pulse">
            <div class="h-4 w-48 bg-slate-200 rounded-full mb-6"></div>
            <div class="grid gap-4">
              <div v-for="i in 3" :key="i"
                class="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center gap-4 w-full">
                  <div class="h-12 w-12 bg-slate-200 rounded-xl shrink-0"></div>
                  <div class="space-y-2 flex-1">
                    <div class="h-4 w-1/3 bg-slate-200 rounded"></div>
                    <div class="h-3 w-1/4 bg-slate-200 rounded"></div>
                  </div>
                  <div class="h-8 w-20 bg-slate-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. IF RESULTS FOUND (STORE OR ROBOT) -->
          <div v-else-if="displayResults.length > 0"
            class="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-200 p-6 shadow-xl space-y-4 text-left">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Ditemukan {{
              displayResults.length }} Produk Termurah:</p>
            <div class="grid gap-4">
              <div v-for="(res, idx) in displayResults.slice(0, 5)" :key="res.id"
                class="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
                @click="handleBuy(res)">
                <div class="flex items-center gap-4">
                  <span class="text-[10px] font-black text-slate-400 w-6">#{{ idx + 1 }}</span>
                  <img :src="res.image_url || fallbackImage" class="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <h4 class="font-bold text-sm text-slate-800 line-clamp-1">{{ res.name }}</h4>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-black text-slate-900">Rp{{ formatPrice(res.price) }}</span>
                      <span
                        class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 rounded-full">TERMURAH</span>
                    </div>
                  </div>
                </div>
                <button
                  class="px-4 py-2 bg-slate-50 text-slate-900 rounded-xl font-black text-[10px] hover:bg-slate-900 hover:text-white transition-colors">
                  CEK HARGA </button>
              </div>
            </div>
          </div>

          <!-- 3. IF NO RESULTS FOUND -->
          <div v-else class="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl text-center space-y-6">
            <div class="text-5xl">🔭</div>
            <div>
              <h3 class="text-xl font-black text-slate-900">Oops! "{{ searchQuery }}" Belum Kami Kurasi.</h3>
              <p class="text-sm text-slate-500 font-medium">Mau Robot NESSA mencarikannya di Shopee / TikTok sekarang?
              </p>
            </div>
            <div class="flex justify-center gap-3">
              <button type="button" @click="selectedSource = 'tiktok'"
                :class="[selectedSource === 'tiktok' ? 'bg-black text-white ring-2 ring-black ring-offset-2' : 'bg-slate-100 text-slate-400 hover:bg-slate-200']"
                class="px-5 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all">
                <span>🎵</span> TikTok Shop
              </button>
              <button type="button" @click="selectedSource = 'shopee'"
                :class="[selectedSource === 'shopee' ? 'bg-orange-500 text-white ring-2 ring-orange-500 ring-offset-2' : 'bg-slate-100 text-slate-400 hover:bg-slate-200']"
                class="px-5 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all">
                <span>🟠</span> Shopee
              </button>
            </div>
            <button @click="requestRobot(searchQuery)" :disabled="requesting"
              class="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all transform active:scale-95 disabled:opacity-50">
              {{ requesting ? 'MENGHUBUNGI ROBOT...' : '🤖 CARIKAN HARGA TERGILA!' }}
            </button>
          </div>
        </div>
      </section>

      <!-- CATEGORY TABS (MOBILE) -->
      <div class="container-shell md:hidden overflow-x-auto flex gap-2 no-scrollbar pb-2">
        <button v-for="c in categories" :key="c.id" @click="activeCategory = c.id"
          :class="[activeCategory === c.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600']"
          class="whitespace-nowrap px-6 py-2 rounded-2xl text-xs font-black uppercase transition-all shadow-sm border border-slate-100">
          {{ c.label }}
        </button>
      </div>

      <!-- PRODUCT GRID -->
      <section class="container-shell space-y-10">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-black flex items-center gap-3">
            <span class="p-2 bg-white rounded-2xl shadow-sm">💎</span>
            {{ currentCategoryLabel }}
          </h2>
          <span class="text-sm font-bold text-slate-400">{{ filteredProducts.length }} Produk</span>
        </div>

        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <article v-for="p in filteredProducts" :key="p.id"
            class="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <!-- CARD IMAGE -->
            <div class="relative h-72 overflow-hidden">
              <img :src="p.image_url || fallbackImage"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute top-4 left-4 flex flex-col gap-2">
                <span v-if="p.type === 'affiliate'"
                  class="bg-orange-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">🔥
                  Viral Bait</span>
                <span v-if="p.type === 'dropship'"
                  class="bg-blue-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">✨
                  Hook Choices</span>
                <span v-if="p.is_smart_price"
                  class="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">🏷️
                  Smart Price</span>
              </div>
            </div>

            <!-- CARD BODY -->
            <div class="p-8 space-y-4">
              <h3
                class="font-bold text-lg text-slate-900 leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
                {{ p.name }}
              </h3>

              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-xl font-black font-mono">Rp{{ formatPrice(p.price) }}</span>
                  <span v-if="p.is_smart_price" class="text-[10px] font-bold text-slate-400">Update {{
                    timeAgo(p.last_updated_at) }}</span>
                </div>
                <button @click="handleBuy(p)"
                  class="h-12 w-12 flex items-center justify-center bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all transform active:scale-90 shadow-sm border border-slate-100">
                  <span v-if="p.type === 'affiliate'">➡️</span>
                  <span v-else>🛒</span>
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- IF EMPTY -->
        <div v-if="filteredProducts.length === 0" class="py-20 text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <div class="text-6xl opacity-20">📦</div>
           <p class="font-black text-slate-400 uppercase tracking-widest">Belum ada produk untuk kategori ini</p>
        </div>
      </section>

      <!-- SOCIAL PROOF & BENEFITS -->
      <section class="container-shell grid gap-8 md:grid-cols-3">
        <div v-for="point in benefits" :key="point.title"
          class="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-4 hover:shadow-xl transition-shadow">
          <div
            class="h-14 w-14 mx-auto bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-slate-200">
            {{ point.icon }}
          </div>
          <h3 class="font-black text-slate-900 text-sm uppercase tracking-widest">{{ point.title }}</h3>
          <p class="text-xs text-slate-500 leading-relaxed font-medium">{{ point.desc }}</p>
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="bg-slate-900 py-24 mt-20 relative overflow-hidden">
        <!-- Background Decor -->
        <div class="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div class="absolute top-10 left-10 text-9xl">✨</div>
           <div class="absolute bottom-10 right-10 text-9xl">✨</div>
        </div>

        <div class="container-shell space-y-16 relative z-10">
          <div class="text-center space-y-4">
            <h2 class="text-4xl font-black text-white italic tracking-tighter uppercase">{{ storeSettings?.name || 'NessaStore' }} Trust</h2>
            <p class="text-slate-400 font-bold text-lg">Bergabung bersama ribuan pelanggan yang sudah berhemat.</p>
          </div>

          <div class="grid gap-8 md:grid-cols-3">
            <article v-for="testi in testimonies" :key="testi.name"
              class="p-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-[3rem] space-y-6 hover:bg-white/[0.08] transition-colors">
              <div class="flex text-yellow-400 gap-1">
                 <span v-for="i in 5" :key="i">⭐</span>
              </div>
              <p class="text-sm text-slate-300 italic font-medium leading-relaxed">"{{ testi.message }}"</p>
              <div class="flex items-center gap-4 pt-2">
                <div
                  class="h-10 w-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg">
                  {{ testi.name[0] }}</div>
                <p class="font-black text-white text-sm uppercase tracking-wide">{{ testi.name }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

    </main>

    <!-- FOOTER -->
    <footer class="py-16 border-t border-slate-200 bg-white">
      <div class="container-shell flex flex-col items-center justify-between gap-10 md:flex-row">
        <div class="flex items-center gap-3">
           <div v-if="storeSettings?.logo_url" class="h-8 w-8 rounded-xl overflow-hidden shadow-md">
              <img :src="storeSettings.logo_url" class="h-full w-full object-cover" />
           </div>
           <div class="text-2xl font-black italic tracking-tighter uppercase">{{ storeSettings?.name || 'NESSASTORE' }}</div>
        </div>
        
        <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center leading-loose">
          © 2026 {{ storeSettings?.name || 'NESSASTORE' }} • THE BEST HUB FOR SMART SHOPPERS
          <br/> Crafted for Excellence
        </div>

        <div class="flex gap-6">
          <a href="#" class="text-slate-400 hover:text-slate-900 transition-colors font-black text-xs uppercase tracking-widest">Instagram</a>
          <a href="#" class="text-slate-400 hover:text-slate-900 transition-colors font-black text-xs uppercase tracking-widest">TikTok</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useProductStore } from "@/stores/product";
import { useAuthStore } from "@/stores/auth";
import { useCheckoutStore } from "@/stores/checkout";
import { useSettingsStore } from "@/stores/settings";
import { supabase } from "@/lib/supabase";

const router = useRouter();
const productStore = useProductStore();
const authStore = useAuthStore();
const checkoutStore = useCheckoutStore();
const settingsStore = useSettingsStore();

const activeCategory = ref('all');
const searchQuery = ref('');
const requesting = ref(false);
const selectedSource = ref('tiktok');

const storeSettings = computed(() => settingsStore.store);

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];

  return productStore.products
    .filter((p) => (p.name || "").toLowerCase().includes(q))
    .filter((p) => Boolean((p as any).affiliate_click_url || p.affiliate_link || p.supplier_link))
    .sort((a, b) => Number(a.price) - Number(b.price));
});

const displayResults = computed(() => searchResults.value);

async function requestRobot(query: string) {
  if (!query) return;
  requesting.value = true;

  try {
    // Simulate robot working or call backend if implemented
    await productStore.fetchProducts();
  } finally {
    requesting.value = false;
  }
}

const fallbackImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";

const categories = [
  { id: 'all', label: 'Semua Produk', icon: '🏠' },
  { id: 'affiliate', label: 'Viral Affiliate', icon: '🔥' },
  { id: 'dropship', label: 'Dropship Hook', icon: '✨' },
  { id: 'stock', label: 'Ready Stock', icon: '📦' },
  { id: 'digital', label: 'Produk Digital', icon: '🌐' }
];

const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') return productStore.products;
  return productStore.products.filter(p => p.type === activeCategory.value);
});

const currentCategoryLabel = computed(() => {
  const cat = categories.find(c => c.id === activeCategory.value);
  return cat ? cat.label : 'Produk Kami';
});

const benefits = [
  { title: "Kurasi TERMURAH", desc: "Hanya barang viral & berkualitas yang kami pasang.", icon: "💎" },
  { title: "Smart Price", desc: "Robot kami mengecek harga termurah setiap hari.", icon: "🤖" },
  { title: "Fulfillment Cepat", desc: "Order diproses hari yang sama tanpa antre lama.", icon: "⚡" }
];

const testimonies = [
  { name: "Nadia Kusuma", message: "Beneran dapet harga paling murah dibanding marketplace sebelah!" },
  { name: "Andi Wijaya", message: "Proses belinya gampang, barang cepet banget sampe rumah." },
  { name: "Siti Sarah", message: "Adminnya responsif banget lewat WhatsApp, terbantu banget." }
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "Baru saja";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return "Baru saja";
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  return `${Math.floor(diffInHours / 24)} hari yang lalu`;
}

async function logout() {
  await authStore.signOut();
}

function handleBuy(item: any) {
  const botLink = item.affiliate_click_url || item.affiliate_link || item.supplier_link || item.aff_link;
  if (botLink) {
    window.open(botLink, "_blank");
    return;
  }

  if (item.type === "affiliate") {
    if (item.affiliate_link) {
      window.open(item.affiliate_link, "_blank");
    }
    return;
  }

  checkoutStore.clear();
  checkoutStore.addItem(item, 1);
  router.push("/checkout");
}

onMounted(async () => {
  productStore.restoreCache();
  await Promise.all([
    productStore.fetchProducts(),
    settingsStore.fetchSettings()
  ]);
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>













