import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { LessonPackage } from "@/types/lessonPackage";

const S2 = "M5-S2";

const standardPractice = (title: string, items: { expression: string; prompt: string }[]) => ({
  suffix: "s5",
  kind: "practice" as const,
  title: "Ćwicz",
  minutes: 12,
  headline: title,
  print: {
    worksheetTitle: title,
    instructions: "Oblicz / uzasadnij. Bez kalkulatora, chyba że nauczyciel pozwoli.",
    items: items.map((item, index) => ({ id: `p${index + 1}`, ...item })),
  },
});

const standardExit = (items: { expression: string; prompt: string }[]) => ({
  suffix: "s6",
  kind: "exit-ticket" as const,
  title: "Bilet wyjścia",
  minutes: 5,
  headline: "Bilet wyjścia",
  print: {
    worksheetTitle: "Bilet wyjścia",
    instructions: "Oddaj po sprawdzeniu.",
    items: items.map((item, index) => ({ id: `e${index + 1}`, ...item })),
  },
});

export const m521RytmyNaOsiV1: LessonPackage = buildLessonPackage({
  id: "m5-2-1-rytmy-na-osi-v1",
  topicId: "M5-2.1",
  sectionId: S2,
  title: "Wielokrotności — Rytmy na osi",
  coreLesson: "Rytmy na osi",
  paperEvidence: "Rozkład jazdy — wypisywanie wielokrotności",
  studentGoal: "Uczeń wypisuje wielokrotności liczby w zadanym zakresie i znajduje wspólne punkty dwóch rytmów na osi.",
  successCriteria: ["Wypisuje kolejne wielokrotności.", "Wskazuje wspólne wielokrotności dwóch liczb."],
  prerequisiteSkillIds: ["M5-1.3-mental-mul-div"],
  skillIds: ["M5-2.1-multiples"],
  estimatedMinutes: 40,
  overview: "Oś liczbowa jako harmonogram — skoki co 3, co 4 i wspólne przystanki.",
  openingScript: "„Wielokrotność to kolejny skok tej samej wielkości na osi.”",
  closingScript: "„Gdzie spotykają się dwa rytmy? To nasze wspólne wielokrotności.”",
  commonMisconceptions: ["Pomijanie liczby 0 jako wielokrotności.", "Mylenie wielokrotności z dzielnikami."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "Skoki co 5 — które liczby trafiamy?" },
    {
      suffix: "s2",
      kind: "explore",
      title: "Dwa rytmy",
      minutes: 10,
      headline: "Autobus co 3 min i co 4 min — wspólne odjazdy",
      modelId: "number-line-jumps",
      modelSeed: 3,
    },
    {
      suffix: "s3",
      kind: "discuss",
      title: "Zakres",
      minutes: 6,
      headline: "Wielokrotności 7 do 70",
      discussionPrompts: ["Skąd wiesz, że 49 jest wielokrotnością 7?", "Czy każda liczba jest wielokrotną siebie?"],
    },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: "Rozkład jazdy: linie A (co 6) i B (co 8)" },
    standardPractice("Rytmy na osi", [
      { expression: "Wielokrotności 9 do 100", prompt: "Wypisz co najmniej pięć." },
      { expression: "Wspólne wielokrotności 4 i 6 do 48", prompt: "Wypisz wszystkie." },
    ]),
    standardExit([
      { expression: "Czy 54 jest wielokrotnością 9?", prompt: "Uzasadnij." },
      { expression: "Najmniejsza wspólna wielokrotność 5 i 10", prompt: "Bez obliczania NWW — logicznie." },
    ]),
  ],
});

export const m522BudujProstokatyV1: LessonPackage = buildLessonPackage({
  id: "m5-2-2-buduj-prostokat-v1",
  topicId: "M5-2.2",
  sectionId: S2,
  title: "Dzielniki — Buduj prostokąty",
  coreLesson: "Buduj prostokąty",
  paperEvidence: "Pary dzielników — kompletność listy",
  studentGoal: "Uczeń znajduje wszystkie pary dzielników liczby przez model prostokąta z kafelków.",
  successCriteria: ["Podaje pary ilość × ilość.", "Sprawdza kompletność — brak pominiętych par."],
  prerequisiteSkillIds: ["M5-2.1-multiples"],
  skillIds: ["M5-2.2-divisors"],
  overview: "Prostokąt z kafelków — ile układów wierszy × kolumn?",
  openingScript: "„Dzielnik to bok prostokąta, który da się zbudować bez reszty.”",
  closingScript: "„Sprawdź symetrię par — 3×8 i 8×3 to ta sama para.”",
  commonMisconceptions: ["Traktowanie 1 i samej liczby jako wyjątków bez uzasadnienia.", "Pomijanie pary 1 × n."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "12 kafelków — jakie prostokąty?" },
    {
      suffix: "s2",
      kind: "explore",
      title: "Siatka",
      minutes: 10,
      headline: "18 kafelków — wszystkie prostokąty",
      modelId: "multiplication-grid",
      modelSeed: 18,
    },
    { suffix: "s3", kind: "discuss", title: "Kompletność", minutes: 6, headline: "Skąd wiemy, że mamy wszystkie pary?" },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: "Dzielniki 36 — lista i sprawdzenie" },
    standardPractice("Pary dzielników", [
      { expression: "28", prompt: "Wszystkie pary dzielników." },
      { expression: "45", prompt: "Wszystkie pary dzielników." },
    ]),
    standardExit([
      { expression: "30", prompt: "Ile ma dzielników? Wypisz pary." },
      { expression: "Czy 17 ma tylko 1×17?", prompt: "Uzasadnij." },
    ]),
  ],
});

export const m523SkanerPodzielnosciV1: LessonPackage = buildLessonPackage({
  id: "m5-2-3-skaner-podzielnosci-v1",
  topicId: "M5-2.3",
  sectionId: S2,
  title: "Cechy podzielności — Skaner podzielności",
  coreLesson: "Skaner podzielności",
  paperEvidence: "Bramki 2/3/4/5/9/10/100",
  studentGoal: "Uczeń stosuje cechy podzielności i przewiduje podzielność przed pełnym dzieleniem.",
  successCriteria: ["Stosuje reguły dla 2, 3, 5, 9, 10.", "Konstruuje liczbę z brakującą cyfrą."],
  prerequisiteSkillIds: ["M5-2.2-divisors"],
  skillIds: ["M5-2.3-divisibility"],
  estimatedMinutes: 50,
  overview: "Reguły jako skaner — ostatnia cyfra, suma cyfr, przewidywanie.",
  openingScript: "„Najpierw reguła — potem przewidywanie — na końcu sprawdzenie.”",
  closingScript: "„Która bramka zadziałała najszybciej?”",
  commonMisconceptions: ["Reguła dla 4 stosowana tylko do ostatniej cyfry.", "Suma cyfr dla 9 mylona z regułą dla 3 bez rozróżnienia."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "Bramka 2 i 5 — ostatnia cyfra" },
    { suffix: "s2", kind: "explore", title: "Suma cyfr", minutes: 10, headline: "Bramka 3 i 9 — 738 podzielne przez 9?" },
    { suffix: "s3", kind: "discuss", title: "Bramka 4", minutes: 8, headline: "1248 — dwie ostatnie cyfry" },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: "Brakująca cyfra: 5_4 podzielne przez 6" },
    standardPractice("Skaner", [
      { expression: "2 376", prompt: "Przez które z: 2, 3, 4, 5, 9, 10?" },
      { expression: "3 _ 5 2", prompt: "Jaka cyfra na _ aby podzielne przez 3?" },
      { expression: "7 2 _ 0", prompt: "Podzielność przez 4 i 5." },
    ]),
    standardExit([
      { expression: "1 008", prompt: "Przez 9? Uzasadnij sumą cyfr." },
      { expression: "45 600", prompt: "Przez 100?" },
    ]),
  ],
});

export const m524SitoLiczbV1: LessonPackage = buildLessonPackage({
  id: "m5-2-4-sito-liczb-v1",
  topicId: "M5-2.4",
  sectionId: S2,
  title: "Liczby pierwsze i złożone — Sito liczb",
  coreLesson: "Sito liczb",
  paperEvidence: "Klasyfikacja z uzasadnieniem",
  studentGoal: "Uczeń rozróżnia liczby pierwsze i złożone, stosuje sito Eratostenesa do 100.",
  successCriteria: ["Uzasadnia pierwszość przez dzielniki.", "Wyjaśnia przypadek liczby 1."],
  prerequisiteSkillIds: ["M5-2.3-divisibility"],
  skillIds: ["M5-2.4-primes"],
  estimatedMinutes: 40,
  overview: "Sito — wykreślanie wielokrotności, klasyfikacja z argumentem.",
  openingScript: "„Pierwsza to liczba z dokładnie dwoma dzielnikami naturalnymi.”",
  closingScript: "„Dlaczego 1 nie jest pierwsza ani złożona?”",
  commonMisconceptions: ["Uznanie 1 za pierwszą.", "Sprawdzanie tylko jednego dzielnika."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "Czy 13 jest pierwsza?" },
    { suffix: "s2", kind: "explore", title: "Sito", minutes: 12, headline: "Sito do 50 — wykreśl wielokrotności 2, 3, 5, 7" },
    { suffix: "s3", kind: "discuss", title: "Liczba 1", minutes: 6, headline: "Ile ma dzielników?" },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: "Klasyfikacja: 29, 39, 51" },
    standardPractice("Pierwsze czy złożone?", [
      { expression: "47", prompt: "Klasyfikacja + uzasadnienie." },
      { expression: "91", prompt: "Klasyfikacja + uzasadnienie." },
    ]),
    standardExit([
      { expression: "61", prompt: "Pierwsza czy złożona?" },
      { expression: "Wypisz pierwsze do 20", prompt: "Bez pominięć." },
    ]),
  ],
});

export const m525DrzewoCzynnikowV1: LessonPackage = buildLessonPackage({
  id: "m5-2-5-drzewo-czynnikow-v1",
  topicId: "M5-2.5",
  sectionId: S2,
  title: "Rozkład na czynniki pierwsze — Drzewo czynników",
  coreLesson: "Drzewo czynników",
  paperEvidence: "Uzupełnij drzewo / odbuduj liczbę",
  studentGoal: "Uczeń rozkłada liczbę na czynniki pierwsze i odbudowuje liczbę z drzewa.",
  successCriteria: ["Kończy na czynnikach pierwszych.", "Różne drzewa dają ten sam iloczyn."],
  prerequisiteSkillIds: ["M5-2.4-primes"],
  skillIds: ["M5-2.5-factorization"],
  overview: "Drzewo rozkładu — gałęzie, czynniki pierwsze, ten sam wynik.",
  openingScript: "„Rozkładamy aż zostaną tylko pierwsze — jak liście drzewa.”",
  closingScript: "„Sprawdź iloczyn czynników — czy wracasz do liczby początkowej?”",
  commonMisconceptions: ["Zatrzymanie na czynniku złożonym.", "Mylenie kolejności czynników z różnym wynikiem."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "60 = 6 × 10 — czy to rozkład pierwszy?" },
    { suffix: "s2", kind: "explore", title: "Drzewo", minutes: 12, headline: "Rozłóż 72 na czynniki pierwsze" },
    { suffix: "s3", kind: "discuss", title: "Różne drogi", minutes: 6, headline: "72 = 8×9 vs 24×3 — ten sam wynik?" },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: "Odbuduj liczbę z 2² × 3 × 5" },
    standardPractice("Drzewo czynników", [
      { expression: "84", prompt: "Rozkład pierwszy." },
      { expression: "150", prompt: "Rozkład pierwszy." },
    ]),
    standardExit([
      { expression: "2³ × 7", prompt: "Jaka liczba?" },
      { expression: "126", prompt: "Rozkład pierwszy." },
    ]),
  ],
});

export const m526NwdNwwV1: LessonPackage = buildLessonPackage({
  id: "m5-2-6-nwd-nww-v1",
  topicId: "M5-2.6",
  sectionId: S2,
  title: "NWD i NWW — Dwa sposoby",
  coreLesson: "Dwa sposoby",
  paperEvidence: "Paczki bez reszty / cykle zdarzeń",
  studentGoal: "Uczeń oblicza NWD i NWW listą lub z rozkładu na czynniki i wybiera właściwą wielkość w zadaniu.",
  successCriteria: ["Oblicza NWD i NWW dwoma sposobami.", "Uzasadnia wybór NWD lub NWW w kontekście."],
  prerequisiteSkillIds: ["M5-2.5-factorization"],
  skillIds: ["M5-2.6-gcd-lcm"],
  estimatedMinutes: 50,
  overview: "Lista wspólnych wielokrotności/dzielników vs czynniki pierwsze — zastosowania.",
  openingScript: "„NWD — największy wspólny dzielnik. NWW — najmniejsza wspólna wielokrotność.”",
  closingScript: "„Paczki bez reszty → NWD. Synchronizacja cykli → NWW.”",
  commonMisconceptions: ["Mylenie NWD z NWW w zadaniu tekstowym.", "Mnożenie liczb zamiast NWW z rozkładu."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "Wspólne dzielniki 12 i 18" },
    { suffix: "s2", kind: "explore", title: "Lista", minutes: 10, headline: "NWD(24, 36) i NWW(24, 36) — wypisywanie" },
    { suffix: "s3", kind: "discuss", title: "Czynniki", minutes: 8, headline: "Ten sam wynik z rozkładu pierwszego" },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 10, headline: "Paczki po 12 i 18 jabłek — największa paczka bez reszty" },
    standardPractice("NWD i NWW", [
      { expression: "NWD(30, 45)", prompt: "Dwoma sposobami." },
      { expression: "NWW(8, 12)", prompt: "Dwoma sposobami." },
      { expression: "Autobus co 15 min i 20 min", prompt: "Kiedy znów razem?" },
    ]),
    standardExit([
      { expression: "NWD(42, 56)", prompt: "Wynik." },
      { expression: "NWW(9, 12)", prompt: "Wynik + zastosowanie." },
    ]),
  ],
});

export const m52rCentrumLogistyczneV1: LessonPackage = buildLessonPackage({
  id: "m5-2-r-centrum-logistyczne-v1",
  topicId: "M5-2.R",
  sectionId: S2,
  title: "Powtórzenie — Centrum logistyczne",
  coreLesson: "Centrum logistyczne",
  paperEvidence: "Karta problemowa",
  studentGoal: "Uczeń utrwala podzielność, NWD i NWW w zadaniach łączonych bez rankingu.",
  successCriteria: ["Wybiera właściwą metodę.", "Uzasadnia odpowiedź w zadaniu otwartym."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-2.R-review"],
  estimatedMinutes: 40,
  overview: "Stacje: wielokrotności, dzielniki, cechy, NWD/NWW.",
  openingScript: "„Centrum logistyczne — paczki, harmonogramy, kody.”",
  closingScript: "„Zabierzcie kartę problemową — jedno zadanie do domu.”",
  commonMisconceptions: ["Mechaniczne stosowanie reguły bez kontekstu zadania."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Mapa", minutes: 5, headline: "Umiem / wrócę do — dział 2" },
    { suffix: "s2", kind: "practice", title: "Stacja: podzielność", minutes: 8, headline: "Skaner — szybka stacja" },
    { suffix: "s3", kind: "practice", title: "Stacja: pierwsze", minutes: 8, headline: "Sito — mini" },
    { suffix: "s4", kind: "practice", title: "Stacja: rozkład", minutes: 10, headline: "Drzewo czynników" },
    { suffix: "s5", kind: "practice", title: "Stacja: NWD/NWW", minutes: 8, headline: "Paczki i cykle" },
    { suffix: "s6", kind: "exit-ticket", title: "Plan domowy", minutes: 5, headline: "Jedno zadanie łączone" },
  ],
});

export const m52sSprawdzianV1: LessonPackage = buildLessonPackage({
  id: "m5-2-s-sprawdzian-v1",
  topicId: "M5-2.S",
  sectionId: S2,
  title: "Sprawdzian i omówienie — Modele prostokątów i osi",
  coreLesson: "Modele prostokątów i osi",
  paperEvidence: "A/B, klucz, rubryka argumentacji",
  studentGoal: "Uczeń rozwiązuje sprawdzian działu 2 i uczestniczy w omówieniu z modelami.",
  successCriteria: ["Stosuje modele w zadaniach otwartych.", "W omówieniu wskazuje błąd w rozumowaniu."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-2.S-exam"],
  estimatedMinutes: 50,
  overview: "Sprawdzian + omówienie przez prostokąty, sito i oś.",
  openingScript: "„Sprawdzamy umiejętności działu 2 — modele pomagają w omówieniu.”",
  closingScript: "„Omówienie: gdzie model prostokąta lub osi uratował rozwiązanie.”",
  commonMisconceptions: ["Obliczenie bez uzasadnienia w zadaniu otwartym."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Reguły", minutes: 5, headline: "Czas, kalkulator, oddanie" },
    {
      suffix: "s2",
      kind: "exit-ticket",
      title: "Arkusz A",
      minutes: 25,
      headline: "Sprawdzian — część 1",
      print: {
        worksheetTitle: "Sprawdzian dział 2 — część A",
        instructions: "Rozwiąż w zeszytach. Czas: 25 min.",
        items: [
          { id: "a1", expression: "Wielokrotności 6 do 60", prompt: "Wypisz co najmniej pięć." },
          { id: "a2", expression: "Dzielniki 48", prompt: "Wypisz wszystkie pary." },
          { id: "a3", expression: "756", prompt: "Podzielność przez 2, 3, 9 — uzasadnij." },
          { id: "a4", expression: "91", prompt: "Pierwsza czy złożona?" },
        ],
      },
    },
    {
      suffix: "s3",
      kind: "exit-ticket",
      title: "Arkusz B",
      minutes: 15,
      headline: "Sprawdzian — część 2",
      print: {
        worksheetTitle: "Sprawdzian dział 2 — część B",
        instructions: "Zadania otwarte.",
        items: [
          { id: "b1", expression: "180", prompt: "Rozkład na czynniki pierwsze." },
          { id: "b2", expression: "NWD(36, 48)", prompt: "Oblicz i uzasadnij zastosowanie." },
          { id: "b3", expression: "NWW(6, 8)", prompt: "Zadanie: dwie maszyny co 6 i 8 s — synchronizacja." },
        ],
      },
    },
    {
      suffix: "s4",
      kind: "discuss",
      title: "Omówienie",
      minutes: 15,
      headline: "Prostokąt, sito, oś — pokaż na tablicy",
      discussionPrompts: ["Który model pomógł?", "Gdzie powstał błąd?"],
    },
    { suffix: "s5", kind: "warmup", title: "Rubryka", minutes: 5, headline: "Ocena argumentacji" },
  ],
});

export const section2LessonsWpC2: LessonPackage[] = [
  m521RytmyNaOsiV1,
  m522BudujProstokatyV1,
  m523SkanerPodzielnosciV1,
  m524SitoLiczbV1,
  m525DrzewoCzynnikowV1,
  m526NwdNwwV1,
  m52rCentrumLogistyczneV1,
  m52sSprawdzianV1,
];
