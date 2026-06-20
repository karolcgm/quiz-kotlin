-- Fix infinite recursion between assignments and assignment_students RLS policies.
-- Apply after 006_create_teacher_test_rpc.sql.

create or replace function public.student_has_assignment(target_assignment_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.assignment_students ast
    where ast.assignment_id = target_assignment_id
      and ast.student_id = auth.uid()
  );
$$;

create or replace function public.teacher_owns_assignment(target_assignment_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments a
    where a.id = target_assignment_id
      and a.teacher_id = auth.uid()
      and public.teacher_can_access_school(a.school_id)
  );
$$;

create or replace function public.student_has_assigned_test(target_test_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments a
    join public.assignment_students ast on ast.assignment_id = a.id
    where a.test_id = target_test_id
      and a.status = 'published'
      and ast.student_id = auth.uid()
  );
$$;

create or replace function public.student_can_submit_assignment(target_assignment_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.assignment_students ast
    join public.assignments a on a.id = ast.assignment_id
    where ast.assignment_id = target_assignment_id
      and ast.student_id = auth.uid()
      and a.status = 'published'
  );
$$;

drop policy if exists "Students read assigned assignments" on public.assignments;

create policy "Students read assigned assignments"
  on public.assignments for select
  using (
    status = 'published'
    and public.student_has_assignment(id)
  );

drop policy if exists "Assignment students visible to teacher and self" on public.assignment_students;

create policy "Assignment students visible to teacher and self"
  on public.assignment_students for select
  using (
    student_id = auth.uid()
    or public.teacher_owns_assignment(assignment_id)
  );

drop policy if exists "Teachers manage assignment students" on public.assignment_students;

create policy "Teachers manage assignment students"
  on public.assignment_students for all
  using (public.teacher_owns_assignment(assignment_id))
  with check (public.teacher_owns_assignment(assignment_id));

drop policy if exists "Students read published assigned tests" on public.tests;

create policy "Students read published assigned tests"
  on public.tests for select
  using (
    status = 'published'
    and public.student_has_assigned_test(id)
  );

drop policy if exists "Test items follow test access" on public.test_items;

create policy "Test items follow test access"
  on public.test_items for select
  using (
    exists (
      select 1
      from public.tests t
      where t.id = test_items.test_id
        and (
          (t.teacher_id = auth.uid() and public.teacher_can_access_school(t.school_id))
          or (t.status = 'published' and public.student_has_assigned_test(t.id))
        )
    )
  );

drop policy if exists "Students create own in-progress submissions" on public.submissions;

create policy "Students create own in-progress submissions"
  on public.submissions for insert
  with check (
    student_id = auth.uid()
    and status = 'in_progress'
    and total_score = 0
    and max_score = 0
    and percentage = 0
    and public.student_can_submit_assignment(assignment_id)
  );

drop policy if exists "Submissions visible to owner and teacher" on public.submissions;

create policy "Submissions visible to owner and teacher"
  on public.submissions for select
  using (
    student_id = auth.uid()
    or public.teacher_owns_assignment(assignment_id)
  );

drop policy if exists "Answers visible through submission access" on public.submission_answers;

create policy "Answers visible through submission access"
  on public.submission_answers for select
  using (
    exists (
      select 1
      from public.submissions s
      where s.id = submission_answers.submission_id
        and (
          s.student_id = auth.uid()
          or public.teacher_owns_assignment(s.assignment_id)
        )
    )
  );

drop policy if exists "Scores visible to student and teacher" on public.submission_scores;

create policy "Scores visible to student and teacher"
  on public.submission_scores for select
  using (
    exists (
      select 1
      from public.submissions s
      where s.id = submission_scores.submission_id
        and (
          s.student_id = auth.uid()
          or public.teacher_owns_assignment(s.assignment_id)
        )
    )
  );

drop policy if exists "Teachers manage scores" on public.submission_scores;

create policy "Teachers manage scores"
  on public.submission_scores for all
  using (
    exists (
      select 1
      from public.submissions s
      where s.id = submission_scores.submission_id
        and public.teacher_owns_assignment(s.assignment_id)
    )
  )
  with check (
    exists (
      select 1
      from public.submissions s
      where s.id = submission_scores.submission_id
        and public.teacher_owns_assignment(s.assignment_id)
    )
  );

grant execute on function public.student_has_assignment(uuid) to authenticated;
grant execute on function public.teacher_owns_assignment(uuid) to authenticated;
grant execute on function public.student_has_assigned_test(uuid) to authenticated;
grant execute on function public.student_can_submit_assignment(uuid) to authenticated;
