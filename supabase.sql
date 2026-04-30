-- Drashti Hydration Tracker - Supabase Database
-- Run this in Supabase SQL Editor after creating your project.

create table if not exists public.hydration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  tumblers numeric(4,2) not null default 0 check (tumblers >= 0 and tumblers <= 2),
  liters numeric(5,2) generated always as (round((tumblers * 1.2)::numeric, 2)) stored,
  mood text,
  note text,
  daily_goal_liters numeric(5,2) not null default 2.4,
  streak_count integer not null default 0 check (streak_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, log_date)
);

-- Safe upgrades for an already deployed database
alter table public.hydration_logs
add column if not exists daily_goal_liters numeric(5,2) not null default 2.4;

alter table public.hydration_logs
add column if not exists streak_count integer not null default 0 check (streak_count >= 0);

alter table public.hydration_logs
add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_hydration_logs_user_date
on public.hydration_logs(user_id, log_date desc);

alter table public.hydration_logs enable row level security;

drop policy if exists "Users can read their own hydration logs" on public.hydration_logs;
create policy "Users can read their own hydration logs"
on public.hydration_logs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own hydration logs" on public.hydration_logs;
create policy "Users can insert their own hydration logs"
on public.hydration_logs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own hydration logs" on public.hydration_logs;
create policy "Users can update their own hydration logs"
on public.hydration_logs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own hydration logs" on public.hydration_logs;
create policy "Users can delete their own hydration logs"
on public.hydration_logs
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_hydration_logs_updated_at on public.hydration_logs;
create trigger trg_hydration_logs_updated_at
before update on public.hydration_logs
for each row
execute function public.set_updated_at();
