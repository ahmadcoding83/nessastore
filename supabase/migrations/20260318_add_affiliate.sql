alter type public.product_type add value if not exists 'affiliate';

alter table public.products
add column if not exists affiliate_link text,
add column if not exists affiliate_network text,
add column if not exists affiliate_commission numeric(12,2) default 0;
