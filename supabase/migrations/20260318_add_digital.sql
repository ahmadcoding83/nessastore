alter type public.product_type add value if not exists 'digital';

alter table public.products
add column if not exists digital_file_path text,
add column if not exists digital_download_url text,
add column if not exists license_template text;
