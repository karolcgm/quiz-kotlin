export type Grade6TopicKind = "regular" | "review" | "exam" | "optional";

export interface Grade6PlanTopic {
  title: string;
  goal: string;
  kind?: Grade6TopicKind;
}

export interface Grade6PlanSection {
  number: number;
  title: string;
  goal: string;
  topics: Grade6PlanTopic[];
}

const topic = (title: string, goal: string, kind: Grade6TopicKind = "regular"): Grade6PlanTopic => ({ title, goal, kind });

/** Szkielet według rozkładu materiału dla klasy VI (rok 2026/2027). */
export const grade6PlanSections: Grade6PlanSection[] = [
  {
    number: 1,
    title: "Liczby naturalne i ułamki",
    goal: "Doskonalenie obliczeń na liczbach naturalnych oraz ułamkach zwykłych i dziesiętnych.",
    topics: [
      topic("Rachunki pamięciowe na liczbach naturalnych", "sprawnie wykonywać rachunki pamięciowe na liczbach naturalnych"),
      topic("Rachunki pamięciowe na ułamkach dziesiętnych", "wykonywać rachunki pamięciowe na ułamkach dziesiętnych"),
      topic("Działania pisemne na ułamkach dziesiętnych", "poprawnie wykonywać działania pisemne na ułamkach dziesiętnych"),
      topic("Potęgowanie liczb", "rozumieć zapis potęgi i obliczać proste potęgi liczb", "optional"),
      topic("Działania na ułamkach zwykłych", "wykonywać działania na ułamkach zwykłych i liczbach mieszanych"),
      topic("Ułamki zwykłe i dziesiętne", "wybierać wygodny zapis liczby: ułamek zwykły albo dziesiętny"),
      topic("Rozwinięcia dziesiętne ułamków zwykłych", "zapisywać ułamki zwykłe w postaci rozwinięcia dziesiętnego"),
      topic("Powtórzenie wiadomości", "samodzielnie łączyć wiadomości o liczbach naturalnych i ułamkach", "review"),
      topic("Praca klasowa i omówienie", "sprawdzić swoje umiejętności i omówić rozwiązania", "exam"),
    ],
  },
  {
    number: 2,
    title: "Figury na płaszczyźnie",
    goal: "Rozpoznawanie figur płaskich, ich elementów i własności.",
    topics: [
      topic("Proste i odcinki", "rozpoznawać i rysować proste, półproste oraz odcinki, a także wskazywać proste i odcinki równoległe oraz prostopadłe"),
      topic("Okręgi i koła", "odróżniać okrąg od koła, wskazywać promień, średnicę i cięciwę oraz obliczać odcinki w układach stycznych okręgów"),
      topic("Trójkąty", "klasyfikować trójkąty i korzystać z ich własności"),
      topic("Czworokąty i inne wielokąty", "rozpoznawać czworokąty i inne wielokąty oraz opisywać ich własności"),
      topic("Kąty", "rozpoznawać, mierzyć i porównywać kąty"),
      topic("Kąty w trójkątach i czworokątach", "obliczać miary kątów w trójkątach i czworokątach"),
      topic("Powtórzenie wiadomości", "samodzielnie wykorzystywać własności figur płaskich", "review"),
      topic("Praca klasowa i omówienie", "sprawdzić swoje umiejętności i omówić rozwiązania", "exam"),
    ],
  },
  {
    number: 3,
    title: "Liczby na co dzień",
    goal: "Stosowanie liczb, jednostek i danych w sytuacjach praktycznych.",
    topics: [
      topic("Kalendarz i czas", "obliczać czas i korzystać z kalendarza"),
      topic("Jednostki długości i jednostki masy", "zamieniać jednostki długości i masy"),
      topic("Skala na planach i mapach", "korzystać ze skali na planie i mapie"),
      topic("Zaokrąglanie liczb", "zaokrąglać liczby do wskazanego rzędu"),
      topic("Kalkulator", "korzystać z kalkulatora i oceniać sens wyniku"),
      topic("Odczytywanie informacji", "odczytywać i interpretować informacje zapisane w tabelach oraz tekstach"),
      topic("Odczytywanie danych z wykresów", "odczytywać i interpretować dane przedstawione na wykresach"),
      topic("Powtórzenie wiadomości", "samodzielnie stosować liczby w sytuacjach praktycznych", "review"),
      topic("Praca klasowa i omówienie", "sprawdzić swoje umiejętności i omówić rozwiązania", "exam"),
    ],
  },
  {
    number: 4,
    title: "Prędkość, droga, czas",
    goal: "Rozwiązywanie zadań dotyczących zależności między drogą, prędkością i czasem.",
    topics: [
      topic("Droga", "obliczać drogę na podstawie prędkości i czasu"),
      topic("Prędkość", "obliczać prędkość na podstawie drogi i czasu"),
      topic("Czas", "obliczać czas na podstawie drogi i prędkości"),
      topic("Droga, prędkość, czas", "rozwiązywać zadania łączące drogę, prędkość i czas"),
      topic("Powtórzenie wiadomości", "samodzielnie rozwiązywać zadania o drodze, prędkości i czasie", "review"),
      topic("Praca klasowa i omówienie", "sprawdzić swoje umiejętności i omówić rozwiązania", "exam"),
    ],
  },
  {
    number: 5,
    title: "Pola wielokątów",
    goal: "Obliczanie pól wielokątów i stosowanie wzorów w zadaniach.",
    topics: [
      topic("Pole prostokąta", "obliczać pole prostokąta i kwadratu"),
      topic("Pole równoległoboku i rombu", "obliczać pole równoległoboku i rombu"),
      topic("Pole trójkąta", "obliczać pole trójkąta"),
      topic("Pole trapezu", "obliczać pole trapezu"),
      topic("Powtórzenie wiadomości", "samodzielnie dobierać wzór na pole figury", "review"),
      topic("Praca klasowa i omówienie", "sprawdzić swoje umiejętności i omówić rozwiązania", "exam"),
    ],
  },
  {
    number: 6,
    title: "Procenty",
    goal: "Rozumienie procentu i wykonywanie obliczeń procentowych w praktyce.",
    topics: [
      topic("Procenty i ułamki", "łączyć procenty z ułamkami zwykłymi i dziesiętnymi"),
      topic("Jaki to procent?", "obliczać, jaki procent jednej liczby stanowi druga liczba"),
      topic("Jaki to procent? — kalkulator", "sprawdzać obliczenia procentowe za pomocą kalkulatora", "optional"),
      topic("Diagramy procentowe", "odczytywać i tworzyć diagramy procentowe"),
      topic("Obliczenia procentowe", "obliczać procent danej liczby"),
      topic("Obniżki i podwyżki", "obliczać ceny po obniżkach i podwyżkach"),
      topic("Liczba, gdy dany jest jej procent", "obliczać liczbę, gdy znany jest jej procent", "optional"),
      topic("Powtórzenie wiadomości", "samodzielnie rozwiązywać zadania procentowe", "review"),
      topic("Praca klasowa i omówienie", "sprawdzić swoje umiejętności i omówić rozwiązania", "exam"),
    ],
  },
  {
    number: 7,
    title: "Liczby dodatnie i liczby ujemne",
    goal: "Porównywanie oraz wykonywanie działań na liczbach całkowitych.",
    topics: [
      topic("Porównywanie liczb", "porównywać liczby dodatnie i ujemne"),
      topic("Dodawanie i odejmowanie", "dodawać i odejmować liczby całkowite"),
      topic("Mnożenie i dzielenie", "mnożyć i dzielić liczby całkowite"),
      topic("Powtórzenie wiadomości", "samodzielnie wykonywać działania na liczbach całkowitych", "review"),
      topic("Praca klasowa i omówienie", "sprawdzić swoje umiejętności i omówić rozwiązania", "exam"),
    ],
  },
  {
    number: 8,
    title: "Wyrażenia algebraiczne i równania",
    goal: "Zapisywanie, upraszczanie i rozwiązywanie wyrażeń algebraicznych oraz równań.",
    topics: [
      topic("Zapisywanie wyrażeń algebraicznych", "zapisywać wyrażenia algebraiczne opisujące sytuacje"),
      topic("Obliczanie wartości wyrażeń algebraicznych", "obliczać wartość wyrażenia algebraicznego"),
      topic("Upraszczanie wyrażeń algebraicznych", "upraszczać wyrażenia algebraiczne"),
      topic("Zapisywanie równań", "zapisywać równania opisujące sytuacje"),
      topic("Liczba spełniająca równanie", "sprawdzać, czy liczba spełnia równanie"),
      topic("Rozwiązywanie równań", "rozwiązywać proste równania"),
      topic("Zadania tekstowe", "rozwiązywać zadania tekstowe za pomocą równań"),
      topic("Powtórzenie wiadomości", "samodzielnie stosować wyrażenia algebraiczne i równania", "review"),
      topic("Praca klasowa i omówienie", "sprawdzić swoje umiejętności i omówić rozwiązania", "exam"),
    ],
  },
  {
    number: 9,
    title: "Figury przestrzenne",
    goal: "Rozpoznawanie brył, ich siatek oraz obliczanie objętości.",
    topics: [
      topic("Prostopadłościany i sześciany", "rozpoznawać prostopadłościany i sześciany oraz opisywać ich elementy"),
      topic("Graniastosłupy proste", "rozpoznawać i opisywać graniastosłupy proste"),
      topic("Siatki graniastosłupów prostych", "rozpoznawać i rysować siatki graniastosłupów prostych"),
      topic("Pole powierzchni graniastosłupa prostego", "obliczać pole powierzchni graniastosłupa prostego", "optional"),
      topic("Objętość prostopadłościanu. Jednostki objętości", "obliczać objętość prostopadłościanu i zamieniać jednostki objętości"),
      topic("Objętość graniastosłupa prostego", "obliczać objętość graniastosłupa prostego", "optional"),
      topic("Ostrosłupy", "rozpoznawać i opisywać ostrosłupy"),
      topic("Rozpoznawanie figur przestrzennych", "rozpoznawać figury przestrzenne w różnych przedstawieniach"),
      topic("Powtórzenie wiadomości", "samodzielnie rozwiązywać zadania o figurach przestrzennych", "review"),
      topic("Praca klasowa i omówienie", "sprawdzić swoje umiejętności i omówić rozwiązania", "exam"),
    ],
  },
];
