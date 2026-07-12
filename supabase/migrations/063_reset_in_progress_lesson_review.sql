create or replace function public.reset_student_lesson_review(target_review_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare review public.student_lesson_reviews%rowtype;
begin
  select * into review from public.student_lesson_reviews where id = target_review_id and student_id = auth.uid() for update;
  if not found then raise exception 'Nie znaleziono zaliczenia.'; end if;
  if review.status <> 'in_progress' then raise exception 'Można zresetować tylko trwające zaliczenie.'; end if;
  update public.student_lesson_reviews set answers = '{}'::jsonb, score = 0, current_stage_index = 0 where id = review.id;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.reset_student_lesson_review(uuid) from public, anon;
grant execute on function public.reset_student_lesson_review(uuid) to authenticated;
