# Mapa migracji UX (WP-000)

Legenda: **keep** | **adapt** | **replace** | **retire**

## Moduły

| Moduł | Decyzja | Docelowa rola |
|-------|---------|---------------|
| `HomeHero` + `HeroMathCanvas` | **keep** | Publiczny hero z animacją |
| Katalog `/symulacje` | **adapt** | Demo publiczne; silnik w lekcjach |
| `TestComposer` + widgety | **adapt** | Część modułu **Prace** |
| `/nauczyciel/zadania` | **adapt** | **Prace** (zadania cyfrowe) |
| `/nauczyciel/testy` | **adapt** | **Prace** (sprawdziany) |
| `/nauczyciel/uczniowie` | **adapt** | **Klasy** (alias `/nauczyciel/klasy`) |
| `/nauczyciel/wyniki` + dziennik | **adapt** | **Postępy** |
| `/nauczyciel/powiadomienia` | **keep** | **Wiadomości** |
| `PanelShell` + `DashboardNav` | **replace** | `TeacherShell` / `StudentShell` |
| Nawigacja „Materiały, Testy, Zadania…” | **replace** | §8: 7 pozycji |
| Wejście przez katalog symulacji | **replace** | Plan klasy V → temat → lekcja |

## Trasy docelowe (spec §8.3)

| Nowa trasa | Źródło / uwagi |
|------------|----------------|
| `/nauczyciel` | Pulpit **Dzisiaj** (adapt istniejącego dashboardu) |
| `/nauczyciel/program` | **nowa** |
| `/nauczyciel/lekcje` | **nowa** (biblioteka pakietów) |
| `/nauczyciel/prace` | **nowa** hub → testy, zadania, druk |
| `/nauczyciel/klasy` | redirect → `uczniowie` (tymczasowo) |
| `/nauczyciel/postepy` | **nowa** hub → wyniki, dziennik |
| `/uczen` | **Teraz** (adapt) |

## Dane

| Tabela | Decyzja |
|--------|---------|
| Istniejące testy/zadania | **keep** — bez utraty danych |
| `class_curriculum_plans` | **new** — WP-014 |
| `paper_results` | **new** — WP-033 |
| Sesje live | **new** — WP-040+ |

## Kolejność migracji (bez usuwania starych tras przed WP-060)

1. Nowe powłoki i nawigacja (WP-011)
2. Program kl. V w UI (WP-012–013)
3. Hub Prace / Postępy (WP-011)
4. Pilotaż lekcji M5-1.4 (WP-020–022)
5. Druk (WP-030–033)
6. Live session (WP-040–044)
7. Przekierowania i retire (WP-060–062)
