-- Add tracking timestamps for pre-call completion and abandonment
alter table public.leads add column if not exists completed_at timestamptz;
alter table public.leads add column if not exists abandoned_at timestamptz;

create index if not exists leads_completed_at_idx on public.leads(completed_at);
create index if not exists leads_abandoned_at_idx on public.leads(abandoned_at);
