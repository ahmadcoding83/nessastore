-- Fix: Mengizinkan product_id bernilai NULL untuk task tipe 'global_search'
-- Jalankan script ini di Supabase SQL Editor untuk mengatasi error "null value in column product_id"
ALTER TABLE public.tasks ALTER COLUMN product_id DROP NOT NULL;