create table if not exists public.agile_game_team_snapshots (
  session_id uuid not null references public.agile_game_sessions(id) on delete cascade,
  team_id uuid not null references public.agile_game_teams(id) on delete cascade,
  sprint_number integer not null check (sprint_number between 1 and 6),
  visitors integer not null check (visitors >= 0),
  budget integer not null check (budget >= 0),
  primary key (session_id, team_id, sprint_number)
);

alter table public.agile_game_team_snapshots enable row level security;

create policy "Class members read agile result history" on public.agile_game_team_snapshots for select to authenticated using (
  exists (select 1 from public.agile_game_sessions s where s.id = agile_game_team_snapshots.session_id and (s.teacher_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = s.class_id and cm.student_id = auth.uid())))
);

create policy "Teachers manage agile result history" on public.agile_game_team_snapshots for all to authenticated using (
  exists (select 1 from public.agile_game_sessions s where s.id = agile_game_team_snapshots.session_id and s.teacher_id = auth.uid())
) with check (
  exists (select 1 from public.agile_game_sessions s where s.id = agile_game_team_snapshots.session_id and s.teacher_id = auth.uid())
);
