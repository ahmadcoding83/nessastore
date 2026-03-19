<template>
  <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto space-y-8">
      
      <!-- HEADER -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-black text-slate-900 italic tracking-tight">CASHIER CHECKOUT</h1>
        <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Selesaikan Pembayaran Anda</p>
      </div>

      <!-- SUMMARY (TOP SMALL) -->
      <div class="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm flex items-center justify-between">
         <div class="flex items-center gap-3">
           <div class="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">🛒</div>
           <div>
             <div class="text-xs font-black text-slate-400 uppercase">Total Bayar</div>
             <div class="text-xl font-black text-emerald-600">Rp{{ formatPrice(checkoutStore.totalPrice) }}</div>
           </div>
         </div>
         <RouterLink to="/" class="text-[10px] font-black text-slate-300 hover:text-slate-900 group">
           BATALKAN <span class="group-hover:ml-1 transition-all">→</span>
         </RouterLink>
      </div>

      <!-- MAIN FORM -->
      <form class="bg-white rounded-[2.5rem] border border-slate-200 p-8 sm:p-10 shadow-2xl space-y-6" @submit.prevent="startPayment">
        <div class="space-y-4">
          <div class="group">
            <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Nama Lengkap</label>
            <input v-model="customerName" class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-slate-900 focus:ring-0 transition-all" placeholder="Misal: Ahmad Susiono" required />
          </div>

          <div class="group">
            <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Email Aktif</label>
            <input v-model="email" type="email" class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-slate-900 focus:ring-0 transition-all" placeholder="user@gmail.com" required />
          </div>

          <div class="group">
            <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">No WhatsApp</label>
            <input v-model="phone" class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-slate-900 focus:ring-0 transition-all" placeholder="08xxxxxxxxxxx" required />
          </div>

          <!-- DYNAMIC ADDRESS -->
          <div class="group" v-if="!isDigitalOnly">
            <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Alamat Lengkap</label>
            <textarea v-model="address" class="min-h-24 w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-slate-900 focus:ring-0 transition-all" placeholder="Jl. Anggrek No. 123..." required />
          </div>
          <div v-else class="p-5 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-100 text-center">
             <p class="text-xs font-bold text-blue-600">⚡ Produk Digital: Link download/akses akan dikirim langsung ke email <span class="underline">{{ email || 'Anda' }}</span> setelah pembayaran.</p>
          </div>
        </div>

        <button class="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all transform active:scale-95 disabled:opacity-50" type="submit" :disabled="loading || !checkoutStore.items.length">
          {{ loading ? "SEDANG MEMPROSES..." : "KONFIRMASI & BAYAR" }}
        </button>

        <p v-if="errorMsg" class="text-[10px] text-center font-black text-red-500 bg-red-50 py-3 rounded-xl border border-red-100 animate-bounce">{{ errorMsg }}</p>

        <!-- SECURITY BADGE -->
        <div class="flex items-center justify-center gap-2 opacity-30 pt-4">
           <span class="text-xs">🔒</span>
           <span class="text-[9px] font-black uppercase tracking-widest text-slate-900">Pembayaran Aman via Midtrans</span>
        </div>
      </form>

      <!-- ITEMS PREVIEW (SMALLER) -->
      <div class="text-center">
         <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Item di Keranjang</p>
         <div class="flex flex-wrap justify-center gap-2">
            <span v-for="item in checkoutStore.items" :key="item.product.id" class="px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600 shadow-sm">
              {{ item.product.name }} (x{{ item.qty }})
            </span>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCheckoutStore } from "@/stores/checkout";
import { createMidtransToken } from "@/services/paymentService";

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: Record<string, unknown>) => void;
    };
  }
}

const router = useRouter();
const checkoutStore = useCheckoutStore();

const customerName = ref("");
const email = ref("");
const phone = ref("");
const address = ref("");
const loading = ref(false);
const errorMsg = ref("");

const isDigitalOnly = computed(() => {
  return checkoutStore.items.every(item => item.product.type === 'digital');
});

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

function loadMidtransScript() {
  const existing = document.getElementById("midtrans-snap");
  if (existing) return;

  const script = document.createElement("script");
  script.id = "midtrans-snap";
  script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
  script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "");
  document.head.appendChild(script);
}

async function startPayment() {
  if (!checkoutStore.items.length) {
    errorMsg.value = "Keranjang kosong.";
    return;
  }

  loading.value = true;
  errorMsg.value = "";

  try {
    const payload = {
      customer_name: customerName.value,
      customer_email: email.value,
      phone: phone.value,
      address: isDigitalOnly.value ? "Digital Delivery" : address.value,
      items: checkoutStore.items.map((item) => ({
        product_id: item.product.id,
        qty: item.qty
      }))
    };

    const payment = await createMidtransToken(payload);

    if (!window.snap) {
      throw new Error("Snap belum siap. Coba ulangi.");
    }

    window.snap.pay(payment.payment_token, {
      onSuccess: async () => {
        checkoutStore.clear();
        await router.push("/my-orders");
      },
      onPending: () => {
        router.push("/my-orders");
      },
      onError: () => {
        errorMsg.value = "Pembayaran gagal, silakan coba lagi.";
      },
      onClose: () => {
        errorMsg.value = "Popup pembayaran ditutup sebelum selesai.";
      }
    });
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : "Gagal memulai pembayaran.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadMidtransScript();
});
</script>
