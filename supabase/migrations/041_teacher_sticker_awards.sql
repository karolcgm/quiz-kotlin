-- Nauczyciel może przyznać losową, nieposiadaną naklejkę wyłącznie uczniowi
-- ze swojej klasy lub uczestnikowi własnej, zakończonej sesji Live.

create table if not exists public.teacher_sticker_awards (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  session_id uuid references public.lesson_sessions(id) on delete set null,
  collection_id integer not null check (collection_id between 0 and 2),
  sticker_id integer check (sticker_id between 0 and 59),
  reason text not null check (char_length(reason) between 3 and 120),
  created_at timestamptz not null default now()
);

create index if not exists teacher_sticker_awards_teacher_created_idx
  on public.teacher_sticker_awards(teacher_id, created_at desc);
create index if not exists teacher_sticker_awards_student_created_idx
  on public.teacher_sticker_awards(student_id, created_at desc);

alter table public.teacher_sticker_awards enable row level security;

create policy "Teachers read own sticker awards"
  on public.teacher_sticker_awards for select
  using (teacher_id = auth.uid());

create policy "Students read received sticker awards"
  on public.teacher_sticker_awards for select
  using (student_id = auth.uid());

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
  if target_collection not between 0 and 2 then
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

  reward_result := public.grant_student_reward(
    target_student_id,
    'teacher-award',
    award_id::text,
    clean_reason,
    0,
    target_collection,
    true
  );
  awarded_sticker := nullif(reward_result ->> 'stickerId', '')::integer;

  if awarded_sticker is null then
    raise exception 'Uczeń ma już wszystkie naklejki z tej kolekcji.';
  end if;

  update public.teacher_sticker_awards
  set sticker_id = awarded_sticker
  where id = award_id;

  update public.student_reward_notifications
  set title = 'Naklejka od nauczyciela!', message = clean_reason
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
