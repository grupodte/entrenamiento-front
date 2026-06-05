-- Rollback: Remove completed_at and abandoned_at columns
alter table public.leads drop column if exists completed_at;
alter table public.leads drop column if exists abandoned_at;

drop index if exists leads_completed_at_idx;
drop index if exists leads_abandoned_at_idx;
