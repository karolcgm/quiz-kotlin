import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, seed: number, skillId: string): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({ id: `m6-7-2-${stage}-${index + 1}`, generatorId: "decimal-notation-l1-v1", seed: seed + index, difficulty: index + 1 === count ? "challenge" : "core", skillIds: [skillId], feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: false, manualReview: "never" as const, feedbackKeys: ["correct", "incorrect", "missing-answer"] } }));

export const m672DodawanieIOdejmowanieV1 = buildLessonPackage({
  id: "m6-7-2-dodawanie-i-odejmowanie-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S7", topicId: "M6-7.2", lessonNumber: 2,
  title: "Dodawanie i odejmowanie liczb dodatnich i ujemnych",
  studentGoal: "Będę dodawać i odejmować liczby dodatnie i ujemne.",
  successCriteria: ["Poprawnie usuwam nawiasy i ustalam znak działania.", "Dodaję liczby o tych samych znakach.", "Dodaję liczby o przeciwnych znakach.", "Zamieniam odejmowanie na dodawanie liczby przeciwnej.", "Rozwiązuję zadania tekstowe z liczbami dodatnimi i ujemnymi."],
  skillIds: ["M6-7.2-sign-rules", "M6-7.2-add", "M6-7.2-subtract", "M6-7.2-stories"], prerequisiteSkillIds: ["M6-7.1-compare"], estimatedMinutes: 45,
  coreLesson: "Dodawanie i odejmowanie liczb całkowitych oraz ułamków zwykłych i dziesiętnych ze znakiem.", paperEvidence: "Zapis kilku działań wraz z etapem usunięcia nawiasów.",
  overview: "Reguły znaków są przedstawione tak samo jak w klasie V, lecz działania obejmują również ułamki zwykłe i dziesiętne.", openingScript: "Przypomnij model zysków i długów oraz kierunki ruchu na osi.", closingScript: "Poproś o wyjaśnienie, dlaczego odjęcie liczby ujemnej zwiększa wynik.",
  commonMisconceptions: ["Uczeń dodaje moduły liczb o przeciwnych znakach.", "Uczeń nie zmienia znaku po odjęciu liczby ujemnej.", "Uczeń myli znak działania ze znakiem liczby."],
  stageBlueprints: [
    { suffix: "sign-rules", kind: "practice", title: "Znaki przy nawiasach", minutes: 6, headline: "Najpierw usuń nawias", body: "Plus obok minusa daje minus, a dwa minusy obok siebie dają plus.", modelId: "integer-add-subtract-lab", modelSeed: 672101, questions: questions("rules", 3, 672101, "M6-7.2-sign-rules"), preserveTaskTitle: true },
    { suffix: "add-different", kind: "practice", title: "Dodawanie liczb o przeciwnych znakach", minutes: 8, headline: "Odejmij moduły i zachowaj znak większego modułu", body: "Oblicz działania na liczbach dziesiętnych.", modelId: "integer-add-subtract-lab", modelSeed: 672201, questions: questions("different", 4, 672201, "M6-7.2-add"), preserveTaskTitle: true },
    { suffix: "add-same", kind: "practice", title: "Dodawanie liczb o tych samych znakach", minutes: 8, headline: "Dodaj moduły i zachowaj wspólny znak", body: "Wykonaj obliczenia i sprawdź sens znaku wyniku.", modelId: "integer-add-subtract-lab", modelSeed: 672301, questions: questions("same", 4, 672301, "M6-7.2-add"), preserveTaskTitle: true },
    { suffix: "subtract", kind: "practice", title: "Odejmowanie liczb dodatnich i ujemnych", minutes: 8, headline: "Dodaj liczbę przeciwną", body: "Usuń nawias, a następnie wykonaj dodawanie.", modelId: "integer-add-subtract-lab", modelSeed: 672401, questions: questions("subtract", 4, 672401, "M6-7.2-subtract"), preserveTaskTitle: true },
    { suffix: "axis", kind: "practice", title: "Dodawanie i odejmowanie na osi", minutes: 6, headline: "Ruch w prawo i w lewo", body: "Odczytaj wynik działania z osi liczbowej.", modelId: "integer-add-subtract-lab", modelSeed: 672501, questions: questions("axis", 2, 672501, "M6-7.2-add"), preserveTaskTitle: true },
    { suffix: "stories", kind: "exit-ticket", title: "Zadania tekstowe", minutes: 7, headline: "Temperatura, wysokość i saldo", body: "Samodzielnie wybierz działanie i wpisz wynik.", modelId: "integer-add-subtract-lab", modelSeed: 672601, questions: questions("stories", 4, 672601, "M6-7.2-stories"), preserveTaskTitle: true },
  ], status: "published",
});
