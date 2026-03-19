<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <div class="min-h-screen bg-slate-50 py-10 px-4">
        <div class="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
            <!-- HEADER -->
            <div class="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-black italic tracking-tighter uppercase">Kebijakan Privasi</h1>
                    <p class="text-slate-400 text-sm font-medium">Update Terakhir: Maret 2026</p>
                </div>
                <RouterLink to="/"
                    class="text-[10px] font-black bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all uppercase tracking-widest">
                    Kembali ke Beranda
                </RouterLink>
            </div>

            <!-- CONTENT -->
            <div class="p-8 md:p-12 space-y-8 text-slate-600 leading-relaxed font-medium">
                <section class="space-y-3">
                    <h2 class="text-xl font-black text-slate-900">1. Pendahuluan</h2>
                    <p>NessaStore ("Kami") menghargai privasi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan,
                        menggunakan, dan melindungi data pribadi Anda saat menggunakan layanan kami.</p>
                </section>

                <section class="space-y-3">
                    <h2 class="text-xl font-black text-slate-900">2. Data yang Kami Kumpulkan</h2>
                    <ul class="list-disc pl-5 space-y-2 marker:text-emerald-500">
                        <li><strong>Informasi Identitas:</strong> Nama, alamat email, dan nomor telepon saat Anda
                            mendaftar atau melakukan pemesanan.</li>
                        <li><strong>Data Transaksi:</strong> Rincian produk yang Anda beli dan alamat pengiriman.</li>
                        <li><strong>Data Teknis:</strong> Alamat IP dan jenis perangkat untuk keamanan sistem.</li>
                    </ul>
                </section>

                <section class="space-y-3">
                    <h2 class="text-xl font-black text-slate-900">3. Keamanan Data</h2>
                    <p>Kami menggunakan enkripsi SSL standar industri untuk melindungi transmisi data Anda. Kami tidak
                        menyimpan informasi kartu kredit Anda secara langsung; pembayaran diproses oleh gateway
                        pembayaran pihak ketiga (Midtrans).</p>
                </section>
            </div>
        </div>
    </div>
</template>