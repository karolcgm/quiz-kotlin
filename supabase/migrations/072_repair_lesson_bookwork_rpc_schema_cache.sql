-- Ponowne wystawienie funkcji zapisu pracy z podręcznikiem. Argumenty są
-- zdefiniowane w kolejności pokazywanej przez PostgREST w błędzie PGRST202.

alter table public.lesson_sessions
  add column if not exists textbook_page integer
    check (textbook_page is null or textbook_page between 1 and 999),
  add column if not exists covered_exercises text[] not null default '{}'::text[];

drop function if exists public.update_lesson_session_bookwork(uuid, integer, text[]);
drop function if exists public.update_lesson_session_bookwork(text[], integer, uuid);

create function public.update_lesson_session_bookwork(
  target_exercises text[],
  target_page integer,
  target_session_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_exercises text[];
begin
  if auth.uid() is null then
    raise exception 'Wymagane logowanie.';
  end if;
  if not public.teacher_owns_lesson_session(target_session_id) then
    raise exception 'Tylko prowadzący może zapisać stronę i zadania.';
  end if;
  if target_page is null or target_page < 1 or target_page > 999 then
    raise exception 'Numer strony musi mieścić się w zakresie 1–999.';
  end if;

  select coalesce(array_agg(label order by first_position), '{}'::text[])
  into clean_exercises
  from (
    select trim(item.value) label, min(item.position) first_position
    from unnest(coalesce(target_exercises, '{}'::text[])) with ordinality as item(value, position)
    where trim(item.value) <> ''
    group by trim(item.value)
  ) labels;

  if cardinality(clean_exercises) < 1 or cardinality(clean_exercises) > 50 then
    raise exception 'Podaj od 1 do 50 przerobionych zadań.';
  end if;
  if exists (select 1 from unnest(clean_exercises) value where char_length(value) > 24) then
    raise exception 'Oznaczenie zadania może mieć najwyżej 24 znaki.';
  end if;

  update public.lesson_sessions
  set textbook_page = target_page,
      covered_exercises = clean_exercises,
      updated_at = now()
  where id = target_session_id;

  return jsonb_build_object(
    'ok', true,
    'textbookPage', target_page,
    'coveredExercises', to_jsonb(clean_exercises)
  );
end;
$$;

revoke all on function public.update_lesson_session_bookwork(text[], integer, uuid) from public, anon;
grant execute on function public.update_lesson_session_bookwork(text[], integer, uuid) to authenticated;

-- PostgREST odświeża listę funkcji bez czekania na automatyczne przeładowanie.
notify pgrst, 'reload schema';
