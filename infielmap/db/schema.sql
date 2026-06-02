-- InfielMap — reports table
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

create extension if not exists "pgcrypto";

create table if not exists public.reports (
  id               uuid          primary key default gen_random_uuid(),
  created_at       timestamptz   not null,
  gender           text          not null check (gender in ('m', 'f', 'gm', 'gf')),
  origin_city      text          not null,
  destination_city text          not null,
  is_celebrity     boolean       not null default false,
  celebrity_type   text          check (celebrity_type in ('futbolista', 'cantante', 'presentador')),
  confirmed_count  integer       not null default 1,
  is_confirmed     boolean       not null default false
);

-- Auto-mark confirmed when confirmed_count reaches 3
create or replace function public.check_confirmed()
returns trigger language plpgsql as $$
begin
  if new.confirmed_count >= 3 then
    new.is_confirmed := true;
  end if;
  return new;
end;
$$;

create trigger trg_check_confirmed
  before insert or update of confirmed_count on public.reports
  for each row execute procedure public.check_confirmed();

-- Row-level security (read-only public, insert allowed for anon)
alter table public.reports enable row level security;

create policy "Anyone can read reports"
  on public.reports for select using (true);

create policy "Anyone can insert reports"
  on public.reports for insert with check (true);

-- Indexes for map queries
create index if not exists idx_reports_created_at    on public.reports (created_at desc);
create index if not exists idx_reports_origin        on public.reports (origin_city);
create index if not exists idx_reports_destination   on public.reports (destination_city);
create index if not exists idx_reports_is_celebrity  on public.reports (is_celebrity) where is_celebrity = true;
