# LekcjaLab

Interaktywne pomoce naukowe dla nauczycieli szkoły podstawowej — program matematyki klasy V, lekcje na tablicę, druk A/B i panel ucznia.

## Stack

- **Next.js 16** (App Router), React 19, Tailwind CSS 4
- **Supabase** — Auth, Postgres, RLS
- **Vercel** — hosting produkcyjny

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

Zmienne środowiskowe (`.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` — w produkcji wymagane (https), używane w linkach zaproszeń i auth

## Skrypty

| Polecenie | Opis |
|-----------|------|
| `npm run dev` | Serwer deweloperski |
| `npm run build` | Build produkcyjny |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (jednostkowe) |
| `npm run test:e2e` | Playwright (smoke) |

## Struktura

- `src/app` — routing (publiczny katalog, panel nauczyciela, panel ucznia)
- `src/components` — UI, symulacje, powłoki lekcji
- `src/data` — program kl. V, pakiety lekcji
- `src/lib` — Supabase, server actions, matematyka
- `supabase/migrations` — schemat DB i RPC

## Panel nauczyciela (nawigacja §8)

| Trasa | Opis |
|-------|------|
| `/nauczyciel` | Pulpit **Dzisiaj** |
| `/nauczyciel/program` | Mapa programu kl. V |
| `/nauczyciel/lekcje` | Biblioteka pakietów lekcyjnych |
| `/nauczyciel/prace` | Hub: testy, zadania, druk |
| `/nauczyciel/uczniowie` | Klasy i zaproszenia |
| `/nauczyciel/postepy` | Hub: wyniki, dziennik |
| `/nauczyciel/powiadomienia` | Wiadomości |

Stare trasy (`/testy`, `/zadania`, `/wyniki`, `/dziennik`) przekierowują pod nowe huby — szczegóły w `docs/migration-map.md`.

## Stan treści (dział 1)

**Dział 1** — kompletny (M5-1.1 … M5-1.S).  
**Dział 2** — kompletny w pierwszej wersji (M5-2.1 … M5-2.S).  
Pilotaż pełnego cyklu (live + A/B + mapa dowodów): **M5-1.4 Kolejność działań**.

Pozostałe działy programu: metadane w UI („W przygotowaniu”) — kolejne paczki WP-C3…C8.

## Dokumentacja

- `LEKCJALAB_KLASA_5_MASTER_SPEC.md` — specyfikacja produktu
- `docs/implementation-phases.md` — etapy wdrożenia
- `docs/current-state.md` — mapa repozytorium
- `docs/testing.md` — testy i CI
- `docs/bramka-b-checklist.md` — akceptacja pilotażu M5-1.4

## Migracje Supabase

```bash
# Po skonfigurowaniu Supabase CLI
supabase db push
```

Migracje `001`–`025` — opis w `docs/supabase-migrations.md`.
