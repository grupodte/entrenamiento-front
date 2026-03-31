do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'leads'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'crm_leads'
  ) then
    alter table public.leads rename to crm_leads;
  end if;
end
$$;

alter index if exists public.leads_user_id_idx rename to crm_leads_user_id_idx;
alter index if exists public.leads_normalized_email_idx rename to crm_leads_normalized_email_idx;
alter index if exists public.leads_normalized_phone_idx rename to crm_leads_normalized_phone_idx;
alter index if exists public.leads_stage_idx rename to crm_leads_stage_idx;
alter index if exists public.leads_last_booking_uid_idx rename to crm_leads_last_booking_uid_idx;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and column_name = 'lead_id'
  ) and exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'crm_leads'
  ) then
    alter table public.appointments
      drop constraint if exists appointments_lead_id_fkey;

    alter table public.appointments
      add constraint appointments_lead_id_fkey
      foreign key (lead_id) references public.crm_leads(id) on delete set null;
  end if;
end
$$;
