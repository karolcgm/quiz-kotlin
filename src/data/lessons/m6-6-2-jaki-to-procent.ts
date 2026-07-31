import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const questions = Array.from({ length: 10 }, (_, index) => ({
  id: `m6-6-2-what-percent-${index + 1}`,
  seed: 662200 + index,
  difficulty: (index < 4 ? "core" : "challenge") as "core" | "challenge",
  skillIds: ["M6-6.2-percent-proportion"],
  feedbackPolicy: {
    mode: "assessment" as const,
    allowsPartialCredit: false,
    manualReview: "never" as const,
    feedbackKeys: ["correct", "incorrect", "missing-answer"],
  },
}));

export const m662JakiToProcentV1 = buildLessonPackage({
  id: "m6-6-2-jaki-to-procent-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S6",
  topicId: "M6-6.2",
  lessonNumber: 2,
  title: "Jaki to procent?",
  studentGoal: "Nauczę się obliczać, jaki procent jednej liczby stanowi druga liczba.",
  successCriteria: [
    "Zapisuję całość jako 100%, a pod nią badaną część.",
    "Wykonuję to samo dzielenie po obu stronach proporcji.",
    "Obliczam brakujący procent.",
  ],
  skillIds: ["M6-6.2-percent-proportion"],
  prerequisiteSkillIds: ["M6-6.1-percent-basics"],
  estimatedMinutes: 45,
  coreLesson: "Obliczanie procentu metodą proporcji.",
  paperEvidence: "Zeszyt ucznia: proporcje zapisane w dwóch wierszach z tą samą operacją po obu stronach.",
  overview: "Uczeń poznaje metodę proporcji: całość odpowiada 100%, a badaną część zapisuje bezpośrednio pod całością.",
  openingScript: "Przypomnij, że cała grupa oznacza 100%, a następnie zapisz pod nią badaną część grupy.",
  closingScript: "Poproś uczniów o wyjaśnienie, dlaczego po obu stronach proporcji trzeba wykonać dokładnie tę samą operację.",
  commonMisconceptions: [
    "Uczeń zamienia miejscami całość i badaną część.",
    "Uczeń dzieli tylko liczby po jednej stronie proporcji.",
    "Uczeń nie dopisuje znaku procenta do wyniku.",
  ],
  stageBlueprints: [
    {
      suffix: "percent-six-what-example",
      kind: "worked-example",
      title: "Proporcja: część i całość",
      minutes: 12,
      headline: "Jaki procent grupy stanowi jej część?",
      body: "Zapisz całą grupę jako 100%, a następnie wykonaj tę samą operację po obu stronach proporcji.",
      modelId: "decimal-notation-l1",
      studentInstruction: "Prześledź dwie jednakowe strzałki dzielenia prowadzące do wyniku 20%.",
      teacherInstruction: "Zapisz liczby w dwóch wierszach i podkreśl, że po obu stronach wykonujemy dzielenie przez 5.",
    },
    {
      suffix: "percent-six-what-practice",
      kind: "practice",
      title: "Oblicz brakujący procent",
      minutes: 28,
      headline: "Uzupełnij proporcję",
      body: "W każdym zadaniu wpisz procent odpowiadający podanej części całości.",
      modelId: "decimal-notation-l1",
      preserveTaskTitle: true,
      questions,
      studentInstruction: "Wykonaj wskazane dzielenie po obu stronach, wpisz procent i zatwierdź.",
      teacherInstruction: "Sprawdzaj, czy uczeń czyta górny wiersz jako całość równą 100%.",
    },
  ],
  status: "published",
});
