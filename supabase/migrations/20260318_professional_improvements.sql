-- Menambahkan kolom is_featured untuk menandai produk unggulan di halaman utama.
alter table public.products
add column if not exists is_featured boolean not null default false;

-- Memberikan izin kepada pemilik toko untuk mengelola (membuat, mengubah, menghapus) produk mereka sendiri.
-- Kebijakan ini akan berjalan berdampingan dengan kebijakan admin yang sudah ada.
create policy "products_owner_write"
on public.products
for all
using (
  exists (
    select 1 from public.stores s
    where s.id = products.store_id and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.stores s
    where s.id = products.store_id and s.owner_id = auth.uid()
  )
);

-- Menambahkan trigger untuk sinkronisasi jika pengguna mengubah email di Auth.
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email on auth.users
for each row execute procedure public.handle_user_update();