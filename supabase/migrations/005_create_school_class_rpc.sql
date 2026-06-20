-- Transactional teacher school/class creation.
-- Apply after 004_widgets_practice_and_progress.sql.

create or replace function public.create_school_with_class(
  school_name text,
  school_city text,
  class_name text,
  group_name text,
  school_grade integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_teacher_id uuid := auth.uid();
  created_school_id uuid;
  created_class_id uuid;
begin
  if current_teacher_id is null or not public.is_active_teacher() then
    raise exception 'Tylko aktywny nauczyciel może dodać szkołę i klasę.';
  end if;

  if nullif(trim(school_name), '') is null then
    raise exception 'Brak nazwy szkoły.';
  end if;

  if nullif(trim(class_name), '') is null then
    raise exception 'Brak nazwy klasy.';
  end if;

  if nullif(trim(group_name), '') is null then
    raise exception 'Brak nazwy grupy.';
  end if;

  if school_grade < 1 or school_grade > 8 then
    raise exception 'Klasa musi być liczbą od 1 do 8.';
  end if;

  insert into public.schools (name, city, created_by)
  values (trim(school_name), nullif(trim(school_city), ''), current_teacher_id)
  returning id into created_school_id;

  insert into public.teacher_school_memberships (school_id, teacher_id, created_by)
  values (created_school_id, current_teacher_id, current_teacher_id)
  on conflict (school_id, teacher_id) do nothing;

  insert into public.teacher_classes (
    school_id,
    teacher_id,
    name,
    group_name,
    school_grade
  )
  values (
    created_school_id,
    current_teacher_id,
    trim(class_name),
    trim(group_name),
    school_grade
  )
  returning id into created_class_id;

  return created_class_id;
end;
$$;

grant execute on function public.create_school_with_class(text, text, text, text, integer) to authenticated;
