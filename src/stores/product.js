import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
const CACHE_KEY = "product-cache-v1";
const CACHE_TTL = 1000 * 60 * 5;
export const useProductStore = defineStore("products", () => {
    const products = ref([]);
    const loading = ref(false);
    function restoreCache() {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw)
            return;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
            products.value = parsed.data;
        }
    }
    function saveCache(items) {
        const payload = {
            data: items,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    }
    async function fetchProducts(includeInactive = false) {
        loading.value = true;
        try {
            let query = supabase.from("products").select("*").order("created_at", { ascending: false });
            if (!includeInactive) {
                query = query.eq("is_active", true);
            }
            const { data, error } = await query;
            if (error)
                throw error;
            products.value = (data ?? []);
            if (!includeInactive) {
                saveCache(products.value);
            }
        }
        finally {
            loading.value = false;
        }
    }
    async function upsertProduct(product) {
        // Un-reactive the object to be safe
        const productData = JSON.parse(JSON.stringify(product));
        // Auto-sync cost_price for affiliate
        if (productData.type === 'affiliate' && productData.price) {
            productData.cost_price = productData.price;
        }
        const payload = {
            ...productData,
            is_active: productData.is_active ?? true
        };
        if (!payload.id || payload.id === "") {
            delete payload.id;
        }
        const { error } = await supabase.from("products").upsert(payload);
        if (error)
            throw error;
        await fetchProducts(true);
    }
    async function deleteProduct(productId) {
        const { error } = await supabase.from("products").delete().eq("id", productId);
        if (error)
            throw error;
        await fetchProducts(true);
    }
    async function uploadImage(file, folder = "general") {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file);
        if (uploadError)
            throw uploadError;
        const { data } = supabase.storage.from("products").getPublicUrl(filePath);
        return data.publicUrl;
    }
    async function createScrapeTask(productId) {
        const { error } = await supabase
            .from("tasks")
            .insert({ product_id: productId, status: "pending" });
        if (error)
            throw error;
    }
    function subscribeToRealtime() {
        return supabase
            .channel("product-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
            fetchProducts(true);
        })
            .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
            fetchProducts(true);
        })
            .subscribe();
    }
    return {
        products,
        loading,
        restoreCache,
        fetchProducts,
        upsertProduct,
        deleteProduct,
        uploadImage,
        createScrapeTask,
        subscribeToRealtime
    };
});
//# sourceMappingURL=product.js.map