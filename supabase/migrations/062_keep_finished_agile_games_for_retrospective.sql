-- Ekran końcowy wymaga zachowania danych gry po jej ukończeniu.
drop trigger if exists delete_finished_agile_game_trigger on public.agile_game_sessions;
drop function if exists public.delete_finished_agile_game();
