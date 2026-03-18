<template>
  <div class="gradient-bg flex min-h-screen items-center justify-center p-4">
    <div class="card w-full max-w-md space-y-10 p-10 shadow-2xl shadow-slate-200">
      
      <!-- LOGO & HEADING -->
      <div class="text-center space-y-3">
        <!-- DYNAMIC LOGO -->
        <div v-if="settingsStore.store?.logo_url" class="h-20 w-20 mx-auto rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50">
          <img :src="settingsStore.store.logo_url" class="h-full w-full object-cover" />
        </div>
        <div v-else class="h-16 w-16 mx-auto bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black italic shadow-2xl shadow-slate-200/50">
          {{ settingsStore.store?.name?.[0] || 'N' }}
        </div>
        
        <div class="space-y-1">
          <h1 class="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            {{ settingsStore.store?.name || 'NESSASTORE' }}
          </h1>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ settingsStore.store?.description ? 'Official Store' : 'Authentication Gate' }}</p>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="space-y-8">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">
            {{ isSignup ? "Buat Akun Member" : "Selamat Datang Kembali" }}
          </h2>
          <p class="text-xs font-semibold text-slate-400 max-w-[250px] mx-auto leading-relaxed">
            Silakan masukkan detail akun Anda untuk mengakses sistem {{ settingsStore.store?.name || 'NESSASTORE' }}.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-3">
             <div class="relative group">
                <input v-model="email" type="email" placeholder="Alamat Email" class="input-modern text-center" required />
             </div>
             <div class="relative group">
                <input v-model="password" type="password" placeholder="Password" class="input-modern text-center" required />
             </div>
          </div>
          
          <button class="btn-primary w-full py-4 text-sm font-black shadow-lg shadow-slate-200 active:scale-95 transition-all" type="submit" :disabled="loading">
            {{ loading ? "VERIFIKASI..." : (isSignup ? "DAFTAR SEKARANG" : "MASUK KE DASHBOARD") }}
          </button>
        </form>

        <div class="flex flex-col items-center gap-6">
          <button class="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-all hover:scale-105" @click="toggleMode">
            {{ isSignup ? "Sudah Jadi Member? Login Disini" : "Bukan Member? Daftar Akun Baru" }}
          </button>
          
          <RouterLink to="/" class="flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors">
            <span class="text-lg">←</span> Kembali Ke Beranda
          </RouterLink>
        </div>
      </div>

      <!-- MESSAGES -->
      <div v-if="infoMsg" class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10px] font-black text-emerald-700 text-center animate-pulse uppercase tracking-wider">
        {{ infoMsg }}
      </div>
      <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black text-red-600 text-center uppercase tracking-wider">
        {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const isSignup = ref(false);
const loading = ref(false);
const errorMsg = ref("");
const infoMsg = ref("");

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Autentikasi gagal";
}

function toggleMode() {
  isSignup.value = !isSignup.value;
  errorMsg.value = "";
  infoMsg.value = "";
}

async function submit() {
  loading.value = true;
  errorMsg.value = "";
  infoMsg.value = "";

  try {
    if (isSignup.value) {
      const signup = await authStore.signUp(email.value, password.value);

      if (!signup.session) {
        infoMsg.value = "Akun berhasil dibuat. Cek email untuk verifikasi, lalu login.";
        isSignup.value = false;
        return;
      }
    } else {
      await authStore.signIn(email.value, password.value);
    }

    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
    window.location.href = redirect; // Hard redirect to ensure store refresh
  } catch (error) {
    errorMsg.value = getErrorMessage(error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  settingsStore.fetchSettings();
});
</script>
