<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <div class="min-h-screen bg-slate-50 py-10 px-4">
        <div class="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
            <!-- HEADER -->
            <div class="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-black italic tracking-tighter uppercase">Syarat & Ketentuan</h1>
                    <p class="text-slate-400 text-sm font-medium">Aturan Penggunaan Layanan</p>
                </div>
                <RouterLink to="/"
                    class="text-[10px] font-black bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all uppercase tracking-widest">
                    Kembali ke Beranda
                </RouterLink>
            </div>

            <!-- CONTENT -->
            <div class="p-8 md:p-12 space-y-8 text-slate-600 leading-relaxed font-medium">
                <section class="space-y-3">
                    <h2 class="text-xl font-black text-slate-900">1. Ketentuan Umum</h2>
                    <p>Dengan mengakses atau membeli di NessaStore, Anda setuju untuk terikat dengan syarat dan
                        ketentuan ini. Kami berhak mengubah ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya.
                    </p>
                </section>

                <section class="space-y-3">
                    <h2 class="text-xl font-black text-slate-900">2. Pemesanan & Pembayaran</h2>
                    <ul class="list-disc pl-5 space-y-2 marker:text-emerald-500">
                        <li>Semua pesanan tergantung pada ketersediaan stok.</li>
                        <li>Harga dapat berubah sewaktu-waktu sesuai kebijakan Smart Price Engine kami.</li>
                        <li>Pembayaran harus diselesaikan dalam waktu 24 jam setelah checkout.</li>
                    </ul>
                </section>

                <section class="space-y-3">
                    <h2 class="text-xl font-black text-slate-900">3. Pengiriman & Pengembalian</h2>
                    <p>Estimasi pengiriman bervariasi tergantung lokasi. Barang yang sudah dibeli tidak dapat
                        dikembalikan kecuali terdapat cacat produksi yang dibuktikan dengan video unboxing.</p>
                </section>
            </div>
        </div>
    </div>
</template>