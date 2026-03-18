import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { supabase } from "@/lib/supabase";
function isNotFoundError(error) {
    if (!error || typeof error !== "object")
        return false;
    const maybeCode = error.code;
    return maybeCode === "PGRST116";
}
export const useAuthStore = defineStore("auth", () => {
    const session = ref(null);
    const user = ref(null);
    const profile = ref(null);
    const loading = ref(false);
    const initialized = ref(false);
    const isLoggedIn = computed(() => Boolean(user.value));
    const role = computed(() => profile.value?.role ?? "customer");
    const isAdmin = computed(() => role.value === "admin");
    async function fetchProfile(userId) {
        const { data, error } = await supabase
            .from("users")
            .select("id,email,role,created_at")
            .eq("id", userId)
            .single();
        if (error) {
            if (isNotFoundError(error) && user.value?.email) {
                const { error: insertError } = await supabase.from("users").insert({
                    id: userId,
                    email: user.value.email,
                    role: "customer"
                });
                if (insertError)
                    throw insertError;
                const { data: reloaded, error: reloadError } = await supabase
                    .from("users")
                    .select("id,email,role,created_at")
                    .eq("id", userId)
                    .single();
                if (reloadError)
                    throw reloadError;
                profile.value = reloaded;
                return;
            }
            throw error;
        }
        profile.value = data;
    }
    async function init() {
        loading.value = true;
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        session.value = initialSession;
        user.value = initialSession?.user ?? null;
        if (user.value) {
            await fetchProfile(user.value.id);
        }
        supabase.auth.onAuthStateChange(async (_event, newSession) => {
            session.value = newSession;
            user.value = newSession?.user ?? null;
            if (user.value) {
                await fetchProfile(user.value.id);
            }
            else {
                profile.value = null;
            }
        });
        loading.value = false;
        initialized.value = true;
    }
    async function signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error)
            throw error;
        if (!data.user) {
            throw new Error("Login gagal. Periksa email/password.");
        }
        return data;
    }
    async function signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error)
            throw error;
        return data;
    }
    async function signOut() {
        await supabase.auth.signOut();
        session.value = null;
        user.value = null;
        profile.value = null;
        // Redirect hand-off
        window.location.href = "/";
    }
    return {
        session,
        user,
        profile,
        loading,
        initialized,
        isLoggedIn,
        isAdmin,
        role,
        init,
        signIn,
        signUp,
        signOut
    };
});
//# sourceMappingURL=auth.js.map