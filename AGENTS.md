<!-- BEGIN:nextjs-agent-rules -->
<!-- CRITICAL: In student tasks for departments 1-8, every numeric/decimal/fraction answer field must suppress the device keyboard with inputMode="none" and readOnly while the lesson is active, and use the lesson keypad. This must be tested; inputMode alone is insufficient. -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Ułamki — obowiązkowy zapis na widocznych slajdach

Na każdym widocznym dla ucznia slajdzie, modelu, karcie zadania i informacji zwrotnej ułamek musi być prezentowany w zwykłym zapisie matematycznym: licznik nad kreską ułamkową i mianownik pod kreską. Nie wolno wyświetlać ułamków w zapisie tekstowym ze znakiem ukośnika, np. `1/2`, `3/8` czy `12/36`. Zapis ze znakiem ukośnika może wystąpić wyłącznie wewnątrz technicznych identyfikatorów, danych i kodu niewidocznego dla ucznia.

# LekcjaLab platform rules

Bez zalogowania dostępne są wyłącznie: prosta strona tytułowa, logowanie,
rejestracja nauczyciela, rejestracja ucznia z poprawnego zaproszenia, callback
Auth oraz ekrany statusu konta. Program, symulacje, klasy, tablica, druk i
dołączanie do live wymagają zalogowania.

Panel nauczyciela i panel ucznia używają Supabase Auth oraz Supabase Postgres.

Rejestracja nauczyciela tworzy konto oczekujące na ręczną aktywację przez admina.

Uczeń może zarejestrować się tylko z linku zaproszenia wysłanego przez nauczyciela.

Dane uczniów, klas, grup i testów muszą być separowane po szkole. Jeden nauczyciel może uczyć w wielu szkołach, a klasy o tej samej nazwie w różnych szkołach nie mogą mieszać uczniów.

# Obowiązkowy szablon kart lekcyjnych

## Instrukcja nadrzędna: slajd z zadaniami

Jeżeli użytkownik prosi o **slajd z zadaniami**, zawsze oznacza to jeden slajd zawierający całą serię zadań. Kolejne zadania mają uruchamiać się w obrębie tego samego slajdu, jedno po drugim, po zatwierdzeniu poprzedniego. Nie wolno rozdzielać tej serii na osobne slajdy ani zmieniać układu pomiędzy zadaniami.

Każdy taki slajd musi przez całą serię zachowywać identyczny układ wzorcowy: jeden wspólny nagłówek, jeden licznik `Zadanie X/Y`, jedną jasną kartę roboczą, te same miejsca na treść/model/odpowiedź, te same kontrolki i ten sam sposób prezentowania feedbacku. Zmienia się wyłącznie treść kolejnego zadania oraz stan potrzebny do jego rozwiązania.

Po poprawnym zatwierdzeniu zadania pośredniego seria ma automatycznie otwierać kolejne zadanie. Dopiero poprawne wykonanie ostatniego zadania może zgłosić zaliczenie całego slajdu do systemu punktów; wcześniejsze kroki nie mogą przedwcześnie zaliczać slajdu.

Ta instrukcja jest nadrzędna wobec pozostałych zasad projektowania kart i slajdów.

W działach 3–8 każda interaktywna karta zadania ma używać jednego wzorca wizualnego opartego na karcie „Dział II · Temat 1 — Wielokrotności”:

- zewnętrzna karta ma ciemny gradient, duże zaokrąglenie i kompaktowy nagłówek;
- w nagłówku po lewej są kolejno: `Dział N · Temat M` oraz nazwa tematu/zadania;
- informacja `Zadanie X/Y` występuje wyłącznie raz, po prawej stronie tego samego nagłówka;
- treść zadania znajduje się w jednej jasnej karcie wewnętrznej; nie wolno dodawać drugiego, konkurencyjnego paska z numerem zadania;
- jeden slajd ćwiczeniowy zawiera całą serię, lecz pokazuje w danej chwili jedno zadanie albo jedną jasno opisaną rundę; następne zadanie pojawia się w tym samym slajdzie po zatwierdzeniu poprzedniego;
- przyciski odpowiedzi są kompaktowe i nie mogą dominować nad liczbą, figurą, poleceniem ani modelem;
- nowe karty mają korzystać z `LessonTaskFrame` i `LessonTaskChoice`, zamiast odtwarzać własny nagłówek, licznik i rozmiary przycisków.

Ten szablon jest kontraktem dla nowych prac oraz każdej przebudowy istniejących slajdów w działach 3–8.

## Klasa VI — kontrakt realizacji lekcji

Każdy temat klasy VI jest realizowany technicznie tak samo jak dojrzałe tematy klasy V, z wykorzystaniem React Three Fiber wszędzie, gdzie model przestrzenny, oś, bryła, manipulacja lub animacja realnie ułatwiają zrozumienie.

- Każda lekcja ma niezmienny slajd otwierający oraz kończący.
- Zadania są interaktywne. Seria zadań działa w obrębie jednego slajdu: po zatwierdzeniu uczeń automatycznie otrzymuje kolejne zadanie, bez przełączania na osobne slajdy.
- Nauczyciel widzi poprawność każdego zadania i wskazówkę, czy odpowiedź była dobra czy błędna.
- Uczeń z niepoprawną odpowiedzią może przejść dalej, ale nie otrzymuje punktu za to zadanie.
- Nie wolno przepuścić ucznia dalej, gdy wymagane pola są puste lub nieuzupełnione — należy jasno poprosić o uzupełnienie wyniku.
- Każda interakcja musi działać zarówno w trybie nauczyciela, jak i ucznia, z zachowaniem odrębnych informacji zwrotnych oraz punktacji.
