create table if not exists markers (
  id uuid primary key,
  lat double precision not null,
  lng double precision not null,
  street_name text not null,
  details text not null,
  type text not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  confirmations text[] not null default array[]::text[],
  denials text[] not null default array[]::text[]
);

create table if not exists votes (
  marker_id uuid not null references markers(id) on delete cascade,
  user_id text not null,
  value integer not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (marker_id, user_id)
);

create index if not exists idx_markers_expires_at on markers(expires_at);
create index if not exists idx_markers_created_at on markers(created_at desc);
