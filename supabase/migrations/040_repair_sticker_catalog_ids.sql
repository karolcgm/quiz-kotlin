-- Naprawia naklejki przyznane przez starą funkcję katalogu 10 × 100.
-- Aktualny katalog zawiera trzy kolekcje po 20 naklejek (ID 0–59).

do $$
declare
  legacy record;
  target_collection integer;
  target_sticker integer;
begin
  for legacy in
    select student_id, sticker_id, source_type, source_id, earned_at
    from public.student_stickers
    where sticker_id < 0 or sticker_id > 59
    order by student_id, earned_at, sticker_id
  loop
    target_collection := case
      when legacy.sticker_id < 100 then 0
      when legacy.sticker_id < 200 then 1
      else 2
    end;

    delete from public.student_stickers
    where student_id = legacy.student_id and sticker_id = legacy.sticker_id;

    select candidate into target_sticker
    from (
      select target_collection * 20
        + mod(mod(abs(legacy.sticker_id), 20) + offset_value, 20) candidate,
        offset_value
      from generate_series(0, 19) offset_value
    ) available
    where not exists (
      select 1 from public.student_stickers owned
      where owned.student_id = legacy.student_id
        and owned.sticker_id = available.candidate
    )
    order by offset_value
    limit 1;

    if target_sticker is not null then
      insert into public.student_stickers(student_id, sticker_id, source_type, source_id, earned_at)
      values (legacy.student_id, target_sticker, legacy.source_type, legacy.source_id, legacy.earned_at)
      on conflict do nothing;

      update public.student_reward_notifications
      set reward_key = target_sticker::text
      where student_id = legacy.student_id
        and kind = 'sticker'
        and reward_key = legacy.sticker_id::text;

      update public.student_reward_profiles
      set featured_sticker_id = target_sticker, updated_at = now()
      where student_id = legacy.student_id
        and featured_sticker_id = legacy.sticker_id;
    else
      update public.student_reward_profiles
      set featured_sticker_id = null, updated_at = now()
      where student_id = legacy.student_id
        and featured_sticker_id = legacy.sticker_id;
    end if;
  end loop;
end;
$$;

update public.student_reward_profiles
set featured_sticker_id = null, updated_at = now()
where featured_sticker_id is not null
  and (featured_sticker_id < 0 or featured_sticker_id > 59);

alter table public.student_stickers
  drop constraint if exists student_stickers_sticker_id_check;
alter table public.student_stickers
  add constraint student_stickers_sticker_id_check check (sticker_id between 0 and 59);

alter table public.student_reward_profiles
  drop constraint if exists student_reward_profiles_featured_sticker_id_check;
alter table public.student_reward_profiles
  add constraint student_reward_profiles_featured_sticker_id_check
  check (featured_sticker_id is null or featured_sticker_id between 0 and 59);

create or replace function public.grant_student_reward(
  target_student_id uuid, target_source_type text, target_source_id text,
  target_reason text, target_points integer, target_collection integer default 0,
  award_sticker boolean default false
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  inserted_count integer;
  new_total integer;
  sticker integer;
  sticker_inserted integer := 0;
  collection integer;
begin
  if target_student_id is null or target_points < 0 then
    return jsonb_build_object('awarded', false);
  end if;
  perform public.ensure_student_reward_profile(target_student_id);
  insert into public.student_reward_events(student_id, source_type, source_id, reason, points)
  values (target_student_id, target_source_type, target_source_id, target_reason, target_points)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return jsonb_build_object('awarded', false); end if;

  update public.student_reward_profiles
  set total_points = total_points + target_points, updated_at = now()
  where student_id = target_student_id
  returning total_points into new_total;

  if award_sticker then
    collection := greatest(0, least(2, target_collection));
    sticker := collection * 20
      + mod(abs(hashtextextended(target_source_type || ':' || target_source_id || ':' || target_student_id::text, 2026)), 20)::integer;

    select candidate into sticker
    from (
      select collection * 20 + mod((sticker % 20) + offset_value, 20) candidate,
        offset_value
      from generate_series(0, 19) offset_value
    ) available
    where not exists (
      select 1 from public.student_stickers owned
      where owned.student_id = target_student_id
        and owned.sticker_id = available.candidate
    )
    order by offset_value
    limit 1;

    if sticker is not null then
      insert into public.student_stickers(student_id, sticker_id, source_type, source_id)
      values (target_student_id, sticker, target_source_type, target_source_id)
      on conflict do nothing;
      get diagnostics sticker_inserted = row_count;
    end if;

    if sticker_inserted > 0 then
      insert into public.student_reward_notifications(student_id, kind, reward_key, title, message)
      values (target_student_id, 'sticker', sticker::text, 'Nowa naklejka!',
        'Tajemnicza nagroda została odsłonięta w Twoim klaserze.');
    end if;
  end if;

  return jsonb_build_object(
    'awarded', true,
    'points', target_points,
    'totalPoints', new_total,
    'stickerId', case when sticker_inserted > 0 then sticker else null end
  );
end;
$$;

revoke all on function public.grant_student_reward(uuid, text, text, text, integer, integer, boolean)
  from public, anon, authenticated;
