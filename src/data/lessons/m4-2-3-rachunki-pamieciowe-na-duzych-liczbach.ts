import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-2-3-${suffix}-${index + 1}`,
    generatorId: "grade4-large-number-arithmetic-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m423RachunkiPamiecioweNaDuzychLiczbachV1 = buildLessonPackage({
  id: "m4-2-3-rachunki-pamieciowe-na-duzych-liczbach-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S2",
  topicId: "M4-2.3",
  lessonNumber: 1,
  title: "Rachunki pamięciowe na dużych liczbach",
  studentGoal: "Nauczę się sprawnie wykonywać proste rachunki na dużych liczbach.",
  successCriteria: [
    "Dodaję i odejmuję liczby zakończone zerami.",
    "Mnożę i dzielę liczby z końcowymi zerami.",
    "Wykorzystuję 10² i 10³ w prostych rachunkach.",
  ],
  learningGoals: [
    { id: "m4-2-3-goal-1", studentGoal: "Nauczę się dodawać i odejmować duże liczby w pamięci.", successCriteria: ["Obliczam sumy i różnice liczb zakończonych zerami."], curriculumReferences: [] },
    { id: "m4-2-3-goal-2", studentGoal: "Nauczę się mnożyć i dzielić liczby z zerami.", successCriteria: ["Dopisuję zera w mnożeniu i skracam je parami w dzieleniu."], curriculumReferences: [] },
    { id: "m4-2-3-goal-3", studentGoal: "Nauczę się używać potęg dziesiątki w rachunkach.", successCriteria: ["Obliczam działania zawierające 10² lub 10³."], curriculumReferences: [] },
  ],
  skillIds: ["M4-2.3-add-sub", "M4-2.3-mul-div", "M4-2.3-powers"],
  prerequisiteSkillIds: ["M4-2.1-place-value", "M4-1.8-powers"],
  estimatedMinutes: 45,
  coreLesson: "Dodawanie i odejmowanie liczb zakończonych zerami, mnożenie przez liczby z zerami, skracanie zer w dzieleniu oraz proste rachunki z 10² i 10³.",
  paperEvidence: "Karta ucznia: rachunki pamięciowe z dużymi liczbami i zaznaczone zera pomocne w obliczeniach.",
  overview: "Uczeń wykorzystuje znane małe rachunki do obliczeń na tysiącach i milionach, kontroluje liczbę zer, a na końcu stosuje kwadrat i sześcian liczby 10.",
  openingScript: "Zapisz 48 000 + 36 000 i zapytaj, co oznaczają obie liczby w tysiącach. Następnie zasłoń po trzy zera i wykonaj prostszy rachunek.",
  closingScript: "Poproś ucznia o podanie jednej zasady dla mnożenia z zerami, jednej dla dzielenia oraz wartości 10² i 10³.",
  commonMisconceptions: [
    "Uczeń dopisuje zera w dodawaniu tak samo jak w mnożeniu.",
    "Uczeń w mnożeniu pomija zera jednego czynnika.",
    "Uczeń w dzieleniu skreśla różną liczbę zer w dzielnej i dzielniku.",
    "Uczeń odczytuje 10³ jako 10 · 3.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "worked-example", title: "Sposoby na rachunki z zerami", minutes: 10,
      headline: "Najpierw prostszy rachunek", body: "Zobacz, jak wykorzystać tysiące, końcowe zera oraz potęgi liczby 10.",
      modelId: "grade4-large-number-arithmetic-lab", modelSeed: 4231,
      studentInstruction: "Prześledź każdy przykład i zwróć uwagę na czerwone zera.",
      teacherInstruction: "Przy dzieleniu podkreśl, że zera skreślamy parami: po jednym w dzielnej i dzielniku.",
    },
    {
      suffix: "add-sub", kind: "practice", title: "Dodawanie i odejmowanie", minutes: 11,
      headline: "Licz w tysiącach i milionach", body: "Oblicz sumy i różnice liczb zakończonych zerami.",
      modelId: "grade4-large-number-arithmetic-lab", modelSeed: 4232, questions: questions("add-sub", 6, "M4-2.3-add-sub", 423100), preserveTaskTitle: true,
      studentInstruction: "Wykonaj prostszy rachunek, a następnie wpisz pełny wynik.",
      teacherInstruction: "Sprawdzaj, czy uczeń zachowuje właściwy rząd, zamiast mechanicznie dopisywać zera.",
    },
    {
      suffix: "mul-div", kind: "practice", title: "Mnożenie i dzielenie", minutes: 14,
      headline: "Policz i kontroluj zera", body: "W mnożeniu policz końcowe zera, a w dzieleniu skracaj je parami.",
      modelId: "grade4-large-number-arithmetic-lab", modelSeed: 4233, questions: questions("mul-div", 8, "M4-2.3-mul-div", 423200), preserveTaskTitle: true,
      studentInstruction: "Najpierw nazwij prostsze działanie, a potem wpisz pełny wynik.",
      teacherInstruction: "Nie pozwalaj skreślać zer tylko w jednej liczbie podczas dzielenia.",
    },
    {
      suffix: "powers", kind: "challenge", title: "Potęgi dziesiątki", minutes: 10,
      headline: "10² i 10³ w rachunkach", body: "Oblicz wartość potęgi, a następnie całe działanie.",
      modelId: "grade4-large-number-arithmetic-lab", modelSeed: 4234, questions: questions("powers", 6, "M4-2.3-powers", 423300), preserveTaskTitle: true,
      studentInstruction: "Rozpisz w pamięci potęgę jako mnożenie dziesiątek i wpisz wynik.",
      teacherInstruction: "Przypomnij, że wykładnik mówi, ile razy zapisujemy 10 jako czynnik.",
    },
  ],
  status: "published",
});
