-- Fix: Menambahkan kolom 'type' yang dibutuhkan robot NESSA v7.2
alter table public.tasks 
add column if not exists type text default 'global_search';

comment on column public.tasks.type is 'Jenis tugas: global_search (user request) atau update_price (cron)';