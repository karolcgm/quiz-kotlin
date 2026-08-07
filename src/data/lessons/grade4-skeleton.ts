import { grade4PlanSections } from "@/data/curriculum/pl-math-4-2026-classic/plan";
import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { LessonLearningGoal, LessonPackage } from "@/types/lessonPackage";

const titleSlug = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

function buildLearningGoals(topicId: string, topicGoal: string): LessonLearningGoal[] {
  return [
    {
      id: `${topicId.toLowerCase().replace(".", "-")}-goal-1`,
      studentGoal: `Nauczę się ${topicGoal}.`,
      successCriteria: [`Potrafię ${topicGoal}.`],
      curriculumReferences: [],
    },
    {
      id: `${topicId.toLowerCase().replace(".", "-")}-goal-2`,
      studentGoal: "Nauczę się czytelnie przedstawiać rozwiązanie i sprawdzać wynik.",
      successCriteria: ["Potrafię zapisać lub wskazać rozwiązanie i sprawdzić, czy ma sens."],
      curriculumReferences: [],
    },
  ];
}

function buildGrade4Lesson(sectionIndex: number, topicIndex: number): LessonPackage {
  const section = grade4PlanSections[sectionIndex]!;
  const topic = section.topics[topicIndex]!;
  const topicId = `M4-${section.number}.${topicIndex + 1}`;
  const skillId = `${topicId}-skill`;
  const isReview = topic.kind === "review";
  const criteria = [
    `Potrafię ${topic.goal}.`,
    "Potrafię zapisać lub wskazać rozwiązanie i sprawdzić, czy ma sens.",
  ];

  return buildLessonPackage({
    id: `m4-${section.number}-${topicIndex + 1}-${titleSlug(topic.title)}-v1`,
    curriculumId: "pl-math-4-2026-classic",
    sectionId: `M4-S${section.number}`,
    topicId,
    title: topic.title,
    lessonNumber: topicIndex + 1,
    studentGoal: `Nauczę się ${topic.goal}.`,
    successCriteria: criteria,
    learningGoals: buildLearningGoals(topicId, topic.goal),
    skillIds: [skillId],
    prerequisiteSkillIds: [],
    estimatedMinutes: 45,
    coreLesson: topic.goal.charAt(0).toUpperCase() + topic.goal.slice(1),
    paperEvidence: `Zeszyt lub karta ucznia: ${topic.title}.`,
    overview: `Szkielet lekcji klasy IV z działu „${section.title}”. Miejsca na modele i interaktywne serie są przygotowane do wypełnienia.`,
    openingScript: `Przedstaw temat „${topic.title}”, dwa cele lekcji oraz odpowiadające im kryteria sukcesu.`,
    closingScript: "Wróć do kryteriów z pierwszego slajdu i poproś ucznia o krótką samoocenę.",
    commonMisconceptions: [
      "Uczeń wybiera działanie lub własność bez powiązania jej z treścią zadania.",
    ],
    stageBlueprints: [
      {
        suffix: "wprowadzenie",
        kind: "explore",
        title: isReview ? "Przypomnienie wiadomości" : "Wprowadzenie",
        minutes: 8,
        headline: topic.title,
        body: isReview
          ? `Zbierz najważniejsze wiadomości z działu „${section.title}” bez powtarzania wcześniejszych przykładów.`
          : "Miejsce na jasną informację, konkretny model i krótką aktywność odkrywającą zasadę.",
        studentInstruction: "Obserwuj model, nazwij zauważoną zasadę i sprawdź ją na prostym przykładzie.",
        teacherInstruction: "Uzupełnij slajd konkretnym modelem. Gdy przestrzeń lub ruch pomagają w zrozumieniu, zastosuj React Three Fiber.",
      },
      {
        suffix: "przyklad",
        kind: "worked-example",
        title: "Przykład prowadzony",
        minutes: 10,
        headline: "Zobacz sposób rozwiązania",
        body: "Miejsce na jeden czytelny przykład prowadzony krok po kroku, bez nadmiaru przypadków na jednym slajdzie.",
        studentInstruction: "Przejdź przez przykład krok po kroku i nazwij sposób sprawdzenia wyniku.",
        teacherInstruction: "Zachowaj pełny zapis matematyczny i użyj modelu manipulacyjnego, jeśli ułatwia rozumowanie.",
      },
      {
        suffix: "zadania",
        kind: isReview ? "challenge" : "practice",
        title: isReview ? "Powtórzenie wiadomości" : "Zadania interaktywne",
        minutes: 17,
        headline: "Jedna seria zadań w tym samym slajdzie",
        body: "Miejsce na interaktywną serię: jeden wspólny nagłówek i układ, jedno zadanie naraz, licznik Zadanie X/Y oraz przejście do kolejnego zadania po sprawdzeniu poprzedniego.",
        modelId: "exercise-board",
        studentInstruction: "Rozwiązuj zadania po kolei. Każde następne zadanie pojawi się w tym samym slajdzie.",
        teacherInstruction: "Podczas wypełniania zastąp szkielet właściwym modelem i generatorem. Pola liczbowe na tablecie mają używać klawiatury lekcyjnej.",
      },
      {
        suffix: "podsumowanie",
        kind: "exit-ticket",
        title: "Krótka próba samodzielna",
        minutes: 5,
        headline: "Pokaż, co potrafisz",
        body: "Miejsce na nowe, krótkie zadanie sprawdzające główną umiejętność lekcji.",
        studentInstruction: "Wykonaj zadanie samodzielnie i sprawdź odpowiedź.",
        teacherInstruction: "To zadanie ma dostarczyć dowodu do końcowej oceny umiejętności.",
      },
    ],
    status: "draft",
  });
}

export const grade4SkeletonLessons: LessonPackage[] = grade4PlanSections.flatMap(
  (section, sectionIndex) => section.topics.flatMap((topic, topicIndex) => (
    topic.kind === "exam" || (section.number === 1 && topicIndex <= 6) ? [] : [buildGrade4Lesson(sectionIndex, topicIndex)]
  )),
);
