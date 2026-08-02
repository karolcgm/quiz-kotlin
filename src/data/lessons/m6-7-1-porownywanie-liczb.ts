import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, seed: number, skillId: string): QuestionReference[] => Array.from({ length: count }, (_, index) => ({
  id: `m6-7-1-${stage}-${index + 1}`,
  generatorId: "integer-numbers-l1-v1",
  seed: seed + index,
  difficulty: index + 1 === count ? "challenge" : index === 0 ? "support" : "core",
  skillIds: [skillId],
  feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: false, manualReview: "never" as const, feedbackKeys: ["correct", "incorrect", "missing-answer"] },
}));

export const m671PorownywanieLiczbV1 = buildLessonPackage({
  id: "m6-7-1-porownywanie-liczb-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S7", topicId: "M6-7.1", lessonNumber: 1,
  title: "Liczby dodatnie i liczby ujemne",
  studentGoal: "Zrozumiem liczby ze znakiem jako położenie lub zmianę względem zera i nauczę się je porównywać.",
  successCriteria: ["Wyjaśniam znaczenie znaku liczby w codziennej sytuacji.", "Rozróżniam liczby naturalne, całkowite i wymierne oraz określam ich położenie względem zera.", "Porównuję liczby całkowite na osi.", "Przenoszę tę samą regułę na ułamki i liczby dziesiętne.", "Wyjaśniam wartość bezwzględną jako odległość od zera."],
  skillIds: ["M6-7.1-meaning", "M6-7.1-number-sets", "M6-7.1-number-line", "M6-7.1-compare", "M6-7.1-absolute-value"], prerequisiteSkillIds: ["M5-7.1-integers"], estimatedMinutes: 45,
  coreLesson: "Znaczenie zera, liczby naturalne, całkowite i wymierne, określenia względem zera, oś liczbowa, porównywanie, liczby przeciwne i wartość bezwzględna.",
  paperEvidence: "Oś liczbowa, tabela sytuacji względem zera oraz zapis porównania ułamków.",
  overview: "Lekcja zaczyna się od sytuacji względem zera, porządkuje rodziny liczb i określenia: dodatnia, ujemna, nieujemna oraz niedodatnia. Następnie uczeń przenosi regułę osi na ułamki zwykłe i dziesiętne.",
  openingScript: "Zapytaj, co może oznaczać zero na termometrze, w windzie, na koncie i na mapie wysokości.",
  closingScript: "Uczeń wyjaśnia własnymi słowami, dlaczego spośród dwóch liczb ujemnych większa jest ta położona bliżej zera.",
  commonMisconceptions: ["Uczeń traktuje minus jak znak odejmowania zamiast znak liczby.", "Uczeń uznaje zero za liczbę dodatnią.", "Uczeń uważa liczbę o większej wartości bezwzględnej za zawsze większą.", "Uczeń zmienia regułę osi po pojawieniu się ułamków."],
  stageBlueprints: [
    { suffix: "context-integers", kind: "practice", title: "Punktem odniesienia jest zero", minutes: 6, headline: "Co mówi znak liczby?", body: "Odczytaj położenie albo zmianę w sytuacji z temperaturą, windą, saldem i wysokością.", modelId: "integer-numbers-lab", modelSeed: 671101, questions: questions("context-integers", 6, 671101, "M6-7.1-meaning"), preserveTaskTitle: true },
    { suffix: "number-sets", kind: "practice", title: "Liczby naturalne, całkowite i wymierne", minutes: 7, headline: "Rodziny liczb i ich położenie względem zera", body: "Poznaj zależność między zbiorami liczb i rozróżniaj liczby dodatnie, ujemne, nieujemne oraz niedodatnie.", modelId: "integer-numbers-lab", modelSeed: 671201, questions: questions("number-sets", 8, 671201, "M6-7.1-number-sets"), preserveTaskTitle: true },
    { suffix: "integer-line", kind: "practice", title: "Liczby całkowite na osi", minutes: 8, headline: "Odczytaj i zaznacz kilka liczb", body: "Pracuj na długiej osi: odczytuj kilka punktów oraz samodzielnie zaznaczaj podane liczby.", modelId: "integer-numbers-lab", modelSeed: 671301, questions: questions("integer-line", 4, 671301, "M6-7.1-number-line"), preserveTaskTitle: true },
    { suffix: "integer-compare", kind: "practice", title: "Porównywanie liczb całkowitych", minutes: 7, headline: "Która liczba leży bardziej na prawo?", body: "Porównaj liczby całkowite, w tym pary dwóch liczb ujemnych.", modelId: "integer-numbers-lab", modelSeed: 671401, questions: questions("integer-compare", 8, 671401, "M6-7.1-compare"), preserveTaskTitle: true },
    { suffix: "rational-line", kind: "practice", title: "Odległość od zera i liczby przeciwne", minutes: 6, headline: "Punkty na osi i ich położenie względem zera", body: "Na jednej osi odczytaj punkty A–D. W zależności od polecenia podaj odległość punktu od zera albo liczbę przeciwną.", modelId: "integer-numbers-lab", modelSeed: 671501, questions: questions("rational-line", 4, 671501, "M6-7.1-number-line"), preserveTaskTitle: true },
    { suffix: "rational-compare", kind: "practice", title: "Porównywanie ułamków ze znakiem", minutes: 8, headline: "Najpierw porównaj odległości", body: "Korzystaj ze wspólnego mianownika, zapisu dziesiętnego albo położenia na osi.", modelId: "integer-numbers-lab", modelSeed: 671601, questions: questions("rational-compare", 8, 671601, "M6-7.1-compare"), preserveTaskTitle: true },
    { suffix: "absolute-opposites", kind: "exit-ticket", title: "Liczby przeciwne i wartość bezwzględna", minutes: 7, headline: "Ta sama odległość po dwóch stronach zera", body: "Wskaż liczbę przeciwną i nazwij odległość liczby od zera.", modelId: "integer-numbers-lab", modelSeed: 671701, questions: questions("absolute-opposites", 6, 671701, "M6-7.1-absolute-value"), preserveTaskTitle: true },
  ], status: "published",
});
