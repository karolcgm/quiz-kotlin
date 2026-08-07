import { describe, expect, it } from "vitest";
import {
  getProgramCurriculumForGrade,
  plMath4Classic2026,
  plMath5Classic2026,
  plMath6Classic2026,
} from "@/data/curriculum/pl-math-5-2026-classic";
import {
  GRADE4_ALLOCATED_HOURS,
  GRADE4_TOTAL_HOURS,
  grade4PlanSections,
} from "@/data/curriculum/pl-math-4-2026-classic";
import { listLessonPackages } from "@/data/lessons/registry";

describe("programy klasowe", () => {
  it("dobiera właściwy plan dla klas IV, V i VI", () => {
    expect(getProgramCurriculumForGrade(4)?.id).toBe(plMath4Classic2026.id);
    expect(getProgramCurriculumForGrade(5)?.id).toBe(plMath5Classic2026.id);
    expect(getProgramCurriculumForGrade(6)?.id).toBe(plMath6Classic2026.id);
  });

  it("odwzorowuje rozkład klasy IV: 8 działów, 82 pozycje i 135 godzin", () => {
    expect(plMath4Classic2026.grade).toBe(4);
    expect(plMath4Classic2026.sections).toHaveLength(8);
    expect(plMath4Classic2026.totalTopics).toBe(82);
    expect(GRADE4_TOTAL_HOURS).toBe(135);
    expect(GRADE4_ALLOCATED_HOURS).toBe(134);
    expect(grade4PlanSections.every(
      (section) => section.hours === section.topics.reduce((sum, topic) => sum + topic.hours, 0),
    )).toBe(true);
  });

  it("zachowuje prace klasowe w planie klasy IV, ale nie tworzy dla nich scenariuszy", () => {
    const examTopics = plMath4Classic2026.sections.flatMap((section) => section.topics)
      .filter((topic) => topic.kind === "exam");
    const grade4LessonTopicIds = new Set(listLessonPackages()
      .filter((lesson) => lesson.curriculumId === plMath4Classic2026.id)
      .map((lesson) => lesson.topicId));

    expect(examTopics).toHaveLength(8);
    expect(examTopics.every((topic) => !grade4LessonTopicIds.has(topic.id))).toBe(true);
  });

  it("przygotowuje 74 lekcje klasy IV z pierwszym i ostatnim slajdem", () => {
    const grade4Lessons = listLessonPackages().filter(
      (lesson) => lesson.curriculumId === plMath4Classic2026.id,
    );

    expect(grade4Lessons).toHaveLength(74);
    for (const lesson of grade4Lessons) {
      expect(lesson.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
      expect(lesson.stages.at(-1)?.kind).toBe("understanding");
      expect(lesson.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
      expect(lesson.stages.some((stage) => stage.board.modelId === "exercise-board")).toBe(true);
    }
    const publishedLessons = ["M4-1.1", "M4-1.2", "M4-1.3", "M4-1.4", "M4-1.5", "M4-1.6", "M4-1.7", "M4-1.8"].map((topicId) =>
      grade4Lessons.find((lesson) => lesson.topicId === topicId),
    );
    expect(publishedLessons.every((lesson) => lesson?.status === "published")).toBe(true);
    expect(publishedLessons.every((lesson) => lesson?.learningGoals.length === 3)).toBe(true);
    expect(grade4Lessons.filter((lesson) => lesson.status === "draft")).toHaveLength(66);
  });

  it("ma gotowe działy i tematy dla klasy VI", () => {
    expect(plMath6Classic2026.grade).toBe(6);
    expect(plMath6Classic2026.sections).toHaveLength(9);
    expect(plMath6Classic2026.totalTopics).toBe(62);
  });

  it("nie publikuje tematów sprawdzianowych w programie klasy VI", () => {
    const topics = plMath6Classic2026.sections.flatMap((section) => section.topics);

    expect(topics.some((topic) => topic.kind === "exam")).toBe(false);
    expect(topics.some((topic) => /sprawdzian|praca klasowa/i.test(topic.title))).toBe(false);
  });

  it("tworzy niezmienny slajd otwierający i końcową ocenę dla każdego tematu", () => {
    const grade6Lessons = listLessonPackages().filter(
      (lesson) => lesson.curriculumId === "pl-math-6-2026-classic",
    );
    expect(grade6Lessons).toHaveLength(plMath6Classic2026.totalTopics);
    for (const lesson of grade6Lessons) {
      expect(lesson.curriculumId).toBe("pl-math-6-2026-classic");
      expect(lesson.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
      expect(lesson.stages.at(-1)?.kind).toBe("understanding");
    }
  });
});
