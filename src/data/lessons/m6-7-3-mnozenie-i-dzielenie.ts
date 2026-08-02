import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, seed: number, skillId: string): QuestionReference[] => Array.from({ length: count }, (_, index) => ({ id: `m6-7-3-${stage}-${index + 1}`, generatorId: "integer-mul-div-l1-v1", seed: seed + index, difficulty: index + 1 === count ? "challenge" : index === 0 ? "support" : "core", skillIds: [skillId], feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: false, manualReview: "never" as const, feedbackKeys: ["correct", "incorrect", "missing-answer"] } }));

export const m673MnozenieIDzielenieV1 = buildLessonPackage({
  id: "m6-7-3-mnozenie-i-dzielenie-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S7", topicId: "M6-7.3", lessonNumber: 3,
  title: "Mnożenie i dzielenie liczb dodatnich i ujemnych",
  studentGoal: "Nauczę się sprawnie mnożyć i dzielić dodatnie i ujemne liczby całkowite oraz ułamki.",
  successCriteria: ["Stosuję regułę znaków: te same znaki dają plus, a różne znaki dają minus.", "Mnożę i dzielę dodatnie i ujemne liczby całkowite.", "Mnożę i dzielę dodatnie i ujemne ułamki.", "Przy mnożeniu skracam ułamki, a przy dzieleniu zapisuję odwrotność dzielnika.", "Podaję wynik w najprostszej postaci."],
  learningGoals: [
    { id: "m6-7-3-goal-1", studentGoal: "Nauczę się mnożyć i dzielić liczby dodatnie i ujemne — całkowite oraz ułamki.", successCriteria: ["Mnożę i dzielę dodatnie i ujemne liczby całkowite.", "Mnożę i dzielę dodatnie i ujemne ułamki.", "Podaję wynik w najprostszej postaci."], curriculumReferences: [] },
    { id: "m6-7-3-goal-2", studentGoal: "Nauczę się poprawnie ustalać znak wyniku mnożenia i dzielenia.", successCriteria: ["Gdy liczby mają te same znaki, wybieram plus.", "Gdy liczby mają różne znaki, wybieram minus.", "Ustalam znak przed wykonaniem rachunku."], curriculumReferences: [] },
  ],
  skillIds: ["M6-7.3-signs", "M6-7.3-integers", "M6-7.3-fractions", "M6-7.3-stories"], prerequisiteSkillIds: ["M6-7.2-add-integers"], estimatedMinutes: 45,
  coreLesson: "Mnożenie i dzielenie dodatnich i ujemnych liczb całkowitych oraz ułamków, z poprawnym stosowaniem reguł znaków.", paperEvidence: "Tabela znaków oraz pełny zapis mnożenia, skracania i dzielenia przez odwrotność.", overview: "Uczeń poznaje prostą regułę znaków, stosuje ją w mnożeniu i dzieleniu liczb całkowitych, a następnie wykonuje takie same działania na ułamkach.",
  openingScript: "Pokaż trzy powtarzające się spadki temperatury i zapytaj o znak łącznej zmiany.", closingScript: "Uczeń podaje wspólną regułę znaków dla mnożenia i dzielenia oraz przykład ją uzasadniający.", commonMisconceptions: ["Uczeń stosuje regułę znaków z dodawania.", "Uczeń zaczyna rachunek przed ustaleniem znaku.", "Uczeń odwraca dzielną zamiast dzielnika.", "Uczeń nie skraca ułamków."],
  stageBlueprints: [
    { suffix: "sign-discovery", kind: "practice", title: "Skąd bierze się znak wyniku", minutes: 6, headline: "Najpierw kierunek zmiany", body: "Wyprowadź regułę z powtarzanych i odwracanych zmian.", modelId: "integer-mul-div-lab", modelSeed: 673101, questions: questions("sign-discovery", 6, 673101, "M6-7.3-signs"), preserveTaskTitle: true },
    { suffix: "multiply-integers", kind: "practice", title: "Mnożenie liczb całkowitych", minutes: 7, headline: "Najpierw znak, potem mnożenie", body: "Ustal znak wyniku, a następnie pomnóż liczby bez znaków.", modelId: "integer-mul-div-lab", modelSeed: 673201, questions: questions("multiply-integers", 8, 673201, "M6-7.3-integers"), preserveTaskTitle: true },
    { suffix: "divide-integers", kind: "practice", title: "Dzielenie liczb całkowitych", minutes: 7, headline: "Najpierw znak, potem dzielenie", body: "Ustal znak wyniku, a następnie podziel liczby bez znaków.", modelId: "integer-mul-div-lab", modelSeed: 673301, questions: questions("divide-integers", 8, 673301, "M6-7.3-integers"), preserveTaskTitle: true },
    { suffix: "multiply-fractions", kind: "practice", title: "Mnożenie ułamków ze znakiem", minutes: 9, headline: "Ustal znak, skróć, pomnóż", body: "Miejsce na obliczenia prowadzi przez skracanie do pionowego zapisu wyniku.", modelId: "integer-mul-div-lab", modelSeed: 673401, questions: questions("multiply-fractions", 6, 673401, "M6-7.3-fractions"), preserveTaskTitle: true },
    { suffix: "divide-fractions", kind: "practice", title: "Dzielenie ułamków ze znakiem", minutes: 9, headline: "Zapisz odwrotność dzielnika", body: "Uzupełnij odwrotność, zamień dzielenie na mnożenie i skróć wynik.", modelId: "integer-mul-div-lab", modelSeed: 673501, questions: questions("divide-fractions", 6, 673501, "M6-7.3-fractions"), preserveTaskTitle: true },
    { suffix: "stories", kind: "exit-ticket", title: "Powtarzane zmiany", minutes: 7, headline: "Temperatura, nurkowanie, saldo i gra", body: "Rozpoznaj mnożenie albo dzielenie i zinterpretuj znak wyniku.", modelId: "integer-mul-div-lab", modelSeed: 673601, questions: questions("stories", 6, 673601, "M6-7.3-stories"), preserveTaskTitle: true },
  ], status: "published",
});
