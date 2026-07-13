-- Uczniowie mogą dodawać i cofać wyłącznie decyzje swojej drużyny w aktywnym sprincie.
create policy "Students manage own team sprint choices" on public.agile_zoo_task_choices for all to authenticated
using (exists (select 1 from public.agile_zoo_sprints z join public.agile_game_players p on p.session_id = z.session_id where z.id = agile_zoo_task_choices.sprint_id and z.status = 'planning' and p.student_id = auth.uid() and p.team_id = agile_zoo_task_choices.team_id))
with check (exists (select 1 from public.agile_zoo_sprints z join public.agile_game_players p on p.session_id = z.session_id where z.id = agile_zoo_task_choices.sprint_id and z.status = 'planning' and p.student_id = auth.uid() and p.team_id = agile_zoo_task_choices.team_id));
