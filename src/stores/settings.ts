import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";

export const useSettingsStore = defineStore("settings", () => {
  const store = ref<any>(null);
  const loading = ref(false);

  async function fetchSettings(userId?: string) {
    loading.value = true;
    try {
      let query = supabase.from("stores").select("*");
      if (userId) {
        query = query.eq("owner_id", userId);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      if (data) {
        store.value = data;
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      loading.value = false;
    }
  }

  return {
    store,
    loading,
    fetchSettings
  };
});
