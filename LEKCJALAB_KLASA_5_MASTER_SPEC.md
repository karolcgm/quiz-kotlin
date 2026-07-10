# LekcjaLab 5 — kompletna specyfikacja produktu, UI/UX i wdrożenia

> Wersja dokumentu: 2.0  
> Data bazowa: 10 lipca 2026  
> Repozytorium docelowe: `quiz-kotlin` / produkt **LekcjaLab**  
> Zakres pierwszego pełnego wydania: **matematyka, klasa V**  
> Status dokumentu: nadrzędna specyfikacja wykonawcza dla agentów programistycznych

---

## 0. Jak używać tego dokumentu

Ten plik zastępuje wcześniejszą specyfikację `MATLAB_KLASA_5_CURSOR_SPEC.md`. Nie jest zbiorem luźnych pomysłów ani makietą. Jest kontraktem produktu, architektury, treści i odbioru.

Agent wykonujący pracę ma:

1. przeczytać `AGENTS.md`, ten dokument i wskazane pliki repozytorium;
2. realizować **jedną paczkę roboczą `WP-*` naraz**;
3. nie przebudowywać innych obszarów „przy okazji”;
4. zachować działające dane, konta, testy i migracje;
5. po każdej paczce uruchomić wskazane testy, lint i build;
6. zakończyć paczkę raportem według szablonu z końca dokumentu;
7. nie deklarować ukończenia na podstawie samego wyglądu strony.

Jeżeli implementacja i dokument są sprzeczne, obowiązuje kolejność:

1. bezpieczeństwo danych i reguły `AGENTS.md`;
2. kryteria odbioru danej paczki `WP-*`;
3. kontrakty domenowe i UI z tego dokumentu;
4. istniejące konwencje repozytorium;
5. własne decyzje agenta.

Nie wolno realizować całego dokumentu jednym monolitycznym poleceniem. Dokument celowo dzieli pracę na małe, weryfikowalne kroki, aby również tańszy model mógł wykonać je bez zgadywania.

---

# CZĘŚĆ I — PRODUKT

## 1. Jednozdaniowa definicja

**LekcjaLab 5 to centrum prowadzenia matematyki w klasie V: nauczyciel wybiera temat zgodny z planem, uruchamia gotową lekcję na tablicy, angażuje uczniów na tabletach, wysyła pracę cyfrową albo drukuje równoważne wersje sprawdzianu, a wyniki wracają do jednej mapy umiejętności.**

## 2. Zmiana względem obecnego produktu

Obecna aplikacja ma wartościowe symulacje, testy i panele, ale działa jak katalog niezależnych narzędzi. Docelowo użytkownik nie ma zaczynać od pytania „który sandbox otworzyć?”, tylko od pytania „co dziś realizuję z klasą 5?”.

### 2.1. Obecnie

- wejście przez katalog symulacji;
- wiele niezależnych trybów i lokalnych wzorców UI;
- test składany głównie z widgetów;
- ograniczone powiązanie materiału z kolejnością nauczania;
- osobne doświadczenie tablicy, testu i wyniku;
- brak kompletnego obiegu papierowego;
- brak prowadzonej sesji lekcyjnej z tabletami uczniów.

### 2.2. Docelowo

- wejście przez **Plan klasy V → dział → temat → lekcja**;
- jeden kontrakt pakietu lekcyjnego;
- spójny pulpit prowadzenia lekcji;
- równoległe kanały: tablica, tablet, papier;
- jedna baza umiejętności i jedna historia postępów;
- generator kart pracy i sprawdzianów A/B z kluczem;
- sesja na żywo z kodem/QR, tempem kontrolowanym przez nauczyciela;
- obecne symulacje stają się silnikiem interakcji wewnątrz lekcji, a nie główną strukturą informacji.

## 3. Zasady niepodlegające negocjacji

1. Publiczny katalog demonstracyjny pozostaje dostępny bez konta.
2. Panel nauczyciela i ucznia korzysta z Supabase Auth i Supabase Postgres.
3. Nauczyciel po rejestracji ma status oczekujący na ręczną aktywację admina.
4. Uczeń rejestruje się wyłącznie z ważnego zaproszenia nauczyciela.
5. Dane muszą być separowane po szkole; identyczne nazwy klas w różnych szkołach nie mogą się łączyć.
6. Nauczyciel może należeć do wielu szkół, ale zawsze pracuje w jawnie wybranym kontekście szkoły.
7. Każdy rekord operacyjny zawiera lub dziedziczy jednoznaczny `school_id`.
8. RLS w bazie jest właściwą granicą bezpieczeństwa. Ukrycie przycisku w UI nie jest autoryzacją.
9. Poprawne odpowiedzi i klucze sprawdzianów nie mogą być wysyłane do klienta przed oddaniem pracy.
10. Treści i zadania są autorskie. Nie kopiować podręczników, układu stron ani materiałów wydawnictw.
11. Dla klasy IV–VI pierwszeństwo ma działanie na konkretnym modelu, eksperyment i rozumowanie, nie mechaniczne klikanie odpowiedzi.
12. Każda funkcja cyfrowa używana do oceniania musi mieć przewidywalny, testowalny wynik.
13. Nauczyciel może użyć produktu w 60 sekund od zalogowania, bez szkolenia technicznego.
14. Podstawowy przebieg lekcji nie może zależeć od stabilności połączenia każdego ucznia.
15. Wydruk ma być pełnoprawnym kanałem pracy, nie zrzutem ekranu aplikacji.

## 4. Zakres zgodności programowej i wersjonowanie

### 4.1. Ważna sytuacja przejściowa

W roku szkolnym 2026/2027 nowa podstawa Reformy26 zaczyna obowiązywać w klasach I i IV, natomiast klasa V pozostaje jeszcze w dotychczasowej ścieżce. Nowe wymagania przejdą do klasy V sukcesywnie w kolejnym roku. Dlatego nie wolno kodować jednej bezterminowej listy tematów pod nazwą „oficjalny program”.

Źródła referencyjne:

- [Matematyka IV–VIII — podstawa 2025/2026](https://zpe.gov.pl/podstawa-programowa/szkola-podstawowa/matematyka)
- [Reforma26 — harmonogram sukcesywnego wdrażania](https://reforma26.men.gov.pl/nowe-podstawy-programowe-wychowania-przedszkolnego-i-ksztalcenia-ogolnego-dla-szkoly-podstawowej-wraz-ze-zmianami-w-ramowych-planach-nauczania-dla-publicznych-szkol-podstawowych-rozporzadzenia-podpi/)
- [Rozporządzenie z 11 marca 2026 r.](https://eli.gov.pl/eli/DU/2026/378/ogl/pol)

### 4.2. Wymagany model wersji programu

Każdy plan ma identyfikator, np.:

- `pl-math-5-2026-classic` — domyślna klasa V w roku 2026/2027;
- `pl-math-5-2027-reforma26` — przygotowywana ścieżka dla klasy V od roku 2027/2028;
- `school-custom-*` — kolejność szkoły oparta na jednej z zatwierdzonych wersji.

Każdy temat ma osobno:

- identyfikator efektu uczenia się;
- mapowanie do podstawy;
- rekomendowaną klasę i kolejność;
- status: `required`, `recommended`, `optional`, `extension`;
- datę obowiązywania wersji;
- wersję redakcyjną treści.

Zmiana wersji programu nie może przepisywać historii ukończonych lekcji ani wyników. Wynik zawsze wskazuje wersję umiejętności, zadania i pakietu, na której powstał.

## 5. Użytkownicy i ich główne potrzeby

### 5.1. Nauczyciel

Potrzebuje:

- zobaczyć dzisiejszą lekcję i miejsce w planie;
- uruchomić prezentację na tablicy jednym kliknięciem;
- prowadzić uczniów krok po kroku;
- wysłać pytanie na tablety i natychmiast zobaczyć rozkład odpowiedzi;
- nie ujawniać nazwisk ani błędów uczniów na ekranie publicznym;
- różnicować poziom bez stygmatyzowania;
- szybko przygotować zadanie domowe, kartkówkę lub sprawdzian;
- wydrukować wersje A/B, klucz i schemat punktowania;
- wpisać wyniki pracy papierowej do tej samej mapy postępów;
- wiedzieć, do czego wrócić na kolejnej lekcji.

### 5.2. Uczeń na tablecie

Potrzebuje:

- wejść do bieżącej lekcji bez szukania po menu;
- mieć jedno polecenie i jeden główny krok na ekranie;
- obsługiwać zadanie dotykiem, rysikiem lub klawiaturą;
- zobaczyć informację, co poprawić, a nie samo „źle”;
- pracować we własnym tempie, gdy nauczyciel na to pozwala;
- wrócić do niedokończonej pracy;
- widzieć własne postępy bez publicznego rankingu.

### 5.3. Uczeń bez urządzenia

Potrzebuje równoważnej karty papierowej, jednoznacznego oznaczenia wersji oraz miejsca na tok rozumowania. Brak tabletu nie może obniżać jakości dydaktycznej ani wyniku.

### 5.4. Administrator

Potrzebuje aktywować nauczycieli, zarządzać szkołami i członkostwami, diagnozować problemy bez uzyskiwania niepotrzebnego dostępu do odpowiedzi uczniów oraz widzieć dziennik zdarzeń administracyjnych.

## 6. Główne moduły produktu

1. **Program klasy V** — mapa roku, działy, tematy, postęp realizacji.
2. **Biblioteka lekcji** — gotowe pakiety i wyszukiwanie po umiejętności.
3. **Studio lekcji** — wybór etapów, materiałów i zadań przed zajęciami.
4. **Prowadzenie na żywo** — pulpit nauczyciela, widok tablicy i tablety.
5. **Pracownia interaktywna** — wspólne modele matematyczne.
6. **Zadania i prace domowe** — cyfrowe przypisania z harmonogramem.
7. **Sprawdziany** — cyfrowe i papierowe z tym samym planem umiejętności.
8. **Drukarnia** — karty pracy, kartkówki, sprawdziany A/B, klucze.
9. **Wyniki i mapa umiejętności** — odpowiedzi cyfrowe i wpisy z papieru.
10. **Klasy i uczniowie** — szkoły, grupy, zaproszenia i wsparcie.
11. **Komunikacja** — powiadomienia, terminy i prośby o poprawę.
12. **Panel administracyjny** — aktywacje i kontrola organizacji.

### 6.1. Poza zakresem pierwszego wydania

- konta rodziców i komunikacja z rodzicami;
- płatności, abonamenty i marketplace treści;
- natywna aplikacja iOS/Android;
- automatyczne OCR pisma odręcznego;
- automatyczne wystawianie ocen z otwartych wypowiedzi przez AI;
- synchronizacja z konkretnym zewnętrznym e-dziennikiem;
- pełne programy innych klas i przedmiotów;
- publiczne profile, rankingi między szkołami i funkcje społecznościowe uczniów.

Architektura może umożliwiać późniejsze rozszerzenia, ale agent nie buduje ich „na zapas” w paczkach klasy V.

## 7. Słownik domenowy

| Pojęcie | Znaczenie |
|---|---|
| Program | Wersjonowana mapa efektów uczenia się dla klasy i roku szkolnego. |
| Dział | Większy blok programu, np. „Ułamki zwykłe”. |
| Temat | Jednostka programu realizowana zwykle w 1–3 godzinach. |
| Pakiet lekcyjny | Gotowa sekwencja etapów lekcji, materiałów, pytań i zadań. |
| Etap lekcji | Pojedynczy krok: start, odkrywanie, rozmowa, ćwiczenie, bilet wyjścia. |
| Aktywność | Interaktywne lub papierowe zadanie osadzone w etapie. |
| Model | Wielokrotnie używany manipulator matematyczny, np. oś lub paski ułamkowe. |
| Pytanie | Atom oceniania z walidatorem, punktacją i wariantem wydruku. |
| Blueprint | Plan sprawdzianu określający umiejętności, poziomy i liczbę zadań. |
| Wersja A/B | Dwa równoważne zestawy wygenerowane z blueprintu i osobnych seedów. |
| Sesja lekcyjna | Konkretne uruchomienie pakietu dla klasy w określonym czasie. |
| Widok tablicy | Publiczny ekran sali bez danych osobowych uczniów. |
| Pulpit prowadzącego | Prywatny ekran nauczyciela z kontrolą sesji i odpowiedziami. |
| Próba | Jedno podejście ucznia do aktywności lub sprawdzianu. |
| Ślad uczenia | Zapis umiejętności, odpowiedzi, pomocy i wyniku potrzebny do informacji zwrotnej. |

---

# CZĘŚĆ II — DOŚWIADCZENIE UŻYTKOWNIKA

## 8. Architektura informacji

### 8.1. Nawigacja nauczyciela

Docelowe główne pozycje, maksymalnie siedem:

1. **Dzisiaj** — pulpit operacyjny.
2. **Program** — mapa klasy V i plan realizacji.
3. **Lekcje** — biblioteka i studio.
4. **Prace** — zadania, kartkówki, sprawdziany i wydruki.
5. **Klasy** — uczniowie, grupy i zaproszenia.
6. **Postępy** — wyniki, umiejętności i dziennik.
7. **Wiadomości** — komunikacja i powiadomienia.

Drugorzędne: wybór szkoły, profil, pomoc i wylogowanie. „Materiały”, „Testy”, „Zadania”, „Wyniki” i „Dziennik” nie mogą pozostać równorzędnymi, odseparowanymi silosami.

### 8.2. Nawigacja ucznia

1. **Teraz** — bieżąca sesja i najbliższe zadanie.
2. **Do zrobienia** — aktywne i zaplanowane prace.
3. **Ćwiczę** — rekomendowane powtórki.
4. **Moje postępy** — prywatna mapa umiejętności.
5. **Wiadomości**.

### 8.3. Trasy docelowe

Nazwy mogą zostać dostosowane do konwencji repozytorium, ale relacje mają pozostać:

```text
/nauczyciel
/nauczyciel/program
/nauczyciel/program/[curriculumId]/dzial/[sectionId]
/nauczyciel/lekcje
/nauczyciel/lekcje/[lessonId]
/nauczyciel/lekcje/[lessonId]/przygotuj
/nauczyciel/sesje/[sessionId]/prowadz
/tablica/[sessionCode]
/dolacz/[sessionCode]
/nauczyciel/prace
/nauczyciel/prace/nowa
/nauczyciel/prace/[assessmentId]
/nauczyciel/prace/[assessmentId]/druk
/nauczyciel/prace/[assessmentId]/wyniki-papier
/nauczyciel/klasy
/nauczyciel/klasy/[classId]
/nauczyciel/postepy
/nauczyciel/postepy/[studentId]
/uczen
/uczen/sesja/[sessionId]
/uczen/prace/[assignmentId]
/uczen/postepy
/symulacje                     # publiczne demo pozostaje
/symulacje/[slug]              # publiczne demo lub przekierowanie do modelu
```

## 9. Najważniejszy przepływ: lekcja w 60 sekund

1. Nauczyciel loguje się i widzi kartę „Następny temat”.
2. Wybiera klasę/szkołę, jeśli nie wynika to z ostatniego kontekstu.
3. Otwiera temat i widzi gotowy plan 45 minut.
4. Kliknięcie „Rozpocznij lekcję” tworzy sesję w stanie `lobby`.
5. Na tablicy pojawia się ekran startowy, cel lekcji i opcjonalny kod/QR.
6. Uczniowie dołączają na tabletach albo pracują bez urządzeń.
7. Nauczyciel klika „Start”; widok tablicy przechodzi do pierwszego etapu.

Od zalogowania do planszy startowej może być najwyżej: 3 decyzje i 60 sekund dla wcześniej skonfigurowanej klasy.

## 10. Przepływ sesji na żywo

### 10.1. Stany sesji

`draft → lobby → live ↔ paused → ended`

- `draft`: nauczyciel jeszcze przygotowuje sekwencję;
- `lobby`: działa kod dołączenia, treść odpowiedzi jest zamknięta;
- `live`: aktywny etap jest wysyłany na urządzenia;
- `paused`: uczniowie widzą „Poczekaj na nauczyciela”, ich stan lokalny nie ginie;
- `ended`: odpowiedzi są zamknięte, powstaje podsumowanie.

Sesji zakończonej nie przywraca się do `live`. Można utworzyć kopię jako nową sesję.

### 10.2. Pulpit prowadzącego

Pulpit jest prywatny i zawiera:

- nazwę szkoły, klasy, temat i czas;
- pasek etapów z informacją „3 z 7”;
- kontrolę `Wstecz`, `Dalej`, `Wstrzymaj`, `Zakończ`;
- podgląd bieżącej planszy;
- licznik dołączonych urządzeń bez ujawniania na tablicy;
- stan odpowiedzi: brak / pracuje / wysłano / potrzebuje pomocy;
- zagregowany histogram lub lista strategii;
- przycisk „Pokaż na tablicy” dla anonimowego podsumowania;
- blokadę rozwiązania do chwili jawnego odsłonięcia;
- awaryjny tryb „Kontynuuj tylko na tablicy”.

### 10.3. Widok tablicy

Widok tablicy:

- nie ma globalnego nagłówka ani stopki portalu;
- używa całego ekranu i obszaru bezpiecznego 16:9;
- pokazuje jedno polecenie, jeden model i maksymalnie trzy główne akcje;
- ma typografię czytelną z końca sali;
- nie pokazuje nazwisk, adresów e-mail, ocen ani indywidualnych błędów;
- wynik i kolejne kroki odsłania nauczyciel;
- ma stale dostępne wyjście, reset etapu i tryb pełnoekranowy;
- po utracie internetu zachowuje bieżącą planszę i komunikat o synchronizacji.

### 10.4. Widok ucznia na tablecie

- nagłówek 56–64 px: temat, postęp i status połączenia;
- główna karta polecenia;
- interakcja zajmuje największą część ekranu;
- dolny pasek ma maksymalnie: `Podpowiedź`, `Wyczyść`, `Wyślij`;
- po wysłaniu uczeń widzi potwierdzenie, nie odpowiedź całej klasy;
- jeśli tempo kontroluje nauczyciel, następny etap jest zablokowany;
- jeśli włączono pracę własnym tempem, uczeń może poruszać się tylko w dozwolonym zakresie;
- stan roboczy zapisuje się lokalnie i okresowo na serwerze.

## 11. Przepływ pracy cyfrowej

1. Nauczyciel wybiera temat lub blueprint.
2. Wskazuje klasę i opcjonalnie grupę/uczniów.
3. Ustawia: rodzaj, datę od–do, próby, czas, poziom i informację zwrotną.
4. System pokazuje podgląd ucznia oraz pokrycie umiejętności.
5. Publikacja tworzy niezmienny snapshot pytań dla tej pracy.
6. Uczeń rozwiązuje; serwer ocenia odpowiedzi na podstawie snapshotu.
7. Nauczyciel przegląda odpowiedzi otwarte i zatwierdza ocenę.
8. Wynik zasila mapę umiejętności dopiero po oddaniu i zgodnie z polityką pracy.

## 12. Przepływ pracy papierowej

1. Nauczyciel wybiera `Karta pracy`, `Kartkówka` albo `Sprawdzian`.
2. Wskazuje temat/dział, liczbę zadań, czas i poziom.
3. Generator buduje blueprint i pokazuje pokrycie efektów uczenia.
4. Nauczyciel wybiera jedną wersję albo A/B; może wymienić pojedyncze zadanie.
5. Podgląd pokazuje rzeczywiste strony A4, przełamania i miejsce na zapis.
6. System generuje:
   - arkusz ucznia;
   - wariant A i B, jeśli wybrano;
   - kartę odpowiedzi, jeśli potrzebna;
   - klucz nauczyciela;
   - schemat punktowania;
   - skróconą tabelę wpisania wyników.
7. Nauczyciel drukuje z przeglądarki lub zapisuje PDF.
8. Po sprawdzeniu otwiera szybkie wprowadzanie wyników: tabela uczniów × zadania.
9. Wyniki papierowe zasilają ten sam model umiejętności, ale zachowują źródło `paper_manual`.

Nie planować na pierwsze wydanie automatycznego OCR pisma odręcznego. Kod QR może identyfikować arkusz i wersję, ale nauczyciel zatwierdza wynik.

## 13. Przepływ planowania roku

1. Nauczyciel przypisuje wersję programu do klasy i roku szkolnego.
2. Może zmienić kolejność tematów, lecz widzi zależności i ostrzeżenia o wymaganiach wstępnych.
3. Oznacza tematy jako: planowane, w toku, zrealizowane, do powtórki, pominięte z uzasadnieniem.
4. Kalendarz pokazuje realne tygodnie nauki i bufor.
5. System nie oznacza tematu jako opanowanego tylko dlatego, że nauczyciel go „zrealizował”. Realizacja i opanowanie to dwa różne wymiary.
6. Pulpit rekomenduje kolejną lekcję na podstawie planu, nie podejmuje decyzji za nauczyciela.

---

# CZĘŚĆ III — SYSTEM UI/UX

## 14. Kierunek wizualny

LekcjaLab ma wyglądać jak dojrzałe narzędzie pracy szkoły, nie jak zbiór kolorowych sandboxów. Charakter: nowoczesny, spokojny, ciepły i kompetentny. Interakcje edukacyjne mogą być żywe, ale powłoka produktu ma obniżać obciążenie poznawcze.

### 14.1. Zasada dwóch warstw

- **Powłoka pracy**: neutralna, jasna, przewidywalna; granat, biel, szarości, jeden kolor akcji.
- **Przestrzeń matematyczna**: kolory znaczeniowe zależne od reprezentacji; nigdy wyłącznie dekoracyjne.

Gradienty, szkło, konfetti i animowane tła nie mogą dominować w panelach roboczych. Dopuszczalne są na stronie publicznej, ekranie sukcesu i planszy startowej, z respektowaniem `prefers-reduced-motion`.

## 15. Tokeny projektu

Tokeny wdrożyć jako CSS variables i mapowanie Tailwind, bez kolorów wpisywanych losowo w komponentach.

### 15.1. Kolory

| Token | Wartość bazowa | Użycie |
|---|---:|---|
| `--canvas` | `#F6F8FC` | tło aplikacji |
| `--surface` | `#FFFFFF` | karty i panele |
| `--surface-muted` | `#EEF2F7` | pola drugorzędne |
| `--ink` | `#152033` | tekst główny |
| `--ink-muted` | `#5B687A` | tekst pomocniczy |
| `--brand-600` | `#4F46E5` | główna akcja |
| `--brand-700` | `#4338CA` | hover/active |
| `--learn` | `#0F766E` | odkrywanie i ćwiczenie |
| `--assess` | `#7C3AED` | sprawdziany |
| `--print` | `#334155` | materiały papierowe |
| `--success` | `#15803D` | sukces |
| `--warning` | `#B45309` | ostrzeżenie |
| `--danger` | `#B91C1C` | błąd/destrukcja |
| `--focus` | `#0284C7` | widoczny focus |

Kontrast wszystkich par tekst/tło musi spełniać WCAG AA. Kolor stanu zawsze ma ikonę i tekst.

### 15.2. Typografia

- pozostawić Geist jako font UI;
- liczby w tabelach i wynikach używają cyfr tabularnych;
- tekst ucznia: minimum 18 px na tablecie;
- polecenie na tablicy: minimum 32 px przy 1080p;
- etykiety administracyjne: minimum 14 px;
- długość wiersza instrukcji: 55–75 znaków;
- unikać całych akapitów wersalikami.

Skala: `12, 14, 16, 18, 20, 24, 30, 36, 48, 64`.

### 15.3. Geometria i odstępy

- siatka bazowa: 4 px;
- odstępy: `4, 8, 12, 16, 24, 32, 48, 64`;
- promienie: 8 px dla pól, 12 px dla przycisków, 16 px dla kart, 24 px dla paneli hero;
- obramowanie 1 px; cień delikatny tylko dla hierarchii;
- minimalny cel dotykowy 48 × 48 px;
- na tablicy preferowany cel 64 × 64 px.

### 15.4. Ikony i ilustracje

- jeden spójny zestaw ikon liniowych; preferowana zależność `lucide-react`;
- emoji nie mogą pełnić roli ikony przycisku ani jedynego nośnika znaczenia;
- figury i modele matematyczne tworzyć w SVG;
- ilustracje dekoracyjne nie wchodzą do arkuszy wydruku;
- każda ikona bez etykiety ma `aria-label` i tooltip dostępny także z klawiatury.

## 16. Podstawowe komponenty UI

Wymagany wspólny katalog komponentów:

- `AppShell`, `TeacherShell`, `StudentShell`, `BoardShell`, `PrintShell`;
- `Sidebar`, `Topbar`, `SchoolSwitcher`, `ContextBreadcrumbs`;
- `Button`, `IconButton`, `SplitButton`, `ButtonGroup`;
- `Card`, `StatCard`, `TopicCard`, `LessonCard`, `WorkCard`;
- `Input`, `NumberInput`, `Select`, `Combobox`, `DateTimeField`, `Checkbox`, `Radio`, `Switch`;
- `Tabs`, `Stepper`, `ProgressRail`, `StatusBadge`;
- `Dialog`, `Drawer`, `Popover`, `Tooltip`, `Toast`, `InlineAlert`;
- `DataTable`, `EmptyState`, `Skeleton`, `Pagination`;
- `MasteryBar`, `SkillChip`, `CoverageMeter`;
- `LessonStageRail`, `StudentResponseGrid`, `ConnectionStatus`;
- `A4PagePreview`, `PrintPageBreak`, `AnswerSpace`;
- `MathText`, `Fraction`, `MixedNumber`, `UnitValue`.

Nie tworzyć drugiego komponentu o tej samej roli. Najpierw rozszerzyć istniejący `Button`, `Card`, `Badge`, `Slider` albo jawnie go zastąpić i przepiąć użycia.

## 17. Stany każdego komponentu roboczego

Każdy formularz i panel danych ma obsłużyć:

- `idle`;
- `hover` tam, gdzie istnieje mysz, ale nigdy jako jedyny sposób użycia;
- `focus-visible`;
- `active/pressed`;
- `disabled` z wyjaśnieniem przyczyny;
- `loading` bez zmiany szerokości przycisku;
- `success`;
- `warning`;
- `error` z tekstem naprawczym;
- `empty` z jedną sensowną akcją;
- `offline/reconnecting`, jeśli dotyczy sesji.

## 18. Responsywność według trybu, nie tylko szerokości

### 18.1. Nauczyciel — desktop/laptop

- stały lewy sidebar 240–272 px od `xl`;
- topbar z kontekstem szkoły/klasy;
- treść maks. 1440 px, tabele mogą użyć pełnej szerokości;
- na 1024 px sidebar zwija się do szyny ikon;
- na telefonie nawigacja w drawerze, ale studio i prowadzenie pokazują komunikat o zalecanym większym ekranie, nie blokadę.

### 18.2. Tablet ucznia

- projektować bazowo dla 1024×768 oraz 768×1024;
- układ działa także przy 200% zoom;
- dolne akcje pozostają w zasięgu kciuka;
- pola liczbowe otwierają właściwą klawiaturę, ale akceptują polski przecinek;
- przeciąganie ma alternatywę „zaznacz → umieść”.

### 18.3. Tablica

- testować 1920×1080, 1366×768 i 1024×768;
- respektować obszar 5% przy krawędziach ze względu na kalibrację projektora;
- żadnych krytycznych kontrolek w narożnikach;
- tryb pełnoekranowy nie ukrywa wyjścia i resetu;
- wszystkie funkcje działają dotykiem i rysikiem przez Pointer Events.

### 18.4. Druk

- osobny layout monochromatyczny A4;
- żadnego sidebara, headera portalu, przycisków ani cieni;
- kontrolowane przełamania stron;
- nie drukować tła, jeśli nie niesie informacji;
- zachować czytelność po kserowaniu czarno-białym.

## 19. Wzorcowe ekrany

### 19.1. Pulpit „Dzisiaj”

```text
┌ Sidebar ───────┬────────────────────────────────────────────────────┐
│ Dzisiaj        │ Szkoła ▾  Klasa 5A ▾             Powiadomienia  ● │
│ Program        ├────────────────────────────────────────────────────┤
│ Lekcje         │ Dzień dobry, Anno                                 │
│ Prace          │ ┌ Następna lekcja ──────────────────────────────┐ │
│ Klasy          │ │ Ułamki zwykłe · Porównywanie · 45 min        │ │
│ Postępy        │ │ [Rozpocznij] [Przygotuj] [Drukuj kartę]      │ │
│ Wiadomości     │ └───────────────────────────────────────────────┘ │
│                │ Do sprawdzenia | Aktywne prace | Klasa wymaga... │
└────────────────┴────────────────────────────────────────────────────┘
```

### 19.2. Pulpit prowadzenia

```text
┌ Etapy 1 2 [3] 4 5 6 ─────────── 5A · 24 osoby · 18 online ───────┐
│ ┌ Podgląd tablicy ─────────────────┐ ┌ Odpowiedzi ──────────────┐ │
│ │                                  │ │ 12 wysłano               │ │
│ │       MODEL MATEMATYCZNY         │ │  4 pracuje               │ │
│ │                                  │ │  2 proszą o pomoc        │ │
│ └──────────────────────────────────┘ │ [Pokaż histogram]        │ │
│                                     └───────────────────────────┘ │
│ [Wstecz] [Wstrzymaj] [Podpowiedź] [Odsłoń krok]        [Dalej]   │
└────────────────────────────────────────────────────────────────────┘
```

### 19.3. Drukarnia

```text
┌ Konfiguracja 320 px ──┬──────── Podgląd prawdziwych stron A4 ─────┐
│ Typ: Sprawdzian       │       ┌──────── A4 / strona 1 ────────┐  │
│ Dział: Ułamki         │       │ Imię ______  Klasa ____  A    │  │
│ Zadania: 10           │       │ 1. ...                       │  │
│ Wersje: A + B         │       │                              │  │
│ Poziom: standard      │       └──────────────────────────────┘  │
│ [Generuj ponownie]    │ [A] [B] [Klucz] [Punktowanie]            │
│ [Drukuj / PDF]        │ Pokrycie: 6 umiejętności · 24 pkt         │
└───────────────────────┴─────────────────────────────────────────────┘
```

## 20. Język interfejsu

- pisać krótkimi zdaniami i nazywać akcję efektem: „Rozpocznij lekcję”, nie „OK”;
- komunikat błędu mówi, co się stało i co zrobić;
- nie używać technicznych słów typu `submission`, `widget`, `RPC`, `seed` w UI;
- „Praca” jest kategorią nadrzędną, a „karta pracy”, „kartkówka”, „sprawdzian”, „praca domowa” są rodzajami;
- „Podpowiedź” nie jest karą;
- nie używać języka zawstydzającego ani rankingów publicznych;
- nauczyciel widzi „uczeń potrzebuje wsparcia”, nie etykietę „słaby”.

---
# CZĘŚĆ IV — PAKIET LEKCYJNY I SILNIK DYDAKTYCZNY

## 21. Kontrakt pakietu lekcyjnego

Każdy temat ma co najmniej jeden gotowy pakiet 45-minutowy. Temat wielogodzinny ma pakiety `L1`, `L2`, `L3`, które rozwijają umiejętność, a nie duplikują tę samą planszę.

### 21.1. Obowiązkowa sekwencja

| Etap | Czas | Cel | Kanały |
|---|---:|---|---|
| Wejście / diagnoza | 3–5 min | aktywacja wiedzy wstępnej | tablica, tablet, papier |
| Odkryj | 6–10 min | manipulacja i przewidywanie | tablica + opcjonalnie tablet |
| Nazwij | 5–8 min | rozmowa i zapis wniosku | tablica |
| Przykład prowadzony | 6–10 min | odsłanianie toku krok po kroku | tablica |
| Ćwicz | 10–15 min | informacja zwrotna i różnicowanie | tablet lub karta |
| Wyzwanie / zastosowanie | 5–10 min | problem, strategia, praca w parze | dowolny kanał |
| Bilet wyjścia | 2–4 min | szybka diagnoza jednej umiejętności | tablet lub papier |

Nauczyciel może pominąć etap, ale domyślny pakiet ma być kompletny.

### 21.2. Dane pakietu

```ts
interface LessonPackage {
  id: string;
  version: number;
  curriculumId: string;
  sectionId: string;
  topicId: string;
  lessonNumber: number;
  title: string;
  estimatedMinutes: number;
  studentGoal: string;
  successCriteria: string[];
  prerequisiteSkillIds: string[];
  skillIds: string[];
  stages: LessonStage[];
  teacherGuide: TeacherGuide;
  printableResourceIds: string[];
  status: "draft" | "review" | "published" | "retired";
}
```

Treść publikowana jest niezmienna dla danej wersji. Korekta treści tworzy kolejną wersję, aby historyczna sesja nadal była odtwarzalna.

## 22. Kontrakt etapu

```ts
type LessonStageKind =
  | "warmup"
  | "predict"
  | "explore"
  | "discuss"
  | "worked-example"
  | "practice"
  | "challenge"
  | "exit-ticket";

interface LessonStage {
  id: string;
  kind: LessonStageKind;
  title: string;
  studentInstruction: string;
  teacherInstruction: string;
  estimatedMinutes: number;
  board: BoardStageConfig;
  student?: StudentStageConfig;
  print?: PrintStageConfig;
  revealSteps: RevealStep[];
  questions: QuestionReference[];
  discussionPrompts: string[];
  accessibilityNotes: string[];
}
```

Każdy etap musi jasno określić:

- co widzi tablica;
- co widzi nauczyciel;
- co widzi uczeń;
- kiedy wolno wysłać odpowiedź;
- co zapisuje się do bazy;
- czy istnieje odpowiednik papierowy;
- co dzieje się po utracie połączenia.

## 23. Trzy tryby aktywności

### 23.1. Pokaz

- wynik ukryty;
- model reaguje na parametry nauczyciela;
- kolejne warstwy rozwiązania ujawniane ręcznie;
- brak automatycznego przejścia;
- dozwolone adnotacje, podświetlenie i reset.

### 23.2. Próba ucznia

- uczeń odpowiada bez publicznego wyniku;
- do dwóch prób przed konkretną podpowiedzią;
- podpowiedzi od ogólnej do wizualnej;
- informacja zwrotna wskazuje element do poprawy;
- błędna próba jest śladem uczenia, nie automatyczną karą.

### 23.3. Ocenianie

- parametry zadania są zamrożone;
- rozwiązanie i oczekiwana odpowiedź pozostają po stronie serwera;
- polityka prób, czasu i podpowiedzi jest jawna przed startem;
- po oddaniu nie wolno zmienić odpowiedzi;
- każde automatyczne przyznanie punktów jest odtwarzalne.

## 24. Poziomy bez etykietowania uczniów

W systemie domenowym: `support`, `core`, `challenge`. W UI ucznia nie pokazywać nazw „łatwy/słaby/trudny”. Możliwe neutralne nazwy: `Start`, `Dalej`, `Mistrzowskie` albo brak nazwy poziomu.

- `support`: mniejsze liczby, wyraźniejszy model, jedna operacja naraz;
- `core`: wymaganie bazowe programu;
- `challenge`: mniej oczywista reprezentacja, argumentacja lub problem wieloetapowy.

Nauczyciel może przypisać poziom grupie lub uczniowi. Informacja ta jest prywatna.

## 25. Wspólne modele matematyczne

Nie budować osobnej kopii modelu dla każdej lekcji. Wymagane rodziny:

1. oś liczbowa z naturalnymi, całkowitymi i ułamkami;
2. tabela wartości pozycyjnych i klocki dziesiętne;
3. model pola / tablica mnożenia;
4. cyfrowy zapis działań pisemnych;
5. karty liczb, działań i nawiasów;
6. paski, koła i prostokąty ułamkowe;
7. kratownica 10×10;
8. waga szalkowa;
9. siatka współrzędnych / pól;
10. linijka, ekierka i kątomierz;
11. geoplansza i edytor wielokątów;
12. drzewo czynników i sito;
13. prostopadłościan warstwowy 3D/SVG-isometric;
14. naczynia i przelewanie;
15. termometr, winda i głębokość na wspólnej osi.

Każdy model ma jeden interfejs powłoki:

```ts
interface ManipulativeContract<P, S, A> {
  params: P;
  state: S;
  target?: A;
  mode: "demo" | "guided" | "practice" | "assessment";
  readOnly?: boolean;
  showSolution?: boolean;
  onStateChange?: (state: S) => void;
  onAnswer?: (answer: A) => void;
}
```

Nie przekazywać funkcji z Server Component do Client Component. Dane wejściowe muszą być serializowalne.

## 26. Generator i walidator

### 26.1. Determinizm

Każde zadanie generowane ma:

- `generatorId`;
- `generatorVersion`;
- `seed`;
- `difficulty`;
- `params`;
- `skillIds`;
- `renderMode`;
- serwerowy `answerSpec`;
- listę niezmienników.

Ten sam `generatorId + version + seed + config` musi zawsze tworzyć te same parametry. Nie używać bezpośrednio `Math.random()` w renderze ani w logice oceniania.

### 26.2. Rozdzielenie danych

- klient otrzymuje `publicQuestion` bez klucza;
- serwer przechowuje `answerSpec` i rubrykę;
- po oddaniu serwer zapisuje odpowiedź, wynik, wersję walidatora i bezpieczne wyjaśnienie;
- w trybie ćwiczenia serwer może zwrócić wskazówkę diagnostyczną;
- w trybie oceniania pełne rozwiązanie jest dostępne dopiero po spełnieniu polityki publikacji.

### 26.3. Wynik walidacji

```ts
interface GradeResult {
  status: "correct" | "partially-correct" | "incorrect" | "manual-review";
  score: number;
  maxScore: number;
  errorCodes: string[];
  feedbackKey: string;
  normalizedAnswer?: unknown;
}
```

Nie zapisywać feedbacku jako jedynego źródła diagnostyki. `errorCodes` muszą pozwolić później ulepszyć komunikat i analitykę.

### 26.4. Niezmienniki matematyczne

- mianownik nigdy nie jest zerem;
- działanie i wynik mieszczą się w zakresie poziomu;
- dzielenie określa wymagany typ wyniku i reszty;
- trójkąt spełnia nierówność trójkąta;
- rysunek jest zgodny z danymi i nie sugeruje innej odpowiedzi;
- jednostki mają poprawny wymiar;
- zadanie tekstowe ma wystarczające, jednoznaczne dane;
- wariant A i B mają tę samą macierz umiejętności i punktów;
- parser liczb akceptuje przecinek, bezpiecznie normalizuje spacje i nie zamienia pustego pola na poprawne zero;
- odpowiedzi równoważne są akceptowane tylko wtedy, gdy zezwala na to `answerSpec`.

## 27. Informacja zwrotna

Kolejność po błędzie:

1. wskazanie obszaru: „Sprawdź ustawienie cyfr w kolumnach”;
2. pytanie naprowadzające: „Od której kolumny zaczynasz?”;
3. podpowiedź wizualna;
4. przykład analogiczny z innymi liczbami;
5. rozwiązanie krok po kroku — tylko na żądanie albo po zakończeniu oceniania.

Zakazane komunikaty jako jedyna odpowiedź: „Źle”, „Błąd”, „Spróbuj jeszcze raz”.

## 28. Standard panelu „Dla nauczyciela”

Każdy pakiet zawiera:

1. cel ucznia;
2. maksymalnie cztery cele nauczyciela;
3. kryteria sukcesu;
4. wymagania wstępne i szybką diagnozę;
5. plan minutowy 45/90 minut;
6. pytania do przewidywania i rozmowy;
7. oczekiwane strategie uczniów;
8. typowe błędy i sposób reakcji;
9. wariant wsparcia;
10. wariant rozszerzenia;
11. wariant bez urządzeń;
12. materiały do druku;
13. notatkę, co zapisać na tablicy/zeszycie;
14. bilet wyjścia;
15. powiązania z wcześniejszym i następnym tematem.

Tekst ma być praktyczny. Nie dodawać ogólnej teorii pedagogicznej bez przełożenia na działanie w sali.

---

# CZĘŚĆ V — DRUK, KARTY PRACY I SPRAWDZIANY

## 29. Rodzaje materiałów

| Rodzaj | Typowy czas | Punktacja | Wersje | Wynik w mapie |
|---|---:|---|---|---|
| Karta do lekcji | 5–20 min | opcjonalna | 1 | zwykle nie |
| Karta pracy | 15–45 min | opcjonalna | 1/A-B | opcjonalnie |
| Bilet wyjścia | 2–5 min | diagnostyczna | 1–4 warianty | tak, niska waga |
| Kartkówka | 10–20 min | tak | A/B | tak |
| Sprawdzian działowy | 30–45 min | tak | A/B | tak |
| Poprawa | zgodna z pracą | tak | nowy seed | tak |
| Klucz nauczyciela | — | rubryka | do każdej | nie |

## 30. Zasada parytetu cyfrowo-papierowego

Blueprint jest wspólny, ale renderer może być inny. Nie każda interakcja dotykowa ma sens na papierze.

Przykłady transformacji:

| Cyfrowo | Papierowo |
|---|---|
| przeciągnij liczby na oś | zaznacz i podpisz punkty |
| obracaj kątomierz | zmierz wydrukowany kąt |
| grupuj kafelki | narysuj podział lub uzupełnij tabelę |
| odsłaniaj krok | pokaż kolejne miejsce na obliczenia |
| wybierz wszystkie pasujące | zakreśl / wpisz numery |
| model 3D warstw | widok izometryczny i przekroje warstw |

Parytet oznacza tę samą umiejętność i porównywalną trudność, nie identyczny ekran.

## 31. Reguły generatora wersji A/B

1. Wersje używają tego samego blueprintu.
2. Każda pozycja ma ten sam `skillId`, poziom, punkty i typ rozumowania.
3. Zmieniają się dane, kolejność odpowiedzi i ewentualnie orientacja niesymetrycznego rysunku.
4. Nie wystarczy przestawić kolejności identycznych zadań.
5. Wyniki i obciążenie rachunkowe muszą należeć do tej samej klasy trudności.
6. Klucze są generowane osobno i jednoznacznie oznaczone.
7. Każdy arkusz ma `assessmentId`, `versionCode`, `seed`, numer strony i sumę stron.
8. Kod QR nie zawiera danych osobowych ani odpowiedzi; przenosi tylko losowy identyfikator arkusza lub bezpieczny URL.

## 32. Wymagania strony A4

- format bazowy A4, margines 12–16 mm;
- bezpieczny obszar dla popularnych drukarek;
- font co najmniej 11 pt, polecenie najlepiej 11,5–12 pt;
- numer zadania, punkty i miejsce na odpowiedź nie mogą zostać rozdzielone;
- rysunek zachowuje skalę potrzebną do pomiaru, jeśli polecenie tego wymaga;
- zadania do mierzenia zawierają kontrolny odcinek 5 cm i ostrzeżenie o skali wydruku;
- każda strona: tytuł, wersja, numer strony;
- pierwsza strona: imię, klasa, data, czas, maksymalna liczba punktów;
- nie używać jasnoszarego tekstu ani koloru jako jedynej różnicy;
- arkusz musi być czytelny po wydruku czarno-białym i kserowaniu;
- puste miejsce jest projektowane, nie przypadkowe.

## 33. Implementacja druku

Pierwsze wydanie korzysta z semantycznego HTML i `@media print`, z możliwością `window.print()` / zapisu PDF przez przeglądarkę. Nie dodawać ciężkiego generatora PDF, dopóki testy na Chrome/Edge nie wykażą konkretnego braku.

Wymagane elementy:

- osobna trasa podglądu wydruku;
- `PrintShell` bez globalnej nawigacji;
- komponent `A4Page` z kontrolą `break-before/after/inside`;
- deterministyczne rozłożenie zadań;
- testy wizualne wydruku;
- klucz i rubryka dostępne wyłącznie nauczycielowi;
- opcja „drukuj odpowiedzi na osobnej stronie”.

## 34. Wprowadzanie wyników papierowych

Widok to tabela:

- wiersz = uczeń;
- kolumna = zadanie lub umiejętność;
- komórka = punkty z walidacją zakresu;
- nawigacja klawiaturą Enter/Tab/strzałki;
- zapis wersji A/B dla ucznia;
- autosave szkicu oraz jawne „Zatwierdź wyniki”;
- możliwość oznaczenia nieobecności;
- komentarz ogólny i indywidualny;
- podsumowanie nie może zmieszać nieobecności z wynikiem 0.

Po zatwierdzeniu korekta tworzy wpis audytowy: kto, kiedy, stara i nowa wartość.

---

# CZĘŚĆ VI — ARCHITEKTURA TECHNICZNA

## 35. Stan repozytorium, który trzeba respektować

Na dzień dokumentu projekt używa:

- Next.js `16.2.9`, App Router;
- React `19.2.4`;
- TypeScript 5;
- Tailwind CSS 4;
- Supabase JS i `@supabase/ssr`;
- Server Components, Server Actions i Supabase RPC;
- 16 migracji zawierających auth, szkoły, klasy, testy, przypisania, próby, wyniki, powiadomienia, poprawy i notatki dziennika;
- rozbudowanego rejestru symulacji i widgetów;
- banku 640 zadań tekstowych.

Nie wolno usuwać ani przepisywać wdrożonych migracji `001–016`. Każda zmiana bazy to kolejna migracja.

Znany dług przed rozbudową:

- lint zgłasza 38 błędów i 26 ostrzeżeń;
- występują warunkowe hooki Reacta;
- `Math.random()` jest wywoływane podczas renderowania;
- część efektów synchronicznie ustawia stan;
- brak automatycznego zestawu testów;
- `submit_assignment` wymaga dopięcia walidacji `starts_at`;
- brak `proxy.ts` odświeżającego sesję Supabase, mimo komentarza sugerującego taki mechanizm.

Fundament jakości musi zostać naprawiony przed masową produkcją treści.

## 36. Granice Server/Client w Next.js 16

Przed implementacją agent czyta lokalne przewodniki w `node_modules/next/dist/docs/` dotyczące dotykanego API.

Reguły:

- `page.tsx` i `layout.tsx` pozostają Server Components, jeśli nie potrzebują interakcji;
- dane użytkownika pobierać na serwerze blisko źródła;
- `"use client"` umieszczać na najniższej praktycznej granicy;
- do klienta przekazywać wyłącznie serializowalne dane;
- sekrety i pełne `answerSpec` oznaczać modułem `server-only`;
- Server Actions służą do mutacji formularzy i prostych operacji UI;
- Route Handlers służą m.in. do artefaktów druku, eksportów i integracji HTTP;
- `proxy.ts` służy do odświeżenia cookies sesji i optymistycznej ochrony tras, nie do pełnej autoryzacji ani ciężkich zapytań;
- autoryzację ponawia Server Action/RPC/RLS;
- nie zakładać cache danych użytkownika; jawnie ustalać rewalidację po mutacji;
- publiczny katalog może korzystać z cache, dane sesji i wyników nie.

## 37. Docelowa struktura katalogów

```text
src/
  app/
    (public)/
      symulacje/
    (auth)/
      logowanie/
      rejestracja/
    nauczyciel/
      program/
      lekcje/
      sesje/
      prace/
      klasy/
      postepy/
      wiadomosci/
    uczen/
      sesja/
      prace/
      postepy/
    tablica/[sessionCode]/
    dolacz/[sessionCode]/
  components/
    ui/
    shells/
    curriculum/
    lessons/
    live/
    assessment/
    print/
    math/
      manipulatives/
  features/
    curriculum/
      domain/
      server/
      content/
    lessons/
      domain/
      server/
    live-sessions/
      domain/
      client/
      server/
    assessments/
      domain/
      generators/
      validators/
      server/
    printing/
      domain/
      renderers/
    mastery/
      domain/
      server/
  lib/
    auth/
    supabase/
    formatting/
    math/
  types/
supabase/
  migrations/
```

Nie przenosić mechanicznie wszystkich obecnych plików. Nową strukturę stosować przy wydzielaniu modułu, a migrację robić etapami z działającymi importami po każdym kroku.

## 38. Źródła danych

### 38.1. W repozytorium

Wersjonowane i recenzowane:

- definicje programu;
- opisy tematów i pakietów;
- konfiguracje generatorów;
- teksty podpowiedzi i rozwiązania;
- mapowania renderera cyfrowego/papierowego;
- autorskie zasoby SVG;
- schematy walidacyjne.

### 38.2. W bazie

Operacyjne i zależne od użytkownika:

- przypisany program klasy;
- plan i status realizacji;
- sesje lekcyjne i uczestnictwo;
- snapshoty zadań;
- odpowiedzi i wyniki;
- prace cyfrowe/papierowe;
- ręcznie wpisane punkty;
- powiadomienia i audyt.

Treści bazowe nie mogą zależeć od ręcznego wypełnienia tabeli produkcyjnej. Baza przechowuje identyfikator i wersję contentu oraz snapshot krytyczny dla oceniania.

## 39. Nowe tabele domenowe

Nazwy są kontraktem logicznym; agent może skorygować szczegół SQL po audycie, ale nie może pominąć relacji bezpieczeństwa.

### 39.1. Plan programu

`class_curriculum_plans`

- `id uuid pk`;
- `school_id uuid not null`;
- `class_id uuid not null`;
- `teacher_id uuid not null`;
- `curriculum_id text not null`;
- `curriculum_version integer not null`;
- `school_year text not null`;
- `status text: draft|active|archived`;
- `settings jsonb` tylko dla bezpiecznych preferencji;
- timestamps;
- unique aktywny plan na `class_id + school_year + subject`.

`topic_plan_entries`

- plan, section/topic IDs;
- pozycja i planowane daty;
- status `planned|in_progress|completed|review|skipped`;
- `completed_at`, `completed_by`;
- notatka nauczyciela;
- unikalność tematu w planie.

`class_teacher_memberships` — wymagane przed rozszerzeniem współprowadzenia

- `class_id`, `school_id`, `teacher_id`;
- rola `owner|co_teacher|viewer`;
- `created_by`, timestamps;
- owner tworzony automatycznie dla aktualnego `teacher_classes.teacher_id`;
- unique `class_id + teacher_id`;
- zaproszenie współprowadzącego wymaga jego członkostwa w tej samej szkole.

Do czasu wdrożenia tej tabeli właścicielem danych klasy pozostaje `teacher_classes.teacher_id`. Samo członkostwo nauczyciela w szkole nie daje prawa do wyników każdej klasy w tej szkole.

### 39.2. Sesje na żywo

`lesson_sessions`

- `id`, `school_id`, `class_id`, `teacher_id`;
- `lesson_id`, `lesson_version`;
- `join_code_hash` i bezpieczny publiczny kod o krótkim TTL;
- status i indeks aktywnego etapu;
- `pace_mode: teacher|student`;
- `started_at`, `ended_at`;
- snapshot sekwencji etapów;
- timestamps.

`lesson_session_participants`

- `session_id`, `student_id`, `school_id`;
- `joined_at`, `last_seen_at`, `left_at`;
- `device_label` opcjonalny i niesłużący fingerprintingowi;
- status pomocy;
- unique `session_id + student_id`.

`lesson_stage_responses`

- `id`, `session_id`, `stage_id`, `question_instance_id`;
- `student_id`, `school_id`;
- publiczna odpowiedź ucznia;
- status, score, max score, error codes;
- `submitted_at`;
- bez klucza odpowiedzi dostępnego przez politykę ucznia.

`lesson_session_events`

- audyt zdarzeń: zmiana etapu, pauza, odsłonięcie, zakończenie;
- payload ograniczony schematem, nie dowolny dump danych;
- tylko do diagnostyki i odtworzenia przebiegu.

### 39.3. Prace i wydruk

Istniejące `tests`, `test_items`, `assignments`, `submissions` rozszerzyć, nie dublować.

Wymagane rozszerzenia logiczne:

- `assessment_kind`;
- `delivery_mode: digital|paper|hybrid`;
- `curriculum_id`, `section_id`, `topic_ids`, `skill_ids`;
- `blueprint jsonb` walidowany schematem;
- `content_version`;
- snapshot generatora i seedów;
- polityka publikacji rozwiązania.

`assessment_versions`

- `assessment_id`;
- `version_code` A/B/C;
- `seed`;
- snapshot pozycji i punktów;
- checksum;
- timestamps.

`paper_results`

- `assessment_id`, `assessment_version_id`;
- `student_id`, `school_id`, `class_id`;
- status `draft|confirmed|absent`;
- total, max, percentage, mark opcjonalnie;
- `entered_by`, `confirmed_by`, timestamps;
- unique praca + uczeń.

`paper_result_items`

- wynik papierowy + item;
- score/max;
- skill IDs;
- komentarz;
- źródło `paper_manual`.

`grade_audit_log`

- rodzaj rekordu, ID, school, actor;
- stara/nowa wartość punktów;
- powód i timestamp;
- tylko dopisywanie.

### 39.4. Mapa umiejętności

Nie przechowywać jednej „magicznej” wartości opanowania bez źródeł. Źródłem są zdarzenia `skill_evidence`:

- `student_id`, `school_id`, `class_id`;
- `skill_id`, `curriculum_id`;
- source type/id: live, practice, digital assessment, paper;
- raw score/max;
- weight i policy version;
- occurred_at;
- unique źródło + skill.

Agregat może być widokiem/materialized view lub tabelą cache odbudowywaną ze zdarzeń. Każdy poziom opanowania musi być wyjaśnialny listą dowodów.

## 40. RLS i niezmienniki bezpieczeństwa

### 40.1. Szkoła

- każda tabela operacyjna ma `school_id` albo bezpieczną relację do rekordu z `school_id`;
- przy insert/update baza sprawdza zgodność `school_id` wszystkich relacji;
- nie ufać `school_id` przysłanemu z formularza;
- nauczyciel może czytać/mutować dane tylko w szkole, do której ma członkostwo, oraz w klasie, której jest właścicielem lub jawnym współprowadzącym;
- samo `teacher_school_memberships` nie daje dostępu do odpowiedzi i ocen wszystkich uczniów szkoły;
- rola `viewer` nie może zmieniać prac, odpowiedzi ani ocen;
- uczeń czyta wyłącznie własne rekordy i materiały przypisane do jego klasy/konta.

### 40.2. Sesja

- kod dołączenia sam w sobie nie daje dostępu do danych klasy;
- zalogowany uczeń może dołączyć tylko, jeśli należy do klasy sesji;
- kod jest krótko ważny, rotowalny i przechowywany jako hash tam, gdzie praktyczne;
- publiczny widok tablicy otrzymuje tylko bezosobowy projection sesji;
- kanały Realtime są prywatne i autoryzowane.

### 40.3. Ocenianie

- uczeń nie ma SELECT do serwerowego `answerSpec`;
- sprawdzanie odbywa się w bezpiecznej funkcji serwerowej/RPC;
- RPC `security definer` sprawdza rolę, status, własność i szkołę wewnątrz funkcji;
- odebrać EXECUTE od `public`/`anon`, przyznać minimalnej roli;
- czas początku i końca jest sprawdzany w bazie zarówno przy starcie, jak i oddaniu;
- nie ufać punktom ani `is_correct` z klienta;
- poprawka oceny zostawia audyt.

### 40.4. Testy RLS

Dla każdej migracji przygotować macierz:

| Aktor | Własna szkoła/klasa | Inna klasa tej szkoły | Inna szkoła | Oczekiwane |
|---|---|---|---|---|
| nauczyciel właściciel | tak | zależnie od polityki | nie | jawne |
| nauczyciel współpracujący | zależnie od członkostwa | zależnie od roli | nie | jawne |
| uczeń | tylko własne | nie | nie | jawne |
| admin | zgodnie z funkcją admin | zgodnie | zgodnie | audyt |
| anon | tylko publiczny katalog / walidacja kodu bez PII | nie | nie | jawne |

Test musi próbować również sfałszować `school_id`, `student_id`, `teacher_id` i identyfikator pracy.

## 41. Realtime i odporność na sieć

Użyć Supabase Realtime do małych komunikatów sterujących i obecności, nie do przesyłania całego drzewa UI.

- Broadcast: zmiana etapu, pauza, odsłonięcie, komunikat nauczyciela;
- Presence: obecność urządzeń i ostatnia aktywność;
- Postgres changes lub jawne odświeżenie: trwałe odpowiedzi i podsumowania;
- stan źródłowy sesji pozostaje w Postgres;
- reconnect pobiera aktualny snapshot sesji;
- każda komenda ma rosnący `sequenceNumber`, aby ignorować starsze zdarzenia;
- odpowiedź ucznia ma `clientAttemptId` dla idempotencji;
- lokalny draft nie zawiera klucza i wygasa po zakończeniu sesji.

Awaria Realtime nie kończy lekcji. Nauczyciel może kontynuować na tablicy, a uczniowie widzą jasny status „Łączenie…”.

## 42. Zależności

### 42.1. Pozostawić

- Next.js, React, TypeScript, Tailwind;
- `@supabase/ssr`, `@supabase/supabase-js`;
- istniejące komponenty matematyczne po refaktoryzacji kontraktów.

### 42.2. Dozwolone do dodania w fundamencie

| Pakiet | Cel | Warunek |
|---|---|---|
| `zod` | schematy contentu, blueprintów i payloadów | jeden wspólny katalog schematów |
| `lucide-react` | spójne ikony | usunąć mieszane ikony/emoji z kontrolek |
| `vitest` | testy logiki i generatorów | konfiguracja zgodna z TS aliases |
| `@testing-library/react` + `@testing-library/user-event` | testy interakcji | tylko komponenty wymagające DOM |
| `playwright` | E2E i print visual smoke | najważniejsze przepływy |
| `qrcode` albo mały renderer SVG | kod dołączenia/arkusza | bez danych osobowych w payloadzie |

### 42.3. Dodawać dopiero po udowodnionej potrzebie

- biblioteka DnD: tylko jeśli własne Pointer Events nie zapewniają dostępności i stabilności;
- biblioteka PDF: tylko jeśli HTML print nie spełnia kryteriów A4;
- biblioteka wykresów: tylko jeśli proste SVG/CSS nie wystarczy;
- globalny store: dopiero gdy state machine sesji nie mieści się w reducerze/kontekście.

### 42.4. Zakazane bez osobnej decyzji architektonicznej

- drugi backend lub baza danych;
- Firebase obok Supabase;
- ORM dublujący aktualny sposób dostępu tylko dla nowych tabel;
- ciężki framework UI narzucający drugi design system;
- zależność wysyłająca dane uczniów do zewnętrznego AI/analityki;
- generowanie zadań ocenianych przez model językowy w czasie rzeczywistym.

## 43. Stan po stronie klienta

- proste formularze: React state + Server Action;
- złożona aktywność: `useReducer` z jawnie opisanymi zdarzeniami;
- sesja na żywo: jeden provider klienta na trasie sesji, nie globalnie;
- nie kopiować danych serwerowych do kilku niesynchronizowanych store’ów;
- stan odtwarzalny (aktywny etap, filtr) zapisywać w URL, jeśli ma sens;
- draft odpowiedzi ucznia lokalnie, wynik i status oddania na serwerze;
- efekty służą synchronizacji z systemem zewnętrznym, nie do wyliczania stanu pochodnego.

## 44. Wydajność i obserwowalność

Cele dla zwykłego łącza szkolnego:

- strona programu: LCP < 2,5 s na średnim laptopie;
- przejście między etapami po odebraniu zdarzenia: < 500 ms p95;
- wysłanie odpowiedzi: potwierdzenie lokalne natychmiast, serwerowe < 1,5 s p95;
- pierwsza plansza sesji działa bez pobrania całego katalogu symulacji;
- ciężkie modele ładowane dynamicznie per etap;
- brak nieograniczonych zapytań per uczeń na dashboardzie;
- indeksy dla school/class/session/student/status i dat;
- logować bez PII: typ błędu, correlation ID, route, wersję generatora;
- nie logować surowych odpowiedzi tekstowych ani tokenów.

---


# CZĘŚĆ VII — PEŁNY PROGRAM MATEMATYKI DLA KLASY V

## 45. Reguła kompletności programu

Pierwsze pełne wydanie obejmuje osiem działów z poprzedniej specyfikacji. Każdy wiersz poniżej jest osobnym elementem backlogu treści. Dział nie jest gotowy, dopóki każdy wymagany temat nie ma:

- co najmniej jednego kompletnego pakietu lekcyjnego;
- aktywności `Odkryj`;
- przykładu prowadzonego;
- ćwiczeń `support/core/challenge`;
- biletu wyjścia;
- wariantu tabletowego i bez urządzeń;
- minimum jednej karty do druku;
- pytań do banku sprawdzianowego;
- przewodnika nauczyciela;
- testów generatora i walidatora.

Powtórzenie i sprawdzian są osobnymi pozycjami, a nie substytutem brakujących tematów.

## 46. Taksonomia umiejętności

Identyfikatory są stabilne i niezależne od tytułu lekcji:

| Prefiks | Obszar |
|---|---|
| `M5-NAT-*` | liczby naturalne i działania |
| `M5-DIV-*` | dzielniki, wielokrotności, podzielność |
| `M5-FRA-*` | ułamki zwykłe |
| `M5-GEO-*` | geometria płaska i konstrukcje |
| `M5-DEC-*` | ułamki dziesiętne i miary |
| `M5-AREA-*` | pola figur |
| `M5-INT-*` | liczby całkowite |
| `M5-VOL-*` | objętość i pojemność |
| `M5-PROB-*` | zadania tekstowe i strategie |
| `M5-ARG-*` | rozumowanie, uzasadnianie, weryfikacja |

Każde pytanie ma 1 umiejętność główną i najwyżej 2 pomocnicze. Raport nie może podwójnie naliczać jednego wyniku do wielu umiejętności bez jawnej wagi.

## 47. Moduł startowy — diagnoza klasy V

Przed działem 1 przygotować nieocenianą diagnozę 20–30 minut:

- zapis i porównywanie liczb;
- oś liczbowa i zaokrąglanie;
- system rzymski jako wymaganie wstępne/uzupełniające;
- cztery działania w zakresie klasy IV;
- proste ułamki i jednostki;
- obwód prostokąta;
- jedno zadanie tekstowe z uzasadnieniem.

Wynik tworzy wyłącznie rekomendacje `warto przypomnieć`; nie wystawia oceny i nie blokuje programu.

## 48. Dział 1 — Liczby i działania (20–24 godziny)

Cel działu: sprawne, rozumiane i kontrolowane obliczenia na liczbach naturalnych oraz rozwiązywanie zadań wieloetapowych.

| ID | Temat i czas | Rdzeń lekcji interaktywnej | Dowód uczenia / papier |
|---|---|---|---|
| `M5-1.1` | Zapisywanie i porównywanie liczb, 1–2 h | **Fabryka liczb**: tabela pozycyjna, zapis słowny, rozkład, porównanie wartości cyfry po przesunięciu | karta „Zbuduj liczbę”, zadania z warunkami, porządkowanie i znaki `< > =` |
| `M5-1.2` | Dodawanie i odejmowanie w pamięci, 2–3 h | **Skoki po osi**: dopełnianie, rozkład, kompensacja; porównanie dwóch strategii | uczeń zapisuje strategię; karta z brakującym składnikiem/odjemnikiem |
| `M5-1.3` | Mnożenie i dzielenie w pamięci, 2–3 h | **Prostokąt mnożenia**: rzędy, kolumny, rozdzielność, grupowanie i reszta | magazyn paczek, brakujący czynnik/dzielnik, model prostokątny na papierze |
| `M5-1.4` | Kolejność działań, 2 h | **Reżyser działań**: karty wyrażenia, wskazanie następnego kroku, przesuwanie nawiasów | zapis etapów, uzupełnianie nawiasów, diagnoza typowego błędu |
| `M5-1.5` | Szacowanie wyników, 1 h | **Najpierw przewidź**: przedział wyniku, strategia zaokrąglania, porównanie z dokładnym wynikiem | ocena sensowności wyniku, koszt zakupów, zadania „czy to możliwe?” |
| `M5-1.6` | Pisemne dodawanie i odejmowanie, 2 h | **Cyfrowy zeszyt w kratkę**: kolumny, wymiana klocków, przeniesienie/pożyczka krokami | arkusz w kratkę, ustawienie liczb, naprawianie błędnego zapisu |
| `M5-1.7` | Pisemne mnożenie, 2 h | **Mnożenie warstwami**: model pola, iloczyny częściowe i zapis pisemny | karta z miejscem na iloczyny, brakujące cyfry i analiza błędu przesunięcia |
| `M5-1.8` | Pisemne dzielenie, 2 h | **Rozdzielnia**: wymiana jednostek i synchronizacja z zapisem | dzielenie z/bez reszty, zero w ilorazie, kontrola `dzielnik × iloraz + reszta` |
| `M5-1.9` | Zadania tekstowe, 3–4 h | **Detektyw danych**: pytanie, dane potrzebne/zbędne, plan i działania | zadania 1–3-etapowe; uczeń oznacza dane i zapisuje sprawdzenie sensowności |
| `M5-1.R` | Powtórzenie, 1 h | **Elektrownia liczb**: pięć stacji umiejętności bez publicznego rankingu | karta stacji + mapa „umiem / wrócę do” |
| `M5-1.S` | Sprawdzian i omówienie, 2 h | wersja cyfrowa oraz **Znajdź błąd** do wspólnego omówienia | A/B, klucz krokowy, rubryka, wpis wyników papierowych |

Minimalny bank działu: 80 pytań lub generatory dające ≥ 500 zweryfikowanych instancji, w tym minimum 10 zadań otwartych i 12 zadań tekstowych.

## 49. Dział 2 — Własności liczb naturalnych (12–14 godzin)

| ID | Temat i czas | Rdzeń lekcji interaktywnej | Dowód uczenia / papier |
|---|---|---|---|
| `M5-2.1` | Wielokrotności, 1–2 h | **Rytmy na osi**: dwa skoki i wspólne punkty | rozkład jazdy, wypisywanie wielokrotności w zakresie |
| `M5-2.2` | Dzielniki, 1–2 h | **Buduj prostokąty** z ustalonej liczby kafelków | wszystkie pary dzielników, uzasadnienie kompletności |
| `M5-2.3` | Cechy podzielności, 2 h | **Skaner podzielności**: ostatnie cyfry, suma cyfr, najpierw reguła i przewidywanie | bramki 2/3/4/5/9/10/100, brakująca cyfra, konstrukcja liczby |
| `M5-2.4` | Liczby pierwsze i złożone, 1 h | **Sito liczb**: ręczne wykreślanie i wzorzec wielokrotności | klasyfikacja z uzasadnieniem przez dzielniki; szczególny przypadek 1 |
| `M5-2.5` | Rozkład na czynniki pierwsze, 2 h | **Drzewo czynników**: różne drzewa, wspólny wynik końcowy | uzupełnij drzewo, odbuduj liczbę, znajdź czynnik niepierwszy |
| `M5-2.6` | NWD i NWW, 2 h | **Dwa sposoby**: lista oraz czynniki pierwsze, zastosowanie grupowania/synchronizacji | paczki bez reszty, cykle zdarzeń, wybór NWD czy NWW z uzasadnieniem |
| `M5-2.R` | Powtórzenie, 1 h | **Centrum logistyczne**: paczki, harmonogramy i kontrola kodów | karta problemowa łącząca podzielność, NWD i NWW |
| `M5-2.S` | Sprawdzian i omówienie, 2 h | omówienie przez modele prostokątów, sita i osi | A/B, klucz, rubryka argumentacji |

Generator NWD/NWW ma tworzyć przypadki nieoczywiste, względnie pierwsze, z relacją dzielnik–wielokrotność i z kilkoma czynnikami wspólnymi.

## 50. Dział 3 — Ułamki zwykłe (20–26 godzin)

| ID | Temat i czas | Rdzeń lekcji interaktywnej | Dowód uczenia / papier |
|---|---|---|---|
| `M5-3.1` | Ułamki i liczby mieszane, 2 h | **Jedna całość, różne podziały**: paski/koła, ułamek właściwy/niewłaściwy, mieszany | zamiana reprezentacji, zaznaczanie na modelu i osi |
| `M5-3.2` | Ułamek jako iloraz, 1 h | **Podziel sprawiedliwie**: kilka obiektów na grupy i zapis ilorazu | kontekst dzielenia, zapis `a : b = a/b` z warunkiem `b ≠ 0` |
| `M5-3.3` | Skracanie i rozszerzanie, 1–2 h | **Ta sama część**: zagęszczanie podziału bez zmiany pola | brakujący licznik/mianownik, sprowadzanie do postaci nieskracalnej |
| `M5-3.4` | Porównywanie ułamków, 1–2 h | **Nałóż paski / wspólna oś**: strategie wspólnego mianownika, licznika i odniesienia do 1/2 lub 1 | znaki, porządkowanie, uzasadnienie wybranej strategii |
| `M5-3.5` | Dodawanie/odejmowanie o jednakowych mianownikach, 2 h | **Łącz części tej samej wielkości** | model + zapis, liczby mieszane, zadania praktyczne |
| `M5-3.6` | Dodawanie/odejmowanie o różnych mianownikach, 2–3 h | **Zbuduj wspólną miarę**: nakładanie pasków i wspólny mianownik | zapis etapów, skrócenie wyniku, diagnoza „dodano mianowniki” |
| `M5-3.7` | Mnożenie ułamka przez liczbę naturalną, 1–2 h | **Powtórz porcję**: wielokrotność paska i skracanie przed obliczeniem | konteksty porcji, oś, liczby mieszane na rozszerzeniu |
| `M5-3.8` | Ułamek liczby naturalnej, 2 h | **Podziel, potem wybierz** oraz alternatywna kolejność działań | modele zbioru, pieniądze/miary, rozwiązanie dwoma sposobami |
| `M5-3.9` | Mnożenie ułamków, 2 h | **Część części**: nakładające się prostokąty | model pola, skracanie krzyżowe tylko po zrozumieniu, zadania praktyczne |
| `M5-3.10` | Dzielenie ułamków przez naturalne, 1–2 h | **Podziel pasek na grupy** | wynik jako mniejsze części, kontrola mnożeniem |
| `M5-3.11` | Dzielenie ułamków, 2–3 h | **Ile razy mieści się miara?**: model pomiarowy przed regułą odwrotności | ułamki i liczby mieszane, kontrola oszacowaniem i mnożeniem |
| `M5-3.R` | Powtórzenie, 1 h | **Kuchnia proporcji**: porcje, receptury i dobór reprezentacji | karta wieloetapowa, mapa typów błędów |
| `M5-3.S` | Sprawdzian i omówienie, 2 h | omówienie równoważnych strategii na paskach | A/B, odpowiedzi równoważne, rubryka kroków |

Walidator rozpoznaje liczby mieszane, ułamki niewłaściwe i równoważne wartości zgodnie z poleceniem. Nigdy nie sprowadza pustej odpowiedzi do zera.

## 51. Dział 4 — Figury na płaszczyźnie (19–25 godzin)

| ID | Temat i czas | Rdzeń lekcji interaktywnej | Dowód uczenia / papier |
|---|---|---|---|
| `M5-4.1` | Proste prostopadłe i równoległe, 1–2 h | **Linijka i ekierka**: budowanie, przesuwanie i kontrola relacji | konstrukcje papierowe, rozpoznawanie w różnych orientacjach |
| `M5-4.2` | Kąty, 1 h | **Rozchyl ramiona**: wierzchołek, ramiona, rodzaj i porównanie | nazewnictwo, klasyfikacja ostry/prosty/rozwarty/półpełny |
| `M5-4.3` | Mierzenie kątów, 1 h | **Kątomierz ekranowy**: środek, ramię bazowe, właściwa skala | arkusz kątów w kontrolowanej skali, rysowanie i odczyt do 1° |
| `M5-4.4` | Kąty przyległe, wierzchołkowe i trzy proste, 2 h | **Skrzyżowanie prostych**: przeciąganie i obserwacja niezmienników | obliczenia brakującego kąta z uzasadnieniem własności |
| `M5-4.5` | Wielokąty, 1 h | **Budowniczy wielokątów**: wierzchołki, boki, przekątne, wypukłość w zakresie programu | klasyfikacja, nazewnictwo i rysowanie przykładów/kontrprzykładów |
| `M5-4.6` | Rodzaje trójkątów, 1–2 h | **Trójkątny plac zabaw**: zmiana boków/kątów i dwie niezależne klasyfikacje | klasyfikacja w obrocie, wiele poprawnych cech, bez mylenia kategorii |
| `M5-4.7` | Konstrukcja trójkąta z boków, 1–2 h | **Dwa okręgi możliwości**: nierówność trójkąta i dwa położenia wierzchołka | konstrukcja linijką/cyrklem, decyzja czy trójkąt istnieje |
| `M5-4.8` | Miary kątów w trójkątach, 1–2 h | **Rozerwij i złóż 180°**: suma kątów, trójkąt równoramienny | brakujący kąt, uzasadnienie, różne orientacje |
| `M5-4.9` | Prostokąty i kwadraty, 1–2 h | **Laboratorium własności**: boki, kąty, przekątne, hierarchia | tabela prawda/fałsz z uzasadnieniem; kwadrat jako prostokąt |
| `M5-4.10` | Równoległoboki i romby, 2 h | **Przesuń wierzchołek**: niezmienniki boków, kątów i przekątnych | rozpoznanie w obrocie, konstrukcja i tabela własności |
| `M5-4.11` | Trapezy, 2 h | **Jedna para równoległych**: warianty i szczególne przypadki zgodnie z przyjętą definicją | klasyfikacja, kąty przy ramionach, rysunki nieprototypowe |
| `M5-4.12` | Czworokąty — podsumowanie, 1 h | **Mapa rodzin figur**: przeciąganie cech i relacji zawierania | diagram klasyfikacji, przykłady i kontrprzykłady |
| `M5-4.13` | Oś symetrii, 1–2 h | **Lustro figur**: składanie, rysowanie i uzupełnianie | osie figur, dokończenie rysunku na kratce, wzory symetryczne |
| `M5-4.R` | Powtórzenie, 1 h | **Biuro projektowe**: konstrukcja spełniająca zestaw warunków | karta konstrukcyjna i uzasadnienie cech |
| `M5-4.S` | Sprawdzian i omówienie, 2 h | tablica do mierzenia, konstrukcji i naprawy błędnych rysunków | A/B, kontrola skali, rubryka konstrukcji |

Kolor nie może być jedynym oznaczeniem ramion, prostych ani par kątów. Używać symboli, wzorów linii i etykiet.

## 52. Dział 5 — Ułamki dziesiętne (20–25 godzin)

| ID | Temat i czas | Rdzeń lekcji interaktywnej | Dowód uczenia / papier |
|---|---|---|---|
| `M5-5.1` | Zapisywanie ułamków dziesiętnych, 1–2 h | **Tabela po przecinku** i kratownica 10×10 | zapis słowny/cyfrowy, części dziesiąte/setne/tysięczne, oś |
| `M5-5.2` | Porównywanie, 1 h | **Wyrównaj miejsca**: tabela pozycyjna i oś | porządkowanie, zera końcowe, pułapka liczby cyfr |
| `M5-5.3` | Długość i masa w różnych zapisach, 2 h | **Miarka i waga**: dwumianowane ↔ dziesiętne | mm/cm/m/km, g/kg/t zgodnie z zakresem; realistyczne wielkości |
| `M5-5.4` | Dodawanie i odejmowanie, 2 h | **Kolumny przecinków**: wartości pozycyjne i wymiana | zapis pisemny, pieniądze/miary, szacowanie i naprawa przecinka |
| `M5-5.5` | Mnożenie przez 10, 100, 1000…, 1 h | **Zmiana wartości pozycji** zamiast „przesuwania przecinka” bez sensu | tabela pozycyjna, brakujący czynnik, konteksty jednostek |
| `M5-5.6` | Dzielenie przez 10, 100, 1000…, 1 h | ten sam model skali w przeciwnym kierunku | zapis zer wiodących, jednostki, oszacowanie |
| `M5-5.7` | Mnożenie dziesiętnego przez naturalne, 1–2 h | **Powtarzane porcje** i zapis pisemny | ceny, długości, kontrola rzędu wielkości |
| `M5-5.8` | Mnożenie ułamków dziesiętnych, 2 h | **Pole i skala**: mnożenie liczb całkowitych i interpretacja miejsc | różne liczby miejsc, mnożenie przez 0,1/0,01, pole |
| `M5-5.9` | Dzielenie dziesiętnych przez naturalne, 1–2 h | **Rozdziel kwotę/miarę** na równe części | dopisywanie zer, pieniądze i długość, kontrola mnożeniem |
| `M5-5.10` | Dzielenie przez ułamek dziesiętny, 2 h | **Zmień skalę obu liczb** bez zmiany ilorazu | dzielnik naturalizowany, wynik naturalny/dziesiętny, oszacowanie |
| `M5-5.11` | Szacowanie działań dziesiętnych, 1 h | **Czy wynik ma sens?**: przedział przed obliczeniem | odrzucanie błędów kalkulatora i przecinka |
| `M5-5.12` | Ułamki zwykłe i dziesiętne, 2–3 h | **Wybierz język liczby**: reprezentacja dogodna do działania | zamiana tylko gdy sensowna, porównanie i działania mieszane |
| `M5-5.13` | Procenty a ułamki, 0–2 h, opcjonalny | **Sto pól**: procent–ułamek–dziesiętny | proste 1/10/25/50/75/100%, rabaty i ankiety; wyłączalne w planie |
| `M5-5.R` | Powtórzenie, 1 h | **Sklep pomiarowy**: ceny, miary, rachunek i paragon | karta „Napraw paragon”, oszacowanie przed wynikiem |
| `M5-5.S` | Sprawdzian i omówienie, 2 h | naprawianie przecinka i błędnych jednostek na tablicy | A/B, klucz, zadania na jednostki i sens wyniku |

W UI używać polskiego przecinka, a w warstwie obliczeń jawnego parsera. Nie polegać na natywnym zachowaniu `input type=number` dla lokalizacji.

## 53. Dział 6 — Pola figur (17 godzin)

| ID | Temat i czas | Rdzeń lekcji interaktywnej | Dowód uczenia / papier |
|---|---|---|---|
| `M5-6.1` | Pole prostokąta i kwadratu, 2 h | **Pokryj bez luk**: kwadraty jednostkowe, wiersze i kolumny | pole, brakujący bok, to samo pole/różne obwody |
| `M5-6.2` | Jednostki pola, 2 h | **Powiększenie kwadratu**: 1 dm² jako 10×10 cm² | mm²/cm²/dm²/m² oraz a/ha zgodnie z planem; dobór jednostki |
| `M5-6.3` | Pole równoległoboku, 2 h | **Odetnij i przesuń**: podstawa, wysokość, zmiana pochylenia | wskazanie poprawnej wysokości, pole i brakujący wymiar |
| `M5-6.4` | Pole rombu, 2 h | romb jako równoległobok oraz rozcięcie przekątnymi, jeśli plan obejmuje oba wzory | dobór danych i metody, pochodzenie wzoru |
| `M5-6.5` | Pole trójkąta, 2 h | **Zbuduj parę**: dwa trójkąty w równoległobok | różne orientacje, właściwa wysokość, brakujący wymiar, dane zbędne |
| `M5-6.6` | Pole trapezu, 2 h | **Dwa trapezy**: równoległobok z sumą podstaw | pole, brakująca wysokość/podstawa, plan działki |
| `M5-6.7` | Pola wielokątów, 2 h | **Potnij lub dopełnij**: wiele poprawnych strategii | figura złożona, projekt podłogi, zapas materiału |
| `M5-6.R` | Powtórzenie, 1 h | **Turniej strategii** bez rankingu szybkości | porównanie podziału, dopełnienia i przekształcenia |
| `M5-6.S` | Sprawdzian i omówienie, 2 h | animowane rozcięcia i rozróżnienie pola od obwodu | A/B z figurą złożoną, jednostki i rubryka strategii |

Rysunki oceniane muszą powstawać z matematycznych parametrów, nie z ręcznie „podobnego” SVG.

## 54. Dział 7 — Liczby całkowite (6–11 godzin)

| ID | Temat i czas | Rdzeń lekcji interaktywnej | Dowód uczenia / papier |
|---|---|---|---|
| `M5-7.1` | Liczby ujemne, 3 h | **Temperatura, winda i głębokość** na jednej osi | odczyt, porównanie, liczby przeciwne, odległość od zera w kontekście |
| `M5-7.2` | Dodawanie, 0–1 h, opcjonalny | **Ruch na osi**: start, kierunek i liczba kroków | proste rachunki pamięciowe i zmiany temperatury |
| `M5-7.3` | Odejmowanie, 0–2 h, opcjonalny | **Zmiana temperatury** i odejmowanie jako dodawanie przeciwnej | oś, kontekst i kontrola sensu znaku |
| `M5-7.4` | Mnożenie i dzielenie, 0–2 h, opcjonalny | **Wzorce zmian** w tabeli, reguły znaków wynikające z regularności | proste przykłady tylko po włączeniu przez nauczyciela |
| `M5-7.R` | Powtórzenie, 1 h | **Stacja badawcza**: temperatura, poziomy i wysokości | zakres automatycznie zgodny z włączonymi tematami |
| `M5-7.S` | Sprawdzian i omówienie, 2 h | oś i konteksty; żadnych pytań spoza aktywnego planu | dynamiczny blueprint A/B zależny od opcji |

Treść opcjonalna nie może wejść do powtórzenia, zadania ani sprawdzianu, jeśli nauczyciel nie oznaczył jej jako realizowanej.

## 55. Dział 8 — Objętość figury (9 godzin)

| ID | Temat i czas | Rdzeń lekcji interaktywnej | Dowód uczenia / papier |
|---|---|---|---|
| `M5-8.1` | Jednostki objętości, 2 h | **Sześcian jednostkowy**: obrót, ściany i warstwy | cm³/dm³/m³, dobór jednostki, liczenie klocków z widoków |
| `M5-8.2` | Objętość prostopadłościanu, 2 h | **Warstwa po warstwie**: pole warstwy × liczba warstw | objętość, brakujący wymiar, bryły o tej samej objętości |
| `M5-8.3` | Litry i mililitry, 2 h | **Laboratorium przelewania** i relacje 1 l = 1 dm³, 1 ml = 1 cm³ | podziałki, przelewanie, butelki, akwarium i pojemność |
| `M5-8.R` | Powtórzenie, 1 h | **Zapakuj przesyłkę**: pudełko, układ paczek i pojemność | projekt na papierze z widokiem izometrycznym |
| `M5-8.S` | Sprawdzian i omówienie, 2 h | rozłożenie modelu na warstwy | A/B: jednostki, model, wzór, litry, zadanie praktyczne |

Model 3D ma alternatywny zestaw rzutów/warstw dla urządzeń słabszych, czytnika ekranu i wydruku.

## 56. Zadania przekrojowe

W każdym dziale co najmniej 20% punktów ćwiczeniowych ma badać coś więcej niż sam rachunek:

- wybór danych;
- dobór modelu lub działania;
- oszacowanie;
- weryfikację sensu wyniku;
- wyjaśnienie strategii;
- znalezienie i poprawienie błędu;
- utworzenie przykładu lub kontrprzykładu.

Raz na dział przygotować zadanie w parze i jedno zadanie z danymi rzeczywistymi albo realistycznym szkolnym kontekstem. Dane rzeczywiste muszą mieć źródło i datę; zadania oceniane nie mogą zależeć od zmieniającego się wyniku z internetu.

## 57. Standard banku pytań

Dla każdego zwykłego tematu:

- minimum 3 szablony `support`;
- minimum 5 `core`;
- minimum 4 `challenge`;
- minimum 2 diagnozujące konkretny błąd;
- minimum 1 otwarte albo wymagające strategii;
- co najmniej 50 poprawnych kombinacji na szablon generatywny albo 12 ręcznie zweryfikowanych instancji;
- wariant cyfrowy i papierowy;
- podpowiedzi i rozwiązanie;
- test co najmniej 1000 seedów dla generatora.

Dla sprawdzianu używać osobnej puli lub osobnej przestrzeni seedów. Nie powtarzać uczniowi identycznych danych z domyślnej lekcji.

## 58. Blueprint sprawdzianu działowego

Domyślna macierz, konfigurowalna w granicach:

- 20% rozpoznanie/pojęcie;
- 40% procedura i rachunek;
- 25% zastosowanie w kontekście;
- 15% problem, argumentacja lub analiza błędu;
- 60–70% punktów na poziomie podstawowym/core;
- 20–30% standard+;
- 10% wyzwanie;
- minimum jedno zadanie otwarte;
- maksimum 25% punktów z pytań wyboru;
- przewidywany czas rozwiązania przez ucznia core ≤ 80% limitu.

Nauczyciel widzi ostrzeżenie, jeśli ręczna zmiana naruszy pokrycie, ale może ją świadomie zatwierdzić.

---


# CZĘŚĆ VIII — PLAN REFAKTORYZACJI I PACZKI WYKONAWCZE

## 59. Zasady migracji istniejącego produktu

1. Refaktoryzacja jest przyrostowa; po każdej paczce produkcyjny build działa.
2. Nie usuwać publicznych slugów bez przekierowania lub potwierdzonego wycofania.
3. Nie usuwać danych testów i wyników; rozszerzać schemat.
4. Najpierw wspólny kontrakt i jeden pionowy pilotaż, potem produkcja dziesiątek lekcji.
5. Stare i nowe widoki mogą chwilowo współistnieć za wewnętrznym feature flagiem, ale nie tworzą dwóch źródeł prawdy.
6. Komponent obecnej symulacji można opakować adapterem; przepisywanie jest wymagane dopiero, gdy narusza hooki, dostępność lub kontrakt danych.
7. Nowa nawigacja wchodzi po przygotowaniu tras docelowych, aby nie prowadziła do pustych ekranów.
8. Każda paczka migracyjna zawiera listę tras i komponentów, które stają się przestarzałe, lecz usuwa je osobna paczka porządkowa.

## 60. Bramki etapów

### Bramka A — stabilny fundament

- lint bez błędów;
- build przechodzi;
- test runner działa;
- krytyczne błędy hooków usunięte;
- `starts_at` egzekwowane w bazie przy starcie i oddaniu;
- sesja Supabase jest poprawnie odświeżana zgodnie z Next 16;
- test izolacji dwóch szkół przechodzi.

### Bramka B — pionowy pilotaż

- jeden temat działa jako program → lekcja → tablica → tablet → wynik → wydruk;
- ten sam blueprint tworzy pracę cyfrową i papier A/B;
- wynik papierowy można wpisać do mapy;
- test na 1024×768, 1366×768 i A4 przechodzi;
- nauczyciel wykonuje scenariusz bez instrukcji technicznej.

### Bramka C — gotowy dział

- wszystkie tematy działu spełniają kontrakt;
- powtórzenie i sprawdzian pokrywają umiejętności;
- generatory przeszły property/invariant tests;
- treści przeszły recenzję matematyczną i językową;
- brak atrap i niedziałających przycisków.

### Bramka D — klasa V

- osiem działów gotowych;
- tematy opcjonalne respektują plan klasy;
- pełny przepływ cyfrowy i papierowy;
- końcowy audyt RLS, dostępności, wydajności i druku;
- dokumentacja administratora i nauczyciela.

## 61. Paczki fazy 0 — zatrzymanie długu

### `WP-000` — zapis stanu i mapa migracji

Zakres:

- utworzyć `docs/current-state.md` i `docs/migration-map.md`;
- spisać obecne trasy, tabele, RPC, komponenty symulacji i właścicieli danych;
- przypisać każdemu staremu modułowi: `keep`, `adapt`, `replace`, `retire`;
- nie zmieniać zachowania produktu.

Odbiór:

- żadnego kodu funkcjonalnego;
- mapa zawiera publiczny katalog, auth, testy, zadania, wyniki, powiadomienia i każdą migrację;
- `git diff` ogranicza się do dokumentacji.

### `WP-001` — naprawa React/lint

Zakres:

- usunąć warunkowe hooki;
- zastąpić losowość render-time determinizmem;
- usunąć zbędne `setState` w efektach;
- poprawić zależności callbacków i wewnętrzny `<a>`;
- usunąć lub wykorzystać martwe importy.

Pliki startowe:

- `src/components/simulations/interactive/*`;
- `src/components/simulations/premium/*`;
- `src/components/grading/TestResultCelebration.tsx`;
- `src/components/teacher/AssignmentProgressView.tsx`;
- `src/components/navigation/SimulationFilters.tsx`.

Odbiór:

- `npm.cmd run lint` bez błędów; ostrzeżenia najlepiej 0 i wszystkie uzasadnione;
- `npm.cmd run build` przechodzi;
- brak wizualnej regresji podstawowych symulacji.

### `WP-002` — krytyczne bezpieczeństwo i sesja

Zakres:

- nowa migracja dopina `starts_at` w aktualnej funkcji `submit_assignment`;
- sprawdza status aktywnego ucznia i czas serwera;
- dodaje `src/proxy.ts` zgodnie z dokumentacją Next 16/Supabase SSR do odświeżania sesji;
- nie przenosi pełnej autoryzacji do Proxy;
- wzmacnia `getAppOrigin`: produkcja wymaga jawnego bezpiecznego originu.

Odbiór:

- próba oddania przed `starts_at` przez bezpośrednie RPC kończy się błędem;
- próba oddania po `due_at`, z innej szkoły i jako nauczyciel kończy się błędem;
- dozwolona próba ucznia działa;
- auth callback i wylogowanie działają.

### `WP-003` — infrastruktura testów

Zakres:

- skonfigurować Vitest, Testing Library i Playwright;
- dodać skrypty `test`, `test:watch`, `test:e2e`, `test:generators`;
- test parsera polskiej liczby, oceny punktowej i jednego modelu;
- smoke E2E: publiczny katalog, logowanie z mock/test env, chroniona trasa;
- dokumentacja uruchomienia.

Odbiór:

- testy nie zależą od produkcyjnych danych;
- nie umieszczać sekretów w repo;
- wszystkie skrypty działają na Windows przez `npm.cmd` oraz w CI.

## 62. Paczki fazy 1 — design system i program

### `WP-010` — tokeny i prymitywy UI

Zakres:

- wdrożyć tokeny z sekcji 15;
- ujednolicić `Button`, `Card`, `Badge`, formularze i stany;
- dodać ikony i widoczny focus;
- przygotować stronę developerską `/dev/ui` tylko w development.

Odbiór:

- brak losowych nowych kolorów poza tokenami;
- wszystkie prymitywy mają disabled/loading/error/focus;
- kontrast AA i cele dotykowe 48 px.

### `WP-011` — nowe powłoki i nawigacja

Zakres:

- `TeacherShell`, `StudentShell`, `BoardShell`, `PrintShell`;
- `SchoolSwitcher` z jawnym kontekstem szkoły;
- nowa nawigacja, zachowując linki do działających starych funkcji przez mapę przejściową;
- tablica i print bez globalnego header/footer.

Odbiór:

- aktywny element nawigacji działa dla tras zagnieżdżonych;
- klawiatura i czytnik ekranu przechodzą poprawnie;
- wybór szkoły nie miesza klas ani wyników.

### `WP-012` — domena programu i walidacja contentu

Zakres:

- typy i schematy Zod programu, działu, tematu, umiejętności i lekcji;
- rejestr `pl-math-5-2026-classic`;
- wszystkie 82 pozycje programu jako metadane, bez atrap lekcji;
- walidator unikalnych ID, zależności, godzin i referencji;
- test coverage map.

Odbiór:

- build przerywa się dla duplikatu ID, brakującej umiejętności lub nieistniejącego prerequisite;
- status pozycji jasno mówi `metadata-only` lub `published`; UI nie udaje gotowej lekcji;
- sumy godzin są raportowane per dział.

### `WP-013` — UI programu klasy

Zakres:

- ekran mapy roku, działu i tematu;
- status realizacji oraz opcjonalność;
- filtrowanie po klasie, dziale i statusie;
- plan bez bazy w trybie publicznego podglądu i z bazą w panelu nauczyciela.

Odbiór:

- nie pokazuje surowego katalogu symulacji jako programu;
- od tematu do gotowej lekcji najwyżej 2 kliknięcia;
- puste tematy mają uczciwe `w przygotowaniu`, bez niedziałającego CTA.

### `WP-014` — plan klasy i migracja DB

Zakres:

- migracja `class_curriculum_plans`, `topic_plan_entries`;
- RLS, indeksy, RPC tworzenia i zmiany statusu;
- przypisanie wersji programu do klasy;
- test dwóch szkół i dwóch nauczycieli.

Odbiór:

- nie można przypisać planu do cudzej klasy/szkoły;
- zmiana kolejności nie zmienia bazowej definicji programu;
- historia wykonanych tematów nie znika po archiwizacji planu.

## 63. Paczki fazy 2 — pionowy pilotaż lekcji

Pilotaż: `M5-1.4 Kolejność działań`. Temat nadaje się do tablicy, tabletów, generatora, papieru i analizy błędów.

### `WP-020` — powłoka pakietu lekcyjnego

Zakres:

- domena `LessonPackage`, `LessonStage` i przewodnika;
- widok tematu i etapy: wejście, odkryj, nazwij, przykład, ćwicz, wyzwanie, bilet;
- `LessonStageRail`, tryb przygotowania i podgląd;
- bez Realtime w tej paczce.

Odbiór:

- pakiet renderuje się z danych, nie z warunków po tytule;
- każdy etap ma tablicę oraz wariant ucznia/papieru zgodnie z konfiguracją;
- nawigacja wstecz/dalej nie gubi stanu modelu.

### `WP-021` — model „Reżyser działań”

Zakres:

- deterministyczny generator wyrażeń;
- karty operacji/nawiasów;
- walidator kolejnego kroku i całego rozwiązania;
- trzy poziomy, typowe błędy i podpowiedzi;
- obsługa pointer oraz alternatywa zaznacz/umieść.

Odbiór:

- minimum 1000 seedów bez dzielenia przez zero i niecałkowitego kroku tam, gdzie jest zabroniony;
- różne poprawne równoważne pierwsze kroki są akceptowane, jeśli matematycznie dozwolone;
- hooki bez warunków, brak losowości podczas renderowania.

### `WP-022` — kompletny pakiet pilota

Zakres:

- treść wszystkich etapów `M5-1.4`;
- przewodnik nauczyciela;
- 12+ szablonów/instancji na poziomach;
- bilet wyjścia;
- karta bez urządzeń;
- recenzja językowa i matematyczna manifestu.

Odbiór:

- da się poprowadzić 45 minut tylko z pakietem;
- brak placeholderów/TODO;
- polecenia cyfrowe i papierowe badają te same umiejętności.

## 64. Paczki fazy 3 — druk i ocenianie hybrydowe

### `WP-030` — fundament HTML print

Zakres:

- `PrintShell`, `A4Page`, `AnswerSpace`, style `@media print`;
- podgląd stron i wybór uczeń/klucz;
- route nauczyciela z pełną autoryzacją;
- test na Chrome i Edge, skala 100%.

Odbiór:

- brak przeciętych zadań i kontrolek portalu;
- strony mają numerację i wersję;
- print snapshot pilota przechodzi.

### `WP-031` — blueprint i wersje A/B

Zakres:

- schemat blueprintu;
- generator dwóch równoważnych wersji pilota;
- checksum i niezmienny snapshot;
- klucz oraz rubryka;
- podgląd pokrycia umiejętności.

Odbiór:

- A/B mają tę samą punktację i klasy trudności;
- ponowne otwarcie pracy daje identyczne arkusze;
- rozwiązanie nie trafia do publicznego payloadu.

### `WP-032` — ujednolicenie pracy cyfrowej

Zakres:

- rozszerzyć obecne testy/przypisania o curriculum, blueprint, kind i delivery;
- zachować zgodność istniejących rekordów;
- nowy kreator `Pracy` zamiast osobnych ślepych ścieżek;
- dopiąć poprawną walidację okna od–do.

Odbiór:

- stare testy nadal są czytelne i rozwiązywalne;
- nowe mają snapshot wersji;
- nie ma możliwości zmiany ocenianego pytania po rozpoczęciu próby.

### `WP-033` — wyniki papierowe

Zakres:

- tabele `paper_results`, items i audyt;
- szybka tabela wprowadzania;
- evidence do mapy umiejętności;
- absent ≠ 0;
- korekta z audytem.

Odbiór:

- nauczyciel innej szkoły nie odczyta ani nie zmieni wyniku;
- suma punktów jest wyliczana na serwerze;
- klawiaturą można wpisać całą klasę bez użycia myszy.

## 65. Paczki fazy 4 — lekcja na żywo

### `WP-040` — schema sesji i RLS

Zakres:

- tabele sesji, uczestników, odpowiedzi i zdarzeń;
- RPC create/join/start/pause/change-stage/end/submit-response;
- rotowany kod o TTL;
- testy ról i dwóch szkół.

Odbiór:

- kod bez członkostwa klasy nie wystarcza do dołączenia;
- uczeń nie steruje etapem;
- drugi nauczyciel bez uprawnienia nie przejmuje sesji;
- zakończona sesja odrzuca nowe odpowiedzi.

### `WP-041` — widok tablicy

Zakres:

- `BoardShell`, lobby, cel i kod QR;
- odbiór aktywnego etapu;
- pełny ekran, pauza, reconnect;
- anonimizowane podsumowanie.

Odbiór:

- brak PII w DOM/network payload tablicy;
- czytelność na trzech rozdzielczościach;
- po refreshu wraca aktualny etap.

### `WP-042` — pulpit prowadzącego

Zakres:

- etapowy rail i kontrolki;
- liczba obecnych, stany odpowiedzi i prośby o pomoc;
- histogram/strategie bez nazwisk na publicznym ekranie;
- „kontynuuj tylko na tablicy”.

Odbiór:

- komendy idempotentne i uporządkowane sequence number;
- rozwiązanie odsłaniane jawnie;
- zakończenie wymaga potwierdzenia i tworzy podsumowanie.

### `WP-043` — tablet ucznia

Zakres:

- dołączenie zalogowanego ucznia;
- stan oczekiwania, aktywności i wysłania;
- draft lokalny, idempotentne wysłanie;
- dostępna obsługa dotykiem/klawiaturą;
- status offline/reconnect.

Odbiór:

- podwójne kliknięcie nie tworzy dwóch odpowiedzi;
- uczeń nie widzi odpowiedzi innych;
- refresh nie gubi wysłanej odpowiedzi;
- 200% zoom zachowuje funkcje.

### `WP-044` — mapa dowodów i podsumowanie sesji

Zakres:

- `skill_evidence`;
- podsumowanie klasy, strategie, umiejętności do powrotu;
- prywatny widok ucznia;
- polityka niskiej wagi diagnozy na żywo.

Odbiór:

- wynik da się wyjaśnić listą źródeł;
- jedna odpowiedź nie jest liczona podwójnie;
- nauczyciel może wyłączyć zapis diagnostyczny do mapy.

## 66. Paczki fazy 5 — produkcja treści

Nie uruchamiać równolegle wielu tematów przed przyjęciem wzorca pilota. Kolejność:

1. `WP-C1A`: dział 1, tematy 1.1–1.3;
2. `WP-C1B`: dział 1, tematy 1.5–1.9;
3. `WP-C1C`: powtórzenie i sprawdzian działu 1;
4. `WP-C2A/B`: dział 2 i jego odbiór;
5. `WP-C3A/B/C`: dział 3;
6. `WP-C4A/B/C`: dział 4;
7. `WP-C5A/B/C`: dział 5;
8. `WP-C6A/B`: dział 6;
9. `WP-C7A/B`: dział 7 wraz z opcjonalnością;
10. `WP-C8A/B`: dział 8;
11. `WP-CROSS`: zadania przekrojowe, diagnoza startowa i mapa roku.

Każda paczka treści obejmuje najwyżej 3–5 zwykłych tematów albo jedno powtórzenie/sprawdzian. Nie łączyć tworzenia nowego wspólnego modelu z pięcioma pełnymi tematami w jednej paczce.

## 67. Paczki fazy 6 — wygaszenie starego UX

### `WP-060` — adaptery i przekierowania

- obecne `Simulation` mapować do nowych `ManipulativeDefinition`;
- publiczne slugi zachować;
- linki nauczyciela prowadzą do lekcji/wyboru użycia;
- telemetrycznie lub ręcznie sprawdzić martwe trasy.

### `WP-061` — konsolidacja testów i zadań

- stare kreatory przepiąć do `Prace`;
- usunąć duplikaty tylko po migracji funkcji;
- zachować archiwalne linki wyników.

### `WP-062` — porządki końcowe

- usunąć martwy kod, flagi migracyjne i nieużywane style;
- zaktualizować README, instrukcję wdrożenia i diagram danych;
- pełen test build/lint/E2E/RLS/print;
- raport ograniczeń.

---

# CZĘŚĆ IX — JAKOŚĆ, DOSTĘPNOŚĆ I ODBIÓR

## 68. Piramida testów

### 68.1. Unit

- parsery i formatery polskich liczb;
- arytmetyka, ułamki, NWD/NWW, jednostki;
- generatory i ich niezmienniki;
- walidatory odpowiedzi;
- blueprint A/B;
- algorytm mastery/evidence;
- state reducers sesji.

### 68.2. Component

- zmiana poziomu;
- reset/cofnij;
- podpowiedzi;
- poprawna, częściowa i błędna odpowiedź;
- dostępna alternatywa drag-and-drop;
- tabela wyników papierowych;
- przełączanie etapów i reconnect UI.

### 68.3. Integration/database

- RPC na rzeczywistej testowej bazie Supabase/local;
- RLS dla każdej roli i dwóch szkół;
- czas `starts_at/due_at` z czasem bazy;
- atomowe oddanie pracy;
- idempotencja odpowiedzi;
- audyt korekty oceny.

### 68.4. E2E

1. nauczyciel → plan → start sesji → tablica;
2. uczeń → dołączenie → odpowiedź → potwierdzenie;
3. nauczyciel → anonimowe podsumowanie → koniec;
4. praca cyfrowa → rozwiązanie → wynik;
5. praca papierowa A/B → print → wpis punktów;
6. nauczyciel z drugiej szkoły nie ma dostępu;
7. publiczny katalog działa bez logowania.

### 68.5. Visual/print

- tablica 1920×1080, 1366×768, 1024×768;
- tablet portrait/landscape;
- desktop teacher 1440 i 1024;
- A4 strona ucznia, wersja B, klucz;
- tryb reduced motion i wysoki zoom.

## 69. Dostępność

Minimalny standard: WCAG 2.2 AA w kluczowych przepływach.

- jeden logiczny `h1`, poprawna hierarchia nagłówków;
- landmarki i skip link;
- pełna obsługa klawiaturą;
- focus nie ginie po modalach i zmianach etapu;
- status odpowiedzi przez `aria-live` bez nadmiernych komunikatów;
- alternatywa dla drag, gestów i precyzyjnego rysowania;
- nie polegać na kolorze, dźwięku ani hover;
- animacje można zatrzymać; reduced motion wyłącza ozdobne ruchy;
- poprawny opis matematyczny SVG;
- dane tabelaryczne mają nagłówki;
- limity czasu domyślnie wyłączone albo przed startem jawne;
- tablica zachowuje kluczowe kontrolki przy powiększeniu;
- nie narzucać uczniowi formalizmu językowego, jeśli badana jest matematyka, a nie zapis formalny.

## 70. Prywatność dzieci

- zbierać minimum danych;
- brak publicznych rankingów i ścian wyników z nazwiskami;
- kod sesji nie identyfikuje szkoły ani klasy;
- żadnych reklam i trackerów behawioralnych;
- żadnych zewnętrznych fontów/assetów wysyłających identyfikatory, jeśli można hostować lokalnie;
- retencja zdarzeń technicznych i odpowiedzi ma być jawna i konfigurowalna;
- eksport/usunięcie danych zgodnie z polityką szkoły;
- logi nie zawierają tokenów, e-maili ani treści odpowiedzi;
- analityka produktu agregowana i pseudonimizowana;
- administrator techniczny nie potrzebuje podglądu kluczy i odpowiedzi do zwykłej diagnostyki.

## 71. Recenzja treści

Każdy pakiet przechodzi statusy:

`draft → math-review → pedagogy-review → language-review → qa → published`

Jedna osoba/model nie może samodzielnie uznać własnego generatora za zrecenzowany. Automatyczne testy nie zastępują kontroli metodycznej.

Manifest recenzji zawiera:

- ID i wersję pakietu;
- osobę/agenta tworzącego;
- wynik testów generatora;
- listę ręcznie sprawdzonych seedów;
- kontrolę zgodności rysunku;
- kontrolę wszystkich odpowiedzi równoważnych;
- kontrolę języka polskiego;
- daty i decyzje recenzentów;
- znane ograniczenia.

## 72. Definition of Done pojedynczego tematu

Temat jest gotowy wyłącznie, gdy:

- jest podpięty do poprawnej wersji programu i umiejętności;
- ma kompletną sekwencję lekcji;
- działa w trybie przygotowania, tablicy i ucznia;
- ma wariant bez tabletów;
- ma kartę do druku;
- ma pytania cyfrowe i papierowe;
- trzy poziomy rzeczywiście różnią się poznawczo;
- generator jest deterministyczny i przetestowany;
- informacja zwrotna diagnozuje błąd;
- działa mysz, dotyk, rysik i klawiatura;
- nie wysyła klucza do klienta przed oddaniem;
- przechodzi lint, testy, build i manual QA;
- ma zakończony manifest recenzji;
- nie zawiera `TODO`, atrap, przycisków bez działania ani tekstu zastępczego.

## 73. Definition of Done działu

- wszystkie tematy spełniają sekcję 72;
- godziny i kolejność są zgodne z planem;
- powtórzenie pokrywa każdą główną umiejętność;
- sprawdzian A/B jest równoważny i ma rubrykę;
- cyfrowe i papierowe wyniki trafiają do tej samej mapy;
- nauczyciel może wyłączyć treści opcjonalne;
- raport działu wskazuje braki indywidualne i klasowe;
- recenzent matematyczny zatwierdził dział jako całość.

## 74. Definition of Done platformy klasy V

- Bramka D spełniona;
- publiczny katalog nadal działa bez konta;
- nauczyciel i uczeń spełniają zasady rejestracji;
- separacja szkół jest potwierdzona testami;
- da się przeprowadzić pełną lekcję przy awarii tabletów;
- da się przygotować i wydrukować sprawdzian A/B w mniej niż 3 minuty;
- da się wpisać papierowe wyniki całej klasy bez myszy;
- wszystkie historyczne wyniki pozostają dostępne;
- dokumentacja wdrożenia, backupu, aktualizacji programu i obsługi jest gotowa;
- brak błędów lint/build/test;
- znane ograniczenia są jawne, nieukryte pod etykietą „gotowe”.

## 75. Kryteria sukcesu produktu

Po pilotażu mierzyć:

- mediana czasu do uruchomienia gotowej lekcji < 60 s;
- mediana czasu do wygenerowania sprawdzianu A/B < 3 min;
- ≥ 90% uczniów dołącza do sesji bez pomocy nauczyciela po pierwszym użyciu;
- ≥ 95% odpowiedzi dociera bez duplikatu;
- nauczyciel umie wskazać kolejną decyzję dydaktyczną z podsumowania;
- co najmniej 80% etapów pakietu może być użytych bez tabletu ucznia;
- zero potwierdzonych wycieków danych między szkołami;
- zero zadań z błędnym kluczem w opublikowanej puli;
- wydruk nie wymaga ręcznej edycji w zewnętrznym edytorze.

Metryki nie mogą śledzić dzieci w celach marketingowych ani tworzyć profili poza funkcją edukacyjną.

---

# CZĘŚĆ X — PROTOKÓŁ DLA TAŃSZYCH MODELI / AGENTÓW

## 76. Polecenie systemowe dla wykonawcy paczki

Skopiuj poniższy blok i uzupełnij `WP-ID`:

```text
Pracujesz w repozytorium LekcjaLab. Wykonaj wyłącznie paczkę [WP-ID]
z pliku LEKCJALAB_KLASA_5_MASTER_SPEC.md.

Najpierw:
1. przeczytaj AGENTS.md;
2. przeczytaj cały opis paczki, jej zależności i kryteria odbioru;
3. przeczytaj dotykane istniejące pliki;
4. dla Next.js przeczytaj właściwy lokalny przewodnik w node_modules/next/dist/docs/;
5. sprawdź git status i nie nadpisuj cudzych zmian;
6. przedstaw krótki plan plików.

Następnie wykonaj implementację. Nie twórz atrap, TODO ani równoległego systemu.
Nie zmieniaj plików poza zakresem bez opisania koniecznej przyczyny.
Migracje są append-only. Bezpieczeństwo egzekwuj w RLS/RPC, nie tylko w UI.

Po pracy uruchom wymagane testy, lint i build. Popraw błędy powstałe w paczce.
Na końcu raportuj: pliki, zachowanie, testy, decyzje, ograniczenia i następny WP.
Nie rozpoczynaj następnej paczki.
```

## 77. Obowiązkowy plan przed zmianą

Agent ma podać najwyżej 8 punktów:

1. cel paczki własnymi słowami;
2. pliki do odczytu;
3. pliki do zmiany/dodania;
4. zmiana danych/migracja;
5. wpływ na RLS;
6. testy;
7. ryzyka regresji;
8. warunek zakończenia.

Jeśli paczka wymaga nieopisanej decyzji zmieniającej produkt, agent zatrzymuje się i zgłasza konkretną rozbieżność. Nie rozszerza zakresu samodzielnie.

## 78. Reguły oszczędnego kontekstu

- nie wczytywać całego 20-tysięcznego banku zadań; użyć wyszukiwania i małych zakresów;
- najpierw `rg`, potem konkretny plik;
- nie wklejać całych migracji do raportu;
- nie generować dziesiątek prawie identycznych komponentów;
- dane tematów trzymać w małych plikach per dział/temat;
- wspólne typy czytać raz i importować;
- po kompakcji kontekstu kontynuować bieżący WP, nie zaczynać ponownie;
- decyzje zapisywać w kodzie/testach lub krótkim ADR, nie polegać na pamięci rozmowy.

## 79. Zakazane skróty

Agentowi nie wolno:

- oznaczyć metadanych tematu jako pełnej lekcji;
- uznać `next build` za zamiennik linta/testów;
- wyłączyć reguły Reacta, aby ukryć błędy;
- dodać `eslint-disable` bez lokalnego, technicznego uzasadnienia;
- używać `Math.random()` do ocenianego contentu;
- zapisać odpowiedzi poprawnej w DOM ukrytym CSS;
- tworzyć jednej szerokiej polityki RLS „authenticated can all”;
- ufać roli, szkole, punktom lub czasowi przesłanym przez klienta;
- edytować stare migracje wdrożonej bazy;
- kopiować zadań wydawnictwa;
- wdrażać OCR/AI zamiast podstawowego ręcznego przepływu papieru;
- dodać bibliotekę tylko dla jednej prostej funkcji bez analizy kosztu;
- usuwać stare trasy przed przygotowaniem migracji i przekierowań;
- pozostawiać błędów z własnej paczki jako „istniejący dług”.

## 80. Format raportu po paczce

```markdown
## Raport [WP-ID]

### Wynik
Jedno–trzy zdania: co użytkownik może teraz zrobić.

### Zmienione pliki
- `ścieżka` — powód zmiany

### Dane i bezpieczeństwo
- migracje, RLS, RPC, brak zmian albo opis

### Weryfikacja
- `komenda` — PASS/FAIL i liczba testów
- test manualny — wynik

### Decyzje
- decyzja i krótkie uzasadnienie

### Ograniczenia
- tylko realne pozostałe ograniczenia tej paczki

### Następna paczka
- ID wynikające z planu; nie implementowano jej
```

## 81. Lista kontrolna code review

Reviewer odpowiada `tak/nie/nie dotyczy`:

1. Czy zakres odpowiada jednemu WP?
2. Czy zachowano reguły szkoły i ról?
3. Czy walidacja serwerowa nie ufa klientowi?
4. Czy dane poprawnej odpowiedzi są chronione?
5. Czy content ma stabilne ID i wersję?
6. Czy generator jest deterministyczny?
7. Czy nie ma warunkowych hooków i efektów liczących stan pochodny?
8. Czy działa klawiatura/dotyk?
9. Czy istnieje stan loading/error/empty?
10. Czy wydruk, jeśli dotyczy, mieści się na A4?
11. Czy testy obejmują błąd, nie tylko happy path?
12. Czy lint, testy i build przechodzą?
13. Czy nie dodano zbędnej zależności?
14. Czy nie utworzono duplikatu komponentu/systemu?
15. Czy dokumentacja/manifest zostały zaktualizowane?

---

# CZĘŚĆ XI — KOŃCOWE POLECENIE STARTOWE

## 82. Start realizacji

Nie rozpoczynaj od tworzenia wszystkich lekcji. Wykonuj kolejno:

1. `WP-000` — mapa stanu;
2. `WP-001` — zdrowy React i lint;
3. `WP-002` — bezpieczeństwo czasu i sesji;
4. `WP-003` — testy;
5. `WP-010` do `WP-014` — design system i program;
6. `WP-020` do `WP-022` — pionowy pilotaż;
7. Bramka B i ręczna decyzja o akceptacji wzorca;
8. druk, hybrydowe ocenianie i live session;
9. dopiero potem produkcja pełnych działów.

Aktualne zadanie pierwszego wykonawcy brzmi:

> Przeczytaj `AGENTS.md` oraz ten dokument. Wykonaj wyłącznie `WP-000`. Nie zmieniaj zachowania aplikacji i nie rozpoczynaj `WP-001`.

## 83. Oczekiwany raport końcowy całego programu

Po ukończeniu klasy V raport musi zawierać:

1. mapę wszystkich 8 działów i 82 pozycji ze statusem;
2. listę pakietów lekcyjnych i ich wersji;
3. listę wspólnych modeli matematycznych;
4. pokrycie umiejętności bankiem pytań;
5. wyniki testów generatorów i recenzji treści;
6. wyniki lint, unit, integration, E2E, build, RLS i print QA;
7. listę migracji i polityk bezpieczeństwa;
8. instrukcję prowadzenia lekcji tablica + tablet;
9. instrukcję generowania i oceniania pracy papierowej;
10. wyniki pilotażu nauczycielskiego;
11. znane ograniczenia;
12. plan aktualizacji do `pl-math-5-2027-reforma26` bez niszczenia historii.

---

**Koniec specyfikacji.**

Ten dokument definiuje pierwszy kompletny pion produktu. Kolejne klasy i przedmioty mają korzystać z tych samych kontraktów programu, lekcji, sesji, pracy i dowodu umiejętności — bez kopiowania modułu klasy V pod nową nazwą.

