do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'i'
      and c.relname = 'appointments_cal_booking_id_unique_idx'
      and n.nspname = 'public'
  ) then
    if not exists (
      select 1
      from public.appointments
      where cal_booking_id is not null
      group by cal_booking_id
      having count(*) > 1
    ) then
      create unique index appointments_cal_booking_id_unique_idx
        on public.appointments(cal_booking_id)
        where cal_booking_id is not null;
    else
      raise notice 'Skipping appointments_cal_booking_id_unique_idx because duplicate cal_booking_id rows already exist';
    end if;
  end if;
end
$$;
