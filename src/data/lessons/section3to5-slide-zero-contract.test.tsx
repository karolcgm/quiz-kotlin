// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";
import { TeacherGuidePanel } from "@/components/lessons/TeacherGuidePanel";
import { math5ClassicSections } from "@/data/curriculum/pl-math-5-2026-classic/sections";
import { section3LessonsWpC3 } from "@/data/lessons/section3-wp-c3";
import { section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";
import { section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";
import { getSection3To5SlideZeroContext } from "@/data/lessons/section3to5-slide-zero";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { validateLessonSlideZero } from "@/lib/lessons/validateLessonSlideZero";

afterEach(cleanup);

const published = [
  ...section3LessonsWpC3,
  ...section4LessonsWpC4,
  ...section5LessonsWpC5,
].filter((lesson) => lesson.status === "published");

function curriculumCode(reference: string): string {
  return reference.split(" — ", 1)[0]!.trim();
}

describe("WP-CONTEXT-01 — kontrakt slajdu 0 działów 3–5", () => {
  it("waliduje każdy opublikowany pakiet i zachowuje tytuł matematyczny oddzielnie od fabularnego rdzenia", () => {
    expect(published.length).toBeGreaterThan(0);
    expect(new Set(published.map((lesson) => lesson.id)).size).toBe(published.length);
    expect(new Set(published.map((lesson) => lesson.sectionId))).toEqual(
      new Set(["M5-S3", "M5-S4", "M5-S5"]),
    );

    for (const lesson of published) {
      const context = getSection3To5SlideZeroContext(lesson.topicId);
      expect(context, lesson.topicId).toBeDefined();
      expect(lesson.title, lesson.topicId).toBe(context!.title);
      expect(validateLessonSlideZero(lesson), lesson.id).toEqual([]);
      expect(lesson.teacherGuide.languageReview, lesson.topicId).toMatch(/^Manifest: .+\.$/);

      const opening = lesson.stages[0]!;
      expect(opening.id, lesson.id).toMatch(/-trace-0$/);
      expect(opening.title, lesson.id).toBe("Cele lekcji (slajd 0)");
      expect(opening.board.modelId, lesson.id).toBe("exercise-board");
      expect(opening.student, lesson.id).toMatchObject({ activityMode: "view" });
      expect(opening.live, lesson.id).toMatchObject({ enabled: true, kind: "presentation" });

      for (const goal of lesson.learningGoals) {
        expect(goal.studentGoal, goal.id).toMatch(/^Nauczę się/);
        expect(goal.successCriteria, goal.id).toHaveLength(1);
        expect(goal.successCriteria[0], goal.id).toMatch(/^Potrafię/);
        expect(goal.curriculumReferences.length, goal.id).toBeGreaterThan(0);
        expect(goal.curriculumReferences.every((reference) => reference.includes(" — ")), goal.id).toBe(true);
      }
    }
  });

  it("utrzymuje nazwy tematów programu zgodne z matematycznymi tytułami slajdu 0", () => {
    const programTitles = new Map(
      math5ClassicSections
        .filter((section) => ["M5-S3", "M5-S4", "M5-S5"].includes(section.id))
        .flatMap((section) => section.topics.map((topic) => [topic.id, topic.title] as const)),
    );

    for (const lesson of published.filter((item) => !item.topicId.endsWith(".S"))) {
      expect(programTitles.get(lesson.topicId), lesson.topicId).toBe(lesson.title);
    }
  });

  it("pokazuje dwa konkretne cele ucznia w temacie M5-3.7", () => {
    const context = getSection3To5SlideZeroContext("M5-3.7");
    const expectedGoals = [
      "Nauczę się mnożyć ułamek przez liczbę naturalną.",
      "Nauczę się mnożyć ułamek przez ułamek i skracać przed mnożeniem.",
    ];
    expect(context?.learningGoals.map((goal) => goal.studentGoal)).toEqual(expectedGoals);
    expect(context?.learningGoals.map((goal) => goal.successCriteria[0])).toEqual([
      "Potrafię mnożyć ułamek przez liczbę naturalną.",
      "Potrafię mnożyć ułamek przez ułamek i skracać przed mnożeniem.",
    ]);
    for (const lesson of section3LessonsWpC3.filter((item) => item.topicId === "M5-3.7")) {
      expect(lesson.learningGoals.map((goal) => goal.studentGoal)).toEqual(expectedGoals);
      expect(buildLessonSessionSnapshot(lesson).stageSnapshot.stages[0]?.learningGoals?.map((goal) => goal.studentGoal)).toEqual(expectedGoals);
    }
  });

  it("przenosi slajd 0 do snapshotu tablicy, ucznia i Live z metryką oraz samymi kodami podstawy", () => {
    for (const lesson of published) {
      const opening = buildLessonSessionSnapshot(lesson).stageSnapshot.stages[0]!;
      const expectedCodes = Array.from(new Set(
        lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map(curriculumCode)),
      ));

      expect(opening.id, lesson.id).toMatch(/-trace-0$/);
      expect(opening.lessonTitle, lesson.id).toBe(lesson.title);
      expect(opening.lessonMetric, lesson.id).toBe(`Matematyka · klasa V · dział ${lesson.sectionId.at(-1)}`);
      expect(opening.lessonTiming, lesson.id).toBe(`${lesson.estimatedMinutes} min · L${lesson.lessonNumber}`);
      expect(opening.curriculumCodes, lesson.id).toEqual(expectedCodes);
      expect(opening.curriculumCodes?.every((code) => !code.includes(" — ")), lesson.id).toBe(true);
      expect(opening.learningGoals, lesson.id).toEqual(lesson.learningGoals);
      expect(opening.studentActivityMode, lesson.id).toBe("view");
      expect(opening.liveKind, lesson.id).toBe("presentation");
    }
  });

  it("pokazuje na slajdzie kody, a w panelu nauczyciela pełne brzmienie wymagania", () => {
    const lesson = section3LessonsWpC3[0]!;
    const snapshot = buildLessonSessionSnapshot(lesson).stageSnapshot.stages[0]!;
    const fullReference = lesson.learningGoals[0]!.curriculumReferences[0]!;
    const code = curriculumCode(fullReference);

    const board = render(
      <ExerciseBoardModel
        seed={1}
        readOnly
        lessonTitle={snapshot.lessonTitle}
        lessonMetric={snapshot.lessonMetric}
        lessonTiming={snapshot.lessonTiming}
        curriculumCodes={snapshot.curriculumCodes}
        learningGoals={snapshot.learningGoals}
      />,
    );
    expect(screen.getByText(new RegExp(`Podstawa programowa.+${code}`))).toBeInTheDocument();
    expect(board.container.textContent).not.toContain(fullReference);

    cleanup();
    render(<TeacherGuidePanel lesson={lesson} />);
    expect(screen.getAllByText(fullReference).length).toBeGreaterThan(0);
  });
});
