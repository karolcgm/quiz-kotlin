import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-1-2-${suffix}-${index + 1}`,
    generatorId: "grade4-more-less-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m412OIleWiecejOIleMniejV1 = buildLessonPackage({
  id: "m4-1-2-o-ile-wiecej-o-ile-mniej-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.2",
  lessonNumber: 2,
  title: "O ile więcej, o ile mniej",
  studentGoal: "Nauczę się obliczać liczbę o podaną wartość większą lub mniejszą.",
  successCriteria: [
    "Rozpoznaję, że „o więcej” oznacza dodawanie, a „o mniej” oznacza odejmowanie.",
    "Znajduję liczbę o podaną wartość większą albo mniejszą, także w zdaniu zapisanym w drugą stronę.",
    "Rozwiązuję zadanie z treścią i uzupełniam wszystkie jego podpunkty.",
  ],
  learningGoals: [
    { id: "m4-1-2-goal-1", studentGoal: "Nauczę się rozpoznawać działanie ukryte w zwrotach „o więcej” i „o mniej”.", successCriteria: ["Rozpoznaję, że „o więcej” oznacza dodawanie, a „o mniej” oznacza odejmowanie."], curriculumReferences: [] },
    { id: "m4-1-2-goal-2", studentGoal: "Nauczę się znajdować liczbę większą lub mniejszą o podaną wartość.", successCriteria: ["Znajduję liczbę o podaną wartość większą albo mniejszą, także w zdaniu zapisanym w drugą stronę."], curriculumReferences: [] },
    { id: "m4-1-2-goal-3", studentGoal: "Nauczę się wykorzystywać te zwroty w zadaniach z treścią.", successCriteria: ["Rozwiązuję zadanie z treścią i uzupełniam wszystkie jego podpunkty."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.2-operation", "M4-1.2-reverse", "M4-1.2-story"],
  prerequisiteSkillIds: ["M4-1.1-add-sub"],
  estimatedMinutes: 45,
  coreLesson: "Obliczanie liczb o podaną wartość większych lub mniejszych oraz wykorzystanie tych zależności w zadaniach z treścią.",
  paperEvidence: "Karta pracy: o ile więcej i o ile mniej, zapis prosty i odwrotny oraz zadania dwupunktowe.",
  overview: "Jeden slajd informacyjny i trzy serie: proste obliczenia, zapis w drugą stronę oraz ilustrowane zadania z podpunktami a) i b).",
  openingScript: "Zestaw obok siebie dwa zdania: o 5 więcej niż 22 oraz o 7 mniej niż 22. Połącz każde sformułowanie ze znakiem działania.",
  closingScript: "Poproś ucznia, aby własnymi słowami wyjaśnił, kiedy dodaje, a kiedy odejmuje.",
  commonMisconceptions: [
    "Uczeń kieruje się wyłącznie wielkością liczb i pomija słowa „o więcej” lub „o mniej”.",
    "Uczeń w zadaniu dwupunktowym podaje tylko pierwszy wynik.",
    "Uczeń traktuje lukę na początku zdania jak liczbę, od której trzeba rozpocząć działanie.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "explore", title: "Co znaczy o więcej i o mniej?", minutes: 7,
      headline: "O 5 więcej niż 22 i o 7 mniej niż 22", body: "O więcej oznacza dodawanie. O mniej oznacza odejmowanie.",
      modelId: "grade4-more-less-lab", modelSeed: 421,
      studentInstruction: "Porównaj oba zapisy i połącz słowa z właściwym znakiem działania.",
      teacherInstruction: "Pokaż równolegle 22 + 5 oraz 22 − 7. Nie wprowadzaj jeszcze zadań wieloetapowych.",
    },
    {
      suffix: "practice", kind: "practice", title: "Znajdź liczbę", minutes: 10,
      headline: "O podaną wartość więcej lub mniej", body: "Wpisz liczbę spełniającą warunek.",
      modelId: "grade4-more-less-lab", modelSeed: 422, questions: questions("practice", 6, "M4-1.2-operation", 42100), preserveTaskTitle: true,
      studentInstruction: "Rozwiąż sześć zadań. Każde kolejne pojawi się w tej samej karcie.",
      teacherInstruction: "Pierwsze zadanie brzmi: znajdź liczbę o 9 większą od 35.",
    },
    {
      suffix: "reverse", kind: "challenge", title: "Zapis w drugą stronę", minutes: 8,
      headline: "Uzupełnij początek zdania", body: "Najpierw odczytaj zależność, a potem oblicz brakującą liczbę.",
      modelId: "grade4-more-less-lab", modelSeed: 423, questions: questions("reverse", 4, "M4-1.2-reverse", 42200), preserveTaskTitle: true,
      studentInstruction: "Uzupełnij cztery zdania, między innymi: ___ to o 8 więcej niż 34.",
      teacherInstruction: "Zwróć uwagę, że puste miejsce jest wynikiem opisanego działania.",
    },
    {
      suffix: "stories", kind: "exit-ticket", title: "Zadania z treścią", minutes: 15,
      headline: "Oblicz i odpowiedz na oba pytania", body: "Każde zadanie ma własną ilustrację oraz dwa pola odpowiedzi: a) i b).",
      modelId: "grade4-more-less-lab", modelSeed: 424, questions: questions("stories", 4, "M4-1.2-story", 42300), preserveTaskTitle: true,
      studentInstruction: "Przeczytaj treść pod ilustracją. Uzupełnij odpowiedź a), a następnie b).",
      teacherInstruction: "Grafika znajduje się nad treścią. Nie zaliczaj zadania, dopóki oba pola nie są uzupełnione.",
    },
  ],
  status: "published",
});
