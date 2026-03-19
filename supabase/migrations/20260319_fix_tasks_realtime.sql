-- Aktifkan Realtime untuk tabel tasks agar frontend bisa dengar perubahan
alter publication supabase_realtime add table public.tasks;

-- Pastikan RLS tasks mengizinkan insert dari user yang login
-- (untuk frontend yang pakai anon key dengan user yang sudah auth)
drop policy if exists "tasks_insert_authenticated" on public.tasks;
create policy "tasks_insert_authenticated"
on public.tasks
for insert
to authenticated, anon
with check (true);

drop policy if exists "tasks_select_authenticated" on public.tasks;
create policy "tasks_select_authenticated"
on public.tasks
for select
to authenticated, anon
using (true);

drop policy if exists "tasks_update_service" on public.tasks;
create policy "tasks_update_service"
on public.tasks
for update
using (true);
