create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "users read own predictions" on public.predictions;
create policy "predictions are public readable" on public.predictions
  for select using (true);

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

drop trigger if exists predictions_refresh_question_score on public.predictions;
create trigger predictions_refresh_question_score
after insert or update or delete on public.predictions
for each row execute function public.refresh_question_score_trigger();
