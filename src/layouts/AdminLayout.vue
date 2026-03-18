<template>
  <!-- WRAPPER: Fixed screen height to prevent body scrolling -->
  <div class="h-screen w-screen overflow-hidden bg-slate-50 flex">
    
    <!-- SIDEBAR: Fixed at left -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-72 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-100 flex flex-col shadow-2xl lg:shadow-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex h-full flex-col px-6 py-8">
        
        <!-- SIDEBAR BRANDING -->
        <div class="mb-10 px-2 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div v-if="settingsStore.store?.logo_url" class="h-10 w-10 rounded-2xl overflow-hidden shadow-lg shadow-slate-900/10">
               <img :src="settingsStore.store.logo_url" class="h-full w-full object-cover" />
            </div>
            <div v-else class="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-slate-900/20">
              {{ settingsStore.store?.name?.[0] || 'N' }}
            </div>
            <div>
              <h1 class="text-sm font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">
                {{ settingsStore.store?.name || 'NESSASTORE' }}
              </h1>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Management</p>
            </div>
          </div>
          <button @click="sidebarOpen = false" class="lg:hidden text-slate-400 hover:text-slate-900 focus:outline-none">
            ✕
          </button>
        </div>

        <!-- SIDEBAR NAVIGATION: Scrollable internally if many items -->
        <nav class="flex-1 space-y-1 overflow-y-auto pr-2 custom-scroll">
          <h3 class="px-2 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Menu</h3>
          
          <RouterLink 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all relative overflow-hidden active:scale-95"
            :class="[
              $route.path === item.path 
              ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            ]"
            @click="sidebarOpen = false"
          >
            <span class="text-lg opacity-80">{{ item.icon }}</span>
            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- SIDEBAR FOOTER -->
        <div class="mt-auto pt-6 shrink-0">
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1">Authenticated As</p>
            <p class="text-xs font-bold text-slate-700 truncate mb-3">{{ authStore.user?.email }}</p>
            <button @click="logout" class="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95">
              🚪 Keluar System
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- BACKDROP: For mobile sidebar -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
      @click="sidebarOpen = false"
    ></div>

    <!-- MAIN AREA: Independently scrollable -->
    <main class="flex-1 flex flex-col min-w-0 min-h-0">
      
      <!-- TOP HEADER: Fixed at top of main area -->
      <header class="shrink-0 z-30 px-4 sm:px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between">
        
        <!-- MOBILE TRIGGER & BREADCRUMB -->
        <div class="flex items-center gap-4">
          <button 
            type="button" 
            class="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all focus:outline-none"
            @click="sidebarOpen = true"
          >
            ≡
          </button>
          
          <div class="hidden sm:flex items-center gap-3">
             <div class="p-2 bg-slate-900 rounded-lg text-white text-[10px] font-black">
               {{ settingsStore.store?.name?.[0] || 'N' }}S
             </div>
             <h2 class="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight">
               Dashboard <span class="text-slate-300 px-1 mx-1">/</span> {{ $route.name || 'Overview' }}
             </h2>
          </div>
        </div>

        <!-- USER INFO / QUICK ACTIONS -->
        <div class="flex items-center gap-3">
           <div class="text-right mr-2 hidden md:block">
              <p class="text-xs font-black text-slate-900">{{ authStore.user?.email?.split('@')[0] }}</p>
              <p class="text-[10px] font-bold text-emerald-500 uppercase">Super Admin</p>
           </div>
           <div class="h-10 w-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white font-bold shadow-lg shadow-slate-300">
             {{ authStore.user?.email?.[0].toUpperCase() }}
           </div>
        </div>
      </header>

      <!-- CONTENT AREA: The only scrollable part -->
      <div class="flex-1 overflow-y-auto px-4 py-6 sm:px-8 custom-scroll">
        <RouterView />
      </div>
      
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, RouterView, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const sidebarOpen = ref(false);

const navItems = [
  { name: "Live Preview", path: "/", icon: "🌐" },
  { name: "Admin Dashboard", path: "/admin", icon: "📊" },
  { name: "Katalog Produk", path: "/admin/products", icon: "📦" },
  { name: "Pesanan Masuk", path: "/admin/orders", icon: "🧾" },
  { name: "Pengaturan Toko", path: "/admin/settings", icon: "⚙️" }
];

async function logout() {
  await authStore.signOut();
}

onMounted(() => {
  settingsStore.fetchSettings();
});
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 5px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 20px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
