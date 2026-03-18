import { functionsBaseUrl, supabase } from "@/lib/supabase";

interface CheckoutPayload {
  customer_name: string;
  phone: string;
  address: string;
  items: Array<{ product_id: string; qty: number }>;
}

interface MidtransTokenResponse {
  order_id: string;
  payment_token: string;
}

export async function createMidtransToken(payload: CheckoutPayload): Promise<MidtransTokenResponse> {
  const {
    data: { session }
  } = await supabase.auth.getSession();

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

  return (await response.json()) as MidtransTokenResponse;
}
