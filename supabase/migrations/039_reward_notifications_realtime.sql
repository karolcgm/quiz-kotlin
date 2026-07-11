-- Natychmiastowy popup nagrody u zalogowanego ucznia.
-- RLS nadal ogranicza odczyt do właściciela powiadomienia.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'student_reward_notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.student_reward_notifications';
  end if;
end;
$$;
