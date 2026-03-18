-- Backfill existing auth users into public.users
insert into public.users (id, email, role)
select au.id, au.email, 'customer'::public.app_role
from auth.users au
on conflict (id) do update
set email = excluded.email;

-- Allow authenticated user to create own profile row (fallback if trigger delayed)
drop policy if exists "users_insert_self_or_admin" on public.users;
create policy "users_insert_self_or_admin"
on public.users
for insert
to authenticated
with check (auth.uid() = id or public.is_admin(auth.uid()));
