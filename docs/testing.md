# Testy — LekcjaLab (WP-003)

## Wymagania

- Node.js 20+
- Windows: używaj `npm.cmd` zamiast `npm`, jeśli PowerShell blokuje skrypty

## Testy jednostkowe (Vitest)

```bash
npm run test
npm run test:watch
npm run test:generators
```

Pokrycie startowe:

- parser polskiej liczby (`src/lib/math/parsePolishNumber.ts`)
- ocena punktowa → ocena 1–6 (`src/lib/grading/mark.ts`, `score.ts`)
- model Reżyser działań (`orderOfOperations/generator.ts`)

Testy **nie** łączą się z produkcyjną bazą Supabase.

## Testy E2E (Playwright)

Pierwsze uruchomienie — instalacja przeglądarki:

```bash
npx playwright install chromium
```

Smoke (publiczny katalog, formularz logowania, redirect chronionej trasy):

```bash
npm run test:e2e
```

Playwright uruchamia `npm run dev` automatycznie (lub używa działającego serwera lokalnie).

### Opcjonalne logowanie testowe

Bez sekretów w repo. Ustaw zmienne środowiskowe lokalnie lub w CI:

| Zmienna | Opis |
|---------|------|
| `PLAYWRIGHT_TEST_STUDENT_EMAIL` | Konto ucznia testowego |
| `PLAYWRIGHT_TEST_STUDENT_PASSWORD` | Hasło |
| `PLAYWRIGHT_BASE_URL` | Domyślnie `http://localhost:3000` |

Test zalogowanego ucznia jest **pomijany**, gdy brak powyższych danych.

## CI

Workflow `.github/workflows/test.yml` uruchamia `lint`, `test` i `build`. E2E można włączyć po dodaniu sekretów w repozytorium.
