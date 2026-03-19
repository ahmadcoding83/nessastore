-- Fix missing columns in public.stores
alter table public.stores 
add column if not exists description text,
add column if not exists logo_url text,
add column if not exists shopee_affiliate_id text,
add column if not exists tiktok_affiliate_id text;

-- Setup Storage Bucket "products" if not exists
insert into storage.buckets (id, name, public) 
values ('products', 'products', true)
on conflict (id) do nothing;

-- Setup Storage Policies for the "products" bucket
-- 1. Allow public read access to all files
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects 
for select using (bucket_id = 'products');

-- 2. Allow authenticated users to upload files to their own folders or any folder for now (since it's an admin-heavy app)
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload" on storage.objects 
for insert 
with check (
  bucket_id = 'products' 
  and auth.role() = 'authenticated'
);

-- 3. Allow authenticated users to update/delete their own files (or any in products bucket for now)
drop policy if exists "Authenticated Update" on storage.objects;
create policy "Authenticated Update" on storage.objects 
for update using (
  bucket_id = 'products' 
  and auth.role() = 'authenticated'
);

drop policy if exists "Authenticated Delete" on storage.objects;
create policy "Authenticated Delete" on storage.objects 
for delete using (
  bucket_id = 'products' 
  and auth.role() = 'authenticated'
);
