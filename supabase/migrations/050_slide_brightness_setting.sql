-- Regulowane przyciemnienie prezentacji i kart slajdów ucznia.

alter table public.student_reward_profiles
  add column if not exists slide_dim_percent integer not null default 30;

alter table public.student_reward_profiles
  drop constraint if exists student_reward_profiles_slide_dim_percent_check;
alter table public.student_reward_profiles
  add constraint student_reward_profiles_slide_dim_percent_check
  check (slide_dim_percent between 0 and 60);

create or replace function public.select_student_slide_brightness(target_dim_percent integer)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  student uuid := auth.uid();
  safe_percent integer;
begin
  if student is null then raise exception 'Wymagane logowanie.'; end if;
  safe_percent := greatest(0, least(60, coalesce(target_dim_percent, 30)));
  perform public.ensure_student_reward_profile(student);
  update public.student_reward_profiles
  set slide_dim_percent = safe_percent, updated_at = now()
  where student_id = student;
  return jsonb_build_object('ok', true, 'dimPercent', safe_percent);
end;
$$;

revoke all on function public.select_student_slide_brightness(integer) from public, anon;
grant execute on function public.select_student_slide_brightness(integer) to authenticated;
