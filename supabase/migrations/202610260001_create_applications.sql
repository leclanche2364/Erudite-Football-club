create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  player_name text not null check (char_length(player_name) between 2 and 100),
  pathway text not null check (pathway in ('residency', 'u10', 'u12', 'u14', 'u16')),
  academic_level text not null check (char_length(academic_level) between 2 and 120),
  primary_position text not null check (primary_position in ('Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Still exploring')),
  guardian_name text not null check (char_length(guardian_name) between 2 and 100),
  guardian_phone text not null check (char_length(guardian_phone) between 7 and 30),
  message text check (message is null or char_length(message) <= 1000),
  conduct_acknowledged boolean not null default false,
  medical_policy_acknowledged boolean not null default false,
  status text not null default 'new' check (status in ('new', 'reviewing', 'contacted', 'closed')),
  constraint applications_acknowledgements check (conduct_acknowledged and medical_policy_acknowledged)
);

create index if not exists applications_created_at_idx on public.applications (created_at desc);
create index if not exists applications_status_created_at_idx on public.applications (status, created_at desc);
create index if not exists applications_pathway_idx on public.applications (pathway);

alter table public.applications enable row level security;
revoke all on public.applications from anon, authenticated;
grant insert (player_name, pathway, academic_level, primary_position, guardian_name, guardian_phone, message, conduct_acknowledged, medical_policy_acknowledged) on public.applications to anon;
grant select on public.applications to authenticated;
grant update (status) on public.applications to authenticated;

drop policy if exists "Public can submit new applications" on public.applications;
create policy "Public can submit new applications" on public.applications for insert to anon
with check (status = 'new' and conduct_acknowledged and medical_policy_acknowledged);

drop policy if exists "Authenticated staff can read applications" on public.applications;
create policy "Authenticated staff can read applications" on public.applications for select to authenticated
using ((select auth.uid()) is not null);

drop policy if exists "Authenticated staff can update application status" on public.applications;
create policy "Authenticated staff can update application status" on public.applications for update to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);
