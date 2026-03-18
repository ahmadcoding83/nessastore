import type { OrderItem } from "@/types/db";

interface SupplierTemplateInput {
  customerName: string;
  phone: string;
  address: string;
  items: Array<OrderItem & { products?: { name: string } | null }>;
}

export function buildSupplierOrderTemplate(input: SupplierTemplateInput): string {
  const productsLine = input.items
    .map((item) => {
      const productName = item.products?.name ?? "Produk";
      return "Produk: " + productName + "\nQty: " + item.qty;
    })
    .join("\n\n");

  return [
    "Halo kak, saya mau order:",
    "",
    productsLine,
    "",
    "Kirim ke:",
    "Nama: " + input.customerName,
    "HP: " + input.phone,
    "Alamat: " + input.address
  ].join("\n");
}
