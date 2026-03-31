-- Centralized intake records for pre-call + agenda + future student matching
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text,
  email text,
  normalized_email text,
  phone text,
  normalized_phone text,
  stage text not null default 'precall_pending',
  source text not null default 'precall',
  precall_data jsonb not null default '{}'::jsonb,
  agenda_data jsonb not null default '{}'::jsonb,
  booking_status text,
  last_booking_uid text,
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  meet_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_contact_at timestamptz not null default now(),
  constraint leads_contact_check check (
    user_id is not null or normalized_email is not null or normalized_phone is not null
  )
);

create index if not exists leads_user_id_idx on public.leads(user_id);
create index if not exists leads_normalized_email_idx on public.leads(normalized_email);
create index if not exists leads_normalized_phone_idx on public.leads(normalized_phone);
create index if not exists leads_stage_idx on public.leads(stage);
create index if not exists leads_last_booking_uid_idx on public.leads(last_booking_uid);

alter table public.appointments add column if not exists lead_id uuid references public.leads(id) on delete set null;
alter table public.appointments add column if not exists guest_phone text;
alter table public.appointments add column if not exists guest_phone_normalized text;

create index if not exists appointments_lead_id_idx on public.appointments(lead_id);
create index if not exists appointments_guest_phone_normalized_idx on public.appointments(guest_phone_normalized);

alter table public.leads enable row level security;

drop policy if exists leads_insert_anon on public.leads;
create policy leads_insert_anon
  on public.leads
  for insert
  to anon
  with check (
    user_id is null and (normalized_email is not null or normalized_phone is not null)
  );

drop policy if exists leads_insert_auth on public.leads;
create policy leads_insert_auth
  on public.leads
  for insert
  to authenticated
  with check (
    public.is_cal_admin()
    or user_id = auth.uid()
    or (user_id is null and (normalized_email is not null or normalized_phone is not null))
  );

drop policy if exists leads_select_auth on public.leads;
create policy leads_select_auth
  on public.leads
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_cal_admin());

drop policy if exists leads_update_auth on public.leads;
create policy leads_update_auth
  on public.leads
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_cal_admin())
  with check (user_id = auth.uid() or public.is_cal_admin());
