import { defineStore } from "pinia";
import { computed, ref } from "vue";
export const useCheckoutStore = defineStore("checkout", () => {
    const items = ref([]);
    const totalPrice = computed(() => items.value.reduce((sum, item) => sum + item.product.price * item.qty, 0));
    function addItem(product, qty = 1) {
        const existing = items.value.find((item) => item.product.id === product.id);
        if (existing) {
            existing.qty += qty;
            return;
        }
        items.value.push({ product, qty });
    }
    function removeItem(productId) {
        items.value = items.value.filter((item) => item.product.id !== productId);
    }
    function clear() {
        items.value = [];
    }
    return { items, totalPrice, addItem, removeItem, clear };
});
//# sourceMappingURL=checkout.js.map