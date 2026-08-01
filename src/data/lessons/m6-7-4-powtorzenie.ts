import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, seed: number, skillId: string): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({ id: `m6-7-4-${stage}-${index + 1}`, generatorId: "decimal-notation-l1-v1", seed: seed + index, difficulty: index + 1 === count ? "challenge" : "core", skillIds: [skillId], feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: false, manualReview: "never" as const, feedbackKeys: ["correct", "incorrect", "missing-answer"] } }));

export const m674PowtorzenieLiczbZeZnakiemV1 = buildLessonPackage({
  id: "m6-7-4-powtorzenie-liczb-ze-znakiem-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S7", topicId: "M6-7.4", lessonNumber: 4,
  title: "Powtórzenie wiadomości", studentGoal: "Połączę wiadomości o liczbach dodatnich i ujemnych w trudniejszych zadaniach.",
  successCriteria: ["Porównuję liczby zapisane na różne sposoby.", "Obliczam wartości bezwzględne i wskazuję liczby przeciwne.", "Wykonuję cztery działania na liczbach ze znakiem.", "Stosuję kolejność działań.", "Rozwiązuję wieloetapowe zadania tekstowe."],
  skillIds: ["M6-7.4-review", "M6-7.4-operations", "M6-7.4-stories"], prerequisiteSkillIds: ["M6-7.1-compare", "M6-7.2-add", "M6-7.3-multiply"], estimatedMinutes: 45,
  coreLesson: "Nowe zadania łączące porównywanie, wartość bezwzględną, liczby przeciwne i działania na liczbach ze znakiem.", paperEvidence: "Karta rozwiązań z działaniami pośrednimi.", overview: "Powtórzenie korzysta z nowych przykładów i łączy kilka umiejętności w jednym zadaniu.",
  openingScript: "Przypomnij, że najpierw ustalamy kolejność działań i znak wyniku.", closingScript: "Poproś o wskazanie zadania, w którym wartość bezwzględna zmieniła sposób porównania.",
  commonMisconceptions: ["Uczeń pomija kolejność działań.", "Uczeń myli liczbę przeciwną z odwrotnością.", "Uczeń ocenia znak wyniku bez uwzględnienia nawiasów."],
  stageBlueprints: [
    { suffix: "sets", kind: "practice", title: "Porównywanie i liczby przeciwne", minutes: 8, headline: "Połącz wiadomości z pierwszego tematu", body: "Porównaj liczby zapisane w różnej postaci i wskaż liczby przeciwne.", modelId: "integer-review-lab", modelSeed: 674101, questions: questions("sets", 4, 674101, "M6-7.4-review"), preserveTaskTitle: true },
    { suffix: "absolute", kind: "practice", title: "Wartość bezwzględna", minutes: 7, headline: "Odległość od zera w obliczeniach", body: "Porównaj moduły liczb i wybierz właściwą odpowiedź.", modelId: "integer-review-lab", modelSeed: 674201, questions: questions("absolute", 2, 674201, "M6-7.4-review"), preserveTaskTitle: true },
    { suffix: "operations", kind: "practice", title: "Działania na liczbach dodatnich i ujemnych", minutes: 10, headline: "Cztery działania w nowych przykładach", body: "Oblicz wyniki działań na liczbach dziesiętnych.", modelId: "integer-review-lab", modelSeed: 674301, questions: questions("operations", 4, 674301, "M6-7.4-operations"), preserveTaskTitle: true },
    { suffix: "stories", kind: "practice", title: "Zadania tekstowe", minutes: 9, headline: "Temperatura, wysokość i zmiana", body: "Wybierz potrzebne działanie i podaj wynik ze znakiem.", modelId: "integer-review-lab", modelSeed: 674401, questions: questions("stories", 3, 674401, "M6-7.4-stories"), preserveTaskTitle: true },
    { suffix: "challenge", kind: "exit-ticket", title: "Kolejność działań", minutes: 9, headline: "Nawiasy, potęgi i wartość bezwzględna", body: "Wykonaj działania w poprawnej kolejności.", modelId: "integer-review-lab", modelSeed: 674501, questions: questions("challenge", 3, 674501, "M6-7.4-operations"), preserveTaskTitle: true },
  ], status: "published",
});
