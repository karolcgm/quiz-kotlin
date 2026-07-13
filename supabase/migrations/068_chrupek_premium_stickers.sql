-- Rozszerza działający katalog 60 naklejek o 20 rzadkich Chrupków premium.
-- ID 0-59 pozostają bez zmian. Premium zajmuje wyłącznie ID 60-79 i może
-- zostać przyznane przez nauczyciela albo po zweryfikowanym ukończeniu działu.

alter table public.student_stickers
  drop constraint if exists student_stickers_sticker_id_check;
alter table public.student_stickers
  add constraint student_stickers_sticker_id_check
  check (sticker_id between 0 and 79);

alter table public.student_reward_profiles
  drop constraint if exists student_reward_profiles_featured_sticker_id_check;
alter table public.student_reward_profiles
  add constraint student_reward_profiles_featured_sticker_id_check
  check (featured_sticker_id is null or featured_sticker_id between 0 and 79);

alter table public.teacher_sticker_awards
  drop constraint if exists teacher_sticker_awards_collection_id_check;
alter table public.teacher_sticker_awards
  add constraint teacher_sticker_awards_collection_id_check
  check (collection_id between 0 and 3);

alter table public.teacher_sticker_awards
  drop constraint if exists teacher_sticker_awards_sticker_id_check;
alter table public.teacher_sticker_awards
  add constraint teacher_sticker_awards_sticker_id_check
  check (sticker_id is null or sticker_id between 0 and 79);

create table if not exists public.student_section_premium_awards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  curriculum_id text not null,
  section_id text not null,
  sticker_id integer check (sticker_id is null or sticker_id between 60 and 79),
  required_topic_count integer not null check (required_topic_count > 0),
  completed_lesson_count integer not null check (completed_lesson_count >= 0),
  awarded_at timestamptz not null default now(),
  unique (student_id, school_id, curriculum_id, section_id)
);

create index if not exists student_section_premium_awards_student_idx
  on public.student_section_premium_awards(student_id, awarded_at desc);
create index if not exists student_section_premium_awards_school_class_idx
  on public.student_section_premium_awards(school_id, class_id, awarded_at desc);

alter table public.student_section_premium_awards enable row level security;

create policy "Students read own section premium awards"
  on public.student_section_premium_awards for select to authenticated
  using (student_id = auth.uid());

create policy "Teachers read section premium awards in their schools"
  on public.student_section_premium_awards for select to authenticated
  using (public.teacher_can_access_school(school_id));

-- Węższa funkcja niż grant_student_reward. Celowo nie jest dostępna dla
-- authenticated i nigdy nie przyjmuje kolekcji przekazanej przez klienta.
create or replace function public.grant_chrupek_premium_sticker(
  target_student_id uuid,
  target_source_type text,
  target_source_id text,
  target_reason text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  event_inserted integer := 0;
  sticker_inserted integer := 0;
  first_candidate integer;
  awarded_sticker integer;
begin
  if target_student_id is null
    or target_source_type not in ('teacher-premium', 'section-complete')
    or nullif(trim(target_source_id), '') is null
    or char_length(trim(target_reason)) not between 3 and 160 then
    raise exception 'Nieprawidłowe źródło nagrody premium.';
  end if;

  if not exists (
    select 1 from public.profiles profile
    where profile.id = target_student_id and profile.role = 'student'
  ) then
    raise exception 'Nagrodę premium można przyznać wyłącznie uczniowi.';
  end if;

  perform public.ensure_student_reward_profile(target_student_id);
  perform pg_advisory_xact_lock(hashtextextended(target_student_id::text, 20260713));

  insert into public.student_reward_events(student_id, source_type, source_id, reason, points)
  values (target_student_id, target_source_type, target_source_id, trim(target_reason), 0)
  on conflict do nothing;
  get diagnostics event_inserted = row_count;

  if event_inserted = 0 then
    return jsonb_build_object('awarded', false, 'reason', 'already-awarded');
  end if;

  first_candidate := 60 + mod(abs(hashtextextended(
    target_source_type || ':' || target_source_id || ':' || target_student_id::text,
    20260713
  )), 20)::integer;

  select candidate into awarded_sticker
  from (
    select 60 + mod((first_candidate - 60) + offset_value, 20) candidate,
      offset_value
    from generate_series(0, 19) offset_value
  ) available
  where not exists (
    select 1 from public.student_stickers owned
    where owned.student_id = target_student_id
      and owned.sticker_id = available.candidate
  )
  order by offset_value
  limit 1;

  if awarded_sticker is null then
    return jsonb_build_object('awarded', false, 'reason', 'collection-complete');
  end if;

  insert into public.student_stickers(student_id, sticker_id, source_type, source_id)
  values (target_student_id, awarded_sticker, target_source_type, target_source_id)
  on conflict do nothing;
  get diagnostics sticker_inserted = row_count;

  if sticker_inserted = 0 then
    raise exception 'Nie udało się zapisać unikatowej naklejki premium.';
  end if;

  insert into public.student_reward_notifications(student_id, kind, reward_key, title, message)
  values (
    target_student_id,
    'sticker',
    awarded_sticker::text,
    'Czeka na Ciebie niespodzianka!',
    'Otwórz klaser i odkryj, co udało Ci się zdobyć.'
  );

  return jsonb_build_object(
    'awarded', true,
    'stickerId', awarded_sticker,
    'collectionId', 3
  );
end;
$$;

revoke all on function public.grant_chrupek_premium_sticker(uuid, text, text, text)
  from public, anon, authenticated;

-- Zachowuje dotychczasowy przepływ kolekcji 0-2. Kolekcja 3 przechodzi przez
-- osobną funkcję premium i nadal wymaga relacji nauczyciel-klasa-szkoła.
create or replace function public.teacher_award_student_sticker(
  target_student_id uuid,
  target_collection integer,
  target_reason text,
  target_session_id uuid default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_teacher uuid := auth.uid();
  target_school uuid;
  target_class uuid;
  clean_reason text := trim(target_reason);
  award_id uuid;
  reward_result jsonb;
  awarded_sticker integer;
begin
  if current_teacher is null or not exists (
    select 1 from public.profiles
    where id = current_teacher and role = 'teacher' and status = 'active'
  ) then
    raise exception 'Wymagane aktywne konto nauczyciela.';
  end if;
  if target_collection not between 0 and 3 then
    raise exception 'Nieprawidłowa kolekcja naklejek.';
  end if;
  if char_length(clean_reason) < 3 or char_length(clean_reason) > 120 then
    raise exception 'Powód przyznania musi mieć od 3 do 120 znaków.';
  end if;

  if target_session_id is not null then
    select session.school_id, session.class_id
      into target_school, target_class
    from public.lesson_sessions session
    join public.lesson_session_participants participant
      on participant.session_id = session.id
      and participant.student_id = target_student_id
    where session.id = target_session_id
      and session.teacher_id = current_teacher
      and session.status = 'ended';
    if not found then
      raise exception 'Naklejkę po lekcji można przyznać tylko uczestnikowi własnej zakończonej sesji.';
    end if;
  else
    select member.school_id, member.class_id
      into target_school, target_class
    from public.class_members member
    join public.teacher_classes teacher_class on teacher_class.id = member.class_id
    where member.student_id = target_student_id
      and teacher_class.teacher_id = current_teacher
      and teacher_class.school_id = member.school_id
    order by member.created_at
    limit 1;
    if not found then
      raise exception 'Możesz nagrodzić wyłącznie ucznia ze swojej klasy.';
    end if;
  end if;

  insert into public.teacher_sticker_awards(
    teacher_id, student_id, school_id, class_id, session_id, collection_id, reason
  ) values (
    current_teacher, target_student_id, target_school, target_class,
    target_session_id, target_collection, clean_reason
  ) returning id into award_id;

  if target_collection = 3 then
    reward_result := public.grant_chrupek_premium_sticker(
      target_student_id,
      'teacher-premium',
      award_id::text,
      clean_reason
    );
  else
    reward_result := public.grant_student_reward(
      target_student_id,
      'teacher-award',
      award_id::text,
      clean_reason,
      0,
      target_collection,
      true
    );
  end if;

  awarded_sticker := nullif(reward_result ->> 'stickerId', '')::integer;
  if awarded_sticker is null then
    raise exception 'Uczeń ma już wszystkie naklejki z tej kolekcji.';
  end if;

  update public.teacher_sticker_awards
  set sticker_id = awarded_sticker
  where id = award_id;

  update public.student_reward_notifications
  set title = case when target_collection = 3
      then 'Niespodzianka od nauczyciela!'
      else 'Naklejka od nauczyciela!'
    end,
    message = clean_reason
  where id = (
    select notification.id
    from public.student_reward_notifications notification
    where notification.student_id = target_student_id
      and notification.kind = 'sticker'
      and notification.reward_key = awarded_sticker::text
      and notification.seen_at is null
    order by notification.created_at desc
    limit 1
  );

  return jsonb_build_object(
    'ok', true,
    'awardId', award_id,
    'stickerId', awarded_sticker,
    'collectionId', target_collection
  );
end;
$$;

revoke all on function public.teacher_award_student_sticker(uuid, integer, text, uuid)
  from public, anon;
grant execute on function public.teacher_award_student_sticker(uuid, integer, text, uuid)
  to authenticated;

-- Sprawdza pełny dział na podstawie aktywnego planu klasy i zapisanych ocen
-- lekcji. Parametry pochodzą wyłącznie z triggerów bazodanowych.
create or replace function public.try_award_chrupek_for_completed_section(
  target_student_id uuid,
  target_school_id uuid,
  target_class_id uuid,
  target_curriculum_id text,
  target_section_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  active_plan_id uuid;
  required_topics integer := 0;
  unfinished_topics integer := 0;
  completed_lessons integer := 0;
  claim_id uuid;
  reward_result jsonb;
  awarded_sticker integer;
begin
  if target_student_id is null or target_school_id is null or target_class_id is null
    or nullif(trim(target_curriculum_id), '') is null
    or nullif(trim(target_section_id), '') is null then
    return jsonb_build_object('awarded', false, 'reason', 'invalid-context');
  end if;

  if not exists (
    select 1 from public.class_members member
    where member.student_id = target_student_id
      and member.class_id = target_class_id
      and member.school_id = target_school_id
  ) then
    return jsonb_build_object('awarded', false, 'reason', 'student-outside-class');
  end if;

  select plan.id into active_plan_id
  from public.class_curriculum_plans plan
  where plan.school_id = target_school_id
    and plan.class_id = target_class_id
    and plan.curriculum_id = target_curriculum_id
    and plan.status = 'active'
  order by plan.created_at desc
  limit 1;

  if active_plan_id is null then
    return jsonb_build_object('awarded', false, 'reason', 'no-active-plan');
  end if;

  select
    count(*) filter (where entry.status <> 'skipped'),
    count(*) filter (where entry.status not in ('completed', 'skipped'))
  into required_topics, unfinished_topics
  from public.topic_plan_entries entry
  where entry.plan_id = active_plan_id
    and entry.section_id = target_section_id;

  if required_topics = 0 or unfinished_topics > 0 then
    return jsonb_build_object('awarded', false, 'reason', 'section-not-finished');
  end if;

  select count(distinct grade.lesson_id) into completed_lessons
  from public.lesson_session_grades grade
  where grade.student_id = target_student_id
    and grade.school_id = target_school_id
    and grade.class_id = target_class_id
    and grade.curriculum_id = target_curriculum_id
    and grade.section_id = target_section_id;

  if completed_lessons < required_topics then
    return jsonb_build_object(
      'awarded', false,
      'reason', 'student-section-incomplete',
      'completed', completed_lessons,
      'required', required_topics
    );
  end if;

  insert into public.student_section_premium_awards(
    student_id, school_id, class_id, curriculum_id, section_id,
    required_topic_count, completed_lesson_count
  ) values (
    target_student_id, target_school_id, target_class_id,
    target_curriculum_id, target_section_id, required_topics, completed_lessons
  )
  on conflict (student_id, school_id, curriculum_id, section_id) do nothing
  returning id into claim_id;

  if claim_id is null then
    return jsonb_build_object('awarded', false, 'reason', 'already-awarded');
  end if;

  reward_result := public.grant_chrupek_premium_sticker(
    target_student_id,
    'section-complete',
    target_school_id::text || ':' || target_curriculum_id || ':' || target_section_id,
    'Ukończenie całego działu ' || target_section_id
  );
  awarded_sticker := nullif(reward_result ->> 'stickerId', '')::integer;

  update public.student_section_premium_awards
  set sticker_id = awarded_sticker
  where id = claim_id;

  return reward_result;
end;
$$;

revoke all on function public.try_award_chrupek_for_completed_section(uuid, uuid, uuid, text, text)
  from public, anon, authenticated;

create or replace function public.reward_chrupek_after_lesson_grade_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.try_award_chrupek_for_completed_section(
    new.student_id,
    new.school_id,
    new.class_id,
    new.curriculum_id,
    new.section_id
  );
  return new;
end;
$$;

drop trigger if exists reward_chrupek_after_lesson_grade on public.lesson_session_grades;
create trigger reward_chrupek_after_lesson_grade
after insert or update of curriculum_id, section_id on public.lesson_session_grades
for each row execute function public.reward_chrupek_after_lesson_grade_trigger();

create or replace function public.reward_chrupek_after_plan_progress_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan public.class_curriculum_plans%rowtype;
  student_row record;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  select * into plan from public.class_curriculum_plans where id = new.plan_id;
  if plan.status <> 'active' then
    return new;
  end if;

  for student_row in
    select distinct grade.student_id
    from public.lesson_session_grades grade
    where grade.school_id = plan.school_id
      and grade.class_id = plan.class_id
      and grade.curriculum_id = plan.curriculum_id
      and grade.section_id = new.section_id
  loop
    perform public.try_award_chrupek_for_completed_section(
      student_row.student_id,
      plan.school_id,
      plan.class_id,
      plan.curriculum_id,
      new.section_id
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists reward_chrupek_after_plan_progress on public.topic_plan_entries;
create trigger reward_chrupek_after_plan_progress
after update of status on public.topic_plan_entries
for each row execute function public.reward_chrupek_after_plan_progress_trigger();

revoke all on function public.reward_chrupek_after_lesson_grade_trigger()
  from public, anon, authenticated;
revoke all on function public.reward_chrupek_after_plan_progress_trigger()
  from public, anon, authenticated;
