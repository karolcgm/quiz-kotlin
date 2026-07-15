# Dział 5 — Ułamki dziesiętne: plan wykonawczy

- Status: w realizacji — `WP-S5-01`–`WP-S5-05` wdrożone; kolejne paczki pozostają do wykonania
- Wersja programu: `pl-math-5-2026-classic`
- Sekcja: `M5-S5`
- Planowany czas: 20–25 godzin
Zasada wykonania: każdą paczkę `WP-S5-*` uruchamiać w osobnym, nowym kontekście zgodnie z [protokołem nowych kontekstów](./PLAN_DZIALY_3_4_5_NOWE_KONTEKSTY.md).

## 1. Kontekst obowiązkowy w każdym nowym zadaniu

Wykonawca paczki ma przeczytać:

- `AGENTS.md`;
- ten dokument w całości;
- `LEKCJALAB_KLASA_5_MASTER_SPEC.md`, szczególnie sekcje 21–28, 52 i 69–73;
- `src/data/curriculum/pl-math-5-2026-classic/sections.ts`;
- `src/data/lessons/section5-wp-c5.ts`;
- `src/types/lessonPackage.ts`;
- istniejące komponenty tabeli pozycyjnej, działań pisemnych, tablicy, ucznia, live i druku;
- właściwe przewodniki z `node_modules/next/dist/docs/` przed edycją kodu Next.js.

Nie wykonywać dwóch paczek w jednym kontekście. Wspólny parser i siatki działań zmienia wyłącznie `WP-S5-F0` albo osobna paczka naprawcza. Jeżeli temat ma `L1/L2/L3`, identyfikator bez litery jest grupą, a implementację wykonać w osobnych nowych kontekstach jako `A/B/C`, np. `WP-S5-12A`, `WP-S5-12B` i `WP-S5-12C`.

## 2. Mapa podstawy programowej

| Temat | Nazwa na pierwszym slajdzie | Podstawa — klasy IV–VI |
|---|---|---|
| `M5-5.1` | Zapisywanie ułamków dziesiętnych | IV.6, IV.7, IV.8, IV.9 |
| `M5-5.2` | Porównywanie ułamków dziesiętnych | IV.7, IV.12 |
| `M5-5.3` | Długość i masa w zapisie dziesiętnym | IV.6, XII.6, XII.7 |
| `M5-5.4` | Dodawanie i odejmowanie ułamków dziesiętnych | V.2, V.6; XIV.5–6 w zadaniach praktycznych |
| `M5-5.5` | Mnożenie ułamków dziesiętnych przez 10, 100, 1000… | V.2, V.6; XII.6–7 w kontekstach jednostek |
| `M5-5.6` | Dzielenie ułamków dziesiętnych przez 10, 100, 1000… | V.2, V.6; XII.6–7 w kontekstach jednostek |
| `M5-5.7` | Mnożenie ułamka dziesiętnego przez liczbę naturalną | V.2, V.6 |
| `M5-5.8` | Mnożenie ułamków dziesiętnych | V.2, V.6 |
| `M5-5.9` | Dzielenie ułamków dziesiętnych przez liczby naturalne | V.2, V.6 |
| `M5-5.10` | Dzielenie przez ułamek dziesiętny | V.2, V.6 |
| `M5-5.11` | Szacowanie wyników działań na ułamkach dziesiętnych | IV.11, V.6, XIV.6 |
| `M5-5.12` | Ułamki zwykłe i dziesiętne | IV.8, IV.9, IV.10, IV.12; V.1–2 dla działań mieszanych |
| `M5-5.13` | Procenty a ułamki | XII.1, XII.2; temat opcjonalny w planie klasy |
| `M5-5.R` | Powtórzenie wiadomości o ułamkach dziesiętnych | IV.6–12, V.2, V.6, XII.6–7, XIV.5–6 w zakresie działu |
| `M5-5.S` | Sprawdzian — ułamki dziesiętne | IV.6–12, V.2, V.6, XII.6–7, XIV.5–6 w zakresie działu |

`M5-5.13` pozostaje wyłączalny. Jeżeli nie został zrealizowany, nie może znaleźć się w obowiązkowym powtórzeniu, sprawdzianie ani końcowej ocenie działu.

## 3. Standard slajdów działu 5

### 3.1. Pierwszy i ostatni slajd

Każdy pakiet zaczyna `Cele lekcji (slajd 0)` z matematyczną nazwą, osobnymi celami, kryteriami i kodami podstawy. Fabularne nazwy `Tabela po przecinku`, `Sklep pomiarowy` czy `Naprawa przecinka` występują dopiero od slajdu 1.

Każdy pakiet kończy `Ocena umiejętności` po samodzielnym dowodzie uczenia. Wynik jest rozbity na `skillIds`, zawiera feedback i prywatną samoocenę. Samoocena nie zmienia punktów ani oceny pracy.

### 3.2. Polski zapis dziesiętny

- w widoku ucznia używać przecinka: `2,45`, nie kropki;
- parser jawnie akceptuje przecinek, opcjonalnie normalizuje kropkę wpisaną z klawiatury fizycznej i zwraca użytkownikowi zapis z przecinkiem;
- nie opierać lokalizacji na `input type=number`;
- spacje brzegowe można bezpiecznie usunąć, ale pustego pola nie zamieniać na `0`;
- zera końcowe mogą być zachowane jako część strategii ucznia, choć nie zmieniają wartości;
- jednostka jest osobnym polem/wyborem, nigdy częścią niekontrolowanego ciągu liczbowego;
- w trybie oceniania rubryka rozróżnia wartość liczby, poprawny zapis i wymaganą jednostkę.

### 3.3. Inteligentne kratki działań

Dodawanie, odejmowanie, mnożenie i dzielenie mają szkolny zapis pisemny w nowoczesnej siatce:

- jedna kratka na jedną cyfrę;
- osobna, wąska kolumna przecinka;
- nagłówki wartości pozycyjnych: `setki`, `dziesiątki`, `jedności`, `części dziesiąte`, `setne`, `tysięczne`;
- aktywna kolumna jest podświetlona symbolem i obrysem;
- klawiatura ekranowa ma cyfry, przecinek, usuń, lewo/prawo i zatwierdź;
- puste miejsce i wpisane `0` są rozróżniane w stanie oraz w wydruku;
- dopisane zero ma subtelny znacznik `zero pomocnicze`, dopóki uczeń go nie zatwierdzi;
- przecinki w dodawaniu/odejmowaniu tworzą pionową linię prowadzącą;
- częściowe wyniki mnożenia mają osobne wiersze i przesunięcie wynikające z wartości pozycyjnej, nie z pustej ozdobnej kratki;
- w dzieleniu aktywna część dzielnej i aktualna cyfra ilorazu mają wspólny znacznik.

### 3.4. Podświetlenia mnożenia „po skosie”

W `M5-5.7` i `M5-5.8` uczeń nie wpisuje wyłącznie wyniku. System prowadzi go przez iloczyny częściowe:

1. podświetla jedną cyfrę górnego czynnika i jedną cyfrę dolnego czynnika;
2. łączy je cienką linią po skosie zakończoną tym samym symbolem przy właściwej kratce iloczynu częściowego;
3. po wpisaniu wyniku wygasza parę, ale zachowuje ślad kroku;
4. przy przejściu do następnego rzędu pokazuje przesunięcie wynikające z pozycji cyfry;
5. w fazie dodawania iloczynów częściowych podświetla pionową kolumnę i składniki dodawane w tej kolumnie;
6. dopiero po otrzymaniu całkowitego iloczynu prowadzi do ustalenia liczby miejsc po przecinku.

Kolory nie mogą być jedynym oznaczeniem. Każda para ma dodatkowo symbol `A`, `B`, `C` albo wzór łącznika. W reduced motion łącznik pojawia się bez animowanego rysowania.

## 4. `WP-S5-F0` — tabela pozycyjna, parser i siatki działań

### Zakres

Zbudować lub rozszerzyć wspólne komponenty:

1. `DecimalPlaceValueGrid` — pozycje po obu stronach przecinka, przeciąganie cyfr i pola liczbowe;
2. `DecimalDigitInput` — klawiatura, polski przecinek, zera i semantyka;
3. `DecimalWrittenAddSub` — pionowa linia przecinków, wymiana i pożyczanie;
4. `DecimalWrittenMultiply` — iloczyny częściowe, aktywne pary po skosie, dodawanie kolumn i etap przecinka;
5. `DecimalWrittenDivide` — dzielna, dzielnik, iloraz, dopisywanie zer i skalowanie obu liczb;
6. `DecimalNumberLine` i kratownica `10×10`;
7. parser/normalizator liczb i jednostek;
8. deterministyczne generatory i serwerowe walidatory strategii oraz wyniku.

### Niezmienniki

- wartość w tabeli, zapis tekstowy i model są zgodne;
- przecinek jest renderowany niezależnie od systemowej lokalizacji urządzenia;
- `2,5`, `2,50` i `2,500` są równoważne liczbowo, ale ślad zapisu może zachować zera;
- puste pole nie jest zerem;
- liczba miejsc po przecinku w iloczynie jest wyliczana z danych, nie zapisana na stałe w seedzie;
- skalowanie dzielnej i dzielnika przez tę samą potęgę 10 nie zmienia ilorazu;
- wynik i jednostka mają zgodny wymiar;
- generowane działania pisemne mieszczą się w limicie podstawy i nie tworzą uciążliwych rachunków;
- klient nie otrzymuje `answerSpec` w trybie oceniania.

### Diagnostyka bazowa

| Kod | Znaczenie | Reakcja |
|---|---|---|
| `DEC_EMPTY` | brak liczby albo części wpisu | Zaznacz dokładną pustą kratkę i nazwij pozycję. |
| `DEC_COMMA_MISALIGNED` | przecinki nie są w jednej kolumnie | Narysuj pionową prowadnicę i podświetl oba przecinki. |
| `DEC_PLACE_VALUE` | cyfra trafiła do złej pozycji | Pokaż nagłówek kolumny i odczytaj wartość aktualnego zapisu. |
| `DEC_TRAILING_ZERO_VALUE` | uczeń uważa, że zero końcowe zmienia wartość | Nałóż liczby na osi/tabeli i pokaż wspólny punkt. |
| `DEC_MISSING_ZERO` | brak potrzebnego zera wiodącego lub pomocniczego | Zachowaj wpis, wskaż pustą pozycję i zapytaj, co ona oznacza. |
| `DEC_PRODUCT_PLACES` | zła liczba miejsc po przecinku | Podświetl cyfry po przecinku w obu czynnikach i pola wyniku. |
| `DEC_PARTIAL_PRODUCT_SHIFT` | zły początek kolejnego iloczynu częściowego | Połącz cyfrę mnożnika z jej pozycją i właściwą kolumną startową. |
| `DEC_DIVISOR_SCALE` | zmieniono tylko dzielnik albo tylko dzielną | Obejmij obie liczby wspólnym nawiasem `×10/×100`. |
| `DEC_ESTIMATE_RANGE` | wynik poza oszacowanym przedziałem | Nie skreślaj rachunku; poproś o sprawdzenie przecinka i rzędu wielkości. |
| `DEC_UNIT_MISMATCH` | liczba poprawna, jednostka błędna | Oddziel punkt za rachunek i podświetl wybór jednostki. |

### Odbiór

- testy przecinka, kropki z klawiatury, spacji, pustych pól i zer;
- testy klawiatury, touch, rysika i czytnika ekranu;
- visual QA dla 1–4 miejsc po przecinku i wysokiego zoomu;
- testy każdej pary mnożenia po skosie oraz kolumny dodawania;
- testy skalowania dzielenia i jednostek;
- dokumentacja API niezależna od pojedynczego tematu.

## 5. `WP-S5-01` — Zapisywanie ułamków dziesiętnych

Podstawa: IV.6, IV.7, IV.8, IV.9.
Pakiety: `L1` — części dziesiąte i setne; `L2` — tysięczne, oś i zamiana reprezentacji.

### Slajd 0 — cele

1. Nauczę się odczytywać i zapisywać ułamki dziesiętne.
2. Nauczę się wskazywać części dziesiąte, setne i tysięczne.
3. Nauczę się przedstawiać ułamek dziesiętny na modelu i osi.
4. Nauczę się łączyć prosty ułamek zwykły z zapisem dziesiętnym.

### Slajdy kluczowe

1. `Kratownica 10×10` — uczeń maluje 37 pól; licznik, ułamek `37/100` i zapis `0,37` aktualizują się real time.
2. `Tabela po przecinku` — cyfry są przeciągane do jedności, dziesiątych, setnych i tysięcznych; aplikacja czyta zapis słownie.
3. `Zapis słowny i cyfrowy` — dwukierunkowe uzupełnianie, bez gotowej podpowiedzi przed próbą.
4. `Oś dziesiętna` — powiększany fragment między dwiema kolejnymi liczbami; uczeń widzi dziesiąte, potem setne.
5. `Laboratorium barwników` — poziom cieczy `0,4 l`, `0,04 l` i `0,004 l` pokazuje znaczenie pozycji, z tekstową alternatywą.
6. `Samodzielna próba`.
7. `Ocena umiejętności`.

Feedback odróżnia błędną cyfrę od poprawnej cyfry w złej pozycji oraz brak zera wiodącego.

## 6. `WP-S5-02` — Porównywanie ułamków dziesiętnych

Podstawa: IV.7, IV.12.
Pakiet: `L1`.

### Slajd 0 — cele

1. Nauczę się porównywać ułamki dziesiętne w tabeli pozycyjnej.
2. Nauczę się porównywać ułamki dziesiętne na osi liczbowej.
3. Nauczę się korzystać z zer końcowych bez zmiany wartości liczby.
4. Nauczę się porządkować liczby rosnąco i malejąco.

### Slajdy

1. `Wyrównaj miejsca` — liczby `0,5` i `0,50` wsuwają się do tej samej tabeli; zero pojawia się jako pomocnicze.
2. `Porównuj od lewej` — kolumny są odsłaniane kolejno, a pierwsza różna para cyfr zostaje oznaczona symbolem.
3. `Ta sama oś` — `1,2`, `1,18` i `1,205` są ustawiane na powiększonej osi.
4. `Pułapka liczby cyfr` — kontrprzykłady `0,9` i `0,899`, `3,04` i `3,4`.
5. `Ranking skoków robotów` — odległości w metrach; uczeń porządkuje i uzasadnia.
6. `Ocena umiejętności`.

Walidator przyjmuje równoważne zera końcowe, lecz wymaga poprawnego znaku i kolejności.

## 7. `WP-S5-03` — Długość i masa w zapisie dziesiętnym

Podstawa: IV.6, XII.6, XII.7.
Pakiety: `L1` — długość; `L2` — masa i zadania mieszane.

### Slajd 0 — cele

1. Nauczę się zamieniać jednostki długości.
2. Nauczę się zamieniać jednostki masy.
3. Nauczę się przechodzić między zapisem dwumianowanym i dziesiętnym.
4. Nauczę się oceniać, czy otrzymana wielkość jest realistyczna.

### Slajdy kluczowe

1. `Miarka w czasie rzeczywistym` — suwak długości aktualizuje mm, cm i m oraz odpowiadający zapis w tabeli pozycyjnej.
2. `2 m 35 cm = 2,35 m` — dwa oznaczone odcinki składają się w jeden, a cyfry trafiają do właściwych kolumn.
3. `Waga laboratoryjna` — odważniki `kg`, `dag`, `g`; zmiana masy aktualizuje zapis dziesiętny.
4. `Nie przesuwamy przecinka bez sensu` — każda zamiana jest pokazana jako zmiana jednostki i wartości jednej pozycji.
5. `Pakowanie leków dla zwierząt` — realistyczne masy, jednostki i wybór sensownego wyniku.
6. `Samodzielna próba`.
7. `Ocena umiejętności`.

Generatory mają listę realistycznych zakresów. Nie wolno tworzyć np. masy zeszytu `4,2 t` jako zwykłego zadania bez intencjonalnego wykrywania absurdu.

## 8. `WP-S5-04` — Dodawanie i odejmowanie ułamków dziesiętnych

Podstawa: V.2, V.6; XIV.5–6 w zastosowaniach.
Pakiety: `L1` — modele i zapis pisemny; `L2` — zadania praktyczne, wymiana i pożyczanie.

### Slajd 0 — cele

1. Nauczę się wyrównywać przecinki w zapisie pisemnym.
2. Nauczę się dodawać ułamki dziesiętne.
3. Nauczę się odejmować ułamki dziesiętne.
4. Nauczę się szacować i sprawdzać wynik.

### Slajdy kluczowe

1. `Kolumny przecinków` — uczeń ustawia `2,45` i `1,3`; pionowa prowadnica pokazuje przecinki, a zera pomocnicze są opcjonalne.
2. `Dodawanie kolumna po kolumnie` — podświetlenie aktualnej wartości pozycyjnej i wymiany `10 setnych = 1 dziesiąta`.
3. `Odejmowanie z pożyczaniem` — ślad przekreślenia starej cyfry i wpisanie nowych wartości w małych kratkach.
4. `Dwie metody wydawania reszty` — odejmowanie pisemne oraz dopełnianie do kwoty; obie strategie zapisane osobno.
5. `Paragon pracowni` — kilka cen, jedna informacja zbędna i oszacowanie przed dokładnym rachunkiem.
6. `Napraw przesunięty przecinek`.
7. `Ocena umiejętności`.

Feedback wskazuje konkretną kolumnę i zachowuje tok pracy. Błąd przecinka nie kasuje poprawnych obliczeń cyfr.

## 9. `WP-S5-05` — Mnożenie przez 10, 100, 1000…

Status: wdrożony i zweryfikowany testami jednostkowymi, komponentowymi, kontraktem kanałów oraz publicznym snapshotem bez `answerSpec`.

Implementacja: `m555DecimalPowerTenL1V1`, pięć interaktywnych modeli w `DecimalPowerTenL1Lab`, jeden slajd ćwiczeń z pięcioma osobnymi przykładami oraz końcowa `Ocena umiejętności`.

Podstawa: V.2, V.6; XII.6–7 w zastosowaniach.
Pakiet: `L1`.

### Slajd 0 — cele

1. Nauczę się mnożyć ułamki dziesiętne przez 10, 100 i 1000.
2. Nauczę się wyjaśniać zmianę wartości cyfr w tabeli pozycyjnej.
3. Nauczę się stosować mnożenie przez potęgi 10 w zamianie jednostek.

### Slajdy

1. `Zmiana wartości pozycji` — cyfry `3,45` przesuwają się do kolumn o wartości dziesięć razy większej; przecinek pozostaje elementem tabeli, nie wędrującym znakiem.
2. `×10, ×100, ×1000` — uczeń przewiduje wynik, potem uruchamia animację pozycji.
3. `Zera jako nowe miejsca` — sytuacje `0,08 × 1000` i konieczne zera bez sztucznego dopisywania na ślepo.
4. `Skala mikroskopu` — rzeczywisty kontekst powiększenia długości na modelu.
5. `Brakujący czynnik` — od wyniku do działania.
6. `Ocena umiejętności`.

Zakazany feedback: `przesuń przecinek o dwa miejsca` jako jedyne wyjaśnienie. Najpierw ma być zmiana wartości pozycyjnej cyfr.

## 10. `WP-S5-06` — Dzielenie przez 10, 100, 1000…

Podstawa: V.2, V.6; XII.6–7 w zastosowaniach.
Pakiet: `L1`.

### Slajd 0 — cele

1. Nauczę się dzielić ułamki dziesiętne przez 10, 100 i 1000.
2. Nauczę się wyjaśniać zmianę wartości cyfr w tabeli pozycyjnej.
3. Nauczę się poprawnie zapisywać zera wiodące.
4. Nauczę się stosować dzielenie w zamianie jednostek.

### Slajdy

1. `Skala wstecz` — cyfry przechodzą do kolumn dziesięć razy mniejszych.
2. `Potrzebne zera` — `45 : 100 = 0,45`; puste kolumny nie stają się zerami bez decyzji ucznia.
3. `Kontrola mnożeniem` — odwrócenie operacji na tej samej tabeli.
4. `Laboratorium próbek` — gram na kilogram, centymetr na metr, z realistycznym wynikiem.
5. `Napraw zapis 4,5 : 100`.
6. `Ocena umiejętności`.

Testy graniczne obejmują wyniki mniejsze od `1`, mniejsze od `0,1` i liczby z zerami wewnętrznymi.

## 11. `WP-S5-07` — Mnożenie ułamka dziesiętnego przez liczbę naturalną

Podstawa: V.2, V.6.
Pakiety: `L1` — powtarzane porcje; `L2` — mnożenie pisemne.

### Slajd 0 — cele

1. Nauczę się interpretować mnożenie jako powtarzanie jednakowych porcji.
2. Nauczę się mnożyć ułamek dziesiętny przez liczbę naturalną pisemnie.
3. Nauczę się ustalać położenie przecinka w wyniku.
4. Nauczę się kontrolować rząd wielkości wyniku.

### Slajdy kluczowe

1. `Powtarzane porcje` — trzy pojemniki po `2,50 l`; model zbioru i dodawanie powtarzane.
2. `Zapis w kratkach` — czynniki ustawione w siatce, bez wpisanego wyniku.
3. `Aktywna para cyfr` — łącznik po skosie pokazuje dokładnie, które cyfry są mnożone; przeniesienie ma osobną małą kratkę.
4. `Następna para` — system nie pozwala przypadkowo pominąć cyfry, ale uczeń może wrócić do poprzedniego kroku.
5. `Gdzie przecinek?` — porównanie z oszacowaniem i pozycją przecinka w pierwszym czynniku.
6. `Zamówienie desek` — liczba sztuk × długość lub cena, z jednostką.
7. `Samodzielna próba`.
8. `Ocena umiejętności`.

Feedback rozróżnia błąd iloczynu cyfr, przeniesienia, przesunięcia częściowego wyniku i przecinka.

## 12. `WP-S5-08` — Mnożenie ułamków dziesiętnych

Podstawa: V.2, V.6.
Pakiety: `L1` — model pola i skali; `L2` — algorytm pisemny i zastosowania.

### Slajd 0 — cele

1. Nauczę się interpretować iloczyn ułamków dziesiętnych na modelu.
2. Nauczę się mnożyć ułamki dziesiętne pisemnie.
3. Nauczę się ustalać liczbę miejsc po przecinku w wyniku.
4. Nauczę się sprawdzać wynik przez szacowanie.

### Slajdy kluczowe

1. `Pole i skala` — siatka `10×10` pokazuje `0,3 × 0,4 = 0,12`; część wspólna ma wzór krzyżowy i tekstową legendę.
2. `Mnożymy jak liczby całkowite` — przecinki są chwilowo opisane, ale nie usuwane bez śladu; liczby trafiają do siatki cyfr.
3. `Iloczyny po skosie` — każda para cyfr ma łącznik, symbol i docelową kratkę iloczynu częściowego.
4. `Dodaj częściowe wyniki` — podświetlenie pionowych kolumn, jawne przeniesienia.
5. `Policz miejsca po przecinku` — nawias obejmuje cyfry po przecinku w obu czynnikach; wynik otrzymuje dokładnie sumę tych miejsc, a potem może usunąć niepotrzebne zero końcowe.
6. `Terrarium o bokach 1,2 m i 0,5 m` — kontekst pola jako interpretacja iloczynu; wzór pola nie jest tu nowym celem działu 4, tylko znanym kontekstem rachunku.
7. `Czy 24,96 ma sens?` — naprawa błędnego przecinka za pomocą oszacowania.
8. `Ocena umiejętności`.

Testy visual muszą obejmować mnożniki o różnej liczbie cyfr, zero w środku, wynik mniejszy od obu czynników i reduced motion.

## 13. `WP-S5-09` — Dzielenie ułamków dziesiętnych przez liczby naturalne

Podstawa: V.2, V.6.
Pakiety: `L1` — podział i zapis pisemny; `L2` — dopisywanie zer i zadania.

### Slajd 0 — cele

1. Nauczę się dzielić ułamki dziesiętne przez liczby naturalne.
2. Nauczę się prawidłowo umieszczać przecinek w ilorazie.
3. Nauczę się dopisywać potrzebne zera do dzielnej.
4. Nauczę się sprawdzać wynik mnożeniem.

### Slajdy kluczowe

1. `Rozdziel kwotę` — `7,50 zł` między 3 osoby; monety i zapis pisemny pozostają zsynchronizowane.
2. `Przecinek nad przecinkiem` — pionowa prowadnica pokazuje moment wpisania przecinka w ilorazie.
3. `Gdy brakuje cyfr` — `4,2 : 8`; zero pomocnicze pojawia się dopiero po decyzji ucznia.
4. `Aktywna część dzielnej` — podświetlenie kolejnych cyfr i właściwej kratki ilorazu.
5. `Sprawdź mnożeniem` — odtworzenie dzielnej w siatce mnożenia.
6. `Cięcie taśmy pomiarowej` — długość i liczba równych odcinków.
7. `Ocena umiejętności`.

Feedback obejmuje brak zera w ilorazie, przecinek w złym momencie, niewłaściwą cyfrę dzielnej i brak jednostki.

## 14. `WP-S5-10` — Dzielenie przez ułamek dziesiętny

Podstawa: V.2, V.6.
Pakiety: `L1` — sens ilorazu i skalowanie; `L2` — zapis pisemny i zastosowania.

### Slajd 0 — cele

1. Nauczę się interpretować dzielenie przez ułamek dziesiętny.
2. Nauczę się mnożyć dzielną i dzielnik przez tę samą potęgę 10.
3. Nauczę się otrzymywać dzielnik naturalny bez zmiany ilorazu.
4. Nauczę się szacować i sprawdzać wynik.

### Slajdy kluczowe

1. `Ile miarek po 0,2 l?` — uczeń układa miarki w 6 litrach; przewiduje, że wynik będzie większy od 6.
2. `Zmień skalę obu liczb` — wspólny nawias obejmuje dzielną i dzielnik, oba mnożone przez 10/100.
3. `Iloraz się nie zmienia` — dwa paski pomiarowe pokazują równoważne zadania `6 : 0,2` i `60 : 2`.
4. `Naturalizuj dzielnik` — uczeń wybiera najmniejszą wystarczającą potęgę 10.
5. `Dzielenie pisemne` — ponowne użycie wspólnej siatki po skalowaniu.
6. `Butelkowanie soku` — pojemność całkowita i mała butelka, wynik z jednostką `szt.`.
7. `Napraw zmianę tylko dzielnika`.
8. `Ocena umiejętności`.

Nie używać komunikatu `przenieś przecinek` bez pokazania wspólnego skalowania obu liczb.

## 15. `WP-S5-11` — Szacowanie wyników działań

Podstawa: IV.11, V.6, XIV.6.
Pakiet: `L1`.

### Slajd 0 — cele

1. Nauczę się szacować wynik przed dokładnym obliczeniem.
2. Nauczę się wskazywać sensowny przedział wyniku.
3. Nauczę się wykrywać błędy przecinka i jednostki.
4. Nauczę się uzasadniać, dlaczego wynik jest albo nie jest możliwy.

### Slajdy

1. `Najpierw przedział` — uczeń przesuwa dwa ograniczniki na osi, zanim zobaczy rachunek.
2. `Zaokrąglij rozsądnie` — wybór liczb bliskich i łatwych, bez wymagania jednego sztywnego sposobu.
3. `Detektyw przecinka` — wyniki `0,2496`, `2,496`, `24,96` dla tego samego działania; uczeń odrzuca na podstawie przedziału.
4. `Czy jednostka pasuje?` — wynik liczbowy poprawny, jednostka błędna; osobny feedback.
5. `Kontrola kalkulatora` — generator celowo wprowadza jeden błąd cyfr albo przecinka, a uczeń podaje dowód.
6. `Ocena umiejętności`.

Walidator akceptuje różne sensowne przedziały i uzasadnienia. Nie wymaga identycznego zaokrąglenia, jeżeli argument poprawnie kontroluje wynik.

## 16. `WP-S5-12` — Ułamki zwykłe i dziesiętne

Podstawa: IV.8, IV.9, IV.10, IV.12; V.1–2 dla działań mieszanych.
Pakiety: `L1` — zamiana reprezentacji; `L2` — wybór strategii; `L3` — rozwinięcia nieskończone w zakresie podstawy i kalkulatora.

### Slajd 0 — cele

1. Nauczę się zamieniać ułamki dziesiętne na zwykłe.
2. Nauczę się zamieniać wybrane ułamki zwykłe na dziesiętne.
3. Nauczę się porównywać obie reprezentacje.
4. Nauczę się wybierać zapis, który ułatwia działanie.

### Slajdy kluczowe

1. `Dwa języki liczby` — pionowe kratki ułamka `1/4`, kratownica `25/100` i zapis `0,25` są trzema zsynchronizowanymi reprezentacjami.
2. `Rozszerz do 10, 100, 1000` — aktywne pary licznika/mianownika korzystają z komponentu działu 3.
3. `Podziel licznik przez mianownik` — alternatywna droga do zapisu dziesiętnego.
4. `Czy zapis jest skończony?` — przykłady z mianownikami dającymi rozwinięcie skończone i nieskończone; kalkulator pokazuje wielokropek, nie fałszywie dokładny wynik.
5. `Wybierz język działania` — `0,75 + 1/2`, `2/5 + 0,3`; uczeń wybiera reprezentację i uzasadnia.
6. `1/3 a 0,33` — oś i różnica pokazują, że to nie są dokładnie te same liczby.
7. `Laboratorium receptur` — mieszane zapisy w kontekście porcji.
8. `Ocena umiejętności`.

Ocena oddziela wartość, poprawną zamianę i sens wyboru strategii. Uczeń nie traci punktu za inną poprawną reprezentację, jeżeli polecenie jej nie ogranicza.

## 17. `WP-S5-13` — Procenty a ułamki, temat opcjonalny

Podstawa: XII.1, XII.2.
Pakiety: `L1` — 100%, 50%, 25%, 10%, 1%; `L2` — proste obliczenia praktyczne, jeżeli plan klasy przewiduje czas.

### Slajd 0 — cele

1. Nauczę się przedstawiać proste procenty jako ułamki i liczby dziesiętne.
2. Nauczę się zaznaczać procent na siatce `10×10`.
3. Nauczę się obliczać proste procenty wielkości w sytuacjach praktycznych.

### Slajdy kluczowe

1. `Sto pól` — uczeń zaznacza 25 ze 100 pól; zapis `25% = 25/100 = 1/4 = 0,25` rozwija się etapami.
2. `Jedna całość` — 100%, 50%, 25%, 10% i 1% na pasku, kole i siatce.
3. `Zoo po modernizacji` — opcjonalny powrót do mapy zoo: procent zajętych kratek w zadaniach o prostych wartościach.
4. `Rabat i ankieta` — konteksty 10%, 20%, 25%, 50% bez trudnych obliczeń.
5. `Zbuduj własny procent` — uczeń maluje pola i tworzy trzy zapisy.
6. `Ocena umiejętności`.

Pakiet i jego `skillId` muszą dać się całkowicie wyłączyć. Brak tematu nie jest raportowany jako zaległość ucznia.

## 18. `WP-S5-R` — Powtórzenie: Sklep pomiarowy

Podstawa: wszystkie włączone kody działu.
Pakiety: `L1` — stacje; `L2` — projekt paragonu i dostawy.

### Slajdy

1. slajd 0 `Powtórzenie wiadomości o ułamkach dziesiętnych`;
2. `Etykiety cen` — zapis, porównywanie i porządkowanie;
3. `Magazyn miar` — długość i masa w dwóch zapisach;
4. `Kasa` — dodawanie, odejmowanie i reszta;
5. `Pakiety towaru` — mnożenie przez naturalną i ułamki dziesiętne z prowadzeniem par cyfr;
6. `Rozlew` — dzielenie przez naturalną i ułamek dziesiętny;
7. `Napraw paragon` — szacowanie wykrywa błąd cyfry, przecinka albo jednostki;
8. `Wybierz język liczby` — ułamek zwykły albo dziesiętny;
9. `Ocena umiejętności` — wynik rozbity na reprezentację, działania, jednostki i kontrolę sensu.

Każda stacja ma inny rodzaj zadania i nie sprowadza powtórzenia do serii pól z wynikami.

## 19. `WP-S5-S` — Sprawdzian i omówienie

### Blueprint

- 15–20% zapis i porównywanie;
- 15–20% jednostki i zapis dwumianowany;
- 35–45% działania, z co najmniej jednym zapisem pisemnym w kratkach;
- 10–15% zamiana zwykły–dziesiętny;
- 10–15% szacowanie i naprawa błędu;
- procenty tylko w wariancie programu, który ma `M5-5.13` jako włączony;
- A/B mają tę samą liczbę miejsc po przecinku, podobny zakres cyfr i identyczną macierz punktów;
- pełny klucz i `answerSpec` pozostają po stronie serwera do publikacji.

### Slajdy omówienia

1. slajd 0 `Omówienie sprawdzianu — ułamki dziesiętne`;
2. anonimowa mapa błędów przecinka, pozycji i jednostek;
3. naprawa niewyrównanych przecinków;
4. naprawa iloczynu częściowego i pary cyfr po skosie;
5. naprawa skalowania tylko dzielnika;
6. oszacowanie jako kontrola wyniku;
7. indywidualna poprawa jednego zadania z innymi danymi;
8. `Ocena umiejętności` z prywatnym wynikiem i następnym krokiem.

## 20. `WP-S5-QA` — bramka działu 5

### Testy wymagane

- unit: parser przecinka, normalizacja, zera, porównywanie, zamiana reprezentacji, działania i jednostki;
- generatory: deterministyczność, limit cyfr niezerowych, właściwe miejsca po przecinku i realistyczne dane;
- component: kratki, klawiatura, tabela pozycyjna, podświetlenia par cyfr, przeniesienia i przecinek;
- integration: feedback codes, wynik per `skillId`, zapis samooceny i opcjonalność procentów;
- E2E: tablica, tablet, utrata połączenia, powrót, oddanie i końcowa ocena;
- visual: długie liczby, zera wewnętrzne, tablet pionowy/poziomy, high zoom i reduced motion;
- print: działania w kratkach, A/B, klucz, jednostki i czytelny przecinek;
- security: brak oczekiwanej odpowiedzi i klucza w kliencie przed oddaniem.

### Ręczna recenzja

- co najmniej 20 seedów na generator i wszystkie przypadki graniczne;
- `0,5 = 0,50`, `0,9 > 0,899`, `1/3 > 0,33` poprawnie wyjaśnione;
- każda para cyfr w mnożeniu podświetla właściwą kratkę;
- każde skalowanie dzielenia obejmuje obie liczby;
- zera wiodące, końcowe i wewnętrzne nie są mylone;
- jednostki i wielkości kontekstowe są realistyczne;
- `M5-5.13` można wyłączyć bez pustych slajdów, błędów raportu i pytań na sprawdzianie.

### Warunek zakończenia

Dział nie jest gotowy, jeżeli UI używa kropki zamiast przecinka, uczeń wpisuje tylko końcowy wynik bez śladu w wymaganym działaniu pisemnym, mnożenie nie pokazuje aktywnych par cyfr, feedback ogranicza się do `Źle`, albo lekcja nie kończy się prywatną `Oceną umiejętności`.
