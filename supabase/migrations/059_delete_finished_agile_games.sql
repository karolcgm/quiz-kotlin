delete from public.agile_game_sessions where status = 'finished';

create or replace function public.delete_finished_agile_game()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.agile_game_sessions where id = new.id;
  return null;
end;
$$;

drop trigger if exists delete_finished_agile_game_trigger on public.agile_game_sessions;
create trigger delete_finished_agile_game_trigger
after insert or update of status on public.agile_game_sessions
for each row
when (new.status = 'finished')
execute function public.delete_finished_agile_game();
