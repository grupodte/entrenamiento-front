do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'crm_leads'
  ) then
    update public.appointments as a
    set
      precall_data = coalesce(a.precall_data, l.precall_data),
      guest_phone = coalesce(a.guest_phone, l.phone),
      guest_phone_normalized = coalesce(a.guest_phone_normalized, l.normalized_phone)
    from public.crm_leads as l
    where a.lead_id = l.id
      and (
        a.precall_data is null
        or a.precall_data = '{}'::jsonb
        or a.guest_phone is null
        or a.guest_phone_normalized is null
      );
  elsif exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'leads'
  ) then
    update public.appointments as a
    set
      precall_data = coalesce(a.precall_data, l.precall_data),
      guest_phone = coalesce(a.guest_phone, l.phone),
      guest_phone_normalized = coalesce(a.guest_phone_normalized, l.normalized_phone)
    from public.leads as l
    where a.lead_id = l.id
      and (
        a.precall_data is null
        or a.precall_data = '{}'::jsonb
        or a.guest_phone is null
        or a.guest_phone_normalized is null
      );
  end if;
end
$$;
