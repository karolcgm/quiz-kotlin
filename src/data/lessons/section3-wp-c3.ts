import { buildLessonPackage, type BuildLessonInput, type LessonStageBlueprint } from "@/lib/lessons/buildLessonPackage";
import type { LessonPackage } from "@/types/lessonPackage";

const S3 = "M5-S3";

const practice = (title: string, items: { expression: string; prompt: string }[]): LessonStageBlueprint => ({
  suffix: "s5",
  kind: "practice",
  title: "Ćwicz",
  minutes: 12,
  headline: title,
  print: {
    worksheetTitle: title,
    instructions: "Oblicz / uzasadnij. Pokaż model lub zapis kroków.",
    items: items.map((item, i) => ({ id: `p${i + 1}`, ...item })),
  },
});

const exit = (items: { expression: string; prompt: string }[]): LessonStageBlueprint => ({
  suffix: "s6",
  kind: "exit-ticket",
  title: "Bilet wyjścia",
  minutes: 5,
  headline: "Bilet wyjścia",
  print: {
    worksheetTitle: "Bilet wyjścia",
    instructions: "Oddaj po sprawdzeniu.",
    items: items.map((item, i) => ({ id: `e${i + 1}`, ...item })),
  },
});

const stdStages = (
  explore: string,
  discuss: string,
  example: string,
  practiceTitle: string,
  practiceItems: { expression: string; prompt: string }[],
  exitItems: { expression: string; prompt: string }[],
  warmup = "Co już wiesz o ułamkach?",
): LessonStageBlueprint[] => [
  { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: warmup },
  { suffix: "s2", kind: "explore", title: "Odkryj", minutes: 10, headline: explore },
  { suffix: "s3", kind: "discuss", title: "Nazwij", minutes: 6, headline: discuss },
  { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: example },
  practice(practiceTitle, practiceItems),
  exit(exitItems),
];

type S3Input = Omit<
  BuildLessonInput,
  "sectionId" | "stageBlueprints" | "overview" | "openingScript" | "closingScript" | "commonMisconceptions"
> & {
  stages: LessonStageBlueprint[];
  overview?: string;
  openingScript?: string;
  closingScript?: string;
  commonMisconceptions?: string[];
};

function s3(input: S3Input): LessonPackage {
  const core = input.coreLesson;
  return buildLessonPackage({
    ...input,
    sectionId: S3,
    stageBlueprints: input.stages,
    overview: input.overview ?? `Lekcja ${input.topicId} — ${core}.`,
    openingScript: input.openingScript ?? `„${core} — zaczynamy od modelu.”`,
    closingScript: input.closingScript ?? `„${core} — utrwal zapis w zeszytach.”`,
    commonMisconceptions: input.commonMisconceptions ?? ["Mechaniczne stosowanie reguły bez modelu."],
  });
}

export const m531JednaCaloscV1 = s3({
  id: "m5-3-1-jedna-calosc-v1",
  topicId: "M5-3.1",
  title: "Ułamki i liczby mieszane — Jedna całość, różne podziały",
  coreLesson: "Jedna całość, różne podziały",
  paperEvidence: "Zamiana reprezentacji na modelu i osi",
  studentGoal: "Uczeń zapisuje ułamek właściwy, niewłaściwy i liczbę mieszaną oraz zamienia reprezentacje.",
  successCriteria: ["Rysuje podział całości.", "Zamienia ułamek niewłaściwy na mieszaną."],
  prerequisiteSkillIds: ["M5-2.6-gcd-lcm"],
  skillIds: ["M5-3.1-fraction-representations"],
  overview: "Paski i koła — ta sama całość, różne podziały.",
  openingScript: "„Ta sama pizza — inne kawałki, ten sam ułamek?”",
  closingScript: "„Zamiana: model → zapis → liczba mieszana.”",
  commonMisconceptions: ["Mylenie licznika z mianownikiem.", "Ułamek niewłaściwy traktowany jako błąd zapisu."],
  stages: stdStages(
    "Pasek podzielony na 8 — zaznacz 3/8",
    "Ułamek właściwy vs niewłaściwy — 7/4",
    "7/4 = 1 3/4 na modelu",
    "Reprezentacje",
    [
      { expression: "5/3", prompt: "Zapisz jako liczbę mieszaną + narysuj." },
      { expression: "2 1/5", prompt: "Zapisz jako ułamek niewłaściwy." },
    ],
    [
      { expression: "9/4", prompt: "Liczba mieszana." },
      { expression: "1 2/3", prompt: "Ułamek niewłaściwy." },
    ],
  ),
});

export const m532PodzielSprawiedliwieV1 = s3({
  id: "m5-3-2-podziel-sprawiedliwie-v1",
  topicId: "M5-3.2",
  title: "Ułamek jako iloraz — Podziel sprawiedliwie",
  coreLesson: "Podziel sprawiedliwie",
  paperEvidence: "Zapis a : b = a/b, b ≠ 0",
  studentGoal: "Uczeń interpretuje iloraz jako ułamek w kontekście sprawiedliwego podziału.",
  successCriteria: ["Zapisuje iloraz jako ułamek.", "Wyjaśnia warunek b ≠ 0."],
  prerequisiteSkillIds: ["M5-3.1-fraction-representations"],
  skillIds: ["M5-3.2-fraction-as-quotient"],
  estimatedMinutes: 40,
  overview: "Podział obiektów na równe grupy — zapis ilorazu.",
  openingScript: "„5 : 2 to nie zawsze liczba całkowita — to też ułamek.”",
  closingScript: "„Iloraz to ułamek, gdy dzielimy na równe części.”",
  commonMisconceptions: ["Dzielenie przez zero jako „nic”.", "Zapis 3:4 mylony z ułamkiem bez kontekstu."],
  stages: stdStages(
    "8 cukierków na 3 osoby — ile każda?",
    "5 : 2 = 5/2 — co oznacza?",
    "7 : 4 — zapis i interpretacja",
    "Iloraz i ułamek",
    [
      { expression: "9 : 5", prompt: "Zapis ułamkowy + kontekst." },
      { expression: "11 : 4", prompt: "Liczba mieszana." },
    ],
    [{ expression: "13 : 6", prompt: "Ułamek i mieszana." }],
  ),
});

export const m533TaSamaCzescV1 = s3({
  id: "m5-3-3-ta-sama-czesc-v1",
  topicId: "M5-3.3",
  title: "Skracanie i rozszerzanie — Ta sama część",
  coreLesson: "Ta sama część",
  paperEvidence: "Postać nieskracalna",
  studentGoal: "Uczeń rozszerza i skraca ułamki, rozpoznając równoważne reprezentacje tej samej części.",
  successCriteria: ["Skraca do postaci nieskracalnej.", "Uzasadnia rozszerzenie na modelu."],
  prerequisiteSkillIds: ["M5-3.2-fraction-as-quotient"],
  skillIds: ["M5-3.3-simplify-expand"],
  stages: stdStages(
    "2/3 i 4/6 — ten sam pasek?",
    "Mnożenie licznika i mianownika przez tę samą liczbę",
    "Skróć 24/36",
    "Nieskracalny",
    [
      { expression: "18/24", prompt: "Skróć." },
      { expression: "3/5 = ?/20", prompt: "Brakujący licznik." },
    ],
    [
      { expression: "45/60", prompt: "Postać nieskracalna." },
      { expression: "7/12 = ?/48", prompt: "Rozszerz." },
    ],
  ),
});

export const m534NalozPaskiV1 = s3({
  id: "m5-3-4-naloz-paski-v1",
  topicId: "M5-3.4",
  title: "Porównywanie ułamków — Nałóż paski / wspólna oś",
  coreLesson: "Nałóż paski / wspólna oś",
  paperEvidence: "Porządkowanie ze strategią",
  studentGoal: "Uczeń porównuje ułamki strategią wspólnego mianownika, licznika lub odniesienia do 1/2.",
  successCriteria: ["Wybiera strategię i uzasadnia.", "Ustawia ułamki w porządku rosnącym."],
  prerequisiteSkillIds: ["M5-3.3-simplify-expand"],
  skillIds: ["M5-3.4-compare-fractions"],
  stages: stdStages(
    "3/4 vs 5/8 — nałóż paski",
    "Strategia: wspólny mianownik vs odniesienie do 1/2",
    "Porównaj 5/6 i 7/9",
    "Porównywanie",
    [
      { expression: "2/3 ○ 3/5", prompt: "Znak + strategia." },
      { expression: "4/7, 5/8, 1/2", prompt: "Porządek rosnący." },
    ],
    [{ expression: "7/10 ○ 3/4", prompt: "Porównaj i uzasadnij." }],
  ),
});

export const m535LaczCzesciV1 = s3({
  id: "m5-3-5-lacz-czesci-v1",
  topicId: "M5-3.5",
  title: "Dodawanie/odejmowanie — jednakowy mianownik",
  coreLesson: "Łącz części tej samej wielkości",
  paperEvidence: "Model + zapis, liczby mieszane",
  studentGoal: "Uczeń dodaje i odejmuje ułamki o jednakowym mianowniku z modelem i zapisem.",
  successCriteria: ["Operuje na licznikach przy tym samym mianowniku.", "Pracuje z liczbami mieszanymi."],
  prerequisiteSkillIds: ["M5-3.4-compare-fractions"],
  skillIds: ["M5-3.5-add-sub-same-denom"],
  stages: stdStages(
    "2/7 + 3/7 na pasku",
    "Dlaczego mianownik się nie zmienia?",
    "2 1/5 + 1 2/5",
    "Ten sam mianownik",
    [
      { expression: "5/9 + 2/9", prompt: "Wynik + skróć jeśli trzeba." },
      { expression: "4 3/8 − 1 5/8", prompt: "Odejmowanie." },
    ],
    [{ expression: "3 1/6 + 2 5/6", prompt: "Wynik jako mieszana." }],
  ),
});

export const m536WspolnaMiaraV1 = s3({
  id: "m5-3-6-wspolna-miara-v1",
  topicId: "M5-3.6",
  title: "Dodawanie/odejmowanie — różne mianowniki",
  coreLesson: "Zbuduj wspólną miarę",
  paperEvidence: "Wspólny mianownik, zapis etapów",
  studentGoal: "Uczeń znajduje wspólny mianownik i wykonuje dodawanie/odejmowanie ułamków.",
  successCriteria: ["Buduje wspólny mianownik.", "Skraca wynik."],
  prerequisiteSkillIds: ["M5-3.5-add-sub-same-denom"],
  skillIds: ["M5-3.6-add-sub-diff-denom"],
  estimatedMinutes: 50,
  overview: "Nakładanie pasków — wspólna miara przed działaniem.",
  openingScript: "„Najpierw ta sama wielkość kawałka — potem dodajemy.”",
  closingScript: "„Czy wynik jest nieskracalny?”",
  commonMisconceptions: ["Dodawanie mianowników.", "Wspólny mianownik = iloczyn bez uzasadnienia."],
  stages: stdStages(
    "1/3 + 1/4 — wspólny pasek",
    "NWW jako wspólny mianownik",
    "2/3 + 1/5 krok po kroku",
    "Różne mianowniki",
    [
      { expression: "3/4 + 2/5", prompt: "Pełny zapis." },
      { expression: "2 1/3 − 1 1/4", prompt: "Liczby mieszane." },
    ],
    [{ expression: "5/6 − 1/4", prompt: "Wynik nieskracalny." }],
  ),
});

export const m537PowtorzPorcjeV1 = s3({
  id: "m5-3-7-powtorz-porcje-v1",
  topicId: "M5-3.7",
  title: "Mnożenie ułamka przez liczbę naturalną",
  coreLesson: "Powtórz porcję",
  paperEvidence: "Konteksty porcji, oś",
  studentGoal: "Uczeń mnoży ułamek przez liczbę naturalną z modelem powtórzonej porcji.",
  successCriteria: ["Interpretuje jako wielokrotność części.", "Skraca przed lub po mnożeniu."],
  prerequisiteSkillIds: ["M5-3.6-add-sub-diff-denom"],
  skillIds: ["M5-3.7-frac-times-natural"],
  stages: stdStages(
    "3 × 2/5 — trzy porcje po 2/5",
    "Mnożenie licznika, mianownik bez zmian",
    "4 × 3/8 i skrócenie",
    "Porcje",
    [
      { expression: "5 × 3/4", prompt: "Wynik." },
      { expression: "2 × 5/6", prompt: "Wynik nieskracalny." },
    ],
    [{ expression: "3 × 4/9", prompt: "Wynik + model słowny." }],
  ),
});

export const m538PodzielPotemWybierzV1 = s3({
  id: "m5-3-8-podziel-potrze-wybierz-v1",
  topicId: "M5-3.8",
  title: "Ułamek liczby naturalnej — Podziel, potem wybierz",
  coreLesson: "Podziel, potem wybierz",
  paperEvidence: "Dwa sposoby rozwiązania",
  studentGoal: "Uczeń oblicza ułamek liczby naturalnej dwoma sposobami (najpierw dzielenie lub najpierw ułamek).",
  successCriteria: ["Stosuje 1/2 z n lub n × 1/2.", "Rozwiązuje dwoma kolejnościami działań."],
  prerequisiteSkillIds: ["M5-3.7-frac-times-natural"],
  skillIds: ["M5-3.8-fraction-of-number"],
  stages: stdStages(
    "1/3 z 24 — dwa sposoby",
    "Która kolejność wygodniejsza?",
    "3/5 z 40",
    "Ułamek liczby",
    [
      { expression: "2/3 z 45", prompt: "Dwa sposoby." },
      { expression: "1/4 z 96 zł", prompt: "Kontekst pieniędzy." },
    ],
    [{ expression: "3/8 z 64", prompt: "Wynik." }],
  ),
});

export const m539CzescCzesciV1 = s3({
  id: "m5-3-9-czesc-czesci-v1",
  topicId: "M5-3.9",
  title: "Mnożenie ułamków — Część części",
  coreLesson: "Część części",
  paperEvidence: "Model pola, zadania praktyczne",
  studentGoal: "Uczeń mnoży ułamki przez model nakładających się prostokątów.",
  successCriteria: ["Interpretuje jako część części.", "Skraca wynik."],
  prerequisiteSkillIds: ["M5-3.8-fraction-of-number"],
  skillIds: ["M5-3.9-multiply-fractions"],
  stages: stdStages(
    "1/2 × 1/3 — prostokąt podzielony",
    "Liczniki × liczniki, mianowniki × mianowniki",
    "2/3 × 3/5",
    "Mnożenie ułamków",
    [
      { expression: "3/4 × 2/7", prompt: "Model + wynik." },
      { expression: "5/6 × 3/10", prompt: "Skróć przed lub po." },
    ],
    [{ expression: "4/9 × 3/8", prompt: "Wynik nieskracalny." }],
  ),
});

export const m5310PodzielPasekV1 = s3({
  id: "m5-3-10-podziel-pasek-v1",
  topicId: "M5-3.10",
  title: "Dzielenie ułamków przez naturalne — Podziel pasek",
  coreLesson: "Podziel pasek na grupy",
  paperEvidence: "Kontrola mnożeniem",
  studentGoal: "Uczeń dzieli ułamek przez liczbę naturalną jako podział paska na równe grupy.",
  successCriteria: ["Interpretuje wynik jako mniejsze części.", "Sprawdza mnożeniem wstecz."],
  prerequisiteSkillIds: ["M5-3.9-multiply-fractions"],
  skillIds: ["M5-3.10-divide-by-natural"],
  stages: stdStages(
    "3/4 : 3 — trzy równe grupy na pasku",
    "Dzielenie licznika, mianownik bez zmian",
    "5/6 : 2",
    "Dzielenie przez naturalną",
    [
      { expression: "4/5 : 4", prompt: "Wynik." },
      { expression: "7/8 : 3", prompt: "Wynik + kontrola." },
    ],
    [{ expression: "5/9 : 5", prompt: "Wynik." }],
  ),
});

export const m5311IleRazyMiaraV1 = s3({
  id: "m5-3-11-ile-razy-miara-v1",
  topicId: "M5-3.11",
  title: "Dzielenie ułamków — Ile razy mieści się miara?",
  coreLesson: "Ile razy mieści się miara?",
  paperEvidence: "Model pomiarowy, liczby mieszane",
  studentGoal: "Uczeń dzieli ułamki modelem pomiarowym i regułą odwrotności po zrozumieniu.",
  successCriteria: ["Używa modelu pomiarowego.", "Stosuje mnożenie przez odwrotność."],
  prerequisiteSkillIds: ["M5-3.10-divide-by-natural"],
  skillIds: ["M5-3.11-divide-fractions"],
  estimatedMinutes: 50,
  overview: "Ile razy 1/4 mieści się w 3/4 — zanim wprowadzimy regułę.",
  openingScript: "„Dzielenie to pytanie: ile razy miara mieści się w całości?”",
  closingScript: "„Sprawdź mnożeniem — czy wracasz do dzielnej?”",
  commonMisconceptions: ["Odwracanie niewłaściwego ułamka.", "Mylenie dzielenia z odejmowaniem."],
  stages: stdStages(
    "3/4 : 1/4 — ile miar?",
    "Reguła: mnoż przez odwrotność",
    "2/3 : 1/6",
    "Dzielenie ułamków",
    [
      { expression: "5/6 : 2/3", prompt: "Model + zapis." },
      { expression: "1 1/2 : 3/4", prompt: "Liczba mieszana." },
    ],
    [{ expression: "4/5 : 2/5", prompt: "Wynik." }],
  ),
});

export const m53rKuchniaProporcjiV1 = s3({
  id: "m5-3-r-kuchnia-proporcji-v1",
  topicId: "M5-3.R",
  title: "Powtórzenie — Kuchnia proporcji",
  coreLesson: "Kuchnia proporcji",
  paperEvidence: "Karta wieloetapowa",
  studentGoal: "Uczeń utrwala reprezentacje i działania na ułamkach w zadaniach praktycznych.",
  successCriteria: ["Wybiera reprezentację.", "Diagnozuje typ błędu."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-3.R-review"],
  estimatedMinutes: 40,
  overview: "Stacje: porcje, receptury, porównywanie, działania.",
  openingScript: "„Kuchnia proporcji — ułamki w praktyce.”",
  closingScript: "„Mapa błędów — który typ wróci do domu?”",
  commonMisconceptions: ["Mechaniczne reguły bez modelu."],
  stages: [
    { suffix: "s1", kind: "warmup", title: "Mapa", minutes: 5, headline: "Umiem / wrócę do — dział 3" },
    { suffix: "s2", kind: "practice", title: "Receptura", minutes: 8, headline: "Składniki na 2/3 porcji" },
    { suffix: "s3", kind: "practice", title: "Porównanie", minutes: 8, headline: "Która porcja większa?" },
    { suffix: "s4", kind: "practice", title: "Działania", minutes: 10, headline: "Mini-zadania łączone" },
    { suffix: "s5", kind: "practice", title: "Strategie", minutes: 8, headline: "Dwa sposoby na ułamek liczby" },
    { suffix: "s6", kind: "exit-ticket", title: "Plan domowy", minutes: 5, headline: "Jedno zadanie wieloetapowe" },
  ],
});

export const m53sStrategiePaskachV1 = s3({
  id: "m5-3-s-strategie-paskach-v1",
  topicId: "M5-3.S",
  title: "Sprawdzian i omówienie — Strategie na paskach",
  coreLesson: "Strategie na paskach",
  paperEvidence: "A/B, rubryka kroków",
  studentGoal: "Uczeń rozwiązuje sprawdzian działu 3 i omawia równoważne strategie.",
  successCriteria: ["Pokazuje kroki na modelu.", "Akceptuje równoważne odpowiedzi."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-3.S-exam"],
  estimatedMinutes: 50,
  overview: "Sprawdzian ułamków + omówienie na paskach.",
  openingScript: "„Sprawdzian działu 3 — strategia ważniejsza niż skrót.”",
  closingScript: "„Omówienie: dwie równoważne drogi do tego samego wyniku.”",
  commonMisconceptions: ["Jedna „właściwa” metoda bez uzasadnienia."],
  stages: [
    { suffix: "s1", kind: "warmup", title: "Reguły", minutes: 5, headline: "Czas, kalkulator, oddanie" },
    {
      suffix: "s2",
      kind: "exit-ticket",
      title: "Arkusz A",
      minutes: 25,
      headline: "Sprawdzian — część 1",
      print: {
        worksheetTitle: "Sprawdzian dział 3 — część A",
        instructions: "Czas: 25 min. Pokaż model lub kroki.",
        items: [
          { id: "a1", expression: "7/4", prompt: "Liczba mieszana." },
          { id: "a2", expression: "3/5 ○ 5/8", prompt: "Porównaj." },
          { id: "a3", expression: "2/3 + 1/4", prompt: "Wynik nieskracalny." },
          { id: "a4", expression: "3/4 × 2/5", prompt: "Wynik." },
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
        worksheetTitle: "Sprawdzian dział 3 — część B",
        instructions: "Zadania otwarte.",
        items: [
          { id: "b1", expression: "2/3 z 36", prompt: "Dwa sposoby." },
          { id: "b2", expression: "5/6 : 1/3", prompt: "Model pomiarowy + wynik." },
          { id: "b3", expression: "Receptura: 3/4 szklanki mąki", prompt: "Ile na 1/2 porcji?" },
        ],
      },
    },
    {
      suffix: "s4",
      kind: "discuss",
      title: "Omówienie",
      minutes: 15,
      headline: "Strategie na paskach",
      discussionPrompts: ["Czy inna droga też działa?", "Gdzie model uratował zadanie?"],
    },
    { suffix: "s5", kind: "warmup", title: "Rubryka", minutes: 5, headline: "Ocena kroków" },
  ],
});

export const section3LessonsWpC3: LessonPackage[] = [
  m531JednaCaloscV1,
  m532PodzielSprawiedliwieV1,
  m533TaSamaCzescV1,
  m534NalozPaskiV1,
  m535LaczCzesciV1,
  m536WspolnaMiaraV1,
  m537PowtorzPorcjeV1,
  m538PodzielPotemWybierzV1,
  m539CzescCzesciV1,
  m5310PodzielPasekV1,
  m5311IleRazyMiaraV1,
  m53rKuchniaProporcjiV1,
  m53sStrategiePaskachV1,
];
