create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'teacher', 'student');
create type public.profile_status as enum ('pending_admin', 'active', 'blocked');
create type public.test_status as enum ('draft', 'published', 'archived');
create type public.assignment_status as enum ('draft', 'published', 'closed');
create type public.submission_status as enum ('in_progress', 'submitted', 'graded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  status public.profile_status not null default 'pending_admin',
  first_name text,
  last_name text,
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  activated_by uuid references public.profiles(id)
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.teacher_school_memberships (
  school_id uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (school_id, teacher_id)
);

create table public.teacher_classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  group_name text not null,
  school_grade smallint not null check (school_grade between 1 and 8),
  created_at timestamptz not null default now(),
  unique (school_id, teacher_id, name, group_name)
);

create table public.class_members (
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  invited_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table public.student_invitations (
  id uuid primary key default gen_random_uuid(),
  token uuid not null default gen_random_uuid() unique,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  email text,
  status text not null default 'open' check (status in ('open', 'used', 'revoked')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  used_by uuid references public.profiles(id),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  description text,
  instruction text,
  class_level smallint not null check (class_level between 1 and 8),
  status public.test_status not null default 'draft',
  max_points numeric not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.test_items (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  position integer not null,
  simulation_slug text not null,
  widget_kind text not null,
  skill text not null,
  title text not null,
  prompt text not null,
  points numeric not null default 1 check (points > 0),
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (test_id, position)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid references public.teacher_classes(id) on delete set null,
  title text not null,
  due_at timestamptz,
  max_attempts integer not null default 1 check (max_attempts > 0),
  status public.assignment_status not null default 'draft',
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.assignment_students (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (assignment_id, student_id)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  attempt_number integer not null,
  status public.submission_status not null default 'in_progress',
  total_score numeric not null default 0,
  max_score numeric not null default 0,
  percentage numeric not null default 0 check (percentage between 0 and 100),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique (assignment_id, student_id, attempt_number)
);

create table public.submission_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  test_item_id uuid not null references public.test_items(id) on delete cascade,
  skill text not null,
  answer jsonb not null default '{}'::jsonb,
  is_correct boolean not null default false,
  score numeric not null default 0,
  max_score numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (submission_id, test_item_id)
);

create table public.submission_scores (
  submission_id uuid primary key references public.submissions(id) on delete cascade,
  mark_1_6 smallint not null check (mark_1_6 between 1 and 6),
  generated_feedback_text text not null,
  manual_feedback_text text,
  feedback_text text not null,
  retake_allowed boolean not null default false,
  is_teacher_override boolean not null default false,
  graded_by uuid references public.profiles(id),
  graded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
begin
  requested_role := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'student');

  insert into public.profiles (
    id,
    role,
    status,
    first_name,
    last_name,
    display_name,
    email
  )
  values (
    new.id,
    requested_role,
    case when requested_role = 'teacher' then 'pending_admin' else 'active' end,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    new.email
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_status()
returns public.profile_status
language sql
security definer
stable
set search_path = public
as $$
  select status from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_active_teacher()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher' and status = 'active'
  );
$$;

create or replace function public.teacher_can_access_school(target_school_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.teacher_school_memberships
      where teacher_id = auth.uid() and school_id = target_school_id
    );
$$;

create or replace function public.student_can_access_school(target_school_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.class_members
    where student_id = auth.uid() and school_id = target_school_id
  );
$$;

alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.teacher_school_memberships enable row level security;
alter table public.teacher_classes enable row level security;
alter table public.class_members enable row level security;
alter table public.student_invitations enable row level security;
alter table public.tests enable row level security;
alter table public.test_items enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_students enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_answers enable row level security;
alter table public.submission_scores enable row level security;

create policy "Profiles are visible to owners, teachers in same school, and admins"
  on public.profiles for select
  using (
    id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.class_members cm
      join public.teacher_school_memberships tsm on tsm.school_id = cm.school_id
      where cm.student_id = profiles.id and tsm.teacher_id = auth.uid()
    )
  );

create policy "Users update own display data"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = public.current_role()
    and status = public.current_status()
  );

create policy "Admins activate and manage profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Schools visible to members"
  on public.schools for select
  using (public.teacher_can_access_school(id) or public.student_can_access_school(id));

create policy "Active teachers create schools"
  on public.schools for insert
  with check (public.is_active_teacher() and created_by = auth.uid());

create policy "Teachers manage own school memberships"
  on public.teacher_school_memberships for select
  using (public.teacher_can_access_school(school_id));

create policy "Admins or active teachers insert school memberships"
  on public.teacher_school_memberships for insert
  with check (public.is_admin() or (public.is_active_teacher() and teacher_id = auth.uid()));

create policy "Classes visible to school members"
  on public.teacher_classes for select
  using (public.teacher_can_access_school(school_id) or public.student_can_access_school(school_id));

create policy "Teachers manage classes in their schools"
  on public.teacher_classes for all
  using (public.teacher_can_access_school(school_id))
  with check (public.teacher_can_access_school(school_id) and teacher_id = auth.uid());

create policy "Class members visible inside school"
  on public.class_members for select
  using (public.teacher_can_access_school(school_id) or student_id = auth.uid());

create policy "Teachers add students to own school classes"
  on public.class_members for insert
  with check (public.teacher_can_access_school(school_id) and invited_by = auth.uid());

create policy "Teachers manage invitations in their schools"
  on public.student_invitations for all
  using (public.teacher_can_access_school(school_id))
  with check (public.teacher_can_access_school(school_id) and teacher_id = auth.uid());

create policy "Open invitations can be read by token"
  on public.student_invitations for select
  using (status = 'open' and expires_at > now());

create policy "Teachers manage own tests in school"
  on public.tests for all
  using (teacher_id = auth.uid() and public.teacher_can_access_school(school_id))
  with check (teacher_id = auth.uid() and public.teacher_can_access_school(school_id));

create policy "Students read published assigned tests"
  on public.tests for select
  using (
    status = 'published'
    and exists (
      select 1
      from public.assignments a
      join public.assignment_students ast on ast.assignment_id = a.id
      where a.test_id = tests.id and ast.student_id = auth.uid()
    )
  );

create policy "Test items follow test access"
  on public.test_items for select
  using (
    exists (
      select 1 from public.tests t
      where t.id = test_items.test_id
        and (
          (t.teacher_id = auth.uid() and public.teacher_can_access_school(t.school_id))
          or exists (
            select 1
            from public.assignments a
            join public.assignment_students ast on ast.assignment_id = a.id
            where a.test_id = t.id and ast.student_id = auth.uid()
          )
        )
    )
  );

create policy "Teachers manage test items"
  on public.test_items for all
  using (
    exists (
      select 1 from public.tests t
      where t.id = test_items.test_id and t.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tests t
      where t.id = test_items.test_id and t.teacher_id = auth.uid()
    )
  );

create policy "Teachers manage assignments"
  on public.assignments for all
  using (teacher_id = auth.uid() and public.teacher_can_access_school(school_id))
  with check (teacher_id = auth.uid() and public.teacher_can_access_school(school_id));

create policy "Students read assigned assignments"
  on public.assignments for select
  using (
    status = 'published'
    and exists (
      select 1 from public.assignment_students ast
      where ast.assignment_id = assignments.id and ast.student_id = auth.uid()
    )
  );

create policy "Assignment students visible to teacher and self"
  on public.assignment_students for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.assignments a
      where a.id = assignment_students.assignment_id and a.teacher_id = auth.uid()
    )
  );

create policy "Teachers manage assignment students"
  on public.assignment_students for all
  using (
    exists (
      select 1 from public.assignments a
      where a.id = assignment_students.assignment_id and a.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.assignments a
      where a.id = assignment_students.assignment_id and a.teacher_id = auth.uid()
    )
  );

create policy "Students manage own submissions"
  on public.submissions for insert
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.assignment_students ast
      where ast.assignment_id = submissions.assignment_id and ast.student_id = auth.uid()
    )
  );

create policy "Submissions visible to owner and teacher"
  on public.submissions for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.assignments a
      where a.id = submissions.assignment_id and a.teacher_id = auth.uid()
    )
  );

create policy "Students update own in-progress submissions"
  on public.submissions for update
  using (student_id = auth.uid() and status = 'in_progress')
  with check (student_id = auth.uid());

create policy "Answers visible through submission access"
  on public.submission_answers for select
  using (
    exists (
      select 1 from public.submissions s
      where s.id = submission_answers.submission_id
        and (
          s.student_id = auth.uid()
          or exists (
            select 1 from public.assignments a
            where a.id = s.assignment_id and a.teacher_id = auth.uid()
          )
        )
    )
  );

create policy "Students insert answers for own submissions"
  on public.submission_answers for insert
  with check (
    exists (
      select 1 from public.submissions s
      where s.id = submission_answers.submission_id
        and s.student_id = auth.uid()
        and s.status = 'in_progress'
    )
  );

create policy "Scores visible to student and teacher"
  on public.submission_scores for select
  using (
    exists (
      select 1 from public.submissions s
      where s.id = submission_scores.submission_id
        and (
          s.student_id = auth.uid()
          or exists (
            select 1 from public.assignments a
            where a.id = s.assignment_id and a.teacher_id = auth.uid()
          )
        )
    )
  );

create policy "Teachers manage scores"
  on public.submission_scores for all
  using (
    exists (
      select 1
      from public.submissions s
      join public.assignments a on a.id = s.assignment_id
      where s.id = submission_scores.submission_id and a.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.submissions s
      join public.assignments a on a.id = s.assignment_id
      where s.id = submission_scores.submission_id and a.teacher_id = auth.uid()
    )
  );
