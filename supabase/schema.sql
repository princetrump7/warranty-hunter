create table if not exists warranties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_name text not null,
  brand text default '',
  store text default '',
  purchase_date date not null,
  warranty_months int not null default 12,
  expiry_date date not null,
  receipt_url text,
  notes text default '',
  created_at timestamptz default now()
);

alter table warranties enable row level security;

drop policy if exists "own rows" on warranties;
create policy "own rows" on warranties
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage: create private bucket `receipts` in dashboard.
-- Policy: authenticated users can upload/read own paths (prefix with user id).
