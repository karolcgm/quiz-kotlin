create or replace function public.delete_expired_agile_games()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.agile_game_sessions
  where created_at <= now() - interval '12 hours'
     or (status = 'lobby' and created_at <= now() - interval '10 minutes');
end;
$$;

select public.delete_expired_agile_games();
