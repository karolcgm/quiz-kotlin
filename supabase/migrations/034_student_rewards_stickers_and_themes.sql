-- Grywalizacja ucznia: punkty aktywności, 1000 proceduralnych naklejek,
-- osiągnięcia, motywy oraz nagrody za Live, powtórki i prace domowe.

create table if not exists public.student_reward_profiles (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  total_points integer not null default 0 check (total_points >= 0),
  click_count bigint not null default 0 check (click_count >= 0),
  featured_sticker_id integer check (featured_sticker_id between 0 and 999),
  theme_id text not null default 'sky',
  updated_at timestamptz not null default now()
);

create table if not exists public.student_reward_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null,
  source_id text not null,
  reason text not null,
  points integer not null check (points >= 0),
  created_at timestamptz not null default now(),
  unique (student_id, source_type, source_id, reason)
);

create table if not exists public.student_stickers (
  student_id uuid not null references public.profiles(id) on delete cascade,
  sticker_id integer not null check (sticker_id between 0 and 999),
  source_type text not null,
  source_id text not null,
  earned_at timestamptz not null default now(),
  primary key (student_id, sticker_id)
);

create table if not exists public.student_achievements (
  student_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,
  tier text not null default 'special',
  earned_at timestamptz not null default now(),
  primary key (student_id, achievement_id)
);

create table if not exists public.student_reward_notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('sticker', 'achievement', 'theme', 'points')),
  reward_key text not null,
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  seen_at timestamptz
);

create index if not exists student_reward_events_student_created_idx on public.student_reward_events(student_id, created_at desc);
create index if not exists student_stickers_student_earned_idx on public.student_stickers(student_id, earned_at desc);
create index if not exists student_reward_notifications_unseen_idx on public.student_reward_notifications(student_id, seen_at, created_at);

alter table public.student_reward_profiles enable row level security;
alter table public.student_reward_events enable row level security;
alter table public.student_stickers enable row level security;
alter table public.student_achievements enable row level security;
alter table public.student_reward_notifications enable row level security;

create policy "Students read own reward profile" on public.student_reward_profiles for select using (student_id = auth.uid());
create policy "Students read own reward events" on public.student_reward_events for select using (student_id = auth.uid());
create policy "Students read own stickers" on public.student_stickers for select using (student_id = auth.uid());
create policy "Students read own achievements" on public.student_achievements for select using (student_id = auth.uid());
create policy "Students read own reward notifications" on public.student_reward_notifications for select using (student_id = auth.uid());

create or replace function public.ensure_student_reward_profile(target_student_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.student_reward_profiles(student_id) values (target_student_id) on conflict do nothing;
end;
$$;

create or replace function public.unlock_reward_achievement(target_student_id uuid, target_id text, target_tier text, target_title text, target_message text)
returns boolean language plpgsql security definer set search_path = public as $$
declare inserted_count integer;
begin
  insert into public.student_achievements(student_id, achievement_id, tier)
  values (target_student_id, target_id, target_tier) on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count > 0 then
    insert into public.student_reward_notifications(student_id, kind, reward_key, title, message)
    values (target_student_id, 'achievement', target_id, target_title, target_message);
    return true;
  end if;
  return false;
end;
$$;

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
    -- Nie zdradzamy przyszłej nagrody, ale po spełnieniu warunku zawsze
    -- wybieramy pierwszy wolny wariant od pseudolosowego miejsca kolekcji.
    select candidate into sticker
    from (
      select greatest(0, least(9, target_collection)) * 100
        + mod((sticker % 100) + offset_value, 100) candidate, offset_value offset_order
      from generate_series(0, 99) offset_value
    ) available
    where not exists (
      select 1 from public.student_stickers owned
      where owned.student_id = target_student_id and owned.sticker_id = available.candidate
    )
    order by offset_order
    limit 1;
    if sticker is not null then
      insert into public.student_stickers(student_id, sticker_id, source_type, source_id)
      values (target_student_id, sticker, target_source_type, target_source_id) on conflict do nothing;
      get diagnostics sticker_inserted = row_count;
    end if;
    if sticker_inserted > 0 then
      insert into public.student_reward_notifications(student_id, kind, reward_key, title, message)
      values (target_student_id, 'sticker', sticker::text, 'Nowa naklejka!', 'Nowy okaz czeka w Twoim klaserze.');
    end if;
  end if;

  if new_total >= 250 then perform public.unlock_reward_achievement(target_student_id, 'points-250', 'bronze', 'Pierwsze 250 punktów', 'Odblokowujesz motyw Zachód Słońca.'); end if;
  if new_total >= 1000 then perform public.unlock_reward_achievement(target_student_id, 'points-1000', 'silver', 'Tysiąc punktów!', 'Odblokowujesz motyw Kosmos.'); end if;
  if new_total >= 5000 then perform public.unlock_reward_achievement(target_student_id, 'points-5000', 'gold', 'Legenda LekcjaLab', 'Odblokowujesz złoty motyw Aurum.'); end if;
  return jsonb_build_object('awarded', true, 'points', target_points, 'totalPoints', new_total, 'stickerId', case when sticker_inserted > 0 then sticker else null end);
end;
$$;

create or replace function public.record_student_reward_clicks(click_delta integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare student uuid := auth.uid(); new_count bigint; unlocked text[] := '{}';
begin
  if student is null or click_delta < 1 or click_delta > 25 then raise exception 'Nieprawidłowy pakiet aktywności.'; end if;
  perform public.ensure_student_reward_profile(student);
  update public.student_reward_profiles set click_count = click_count + click_delta, updated_at = now()
  where student_id = student returning click_count into new_count;
  if new_count >= 100 and public.unlock_reward_achievement(student, 'click-100', 'bronze', 'Brązowy Klikacz', '100 kliknięć podczas nauki!') then unlocked := array_append(unlocked, 'click-100'); end if;
  if new_count >= 1000 and public.unlock_reward_achievement(student, 'click-1000', 'silver', 'Srebrny Klikacz', '1000 kliknięć podczas nauki!') then unlocked := array_append(unlocked, 'click-1000'); end if;
  if new_count >= 10000 and public.unlock_reward_achievement(student, 'click-10000', 'gold', 'Złoty Klikacz', '10 000 kliknięć podczas nauki!') then unlocked := array_append(unlocked, 'click-10000'); end if;
  return jsonb_build_object('clickCount', new_count, 'unlocked', unlocked);
end;
$$;

create or replace function public.select_student_cosmetics(target_sticker integer default null, target_theme text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare student uuid := auth.uid(); points integer; required_points integer;
begin
  if student is null then raise exception 'Wymagane logowanie.'; end if;
  perform public.ensure_student_reward_profile(student);
  select total_points into points from public.student_reward_profiles where student_id = student;
  if target_sticker is not null and not exists(select 1 from public.student_stickers where student_id = student and sticker_id = target_sticker) then raise exception 'Nie masz tej naklejki.'; end if;
  if target_theme is not null then
    required_points := case target_theme when 'sky' then 0 when 'forest' then 100 when 'sunset' then 250 when 'space' then 1000 when 'aurum' then 5000 else 999999999 end;
    if points < required_points then raise exception 'Ten motyw nie jest jeszcze odblokowany.'; end if;
  end if;
  update public.student_reward_profiles set featured_sticker_id = coalesce(target_sticker, featured_sticker_id), theme_id = coalesce(target_theme, theme_id), updated_at = now() where student_id = student;
  return jsonb_build_object('ok', true, 'featuredStickerId', target_sticker, 'themeId', target_theme);
end;
$$;

create or replace function public.mark_reward_notifications_seen(target_ids uuid[])
returns void language sql security definer set search_path = public as $$
  update public.student_reward_notifications set seen_at = now() where student_id = auth.uid() and id = any(target_ids) and seen_at is null;
$$;

create or replace function public.reward_live_response_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare collection_id integer := 0; section_text text;
begin
  if new.status = 'submitted' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    select stage_snapshot ->> 'sectionId' into section_text from public.lesson_sessions where id = new.session_id;
    if section_text ~ '[0-9]+$' then collection_id := least(9, (regexp_match(section_text, '([0-9]+)$'))[1]::integer); end if;
    perform public.grant_student_reward(new.student_id, 'live', new.id::text, 'Odpowiedź w lekcji Live', case when new.score = new.max_score then 10 else 3 end, collection_id, new.score = new.max_score);
  end if;
  return new;
end;
$$;

drop trigger if exists reward_live_response on public.lesson_stage_responses;
create trigger reward_live_response after insert or update of status on public.lesson_stage_responses for each row execute function public.reward_live_response_trigger();

create or replace function public.reward_practice_attempt_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.grant_student_reward(new.student_id, 'practice', new.id::text, 'Powtórka w domu', greatest(2, round(new.total_score * 10)::integer), 8, new.total_score > 0);
  if new.percentage >= 80 then perform public.unlock_reward_achievement(new.student_id, 'home-review-first', 'special', 'Domowy Odkrywca', 'Świetna powtórka wykonana samodzielnie!'); end if;
  return new;
end;
$$;

drop trigger if exists reward_practice_attempt on public.practice_attempts;
create trigger reward_practice_attempt after insert on public.practice_attempts for each row execute function public.reward_practice_attempt_trigger();

create or replace function public.reward_assignment_submission_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare assignment_kind text; earned numeric;
begin
  if new.status in ('submitted', 'graded') and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    select kind::text into assignment_kind from public.assignments where id = new.assignment_id;
    earned := coalesce(new.total_score, 0);
    perform public.grant_student_reward(new.student_id, 'assignment', new.id::text, case when assignment_kind = 'homework' then 'Praca domowa' else 'Praca klasowa' end, greatest(3, round(earned * 10)::integer), case when assignment_kind = 'homework' then 9 else 7 end, earned > 0);
    if assignment_kind = 'homework' then perform public.unlock_reward_achievement(new.student_id, 'homework-first', 'special', 'Pierwsza misja domowa', 'Praca domowa może odblokować wyjątkowe naklejki!'); end if;
  end if;
  return new;
end;
$$;

drop trigger if exists reward_assignment_submission on public.submissions;
create trigger reward_assignment_submission after insert or update of status on public.submissions for each row execute function public.reward_assignment_submission_trigger();

create or replace function public.reward_lesson_section_badge_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare section_number integer := 0; badge_id text;
begin
  if coalesce(new.section_id, '') ~ '[0-9]+$' then section_number := least(9, (regexp_match(new.section_id, '([0-9]+)$'))[1]::integer); end if;
  badge_id := 'section-' || section_number;
  perform public.unlock_reward_achievement(new.student_id, badge_id, 'section',
    case when section_number = 0 then 'Pamiętam klasę IV!' else 'Odznaka działu ' || section_number end,
    case when section_number = 0 then 'Gratulacje — pamiętasz ważne rzeczy z poprzedniej klasy.' else 'Pierwsza ukończona lekcja przybliża Cię do pełnej kolekcji działu.' end);
  return new;
end;
$$;

drop trigger if exists reward_lesson_section_badge on public.lesson_session_grades;
create trigger reward_lesson_section_badge after insert on public.lesson_session_grades for each row execute function public.reward_lesson_section_badge_trigger();

revoke all on function public.record_student_reward_clicks(integer) from public, anon;
revoke all on function public.select_student_cosmetics(integer, text) from public, anon;
revoke all on function public.mark_reward_notifications_seen(uuid[]) from public, anon;
revoke all on function public.ensure_student_reward_profile(uuid) from public, anon, authenticated;
revoke all on function public.unlock_reward_achievement(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.grant_student_reward(uuid, text, text, text, integer, integer, boolean) from public, anon, authenticated;
grant execute on function public.record_student_reward_clicks(integer) to authenticated;
grant execute on function public.select_student_cosmetics(integer, text) to authenticated;
grant execute on function public.mark_reward_notifications_seen(uuid[]) to authenticated;
