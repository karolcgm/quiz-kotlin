import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const questions = (id: string, count: number, skillIds: string[]) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${id}-${index + 1}`,
    seed: index + 1,
    difficulty: (index < 1 ? "core" : "challenge") as "core" | "challenge",
    skillIds,
    feedbackPolicy: {
      mode: "assessment" as const,
      allowsPartialCredit: false,
      manualReview: "never" as const,
      feedbackKeys: ["correct", "incorrect", "missing-answer"],
    },
  }));

export const m655PowtorzeniePolV1 = buildLessonPackage({
  id: "m6-5-5-powtorzenie-pol-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S5",
  topicId: "M6-5.5",
  lessonNumber: 5,
  title: "Powtórzenie wiadomości o polach wielokątów",
  studentGoal: "Utrwalę obliczanie pól wielokątów i brakujących wymiarów.",
  successCriteria: [
    "Dobieram właściwy sposób obliczenia pola figury.",
    "Ujednolicam jednostki długości i pola.",
    "Obliczam brakujący bok, wysokość lub przekątną.",
    "Rozwiązuję wieloetapowe zadania tekstowe.",
  ],
  skillIds: ["M6-5.5-area-review", "M6-5.5-unit-conversion", "M6-5.5-word-problems"],
  prerequisiteSkillIds: ["M6-5.1-rectangle-area", "M6-5.2-parallelogram-area", "M6-5.3-triangle-area", "M6-5.4-trapezoid-area"],
  estimatedMinutes: 45,
  coreLesson: "Powtórzenie pól prostokątów, równoległoboków, rombów, trójkątów i trapezów.",
  paperEvidence: "Zeszyt ucznia: rozwiązania z doborem wzoru, zamianą jednostek i kontrolą sensu wyniku.",
  overview: "Powtórzenie składa się wyłącznie z różnorodnych, trudniejszych zadań obejmujących cały dział.",
  openingScript: "Poproś uczniów, by przed każdym obliczeniem nazwali figurę i potrzebne dane.",
  closingScript: "Omów strategie kontroli wyniku: jednostkę, przybliżoną wielkość pola i sprawdzenie odwrotne.",
  commonMisconceptions: [
    "Uczeń dobiera wzór do wyglądu rysunku zamiast do własności figury.",
    "Uczeń miesza jednostki długości z jednostkami pola.",
    "Uczeń pomija jeden etap zadania wieloetapowego.",
  ],
  stageBlueprints: [
    {
      suffix: "calculations",
      kind: "practice",
      title: "Pola wielokątów — powtórzenie",
      minutes: 24,
      headline: "Dobierz sposób i oblicz",
      body: "Rozwiązuj zadania obejmujące różne figury, jednostki i brakujące wymiary.",
      modelId: "area-review-lab",
      preserveTaskTitle: true,
      questions: questions("m6-5-5-calculation", 5, ["M6-5.5-area-review", "M6-5.5-unit-conversion"]),
      studentInstruction: "Uzupełnij wszystkie etapy i zatwierdź każde zadanie raz na końcu.",
      teacherInstruction: "Wymagaj nazwania figury i sprawdzenia jednostki przed zatwierdzeniem.",
    },
    {
      suffix: "stories",
      kind: "challenge",
      title: "Zadania tekstowe — powtórzenie",
      minutes: 21,
      headline: "Połącz wiadomości z całego działu",
      body: "Rozwiąż nowe, wieloetapowe zadania o dekoracji festynowej i tkaninie na żagle.",
      modelId: "area-review-lab",
      preserveTaskTitle: true,
      questions: questions("m6-5-5-story", 2, ["M6-5.5-area-review", "M6-5.5-word-problems"]),
      studentInstruction: "Samodzielnie dobierz działania, wpisz wyniki pośrednie i odpowiedź.",
      teacherInstruction: "Po rozwiązaniu poproś ucznia o krótkie uzasadnienie wyboru działań.",
    },
  ],
  status: "published",
});
