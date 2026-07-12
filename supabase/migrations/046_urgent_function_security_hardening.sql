-- Najpilniejsze zalecenia Security Advisor:
-- 1. stały search_path dla wskazanych funkcji,
-- 2. brak anonimowego dostępu do RPC aplikacji i funkcji wewnętrznych,
-- 3. nowe funkcje nie otrzymują EXECUTE automatycznie.

alter function public.touch_class_curriculum_plan_updated_at()
  set search_path = public, pg_temp;
alter function public.guard_frozen_test_items()
  set search_path = public, pg_temp;
alter function public.compute_mark_from_percentage(numeric)
  set search_path = pg_catalog, pg_temp;
alter function public.lesson_session_join_code_hash(uuid, text)
  set search_path = pg_catalog, extensions, pg_temp;
alter function public.touch_lesson_session_updated_at()
  set search_path = public, pg_temp;
alter function public.generate_lesson_join_code()
  set search_path = pg_catalog, pg_temp;
alter function public.lesson_session_public_snapshot(jsonb)
  set search_path = pg_catalog, pg_temp;

-- Wszystkie funkcje zgłoszone jako wykonywalne przez anon tracą uprawnienia
-- odziedziczone po PUBLIC. Konkretne wyjątki są nadawane poniżej.
do $$
declare
  fn regprocedure;
  function_names text[] := array[
    'append_lesson_session_event',
    'approve_retake',
    'attach_student_to_open_assignments',
    'confirm_paper_results',
    'create_blueprint_assignment',
    'create_class_curriculum_plan',
    'create_notification',
    'create_school_with_class',
    'create_teacher_test',
    'create_test_assignment',
    'current_role',
    'current_status',
    'ensure_assessment_version',
    'get_lesson_session_board_view',
    'guard_lesson_response_time_limit',
    'handle_new_user',
    'is_active_student',
    'is_active_teacher',
    'is_admin',
    'is_lesson_session_participant',
    'list_paper_results',
    'list_teacher_students',
    'load_assignment_for_student_submit',
    'mark_all_notifications_read',
    'mark_notification_read',
    'mark_submission_reviewed',
    'notify_assignment_students',
    'notify_grade_updated',
    'notify_test_submitted',
    'request_retake',
    'save_paper_result_draft',
    'send_teacher_notifications',
    'start_assignment_attempt',
    'student_can_access_school',
    'student_can_submit_assignment',
    'student_has_assigned_test',
    'student_has_assignment',
    'student_in_lesson_session_class',
    'submit_assignment',
    'teacher_can_access_school',
    'teacher_can_view_student',
    'teacher_owns_assignment',
    'teacher_owns_class',
    'teacher_owns_lesson_session',
    'update_topic_plan_entry_status',
    'validate_invitation_token'
  ];
begin
  for fn in
    select p.oid::regprocedure
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = any(function_names)
  loop
    execute format('revoke execute on function %s from public, anon', fn);
  end loop;
end;
$$;

-- Funkcje wywoływane bezpośrednio przez zalogowaną aplikację lub potrzebne
-- politykom RLS. Każda z nich ma własną kontrolę auth.uid()/roli/właściciela.
do $$
declare
  fn regprocedure;
  function_names text[] := array[
    'approve_retake',
    'confirm_paper_results',
    'create_blueprint_assignment',
    'create_class_curriculum_plan',
    'create_school_with_class',
    'create_teacher_test',
    'create_test_assignment',
    'current_role',
    'current_status',
    'ensure_assessment_version',
    'get_lesson_session_board_view',
    'is_active_student',
    'is_active_teacher',
    'is_admin',
    'is_lesson_session_participant',
    'list_paper_results',
    'list_teacher_students',
    'load_assignment_for_student_submit',
    'mark_all_notifications_read',
    'mark_notification_read',
    'mark_submission_reviewed',
    'notify_assignment_students',
    'notify_grade_updated',
    'notify_test_submitted',
    'request_retake',
    'save_paper_result_draft',
    'send_teacher_notifications',
    'start_assignment_attempt',
    'student_can_access_school',
    'student_can_submit_assignment',
    'student_has_assigned_test',
    'student_has_assignment',
    'student_in_lesson_session_class',
    'submit_assignment',
    'teacher_can_access_school',
    'teacher_can_view_student',
    'teacher_owns_assignment',
    'teacher_owns_class',
    'teacher_owns_lesson_session',
    'update_topic_plan_entry_status',
    'validate_invitation_token'
  ];
begin
  for fn in
    select p.oid::regprocedure
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = any(function_names)
  loop
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end;
$$;

-- Jedyny anonimowy wyjątek: podgląd poprawnego zaproszenia jest potrzebny
-- przed utworzeniem konta ucznia.
grant execute on function public.validate_invitation_token(uuid) to anon;

-- Funkcje techniczne są uruchamiane wyłącznie przez triggery lub inne funkcje
-- SECURITY DEFINER. Klient nie powinien móc wywołać ich bezpośrednio.
do $$
declare
  fn regprocedure;
  function_names text[] := array[
    'append_lesson_session_event',
    'attach_student_to_open_assignments',
    'compute_mark_from_percentage',
    'create_notification',
    'generate_lesson_join_code',
    'guard_frozen_test_items',
    'guard_lesson_response_time_limit',
    'handle_new_user',
    'lesson_session_join_code_hash',
    'lesson_session_public_snapshot',
    'touch_class_curriculum_plan_updated_at',
    'touch_lesson_session_updated_at'
  ];
begin
  for fn in
    select p.oid::regprocedure
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = any(function_names)
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn);
  end loop;
end;
$$;

-- Bezpieczne ustawienie domyślne: każda przyszła funkcja wymaga jawnego GRANT.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon;
alter default privileges in schema public revoke execute on functions from authenticated;
