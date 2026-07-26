create or replace function public.claim_geometry_game_score(
  game_key text,
  achieved_score integer,
  maximum_score integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  student uuid := auth.uid();
  awarded_points integer;
  current_total integer;
begin
  if student is null or not exists (
    select 1
    from public.profiles p
    where p.id = student
      and p.role = 'student'
      and p.status = 'active'
  ) then
    raise exception 'Wynik może zapisać wyłącznie aktywny uczeń.';
  end if;

  if game_key not in (
    'laser-lab',
    'polygon-forge',
    'triangle-shipyard',
    'quadrilateral-arena',
    'symmetry-temple',
    'geometry-inspector'
  ) or maximum_score <> 5
    or achieved_score < 0
    or achieved_score > maximum_score then
    raise exception 'Nieprawidłowy wynik gry.';
  end if;

  awarded_points := public.award_bounded_test_points(
    student,
    'practice',
    'geometry-game:' || game_key,
    gen_random_uuid()::text,
    'Lepszy wynik gry 3D z działu Figury na płaszczyźnie',
    achieved_score,
    maximum_score
  );

  select total_points
  into current_total
  from public.student_reward_profiles
  where student_id = student;

  if awarded_points > 0 then
    insert into public.student_reward_notifications(
      student_id,
      kind,
      reward_key,
      title,
      message
    ) values (
      student,
      'points',
      'geometry-game:' || game_key || ':' || achieved_score::text,
      'Nowy rekord gry 3D!',
      'Zdobywasz ' || awarded_points || ' pkt za poprawę najlepszego wyniku.'
    );
  end if;

  return jsonb_build_object(
    'awardedPoints', awarded_points,
    'totalPoints', current_total,
    'bestScore', achieved_score
  );
end;
$$;

revoke all on function public.claim_geometry_game_score(text, integer, integer) from public, anon;
grant execute on function public.claim_geometry_game_score(text, integer, integer) to authenticated;
