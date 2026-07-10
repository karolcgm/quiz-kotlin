import { buildLessonPackage, type BuildLessonInput, type LessonStageBlueprint } from "@/lib/lessons/buildLessonPackage";
import type { LessonPackage } from "@/types/lessonPackage";

const S4 = "M5-S4";

const practice = (title: string, items: { expression: string; prompt: string }[]): LessonStageBlueprint => ({
  suffix: "s5",
  kind: "practice",
  title: "Ćwicz",
  minutes: 12,
  headline: title,
  print: {
    worksheetTitle: title,
    instructions: "Rysuj / uzasadnij. Używaj symboli, nie samego koloru.",
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
  warmup = "Co już wiesz o figurach na płaszczyźnie?",
): LessonStageBlueprint[] => [
  { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: warmup },
  { suffix: "s2", kind: "explore", title: "Odkryj", minutes: 10, headline: explore },
  { suffix: "s3", kind: "discuss", title: "Nazwij", minutes: 6, headline: discuss },
  { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: example },
  practice(practiceTitle, practiceItems),
  exit(exitItems),
];

type S4Input = Omit<
  BuildLessonInput,
  "sectionId" | "stageBlueprints" | "overview" | "openingScript" | "closingScript" | "commonMisconceptions"
> & {
  stages: LessonStageBlueprint[];
  overview?: string;
  openingScript?: string;
  closingScript?: string;
  commonMisconceptions?: string[];
};

function s4(input: S4Input): LessonPackage {
  const core = input.coreLesson;
  return buildLessonPackage({
    ...input,
    sectionId: S4,
    stageBlueprints: input.stages,
    overview: input.overview ?? `Lekcja ${input.topicId} — ${core}.`,
    openingScript: input.openingScript ?? `„${core} — zaczynamy od obserwacji.”`,
    closingScript: input.closingScript ?? `„${core} — utrwal rysunek i uzasadnienie.”`,
    commonMisconceptions: input.commonMisconceptions ?? ["Opieranie się tylko na wyglądzie prototypu figury."],
  });
}

export const m541LinijkaIEkierkaV1 = s4({
  id: "m5-4-1-linijka-ekierka-v1",
  topicId: "M5-4.1",
  title: "Proste prostopadłe i równoległe — Linijka i ekierka",
  coreLesson: "Linijka i ekierka",
  paperEvidence: "Konstrukcje papierowe",
  studentGoal: "Uczeń rozpoznaje i konstruuje proste prostopadłe i równoległe w różnych orientacjach.",
  successCriteria: ["Używa ekierki do prostopadłości.", "Rozpoznaje równoległość po przesunięciu."],
  prerequisiteSkillIds: ["M5-3.S-exam"],
  skillIds: ["M5-4.1-parallel-perpendicular"],
  stages: stdStages(
    "Dwie proste — czy się przecinają pod 90°?",
    "Symbol prostopadłości i równoległości",
    "Narysuj prostą równoległą przez punkt",
    "Konstrukcje",
    [
      { expression: "a ∥ b, b ⊥ c", prompt: "Narysuj schemat + opisz relacje." },
      { expression: "Prosta przez P ∥ do danej", prompt: "Konstrukcja linijką." },
    ],
    [{ expression: "Czy proste są ∥?", prompt: "Uzasadnij na rysunku nietypowym." }],
    "Gdzie widzisz proste równoległe w sali?",
  ),
});

export const m542RozchylRamionaV1 = s4({
  id: "m5-4-2-rozchyl-ramiona-v1",
  topicId: "M5-4.2",
  title: "Kąty — Rozchyl ramiona",
  coreLesson: "Rozchyl ramiona",
  paperEvidence: "Klasyfikacja kątów",
  studentGoal: "Uczeń nazywa elementy kąta i klasyfikuje kąty jako ostre, proste, rozwarte lub półpełne.",
  successCriteria: ["Wskazuje wierzchołek i ramiona.", "Klasyfikuje kąt poprawnie."],
  prerequisiteSkillIds: ["M5-4.1-parallel-perpendicular"],
  skillIds: ["M5-4.2-angle-types"],
  estimatedMinutes: 40,
  stages: stdStages(
    "Ramiona w górę — jaki kąt?",
    "Ostry / prosty / rozwarty / półpełny",
    "Porównaj dwa kąty bez mierzenia",
    "Klasyfikacja",
    [
      { expression: "∠ABC ≈ 120°", prompt: "Rodzaj kąta." },
      { expression: "Trzy kąty na rysunku", prompt: "Uporządkuj rosnąco." },
    ],
    [{ expression: "∠KLM", prompt: "Ostry czy rozwarty? Uzasadnij." }],
  ),
});

export const m543KatomierzEkranowyV1 = s4({
  id: "m5-4-3-katomierz-ekranowy-v1",
  topicId: "M5-4.3",
  title: "Mierzenie kątów — Kątomierz ekranowy",
  coreLesson: "Kątomierz ekranowy",
  paperEvidence: "Arkusz kątów w skali",
  studentGoal: "Uczeń mierzy i rysuje kąty z dokładnością do 1° używając kątomierza.",
  successCriteria: ["Ustawia środek na wierzchołku.", "Odczytuje właściwą skalę."],
  prerequisiteSkillIds: ["M5-4.2-angle-types"],
  skillIds: ["M5-4.3-measure-angles"],
  estimatedMinutes: 40,
  stages: stdStages(
    "Środek kątomierza na wierzchołku",
    "Wewnętrzna vs zewnętrzna skala",
    "Zmierz ∠ — 47° czy 133°?",
    "Pomiar kątów",
    [
      { expression: "Narysuj ∠ 65°", prompt: "Kątomierz + zapis." },
      { expression: "Odczytaj kąt z rysunku", prompt: "Podaj miarę." },
    ],
    [{ expression: "Narysuj ∠ 125°", prompt: "Dokładność 1°." }],
  ),
});

export const m544SkrzyzowanieProstychV1 = s4({
  id: "m5-4-4-skrzyzowanie-prostych-v1",
  topicId: "M5-4.4",
  title: "Kąty przyległe i wierzchołkowe — Skrzyżowanie prostych",
  coreLesson: "Skrzyżowanie prostych",
  paperEvidence: "Brakujący kąt z uzasadnieniem",
  studentGoal: "Uczeń oblicza brakujące kąty przy skrzyżowaniu prostych używając kątów przyległych i wierzchołowych.",
  successCriteria: ["Rozpoznaje pary przyległe i wierzchołowe.", "Uzasadnia obliczenie."],
  prerequisiteSkillIds: ["M5-4.3-measure-angles"],
  skillIds: ["M5-4.4-adjacent-vertical"],
  stages: stdStages(
    "Dwie proste przecinają się — ile kątów powstaje?",
    "Kąty wierzchołowe są równe",
    "Jeden kąt 38° — pozostałe?",
    "Skrzyżowanie",
    [
      { expression: "∠1 = 52°", prompt: "∠2, ∠3, ∠4 — uzasadnij." },
      { expression: "∠a + ∠b = 180° przy prostej", prompt: "Kąty przyległe." },
    ],
    [{ expression: "∠x = 71°", prompt: "Brakujące kąty przy ⊙." }],
  ),
});

export const m545BudowniczyWielokatowV1 = s4({
  id: "m5-4-5-budowniczy-wielokatow-v1",
  topicId: "M5-4.5",
  title: "Wielokąty — Budowniczy wielokątów",
  coreLesson: "Budowniczy wielokątów",
  paperEvidence: "Klasyfikacja i rysunek",
  studentGoal: "Uczeń nazywa elementy wielokąta i klasyfikuje wielokąty wypukłe w zakresie programu.",
  successCriteria: ["Nazywa wierzchołki, boki, przekątne.", "Podaje przykład i kontrprzykład."],
  prerequisiteSkillIds: ["M5-4.4-adjacent-vertical"],
  skillIds: ["M5-4.5-polygons"],
  stages: stdStages(
    "Pięciokąt — ile boków, wierzchołków?",
    "Wypukły vs niewypukły (zakres programu)",
    "Narysuj sześciokąt foremny",
    "Wielokąty",
    [
      { expression: "Ósemka", prompt: "Ile przekątnych z jednego wierzchołka?" },
      { expression: "Czy figura jest wielokątem?", prompt: "Kontrprzykład." },
    ],
    [{ expression: "Pięciokąt", prompt: "Zaznacz wierzchołki i jedną przekątną." }],
  ),
});

export const m546TrojkatnyPlacZabawV1 = s4({
  id: "m5-4-6-trojkatny-plac-zabaw-v1",
  topicId: "M5-4.6",
  title: "Rodzaje trójkątów — Trójkątny plac zabaw",
  coreLesson: "Trójkątny plac zabaw",
  paperEvidence: "Dwie niezależne klasyfikacje",
  studentGoal: "Uczeń klasyfikuje trójkąty według boków i według kątów niezależnie.",
  successCriteria: ["Podaje obie klasyfikacje.", "Nie myli kategorii boków z kątów."],
  prerequisiteSkillIds: ["M5-4.5-polygons"],
  skillIds: ["M5-4.6-triangle-types"],
  stages: stdStages(
    "Zmień boki — jaki to trójkąt?",
    "Równoboczny / równoramienny / różnoboczny",
    "Ostrokątny / prostokątny / rozwartokątny",
    "Klasyfikacja trójkątów",
    [
      { expression: "Trójkąt: boki 5, 5, 8", prompt: "Według boków i kątów." },
      { expression: "Trójkąt prostokątny", prompt: "Czy może być równoboczny?" },
    ],
    [{ expression: "△ ABC", prompt: "Dwie klasyfikacje z rysunku." }],
  ),
});

export const m547DwaOkregiMozliwosciV1 = s4({
  id: "m5-4-7-dwa-okregi-v1",
  topicId: "M5-4.7",
  title: "Konstrukcja trójkąta z boków — Dwa okręgi możliwości",
  coreLesson: "Dwa okręgi możliwości",
  paperEvidence: "Nierówność trójkąta",
  studentGoal: "Uczeń decyduje, czy trójkąt o danych bokach istnieje, i wykonuje konstrukcję linijką i cyrklem.",
  successCriteria: ["Stosuje nierówność trójkąta.", "Konstruuje trójkąt gdy możliwe."],
  prerequisiteSkillIds: ["M5-4.6-triangle-types"],
  skillIds: ["M5-4.7-triangle-construction"],
  stages: stdStages(
    "Boki 3, 4, 5 — czy trójkąt powstanie?",
    "Nierówność trójkąta — każdy bok mniejszy od sumy dwóch pozostałych",
    "Konstrukcja: dwa okręgi o promieniach boków",
    "Konstrukcja",
    [
      { expression: "2, 3, 6", prompt: "Czy trójkąt istnieje?" },
      { expression: "5, 5, 7", prompt: "Konstrukcja + opis." },
    ],
    [{ expression: "4, 4, 9", prompt: "Tak czy nie + uzasadnienie." }],
  ),
});

export const m548Rozerwij180V1 = s4({
  id: "m5-4-8-rozerwij-180-v1",
  topicId: "M5-4.8",
  title: "Miary kątów w trójkątach — Rozerwij i złóż 180°",
  coreLesson: "Rozerwij i złóż 180°",
  paperEvidence: "Suma kątów w trójkącie",
  studentGoal: "Uczeń wyjaśnia, że suma kątów trójkąta wynosi 180°, i oblicza brakujący kąt.",
  successCriteria: ["Uzasadnia sumę 180°.", "Oblicza brakujący kąt w równoramienny."],
  prerequisiteSkillIds: ["M5-4.7-triangle-construction"],
  skillIds: ["M5-4.8-triangle-angle-sum"],
  stages: stdStages(
    "Rozerwij trójkąt — trzy kąty na prostej",
    "Suma kątów = 180°",
    "Brakujący kąt: 40° i 65°",
    "Suma kątów",
    [
      { expression: "△: 55°, 75°, ?", prompt: "Brakujący kąt." },
      { expression: "Równoramienny: 40° przy podstawie", prompt: "Kąty przy podstawie." },
    ],
    [{ expression: "△: 90°, 38°, ?", prompt: "Wynik + sprawdzenie sumy." }],
  ),
});

export const m549LaboratoriumWlasnosciV1 = s4({
  id: "m5-4-9-laboratorium-wlasnosci-v1",
  topicId: "M5-4.9",
  title: "Prostokąty i kwadraty — Laboratorium własności",
  coreLesson: "Laboratorium własności",
  paperEvidence: "Tabela prawda/fałsz",
  studentGoal: "Uczeń opisuje własności prostokąta i kwadratu oraz uzasadnia, że kwadrat jest prostokątem.",
  successCriteria: ["Wypełnia tabelę własności.", "Podaje kontrprzykład gdy fałsz."],
  prerequisiteSkillIds: ["M5-4.8-triangle-angle-sum"],
  skillIds: ["M5-4.9-rectangle-square"],
  stages: stdStages(
    "Prostokąt — równe naprzemianległe boki",
    "Kwadrat — wszystkie boki równe",
    "Tabela: przekątne, kąty, symetrie",
    "Prostokąt i kwadrat",
    [
      { expression: "Czy każdy prostokąt ma równe przekątne?", prompt: "Prawda/fałsz + dowód." },
      { expression: "Czy kwadrat jest rombem?", prompt: "Uzasadnij." },
    ],
    [{ expression: "Tabela 4 własności", prompt: "Uzupełnij dla kwadratu." }],
  ),
});

export const m5410PrzesunWierzcholekV1 = s4({
  id: "m5-4-10-przesun-wierzcholek-v1",
  topicId: "M5-4.10",
  title: "Równoległoboki i romby — Przesuń wierzchołek",
  coreLesson: "Przesuń wierzchołek",
  paperEvidence: "Tabela własności",
  studentGoal: "Uczeń rozpoznaje równoległobok i romb oraz opisuje niezmienniki boków, kątów i przekątnych.",
  successCriteria: ["Rozpoznaje figurę w obrocie.", "Wypełnia tabelę własności."],
  prerequisiteSkillIds: ["M5-4.9-rectangle-square"],
  skillIds: ["M5-4.10-parallelogram-rhombus"],
  stages: stdStages(
    "Przesuń wierzchołek — co się nie zmienia?",
    "Romb: równe boki, przekątne prostopadłe",
    "Równoległobok: naprzemianległe boki równe",
    "Równoległoboki i romby",
    [
      { expression: "Figura w obrocie", prompt: "Romb czy równoległobok?" },
      { expression: "Przekątne rombu", prompt: "Co wiemy o kątach?" },
    ],
    [{ expression: "Czy romb jest równoległobokiem?", prompt: "Uzasadnij." }],
  ),
});

export const m5411TrapezyV1 = s4({
  id: "m5-4-11-trapezy-v1",
  topicId: "M5-4.11",
  title: "Trapezy — Jedna para równoległych",
  coreLesson: "Jedna para równoległych",
  paperEvidence: "Klasyfikacja trapezów",
  studentGoal: "Uczeń rozpoznaje trapez i jego warianty oraz oblicza kąty przy ramionach.",
  successCriteria: ["Wskazuje podstawy.", "Klasyfikuje trapez równoramienny / prostokątny."],
  prerequisiteSkillIds: ["M5-4.10-parallelogram-rhombus"],
  skillIds: ["M5-4.11-trapezoid"],
  stages: stdStages(
    "Jedna para boków równoległych",
    "Trapez równoramienny — kąty przy podstawie",
    "Rysunek nietypowy — czy to trapez?",
    "Trapezy",
    [
      { expression: "Trapez: podstawy 6 i 10", prompt: "Zaznacz wysokość." },
      { expression: "Kąty przy ramionach", prompt: "∠A + ∠B = ?" },
    ],
    [{ expression: "Czy równoległobok jest trapezem?", prompt: "Definicja + uzasadnienie." }],
  ),
});

export const m5412MapaRodzinFigurV1 = s4({
  id: "m5-4-12-mapa-rodzin-v1",
  topicId: "M5-4.12",
  title: "Czworokąty — podsumowanie — Mapa rodzin figur",
  coreLesson: "Mapa rodzin figur",
  paperEvidence: "Diagram klasyfikacji",
  studentGoal: "Uczeń układa diagram relacji między czworokątami z przykładami i kontrprzykładami.",
  successCriteria: ["Umieszcza figury w hierarchii.", "Podaje kontrprzykład."],
  prerequisiteSkillIds: ["M5-4.11-trapezoid"],
  skillIds: ["M5-4.12-quadrilateral-map"],
  estimatedMinutes: 40,
  stages: stdStages(
    "Drzewo: czworokąt → trapez → …",
    "Kwadrat należy do których rodzin?",
    "Kontrprzykład: romb niekwadrat",
    "Mapa rodzin",
    [
      { expression: "Diagram Venn czworokątów", prompt: "Uzupełnij." },
      { expression: "Czy każdy romb jest kwadratem?", prompt: "Przykład/kontrprzykład." },
    ],
    [{ expression: "Trapez równoramienny", prompt: "Gdzie w mapie?" }],
  ),
});

export const m5413LustroFigurV1 = s4({
  id: "m5-4-13-lustro-figur-v1",
  topicId: "M5-4.13",
  title: "Oś symetrii — Lustro figur",
  coreLesson: "Lustro figur",
  paperEvidence: "Dokończenie rysunku na kratce",
  studentGoal: "Uczeń rozpoznaje oś symetrii, rysuje figurę symetryczną i uzupełnia rysunek na kratce.",
  successCriteria: ["Rysuje oś symetrii.", "Dokańcza połowę figury."],
  prerequisiteSkillIds: ["M5-4.12-quadrilateral-map"],
  skillIds: ["M5-4.13-symmetry"],
  stages: stdStages(
    "Złóż kartkę — figura na obu połowach",
    "Ile osi ma kwadrat? A prostokąt?",
    "Dokończ rysunek wzoru na kratce",
    "Symetria",
    [
      { expression: "Litera A", prompt: "Ile osi symetrii?" },
      { expression: "Połowa motyla", prompt: "Dorysuj drugą połowę." },
    ],
    [{ expression: "Trójkąt równoboczny", prompt: "Osie symetrii." }],
  ),
});

export const m54rBiuroProjektoweV1 = s4({
  id: "m5-4-r-biuro-projektowe-v1",
  topicId: "M5-4.R",
  title: "Powtórzenie — Biuro projektowe",
  coreLesson: "Biuro projektowe",
  paperEvidence: "Karta konstrukcyjna",
  studentGoal: "Uczeń rozwiązuje zadania łączone z geometrii płaskiej: kąty, trójkąty, czworokąty, symetria.",
  successCriteria: ["Spełnia warunki konstrukcji.", "Uzasadnia cechy figury."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-4.R-review"],
  estimatedMinutes: 40,
  stages: [
    { suffix: "s1", kind: "warmup", title: "Mapa", minutes: 5, headline: "Umiem / wrócę do — dział 4" },
    { suffix: "s2", kind: "practice", title: "Stacja: kąty", minutes: 8, headline: "Skrzyżowanie prostych" },
    { suffix: "s3", kind: "practice", title: "Stacja: trójkąty", minutes: 8, headline: "Klasyfikacja + suma kątów" },
    { suffix: "s4", kind: "practice", title: "Stacja: czworokąty", minutes: 10, headline: "Mapa rodzin figur" },
    { suffix: "s5", kind: "practice", title: "Stacja: symetria", minutes: 8, headline: "Lustro na kratce" },
    { suffix: "s6", kind: "exit-ticket", title: "Plan domowy", minutes: 5, headline: "Jedna karta konstrukcyjna" },
  ],
});

export const m54sTablicaPomiarowaV1 = s4({
  id: "m5-4-s-tablica-pomiarowa-v1",
  topicId: "M5-4.S",
  title: "Sprawdzian i omówienie — Tablica pomiarowa",
  coreLesson: "Tablica pomiarowa",
  paperEvidence: "A/B, rubryka konstrukcji",
  studentGoal: "Uczeń rozwiązuje sprawdzian działu 4 i omawia błędy na tablicy pomiarowej.",
  successCriteria: ["Mierzy kąty poprawnie.", "Naprawia błędny rysunek z uzasadnieniem."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-4.S-exam"],
  estimatedMinutes: 50,
  overview: "Sprawdzian geometrii płaskiej + omówienie konstrukcji.",
  openingScript: "„Sprawdzian działu 4 — precyzja rysunku i uzasadnienie.”",
  closingScript: "„Omówienie: napraw błędny rysunek na tablicy.”",
  commonMisconceptions: ["Pomiar bez ustawienia środka kątomierza."],
  stages: [
    { suffix: "s1", kind: "warmup", title: "Reguły", minutes: 5, headline: "Czas, przybory, oddanie" },
    {
      suffix: "s2",
      kind: "exit-ticket",
      title: "Arkusz A",
      minutes: 25,
      headline: "Sprawdzian — część 1",
      print: {
        worksheetTitle: "Sprawdzian dział 4 — część A",
        instructions: "Czas: 25 min. Rysuj dokładnie.",
        items: [
          { id: "a1", expression: "Proste ∥ i ⊥", prompt: "Narysuj + oznacz." },
          { id: "a2", expression: "∠ 135°", prompt: "Narysuj i zmierz." },
          { id: "a3", expression: "Skrzyżowanie: ∠1=47°", prompt: "Pozostałe kąty." },
          { id: "a4", expression: "Trójkąt: 50°, 60°, ?", prompt: "Brakujący kąt." },
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
        worksheetTitle: "Sprawdzian dział 4 — część B",
        instructions: "Zadania otwarte.",
        items: [
          { id: "b1", expression: "Boki 4, 5, 9", prompt: "Czy trójkąt istnieje?" },
          { id: "b2", expression: "Romb vs kwadrat", prompt: "Porównaj własności." },
          { id: "b3", expression: "Połowa figury symetrycznej", prompt: "Dorysuj na kratce." },
        ],
      },
    },
    {
      suffix: "s4",
      kind: "discuss",
      title: "Omówienie",
      minutes: 15,
      headline: "Napraw błędny rysunek",
      discussionPrompts: ["Gdzie błąd pomiaru?", "Jak poprawić konstrukcję?"],
    },
    { suffix: "s5", kind: "warmup", title: "Rubryka", minutes: 5, headline: "Ocena konstrukcji" },
  ],
});

export const section4LessonsWpC4: LessonPackage[] = [
  m541LinijkaIEkierkaV1,
  m542RozchylRamionaV1,
  m543KatomierzEkranowyV1,
  m544SkrzyzowanieProstychV1,
  m545BudowniczyWielokatowV1,
  m546TrojkatnyPlacZabawV1,
  m547DwaOkregiMozliwosciV1,
  m548Rozerwij180V1,
  m549LaboratoriumWlasnosciV1,
  m5410PrzesunWierzcholekV1,
  m5411TrapezyV1,
  m5412MapaRodzinFigurV1,
  m5413LustroFigurV1,
  m54rBiuroProjektoweV1,
  m54sTablicaPomiarowaV1,
];
