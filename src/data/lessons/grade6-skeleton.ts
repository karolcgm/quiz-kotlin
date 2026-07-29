import { grade6PlanSections } from "@/data/curriculum/pl-math-6-2026-classic/plan";
import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { LessonPackage } from "@/types/lessonPackage";

const titleSlug = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

function buildGrade6Lesson(sectionIndex: number, topicIndex: number): LessonPackage {
  const section = grade6PlanSections[sectionIndex]!;
  const topic = section.topics[topicIndex]!;
  const topicId = `M6-${section.number}.${topicIndex + 1}`;
  const title = topic.title;
  const goal = `Nauczę się ${topic.goal}.`;
  const coreLesson = topic.goal.charAt(0).toUpperCase() + topic.goal.slice(1);
  const isReview = topic.kind === "review";
  const isExam = topic.kind === "exam";

  return buildLessonPackage({
    id: `m6-${section.number}-${topicIndex + 1}-${titleSlug(title)}-v1`,
    curriculumId: "pl-math-6-2026-classic",
    sectionId: `M6-S${section.number}`,
    topicId,
    title,
    lessonNumber: topicIndex + 1,
    studentGoal: goal,
    successCriteria: isExam
      ? ["Rozwiązuję zadania samodzielnie.", "Sprawdzam zapis i wynik."]
      : [
          `Potrafię ${topic.goal}.`,
          "Potrafię zapisać rozwiązanie i sprawdzić, czy wynik ma sens.",
        ],
    skillIds: [`${topicId}-skill`],
    prerequisiteSkillIds: [],
    estimatedMinutes: isExam ? 45 : 45,
    coreLesson,
    paperEvidence: `Zeszyt ucznia: ${title}.`,
    overview: `Szkielet lekcji klasy VI zgodny z rozkładem materiału: ${section.title}.`,
    openingScript: `Dziś pracujemy nad tematem: ${title}. Najpierw odczytamy cel i kryteria sukcesu.`,
    closingScript: "Na końcu sprawdź kryteria sukcesu i zaznacz, co potrafisz już samodzielnie.",
    commonMisconceptions: ["Uczeń pomija zapis kolejnych kroków rozwiązania lub nie sprawdza sensu wyniku."],
    stageBlueprints: [
      {
        suffix: "s1",
        kind: "explore",
        title: isReview ? "Przypomnienie" : "Wprowadzenie",
        minutes: 10,
        headline: title,
        body: isExam
          ? "Przeczytaj polecenia, zaplanuj kolejność pracy i zapisuj rozwiązania czytelnie."
          : `Poznaj najważniejsze pojęcia i zależności potrzebne w temacie: ${title}.`,
      },
      {
        suffix: "s2",
        kind: isExam ? "practice" : "worked-example",
        title: isExam ? "Zadania sprawdzające" : "Przykład prowadzony",
        minutes: 12,
        headline: isExam ? "Pracuj samodzielnie" : "Przeanalizuj przykład krok po kroku",
        body: isExam
          ? "Rozwiąż zadanie samodzielnie. Zapisz tok rozumowania i odpowiedź."
          : "Wspólnie przejdź przez przykład, nazwij każdy krok i sprawdź wynik.",
      },
      {
        suffix: "s3",
        kind: isReview ? "challenge" : "practice",
        title: isReview ? "Zadania powtórkowe" : "Ćwiczenia",
        minutes: 13,
        headline: isReview ? `Powtórzenie: ${section.title}` : "Seria zadań",
        body: "W tym miejscu będzie jedna seria zadań wyświetlana kolejno na tym samym slajdzie, zgodnie ze wspólnym wzorcem kart lekcyjnych.",
        modelId: "exercise-board",
      },
      {
        suffix: "s4",
        kind: "exit-ticket",
        title: "Podsumowanie",
        minutes: 5,
        headline: "Sprawdź, co już umiesz",
        body: "Wykonaj krótkie zadanie podsumowujące i odnieś wynik do kryteriów sukcesu z pierwszego slajdu.",
      },
    ],
    status: "draft",
  });
}

export const grade6SkeletonLessons: LessonPackage[] = grade6PlanSections.flatMap((section, sectionIndex) =>
  section.topics.flatMap((_, topicIndex) => (
    (sectionIndex === 0 && topicIndex <= 7) || (sectionIndex === 1 && topicIndex <= 6) || (sectionIndex === 2 && topicIndex <= 1)
      ? []
      : [buildGrade6Lesson(sectionIndex, topicIndex)]
  )),
);
