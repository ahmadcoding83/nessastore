export type AppRole = "admin" | "customer";

export type OrderStatus =
  | "pending"
  | "paid"
  | "ordered_to_supplier"
  | "shipped";

export interface Product {
  id: string;
  store_id: string | null;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  stock_qty: number;
  image_url: string | null;
  supplier_link: string | null;
  supplier_name: string | null;
  affiliate_link: string | null;
  affiliate_network: string | null;
  affiliate_commission: number;
  digital_file_path: string | null;
  digital_download_url: string | null;
  license_template: string | null;
  type: "stock" | "dropship" | "affiliate" | "digital";
  is_active: boolean;
  is_smart_price: boolean;
  last_updated_at: string | null;
  marketplace_source: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface AppOrder {
  id: string;
  user_id: string;
  store_id: string | null;
  customer_name: string;
  phone: string;
  address: string;
  total_price: number;
  status: OrderStatus;
  payment_token: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  price: number;
  products?: Product;
}

export interface UserProfile {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
}




