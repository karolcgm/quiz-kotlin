create table public.agile_game_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  template_id text not null check (template_id in ('zoo-sprint', 'mars-mission', 'game-studio', 'future-city')),
  title text not null,
  status text not null default 'lobby' check (status in ('lobby', 'active', 'finished')),
  sprint_number integer not null default 1 check (sprint_number between 1 and 6),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz
);

create table public.agile_game_teams (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.agile_game_sessions(id) on delete cascade,
  name text not null,
  color text not null,
  unique (session_id, name)
);

create table public.agile_game_players (
  session_id uuid not null references public.agile_game_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null references public.agile_game_teams(id) on delete cascade,
  roles text[] not null default '{}',
  joined_at timestamptz not null default now(),
  primary key (session_id, student_id)
);

create table public.agile_game_moves (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.agile_game_sessions(id) on delete cascade,
  team_id uuid not null references public.agile_game_teams(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('plan', 'deliver', 'retro')),
  content text not null check (char_length(content) between 1 and 280),
  created_at timestamptz not null default now()
);

alter table public.agile_game_sessions enable row level security;
alter table public.agile_game_teams enable row level security;
alter table public.agile_game_players enable row level security;
alter table public.agile_game_moves enable row level security;

create policy "Teachers manage their agile games" on public.agile_game_sessions for all to authenticated
using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "Class students read agile games" on public.agile_game_sessions for select to authenticated
using (exists (select 1 from public.class_members cm where cm.class_id = agile_game_sessions.class_id and cm.student_id = auth.uid()));
create policy "Class members read agile teams" on public.agile_game_teams for select to authenticated
using (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_teams.session_id and (s.teacher_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = s.class_id and cm.student_id = auth.uid()))));
create policy "Teachers manage agile teams" on public.agile_game_teams for all to authenticated
using (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_teams.session_id and s.teacher_id = auth.uid())) with check (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_teams.session_id and s.teacher_id = auth.uid()));
create policy "Class members read agile players" on public.agile_game_players for select to authenticated
using (student_id = auth.uid() or exists (select 1 from public.agile_game_sessions s where s.id = agile_game_players.session_id and (s.teacher_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = s.class_id and cm.student_id = auth.uid()))));
create policy "Students join own agile game" on public.agile_game_players for insert to authenticated with check (
  student_id = auth.uid()
  and exists (select 1 from public.agile_game_sessions s join public.class_members cm on cm.class_id = s.class_id where s.id = agile_game_players.session_id and s.status = 'lobby' and cm.student_id = auth.uid())
  and exists (select 1 from public.agile_game_teams t where t.id = agile_game_players.team_id and t.session_id = agile_game_players.session_id)
);
create policy "Students update own agile place" on public.agile_game_players for update to authenticated using (student_id = auth.uid()) with check (
  student_id = auth.uid()
  and exists (select 1 from public.agile_game_sessions s where s.id = agile_game_players.session_id and s.status = 'lobby')
  and exists (select 1 from public.agile_game_teams t where t.id = agile_game_players.team_id and t.session_id = agile_game_players.session_id)
);
create policy "Teachers assign agile roles" on public.agile_game_players for update to authenticated using (
  exists (select 1 from public.agile_game_sessions s where s.id = agile_game_players.session_id and s.teacher_id = auth.uid())
) with check (
  exists (select 1 from public.agile_game_sessions s where s.id = agile_game_players.session_id and s.teacher_id = auth.uid())
);
create policy "Class members read agile moves" on public.agile_game_moves for select to authenticated
using (exists (select 1 from public.agile_game_sessions s where s.id = agile_game_moves.session_id and (s.teacher_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = s.class_id and cm.student_id = auth.uid()))));
create policy "Students add own agile moves" on public.agile_game_moves for insert to authenticated with check (
  student_id = auth.uid()
  and exists (select 1 from public.agile_game_players p join public.agile_game_sessions s on s.id = p.session_id where p.session_id = agile_game_moves.session_id and p.student_id = auth.uid() and p.team_id = agile_game_moves.team_id and s.status = 'active')
);
