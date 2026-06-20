-- Hardening patch for already-created LekcjaLab Supabase projects.
-- Apply after 001_initial_learning_platform.sql.

drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_role text;
  requested_role public.user_role;
  invitation_token uuid;
  invitation_row public.student_invitations%rowtype;
begin
  raw_role := nullif(new.raw_user_meta_data ->> 'role', '');

  requested_role :=
    case
      when raw_role = 'teacher' then 'teacher'::public.user_role
      when raw_role = 'student' then 'student'::public.user_role
      else 'student'::public.user_role
    end;

  insert into public.profiles (
    id,
    role,
    status,
    first_name,
    last_name,
    display_name,
    email,
    created_at
  )
  values (
    new.id,
    requested_role,
    case
      when requested_role = 'teacher' then 'pending_admin'::public.profile_status
      else 'active'::public.profile_status
    end,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), new.email),
    new.email,
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name);

  if requested_role = 'student' and nullif(new.raw_user_meta_data ->> 'invitation_token', '') is not null then
    invitation_token := (new.raw_user_meta_data ->> 'invitation_token')::uuid;

    select *
    into invitation_row
    from public.student_invitations
    where token = invitation_token
      and status = 'open'
      and expires_at > now()
    for update;

    if not found then
      raise exception 'Zaproszenie jest nieprawidłowe albo wygasło.';
    end if;

    insert into public.class_members (
      class_id,
      school_id,
      student_id,
      invited_by
    )
    values (
      invitation_row.class_id,
      invitation_row.school_id,
      new.id,
      invitation_row.teacher_id
    )
    on conflict (class_id, student_id) do nothing;

    update public.student_invitations
    set
      status = 'used',
      used_by = new.id,
      used_at = now()
    where id = invitation_row.id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "Open invitations can be read by token" on public.student_invitations;

create or replace function public.submit_assignment(
  target_assignment_id uuid,
  answers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_student_id uuid := auth.uid();
  assignment_row public.assignments%rowtype;
  attempt_count integer;
  attempt_number integer;
  latest_submission_id uuid;
  latest_retake_allowed boolean;
  submission_id uuid;
  item_row public.test_items%rowtype;
  answer_row jsonb;
  result_value numeric;
  expected_value numeric;
  item_score numeric;
  total_score_value numeric := 0;
  max_score_value numeric := 0;
  percentage_value numeric := 0;
  mark smallint := 1;
  generated_feedback text;
begin
  if current_student_id is null then
    raise exception 'Musisz być zalogowany jako uczeń.';
  end if;

  select *
  into assignment_row
  from public.assignments
  where id = target_assignment_id
    and status = 'published'
    and (due_at is null or due_at >= now())
    and exists (
      select 1
      from public.assignment_students ast
      where ast.assignment_id = target_assignment_id
        and ast.student_id = current_student_id
    );

  if not found then
    raise exception 'Test nie jest dostępny dla tego ucznia.';
  end if;

  select count(*)
  into attempt_count
  from public.submissions
  where assignment_id = target_assignment_id
    and student_id = current_student_id;

  attempt_number := attempt_count + 1;

  if attempt_number > assignment_row.max_attempts then
    select s.id, coalesce(sc.retake_allowed, false)
    into latest_submission_id, latest_retake_allowed
    from public.submissions s
    left join public.submission_scores sc on sc.submission_id = s.id
    where s.assignment_id = target_assignment_id
      and s.student_id = current_student_id
    order by s.attempt_number desc
    limit 1;

    if not coalesce(latest_retake_allowed, false) then
      raise exception 'Limit prób został wykorzystany.';
    end if;

    update public.submission_scores
    set retake_allowed = false, updated_at = now()
    where submission_id = latest_submission_id;
  end if;

  insert into public.submissions (
    assignment_id,
    student_id,
    attempt_number,
    status,
    submitted_at
  )
  values (
    target_assignment_id,
    current_student_id,
    attempt_number,
    'graded',
    now()
  )
  returning id into submission_id;

  for item_row in
    select ti.*
    from public.test_items ti
    where ti.test_id = assignment_row.test_id
    order by ti.position asc
  loop
    select value
    into answer_row
    from jsonb_array_elements(answers)
    where value ->> 'testItemId' = item_row.id::text
    limit 1;

    result_value := coalesce((answer_row #>> '{answer,result}')::numeric, null);
    expected_value := coalesce((item_row.params ->> 'start')::numeric, 0)
      + coalesce((item_row.params ->> 'change')::numeric, 0);
    item_score := case when result_value = expected_value then item_row.points else 0 end;

    total_score_value := total_score_value + item_score;
    max_score_value := max_score_value + item_row.points;

    insert into public.submission_answers (
      submission_id,
      test_item_id,
      skill,
      answer,
      is_correct,
      score,
      max_score
    )
    values (
      submission_id,
      item_row.id,
      case
        when coalesce((item_row.params ->> 'change')::numeric, 0) >= 0 then 'addition'
        else 'subtraction'
      end,
      coalesce(answer_row -> 'answer', '{}'::jsonb),
      item_score = item_row.points,
      item_score,
      item_row.points
    );
  end loop;

  percentage_value := case
    when max_score_value > 0 then round((total_score_value / max_score_value) * 100)
    else 0
  end;
  mark := case
    when percentage_value >= 96 then 6
    when percentage_value >= 86 then 5
    when percentage_value >= 70 then 4
    when percentage_value >= 50 then 3
    when percentage_value >= 30 then 2
    else 1
  end;

  generated_feedback := case
    when percentage_value >= 85 then 'Uczeń bardzo dobrze radzi sobie z działaniami na osi liczbowej. Warto przejść do trudniejszych przykładów.'
    when percentage_value >= 60 then 'Uczeń rozumie podstawy działań na osi liczbowej, ale warto utrwalić kilka przykładów krok po kroku.'
    else 'Uczeń ma trudności z działaniami na osi liczbowej. Warto wrócić do prostszych przykładów i ćwiczyć kierunek ruchu na osi.'
  end;

  update public.submissions
  set
    total_score = total_score_value,
    max_score = max_score_value,
    percentage = percentage_value
  where id = submission_id;

  insert into public.submission_scores (
    submission_id,
    mark_1_6,
    generated_feedback_text,
    feedback_text,
    retake_allowed,
    is_teacher_override
  )
  values (
    submission_id,
    mark,
    generated_feedback,
    generated_feedback,
    false,
    false
  );

  return submission_id;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.submit_assignment(uuid, jsonb) to authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;
