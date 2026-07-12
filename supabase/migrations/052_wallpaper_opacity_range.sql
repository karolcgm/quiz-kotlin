-- Wallpaper visibility: hidden at -50, fully visible at 100.

alter table public.student_reward_profiles
  drop constraint if exists student_reward_profiles_background_brightness_offset_check;
alter table public.student_reward_profiles
  add constraint student_reward_profiles_background_brightness_offset_check
  check (background_brightness_offset between -50 and 100);

create or replace function public.select_student_slide_brightness(
  target_slide_offset integer,
  target_background_offset integer
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  student uuid := auth.uid();
  safe_slide integer;
  safe_background integer;
begin
  if student is null then raise exception 'Wymagane logowanie.'; end if;
  safe_slide := greatest(-50, least(50, coalesce(target_slide_offset, 0)));
  safe_background := greatest(-50, least(100, coalesce(target_background_offset, 0)));
  perform public.ensure_student_reward_profile(student);
  update public.student_reward_profiles
  set slide_brightness_offset = safe_slide,
      background_brightness_offset = safe_background,
      updated_at = now()
  where student_id = student;
  return jsonb_build_object('ok', true, 'slideOffset', safe_slide, 'backgroundOffset', safe_background);
end;
$$;
