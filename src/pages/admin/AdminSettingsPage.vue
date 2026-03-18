<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">PENGATURAN TOKO</h1>
        <p class="text-slate-500 font-bold italic">Kelola identitas brand dan robot affiliate Anda.</p>
      </div>
      <button 
        @click="saveSettings" 
        :disabled="saving"
        class="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-black transition-all transform active:scale-95 disabled:opacity-50"
      >
        {{ saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN' }}
      </button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <div class="animate-spin text-4xl">⚙️</div>
      <p class="font-bold text-slate-400">Memuat Pengaturan...</p>
    </div>

    <div v-else class="space-y-8 pb-20">
      <!-- SECTION: BRAND IDENTITY -->
      <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          Identitas Toko
          <span class="h-px flex-1 bg-slate-50"></span>
        </h3>

        <div class="grid gap-6">
          <!-- LOGO UPLOAD BOX -->
          <div class="flex flex-col sm:flex-row items-center gap-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
             <div class="h-32 w-32 rounded-[2rem] bg-white border border-slate-200 overflow-hidden flex-shrink-0 relative group shadow-xl">
                <img v-if="form.logo_url" :src="form.logo_url" class="h-full w-full object-cover" />
                <div v-else class="h-full w-full flex items-center justify-center text-5xl">🏗️</div>
                <label class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                   <div class="text-center">
                     <span class="text-white text-[10px] font-black uppercase tracking-widest">Ganti</span>
                     <input type="file" @change="onLogoChange" class="hidden" accept="image/*" />
                   </div>
                </label>
             </div>
             
             <div class="flex-1 space-y-4 text-center sm:text-left">
                <div>
                   <h4 class="text-xl font-black text-slate-900 leading-none">Logo Brand Kamu</h4>
                   <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Minimal 512x512px • PNG/JPG</p>
                </div>
                
                <div class="flex flex-wrap justify-center sm:justify-start gap-4">
                   <label class="cursor-pointer">
                      <div class="px-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-2 text-xs font-black uppercase hover:bg-black transition-all shadow-lg active:scale-95">
                        📤 UPLOAD LOGO BARU
                      </div>
                      <input type="file" @change="onLogoChange" class="hidden" accept="image/*" />
                   </label>
                   <button @click="form.logo_url = ''" class="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-xs font-black uppercase hover:text-red-500 hover:border-red-100 transition-all">
                      Hapus
                   </button>
                </div>
                <input v-model="form.logo_url" type="text" class="input-modern bg-white text-[10px] h-8 py-0 opacity-50" placeholder="Link logo (otomatis terisi)" readonly />
             </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Nama Toko Online</label>
              <input v-model="form.name" type="text" class="input-modern" placeholder="Contoh: NESSASTORE Indonesia" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Deskripsi / Slogan Toko</label>
              <textarea v-model="form.description" rows="3" class="input-modern" placeholder="Tunjukkan keunikan toko Anda..." />
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION: ROBOT & AFFILIATE CONFIG -->
      <section class="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 lg:p-12 space-y-8 text-white relative overflow-hidden">
        <!-- ROBOT DECOR -->
        <div class="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <span class="text-9xl scale-150 rotate-12">🤖</span>
        </div>
        
        <div class="relative z-10">
          <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            Pusat Komando Robot Affiliate
            <span class="h-px flex-1 bg-white/10"></span>
          </h3>
          <p class="text-sm text-slate-400 font-medium">Robot NESSA akan menggunakan ID di bawah ini untuk semua link affiliate otomatis.</p>
        </div>

        <div class="grid gap-8 md:grid-cols-2 relative z-10">
          <!-- SHOPEE ID -->
          <div class="space-y-3">
            <label class="flex items-center gap-2 text-sm font-black text-orange-400 uppercase tracking-wide">
               <span class="h-8 w-8 bg-orange-400/20 rounded-xl flex items-center justify-center">🟠</span> Shopee Affiliate ID
            </label>
            <div class="relative">
              <input 
                v-model="form.shopee_affiliate_id" 
                type="text" 
                class="w-full bg-slate-800 border-2 border-white/5 rounded-2xl p-5 text-emerald-400 font-bold text-xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-white/5 shadow-inner"
                placeholder="an_xxxxxxxxx"
              />
              <div class="absolute right-5 top-5 opacity-20">🔗</div>
            </div>
            <p class="text-[10px] text-slate-500 font-bold italic uppercase tracking-widest pl-1">Digunakan untuk mensalin link Shopee.</p>
          </div>

          <!-- TIKTOK ID -->
          <div class="space-y-3">
            <label class="flex items-center gap-2 text-sm font-black text-emerald-400 uppercase tracking-wide">
               <span class="h-8 w-8 bg-emerald-400/20 rounded-xl flex items-center justify-center font-black">🎵</span> TikTok Affiliate ID
            </label>
            <div class="relative">
              <input 
                v-model="form.tiktok_affiliate_id" 
                type="text" 
                class="w-full bg-slate-800 border-2 border-white/5 rounded-2xl p-5 text-emerald-400 font-bold text-xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-white/5 shadow-inner"
                placeholder="USER_TIKTOK_XXXX"
              />
              <div class="absolute right-5 top-5 opacity-20">🎼</div>
            </div>
            <p class="text-[10px] text-slate-500 font-bold italic uppercase tracking-widest pl-1">Untuk link keranjang kuning TikTok Shop.</p>
          </div>
        </div>

        <div class="p-6 bg-white/5 rounded-3xl border border-white/10 mt-4 relative z-10">
           <div class="flex items-start gap-4">
              <span class="text-2xl mt-1">💡</span>
              <div>
                <p class="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1">Cara Sinkronisasi Robot:</p>
                <p class="text-[13px] text-slate-300 leading-relaxed font-medium">
                  Setelah klik **SIMPAN**, robot Anda (`nessa_scraper.py`) akan mendeteksi perubahan ID ini dalam **3 detik**. Semua link affiliate yang dibuat robot setelah ini akan langsung menggunakan ID baru Anda.
                </p>
              </div>
           </div>
        </div>
      </section>
    </div>

    <!-- NOTIFICATION POPUP -->
    <Transition name="slide-up">
       <div v-if="showSuccess" class="fixed bottom-10 inset-x-0 mx-auto w-fit bg-emerald-500 text-white px-10 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(16,185,129,0.3)] font-black z-[100] flex items-center gap-4">
          <div class="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
          <span class="tracking-tight text-lg">Konfigurasi Berhasil Disimpan!</span>
       </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";
import { useProductStore } from "@/stores/product";
import { useSettingsStore } from "@/stores/settings";

const authStore = useAuthStore();
const productStore = useProductStore();
const settingsStore = useSettingsStore();

const loading = ref(true);
const saving = ref(false);
const showSuccess = ref(false);

const form = reactive({
  id: "",
  name: "",
  description: "",
  logo_url: "",
  shopee_affiliate_id: "",
  tiktok_affiliate_id: ""
});

async function fetchStoreSettings() {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_id", authStore.user?.id)
      .maybeSingle();

    if (error) throw error;
    
    if (data) {
      form.id = data.id;
      form.name = data.name;
      form.description = data.description || "";
      form.logo_url = data.logo_url || "";
      form.shopee_affiliate_id = data.shopee_affiliate_id || "";
      form.tiktok_affiliate_id = data.tiktok_affiliate_id || "";
    } else {
       const { data: newStored, error: createError } = await supabase
         .from("stores")
         .insert({
           owner_id: authStore.user?.id,
           name: "Toko Baru Saya",
           subdomain: `store-${Math.floor(Math.random() * 1000)}`
         })
         .select()
         .single();
       
       if (createError) throw createError;
       form.id = newStored.id;
       form.name = newStored.name;
    }
  } catch (err) {
    console.error("Fetch settings error:", err);
  } finally {
    loading.value = false;
  }
}

async function saveSettings() {
  saving.value = true;
  try {
    const { error } = await supabase
      .from("stores")
      .update({
        name: form.name,
        description: form.description,
        logo_url: form.logo_url,
        shopee_affiliate_id: form.shopee_affiliate_id,
        tiktok_affiliate_id: form.tiktok_affiliate_id
      })
      .eq("id", form.id);

    if (error) throw error;
    
    // UPDATE GLOBAL STORE
    await settingsStore.fetchSettings();
    
    showSuccess.value = true;
    setTimeout(() => showSuccess.value = false, 3000);
  } catch (err) {
    alert("Gagal menyimpan pengaturan.");
    console.error(err);
  } finally {
    saving.value = false;
  }
}

async function onLogoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    saving.value = true;
    const publicUrl = await productStore.uploadImage(file, "brand");
    form.logo_url = publicUrl;
  } catch (err) {
    alert("Gagal upload logo.");
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchStoreSettings();
});
</script>

<style scoped>
.input-modern {
  @apply w-full rounded-2xl border-2 border-slate-100 p-4 font-bold text-slate-800 outline-none transition-all focus:border-slate-900 focus:bg-white bg-slate-50/50;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(50px) scale(0.9);
}
</style>
