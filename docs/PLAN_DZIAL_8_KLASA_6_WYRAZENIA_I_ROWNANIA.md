# Dział 8, klasa VI — wyrażenia algebraiczne i równania

## 1. Cel dokumentu

Ten dokument jest jednocześnie:

1. planem dydaktycznym całego Działu 8;
2. kontraktem wyglądu i zachowania slajdów;
3. planem implementacji React/Next.js/React Three Fiber;
4. listą wymagań dla kanału nauczyciela, ucznia, live i pracy własnej;
5. planem testów i odbioru jakościowego.

Najważniejsza zasada dydaktyczna: uczeń nie zaczyna od symbolicznego „przerzucania na drugą stronę”. Najpierw rozumie, że litera oznacza liczbę, której jeszcze nie znamy albo której wartość może się zmieniać. Następnie widzi równanie jako dwie równe masy na wadze i sam odkrywa, że obie strony muszą być zmieniane w ten sam sposób.

## 2. Nienegocjowalne kontrakty platformy

### 2.1. Hierarchia slajdów

- Każda lekcja zaczyna się istniejącym slajdem `Cele lekcji (slajd 0)` renderowanym przez `ExerciseBoardModel`.
- Slajd 0 zachowuje temat, cel ucznia, kryteria sukcesu, podstawę programową, stronę i zadania z podręcznika.
- Każda lekcja kończy się istniejącym slajdem `Ocena umiejętności`.
- Na końcu uczeń widzi prywatny wynik i zapisuje samoocenę; tablica pokazuje wyłącznie anonimowy rozkład klasy.
- Nawigacja między slajdami, tryb pełnoekranowy, jasność, „Wstecz”, „Dalej”, przełączanie nauczyciel/uczeń i sterowanie live pozostają wspólne z poprzednimi działami.

### 2.2. Slajd z serią zadań

- Jedna seria zadań to jeden slajd.
- W danej chwili widoczne jest dokładnie jedno zadanie.
- Nagłówek serii nie zmienia układu przy przejściu do kolejnego zadania.
- Karta używa `LessonTaskFrame` i — dla wyborów — `LessonTaskChoice`.
- `Zadanie X/Y` występuje dokładnie raz, w prawym górnym rogu nagłówka karty.
- Nauczyciel korzysta z istniejących kontrolek `Poprzednie` i `Następne` nad modelem.
- Uczeń sprawdza odpowiedź w karcie, a następnie zatwierdza ją istniejącym dolnym przyciskiem.
- Każde zadanie jest oddzielnym dowodem i może dać maksymalnie jeden punkt.
- Slajd jest zaliczony dopiero po obsłużeniu ostatniego zadania z serii.
- Nie wolno tworzyć wewnętrznego, drugiego licznika ani wewnętrznej, konkurencyjnej nawigacji po serii.

### 2.3. Pola odpowiedzi i klawiatura

- Każde pole odpowiedzi liczbowej podczas lekcji ma `inputMode="none"` oraz `readOnly`.
- Odpowiedź wprowadza się wyłącznie wspólną klawiaturą lekcyjną.
- Kliknięcie pola wybiera je jako aktywne; nie otwiera klawiatury urządzenia.
- Puste wymagane pole blokuje sprawdzenie i pokazuje jasny komunikat o uzupełnieniu.
- Pola zachowują styl poprzednich działów: jasne tło, mocna obwódka aktywnego pola, duży czytelny wynik.
- Zapis ułamka widoczny dla ucznia zawsze ma licznik nad kreską i mianownik pod kreską.

### 2.4. Informacja zwrotna i punkty

- Poprawna odpowiedź: krótka informacja wskazująca, co uczeń zrobił poprawnie.
- Niepoprawna odpowiedź nie używa słów „Źle”, „Błąd” ani oceniających odpowiedników.
- Obowiązkowy wzorzec: `Spróbuj innym razem. Poprawny wynik to… Dziś bez punktu.`
- Po niepoprawnej odpowiedzi dolny przycisk ma brzmieć `Przejdź dalej bez punktu`.
- Uczeń może przejść dalej po niepoprawnej odpowiedzi, ale nie otrzymuje punktu za to zadanie.
- Nauczyciel widzi poprawność każdego zadania w podsumowaniu etapu.
- Samoocena ucznia nie zmienia wyniku punktowego.

## 3. Koncepcja dydaktyczna całego działu

### 3.1. Metafory przewodnie

1. **Pudełko X** — zamknięte pudełko zawiera liczbę. `x` nie oznacza przedmiotu ani znaku mnożenia; jest etykietą liczby.
2. **Maszyna wyrażeń** — liczba wchodzi do maszyny, wykonywane są opisane działania, a z drugiej strony wychodzi wartość wyrażenia.
3. **Wyrazy podobne na małych grafikach** — punkt wyjścia stanowi dziecięca analogia „kwiatek + kwiatek = 2 kwiatki”. Liczba kwiatków i zwykłych elementów zmienia się zgodnie z aktualnym zadaniem; wyrazy z `x` łączymy z wyrazami z `x`, a liczby bez `x` pozostają osobną grupą.
4. **Waga równania** — znak równości oznacza idealną równowagę, nie polecenie „policz”. To, co robimy po lewej stronie, robimy także po prawej.
5. **Detektyw równań** — sprawdzanie rozwiązania polega na włożeniu liczby do pudełka X i porównaniu obu stron.

### 3.2. Język nauczyciela

- „Litera przechowuje liczbę” zamiast „x jest niewiadomą” na pierwszym kontakcie.
- „Wartość x może się zmienić, ale w jednym obliczeniu każde x ma tę samą wartość.”
- „`3x` to trzy jednakowe paczki po x, czyli `x + x + x`.”
- „Znak równości mówi: po obu stronach jest tyle samo.”
- „Nie przerzucamy liczby. Zdejmujemy lub dokładamy taką samą masę po obu stronach.”
- Dopiero po modelu konkretnym i obrazie wprowadzamy skrócony zapis symboliczny.

### 3.3. Sekwencja poznawcza CRA

Każde nowe pojęcie przechodzi przez trzy reprezentacje:

1. **konkret/model** — pudełka, odważniki, klocki i maszyny 3D;
2. **obraz/diagram** — płaskie karty, strzałki, grupy i belki równowagi;
3. **symbol** — zapis z literą, wyrażenie lub równanie.

Uczeń może przełączać reprezentacje, a animacja pokazuje zachowanie znaczenia podczas przejścia z modelu do symbolu.

## 4. Wspólny system wizualny Działu 8

### 4.1. Kolory znaczeniowe

- `x` / pudełko niewiadomej: fiolet i magenta;
- liczby stałe / odważniki jednostkowe: cyjan i błękit;
- znak równości / oś wagi: bursztyn;
- dozwolona operacja wykonywana po obu stronach: zieleń;
- podpowiedź: jasny bursztyn;
- poprawna odpowiedź: szmaragd;
- neutralna informacja o odpowiedzi bez punktu: bursztyn, bez czerwonego komunikatu oceniającego.

### 4.2. Scena 3D

Wspólne wymagania dla modeli React Three Fiber:

- kamera perspektywiczna z delikatnym ruchem paralaksy;
- światło otoczenia, kierunkowe i punktowe, miękkie cienie;
- fizycznie wiarygodne wychylenie belki wagi;
- sprężynowana animacja dołożenia i zdjęcia odważnika;
- delikatny ruch pudełka X sugerujący „ukrytą zawartość”;
- etykiety HTML poza płótnem 3D dla pełnej czytelności i dostępności;
- przycisk pauzy animacji i respektowanie `prefers-reduced-motion`;
- opis tekstowy sceny dla czytnika ekranu;
- awaryjna reprezentacja HTML/SVG, gdy WebGL jest niedostępny;
- brak polegania wyłącznie na kolorze.

### 4.3. Ilustracje generowane

Ilustracje AI nie zawierają tekstu ani działań matematycznych. Matematyka pozostaje w kodzie. Każdy obraz powstaje osobnym promptem.

1. `x-mystery-lab.png` — przyjazne laboratorium matematyczne, centralna świecąca skrzynia/pudełko z symbolem reprezentowanym w interfejsie osobno, dziecięca ciekawość, miejsce na warstwę UI.
2. `algebra-machine.png` — fantastyczna, ale czytelna maszyna wejście–proces–wyjście, bez napisów i cyfr, miejsce na nakładane etykiety HTML.
3. `balance-workshop.png` — nowoczesny warsztat z dużą wagą szalkową i zestawem klocków, bez symboli i tekstu, tło dla rozdziału o równaniach.
4. `equation-detective.png` — narracyjna scena detektywistyczna z pudełkiem, wagą i lupą, bez tekstu i bez gotowych równań.

## 5. Wspólna architektura techniczna

### 5.1. Model danych

- Nowy `LessonModelId`: `algebra-expressions-lab`.
- Jeden generator sesyjny: `algebra-expressions-l1-v1`.
- Jedno źródło deterministycznych zadań wybieranych przez `activity` i `taskSeed`.
- Identyczne zadanie po stronie tablicy, ucznia live i pracy własnej dzięki temu samemu ziarnu.
- `questionNumber` i `questionCount` pochodzą wyłącznie z zewnętrznego mechanizmu slajdu.
- Model nie ma własnego indeksu serii i nie przełącza samodzielnie na kolejne zadanie.

### 5.2. Główne komponenty

- `AlgebraLessonLab` — router aktywności, wspólna karta, feedback i dostępność.
- `AlgebraBalanceScene3D` — waga, pudełka X, odważniki, wychylenie i animacja operacji równoważnej.
- `AlgebraMachineScene3D` — wizualizacja podstawienia liczby do wyrażenia i kolejnych operacji.
- `AlgebraTilesScene3D` — wizualne rozwijanie wielokrotności `x` tam, gdzie model przestrzenny rzeczywiście pomaga.
- `LikeTermsFlowerGuide` — małe, zmienne grafiki kwiatków i elementów liczbowych do rozpoznawania wyrazów podobnych bez używania stałego modelu trzech klocków.
- `AlgebraExpression` — semantyczny zapis wyrażeń bez dwuznaczności.
- `AlgebraAnswerField` — pole z kontraktem `inputMode="none"`, `readOnly` i wspólną klawiaturą.
- `AlgebraStoryMap` — cztery kroki: wybierz x, zapisz relacje, zbuduj równanie, sprawdź odpowiedź w historii.

### 5.3. Aktywności

Planowany zamknięty zbiór aktywności:

- `meet-x`
- `translate-words`
- `build-expression`
- `substitution-machine`
- `evaluate-expression`
- `write-substitution`
- `like-terms`
- `simplify-expression`
- `simplify-multiply-divide`
- `simplify-mixed`
- `equation-meaning`
- `write-equation`
- `test-solution`
- `balance-solve`
- `inverse-operation`
- `story-equation`
- `review-mission`

## 6. Temat 1 — Zapisywanie wyrażeń algebraicznych

### Cel ucznia

Rozumiem, czym jest litera w matematyce, i zapisuję podstawowe wyrażenia algebraiczne na podstawie ich opisu.

### Kryteria sukcesu

- potrafię powiedzieć, co oznacza `x` w konkretnej sytuacji;
- rozumiem, że wszystkie wystąpienia `x` w jednym wyrażeniu mają tę samą wartość;
- rozróżniam „o 2 większa lub mniejsza” oraz „2 razy większa lub mniejsza”;
- zapisuję sumę, różnicę, iloczyn, iloraz, połowę i kwadrat liczby.

### Slajdy po slajdzie

1. **Slajd 0 — cele lekcji**: wspólny, niezmienny szablon.
2. **Kim jest x?**: pudełko 3D, suwak zmienia ukrytą liczbę, obok aktualizują się przykłady „x jabłek”, „x złotych”, „x kroków”. Nauczyciel podkreśla, że x jest liczbą, a kontekst nadaje jej znaczenie.
3. **Jedna litera, jedna wartość**: dwa identyczne pudełka X otwierają się równocześnie i pokazują tę samą liczbę. Kontrprzykład pokazuje, dlaczego nie można nadać dwóm x różnych wartości w jednym obliczeniu.
4. **Od słów do wyrażenia — jedna seria 16 zadań**: jeden stały slajd pokazuje kolejno cztery podstawowe relacje (`x + 2`, `x − 2`, `2x` oraz połowę liczby x), analogiczne opisy z literą `a`, nazwy czterech działań oraz zapisy: `2y`, połowa liczby y, `y²` i `2y − 2`. Ilorazy są prezentowane jako ułamki piętrowe. Uczeń dopasowuje opis do zapisu, a po zatwierdzeniu otrzymuje następne zadanie w tym samym układzie.
5. **Z treści do wyrażenia — jedna seria 6 zadań**: uczeń otrzymuje wyraźną treść oraz osobną ramkę z danymi. Sam wpisuje całe wyrażenie klawiaturą algebraiczną. W zadaniu o opakowaniach jaj zapisuje `12x + 42`; kolejne przykłady dotyczą flamastrów, biletów, książek, tulipanów i tac z pieczywem.
6. **Ocena umiejętności**: wspólny slajd kończący.

W tej serii nie używamy modelu paczek. Dzięki temu liczba elementów na ilustracji nie może być sprzeczna ze współczynnikiem w rozwiązywanym wyrażeniu, a uwaga ucznia pozostaje na języku matematycznym.

## 7. Temat 2 — Obliczanie wartości wyrażeń algebraicznych

### Cel ucznia

Podstawiam liczbę za literę i obliczam wartość wyrażenia we właściwej kolejności.

### Slajdy

1. Slajd 0.
2. **Maszyna wartości**: nad maszyną znajduje się definicja wartości wyrażenia oraz duże, osobne karty `2x + 3` i `x = 4`. Na samej maszynie widać kolejno: `x = 4`, `2 · 4 + 3`, `8 + 3` i `11`. Aktywny zapis jest wyróżniony na żółto, dzięki czemu podstawienie liczby za x pozostaje widoczne podczas całej animacji.
3. **Podstawienie to zamiana etykiety na liczbę**: animacja `2x + 3` → `2 · 4 + 3` → `8 + 3` → `11`; jawny znak mnożenia po podstawieniu.
4. **Kolejność działań nadal obowiązuje**: dwie ścieżki maszyny pokazują poprawne i pozornie kuszące wykonanie.
5. **Seria zadań — uruchom maszynę**: 8 unikalnych zadań o rosnącej złożoności, obejmujących liczby dodatnie, ujemne oraz wartości ułamkowe. W każdym przykładzie uczeń najpierw dotyka wyróżnionego `x`, a następnie sam wybiera kartę liczby, którą wstawi w jego miejsce. Dopiero poprawne podstawienie pokazuje pełne działanie i odblokowuje pole wyniku. Uczeń sam wykonuje obliczenia i wpisuje odpowiedź klawiaturą lekcji. Ułamki są zawsze prezentowane piętrowo.
6. **Bilet wyjścia — samodzielne podstawienie**: cztery zadania, w których uczeń widzi wyrażenie i podaną wartość `x`, a następnie sam wpisuje całe działanie po podstawieniu, na przykład `2 · (−4) + 1`. Poprawny zapis odblokowuje pole na wynik. Liczba ujemna musi pozostać w nawiasie.
7. Ocena umiejętności.

## 8. Temat 3 — Upraszczanie wyrażeń algebraicznych

### Cel ucznia

Upraszczam wyrażenia z dodawaniem, odejmowaniem, mnożeniem i dzieleniem oraz zapisuję cały wynik.

### Slajdy

1. Slajd 0.
2. **Seria zadań — takie same elementy**: cztery unikalne przykłady rozpoznawania wyrazów podobnych. Każde zadanie korzysta z dopasowanej liczby małych grafik. Zasada „kwiatek + kwiatek = 2 kwiatki” prowadzi do łączenia wyrazów z `x`, natomiast zwykłe liczby pozostają w oddzielnej grupie.
3. **Seria zadań — dodawanie i odejmowanie**: sześć przykładów o rosnącej trudności. Uczeń łączy tylko wyrazy podobne i wpisuje całe uproszczone wyrażenie, nie sam współczynnik.
4. **Seria zadań — mnożenie i dzielenie**: sześć przykładów obejmujących liczby dodatnie, liczby ujemne oraz proste ułamki. Uczeń wykonuje działanie na liczbach stojących przy x i zachowuje literę w wyniku. Każde dzielenie jest prezentowane jako ułamek z licznikiem nad kreską i mianownikiem pod kreską.
5. **Seria zadań — działania mieszane**: sześć przykładów wymagających najpierw mnożenia lub dzielenia, a dopiero potem dodawania albo odejmowania wyrazów podobnych. Dzielenie również ma zapis ułamkowy.
6. Każda seria zachowuje jeden układ slajdu, pokazuje osobną kartę zasad oraz umożliwia zapis całego wyniku klawiaturą lekcji. Całe upraszczane wyrażenie pozostaje w jednym wierszu; na węższym ekranie można je przewinąć poziomo bez łamania zapisu.
7. Ostatnia seria jest biletem wyjścia i zasila wszystkie kryteria tematu.
8. Ocena umiejętności.

## 9. Temat 4 — Zapisywanie równań

### Cel ucznia

Rozumiem znak równości jako równowagę i zapisuję równanie opisujące sytuację.

### Slajdy

1. Slajd 0.
2. **Równość to równowaga**: duża waga 3D. Znak równości świeci tylko wtedy, gdy szalki są na tej samej wysokości.
3. **Wyrażenie a równanie**: wyrażenie jest „przepisem na liczbę”, równanie jest zdaniem, że dwie wartości są równe.
4. **Z historii na wagę**: uczeń kładzie na szalkach pudełko X i odważniki zgodnie z krótką historią.
5. **Seria zadań — zbuduj równanie**: 4 różne sytuacje, wybór poprawnego równania.
6. **Bilet wyjścia**: wskaż lewą stronę, prawą stronę i znaczenie x.
7. Ocena umiejętności.

## 10. Temat 5 — Liczba spełniająca równanie

### Cel ucznia

Sprawdzam przez podstawienie, czy liczba spełnia równanie.

### Slajdy

1. Slajd 0.
2. **Kandydat do pudełka X**: uczeń wybiera liczbę, wkłada ją do pudełka, a waga oblicza obie strony.
3. **Sprawdzanie krok po kroku**: osobne obliczenie lewej i prawej strony; decyzja dopiero po porównaniu.
4. **Seria zadań — detektyw rozwiązań**: 4 różne równania; odpowiedź „spełnia/nie spełnia” oraz podgląd wartości obu stron.
5. **Znajdź kandydata**: wybór jednej liczby z czterech i natychmiastowa animacja wagi.
6. **Bilet wyjścia**: pełne sprawdzenie zapisane w dwóch kolumnach.
7. Ocena umiejętności.

## 11. Temat 6 — Rozwiązywanie równań

### Cel ucznia

Rozwiązuję proste równania, zachowując równowagę obu stron, i sprawdzam wynik.

### Slajdy

1. Slajd 0.
2. **Zdejmij to samo z obu stron**: animowane `x + a = b`; uczeń wskazuje odważniki do zdjęcia, a obie ręce robota zdejmują je jednocześnie.
3. **Dodaj to samo do obu stron**: model dla `x - a = b`.
4. **Podziel obie strony na równe grupy**: model dla `ax = b`; pudełka X i odważniki rozdzielają się na a identycznych zestawów.
5. **Pomnóż obie strony**: model dla `x : a = b` z pionowym, graficznym podziałem grup.
6. **Seria zadań — steruj wagą**: 6 unikalnych typów równań; uczeń obserwuje wagę, wpisuje x i sprawdza przez podstawienie.
7. **Bilet wyjścia**: rozwiązanie i sprawdzenie jednego równania.
8. Ocena umiejętności.

Zakaz dydaktyczny: na tym etapie interfejs nie używa hasła „przerzuć na drugą stronę i zmień znak”. Każda transformacja jest przedstawiana jako ta sama operacja wykonana po obu stronach.

## 12. Temat 7 — Zadania tekstowe

### Cel ucznia

Wybieram niewiadomą, buduję równanie, rozwiązuję je i odpowiadam w kontekście zadania.

### Stała mapa rozwiązania

1. **Co oznacza x?**
2. **Jakie zależności opisuje historia?**
3. **Jakie równanie przedstawia te zależności?**
4. **Jak rozwiązać i sprawdzić równanie?**
5. **Jak odpowiedzieć pełnym zdaniem?**

### Slajdy

1. Slajd 0.
2. **Historia zamienia się w model**: animacja zakupów/zbiorów/odległości, następnie model wagi i dopiero równanie.
3. **Wybór niewiadomej**: uczeń zaznacza pytaną wielkość i nadaje jej symbol x.
4. **Seria zadań — ułóż równanie**: 4 różne historie, nacisk na poprawne znaczenie x.
5. **Seria zadań — rozwiąż i odpowiedz**: 5 różnych historii; obowiązkowe pole wyniku i widoczna jednostka.
6. **Bilet wyjścia**: pełna pięciostopniowa mapa jednego zadania.
7. Ocena umiejętności.

## 13. Temat 8 — Powtórzenie wiadomości

### Cel ucznia

Samodzielnie stosuję wyrażenia algebraiczne i równania oraz potrafię wyjaśnić swój tok rozumowania.

### Slajdy

1. Slajd 0.
2. **Mapa działu**: interaktywny pulpit misji z pięcioma stacjami: znaczenie x, wartość wyrażenia, upraszczanie, równowaga, zadanie tekstowe.
3. **Misja 1 — język algebry**: 4 zadania.
4. **Misja 2 — maszyna wartości**: 5 zadań.
5. **Misja 3 — klocki algebraiczne**: 4 zadania.
6. **Misja 4 — laboratorium równowagi**: 6 zadań.
7. **Misja 5 — historia detektywa**: 4 zadania.
8. **Bilet końcowy**: mieszana seria 4 zadań; każde zadanie przypisane do innej umiejętności, aby ostatni slajd pokazał rzetelny profil kryteriów.
9. Ocena umiejętności.

## 14. Podział nauczyciel / uczeń

### Nauczyciel — tablica i live

- ma dostęp do wszystkich slajdów i istniejącej nawigacji;
- steruje aktualnym slajdem i aktualnym zadaniem w serii;
- widzi model w trybie prezentacyjnym, może uruchamiać i pauzować animację;
- może ujawniać kolejne kroki przykładu bez ujawniania wyniku przed dyskusją;
- widzi liczbę odpowiedzi poprawnych i bez punktu dla aktualnego zadania;
- nie pokazuje publicznie indywidualnych wyników uczniów;
- na slajdzie 0 może uzupełnić stronę i zadania z podręcznika;
- na slajdzie końcowym widzi anonimowy rozkład samooceny.

### Uczeń — live

- widzi dokładnie aktywny slajd nauczyciela;
- przy slajdzie prezentacyjnym manipuluje modelem tylko wtedy, gdy tryb ucznia to `practice`;
- przy serii rozwiązuje dokładnie aktualne zadanie;
- nie przechodzi przy pustej odpowiedzi;
- po sprawdzeniu zatwierdza punkt lub przejście bez punktu;
- nie ma dostępu do klucza odpowiedzi;
- na końcu widzi własny wynik i własne kryteria.

### Uczeń — praca własna

- korzysta z tej samej kolejności slajdów i tych samych modeli;
- może wracać do poprzednich slajdów istniejącą nawigacją;
- zadania na slajdzie pojawiają się jedno po drugim;
- odpowiedź zapisuje się odporne na chwilową utratę połączenia;
- ostatni slajd wymaga samooceny przed zakończeniem lekcji.

## 15. Dostępność

- Każda scena 3D ma równoważny opis tekstowy aktualnego stanu.
- Każdy element interaktywny działa klawiaturą.
- Fokus po przejściu do kolejnego zadania wraca do nagłówka karty.
- Stan aktywny nie jest oznaczany wyłącznie kolorem.
- Animacje można zatrzymać; ograniczony ruch jest respektowany.
- Przyciski mają co najmniej 44 px wysokości.
- Etykiety pól jednoznacznie opisują oczekiwaną odpowiedź.
- Komunikaty są ogłaszane przez `role="status"` lub `aria-live`.

## 16. Plan implementacji

1. Dodać model i generator do typów i snapshotu sesji.
2. Zbudować deterministyczny katalog aktywności i zadań.
3. Zbudować komponenty zapisu algebraicznego i pól odpowiedzi.
4. Zbudować sceny R3F: pudełko X, maszyna, klocki, waga.
5. Zbudować `AlgebraLessonLab` oraz mapowanie `stageId → activity`.
6. Podłączyć model do tablicy nauczyciela.
7. Podłączyć model do ucznia live.
8. Podłączyć model do pracy własnej.
9. Utworzyć osiem opublikowanych pakietów lekcji i dodać je przed szkieletem w rejestrze.
10. Podłączyć ilustracje do slajdów narracyjnych.
11. Ujednolicić tekst przycisku po odpowiedzi bez punktu.
12. Naprawić metrykę pierwszego slajdu tak, aby poprawnie pokazywała klasę VI i dział 8.
13. Dodać testy danych, renderowania, klawiatury, feedbacku i integracji kanałów.
14. Wykonać testy ukierunkowane, sprawdzenie typów/lint zmienionych plików i QA wizualne.

## 17. Kryteria odbioru

Implementacja jest gotowa dopiero wtedy, gdy:

- wszystkie osiem tematów Działu 8 ma status `published`;
- żaden temat nie korzysta ze szkieletowego `exercise-board` jako właściwego slajdu ćwiczeniowego;
- pierwszy i ostatni slajd każdej lekcji zachowują wspólny kontrakt;
- każdy slajd z zadaniami ma jeden nagłówek i jeden licznik;
- każde zadanie zmienia się w obrębie tego samego slajdu;
- nauczyciel i uczeń otrzymują ten sam wariant zadania;
- każde zadanie raportuje osobny wynik;
- odpowiedź bez punktu pozwala przejść dalej i używa obowiązkowego języka;
- puste pole nie przechodzi dalej;
- wszystkie liczbowe pola odpowiedzi mają `inputMode="none"`, `readOnly` i klawiaturę lekcyjną;
- modele 3D mają tekstowy odpowiednik i tryb ograniczonego ruchu;
- żaden widoczny ułamek nie jest zapisany ukośnikiem;
- testy kontraktów Działu 8 przechodzą;
- zmiany nie psują istniejącej nawigacji ani kanałów poprzednich działów.

## 18. Ryzyka i zabezpieczenia

- **Przeciążenie poznawcze 3D**: scena pokazuje jedną ideę naraz; zbędne ozdoby są ograniczone.
- **Uczenie mechanicznego „przerzucania”**: każda operacja jest animowana po obu stronach wagi.
- **Dwuznaczność znaku x i mnożenia**: litera x ma własny wygląd pudełka, a mnożenie po podstawieniu używa kropki.
- **Dublowanie serii**: model nie posiada wewnętrznego indeksu zadania; steruje nim nadrzędny slajd.
- **Rozjazd live/self-paced**: wszystkie kanały używają tego samego komponentu i ziarna.
- **Błędy w obrazach AI**: obrazy nie zawierają matematyki ani tekstu; poprawny zapis jest renderowany w React.
- **Brak WebGL**: dostępny jest pełny model HTML/SVG.
- **Klawiatura urządzenia**: kontrakt `inputMode="none" + readOnly` jest testowany, nie tylko deklarowany.
