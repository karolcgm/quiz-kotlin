-- Dodaje class_id do listy uczniów nauczyciela (używane przy wysyłce testów).

drop function if exists public.list_teacher_students();

create or replace function public.list_teacher_students()
returns table (
  student_id uuid,
  class_id uuid,
  first_name text,
  last_name text,
  display_name text,
  email text,
  class_name text,
  group_name text,
  school_name text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    cm.student_id,
    cm.class_id,
    p.first_name,
    p.last_name,
    p.display_name,
    p.email,
    tc.name,
    tc.group_name,
    s.name
  from public.class_members cm
  join public.teacher_classes tc on tc.id = cm.class_id
  join public.schools s on s.id = cm.school_id
  join public.profiles p on p.id = cm.student_id
  where tc.teacher_id = auth.uid()
     or public.teacher_can_access_school(cm.school_id)
  order by p.last_name nulls last, p.first_name nulls last, p.email;
$$;

revoke all on function public.list_teacher_students() from public;
grant execute on function public.list_teacher_students() to authenticated;
