import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { CartItem, Product } from "@/types/db";

export const useCheckoutStore = defineStore("checkout", () => {
  const items = ref<CartItem[]>([]);

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.qty, 0)
  );

  function addItem(product: Product, qty = 1) {
    const existing = items.value.find((item) => item.product.id === product.id);
    if (existing) {
      existing.qty += qty;
      return;
    }

    items.value.push({ product, qty });
  }

  function removeItem(productId: string) {
    items.value = items.value.filter((item) => item.product.id !== productId);
  }

  function clear() {
    items.value = [];
  }

  return { items, totalPrice, addItem, removeItem, clear };
});
