

create extension if not exists vector;

create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_name text not null,
  url text,
  chunk_text text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists knowledge_chunks_source_type_idx
  on knowledge_chunks (source_type);

create table if not exists repos (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  url text not null,
  description text,
  languages jsonb not null default '[]'::jsonb,
  readme_summary text,
  tradeoffs text,
  last_synced_at timestamptz
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('chat', 'voice')),
  name text not null,
  email text not null,
  selected_slot timestamptz not null,
  status text not null default 'pending',
  external_booking_id text,
  created_at timestamptz not null default now()
);

create table if not exists eval_runs (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('chat', 'voice')),
  scenario text not null,
  latency_ms integer,
  grounded boolean,
  booking_success boolean,
  notes text,
  created_at timestamptz not null default now()
);
