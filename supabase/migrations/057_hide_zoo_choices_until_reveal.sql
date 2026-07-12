drop policy if exists "Class members read zoo choices" on public.agile_zoo_task_choices;
create policy "Teams read own choices until reveal" on public.agile_zoo_task_choices for select to authenticated
using (exists (
  select 1 from public.agile_zoo_sprints z
  join public.agile_game_sessions s on s.id = z.session_id
  where z.id = agile_zoo_task_choices.sprint_id
    and (
      s.teacher_id = auth.uid()
      or z.status <> 'planning'
      or exists (select 1 from public.agile_game_players p where p.session_id = z.session_id and p.student_id = auth.uid() and p.team_id = agile_zoo_task_choices.team_id)
    )
));

drop policy if exists "Class members read zoo state" on public.agile_zoo_team_state;
create policy "Teams read own state until reveal" on public.agile_zoo_team_state for select to authenticated
using (exists (
  select 1 from public.agile_game_sessions s
  where s.id = agile_zoo_team_state.session_id
    and (
      s.teacher_id = auth.uid()
      or exists (select 1 from public.agile_zoo_sprints z where z.session_id = s.id and z.status <> 'planning')
      or exists (select 1 from public.agile_game_players p where p.session_id = s.id and p.student_id = auth.uid() and p.team_id = agile_zoo_team_state.team_id)
    )
));
