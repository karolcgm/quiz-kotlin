import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-1-6-${suffix}-${index + 1}`,
    generatorId: "grade4-times-more-less-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m416IleRazyWiecejIleRazyMniejV1 = buildLessonPackage({
  id: "m4-1-6-ile-razy-wiecej-ile-razy-mniej-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.6",
  lessonNumber: 6,
  title: "Ile razy więcej, ile razy mniej",
  studentGoal: "Nauczę się obliczać liczbę kilka razy większą lub mniejszą oraz porównywać liczby za pomocą ilorazu.",
  successCriteria: [
    "Rozpoznaję, że „razy więcej” oznacza mnożenie, a „razy mniej” oznacza dzielenie.",
    "Znajduję liczbę kilka razy większą lub mniejszą i obliczam, ile razy jedna liczba jest większa od drugiej.",
    "Rozwiązuję zadanie z treścią i uzupełniam wszystkie jego podpunkty.",
  ],
  learningGoals: [
    { id: "m4-1-6-goal-1", studentGoal: "Nauczę się rozpoznawać działanie ukryte w zwrotach „razy więcej” i „razy mniej”", successCriteria: ["Rozpoznaję, że „razy więcej” oznacza mnożenie, a „razy mniej” oznacza dzielenie."], curriculumReferences: [] },
    { id: "m4-1-6-goal-2", studentGoal: "Nauczę się obliczać i porównywać liczby za pomocą mnożenia oraz dzielenia.", successCriteria: ["Znajduję liczbę kilka razy większą lub mniejszą i obliczam, ile razy jedna liczba jest większa od drugiej."], curriculumReferences: [] },
    { id: "m4-1-6-goal-3", studentGoal: "Nauczę się wykorzystywać te zwroty w zadaniach z treścią.", successCriteria: ["Rozwiązuję zadanie z treścią i uzupełniam wszystkie jego podpunkty."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.6-operation", "M4-1.6-reverse", "M4-1.6-story"],
  prerequisiteSkillIds: ["M4-1.3-table", "M4-1.5-strategy"],
  estimatedMinutes: 45,
  coreLesson: "Obliczanie liczb kilka razy większych lub mniejszych, porównywanie liczb za pomocą ilorazu oraz zadania z treścią.",
  paperEvidence: "Karta pracy: ile razy więcej i ile razy mniej, zapis prosty i odwrotny oraz zadania dwupunktowe.",
  overview: "Jeden slajd informacyjny i trzy serie: obliczanie oraz porównywanie liczb, zapis w drugą stronę i ilustrowane zadania z podpunktami a) i b).",
  openingScript: "Zestaw obok siebie zdania: 4 razy więcej niż 6 oraz 4 razy mniej niż 24. Połącz każde sformułowanie z właściwym działaniem.",
  closingScript: "Poproś ucznia, aby wyjaśnił, kiedy mnoży, kiedy dzieli i jak sprawdza, ile razy jedna liczba jest większa od drugiej.",
  commonMisconceptions: [
    "Uczeń myli zwroty „o ile” oraz „ile razy” i zamiast mnożyć, dodaje.",
    "Uczeń w porównaniu dwóch liczb dzieli mniejszą liczbę przez większą.",
    "Uczeń w zadaniu z dwoma podpunktami podaje tylko pierwszy wynik.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "explore", title: "Co znaczy razy więcej i razy mniej?", minutes: 8,
      headline: "4 razy więcej niż 6 i 4 razy mniej niż 24", body: "Razy więcej oznacza mnożenie. Razy mniej oznacza dzielenie.",
      modelId: "grade4-times-more-less-lab", modelSeed: 461,
      studentInstruction: "Porównaj oba zapisy i sprawdź, jak za pomocą dzielenia porównujemy dwie liczby.",
      teacherInstruction: "Wyraźnie odróżnij zwroty „o ile” od „ile razy”. Pokaż obok siebie 6 · 4 oraz 24 : 4.",
    },
    {
      suffix: "practice", kind: "practice", title: "Znajdź lub porównaj liczby", minutes: 10,
      headline: "Ile razy więcej lub mniej", body: "Znajdź szukaną liczbę albo oblicz, ile razy jedna liczba jest większa od drugiej.",
      modelId: "grade4-times-more-less-lab", modelSeed: 462, questions: questions("practice", 6, "M4-1.6-operation", 46100), preserveTaskTitle: true,
      studentInstruction: "Rozwiąż sześć zadań. Każde kolejne pojawi się w tej samej karcie.",
      teacherInstruction: "Pilnuj rozróżnienia: „znajdź liczbę 4 razy większą” i „oblicz, ile razy liczba jest większa”.",
    },
    {
      suffix: "reverse", kind: "challenge", title: "Zapis w drugą stronę", minutes: 8,
      headline: "Uzupełnij początek zdania", body: "Oblicz liczbę, która spełnia podany warunek.",
      modelId: "grade4-times-more-less-lab", modelSeed: 463, questions: questions("reverse", 4, "M4-1.6-reverse", 46200), preserveTaskTitle: true,
      studentInstruction: "Uzupełnij cztery zdania. Kratka znajduje się na początku każdego zdania.",
      teacherInstruction: "Zwróć uwagę, że puste miejsce jest wynikiem opisanego mnożenia lub dzielenia.",
    },
    {
      suffix: "stories", kind: "exit-ticket", title: "Zadania z treścią", minutes: 14,
      headline: "Oblicz i odpowiedz na oba pytania", body: "Każde zadanie ma własną ilustrację oraz dwa pola odpowiedzi: a) i b).",
      modelId: "grade4-times-more-less-lab", modelSeed: 464, questions: questions("stories", 4, "M4-1.6-story", 46300), preserveTaskTitle: true,
      studentInstruction: "Przeczytaj treść pod ilustracją. Uzupełnij odpowiedź a), a następnie b).",
      teacherInstruction: "Grafika znajduje się nad treścią. Nie zaliczaj zadania, dopóki oba pola nie są uzupełnione.",
    },
  ],
  status: "published",
});
