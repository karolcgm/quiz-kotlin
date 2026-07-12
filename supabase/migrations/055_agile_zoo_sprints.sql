create table if not exists public.agile_zoo_sprints (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.agile_game_sessions(id) on delete cascade,
  sprint_number integer not null check (sprint_number between 1 and 6),
  status text not null default 'planning' check (status in ('planning', 'revealed', 'finished')),
  created_at timestamptz not null default now(),
  unique (session_id, sprint_number)
);

create table if not exists public.agile_zoo_team_state (
  session_id uuid not null references public.agile_game_sessions(id) on delete cascade,
  team_id uuid not null references public.agile_game_teams(id) on delete cascade,
  visitors integer not null default 150 check (visitors >= 0),
  budget integer not null default 50 check (budget between 0 and 100),
  crises jsonb not null default '[]'::jsonb,
  primary key (session_id, team_id)
);

create table if not exists public.agile_zoo_task_choices (
  sprint_id uuid not null references public.agile_zoo_sprints(id) on delete cascade,
  team_id uuid not null references public.agile_game_teams(id) on delete cascade,
  task_id integer not null,
  selected_by uuid references public.profiles(id) on delete set null,
  primary key (sprint_id, team_id, task_id)
);

alter table public.agile_zoo_sprints enable row level security;
alter table public.agile_zoo_team_state enable row level security;
alter table public.agile_zoo_task_choices enable row level security;

drop policy if exists "Class members read zoo sprints" on public.agile_zoo_sprints;
drop policy if exists "Teachers manage zoo sprints" on public.agile_zoo_sprints;
drop policy if exists "Class members read zoo state" on public.agile_zoo_team_state;
drop policy if exists "Teachers manage zoo state" on public.agile_zoo_team_state;
drop policy if exists "Class members read zoo choices" on public.agile_zoo_task_choices;
drop policy if exists "Teachers manage zoo choices" on public.agile_zoo_task_choices;

create policy "Class members read zoo sprints" on public.agile_zoo_sprints for select to authenticated using (exists (select 1 from public.agile_game_sessions s where s.id = agile_zoo_sprints.session_id and (s.teacher_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = s.class_id and cm.student_id = auth.uid()))));
create policy "Teachers manage zoo sprints" on public.agile_zoo_sprints for all to authenticated using (exists (select 1 from public.agile_game_sessions s where s.id = agile_zoo_sprints.session_id and s.teacher_id = auth.uid())) with check (exists (select 1 from public.agile_game_sessions s where s.id = agile_zoo_sprints.session_id and s.teacher_id = auth.uid()));
create policy "Class members read zoo state" on public.agile_zoo_team_state for select to authenticated using (exists (select 1 from public.agile_game_sessions s where s.id = agile_zoo_team_state.session_id and (s.teacher_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = s.class_id and cm.student_id = auth.uid()))));
create policy "Teachers manage zoo state" on public.agile_zoo_team_state for all to authenticated using (exists (select 1 from public.agile_game_sessions s where s.id = agile_zoo_team_state.session_id and s.teacher_id = auth.uid())) with check (exists (select 1 from public.agile_game_sessions s where s.id = agile_zoo_team_state.session_id and s.teacher_id = auth.uid()));
create policy "Class members read zoo choices" on public.agile_zoo_task_choices for select to authenticated using (exists (select 1 from public.agile_zoo_sprints z join public.agile_game_sessions s on s.id = z.session_id where z.id = agile_zoo_task_choices.sprint_id and (s.teacher_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = s.class_id and cm.student_id = auth.uid()))));
create policy "Teachers manage zoo choices" on public.agile_zoo_task_choices for all to authenticated using (exists (select 1 from public.agile_zoo_sprints z join public.agile_game_sessions s on s.id = z.session_id where z.id = agile_zoo_task_choices.sprint_id and s.teacher_id = auth.uid())) with check (exists (select 1 from public.agile_zoo_sprints z join public.agile_game_sessions s on s.id = z.session_id where z.id = agile_zoo_task_choices.sprint_id and s.teacher_id = auth.uid()));
