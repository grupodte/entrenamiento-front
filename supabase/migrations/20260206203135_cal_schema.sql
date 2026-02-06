-- Cal.com scheduling schema (shared backend)
create extension if not exists "pgcrypto";

-- Profiles (if not already present)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- Onboarding (reserved for future use)
create table if not exists public.onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_user_id_idx on public.onboarding(user_id);

-- Cal account metadata (optional)
create table if not exists public.cal_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  cal_user_id text,
  cal_username text,
  created_at timestamptz not null default now()
);

create index if not exists cal_accounts_user_id_idx on public.cal_accounts(user_id);

-- Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_name text,
  guest_email text,
  status text not null default 'scheduled',
  start_at timestamptz,
  end_at timestamptz,
  cal_booking_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint appointments_guest_or_user check (user_id is not null or guest_email is not null)
);

create index if not exists appointments_user_id_idx on public.appointments(user_id);
create index if not exists appointments_guest_email_idx on public.appointments(guest_email);
create index if not exists appointments_cal_booking_id_idx on public.appointments(cal_booking_id);

-- Webhook audit
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  cal_booking_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helper function for admin checks (does not rely on RLS)
create or replace function public.is_cal_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.onboarding enable row level security;
alter table public.cal_accounts enable row level security;
alter table public.appointments enable row level security;
alter table public.webhook_events enable row level security;

-- Profiles policies
create policy profiles_self_select
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_cal_admin());

create policy profiles_self_insert
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid() or public.is_cal_admin());

create policy profiles_self_update
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() or public.is_cal_admin())
  with check (id = auth.uid() or public.is_cal_admin());

-- Onboarding policies
create policy onboarding_self_select
  on public.onboarding
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_cal_admin());

create policy onboarding_self_insert
  on public.onboarding
  for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_cal_admin());

create policy onboarding_self_update
  on public.onboarding
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_cal_admin())
  with check (user_id = auth.uid() or public.is_cal_admin());

-- Cal accounts (admin only)
create policy cal_accounts_admin_all
  on public.cal_accounts
  for all
  to authenticated
  using (public.is_cal_admin())
  with check (public.is_cal_admin());

-- Appointments policies
create policy appointments_insert_anon
  on public.appointments
  for insert
  to anon
  with check (user_id is null and guest_email is not null);

create policy appointments_insert_auth
  on public.appointments
  for insert
  to authenticated
  with check (user_id = auth.uid() or (user_id is null and guest_email is not null));

create policy appointments_select_auth
  on public.appointments
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_cal_admin());

create policy appointments_update_auth
  on public.appointments
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_cal_admin())
  with check (user_id = auth.uid() or public.is_cal_admin());

-- Webhook events (admin only)
create policy webhook_events_admin_select
  on public.webhook_events
  for select
  to authenticated
  using (public.is_cal_admin());
