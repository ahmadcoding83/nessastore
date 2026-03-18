-- Menambahkan kolom untuk fitur Smart Price (Fase 2)
alter table public.products
add column if not exists is_smart_price boolean not null default false,
add column if not exists last_updated_at timestamptz default now(),
add column if not exists marketplace_source text; -- shopee, tiktok, tokopedia, lazada

-- Menambahkan komentar untuk dokumentasi
comment on column public.products.is_smart_price is 'Apakah produk ini menggunakan fitur update harga otomatis (Smart Price)';
comment on column public.products.last_updated_at is 'Waktu terakhir harga diupdate oleh script scraper';
comment on column public.products.marketplace_source is 'Sumber marketplace untuk scraping harga';
