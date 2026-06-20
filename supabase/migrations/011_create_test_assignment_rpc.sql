-- Tworzy przypisanie testu do całej grupy lub wybranych uczniów (jedna transakcja).

create or replace function public.create_test_assignment(
  target_test_id uuid,
  target_class_id uuid,
  assignment_title text,
  max_attempts integer,
  due_at timestamptz default null,
  target_student_ids uuid[] default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_test public.tests%rowtype;
  v_class public.teacher_classes%rowtype;
  v_assignment_id uuid;
  v_student_id uuid;
  v_count integer := 0;
begin
  if v_teacher_id is null then
    raise exception 'Wymagane logowanie nauczyciela.';
  end if;

  if max_attempts < 1 or max_attempts > 5 then
    raise exception 'Liczba prób musi być od 1 do 5.';
  end if;

  select * into v_test
  from public.tests
  where id = target_test_id and teacher_id = v_teacher_id;

  if not found then
    raise exception 'Nie znaleziono testu.';
  end if;

  if v_test.status <> 'published' then
    raise exception 'Test musi być opublikowany przed wysłaniem do uczniów.';
  end if;

  select * into v_class
  from public.teacher_classes
  where id = target_class_id and teacher_id = v_teacher_id;

  if not found then
    raise exception 'Nie znaleziono klasy/grupy.';
  end if;

  if v_class.school_id <> v_test.school_id then
    raise exception 'Test i grupa muszą należeć do tej samej szkoły.';
  end if;

  insert into public.assignments (
    test_id,
    teacher_id,
    school_id,
    class_id,
    title,
    max_attempts,
    due_at,
    status,
    published_at
  )
  values (
    target_test_id,
    v_teacher_id,
    v_class.school_id,
    v_class.id,
    assignment_title,
    max_attempts,
    due_at,
    'published',
    now()
  )
  returning id into v_assignment_id;

  if target_student_ids is not null and coalesce(array_length(target_student_ids, 1), 0) > 0 then
    foreach v_student_id in array target_student_ids loop
      if exists (
        select 1
        from public.class_members cm
        where cm.class_id = v_class.id
          and cm.student_id = v_student_id
      ) then
        insert into public.assignment_students (assignment_id, student_id)
        values (v_assignment_id, v_student_id)
        on conflict do nothing;
        v_count := v_count + 1;
      end if;
    end loop;
  else
    insert into public.assignment_students (assignment_id, student_id)
    select v_assignment_id, cm.student_id
    from public.class_members cm
    where cm.class_id = v_class.id
    on conflict do nothing;

    get diagnostics v_count = row_count;
  end if;

  if v_count = 0 then
    delete from public.assignments where id = v_assignment_id;
    raise exception 'Brak uczniów w wybranej grupie. Dodaj uczniów przez zaproszenie.';
  end if;

  return v_assignment_id;
end;
$$;

revoke all on function public.create_test_assignment(uuid, uuid, text, integer, timestamptz, uuid[]) from public;
grant execute on function public.create_test_assignment(uuid, uuid, text, integer, timestamptz, uuid[]) to authenticated;
