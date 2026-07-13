-- Jednorazowe 5 punktów za pierwsze bezbłędne ukończenie gry
-- „Chrupek i Tama Liczb”. Stałe źródło nagrody zapewnia idempotencję.

create or replace function public.claim_beaver_dam_perfect_reward(elapsed_seconds integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  student uuid := auth.uid();
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

  reward_result := public.grant_student_reward(
    student,
    'game',
    'beaver-dam-perfect-first',
    'Pierwsze bezbłędne ukończenie gry Chrupek i Tama Liczb',
    5,
    0,
    false
  );

  if coalesce((reward_result ->> 'awarded')::boolean, false) then
    insert into public.student_reward_notifications(
      student_id, kind, reward_key, title, message
    ) values (
      student,
      'points',
      'beaver-dam-perfect-first',
      'Bezbłędna Tama Liczb!',
      'Zdobywasz 5 punktów za pierwsze ukończenie gry bez żadnego błędu.'
    );
  end if;

  return reward_result || jsonb_build_object('elapsedSeconds', elapsed_seconds);
end;
$$;

revoke all on function public.claim_beaver_dam_perfect_reward(integer)
  from public, anon;
grant execute on function public.claim_beaver_dam_perfect_reward(integer)
  to authenticated;
