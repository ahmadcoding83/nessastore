<template>
  <div class="gradient-bg min-h-screen text-slate-900 pb-12">

    <!-- MOBILE SIDEBAR -->
    <Transition name="slide-left">
      <aside v-if="sidebarOpen"
        class="fixed inset-y-0 left-0 z-[100] w-64 bg-white shadow-2xl p-8 space-y-8 flex flex-col">
        <div class="flex items-center justify-between">
          <div class="text-xl font-black italic tracking-tighter uppercase">{{ storeSettings?.name || 'NESSA' }}</div>
          <button @click="sidebarOpen = false" class="text-slate-400 hover:text-slate-900">✕</button>
        </div>

        <nav class="flex flex-col gap-4">
          <RouterLink to="/" @click="sidebarOpen = false" class="font-bold text-slate-600 hover:text-slate-900 py-2">🏠
            Beranda</RouterLink>
          <RouterLink to="/my-orders" @click="sidebarOpen = false"
            class="font-bold text-slate-600 hover:text-slate-900 py-2">📦 Cek Pesanan</RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/admin" @click="sidebarOpen = false"
            class="font-bold text-emerald-600 py-2">🛡️ Dashboard Admin</RouterLink>
          <hr class="border-slate-100" />
          <p class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kategori</p>
          <button v-for="c in categories" :key="c.id" @click="activeCategory = c.id; sidebarOpen = false"
            :class="[activeCategory === c.id ? 'text-slate-900 font-black' : 'text-slate-500 font-bold']"
            class="text-left py-2 flex items-center gap-2">
            <span>{{ c.icon }}</span> {{ c.label }}
          </button>
        </nav>

        <div class="mt-auto">
          <button v-if="authStore.isLoggedIn" @click="logout"
            class="w-full btn-secondary text-red-500 text-xs py-3 border-red-50">Keluar</button>
          <RouterLink v-else to="/auth" @click="sidebarOpen = false"
            class="w-full btn-primary text-center text-xs py-3">Masuk Akun</RouterLink>
        </div>
      </aside>
    </Transition>

    <!-- BACKDROP FOR SIDEBAR -->
    <Transition name="fade">
      <div v-if="sidebarOpen" @click="sidebarOpen = false"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"></div>
    </Transition>

    <!-- STICKY HEADER -->
    <header class="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl">
      <div class="container-shell h-20 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- MOBILE HAMBURGER -->
          <button @click="sidebarOpen = true" class="md:hidden p-2 text-slate-900 hover:bg-slate-50 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>

          <div class="flex items-center gap-2">
            <!-- DYNAMIC LOGO -->
            <div v-if="storeSettings?.logo_url"
              class="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg shadow-slate-200">
              <img :src="storeSettings.logo_url" class="h-full w-full object-cover" />
            </div>
            <div v-else
              class="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center bg-slate-900 rounded-xl sm:rounded-2xl text-white font-black italic shadow-lg shadow-slate-200">
              {{ storeSettings?.name?.[0] || 'N' }}
            </div>
            <div
              class="text-sm sm:text-lg font-black tracking-tighter italic mr-4 uppercase truncate max-w-[120px] sm:max-w-none">
              {{ storeSettings?.name || 'NESSASTORE' }}</div>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-6">
          <button v-for="c in categories" :key="c.id" @click="activeCategory = c.id"
            :class="[activeCategory === c.id ? 'font-black border-b-2 border-slate-900' : 'text-slate-500 font-bold']"
            class="text-xs pb-1 transition-all flex items-center gap-1 uppercase tracking-tighter">
            <span>{{ c.icon }}</span> {{ c.label }}
          </button>
        </div>

        <div class="flex gap-2">
          <RouterLink
            class="hidden sm:inline-flex btn-secondary py-2.5 text-[10px] uppercase font-black tracking-widest"
            to="/my-orders">📦 Pesanan</RouterLink>
          <RouterLink v-if="authStore.isAdmin"
            class="inline-flex btn-primary py-2.5 text-[10px] uppercase font-black tracking-widest bg-slate-900"
            to="/admin">🛡️ Admin</RouterLink>
          <RouterLink v-if="!authStore.isLoggedIn"
            class="hidden sm:inline-flex btn-secondary py-2.5 text-[10px] uppercase font-black tracking-widest"
            to="/auth">Masuk</RouterLink>
          <button v-else type="button"
            class="hidden sm:inline-flex btn-secondary py-2.5 text-[10px] uppercase font-black tracking-widest"
            @click="logout">Keluar</button>
        </div>
      </div>
    </header>

    <main class="py-10 sm:py-20 space-y-16 sm:space-y-24">
      <!-- SEARCH ENGINE: COMPARATOR HERO (REDUCED SIZE) -->
      <section class="max-w-3xl mx-auto text-center space-y-8 py-6 px-4">
        <div class="space-y-4">
          <h1 class="text-3xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
            Cari Barang, <br />
            <span class="text-emerald-500 italic">Harga Termurahnya!</span>
          </h1>
          <p class="text-slate-500 font-bold text-sm sm:text-base max-w-xl mx-auto opacity-70">
            Pecinta diskon bergabunglah! Kami bandingkan ribuan produk untuk Anda.
          </p>
        </div>

        <div class="relative group max-w-2xl mx-auto">
          <div
            class="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-[2rem] blur opacity-15 group-hover:opacity-100 transition duration-1000 group-hover:duration-200">
          </div>
          <div class="relative flex items-center bg-white rounded-[1.8rem] border-2 border-slate-100 p-1.5 shadow-2xl">
            <span class="pl-4 text-xl">🔍</span>
            <input v-model="searchQuery" type="text" placeholder="Gamis, Sepatu, dll..."
              class="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base font-black p-3 placeholder-slate-300" />
            <button
              class="bg-slate-900 text-white px-5 sm:px-8 py-3 rounded-[1.4rem] font-black text-[10px] sm:text-xs uppercase hover:bg-black transition-all transform active:scale-95 shadow-xl">
              CARI
            </button>
          </div>
        </div>

        <!-- SEARCH RESULTS PREVIEW (SMALER) -->
        <div v-if="searchQuery" class="mt-4 space-y-3 max-w-2xl mx-auto">
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
            class="bg-white/50 backdrop-blur-md rounded-[1.8rem] border border-slate-100 p-5 shadow-xl space-y-4 text-left">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Ditemukan {{
              displayResults.length }} Produk:</p>
            <div class="grid gap-3">
              <div v-for="(res, idx) in displayResults.slice(0, 5)" :key="res.id"
                class="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer"
                @click="handleBuy(res)">
                <div class="flex items-center gap-4">
                  <span class="text-[10px] font-black text-slate-300 w-4">#{{ idx + 1 }}</span>
                  <img :src="res.image_url || fallbackImage" class="h-10 w-10 rounded-xl object-cover" />
                  <div>
                    <h4 class="font-bold text-xs text-slate-800 line-clamp-1">{{ res.name }}</h4>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-[10px] font-black text-slate-900">Rp{{ formatPrice(res.price) }}</span>
                      <span
                        class="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded-full uppercase">Termurah</span>
                    </div>
                  </div>
                </div>
                <button
                  class="px-3 py-1.5 bg-slate-50 text-slate-900 rounded-lg font-black text-[9px] hover:bg-slate-900 hover:text-white transition-colors uppercase">
                  Lihat </button>
              </div>
            </div>
          </div>

          <!-- 3. IF NO RESULTS FOUND -->
          <div v-else class="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl text-center space-y-6">
            <div class="text-4xl">🔭</div>
            <div>
              <h3 class="text-lg font-black text-slate-900 tracking-tight">Oops! "{{ searchQuery }}" belum terkurasi.
              </h3>
              <p class="text-xs text-slate-500 font-medium">Mau robot mencarikannya sekarang?</p>
            </div>
            <div class="flex justify-center gap-2">
              <button type="button" @click="selectedSource = 'tiktok'"
                :class="[selectedSource === 'tiktok' ? 'bg-black text-white' : 'bg-slate-100 text-slate-400']"
                class="px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all">
                TikTok
              </button>
              <button type="button" @click="selectedSource = 'shopee'"
                :class="[selectedSource === 'shopee' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400']"
                class="px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all">
                Shopee
              </button>
            </div>
            <button @click="requestRobot(searchQuery)" :disabled="requesting"
              class="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-black text-xs shadow-lg hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest">
              {{ requesting ? 'Menghubungi Robot...' : '🤖 Carikan Harga Termurah!' }}
            </button>
          </div>
        </div>
      </section>

      <!-- PRODUCT GRID -->
      <section class="container-shell space-y-10">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-black flex items-center gap-3 italic">
            <span class="p-2 bg-white rounded-2xl shadow-sm">💎</span>
            {{ currentCategoryLabel }}
          </h2>
          <span class="text-xs font-bold text-slate-400 border-b-2 border-slate-100 pb-1">{{ filteredProducts.length }}
            Produk</span>
        </div>

        <div class="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-2 sm:px-0">
          <article v-for="p in filteredProducts" :key="p.id"
            @click="selectedProduct = p"
            class="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <!-- CARD IMAGE -->
            <div class="relative h-64 sm:h-72 overflow-hidden">
              <img :src="p.image_url || fallbackImage"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute top-4 left-4 flex flex-col gap-2">
                <span v-if="p.type === 'affiliate'"
                  class="bg-orange-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">🔥
                  Viral</span>
                <span v-if="p.is_smart_price"
                  class="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">🤖
                  Auto Price</span>
              </div>
            </div>

            <!-- CARD BODY -->
            <div class="p-6 sm:p-8 space-y-4">
              <h3
                class="font-bold text-base sm:text-lg text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3rem]">
                {{ p.name }}
              </h3>

              <div class="flex items-center justify-between border-t border-slate-50 pt-4">
                <div class="flex flex-col">
                  <span class="text-lg sm:text-xl font-black">Rp{{ formatPrice(p.price) }}</span>
                  <span v-if="p.is_smart_price"
                    class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Update {{
                      timeAgo(p.last_updated_at) }}</span>
                </div>
                <button @click.stop="handleBuy(p)"
                  class="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center bg-slate-900 text-white rounded-xl sm:rounded-2xl hover:bg-black transition-all transform active:scale-95 shadow-xl">
                  <span v-if="p.type === 'affiliate'">➡️</span>
                  <span v-else>🛒</span>
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- IF EMPTY -->
        <div v-if="filteredProducts.length === 0"
          class="py-20 text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 mx-4">
          <div class="text-6xl opacity-20">📦</div>
          <p class="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada produk untuk kategori ini</p>
        </div>
      </section>

      <!-- SOCIAL PROOF & BENEFITS (COMPACT) -->
      <section class="container-shell grid gap-4 sm:gap-8 md:grid-cols-3">
        <div v-for="point in benefits" :key="point.title"
          class="p-8 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm text-center space-y-3 hover:shadow-lg transition-shadow">
          <div
            class="h-12 w-12 mx-auto bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl shadow-lg shadow-slate-200">
            {{ point.icon }}
          </div>
          <h3 class="font-black text-slate-900 text-xs uppercase tracking-widest">{{ point.title }}</h3>
          <p class="text-[11px] text-slate-400 leading-relaxed font-medium">{{ point.desc }}</p>
        </div>
      </section>

      <!-- TESTIMONIALS (CLEANER) -->
      <section class="bg-slate-900 py-20 mt-20 relative overflow-hidden rounded-t-[3rem] sm:rounded-t-[5rem]">
        <div class="container-shell space-y-12 relative z-10">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-black text-white italic tracking-tighter uppercase">{{ storeSettings?.name ||
              'Nessa' }} TRUST</h2>
            <p class="text-slate-400 font-bold text-sm">Gak perlu ragu, kami bantu berhemat setiap hari.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <article v-for="testi in testimonies" :key="testi.name"
              class="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-5">
              <div class="flex text-yellow-500 gap-0.5 text-[10px]">
                <span v-for="i in 5" :key="i">⭐</span>
              </div>
              <p class="text-[13px] text-slate-300 italic font-medium leading-relaxed">"{{ testi.message }}"</p>
              <div class="flex items-center gap-3 pt-1">
                <div
                  class="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                  {{ testi.name[0] }}</div>
                <p class="font-black text-white text-[11px] uppercase tracking-wide">{{ testi.name }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

    </main>

    <!-- PRODUCT DETAIL MODAL -->
    <Transition name="fade">
      <div v-if="selectedProduct" 
           @click="selectedProduct = null"
           class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md cursor-pointer">
        <div @click.stop
             class="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col cursor-default">
          
          <!-- IMAGE SECTION (TOP ON MOBILE, TOP ON DESKTOP for 2xl width) -->
          <div class="h-64 sm:h-80 bg-slate-50 overflow-hidden relative">
            <img :src="selectedProduct.image_url || fallbackImage" class="h-full w-full object-cover" />
            <div class="absolute top-6 left-6">
               <span class="px-4 py-2 bg-white/90 backdrop-blur text-slate-900 rounded-full text-xs font-black uppercase shadow-lg">
                 📦 {{ selectedProduct.type }}
               </span>
            </div>
            <button @click="selectedProduct = null" 
                    class="absolute top-6 right-6 bg-white/90 backdrop-blur h-10 w-10 rounded-full flex items-center justify-center shadow-lg text-xl font-bold">✕</button>
          </div>

          <!-- CONTENT SECTION -->
          <div class="p-8 md:p-10 overflow-y-auto space-y-6 flex flex-col">
            <div class="space-y-2 text-center">
               <h2 class="text-2xl font-black text-slate-900 leading-tight italic">{{ selectedProduct.name }}</h2>
               <div class="text-2xl font-black text-emerald-600">Rp{{ formatPrice(selectedProduct.price) }}</div>
            </div>

            <div class="space-y-3">
              <h4 class="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Tentang Produk Ini</h4>
              <p class="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                {{ selectedProduct.description || "Tidak ada deskripsi tersedia untuk produk ini." }}
              </p>
            </div>

            <div class="pt-6 border-t border-slate-50 flex flex-col gap-3">
              <button @click="handleBuy(selectedProduct)" 
                      class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all transform active:scale-95 shadow-xl shadow-slate-200">
                🚀 {{ selectedProduct.type === 'affiliate' ? 'LIHAT DI MARKETPLACE' : 'BELI SEKARANG' }}
              </button>
              <button @click="selectedProduct = null" 
                      class="w-full py-3 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-colors">KEMBALI KE KATALOG</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- FOOTER -->
    <footer class="py-12 border-t border-slate-100 bg-white">
      <div class="container-shell flex flex-col items-center justify-between gap-8 md:flex-row">

        <div class="flex items-center gap-2">
          <div v-if="storeSettings?.logo_url" class="h-6 w-6 rounded-lg overflow-hidden">
            <img :src="storeSettings.logo_url" class="h-full w-full object-cover" />
          </div>
          <div class="text-xl font-black italic tracking-tighter uppercase">
            {{ storeSettings?.name || 'NESSASTORE' }}
          </div>
        </div>

        <div class="flex flex-col items-center gap-2">
          <div
            class="text-[9px] font-black text-slate-300 uppercase underline decoration-emerald-500/30 underline-offset-4 tracking-[0.2em] text-center">
            © 2026 {{ storeSettings?.name || 'NESSASTORE' }} • Smart Shop Hub
          </div>
          <div class="flex gap-4">
            <RouterLink to="/privacy"
              class="text-[10px] font-bold text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest">
              Privacy Policy
            </RouterLink>
            <RouterLink to="/terms"
              class="text-[10px] font-bold text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest">
              Terms
            </RouterLink>
          </div>
        </div>

        <div class="flex gap-4">
          <a href="#"
            class="text-slate-400 hover:text-slate-900 transition-colors font-black text-[10px] uppercase tracking-widest">Instagram</a>
          <a href="#"
            class="text-slate-400 hover:text-slate-900 transition-colors font-black text-[10px] uppercase tracking-widest">TikTok</a>
        </div>
      </div>

      <div class="container-shell mt-8 pt-6 border-t border-slate-50">
        <p class="text-[10px] text-slate-400 text-center leading-relaxed max-w-2xl mx-auto font-medium">
          NessaStore adalah platform kurasi produk otomatis. Kami berpartisipasi dalam program affiliate Involve Asia.
          Kami mungkin menerima komisi jika Anda membeli produk melalui link kami tanpa biaya tambahan bagi Anda.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
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
const robotResults = ref<any[]>([]);
const sidebarOpen = ref(false);
const selectedProduct = ref<any>(null);

const storeSettings = computed(() => settingsStore.store);

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];

  return productStore.products
    .filter((p) => (p.name || "").toLowerCase().includes(q))
    .filter((p) => Boolean((p as any).affiliate_click_url || p.affiliate_link || p.supplier_link))
    .sort((a, b) => Number(a.price) - Number(b.price));
});

const displayResults = computed(() => {
  const storeResults = searchResults.value;
  // Merges store results with robot results
  const combined = [...storeResults];

  // Only add robot results if they are not already in store
  robotResults.value.forEach(rr => {
    if (!combined.some(sr => sr.name === rr.name)) {
      combined.push(rr);
    }
  });

  return combined.sort((a, b) => Number(a.price) - Number(b.price));
});

async function requestRobot(query: string) {
  if (!query) return;
  requesting.value = true;
  robotResults.value = [];

  try {
    // 1. Trigger the search task
    const { data: taskData, error: taskErr } = await supabase
      .from("tasks")
      .insert({
        type: "global_search",
        status: "pending",
        data: { query, source: selectedSource.value }
      })
      .select()
      .single();

    if (taskErr || !taskData) throw new Error("Gagal hubungi robot.");

    const taskId = taskData.id;

    // 2. Poll for completion (max 20 seconds)
    let finished = false;
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1500));
      const { data: updated } = await supabase.from("tasks").select("*").eq("id", taskId).single();
      if (updated?.status === "completed") {
        if (updated.data?.results) {
          robotResults.value = updated.data.results;
          finished = true;
        }
        break;
      }
    }

    if (!finished) {
      alert("Robot sedang sibuk. Silakan tunggu beberapa saat lagi.");
    }

    // Still fetch products in case some were added
    await productStore.fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Koneksi ke robot terputus.");
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
  { title: "Kurasi TERMURAH", desc: "Barang viral berkualitas yang kami pasis untuk Anda.", icon: "💎" },
  { title: "Smart Price", desc: "Robot mengecek harga termurah setiap hari (Shopee/TikTok).", icon: "🤖" },
  { title: "Proses Cepat", desc: "Order diproses instan tanpa ribet antre lama.", icon: "⚡" }
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

let realtimeChannel: any = null;

onMounted(async () => {
  productStore.restoreCache();
  await Promise.all([
    productStore.fetchProducts(),
    settingsStore.fetchSettings()
  ]);
  realtimeChannel = productStore.subscribeToRealtime(false);
});

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }
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

/* Transitions */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
