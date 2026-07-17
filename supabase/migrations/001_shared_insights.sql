-- shared_insights: immutable result snapshots for Share Insight feature
-- Run this in the Supabase SQL editor.

create table if not exists shared_insights (
  id                   text        primary key,             -- nanoid(8), e.g. '7Fk2mQ9x'
  content_hash         text        unique not null,         -- sha256 of canonical fields (dedup key)
  occupation_id        text        not null,
  occupation_name      text        not null,
  country_scope        text        not null,                -- 'Canada' | 'USA' | 'Canada + USA'
  housing_type         text        not null,                -- '1br' | '2br' | 'townhouse' etc.
  city_results         jsonb       not null,                -- CityResult[]
  highest_score_city   text        not null,                -- name of top-scoring city in this run
  key_insight          text,                                -- generated one-liner
  income_display       text        not null default 'hidden', -- 'hidden' | 'range' | 'exact'
  income_range         text,                                -- '$80K–$90K' when income_display='range'
  income_exact         numeric,                             -- populated when income_display='exact'
  calculation_version  text        not null,                -- bump when scoring formula changes
  data_version         text        not null,                -- bump when city/housing data changes
  created_at           timestamptz not null default now(),
  last_accessed_at     timestamptz,
  access_count         integer     not null default 0
);

-- Indexes for cleanup queries and dedup lookups
create index if not exists shared_insights_content_hash_idx on shared_insights(content_hash);
create index if not exists shared_insights_created_at_idx   on shared_insights(created_at);
create index if not exists shared_insights_accessed_at_idx  on shared_insights(last_accessed_at);

-- RLS: public read; insert from anon (server-side API route)
alter table shared_insights enable row level security;

create policy "public read"
  on shared_insights for select
  using (true);

create policy "anon insert"
  on shared_insights for insert
  with check (true);

create policy "anon update access tracking"
  on shared_insights for update
  using (true)
  with check (true);

comment on table shared_insights is
  'Immutable public snapshots of City Fit Engine results. '
  'Personal income is not stored unless the user explicitly opts in. '
  'content_hash enables deduplication: identical inputs reuse the same share record. '
  'calculation_version + data_version pin the snapshot to the model state at generation time.';
