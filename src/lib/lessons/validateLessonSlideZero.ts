import type { LessonPackage } from "@/types/lessonPackage";

export function validateLessonSlideZero(lesson: LessonPackage): string[] {
  const issues: string[] = [];
  const firstStage = lesson.stages[0];

  if (lesson.learningGoals.length < 1 || lesson.learningGoals.length > 4) {
    issues.push("learningGoals musi zawierać od 1 do 4 celów.");
  }

  const goalIds = new Set<string>();
  for (const goal of lesson.learningGoals) {
    if (!goal.id.trim() || goalIds.has(goal.id)) issues.push(`Cel ${goal.id || "bez ID"} ma brakujące lub powtórzone ID.`);
    goalIds.add(goal.id);
    if (!/^(Nauczę się|Przypomnę sobie|Powtórzę|Rozwinę|Zrozumiem|Będę)/.test(goal.studentGoal)) {
      issues.push(`${goal.id}: cel nie zaczyna się od czasownika opisującego działanie ucznia.`);
    }
    if (goal.successCriteria.length === 0) issues.push(`${goal.id}: brak osobnego kryterium sukcesu.`);
    if (goal.successCriteria.some((criterion) => !criterion.startsWith("Potrafię"))) {
      issues.push(`${goal.id}: każde kryterium musi zaczynać się od „Potrafię”.`);
    }
    if (goal.curriculumReferences.length === 0) issues.push(`${goal.id}: curriculumReferences nie może być puste.`);
    if (goal.curriculumReferences.some((reference) => !/^\S.+ — \S.+/.test(reference))) {
      issues.push(`${goal.id}: referencja podstawy musi zawierać kod i pełne brzmienie wymagania.`);
    }
  }

  if (!firstStage?.id.endsWith("-trace-0")) issues.push("Pierwszy etap musi mieć identyfikator zakończony „trace-0”.");
  if (firstStage?.title !== "Cele lekcji (slajd 0)") issues.push("Pierwszy etap musi mieć tytuł techniczny „Cele lekcji (slajd 0)”.");
  if (firstStage?.board.modelId !== "exercise-board") issues.push("Pierwszy etap musi mieć widok tablicy celów.");
  if (!firstStage?.student) issues.push("Pierwszy etap musi mieć widok ucznia.");
  if (!firstStage?.live?.enabled || firstStage.live.kind !== "presentation") issues.push("Pierwszy etap musi działać w Live jako prezentacja.");

  return issues;
}
export function assertLessonSlideZero(lesson: LessonPackage): LessonPackage {
  const issues = validateLessonSlideZero(lesson);
  if (issues.length > 0) throw new Error(`Niepoprawny slajd 0 pakietu ${lesson.id}:\n- ${issues.join("\n- ")}`);
  return lesson;
}
