create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'customer');
create type public.product_type as enum ('stock', 'dropship');
create type public.order_status as enum ('pending', 'paid', 'ordered_to_supplier', 'shipped');

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid null references public.stores(id) on delete set null,
  name text not null,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  cost_price numeric(12,2) not null check (cost_price >= 0),
  image_url text,
  supplier_link text,
  supplier_name text,
  type public.product_type not null default 'dropship',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  store_id uuid null references public.stores(id) on delete set null,
  customer_name text not null,
  phone text not null,
  address text not null,
  total_price numeric(12,2) not null check (total_price >= 0),
  status public.order_status not null default 'pending',
  payment_token text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty int not null check (qty > 0),
  price numeric(12,2) not null check (price >= 0)
);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.users u where u.id = uid and u.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "users_select_self_or_admin"
on public.users
for select
using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "users_update_self_or_admin"
on public.users
for update
using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "stores_owner_or_admin"
on public.stores
for all
using (owner_id = auth.uid() or public.is_admin(auth.uid()))
with check (owner_id = auth.uid() or public.is_admin(auth.uid()));

create policy "products_public_read"
on public.products
for select
using (is_active = true or public.is_admin(auth.uid()));

create policy "products_admin_write"
on public.products
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "orders_customer_read_own"
on public.orders
for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "orders_customer_insert_own"
on public.orders
for insert
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "orders_admin_update"
on public.orders
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "order_items_read_own_order"
on public.order_items
for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

create policy "order_items_insert_own_order"
on public.order_items
for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

create policy "order_items_admin_update"
on public.order_items
for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
