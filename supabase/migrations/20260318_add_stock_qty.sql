alter table public.products
add column if not exists stock_qty int not null default 0;

alter table public.products
drop constraint if exists products_stock_qty_check;

alter table public.products
add constraint products_stock_qty_check check (stock_qty >= 0);
