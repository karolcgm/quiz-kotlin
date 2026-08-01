import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, seed: number, skillId: string): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m6-7-1-${stage}-${index + 1}`,
    generatorId: "decimal-notation-l1-v1",
    seed: seed + index,
    difficulty: index + 1 === count ? "challenge" : "core",
    skillIds: [skillId],
    feedbackPolicy: {
      mode: "assessment" as const,
      allowsPartialCredit: false,
      manualReview: "never" as const,
      feedbackKeys: ["correct", "incorrect", "missing-answer"],
    },
  }));

export const m671PorownywanieLiczbV1 = buildLessonPackage({
  id: "m6-7-1-porownywanie-liczb-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S7",
  topicId: "M6-7.1",
  lessonNumber: 1,
  title: "Liczby dodatnie i liczby ujemne",
  studentGoal: "Rozpoznam liczby dodatnie i ujemne oraz porównam je na osi liczbowej.",
  successCriteria: [
    "Rozróżniam liczby naturalne, całkowite, dodatnie i ujemne.",
    "Wiem, że zero nie jest ani dodatnie, ani ujemne.",
    "Odczytuję wartość bezwzględną liczby.",
    "Porównuję liczby całkowite, ułamki zwykłe i dziesiętne ze znakiem.",
    "Wskazuję liczby przeciwne.",
  ],
  skillIds: ["M6-7.1-number-sets", "M6-7.1-number-line", "M6-7.1-compare", "M6-7.1-absolute-value"],
  prerequisiteSkillIds: ["M5-7.1-integers"],
  estimatedMinutes: 45,
  coreLesson: "Liczby naturalne i całkowite, liczby dodatnie i ujemne, zero, wartość bezwzględna, liczby przeciwne oraz porównywanie na osi.",
  paperEvidence: "Oś liczbowa z zaznaczonymi liczbami oraz tabela liczb przeciwnych.",
  overview: "Rozszerzenie wiadomości z klasy V o ujemne ułamki zwykłe i dziesiętne oraz wartość bezwzględną.",
  openingScript: "Zacznij od termometru i przypomnij, że na prawo na osi znajdują się liczby większe.",
  closingScript: "Poproś uczniów o podanie dwóch liczb przeciwnych i ich wartości bezwzględnych.",
  commonMisconceptions: [
    "Uczeń uznaje zero za liczbę dodatnią.",
    "Uczeń sądzi, że liczba z większym modułem jest zawsze większa.",
    "Uczeń porównuje ujemne ułamki tak samo jak dodatnie.",
  ],
  stageBlueprints: [
    { suffix: "number-sets", kind: "practice", title: "Liczby naturalne, całkowite, dodatnie i ujemne", minutes: 7, headline: "Do jakiego zbioru należy liczba?", body: "Rozpoznaj liczby naturalne i całkowite oraz określ ich znak.", modelId: "integer-numbers-lab", modelSeed: 671101, questions: questions("sets", 4, 671101, "M6-7.1-number-sets"), preserveTaskTitle: true },
    { suffix: "absolute-value", kind: "practice", title: "Wartość bezwzględna liczby", minutes: 7, headline: "Odległość liczby od zera", body: "Wartość bezwzględna mówi, jak daleko liczba leży od zera.", modelId: "integer-numbers-lab", modelSeed: 671201, questions: questions("absolute", 4, 671201, "M6-7.1-absolute-value"), preserveTaskTitle: true },
    { suffix: "number-line", kind: "practice", title: "Liczby na osi liczbowej", minutes: 7, headline: "Lewa i prawa strona zera", body: "Odczytaj położenie liczb, także ułamków zwykłych i dziesiętnych.", modelId: "integer-numbers-lab", modelSeed: 671301, questions: questions("line", 2, 671301, "M6-7.1-number-line"), preserveTaskTitle: true },
    { suffix: "select", kind: "practice", title: "Liczby większe i mniejsze", minutes: 6, headline: "Wybierz liczby spełniające warunek", body: "Korzystaj z kierunku osi liczbowej.", modelId: "integer-numbers-lab", modelSeed: 671401, questions: questions("select", 2, 671401, "M6-7.1-compare"), preserveTaskTitle: true },
    { suffix: "compare", kind: "practice", title: "Porównywanie liczb", minutes: 8, headline: "Wstaw właściwy znak", body: "Porównaj liczby całkowite oraz ułamki zapisane na różne sposoby.", modelId: "integer-numbers-lab", modelSeed: 671501, questions: questions("compare", 4, 671501, "M6-7.1-compare"), preserveTaskTitle: true },
    { suffix: "opposites", kind: "exit-ticket", title: "Liczby przeciwne", minutes: 7, headline: "Po przeciwnych stronach zera", body: "Wskaż liczbę przeciwną i sprawdź jej położenie na osi.", modelId: "integer-numbers-lab", modelSeed: 671601, questions: questions("opposites", 3, 671601, "M6-7.1-number-line"), preserveTaskTitle: true },
  ],
  status: "published",
});
