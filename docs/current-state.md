# Stan repozytorium LekcjaLab (WP-000)

> Data: 2026-07-10 (aktualizacja po WP-010…013)  
> Cel: mapa po pierwszej redefinicji portalu wg `LEKCJALAB_KLASA_5_MASTER_SPEC.md`

## Stack

| Warstwa | Technologia |
|---------|-------------|
| Frontend | Next.js 16 App Router, React 19, Tailwind 4 |
| Backend | Supabase Auth + Postgres, server actions |
| Hosting docelowy | Vercel Pro + Supabase Pro |

## Trasy publiczne

| Trasa | Plik | Opis |
|-------|------|------|
| `/` | `src/app/page.tsx` | Nowa strona główna — **HeroMathCanvas zachowany** |
| `/program/klasa-5` | `src/app/program/klasa-5/**` | Publiczna mapa programu kl. V |
| `/symulacje` | `src/app/symulacje/page.tsx` | Katalog publiczny (bez konta) |
| `/symulacje/[slug]` | `src/app/symulacje/[slug]/page.tsx` | Demo symulacji |
| `/klasy`, `/klasy/[grade]` | `src/app/klasy/**` | Przegląd klas |
| `/logowanie`, `/rejestracja` | auth | Supabase Auth |

## Panel nauczyciela (nawigacja §8.1)

| Trasa | Opis |
|-------|------|
| `/nauczyciel` | **Dzisiaj** — pulpit operacyjny (legacy dashboard) |
| `/nauczyciel/program/**` | **Program** — mapa `pl-math-5-2026-classic` |
| `/nauczyciel/lekcje` | **Lekcje** — hub biblioteki pakietów |
| `/nauczyciel/prace` | **Prace** — testy, zadania, druk (wkrótce) |
| `/nauczyciel/uczniowie/**` | **Klasy** — uczniowie, zaproszenia |
| `/nauczyciel/postepy` | **Postępy** — hub wyników i dziennika |
| `/nauczyciel/powiadomienia/**` | **Wiadomości** |

Stare trasy (`/testy`, `/zadania`, `/wyniki`, `/dziennik`) nadal działają — mapa w `src/data/dashboardNav.ts`.

Powłoka: `TeacherShell` + `ShellNav` w `src/components/shells/`.

## Panel ucznia

| Trasa | Opis |
|-------|------|
| `/uczen` | Dashboard |
| `/uczen/testy/**` | Rozwiązywanie przypisań |
| `/uczen/szybki-test` | Ćwiczenia |
| `/uczen/wyniki/**` | Wyniki |
| `/uczen/postepy` | Postępy |
| `/uczen/powiadomienia` | Wiadomości |

## Baza danych (migracje 001–016)

- `profiles`, `schools`, `teacher_classes`, `class_members`
- `tests`, `test_items`, `assignments`, `submissions`, `submission_answers`, `submission_scores`
- `notifications`, `retake_requests`, `gradebook_notes`
- `practice_attempts`, `practice_answers`
- RPC: tworzenie testów, przypisań, submit, powiadomienia

## Komponenty symulacji

- Premium: oś liczbowa, waga, memory, zbiory, miarki (`src/components/simulations/premium/`)
- Legacy/interactive: wiele modułów w `src/components/simulations/`
- Widgety oceniane: `src/lib/simulations/registry.ts` (duży rejestr)

## Design system (WP-010)

- Tokeny CSS: `src/app/globals.css` (`--canvas`, `--brand-600`, `--learn`, `--assess`…)
- Prymitywy: `Button`, `Card`, `EmptyState`, `Badge` (variant dla symulacji + tone dla programu)

## Program klasy V (WP-012 / WP-013)

- Curriculum ID: `pl-math-5-2026-classic` — 83 tematy (82 + diagnostyka)
- Dane: `src/data/curriculum/pl-math-5-2026-classic/`
- UI: `src/components/program/ProgramViews.tsx`
- Wszystkie tematy: status `metadata-only` („W przygotowaniu”)

## Lint / build (2026-07-10)

- `npm run build` — **PASS**
- `npm run lint` — **PASS** (warnings only)

## Plan klasy w DB (WP-014)

- Migracja: `supabase/migrations/017_class_curriculum_plans.sql`
- Tabele: `class_curriculum_plans`, `topic_plan_entries`
- RPC: `create_class_curriculum_plan`, `update_topic_plan_entry_status`
- Actions: `src/lib/actions/curriculumPlans.ts`

## Brakujące elementy spec (kolejne etapy)

- Pakiety lekcyjne — pilotaż **M5-1.4 opublikowany** (`m5-1-4-rezyser-dzialan-v1`, 15 instancji, 3 karty druku)
- WP-030 — **fundament HTML print** (`PrintShell`, paginacja A4, toolbar uczeń/klucz, `@media print`, route `/nauczyciel/lekcje/[id]/druk`)
- WP-031 — **blueprint A/B** (`m514-kartkowka-v1`, generator, checksum, snapshot, `/generator` + `/generator/druk`)
- WP-032 — **przypisanie z snapshotu** (migracja 018, RPC `create_blueprint_assignment`, `/generator/wyslij`)
- WP-033 — **wyniki papierowe** (migracja 019, `/generator/wyniki`, `PaperResultsGrid`, `skill_evidence`)
- Etap 3 (druk + hybryda) — **zakończony** dla pilota M5-1.4
- WP-040 — **schema sesji na żywo** (migracja 020, RPC create/join/start/pause/stage/end/submit, `lessonSessions.ts`)
- WP-041 — **widok tablicy** (`/tablica/[sessionId]`, lobby + QR + polling + pełny ekran, migracja 021)
- WP-042 — **pulpit prowadzącego** (`/nauczyciel/sesje/[id]/prowadz`, rail etapów, histogram, migracja 022)
- WP-043 — **tablet ucznia** (`/uczen/sesja/[id]`, draft lokalny, idempotentne wysłanie, migracja 023)
- WP-044 — **mapa dowodów z sesji live** (migracja 024, `skill_evidence` waga 0,25, `/nauczyciel/sesje/[id]/podsumowanie`, `/uczen/sesja/[id]/podsumowanie`)
- Etap 4 (lekcja na żywo) — **zakończony** dla pilota M5-1.4
- WP-002 — **bezpieczeństwo submit + sesja** (migracja 025, `src/proxy.ts`, `getAppOrigin` w produkcji wymaga `NEXT_PUBLIC_APP_URL` https)
- WP-003 — **testy** (`vitest`, `playwright`, `docs/testing.md`, CI workflow)
- Vitest / Playwright — WP-003
- Pełne treści 82 tematów — WP-C*
