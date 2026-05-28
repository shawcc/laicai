create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  favorite_team text,
  total_score integer not null default 0,
  available_points integer not null default 500,
  battle_score integer not null default 0,
  invite_code text unique,
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  match_label text not null,
  category text not null,
  status text not null default 'open',
  lock_at timestamptz not null,
  correct_option_id uuid,
  total_score integer not null default 0,
  human_participant_count integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null,
  description text
);

alter table public.questions
  add constraint questions_correct_option_fk
  foreign key (correct_option_id) references public.question_options(id);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  participant_type text not null check (participant_type in ('human', 'ai')),
  participant_id text not null,
  option_id uuid not null references public.question_options(id),
  confidence integer,
  reasoning text,
  is_correct boolean,
  earned_score integer,
  submitted_at timestamptz not null default now(),
  stake_points integer not null default 0,
  time_multiplier numeric not null default 1,
  difficulty_multiplier numeric not null default 1,
  potential_payout integer not null default 0,
  final_payout integer,
  unique(question_id, participant_type, participant_id)
);

create table if not exists public.ai_players (
  id text primary key,
  name text not null,
  provider text not null,
  model text,
  enabled boolean not null default true,
  system_prompt text,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_packages (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  summary_for_humans text not null,
  prompt_for_players text not null,
  facts jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.score_events (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id),
  participant_type text not null check (participant_type in ('human', 'ai')),
  participant_id text not null,
  score integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout integer not null default 0 check (rollout between 0 and 100),
  description text,
  updated_at timestamptz not null default now()
);

create table if not exists public.share_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question_id uuid references public.questions(id),
  image_url text,
  title text not null,
  created_at timestamptz not null default now()
);

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

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.predictions enable row level security;
alter table public.ai_players enable row level security;
alter table public.evidence_packages enable row level security;
alter table public.score_events enable row level security;
alter table public.feature_flags enable row level security;
alter table public.share_cards enable row level security;
alter table public.point_transactions enable row level security;
alter table public.invites enable row level security;
alter table public.daily_checkins enable row level security;

create policy "profiles are public readable" on public.profiles for select using (true);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "published questions readable" on public.questions for select using (true);
create policy "question options readable" on public.question_options for select using (true);
create policy "ai players readable" on public.ai_players for select using (true);
create policy "evidence readable" on public.evidence_packages for select using (true);
create policy "score events readable" on public.score_events for select using (true);
create policy "feature flags readable" on public.feature_flags for select using (true);
create policy "share cards readable" on public.share_cards for select using (true);
create policy "users read own point transactions" on public.point_transactions for select using (auth.uid() = user_id);
create policy "users read related invites" on public.invites for select using (auth.uid() = inviter_id or auth.uid() = invitee_id);
create policy "users create own invites" on public.invites for insert with check (auth.uid() = inviter_id);
create policy "users read own checkins" on public.daily_checkins for select using (auth.uid() = user_id);
create policy "users create own checkins" on public.daily_checkins for insert with check (auth.uid() = user_id);

create policy "predictions are public readable" on public.predictions
  for select using (true);

create policy "users insert own unlocked predictions" on public.predictions
  for insert with check (
    participant_type = 'human'
    and participant_id = auth.uid()::text
    and exists (
      select 1 from public.questions q
      where q.id = question_id and q.status = 'open' and q.lock_at > now()
    )
  );

create policy "users update own unlocked predictions" on public.predictions
  for update using (
    participant_type = 'human'
    and participant_id = auth.uid()::text
    and exists (
      select 1 from public.questions q
      where q.id = question_id and q.status = 'open' and q.lock_at > now()
    )
  )
  with check (
    participant_type = 'human'
    and participant_id = auth.uid()::text
    and exists (
      select 1 from public.questions q
      where q.id = question_id and q.status = 'open' and q.lock_at > now()
    )
  );

create or replace function public.refresh_question_score(target_question_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  participant_count integer;
begin
  select count(distinct participant_id)
    into participant_count
  from public.predictions
  where question_id = target_question_id
    and participant_type = 'human';

  update public.questions
  set
    human_participant_count = participant_count,
    total_score = participant_count
  where id = target_question_id;
end;
$$;

create or replace function public.refresh_question_score_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_question_score(coalesce(new.question_id, old.question_id));
  return coalesce(new, old);
end;
$$;

create trigger predictions_refresh_question_score
after insert or update or delete on public.predictions
for each row execute function public.refresh_question_score_trigger();
