# Dział 3 — Ułamki zwykłe: plan wykonawczy

- Status: w realizacji; `WP-S3-01A`, `WP-S3-01B` i `WP-S3-02` gotowe do testów produkcyjnych
- Wersja programu: `pl-math-5-2026-classic`
- Sekcja: `M5-S3`
- Planowany czas: 20–26 godzin
Zasada wykonania: każdą paczkę `WP-S3-*` uruchamiać w osobnym, nowym kontekście zgodnie z [protokołem nowych kontekstów](./PLAN_DZIALY_3_4_5_NOWE_KONTEKSTY.md).

## 1. Kontekst obowiązkowy w każdym nowym zadaniu

Wykonawca paczki ma przeczytać:

- `AGENTS.md`;
- ten dokument w całości;
- `LEKCJALAB_KLASA_5_MASTER_SPEC.md`, szczególnie sekcje 21–28, 50 i 69–73;
- `src/data/curriculum/pl-math-5-2026-classic/sections.ts`;
- `src/data/lessons/section3-wp-c3.ts`;
- `src/types/lessonPackage.ts`;
- istniejące komponenty odtwarzacza tablicy, ucznia i live używane przez zmieniany temat;
- właściwe przewodniki z `node_modules/next/dist/docs/` przed edycją kodu Next.js.

Nie wolno realizować dwóch paczek tematycznych w jednym kontekście. Zmiany we wspólnym fundamencie wykonuje wyłącznie `WP-S3-F0` albo osobna paczka naprawcza. Jeżeli temat ma `L1/L2/L3`, identyfikator bez litery jest grupą planistyczną, a wykonanie odbywa się osobno jako `A/B/C`, np. `WP-S3-01A` i w nowym kontekście `WP-S3-01B`.

## 2. Mapa podstawy programowej

Podstawa dla klas IV–VI używa wspólnego działu `IV. Ułamki zwykłe i dziesiętne` oraz `V. Działania na ułamkach zwykłych i dziesiętnych`.

| Temat | Nazwa na pierwszym slajdzie | Podstawa — klasy IV–VI |
|---|---|---|
| `M5-3.1` | Ułamki i liczby mieszane | IV.1, IV.5, IV.7 |
| `M5-3.2` | Ułamek jako iloraz | IV.2 |
| `M5-3.3` | Skracanie i rozszerzanie ułamków | IV.3 |
| `M5-3.4` | Porównywanie ułamków | IV.4, IV.12; V.3 jako strategia rozszerzająca |
| `M5-3.5` | Dodawanie i odejmowanie ułamków o jednakowych mianownikach | V.1 |
| `M5-3.6` | Dodawanie i odejmowanie ułamków o różnych mianownikach | IV.4, V.1 |
| `M5-3.7` | Mnożenie ułamka przez liczbę naturalną | V.1 |
| `M5-3.8` | Obliczanie ułamka liczby naturalnej | V.4 |
| `M5-3.9` | Mnożenie ułamków | V.1 |
| `M5-3.10` | Dzielenie ułamków przez liczby naturalne | V.1 |
| `M5-3.11` | Dzielenie ułamków | V.1 |
| `M5-3.R` | Powtórzenie wiadomości o ułamkach zwykłych | IV.1–5, IV.7, IV.12, V.1, V.4 w zakresie działu |
| `M5-3.S` | Sprawdzian — ułamki zwykłe | IV.1–5, IV.7, IV.12, V.1, V.4 w zakresie działu |

Każdy slajd 0 ma zawierać dokładne kody z tabeli. Pełne brzmienie wymagań przechowywać w `learningGoals[].curriculumReferences` i panelu nauczyciela.

## 3. Standard slajdów działu 3

### 3.1. Pierwszy slajd

Pierwszy etap ma identyfikator zakończony `trace-0`, techniczny tytuł `Cele lekcji (slajd 0)` i model otwierający zgodny ze wspólnym kontraktem. Pokazuje nazwę matematyczną, numerowane cele, kryteria sukcesu i kody podstawy. Nie pokazuje nazwy fabularnej.

### 3.2. Ostatni slajd

Ostatni etap ma identyfikator zakończony `understanding`, tytuł `Ocena umiejętności`, `live.kind: quick-check` i zawsze występuje po samodzielnym zadaniu diagnostycznym. Widok ucznia pokazuje dowód opanowania kryteriów oraz trzy poziomy samooceny. Samoocena nie zmienia punktów.

### 3.3. Format zapisu ułamka

W interaktywnych działaniach nie używać pola tekstowego z zapisem `3/4` jako głównego interfejsu. Ułamek ma wyglądać nowocześnie, ale zachować szkolną, pionową formę:

```text
┌───┐ ┌───┐
│ 1 │ │ 2 │   licznik — jedna kratka na cyfrę
└───┘ └───┘
───────────    kreska ułamkowa dopasowana do szerokości
┌───┐ ┌───┐
│ 2 │ │ 5 │   mianownik — jedna kratka na cyfrę
└───┘ └───┘
```

Wymagania:

- jedna kratka przechowuje jedną cyfrę;
- aktywna kratka ma wyraźny focus i etykietę `licznik, cyfra 1 z 2` albo `mianownik, cyfra 2 z 2`;
- strzałki przechodzą między kratkami, `Enter` zatwierdza, `Backspace` cofa bez gubienia focusu;
- kliknięcie klawiatury ekranowej wpisuje cyfrę do aktywnej kratki;
- liczba mieszana ma osobną kratkę części całkowitej po lewej, nigdy zapis `1 3/4` w jednym polu;
- komponent zwiększa liczbę kratek do ustalonego limitu i nie zmniejsza ich podczas wpisywania;
- mianownik `0` jest blokowany z wyjaśnieniem, ale wpis ucznia pozostaje widoczny do poprawy;
- pusty licznik lub mianownik nie jest normalizowany do zera;
- widok tekstowy dla czytnika ekranu podaje pełny ułamek i aktualny krok;
- w druku pozostawić duże kratki nad i pod kreską oraz miejsce na skreślenia i rozszerzenia.

### 3.4. Podświetlenia działań

- dodawanie o jednakowych mianownikach: najpierw wspólny obrys obu mianowników i etykieta `części tej samej wielkości`, potem łączniki między licznikami;
- różne mianowniki: kreskowane obrysy sygnalizują `jeszcze nie można łączyć`, a po rozszerzeniu oba mianowniki otrzymują wspólny symbol;
- skracanie: para dzielonych liczb jest połączona cienką linią; stara liczba zostaje czytelnie przekreślona, nowa pojawia się w małej kratce obok;
- mnożenie: najpierw opcjonalne skracanie po skosie, potem górne kratki łączą się w iloczyn licznika, a dolne w iloczyn mianownika;
- dzielenie: odwracany jest wyłącznie drugi ułamek; obrót ma etykietę `odwrotność dzielnika`, nie jest ozdobną animacją bez wyjaśnienia;
- nie używać jednego koloru dla kilku jednoczesnych par; każda para ma kolor, wzór linii i symbol.

### 3.5. Animacja pizzy i wody

Co najmniej dwa tematy używają modeli kontekstowych:

- `M5-3.5`: pizza podzielona na równe kawałki pokazuje dodawanie części tej samej wielkości;
- `M5-3.6`: dwie identyczne szklanki z podziałką pokazują zamianę `1/3` i `1/4` na `4/12` i `3/12`, a następnie przelanie do naczynia wynikowego `7/12`.

Woda jest animowana wyłącznie subtelną falą SVG o amplitudzie około 2–3 px i okresie 3–4 s. Po zmianie wartości poziom płynu przechodzi płynnie, ale nie chlupie i nie zasłania podziałki. Przycisk `Zatrzymaj ruch` oraz `prefers-reduced-motion` ustawiają nieruchomą taflę. Model zawsze ma tekstową alternatywę z objętościami.

## 4. `WP-S3-F0` — inteligentny zapis i modele ułamków

### Zakres

Zbudować albo rozszerzyć wspólne, wielokrotnego użytku modele zamiast osobnych kopii per temat:

1. `FractionStackInput` — kratki licznika/mianownika, część całkowita, klawiatura i semantyka;
2. `FractionBarModel` — paski z równymi częściami, nakładanie i wspólna oś;
3. `FractionCircleModel` — pizza/koło z jednoznacznym środkiem i równymi sektorami;
4. `FractionGlassModel` — szklanka z podziałką, falą wody i przelewaniem;
5. `FractionOperationDirector` — kroki, łączniki, podświetlenia, skreślenia i reset;
6. parser/normalizator ułamka, liczby mieszanej i odpowiedzi równoważnej;
7. wspólny kontrakt generatora z `seed`, publicznymi parametrami i serwerowym `answerSpec`.

### Niezmienniki

- mianownik jest dodatni i różny od zera;
- sektory koła i części paska są równe w granicy tolerancji renderowania;
- wartość modelu i zapis w kratkach są zawsze zgodne;
- zmiana reprezentacji nie zmienia wartości;
- niepoprawny lub niepełny wpis nie staje się poprawnym zerem;
- parser akceptuje zapis z odstępami i liczbę mieszaną, lecz zwraca ustrukturyzowany błąd dla dwuznacznego wejścia;
- w trybie oceniania klient nie otrzymuje postaci oczekiwanej odpowiedzi.

### Feedback bazowy

| Kod | Znaczenie | Pierwsza reakcja |
|---|---|---|
| `FRA_EMPTY_PART` | pusta część ułamka | Podświetl brakującą kratkę i nazwij część. |
| `FRA_ZERO_DENOMINATOR` | mianownik równy zero | Zachowaj wpis i pokaż: `Na zero części nie można podzielić całości.` |
| `FRA_NUM_DEN_SWAPPED` | zamieniono licznik z mianownikiem | Połącz model z etykietami `ile zaznaczono` i `na ile podzielono`. |
| `FRA_NOT_EQUIVALENT` | zmiana wartości przy rozszerzaniu/skracaniu | Podświetl oba mnożniki/dzielniki i zapytaj, czy są takie same. |
| `FRA_NOT_SIMPLIFIED` | poprawna wartość, ale nieskrócona postać | Przyznaj wartość zgodnie z rubryką i poproś o znalezienie wspólnego dzielnika. |
| `FRA_WRONG_OPERATION_PAIR` | połączono niewłaściwe kratki | Wygasz pozostałe pola i pokaż aktywną parę symbolem oraz linią. |

### Odbiór

- testy klawiatury, dotyku i czytnika ekranu;
- testy ułamków jedno- i dwucyfrowych oraz liczb mieszanych;
- testy `0`, pustych pól i równoważnych odpowiedzi;
- kontrola visual QA przy wysokim zoomie i reduced motion;
- dokumentacja API komponentów, bez zależności od jednego tematu.

## 5. `WP-S3-01` — Ułamki i liczby mieszane

Status: gotowe do testów produkcyjnych.
Podstawa: IV.1, IV.5, IV.7.
Pakiety: `L1` — część całości, część zbioru i oś; `L2` — rodzaje ułamków, model większy od całości, jednostki i zamiana na ułamek niewłaściwy.

### Slajd 0 — cele

1. Nauczę się opisywać część całości za pomocą ułamka.
2. Nauczę się rozpoznawać ułamki właściwe i niewłaściwe.
3. Nauczę się zamieniać ułamek niewłaściwy na liczbę mieszaną i odwrotnie.
4. Nauczę się zaznaczać ułamki na osi liczbowej.

### Slajdy `L1`

1. `Co mówi ułamek?` — uczeń zaznacza cztery z siedmiu równych części, a następnie zapisuje pionowo udział białych, czerwonych, zielonych i żółtych kółek w całym zbiorze.
2. `Podpisz ułamki na osi` — oś jest podzielona na osiem równych odcinków; uczeń wybiera punkty A, B i C oraz wpisuje ich wartości w kratkach nad i pod kreską.
3. `Ćwiczenia — 5 przykładów` — pięć oddzielnych kart z osobnym modelem, odpowiedzią i feedbackiem.
4. `Ocena umiejętności`.

### Slajdy `L2`

1. `Właściwy czy niewłaściwy?` — sześć pionowych zapisów, w tym ułamek równy jednej całości; uczeń klasyfikuje każdy przykład.
2. `Dwa zapisy pokolorowanych kół` — model siedmiu pokolorowanych ćwiartek; uczeń wpisuje ułamek niewłaściwy i liczbę mieszaną.
3. `Ułamek jednostki` — dwa zadania: 7 mm jako część 1 cm oraz 300 g jako część 1 kg.
4. `Liczba mieszana na ułamek niewłaściwy` — wyłącznie ten kierunek zamiany; obok graficzny ciąg: całości razy mianownik, dodać licznik, mianownik bez zmiany.
5. `Ćwiczenia — 5 przykładów` — klasyfikacja, model, jednostki i zamiana.
6. `Ocena umiejętności`.

### Feedback i testy

- pionowy zapis i wspólna klawiatura ekranowa są obowiązkowe w każdym polu odpowiedzi;
- `FRA_NUM_DEN_SWAPPED` wskazuje znaczenie licznika i mianownika;
- `FRA_MIXED_CONVERSION` podświetla pominiętą pełną całość albo resztę;
- walidacja obejmuje zaznaczenie części, wszystkie cztery kolory, trzy punkty osi, obie jednostki i oba równoważne zapisy modelu;
- tablica, tablet, Live, druk i końcowa ocena korzystają z jednego kontraktu umiejętności.

## 6. `WP-S3-02` — Ułamek jako iloraz

Status: gotowe do testów produkcyjnych.
Podstawa: IV.2.
Pakiet: `L1`.

### Slajd 0 — cele

1. Nauczę się przedstawiać iloraz liczb naturalnych jako ułamek.
2. Nauczę się przedstawiać ułamek jako iloraz liczb naturalnych.
3. Nauczę się wyjaśniać wynik dzielenia w sytuacji sprawiedliwego podziału.

### Slajdy

1. `Podziel koła na połówki` — uczeń wybiera trzy, pięć albo siedem kół. Przycisk przecina bezpośrednio istniejące koła; nie powstaje osobny rząd luźnych połówek.
2. `Przedstaw iloraz w postaci ułamka` — przykłady 1 : 7, 13 : 5 i 8 : 3 mają model obiektów i grup, a odpowiedź jest wpisywana nad i pod kreską.
3. `Całości jako ułamki` — dwie całe figury można przeciąć na 2, 4 albo 6 części każdą; rysunek i liczba wszystkich części aktualizują się natychmiast.
4. `Ułamek niewłaściwy na liczbę mieszaną` — model dziewięciu ćwiartek pokazuje dwie pełne całości i jedną pozostałą część; w tym temacie zamiana odbywa się tylko w tę stronę.
5. `Ćwiczenia — 5 przykładów` — dwa ilorazy, zapis całości oraz dwie zamiany na liczbę mieszaną.
6. `Ocena umiejętności`.

Feedback: mylenie kolejności liczb, nierówne części, błędna liczba części dwóch całości oraz niepełne grupowanie. Test sprawdza zapis i interpretację graficzną, nie tylko wartość liczbową.

## 7. `WP-S3-03` — Skracanie i rozszerzanie ułamków

Podstawa: IV.3.
Pakiety: `L1` — równoważność i rozszerzanie; `L2` — skracanie do postaci nieskracalnej.

### Slajd 0 — cele

1. Nauczę się rozszerzać ułamki przez tę samą liczbę.
2. Nauczę się skracać ułamki przez wspólny dzielnik.
3. Nauczę się rozpoznawać ułamki o tej samej wartości.
4. Nauczę się doprowadzać ułamek do postaci nieskracalnej.

### Slajdy kluczowe

1. `Ta sama część, gęstszy podział` — suwak dzieli każdy segment paska na 2, 3 albo 4 mniejsze części; pole zaznaczenia nie zmienia się.
2. `Rozszerzanie w kratkach` — licznik i mianownik są mnożone przez tę samą liczbę; dwa mnożniki mają identyczny symbol.
3. `Zwiń podział` — grupowanie sąsiednich części pokazuje skracanie bez zmiany powierzchni.
4. `Przekreśl i zapisz` — stary licznik/mianownik pozostaje widoczny jako przekreślony ślad, nowe wartości pojawiają się obok.
5. `Łańcuch równoważnych ułamków` — uczeń uzupełnia brakujące kratki i uzasadnia jeden krok.
6. `Laboratorium farb` — ta sama część ściany opisana różnymi podziałami.
7. `Ocena umiejętności`.

Feedback: inny mnożnik dla góry i dołu, dzielenie tylko jednej części, zatrzymanie przed postacią nieskracalną, niecałkowity „dzielnik”. Walidator akceptuje różne poprawne ścieżki i zapisuje końcową postać osobno od dowodu kroków.

## 8. `WP-S3-04` — Porównywanie ułamków

Podstawa: IV.4, IV.12; V.3 tylko jako strategia rozszerzająca.
Pakiety: `L1` — modele i wspólny mianownik; `L2` — dobór strategii.

### Slajd 0 — cele

1. Nauczę się porównywać ułamki na modelu i osi liczbowej.
2. Nauczę się porównywać ułamki przez wspólny mianownik lub licznik.
3. Nauczę się korzystać z odniesienia do `1/2` i `1`.
4. Nauczę się uzasadniać wybraną strategię.

### Slajdy kluczowe

1. `Nałóż paski` — oba paski zawsze mają tę samą długość całości; obrót i kolejność nie wpływają na wartość.
2. `Wspólna oś` — uczeń ustawia dwa punkty i przeciąga znak `<`, `=` albo `>` między ułamki.
3. `Która strategia jest najkrótsza?` — karty `wspólny mianownik`, `wspólny licznik`, `odniesienie do połowy`, `odniesienie do jedności`.
4. `Pułapka większego mianownika` — kontrprzykład `1/8` i `1/6` z modelem.
5. `Wyścig dronów` — odcinki trasy opisane ułamkami; uczeń porządkuje wyniki i uzasadnia.
6. `Samodzielna próba` — trzy ułamki, wymagana strategia i porządek.
7. `Ocena umiejętności`.

Nie wymagać metody różnicy w części bazowej. Feedback rozróżnia zły znak od poprawnej wartości z błędnym uzasadnieniem.

## 9. `WP-S3-05` — Dodawanie i odejmowanie o jednakowych mianownikach

Podstawa: V.1.
Pakiety: `L1` — ułamki właściwe; `L2` — liczby mieszane i odejmowanie z zamianą całości.

### Slajd 0 — cele

1. Nauczę się dodawać ułamki o jednakowych mianownikach.
2. Nauczę się odejmować ułamki o jednakowych mianownikach.
3. Nauczę się wykonywać te działania na liczbach mieszanych.
4. Nauczę się sprawdzać i upraszczać wynik.

### Slajdy kluczowe

1. `Pizza — łączymy takie same kawałki` — uczeń zaznacza `2/8`, następnie `3/8`; kawałki przesuwają się do wspólnego koła i tworzą `5/8`.
2. `Dlaczego mianownik się nie zmienia?` — obie dolne kratki mają wspólny obrys `ósme części`; łączniki biegną tylko między licznikami.
3. `Odejmij, odkładając kawałki` — uczeń fizycznie usuwa zaznaczone części, a zapis aktualizuje się bez ujawniania wyniku przed próbą.
4. `Zamień jedną całość` — przy `4 3/8 − 1 5/8` pełna pizza zostaje pocięta na osiem części i dopiero potem wykonywane jest odejmowanie.
5. `Piekarnia na festyn` — kolejne zamówienia wymagają dodawania, odejmowania i pełnej odpowiedzi.
6. `Samodzielna próba` — jedno działanie i jedno uzasadnienie słowne.
7. `Ocena umiejętności`.

Feedback:

- `FRA_DENOM_ADDED`: przekreślić błędny nowy mianownik i podświetlić niezmienioną wielkość części;
- `FRA_BORROW_WHOLE`: pokazać, którą całość można zamienić na części;
- `FRA_UNSIMPLIFIED_RESULT`: pozostawić wynik jako równoważny, ale zaznaczyć krok uproszczenia zgodnie z rubryką.

## 10. `WP-S3-06` — Dodawanie i odejmowanie o różnych mianownikach

Podstawa: IV.4, V.1.
Pakiety: `L1` — wspólna miara; `L2` — działania i liczby mieszane; opcjonalne `L3` — zadania wieloetapowe.

### Slajd 0 — cele

1. Nauczę się sprowadzać ułamki do wspólnego mianownika.
2. Nauczę się dodawać i odejmować ułamki o różnych mianownikach.
3. Nauczę się skracać wynik do najprostszej postaci.
4. Nauczę się sprawdzać, czy otrzymany wynik ma sens.

### Slajdy kluczowe

1. `Szklanki z wodą — różne podziałki` — identyczne naczynia pokazują `1/3` i `1/4`; uczeń próbuje przelać i odkrywa potrzebę wspólnej miary.
2. `Zmień podziałkę na dwunaste` — suwak zagęszcza podział bez zmiany poziomu wody: `1/3 = 4/12`, `1/4 = 3/12`.
3. `Przelej do naczynia wynikowego` — poziom rośnie do `7/12`; lekka fala reaguje na przelew, reduced motion pokazuje stan natychmiast.
4. `Algorytm w kratkach` — każdy krok jest osobnym wierszem: wybór wspólnego mianownika, rozszerzenie, działanie na licznikach, skrócenie.
5. `Odejmowanie na paskach` — przykład z nieoczywistym NWW, bez automatycznego używania iloczynu mianowników.
6. `Mikstura dla szklarni` — zadanie z objętością, wymagające dodawania i oceny, czy wynik przekracza całość.
7. `Napraw rozwiązanie` — uczeń wskazuje dokładny krok, w którym dodano mianowniki.
8. `Ocena umiejętności`.

Feedback rozróżnia: brak wspólnego mianownika, rozszerzenie tylko jednego ułamka, różne mnożniki w jednym ułamku, działanie na mianownikach, brak skrócenia i błąd w liczbie mieszanej.

## 11. `WP-S3-07` — Mnożenie ułamka przez liczbę naturalną

Podstawa: V.1.
Pakiety: `L1` — powtarzane porcje; `L2` — skracanie i zastosowania.

### Slajd 0 — cele

1. Nauczę się interpretować mnożenie ułamka przez liczbę naturalną jako powtarzanie porcji.
2. Nauczę się mnożyć licznik przez liczbę naturalną.
3. Nauczę się skracać wynik przed lub po mnożeniu.

### Slajdy kluczowe

1. `Ta sama porcja kilka razy` — oś i pasek pokazują trzy skoki po `2/5`.
2. `Połącz właściwe kratki` — liczba naturalna ma łącznik wyłącznie z licznikiem; mianownik jest opisany jako rozmiar części.
3. `Skróć, zanim policzysz` — dla dogodnych przykładów podświetlić parę liczba naturalna–mianownik i pokazać przekreślenie.
4. `Porcje karmy dla zwierząt` — wiele realistycznych porcji i jednostki.
5. `Dwie strategie` — dodawanie powtarzane oraz mnożenie; uczeń porównuje zapis.
6. `Ocena umiejętności`.

Testy muszą odróżnić mnożenie licznika od błędnego mnożenia licznika i mianownika, które nie zmienia wartości ułamka.

## 12. `WP-S3-08` — Obliczanie ułamka liczby naturalnej

Podstawa: V.4.
Pakiety: `L1` — model zbioru; `L2` — dobór kolejności i zadania praktyczne.

### Slajd 0 — cele

1. Nauczę się obliczać ułamek liczby naturalnej.
2. Nauczę się rozwiązywać zadanie przez dzielenie, a następnie mnożenie.
3. Nauczę się wybierać kolejność działań, która ułatwia obliczenia.
4. Nauczę się zapisywać odpowiedź z właściwą jednostką.

### Slajdy kluczowe

1. `Podziel, potem wybierz` — 24 obiekty trafiają do 3 równych grup, następnie wybierana jest 1 grupa.
2. `Wybierz kilka części` — `3/5 z 40`; podświetlić 5 grup i 3 wybrane grupy.
3. `Dwie drogi` — kafelki działań można ułożyć jako `40 : 5 × 3` albo `40 × 3 : 5`, jeśli wszystkie kroki są wykonalne i poprawne.
4. `Budżet wycieczki` — ułamek kwoty z realistycznymi danymi.
5. `Zaprojektuj własne zadanie` — uczeń wybiera liczbę i ułamek, generator sprawdza, czy wynik pasuje do wybranego poziomu.
6. `Ocena umiejętności`.

Feedback obejmuje podział przez licznik zamiast mianownika, wybór jednej części zamiast kilku, wynik większy od całości przy ułamku właściwym oraz brak jednostki.

## 13. `WP-S3-09` — Mnożenie ułamków

Podstawa: V.1.
Pakiety: `L1` — część części i model pola; `L2` — algorytm, skracanie po skosie i zastosowania.

### Slajd 0 — cele

1. Nauczę się interpretować mnożenie ułamków jako obliczanie części części.
2. Nauczę się mnożyć liczniki oraz mianowniki.
3. Nauczę się skracać ułamki przed lub po mnożeniu.
4. Nauczę się sprawdzać, czy wynik mnożenia jest rozsądny.

### Slajdy kluczowe

1. `Część części` — prostokąt zostaje zaznaczony pionowo jako `2/3`, a następnie poziomo jako `3/5`; część wspólna ma odrębny wzór, nie tylko kolor.
2. `Policz pola wspólne` — uczeń liczy zaznaczone komórki i wszystkie komórki, otrzymując iloczyn.
3. `Mnożymy górę z górą, dół z dołem` — animowane łączniki prowadzą od kratek liczników do licznika wyniku i analogicznie dla mianowników.
4. `Skracanie po skosie` — system podświetla parę licznik pierwszego–mianownik drugiego, potem licznik drugiego–mianownik pierwszego. Każda para ma osobny symbol. Stare cyfry są przekreślane, nowe wpisywane w małych kratkach.
5. `Nie skracaj przez dodawanie` — kontrprzykład pokazuje, że wolno skracać czynniki iloczynu, a nie składniki sumy.
6. `Ogród ziołowy` — część działki przeznaczona na zioła, a część tej części na miętę; model nie musi być prostokątem w oprawie, ale obliczenie korzysta z czytelnej siatki.
7. `Samodzielna próba` — iloczyn, wymagany ślad par skracanych i szacunek `< pierwszy czynnik` dla dwóch ułamków właściwych dodatnich.
8. `Ocena umiejętności`.

Feedback:

- `FRA_MULT_CROSS_PAIR`: wybrano dwie liczby z tej samej części ułamka;
- `FRA_MULT_ADDED`: uczeń dodał liczniki lub mianowniki;
- `FRA_ILLEGAL_CANCEL_SUM`: próba skracania składników zamiast czynników;
- `FRA_PRODUCT_MAGNITUDE`: wynik większy od obu dodatnich ułamków właściwych bez uzasadnienia.

Testy visual mają sprawdzić kolejno każdą przekątną, tryb bez animacji i dwucyfrowe kratki.

## 14. `WP-S3-10` — Dzielenie ułamków przez liczby naturalne

Podstawa: V.1.
Pakiety: `L1` — podział na grupy; `L2` — algorytm i kontrola mnożeniem.

### Slajd 0 — cele

1. Nauczę się dzielić ułamek przez liczbę naturalną na modelu.
2. Nauczę się zapisywać dzielenie jako mnożenie przez ułamek odwrotny.
3. Nauczę się skracać wynik i sprawdzać go mnożeniem.

### Slajdy kluczowe

1. `Podziel pasek na równe grupy` — `3/4 : 2`; uczeń rozdziela zaznaczoną część na dwa identyczne wyniki.
2. `Mniejsze części` — zagęszczenie podziału pokazuje, dlaczego mianownik może zostać pomnożony przez dzielnik.
3. `Drugi zapis` — liczba naturalna pojawia się jako `2/1`, a następnie jako odwrotność `1/2` z opisanym krokiem.
4. `Sprawdź wstecz` — wynik razy dzielnik odtwarza wartość początkową na tym samym pasku.
5. `Podział taśmy` — kontekst długości z jednostką i resztą interpretowaną jako część, nie reszta naturalna.
6. `Ocena umiejętności`.

Feedback obejmuje dzielenie licznika bez sprawdzenia podzielności, odwrócenie pierwszego ułamka oraz wynik większy od dzielnej przy dzieleniu przez naturalną większą od 1.

## 15. `WP-S3-11` — Dzielenie ułamków

Podstawa: V.1.
Pakiety: `L1` — model pomiarowy; `L2` — odwrotność dzielnika; `L3` — liczby mieszane i zadania.

### Slajd 0 — cele

1. Nauczę się interpretować dzielenie ułamków jako pytanie, ile razy jedna miara mieści się w drugiej.
2. Nauczę się zamieniać dzielenie przez ułamek na mnożenie przez jego odwrotność.
3. Nauczę się dzielić ułamki i liczby mieszane.
4. Nauczę się kontrolować wynik przez szacowanie i mnożenie.

### Slajdy kluczowe

1. `Ile miarek się mieści?` — na pasku długości `3/4 m` uczeń układa miarki `1/8 m` i otrzymuje 6.
2. `Pełne i częściowe miarki` — wynik może być ułamkiem; model nie wymusza liczby naturalnej.
3. `Odwracamy tylko dzielnik` — aktywny drugi ułamek wykonuje obrót, a pierwszy pozostaje nieruchomy i jest opisany `dzielna`.
4. `Połącz pary i skróć` — ponowne użycie podświetleń mnożenia, ale dopiero po jawnym kroku odwrotności.
5. `Liczby mieszane` — najpierw zamiana obu liczb na ułamki niewłaściwe w osobnym wierszu.
6. `Pracownia wstążek` — ile odcinków danej długości można wyciąć; realistyczny sens jednostki.
7. `Czy wynik ma sens?` — dzielenie przez liczbę mniejszą od 1 zwykle zwiększa wynik; uczeń wybiera przedział przed rachunkiem.
8. `Ocena umiejętności`.

Feedback obejmuje odwrócenie dzielnej, odwrócenie obu ułamków, brak zamiany liczby mieszanej, błędną interpretację jednostki i brak kontroli wyniku.

## 16. `WP-S3-R` — Powtórzenie: Kuchnia proporcji

Podstawa: wszystkie kody działu w zakresie zrealizowanych tematów.
Pakiet: 45 minut, co najmniej pięć stacji.

### Slajdy

1. slajd 0 z listą głównych umiejętności, bez fabularnego tytułu w nagłówku głównym;
2. `Magazyn składników` — reprezentacje i porównywanie;
3. `Przelicz porcje` — ułamek liczby i mnożenie przez naturalną;
4. `Połącz płyny` — dodawanie/odejmowanie z wyborem wspólnej miary;
5. `Część porcji` — mnożenie ułamków i skracanie po skosie;
6. `Ile miarek?` — dzielenie ułamków;
7. `Napraw przepis` — uczeń wskazuje typ błędu w gotowym rozwiązaniu;
8. `Projekt przepisu` — zadanie wieloetapowe z dwiema poprawnymi strategiami;
9. `Ocena umiejętności` — wynik rozbity na główne `skillIds`, nie tylko suma punktów.

Powtórzenie nie wprowadza nowej reguły. Każda stacja ma wariant bez urządzenia i dokładnie określone dowody uczenia.

## 17. `WP-S3-S` — Sprawdzian i omówienie

### Blueprint

- wersje A/B równoważne pod względem umiejętności, punktów, liczby kroków i obciążenia rachunkowego;
- 20–25% reprezentacje, równoważność i porównywanie;
- 40–45% działania;
- 20–25% zadania praktyczne i ułamek liczby;
- 10–15% uzasadnienie, kontrola wyniku albo naprawa błędu;
- odpowiedzi równoważne akceptowane tylko zgodnie z poleceniem;
- postać nieskracalna punktowana osobno, jeżeli jest wymagana;
- pełny klucz i rubryka pozostają po stronie serwera do chwili publikacji.

### Slajdy omówienia

1. slajd 0 `Omówienie sprawdzianu — ułamki zwykłe` z kryteriami;
2. anonimowa mapa typów błędów;
3. naprawa błędu `dodano mianowniki` na paskach i szklankach;
4. naprawa błędu skracania po skosie;
5. porównanie dwóch równoważnych strategii;
6. indywidualna poprawa jednego zadania z innymi danymi;
7. `Ocena umiejętności` — wynik per umiejętność, samoocena i wskazany następny krok.

## 18. `WP-S3-QA` — bramka działu 3

### Testy wymagane

- unit: parser, równoważność, skracanie, liczby mieszane, generatory i niezmienniki;
- component: kratki, klawiatura, focus, podświetlenia, skreślenia, zatrzymanie animacji;
- integration: zapis prób, feedback codes, wynik per `skillId`, ostatni slajd;
- E2E: nauczyciel uruchamia temat, uczeń odpowiada, traci połączenie, wraca i zapisuje ocenę;
- visual: wszystkie slajdy w wymaganych rozdzielczościach, dwucyfrowe ułamki i liczby mieszane;
- print: A4 uczeń, wersja B i klucz;
- accessibility: klawiatura, czytnik ekranu, `aria-live`, reduced motion, wysoki zoom;
- security: brak `answerSpec` i klucza w danych klienta przed oddaniem.

### Ręczna recenzja matematyczna

- co najmniej 20 seedów na generator i wszystkie seedy graniczne;
- zgodność pola pizzy, pasków i poziomu wody z wartością ułamka;
- poprawność wszystkich par skracania po skosie;
- brak dzielenia przez zero i błędnych całości porównawczych;
- poprawne jednostki i realistyczne dane zadań;
- oznaczenie każdej treści rozszerzającej poza podstawę.

### Warunek zakończenia

Dział nie jest gotowy, jeżeli choć jeden temat ma generyczny slajd zamiast działającego modelu, kończy się bez `Oceny umiejętności`, nie ma alternatywy dla przeciągania albo pokazuje tylko komunikat `Źle` bez diagnozy.
