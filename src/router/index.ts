import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "@/pages/LandingPage.vue";
import CheckoutPage from "@/pages/CheckoutPage.vue";
import AuthPage from "@/pages/AuthPage.vue";
import CustomerOrdersPage from "@/pages/CustomerOrdersPage.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage.vue";
import AdminProductsPage from "@/pages/admin/AdminProductsPage.vue";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage.vue";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "landing", component: LandingPage },
    { path: "/auth", name: "auth", component: AuthPage },
    { path: "/checkout", name: "checkout", component: CheckoutPage, meta: { requiresAuth: true } },
    {
      path: "/my-orders",
      name: "my-orders",
      component: CustomerOrdersPage,
      meta: { requiresAuth: true }
    },
    {
      path: "/admin",
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: "", name: "admin-dashboard", component: AdminDashboardPage },
        { path: "products", name: "admin-products", component: AdminProductsPage },
        { path: "orders", name: "admin-orders", component: AdminOrdersPage },
        { path: "settings", name: "admin-settings", component: () => import("@/pages/admin/AdminSettingsPage.vue") }
      ]
    }
  ]
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // WAIT FOR INITIALIZATION
  if (!authStore.initialized) {
     await authStore.init();
  }

  // PROTECTED ROUTES (AUTH)
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
     return { name: "auth", query: { redirect: to.fullPath } };
  }

  // PROTECTED ROUTES (ADMIN)
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
     return { name: "landing" };
  }

  return true;
});

export default router;
