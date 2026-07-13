create table if not exists public.agile_game_team_budget_effects (
  session_id uuid not null references public.agile_game_sessions(id) on delete cascade,
  team_id uuid not null references public.agile_game_teams(id) on delete cascade,
  task_id integer not null,
  title text not null,
  budget_delta integer not null,
  starts_from_sprint integer not null check (starts_from_sprint between 2 and 7),
  primary key (session_id, team_id, task_id)
);

create table if not exists public.agile_game_story_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.agile_game_sessions(id) on delete cascade,
  team_id uuid not null references public.agile_game_teams(id) on delete cascade,
  sprint_number integer not null check (sprint_number between 1 and 6),
  body text not null,
  visitors_delta integer not null default 0,
  budget_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists agile_game_story_events_team_sprint_idx on public.agile_game_story_events (session_id, team_id, sprint_number);

alter table public.agile_game_team_budget_effects enable row level security;
alter table public.agile_game_story_events enable row level security;

create policy "Class members read agile budget effects" on public.agile_game_team_budget_effects for select to authenticated using (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_team_budget_effects.session_id and (s.teacher_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = s.class_id and cm.student_id = auth.uid()))));
create policy "Teachers manage agile budget effects" on public.agile_game_team_budget_effects for all to authenticated using (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_team_budget_effects.session_id and s.teacher_id = auth.uid())) with check (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_team_budget_effects.session_id and s.teacher_id = auth.uid()));
create policy "Class members read agile story events" on public.agile_game_story_events for select to authenticated using (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_story_events.session_id and (s.teacher_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = s.class_id and cm.student_id = auth.uid()))));
create policy "Teachers manage agile story events" on public.agile_game_story_events for all to authenticated using (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_story_events.session_id and s.teacher_id = auth.uid())) with check (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_story_events.session_id and s.teacher_id = auth.uid()));
