import { describe, expect, it } from "vitest";
import { listPublishedLessonPackages } from "@/data/lessons/registry";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";

const grade6Lessons = listPublishedLessonPackages().filter((lesson) => lesson.topicId.startsWith("M6-"));

describe("Kontrakty wszystkich opublikowanych lekcji klasy 6", () => {
  it("każdy temat ma od dwóch do trzech konkretnych celów", () => {
    const invalid = grade6Lessons
      .filter((lesson) => lesson.learningGoals.length < 2 || lesson.learningGoals.length > 3)
      .map((lesson) => `${lesson.topicId}: ${lesson.learningGoals.length}`);
    expect(invalid).toEqual([]);
  });

  it("każdy cel ma dokładnie jedno kryterium sukcesu", () => {
    const invalid = grade6Lessons.flatMap((lesson) => lesson.learningGoals
      .filter((goal) => goal.successCriteria.length !== 1)
      .map((goal) => `${lesson.topicId}/${goal.id}: ${goal.successCriteria.length}`));
    expect(invalid).toEqual([]);
  });

  it("podsumowanie lekcji ma od dwóch do trzech kryteriów", () => {
    const invalid = grade6Lessons
      .filter((lesson) => lesson.successCriteria.length < 2 || lesson.successCriteria.length > 3)
      .map((lesson) => `${lesson.topicId}: ${lesson.successCriteria.length}`);
    expect(invalid).toEqual([]);
  });

  it("każda oceniana seria działu 9 daje dokładnie jeden punkt za ukończenie całego slajdu", () => {
    const invalid = grade6Lessons
      .filter((lesson) => lesson.topicId.startsWith("M6-9."))
      .flatMap((lesson) => buildLessonSessionSnapshot(lesson).stageSnapshot.stages
        .filter((stage) => ["practice", "challenge", "exit-ticket"].includes(stage.kind) && stage.studentModelId)
        .filter((stage) => stage.questions.length !== 1 || stage.questions[0]?.maxScore !== 1)
        .map((stage) => `${lesson.topicId}/${stage.id}: ${stage.questions.length}`));
    expect(invalid).toEqual([]);
  });

  it("identyfikatory punktowanych zadań nie powtarzają się w obrębie lekcji", () => {
    const duplicates = grade6Lessons.flatMap((lesson) => {
      const ids = buildLessonSessionSnapshot(lesson).stageSnapshot.stages.flatMap((stage) => stage.questions.map((question) => question.questionInstanceId));
      return ids.filter((id, index) => ids.indexOf(id) !== index).map((id) => `${lesson.topicId}/${id}`);
    });
    expect(duplicates).toEqual([]);
  });

  it("poprawne ukończenie interaktywnej serii ma w kluczu punktowym wartość 1", () => {
    const invalid = grade6Lessons
      .filter((lesson) => lesson.topicId.startsWith("M6-9."))
      .flatMap((lesson) => {
        const { answerKey } = buildLessonSessionSnapshot(lesson);
        return answerKey.questions
          .filter((question) => question.questionInstanceId.endsWith("-series"))
          .filter((question) => question.answerSpec.firstStepOperatorIndex !== 1 || !question.answerSpec.validNextOperatorIndices.includes(1))
          .map((question) => `${lesson.topicId}/${question.questionInstanceId}`);
      });
    expect(invalid).toEqual([]);
  });
});
