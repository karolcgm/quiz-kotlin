# Plan realizacji działów 3–5 — indeks i protokół nowych kontekstów

- Status: plan wykonawczy, bez zmian implementacyjnych
- Zakres: matematyka, klasa V, LekcjaLab
- Wersja programu: `pl-math-5-2026-classic`
Dokumenty szczegółowe:

- [Dział 3 — Ułamki zwykłe](./PLAN_DZIAL_3_ULAMKI_ZWYKLE.md)
- [Dział 4 — Figury na płaszczyźnie](./PLAN_DZIAL_4_FIGURY_NA_PLASZCZYZNIE.md)
- [Dział 5 — Ułamki dziesiętne](./PLAN_DZIAL_5_ULAMKI_DZIESIETNE.md)

## 1. Cel

Celem jest przebudowanie działów 3–5 w kompletne, profesjonalne pakiety lekcyjne na tablicę, tablet i papier. Każdy temat ma mieć:

- poprawną nazwę matematyczną i mapowanie do podstawy na pierwszym slajdzie;
- model, na którym uczeń może eksperymentować w czasie rzeczywistym;
- przykład odsłaniany krok po kroku;
- zadania `support`, `core` i `challenge` bez etykietowania ucznia jako słabego lub dobrego;
- diagnostyczny feedback, podświetlenia, przekreślenia i naprawę błędu;
- pełną obsługę myszy, dotyku, rysika i klawiatury;
- równoważny wariant papierowy;
- ostatni slajd `Ocena umiejętności` z oceną pracy i samooceną ucznia;
- testy matematyczne, komponentowe, dostępności i widoków.

## 2. Obowiązująca podstawa programowa

W roku szkolnym 2026/2027 nowa podstawa programowa jest wdrażana od klas I i IV. Klasa V pozostaje w ścieżce klasycznej, dlatego wszystkie pakiety w tym planie muszą wskazywać `curriculumId: pl-math-5-2026-classic`.

Źródła referencyjne:

- [Matematyka, szkoła podstawowa IV–VIII — podstawa klasyczna](https://zpe.gov.pl/podstawa-programowa/szkola-podstawowa/matematyka)
- [Harmonogram wdrażania podstawy od 1 września 2026 r.](https://www.gov.pl/web/edukacja/nowe-podstawy-programowe-wychowania-przedszkolnego-i-ksztalcenia-ogolnego-dla-szkoly-podstawowej-wraz-ze-zmianami-w-ramowych-planach-nauczania-dla-publicznych-szkol-podstawowych--rozporzadzenia-podpisane)
- [Rozporządzenie zmieniające z 28 czerwca 2024 r. — Dz.U. 2024 poz. 996](https://eli.gov.pl/eli/DU/2024/996/ogl/pol)

Nie wolno:

- oznaczać wymagań Reformy26 jako obowiązujących klasę V w roku 2026/2027;
- przypisywać aktywności rozszerzającej do wymagania, które jej nie obejmuje;
- oceniać w części bazowej umiejętności oznaczonej w planie jako opcjonalna lub rozszerzająca.

## 3. Protokół: zawsze nowy kontekst

Każda paczka `WP-S*` z dokumentów działowych jest wykonywana w osobnym, świeżym zadaniu Codex. Nie realizować kolejnej paczki przez kontynuowanie rozmowy po ukończeniu poprzedniej.

### 3.1. Jedna paczka = jeden nowy kontekst

W każdym nowym zadaniu wykonawca ma:

1. przeczytać `AGENTS.md`;
2. przeczytać odpowiedni dokument działowy w całości;
3. przeczytać wyłącznie sekcję wybranej paczki i wskazane w niej pliki;
4. przed zmianą kodu Next.js przeczytać właściwe przewodniki z `node_modules/next/dist/docs/`;
5. sprawdzić `git status --short` i zachować obce zmiany;
6. zrealizować dokładnie jedną paczkę, bez przebudowy sąsiednich tematów „przy okazji”;
7. uruchomić testy wskazane w paczce, następnie odpowiedni lint/typecheck/build;
8. zakończyć raportem: wynik, pliki, testy, decyzje, znane ograniczenia, następna paczka;
9. zamknąć zadanie. Następna paczka zaczyna się w nowym zadaniu.

Nowy kontekst nie oznacza utraty decyzji. Źródłem prawdy są pliki planu, kontrakty, testy i manifest recenzji, a nie pamięć poprzedniej rozmowy.

### 3.2. Szablon startowy nowego zadania

```text
Zrealizuj wyłącznie paczkę [WP-ID] z pliku [PLAN_DZIALU.md].

Zacznij od nowego kontekstu: przeczytaj AGENTS.md, cały wskazany plan działu,
sekcję [WP-ID], wymienione pliki repozytorium oraz właściwe przewodniki
Next.js z node_modules/next/dist/docs/. Nie realizuj następnej paczki.

Zachowaj wymagania wspólne: poprawna podstawa na pierwszym slajdzie,
ostatni slajd Ocena umiejętności, feedback diagnostyczny, dostępność,
wariant tabletowy i papierowy, deterministyczne generatory oraz brak klucza
odpowiedzi po stronie klienta przed oddaniem.

Po zmianach uruchom testy z paczki i zakończ raportem według planu.
```

### 3.3. Niedozwolony sposób pracy

- jeden kontekst dla całego działu;
- jeden kontekst dla działów 3, 4 i 5;
- równoległe edytowanie wspólnych plików przez kilka zadań;
- rozpoczęcie paczki tematycznej przed ukończeniem jej zależności fundamentowych;
- deklarowanie gotowości na podstawie samego wyglądu slajdu.

## 4. Wspólny kontrakt pierwszego slajdu

Pierwszy slajd każdego pakietu zachowuje istniejącą konwencję `slajd 0`. Jego tytuł techniczny to `Cele lekcji (slajd 0)`, ale widok ucznia ma być naturalny i pozbawiony technicznych oznaczeń.

Obowiązkowy układ:

1. metryka: `Matematyka · klasa V · dział [numer]`;
2. oficjalna, matematyczna nazwa tematu, zgodna z mapą w odpowiednim planie działowym; jeżeli obecny skrót w `sections.ts` jest inny, paczka aktualizuje oba miejsca zamiast utrzymywać dwie nazwy;
3. od jednego do czterech osobnych, numerowanych celów w pierwszej osobie, zaczynających się od `Nauczę się…`;
4. odpowiadające im, obserwowalne kryteria `Potrafię…`;
5. zwarty znacznik `Podstawa programowa — klasy IV–VI: [kody]`;
6. wymagania wstępne dostępne dla nauczyciela;
7. czas i numer pakietu `L1`, `L2` albo `L3`, jeżeli temat jest wielogodzinny.

Zasady nazewnictwa:

- na slajdzie 0 używać wyłącznie nazw matematycznych;
- nazwy fabularne, np. `Kuchnia proporcji`, `Zoo figur` lub `Sklep pomiarowy`, zaczynają się dopiero od kolejnego slajdu;
- nie używać na slajdzie 0 słów opisujących mechanikę gry zamiast treści matematycznej;
- cele i kryteria mają mówić o jednej sprawdzalnej czynności, nie o kilku umiejętnościach połączonych przecinkami;
- pełne brzmienie wymagania może być w panelu nauczyciela, natomiast na tablicy wystarczą kody.

Przykład:

```text
Matematyka · klasa V · dział 3
Dodawanie i odejmowanie ułamków o różnych mianownikach

1. Nauczę się sprowadzać ułamki do wspólnego mianownika.
2. Nauczę się dodawać i odejmować ułamki o różnych mianownikach.
3. Nauczę się skracać i sprawdzać otrzymany wynik.

Potrafię:
✓ zbudować wspólną miarę na modelu;
✓ poprawnie rozszerzyć oba ułamki;
✓ wykonać działanie i zapisać wynik w najprostszej postaci.

Podstawa programowa — klasy IV–VI: IV.4, V.1
```

## 5. Wspólny kontrakt ostatniego slajdu

Każdy pakiet, również powtórzenie i omówienie sprawdzianu, kończy się dokładnie jednym slajdem o technicznym tytule `Ocena umiejętności`. Nagłówek widoczny dla ucznia: `Ocena ucznia — co już potrafię?`.

Slajd łączy dwa źródła informacji:

- wynik ostatniej samodzielnej próby przypisany do konkretnych `skillIds`;
- samoocenę zrozumienia.

Widok ucznia zawiera:

- wynik zadania, np. `2/3 punkty`, bez porównywania z klasą;
- listę kryteriów z oznaczeniami: `opanowane`, `do poprawy`, `brak dowodu`;
- krótką, konkretną informację: co było poprawne, co poprawić i jaki jest następny krok;
- trzy tekstowo i ikoną oznaczone wybory samooceny: `Umiem samodzielnie`, `Potrzebuję jednej wskazówki`, `Potrzebuję wspólnego przykładu`;
- przycisk zapisania odpowiedzi i potwierdzenie zapisu.

Widok tablicy pokazuje wyłącznie anonimowy rozkład odpowiedzi. Nazwiska i indywidualne wyniki są widoczne tylko nauczycielowi. Slajd nie może tworzyć publicznego rankingu.

W trybie ćwiczenia uczeń może poprawić odpowiedź zgodnie z polityką prób. W trybie oceniania wynik jest zamrożony po oddaniu. Samoocena nigdy nie zmienia punktów.

## 6. Standard informacji zwrotnej

Każdy błąd ma kod diagnostyczny i sekwencję pomocy:

1. zaznaczenie miejsca wymagającego uwagi;
2. pytanie naprowadzające;
3. podpowiedź wizualna;
4. analogiczny przykład z innymi danymi;
5. rozwiązanie krok po kroku dopiero na żądanie lub po zakończeniu oceniania.

Wymagania wizualne:

- poprawny element: obrys + ikona `✓`, nie tylko zieleń;
- element do sprawdzenia: pulsujący lub grubszy obrys + etykieta, z możliwością wyłączenia ruchu;
- błędne skreślenie: czytelna przekątna i tekst, nie sama czerwień;
- pary elementów: ten sam wzór linii, symbol i kolor;
- po poprawie pokazać zmianę, a nie tylko komunikat `Dobrze`;
- komunikaty `Źle`, `Błąd` i `Spróbuj ponownie` nie mogą występować samodzielnie.

Każda paczka definiuje co najmniej:

- jeden błąd pojęciowy;
- jeden błąd rachunkowy lub konstrukcyjny;
- jeden błąd interfejsu, np. puste pole, brak jednostki albo niezatwierdzony wierzchołek;
- reakcję po pierwszej i drugiej próbie;
- warunek częściowego punktu i warunek ręcznej recenzji.

## 7. Standard interakcji i dostępności

- minimalny obszar dotyku: `44 × 44 px`, zalecany `52 × 52 px` dla cyfr i uchwytów;
- przeciąganie zawsze ma alternatywę `wybierz → umieść`, przyciski strzałek lub pola liczbowe;
- uchwyty nie mogą wymagać precyzyjnego trafienia;
- focus pozostaje widoczny po zmianie kroku;
- komunikat po odpowiedzi korzysta z `aria-live`, ale nie odczytuje całej planszy ponownie;
- SVG ma tytuł, opis i tekstową tabelę wartości aktualnego modelu;
- kolor nie jest jedynym nośnikiem znaczenia;
- animacje da się zatrzymać; `prefers-reduced-motion` zatrzymuje ozdobne ruchy i skraca animacje dydaktyczne do natychmiastowej zmiany stanu;
- slajd działa w `1920×1080`, `1366×768`, `1024×768`, na tablecie pionowym i poziomym oraz przy wysokim powiększeniu;
- każdy model zachowuje stan po chwilowym przerwaniu połączenia i wysyła odpowiedź ponownie w bezpieczny sposób.

## 8. Kolejność paczek

### Faza A — fundamenty wspólne

Każda paczka w osobnym kontekście:

1. `WP-CONTEXT-01` — walidacja danych slajdu 0, mapowania podstawy i wielocelowych `learningGoals`;
2. `WP-CONTEXT-02` — nowy standard końcowego slajdu `Ocena umiejętności`;
3. `WP-CONTEXT-03` — wspólna diagnostyka feedbacku, kody błędów i warstwy podświetleń;
4. `WP-CONTEXT-04` — wspólne zachowanie tablica/tablet/papier, offline i dostępność;
5. `WP-S3-F0` — inteligentny zapis ułamka i modele ułamkowe;
6. `WP-S4-F0` — laboratorium geometrii czasu rzeczywistego;
7. `WP-S4-A0` — lokalne ilustracje geometryczne i tło zadania `Zoo figur`;
8. `WP-S5-F0` — tabela pozycyjna i inteligentny zapis ułamka dziesiętnego.

#### `WP-CONTEXT-01` — kontrakt slajdu 0

- rozszerzyć walidację pakietu o wymagane `learningGoals`, osobne kryteria i niepuste `curriculumReferences`;
- zagwarantować, że pierwszy etap ma identyfikator `trace-0` i poprawny widok tablicy, ucznia oraz live;
- oddzielić matematyczny tytuł tematu od fabularnego `coreLesson`;
- pokazać kody podstawy na tablicy i pełne brzmienie w panelu nauczyciela;
- dodać test kontraktowy uruchamiany dla każdego opublikowanego pakietu działów 3–5.

#### `WP-CONTEXT-02` — kontrakt końcowej oceny

- ujednolicić końcowy etap `understanding` i tytuł `Ocena umiejętności`;
- połączyć wynik ostatniego dowodu uczenia, status kryteriów i samoocenę bez mieszania ich punktów;
- zachować prywatność wyniku ucznia oraz anonimowy widok klasy na tablicy;
- obsłużyć tryb live, samodzielną lekcję, papierowy wynik wpisany przez nauczyciela i powrót po utracie połączenia;
- dodać test, że etap jest zawsze ostatni i występuje dokładnie raz.

#### `WP-CONTEXT-03` — diagnostyczny feedback

- wprowadzić ustrukturyzowane `errorCodes`, `feedbackKey`, status częściowo poprawny i ręczną recenzję;
- umożliwić komponentom matematycznym wskazanie aktywnych pól, par, krawędzi albo wierzchołków;
- wdrożyć sekwencję pomocy od wskazania obszaru do rozwiązania na żądanie;
- zapewnić, że feedback nie ujawnia klucza przed oddaniem w trybie oceniania;
- dodać testy zabraniające samotnych komunikatów `Źle`, `Błąd` i `Spróbuj ponownie`.

#### `WP-CONTEXT-04` — kanały, offline i dostępność

- zdefiniować zachowanie wspólnego stanu dla tablicy, tabletu, live i pracy samodzielnej;
- dodać alternatywy dla przeciągania, gestów i precyzyjnego rysowania;
- zachować focus, komunikaty `aria-live`, opisy SVG, high contrast i reduced motion;
- zapisywać lokalny ślad pracy do czasu bezpiecznej synchronizacji bez wielokrotnego oddania;
- zweryfikować wymagane rozdzielczości, zoom, wydruk i chwilową utratę sieci.

### Faza B — tematy

Realizować po kolei paczki z dokumentów działowych:

- Dział 3: `WP-S3-01` do `WP-S3-11`;
- Dział 4: `WP-S4-01` do `WP-S4-13`;
- Dział 5: `WP-S5-01` do `WP-S5-13`.

Temat wielogodzinny obowiązkowo rozbić na `A`, `B` i, jeżeli potrzeba, `C`: `L1 = A`, `L2 = B`, `L3 = C`. Przykład: grupę `WP-S3-06` wykonać jako `WP-S3-06A`, potem zamknąć zadanie i uruchomić `WP-S3-06B` w nowym kontekście. Każda część kończy działającym pakietem, testami i raportem, nie atrapą.

### Faza C — synteza i ocenianie

- `WP-S3-R`, `WP-S3-S`;
- `WP-S4-R`, `WP-S4-S`;
- `WP-S5-R`, `WP-S5-S`.

### Faza D — bramki działów

- `WP-S3-QA`, `WP-S4-QA`, `WP-S5-QA` — każda w osobnym kontekście;
- `WP-S345-QA` — końcowy audyt integracyjny dopiero po przejściu trzech bramek działowych.

## 9. Obowiązkowy raport po paczce

```md
## Raport [WP-ID]

### Wynik
- Co działa i w jakich kanałach.

### Zmienione pliki
- Plik — cel zmiany.

### Podstawa i matematyka
- Kody wymagań.
- Sprawdzone niezmienniki i seedy.

### Feedback i dostępność
- Obsłużone kody błędów.
- Alternatywa dla gestów i reduced motion.

### Weryfikacja
- Test — wynik.
- Rozdzielczość/urządzenie — wynik kontroli.

### Decyzje i ograniczenia
- Decyzje utrwalone w kodzie/testach.
- Znane ograniczenia bez ukrywania ich jako „gotowe”.

### Następna paczka
- ID paczki, którą należy uruchomić w nowym zadaniu.
```

## 10. Bramka końcowa dla działów 3–5

Plan jest zrealizowany dopiero, gdy:

- każdy temat ma poprawny slajd 0 i końcową ocenę umiejętności;
- tematy wielogodzinne mają rzeczywiście różne pakiety `L1/L2/L3`;
- wszystkie modele reagują w czasie rzeczywistym, a nie podmieniają gotowych obrazków;
- ułamki są zapisywane w kratkach nad i pod kreską ułamkową;
- działania pokazują relacje między właściwymi polami za pomocą podświetleń i łączników;
- geometria aktualizuje miary i własności po każdym ruchu wierzchołka;
- zadania fabularne badają wskazaną matematykę i mają jednoznaczne dane;
- każdy gest ma alternatywę tabletową i klawiaturową;
- wersja cyfrowa, live i papierowa badają te same `skillIds`;
- generatory są deterministyczne, a klucz nie trafia do klienta przed oddaniem;
- sprawdziany A/B mają równą macierz umiejętności i punktów;
- zakończono recenzję matematyczną, dydaktyczną, językową i wizualną;
- przechodzą testy jednostkowe, komponentowe, E2E, dostępności, visual QA, lint, typecheck i build.
