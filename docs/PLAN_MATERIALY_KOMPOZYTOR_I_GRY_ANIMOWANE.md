# LekcjaLab — plan nowego działu „Materiały”, kompozytora i gier animowanych

## Status dokumentu

- Dokument planistyczny i dziennik wdrożenia — realizowany etapami.
- Zakres obejmuje panel nauczyciela, panel ucznia, przypisywanie materiałów, analitykę, nagrody oraz pierwszą grę animowaną.
- Pierwszy pionowy wycinek produktu: **„Chrupek i Tama Liczb”**.
- Oficjalny bohater LekcjaLab: **Chrupek**. Zatwierdzony wzorzec postaci znajduje się w `public/materials/characters/chrupek/chrupek-character-anchor-v1.png`.
- Działający klaser 60 naklejek pozostaje bez zmian. Rozszerzamy go o czwartą serię **20 rzadkich naklejek premium Chrupka** (ID 60–79), dzięki czemu katalog zawiera łącznie 80 naklejek.
- Naklejki premium Chrupka są nagrodami osiągnięciowymi, a nie zakupem: może je przyznać nauczyciel albo system po potwierdzonym ukończeniu całego działu programu. Nie wypadają za punkty, pojedyncze odpowiedzi, pojedynczą lekcję, zwykły test ani powtarzanie gry.
- Wdrożony pionowy wycinek obejmuje chronione trasy `/nauczyciel/materialy`, `/nauczyciel/materialy/kompozytor`, `/uczen/materialy`, interaktywną grę, pierwszy działający szkielet kompozytora, hero z trzema wariantami Chrupka, rozszerzenie katalogu do 80 pozycji oraz migrację `068_chrupek_premium_stickers.sql`.
- Przykładowe zrzuty dostarczone przez właściciela projektu służą wyłącznie jako inspiracja dla rodzaju interakcji. Nie kopiujemy postaci, ilustracji ani układu 1:1. Tworzymy własny świat i własne assety LekcjaLab.

## 1. Decyzja produktowa i nazewnictwo

### Główny dział

Nazwa w panelu nauczyciela: **Materiały**.

Podsekcje:

1. **Biblioteka** — wszystkie gotowe materiały z miniaturami.
2. **Moje zestawy** — materiały skomponowane przez nauczyciela.
3. **Kompozytor** — budowanie zestawu z gotowych aktywności.
4. **Wysłane** — zadania przekazane klasom i pojedynczym uczniom.
5. **Ulubione** — zapisane materiały i gry.

Nazwa sekcji ucznia: **Strefa Misji**.

Podsekcje:

1. **Od nauczyciela** — materiały obowiązkowe i dodatkowe.
2. **Wybierz sam** — materiały udostępnione do samodzielnej nauki.
3. **Dokończ** — rozpoczęte gry i zestawy.
4. **Moje osiągnięcia** — wynik, opanowane umiejętności i zdobyte nagrody.

### Materiały z bogatą oprawą

Rekomendowana nazwa widoczna dla użytkownika: **Misje animowane**.

Nie należy na obecnym etapie nazywać ich płatnymi materiałami premium, ponieważ platforma jest darmowa. W modelu danych można od razu przewidzieć:

- `accessTier: "core"` — zwykły materiał,
- `accessTier: "visual"` — bogata misja graficzna,
- `accessTier: "premium"` — przyszła możliwość płatnego dostępu.

Na kartach materiałów obecnie pokazujemy badge **„Misja animowana”**, a nie „Premium”.

Techniczne określenie `premium` dotyczy wyłącznie modelu danych i rzadkości nagrody. Nie jest eksponowane w interfejsie ani wykorzystywane jako reklama.

## 2. Co jest nie tak w obecnym rozwiązaniu

Obecny system jest funkcjonalny, ale wizualnie i produktowo rozdzielony:

- `/nauczyciel/lekcje` pokazuje lekcje jako tekstowe wiersze bez atrakcyjnych miniatur;
- `WidgetPicker` pokazuje tekstową siatkę nazw i opisów;
- `TestComposer` służy głównie do tworzenia testów i nie jest uniwersalnym kompozytorem materiałów;
- uczeń w szybkiej powtórce wybiera obszary z listy checkboxów;
- symulacje, lekcje, gry klasowe, testy i wydruki wyglądają jak osobne produkty;
- istnieją metadane klas, tematów i ogólnych umiejętności, ale nie ma jednego kontraktu materiału z miniaturą, czasem, trybem pracy, poziomem i dokładnymi `skillIds`;
- nie ma jednej biblioteki, w której nauczyciel wyszukuje najpierw po umiejętności, a dopiero później po typie materiału;
- uczeń nie ma atrakcyjnej, bezpiecznej przeglądarki materiałów do samodzielnego wyboru.

Nowy moduł nie może być wyłącznie zmianą kolorów. Potrzebna jest wspólna domena **Materiału**, z której korzystają katalog, kompozytor, wysyłka, ekran ucznia i raporty.

## 3. Docelowy model materiału

Każda aktywność dostępna w bibliotece powinna mieć wspólny kontrakt:

```ts
type MaterialKind =
  | "animated-mission"
  | "interactive-exercise"
  | "mini-game"
  | "lesson-segment"
  | "worksheet"
  | "quiz"
  | "classroom-game";

interface MaterialDefinition {
  id: string;
  slug: string;
  version: number;
  title: string;
  shortDescription: string;
  kind: MaterialKind;
  accessTier: "core" | "visual" | "premium";
  subjectId: "math";
  grades: number[];
  curriculumId: string;
  sectionId: string;
  topicIds: string[];
  skillIds: string[];
  prerequisiteSkillIds: string[];
  tags: string[];
  difficulty: "support" | "core" | "challenge";
  estimatedMinutes: number;
  interactionKinds: Array<"click" | "drag" | "input" | "build" | "team">;
  channels: Array<"student-solo" | "teacher-board" | "homework" | "print">;
  thumbnail: string;
  previewAnimation?: string;
  componentId: string;
  generatorId?: string;
  assetManifestId?: string;
  studentCanChoose: boolean;
  published: boolean;
}
```

### Najważniejsza reguła katalogu

**Umiejętność jest podstawowym kluczem wyszukiwania i komponowania.**

Przykładowa ścieżka:

`Matematyka → Klasa 5 → Liczby i działania → Szacowanie wyników → Misje animowane`

Rodzaj materiału jest filtrem wtórnym. Nauczyciel nie powinien najpierw zastanawiać się, czy potrzebuje „widgetu”, „symulacji” albo „blueprintu”. Powinien zacząć od odpowiedzi: **czego uczeń ma się nauczyć lub co ma przećwiczyć?**

## 4. Nowa biblioteka materiałów nauczyciela

### Trasy

- `/nauczyciel/materialy` — główna biblioteka;
- `/nauczyciel/materialy/[materialId]` — szczegóły i pełny podgląd;
- `/nauczyciel/materialy/kompozytor` — nowy kompozytor;
- `/nauczyciel/materialy/zestawy` — zapisane zestawy;
- `/nauczyciel/materialy/zestawy/[compositionId]` — edycja zestawu;
- `/nauczyciel/materialy/wyslane` — historia przypisań i wyniki.

Obecne `/nauczyciel/lekcje` może pozostać trasą techniczną, ale po wdrożeniu powinno przekierowywać do biblioteki z aktywnym filtrem „Lekcje”.

### Widok biblioteki

Górna część:

- duże pole wyszukiwania: „Czego chcesz dziś nauczyć?”;
- szybki wybór klasy;
- ostatnio używana klasa pobrana z kontekstu nauczyciela;
- przycisk **„Utwórz zestaw”**;
- sekcje „Polecane dla tej klasy”, „Ostatnio używane” i „Nowe misje”.

Lewy panel filtrów:

- klasa;
- dział programu;
- temat;
- umiejętność;
- typ materiału;
- poziom trudności;
- czas: do 5, 10, 15, 30 minut;
- tryb: samodzielnie, na tablicy, w domu, drużynowo, do druku;
- forma odpowiedzi: kliknięcie, przeciąganie, wpisywanie, budowanie;
- tylko materiały z wynikami;
- tylko materiały dostępne do samodzielnego wyboru ucznia;
- `core`, `visual`, w przyszłości `premium`.

### Karta materiału

Każda karta musi zawierać:

- dużą miniaturę 16:9;
- opcjonalny krótki podgląd ruchu po najechaniu lub dotknięciu „Podgląd”;
- nazwę i jednozdaniowy opis;
- klasę, dział i dokładne umiejętności;
- czas i trudność;
- ikonę trybu pracy;
- badge „Misja animowana”, „Ćwiczenie”, „Do druku” itp.;
- informację, czy materiał zapisuje wynik;
- przyciski: **„Podejrzyj”**, **„Dodaj do zestawu”**, **„Wyślij od razu”**, serce „Ulubione”.

Miniatura nie może być dekoracyjnym obrazkiem bez związku z materiałem. Powinna pokazywać bohatera, środowisko i główny typ interakcji.

### Szczegóły materiału

Ekran szczegółów zawiera:

- interaktywny podgląd lub filmową pętlę 5–8 sekund;
- opis celu ucznia w formie „Nauczę się…”;
- kryteria sukcesu;
- powiązanie z programem i `skillIds`;
- przykładowe zadania;
- dostępne ustawienia nauczyciela;
- informację o czasie, urządzeniach i dostępności;
- „Wypróbuj jako uczeń”;
- „Dodaj do zestawu”;
- „Wyślij klasie” lub „Wyślij wybranym uczniom”.

## 5. Nowy kompozytor materiałów

### Założenie

Kompozytor nie powinien być rozbudowaną wersją surowego formularza testu. Ma przypominać budowanie playlisty lub scenariusza aktywności.

### Układ desktopowy

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Nazwa zestawu | Umiejętność | Podgląd ucznia | Zapisz | Wyślij     │
├──────────────────┬──────────────────────────────┬────────────────────┤
│ BIBLIOTEKA       │ MÓJ ZESTAW                   │ USTAWIENIA BLOKU    │
│ wyszukiwarka     │ 1. Animowane wprowadzenie    │ trudność            │
│ filtry           │ 2. Bóbr — Tama Liczb         │ zakres liczb        │
│ miniatury        │ 3. Krótkie ćwiczenie         │ liczba rund         │
│ przeciągnij +    │ 4. Samoocena                 │ podpowiedzi / czas   │
├──────────────────┴──────────────────────────────┴────────────────────┤
│ Całość: 14 min · 3 umiejętności · 12 zadań · wynik zapisywany       │
└──────────────────────────────────────────────────────────────────────┘
```

Na tablecie panele zamieniają się w trzy kroki: **Wybierz → Ułóż → Ustaw**.

### Przebieg pracy nauczyciela

1. Nauczyciel wybiera klasę i główną umiejętność.
2. System pokazuje rekomendowane materiały z miniaturami.
3. Nauczyciel dodaje cały materiał albo jego wariant do osi zestawu.
4. Elementy można przeciągać, duplikować i usuwać.
5. Po zaznaczeniu elementu panel ustawień pokazuje tylko opcje istotne dla tego materiału.
6. Kompozytor na bieżąco pokazuje łączny czas, liczbę zadań i pokryte umiejętności.
7. Nauczyciel uruchamia **„Podgląd jako uczeń”** bez zapisywania wyniku.
8. Zestaw można zapisać jako szkic, użyć podczas lekcji, udostępnić do wyboru lub wysłać jako zadanie.

### Typy bloków w zestawie

- misja animowana;
- pojedyncze ćwiczenie interaktywne;
- seria 3–10 zadań;
- wyjaśnienie lub wskazówka;
- obraz i polecenie;
- zadanie tekstowe;
- mini-gra;
- karta pracy PDF;
- szybkie sprawdzenie;
- samoocena końcowa;
- nagroda końcowa.

### Ustawienia dostępne dla gry

- główna umiejętność;
- dozwolone działania;
- zakres liczb;
- liczba rund;
- poziom wsparcia;
- tryb bez czasu lub z czasem;
- liczba podpowiedzi;
- próg zaliczenia;
- powtórzenie błędnych typów zadań;
- włączenie rundy wyzwania;
- punkty i cyfrowa nagroda;
- możliwość ponownej samodzielnej gry po wykonaniu zadania.

### Ochrona przed przeładowaniem

- domyślnie pokazujemy ustawienia podstawowe;
- „Ustawienia zaawansowane” są zwinięte;
- przy każdym ustawieniu jest krótki opis wpływu na ucznia;
- gotowe presety: **Wsparcie**, **Standard**, **Wyzwanie**;
- automatyczne ostrzeżenie, gdy zestaw przekracza 25 minut albo miesza zbyt wiele niepowiązanych umiejętności.

## 6. Przeglądarka materiałów dla ucznia

### Trasy

- `/uczen/materialy` — Strefa Misji;
- `/uczen/materialy/[materialId]` — karta i uruchomienie materiału;
- `/uczen/materialy/proba/[attemptId]` — trwająca próba;
- `/uczen/materialy/wyniki/[attemptId]` — wynik i nagroda.

Wszystkie te trasy wymagają zalogowania. Nie dodajemy publicznych gier obchodzących Supabase Auth.

### Strona główna ucznia

Kolejność sekcji:

1. **Czeka od nauczyciela** — najwyższy priorytet, widoczny termin.
2. **Dokończ misję** — stan zapisany po każdej rundzie.
3. **Polecane dla mnie** — na podstawie klasy i umiejętności wymagających ćwiczenia.
4. **Wybierz sam** — tylko materiały oznaczone `studentCanChoose`.
5. **Nowe misje animowane**.
6. **Moje ulubione**.

### Karta dziecka

- duża, kolorowa miniatura;
- tytuł w języku przygodowym;
- krótki komunikat: „Poćwiczysz dodawanie i szacowanie”;
- czas w minutach;
- trudność przedstawiona czytelnie, bez stygmatyzowania;
- potencjalna nagroda;
- „Zagraj”, „Dokończ” albo „Spróbuj jeszcze raz”.

Uczeń nie powinien oglądać technicznych nazw typu `widgetKind`, `skillId`, `blueprint` ani „generator”.

### Samodzielny wybór i bezpieczeństwo punktów

- nauczyciel może dopuścić materiał do sekcji „Wybierz sam” dla całej klasy;
- uczeń nie dostaje nieskończonej liczby punktów za powtarzanie najłatwiejszej gry;
- pełne punkty są przyznawane za pierwsze ukończenie lub poprawienie najlepszego wyniku;
- późniejsze powtórki dają doświadczenie treningowe, ale nie pompują puli nagród;
- nauczyciel widzi dobrowolną aktywność oddzielnie od prac obowiązkowych.

## 7. Wysyłanie materiału uczniom

Po kliknięciu „Wyślij” nauczyciel wybiera:

- szkołę i klasę z aktualnego kontekstu;
- całą klasę, grupę albo wybranych uczniów;
- materiał obowiązkowy lub „dla chętnych”;
- rozpoczęcie i termin;
- liczbę prób;
- czy wynik trafia do postępów;
- czy po ukończeniu uczeń może swobodnie powtarzać materiał;
- komunikat dla uczniów;
- opcjonalną nagrodę nauczyciela.

Wysłanie tworzy zamrożony snapshot materiału i ustawień. Aktualizacja katalogu nie może zmieniać już rozpoczętego zadania.

## 8. Pierwsza animowana gra: „Chrupek i Tama Liczb”

### Tożsamość gry

- ID: `game-beaver-dam-v1`.
- Typ: `animated-mission`.
- Poziom startowy: klasa 5.
- Dział: Liczby i działania.
- Główne umiejętności pierwszej wersji:
  - `M5-1.2-mental-add-sub`,
  - `M5-1.3-mental-mul-div`,
  - `M5-1.5-estimation`.
- Tryby: samodzielnie, zadanie od nauczyciela, prezentacja na tablicy.
- Czas: 5–10 minut.

### Fabuła

Nocna ulewa uszkodziła tamę. Chrupek potrzebuje właściwych kłód, zanim poziom wody za bardzo wzrośnie. Na każdej kłodzie znajduje się działanie. Uczeń wybiera albo przeciąga te kłody, które spełniają warunek rundy. Po poprawnej odpowiedzi Chrupek dopasowuje kłodę do wyrwy i odbudowuje kolejny fragment tamy.

### Pętla jednej rundy

1. Pojawia się krótkie polecenie, np. „Znajdź kłodę z wynikiem mniejszym niż 500”.
2. Na rzece płyną cztery różne kłody z działaniami.
3. Uczeń klika lub przeciąga wybraną kłodę do strefy bobra.
4. Gra natychmiast ocenia wybór.
5. Poprawna kłoda podpływa do bobra, uruchamia się animacja gryzienia i fragment trafia do tamy.
6. Błędna kłoda robi mały plusk i wraca na nurt; pojawia się spokojna wskazówka, bez utraty całego postępu.
7. Po krótkiej animacji zaczyna się nowa, niepowtarzająca się runda.

### Rodzaje rund pierwszej wersji

1. **Mniej czy więcej** — wybierz działanie z wynikiem mniejszym lub większym od celu.
2. **Dokładny wynik** — wybierz kłodę dającą wskazany wynik.
3. **Najbliżej celu** — wybierz wynik najbliższy liczbie bez dokładnego liczenia każdej opcji.
4. **Szacunek** — wskaż, czy wynik jest bliżej podanej setki lub tysiąca.
5. **Brakująca cyfra** — bóbr wybiera właściwą cyfrę, aby uzupełnić działanie.

W pionowym wycinku wdrażamy najpierw rundy 1–3. Rundy 4–5 są rozszerzeniem po ustabilizowaniu silnika.

### Stany gry

```text
intro → briefing → round-ready → answering → correct/wrong
      → chew-animation / hint → dam-progress → next-round → finale
```

Każdy stan jest jawny i testowalny. Animacja nie może sama decydować o wyniku matematycznym.

### Animacje

Stan bezczynny:

- delikatne falowanie wody;
- przesuwające się refleksy;
- bóbr mruga;
- ogon wykonuje niewielki ruch;
- kłody lekko unoszą się i przesuwają.

Poprawna odpowiedź:

- kłoda płynie łukiem do bobra;
- przednie łapy chwytają drewno;
- pysk przełącza się między klatką otwartą, zamkniętą i dwoma położeniami gryzienia;
- pojawiają się drobne wióry;
- kłoda skraca się albo dzieli;
- element tamy wskakuje na miejsce;
- wskaźnik postępu rozświetla się.

Błędna odpowiedź:

- kłoda kołysze się i robi niewielki plusk;
- bóbr pokazuje krótkie zdziwienie;
- ekran nie trzęsie się agresywnie;
- gra daje wskazówkę: „Najpierw oszacuj setki”.

Finał:

- ostatnia deska trafia do tamy;
- poziom wody uspokaja się;
- bóbr uderza ogonem w wodę;
- pojawia się wynik, opanowana umiejętność i nagroda.

### Punkty i nagrody

- 1 punkt bazowy za poprawną rundę;
- mnożnik serii za odpowiedzi bez podpowiedzi;
- bonus za ukończenie całej tamy;
- trzy gwiazdy zależne od dokładności, nie wyłącznie od czasu;
- pierwsze bezbłędne ukończenie gry przyznaje jednorazowo 5 punktów przez idempotentną funkcję bazodanową;
- pierwsze ukończenie może przyznać punkty lub zwykły element kosmetyczny, ale sama gra nigdy nie przyznaje naklejki premium Chrupka;
- powtórka przyznaje pełne punkty dopiero po poprawieniu najlepszego wyniku.

### Ustawienia nauczyciela

- działania: dodawanie, odejmowanie, mnożenie, dzielenie;
- liczby dwucyfrowe lub trzycyfrowe;
- dla liczb trzycyfrowych opcja „pełne dziesiątki/setki”;
- wynik do 100, 1000 lub 10 000;
- liczba rund: 5, 8, 10, 12;
- jeden lub wiele poprawnych obiektów;
- timer wyłączony, łagodny albo konkursowy;
- podpowiedź po pierwszym lub drugim błędzie;
- tryb wsparcia, standard i wyzwanie;
- kryterium zaliczenia.

## 9. Album „Tajemnicza seria” — 20 ukrytych nagród

### Relacja z działającym klaserem

Nie zastępujemy istniejących 60 naklejek i nie zmieniamy ich identyfikatorów. Katalog zostaje rozszerzony w sposób kompatybilny:

| Zakres ID | Kolekcja | Liczba | Sposób zdobywania |
|---|---|---:|---|
| 0–19 | Brygada Bobrów | 20 | istniejące zasady zwykłych nagród |
| 20–39 | Absurdalne memy | 20 | istniejące zasady zwykłych nagród |
| 40–59 | Kocie Liczydła | 20 | istniejące zasady zwykłych nagród |
| 60–79 | **Tajemnicza seria** | **20** | wyłącznie ukończenie całego działu albo nauczyciel |

Łącznie klaser zawiera **80 naklejek**. Migracja nie usuwa istniejących rekordów `student_stickers`, nie zeruje wybranej naklejki i nie mapuje ponownie starych ID.

### Charakter kolekcji

- nazwa widoczna dla ucznia: **Tajemnicza seria**;
- zamknięta karta nie ma oznaczenia `premium`, nazwy wariantu, numeru ani graficznej podpowiedzi;
- techniczne słowo `premium` nie jest komunikatem marketingowym i nie pojawia się przy zamkniętych nagrodach;
- każda naklejka przedstawia oficjalnego Chrupka w innej roli, pozie lub sytuacji matematycznej;
- wszystkie warianty zachowują tę samą twarz, okulary, turkusową chustę, futro, proporcje i naturalny ogon;
- smartwatch, tablet i turkusowe sneakersy mogą zależeć od sceny, lecz Chrupek nie otrzymuje medalionu, pasa, stroju robotnika ani narzędzi budowlanych;
- zdobyta naklejka może być ustawiona na profilu tak samo jak dotychczasowe naklejki;
- niezdobyte naklejki pozostają zakryte; uczeń widzi tylko neutralną kłódkę, `???`, liczbę zdobytych pól i ogólny warunek odblokowania;
- konkretna grafika i nazwa są ujawniane dopiero w chwili zdobycia — zgodnie z mechaniką „jajka niespodzianki”;
- kolekcja nie jest promowana na stronie głównej, w hero, bibliotece materiałów ani na ekranach ukończenia zwykłych gier.

### Katalog 20 wariantów

1. **Mistrz Działu** — Chrupek z tabletem i złotą gwiazdą postępu.
2. **Profesor Liczb** — Chrupek wskazujący poprawny tok rozumowania.
3. **Strażnik Zera** — spokojna poza z symbolem zera jako elementem scenografii.
4. **Łowca Wyników** — dynamiczna poza z kartami działań.
5. **Architekt Działań** — Chrupek układający matematyczny schemat.
6. **Pogromca Ułamków** — Chrupek z wizualnymi częściami całości.
7. **Kapitan Geometrii** — Chrupek wśród brył i figur.
8. **Tropiciel Dzielników** — Chrupek analizujący ślady-liczby.
9. **Mistrz Szacowania** — Chrupek porównujący dwa przybliżenia.
10. **Strażnik Kolejności** — Chrupek pilnujący kolejnych etapów działania.
11. **Odkrywca Osi** — Chrupek przy świetlistej osi liczbowej.
12. **Czarodziej Potęg** — subtelny efekt energii i małe wykładniki.
13. **Nawigator Jednostek** — Chrupek z mapą miar na tablecie.
14. **Detektyw Treści** — Chrupek rozwiązujący zadanie tekstowe.
15. **Błyskawiczny Rachmistrz** — dynamiczna poza sukcesu.
16. **Spokojny Strateg** — Chrupek planujący rozwiązanie przed obliczeniem.
17. **Kolekcjoner Wiedzy** — Chrupek prezentujący zapełniony pasek działu.
18. **Pomocna Łapa** — Chrupek zachęcający do poprawy błędu.
19. **Drużynowy Geniusz** — Chrupek prowadzący matematyczną drużynę.
20. **Legenda LekcjaLab** — najrzadszy uroczysty wariant finałowy.

Nazwy są stałymi metadanymi aplikacji. Tekst nie jest wypalany w grafice — UI renderuje nazwę jako HTML.

### Dozwolone sposoby przyznania

1. **Ukończenie całego działu**:
   - system zna listę wymaganych tematów w danym `curriculumId` i `sectionId`;
   - uczeń ma ukończony każdy wymagany temat działu;
   - nagroda jest przyznawana tylko raz dla pary `student_id + curriculum_id + section_id`;
   - ponowne zaliczanie działu nie daje kolejnej naklejki;
   - przyznanie zapisuje źródło `section-complete` i snapshot kryteriów.
2. **Nauczyciel**:
   - nauczyciel wybiera ucznia wyłącznie ze swojej klasy i bieżącej szkoły;
   - wpisuje powód przyznania;
   - serwer przyznaje losową nieposiadaną naklejkę z kolekcji 60–79;
   - operacja zapisuje nauczyciela, szkołę, klasę, ucznia, powód i czas;
   - po zdobyciu wszystkich 20 kolejna próba kończy się czytelnym komunikatem bez duplikatu.

### Niedozwolone sposoby przyznania

- zakup punktami;
- poprawna pojedyncza odpowiedź;
- ukończenie jednej lekcji lub jednego tematu;
- wynik 100% z pojedynczej pracy domowej, testu albo gry;
- liczba kliknięć, seria logowań lub wielokrotne powtarzanie materiału;
- bezpośredni zapis z klienta do `student_stickers`;
- wybór konkretnego `sticker_id` przesłany przez przeglądarkę.

### Widok ucznia

W klaserze seria ma własną oprawę: ciemny turkus, złoto, delikatną poświatę i znak rzadkości. Karta kolekcji pokazuje:

- `Tajemnicza seria`;
- postęp `x/20`;
- komunikat „Ukończ cały dział lub zdobądź specjalną nagrodę od nauczyciela”;
- zamknięte sylwetki bez ujawniania grafiki;
- datę i źródło po zdobyciu;
- osobną celebrację pełnoekranową dla nowej naklejki premium.

Album pozostaje spokojny i czytelny. Efekty połysku nie mogą utrudniać odczytu ani działać w trybie `prefers-reduced-motion`.

### Widok nauczyciela

Nauczyciel widzi wszystkie 20 grafik w podglądzie, a przy uczniu:

- aktualny postęp kolekcji;
- listę już zdobytych naklejek;
- przycisk „Przyznaj rzadką naklejkę Chrupka”;
- obowiązkowe pole powodu;
- potwierdzenie szkoły i klasy;
- historię specjalnych przyznań.

Przycisk wywołuje walidowane RPC. UI nigdy nie traktuje samego ukrycia przycisku jako zabezpieczenia.

### Pliki graficzne kolekcji

Każdy z 20 wariantów jest osobnym, kwadratowym obrazem 300×300 px — dokładnie tak jak wcześniejsze 60 naklejek:

```text
private-assets/rewards/chrupek-premium/chrupek-premium-01.png
...
private-assets/rewards/chrupek-premium/chrupek-premium-20.png
```

Naklejki nie są umieszczone w katalogu `public`. Chroniony Route Handler zwraca grafikę tylko aktywnemu nauczycielowi lub administratorowi oraz uczniowi, który ma daną naklejkę zapisaną w `student_stickers`. Pozostałe żądania otrzymują odpowiedź 404, a publiczna strona i zamknięte pola albumu pokazują wyłącznie neutralną ikonę kłódki — bez grafiki i nazwy nagrody. Każda bitmapa przedstawia jednego Chrupka w pełnym kwadratowym kadrze, bez okrągłej ramki, numeru i tekstu. Oficjalny anchor postaci oraz format wcześniejszych naklejek 300×300 są obowiązkowymi referencjami dla wszystkich wariantów.

## 10. Mechanizm, który nigdy nie dubluje przykładów

Każde zadanie otrzymuje fingerprint znormalizowanej treści, np.:

```text
operation:add|left:120|right:450|target:compare-lt-700
```

Reguły generatora:

1. W obrębie rundy żadne dwie kłody nie mają tego samego działania ani wyniku, jeśli wynik ma być cechą rozróżniającą.
2. W obrębie jednej gry fingerprint zadania nie może się powtórzyć.
3. Historia ostatnich fingerprintów ucznia jest wykorzystywana przy kolejnej próbie.
4. Generator ma limit prób losowania, a potem używa deterministycznej listy zapasowej.
5. Dodawanie jest kanonizowane, więc `120 + 450` i `450 + 120` są traktowane jako ten sam przykład, jeśli zamiana kolejności nie jest celem zadania.
6. Dzielenie generuje wyłącznie przypadki z całkowitym wynikiem, chyba że materiał jawnie ćwiczy resztę.
7. Błędne odpowiedzi są matematycznie wiarygodne, ale nie mogą przypadkiem spełniać warunku zadania.
8. Test automatyczny sprawdza co najmniej 10 000 wygenerowanych sesji i kończy się błędem przy pierwszym duplikacie.

Generator przechowuje seed próby, aby nauczyciel i uczeń widzieli ten sam zestaw, a błąd można było odtworzyć.

## 11. Warstwy graficzne pierwszej gry

### Zasada

Ilustracja jest oddzielona od treści matematycznej. Liczby, działania, przyciski i komunikaty są renderowane jako HTML. Dzięki temu:

- tekst pozostaje ostry na każdym ekranie;
- nie ma błędów AI w działaniach;
- można zmieniać język;
- czytnik ekranu zna treść zadania;
- grafiki można wielokrotnie wykorzystywać.

### Assety wymagane do MVP

| Plik | Rola | Format roboczy / docelowy | Uwagi |
|---|---|---|---|
| `chrupek-character-anchor-v1.png` | zatwierdzony model Chrupka | 1692×930 PNG | oficjalny wzorzec 2.5D: okulary, chusta, smartwatch, tablet, kolory i proporcje |
| `chrupek-home-hero-variants-v1.png` | trzy warianty na stronę tytułową | 1672×941 PNG | tablet, wskazanie i celebracja; wdrożone w `HomeHero` |
| `beaver-dam-game-scene-v1.png` | scena pierwszej gry | 1672×941 PNG | Chrupek, rzeka i tama; środek wolny pod interaktywne kłody HTML |
| `fraction-lighthouse-scene-v1.png` | scena „Latarni Ułamków” | 1672×940 PNG | nocne wybrzeże, latarnia po lewej, Chrupek przy konsoli po prawej; wolna przestrzeń na spadające ułamki HTML |
| `space-courier-scene-v1.png` | scena „Kosmicznego Kuriera” | 1672×941 PNG | kosmiczna mgławica, planety na obrzeżach i Chrupek z tabletem; wolny środek na trasę obliczeń HTML |
| `chrupek-premium-01..20.png` | 20 rzadkich naklejek | 300×300 PNG | 20 osobnych kwadratowych plików; grafiki chronione i niewidoczne przed zdobyciem |
| `river-background-v1.webp` | tło 16:9 | 2048×1152 WebP | rzeka, brzegi, las, bez postaci i tekstu |
| `river-foreground-v1.webp` | przedni plan | 2048×1152 WebP z alpha | trawy i kamienie, nie zasłania pola zadań |
| `water-ripple-tile-v1.webp` | pętla powierzchni wody | 1024×256 WebP | powtarzalna tekstura przesuwana CSS |
| `dam-back-v1.webp` | tylna część tamy | 1536×512 WebP z alpha | warstwa pod dokładanymi elementami |
| `dam-log-segment-v1.webp` | pojedynczy element postępu | 512×192 WebP z alpha | dokładany po poprawnej rundzie |
| `chrupek-body-v1.webp` | ciało bez animowanego pyska | 1024×1024 WebP z alpha | stały rozmiar, okulary i chusta zgodne ze wzorcem |
| `chrupek-mouth-closed-v1.webp` | pysk zamknięty | 512×512 WebP z alpha | identyczny canvas jak pozostałe pyski |
| `chrupek-mouth-open-v1.webp` | pysk otwarty | 512×512 WebP z alpha | klatka gryzienia |
| `chrupek-mouth-chew-left-v1.webp` | pysk przesunięty w lewo | 512×512 WebP z alpha | klatka gryzienia |
| `chrupek-mouth-chew-right-v1.webp` | pysk przesunięty w prawo | 512×512 WebP z alpha | klatka gryzienia |
| `chrupek-eyes-open-v1.webp` | oczy otwarte za okularami | 256×256 WebP z alpha | nakładka na ciało; oprawki pozostają nieruchome |
| `chrupek-eyes-blink-v1.webp` | mrugnięcie za okularami | 256×256 WebP z alpha | krótka losowa animacja |
| `chrupek-tail-idle-v1.webp` | naturalny ogon neutralny | 512×512 WebP z alpha | proporcjonalny, anatomicznie połączony z ciałem |
| `chrupek-tail-slap-v1.webp` | naturalny ogon w finale | 512×512 WebP z alpha | reakcja sukcesu, nigdy platforma lub osobny rekwizyt |
| `chrupek-paws-hold-v1.webp` | łapy trzymające kłodę | 512×512 WebP z alpha | warstwa nad kłodą |
| `chrupek-smartwatch-v1.webp` | smartwatch | 256×256 WebP z alpha | ciemnoturkusowy pasek, ekran bez tekstu i cyfr |
| `chrupek-tablet-v1.webp` | tablet LekcjaLab | 768×1024 WebP z alpha | pusty ekran; treść interfejsu nakładana jako HTML |
| `dam-answer-log-v1.png` | kłoda odpowiedzi | 1200×400 PNG z alpha | wdrożona, osobna grafika z pustą tabliczką; działanie jako HTML |
| `floating-log-selected-v1.webp` | zaznaczona kłoda | 1024×320 WebP z alpha | subtelna poświata, bez tekstu |
| `wood-chip-v1.webp` | wiór | 128×128 WebP z alpha | kilka kopii obracanych CSS |
| `splash-v1.webp` | plusk | 512×512 WebP z alpha | jedna ilustracja skalowana i obracana |
| `beaver-dam-thumbnail-v1.webp` | karta katalogu | 1200×675 WebP | bohater, kłody i wyrwa w tamie |
| `beaver-dam-finale-v1.webp` | ekran ukończenia | 1600×900 WebP | naprawiona tama, miejsce na wynik HTML |

### Współrzędne i spójność warstw

Każdy asset postaci otrzymuje manifest:

```json
{
  "canvas": [1024, 1024],
  "bodyAnchor": [512, 900],
  "mouthAnchor": [530, 410],
  "eyesAnchor": [520, 315],
  "tailAnchor": [285, 730],
  "pawsAnchor": [545, 600]
}
```

Warianty pyska nie mogą zmieniać skali, pozycji głowy, okularów ani kierunku światła. Każda kolejna grafika jest generowana z zatwierdzonym `chrupek-character-anchor-v1.png` jako referencją postaci.

### Wytyczne do generowania grafik

- Chrupek jest jedyną zatwierdzoną postacią przewodnią LekcjaLab;
- zachowujemy dokładnie zatwierdzony styl 2.5D, twarz, okulary, chustę, smartwatch, tablet, futro i proporcje;
- mocna, czytelna sylwetka na tablecie i tablicy;
- bez tekstu, cyfr, logo i znaku wodnego;
- tło i postać muszą mieć ten sam kierunek światła i perspektywę;
- unikać bardzo drobnego futra — postać ma mieć stylizowane, czyste krawędzie;
- Chrupek nie ma medalionu, pasa, przepaski biodrowej, kamizelki roboczej ani narzędzi budowlanych;
- ogon jest zawsze naturalnym, proporcjonalnym ogonem bobra połączonym z ciałem; nigdy deską, platformą lub osobnym rekwizytem;
- transparentne elementy powstają na jednolitym tle chroma-key, następnie tło jest usuwane lokalnie i wynik jest sprawdzany;
- po zatwierdzeniu modelu zmieniamy wyłącznie wskazaną warstwę, bez przeprojektowywania bohatera.

### Bazowy prompt dla postaci

```text
Use case: identity-preserve
Asset type: animation layer or new pose of the official LekcjaLab mascot
Input images: chrupek-character-anchor-v1.png is the mandatory identity and style reference
Primary request: create the requested new pose or animation layer of Chrupek
Subject: preserve Chrupek's exact face, warm fur, intelligent teal-and-brass glasses, expressive eyes,
elegant asymmetrical teal scarf with coral stitching, slim smartwatch, teal sneakers and natural beaver tail
Style/medium: preserve the approved premium polished 2.5D animated-game render
Composition/framing: keep proportions, camera, lighting and attachment points compatible with existing layers
Constraints: do not redesign Chrupek; no medallion, belt, waist sash, workwear or tools; natural tail attached
to the body; no text, numbers, logo or watermark; tablet screen stays blank for HTML overlay
```

Każdy prompt warstwy dodaje wymóg jednolitego tła chroma-key i zachowania referencyjnej postaci.

## 12. Jakich zdjęć i materiałów potrzebuję od właściciela projektu

Do rozpoczęcia pierwszej gry **nie potrzebuję kolejnych zdjęć**. Dostarczone trzy zrzuty wystarczają jako referencja rodzaju interakcji.

Zatwierdzone decyzje:

1. Oficjalny bohater nazywa się **Chrupek**.
2. Obowiązuje zatwierdzony, nowoczesny render 2.5D dla klas 4–6.
3. Stałe cechy Chrupka: inteligentne okulary, elegancka turkusowa chusta, smartwatch, opcjonalny tablet, turkusowe sneakersy i naturalny ogon.
4. Chrupek nie używa medalionu ani czerwonej przepaski w pasie.

Pozostają decyzje produktowe:

1. Czy dźwięki są domyślnie włączone, czy uruchamiane przyciskiem?
2. Czy pierwsza wersja skupia się na klasie 5 i liczbach naturalnych? Domyślna odpowiedź: tak.
3. Czy etykieta „Misje animowane” jest akceptowana?

Materiały opcjonalne:

- logo lub księga znaku, jeśli grafiki mają zawierać element marki poza samym interfejsem;
- zatwierdzona paleta kolorów dla nowych gier;
- próbki dźwięku lub wskazanie charakteru muzyki;
- własne ilustracje tylko wtedy, gdy właściciel ma prawa do ich użycia.

Nie potrzebujemy zdjęć uczniów, nauczycieli ani szkoły. Nie wykorzystujemy postaci z dostarczonych zrzutów i nie kopiujemy cudzych assetów.

## 13. Pipeline ciągłego tworzenia nowych grafik i gier

„Generowanie grafik jedna po drugiej” powinno działać jako kontrolowany pipeline redakcyjny, a nie generowanie obrazu podczas gry ucznia. Generowanie w runtime byłoby wolne, kosztowne i niespójne.

Kolejka produkcyjna dla każdej nowej gry:

1. karta pomysłu: umiejętność, mechanika, świat i bohater;
2. miniaturowy szkic kompozycji;
3. model postaci lub obiektu przewodniego;
4. zatwierdzenie stylu;
5. tło główne;
6. warstwy animacyjne postaci;
7. rekwizyty interaktywne;
8. ekran sukcesu i porażki bez zawstydzania ucznia;
9. miniatura katalogowa;
10. kompresja i manifest assetów;
11. test na telefonie, tablecie, laptopie i tablicy;
12. publikacja w katalogu jako nowa wersja materiału.

Kolejka gier i stan realizacji:

- **Chrupek i Tama Liczb** — wdrożona mechanika wyboru właściwej kłody z czterech działań;
- **Latarnia Ułamków** — wdrożona mechanika refleksowa: odpowiedzi spadają z góry, a uczeń musi przed końcem ośmiosekundowej fali kliknąć dwa równoważne ułamki i odrzucić dwa fałszywe;
- **Kosmiczny Kurier** — wdrożona mechanika sekwencyjna: uczeń klika trzy etapy obliczenia w poprawnej kolejności, omija pułapkę i w ten sposób buduje trasę do planety;
- **Fabryka Figur** — pole, obwód i klasyfikacja figur;
- **Ekspedycja Miary** — jednostki długości, masy i objętości;
- **Strażnicy Dzielników** — wielokrotności, dzielniki i cechy podzielności.

Każda gra wykorzystuje ten sam silnik materiałów, zapisu prób, nagród i statystyk, ale ma własny świat i mechanikę wizualną.

## 14. Architektura techniczna

### Nowe pliki i moduły

```text
src/types/material.ts
src/data/materials/catalog.ts
src/lib/materials/registry.ts
src/lib/materials/generators/
src/lib/materials/attempts/

src/components/materials/catalog/MaterialCatalog.tsx
src/components/materials/catalog/MaterialCard.tsx
src/components/materials/catalog/MaterialFilters.tsx
src/components/materials/composer/MaterialComposer.tsx
src/components/materials/composer/ComposerLibrary.tsx
src/components/materials/composer/ComposerTimeline.tsx
src/components/materials/composer/ComposerInspector.tsx
src/components/materials/player/MaterialPlayer.tsx

src/components/materials/games/beaver-dam/BeaverDamGame.tsx
src/components/materials/games/beaver-dam/BeaverCharacter.tsx
src/components/materials/games/beaver-dam/FloatingLog.tsx
src/components/materials/games/beaver-dam/DamProgress.tsx
src/components/materials/games/beaver-dam/gameMachine.ts

src/data/rewards/chrupekPremium.ts
src/components/rewards/ChrupekPremiumCollection.tsx

src/app/nauczyciel/materialy/...
src/app/uczen/materialy/...

public/materials/beaver-dam/v1/...
private-assets/rewards/chrupek-premium/...
```

### Pliki istniejące do przebudowy lub integracji

- `src/data/dashboardNav.ts` — dodać nowe wejścia nauczyciela i ucznia;
- `src/types/simulation.ts` — przestać traktować symulację jako pełny opis materiału;
- `src/data/simulations.ts` — adapter do wspólnego katalogu;
- `src/components/tests/WidgetPicker.tsx` — zastąpić wizualną biblioteką lub adapterem kompozytora;
- `src/components/tests/TestComposer.tsx` — zachować do testów, ale nie używać jako głównego kompozytora materiałów;
- `src/components/practice/QuickPracticeBuilder.tsx` — zastąpić kartami materiałów i rekomendacjami umiejętności;
- `src/lib/actions/assignments.ts` — współdzielić wybór klas i uczniów, nie wciskać gry do tabeli `tests`;
- system nagród — podłączyć zdarzenie ukończenia materiału z ochroną przed farmieniem punktów.
- `src/lib/rewards/catalog.ts` — zachować istniejące ID 0–59 i dodać kolekcję premium o ID 60–79;
- `src/app/uczen/klaser/page.tsx` — wyróżnić premium, pokazywać źródło nagrody i postęp 20-elementowej serii;
- `src/app/nauczyciel/naklejki/page.tsx` — zastąpić roboczy batch bobrów podglądem oficjalnych Chrupków;
- `src/lib/actions/rewards.ts` — używać wyłącznie walidowanych funkcji serwerowych przy przyznawaniu premium.

### Rejestr komponentów

Definicja materiału wskazuje `componentId`, a rejestr mapuje go na dozwolony komponent. Nie zapisujemy nazwy dowolnego komponentu przesłanej przez klienta. Serwer waliduje:

- istniejący materiał i wersję;
- dozwolone opcje konfiguracji;
- zgodność z klasą i szkołą;
- prawidłowe `skillIds`;
- limit rund i zakres liczb;
- snapshot przed wysłaniem.

## 15. Model bazy danych i separacja szkół

Rekomendowane migracje:

- `068_chrupek_premium_stickers.sql` — bezpieczne rozszerzenie klasera 60 → 80;
- `069_material_library_and_assignments.sql` — biblioteka, kompozycje, przypisania i próby materiałów.

### Tabele

1. `material_compositions`
   - `id`, `teacher_id`, `school_id`, `title`, `description`, `status`, `created_at`, `updated_at`.
2. `material_composition_items`
   - `composition_id`, `position`, `material_id`, `material_version`, `config`, `skill_ids`.
3. `material_assignments`
   - `id`, `composition_id`, `teacher_id`, `school_id`, `class_id`, `title`, `kind`, `starts_at`, `due_at`, `status`, `snapshot`, `max_attempts`.
4. `material_assignment_students`
   - `assignment_id`, `student_id`, `school_id`.
5. `material_attempts`
   - `id`, `assignment_id`, `material_id`, `student_id`, `school_id`, `status`, `seed`, `score`, `max_score`, `started_at`, `completed_at`, `state_snapshot`.
6. `material_attempt_events`
   - wynik rundy, `skill_id`, fingerprint zadania, poprawność, czas i użyta podpowiedź.
7. `teacher_material_favorites`
   - `teacher_id`, `material_id`.
8. `class_material_availability`
   - materiały dostępne w „Wybierz sam”.

Globalne, wbudowane definicje gier mogą pozostać wersjonowane w TypeScript. Baza przechowuje kompozycje, snapshoty, przypisania i próby.

### Rozszerzenie istniejącego klasera premium

Osobna migracja rozszerza katalog z 60 do 80 bez kasowania danych:

- ograniczenie `student_stickers.sticker_id`: `0..79`;
- ograniczenie `student_reward_profiles.featured_sticker_id`: `null` albo `0..79`;
- ograniczenie `teacher_sticker_awards.collection_id`: `0..3`;
- ograniczenie `teacher_sticker_awards.sticker_id`: `null` albo `0..79`;
- `grant_student_reward` nadal losuje zwykłe nagrody wyłącznie z kolekcji `0..2`;
- kolekcja `3` jest obsługiwana osobną, węższą funkcją premium;
- `teacher_award_student_sticker` dopuszcza kolekcję `3` po pełnej kontroli nauczyciela, szkoły i klasy;
- funkcja `award_chrupek_premium_for_section` sprawdza kompletność całego działu i idempotencję;
- zdarzenie premium przechowuje `curriculum_id`, `section_id`, snapshot wymaganych tematów oraz źródło przyznania.

Nie wolno rozszerzać zwykłej funkcji losującej w sposób, który umożliwi przekazanie `target_collection = 3` z istniejących przepływów pojedynczej lekcji lub pracy domowej.

### RLS i bezpieczeństwo

- nauczyciel widzi tylko kompozycje i przypisania szkół, do których ma aktywne członkostwo;
- uczeń widzi tylko materiały przypisane do niego albo udostępnione jego klasie;
- `school_id` występuje na wszystkich rekordach wykonawczych;
- identyczne nazwy klas w różnych szkołach nie mogą się mieszać;
- wynik jest zapisywany przez walidowaną funkcję/RPC, nie bezpośrednim zapisem z klienta;
- odpowiedzi i fingerprinty są oceniane po stronie serwera;
- snapshot materiału jest niemutowalny po rozpoczęciu pierwszej próby;
- katalog, gry, kompozytor i Strefa Misji wymagają zalogowania zgodnie z zasadami projektu.
- zapis premium jest idempotentny i wykonywany w jednej transakcji;
- RLS nie pozwala uczniowi wstawiać lub modyfikować przyznanych naklejek;
- teacher award sprawdza aktywne konto nauczyciela oraz relację z klasą w konkretnej szkole;
- identyfikator naklejki premium wybiera serwer spośród nieposiadanych pozycji 60–79;
- operacja ukończenia działu wylicza wymagane tematy po stronie serwera, a nie ufa tablicy przesłanej przez klienta.

## 16. Statystyki dla nauczyciela

Raport materiału pokazuje:

- ilu uczniów rozpoczęło i ukończyło;
- dokładność dla każdej umiejętności;
- najczęstszy typ błędu;
- rundy, w których uczniowie używali podpowiedzi;
- średni czas bez tworzenia rankingu najsłabszych dzieci;
- wyniki pierwszej i najlepszej próby;
- aktywność obowiązkową i dobrowolną oddzielnie;
- uczniów, którym warto wysłać materiał wspierający;
- uczniów gotowych na materiał „Wyzwanie”.
- postęp ucznia w dziale i gotowość do przyznania rzadkiej naklejki Chrupka;
- historię przyznań premium z rozróżnieniem `section-complete` i `teacher-award`.

Nie zapisujemy wyłącznie końcowego procentu. Gra powinna dostarczać informacji, **co** uczeń rozumie, a nie tylko ile zdobył punktów.

## 17. Dostępność, urządzenia i komfort ucznia

- obsługa kliknięcia jako alternatywy dla przeciągania;
- pełna obsługa klawiatury;
- widoczny fokus;
- komunikaty poprawności nieoparte wyłącznie na kolorze;
- `aria-live` dla wyniku rundy;
- opcja ograniczenia ruchu zgodna z `prefers-reduced-motion`;
- wyłącznik dźwięku dostępny przed startem;
- brak kar za wolne czytanie w domyślnym trybie;
- skala od telefonu do tablicy 16:9;
- bezpieczne pola na treść, aby kłody nie zasłaniały poleceń;
- grafika dekoracyjna ukryta przed czytnikiem ekranu;
- matematyka jako tekst HTML, nie część obrazka.

## 18. Wydajność

- miniatura katalogowa do około 150 KB;
- pojedyncza warstwa postaci docelowo 80–250 KB;
- tło 16:9 docelowo do około 600 KB;
- WebP dla większości assetów, PNG tylko gdy jest technicznie potrzebny;
- preload wyłącznie assetów pierwszej sceny;
- dalsze reakcje dociągane po wejściu do intro;
- animacje realizowane przez transformacje i opacity, bez ciągłej zmiany layoutu;
- brak generowania AI w przeglądarce ucznia;
- asset manifest zawiera wersję i wymiary, aby aktualizacja nie psuła starszych snapshotów.

## 19. Etapy wdrożenia

### Etap 0 — kontrakt i nazwy

- [x] zatwierdzić „Materiały”, „Strefa Misji” i „Misje animowane”;
- [x] utworzyć `MaterialDefinition`;
- [ ] utworzyć wspólny katalog i adapter istniejących symulacji/lekcji;
- [ ] ustalić mapę umiejętności programu klasy 5.

### Etap 1 — biblioteka nauczyciela

- [x] dodać pierwsze chronione trasy biblioteki nauczyciela i ucznia;
- [x] dodać pierwsze karty z miniaturami;
- [ ] filtry umiejętności, klasy, czasu i typu;
- [x] dodać szczegóły oraz podgląd pierwszej gry jako uczeń;
- [ ] ulubione;
- [x] zachować działanie dotychczasowych tras lekcji.

### Etap 2 — pierwszy silnik gry i assety Chrupka

- [x] zatwierdzić model postaci Chrupka i zapisać oficjalny wzorzec `chrupek-character-anchor-v1.png`;
- [x] wygenerować i wdrożyć docelową scenę rzeki do pierwszego pionowego wycinka;
- [ ] rozdzielić kolejne animacje Chrupka na dodatkowe warstwy ciała, pyska, łap i ogona;
- [ ] przygotować manifest anchorów;
- [x] zbudować pierwszy jawny przepływ `intro → playing → correct/wrong → complete`;
- [x] zbudować bazę rund bez duplikatów i test unikatowych fingerprintów;
- [x] wdrożyć animacje kłód, finał i tryb ograniczonego ruchu;
- [x] dodać miniaturę oraz grę do katalogu materiałów;
- [x] przygotować i wdrożyć trzy warianty hero Chrupka do strony tytułowej;
- [x] przebudować publiczną stronę tytułową wokół prawdziwego produktu: gry Chrupka, przepływu lekcji i kolekcji 60+20 naklejek;
- [x] wygenerować i zweryfikować 20 osobnych, kwadratowych naklejek premium 300×300.
- [x] wdrożyć drugą grę „Latarnia Ułamków” z odrębnym tłem, spadającymi odpowiedziami, limitem czasu i testem pełnego przejścia;
- [x] wdrożyć trzecią grę „Kosmiczny Kurier” z odrębnym tłem, budowaniem trasy w kolejności i testem pełnego przejścia;

### Etap 3 — nowy kompozytor

- [x] wdrożyć chroniony, interaktywny szkielet MVP z wyborem materiału, nazwy, trybu użycia i gotowym podglądem zestawu;
- [ ] trzyczęściowy układ Biblioteka / Zestaw / Ustawienia;
- [ ] przeciąganie i kolejność bloków;
- [ ] presety trudności;
- [ ] podgląd ucznia;
- [ ] zapis szkicu i wersjonowanie;
- [ ] walidacja czasu i umiejętności.

### Etap 4 — baza i wysyłka

- [ ] migracja tabel materiałów;
- [ ] RLS po szkole;
- [ ] wybór klasy i uczniów;
- [ ] snapshot materiału;
- [ ] powiadomienie ucznia;
- [ ] zadanie obowiązkowe i dla chętnych.

### Etap 5 — Strefa Misji ucznia

- [ ] materiały od nauczyciela;
- [x] udostępnić trzy materiały do samodzielnego wyboru w chronionej Strefie Misji;
- [ ] zapisywanie trwającej próby;
- [x] wdrożyć wynik, wskazówki i ponowną próbę we wszystkich trzech grach;
- [x] przygotować jednorazową nagrodę 5 punktów za pierwsze bezbłędne ukończenie każdej gry, bez przyznawania naklejek premium;
- [x] rozszerzyć działający katalog i UI klasera z 60 do 80 pozycji bez zmiany istniejących ID;
- [x] dodać album „Tajemnicza seria” z całkowicie zakrytymi polami przed zdobyciem;
- [ ] wdrożyć celebrację zdobycia premium i tryb ograniczonego ruchu;
- [x] przygotować migrację przyznania za cały dział oraz przez nauczyciela.

### Etap 6 — analityka i rekomendacje

- [ ] dane rund i umiejętności;
- [ ] raport nauczyciela;
- [ ] rekomendacje wsparcia i wyzwania;
- [ ] ochrona przed nabijaniem punktów;
- [ ] dobrowolna aktywność oznaczona oddzielnie.

### Etap 7 — pipeline kolejnych gier

- [ ] szablon briefu gry;
- [ ] szablon manifestu assetów;
- [ ] automatyczna kontrola brakujących i zbyt ciężkich plików;
- [ ] checklista spójności postaci;
- [ ] kolejka nowych światów i umiejętności;
- [ ] przyszłe sterowanie dostępem `premium` bez blokowania obecnej darmowej wersji.

## 20. Testy obowiązkowe

### Jednostkowe

- generator 10 000 sesji bez duplikatów;
- poprawność działań i warunków;
- dystraktory nigdy nie są przypadkowo poprawne;
- dzielenie całkowite;
- stabilny seed;
- naliczanie wyniku i limit nagród;
- serializacja snapshotu kompozycji.
- katalog ma dokładnie 80 unikatowych ID i zachowuje stare zakresy 0–59;
- premium zajmuje wyłącznie zakres 60–79;
- zwykła funkcja nagród nigdy nie przyznaje ID 60–79;
- ukończenie jednego tematu nie przyznaje premium;
- ukończenie całego działu przyznaje dokładnie jedną premium i ponowienie jest idempotentne;
- nauczyciel nie może przyznać premium uczniowi spoza swojej klasy i szkoły;
- po zebraniu 20 premium nie powstaje duplikat.

### Komponentowe

- filtry biblioteki;
- dodawanie i usuwanie materiału;
- kolejność bloków kompozytora;
- presety ustawień;
- wszystkie stany gry bobra;
- kliknięcie i przeciąganie;
- ograniczenie animacji;
- wznowienie rozpoczętej próby.
- zakryta i odkryta karta premium;
- licznik `x/20`;
- brak nazwy, badge'a i podpowiedzi na zamkniętym polu tajemniczej serii;
- formularz nauczyciela wymaga powodu.

### Integracyjne i E2E

- nauczyciel znajduje materiał po umiejętności;
- tworzy zestaw;
- wysyła całej klasie i jednemu uczniowi;
- uczeń widzi tylko swoje zadanie;
- uczeń kończy grę;
- wynik trafia do właściwej szkoły i klasy;
- inna szkoła nie ma dostępu;
- uczeń sam wybiera dozwolony materiał;
- powtórka nie nabija punktów bez poprawy wyniku;
- stara przypisana wersja działa po publikacji nowej wersji gry.
- istniejące 60 naklejek pozostaje widoczne po migracji;
- nauczyciel przyznaje premium wyłącznie uczniowi z dozwolonego kontekstu szkoły;
- uczeń nie może przyznać sobie premium przez wywołanie RPC lub bezpośredni insert;
- dwa równoczesne zdarzenia ukończenia działu dają najwyżej jedną nagrodę.

### Wizualne

- telefon pionowo;
- tablet poziomo;
- laptop;
- tablica 16:9;
- grafika nie zasłania matematyki;
- pysk, oczy, ogon i łapy nie „odklejają się” podczas skalowania;
- miniatura odpowiada prawdziwej grze;
- wszystkie assety mają własne prawa użycia i nie kopiują cudzych postaci.
- 20 Chrupków zachowuje tożsamość zatwierdzonego anchoru;
- naklejki są czytelne w 80×80 px i nie mają obciętego ogona, okularów ani chusty;
- strona hero i gra używają tej samej twarzy, palety i proporcji Chrupka.

## 21. Kryteria ukończenia pierwszego pionowego wycinka

Pierwszy etap można uznać za gotowy dopiero wtedy, gdy:

1. nauczyciel otwiera nowy dział Materiały;
2. widzi kartę „Chrupek i Tama Liczb” z prawdziwą miniaturą;
3. filtruje ją po umiejętności;
4. otwiera pełny podgląd;
5. dodaje grę do zestawu w kompozytorze;
6. ustawia działania, zakres i liczbę rund;
7. wysyła materiał klasie albo wybranym uczniom;
8. uczeń widzi go w Strefie Misji;
9. przechodzi animowaną grę bez powtórzonych przykładów;
10. gra zapisuje stan, wynik, użycie podpowiedzi i `skillId`;
11. bóbr ma osobne warstwy ciała, pyska, oczu, łap i ogona;
12. nauczyciel widzi raport umiejętności;
13. wszystkie trasy są chronione logowaniem;
14. separacja szkół przechodzi test RLS;
15. testy typów, komponentów, generatora i E2E przechodzą bez błędów.
16. działający klaser zachowuje 60 dotychczasowych naklejek i pokazuje dodatkową serię 20 premium;
17. żadna zwykła aktywność ani pojedynczy temat nie przyznaje premium;
18. ukończenie całego działu i nagroda nauczyciela przechodzą bezpieczną ścieżką serwerową;
19. wszystkie warianty Chrupka pozostają zgodne z oficjalnym renderem.

## 22. Rekomendowana kolejność najbliższych prac

Najlepszy następny krok to nie generowanie wszystkich obrazów naraz. Najpierw powstają:

1. kontrakt `MaterialDefinition` i makieta kart biblioteki;
2. jedna docelowa miniatura gry;
3. zatwierdzony model Chrupka oraz wariant hero;
4. działający prototyp gry na prostych warstwach;
5. bezpieczne rozszerzenie klasera 60 → 80 oraz pierwsze naklejki premium;
6. pełny zestaw reakcji, tła i 20 zweryfikowanych wariantów kolekcji;
7. kompozytor oraz wysyłka;
8. Strefa Misji ucznia i raport.

Takie podejście pozwala ocenić prawdziwą zabawę i czytelność matematyki, zanim powstanie wiele kosztownych wariantów graficznych.

## 23. Stan faktyczny po rozszerzeniu Strefy Misji

### Gotowe w kodzie

- zachowano 60 dotychczasowych naklejek i dodano 20 ukrytych nagród `Tajemniczej serii` o ID 60–79;
- katalog, klaser ucznia, podgląd nauczyciela i formularz przyznania rozpoznają czwartą kolekcję premium;
- 20 osobnych bitmap 300×300 jest renderowanych bez wycinania atlasów i bez utraty ostrości;
- przygotowano migrację `068_chrupek_premium_stickers.sql` z kontrolą szkoły, klasy, nauczyciela, ukończenia działu, idempotencji i braku duplikatów;
- wdrożono pierwszą grę „Chrupek i Tama Liczb”, pięć unikatowych rund, graficzne kłody odsunięte od Chrupka, timer, informację zwrotną, wskazówki, finał i ponowną próbę;
- dodano jednorazową nagrodę 5 punktów za pierwsze bezbłędne ukończenie, chronioną migracją `069_beaver_dam_perfect_reward.sql`;
- wdrożono „Latarnię Ułamków”: cztery niepowtarzalne fale, spadające odpowiedzi, osiem sekund na falę, wykrywanie ułamków równoważnych, osobne morskie tło i Chrupka przy konsoli;
- wdrożono „Kosmicznego Kuriera”: cztery niepowtarzalne trasy, trzy poprawne kroki i jedna pułapka w każdej rundzie, zerwanie błędnej trasy, osobne kosmiczne tło i Chrupka z tabletem;
- dodano chronioną, idempotentną migrację `070_visual_games_perfect_rewards.sql`, która może przyznać po 5 punktów za pierwsze bezbłędne przejście Latarni i Kuriera, ale nigdy nie przyznaje naklejek premium;
- wszystkie trzy gry są widoczne jako osobne karty z miniaturami w bibliotece nauczyciela, kompozytorze i Strefie Misji ucznia oraz mają chronione trasy dla obu ról;
- wdrożono chronioną bibliotekę nauczyciela, chronioną Strefę Misji ucznia i chroniony szkielet kompozytora MVP;
- wdrożono oficjalny wzorzec Chrupka, scenę gry oraz trzy warianty bohatera na stronie tytułowej;
- dopracowano publiczne hero, nawigację, prezentację pierwszej gry, końcowe CTA i stopkę;
- usunięto reklamowanie tajemniczej serii ze strony głównej, hero, biblioteki materiałów i finału zwykłej gry;
- zamknięte pola w klaserze oraz podglądzie nauczyciela pokazują wyłącznie neutralną kłódkę i `???`;
- nauczyciel nie może pobrać grafik tajemniczej serii przez chronioną trasę; może jedynie przyznać losową niespodziankę;
- pliki premium przeniesiono poza katalog publiczny i zabezpieczono trasą sprawdzającą rolę albo własność naklejki;
- zwykła gra nie przyznaje premium i wyraźnie komunikuje zasady tej kolekcji.

### Zweryfikowane lokalnie

- produkcyjny `next build` przechodzi;
- TypeScript `tsc --noEmit` przechodzi;
- 32 pliki testowe i 87 testów przechodzi, w tym pełne bezbłędne przejścia Latarni i Kuriera oraz testy unikatowości ich rund;
- lint wszystkich nowych i zmienionych modułów przechodzi;
- pełny lint repozytorium nadal pokazuje dwa wcześniejsze, niezwiązane błędy w `EngineSprintBoard.tsx` i `WrittenAddSubLessonModel.tsx`;
- `git diff --check` nie wykazuje błędów białych znaków.
- hero przy szerokości 1280 px nie ma poziomego przepełnienia, a oba główne CTA mieszczą się w pierwszym ekranie 1280×720;

### Wymaga kolejnego etapu

- migracja `068_chrupek_premium_stickers.sql` musi zostać zastosowana w środowisku Supabase i przejść test integracyjny na danych szkoły;
- migracje `069_beaver_dam_perfect_reward.sql` i `070_visual_games_perfect_rewards.sql` muszą zostać zastosowane w środowisku Supabase, aby jednorazowe nagrody 5 punktów działały po wdrożeniu;
- kompozytor MVP układa obecnie lokalny podgląd zestawu, ale świadomie nie udaje jeszcze zapisu ani wysyłki;
- trwały zapis kompozycji, wybór klasy i uczniów, wysyłka, próby, raporty i RLS materiałów wymagają planowanej migracji `069_material_library_and_assignments.sql`;
- osobne warstwy pyska, łap, oczu i ogona Chrupka oraz pełna animacja gryzienia pozostają w kolejnym pakiecie assetów;
- automatyczna celebracja nowo zdobytej naklejki premium wymaga podłączenia do istniejącej kolejki powiadomień po zastosowaniu migracji.
