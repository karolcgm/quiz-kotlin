# Wdrożenie migracji Supabase

Repo zawiera migracje `001` … `025`. Na produkcji (stan 2026-07) często brakuje **017–025**.

## Sposób 1 — SQL Editor (zalecany)

1. Supabase Dashboard → **SQL Editor**
2. Uruchom pliki **po kolei** z `supabase/migrations/`:
   - `017_class_curriculum_plans.sql`
   - `018_assessment_versions.sql`
   - `019_paper_results.sql`
   - `020_lesson_sessions.sql`
   - `021_board_session_view.sql`
   - `022_teacher_session_console.sql`
   - `023_student_session_view.sql`
   - `024_live_session_evidence.sql`
   - `025_submit_assignment_security.sql`
3. Po każdym pliku sprawdź brak błędów.

## Sposób 2 — Supabase CLI

```powershell
cd C:\Users\piotr\Projects\quiz-kotlin
npx supabase link --project-ref TWOJ_PROJECT_REF
npx supabase db push
```

Wymaga hasła bazy i tokenu CLI.

## Weryfikacja

Po wdrożeniu te zapytania w SQL Editor powinny działać (jako authenticated teacher):

```sql
select count(*) from class_curriculum_plans;
select count(*) from lesson_sessions;
```

W aplikacji: generator kartkówki M5-1.4 i start sesji live nie powinny zwracać błędu RPC „function not found”.
