See setup instructions in project files: supabase migration + edge functions + env example.
Run npm install then npm run dev for frontend.
Apply SQL from supabase/migrations/20260318_init.sql on Supabase SQL editor.
Deploy edge functions: create-midtrans-token and midtrans-webhook.
Set MIDTRANS_SERVER_KEY secret in Supabase for payment token and webhook validation.

Admin seeding otomatis:
1) Copy .env.admin.example ke .env.admin
2) Isi SUPABASE_SERVICE_ROLE_KEY dan ADMIN_EMAIL
3) Jalankan npm run seed:admin
