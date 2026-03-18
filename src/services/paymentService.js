import { functionsBaseUrl, supabase } from "@/lib/supabase";
export async function createMidtransToken(payload) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error("Silakan login dulu untuk checkout.");
    }
    const response = await fetch(functionsBaseUrl + "/create-midtrans-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + session.access_token
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Gagal membuat token pembayaran.");
    }
    return (await response.json());
}
//# sourceMappingURL=paymentService.js.map