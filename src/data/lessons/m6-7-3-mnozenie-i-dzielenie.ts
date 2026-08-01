import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, seed: number, skillId: string): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({ id: `m6-7-3-${stage}-${index + 1}`, generatorId: "decimal-notation-l1-v1", seed: seed + index, difficulty: index + 1 === count ? "challenge" : "core", skillIds: [skillId], feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: false, manualReview: "never" as const, feedbackKeys: ["correct", "incorrect", "missing-answer"] } }));

export const m673MnozenieIDzielenieV1 = buildLessonPackage({
  id: "m6-7-3-mnozenie-i-dzielenie-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S7", topicId: "M6-7.3", lessonNumber: 3,
  title: "Mnożenie i dzielenie liczb dodatnich i ujemnych", studentGoal: "Będę mnożyć i dzielić liczby dodatnie i ujemne.",
  successCriteria: ["Ustalam znak iloczynu i ilorazu.", "Mnożę liczby całkowite, ułamki zwykłe i dziesiętne ze znakiem.", "Dzielę liczby ze znakiem.", "Rozwiązuję zadania tekstowe z mnożeniem i dzieleniem."],
  skillIds: ["M6-7.3-signs", "M6-7.3-multiply", "M6-7.3-divide", "M6-7.3-stories"], prerequisiteSkillIds: ["M6-7.2-add"], estimatedMinutes: 45,
  coreLesson: "Znaki iloczynu i ilorazu oraz działania na liczbach całkowitych i ułamkach ze znakiem.", paperEvidence: "Tabela znaków i rozwiązane działania.", overview: "Model z klasy V został rozszerzony o ułamki zwykłe i dziesiętne oraz zadania wieloetapowe.",
  openingScript: "Ustalcie znak wyniku przed wykonaniem rachunku.", closingScript: "Poproś uczniów o sformułowanie jednej wspólnej reguły znaków dla mnożenia i dzielenia.",
  commonMisconceptions: ["Uczeń stosuje regułę znaków z dodawania.", "Uczeń pomija znak liczby ujemnej.", "Uczeń odwraca niewłaściwy ułamek podczas dzielenia."],
  stageBlueprints: [
    { suffix: "sign-table", kind: "practice", title: "Znaki iloczynu i ilorazu", minutes: 7, headline: "Te same znaki — plus, różne znaki — minus", body: "Najpierw ustal znak wyniku.", modelId: "integer-mul-div-lab", modelSeed: 673101, questions: questions("signs", 4, 673101, "M6-7.3-signs"), preserveTaskTitle: true },
    { suffix: "multiply", kind: "practice", title: "Mnożenie liczb dodatnich i ujemnych", minutes: 9, headline: "Ustal znak i oblicz iloczyn", body: "W działaniach występują liczby całkowite, ułamki zwykłe i dziesiętne.", modelId: "integer-mul-div-lab", modelSeed: 673201, questions: questions("multiply", 3, 673201, "M6-7.3-multiply"), preserveTaskTitle: true },
    { suffix: "divide", kind: "practice", title: "Dzielenie liczb dodatnich i ujemnych", minutes: 9, headline: "Ustal znak i oblicz iloraz", body: "Zastosuj regułę znaków i odpowiednią metodę dzielenia.", modelId: "integer-mul-div-lab", modelSeed: 673301, questions: questions("divide", 3, 673301, "M6-7.3-divide"), preserveTaskTitle: true },
    { suffix: "cipher", kind: "practice", title: "Szyfr znaków", minutes: 10, headline: "Odczytaj hasło z wyników", body: "Oblicz działania i dopasuj wyniki do liter w przemieszanym kluczu.", modelId: "integer-mul-div-lab", modelSeed: 673401, questions: questions("cipher", 6, 673401, "M6-7.3-multiply"), preserveTaskTitle: true },
    { suffix: "stories", kind: "exit-ticket", title: "Zadania tekstowe", minutes: 8, headline: "Zmiany powtarzane wiele razy", body: "Samodzielnie rozpoznaj mnożenie albo dzielenie.", modelId: "integer-mul-div-lab", modelSeed: 673501, questions: questions("stories", 4, 673501, "M6-7.3-stories"), preserveTaskTitle: true },
  ], status: "published",
});
