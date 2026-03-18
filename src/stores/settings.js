import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
export const useSettingsStore = defineStore("settings", () => {
    const store = ref(null);
    const loading = ref(false);
    async function fetchSettings() {
        loading.value = true;
        try {
            const { data, error } = await supabase.from("stores").select("*").maybeSingle();
            if (error)
                throw error;
            if (data) {
                store.value = data;
            }
        }
        catch (err) {
            console.error("Error fetching settings:", err);
        }
        finally {
            loading.value = false;
        }
    }
    return {
        store,
        loading,
        fetchSettings
    };
});
//# sourceMappingURL=settings.js.map