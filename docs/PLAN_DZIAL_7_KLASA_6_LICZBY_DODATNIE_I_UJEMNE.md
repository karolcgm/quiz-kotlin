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

### Slajd 1. Pary zerowe

Interaktywny model żetonów. Uczeń dodaje i skreśla pary `+1` i `−1`, obserwując, że para ma wartość zero.

### Slajd 2. Dodawanie liczb całkowitych o tych samych znakach

8 przykładów. Najpierw dokładanie dodatnich, potem dokładanie ujemnych. Warsztat wymaga wpisania sumy wartości bezwzględnych i znaku wyniku.

### Slajd 3. Dodawanie liczb całkowitych o różnych znakach

8 przykładów. Uczeń wpisuje większą i mniejszą wartość bezwzględną, różnicę oraz znak liczby o większej wartości bezwzględnej.

### Slajd 4. Odejmowanie liczb całkowitych

8 przykładów. Obowiązkowy krok: zamiana odejmowania na dodawanie liczby przeciwnej. Dopiero potem obliczenie wyniku.

### Slajd 5. Dodawanie i odejmowanie ułamków

6 przykładów. Pola: wspólny mianownik, nowe liczniki, licznik wyniku, mianownik wyniku. Zaczynamy od tych samych mianowników, następnie przechodzimy do różnych.

### Slajd 6. Liczby dziesiętne ze znakiem

6 przykładów z miejscem na moduły i wynik. Przecinek jest dostępny na klawiaturze lekcyjnej.

### Slajd 7. Historie zmian

6 zadań: temperatura, winda, nurkowanie, saldo, gra punktowa i różnica wysokości. Uczeń wybiera działanie i uzupełnia rachunek.

## 6. Temat 3 — mnożenie i dzielenie

### Slajd 1. Reguły znaków w mnożeniu i dzieleniu

6 działań liczbowych. Uczeń porównuje znaki liczb i wybiera znak wyniku: takie same znaki dają plus, a różne znaki dają minus.

### Slajd 2. Mnożenie i dzielenie liczb całkowitych

12 przykładów w jednej serii. Działanie i liczba po znaku równości są podane, a uczeń wybiera wyłącznie znak wyniku. Ostatnie cztery przykłady zawierają iloczyny trzech albo czterech liczb całkowitych.

### Slajd 3. Mnożenie i dzielenie ułamków zwykłych

8 przykładów w jednym wspólnym slajdzie i niezmiennym układzie. Przy mnożeniu uczeń skraca po skosie, a przy dzieleniu najpierw odwraca dzielnik. Cały zapis pozostaje widoczny: działanie, znak równości, ułamki po skróceniu, kolejny znak równości i wynik. Każdy ułamek ma osobne pola licznika i mianownika w pionowym zapisie.

### Slajd 4. Mnożenie i dzielenie ułamków dziesiętnych

8 przykładów w jednym slajdzie. Przy mnożeniu uczeń wykonuje działanie pisemne bez przecinków, podaje liczbę miejsc po przecinku i wpisuje wynik. Przy dzieleniu przesuwa oba przecinki o tyle samo miejsc, zapisuje nowe liczby i wynik. Znak wyniku wybiera osobno.

### Slajd 5. Misje z powtarzaną zmianą

6 zadań osadzonych w temperaturze, nurkowaniu, saldzie, grze i ruchu windy.

## 7. Temat 4 — ekspedycja powtórzeniowa

### Slajd 1. Mapa liczb

6 krótkich decyzji o porządku, liczbach przeciwnych i odległości od zera.

### Slajd 2. Kolejność działań na liczbach naturalnych

6 przykładów przypominających kolejność bez dodatkowej trudności znaków.

### Slajd 3. Kolejność działań na liczbach całkowitych

8 przykładów. Warsztat zawiera pole „działanie wykonywane jako pierwsze” oraz jego wynik.

### Slajd 4. Kolejność działań z ułamkami

6 przykładów z pionowym zapisem ułamków i pełnym warsztatem obliczeń.

### Slajd 5. Misje wieloetapowe

6 zadań, w których trzeba ułożyć wyrażenie, wykonać działania we właściwej kolejności i zinterpretować znak wyniku.

### Slajd 6. Finał: kod stacji badawczej

8 zróżnicowanych zadań łączących cały dział. Kolejne poprawne odpowiedzi odsłaniają sensowny komunikat końcowy, a nie losowy szyfr rachunkowy.

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
