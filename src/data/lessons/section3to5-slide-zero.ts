import type { LessonLearningGoal } from "@/types/lessonPackage";

export interface LessonSlideZeroContext {
  title: string;
  learningGoals: LessonLearningGoal[];
}

const REQUIREMENTS: Record<string, string> = {
  "IV.1": "opisuje część danej całości za pomocą ułamka.",
  "IV.2": "przedstawia ułamek jako iloraz liczb naturalnych, a iloraz liczb naturalnych jako ułamek zwykły.",
  "IV.3": "skraca i rozszerza ułamki zwykłe.",
  "IV.4": "sprowadza ułamki zwykłe do wspólnego mianownika.",
  "IV.5": "przedstawia ułamki niewłaściwe w postaci liczby mieszanej, a liczbę mieszaną w postaci ułamka niewłaściwego.",
  "IV.6": "zapisuje wyrażenia dwumianowane w postaci ułamka dziesiętnego i odwrotnie.",
  "IV.7": "zaznacza ułamki zwykłe i dziesiętne na osi liczbowej oraz odczytuje ułamki zaznaczone na osi.",
  "IV.8": "zapisuje ułamki dziesiętne skończone w postaci ułamków zwykłych.",
  "IV.9": "zamienia ułamki zwykłe o odpowiednich mianownikach na ułamki dziesiętne skończone dowolną poprawną metodą.",
  "IV.10": "zapisuje pozostałe ułamki zwykłe w postaci rozwinięcia dziesiętnego nieskończonego.",
  "IV.11": "w sytuacjach praktycznych zaokrągla ułamki dziesiętne do co najwyżej drugiego miejsca po przecinku.",
  "IV.12": "porównuje ułamki zwykłe i dziesiętne.",
  "IV.1–5": "opisuje część całości ułamkiem, interpretuje ułamek jako iloraz, skraca i rozszerza ułamki, sprowadza je do wspólnego mianownika oraz zamienia ułamki niewłaściwe i liczby mieszane.",
  "IV.6–12": "stosuje zapis dziesiętny i dwumianowany, zaznacza ułamki na osi, zamienia reprezentacje, zaokrągla i porównuje ułamki.",
  "V.1": "dodaje, odejmuje, mnoży i dzieli ułamki zwykłe o mianownikach jedno- lub dwucyfrowych, a także liczby mieszane.",
  "V.2": "dodaje, odejmuje, mnoży i dzieli ułamki dziesiętne w pamięci, pisemnie lub za pomocą kalkulatora w zakresie określonym w podstawie.",
  "V.3 (strategia rozszerzająca)": "porównuje ułamki z wykorzystaniem ich różnicy; w tym pakiecie jest to wyłącznie strategia rozszerzająca.",
  "V.4": "oblicza ułamek danej liczby całkowitej.",
  "V.1–2 (działania mieszane)": "wykonuje działania na ułamkach zwykłych, liczbach mieszanych i ułamkach dziesiętnych.",
  "V.6": "wykonuje działania na ułamkach dziesiętnych, używając własnych poprawnych strategii lub kalkulatora.",
  "VII.2": "rozpoznaje proste i odcinki prostopadłe oraz równoległe.",
  "VII.3": "rysuje pary odcinków prostopadłych i równoległych.",
  "VII.2–3": "rozpoznaje oraz rysuje pary prostych i odcinków prostopadłych i równoległych.",
  "VIII.1": "wskazuje w dowolnym kącie ramiona i wierzchołek.",
  "VIII.2": "mierzy z dokładnością do 1° kąty mniejsze niż 180°.",
  "VIII.3": "rysuje kąty mniejsze od 180°.",
  "VIII.4": "rozpoznaje kąt prosty, ostry i rozwarty.",
  "VIII.5": "porównuje kąty.",
  "VIII.6": "rozpoznaje kąty wierzchołkowe i przyległe oraz korzysta z ich własności.",
  "VIII.1–6": "wskazuje elementy kąta, mierzy, rysuje i porównuje kąty oraz korzysta z własności kątów wierzchołkowych i przyległych.",
  "IX.1": "rozpoznaje i nazywa trójkąty według ich kątów i boków.",
  "IX.2": "konstruuje trójkąt o danych trzech bokach i ustala możliwość jego zbudowania.",
  "IX.3": "stosuje twierdzenie o sumie kątów wewnętrznych trójkąta.",
  "IX.4": "rozpoznaje i nazywa kwadrat, prostokąt, romb, równoległobok i trapez.",
  "IX.5": "zna najważniejsze własności czworokątów, rozpoznaje figury osiowosymetryczne i wskazuje osie symetrii figur.",
  "IX.8": "w trójkącie równoramiennym wyznacza pozostałe kąty lub boki na podstawie podanych danych.",
  "IX.1–5 (przygotowanie pojęciowe)": "przygotowuje pojęcia potrzebne do rozpoznawania i nazywania trójkątów oraz czworokątów i korzystania z ich własności.",
  "IX.1–5": "rozpoznaje, nazywa i konstruuje trójkąty oraz rozpoznaje, nazywa i opisuje podstawowe czworokąty.",
  "XI.1": "oblicza miary kątów, stosując poznane własności kątów i wielokątów.",
  "XI.2 (tylko gdy występuje obwód)": "oblicza obwód wielokąta o danych długościach boków; wymaganie stosuje się tylko w zadaniu z obwodem.",
  "XII.1": "interpretuje 100%, 50%, 25%, 10% i 1% danej wielkości jako odpowiednią część całości.",
  "XII.2": "w kontekście praktycznym oblicza prosty procent danej wielkości.",
  "XII.6": "zamienia i prawidłowo stosuje jednostki długości.",
  "XII.7": "zamienia i prawidłowo stosuje jednostki masy.",
  "XII.6–7 (konteksty jednostek)": "zamienia i prawidłowo stosuje jednostki długości i masy w zadaniach praktycznych.",
  "XIV.5–6 (zadania praktyczne)": "stosuje poznaną arytmetykę w zadaniach praktycznych oraz weryfikuje sensowność wyniku, między innymi przez szacowanie.",
  "XIV.6": "weryfikuje wynik zadania tekstowego, oceniając sensowność rozwiązania przez szacowanie, sprawdzanie warunków i rzędu wielkości.",
};

function criterionFor(goal: string): string {
  return goal.replace(/^Nauczę się/, "Potrafię");
}

function context(
  topicId: string,
  title: string,
  codes: string[],
  goals: string[],
): LessonSlideZeroContext {
  const curriculumReferences = codes.map((code) => {
    const requirement = REQUIREMENTS[code];
    if (!requirement) throw new Error(`Brak pełnego brzmienia wymagania ${code} dla ${topicId}.`);
    return `${code} — ${requirement}`;
  });

  return {
    title,
    learningGoals: goals.map((studentGoal, index) => ({
      id: `${topicId.toLowerCase().replace(/\./g, "-")}-goal-${index + 1}`,
      studentGoal,
      successCriteria: [criterionFor(studentGoal)],
      curriculumReferences,
    })),
  };
}

const CONTEXTS: Record<string, LessonSlideZeroContext> = {
  "M5-3.1": context("M5-3.1", "Ułamki i liczby mieszane", ["IV.1", "IV.5", "IV.7"], [
    "Nauczę się opisywać część całości za pomocą ułamka.",
    "Nauczę się rozpoznawać ułamki właściwe i niewłaściwe.",
    "Nauczę się zamieniać liczbę mieszaną na ułamek niewłaściwy.",
    "Nauczę się zaznaczać ułamki na osi liczbowej.",
  ]),
  "M5-3.2": context("M5-3.2", "Ułamek jako iloraz", ["IV.2", "IV.5"], [
    "Nauczę się przedstawiać iloraz liczb naturalnych jako ułamek.",
    "Nauczę się przedstawiać ułamek jako iloraz liczb naturalnych.",
    "Nauczę się wyłączać całości z ułamka niewłaściwego i zapisywać liczbę mieszaną.",
  ]),
  "M5-3.3": context("M5-3.3", "Skracanie i rozszerzanie ułamków", ["IV.3", "IV.4"], [
    "Nauczę się rozpoznawać ułamki skracalne i nieskracalne oraz wyjaśniać, co oznacza rozszerzanie ułamka.",
    "Nauczę się skracać ułamek do postaci nieskracalnej.",
    "Nauczę się rozszerzać ułamek do wskazanego licznika lub mianownika.",
    "Nauczę się rozszerzać dwa ułamki tak, aby miały wspólny mianownik.",
  ]),
  "M5-3.4": context("M5-3.4", "Porównywanie ułamków", ["IV.4", "IV.12", "V.3 (strategia rozszerzająca)"], [
    "Nauczę się porównywać ułamki o jednakowych mianownikach.",
    "Nauczę się porównywać ułamki o jednakowych licznikach.",
    "Nauczę się porównywać ułamki o różnych licznikach i mianownikach metodą mnożenia na krzyż.",
  ]),
  "M5-3.5": context("M5-3.5", "Dodawanie i odejmowanie ułamków o jednakowych mianownikach", ["V.1"], [
    "Nauczę się dodawać ułamki o jednakowych mianownikach.",
    "Nauczę się odejmować ułamki o jednakowych mianownikach.",
    "Nauczę się wykonywać te działania na liczbach mieszanych.",
    "Nauczę się sprawdzać i upraszczać wynik.",
  ]),
  "M5-3.6": context("M5-3.6", "Dodawanie i odejmowanie ułamków o różnych mianownikach", ["IV.4", "V.1"], [
    "Nauczę się sprowadzać ułamki do wspólnego mianownika.",
    "Nauczę się dodawać i odejmować ułamki o różnych mianownikach.",
    "Nauczę się skracać wynik do najprostszej postaci.",
    "Nauczę się sprawdzać, czy otrzymany wynik ma sens.",
  ]),
  "M5-3.7": context("M5-3.7", "Mnożenie ułamka przez liczbę naturalną", ["V.1"], [
    "Nauczę się mnożyć ułamek przez liczbę naturalną.",
    "Nauczę się mnożyć ułamek przez ułamek i skracać przed mnożeniem.",
  ]),
  "M5-3.8": context("M5-3.8", "Obliczanie ułamka liczby naturalnej", ["V.4"], [
    "Nauczę się obliczać ułamek danej liczby naturalnej.",
  ]),
  "M5-3.9": context("M5-3.9", "Mnożenie ułamków", ["V.1"], [
    "Nauczę się mnożyć ułamek przez ułamek i skracać przed mnożeniem.",
    "Nauczę się rozpoznawać i zapisywać liczby odwrotne.",
  ]),
  "M5-3.10": context("M5-3.10", "Dzielenie ułamków przez liczby naturalne", ["V.1"], [
    "Nauczę się dzielić ułamek przez liczbę naturalną.",
    "Nauczę się zapisywać dzielenie jako mnożenie przez ułamek odwrotny.",
    "Nauczę się skracać wynik i sprawdzać go mnożeniem.",
  ]),
  "M5-3.11": context("M5-3.11", "Dzielenie ułamków", ["V.1"], [
    "Nauczę się dzielić ułamek przez ułamek, mnożąc przez odwrotność dzielnika.",
    "Nauczę się skracać po zmianie dzielenia na mnożenie i zapisywać wynik w najprostszej postaci.",
    "Nauczę się dzielić liczby mieszane po zamianie na ułamki niewłaściwe.",
    "Nauczę się rozwiązywać zadania tekstowe i sprawdzać wynik mnożeniem.",
  ]),
  "M5-3.R": context("M5-3.R", "Powtórzenie wiadomości o ułamkach zwykłych", ["IV.1–5", "IV.7", "IV.12", "V.1", "V.4"], [
    "Nauczę się dobierać reprezentację ułamka do zadania.",
    "Nauczę się wykonywać działania na ułamkach i liczbach mieszanych.",
    "Nauczę się rozpoznawać i poprawiać typowe błędy w działaniach na ułamkach.",
  ]),
  "M5-3.S": context("M5-3.S", "Sprawdzian — ułamki zwykłe", ["IV.1–5", "IV.7", "IV.12", "V.1", "V.4"], [
    "Nauczę się samodzielnie przedstawiać i porównywać ułamki.",
    "Nauczę się samodzielnie wykonywać działania na ułamkach.",
    "Nauczę się sprawdzać i uzasadniać rozwiązania z ułamkami.",
  ]),

  "M5-4.1": context("M5-4.1", "Proste prostopadłe i równoległe", ["VII.2", "VII.3"], [
    "Nauczę się rozpoznawać proste i odcinki równoległe.",
    "Nauczę się rozpoznawać proste i odcinki prostopadłe.",
    "Nauczę się odróżniać proste przecinające i współliniowe od prostych równoległych i prostopadłych.",
    "Nauczę się używać symboli równoległości i prostopadłości.",
  ]),
  "M5-4.2": context("M5-4.2", "Kąty i ich rodzaje", ["VIII.1", "VIII.4", "VIII.5"], [
    "Nauczę się wskazywać wierzchołek i ramiona kąta.",
    "Nauczę się rozpoznawać kąty ostre, proste i rozwarte.",
    "Nauczę się porównywać kąty bez sugerowania się długością ramion.",
  ]),
  "M5-4.3": context("M5-4.3", "Mierzenie i rysowanie kątów", ["VIII.2", "VIII.3"], [
    "Nauczę się prawidłowo ustawiać kątomierz.",
    "Nauczę się mierzyć kąty z dokładnością do jednego stopnia.",
    "Nauczę się rysować kąty o podanej mierze.",
    "Nauczę się wybierać właściwą skalę kątomierza.",
  ]),
  "M5-4.4": context("M5-4.4", "Kąty przyległe i wierzchołkowe", ["VIII.6", "XI.1"], [
    "Nauczę się rozpoznawać kąty przyległe i wierzchołkowe.",
    "Nauczę się korzystać z równości kątów wierzchołkowych.",
    "Nauczę się korzystać z sumy 180° kątów przyległych.",
    "Nauczę się obliczać brakujące miary kątów z uzasadnieniem.",
  ]),
  "M5-4.5": context("M5-4.5", "Wielokąty", ["IX.1–5 (przygotowanie pojęciowe)", "XI.2 (tylko gdy występuje obwód)"], [
    "Nauczę się rozpoznawać wielokąty.",
    "Nauczę się wskazywać wierzchołki, boki i przekątne wielokąta.",
    "Nauczę się nazywać wielokąt według liczby boków.",
    "Nauczę się tworzyć przykład i kontrprzykład wielokąta.",
  ]),
  "M5-4.6": context("M5-4.6", "Rodzaje trójkątów", ["IX.1"], [
    "Nauczę się klasyfikować trójkąty według długości boków.",
    "Nauczę się klasyfikować trójkąty według miar kątów.",
    "Nauczę się podawać obie klasyfikacje tego samego trójkąta.",
    "Nauczę się uzasadniać klasyfikację za pomocą cech figury.",
  ]),
  "M5-4.7": context("M5-4.7", "Konstrukcja trójkąta o danych bokach", ["IX.2"], [
    "Nauczę się sprawdzać, czy z trzech odcinków można zbudować trójkąt.",
    "Nauczę się konstruować trójkąt o danych bokach.",
    "Nauczę się opisywać kolejne kroki konstrukcji.",
  ]),
  "M5-4.8": context("M5-4.8", "Miary kątów w trójkątach", ["IX.3", "IX.8", "XI.1"], [
    "Nauczę się korzystać z sumy 180° kątów wewnętrznych trójkąta.",
    "Nauczę się obliczać brakujący kąt trójkąta.",
    "Nauczę się korzystać z własności kątów w trójkącie równoramiennym.",
    "Nauczę się zapisywać uzasadnienie obliczenia.",
  ]),
  "M5-4.9": context("M5-4.9", "Prostokąty i kwadraty", ["IX.4", "IX.5"], [
    "Nauczę się rozpoznawać prostokąty i kwadraty w różnych położeniach.",
    "Nauczę się opisywać boki, kąty i przekątne prostokątów i kwadratów.",
    "Nauczę się wyjaśniać, dlaczego każdy kwadrat jest prostokątem.",
    "Nauczę się budować figurę spełniającą podane warunki.",
  ]),
  "M5-4.10": context("M5-4.10", "Równoległoboki i romby", ["IX.4", "IX.5"], [
    "Nauczę się rozpoznawać równoległoboki i romby.",
    "Nauczę się opisywać boki, kąty i przekątne równoległoboków i rombów.",
    "Nauczę się wskazywać cechy wspólne i różnice między tymi figurami.",
    "Nauczę się uzasadniać klasyfikację figury.",
  ]),
  "M5-4.11": context("M5-4.11", "Trapezy", ["IX.4", "IX.5", "XI.1"], [
    "Nauczę się rozpoznawać trapezy na podstawie boków równoległych.",
    "Nauczę się wskazywać podstawy i ramiona trapezu.",
    "Nauczę się rozpoznawać trapez równoramienny i prostokątny.",
    "Nauczę się korzystać z własności kątów przy ramieniu.",
  ]),
  "M5-4.12": context("M5-4.12", "Czworokąty — podsumowanie", ["IX.4", "IX.5"], [
    "Nauczę się porównywać własności czworokątów.",
    "Nauczę się umieszczać czworokąty w mapie rodzin.",
    "Nauczę się podawać przykłady i kontrprzykłady zdań o figurach.",
    "Nauczę się wybierać najdokładniejszą nazwę figury.",
  ]),
  "M5-4.13": context("M5-4.13", "Oś symetrii", ["IX.5"], [
    "Nauczę się rozpoznawać figury osiowosymetryczne.",
    "Nauczę się wskazywać osie symetrii figur.",
    "Nauczę się sprawdzać symetrię przez nałożenie lub złożenie.",
    "Nauczę się uzupełniać wzór względem danej osi w zadaniu rozszerzającym.",
  ]),
  "M5-4.R": context("M5-4.R", "Powtórzenie wiadomości o figurach na płaszczyźnie", ["VII.2–3", "VIII.1–6", "IX.1–5", "IX.8", "XI.1"], [
    "Nauczę się dobierać własności kątów do obliczenia.",
    "Nauczę się klasyfikować trójkąty i czworokąty na podstawie ich cech.",
    "Nauczę się wykonywać konstrukcje i uzasadniać ich poprawność.",
  ]),
  "M5-4.S": context("M5-4.S", "Sprawdzian — figury na płaszczyźnie", ["VII.2–3", "VIII.1–6", "IX.1–5", "IX.8", "XI.1"], [
    "Nauczę się samodzielnie mierzyć i obliczać kąty.",
    "Nauczę się samodzielnie klasyfikować i konstruować figury.",
    "Nauczę się uzasadniać rozwiązania geometryczne.",
  ]),

  "M5-5.1": context("M5-5.1", "Zapisywanie ułamków dziesiętnych", ["IV.6", "IV.7", "IV.8", "IV.9"], [
    "Nauczę się odczytywać i zapisywać ułamki dziesiętne.",
    "Nauczę się wskazywać części dziesiąte, setne i tysięczne.",
    "Nauczę się przedstawiać ułamek dziesiętny na modelu i osi.",
    "Nauczę się łączyć prosty ułamek zwykły z zapisem dziesiętnym.",
  ]),
  "M5-5.2": context("M5-5.2", "Porównywanie ułamków dziesiętnych", ["IV.7", "IV.12"], [
    "Nauczę się porównywać ułamki dziesiętne w tabeli pozycyjnej.",
    "Nauczę się porównywać ułamki dziesiętne na osi liczbowej.",
    "Nauczę się korzystać z zer końcowych bez zmiany wartości liczby.",
    "Nauczę się porządkować liczby rosnąco i malejąco.",
  ]),
  "M5-5.3": context("M5-5.3", "Długość i masa w zapisie dziesiętnym", ["IV.6", "XII.6", "XII.7"], [
    "Nauczę się zamieniać jednostki długości.",
    "Nauczę się zamieniać jednostki masy.",
    "Nauczę się przechodzić między zapisem dwumianowanym i dziesiętnym.",
    "Nauczę się oceniać, czy otrzymana wielkość jest realistyczna.",
  ]),
  "M5-5.4": context("M5-5.4", "Dodawanie i odejmowanie ułamków dziesiętnych", ["V.2", "V.6", "XIV.5–6 (zadania praktyczne)"], [
    "Nauczę się wyrównywać przecinki w zapisie pisemnym.",
    "Nauczę się dodawać ułamki dziesiętne.",
    "Nauczę się odejmować ułamki dziesiętne.",
    "Nauczę się szacować i sprawdzać wynik.",
  ]),
  "M5-5.5": context("M5-5.5", "Mnożenie ułamków dziesiętnych przez 10, 100, 1000…", ["V.2", "V.6", "XII.6–7 (konteksty jednostek)"], [
    "Nauczę się mnożyć ułamki dziesiętne przez 10, 100 i 1000.",
    "Nauczę się wyjaśniać zmianę wartości cyfr w tabeli pozycyjnej.",
    "Nauczę się stosować mnożenie przez potęgi 10 w zamianie jednostek.",
  ]),
  "M5-5.6": context("M5-5.6", "Dzielenie ułamków dziesiętnych przez 10, 100, 1000…", ["V.2", "V.6", "XII.6–7 (konteksty jednostek)"], [
    "Nauczę się dzielić ułamki dziesiętne przez 10, 100 i 1000.",
    "Nauczę się wyjaśniać zmianę wartości cyfr w tabeli pozycyjnej.",
    "Nauczę się poprawnie zapisywać zera wiodące.",
    "Nauczę się stosować dzielenie w zamianie jednostek.",
  ]),
  "M5-5.7": context("M5-5.7", "Mnożenie ułamka dziesiętnego przez liczbę naturalną", ["V.2", "V.6"], [
    "Nauczę się interpretować mnożenie jako powtarzanie jednakowych porcji.",
    "Nauczę się mnożyć ułamek dziesiętny przez liczbę naturalną pisemnie.",
    "Nauczę się ustalać położenie przecinka w wyniku.",
    "Nauczę się kontrolować rząd wielkości wyniku.",
  ]),
  "M5-5.8": context("M5-5.8", "Mnożenie ułamków dziesiętnych", ["V.2", "V.6"], [
    "Nauczę się interpretować iloczyn ułamków dziesiętnych na modelu.",
    "Nauczę się mnożyć ułamki dziesiętne pisemnie.",
    "Nauczę się ustalać liczbę miejsc po przecinku w wyniku.",
    "Nauczę się sprawdzać wynik przez szacowanie.",
  ]),
  "M5-5.9": context("M5-5.9", "Dzielenie ułamków dziesiętnych przez liczby naturalne", ["V.2", "V.6"], [
    "Nauczę się dzielić ułamki dziesiętne przez liczby naturalne.",
    "Nauczę się prawidłowo umieszczać przecinek w ilorazie.",
    "Nauczę się dopisywać potrzebne zera do dzielnej.",
    "Nauczę się sprawdzać wynik mnożeniem.",
  ]),
  "M5-5.10": context("M5-5.10", "Dzielenie przez ułamek dziesiętny", ["V.2", "V.6"], [
    "Nauczę się interpretować dzielenie przez ułamek dziesiętny.",
    "Nauczę się mnożyć dzielną i dzielnik przez tę samą potęgę 10.",
    "Nauczę się otrzymywać dzielnik naturalny bez zmiany ilorazu.",
    "Nauczę się szacować i sprawdzać wynik.",
  ]),
  "M5-5.11": context("M5-5.11", "Szacowanie wyników działań na ułamkach dziesiętnych", ["IV.11", "V.6", "XIV.6"], [
    "Nauczę się szacować wynik przed dokładnym obliczeniem.",
    "Nauczę się wskazywać sensowny przedział wyniku.",
    "Nauczę się wykrywać błędy przecinka i jednostki.",
    "Nauczę się uzasadniać, dlaczego wynik jest albo nie jest możliwy.",
  ]),
  "M5-5.12": context("M5-5.12", "Ułamki zwykłe i dziesiętne", ["IV.8", "IV.9", "IV.10", "IV.12", "V.1–2 (działania mieszane)"], [
    "Nauczę się zamieniać ułamki dziesiętne na zwykłe.",
    "Nauczę się zamieniać wybrane ułamki zwykłe na dziesiętne.",
    "Nauczę się porównywać obie reprezentacje.",
    "Nauczę się wybierać zapis, który ułatwia działanie.",
  ]),
  "M5-5.13": context("M5-5.13", "Procenty a ułamki", ["XII.1", "XII.2"], [
    "Nauczę się przedstawiać proste procenty jako ułamki i liczby dziesiętne.",
    "Nauczę się zaznaczać procent na siatce 10×10.",
    "Nauczę się obliczać proste procenty wielkości w sytuacjach praktycznych.",
  ]),
  "M5-5.R": context("M5-5.R", "Powtórzenie wiadomości o ułamkach dziesiętnych", ["IV.6–12", "V.2", "V.6", "XII.6–7 (konteksty jednostek)", "XIV.5–6 (zadania praktyczne)"], [
    "Nauczę się dobierać zapis dziesiętny do miary i sytuacji praktycznej.",
    "Nauczę się wykonywać działania na ułamkach dziesiętnych.",
    "Nauczę się szacować wynik i poprawiać błędy przecinka lub jednostki.",
  ]),
  "M5-5.S": context("M5-5.S", "Sprawdzian — ułamki dziesiętne", ["IV.6–12", "V.2", "V.6", "XII.6–7 (konteksty jednostek)", "XIV.5–6 (zadania praktyczne)"], [
    "Nauczę się samodzielnie zapisywać i porównywać ułamki dziesiętne.",
    "Nauczę się samodzielnie wykonywać działania na ułamkach dziesiętnych.",
    "Nauczę się sprawdzać sens wyniku w zadaniu praktycznym.",
  ]),
};

export function getSection3To5SlideZeroContext(topicId: string): LessonSlideZeroContext | undefined {
  return CONTEXTS[topicId];
}
