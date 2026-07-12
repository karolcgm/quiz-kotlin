create extension if not exists pg_cron;

create index if not exists agile_game_sessions_created_at_idx
  on public.agile_game_sessions (created_at);

create or replace function public.delete_expired_agile_games()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.agile_game_sessions
  where created_at <= now() - interval '12 hours';
end;
$$;

revoke all on function public.delete_expired_agile_games() from public;

select public.delete_expired_agile_games();

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'delete-expired-agile-games'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'delete-expired-agile-games',
    '* * * * *',
    $command$select public.delete_expired_agile_games();$command$
  );
end;
$$;
