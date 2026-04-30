-- Admin Dashboard Policy
-- Run this AFTER supabase.sql.
-- Replace your_admin_email@gmail.com with your real admin email.

drop policy if exists "Admin can read all hydration logs" on public.hydration_logs;

create policy "Admin can read all hydration logs"
on public.hydration_logs
for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower('your_admin_email@gmail.com')
);
