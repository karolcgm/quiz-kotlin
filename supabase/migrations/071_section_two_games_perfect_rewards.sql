-- Jednorazowe nagrody za pierwsze bezbłędne ukończenie gier z działu II.

create or replace function public.claim_visual_game_perfect_reward(
  game_key text,
  elapsed_seconds integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  student uuid := auth.uid();
  source_id text;
  reward_reason text;
  reward_title text;
  reward_result jsonb;
begin
  if student is null or not exists (
    select 1 from public.profiles profile
    where profile.id = student
      and profile.role = 'student'
      and profile.status = 'active'
  ) then
    raise exception 'Nagrodę może odebrać wyłącznie aktywny uczeń.';
  end if;

  if elapsed_seconds is null or elapsed_seconds < 0 or elapsed_seconds > 3600 then
    raise exception 'Nieprawidłowy czas ukończenia gry.';
  end if;

  case game_key
    when 'fraction-lighthouse' then
      source_id := 'fraction-lighthouse-perfect-first';
      reward_reason := 'Pierwsze bezbłędne ukończenie gry Latarnia Ułamków';
      reward_title := 'Latarnia świeci pełnym blaskiem!';
    when 'space-courier' then
      source_id := 'space-courier-perfect-first';
      reward_reason := 'Pierwsze bezbłędne ukończenie gry Kosmiczny Kurier';
      reward_title := 'Perfekcyjna kosmiczna trasa!';
    when 'number-factory' then
      source_id := 'number-factory-perfect-first';
      reward_reason := 'Pierwsze bezbłędne ukończenie gry Fabryka Liczb';
      reward_title := 'Fabryka działa bezbłędnie!';
    when 'expedition-nwd-nww' then
      source_id := 'expedition-nwd-nww-perfect-first';
      reward_reason := 'Pierwsze bezbłędne ukończenie gry Baza Wyprawy';
      reward_title := 'Wyprawa zaplanowana perfekcyjnie!';
    else
      raise exception 'Nieprawidłowy klucz gry.';
  end case;

  reward_result := public.grant_student_reward(
    student, 'game', source_id, reward_reason, 5, 0, false
  );

  if coalesce((reward_result ->> 'awarded')::boolean, false) then
    insert into public.student_reward_notifications(
      student_id, kind, reward_key, title, message
    ) values (
      student, 'points', source_id, reward_title,
      'Zdobywasz 5 punktów za pierwsze ukończenie tej gry bez żadnego błędu.'
    );
  end if;

  return reward_result || jsonb_build_object('elapsedSeconds', elapsed_seconds);
end;
$$;

revoke all on function public.claim_visual_game_perfect_reward(text, integer)
  from public, anon;
grant execute on function public.claim_visual_game_perfect_reward(text, integer)
  to authenticated;
