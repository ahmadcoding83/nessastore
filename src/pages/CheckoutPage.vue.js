import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCheckoutStore } from "@/stores/checkout";
import { createMidtransToken } from "@/services/paymentService";
const router = useRouter();
const checkoutStore = useCheckoutStore();
const customerName = ref("");
const phone = ref("");
const address = ref("");
const loading = ref(false);
const errorMsg = ref("");
function formatPrice(value) {
    return new Intl.NumberFormat("id-ID").format(value);
}
function loadMidtransScript() {
    const existing = document.getElementById("midtrans-snap");
    if (existing)
        return;
    const script = document.createElement("script");
    script.id = "midtrans-snap";
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "");
    document.head.appendChild(script);
}
async function startPayment() {
    if (!checkoutStore.items.length) {
        errorMsg.value = "Keranjang kosong.";
        return;
    }
    loading.value = true;
    errorMsg.value = "";
    try {
        const payload = {
            customer_name: customerName.value,
            phone: phone.value,
            address: address.value,
            items: checkoutStore.items.map((item) => ({
                product_id: item.product.id,
                qty: item.qty
            }))
        };
        const payment = await createMidtransToken(payload);
        if (!window.snap) {
            throw new Error("Snap belum siap. Coba ulangi.");
        }
        window.snap.pay(payment.payment_token, {
            onSuccess: async () => {
                checkoutStore.clear();
                await router.push("/my-orders");
            },
            onPending: () => {
                router.push("/my-orders");
            },
            onError: () => {
                errorMsg.value = "Pembayaran gagal, silakan coba lagi.";
            },
            onClose: () => {
                errorMsg.value = "Popup pembayaran ditutup sebelum selesai.";
            }
        });
    }
    catch (error) {
        errorMsg.value = error instanceof Error ? error.message : "Gagal memulai pembayaran.";
    }
    finally {
        loading.value = false;
    }
}
onMounted(() => {
    loadMidtransScript();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "container-shell py-6" },
});
/** @type {__VLS_StyleScopedClasses['container-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-2xl font-black text-slate-900" },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-black']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "mt-1 text-sm text-slate-600" },
});
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-600']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]" },
});
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-[1.2fr_0.8fr]']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
    ...{ onSubmit: (__VLS_ctx.startPayment) },
    ...{ class: "card space-y-3" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ class: "w-full rounded-xl border p-3" },
    placeholder: "Nama",
    required: true,
});
(__VLS_ctx.customerName);
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ class: "w-full rounded-xl border p-3" },
    placeholder: "No HP",
    required: true,
});
(__VLS_ctx.phone);
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
    value: (__VLS_ctx.address),
    ...{ class: "min-h-28 w-full rounded-xl border p-3" },
    placeholder: "Alamat",
    required: true,
});
/** @type {__VLS_StyleScopedClasses['min-h-28']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "btn-primary w-full" },
    type: "submit",
    disabled: (__VLS_ctx.loading || !__VLS_ctx.checkoutStore.items.length),
});
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
(__VLS_ctx.loading ? "Memproses..." : "Bayar Sekarang");
if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-sm text-red-600" },
    });
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
    (__VLS_ctx.errorMsg);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "card space-y-3" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-lg font-bold text-slate-900" },
});
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-slate-900']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.checkoutStore.items))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
        key: (item.product.id),
        ...{ class: "flex justify-between text-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (item.product.name);
    (item.qty);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatPrice(item.product.price * item.qty));
    // @ts-ignore
    [startPayment, customerName, phone, address, loading, loading, checkoutStore, checkoutStore, errorMsg, errorMsg, formatPrice,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.hr)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between font-bold" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.formatPrice(__VLS_ctx.checkoutStore.totalPrice));
// @ts-ignore
[checkoutStore, formatPrice,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
//# sourceMappingURL=CheckoutPage.vue.js.map