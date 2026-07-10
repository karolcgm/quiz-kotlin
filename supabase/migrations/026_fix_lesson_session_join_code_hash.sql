-- Produkcja ma pgcrypto w schemacie `extensions`, a poprzednia funkcja
-- wywoływała niekwalifikowane digest(...). Przy search_path=public powodowało
-- to błąd podczas tworzenia sesji live.

create or replace function public.lesson_session_join_code_hash(
  target_session_id uuid,
  join_code_plain text
)
returns text
language sql
immutable
as $$
  select pg_catalog.encode(
    extensions.digest(
      pg_catalog.upper(pg_catalog.btrim(join_code_plain)) || ':' || target_session_id::text || ':lekcjalab-join-v1',
      'sha256'::text
    ),
    'hex'::text
  );
$$;
