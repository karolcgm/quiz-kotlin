export type Grade4TopicKind = "regular" | "review";

export interface Grade4PlanTopic {
  title: string;
  hours: number;
  goal: string;
  kind: Grade4TopicKind;
}

export interface Grade4PlanSection {
  number: number;
  title: string;
  hours: number;
  goal: string;
  topics: Grade4PlanTopic[];
}

const topic = (
  title: string,
  hours: number,
  goal: string,
  kind: Grade4TopicKind = "regular",
): Grade4PlanTopic => ({ title, hours, goal, kind });

/**
 * Szkielet programu klasy IV na rok 2026/2027.
 * Kolejność i liczba godzin odpowiadają rozkładowi przekazanemu przez użytkownika.
 */
export const grade4PlanSections: Grade4PlanSection[] = [
  {
    number: 1,
    title: "Liczby i działania",
    hours: 23,
    goal: "Sprawne wykonywanie działań pamięciowych i rozwiązywanie zadań z liczbami naturalnymi.",
    topics: [
      topic("Rachunki pamięciowe – dodawanie i odejmowanie", 2, "dodawać i odejmować liczby naturalne w pamięci"),
      topic("O ile więcej, o ile mniej", 2, "rozpoznawać i obliczać różnicę opisaną zwrotami „o ile więcej” i „o ile mniej”"),
      topic("Rachunki pamięciowe – mnożenie i dzielenie", 1, "mnożyć i dzielić liczby naturalne w pamięci"),
      topic("Mnożenie i dzielenie przez 10, 100…", 1, "mnożyć i dzielić liczby naturalne przez 10, 100 i 1000"),
      topic("Mnożenie i dzielenie (cd.)", 2, "stosować poznane sposoby mnożenia i dzielenia w trudniejszych przykładach"),
      topic("Ile razy więcej, ile razy mniej", 2, "rozpoznawać i obliczać iloraz opisany zwrotami „ile razy więcej” i „ile razy mniej”"),
      topic("Dzielenie z resztą", 2, "wykonywać dzielenie z resztą i sprawdzać otrzymany wynik"),
      topic("Kwadraty i sześciany liczb", 1, "zapisywać i obliczać kwadraty oraz sześciany prostych liczb"),
      topic("Zadania tekstowe, cz. 1", 2, "wybierać działanie pasujące do treści zadania i zapisywać odpowiedź"),
      topic("Czytanie tekstów. Analizowanie informacji, cz. 1", 1, "wyszukiwać dane potrzebne do rozwiązania zadania"),
      topic("Czytanie tekstów. Analizowanie informacji, cz. 2", 1, "łączyć informacje z tekstu, tabeli lub prostego diagramu"),
      topic("Zadania tekstowe, cz. 2", 2, "rozwiązywać wieloetapowe zadania tekstowe na liczbach naturalnych"),
      topic("Kolejność wykonywania działań", 2, "wykonywać działania w poprawnej kolejności"),
      topic("Oś liczbowa", 1, "odczytywać i zaznaczać liczby naturalne na osi liczbowej"),
      topic("Powtórzenie", 1, "samodzielnie łączyć wiadomości o liczbach naturalnych i działaniach", "review"),
    ],
  },
  {
    number: 2,
    title: "Systemy zapisywania liczb",
    hours: 16,
    goal: "Zapisywanie, porównywanie i praktyczne stosowanie liczb oraz jednostek.",
    topics: [
      topic("System dziesiątkowy", 2, "odczytywać i zapisywać liczby w systemie dziesiątkowym oraz określać znaczenie cyfr"),
      topic("Porównywanie liczb naturalnych", 1, "porównywać i porządkować liczby naturalne"),
      topic("Rachunki pamięciowe na dużych liczbach", 2, "wykonywać proste obliczenia pamięciowe na dużych liczbach"),
      topic("Jednostki monetarne – złote i grosze", 1, "zapisywać i przeliczać kwoty w złotych i groszach"),
      topic("Jednostki długości", 2, "dobierać i zamieniać poznane jednostki długości"),
      topic("Jednostki masy", 2, "dobierać i zamieniać poznane jednostki masy"),
      topic("System rzymski", 2, "odczytywać i zapisywać liczby za pomocą znaków rzymskich"),
      topic("Z kalendarzem za pan brat", 1, "odczytywać daty i obliczać upływ czasu w kalendarzu"),
      topic("Godziny na zegarach", 2, "odczytywać czas na zegarze i wykonywać proste obliczenia zegarowe"),
      topic("Powtórzenie", 1, "samodzielnie stosować sposoby zapisywania liczb i jednostki", "review"),
    ],
  },
  {
    number: 3,
    title: "Działania pisemne",
    hours: 14,
    goal: "Poprawne wykonywanie działań pisemnych i stosowanie ich w zadaniach.",
    topics: [
      topic("Dodawanie pisemne", 2, "dodawać liczby naturalne sposobem pisemnym"),
      topic("Odejmowanie pisemne", 2, "odejmować liczby naturalne sposobem pisemnym"),
      topic("Mnożenie pisemne przez liczby jednocyfrowe", 2, "mnożyć pisemnie przez liczbę jednocyfrową"),
      topic("Mnożenie przez liczby z zerami na końcu", 1, "sprawnie mnożyć liczby mające zera na końcu"),
      topic("Mnożenie pisemne przez liczby wielocyfrowe", 2, "mnożyć pisemnie przez liczby wielocyfrowe"),
      topic("Dzielenie pisemne przez liczby jednocyfrowe", 2, "dzielić pisemnie przez liczbę jednocyfrową"),
      topic("Działania pisemne. Zadania tekstowe", 2, "dobierać działanie pisemne do zadania tekstowego i sprawdzać wynik"),
      topic("Powtórzenie", 1, "samodzielnie wykonywać działania pisemne i wybierać właściwą metodę", "review"),
    ],
  },
  {
    number: 4,
    title: "Figury geometryczne",
    hours: 19,
    goal: "Rozpoznawanie, rysowanie i mierzenie figur oraz ich elementów.",
    topics: [
      topic("Proste, półproste, odcinki", 2, "rozpoznawać i rysować proste, półproste oraz odcinki"),
      topic("Wzajemne położenie prostych", 1, "rozpoznawać różne wzajemne położenia prostych"),
      topic("Odcinki prostopadłe i odcinki równoległe", 1, "rozpoznawać i rysować odcinki prostopadłe oraz równoległe"),
      topic("Mierzenie długości", 1, "mierzyć i rysować odcinki o podanej długości"),
      topic("Kąty", 1, "rozpoznawać kąty i wskazywać ich ramiona oraz wierzchołek"),
      topic("Mierzenie kątów", 2, "mierzyć i rysować kąty za pomocą kątomierza"),
      topic("Wielokąty", 1, "rozpoznawać wielokąty i wskazywać ich boki, wierzchołki oraz kąty"),
      topic("Prostokąty i kwadraty", 1, "rozpoznawać prostokąty i kwadraty oraz opisywać ich własności"),
      topic("Obwody prostokątów i kwadratów", 2, "obliczać obwody prostokątów i kwadratów"),
      topic("Koła i okręgi", 2, "rozpoznawać koło i okrąg oraz wskazywać promień, średnicę i środek"),
      topic("Co to jest skala?", 2, "rozumieć znaczenie skali i porównywać wymiary rysunku z rzeczywistymi"),
      topic("Skala na planach", 2, "odczytywać i obliczać proste odległości na planach w podanej skali"),
      topic("Powtórzenie", 1, "samodzielnie wykorzystywać własności i pomiary figur geometrycznych", "review"),
    ],
  },
  {
    number: 5,
    title: "Ułamki zwykłe",
    hours: 15,
    goal: "Rozumienie ułamka zwykłego oraz wykonywanie podstawowych działań na ułamkach.",
    topics: [
      topic("Ułamek jako część całości", 2, "odczytywać, zapisywać i przedstawiać ułamek jako część całości"),
      topic("Liczby mieszane", 1, "rozpoznawać i zapisywać liczby mieszane"),
      topic("Ułamki i liczby mieszane na osi liczbowej", 1, "odczytywać i zaznaczać ułamki oraz liczby mieszane na osi liczbowej"),
      topic("Porównywanie ułamków", 2, "porównywać ułamki o jednakowych licznikach lub mianownikach"),
      topic("Rozszerzanie i skracanie ułamków", 2, "rozszerzać i skracać ułamki bez zmiany ich wartości"),
      topic("Ułamki niewłaściwe", 1, "rozpoznawać ułamki niewłaściwe i zamieniać je na liczby mieszane oraz odwrotnie"),
      topic("Dodawanie ułamków zwykłych", 2, "dodawać ułamki o jednakowych mianownikach"),
      topic("Odejmowanie ułamków zwykłych", 3, "odejmować ułamki o jednakowych mianownikach i proste liczby mieszane"),
      topic("Powtórzenie", 1, "samodzielnie stosować poznane wiadomości o ułamkach zwykłych", "review"),
    ],
  },
  {
    number: 6,
    title: "Ułamki dziesiętne",
    hours: 14,
    goal: "Odczytywanie, porównywanie i wykonywanie podstawowych działań na ułamkach dziesiętnych.",
    topics: [
      topic("Ułamki o mianownikach 10, 100, 1000, …", 2, "zapisywać ułamki o mianownikach 10, 100 i 1000 w postaci dziesiętnej"),
      topic("Zapisywanie wyrażeń dwumianowanych, cz. 1", 2, "zamieniać proste wyrażenia dwumianowane na zapis dziesiętny"),
      topic("Zapisywanie wyrażeń dwumianowanych, cz. 2", 2, "stosować zapis dziesiętny w zadaniach z jednostkami"),
      topic("Różne zapisy tego samego ułamka dziesiętnego", 1, "rozpoznawać równoważne zapisy tego samego ułamka dziesiętnego"),
      topic("Porównywanie ułamków dziesiętnych", 2, "porównywać i porządkować ułamki dziesiętne"),
      topic("Dodawanie ułamków dziesiętnych", 2, "dodawać ułamki dziesiętne"),
      topic("Odejmowanie ułamków dziesiętnych", 2, "odejmować ułamki dziesiętne"),
      topic("Powtórzenie", 1, "samodzielnie stosować poznane wiadomości o ułamkach dziesiętnych", "review"),
    ],
  },
  {
    number: 7,
    title: "Pola figur",
    hours: 5,
    goal: "Rozumienie pola figury oraz obliczanie pola prostokąta i kwadratu.",
    topics: [
      topic("Co to jest pole figury?", 1, "porównywać pola figur i rozumieć, co opisuje pole"),
      topic("Jednostki pola. Pole prostokąta", 2, "stosować jednostki pola oraz obliczać pole prostokąta i kwadratu"),
      topic("Wycinanki i układanki", 1, "porównywać i obliczać pola figur przez dzielenie oraz układanie części"),
      topic("Powtórzenie", 1, "samodzielnie obliczać pola prostych figur", "review"),
    ],
  },
  {
    number: 8,
    title: "Prostopadłościany i sześciany",
    hours: 12,
    goal: "Rozpoznawanie prostopadłościanów i sześcianów oraz obliczanie ich pola i objętości.",
    topics: [
      topic("Opis prostopadłościanu", 2, "rozpoznawać prostopadłościan i sześcian oraz wskazywać ściany, krawędzie i wierzchołki"),
      topic("Siatki prostopadłościanów", 2, "rozpoznawać i budować siatki prostopadłościanów oraz sześcianów"),
      topic("Pole powierzchni prostopadłościanu", 2, "obliczać pole powierzchni prostopadłościanu i sześcianu"),
      topic("Jednostki objętości", 1, "rozumieć i stosować podstawowe jednostki objętości"),
      topic("Objętość prostopadłościanu", 2, "obliczać objętość prostopadłościanu i sześcianu"),
      topic("Litry i mililitry", 2, "odczytywać pojemność i zamieniać litry na mililitry oraz odwrotnie"),
      topic("Powtórzenie", 1, "samodzielnie rozwiązywać zadania o prostopadłościanach i sześcianach", "review"),
    ],
  },
];

/** Liczba godzin planu po usunięciu ośmiu dwugodzinnych tematów sprawdzianowych. */
export const GRADE4_TOTAL_HOURS = 119;

/** Suma godzin przypisanych do pozostałych tematów; źródłowa różnica jednej godziny pozostaje bez zmian. */
export const GRADE4_ALLOCATED_HOURS = grade4PlanSections.reduce(
  (sum, section) => sum + section.topics.reduce((sectionSum, item) => sectionSum + item.hours, 0),
  0,
);

export const GRADE4_TOPIC_COUNT = grade4PlanSections.reduce(
  (sum, section) => sum + section.topics.length,
  0,
);
