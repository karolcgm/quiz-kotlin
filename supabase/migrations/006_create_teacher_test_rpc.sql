-- Transactional teacher test creation.
-- Apply after 005_create_school_class_rpc.sql.

create or replace function public.create_teacher_test(
  target_school_id uuid,
  test_title text,
  test_description text,
  test_instruction text,
  target_class_level integer,
  target_status public.test_status,
  items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_teacher_id uuid := auth.uid();
  created_test_id uuid;
  item jsonb;
  max_points_value numeric := 0;
begin
  if current_teacher_id is null or not public.is_active_teacher() then
    raise exception 'Tylko aktywny nauczyciel może utworzyć test.';
  end if;

  if not public.teacher_can_access_school(target_school_id) then
    raise exception 'Nie masz dostępu do wybranej szkoły.';
  end if;

  if nullif(trim(test_title), '') is null then
    raise exception 'Brak tytułu testu.';
  end if;

  if target_class_level < 1 or target_class_level > 8 then
    raise exception 'Klasa musi być liczbą od 1 do 8.';
  end if;

  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'Test musi mieć przynajmniej jedno pytanie.';
  end if;

  select coalesce(sum(coalesce((value ->> 'points')::numeric, 0)), 0)
  into max_points_value
  from jsonb_array_elements(items);

  insert into public.tests (
    teacher_id,
    school_id,
    title,
    description,
    instruction,
    class_level,
    status,
    max_points,
    config
  )
  values (
    current_teacher_id,
    target_school_id,
    trim(test_title),
    nullif(trim(test_description), ''),
    nullif(trim(test_instruction), ''),
    target_class_level,
    target_status,
    max_points_value,
    jsonb_build_object('source', 'composer')
  )
  returning id into created_test_id;

  for item in select value from jsonb_array_elements(items)
  loop
    insert into public.test_items (
      test_id,
      position,
      simulation_slug,
      widget_kind,
      skill,
      title,
      prompt,
      points,
      params
    )
    values (
      created_test_id,
      coalesce((item ->> 'position')::integer, 1),
      coalesce(item ->> 'simulationSlug', item ->> 'simulation_slug'),
      coalesce(item ->> 'widgetKind', item ->> 'widget_kind'),
      item ->> 'skill',
      item ->> 'title',
      item ->> 'prompt',
      coalesce((item ->> 'points')::numeric, 1),
      coalesce(item -> 'params', '{}'::jsonb)
    );
  end loop;

  return created_test_id;
end;
$$;

grant execute on function public.create_teacher_test(
  uuid,
  text,
  text,
  text,
  integer,
  public.test_status,
  jsonb
) to authenticated;
