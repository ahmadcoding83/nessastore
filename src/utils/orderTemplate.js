export function buildSupplierOrderTemplate(input) {
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
//# sourceMappingURL=orderTemplate.js.map