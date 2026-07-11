-- 15 ramek avatara. Odblokowanie wynika z łącznej liczby punktów,
-- a wybór jest walidowany po stronie bazy.

alter table public.student_reward_profiles
  add column if not exists avatar_frame_id text not null default 'frame-0';

-- Aktualizacja funkcji również dla baz, w których migracja 034 została już wykonana.
create or replace function public.grant_student_reward(
  target_student_id uuid, target_source_type text, target_source_id text,
  target_reason text, target_points integer, target_collection integer default 0,
  award_sticker boolean default false
) returns jsonb language plpgsql security definer set search_path = public as $$
declare inserted_count integer; new_total integer; sticker integer; sticker_inserted integer := 0;
begin
  if target_student_id is null or target_points < 0 then return jsonb_build_object('awarded', false); end if;
  perform public.ensure_student_reward_profile(target_student_id);
  insert into public.student_reward_events(student_id, source_type, source_id, reason, points)
  values (target_student_id, target_source_type, target_source_id, target_reason, target_points)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return jsonb_build_object('awarded', false); end if;
  update public.student_reward_profiles set total_points = total_points + target_points, updated_at = now()
  where student_id = target_student_id returning total_points into new_total;

  if award_sticker then
    sticker := greatest(0, least(9, target_collection)) * 100
      + mod(abs(hashtextextended(target_source_type || ':' || target_source_id || ':' || target_student_id::text, 2026)), 100)::integer;
    select candidate into sticker from (
      select greatest(0, least(9, target_collection)) * 100
        + mod((sticker % 100) + offset_value, 100) candidate, offset_value offset_order
      from generate_series(0, 99) offset_value
    ) available
    where not exists (select 1 from public.student_stickers owned where owned.student_id = target_student_id and owned.sticker_id = available.candidate)
    order by offset_order limit 1;
    if sticker is not null then
      insert into public.student_stickers(student_id, sticker_id, source_type, source_id)
      values (target_student_id, sticker, target_source_type, target_source_id) on conflict do nothing;
      get diagnostics sticker_inserted = row_count;
    end if;
    if sticker_inserted > 0 then
      insert into public.student_reward_notifications(student_id, kind, reward_key, title, message)
      values (target_student_id, 'sticker', sticker::text, 'Nowa naklejka!', 'Tajemnicza nagroda została odsłonięta w Twoim klaserze.');
    end if;
  end if;

  if new_total >= 250 then perform public.unlock_reward_achievement(target_student_id, 'points-250', 'bronze', 'Pierwsze 250 punktów', 'Odblokowujesz motyw Zachód Słońca.'); end if;
  if new_total >= 1000 then perform public.unlock_reward_achievement(target_student_id, 'points-1000', 'silver', 'Tysiąc punktów!', 'Odblokowujesz motyw Kosmos.'); end if;
  if new_total >= 5000 then perform public.unlock_reward_achievement(target_student_id, 'points-5000', 'gold', 'Legenda LekcjaLab', 'Odblokowujesz złoty motyw Aurum.'); end if;
  return jsonb_build_object('awarded', true, 'points', target_points, 'totalPoints', new_total, 'stickerId', case when sticker_inserted > 0 then sticker else null end);
end;
$$;

revoke all on function public.grant_student_reward(uuid, text, text, text, integer, integer, boolean) from public, anon, authenticated;

create or replace function public.select_student_avatar_frame(target_frame text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare student uuid := auth.uid(); points integer; frame_index integer; required_points integer;
begin
  if student is null then raise exception 'Wymagane logowanie.'; end if;
  if target_frame !~ '^frame-([0-9]|1[0-4])$' then raise exception 'Nieznana ramka.'; end if;
  frame_index := substring(target_frame from 'frame-([0-9]+)')::integer;
  required_points := (array[0,50,100,175,250,400,600,850,1200,1700,2300,3000,4000,5500,7500])[frame_index + 1];
  perform public.ensure_student_reward_profile(student);
  select total_points into points from public.student_reward_profiles where student_id = student;
  if points < required_points then raise exception 'Ta ramka nie jest jeszcze odblokowana.'; end if;
  update public.student_reward_profiles set avatar_frame_id = target_frame, updated_at = now() where student_id = student;
  return jsonb_build_object('ok', true, 'avatarFrameId', target_frame);
end;
$$;

revoke all on function public.select_student_avatar_frame(text) from public, anon;
grant execute on function public.select_student_avatar_frame(text) to authenticated;
