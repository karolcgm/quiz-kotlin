# Stan repozytorium LekcjaLab (WP-000)

> Data: 2026-07-10 (aktualizacja po WP-C1B/C1C + WP-060–062)  
> Cel: mapa po redefinicji portalu wg `LEKCJALAB_KLASA_5_MASTER_SPEC.md`

## Stack

| Warstwa | Technologia |
|---------|-------------|
| Frontend | Next.js 16 App Router, React 19, Tailwind 4 |
| Backend | Supabase Auth + Postgres, server actions |
| Hosting docelowy | Vercel Pro + Supabase Pro |

## Trasy publiczne

| Trasa | Plik | Opis |
|-------|------|------|
| `/` | `src/app/page.tsx` | Strona główna — **HeroMathCanvas zachowany** |
| `/program/klasa-5` | `src/app/program/klasa-5/**` | Publiczna mapa programu kl. V |
| `/symulacje` | `src/app/symulacje/page.tsx` | Katalog publiczny (bez konta) |
| `/symulacje/[slug]` | `src/app/symulacje/[slug]/page.tsx` | Demo symulacji |
| `/logowanie`, `/rejestracja` | auth | Supabase Auth |

## Panel nauczyciela (nawigacja §8.1)

| Trasa | Opis |
|-------|------|
| `/nauczyciel` | **Dzisiaj** — pulpit operacyjny |
| `/nauczyciel/program/**` | **Program** — mapa `pl-math-5-2026-classic` |
| `/nauczyciel/lekcje` | **Lekcje** — biblioteka pakietów |
| `/nauczyciel/prace` | **Prace** — hub testów, zadań, druku |
| `/nauczyciel/prace/testy`, `/prace/zadania` | Listy modułów (WP-061) |
| `/nauczyciel/uczniowie/**` | **Klasy** — uczniowie, zaproszenia |
| `/nauczyciel/postepy` | **Postępy** — hub wyników i dziennika |
| `/nauczyciel/postepy/wyniki`, `/postepy/dziennik` | Moduły postępów (WP-061) |
| `/nauczyciel/powiadomienia/**` | **Wiadomości** |

**WP-060:** przekierowania w `next.config.ts` — `/testy` → `/prace/testy`, `/zadania` → `/prace/zadania`, `/wyniki` → `/postepy/wyniki`, `/dziennik` → `/postepy/dziennik`. Trasy szczegółowe (`/testy/[id]`, …) bez zmian.

Powłoka: `TeacherShell` + `ShellNav` w `src/components/shells/`.

## Panel ucznia

| Trasa | Opis |
|-------|------|
| `/uczen` | Dashboard **Teraz** |
| `/uczen/testy/**` | Rozwiązywanie przypisań |
| `/uczen/szybki-test` | Ćwiczenia |
| `/uczen/postepy` | Mapa umiejętności |
| `/uczen/sesja/**` | Sesja live (M5-1.4 pilotaż) |
| `/uczen/powiadomienia` | Wiadomości |

## Baza danych (migracje 001–025)

- Rdzeń: profile, szkoły, klasy, testy, zadania, wyniki
- Program: `class_curriculum_plans`, `topic_plan_entries` (017)
- Druk hybrydowy: blueprinty, `paper_results`, `skill_evidence` (018–019, 024)
- Sesje live: `lesson_sessions`, snapshoty, odpowiedzi (020–024)
- Bezpieczeństwo submit: migracja 025 + `src/proxy.ts`

## Pakiety lekcji — dział 1 (WP-C1A–C1C) ✅

| Temat | ID pakietu | Live | A/B |
|-------|------------|------|-----|
| M5-1.1 | `m5-1-1-fabryka-liczb-v1` | — | druk etapów |
| M5-1.2 | `m5-1-2-skoki-po-osi-v1` | — | druk |
| M5-1.3 | `m5-1-3-prostokat-mnozenia-v1` | — | druk |
| M5-1.4 | `m5-1-4-rezyser-dzialan-v1` | ✅ | ✅ generator |
| M5-1.5–1.9 | `m5-1-5-…` … `m5-1-9-…` | — | druk |
| M5-1.R | `m5-1-r-elektrownia-v1` | — | mapa powtórki |
| M5-1.S | `m5-1-s-sprawdzian-v1` | — | arkusze A/B |

Rejestr: `src/data/lessons/registry.ts` — **19 pakietów opublikowanych** (działy 1–2).

## Etapy zakończone

| Etap | Paczki | Status |
|------|--------|--------|
| 0 | WP-000…003 | ✅ |
| 1 | WP-010…014 | ✅ |
| 2–4 | WP-020…044 (pilotaż M5-1.4) | ✅ |
| 5 (dział 1–2) | WP-C1A…C1C, WP-C2 | ✅ |
| 6 | WP-060…062 | ✅ |

## Kolejne kroki

- **WP-C3…C8** — pozostałe ~62 tematy programu (działy 3–8)
- Bramka B — ręczna akceptacja pilotażu M5-1.4 (`docs/bramka-b-checklist.md`)

## Lint / build / testy

```bash
npm run build   # PASS wymagany przed deploy
npm run lint
npm run test
npm run test:e2e
```

Szczegóły: `docs/testing.md`, CI: `.github/workflows/test.yml`.
