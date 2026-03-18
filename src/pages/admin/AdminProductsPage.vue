<template>
  <section class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      
      <!-- FORM SECTION -->
      <div class="space-y-6">
        <form class="bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100" @submit.prevent="saveProduct">
          <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="p-2 bg-slate-700 rounded-lg">📦</span>
              {{ form.id ? "Edit Produk Kurasi" : "Tambah Produk Baru" }}
            </h2>
            <p class="text-slate-400 text-sm mt-1">Kelola stok bait (umuan) dan hook (pancingan) Anda di sini.</p>
          </div>

          <!-- TABS STRATEGY -->
          <div class="p-2 bg-slate-50 border-b flex gap-1">
            <button 
              v-for="t in (['dropship', 'stock', 'affiliate', 'digital'] as const)" 
              :key="t"
              type="button"
              @click="form.type = t"
              :class="[
                'flex-1 py-2 px-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all',
                form.type === t ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600 bg-transparent'
              ]"
            >
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
                  <input v-model="form.name" class="input-modern" placeholder="Contoh: Vacuum Cleaner Portable Viral" required />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                  <textarea v-model="form.description" rows="3" class="input-modern" placeholder="Jelaskan keunggulan produk ini..." required />
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
                  <input v-model.number="form.stock_qty" type="number" min="0" class="input-modern" placeholder="Jumlah unit" />
                </div>
              </div>
            </div>

            <!-- SECTION: KHUSUS TIPE -->
            <div v-if="form.type === 'affiliate'" class="space-y-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <h3 class="text-xs font-black text-orange-600 uppercase tracking-widest">Affiliate Settings (The Bait)</h3>
              <input v-model="form.affiliate_link" class="input-modern border-orange-200 focus:border-orange-500" placeholder="Paste link affiliate marketplace" />
              <div class="grid gap-4 sm:grid-cols-2">
                <select v-model="form.affiliate_network" class="input-modern border-orange-200">
                  <option value="">Pilih Network</option>
                  <option value="shopee">Shopee</option>
                  <option value="tiktok">TikTok</option>
                  <option value="tokopedia">Tokopedia</option>
                  <option value="lazada">Lazada</option>
                </select>
                <div class="relative">
                   <input v-model.number="form.affiliate_commission" type="number" class="input-modern border-orange-200 pr-8" placeholder="Komisi" />
                   <span class="absolute right-3 top-3 text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>
              
              <div class="flex items-center gap-3 pt-2">
                <input v-model="form.is_smart_price" type="checkbox" id="smart_price_field" class="h-5 w-5 rounded-lg border-orange-300 text-orange-600 focus:ring-orange-500" />
                <label for="smart_price_field" class="text-sm font-bold text-orange-800 cursor-pointer">
                  Aktifkan Smart Price Engine
                  <span class="block text-xs font-normal text-orange-600">Robot akan memantau harga termurah setiap hari.</span>
                </label>
              </div>

              <select v-if="form.is_smart_price" v-model="form.marketplace_source" class="input-modern border-orange-200">
                <option value="">Pilih Sumber Scraper</option>
                <option value="shopee">Shopee Indonesia</option>
                <option value="tiktok">TikTok Shop</option>
                <option value="tokopedia">Tokopedia</option>
                <option value="lazada">Lazada</option>
              </select>
            </div>

            <div v-if="form.type === 'digital'" class="space-y-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <h3 class="text-xs font-black text-blue-600 uppercase tracking-widest">Digital Fulfillment</h3>
              <input v-model="form.digital_download_url" class="input-modern border-blue-200" placeholder="Direct Link Download" />
              <textarea v-model="form.license_template" class="input-modern border-blue-200" placeholder="Format Lisensi / Pesan Otomatis (opsional)" />
            </div>

            <div v-if="form.type === 'dropship' || form.type === 'stock'" class="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest">Supplier Info (The Hook)</h3>
              <div class="grid gap-4 sm:grid-cols-2">
                <input v-model="form.supplier_name" class="input-modern" placeholder="Nama Toko/Supplier" />
                <input v-model="form.supplier_link" class="input-modern" placeholder="Link Produk Asli" />
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button class="flex-1 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold shadow-lg transition-all transform active:scale-95" type="submit">
                {{ form.id ? "Update Data Produk" : "Simpan Ke Database" }}
              </button>
              <button class="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all" type="button" @click="resetForm">
                Reset
              </button>
            </div>
            <p v-if="errorMsg" class="mt-4 text-center text-sm font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{{ errorMsg }}</p>
          </div>
        </form>
      </div>

      <!-- LIST SECTION -->
      <div class="space-y-6">
        <div class="flex items-center justify-between px-2">
          <h2 class="text-xl font-black text-slate-900">Kurasi Anda</h2>
          <span class="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full font-bold">
            {{ productStore.products.length }} Produk
          </span>
        </div>

        <div class="grid gap-4">
          <article 
            class="group bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all" 
            v-for="product in productStore.products" 
            :key="product.id"
          >
            <div class="flex gap-4">
              <div class="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                <img :src="product.image_url" v-if="product.image_url" class="h-full w-full object-cover" />
                <div v-else class="h-full w-full flex items-center justify-center text-2xl">📦</div>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div>
                    <span :class="[
                      'inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter mb-1',
                      product.type === 'affiliate' ? 'bg-orange-100 text-orange-600' :
                      product.type === 'digital' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                    ]">
                      {{ product.type }}
                    </span>
                    <h3 class="font-bold text-slate-900 break-words leading-snug">{{ product.name }}</h3>
                  </div>
                  <div class="flex gap-1">
                    <button 
                      class="p-2 hover:bg-emerald-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors tooltip" 
                      title="Cari Harga Termurah"
                      v-if="product.type === 'affiliate'"
                      @click="triggerScrape(product.id)"
                    >
                      🤖
                    </button>
                    <button class="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors" @click="editProduct(product)">
                      ✏️
                    </button>
                    <button class="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors" @click="removeProduct(product.id)">
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

                <div v-if="product.is_smart_price" class="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Smart Price Active ({{ product.marketplace_source }})
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
import { onMounted, reactive, ref, watch } from "vue";
import { useProductStore } from "../../stores/product";
import type { Product } from "../../types/db";

const productStore = useProductStore();
const errorMsg = ref("");
const uploading = ref(false);

const form = reactive<Partial<Product>>({
  id: "",
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
  marketplace_source: ""
});

// SYNC COST PRICE FOR AFFILIATE
watch(() => form.price, (newVal) => {
  if (form.type === 'affiliate') {
    form.cost_price = newVal || 0;
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
  form.id = "";
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
}

function editProduct(product: Product) {
  form.id = product.id;
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
}

async function saveProduct() {
  errorMsg.value = "";
  try {
    // Basic validation
    if (!form.name || !form.description) {
      errorMsg.value = "Nama dan deskripsi wajib diisi";
      return;
    }

    await productStore.upsertProduct(form);
    resetForm();
  } catch (error: any) {
    const details = error?.details || error?.hint || "";
    errorMsg.value = `Gagal: ${error?.message || "Error tidak dikenal"} ${details ? '('+details+')' : ''} [Code: ${error?.code || 'N/A'}]`;
    console.error("Save error full object:", error);
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

onMounted(async () => {
  await productStore.fetchProducts(true);
  productStore.subscribeToRealtime();
});
</script>
