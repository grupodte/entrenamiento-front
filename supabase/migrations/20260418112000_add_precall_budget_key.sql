do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'leads'
      and column_name = 'precall_data'
  ) then
    update public.leads
    set precall_data = jsonb_set(
      coalesce(precall_data, '{}'::jsonb),
      '{dispone99Mensuales}',
      'null'::jsonb,
      true
    )
    where not (coalesce(precall_data, '{}'::jsonb) ? 'dispone99Mensuales');
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and column_name = 'precall_data'
  ) then
    update public.appointments
    set precall_data = jsonb_set(
      coalesce(precall_data, '{}'::jsonb),
      '{dispone99Mensuales}',
      'null'::jsonb,
      true
    )
    where not (coalesce(precall_data, '{}'::jsonb) ? 'dispone99Mensuales');
  end if;
end
$$;
