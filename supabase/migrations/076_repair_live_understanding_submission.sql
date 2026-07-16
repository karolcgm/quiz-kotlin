-- Naprawa zapisu samooceny z końca lekcji Live.
-- Migracja jest idempotentna: uzupełnia środowiska, w których tabela albo
-- indeks unikalny nie zostały wdrożone razem z wcześniejszymi funkcjami RPC.

create table if not exists public.lesson_understanding_checks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  lesson_id text not null,
  lesson_version integer not null,
  curriculum_id text,
  section_id text,
  topic_id text,
  source_type text not null check (source_type in ('live', 'review')),
  source_session_id uuid not null references public.lesson_sessions(id) on delete cascade,
  review_id uuid references public.student_lesson_reviews(id) on delete cascade,
  understanding_level text not null check (understanding_level in ('understood', 'partial', 'not_understood')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (source_type = 'live' and review_id is null)
    or (source_type = 'review' and review_id is not null)
  )
);

create unique index if not exists lesson_understanding_checks_live_unique_idx
  on public.lesson_understanding_checks(student_id, source_session_id)
  where source_type = 'live';

alter table public.lesson_understanding_checks enable row level security;

create or replace function public.submit_live_lesson_understanding(
  target_session_id uuid,
  target_understanding_level text
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  student uuid := auth.uid();
  session_row public.lesson_sessions%rowtype;
  active_stage jsonb;
  saved public.lesson_understanding_checks%rowtype;
begin
  if student is null then raise exception 'Wymagane logowanie ucznia.'; end if;
  if target_understanding_level not in ('understood', 'partial', 'not_understood') then
    raise exception 'Wybierz jedną z trzech odpowiedzi.';
  end if;

  select session.* into session_row
  from public.lesson_sessions session
  join public.lesson_session_participants participant
    on participant.session_id = session.id and participant.student_id = student
  where session.id = target_session_id;
  if not found then raise exception 'Nie uczestniczyłeś w tej sesji.'; end if;

  active_stage := coalesce(session_row.stage_snapshot -> 'stages', '[]'::jsonb)
    -> session_row.active_stage_index;
  if session_row.status <> 'ended' and not (
    session_row.status = 'live' and active_stage ->> 'kind' = 'understanding'
  ) then
    raise exception 'Samoocena jest dostępna po zakończeniu lekcji albo na jej końcowym etapie.';
  end if;

  insert into public.lesson_understanding_checks(
    student_id, school_id, class_id, lesson_id, lesson_version,
    curriculum_id, section_id, topic_id, source_type, source_session_id,
    understanding_level
  ) values (
    student, session_row.school_id, session_row.class_id, session_row.lesson_id, session_row.lesson_version,
    session_row.stage_snapshot ->> 'curriculumId', session_row.stage_snapshot ->> 'sectionId',
    session_row.stage_snapshot ->> 'topicId', 'live', session_row.id, target_understanding_level
  ) on conflict (student_id, source_session_id) where source_type = 'live'
    do update set understanding_level = excluded.understanding_level, updated_at = now()
  returning * into saved;

  return jsonb_build_object(
    'ok', true,
    'understandingLevel', saved.understanding_level,
    'updatedAt', saved.updated_at
  );
end;
$$;

revoke all on function public.submit_live_lesson_understanding(uuid, text) from public, anon;
grant execute on function public.submit_live_lesson_understanding(uuid, text) to authenticated;
