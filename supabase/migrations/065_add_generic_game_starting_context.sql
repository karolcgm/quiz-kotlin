-- Pierwszy sprint nowych gier ma być sytuacją startową, nie ukrytym kryzysem.
update public.agile_zoo_sprints z
set event_id = concat(s.template_id, '-setup')
from public.agile_game_sessions s
where s.id = z.session_id
  and z.sprint_number = 1
  and z.status = 'planning'
  and s.template_id in ('mars-mission', 'game-studio', 'future-city')
  and z.event_id = concat(s.template_id, '-1');
