# LekcjaLab — audyt produkcji i plan naprawczy dla Terra Medium

> Data audytu: 2026-07-10  
> Audytowana produkcja: `https://quiz-kotlin.vercel.app/`  
> Repozytorium: `quiz-kotlin`  
> Charakter dokumentu: specyfikacja wykonawcza po ręcznym audycie produkcji i analizie kodu  
> Dokument nadrzędny produktu: `LEKCJALAB_KLASA_5_MASTER_SPEC.md`

## 0. Polecenie startowe dla Terra Medium

Wykonuj ten plan jako serię małych, weryfikowalnych paczek. Nie próbuj naprawiać całej platformy w jednej sesji.

1. Przeczytaj w całości:
   - `AGENTS.md`;
   - ten dokument;
   - `LEKCJALAB_KLASA_5_MASTER_SPEC.md`;
   - lokalną dokumentację Next.js wskazaną w sekcji 15.
2. Zacznij od pierwszej niezakończonej paczki oznaczonej `P0`.
3. W jednej sesji wykonuj tylko jedną paczkę `TM-*`, chyba że dwie paczki są jawnie oznaczone jako nierozdzielne.
4. Nie uznawaj istniejącego statusu `published` za dowód kompletności lekcji.
5. Nie pokazuj przycisku prowadzącego do trasy, która kończy się `404` lub błędem serwera.
6. Nie edytuj już zastosowanych migracji Supabase. Każdą poprawkę bazy dodaj jako nową migrację.
7. Po każdej paczce uruchom testy wymagane w jej kryteriach odbioru.
8. Nie zapisuj danych logowania, tokenów ani danych testowych użytkowników w repozytorium, logach lub zrzutach ekranu.
9. Nie deklaruj paczki jako zakończonej, jeśli nie spełnia wszystkich kryteriów odbioru.
10. Po paczce przedstaw raport w formacie z sekcji 18.

Najważniejsza zasada: najpierw napraw prawdziwy przepływ jednego kompletnego, krótkiego segmentu lekcji M5-1.4, a dopiero potem powielaj rozwiązanie na pozostałe tematy. „Kompletny” nie oznacza 45 minut pracy ucznia na tablecie.

---

## 1. Najnowsza decyzja właściciela produktu

Bez zalogowania użytkownik nie może korzystać z właściwej zawartości platformy.

Anonimowo dostępne mogą pozostać wyłącznie elementy niezbędne technicznie do logowania i utworzenia konta:

- prosta strona tytułowa `/`;
- `/logowanie`;
- rejestracja nauczyciela;
- rejestracja ucznia uruchamiana prawidłowym zaproszeniem;
- callback uwierzytelnienia;
- ekrany statusu konta;
- statyczne zasoby aplikacji.

Strona tytułowa ma być spokojna i krótka. Dozwolone elementy:

- logo i nazwa LekcjaLab;
- jedno wyraźne `h1`;
- maksymalnie dwa krótkie akapity wyjaśniające przeznaczenie platformy;
- główny przycisk „Zaloguj się”;
- dyskretny link rejestracji nauczyciela;
- opcjonalnie jeden statyczny lub bardzo subtelny element hero.

Bez logowania nie wolno udostępniać:

- katalogu symulacji;
- pojedynczych symulacji;
- programu klasy V;
- katalogu klas 1–8;
- pakietów lekcji;
- generatorów;
- druku;
- widoku tablicy;
- dołączania do sesji bez przejścia przez uwierzytelnienie.

### Ważny konflikt dokumentacji

Obecny `AGENTS.md` mówi, że publiczny katalog symulacji ma pozostać dostępny bez konta. Najnowsza decyzja właściciela produktu jest przeciwna i zastępuje tę wcześniejszą zasadę.

Paczka `TM-P0-01` ma zaktualizować `AGENTS.md`, `docs/current-state.md`, testy i implementację, aby wszystkie źródła mówiły to samo. Do czasu wykonania tej paczki ten dokument jest źródłem nowej decyzji produktowej.

### Model pracy nauczyciela — wsparcie podręcznika, nie jego zastąpienie

LekcjaLab nie ma zastępować podręcznika, ćwiczeń ani metody nauczyciela. Nauczyciel prowadzi pełną lekcję na podstawie swoich książek i materiałów. Platforma ma dostarczać krótkie, dobrze wybrane narzędzia w momentach, w których technologia rzeczywiście pomaga.

Docelowe zastosowania aplikacji podczas lekcji:

- 5–20 minut prezentacji lub modelu na tablicy;
- krótkie wspólne ćwiczenie interaktywne;
- wysłanie uczniom jednej aktywności na tablety;
- szybka kartkówka live na kontach przypisanych uczniów;
- karta pracy do wydruku;
- sprawdzian działowy A/B do wykonania pisemnie;
- zapis podstawowych wyników i obserwacji nauczyciela.

Platforma nie może wymagać:

- prowadzenia całych 45 minut przez aplikację;
- wykonywania całej lekcji na tabletach;
- przepisywania podręcznika do systemu;
- budowania pełnego cyfrowego kursu przed rozpoczęciem lekcji;
- ręcznego wybierania tych samych uczniów przy każdym uruchomieniu live.

Każdy pakiet może nadal zawierać plan i materiały wspierające całą lekcję, ale część ekranowa/tabletowa ma być jawnie oznaczonym segmentem o przewidywanym czasie od 3 do 20 minut. Pozostała część lekcji odbywa się z nauczycielem, podręcznikiem, zeszytem lub materiałem papierowym.

### Obowiązkowy wybór po zalogowaniu: „Ogólne” albo konkretna klasa

Po każdym świeżym zalogowaniu nauczyciela aplikacja pokazuje proste okno wyboru kontekstu:

- karta `Ogólne`;
- karty klas, do których nauczyciel ma dostęp, pogrupowane według szkoły;
- przy większej liczbie klas wyszukiwarka po nazwie klasy i szkoły.

Wybór nie jest dekoracyjny. Określa dane, menu i wszystkie działania aplikacji.

Tryb `Ogólne` służy do:

- przeglądu klas nauczyciela;
- zarządzania zaproszeniami i podstawowymi ustawieniami;
- przeglądania wspólnej biblioteki materiałów;
- przygotowania materiału bez przypisania do konkretnej klasy;
- przejścia do wiadomości i konta.

Tryb konkretnej klasy służy do codziennego prowadzenia pracy. Po wyborze klasy nauczyciel od razu widzi:

- nazwę szkoły i klasy;
- listę wszystkich przypisanych uczniów;
- bieżący dział i ostatnio wykonany temat;
- tematy oznaczone przez nauczyciela jako wykonane;
- proponowany następny temat;
- ostatnie i aktywne aktywności;
- główne akcje: prezentacja, aktywność live, szybka kartkówka, karta pracy.

Kontekst klasy musi być stale widoczny i możliwy do zmiany jednym kliknięciem. Nie wolno polegać na samej nazwie klasy — wszystkie zapytania i akcje muszą używać zweryfikowanego `schoolId` i `class/groupId`.

Jeśli nauczyciel nie ma jeszcze żadnej klasy, aplikacja przechodzi do `Ogólne` i pokazuje jedną główną akcję „Dodaj klasę”. Jeśli ma klasy, okna wyboru nie wolno zastąpić domyślnym, niewidocznym wyborem.

### Uproszczone menu zależne od kontekstu

Nie twórz jednego wielopoziomowego menu zawierającego wszystkie funkcje platformy.

Menu `Ogólne`:

1. Start;
2. Klasy;
3. Materiały;
4. Wiadomości.

Menu konkretnej klasy:

1. Dzisiaj;
2. Plan;
3. Uczniowie;
4. Aktywności.

Znaczenie agregacji:

- `Plan` łączy program, listę tematów, oznaczanie wykonania i materiały dla tematu;
- `Uczniowie` łączy listę uczniów, podstawowe postępy i wejście w kartę ucznia;
- `Aktywności` łączy prezentację, live, szybkie kartkówki, karty pracy i ich historię;
- `Materiały` w trybie Ogólne łączy bibliotekę lekcji, modele, karty pracy i wydruki;
- wiadomości mogą być również dostępne jako ikona w nagłówku, ale nie powinny tworzyć drugiego drzewa nawigacji.

Stare trasy mogą pozostać jako redirecty kompatybilności. Nie mogą jednak nadal tworzyć równoległej nawigacji.

### Live przypisane automatycznie do wybranej klasy

Po uruchomieniu live z kontekstu klasy:

1. szkoła i klasa są już wybrane;
2. sesja jest domyślnie przypisana do wszystkich aktywnych uczniów tej klasy;
3. nauczyciel nie zaznacza ich ponownie ręcznie;
4. na kontach uczniów pojawia się aktywna karta „Nauczyciel rozpoczął aktywność”;
5. uczeń otwiera ją jednym kliknięciem;
6. jeśli uczeń zaloguje się po starcie, nadal widzi trwającą aktywność;
7. kod i QR są mechanizmem pomocniczym dla urządzenia, nie zamiennikiem konta i przypisania do klasy;
8. nieobecnego ucznia można oznaczyć jako nieobecnego, ale nie wymaga to ręcznej budowy listy uczestników od zera.

Nauczyciel wybiera typ krótkiej sesji:

- `Prezentacja` — tylko tablica/projektor, bez obowiązkowej odpowiedzi uczniów;
- `Ćwiczenie live` — jedna lub kilka interakcji na kontach uczniów;
- `Szybka kartkówka` — krótki zestaw, orientacyjnie 3–8 pytań i 5–15 minut.

### Polityka sprawdzania wiedzy

Główne sprawdziany działowe są pisemne. Aplikacja ma je generować i drukować w równoważnych wersjach A/B wraz z kluczem i punktacją. Nauczyciel może później wpisać wynik lub skróconą informację do systemu.

Cyfrowo w aplikacji wykonuje się przede wszystkim:

- szybkie kartkówki;
- krótkie ćwiczenia interaktywne;
- bilety wyjścia;
- krótkie powtórki;
- karty pracy, które mogą być cyfrowe albo drukowane.

Pełny cyfrowy moduł dużych sprawdzianów nie jest głównym produktem i nie powinien zajmować osobnej pozycji w menu. Istniejących danych nie wolno usuwać bez migracji i audytu, ale stare moduły pełnych testów można ukryć z głównej nawigacji, zachowując kompatybilność i dostęp administracyjny do historycznych wyników.

---

## 2. Zakres i metoda audytu

Audyt obejmował:

- ręczne przejście produkcji jako użytkownik niezalogowany;
- logowanie i przejście głównych tras nauczyciela;
- logowanie i przejście głównych tras ucznia;
- próbę utworzenia lekcji na żywo;
- sprawdzenie pilota M5-1.4;
- sprawdzenie lekcji M5-1.1, M5-1.2, M5-1.3 oraz wybranych pakietów dalszych działów;
- sprawdzenie generatora A/B;
- sprawdzenie obu ścieżek druku;
- analizę kodu routingu, Supabase, pakietów lekcji, modeli interaktywnych i generatorów;
- uruchomienie lint, testów jednostkowych i buildu.

W audycie użyto przekazanych kont testowych. Dane logowania nie są i nie mogą być zapisane w tym dokumencie.

Nie wysłano prawdziwego testu klasie i nie zapisano wyników papierowych. Utworzenie sesji live zakończyło się błędem przed poprawnym uruchomieniem sesji.

---

## 3. Werdykt

Warstwa wizualna jest wyraźnie lepsza niż wcześniej. Panele nauczyciela i ucznia mają spójniejszą typografię, czytelne karty, dobrą ilość wolnej przestrzeni i znacznie lepszą hierarchię wizualną.

Platforma nie jest jednak gotowa do używania podczas prawdziwej lekcji. Obecny stan to atrakcyjna powłoka z dużą ilością metadanych i scenariuszy tekstowych, ale z niewielką liczbą działających pionowych przepływów.

| Obszar | Ocena stanu | Werdykt |
|---|---:|---|
| Wygląd paneli | dobry | wyraźny postęp |
| Dostęp tylko po logowaniu | krytycznie niezgodny | treści nadal są publiczne |
| Program klasy V | częściowy | istnieje mapa 83 tematów, ale statusy zawyżają gotowość |
| Pakiety lekcji | częściowy | 82 pliki/scenariusze, głównie tekst i statyczne widoki |
| Prawdziwa interaktywność ucznia | bardzo niska | jeden rzeczywiście reaktywny model pilotażowy |
| Lekcja live | niedziałająca | błąd bazy podczas tworzenia sesji |
| Generator A/B | częściowy | podgląd działa tylko dla M5-1.4 |
| Druk | niedziałający | obie sprawdzone trasy kończą się błędem serwera |
| Testy automatyczne | niewystarczające | nie obejmują kluczowych przepływów |
| Gotowość do użycia w szkole | nie | wymagane naprawy P0 i akceptacja pilota |

### Odpowiedź na pytanie „czy jest zaimplementowane wszystko?”

Nie. Zaimplementowano dużą część struktury, routingu, UI, schematów danych i treści tekstowej. Nie zaimplementowano lub nie zweryfikowano najważniejszej wartości produktu: niezawodnej lekcji na tablicy i tabletach, pełnej interakcji ucznia, działającego druku i powtarzalnych generatorów dla programu klasy V.

---

## 4. Potwierdzone wyniki audytu produkcji

### 4.1 Dostęp bez logowania

| Trasa | Wynik bez sesji | Oczekiwany wynik | Priorytet |
|---|---|---|---:|
| `/` | rozbudowany portal z programem, klasami i symulacjami | prosta strona tytułowa + logowanie | P0 |
| `/program/klasa-5` | pełna mapa programu dostępna | przekierowanie do logowania | P0 |
| `/symulacje` | katalog dostępny | przekierowanie do logowania | P0 |
| `/symulacje/os-liczbowa` | działająca symulacja dostępna | przekierowanie do logowania | P0 |
| `/klasy/5` | zawartość dostępna | przekierowanie do logowania | P0 |
| `/dolacz/test-session` | formularz dołączania dostępny | logowanie z zachowaniem celu | P0 |
| `/nauczyciel` | przekierowanie do logowania | poprawnie | OK |
| `/uczen` | przekierowanie do logowania | poprawnie | OK |
| `/admin` | przekierowanie do logowania | poprawnie | OK |

Przyczyna w kodzie:

- `src/proxy.ts` wywołuje tylko `updateSession(request)`;
- `src/lib/supabase/proxy.ts` odświeża sesję i cookies, ale nie ma polityki tras;
- `src/app/page.tsx` celowo renderuje publiczny program, klasy i symulacje;
- `src/components/layout/AppHeader.tsx` zawsze pokazuje publiczne linki;
- obecny test E2E jawnie oczekuje, że `/symulacje` działa bez logowania.

To nie jest pojedynczy brak redirectu. Polityka dostępu, landing page, nawigacja, dokumentacja i testy są obecnie spójne ze starą decyzją i wszystkie muszą zostać zmienione razem.

### 4.2 Panel nauczyciela

Pozytywy:

- panel jest wizualnie spokojniejszy i czytelniejszy;
- boczna nawigacja ma sensowne grupy;
- Program, Lekcje, Prace, Postępy i Klasy otwierają się;
- pilot M5-1.4 ma podział na etapy i kanały Tablica/Uczeń/Druk;
- generator M5-1.4 potrafi deterministycznie przygotować warianty A i B.

Problemy:

- globalny nagłówek nadal pokazuje `Program kl. V`, `Symulacje demo`, `Klasy 1–8`, chociaż nauczyciel ma już panel i sidebar;
- część skrótów na pulpicie prowadzi przez stare nazwy tras, a potem jest przekierowywana do nowych hubów;
- nagłówek pokazuje stały kontekst „Matematyka · klasa V · plan 2026/2027”, niezależnie od faktycznie wybranej szkoły i klasy;
- brakuje widocznego przełącznika szkoły i klasy;
- konto testowe miało klasę inną niż klasa V, więc stały nagłówek wprowadza w błąd;
- część głównych stron nie ma prawidłowego `h1`;
- wskaźnik „82 gotowe lekcje” nie odpowiada realnej dojrzałości pakietów.

### 4.3 Lekcje i interaktywność

#### M5-1.4 — Kolejność działań

To najlepszy i jedyny sensowny pilot pionowy.

- ma 8 etapów;
- ma kanały Tablica/Uczeń/Druk;
- model `order-director` reaguje na wybór operatora;
- po prawidłowym wyborze pokazuje informację zwrotną;
- generator A/B potrafi utworzyć dwie równoważne wersje;
- kod zawiera przygotowaną obsługę sesji live.

Nadal brakuje potwierdzonego pełnego przepływu, ponieważ live i druk są zablokowane.

#### M5-1.1 — Fabryka liczb

- pakiet jest oznaczony jako `published`;
- ma etapy i model tablicowy;
- model pokazuje gotową liczbę i gotowy rozkład na setki, dziesiątki i jedności;
- uczeń nie buduje liczby, nie przeciąga cyfr, nie odpowiada i nie otrzymuje oceny;
- w jednym z kanałów ucznia model znika, ponieważ renderer szuka `student.modelId`, a konfiguracja ma model tylko po stronie tablicy.

To wizualizacja, nie ćwiczenie interaktywne.

#### M5-1.2 — Skoki po osi

- oś i skok są generowane z seeda;
- wynik oraz równanie są od razu pokazane;
- nie można ustawić punktu, zbudować skoku, wybrać strategii ani przesłać odpowiedzi.

To statyczny rysunek generowany z danych.

#### M5-1.3 — Prostokąt mnożenia

- siatka pokazuje gotowe wymiary i iloczyn;
- nie można zmieniać liczby wierszy i kolumn;
- uczeń nie tworzy modelu i nie odpowiada.

To statyczna reprezentacja.

#### Pozostałe pakiety

Większość została utworzona przez `src/lib/lessons/buildLessonPackage.ts`. Builder:

- ustawia `student.activityMode` na `view` niezależnie od obecności modelu;
- domyślnie ustawia `status: "published"`;
- tworzy narracyjne etapy z instrukcjami;
- zwraca pustą listę `printableResourceIds`;
- nie wymaga walidatora odpowiedzi ani definicji interakcji.

Dlatego „pakiet istnieje” nie znaczy „lekcja jest interaktywna i gotowa”.

### 4.4 Generator A/B

Potwierdzone działanie dla M5-1.4:

- blueprint `m514-kartkowka-v1` ładuje się;
- warianty A i B mają różne zadania;
- zachowują liczbę punktów i pokrycie umiejętności;
- checksum i seedy są widoczne;
- formularz „Wyślij klasie” otwiera się.

Potwierdzone ograniczenia:

- `src/lib/assessment/registry.ts` rejestruje dokładnie jeden blueprint;
- generator innych lekcji, np. M5-1.1, zwraca `404`;
- mimo tego przycisk generatora jest prezentowany zbyt szeroko;
- nie wykonano wysyłki podczas audytu, aby nie tworzyć zbędnej pracy w danych produkcyjnych.

Wniosek: silnik pilota istnieje, ale „generatory A/B dla klasy V” nie są zaimplementowane. Jest jeden blueprint dla jednego tematu.

### 4.5 Druk

Obie sprawdzone ścieżki produkcyjne zwracają stronę błędu serwera:

- druk materiałów lekcji M5-1.4;
- druk wariantu A/B z generatora M5-1.4.

Najbardziej prawdopodobne źródła błędu w kodzie:

1. `src/app/nauczyciel/lekcje/[lessonId]/druk/page.tsx` jako Server Component importuje i wywołuje `countPrintPages` z pliku oznaczonego `"use client"`.
2. `src/app/nauczyciel/lekcje/[lessonId]/generator/druk/page.tsx` analogicznie wywołuje `countAssessmentPrintPages` z Client Component.
3. Strona generatora przekazuje funkcję `buildResourceHref` z Server Component do `PrintPreviewToolbar`, czyli przez niedozwoloną granicę serializacji RSC.
4. Globalny `AppHeader` i `AppFooter` są renderowane w głównym layoucie również dla tras druku.
5. Rejestr materiałów drukowanych jest powiązany wyłącznie z `m5-1-4-printables`.
6. Większość lekcji ma `printableResourceIds: []`, choć UI sugeruje dostępność druku.

### 4.6 Lekcja live

Formularz startu sesji działa do momentu kliknięcia „Rozpocznij lekcję na żywo”. Produkcja zwraca błąd:

```text
function digest(text, unknown) does not exist
```

Źródło znajduje się w `supabase/migrations/020_lesson_sessions.sql` w funkcji `public.lesson_session_join_code_hash`. Funkcja wywołuje niekwalifikowane `digest(...)`. W projekcie Supabase rozszerzenie `pgcrypto` jest zwykle instalowane w schemacie `extensions`, a funkcja ma ograniczony `search_path`.

W konsekwencji nie dało się zweryfikować:

- utworzenia sesji;
- widoku lobby na tablicy;
- QR i kodu dołączenia;
- dołączenia ucznia;
- przesłania odpowiedzi;
- histogramu nauczyciela;
- zmiany etapu;
- zakończenia i podsumowania.

Kod klientów tablicy, nauczyciela i ucznia istnieje, ale nie wolno uznać go za działający, dopóki pełny przepływ nie przejdzie testu na środowisku z prawdziwym Supabase.

### 4.7 Panel ucznia

Pozytywy:

- pulpit jest wizualnie czytelny;
- aktywne prace i postępy mają osobne miejsca;
- starszy przepływ rozwiązywania testów nadal istnieje.

Problemy:

- „Szybki test z widgetów” używa języka technicznego zamiast języka ucznia;
- formularz pokazuje jednocześnie 125 checkboxów;
- nie ma wyszukiwarki, filtrów, grup klasowych ani ograniczenia do bieżącego planu;
- domyślnie zaznaczone są dwa przypadkowe obszary;
- wygenerowane pytania są układane jako długa strona zamiast jednego kroku na ekran;
- nie ma jasnego steppera, tempa ani poczucia ukończenia krótkiej sesji;
- uczeń nie mógł przetestować live z powodu błędu tworzenia sesji.

### 4.8 Stan testów

Podczas audytu:

```text
npm.cmd run lint   -> PASS, 0 błędów, 28 ostrzeżeń
npm.cmd test       -> PASS, 3 pliki, 14 testów
npm.cmd run build  -> PASS
```

Build nie wykrywa błędów zależnych od produkcyjnego schematu Supabase ani wszystkich błędów granicy Server/Client widocznych dopiero podczas renderowania konkretnej trasy.

Obecne testy jednostkowe obejmują tylko:

- parser polskiej liczby;
- ocenę punktową;
- generator kolejności działań.

Obecny E2E smoke:

- oczekuje publicznego katalogu symulacji, czyli testuje już nieaktualne wymaganie;
- nie obejmuje live;
- nie obejmuje druku;
- nie obejmuje generatora A/B end-to-end;
- nie obejmuje RLS i separacji szkół;
- pomija logowanie ucznia, jeśli brakuje sekretów środowiskowych.

---

## 5. Docelowa architektura dostępu i layoutów

### 5.1 Macierz dostępu

| Obszar | Anonimowy | Nauczyciel | Uczeń | Admin |
|---|---:|---:|---:|---:|
| `/` | tak, tylko prosty landing | tak lub redirect do panelu | tak lub redirect do panelu | tak lub redirect do panelu |
| logowanie/callback/status konta | tak | tak | tak | tak |
| rejestracja nauczyciela | tak | niepotrzebna po zalogowaniu | nie | nie |
| rejestracja ucznia z zaproszenia | tylko poprawny token | nie | przed utworzeniem konta | nie |
| `/program/**` | nie | tak | opcjonalnie tylko własny plan | tak |
| `/symulacje/**` | nie | tak | tylko przydzielone lub dozwolone | tak |
| `/klasy/**` | nie | tylko własne szkoły | nie | tak |
| `/nauczyciel/**` | nie | tak | nie | według polityki admina |
| `/uczen/**` | nie | nie | tak | według polityki admina |
| `/tablica/**` | nie | właściciel sesji | nie | awaryjnie według polityki |
| `/dolacz/**` | redirect do logowania | nie | po logowaniu | nie |
| `/admin/**` | nie | nie | nie | tak |

### 5.2 Minimalna techniczna allowlista

Allowlista nie oznacza, że wszystkie strony muszą być linkowane z landing page.

- `/`;
- `/logowanie`;
- `/rejestracja` w wymaganych wariantach;
- `/auth/callback`;
- `/konto/oczekuje`;
- `/konto/potwierdz-email`;
- `/konto/zablokowane`;
- pliki frameworka, favicon i statyczne zasoby;
- ewentualne endpointy wymagane przez sam proces Auth.

Każda inna trasa ma wymagać potwierdzonej sesji.

### 5.3 Zachowanie redirectu

1. Użytkownik bez sesji otwiera trasę chronioną.
2. Aplikacja przekierowuje do `/logowanie?next=<bezpieczna-trasa>`.
3. Parametr `next` może zawierać wyłącznie ścieżkę względną z tej samej aplikacji.
4. Po zalogowaniu aplikacja sprawdza rolę i dostęp do szkoły/klasy.
5. Jeśli rola pasuje, wraca do celu.
6. Jeśli rola nie pasuje, kieruje do właściwego panelu i pokazuje neutralny komunikat.
7. Nie może powstać pętla redirectów.

### 5.4 Zalecany podział layoutów

Obecny root layout zawsze renderuje `AppHeader` i `AppFooter`. To szkodzi trasom tablicy i druku.

Zalecany docelowy układ App Routera z route groups, bez zmiany URL:

```text
src/app/
  layout.tsx                 # tylko html, body, fonty i globalne providery
  (public)/
    layout.tsx               # minimalny publiczny chrome
    page.tsx                 # prosty landing
    logowanie/
    rejestracja/
    auth/
    konto/
  (app)/
    layout.tsx               # zweryfikowana sesja + chrome aplikacji
    nauczyciel/
    uczen/
    admin/
    program/
    symulacje/
    klasy/
    dolacz/
  (focus)/
    layout.tsx               # bez globalnego headera i footera
    tablica/
    drukowane widoki, jeśli routing na to pozwala
```

Jeżeli przeniesienie tras druku do wspólnej grupy jest zbyt ryzykowne, zastosuj osobny jawny mechanizm wyłączenia chrome. Nie polegaj wyłącznie na CSS, jeśli elementy nie powinny być obecne w DOM.

### 5.5 Dwie warstwy ochrony

- `proxy.ts`: szybkie odświeżenie sesji i redirect anonimowego użytkownika;
- layout/strona serwerowa: ostateczna autoryzacja roli, szkoły i zasobu.

Proxy nie zastępuje RLS. RLS nie zastępuje sprawdzenia UX. Wszystkie trzy warstwy są potrzebne:

1. redirect przed renderem;
2. autoryzacja serwerowa;
3. Supabase RLS/RPC.

---

## 6. Uczciwy model gotowości lekcji

### 6.1 Problem

Obecny pojedynczy status `published` miesza co najmniej pięć różnych pojęć:

- plik istnieje;
- treść tekstowa została wpisana;
- model jest widoczny;
- uczeń może wejść w interakcję;
- całość działa w live i druku.

To powoduje fałszywy komunikat „82 gotowe lekcje”.

### 6.2 Wymagane poziomy możliwości

Każdy pakiet ma jawnie deklarować i walidować możliwości:

| Flaga | Znaczenie |
|---|---|
| `hasMetadata` | temat, cele, kryteria sukcesu, czas i umiejętności |
| `hasNarrative` | kompletny scenariusz nauczyciela i etapy |
| `hasVisualModel` | przynajmniej jeden poprawny model wizualny |
| `hasStudentInteraction` | uczeń zmienia stan modelu lub udziela odpowiedzi |
| `hasValidation` | odpowiedź jest sprawdzana i ma informację zwrotną |
| `hasLiveFlow` | pakiet działa na tablicy, tablecie i w panelu nauczyciela |
| `hasPrintResources` | istnieje renderowalny materiał ucznia |
| `hasAnswerKey` | istnieje klucz odpowiedzi lub rubryka |
| `hasAssessmentBlueprint` | istnieje poprawny generator wariantów |
| `hasAutomatedCoverage` | testy obejmują kluczowe zachowania pakietu |
| `isManuallyAccepted` | pilot przeszedł checklistę na docelowych urządzeniach |

### 6.3 Status redakcyjny

Status redakcyjny ma być oddzielony od możliwości technicznych:

```text
draft -> content-review -> technical-review -> pilot -> ready -> archived
```

Minimalne reguły:

- builder nie może domyślnie zwracać `published`/`ready`;
- brak jawnego statusu oznacza `draft`;
- przycisk Live wymaga `hasLiveFlow`;
- przycisk Druk wymaga `hasPrintResources`;
- przycisk Generator A/B wymaga co najmniej jednego blueprintu;
- „Gotowa lekcja” wymaga statusu `ready` i wszystkich możliwości wymaganych dla danego typu lekcji;
- UI może pokazać „Scenariusz”, „Wizualizacja”, „Interakcja”, „Live”, „Druk”, zamiast jednego mylącego badge'a.

### 6.4 Stan startowy po migracji statusów

Nie wpisuj ręcznie poniższych liczb jako stałych w UI. Mają wynikać z rejestrów i walidatorów.

Na dzień audytu rozsądna interpretacja jest następująca:

- 82 pakiety mają metadane i strukturę etapów;
- wiele ma scenariusz narracyjny;
- tylko kilka odwołuje się do modeli wizualnych;
- jeden model (`order-director`) ma rzeczywistą interakcję odpowiedź–walidacja;
- jeden blueprint A/B jest w rejestrze;
- materiały drukowane w centralnym rejestrze dotyczą pilota M5-1.4;
- zero lekcji ma potwierdzony produkcyjny przepływ live;
- zero sprawdzonych tras druku działało w produkcji podczas audytu.

---

## 7. Paczki krytyczne P0

Paczki P0 muszą zostać zakończone przed rozbudową kolejnych tematów.

### TM-P0-01 — ujednolicenie decyzji i pełna bramka logowania

Cel: bez sesji dostępny jest tylko minimalny landing i techniczne trasy Auth.

Zakres:

1. Zaktualizuj `AGENTS.md` i usuń zasadę publicznego katalogu.
2. Zaktualizuj `docs/current-state.md` i `docs/testing.md`.
3. Dodaj centralną klasyfikację tras publicznych i chronionych.
4. Rozbuduj `src/proxy.ts` oraz helper Supabase tak, aby anonimowy użytkownik był przekierowywany.
5. Dodaj bezpieczny parametr `next`.
6. Zabezpiecz `/program/**`, `/symulacje/**`, `/klasy/**`, `/dolacz/**`, `/tablica/**`.
7. Zachowaj techniczne trasy Auth.
8. Uprość `src/app/page.tsx` do minimalnego landing page.
9. Usuń anonimowe CTA do programu, klas i symulacji.
10. Zmień testy E2E zgodnie z nową polityką.

Kryteria odbioru:

- [ ] w nowym kontekście przeglądarki `/` pokazuje tylko prosty landing;
- [ ] `/symulacje`, `/symulacje/os-liczbowa`, `/program/klasa-5`, `/klasy/5` przekierowują do logowania;
- [ ] `/dolacz/<id>` przekierowuje do logowania z bezpiecznym `next`;
- [ ] po logowaniu prawidłowy użytkownik wraca do dozwolonego celu;
- [ ] użytkownik uczniowski nie otworzy panelu nauczyciela;
- [ ] użytkownik nauczycielski nie otworzy panelu ucznia;
- [ ] callback Auth nie wpada w pętlę;
- [ ] rejestracja nauczyciela nadal tworzy konto oczekujące;
- [ ] rejestracja ucznia bez ważnego zaproszenia jest niemożliwa;
- [ ] E2E ma osobne testy każdej klasy tras.

Pliki startowe:

- `AGENTS.md`;
- `src/proxy.ts`;
- `src/lib/supabase/proxy.ts`;
- `src/app/page.tsx`;
- `src/components/home/*`;
- `src/components/layout/AppHeader.tsx`;
- `e2e/smoke.spec.ts`;
- `docs/current-state.md`;
- `docs/testing.md`.

### TM-P0-02 — rozdzielenie chrome public/app/focus

Cel: tablica i druk nie dziedziczą portalu, a aplikacja po zalogowaniu nie dubluje nawigacji.

Zakres:

1. Przenieś wspólny header/footer z root layoutu do właściwej grupy tras.
2. Utwórz minimalny layout publiczny.
3. Zachowaj istniejące `TeacherShell` i `StudentShell` jako główną nawigację paneli.
4. Usuń z zalogowanego headera zbędne linki publicznego portalu.
5. Widok `/tablica/[sessionId]` ma być pełnoekranowy.
6. Widoki druku mają zawierać tylko toolbar `no-print` i dokument.
7. Nie zmieniaj publicznych URL podczas używania route groups.

Kryteria odbioru:

- [ ] tablica nie zawiera globalnego headera, stopki ani sidebara;
- [ ] wydruk nie zawiera logo-nawigacji portalu, stopki portalu i przycisków;
- [ ] panel nauczyciela ma jedną główną nawigację;
- [ ] panel ucznia ma jedną główną nawigację;
- [ ] przejście pomiędzy route groups nie gubi sesji;
- [ ] build Next.js przechodzi bez konfliktu wielu root layoutów.

### TM-P0-02A — selektor „Ogólne / Klasa” i kontekst aplikacji

Cel: po zalogowaniu nauczyciel świadomie wybiera kontekst, a UI i dane są ograniczone do tego wyboru.

Zakres:

1. Po świeżym logowaniu pokaż okno wyboru `Ogólne` lub jednej z dostępnych klas.
2. Pogrupuj klasy według szkoły i pokazuj obie nazwy.
3. Zapisz wybrany kontekst w bezpiecznym mechanizmie sesyjnym lub profilu użytkownika.
4. Każdorazowo zweryfikuj zapisany kontekst względem aktualnych członkostw nauczyciela.
5. Dodaj stale widoczny przełącznik kontekstu w nagłówku.
6. Dla `Ogólne` pokaż menu: Start, Klasy, Materiały, Wiadomości.
7. Dla klasy pokaż menu: Dzisiaj, Plan, Uczniowie, Aktywności.
8. Usuń z nowej nawigacji osobne, dublujące pozycje Program, Lekcje, Prace, Postępy i pełne Testy.
9. Zachowaj stare URL jako kontrolowane redirecty lub widoki historyczne.
10. Nie mieszaj danych klas o tej samej nazwie z różnych szkół.

Kryteria odbioru:

- [ ] po logowaniu nauczyciela pojawia się wybór `Ogólne / Klasa`;
- [ ] nauczyciel widzi tylko klasy, do których aktualnie należy;
- [ ] wybór klasy zmienia menu bez przeładowania całej aplikacji lub z kontrolowanym redirectem;
- [ ] nazwa szkoły i klasy jest widoczna na każdym ekranie kontekstu klasy;
- [ ] przełączenie klasy odświeża uczniów, plan, aktywności i postępy;
- [ ] zapisany, ale odebrany dostęp do klasy zostaje odrzucony;
- [ ] tryb `Ogólne` nie agreguje list uczniów z wielu szkół w jeden zbiór;
- [ ] nauczyciel bez klas trafia do `Ogólne` z akcją „Dodaj klasę”;
- [ ] test E2E obejmuje dwie klasy o tej samej nazwie w różnych szkołach.

### TM-P0-03 — uczciwe statusy i warunkowe akcje

Cel: interfejs nie obiecuje funkcji, których pakiet nie ma.

Zakres:

1. Dodaj model możliwości z sekcji 6.
2. Zmień domyślny status w `buildLessonPackage` na `draft`.
3. Dodaj walidator manifestu pakietu.
4. Przelicz statystyki Programu z realnych możliwości.
5. Pokazuj akcję Live tylko dla pakietów live-ready.
6. Pokazuj Druk tylko, gdy istnieje zasób w rejestrze i renderer.
7. Pokazuj Generator tylko, gdy `getBlueprintsForLesson(id)` zwraca elementy.
8. Dla funkcji w przygotowaniu pokaż neutralny badge, nie aktywny link.
9. Usuń sformułowanie „82 gotowe lekcje”, dopóki nie wynika z walidacji.
10. Dodaj test integralności całego rejestru.

Kryteria odbioru:

- [ ] M5-1.1 nie pokazuje aktywnego generatora A/B;
- [ ] pakiet bez `printableResourceIds` nie pokazuje aktywnego druku;
- [ ] pakiet bez działającego live nie pokazuje „Rozpocznij live”;
- [ ] Program rozróżnia scenariusz, wizualizację, interakcję, druk i live;
- [ ] żaden link akcji z listy lekcji nie prowadzi do `404`;
- [ ] walidator CI blokuje sprzeczny manifest.

### TM-P0-04 — naprawa funkcji hashującej kod sesji live

Cel: nauczyciel może utworzyć sesję i otrzymać kod dołączenia.

Zakres:

1. Sprawdź rzeczywisty schemat rozszerzenia `pgcrypto` w Supabase.
2. Dodaj nową migrację, np. `026_fix_lesson_session_join_code_hash.sql`.
3. Użyj kwalifikowanej funkcji `digest`, np. `extensions.digest(...)`, jeśli potwierdza to baza.
4. Jawnie rzutuj algorytm na `text`, jeśli jest to wymagane.
5. Zachowaj deterministyczność i format dotychczasowego hasha.
6. Nie edytuj migracji `020_lesson_sessions.sql` jako historycznego pliku wdrożeniowego.
7. Dodaj test SQL/RPC dla utworzenia, rotacji i dołączenia.
8. Zweryfikuj RLS oraz przynależność do szkoły i klasy.

Przykład kierunku, nie kod do ślepego wklejenia:

```sql
extensions.digest(normalized_value, 'sha256'::text)
```

Przed wdrożeniem potwierdź nazwę schematu poleceniem na bazie. Nie zakładaj jej wyłącznie na podstawie typowej konfiguracji Supabase.

Kryteria odbioru:

- [ ] migracja działa na pustej bazie po migracjach 001–025;
- [ ] migracja działa na istniejącej bazie produkcyjnej;
- [ ] nauczyciel tworzy sesję M5-1.4;
- [ ] zwracany jest identyfikator, kod i dozwolone linki;
- [ ] rotacja kodu unieważnia stary kod;
- [ ] poprawny uczeń z klasy dołącza;
- [ ] uczeń innej szkoły nie dołącza;
- [ ] błędny kod nie ujawnia informacji o sesji;
- [ ] kod jawny nie jest przechowywany w bazie jako plaintext.

### TM-P0-05 — naprawa renderowania druku

Cel: obie trasy M5-1.4 renderują się i drukują jako poprawne A4.

Zakres:

1. Przenieś typ `PrintViewMode` do neutralnego pliku typów.
2. Przenieś `countPrintPages` i `countAssessmentPrintPages` do modułu bez `"use client"`.
3. Nie importuj funkcji runtime z Client Component do Server Component.
4. Usuń prop funkcyjny `buildResourceHref` przekazywany przez granicę RSC.
5. Zastąp go serializowalną strukturą linków albo jawnym wariantem routingu.
6. Oddziel dokument drukowany od toolbara.
7. Ukryj cały chrome aplikacji w wydruku.
8. Dodaj obsługę pustego lub nieistniejącego zasobu bez błędu 500.
9. Dodaj testy dla `student`, `key`, `key-separate`, wersji A i B.

Sugerowany podział:

```text
src/types/print.ts
src/lib/print/pagination.ts
src/lib/print/printLinks.ts
src/components/print/PrintPreviewToolbar.tsx
src/components/lessons/LessonPrintDocument.tsx
src/components/assessment/AssessmentPrintDocument.tsx
```

Kryteria odbioru:

- [ ] druk zasobu lekcji M5-1.4 zwraca 200;
- [ ] druk generatora M5-1.4 A zwraca 200;
- [ ] druk generatora M5-1.4 B zwraca 200;
- [ ] widok klucza działa;
- [ ] żaden Server Component nie wywołuje eksportu runtime z modułu `"use client"`;
- [ ] żaden Server Component nie przekazuje funkcji do Client Component;
- [ ] podgląd nie ma błędu RSC w konsoli;
- [ ] A4 nie ucina treści przy skali 100%;
- [ ] header, sidebar, footer i toolbar nie pojawiają się na papierze.

### TM-P0-06 — regresja krytycznych przepływów

Cel: P0 nie wróci przy kolejnym refaktorze.

Zakres E2E:

- anonimowy dostęp i redirect;
- logowanie nauczyciela;
- wybór `Ogólne / Klasa` po logowaniu;
- zmiana menu i danych po przełączeniu klasy;
- logowanie ucznia;
- kontrola ról;
- utworzenie live;
- automatyczne przypisanie live do uczniów wybranej klasy;
- dołączenie ucznia;
- odpowiedź live;
- druk lekcji;
- druk A/B;
- brak martwych CTA.

Kryteria odbioru:

- [ ] testy nie zawierają sekretów w kodzie;
- [ ] lokalne konta testowe pochodzą z seedów lub env;
- [ ] testy potrafią działać na środowisku preview z osobną bazą;
- [ ] CI uruchamia lint, unit, build i krytyczny smoke;
- [ ] raport testów wskazuje dokładną zepsutą paczkę.

---

## 8. P1 — jeden kompletny pionowy segment lekcji M5-1.4

Nie zaczynaj masowej produkcji interaktywności, zanim ta bramka nie przejdzie.

Pilot nie ma przenosić całej 45-minutowej lekcji na ekran. Ma udowodnić, że nauczyciel może wpleść w lekcję krótki segment prezentacji, ćwiczenia lub kartkówki, automatycznie dostępny dla wybranej klasy.

### TM-P1-01 — pełny przepływ nauczyciel → tablica → uczeń

Scenariusz odbiorowy:

1. Nauczyciel loguje się i w oknie startowym wybiera klasę.
2. Otwiera `Dzisiaj` albo temat M5-1.4 z `Planu`.
3. Wybiera `Prezentacja`, `Ćwiczenie live` albo `Szybka kartkówka`.
4. Szkoła, klasa i lista aktywnych uczniów są przypisane automatycznie.
5. Tablica otwiera segment bez chrome portalu.
6. W trybie uczniowskim na kontach przypisanych dzieci pojawia się aktywna karta.
7. Uczeń otwiera aktywność jednym kliknięciem; kod nie jest wymagany w typowym przepływie.
8. Nauczyciel rozpoczyna etap.
9. Uczeń wybiera następne działanie.
10. Odpowiedź trafia do sesji.
11. Nauczyciel widzi liczbę odpowiedzi i anonimowy rozkład.
12. Nauczyciel może wysłać kolejne krótkie pytanie albo zakończyć aktywność.
13. Tablet aktualizuje stan bez ręcznego odświeżania.
14. Po maksymalnie 20 minutach nauczyciel wraca do pracy z podręcznikiem lub zeszytem.
15. Uczeń widzi krótkie podsumowanie, a nauczyciel dowody umiejętności.

Wymagania jakościowe:

- opóźnienie aktualizacji docelowo poniżej 2 sekund, awaryjnie polling do 3 sekund;
- ponowne połączenie nie duplikuje odpowiedzi;
- odświeżenie strony nie usuwa przynależności do sesji;
- nie można odpowiadać na zamknięty etap;
- nauczyciel innej szkoły nie widzi sesji;
- aktywność pojawia się automatycznie tylko uczniom przypisanym do wybranej klasy;
- kod/QR pozostaje czytelnym mechanizmem awaryjnym, ale nie jest główną ścieżką;
- segment ma widoczny przewidywany czas i nie udaje pełnej lekcji tabletowej;
- UI ma stany: łączenie, połączono, offline, ponawianie, zakończono.

### TM-P1-02 — tryb tablicy

Wymagania:

- pełny ekran 16:9 i 4:3;
- minimum 44 px dla interaktywnych celów, preferowane 56–64 px na tablicy;
- tryb prowadzenia nie ujawnia poprawnej odpowiedzi przed decyzją nauczyciela;
- nauczyciel może pokazać/ukryć rozwiązanie;
- nauczyciel może cofnąć, ponowić przykład i przejść do konkretnego etapu;
- histogram nie zasłania modelu;
- żaden element administracyjny nie trafia na ekran uczniów;
- klawiatura i dotyk działają równolegle.

### TM-P1-03 — generator, wysyłka i papier M5-1.4

Wymagania:

- główny sprawdzian jest projektowany do wydruku i pisemnego wykonania;
- wersje A i B mają tę samą liczbę punktów i pokrycie umiejętności;
- seed i checksum są zamrożone przy wysyłce;
- podgląd dokładnie odpowiada wydrukowi;
- wydruk ucznia nie zawiera odpowiedzi;
- klucz zawiera odpowiedzi i punktację;
- szybka kartkówka cyfrowa może zostać wysłana klasie i tworzy jedną aktywność z poprawnym snapshotem;
- odświeżenie nie tworzy duplikatu;
- wynik cyfrowy i wpis papierowy trafiają do wspólnej mapy dowodów;
- nauczyciel może wydrukować listę uczniów/wersji bez ujawniania niepotrzebnych danych.

Pełny cyfrowy sprawdzian działowy nie jest kryterium odbioru pilota. Kryterium stanowią: dobry wydruk A/B, klucz, możliwość wpisania wyniku oraz krótka kartkówka cyfrowa/live.

### TM-P1-04 — ręczna Bramka B

Zaktualizuj `docs/bramka-b-checklist.md`. Nie akceptuj jej automatycznie.

Wymagane urządzenia:

- tablica/projektor 1024×768;
- laptop nauczyciela 1366×768;
- tablet ucznia około 10 cali w pionie i poziomie;
- telefon jako wariant awaryjny;
- drukarka A4, skala 100%, czarno-biały.

Dopiero po zaznaczeniu wszystkich punktów można ustawić M5-1.4 jako `ready` i rozpocząć P2.

---

## 9. P2 — prawdziwy system interaktywności

### 9.1 Kontrakt modelu

Nie buduj kolejnych statycznych SVG nazywanych interaktywnymi. Każdy model ucznia powinien mieć:

- deterministyczny `seed`;
- jawny stan początkowy;
- dozwolone akcje użytkownika;
- reducer lub równoważną maszynę stanu;
- walidator odpowiedzi;
- feedback poprawny/niepoprawny;
- licznik prób, jeśli dydaktycznie potrzebny;
- reset;
- nowy przykład;
- tryb `board`, `student-practice`, `student-live`, `assessment`;
- serializowalny zapis odpowiedzi;
- mapowanie na `skillId`;
- obsługę myszy, dotyku i klawiatury;
- tekstową alternatywę dla elementów przeciąganych;
- test logiki niezależny od Reacta.

Przykładowy kierunek typów:

```ts
type InteractionMode =
  | "board"
  | "student-practice"
  | "student-live"
  | "assessment";

interface InteractionEvidence {
  skillId: string;
  itemId: string;
  seed: number;
  answer: unknown;
  isCorrect: boolean;
  attempts: number;
  durationMs?: number;
}
```

To tylko kierunek. Dopasuj typy do istniejącego modelu danych i unikaj równoległego, niespójnego systemu odpowiedzi.

### TM-P2-01 — rejestr modeli i walidacja konfiguracji

- zastąp serię warunków `modelId === ...` typowanym rejestrem rendererów;
- każdy model deklaruje obsługiwane tryby;
- walidator pakietu wykrywa nieznane `modelId`;
- walidator wykrywa `respond/practice` bez walidatora;
- walidator wykrywa model tablicy, który przypadkowo znika w kanale ucznia;
- model niedostępny ma jawny fallback diagnostyczny w development, nie pustkę.

### TM-P2-02 — M5-1.1 Fabryka liczb

Minimalna wartościowa interakcja:

- uczeń losuje lub otrzymuje liczbę;
- przeciąga cyfry do kolumn setek, dziesiątek i jedności albo wybiera je klawiaturą;
- buduje zapis rozwinięty;
- porównuje dwie liczby przez wybór `<`, `=` lub `>`;
- model nie pokazuje wyniku przed odpowiedzią;
- feedback wskazuje pierwszą kolumnę rozstrzygającą porównanie;
- tryb wsparcia używa mniejszych liczb;
- tryb wyzwania obejmuje zera wewnętrzne i większy zakres zgodny z planem;
- odpowiedź zapisuje dowód umiejętności.

### TM-P2-03 — M5-1.2 Skoki po osi

Minimalna wartościowa interakcja:

- uczeń ustawia punkt startowy;
- wybiera kierunek;
- buduje jeden lub kilka skoków;
- może rozbić działanie na dziesiątki i jedności;
- punkt końcowy nie jest ujawniony przed wykonaniem;
- model waliduje wynik i strategię;
- istnieje alternatywa bez drag-and-drop;
- tablica potrafi animować kolejne kroki kontrolowane przez nauczyciela.

### TM-P2-04 — M5-1.3 Prostokąt mnożenia

Minimalna wartościowa interakcja:

- uczeń wybiera liczbę rzędów i kolumn;
- siatka aktualizuje się natychmiast;
- uczeń podaje iloczyn;
- może rozłożyć prostokąt na dwa prostokąty;
- model pokazuje równoważne strategie dopiero po próbie;
- błędna odpowiedź nie kończy zadania bez wskazówki;
- dane odpowiedzi nadają się do live i testu.

### TM-P2-05 — rozwinięcie M5-1.4

Obecny model jest dobrym punktem startowym, ale powinien oferować:

- wybór operatora bez ujawniania całego rozwiązania;
- krokowe upraszczanie wyrażenia;
- wizualne zaznaczenie aktualnie wykonywanego fragmentu;
- cofnięcie kroku;
- reset;
- nowy seed;
- podpowiedź na żądanie;
- rozróżnienie błędu reguły od błędu rachunkowego;
- obsługę nawiasów;
- serializowany przebieg rozwiązania, nie tylko odpowiedź końcową.

### Wspólne kryteria odbioru P2

- [ ] uczeń wykonuje działanie, a nie tylko ogląda gotowy wynik;
- [ ] model nie zdradza odpowiedzi przed próbą;
- [ ] poprawna i błędna odpowiedź mają różny, czytelny feedback;
- [ ] działanie można wykonać dotykiem i klawiaturą;
- [ ] stan nadaje się do wysłania w live;
- [ ] logika ma testy jednostkowe;
- [ ] komponent ma test przeglądarkowy;
- [ ] tryb tablicy i ucznia korzystają z tej samej logiki domenowej.

---

## 10. P3 — pełna klasa V bez fałszywej masowej publikacji

### 10.1 Zasada produkcji treści

Nie twórz 81 kolejnych kopii narracyjnego buildera. Każdy temat musi zostać przypisany do rodziny interakcji i rodziny sprawdzania.

Przykładowe rodziny:

- oś liczbowa;
- wartość pozycyjna;
- grupowanie i prostokąt mnożenia;
- ułamki jako część, oś i porównanie;
- dziesiętne i pieniądze;
- geometria manipulacyjna;
- jednostki i pomiary;
- dane, tabela i wykres;
- zadania tekstowe z modelem;
- ćwiczenia odpowiedzi liczbowej lub wyboru;
- powtórzenie działu;
- sprawdzian A/B.

Najpierw buduj przetestowany silnik rodziny, później konfiguracje tematów.

### 10.2 Kolejność

1. Dział 1 jako pełny standard jakości.
2. Dział 2 po akceptacji działu 1.
3. Działy 3–4.
4. Działy 5–6.
5. Działy 7–8.
6. Diagnoza wejściowa i powtórzenia.

### 10.3 Definicja kompletnego tematu

Temat jest `ready`, gdy ma:

- zgodność z planem klasy V;
- cel ucznia i kryteria sukcesu;
- krótką wskazówkę, jak włączyć materiał w lekcję prowadzoną z podręcznikiem;
- cyfrowy segment o czasie od 3 do 20 minut, jeśli technologia wnosi wartość;
- przynajmniej jedną wartościową aktywność ucznia;
- wariant tablicowy;
- opcjonalny wariant tabletowy tylko tam, gdzie uczeń rzeczywiście ma coś wykonać;
- alternatywę papierową;
- klucz/rubrykę;
- dowód umiejętności;
- wsparcie i wyzwanie;
- obsługę typowych błędów;
- testy logiki;
- test renderowania;
- ręczną akceptację treści matematycznej i języka polskiego.

Pakiet nie musi i nie powinien wymuszać 45 minut pracy ekranowej. Nie każdy temat musi mieć osobny rozbudowany generator A/B, ale każdy temat musi mieć uczciwie opisaną formę sprawdzenia. Sprawdziany działowe muszą mieć równoważne warianty papierowe. Cyfrowe mają być przede wszystkim szybkie kartkówki i ćwiczenia.

### 10.4 Widok postępu implementacji dla zespołu

Dodaj narzędzie developerskie lub skrypt raportujący:

```text
topicId | narrative | interactive | validated | live | print | assessment | tests | accepted
```

Raport ma być generowany z rejestrów i testów, nie ręcznie wpisany do komponentu.

---

## 11. P4 — korekta UX nauczyciela

### TM-P4-01 — prawdziwy kontekst szkoły i klasy

Wymagania:

- po świeżym logowaniu pokaż okno wyboru `Ogólne / Klasa`;
- przełącznik szkoły widoczny dla nauczyciela pracującego w wielu szkołach;
- po wyborze szkoły lista zawiera tylko jej klasy;
- wybór klasy aktualizuje plan, uczniów, sesje, prace i wyniki;
- nagłówek nie może na stałe twierdzić „klasa V”, jeśli wybrano inną klasę;
- ostatni kontekst może być zapamiętany, ale musi być ponownie autoryzowany;
- każda akcja serwerowa ponownie sprawdza członkostwo;
- klasy o tej samej nazwie w dwóch szkołach nie mieszają danych;
- w kontekście klasy od razu pokaż wszystkich przypisanych uczniów;
- uruchomienie live automatycznie przypisuje aktywność do tej klasy.

### TM-P4-02 — jedna architektura informacji

Docelowe pozycje w trybie `Ogólne`:

- Start;
- Klasy;
- Materiały;
- Wiadomości.

Docelowe pozycje w kontekście klasy:

- Dzisiaj;
- Plan;
- Uczniowie;
- Aktywności.

`Plan` agreguje Program i Lekcje. `Uczniowie` agreguje listę klasy i podstawowe Postępy. `Aktywności` agregują prezentację, live, szybkie kartkówki, karty pracy, wydruki i historię. Pełne Testy nie są osobną główną pozycją.

Usuń z widocznego UI dublujące skróty do starych indeksów, jeżeli nie dodają wartości. Redirecty legacy mogą pozostać dla starych linków i danych historycznych, ale nowe komponenty powinny linkować bezpośrednio do tras docelowych.

### TM-P4-02A — wykonane tematy w kontekście klasy

Wymagania:

- wykorzystaj istniejące `topic_plan_entries` i pola `status`, `completed_at`, `completed_by`; nie twórz drugiego równoległego systemu postępu programu;
- status wykonania jest zapisany osobno dla każdej klasy i tematu;
- nauczyciel może jednym kliknięciem oznaczyć temat jako wykonany i cofnąć oznaczenie;
- zapis zawiera co najmniej `topicId`, `class/groupId`, `schoolId`, `completedAt`, `completedBy`;
- oznaczenie nie wynika automatycznie z samego otwarcia materiału;
- `Plan` wyraźnie pokazuje wykonane, bieżące i kolejne tematy;
- ekran `Dzisiaj` proponuje następny niewykonany temat, ale nauczyciel może wybrać inny;
- opcjonalna krótka notatka może zawierać np. zakres z podręcznika, bez przepisywania całej lekcji;
- status jednej klasy nie zmienia statusu klasy o tej samej nazwie w innej szkole.

### TM-P4-03 — przygotowanie i prowadzenie lekcji

Ekran lekcji powinien odpowiadać na cztery pytania nauczyciela:

1. Czego dziś uczę?
2. Co przygotować?
3. Jak poprowadzić kolejne etapy?
4. Co zrobić, gdy technologia zawiedzie?

Główne akcje, tylko jeśli dostępne:

- Pokaż prezentację;
- Uruchom ćwiczenie live;
- Wyślij szybką kartkówkę;
- Drukuj kartę pracy;
- Drukuj sprawdzian A/B;
- Oznacz temat jako wykonany.

Nie pokazuj sześciu równorzędnych przycisków. Jedna akcja ma być główna zależnie od stanu lekcji, pozostałe w logicznych grupach.

### TM-P4-04 — dostępność i hierarchia

- dokładnie jedno sensowne `h1` na stronie;
- logiczne `h2` i `h3`;
- widoczny focus;
- kontrast WCAG AA;
- komunikaty błędów powiązane z polami;
- status nie może opierać się wyłącznie na kolorze;
- touch target minimum 44×44 px;
- dialogi zamykalne klawiaturą;
- komunikaty live ogłaszane przez odpowiednie regiony ARIA;
- brak poziomego scrolla na 1024 px.

---

## 12. P5 — korekta UX ucznia

### TM-P5-01 — zastąp „Szybki test z widgetów”

Nazwa dla ucznia: „Krótka powtórka” albo „Poćwicz 5 minut”. Nie używaj słowa „widget”.

Nowy przepływ:

1. Pokaż bieżący dział i rekomendowane umiejętności z planu klasy.
2. Pozwól wybrać maksymalnie 1–3 obszary.
3. Dodatkowe obszary schowaj pod wyszukiwarką i filtrem.
4. Pokaż liczbę pytań i przewidywany czas.
5. Po rozpoczęciu pokazuj jedno pytanie na ekran.
6. Dodaj postęp, np. „2 z 5”.
7. Po odpowiedzi pokaż krótki feedback.
8. Na końcu pokaż wynik, jedną mocną stronę i jedną rekomendację.
9. Zapisz dowody umiejętności.

### TM-P5-02 — tablet ucznia podczas live

Tablet jest narzędziem krótkiego segmentu, a nie miejscem wykonywania całej lekcji. Typowa aktywność trwa 3–15 minut, a bez wyraźnego powodu nie może przekraczać 20 minut.

Na ekranie ma być tylko to, co potrzebne w bieżącym etapie:

- tytuł lub krótka instrukcja;
- główny model/odpowiedź;
- stan wysyłki;
- przycisk pomocy, jeśli nauczyciel go dopuścił;
- informacja „czekaj na nauczyciela” po wysłaniu.

Bez pełnej nawigacji, katalogu, ocen i rozpraszających linków podczas aktywnej sesji.

Jeśli nauczyciel uruchamia aktywność w wybranej klasie, uczniowie nie szukają jej w katalogu i nie wpisują kodu w zwykłym scenariuszu. Aktywność pojawia się automatycznie na ich kontach. Po zakończeniu wracają do prostego pulpitu, a dalsza lekcja może odbywać się bez urządzenia.

### TM-P5-03 — błędy, offline i bezpieczeństwo emocjonalne

- nie pokazuj publicznego rankingu uczniów;
- histogram na tablicy ma być anonimowy;
- błędna odpowiedź ma zachęcać do kolejnej próby;
- offline zapisuje odpowiedź lokalnie i jasno informuje o ponowieniu;
- wielokrotne kliknięcie nie tworzy duplikatów;
- uczeń nie widzi odpowiedzi innych uczniów;
- po zakończeniu sesji nie można wysłać kolejnej odpowiedzi.

---

## 13. Dane, szkoły i RLS — wymagania nienegocjowalne

Platforma jest wieloszkolna.

1. Nauczyciel może mieć członkostwo w wielu szkołach.
2. Każda klasa należy do jednej szkoły.
3. Uczeń, grupa, praca, sesja i wynik muszą być rozstrzygalne w kontekście szkoły.
4. Nazwa klasy nie jest globalnym identyfikatorem.
5. Server Action nie może ufać `schoolId` przesłanemu z klienta bez weryfikacji członkostwa.
6. RLS musi blokować odczyt i zapis danych innej szkoły.
7. Snapshot pracy ma zachować kontekst szkoły i klasy.
8. Zaproszenie ucznia ma być jednorazowe lub kontrolowanie wielokrotne, wygasające i powiązane ze szkołą/klasą.
9. Kod live nie zastępuje logowania ucznia.
10. Admin i nauczyciel nie mogą przypadkiem otrzymać szerszych danych przez RPC `security definer`.

Minimalne testy izolacji:

- nauczyciel A w szkole A nie odczyta klasy szkoły B;
- nauczyciel należący do A i B widzi obie szkoły, ale osobno;
- dwie klasy „5A” w dwóch szkołach nie mieszają uczniów;
- uczeń z klasy A nie dołączy do sesji klasy B;
- identyfikator zasobu w URL nie omija RLS;
- wpis wyniku papierowego wymaga prawa do konkretnej klasy;
- eksport/druk nie zawiera uczniów innej szkoły.

---

## 14. Stany UX wymagane w każdym module

Każdy ekran danych i każda główna akcja muszą mieć:

- loading;
- empty state;
- success;
- błąd walidacji;
- błąd uprawnień;
- błąd sieci;
- możliwość bezpiecznego ponowienia;
- stan disabled podczas zapisu;
- ochronę przed podwójnym submit;
- komunikat, co użytkownik może zrobić dalej.

Nie pokazuj surowego komunikatu PostgreSQL użytkownikowi. Produkcja może logować kod diagnostyczny po stronie serwera, a UI ma pokazać komunikat w rodzaju:

> Nie udało się rozpocząć sesji. Spróbuj ponownie. Jeśli problem wróci, podaj administratorowi kod zdarzenia.

---

## 15. Pliki i dokumentacja, które model musi przeczytać przed zmianami

Projekt używa Next.js 16 z lokalną dokumentacją, która ma pierwszeństwo przed pamięcią modelu.

Przed paczkami routingu i Auth przeczytaj:

- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`;
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md`;
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`;
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`;
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`;
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`.

Mapa kodu do audytowanych problemów:

| Obszar | Pliki startowe |
|---|---|
| bramka Auth | `src/proxy.ts`, `src/lib/supabase/proxy.ts` |
| publiczny landing | `src/app/page.tsx`, `src/components/home/*` |
| globalny chrome | `src/app/layout.tsx`, `src/components/layout/AppHeader.tsx`, `AppFooter.tsx` |
| shell nauczyciela/ucznia | `src/app/nauczyciel/layout.tsx`, `src/app/uczen/layout.tsx`, `src/components/shells/*` |
| program i statusy | `src/components/program/ProgramViews.tsx`, `src/data/program/*`, `src/data/lessons/registry.ts` |
| builder lekcji | `src/lib/lessons/buildLessonPackage.ts` |
| renderer etapów | `src/components/lessons/LessonStageView.tsx` |
| modele | `src/components/lessons/models/*` |
| live UI | `src/components/live/*`, `src/app/tablica/*`, `src/app/uczen/sesja/*` |
| live DB | `supabase/migrations/020_lesson_sessions.sql` i nowa migracja 026+ |
| blueprinty | `src/lib/assessment/registry.ts`, `src/data/assessments/*` |
| druk lekcji | `src/app/nauczyciel/lekcje/[lessonId]/druk/page.tsx`, `LessonPrintDocument.tsx` |
| druk A/B | `src/app/nauczyciel/lekcje/[lessonId]/generator/druk/page.tsx`, `AssessmentPrintDocument.tsx` |
| toolbar druku | `src/components/print/PrintPreviewToolbar.tsx` |
| szybka powtórka | `src/components/practice/QuickPracticeBuilder.tsx` |
| testy | `e2e/*`, `src/**/*.test.*`, `.github/workflows/test.yml` |

---

## 16. Strategia testów

### 16.1 Testy jednostkowe

Wymagane nowe grupy:

- klasyfikacja tras i bezpieczny `next`;
- manifest możliwości lekcji;
- walidacja rejestru modeli;
- reducer każdego modelu interaktywnego;
- walidatory odpowiedzi;
- deterministyczność seedów;
- parytet A/B;
- paginacja druku;
- budowanie serializowalnych linków druku;
- mapowanie odpowiedzi na dowód umiejętności.

### 16.2 Testy integracyjne Supabase

- tworzenie sesji;
- rotacja kodu;
- dołączenie ucznia;
- zmiana etapu;
- zapis odpowiedzi idempotentny;
- zakończenie sesji;
- wpis wyniku papierowego;
- RLS szkoła A kontra szkoła B;
- nauczyciel w wielu szkołach;
- zaproszenie ucznia.

### 16.3 E2E przeglądarkowe

Minimalny zestaw przed wydaniem:

```text
auth-anonymous.spec.ts
auth-roles.spec.ts
teacher-context-selector.spec.ts
teacher-context.spec.ts
lesson-m514-live.spec.ts
lesson-m514-class-auto-assignment.spec.ts
lesson-m514-print.spec.ts
lesson-m514-generator.spec.ts
student-live.spec.ts
student-practice.spec.ts
no-dead-lesson-actions.spec.ts
```

### 16.4 Test produkcyjny/preview

Testy destrukcyjne i tworzące dane uruchamiaj na osobnym środowisku preview z osobną bazą. Produkcja może mieć wyłącznie kontrolowany smoke z oznaczonymi kontami testowymi i sprzątaniem utworzonych danych.

### 16.5 Komendy obowiązkowe

Na Windows:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
```

Jeśli dodano migrację, sam build nie wystarcza. Trzeba wykonać test na Supabase z faktycznie zastosowaną migracją.

---

## 17. Globalna definicja gotowości platformy

Platforma może zostać uznana za gotową do pilota szkolnego dopiero, gdy:

- [ ] anonimowy użytkownik nie korzysta z treści edukacyjnych;
- [ ] landing jest prosty i szybki;
- [ ] role i szkoły są chronione na poziomie serwera i RLS;
- [ ] po logowaniu nauczyciel wybiera `Ogólne` albo rzeczywistą klasę;
- [ ] menu ma maksymalnie cztery główne pozycje zależne od kontekstu;
- [ ] nauczyciel widzi wszystkich uczniów wybranej klasy i wykonane tematy;
- [ ] M5-1.4 przechodzi pełny, krótki segment live z co najmniej dwoma uczniami;
- [ ] aktywność live pojawia się automatycznie na kontach uczniów wybranej klasy;
- [ ] segment tabletowy trwa maksymalnie 20 minut i nie jest warunkiem wykonania całej lekcji;
- [ ] M5-1.4 drukuje poprawny arkusz i klucz;
- [ ] warianty A/B są równoważne i zamrożone;
- [ ] główny sprawdzian działowy jest gotowy do pisemnego wykonania;
- [ ] cyfrowe sprawdzanie koncentruje się na szybkich kartkówkach i ćwiczeniach;
- [ ] wynik cyfrowy i papierowy trafiają do postępów;
- [ ] przynajmniej dział 1 ma zaakceptowane prawdziwe interakcje;
- [ ] żadna widoczna akcja nie prowadzi do `404` lub 500;
- [ ] statusy Programu odzwierciedlają realną gotowość;
- [ ] szybka powtórka ucznia jest ograniczona do planu i czytelna na tablecie;
- [ ] tablica działa bez portalu wokół;
- [ ] druk działa bez chrome aplikacji;
- [ ] testy krytyczne przechodzą na środowisku z Supabase;
- [ ] `docs/current-state.md` opisuje faktyczny, nie planowany stan.

Pełna gotowość klasy V wymaga dodatkowo przejścia definicji kompletnego tematu dla całego wymaganego planu.

---

## 18. Obowiązkowy raport Terra Medium po każdej paczce

Użyj dokładnie tego formatu:

```markdown
## Raport paczki TM-...

### Wynik
- Zakończona / Niezakończona / Zablokowana

### Zmienione pliki
- `ścieżka` — krótko co i dlaczego

### Migracje
- brak / nazwa nowej migracji
- gdzie została faktycznie zastosowana

### Testy
- `komenda` — PASS/FAIL

### Ręczna weryfikacja
- scenariusz
- oczekiwany wynik
- rzeczywisty wynik

### Kryteria odbioru
- [x] spełnione
- [ ] niespełnione — powód

### Ryzyka i ograniczenia
- tylko faktycznie istniejące

### Następna paczka
- dokładnie jeden rekomendowany identyfikator TM-...
```

Nie używaj sformułowań „powinno działać”, „prawdopodobnie gotowe” ani „zakończone” bez testu odpowiadającego danej funkcji.

---

## 19. Kolejność wykonania — skrót

```text
TM-P0-01  bramka logowania i zgodna dokumentacja
TM-P0-02  layout public/app/focus
TM-P0-02A wybór Ogólne/Klasa i menu kontekstowe
TM-P0-03  uczciwe statusy i warunkowe CTA
TM-P0-04  naprawa bazy dla live
TM-P0-05  naprawa obu ścieżek druku
TM-P0-06  regresja krytyczna
     ↓
TM-P1-01  krótki live M5-1.4 przypisany do klasy
TM-P1-02  tryb tablicy
TM-P1-03  pisemne A/B + szybka kartkówka cyfrowa
TM-P1-04  ręczna Bramka B
     ↓
TM-P2-01  kontrakt i rejestr modeli
TM-P2-02  interaktywne M5-1.1
TM-P2-03  interaktywne M5-1.2
TM-P2-04  interaktywne M5-1.3
TM-P2-05  rozwinięte M5-1.4
     ↓
P3         produkcja działami według rodzin interakcji
P4/P5      dalszy UX nauczyciela i ucznia
```

P0 jest blokadą techniczną. P1 jest blokadą produktową. P2 jest wzorcem jakości. Dopiero P3 skaluje treść na całą klasę V.

---

## 20. Końcowa rekomendacja właścicielska

Nie wyrzucaj obecnego projektu. Ma wartościowe fundamenty:

- nowy design system i shell paneli;
- plan klasy V;
- struktury pakietów lekcji;
- Supabase Auth i model wieloszkolny;
- kod sesji live;
- silnik jednego generatora A/B;
- istniejące symulacje i widgety, które można adaptować.

Potrzebny jest jednak refaktor skoncentrowany na prawdziwych pionowych przepływach, a nie dalszym zwiększaniu liczby plików oznaczonych jako gotowe.

Najtańsza skuteczna droga dla mniejszego modelu:

1. napraw dostęp i wprowadź wybór `Ogólne / Klasa`;
2. uprość menu i połącz dublujące moduły;
3. napraw live oraz druk;
4. uczciwie ukryj niegotowe akcje;
5. doprowadź krótki segment M5-1.4 do pełnej akceptacji;
6. zbuduj cztery przetestowane rodziny interakcji;
7. dopiero wtedy przenoś cały program klasy V.

To pozwoli zachować lepszy obecny wygląd, a jednocześnie przekształcić LekcjaLab z katalogu ekranów w rzeczywiste narzędzie wspierające nauczyciela pracującego z podręcznikiem, klasą, tablicą i krótkimi aktywnościami uczniów.
