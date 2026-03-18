import { onMounted, ref } from "vue";
import { supabase } from "@/lib/supabase";
const stats = ref([
    { label: "Total Produk", value: 0 },
    { label: "Order Pending", value: 0 },
    { label: "Order Paid", value: 0 },
    { label: "Order Shipped", value: 0 }
]);
async function loadStats() {
    const [products, pending, paid, shipped] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "shipped")
    ]);
    stats.value = [
        { label: "Total Produk", value: products.count || 0 },
        { label: "Order Pending", value: pending.count || 0 },
        { label: "Order Paid", value: paid.count || 0 },
        { label: "Order Shipped", value: shipped.count || 0 }
    ];
}
onMounted(loadStats);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['sm:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.stats))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        ...{ class: "card" },
        key: (item.label),
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-slate-500" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-500']} */ ;
    (item.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "mt-2 text-3xl font-black text-slate-900" },
    });
    /** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-black']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
    (item.value);
    // @ts-ignore
    [stats,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
//# sourceMappingURL=AdminDashboardPage.vue.js.map