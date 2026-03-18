<template>
  <div class="container-shell py-6">
    <h1 class="text-2xl font-black text-slate-900">Checkout</h1>
    <p class="mt-1 text-sm text-slate-600">Isi data pengiriman, lalu lanjut bayar dengan Midtrans Snap.</p>

    <div class="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
      <form class="card space-y-3" @submit.prevent="startPayment">
        <input v-model="customerName" class="w-full rounded-xl border p-3" placeholder="Nama" required />
        <input v-model="phone" class="w-full rounded-xl border p-3" placeholder="No HP" required />
        <textarea v-model="address" class="min-h-28 w-full rounded-xl border p-3" placeholder="Alamat" required />
        <button class="btn-primary w-full" type="submit" :disabled="loading || !checkoutStore.items.length">
          {{ loading ? "Memproses..." : "Bayar Sekarang" }}
        </button>
        <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      </form>

      <aside class="card space-y-3">
        <h2 class="text-lg font-bold text-slate-900">Ringkasan</h2>
        <article v-for="item in checkoutStore.items" :key="item.product.id" class="flex justify-between text-sm">
          <span>{{ item.product.name }} x{{ item.qty }}</span>
          <span>Rp{{ formatPrice(item.product.price * item.qty) }}</span>
        </article>
        <hr />
        <div class="flex justify-between font-bold">
          <span>Total</span>
          <span>Rp{{ formatPrice(checkoutStore.totalPrice) }}</span>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
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
const phone = ref("");
const address = ref("");
const loading = ref(false);
const errorMsg = ref("");

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
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
      phone: phone.value,
      address: address.value,
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
