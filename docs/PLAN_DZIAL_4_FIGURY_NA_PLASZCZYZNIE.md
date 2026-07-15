# Dział 4 — Figury na płaszczyźnie: plan wykonawczy

- Status: w toku
- Wersja programu: `pl-math-5-2026-classic`
- Sekcja: `M5-S4`
- Planowany czas: 19–25 godzin
Zasada wykonania: każdą paczkę `WP-S4-*` uruchamiać w osobnym, nowym kontekście zgodnie z [protokołem nowych kontekstów](./PLAN_DZIALY_3_4_5_NOWE_KONTEKSTY.md).

Stan wdrożenia 2026-07-15: `WP-S4-06`, `WP-S4-07` i `WP-S4-08` mają gotowe pakiety `L1/L2`, deterministyczne modele, pięciozadaniowe slajdy dowodowe i końcową ocenę ucznia. `WP-S4-08` obejmuje dynamiczną sumę 180°, brakujący kąt, trójkąt równoramienny i feedback rozdzielający rachunek od uzasadnienia. Pozostałe szkielety od `WP-S4-09` wzwyż wymagają kolejnych osobnych kontekstów wdrożeniowych.

## 1. Kontekst obowiązkowy w każdym nowym zadaniu

Wykonawca paczki ma przeczytać:

- `AGENTS.md`;
- ten dokument w całości;
- `LEKCJALAB_KLASA_5_MASTER_SPEC.md`, szczególnie sekcje 21–28, 51 i 69–73;
- `src/data/curriculum/pl-math-5-2026-classic/sections.ts`;
- `src/data/lessons/section4-wp-c4.ts`;
- `src/types/lessonPackage.ts`;
- używane przez temat komponenty tablicy, ucznia, live, druku i zapisu wyników;
- właściwe przewodniki z `node_modules/next/dist/docs/` przed edycją kodu Next.js.

Każdy temat ma być osobnym pakietem roboczym. Nie kopiować silnika geometrii do pliku pojedynczej lekcji. Wspólne zmiany należą do `WP-S4-F0`, a ilustracje do `WP-S4-A0`. Jeżeli temat ma `L1/L2`, identyfikator bez litery jest grupą, a implementację wykonać w osobnych nowych kontekstach jako `A/B`, np. `WP-S4-03A` oraz `WP-S4-03B`.

## 2. Mapa podstawy programowej

| Temat | Nazwa na pierwszym slajdzie | Podstawa — klasy IV–VI |
|---|---|---|
| `M5-4.1` | Proste prostopadłe i równoległe | VII.2, VII.3 |
| `M5-4.2` | Kąty i ich rodzaje | VIII.1, VIII.4, VIII.5 |
| `M5-4.3` | Mierzenie i rysowanie kątów | VIII.2, VIII.3 |
| `M5-4.4` | Kąty przyległe i wierzchołkowe | VIII.6, XI.1 |
| `M5-4.5` | Wielokąty | przygotowanie pojęciowe do IX.1–5; XI.2, jeżeli pojawia się obwód |
| `M5-4.6` | Rodzaje trójkątów | IX.1 |
| `M5-4.7` | Konstrukcja trójkąta o danych bokach | IX.2 |
| `M5-4.8` | Miary kątów w trójkątach | IX.3, IX.8, XI.1 |
| `M5-4.9` | Prostokąty i kwadraty | IX.4, IX.5 |
| `M5-4.10` | Równoległoboki i romby | IX.4, IX.5 |
| `M5-4.11` | Trapezy | IX.4, IX.5; XI.1 dla obliczeń kątowych |
| `M5-4.12` | Czworokąty — podsumowanie | IX.4, IX.5 |
| `M5-4.13` | Oś symetrii | IX.5 w części bazowej |
| `M5-4.R` | Powtórzenie wiadomości o figurach na płaszczyźnie | VII.2–3, VIII.1–6, IX.1–5, IX.8, XI.1 w zakresie działu |
| `M5-4.S` | Sprawdzian — figury na płaszczyźnie | VII.2–3, VIII.1–6, IX.1–5, IX.8, XI.1 w zakresie działu |

Uwagi:

- uzupełnianie figury do osiowosymetrycznej jest wartościowym ćwiczeniem, lecz klasyczna podstawa dla klas IV–VI w IX.5 wymaga przede wszystkim rozpoznawania figur osiowosymetrycznych i wskazywania osi; trudniejsze konstrukcje oznaczać jako rozszerzenie i nie włączać automatycznie do oceny bazowej;
- pola figur są rdzeniem działu 6, nie działu 4. W zadaniu `Zoo figur` licznik zajętych kratek może wspierać obserwację, ale obliczanie pola nie może decydować o wyniku bazowym działu 4;
- procent zajętej przestrzeni jest aktywny tylko jako zadanie zintegrowane, gdy nauczyciel włączył `M5-5.13` albo potwierdził wymaganie wstępne.

## 3. Standard slajdów działu 4

### 3.1. Pierwszy i ostatni slajd

Każdy pakiet zaczyna `Cele lekcji (slajd 0)` z nazwą matematyczną, osobnymi celami, kryteriami i kodami podstawy. Nazwa fabularna zaczyna się od slajdu 1.

Każdy pakiet kończy etap `understanding` o tytule `Ocena umiejętności`. Przed nim występuje samodzielny rysunek, pomiar, klasyfikacja albo uzasadnienie. Ostatni slajd pokazuje wynik per `skillId`, kryteria, feedback i samoocenę. Publiczna tablica pokazuje tylko dane anonimowe.

### 3.2. Nazewnictwo i oznaczenia figur

- punkty nazywać wielkimi literami, np. `A`, `B`, `C`, zgodnie z kolejnością obiegu figury;
- odcinek nazywać `AB`, jego długość `|AB|`; w prostych zadaniach dopuszczalny opis `bok AB ma 5 cm`;
- proste nazywać małymi literami `a`, `b`, `c` i stosować symbole `a ∥ b`, `a ⟂ b`;
- kąt o wierzchołku `B` zapisywać `∠ABC`, a przy braku niejednoznaczności dopuszczać `∠B`;
- każdy łuk kąta ma etykietę lub symbol pary, nie tylko kolor;
- boki równe oznaczać jednakowymi kreskami, proste równoległe jednakowymi grotami, kąt prosty kwadratem;
- miary aktualizować w czasie rzeczywistym, ale nie zasłaniać nimi figury;
- pole `cm²` i procent pokrycia pokazywać tylko w zadaniach, które jawnie wymagają tych pojęć;
- jednostki mają wynikać ze skali zadania. Siatka bez podanej jednostki nie może udawać centymetrów.

### 3.3. Zasada czasu rzeczywistego

Zmiana parametru, przesunięcie uchwytu albo wierzchołka musi w tej samej klatce interakcji zaktualizować:

- położenie figury;
- etykiety wierzchołków i boków;
- długości, kąty i inne włączone miary;
- symbole własności;
- klasyfikację figury;
- tekstową tabelę aktualnego stanu;
- stan spełnienia warunków zadania.

Nie wolno podmieniać figury na jeden z kilku gotowych obrazków. Model ma wynikać ze współrzędnych i ograniczeń geometrycznych.

## 4. `WP-S4-F0` — laboratorium geometrii w czasie rzeczywistym

### Zakres

Zbudować wspólny model SVG/canvas z serializowalnym stanem, preferencyjnie SVG ze względu na dostępność i ostrość na tablicy:

1. siatka z konfigurowalnym krokiem i przyciąganiem;
2. punkty, proste, półproste, odcinki i uchwyty;
3. kąty, łuki, kątomierz oraz etykiety;
4. edytor wielokątów z 3–8 wierzchołkami;
5. ograniczenia: równość boków, równoległość, prostopadłość, stały promień i symetria;
6. warstwę obliczeń długości, kątów, równoległości, prostopadłości, przecięć i klasyfikacji;
7. historię `cofnij/ponów/reset`;
8. tryby `demo`, `guided`, `practice`, `assessment`;
9. alternatywę dla gestów: wybór wierzchołka, strzałki, pola współrzędnych albo długości i przycisk `Umieść`;
10. eksport bieżącego modelu do wersji drukowalnej bez interaktywnych uchwytów.

### Reguły obliczeń

- obliczenia korzystają z wartości dokładnych lub kontrolowanej tolerancji, nie z zaokrąglonego tekstu ekranu;
- kąty ekranu i kąty matematyczne mają spójny kierunek i zakres;
- prostopadłość i równoległość mają jawny próg tolerancji tylko w swobodnym rysowaniu; konstrukcja na siatce używa relacji dokładnych;
- wierzchołki nie mogą zlewać się bez komunikatu;
- wielokąt samoprzecinający nie jest automatycznie klasyfikowany jako zwykły wielokąt w zadaniu bazowym;
- dla figury zdegenerowanej wynik ma stan `invalid`, a nie fałszywe długości i kąty;
- kolejność wierzchołków i orientacja figury nie zmieniają klasyfikacji;
- skalowanie widoku nie zmienia wartości matematycznych.

### Diagnostyka bazowa

| Kod | Znaczenie | Reakcja |
|---|---|---|
| `GEO_DEGENERATE` | wierzchołki zlały się albo figura ma zerowy wymiar | Zaznacz punkty symbolem ostrzegawczym i zaproponuj ich rozdzielenie. |
| `GEO_SELF_INTERSECTION` | boki przecinają się w niedozwolony sposób | Pokaż miejsce przecięcia i nazwij dwa przecinające się boki. |
| `GEO_NOT_PARALLEL` | wymagana para nie jest równoległa | Oznacz parę identycznymi grotami i pokaż różnicę kierunków. |
| `GEO_NOT_PERPENDICULAR` | kąt nie jest prosty | Pokaż kwadrat kąta prostego jako cel i aktualną miarę. |
| `GEO_WRONG_VERTEX` | poruszono niewłaściwy wierzchołek | Zachowaj stan, podświetl właściwy uchwyt literą i obrysem. |
| `ANGLE_CENTER_MISALIGNED` | środek kątomierza poza wierzchołkiem | Połącz środek z wierzchołkiem krótką linią naprowadzającą. |
| `ANGLE_WRONG_SCALE` | odczytano drugą skalę | Podświetl ramię początkowe i zero właściwej skali. |
| `TRIANGLE_INEQUALITY` | boki nie tworzą trójkąta | Pokaż dwa krótsze odcinki ułożone wzdłuż najdłuższego. |
| `GEO_CLASSIFICATION_EVIDENCE` | dobra nazwa bez dowodu wymaganej cechy | Przyznaj część punktu i poproś o wskazanie boków/kątów. |

### Odbiór

- 60 klatek/s na typowym szkolnym laptopie dla jednej figury i płynne działanie na tablecie;
- brak przeskoków etykiet poza planszę;
- pełna obsługa klawiatury i reduced motion;
- testy własności dla figur obróconych, odbitych i nietypowych;
- testy serializacji stanu, odtworzenia i zgodności wydruku;
- ręczna kontrola dokładności co najmniej 20 konfiguracji granicznych.

## 5. `WP-S4-A0` — pakiet ilustracji i tło `Zoo figur`

W osobnym kontekście przygotować lokalne, autorskie ilustracje. Do generowania bitmapowego tła użyć procesu imagegen, a figury, siatkę, pomiary i interakcje pozostawić jako ostre SVG generowane przez aplikację.

### Tło zoo

- widok lekko izometryczny albo z góry, ale bez perspektywy zaburzającej siatkę;
- puste alejki, niewielki staw, roślinność, wejście i cztery czytelne strefy;
- bez gotowych ogrodzeń wyznaczających odpowiedź;
- spokojne kolory i pusta przestrzeń w centrum;
- rozdzielczość źródłowa co najmniej 1600×900, lokalny WebP/AVIF;
- osobne lokalne ilustracje zwierząt z przezroczystym tłem;
- półprzezroczysta warstwa pod siatką zapewniająca kontrast;
- alternatywny, prosty widok bez tła do high contrast i druku;
- tekst alternatywny opisuje układ, ale nie zdradza rozwiązania.

### Inne motywy

- warsztat witraży;
- plac zabaw o nieregularnym obrysie;
- skrzyżowanie ulic i tory tramwajowe;
- namiot/most kratownicowy;
- pracownia architektoniczna.

Nie umieszczać tekstu matematycznego wewnątrz bitmapy. Wszystkie etykiety są warstwą HTML/SVG i skalują się niezależnie.

## 6. `WP-S4-01` — Proste prostopadłe i równoległe

Podstawa: VII.2, VII.3.
Pakiety: `L1` — rozpoznawanie; `L2` — konstrukcje.

### Slajd 0 — cele

1. Nauczę się rozpoznawać proste i odcinki równoległe.
2. Nauczę się rozpoznawać proste i odcinki prostopadłe.
3. Nauczę się rysować pary prostych równoległych i prostopadłych.
4. Nauczę się używać symboli `∥` i `⟂`.

### Slajdy kluczowe

1. `Miasto linii` — uczeń obraca i przesuwa drogę; klasyfikacja aktualizuje się w czasie rzeczywistym, a przecięcie pod kątem prostym ma symbol kwadratu.
2. `Nie ufaj położeniu` — przykłady ukośne, pionowe i poziome; wygląd prototypowy nie decyduje o relacji.
3. `Ekierka ekranowa` — przeciągnięcie ekierki do punktu i konstrukcja prostej prostopadłej.
4. `Przesuń bez obracania` — konstrukcja równoległej z widocznym śladem przesunięcia.
5. `Tory i alejki` — zaprojektuj odcinki spełniające trzy warunki, z etykietami `a`, `b`, `c`.
6. `Samodzielna konstrukcja`.
7. `Ocena umiejętności`.

Feedback rozróżnia przecięcie dowolne, prostopadłość, równoległość i odcinki współliniowe. Kolor ma zawsze towarzyszący symbol.

## 7. `WP-S4-02` — Kąty i ich rodzaje

Podstawa: VIII.1, VIII.4, VIII.5.
Pakiet: `L1`.

### Slajd 0 — cele

1. Nauczę się wskazywać wierzchołek i ramiona kąta.
2. Nauczę się rozpoznawać kąty ostre, proste i rozwarte.
3. Nauczę się porównywać kąty bez sugerowania się długością ramion.

### Slajdy

1. `Rozchyl ramiona` — jeden uchwyt obraca ramię wokół stałego wierzchołka; nazwa kąta pojawia się dopiero po przewidywaniu ucznia.
2. `Co tworzy kąt?` — uczeń przeciąga etykiety `wierzchołek`, `ramię` i łuk w odpowiednie miejsca.
3. `Długie ramię nie znaczy większy kąt` — dwa kąty o tej samej mierze i różnych długościach ramion nakładają się.
4. `Bramki 90° i 180°` — klasyfikacja przy wartościach granicznych; kąt półpełny jako kontekst porządkujący, bez zastępowania wymagań bazowych.
5. `Reflektory sceniczne` — ustaw właściwy rodzaj kąta w trzech sytuacjach.
6. `Ocena umiejętności`.

Testy obejmują dokładnie 90°, wartości bliskie 90°, obrót całej figury i zmianę długości ramion.

## 8. `WP-S4-03` — Mierzenie i rysowanie kątów

Podstawa: VIII.2, VIII.3.
Pakiety: `L1` — pomiar; `L2` — rysowanie.

### Slajd 0 — cele

1. Nauczę się prawidłowo ustawiać kątomierz.
2. Nauczę się mierzyć kąty z dokładnością do `1°`.
3. Nauczę się rysować kąty o podanej mierze.
4. Nauczę się wybierać właściwą skalę kątomierza.

### Slajdy kluczowe

1. `Kątomierz ekranowy` — uczeń przeciąga środek na wierzchołek i obraca linię bazową; wskaźnik gotowości wymaga obu warunków.
2. `Które zero?` — podświetla się ramię początkowe i właściwa skala; druga skala pozostaje widoczna jako kontrprzykład.
3. `Zmierz serię` — trzy kąty w nietypowych orientacjach, bez automatycznego ustawiania narzędzia.
4. `Narysuj 65°` — najpierw promień bazowy, potem znacznik miary, następnie drugie ramię.
5. `Kontrola koleżeńska` — uczeń rysuje, drugi mierzy; system zapisuje różnicę do 1° bez publicznego nazwiska.
6. `Ocena umiejętności`.

Alternatywa klawiaturowa pozwala wybrać narzędzie i przesuwać/obracać je krokami `1 px`, `5 px`, `1°`, `5°`.

## 9. `WP-S4-04` — Kąty przyległe i wierzchołkowe

Podstawa: VIII.6, XI.1.
Pakiety: `L1` — własności; `L2` — obliczenia i trzy proste.

### Slajd 0 — cele

1. Nauczę się rozpoznawać kąty przyległe i wierzchołkowe.
2. Nauczę się korzystać z równości kątów wierzchołkowych.
3. Nauczę się korzystać z sumy `180°` kątów przyległych.
4. Nauczę się obliczać brakujące miary kątów z uzasadnieniem.

### Slajdy kluczowe

1. `Skrzyżowanie prostych` — przeciągnięcie ramienia zmienia cztery miary; pary wierzchołkowe mają identyczny symbol i wartość.
2. `Pary, nie kolory` — uczeń łączy kąty w pary wierzchołkowe i przyległe, używając symboli `●`, `▲` i wzorów łuku.
3. `Jeden kąt wystarcza` — odsłanianie pozostałych miar dopiero po wskazaniu własności.
4. `Trzy proste` — więcej niż cztery kąty, etapowe wygaszanie nieaktywnych par.
5. `Rondo tramwajowe` — obliczenia z pełnym uzasadnieniem `bo kąty…`.
6. `Napraw błędne oznaczenie`.
7. `Ocena umiejętności`.

Feedback odróżnia dobry wynik z niewłaściwą własnością od błędu rachunkowego. W ocenie przewidzieć osobny punkt za uzasadnienie.

## 10. `WP-S4-05` — Wielokąty

Podstawa: przygotowanie do IX.1–5; XI.2 tylko w zadaniu z obwodem.
Pakiet: `L1`.

### Slajd 0 — cele

1. Nauczę się rozpoznawać wielokąty.
2. Nauczę się wskazywać wierzchołki, boki i przekątne wielokąta.
3. Nauczę się nazywać wielokąt według liczby boków.
4. Nauczę się tworzyć przykład i kontrprzykład wielokąta.

### Slajdy

1. `Budowniczy wielokątów` — uczeń dodaje wierzchołki na siatce; figura zamyka się dopiero po wybraniu pierwszego punktu.
2. `Czy to wielokąt?` — linia otwarta, łuk, figura samoprzecinająca i poprawne figury; system podświetla konkretny warunek.
3. `Nazwij elementy` — automatyczne etykiety `A–H`, boki i przekątne; uczeń wybiera jedną przekątną z danego wierzchołka.
4. `Zmieniaj kształt` — przeciąganie wierzchołków nie zmienia liczby boków, dopóki figura pozostaje poprawna.
5. `Witraż bez prostokątów` — budowa pięciokąta i sześciokąta w ilustracyjnym tle.
6. `Ocena umiejętności`.

Nie oceniać formalnej definicji wypukłości, jeśli nie została włączona jako rozszerzenie.

## 11. `WP-S4-06` — Rodzaje trójkątów

Podstawa: IX.1.
Pakiety: `L1` — klasyfikacja według boków; `L2` — według kątów i obie klasyfikacje naraz.

### Slajd 0 — cele

1. Nauczę się klasyfikować trójkąty według długości boków.
2. Nauczę się klasyfikować trójkąty według miar kątów.
3. Nauczę się podawać obie klasyfikacje tego samego trójkąta.
4. Nauczę się uzasadniać klasyfikację za pomocą cech figury.

### Slajdy kluczowe

1. `Trójkątny plac zabaw` — przesunięcie wierzchołka po siatce na bieżąco zmienia długości, kąty i dwie niezależne etykiety klasyfikacji.
2. `Najpierw przewiduj` — etykiety są ukryte, dopóki uczeń nie wybierze obu nazw.
3. `Równe boki` — symbole kresek na bokach i tekstowa tabela długości.
4. `Największy kąt` — łuki i miary, przykłady obrócone i smukłe.
5. `Czy może istnieć?` — zestaw par nazw, np. `równoboczny i rozwartokątny`; uczeń buduje przykład albo podaje powód niemożliwości.
6. `Namiot ekspedycji` — dopasowanie trójkąta do warunków konstrukcyjnych.
7. `Ocena umiejętności`.

Klasyfikacja ma być stabilna przy obrocie i odbiciu. Tolerancja równości boków w trybie swobodnym musi być jawna i nie może zmieniać się między próbami.

## 12. `WP-S4-07` — Konstrukcja trójkąta o danych bokach

Status: gotowe do QA produkcyjnego — pakiety `L1/L2`, model czasu rzeczywistego, pięć osobnych zadań w slajdzie dowodowym, wersja papierowa i końcowa ocena ucznia.

Podstawa: IX.2.
Pakiety: `L1` — możliwość konstrukcji; `L2` — konstrukcja linijką i cyrklem.

### Slajd 0 — cele

1. Nauczę się sprawdzać, czy z trzech odcinków można zbudować trójkąt.
2. Nauczę się konstruować trójkąt o danych bokach.
3. Nauczę się opisywać kolejne kroki konstrukcji.

### Slajdy kluczowe

1. `Złóż trzy odcinki` — końce odcinków przyciągają się; przy braku domknięcia różnica jest widoczna i opisana.
2. `Dwa krótsze kontra najdłuższy` — odcinki układane na jednej prostej pokazują nierówność trójkąta bez symbolicznego skrótu na początku.
3. `Dwa okręgi możliwości` — promienie są bokami, przecięcia wyznaczają dwa możliwe położenia wierzchołka.
4. `Konstrukcja krok po kroku` — podstawa, pierwszy łuk, drugi łuk, punkt przecięcia, boki i oznaczenia.
5. `Most linowy` — wybór długości spełniających warunek i konstrukcja.
6. `Samodzielna konstrukcja`.
7. `Ocena umiejętności`.

Feedback nie podaje od razu nierówności. Najpierw pokazuje fizyczny brak domknięcia, potem pytanie o sumę dwóch krótszych boków.

## 13. `WP-S4-08` — Miary kątów w trójkątach

Podstawa: IX.3, IX.8, XI.1.
Pakiety: `L1` — suma 180°; `L2` — trójkąty równoramienne i zadania.

### Slajd 0 — cele

1. Nauczę się korzystać z sumy `180°` kątów wewnętrznych trójkąta.
2. Nauczę się obliczać brakujący kąt trójkąta.
3. Nauczę się korzystać z własności kątów w trójkącie równoramiennym.
4. Nauczę się zapisywać uzasadnienie obliczenia.

### Slajdy kluczowe

1. `Rozerwij i złóż 180°` — trzy narożniki trójkąta przesuwają się przy prostej; każdy ma trwałą etykietę wierzchołka.
2. `Przeciągnij wierzchołek` — miary zmieniają się, suma w liczniku pozostaje `180°` i jest wyprowadzona z aktualnych danych.
3. `Brakujący kąt` — uczeń najpierw zaznacza dwa znane kąty, potem układa działanie.
4. `Równe boki, równe kąty` — symbole boków prowadzą do odpowiednich kątów przy podstawie.
5. `Dach pawilonu` — figura w nietypowej orientacji i zadanie wieloetapowe.
6. `Napraw uzasadnienie`.
7. `Ocena umiejętności`.

Nie pokazywać sumy za ucznia przed pierwszą próbą. Przy dobrym wyniku bez uzasadnienia przyznać punkt rachunkowy i poprosić o nazwę własności.

## 14. `WP-S4-09` — Prostokąty i kwadraty

Podstawa: IX.4, IX.5.
Pakiety: `L1` — własności; `L2` — relacja kwadrat–prostokąt i konstrukcje.

### Slajd 0 — cele

1. Nauczę się rozpoznawać prostokąty i kwadraty w różnych położeniach.
2. Nauczę się opisywać ich boki, kąty i przekątne.
3. Nauczę się wyjaśniać, dlaczego każdy kwadrat jest prostokątem.
4. Nauczę się budować figurę spełniającą podane warunki.

### Slajdy kluczowe

1. `Laboratorium własności` — uczeń przeciąga wierzchołek prostokąta po siatce; ograniczenia utrzymują kąty proste, a długości zmieniają się real time.
2. `Włącz przekątne` — ich długości i punkt przecięcia pojawiają się dopiero po wyborze ucznia.
3. `Kiedy prostokąt staje się kwadratem?` — suwak długości boku; zmiana klasyfikacji jest podświetlona w tabeli cech.
4. `Kwadrat obrócony` — obrót całej figury bez zmiany cech; kontruje prototyp „kwadrat musi stać prosto”.
5. `Zbuduj prostokąt z trójkątów` — różne trójkąty na tacy; uczeń wybiera, obraca i układa je bez luk. Alternatywa: wybierz element, `obrót 90°`, `przesuń` i `umieść`.
6. `Fasada pracowni` — wybór figury na podstawie warunków, nie wyglądu.
7. `Ocena umiejętności`.

Układanka nie może akceptować kształtu wyłącznie na podstawie pokrycia bitmapy; walidacja sprawdza położenia, krawędzie, brak nakładania i własności obrysu.

## 15. `WP-S4-10` — Równoległoboki i romby

Podstawa: IX.4, IX.5.
Pakiety: `L1` — równoległobok; `L2` — romb i relacje rodzin.

### Slajd 0 — cele

1. Nauczę się rozpoznawać równoległoboki i romby.
2. Nauczę się opisywać ich boki, kąty i przekątne.
3. Nauczę się wskazywać cechy wspólne i różnice.
4. Nauczę się uzasadniać klasyfikację figury.

### Slajdy kluczowe

1. `Przesuń wierzchołek` — górny bok przesuwa się równolegle; aktualizują się długości i kąty, a przeciwległe boki zachowują symbole.
2. `Co się nie zmienia?` — uczeń zaznacza niezmienniki przed ich nazwaniem.
3. `Zrównaj wszystkie boki` — równoległobok przechodzi w romb; tabela cech aktualizuje jedynie zmienioną własność.
4. `Przekątne pod lupą` — przecięcie, wzajemne połowienie i prostopadłość rombu pokazane jako osobne testy.
5. `Działka bez prostych kątów` — projekt równoległoboku/rombu w obrocie.
6. `Ocena umiejętności`.

Nie przedstawiać rombu wyłącznie jako „diamentu”. Generatory muszą obejmować romb będący kwadratem i romby niebędące kwadratami, zgodnie z celem zadania.

## 16. `WP-S4-11` — Trapezy

Podstawa: IX.4, IX.5; XI.1 dla obliczeń kątowych.
Pakiety: `L1` — definicja i warianty; `L2` — własności i kąty.

### Decyzja definicyjna

W tym planie przyjmujemy definicję włączającą: trapez ma **co najmniej jedną parę boków równoległych**. Dzięki temu równoległobok jest szczególnym trapezem, a mapa rodzin jest spójna. Definicja musi być zapisana w metadanych wersji programu, na slajdzie nauczyciela i w testach. Jeżeli szkoła wybierze definicję wyłączającą, wymaga to osobnej wersji programu, generatora i mapy rodzin — nie przełącznika ukrytego w UI.

### Slajd 0 — cele

1. Nauczę się rozpoznawać trapezy na podstawie boków równoległych.
2. Nauczę się wskazywać podstawy i ramiona trapezu.
3. Nauczę się rozpoznawać trapez równoramienny i prostokątny.
4. Nauczę się korzystać z własności kątów przy ramieniu.

### Slajdy kluczowe

1. `Znajdź parę równoległą` — uczeń przeciąga wierzchołki, a symbol grotów pojawia się tylko przy spełnionej relacji.
2. `Podstawy i ramiona` — etykiety są przeciągane na właściwe boki; obrót figury nie zmienia nazw funkcjonalnych.
3. `Rodzaje trapezów` — przełączane ograniczenia: równe ramiona, kąt prosty, druga para równoległa.
4. `Czy równoległobok jest trapezem?` — odpowiedź wynika jawnie z przyjętej definicji.
5. `Kąty przy ramieniu` — dynamiczny przykład sumy 180°, jeśli włączony w pakiecie `L2`.
6. `Wybieg na skarpie` — zadanie z trapezem w nietypowej orientacji.
7. `Ocena umiejętności`.

## 17. `WP-S4-12` — Czworokąty: podsumowanie

Podstawa: IX.4, IX.5.
Pakiet: `L1`.

### Slajd 0 — cele

1. Nauczę się porównywać własności czworokątów.
2. Nauczę się umieszczać czworokąty w mapie rodzin.
3. Nauczę się podawać przykłady i kontrprzykłady zdań o figurach.
4. Nauczę się wybierać najdokładniejszą nazwę figury.

### Slajdy

1. `Mapa rodzin figur` — przeciąganie kart nazw do zagnieżdżonych obszarów; każda relacja ma zdanie `każdy … jest …`.
2. `Karta cechy` — uczeń przeciąga `cztery kąty proste`, `wszystkie boki równe`, `przeciwległe boki równoległe` do właściwych rodzin.
3. `Przykład i kontrprzykład` — generowany czworokąt można modyfikować, by obalić zbyt szerokie zdanie.
4. `Najdokładniejsza nazwa` — wiele poprawnych nazw, ale osobno punktowana nazwa najbardziej szczegółowa.
5. `Paszport figury` — uczeń tworzy figurę spełniającą zestaw cech i podpisuje dowód.
6. `Ocena umiejętności`.

Walidator korzysta z przyjętej definicji trapezu i akceptuje prawdziwe relacje zawierania. Nie opiera się na pojedynczej etykiecie zapisanej w seedzie.

## 18. `WP-S4-13` — Oś symetrii

Podstawa bazowa: IX.5.
Pakiety: `L1` — rozpoznawanie osi; `L2` — uzupełnianie na kratce jako ćwiczenie rozszerzające.

### Slajd 0 — cele

1. Nauczę się rozpoznawać figury osiowosymetryczne.
2. Nauczę się wskazywać osie symetrii figur.
3. Nauczę się sprawdzać symetrię przez nałożenie lub złożenie.
4. W rozszerzeniu nauczę się uzupełniać wzór względem danej osi.

### Slajdy kluczowe

1. `Lustro figur` — ruchoma oś; odbicie pojawia się po drugiej stronie, a odległości odpowiadających punktów są pokazane równymi odcinkami.
2. `Złóż i sprawdź` — animacja złożenia figury, zatrzymywalna i zastępowana statycznym nałożeniem w reduced motion.
3. `Ile osi?` — kwadrat, prostokąt, romb, trójkąt równoboczny i figury bez osi.
4. `Oś nie musi być pionowa` — przykłady ukośne i obrócone.
5. `Dokończ mozaikę` — rozszerzenie na kratce; każdy punkt ma tę samą odległość od osi.
6. `Projekt logo zoo` — uczeń buduje prosty znak z wybraną osią i sprawdza nałożeniem.
7. `Ocena umiejętności` — bazowy wynik oddzielony od rozszerzenia.

## 19. `WP-S4-R` — Powtórzenie: `Zoo figur`

Podstawa: wszystkie kody działu w zakresie bazowym.
Pakiety: `L1` — stacje geometryczne; `L2` — projekt zoo.

### Slajdy `L1`

1. slajd 0 z matematyczną nazwą `Powtórzenie wiadomości o figurach na płaszczyźnie`;
2. stacja linii i kątów;
3. stacja trójkątów;
4. stacja czworokątów;
5. stacja symetrii;
6. naprawa błędnego rysunku;
7. `Ocena umiejętności` per główna grupa `skillIds`.

### Slajdy `L2` — projekt `Zoo figur`

1. `Plan zoo` — lokalne tło ilustracyjne z nałożoną, półprzezroczystą siatką i neutralnym obszarem roboczym.
2. `Warunki wybiegów` — zwierzęta otrzymują karty potrzeb: np. pingwiny — prostokąt z osią symetrii; żyrafy — trapez równoramienny; ptaki — romb; strefa opiekuna — dwie alejki prostopadłe.
3. `Buduj terytoria` — figury są przeciągane z tacy albo umieszczane przez `wybierz → umieść`; wierzchołki można przesuwać po siatce, a etykiety i własności aktualizują się w czasie rzeczywistym.
4. `Kontroluj warunki` — górny panel pokazuje liczbę poprawnie spełnionych cech, liczbę zajętych kratek i konflikty. Procent pojawia się tylko po włączeniu zadania zintegrowanego.
5. `Rozwiąż konflikt` — nakładające się wybiegi mają wzór ostrzegawczy, listę przecinających się boków i możliwość cofnięcia; nie są po prostu czerwone.
6. `Zbuduj prostokąt z trójkątów` — z dwóch lub czterech elementów powstaje budynek weterynarii; wymagane obracanie, dopasowanie bez luk i nazwanie własności obrysu.
7. `Otwórz zoo` — system sprawdza warunki geometryczne, nie podobieństwo do wzorcowej bitmapy. Uczeń opisuje jedną decyzję i jedną poprawkę.
8. `Ocena umiejętności` — osobno: konstrukcja, klasyfikacja, oznaczenia i uzasadnienie; licznik pola/procentu nie obniża wyniku bazowego.

### Wymagania techniczne projektu

- `undo/redo/reset`, zapis automatyczny i powrót po utracie połączenia;
- stabilne `seed` dla układu przeszkód i wymagań zwierząt;
- brak możliwości umieszczenia uchwytu pod panelem UI;
- dotykowe uchwyty co najmniej 52 px, lecz wizualny punkt może być mniejszy;
- tryb wysokiego kontrastu bez ilustracyjnego tła;
- wersja papierowa: wydruk mapy, wycięte figury i karta warunków;
- panel nauczyciela pokazuje strategię i niespełnione cechy, nie tylko wynik procentowy.

## 20. `WP-S4-S` — Sprawdzian i omówienie

### Blueprint

- 15–20% proste równoległe/prostopadłe i oznaczenia;
- 20–25% rodzaje, pomiar i rysowanie kątów;
- 20–25% kąty przyległe/wierzchołkowe oraz kąty w trójkącie;
- 20–25% trójkąty i możliwość konstrukcji;
- 20–25% czworokąty, własności i symetria;
- co najmniej jedno zadanie konstrukcyjne z rubryką: warunki, precyzja, oznaczenia, uzasadnienie;
- wersje A/B mają tę samą macierz i porównywalne orientacje figur;
- automatyczna ocena nie rozstrzyga nieczytelnego rysunku — zwraca `manual-review`.

### Slajdy omówienia

1. slajd 0 `Omówienie sprawdzianu — figury na płaszczyźnie`;
2. anonimowa mapa błędów pomiaru i konstrukcji;
3. ustawienie kątomierza i wybór skali;
4. naprawa par kątów przy skrzyżowaniu;
5. porównanie dwóch konstrukcji trójkąta;
6. naprawa mapy rodzin czworokątów;
7. indywidualna poprawa zadania z nowymi danymi;
8. `Ocena umiejętności` z prywatnym wynikiem i następnym krokiem.

## 21. `WP-S4-QA` — bramka działu 4

### Testy wymagane

- unit: wektory, długości, kąty, tolerancje, przecięcia, nierówność trójkąta, klasyfikacja i symetria;
- property-based: obrót, przesunięcie, odbicie i skalowanie nie zmieniają właściwej klasyfikacji;
- component: uchwyty, siatka, kątomierz, etykiety, historia, klawiatura i touch;
- integration: zapis modelu, feedback codes, ocena per `skillId`, manual review;
- E2E: pełna lekcja, `Zoo figur`, utrata połączenia i końcowa ocena;
- visual: wszystkie rozdzielczości, figury nietypowe, wysokie powiększenie i high contrast;
- print: skala kątomierza i linijki, wersje A/B, klucz i rubryka;
- security: brak klucza i oczekiwanych współrzędnych po stronie klienta przed oddaniem.

### Ręczna kontrola

- co najmniej 20 konfiguracji na generator, w tym przypadki graniczne 89°/90°/91°;
- trójkąty prawie zdegenerowane i niemożliwe;
- czworokąty obrócone, wklęsłe jako kontrprzykłady i figury szczególne;
- definicja trapezu spójna w treści, walidatorze, mapie i sprawdzianie;
- etykiety nie nakładają się na uchwyty i pozostają czytelne na tablicy;
- tło zoo nie sugeruje odpowiedzi, nie zaburza siatki i nie jest jedyną wersją zadania.

### Warunek zakończenia

Dział nie jest gotowy, jeżeli zmiana parametru nie zmienia rysunku natychmiast, przeciąganie nie ma alternatywy, figura jest oceniana po wyglądzie zamiast po własnościach, albo ostatni slajd nie pokazuje prywatnej oceny umiejętności ucznia.
