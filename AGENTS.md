<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# LekcjaLab platform rules

Publiczny katalog symulacji pozostaje dostępny bez konta.

Panel nauczyciela i panel ucznia używają Supabase Auth oraz Supabase Postgres.

Rejestracja nauczyciela tworzy konto oczekujące na ręczną aktywację przez admina.

Uczeń może zarejestrować się tylko z linku zaproszenia wysłanego przez nauczyciela.

Dane uczniów, klas, grup i testów muszą być separowane po szkole. Jeden nauczyciel może uczyć w wielu szkołach, a klasy o tej samej nazwie w różnych szkołach nie mogą mieszać uczniów.
