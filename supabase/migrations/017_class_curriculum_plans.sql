-- WP-014: plan programu klasy (class_curriculum_plans + topic_plan_entries)

create table public.class_curriculum_plans (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  curriculum_id text not null,
  curriculum_version integer not null check (curriculum_version > 0),
  school_year text not null,
  subject text not null default 'matematyka',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index class_curriculum_plans_one_active_per_year
  on public.class_curriculum_plans (class_id, school_year, subject)
  where status = 'active';

create index class_curriculum_plans_class_idx on public.class_curriculum_plans (class_id);
create index class_curriculum_plans_school_idx on public.class_curriculum_plans (school_id);

create table public.topic_plan_entries (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.class_curriculum_plans(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  section_id text not null,
  topic_id text not null,
  position integer not null check (position >= 0),
  planned_start date,
  planned_end date,
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'completed', 'review', 'skipped')),
  completed_at timestamptz,
  completed_by uuid references public.profiles(id),
  teacher_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, topic_id)
);

create index topic_plan_entries_plan_position_idx
  on public.topic_plan_entries (plan_id, position);

create or replace function public.teacher_owns_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teacher_classes tc
    where tc.id = target_class_id
      and tc.teacher_id = auth.uid()
      and public.teacher_can_access_school(tc.school_id)
  );
$$;

create or replace function public.touch_class_curriculum_plan_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger class_curriculum_plans_updated_at
  before update on public.class_curriculum_plans
  for each row execute function public.touch_class_curriculum_plan_updated_at();

create trigger topic_plan_entries_updated_at
  before update on public.topic_plan_entries
  for each row execute function public.touch_class_curriculum_plan_updated_at();

alter table public.class_curriculum_plans enable row level security;
alter table public.topic_plan_entries enable row level security;

create policy "Teachers read curriculum plans in their schools"
  on public.class_curriculum_plans for select
  using (public.teacher_can_access_school(school_id));

create policy "Teachers manage own class curriculum plans"
  on public.class_curriculum_plans for all
  using (teacher_id = auth.uid() and public.teacher_can_access_school(school_id))
  with check (
    teacher_id = auth.uid()
    and public.teacher_owns_class(class_id)
    and public.teacher_can_access_school(school_id)
  );

create policy "Teachers read topic plan entries in their schools"
  on public.topic_plan_entries for select
  using (public.teacher_can_access_school(school_id));

create policy "Teachers manage topic plan entries for own plans"
  on public.topic_plan_entries for all
  using (
    exists (
      select 1
      from public.class_curriculum_plans p
      where p.id = topic_plan_entries.plan_id
        and p.teacher_id = auth.uid()
        and public.teacher_can_access_school(p.school_id)
    )
  )
  with check (
    exists (
      select 1
      from public.class_curriculum_plans p
      where p.id = topic_plan_entries.plan_id
        and p.teacher_id = auth.uid()
        and public.teacher_owns_class(p.class_id)
        and public.teacher_can_access_school(p.school_id)
    )
    and school_id = (
      select p.school_id from public.class_curriculum_plans p where p.id = topic_plan_entries.plan_id
    )
  );

-- Tworzenie planu z wpisami tematów (snapshot z klienta — definicja programu pozostaje w TS).
create or replace function public.create_class_curriculum_plan(
  p_class_id uuid,
  p_curriculum_id text,
  p_curriculum_version integer,
  p_school_year text,
  p_entries jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_teacher_id uuid := auth.uid();
  v_class public.teacher_classes%rowtype;
  v_plan_id uuid;
  v_entry jsonb;
  v_position integer;
begin
  if current_teacher_id is null or not public.is_active_teacher() then
    raise exception 'Tylko aktywny nauczyciel może utworzyć plan programu.';
  end if;

  if nullif(trim(p_curriculum_id), '') is null then
    raise exception 'Brak identyfikatora programu.';
  end if;

  if nullif(trim(p_school_year), '') is null then
    raise exception 'Brak roku szkolnego.';
  end if;

  select * into v_class
  from public.teacher_classes
  where id = p_class_id and teacher_id = current_teacher_id;

  if not found then
    raise exception 'Brak dostępu do tej klasy.';
  end if;

  if exists (
    select 1
    from public.class_curriculum_plans
    where class_id = p_class_id
      and school_year = trim(p_school_year)
      and subject = 'matematyka'
      and status = 'active'
  ) then
    raise exception 'Ta klasa ma już aktywny plan na ten rok szkolny.';
  end if;

  insert into public.class_curriculum_plans (
    school_id,
    class_id,
    teacher_id,
    curriculum_id,
    curriculum_version,
    school_year,
    status
  )
  values (
    v_class.school_id,
    p_class_id,
    current_teacher_id,
    trim(p_curriculum_id),
    p_curriculum_version,
    trim(p_school_year),
    'active'
  )
  returning id into v_plan_id;

  v_position := 0;
  for v_entry in select * from jsonb_array_elements(coalesce(p_entries, '[]'::jsonb))
  loop
    insert into public.topic_plan_entries (
      plan_id,
      school_id,
      section_id,
      topic_id,
      position,
      planned_start,
      planned_end
    )
    values (
      v_plan_id,
      v_class.school_id,
      v_entry->>'section_id',
      v_entry->>'topic_id',
      coalesce((v_entry->>'position')::integer, v_position),
      nullif(v_entry->>'planned_start', '')::date,
      nullif(v_entry->>'planned_end', '')::date
    );
    v_position := v_position + 1;
  end loop;

  return v_plan_id;
end;
$$;

create or replace function public.update_topic_plan_entry_status(
  p_entry_id uuid,
  p_status text,
  p_teacher_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_teacher_id uuid := auth.uid();
  v_entry public.topic_plan_entries%rowtype;
begin
  if current_teacher_id is null or not public.is_active_teacher() then
    raise exception 'Tylko aktywny nauczyciel może zmienić status tematu.';
  end if;

  if p_status not in ('planned', 'in_progress', 'completed', 'review', 'skipped') then
    raise exception 'Nieprawidłowy status tematu.';
  end if;

  select e.* into v_entry
  from public.topic_plan_entries e
  join public.class_curriculum_plans p on p.id = e.plan_id
  where e.id = p_entry_id
    and p.teacher_id = current_teacher_id;

  if not found then
    raise exception 'Brak dostępu do wpisu planu.';
  end if;

  update public.topic_plan_entries
  set
    status = p_status,
    teacher_note = coalesce(p_teacher_note, teacher_note),
    completed_at = case when p_status = 'completed' then now() else completed_at end,
    completed_by = case when p_status = 'completed' then current_teacher_id else completed_by end
  where id = p_entry_id;
end;
$$;

grant execute on function public.create_class_curriculum_plan(uuid, text, integer, text, jsonb) to authenticated;
grant execute on function public.update_topic_plan_entry_status(uuid, text, text) to authenticated;
grant execute on function public.teacher_owns_class(uuid) to authenticated;
