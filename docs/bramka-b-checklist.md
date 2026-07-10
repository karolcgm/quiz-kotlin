# Bramka B — checklista pilotażu M5-1.4

> Ręczna akceptacja przed Etapem 5 (masowa produkcja treści).  
> Wymaga wdrożonych migracji **017–025** na Supabase.

## Wymagania wstępne

- [ ] Migracje `017` … `025` nałożone na projekt Supabase
- [ ] Front wdrożony na Vercel z `NEXT_PUBLIC_APP_URL` (https)
- [ ] Konto nauczyciela aktywne + klasa testowa + min. 2 uczniów

## Scenariusz end-to-end (≈45 min)

| Krok | Trasa / akcja | OK? |
|------|----------------|-----|
| 1 | Program → temat M5-1.4 → status „Opublikowany” | ☐ |
| 2 | `/nauczyciel/lekcje/m5-1-4-rezyser-dzialan-v1` — podgląd wszystkich etapów | ☐ |
| 3 | Start sesji live → wybór klasy | ☐ |
| 4 | Tablica `/tablica/[sessionId]` — lobby, QR, etapy | ☐ |
| 5 | Tablet ucznia — dołączenie kodem, odpowiedź | ☐ |
| 6 | Pulpit nauczyciela — histogram, zmiana etapu | ☐ |
| 7 | Zakończenie + podsumowanie klasy i ucznia | ☐ |
| 8 | Generator A/B → druk → wpis wyników papierowych | ☐ |

## Urządzenia i druk

- [ ] 1024×768 — tablica czytelna
- [ ] 1366×768 — pulpit nauczyciela bez horizontal scroll
- [ ] Druk A4 (`/druk`, `/generator/druk`) — bez uciętych zadań, skala 100%

## Decyzja

| Opcja | Kiedy |
|-------|--------|
| **AKCEPTUJ** | Wszystkie punkty scenariusza OK → start WP-C1A |
| **POPRAWKI** | Lista blokujących usterek → wróć do odpowiedniego WP-0xx/04x |
| **ODŁÓŻ LIVE** | Druk + cyfrowe OK, live nie → Etap 5 bez sesji na żywo dla nowych tematów |

Data: _______________  Decyzja: _______________  Podpis: _______________
