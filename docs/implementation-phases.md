# LekcjaLab 5 — etapy wdrożenia (wg LEKCJALAB_KLASA_5_MASTER_SPEC.md)

> Status: Etap 1 (WP-010…013) — **zakończony**; build PASS  
> Animacja hero na stronie głównej (`HomeHero` / `HeroMathCanvas`) — **zachowana**

## Etap 0 — Zatrzymanie długu (`WP-000` … `WP-003`) — **zakończony**

| Paczka | Cel | Status |
|--------|-----|--------|
| WP-000 | Mapa stanu i migracji | ✅ dokumentacja |
| WP-001 | Naprawa React/lint | ✅ (0 errors) |
| WP-002 | Bezpieczeństwo sesji i RPC | ✅ migracja 025 + proxy.ts |
| WP-003 | Vitest + Playwright | ✅ |

## Etap 1 — Design system i program (`WP-010` … `WP-014`)

| Paczka | Cel | Status |
|--------|-----|--------|
| WP-010 | Tokeny + prymitywy UI | ✅ |
| WP-011 | Powłoki + nawigacja §8 | ✅ |
| WP-012 | Program kl. V + walidacja | ✅ |
| WP-013 | UI programu + homepage | ✅ |
| WP-014 | DB plan klasy | ✅ migracja 017 + actions |

## Etap 2 — Pilotaż lekcji (`WP-020` … `WP-022`)

Temat pilotażowy: **M5-1.4 Kolejność działań** (Reżyser działań).

| Paczka | Cel | Status |
|--------|-----|--------|
| WP-020 | Powłoka pakietu + LessonStageRail | ✅ |
| WP-021 | Model Reżyser działań (seed + walidator) | ✅ |
| WP-022 | Pełna treść 45 min + szablony | ✅ |

## Etap 3 — Druk i hybryda (`WP-030` … `WP-033`) — **zakończony (pilotaż M5-1.4)**

Generator papierowy A/B — zastępuje zewnętrzny generator ~150 zł/rok.

## Etap 4 — Lekcja na żywo (`WP-040` … `WP-044`) — **zakończony (pilotaż M5-1.4)**

| Paczka | Status |
|--------|--------|
| WP-040 schema sesji + RPC | **zakończony** |
| WP-041 widok tablicy | **zakończony** |
| WP-042 pulpit prowadzącego | **zakończony** |
| WP-043 tablet ucznia | **zakończony** |
| WP-044 mapa dowodów | **zakończony** |

Tablica + tablety + sesja (polling 3 s w MVP).

## Etap 5 — Treści (`WP-C1A` … `WP-C8B`) — **dział 1 zakończony**

| Paczka | Tematy | Status |
|--------|--------|--------|
| WP-C1A | M5-1.1, M5-1.2, M5-1.3 | ✅ pierwsza wersja |
| WP-C1B | M5-1.5–1.9 | ✅ pierwsza wersja |
| WP-C1C | powtórzenie + sprawdzian działu 1 | ✅ pierwsza wersja |
| WP-C2 | dział 2 (M5-2.1 … M5-2.S) | ✅ pierwsza wersja |
| WP-C3 | dział 3 (M5-3.1 … M5-3.S) | ✅ pierwsza wersja |

**Dział 1 (M5-S1):** 11 pakietów opublikowanych w rejestrze lekcji.  
**Dział 2 (M5-S2):** 8 pakietów opublikowanych.  
**Dział 3 (M5-S3):** 13 pakietów opublikowanych.  
Pozostałe działy (WP-C4…C8): metadane w programie, produkcja w kolejnych sesjach.

## Etap 6 — Wygaszenie starego UX (`WP-060` … `WP-062`) — **zakończony**

| Paczka | Cel | Status |
|--------|-----|--------|
| WP-060 | Przekierowania legacy → huby | ✅ `next.config.ts` |
| WP-061 | Konsolidacja Prace / Postępy | ✅ trasy zagnieżdżone + huby |
| WP-062 | README + `current-state.md` | ✅ |

---

**Zasada:** jedna paczka `WP-*` na sesję agenta; build po każdej paczce.
