-- GA4 daily page metrics for /posts/* (data-driven SEO & demand prediction).
-- Apply in Supabase SQL Editor (or `supabase db push`). gsc_page_metrics already exists.

create table if not exists public.ga4_page_metrics (
  id bigserial primary key,
  page_path text not null,
  date date not null,
  sessions integer not null default 0,
  engaged_sessions integer not null default 0,
  engagement_rate double precision not null default 0,
  avg_engagement_time double precision not null default 0,
  conversions integer not null default 0,
  created_at timestamptz not null default now(),
  unique (page_path, date)
);

create index if not exists ga4_page_metrics_date_idx on public.ga4_page_metrics (date);
create index if not exists ga4_page_metrics_path_idx on public.ga4_page_metrics (page_path);
