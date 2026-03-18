import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AppRole, UserProfile } from "@/types/db";

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeCode = (error as { code?: string }).code;
  return maybeCode === "PGRST116";
}

export const useAuthStore = defineStore("auth", () => {
  const session = ref<Session | null>(null);
  const user = ref<User | null>(null);
  const profile = ref<UserProfile | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  const isLoggedIn = computed(() => Boolean(user.value));
  const role = computed<AppRole>(() => profile.value?.role ?? "customer");
  const isAdmin = computed(() => role.value === "admin");

  async function fetchProfile(userId: string) {
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
        if (insertError) throw insertError;

        const { data: reloaded, error: reloadError } = await supabase
          .from("users")
          .select("id,email,role,created_at")
          .eq("id", userId)
          .single();

        if (reloadError) throw reloadError;
        profile.value = reloaded as UserProfile;
        return;
      }

      throw error;
    }

    profile.value = data as UserProfile;
  }

  async function init() {
    loading.value = true;

    const {
      data: { session: initialSession }
    } = await supabase.auth.getSession();

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
      } else {
        profile.value = null;
      }
    });

    loading.value = false;
    initialized.value = true;
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (!data.user) {
      throw new Error("Login gagal. Periksa email/password.");
    }

    return data;
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
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

