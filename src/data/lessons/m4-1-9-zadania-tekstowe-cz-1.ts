import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (count: number): QuestionReference[] => Array.from({ length: count }, (_, index) => ({
  id: `m4-1-9-story-${index + 1}`,
  generatorId: "grade4-story-problems-one-l1-v1",
  seed: 49100 + index,
  difficulty: index === count - 1 ? "challenge" : "core",
  skillIds: [["M4-1.9-difference", "M4-1.9-sum", "M4-1.9-quotient", "M4-1.9-product"][index] ?? "M4-1.9-operation"],
}));

export const m419ZadaniaTekstoweCz1V1 = buildLessonPackage({
  id: "m4-1-9-zadania-tekstowe-cz-1-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.9",
  lessonNumber: 9,
  title: "Zadania tekstowe, cz. 1",
  studentGoal: "Nauczę się dobierać właściwe działanie do zadania tekstowego i zapisywać odpowiedź.",
  successCriteria: [
    "Rozpoznaję, czy zadanie wymaga dodawania, odejmowania, mnożenia czy dzielenia.",
    "Zapisuję całe działanie z liczbami z zadania i poprawnie je obliczam.",
    "Formułuję odpowiedź pasującą do pytania i sytuacji.",
  ],
  learningGoals: [
    { id: "m4-1-9-goal-1", studentGoal: "Nauczę się wybierać działanie na podstawie treści pytania.", successCriteria: ["Wybieram właściwy znak spośród +, −, · i :."], curriculumReferences: [] },
    { id: "m4-1-9-goal-2", studentGoal: "Nauczę się zapisywać działanie do zadania tekstowego.", successCriteria: ["Poprawnie wybieram liczby, znak działania i wynik."], curriculumReferences: [] },
    { id: "m4-1-9-goal-3", studentGoal: "Nauczę się odpowiadać pełnym zdaniem.", successCriteria: ["Moja odpowiedź zawiera wynik i odnosi się do pytania."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.9-sum", "M4-1.9-difference", "M4-1.9-product", "M4-1.9-quotient", "M4-1.9-answer"],
  prerequisiteSkillIds: ["M4-1.2-operation", "M4-1.6-operation"],
  estimatedMinutes: 45,
  coreLesson: "Dobieranie dodawania, odejmowania, mnożenia lub dzielenia do treści zadania oraz zapisywanie odpowiedzi.",
  paperEvidence: "Karta ucznia: cztery ilustrowane zadania z pełnym działaniem i odpowiedzią.",
  overview: "Uczeń na jednej ilustrowanej historii przypomina sobie różnicę między pytaniami „o ile?” i „ile razy?”, a następnie rozwiązuje cztery zadania wymagające czterech różnych działań.",
  openingScript: "Przeczytaj historię o 24 naklejkach Oli i 8 naklejkach Kuby. Zadaj do tych samych danych cztery pytania: „o ile więcej?”, „o ile mniej?”, „ile razy więcej?” oraz „ile razy mniej?”.",
  closingScript: "Poproś ucznia o dokończenie dwóch zdań: „Gdy pytają o ile, to…” oraz „Gdy pytają ile razy, to…”.",
  commonMisconceptions: [
    "Uczeń wybiera dodawanie zamiast odejmowania przy pytaniu „o ile?”.",
    "Uczeń odejmuje liczby przy pytaniu „ile razy?” zamiast podzielić większą przez mniejszą.",
    "Uczeń podaje samą liczbę bez odpowiedzi odnoszącej się do pytania.",
  ],
  stageBlueprints: [
    {
      suffix: "information",
      kind: "worked-example",
      title: "O ile czy ile razy?",
      minutes: 12,
      headline: "Jedna historia, cztery sposoby pytania",
      body: "Na przykładzie kolekcji naklejek porównaj pytania „więcej” i „mniej” prowadzące do odejmowania albo dzielenia.",
      modelId: "grade4-story-problems-one-lab",
      modelSeed: 491,
      studentInstruction: "Porównaj cztery pytania i sprawdź, kiedy odejmujemy, a kiedy dzielimy.",
      teacherInstruction: "Najpierw przeczytaj historię, potem kolejno omów pytania „o ile więcej?”, „o ile mniej?”, „ile razy więcej?” i „ile razy mniej?”. Podkreśl słowa w pytaniu.",
    },
    {
      suffix: "practice",
      kind: "practice",
      title: "Ilustrowane zadania tekstowe",
      minutes: 25,
      headline: "Zapisz działanie i odpowiedź",
      body: "Rozwiąż cztery różne zadania. Każde ma własną ilustrację.",
      modelId: "grade4-story-problems-one-lab",
      modelSeed: 492,
      questions: questions(4),
      preserveTaskTitle: true,
      studentInstruction: "Przeczytaj pytanie, wpisz całe działanie i sprawdź odpowiedź.",
      teacherInstruction: "Nie podpowiadaj znaku działania przed przeczytaniem pytania. Poproś ucznia o uzasadnienie wyboru.",
    },
  ],
  status: "published",
});
