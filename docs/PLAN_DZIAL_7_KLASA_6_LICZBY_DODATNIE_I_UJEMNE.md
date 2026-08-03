# Plan przebudowy Działu VII klasy VI — liczby dodatnie i liczby ujemne

## 1. Cel komunikacyjny i dydaktyczny

Po ukończeniu działu uczeń ma rozumieć liczbę ze znakiem jako położenie lub zmianę względem zera, a nie jako zestaw reguł do zapamiętania. Uczeń powinien najpierw swobodnie działać na liczbach całkowitych, a dopiero potem przenosić dokładnie te same idee na liczby dziesiętne i ułamki zwykłe.

Po ukończeniu działu uczeń:

1. biegle dodaje, odejmuje, mnoży i dzieli dodatnie i ujemne liczby całkowite oraz ułamki;
2. stosuje reguły znaków w działaniach na liczbach dodatnich i ujemnych;
3. wykonuje działania wielodziałaniowe na liczbach dodatnich i ujemnych we właściwej kolejności.

Najważniejsza sekwencja dydaktyczna:

1. sytuacja konkretna: piętra, temperatura, saldo, wysokość;
2. model: oś liczbowa albo żetony dodatnie i ujemne;
3. działanie na liczbach całkowitych;
4. nazwanie reguły własnymi słowami;
5. przeniesienie reguły na ułamki i liczby dziesiętne;
6. pełny zapis obliczeń w warsztacie rachunkowym;
7. zadanie wieloetapowe i kolejność wykonywania działań.

## 2. Diagnoza obecnej wersji

### 2.1. Zbyt szybkie wejście w liczby wymierne

Pierwsze serie zawierają ułamki i liczby dziesiętne zanim uczeń utrwali sens liczby ujemnej na liczbach całkowitych. Powoduje to jednoczesne obciążenie trzema trudnościami: znakiem liczby, porównywaniem ułamków i zmianą postaci liczby.

### 2.2. Za mało przykładów budujących regułę

Uczeń widzi pojedynczy model, po którym niemal od razu ma rozwiązywać abstrakcyjne rachunki. Nowa wersja ma zawierać osobne serie dla przykładów naturalnych i całkowitych oraz osobne serie transferowe dla ułamków i liczb dziesiętnych.

### 2.3. Brak miejsca na tok obliczeń

Dotychczasowe zadania ułamkowe często wymagają wyłącznie wybrania albo wpisania wyniku. Nowa karta „Warsztat obliczeń” wymaga uzupełnienia kolejnych pól, np.:

- wspólny mianownik;
- nowe liczniki;
- licznik i mianownik wyniku;
- skrócony licznik i mianownik;
- licznik i mianownik odwrotności dzielnika;
- wynik działania wykonanego jako pierwszy;
- wynik całego wyrażenia.

Każde pole liczbowe ma `inputMode="none"`, `readOnly` i jest obsługiwane wyłącznie wspólną klawiaturą lekcyjną.

### 2.4. Powtórzenie bez wyraźnej narracji

Powtórzenie zostaje zastąpione „Ekspedycją od zera”: uczeń przechodzi przez mapę temperatur, sterowanie windą, laboratorium kolejności działań, warsztat ułamków i finałową misję ratunkową. Każda seria sprawdza inną decyzję, a nie tylko kolejny podobny rachunek.

## 3. Niezmienny kontrakt slajdów

- Każda lekcja zachowuje wspólny slajd otwierający i kończący generowany przez `buildLessonPackage`.
- Każdy slajd z zadaniami zawiera całą serię, ale system pokazuje jedno zadanie naraz.
- Nagłówek ma jeden licznik `Zadanie X/Y` i nie ma wewnętrznego, konkurencyjnego licznika.
- Tablica nauczyciela, tryb live ucznia oraz tryb samodzielny otrzymują to samo zadanie z tego samego `taskSeed`.
- Nauczyciel steruje zadaniami za pomocą istniejących przycisków poprzedni/następny.
- Uczeń po sprawdzeniu korzysta z istniejącego przycisku zatwierdzającego odpowiedź lub przejście bez punktu.
- Niepoprawna odpowiedź otrzymuje komunikat: `Spróbuj innym razem. Poprawny wynik to… Dziś bez punktu.`
- Puste pola nie mogą zostać zaliczone.

## 4. Temat 1 — co oznaczają liczby dodatnie i ujemne

### Slajd 1. Punktem odniesienia jest zero

6 przykładów wyłącznie na liczbach całkowitych. Uczeń interpretuje temperaturę, piętro, saldo, wysokość i zmianę położenia. Celem jest odróżnienie położenia od zmiany.

### Slajd 2. Liczby naturalne i całkowite

6 przykładów. Najpierw liczby naturalne i zero, następnie ujemne liczby całkowite. Ułamki nie pojawiają się na tym etapie.

### Slajd 3. Oś liczbowa — liczby całkowite

6 przykładów na osi. Uczeń odczytuje położenie i rozumie, że ruch w prawo zwiększa liczbę.

### Slajd 4. Porównywanie liczb całkowitych

8 przykładów, w tym dwie liczby ujemne o różnych wartościach bezwzględnych. Każde wyjaśnienie odwołuje się do położenia na osi.

### Slajd 5. Ułamki i liczby dziesiętne na tej samej osi

6 przykładów transferowych. Najpierw ułamki o prostych mianownikach, potem równoważne zapisy dziesiętne.

### Slajd 6. Porównywanie liczb wymiernych ze znakiem

8 przykładów. Uczeń może użyć wspólnego mianownika albo zamiany na zapis dziesiętny. Ułamki są zawsze wyświetlane pionowo.

### Slajd 7. Liczby przeciwne i wartość bezwzględna

6 przykładów. Model osi pokazuje dwie liczby w tej samej odległości od zera. Wartość bezwzględna jest nazywana odległością, nie „usuwaniem minusa”.

## 5. Temat 2 — dodawanie i odejmowanie

W całym temacie każdy osobny wybór znaku ma postać jednego rozwijanego pola. Po otwarciu uczeń widzi dostępne znaki, a po wskazaniu odpowiedzi lista się zamyka i pozostaje tylko wybrany znak. Strzałka rozwijania jest dyskretna, a wybrany znak i następująca po nim liczba tworzą nierozdzielny element, więc nigdy nie są przenoszone do osobnych wierszy. Nie dotyczy to zadań, w których uczeń zgodnie z poleceniem wpisuje cały wynik razem ze znakiem w jednej kratce.

### Slajd 1. Znaki stojące obok siebie

6 przykładów. Uczeń najpierw upraszcza sąsiadujące znaki: plus obok minusa zmienia na minus, a dwa minusy na plus.

### Slajd 2. Dodaj czy odejmij?

8 przykładów w jednym stałym układzie. Slajd zawiera krótką regułę, interaktywny model żetonów i tylko jeden zapis działania, np. `−6 + 1 = [kratka]`. Uczeń wpisuje cały wynik razem ze znakiem w jednej kratce. Nie ma osobnego wyboru znaku ani dodatkowych pól obliczeniowych.

### Slajd 3. Dodawanie i odejmowanie ułamków

6 przykładów. Uczeń upraszcza znaki, sam wybiera znak działania oraz znaki wyników pośrednich i końcowych bezpośrednio w łańcuchu równości, a następnie uzupełnia liczniki i mianowniki. Wybór znaku jest rozwijany: po wskazaniu `+` albo `−` lista się zamyka i w działaniu pozostaje tylko wybrany znak. Ułamki są zawsze zapisane pionowo.

### Slajd 4. Liczby dziesiętne ze znakiem

6 przykładów w takim samym układzie jak dla ułamków zwykłych. Po znaku równości uczeń wpisuje liczby uproszczonego działania, wybiera znak `+` albo `−` bezpośrednio między nimi, a po kolejnym znaku równości wybiera znak wyniku i wpisuje jego wartość. Cały rachunek pozostaje widoczny w jednej linii i jest uzupełniany klawiaturą lekcyjną.

### Slajd 5. Zadania tekstowe — pełne rozwiązanie

6 ilustrowanych zadań. Uczeń uzupełnia dane, całe działanie z wynikiem oraz odpowiedź. Wszystkie liczby, wybory znaków i wynik tworzą jeden poziomy zapis działania, bez układania kolejnych składników jeden pod drugim.

## 6. Temat 3 — mnożenie i dzielenie

W całym temacie wybór znaku działa tak samo jak w dodawaniu i odejmowaniu: uczeń rozwija jedno dyskretne pole, wybiera znak, a lista od razu się zamyka. Kontrolka znaku i następująca po niej liczba albo ułamek są nierozdzielne. Dla wyniku dodatniego w zapisie działania nie wyświetlamy znaku plus.

### Slajd 1. Reguły znaków w mnożeniu i dzieleniu

6 działań liczbowych. Uczeń porównuje znaki liczb i wybiera znak wyniku: takie same znaki dają plus, a różne znaki dają minus.

### Slajd 2. Mnożenie i dzielenie liczb całkowitych

12 przykładów w jednej serii. Działanie jest podane, ale po znaku równości uczeń sam wybiera znak wyniku i wpisuje obliczoną liczbę w pustej kratce. Ostatnie cztery przykłady zawierają iloczyny trzech albo czterech liczb całkowitych.

### Slajd 3. Mnożenie i dzielenie ułamków zwykłych

8 przykładów w jednym wspólnym slajdzie i niezmiennym układzie. Przy mnożeniu każdy ujemny czynnik jest zapisany w nawiasie, a przy dzieleniu uczeń najpierw odwraca dzielnik. Po naciśnięciu „Skróć” stare liczby zostają przekreślone, a obok nich pojawiają się osobne małe kratki na wartości po skróceniu. Kratki mają zarezerwowane miejsce i nie nachodzą na przekreślone liczby. Wybrany znak plus nie jest dopisywany przed dodatnim ułamkiem; widoczny pozostaje tylko znak minus wyniku ujemnego. Każdy ułamek jest zapisany pionowo.

### Slajd 4. Mnożenie i dzielenie ułamków dziesiętnych

8 przykładów w jednym slajdzie. Przy mnożeniu uczeń wykonuje działanie pisemne bez przecinków, podaje liczbę miejsc po przecinku i wpisuje wynik. Przy dzieleniu przesuwa oba przecinki o tyle samo miejsc, zapisuje nowe liczby i wynik. Znak wyniku wybiera osobno.

### Slajd 5. Misje z powtarzaną zmianą

6 zadań osadzonych w temperaturze, nurkowaniu, saldzie, grze i ruchu windy.

## 7. Temat 4 — powtórzenie bez dublowania wcześniejszych zadań

### Slajd 1. Szybkie przypomnienie

6 nowych przykładów na liczbach całkowitych, dziesiętnych i ułamkach. Uczeń korzysta z tego samego dyskretnego wyboru znaku, a znak i pole liczby pozostają nierozdzielne.

### Slajd 2. Połącz liczby i odkryj obrazek

Rozsypane liczby całkowite, dziesiętne i ułamki należy klikać od najmniejszej do największej. Kolejne odcinki tworzą gwiazdę, która zostaje wypełniona po poprawnym połączeniu wszystkich punktów.

### Slajd 3. Szyfr działań pamięciowych

10 krótkich przykładów dodawania, odejmowania, mnożenia i dzielenia. Występują również łatwe ułamki zwykłe i dziesiętne. Każdy wynik odsłania literę w innym miejscu hasła — nie od lewej do prawej. Odsłonięte litery pozostają widoczne po przejściu do następnego zadania, a pełne hasło „MATEMATYKA” pojawia się dopiero po ukończeniu całej serii.

### Slajd 4. Kolejność działań w liczniku i mianowniku

6 nowych wyrażeń zapisanych jako zwykły ułamek. Pierwszy przykład ma licznik `−2 · (−3) − 4 · (−7)` oraz mianownik `7 − 9`. Uczeń wpisuje wyniki dwóch działań w liczniku, wartość całego licznika, mianownika i końcowego ilorazu. Wszystkie ułamki na karcie są zapisywane pionowo.

## 8. Kryteria jakości i testy

- test obecności pierwszego i ostatniego slajdu każdego tematu;
- test kolejności progresji: całkowite przed ułamkami;
- test liczby przykładów w każdej serii;
- test jednego zadania na jeden zewnętrzny `taskSeed`;
- test braku wewnętrznego licznika i wewnętrznej nawigacji;
- test `inputMode="none"` i `readOnly` dla każdego pola liczbowego;
- test wpisywania przez `LessonNumericKeypad`;
- test blokady pustego warsztatu;
- test neutralnej informacji zwrotnej;
- test pionowego wyświetlania ułamków;
- test zgodności tablicy, live ucznia i trybu samodzielnego;
- TypeScript, ESLint, Vitest i kontrola różnic Git.
