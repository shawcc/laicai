create table if not exists public.task_proposals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  match_label text,
  category text not null default 'custom',
  options jsonb not null default '[]'::jsonb,
  proposer_name text,
  source text not null default 'community',
  vote_count integer not null default 0,
  status text not null default 'proposed',
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_sources (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade,
  title text not null,
  source_name text,
  source_url text,
  source_type text not null default 'article',
  summary text,
  captured_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade,
  ai_player_id uuid references public.ai_players(id) on delete cascade,
  status text not null default 'queued',
  research_mode text not null default 'agent_research',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  evidence_count integer not null default 0,
  cited_evidence_ids jsonb not null default '[]'::jsonb,
  model_snapshot text,
  prompt_snapshot text,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.task_proposals enable row level security;
alter table public.evidence_sources enable row level security;
alter table public.agent_runs enable row level security;

create policy "task proposals readable" on public.task_proposals
  for select using (true);

create policy "task proposals insertable" on public.task_proposals
  for insert with check (true);

create policy "evidence sources readable" on public.evidence_sources
  for select using (true);

create policy "agent runs readable" on public.agent_runs
  for select using (true);
