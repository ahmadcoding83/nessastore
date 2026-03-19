-- 1. Tambah kolom pendukung Multi-Store
alter table public.stores 
add column if not exists description text,
add column if not exists logo_url text,
add column if not exists shopee_affiliate_id text,
add column if not exists tiktok_affiliate_id text,
add column if not exists subdomain text;

-- 2. Update RLS: Admin hanya bisa edit tokonya sendiri
drop policy if exists "stores_owner_or_admin" on public.stores;
create policy "stores_owner_or_admin"
on public.stores
for all
using (owner_id = auth.uid() or public.is_admin(auth.uid()))
with check (owner_id = auth.uid() or public.is_admin(auth.uid()));

-- 3. Izinkan publik melihat data dasar semua toko
drop policy if exists "Public read stores" on public.stores;
create policy "Public read stores" 
on public.stores 
for select 
using (true);
