<template>
  <section class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

      <!-- FORM SECTION -->
      <div class="space-y-6">
        <form class="bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100"
          @submit.prevent="saveProduct">
          <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="p-2 bg-slate-700 rounded-lg">📦</span>
              {{ form.id ? "Edit Produk Kurasi" : "Tambah Produk Baru" }}
            </h2>
            <p class="text-slate-400 text-sm mt-1">Kelola stok bait (umuan) dan hook (pancingan) Anda di sini.</p>
          </div>

          <!-- TABS STRATEGY -->
          <div class="p-2 bg-slate-50 border-b flex gap-1">
            <button v-for="t in (['dropship', 'stock', 'affiliate', 'digital'] as const)" :key="t" type="button"
              @click="form.type = t" :class="[
                'flex-1 py-2 px-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all',
                form.type === t ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600 bg-transparent'
              ]">
              {{ t }}
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- SECTION: INFORMASI DASAR -->
            <div class="space-y-4">
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Informasi Utama
                <span class="h-px flex-1 bg-slate-100"></span>
              </h3>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Nama Produk</label>
                  <input v-model="form.name" class="input-modern" placeholder="Contoh: Vacuum Cleaner Portable Viral"
                    required />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                  <textarea v-model="form.description" rows="3" class="input-modern"
                    placeholder="Jelaskan keunggulan produk ini..." required />
                </div>
                <div class="sm:col-span-2 space-y-2">
                  <label class="block text-sm font-semibold text-slate-700">URL Gambar / Foto Produk</label>
                  <div class="flex gap-3">
                    <input v-model="form.image_url" class="input-modern flex-1" placeholder="https://..." />
                    <label class="shrink-0 group cursor-pointer">
                      <div :class="[
                        'h-11 px-4 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 transition-all font-bold text-xs',
                        uploading ? 'bg-slate-50 text-slate-400' : 'bg-white hover:bg-slate-50 hover:border-slate-900 text-slate-600'
                      ]">
                        <span>{{ uploading ? 'UPDATING...' : '📷 UPLOAD FOTO' }}</span>
                      </div>
                      <input type="file" @change="onFileChange" class="hidden" accept="image/*" :disabled="uploading" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION: HARGA & GUDANG -->
            <div class="space-y-4">
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Finansial & Stok
                <span class="h-px flex-1 bg-slate-100"></span>
              </h3>
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Harga Jual (Rp)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 text-slate-400 font-bold text-sm">Rp</span>
                    <input v-model.number="form.price" type="number" class="input-modern pl-10" required />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Harga Modal (Rp)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 text-slate-400 font-bold text-sm">Rp</span>
                    <input v-model.number="form.cost_price" type="number" class="input-modern pl-10" required />
                  </div>
                </div>
                <div v-if="form.type === 'stock'">
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Stock Tersedia</label>
                  <input v-model.number="form.stock_qty" type="number" min="0" class="input-modern"
                    placeholder="Jumlah unit" />
                </div>
              </div>
            </div>

            <!-- SECTION: KHUSUS TIPE -->
            <div v-if="form.type === 'affiliate'"
              class="space-y-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <h3 class="text-xs font-black text-orange-600 uppercase tracking-widest">Affiliate Settings (The Bait)
              </h3>
              <input v-model="form.affiliate_link" class="input-modern border-orange-200 focus:border-orange-500"
                placeholder="Paste link affiliate marketplace" />

              <!-- TOMBOL AUTO-FILL -->
              <button type="button" @click="fetchProductInfo" :disabled="fetchingInfo || !form.affiliate_link" :class="[
                'w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs uppercase transition-all border-2',
                fetchingInfo
                  ? 'bg-orange-100 border-orange-200 text-orange-400 cursor-wait animate-pulse'
                  : 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-lg shadow-orange-200'
              ]">
                <span v-if="fetchingInfo">🤖 Robot Sedang Mengambil Info Produk...</span>
                <span v-else>✨ Auto-Fill dari Link (Robot)</span>
              </button>
              <p v-if="infoFetchStatus" class="text-xs font-bold text-center"
                :class="infoFetchStatus.includes('✅') ? 'text-emerald-600' : 'text-red-500'">{{ infoFetchStatus }}</p>
              <div class="grid gap-4 sm:grid-cols-2">
                <select v-model="form.affiliate_network" class="input-modern border-orange-200">
                  <option value="">Pilih Network</option>
                  <option value="shopee">Shopee</option>
                  <option value="tiktok">TikTok</option>
                  <option value="tokopedia">Tokopedia</option>
                  <option value="lazada">Lazada</option>
                </select>
                <div class="relative">
                  <input v-model.number="form.affiliate_commission" type="number"
                    class="input-modern border-orange-200 pr-8" placeholder="Komisi" />
                  <span class="absolute right-3 top-3 text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>

              <div class="flex items-center gap-3 pt-2">
                <input v-model="form.is_smart_price" type="checkbox" id="smart_price_field"
                  class="h-5 w-5 rounded-lg border-orange-300 text-orange-600 focus:ring-orange-500" />
                <label for="smart_price_field" class="text-sm font-bold text-orange-800 cursor-pointer">
                  Aktifkan Smart Price Engine
                  <span class="block text-xs font-normal text-orange-600">Robot akan memantau harga termurah setiap
                    hari.</span>
                </label>
              </div>

              <select v-if="form.is_smart_price" v-model="form.marketplace_source"
                class="input-modern border-orange-200">
                <option value="">Pilih Sumber Scraper</option>
                <option value="shopee">Shopee Indonesia</option>
                <option value="tiktok">TikTok Shop</option>
                <option value="tokopedia">Tokopedia</option>
                <option value="lazada">Lazada</option>
              </select>
            </div>

            <div v-if="form.type === 'digital'" class="space-y-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <h3 class="text-xs font-black text-blue-600 uppercase tracking-widest">Digital Fulfillment</h3>
              <input v-model="form.digital_download_url" class="input-modern border-blue-200"
                placeholder="Direct Link Download" />
              <textarea v-model="form.license_template" class="input-modern border-blue-200"
                placeholder="Format Lisensi / Pesan Otomatis (opsional)" />
            </div>

            <div v-if="form.type === 'dropship' || form.type === 'stock'"
              class="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest">Supplier Info (The Hook)</h3>
              <div class="grid gap-4 sm:grid-cols-2">
                <input v-model="form.supplier_name" class="input-modern" placeholder="Nama Toko/Supplier" />
                <input v-model="form.supplier_link" class="input-modern" placeholder="Link Produk Asli" />
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                class="flex-1 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
                type="submit" :disabled="saving">
                {{ saving ? "MENYIMPAN..." : (form.id ? "Update Data Produk" : "Simpan Ke Database") }}
              </button>
              <button class="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                type="button" @click="resetForm">
                Reset
              </button>
            </div>
            <p v-if="errorMsg"
              class="mt-4 text-center text-sm font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{{
              errorMsg }}</p>
          </div>
        </form>
      </div>

      <!-- LIST SECTION -->
      <div class="space-y-6">
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-black text-slate-900">Kurasi Anda</h2>
            <button @click="productStore.fetchProducts(true)"
              class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all active:rotate-180"
              title="Refresh Manual">
              🔄
            </button>
          </div>
          <span class="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">
            {{ productStore.products.length }} Produk
          </span>
        </div>

        <div class="grid gap-4">
          <article
            class="group bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all"
            v-for="product in productStore.products" :key="product.id"
            :class="{ 'opacity-60 grayscale-[0.5]': productStore.syncingIds?.[product.id] }">
            <div class="flex gap-4">
              <div
                class="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 relative">
                <img :src="product.image_url" v-if="product.image_url" class="h-full w-full object-cover" />
                <div v-else class="h-full w-full flex items-center justify-center text-2xl">📦</div>

                <!-- SYNCING OVERLAY -->
                <div v-if="productStore.syncingIds?.[product.id]"
                  class="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span class="text-xs font-black animate-pulse text-slate-900">SYNCING...</span>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-1.5 mb-1">
                      <span :class="[
                        'inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter',
                        product.type === 'affiliate' ? 'bg-orange-100 text-orange-600' :
                          product.type === 'digital' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                      ]">
                        {{ product.type }}
                      </span>
                      <span v-if="productStore.syncingIds?.[product.id]"
                        class="bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded font-black animate-pulse">
                        SINKRONISASI...
                      </span>
                    </div>
                    <h3 class="font-bold text-slate-900 break-words leading-snug">{{ product.name }}</h3>
                  </div>
                  <div class="flex gap-1" v-if="!productStore.syncingIds?.[product.id]">
                    <button
                      class="p-2 hover:bg-emerald-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors tooltip"
                      title="Cari Harga Termurah" v-if="product.type === 'affiliate'"
                      @click="triggerScrape(product.id)">
                      🤖
                    </button>
                    <button
                      class="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
                      @click="editProduct(product)">
                      ✏️
                    </button>
                    <button class="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors"
                      @click="removeProduct(product.id)">
                      🗑️
                    </button>
                  </div>
                </div>

                <div class="mt-2 flex items-center justify-between">
                  <div class="text-sm font-black text-slate-900">
                    Rp{{ formatPrice(product.price) }}
                  </div>
                  <div class="text-[10px] text-slate-400 font-bold uppercase">
                    Modal: <span class="text-slate-600">Rp{{ formatPrice(product.cost_price) }}</span>
                  </div>
                </div>

                <div v-if="product.is_smart_price"
                  class="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Smart Price Engine Aktif
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useProductStore } from "../../stores/product";
import { useSettingsStore } from "../../stores/settings";
import { supabase } from "@/lib/supabase";
import type { Product } from "../../types/db";

const productStore = useProductStore();
const settingsStore = useSettingsStore();
const errorMsg = ref("");
const uploading = ref(false);
const saving = ref(false);
const fetchingInfo = ref(false);
const infoFetchStatus = ref("");

const form = reactive<Partial<Product>>({
  id: "",
  store_id: "",
  name: "",
  description: "",
  price: 0,
  cost_price: 0,
  stock_qty: 0,
  image_url: "",
  supplier_name: "",
  supplier_link: "",
  affiliate_link: "",
  affiliate_network: "",
  affiliate_commission: 0,
  digital_file_path: "",
  digital_download_url: "",
  license_template: "",
  type: "dropship",
  is_active: true,
  is_smart_price: false,
  marketplace_source: "",
  last_updated_at: null
});

// SYNC COST PRICE FOR AFFILIATE
watch(() => form.price, (newVal) => {
  if (form.type === 'affiliate') {
    form.cost_price = newVal || 0;
  }
});

// AUTO DETECT PLATFORM FROM URL
watch(() => form.affiliate_link, (newUrl) => {
  if (!newUrl) return;
  const url = newUrl.toLowerCase();

  if (url.includes('shopee.co.id') || url.includes('shp.ee')) {
    form.affiliate_network = 'shopee';
    form.marketplace_source = 'shopee';
  } else if (url.includes('tiktok.com')) {
    form.affiliate_network = 'tiktok';
    form.marketplace_source = 'tiktok';
  } else if (url.includes('tokopedia.com') || url.includes('tokopedia.link')) {
    form.affiliate_network = 'tokopedia';
    form.marketplace_source = 'tokopedia';
  } else if (url.includes('lazada.co.id') || url.includes('lazada.com')) {
    form.affiliate_network = 'lazada';
    form.marketplace_source = 'lazada';
  }
});

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploading.value = true;
  errorMsg.value = "";
  try {
    const url = await productStore.uploadImage(file, form.type || "general");
    form.image_url = url;
  } catch (err) {
    errorMsg.value = "Gagal upload gambar. " + (err instanceof Error ? err.message : "");
  } finally {
    uploading.value = false;
  }
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

function resetForm() {
  saving.value = false;
  fetchingInfo.value = false;
  errorMsg.value = "";
  infoFetchStatus.value = "";

  form.id = "";
  form.store_id = "";
  form.name = "";
  form.description = "";
  form.price = 0;
  form.cost_price = 0;
  form.stock_qty = 0;
  form.image_url = "";
  form.supplier_name = "";
  form.supplier_link = "";
  form.affiliate_link = "";
  form.affiliate_network = "";
  form.affiliate_commission = 0;
  form.digital_file_path = "";
  form.digital_download_url = "";
  form.license_template = "";
  form.type = "dropship";
  form.is_active = true;
  form.is_smart_price = false;
  form.marketplace_source = "";
  form.last_updated_at = null;
}

function editProduct(product: Product) {
  form.id = product.id;
  form.store_id = product.store_id || "";
  form.name = product.name;
  form.description = product.description;
  form.price = product.price;
  form.cost_price = product.cost_price;
  form.stock_qty = product.stock_qty || 0;
  form.image_url = product.image_url || "";
  form.supplier_name = product.supplier_name || "";
  form.supplier_link = product.supplier_link || "";
  form.affiliate_link = product.affiliate_link || "";
  form.affiliate_network = product.affiliate_network || "";
  form.affiliate_commission = product.affiliate_commission || 0;
  form.digital_file_path = product.digital_file_path || "";
  form.digital_download_url = product.digital_download_url || "";
  form.license_template = product.license_template || "";
  form.type = product.type;
  form.is_active = product.is_active;
  form.is_smart_price = product.is_smart_price || false;
  form.marketplace_source = product.marketplace_source || "";
  form.last_updated_at = product.last_updated_at || null;
}

async function saveProduct() {
  errorMsg.value = "";
  saving.value = true;
  try {
    // Basic validation
    if (!form.name || !form.description) {
      errorMsg.value = "Nama dan deskripsi wajib diisi";
      return;
    }

    const payload = JSON.parse(JSON.stringify(form));

    // CLEANUP EMPTY UUID STRINGS
    if (payload.id === "") delete payload.id;
    if (payload.store_id === "") delete payload.store_id;

    // AUTO-ATTACH STORE ID
    if (!payload.store_id && settingsStore.store?.id) {
      payload.store_id = settingsStore.store.id;
    }

    // FINAL VALIDATION BEFORE SUPABASE
    if (!payload.store_id) {
       errorMsg.value = "⚠️ Data toko belum siap. Silakan refresh atau cek halaman Pengaturan Toko.";
       alert("❌ Gagal Simpan: ID Toko tidak ditemukan. Harap pastikan data toko sudah terisi di pengaturan.");
       return;
    }

    // Direct Supabase call + Optimistic Update
    const { data, error } = await supabase
      .from('products')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;

    // Update local state instantly without fetching
    if (data) {
      const index = productStore.products.findIndex((p: Product) => p.id === data.id);
      if (index !== -1) productStore.products[index] = data;
      else productStore.products.unshift(data);
    }

    alert("✅ Produk Berhasil Disimpan & Daftar Diupdate!");
    resetForm();
  } catch (err: any) {
    console.error("Save error detail:", err);
    errorMsg.value = `Gagal simpan: ${err?.message || "Koneksi terputus/Timeout"}`;
    alert(`❌ Gagal Simpan: ${err?.message || "Cek koneksi internet Anda"}`);
  } finally {
    saving.value = false;
  }
}

async function fetchProductInfo() {
  if (!form.affiliate_link) return;
  fetchingInfo.value = true;
  infoFetchStatus.value = "⏳ Menghubungi robot...";

  let taskChannel: ReturnType<typeof supabase.channel> | null = null;
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let resolved = false;

  const applyInfo = (info: any, platform?: string) => {
    if (resolved) return;
    resolved = true;
    if (info?.name) form.name = info.name;
    if (info?.description) form.description = info.description;
    if (info?.price) { form.price = info.price; form.cost_price = info.price; }
    if (info?.image_url) form.image_url = info.image_url;

    // Auto-select provider & type
    if (platform) {
      form.marketplace_source = platform;
      form.type = 'affiliate';
    }

    infoFetchStatus.value = "✅ Info produk berhasil diisi otomatis!";
  };

  try {
    // 1. Buat task untuk robot
    const { data: taskData, error: taskErr } = await supabase
      .from("tasks")
      .insert({ type: "scrape_product_info", status: "pending", data: { url: form.affiliate_link } })
      .select()
      .single();

    if (taskErr || !taskData) {
      console.error("Insert task error:", taskErr);
      throw new Error(`Gagal membuat task: ${taskErr?.message || "unknown"}`);
    }
    const taskId = taskData.id;
    console.log("[AutoFill] Task dibuat:", taskId);
    infoFetchStatus.value = "⏳ Robot sedang membaca halaman produk...";

    await new Promise<void>((resolve, reject) => {
      // 2a. TIMEOUT — 25 detik (Lebih cepat memberi feedback)
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error("Timeout: Robot tidak merespons. Pastikan robot (python nessa_scraper.py) sedang berjalan."));
        }
      }, 25000);

      // 2b. REALTIME subscription
      taskChannel = supabase
        .channel(`public:tasks:id=eq.${taskId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "tasks", filter: `id=eq.${taskId}` },
          (payload) => {
            const updated = payload.new as any;
            if (updated.status === "completed") {
              if (updated.data?.status === "error") {
                resolved = true;
                reject(new Error(updated.data?.error || "Gagal mengambil info"));
                return;
              }
              const info = updated.data?.product_info;
              applyInfo(info, updated.data?.platform);
              resolve();
            }
          }
        )
        .subscribe();

      // 2c. POLLING fallback (setiap 1.5 detik)
      pollInterval = setInterval(async () => {
        try {
          const { data } = await supabase
            .from("tasks")
            .select("status, data")
            .eq("id", taskId)
            .single();

          if (data?.status === "completed") {
            if (data.data?.status === "error") {
              resolved = true;
              reject(new Error(data.data?.error || "Gagal di robot"));
              return;
            }
            applyInfo(data.data?.product_info, data.data?.platform);
            resolve();
          } else if (data?.status === "error") {
            resolved = true;
            reject(new Error("Robot error"));
          }
        } catch (e) { /* ignore */ }
      }, 1500);
    });

    if (!resolved) {
      infoFetchStatus.value = "⚠️ Robot tidak dapat membaca info dari halaman ini (nama/harga kosong).";
    }
  } catch (err: any) {
    infoFetchStatus.value = `❌ ${err.message}`;
    console.error("[AutoFill] Error:", err);
  } finally {
    fetchingInfo.value = false;
    clearInterval(pollInterval!);
    clearTimeout(timeoutId!);
    if (taskChannel) await supabase.removeChannel(taskChannel);
    setTimeout(() => { infoFetchStatus.value = ""; }, 6000);
  }
}


async function triggerScrape(productId: string) {
  try {
    await productStore.createScrapeTask(productId);
    alert("Tugas scraping berhasil dibuat! Mohon tunggu robot bekerja (biasanya 10-20 detik).");
  } catch (err) {
    console.error("Scrape trigger error:", err);
    alert("Gagal membuat tugas scraping.");
  }
}

async function removeProduct(productId: string) {
  if (!confirm("Hapus produk ini?")) return;
  await productStore.deleteProduct(productId);
}

let realtimeChannel: any = null;

onMounted(async () => {
  productStore.restoreCache(true); // Load admin cache instantly
  await Promise.all([
    productStore.fetchProducts(true),
    settingsStore.fetchSettings()
  ]);
  realtimeChannel = productStore.subscribeToRealtime(true);
});

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }
});
</script>
