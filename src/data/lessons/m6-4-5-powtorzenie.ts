import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const reviewTableSeries = [{
  id: "m6-4-5-motion-review-table-series",
  seed: 1,
  difficulty: "core" as const,
  skillIds: ["M6-4.5-review-motion"],
  feedbackPolicy: {
    mode: "assessment" as const,
    allowsPartialCredit: false,
    manualReview: "never" as const,
    feedbackKeys: ["correct", "incorrect", "missing-answer"],
  },
}];

const reviewStorySeries = [{
  id: "m6-4-5-motion-review-stories-series",
  seed: 2,
  difficulty: "challenge" as const,
  skillIds: ["M6-4.5-review-motion", "M6-4.5-review-word-problems"],
  feedbackPolicy: {
    mode: "assessment" as const,
    allowsPartialCredit: false,
    manualReview: "never" as const,
    feedbackKeys: ["correct", "incorrect", "missing-answer"],
  },
}];

export const m645PowtorzenieV1 = buildLessonPackage({
  id: "m6-4-5-powtorzenie-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S4",
  topicId: "M6-4.5",
  lessonNumber: 5,
  title: "Powtórzenie wiadomości",
  studentGoal: "Utrwalę obliczanie drogi, prędkości i czasu.",
  successCriteria: [
    "Rozpoznaję brakującą wielkość i dobieram działanie.",
    "Rozwiązuję zadania z różnymi jednostkami prędkości i czasu.",
    "Zapisuję poprawny wynik z jednostką.",
  ],
  skillIds: ["M6-4.5-review-motion", "M6-4.5-review-word-problems"],
  prerequisiteSkillIds: ["M6-4.4-motion-calculations", "M6-4.4-motion-word-problems"],
  estimatedMinutes: 45,
  coreLesson: "Powtórzenie obliczania drogi, prędkości i czasu.",
  paperEvidence: "Zeszyt ucznia: rozwiązania zadań powtórkowych z pełnym zapisem jednostek.",
  overview: "Powtórzenie obejmuje nową mieszaną tabelę oraz serię nowych zadań tekstowych. Przykłady nie powtarzają zadań z poprzedniego tematu.",
  openingScript: "Przypomnij uczniom, aby przed obliczeniem nazwali dwie dane wielkości i jedną szukaną.",
  closingScript: "Omówcie, które zadania wymagały mnożenia, a które dzielenia, oraz jak rozpoznać to z treści.",
  commonMisconceptions: [
    "Uczeń nie rozpoznaje wielkości szukanej.",
    "Uczeń stosuje niewłaściwe działanie.",
    "Uczeń zapisuje wynik bez jednostki.",
  ],
  stageBlueprints: [
    {
      suffix: "motion-review-table",
      kind: "practice",
      title: "Tabela powtórkowa",
      minutes: 17,
      headline: "Uzupełnij brakujące wielkości",
      body: "W jednym zestawie występują obliczenia drogi, prędkości oraz czasu.",
      modelId: "distance-motion-lab",
      preserveTaskTitle: true,
      questions: reviewTableSeries,
      studentInstruction: "Uzupełnij wszystkie puste pola i zatwierdź tabelę.",
      teacherInstruction: "Sprawdź, czy uczeń rozpoznaje szukaną wielkość przed wykonaniem działania.",
    },
    {
      suffix: "motion-review-stories",
      kind: "challenge",
      title: "Zadania powtórkowe",
      minutes: 23,
      headline: "Droga, prędkość i czas w sytuacjach codziennych",
      body: "Rozwiąż nowe zadania tekstowe. W każdym zadaniu samodzielnie odczytaj dane i znajdź brakującą wielkość.",
      modelId: "distance-motion-lab",
      preserveTaskTitle: true,
      questions: reviewStorySeries,
      studentInstruction: "Wpisz dane i wynik do pustych kratek. Zatwierdź zadanie raz na końcu.",
      teacherInstruction: "Po błędnej odpowiedzi omów dobór działania, ale pozwól przejść dalej bez punktu.",
    },
  ],
  status: "published",
});
