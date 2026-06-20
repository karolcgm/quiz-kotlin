-- Naprawa widoczności uczniów dla nauczyciela (RLS + lista przez RPC).

create or replace function public.teacher_can_view_student(target_student_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.class_members cm
      join public.teacher_classes tc on tc.id = cm.class_id
      where cm.student_id = target_student_id
        and (
          tc.teacher_id = auth.uid()
          or public.teacher_can_access_school(cm.school_id)
        )
    );
$$;

drop policy if exists "Profiles are visible to owners, teachers in same school, and admins" on public.profiles;
drop policy if exists "Profiles are visible to owners, teachers in same school, and ad" on public.profiles;

create policy "Profiles are visible to owners, teachers in same school, and admins"
  on public.profiles for select
  using (
    id = auth.uid()
    or public.is_admin()
    or public.teacher_can_view_student(id)
  );

drop policy if exists "Class members visible inside school" on public.class_members;

create policy "Class members visible inside school"
  on public.class_members for select
  using (
    student_id = auth.uid()
    or public.teacher_can_access_school(school_id)
    or exists (
      select 1
      from public.teacher_classes tc
      where tc.id = class_members.class_id
        and tc.teacher_id = auth.uid()
    )
  );

create or replace function public.list_teacher_students()
returns table (
  student_id uuid,
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

revoke all on function public.teacher_can_view_student(uuid) from public;
revoke all on function public.list_teacher_students() from public;
grant execute on function public.teacher_can_view_student(uuid) to authenticated;
grant execute on function public.list_teacher_students() to authenticated;
