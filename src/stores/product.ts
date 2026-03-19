import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/db";

const CACHE_KEY = "product-cache-v1";
const CACHE_TTL = 1000 * 60 * 5;

interface CachedProductList {
  data: Product[];
  timestamp: number;
}

export const useProductStore = defineStore("products", () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const syncingIds = ref<Record<string, boolean>>({});

  async function fetchProducts(includeInactive = false, silent = false) {
    if (!silent) loading.value = true;
    
    try {
      let query = supabase
        .from("products")
        .select("*")
        .order("last_updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Optimistic merge or total replace
      products.value = (data ?? []) as Product[];
      
      const cacheKey = includeInactive ? `${CACHE_KEY}-admin` : CACHE_KEY;
      saveCache(products.value, cacheKey);
      
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      if (!silent) loading.value = false;
    }
  }

  function restoreCache(isAdmin = false) {
    const cacheKey = isAdmin ? `${CACHE_KEY}-admin` : CACHE_KEY;
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CachedProductList;
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        products.value = parsed.data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  function saveCache(items: Product[], key: string) {
    const payload: CachedProductList = {
      data: items,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(payload));
  }

  async function upsertProduct(product: Product) {
    const data = JSON.parse(JSON.stringify(product));
    data.last_updated_at = new Date().toISOString();

    if (data.type === 'affiliate') {
      data.cost_price = data.price ?? 0;
    }
    
    if (!data.id || data.id === "") delete data.id;

    const payload: any = {};
    for (const [k, v] of Object.entries(data)) {
      if ((k === "id" || k === "store_id") && (v === "" || v === null)) continue;
      payload[k] = v === "" ? null : v;
    }

    if (payload.id) syncingIds.value[payload.id] = true;

    try {
      let query;
      if (payload.id) {
        const targetId = payload.id;
        delete payload.id;
        query = supabase.from("products").update(payload).eq("id", targetId).select();
      } else {
        query = supabase.from("products").insert(payload).select();
      }

      const { error, data: result } = await query as any;
      if (error) throw error;

      const savedItem = result?.[0] || data;
      const index = products.value.findIndex(p => p.id === savedItem.id);
      if (index !== -1) {
        products.value[index] = { ...products.value[index], ...savedItem };
      } else {
        products.value.unshift(savedItem);
      }
      return savedItem;
    } finally {
      if (payload.id) delete syncingIds.value[payload.id];
    }
  }

  async function deleteProduct(productId: string) {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) throw error;
    products.value = products.value.filter(p => p.id !== productId);
  }

  async function uploadImage(file: File, folder: string = "general") {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("products").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function createScrapeTask(productId: string) {
    const { error } = await supabase
      .from("tasks")
      .insert({ product_id: productId, status: "pending" });
    if (error) throw error;
  }

  async function createSearchTask(query: string, source: string = 'tiktok') {
    const { error } = await supabase
      .from("tasks")
      .insert({ 
        type: "global_search", 
        status: "pending", 
        data: { query, source } 
      });
    if (error) throw error;
  }

  function subscribeToRealtime(includeInactive = false) {
    return supabase
      .channel(`product-changes-${includeInactive ? 'admin' : 'public'}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts(includeInactive, true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        fetchProducts(includeInactive, true);
      })
      .subscribe();
  }

  return {
    products,
    loading,
    syncingIds,
    restoreCache,
    fetchProducts,
    upsertProduct,
    deleteProduct,
    uploadImage,
    createScrapeTask,
    createSearchTask,
    subscribeToRealtime
  };
});
