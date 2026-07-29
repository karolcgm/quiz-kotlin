import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const tableSeries = [{
  id: "m6-4-4-motion-table-series",
  seed: 1,
  difficulty: "core" as const,
  skillIds: ["M6-4.4-select-quantity", "M6-4.4-motion-calculations"],
  feedbackPolicy: {
    mode: "assessment" as const,
    allowsPartialCredit: false,
    manualReview: "never" as const,
    feedbackKeys: ["correct", "incorrect", "missing-answer"],
  },
}];

const storySeries = [{
  id: "m6-4-4-motion-stories-series",
  seed: 2,
  difficulty: "core" as const,
  skillIds: ["M6-4.4-motion-calculations", "M6-4.4-motion-word-problems"],
  feedbackPolicy: {
    mode: "assessment" as const,
    allowsPartialCredit: false,
    manualReview: "never" as const,
    feedbackKeys: ["correct", "incorrect", "missing-answer"],
  },
}];

export const m644DrogaPredkoscCzasV1 = buildLessonPackage({
  id: "m6-4-4-droga-predkosc-czas-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S4",
  topicId: "M6-4.4",
  lessonNumber: 4,
  title: "Droga, prędkość, czas",
  studentGoal: "Nauczę się rozpoznawać, którą wielkość należy obliczyć w zadaniu o ruchu.",
  successCriteria: [
    "Obliczam drogę, prędkość albo czas na podstawie dwóch podanych wielkości.",
    "Dobieram działanie bez gotowej podpowiedzi.",
    "Zapisuję wynik z właściwą jednostką i sprawdzam, czy ma sens.",
  ],
  skillIds: ["M6-4.4-select-quantity", "M6-4.4-motion-calculations", "M6-4.4-motion-word-problems"],
  prerequisiteSkillIds: ["M6-4.1-distance-formula", "M6-4.2-speed-formula", "M6-4.3-time-formula"],
  estimatedMinutes: 45,
  coreLesson: "Mieszane obliczanie drogi, prędkości i czasu.",
  paperEvidence: "Zeszyt ucznia: obliczenia drogi, prędkości i czasu wraz z jednostkami.",
  overview: "Uczniowie najpierw uzupełniają mieszaną tabelę, a następnie rozwiązują zadania tekstowe, w których samodzielnie rozpoznają szukaną wielkość.",
  openingScript: "Przypomnij, że w każdym zadaniu znamy dwie wielkości, a szukamy trzeciej. Nie podawaj gotowego działania przed odczytaniem danych.",
  closingScript: "Poproś uczniów o wskazanie, po czym rozpoznają, czy należy obliczyć drogę, prędkość czy czas.",
  commonMisconceptions: [
    "Uczeń wykonuje zawsze to samo działanie bez sprawdzenia, której wielkości szuka.",
    "Uczeń zamienia miejscami drogę i czas podczas dzielenia.",
    "Uczeń pomija jednostkę albo podaje jednostkę innej wielkości.",
  ],
  stageBlueprints: [
    {
      suffix: "motion-table",
      kind: "practice",
      title: "Prędkość, czas i droga w tabeli",
      minutes: 18,
      headline: "W każdym wierszu brakuje jednej wielkości",
      body: "Odczytaj dwie podane wielkości i oblicz trzecią. W tabeli zadania na drogę, prędkość i czas są przemieszane.",
      modelId: "distance-motion-lab",
      preserveTaskTitle: true,
      questions: tableSeries,
      studentInstruction: "Dotknij pustej kratki, wpisz wynik klawiaturą lekcji i zatwierdź całą tabelę.",
      teacherInstruction: "Zwracaj uwagę na wybór działania oraz jednostkę w każdej kolumnie.",
    },
    {
      suffix: "motion-stories",
      kind: "challenge",
      title: "Zadania tekstowe",
      minutes: 22,
      headline: "Najpierw rozpoznaj, czego szukasz",
      body: "Pierwsze zadanie zawiera zapis pomocniczy. W kolejnych uczeń sam wpisuje dane i oblicza brakującą wielkość.",
      modelId: "distance-motion-lab",
      preserveTaskTitle: true,
      questions: storySeries,
      studentInstruction: "Odczytaj dane, wpisz potrzebne wartości i wynik. Nie zostawiaj pustych pól.",
      teacherInstruction: "Pozwól uczniom samodzielnie zdecydować, jakie działanie należy wykonać.",
    },
  ],
  status: "published",
});
