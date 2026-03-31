alter table if exists public.crm_leads enable row level security;

drop policy if exists crm_leads_insert_anon on public.crm_leads;
create policy crm_leads_insert_anon
  on public.crm_leads
  for insert
  to anon
  with check (
    user_id is null and (normalized_email is not null or normalized_phone is not null)
  );

drop policy if exists crm_leads_insert_auth on public.crm_leads;
create policy crm_leads_insert_auth
  on public.crm_leads
  for insert
  to authenticated
  with check (
    public.is_cal_admin()
    or user_id = auth.uid()
    or (user_id is null and (normalized_email is not null or normalized_phone is not null))
  );

drop policy if exists crm_leads_select_auth on public.crm_leads;
create policy crm_leads_select_auth
  on public.crm_leads
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_cal_admin());

drop policy if exists crm_leads_update_auth on public.crm_leads;
create policy crm_leads_update_auth
  on public.crm_leads
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_cal_admin())
  with check (user_id = auth.uid() or public.is_cal_admin());
