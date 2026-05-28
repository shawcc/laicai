create table if not exists public.agent_wallets (
  id uuid primary key default gen_random_uuid(),
  ai_player_id text not null references public.ai_players(id) on delete cascade,
  initial_budget integer not null default 10000,
  available_budget integer not null default 10000,
  allocated_budget integer not null default 0,
  settled_value integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(ai_player_id)
);

create table if not exists public.agent_positions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  ai_player_id text not null references public.ai_players(id) on delete cascade,
  option_id uuid not null references public.question_options(id) on delete cascade,
  allocated_points integer not null,
  confidence integer not null,
  submitted_at timestamptz not null default now(),
  time_multiplier numeric not null default 1,
  odds_multiplier numeric not null default 1,
  status text not null default 'open',
  payout_points integer,
  rationale text,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_cost_events (
  id uuid primary key default gen_random_uuid(),
  ai_player_id text not null references public.ai_players(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  run_id uuid,
  provider text not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_cny numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.agent_wallets enable row level security;
alter table public.agent_positions enable row level security;
alter table public.agent_cost_events enable row level security;

create policy "agent wallets readable" on public.agent_wallets
  for select using (true);

create policy "agent positions readable" on public.agent_positions
  for select using (true);

create policy "agent cost events readable" on public.agent_cost_events
  for select using (true);
