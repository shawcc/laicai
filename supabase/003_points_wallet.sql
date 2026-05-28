alter table public.profiles
  add column if not exists available_points integer not null default 500,
  add column if not exists battle_score integer not null default 0,
  add column if not exists invite_code text unique,
  add column if not exists invited_by uuid references public.profiles(id);

alter table public.predictions
  add column if not exists stake_points integer not null default 0,
  add column if not exists time_multiplier numeric not null default 1,
  add column if not exists difficulty_multiplier numeric not null default 1,
  add column if not exists potential_payout integer not null default 0,
  add column if not exists final_payout integer;

create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  balance_after integer,
  type text not null,
  reason text not null,
  ref_table text,
  ref_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid references auth.users(id) on delete set null,
  invite_code text not null,
  status text not null default 'pending',
  reward_points integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null default current_date,
  reward_points integer not null default 50,
  created_at timestamptz not null default now(),
  unique(user_id, checkin_date)
);

alter table public.point_transactions enable row level security;
alter table public.invites enable row level security;
alter table public.daily_checkins enable row level security;

create policy "users read own point transactions" on public.point_transactions
  for select using (auth.uid() = user_id);

create policy "users read related invites" on public.invites
  for select using (auth.uid() = inviter_id or auth.uid() = invitee_id);

create policy "users create own invites" on public.invites
  for insert with check (auth.uid() = inviter_id);

create policy "users read own checkins" on public.daily_checkins
  for select using (auth.uid() = user_id);

create policy "users create own checkins" on public.daily_checkins
  for insert with check (auth.uid() = user_id);
